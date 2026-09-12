/**
 * 《CyberStriker: Quantum Arena》
 * AI 行為樹深度邏輯架構 (AI Behavior Architecture)
 * 簡單 (Easy) / 普通 (Normal) / 困難 (Hard) / 惡夢 (Nightmare) + 訓練營假人
 * 支援全難度：自主跳躍 (跳入進攻/後跳脫困/原地直跳/躍空飛踢)、靈敏走位移動 (前壓/後撤拉扯/立回)、主動召喚防護罩 (高段站防/低段蹲防)
 */

export class AiController {
  constructor(difficulty = 'normal') {
    this.difficulty = difficulty; // 'easy', 'normal', 'hard', 'nightmare'
    this.currentDelay = 0;
    this.bufferedDecision = { x: 0, y: 0, punch: false, kick: false, guard: false, skill1: false, skill2: false, skill3: false, burst: false };
  }

  setDifficulty(diff) {
    this.difficulty = diff;
    this.currentDelay = 0;
  }

  /**
   * 決策每幀輸入
   */
  decide(aiChar, playerChar, combatEngine) {
    // 1. 若處於訓練營模式，完全依據假人設定行動
    if (combatEngine.isTraining) {
      return this._decideTrainingDummy(aiChar, playerChar, combatEngine.trainingSettings);
    }

    // 2. 空中自主作戰檢測：若 AI 當前處於空中狀態，隨時檢測空中出招與打擊時機 (跳躍飛踢 / 刺拳)
    if ((!aiChar.isGrounded || aiChar.state === 'jump') && !aiChar.currentAction) {
      return this._decideAirborneCombat(aiChar, playerChar, combatEngine);
    }

    // 3. 如果上一幀已經起跳進入空中，清除 y 軸跳躍緩存，防止落地瞬間意外連跳
    if (!aiChar.isGrounded && this.bufferedDecision.y < 0) {
      this.bufferedDecision.y = 0;
    }

    // 4. 依據難度設定地面反應幀數 (毫秒級人類反應延遲模擬，放緩決策頻率，動作清晰自然)
    let targetDelay = 24;
    if (this.difficulty === 'easy') targetDelay = 42;        // 簡單：反應餘裕充沛 (~700ms)，給新手充裕博弈空間
    else if (this.difficulty === 'normal') targetDelay = 24; // 普通：自然舒適慢速節奏 (~400ms)
    else if (this.difficulty === 'hard') targetDelay = 12;   // 困難：高階選手反應 (~200ms)
    else if (this.difficulty === 'nightmare') targetDelay = 5; // 惡夢：極限電競神經反應 (~83ms)

    this.currentDelay++;
    if (this.currentDelay >= targetDelay) {
      this.currentDelay = 0;
      this.bufferedDecision = this._makeDecision(aiChar, playerChar, combatEngine);
    }

    return this.bufferedDecision;
  }

  /**
   * 空中戰鬥決策 (Airborne Combat Execution)
   * 在躍空過程中根據與玩家之相對距離，執行中段破防躍空飛踢或快速刺拳
   */
  _decideAirborneCombat(ai, player, engine) {
    const input = { x: 0, y: 0, punch: false, kick: false, guard: false, skill1: false, skill2: false, skill3: false, burst: false };
    const dist = Math.abs(ai.x - player.x);
    const dirToPlayer = ai.x < player.x ? 1 : -1;

    // 空中朝對手方向維持壓迫走位慣性
    input.x = dirToPlayer;

    // 接近對手時主動發動空中打擊 (跃空重飞踢為中段判定，不可蹲防且強制擊倒！)
    if (dist < 150 && !ai.currentAction) {
      let attackChance = 0.5;
      if (this.difficulty === 'nightmare') attackChance = 0.95;
      else if (this.difficulty === 'hard') attackChance = 0.85;
      else if (this.difficulty === 'normal') attackChance = 0.70;
      else if (this.difficulty === 'easy') attackChance = 0.45;

      if (Math.random() < attackChance) {
        // 70% 釋放重飛踢 (破蹲防擊倒)，30% 釋放跳躍快拳
        if (Math.random() < 0.7) {
          input.kick = true;
        } else {
          input.punch = true;
        }
      }
    }

    return input;
  }

  /**
   * 地面主決策行為樹 (Ground AI Decision Tree)
   */
  _makeDecision(ai, player, engine) {
    const input = { x: 0, y: 0, punch: false, kick: false, guard: false, skill1: false, skill2: false, skill3: false, burst: false };
    const dist = Math.abs(ai.x - player.x);
    const facingPlayer = (ai.x < player.x ? 1 : -1) === ai.facing;
    const dirToPlayer = ai.x < player.x ? 1 : -1;
    const playerInAir = !player.isGrounded;

    // 智能識別玩家攻擊狀態 (含普攻、下段掃腿、遠程、技能及空中出招)
    const playerAttacking = player.state === 'light_punch' ||
                            player.state === 'heavy_kick' ||
                            player.state === 'crouch_punch' ||
                            player.state === 'crouch_kick' ||
                            player.state === 'ranged_attack' ||
                            player.state === 'skill' ||
                            (player.state === 'jump' && !!player.currentAction);

    // 智能識別下段攻擊 (不可站防，必須召喚防護罩下蹲防守)
    const isPlayerLowAttack = player.state === 'crouch_kick' ||
                              (player.currentAction && player.currentAction.guardType === 'crouch_only');

    const playerGuarding = player.isGuarding;

    // 檢測敵方飛行道具威脅 (Incoming Projectile)
    const incomingProjectile = engine && engine.projectiles && engine.projectiles.find(p => {
      if (p.owner === player) {
        const pTowardsAI = (p.vx > 0 && p.x < ai.x) || (p.vx < 0 && p.x > ai.x) || Math.abs(p.vx) < 1;
        const pDist = Math.abs(p.x - ai.x);
        return pTowardsAI && pDist < 280;
      }
      return false;
    });

    // ──────────────────────────────────────────
    // 1. 惡夢 (Nightmare) AI：極致反應、完美反凹、跳入進攻與全防護罩體系
    // ──────────────────────────────────────────
    if (this.difficulty === 'nightmare') {
      // 1.1 受擊硬直中立即使用量子逆轉爆發 (Burst)
      if (ai.state === 'hit_stun' && ai.burstMeter >= ai.burstMax && ai.burstAvailable) {
        input.burst = true;
        return input;
      }

      // 1.2 玩家起跳壓迫：100% 升龍截擊 (SK-02) 或起跳空中攔截
      if (playerInAir && dist < 170) {
        if (ai.cooldowns[1] <= 0) {
          input.skill2 = true; // 升龍衝天擊
          return input;
        } else {
          // 起跳迎擊或重踢防空
          if (Math.random() < 0.6) {
            input.y = -1;
            input.x = dirToPlayer;
            input.kick = true;
          } else {
            input.kick = true;
          }
          return input;
        }
      }

      // 1.3 面對飛行道具威脅：50% 起跳躍過並前撲，50% 召喚防護罩格擋
      if (incomingProjectile) {
        if (Math.random() < 0.5) {
          input.y = -1; // 躍過飛行道具
          input.x = dirToPlayer;
          return input;
        } else {
          input.guard = true; // 召喚防護罩抵銷
          return input;
        }
      }

      // 1.4 面對玩家近身出招：架招反擊或精確高低段防護罩防守
      if (playerAttacking && dist < 140) {
        if (ai.cooldowns[0] <= 0 && ai.skills?.[0]?.id === 'SK-05') {
          input.skill1 = true; // 幻影反擊壁架招
          return input;
        }
        input.guard = true;
        if (isPlayerLowAttack) {
          input.y = 1; // 召喚防護罩下蹲防禦
        }
        return input;
      }

      // 1.5 玩家持續龜防：立即向前突進使用不可防禦之指令摔技 (SK-08)、下段滑踢或躍空重飛踢破蹲防
      if (playerGuarding && dist < 120) {
        if (ai.cooldowns[2] <= 0 && ai.skills?.[2]?.id === 'SK-08') {
          input.skill3 = true; // 磁暴重摔投 (破除防禦)
          return input;
        } else if (ai.cooldowns[0] <= 0 && ai.skills?.[0]?.id === 'SK-03') {
          input.skill1 = true; // 音速滑踢
          return input;
        } else {
          // 40% 起跳躍空重飛踢 (中段破蹲防)，60% 下段掃腿
          if (Math.random() < 0.4) {
            input.y = -1;
            input.x = dirToPlayer;
            return input;
          } else {
            input.y = 1;
            input.kick = true;
            return input;
          }
        }
      }

      // 1.6 遠距離 (`dist > 220`)：自主起跳壓制、前壓移動或施放技能
      if (dist > 220) {
        const r = Math.random();
        if (r < 0.35) {
          input.y = -1; // 前跳躍入進攻
          input.x = dirToPlayer;
          return input;
        } else if (r < 0.65 && ai.cooldowns[0] <= 0) {
          input.skill1 = true;
          return input;
        } else {
          input.x = dirToPlayer; // 靈敏前衝走位
          return input;
        }
      }

      // 1.7 中距離 (`120 <= dist <= 220`)：格鬥立回拉扯 (Footsies)、起跳奇襲與試探
      if (dist >= 120) {
        const r = Math.random();
        if (r < 0.35) {
          input.y = -1; // 前跳壓迫
          input.x = dirToPlayer;
          return input;
        } else if (r < 0.65) {
          input.x = dirToPlayer; // 前進試探
          return input;
        } else if (r < 0.85) {
          input.x = -dirToPlayer; // 戰術後撤拉扯，誘敵空揮
          return input;
        } else {
          input.y = -1; // 原地直跳抓空檔
          input.x = 0;
          return input;
        }
      }

      // 1.8 近身貼身戰 (`dist < 120`)：起跳越頂 (Cross-up)、後跳拉開或快速雙擇打擊
      const rClose = Math.random();
      if (rClose < 0.20) {
        // 20% 機率起跳 (前跳換邊或後跳拉開)
        input.y = -1;
        input.x = Math.random() < 0.5 ? dirToPlayer : -dirToPlayer;
        return input;
      } else if (rClose < 0.55) {
        input.punch = true; // 刺拳搶招
        return input;
      } else if (rClose < 0.85) {
        input.kick = true;  // 重踢或下段掃腿
        if (Math.random() < 0.4) input.y = 1;
        return input;
      } else {
        input.x = -dirToPlayer; // 後撤微調身位
        return input;
      }
    }

    // ──────────────────────────────────────────
    // 2. 困難 (Hard) AI：強防空意識、主動跳躍壓迫、精準防護罩與靈活走位
    // ──────────────────────────────────────────
    if (this.difficulty === 'hard') {
      // 2.1 玩家跳躍：強防空意識
      if (playerInAir && dist < 150) {
        if (ai.cooldowns[1] <= 0 && Math.random() < 0.75) {
          input.skill2 = true; // 升龍衝天擊防空
          return input;
        } else if (Math.random() < 0.6) {
          input.kick = true; // 重踢截擊
          return input;
        } else {
          input.guard = true; // 召喚防護罩防空中重踢
          return input;
        }
      }

      // 2.2 飛行道具防護
      if (incomingProjectile) {
        if (Math.random() < 0.45) {
          input.y = -1; // 躍起避開
          input.x = dirToPlayer;
          return input;
        } else {
          input.guard = true; // 召喚防護罩
          return input;
        }
      }

      // 2.3 玩家出招：85% 機率召喚防護罩防禦 (精準區分高段/低段)
      if (playerAttacking && dist < 140) {
        if (Math.random() < 0.85) {
          input.guard = true;
          if (isPlayerLowAttack) {
            input.y = 1; // 召喚防護罩下蹲防禦
          }
          return input;
        } else {
          // 15% 機率後跳拉開身位確反
          input.y = -1;
          input.x = -dirToPlayer;
          return input;
        }
      }

      // 2.4 玩家龜防應對
      if (playerGuarding && dist < 120) {
        const r = Math.random();
        if (r < 0.35) {
          input.y = -1; // 前跳躍空重飛踢 (破蹲防)
          input.x = dirToPlayer;
          return input;
        } else if (r < 0.65) {
          input.y = 1; // 下段掃腿
          input.kick = true;
          return input;
        }
      }

      // 2.5 遠距離 (`dist > 200`)：跳躍進攻、前走或技能
      if (dist > 200) {
        const r = Math.random();
        if (r < 0.30) {
          input.y = -1; // 前跳躍進
          input.x = dirToPlayer;
          return input;
        } else if (r < 0.55 && ai.cooldowns[0] <= 0) {
          input.skill1 = true;
          return input;
        } else {
          input.x = dirToPlayer; // 前進移動
          return input;
        }
      }

      // 2.6 中距離 (`120 <= dist <= 200`)：靈敏立回走位 (前移/後撤/起跳)
      if (dist >= 120) {
        const r = Math.random();
        if (r < 0.30) {
          input.y = -1; // 前跳進攻
          input.x = dirToPlayer;
          return input;
        } else if (r < 0.65) {
          input.x = dirToPlayer; // 前進壓制
          return input;
        } else if (r < 0.90) {
          input.x = -dirToPlayer; // 戰術後撤拉開
          return input;
        } else {
          input.y = -1; // 原地起跳
          input.x = 0;
          return input;
        }
      }

      // 2.7 近身戰 (`dist < 120`)
      const rClose = Math.random();
      if (rClose < 0.18) {
        input.y = -1; // 起跳拉開或換邊
        input.x = Math.random() < 0.6 ? -dirToPlayer : dirToPlayer;
        return input;
      } else if (rClose < 0.55) {
        input.punch = true;
        return input;
      } else if (rClose < 0.85) {
        input.kick = true;
        return input;
      } else {
        input.x = -dirToPlayer; // 後撤拉開
        return input;
      }
    }

    // ──────────────────────────────────────────
    // 3. 普通 (Normal) AI：基礎立回走位、跳入進攻、召喚防護罩防守
    // ──────────────────────────────────────────
    if (this.difficulty === 'normal') {
      // 3.1 玩家跳躍：防空或防護罩
      if (playerInAir && dist < 140) {
        const r = Math.random();
        if (r < 0.40) {
          input.kick = true; // 防空踢
          return input;
        } else if (r < 0.80) {
          input.guard = true; // 召喚防護罩防守
          return input;
        }
      }

      // 3.2 飛行道具防護
      if (incomingProjectile) {
        if (Math.random() < 0.35) {
          input.y = -1; // 躍起跳過
          input.x = dirToPlayer;
          return input;
        } else if (Math.random() < 0.8) {
          input.guard = true; // 召喚防護罩
          return input;
        }
      }

      // 3.3 玩家出招：65% 機率主動召喚防護罩防守 (支援高低段)
      if (playerAttacking && dist < 135) {
        const r = Math.random();
        if (r < 0.65) {
          input.guard = true;
          if (isPlayerLowAttack && Math.random() < 0.75) {
            input.y = 1; // 召喚防護罩下蹲防守
          }
          return input;
        } else if (r < 0.80) {
          // 15% 機率後跳避險
          input.y = -1;
          input.x = -dirToPlayer;
          return input;
        }
      }

      // 3.4 遠距離 (`dist > 200`)：前進移動、前跳或技能
      if (dist > 200) {
        const r = Math.random();
        if (r < 0.25) {
          input.y = -1; // 前跳
          input.x = dirToPlayer;
          return input;
        } else if (r < 0.50 && ai.cooldowns[0] <= 0) {
          input.skill1 = true;
          return input;
        } else {
          input.x = dirToPlayer; // 前進移動
          return input;
        }
      }

      // 3.5 中距離 (`120 <= dist <= 200`)：移動走位與跳躍
      if (dist >= 120) {
        const r = Math.random();
        if (r < 0.25) {
          input.y = -1; // 前跳壓迫
          input.x = dirToPlayer;
          return input;
        } else if (r < 0.65) {
          input.x = dirToPlayer; // 前進走位
          return input;
        } else if (r < 0.88) {
          input.x = -dirToPlayer; // 後撤走位
          return input;
        } else {
          input.y = -1; // 原地起跳
          input.x = 0;
          return input;
        }
      }

      // 3.6 近身戰 (`dist < 120`)
      const rClose = Math.random();
      if (rClose < 0.15) {
        input.y = -1; // 起跳拉開
        input.x = Math.random() < 0.5 ? -dirToPlayer : dirToPlayer;
        return input;
      } else if (rClose < 0.50) {
        input.punch = true;
        return input;
      } else if (rClose < 0.80) {
        input.kick = true;
        return input;
      } else if (rClose < 0.90 && ai.cooldowns[1] <= 0) {
        input.skill2 = true;
        return input;
      } else {
        input.x = -dirToPlayer; // 後撤走位
        return input;
      }
    }

    // ──────────────────────────────────────────
    // 4. 簡單 (Easy) AI：新手適配、會跳、會移動、偶爾召喚防護罩
    // ──────────────────────────────────────────
    // 4.1 玩家近身攻擊時：35% 機率舉起防護罩防守，15% 後跳拉開
    if (playerAttacking && dist < 120) {
      const r = Math.random();
      if (r < 0.35) {
        input.guard = true; // 召喚防護罩防守！
        if (isPlayerLowAttack && Math.random() < 0.5) {
          input.y = 1; // 召喚防護罩下蹲防守
        }
        return input;
      } else if (r < 0.50) {
        input.y = -1; // 後跳避開
        input.x = -dirToPlayer;
        return input;
      }
    }

    // 4.2 遠距離 (`dist > 180`)：前進移動、偶爾前跳
    if (dist > 180) {
      const r = Math.random();
      if (r < 0.18) {
        input.y = -1; // 前跳
        input.x = dirToPlayer;
        return input;
      } else {
        input.x = dirToPlayer * 0.8; // 靈活向前走近
        return input;
      }
    }

    // 4.3 中距離 (`100 <= dist <= 180`)：前進移動、偶爾後退走位或起跳
    if (dist >= 100) {
      const r = Math.random();
      if (r < 0.18) {
        input.y = -1; // 前跳進攻
        input.x = dirToPlayer;
        return input;
      } else if (r < 0.68) {
        input.x = dirToPlayer * 0.75; // 前進移動
        return input;
      } else {
        input.x = -dirToPlayer * 0.6; // 後退走位
        return input;
      }
    }

    // 4.4 近身戰 (`dist < 100`)：出拳、踢擊、後跳、舉盾或後退
    const rClose = Math.random();
    if (rClose < 0.15) {
      input.y = -1; // 起跳
      input.x = dirToPlayer;
      return input;
    } else if (rClose < 0.45) {
      input.punch = true; // 出拳
      return input;
    } else if (rClose < 0.70) {
      input.kick = true;  // 踢擊
      return input;
    } else if (rClose < 0.85) {
      input.guard = true; // 主動召喚防護罩！
      return input;
    } else {
      input.x = -dirToPlayer * 0.6; // 後退微調
      return input;
    }
  }

  /**
   * 自由格鬥訓練營假人行為控制 (Training Dummy Behavior)
   */
  _decideTrainingDummy(dummy, player, settings) {
    const input = { x: 0, y: 0, punch: false, kick: false, guard: false, skill1: false, skill2: false, skill3: false, burst: false };

    // 1. 起身第一幀升龍反凹 (Reversal DP)
    if (settings.dummyReversal && dummy.state === 'wakeup' && dummy.stateTime >= 13) {
      input.skill2 = true; // 釋放升龍衝天擊
      return input;
    }

    // 2. 姿態設定 (Stance)
    if (settings.dummyStance === 'jump') {
      input.y = -1; // 持續起跳
    } else if (settings.dummyStance === 'crouch') {
      input.y = 1;  // 持續下蹲
    }

    // 3. 防守狀態設定 (Guard - 依按鍵召喚防護罩)
    if (settings.dummyGuard === 'stand_guard') {
      input.guard = true; // 召喚防護罩站立防禦
    } else if (settings.dummyGuard === 'crouch_guard') {
      input.guard = true;
      input.y = 1; // 召喚防護罩下蹲防禦
    } else if (settings.dummyGuard === 'after_first_hit') {
      // 受擊一次後立即召喚防護罩防禦 (檢驗連段真實性)
      if (player.comboCount >= 1) {
        input.guard = true;
      }
    }

    return input;
  }
}

export const aiController = new AiController('normal');

