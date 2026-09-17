/**
 * 《CyberStriker: Quantum Arena》
 * AI 行為樹深度邏輯架構 (AI Behavior Architecture)
 * 簡單 (Easy) / 普通 (Normal) / 困難 (Hard) / 噩夢 (Nightmare) + 訓練營假人
 * 
 * 核心特色：
 * 1. 取消下蹲：玩家與 AI 皆不再下蹲，防禦統一為主動量子防護罩。
 * 2. 專屬體術：直拳刺擊與重力猛踢為 AI 專屬體術！
 * 3. 隨機 3 神兵：AI 每次開局從對應難度的武器庫中隨機抽取 3 把神兵武器，依戰局靈活施展！
 */

export class AiController {
  constructor(difficulty = 'normal') {
    this.difficulty = difficulty; // 'easy', 'normal', 'hard', 'nightmare'
    this.currentDelay = 0;
    this.bufferedDecision = { x: 0, y: 0, punch: false, kick: false, guard: false, skill1: false, skill2: false, skill3: false, skill4: false, skill5: false, burst: false };
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

    // 4. 依據難度設定地面反應幀數 (毫秒級人類反應延遲模擬，保持競技快節奏與擬真度)
    let targetDelay = 16;
    if (this.difficulty === 'easy') targetDelay = 28;        // 簡單：反應餘裕充沛 (~460ms)，給新手充裕博弈空間
    else if (this.difficulty === 'normal') targetDelay = 16; // 普通：自然舒適流暢節奏 (~260ms)
    else if (this.difficulty === 'hard') targetDelay = 8;    // 困難：高階選手反應 (~130ms)
    else if (this.difficulty === 'nightmare') targetDelay = 4; // 噩夢：極限電競神經反應 (~66ms)

    this.currentDelay++;
    if (this.currentDelay >= targetDelay) {
      this.currentDelay = 0;
      this.bufferedDecision = this._filterPlatformEdges(aiChar, this._makeDecision(aiChar, playerChar, combatEngine));
    }

    return this.bufferedDecision;
  }

  /**
   * 獲取 AI 當前已冷卻就緒的神兵武器清單 (AI 隨機抽取之 3 把武器)
   */
  _getReadySkills(ai) {
    const ready = [];
    if (!ai || !ai.skills || !ai.cooldowns) return ready;
    for (let i = 0; i < Math.min(3, ai.skills.length); i++) {
      if (ai.cooldowns[i] <= 0 && ai.skills[i]) {
        ready.push({ slot: i, skill: ai.skills[i] });
      }
    }
    return ready;
  }

  /**
   * 在浮空平台上平穩作戰，防止地面走位時無意識滑落平台
   */
  _filterPlatformEdges(ai, input) {
    if (ai && ai.currentPlatform && input && input.y >= 0 && !input.punch && !input.kick && !input.skill1 && !input.skill2 && !input.skill3 && !input.skill4 && !input.skill5 && !input.dropThrough) {
      const plat = ai.currentPlatform;
      if (ai.x <= plat.x + 18 && input.x < 0) input.x = 0;
      if (ai.x >= plat.x + plat.width - 18 && input.x > 0) input.x = 0;
    }
    return input;
  }

  /**
   * 空中戰鬥決策 (Airborne Combat Execution)
   * 在躍空過程中根據與玩家之相對距離，執行空中重踢或空中刺拳 (AI 專屬體術)
   */
  _decideAirborneCombat(ai, player, engine) {
    const input = { x: 0, y: 0, punch: false, kick: false, guard: false, skill1: false, skill2: false, skill3: false, skill4: false, skill5: false, burst: false };
    const dist = Math.abs(ai.x - player.x);
    const dirToPlayer = ai.x < player.x ? 1 : -1;

    // 空中朝對手方向維持壓迫走位慣性
    input.x = dirToPlayer;

    // 若玩家處於更高處 (例如高空懸浮平台)，且 AI 尚具備空中二段跳，適時發動二段跳追擊
    if (ai.hasDoubleJump && player.y < ai.y - 45 && ai.vy > -3) {
      input.jump = true;
      input.y = -1;
      input.x = dirToPlayer;
      return input;
    }

    // 接近對手時主動發動空中打擊 (AI 專屬空中體術)
    if (dist < 175 && Math.abs(ai.y - player.y) < 125 && !ai.currentAction) {
      let attackChance = 0.5;
      if (this.difficulty === 'nightmare') attackChance = 0.95;
      else if (this.difficulty === 'hard') attackChance = 0.85;
      else if (this.difficulty === 'normal') attackChance = 0.70;
      else if (this.difficulty === 'easy') attackChance = 0.45;

      if (Math.random() < attackChance) {
        // 70% 釋放重飛踢，30% 釋放跳躍快拳
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
    const input = { x: 0, y: 0, punch: false, kick: false, guard: false, skill1: false, skill2: false, skill3: false, skill4: false, skill5: false, burst: false };
    const dist = Math.abs(ai.x - player.x);
    const dirToPlayer = ai.x < player.x ? 1 : -1;
    const playerInAir = !player.isGrounded;

    // 智能識別玩家攻擊狀態
    const playerAttacking = player.state === 'ranged_attack' ||
                            player.state === 'skill' ||
                            (player.state === 'jump' && !!player.currentAction);

    const playerGuarding = player.isGuarding;
    const readySkills = this._getReadySkills(ai);

    // 檢測敵方飛行道具威脅 (Incoming Projectile)
    const incomingProjectile = engine && engine.projectiles && engine.projectiles.find(p => {
      if (p.owner === player) {
        const pTowardsAI = (p.vx > 0 && p.x < ai.x) || (p.vx < 0 && p.x > ai.x) || Math.abs(p.vx) < 1;
        const pDist = Math.abs(p.x - ai.x);
        return pTowardsAI && pDist < 280;
      }
      return false;
    });

    // ─── 浮空平台自主導航與跨層追擊 (Platform Navigation & Pursuit) ───
    if (player.y < ai.y - 45) {
      // 玩家在上方浮空平台上，AI 智能尋路起跳躍上平台
      const targetPlat = engine?.platforms?.find(p => Math.abs(p.y - player.y) < 20 && player.x >= p.x - 30 && player.x <= p.x + p.width + 30)
                         || engine?.platforms?.find(p => p.y < ai.y - 30 && Math.abs(player.x - (p.x + p.width / 2)) < p.width * 0.9);
      
      const platTargetX = targetPlat ? (targetPlat.x + targetPlat.width / 2) : player.x;
      const distToPlatX = Math.abs(ai.x - platTargetX);

      // 若 AI 尚未進入跳台下方起跳範圍，先快步移動到跳台下方
      if (distToPlatX > 90) {
        input.x = ai.x < platTargetX ? 1 : -1;
        return input;
      } else {
        // 到達跳台下方，強力起跳躍上浮空平台
        input.y = -1;
        input.jump = true;
        input.x = dirToPlayer;
        return input;
      }
    } else if (ai.currentPlatform && (!player.currentPlatform || player.y > ai.y + 45)) {
      // AI 在浮空平台上，而玩家在下方地面
      // 60% 機率發動俯衝躍空飛踢，40% 穿透跳下追擊
      if (Math.random() < 0.6) {
        input.y = -1;
        input.jump = true;
        input.x = dirToPlayer;
        input.kick = true;
        return input;
      } else {
        input.down = true;
        input.jump = true;
        input.dropThrough = true;
        input.y = 1;
        return input;
      }
    }

    // ──────────────────────────────────────────
    // 1. 噩夢 (Nightmare) AI：頂級神經反應、終極神兵壓迫、靈動立回與拳腳體術
    // ──────────────────────────────────────────
    if (this.difficulty === 'nightmare') {
      // 1.1 受擊硬直中立即使用量子逆轉爆發 (Burst)
      if (ai.state === 'hit_stun' && ai.burstMeter >= ai.burstMax && ai.burstAvailable) {
        input.burst = true;
        return input;
      }

      // 1.2 玩家起跳壓迫：優先施展對空神兵，次選重踢截擊
      if (playerInAir && dist < 170) {
        const antiAir = readySkills.find(s => s.skill.type === 'anti_air' || s.skill.typeName?.includes('對空'));
        if (antiAir) {
          input[`skill${antiAir.slot + 1}`] = true;
          return input;
        }
        if (Math.random() < 0.6) {
          input.y = -1;
          input.x = dirToPlayer;
          input.kick = true;
        } else {
          input.kick = true;
        }
        return input;
      }

      // 1.3 面對飛行道具威脅：50% 起跳躍過前撲，50% 召喚量子防護罩
      if (incomingProjectile) {
        if (Math.random() < 0.5) {
          input.y = -1;
          input.x = dirToPlayer;
        } else {
          input.guard = true;
        }
        return input;
      }

      // 1.4 面對玩家近身出招：架招/破甲反擊或量子防護罩格擋
      if (playerAttacking && dist < 140) {
        const counterSkill = readySkills.find(s => s.skill.id === 'SK-05' || s.skill.type === 'pierce_thrust');
        if (counterSkill && Math.random() < 0.5) {
          input[`skill${counterSkill.slot + 1}`] = true;
          return input;
        }
        input.guard = true;
        return input;
      }

      // 1.5 玩家持續龜防：優先施展無視防禦之指令摔神兵，次選跳入破防或近戰武器
      if (playerGuarding && dist < 120) {
        const grabSkill = readySkills.find(s => s.skill.guardType === 'unblockable');
        if (grabSkill) {
          input[`skill${grabSkill.slot + 1}`] = true;
          return input;
        }
        if (Math.random() < 0.5) {
          input.y = -1;
          input.x = dirToPlayer;
          input.kick = true;
          return input;
        }
      }

      // 1.6 遠距離 (`dist > 220`)：自主起跳壓制、前壓移動或施放神兵
      if (dist > 220) {
        const r = Math.random();
        if (r < 0.35) {
          input.y = -1;
          input.x = dirToPlayer;
          return input;
        } else if (r < 0.70 && readySkills.length > 0) {
          const s = readySkills[Math.floor(Math.random() * readySkills.length)];
          input[`skill${s.slot + 1}`] = true;
          return input;
        } else {
          input.x = dirToPlayer;
          return input;
        }
      }

      // 1.7 中距離 (`120 <= dist <= 220`)：格鬥立回拉扯、神兵牽制與試探
      if (dist >= 120) {
        const r = Math.random();
        if (r < 0.30 && readySkills.length > 0) {
          const s = readySkills[Math.floor(Math.random() * readySkills.length)];
          input[`skill${s.slot + 1}`] = true;
          return input;
        } else if (r < 0.55) {
          input.y = -1;
          input.x = dirToPlayer;
          return input;
        } else if (r < 0.80) {
          input.x = dirToPlayer;
          return input;
        } else {
          input.x = -dirToPlayer;
          return input;
        }
      }

      // 1.8 近身貼身戰 (`dist < 120`)：AI 專屬刺拳/重踢體術連攜或近戰神兵
      const rClose = Math.random();
      if (rClose < 0.20) {
        input.y = -1;
        input.x = Math.random() < 0.5 ? dirToPlayer : -dirToPlayer;
        return input;
      } else if (rClose < 0.50) {
        input.punch = true; // 專屬刺拳搶招
        return input;
      } else if (rClose < 0.75) {
        input.kick = true;  // 專屬重踢壓制
        return input;
      } else if (readySkills.length > 0) {
        const s = readySkills[Math.floor(Math.random() * readySkills.length)];
        input[`skill${s.slot + 1}`] = true;
        return input;
      } else {
        input.x = -dirToPlayer;
        return input;
      }
    }

    // ──────────────────────────────────────────
    // 2. 困難 (Hard) AI：強防空意識、主動跳躍壓迫、精準防護罩與武器連段
    // ──────────────────────────────────────────
    if (this.difficulty === 'hard') {
      // 2.1 玩家跳躍：強防空意識
      if (playerInAir && dist < 150) {
        const antiAir = readySkills.find(s => s.skill.type === 'anti_air' || s.skill.typeName?.includes('對空'));
        if (antiAir && Math.random() < 0.75) {
          input[`skill${antiAir.slot + 1}`] = true;
          return input;
        } else if (Math.random() < 0.6) {
          input.kick = true; // 專屬重踢截擊
          return input;
        } else {
          input.guard = true;
          return input;
        }
      }

      // 2.2 飛行道具防護
      if (incomingProjectile) {
        if (Math.random() < 0.45) {
          input.y = -1;
          input.x = dirToPlayer;
        } else {
          input.guard = true;
        }
        return input;
      }

      // 2.3 玩家出招：85% 機率召喚量子防護罩防禦
      if (playerAttacking && dist < 140) {
        if (Math.random() < 0.85) {
          input.guard = true;
        } else {
          input.y = -1;
          input.x = -dirToPlayer;
        }
        return input;
      }

      // 2.4 玩家龜防應對
      if (playerGuarding && dist < 120) {
        const grabSkill = readySkills.find(s => s.skill.guardType === 'unblockable');
        if (grabSkill) {
          input[`skill${grabSkill.slot + 1}`] = true;
          return input;
        }
        if (Math.random() < 0.4) {
          input.y = -1;
          input.x = dirToPlayer;
          input.kick = true;
          return input;
        }
      }

      // 2.5 遠距離 (`dist > 200`)：跳躍進攻、前走或武器釋放
      if (dist > 200) {
        const r = Math.random();
        if (r < 0.30) {
          input.y = -1;
          input.x = dirToPlayer;
          return input;
        } else if (r < 0.60 && readySkills.length > 0) {
          const s = readySkills[Math.floor(Math.random() * readySkills.length)];
          input[`skill${s.slot + 1}`] = true;
          return input;
        } else {
          input.x = dirToPlayer;
          return input;
        }
      }

      // 2.6 中距離 (`120 <= dist <= 200`)：靈敏立回走位
      if (dist >= 120) {
        const r = Math.random();
        if (r < 0.25 && readySkills.length > 0) {
          const s = readySkills[Math.floor(Math.random() * readySkills.length)];
          input[`skill${s.slot + 1}`] = true;
          return input;
        } else if (r < 0.55) {
          input.x = dirToPlayer;
          return input;
        } else if (r < 0.85) {
          input.x = -dirToPlayer;
          return input;
        } else {
          input.y = -1;
          input.x = 0;
          return input;
        }
      }

      // 2.7 近身戰 (`dist < 120`)：AI 專屬拳腳體術
      const rClose = Math.random();
      if (rClose < 0.18) {
        input.y = -1;
        input.x = Math.random() < 0.6 ? -dirToPlayer : dirToPlayer;
        return input;
      } else if (rClose < 0.50) {
        input.punch = true; // 專屬刺拳
        return input;
      } else if (rClose < 0.80) {
        input.kick = true;  // 專屬重踢
        return input;
      } else if (readySkills.length > 0) {
        const s = readySkills[Math.floor(Math.random() * readySkills.length)];
        input[`skill${s.slot + 1}`] = true;
        return input;
      } else {
        input.x = -dirToPlayer;
        return input;
      }
    }

    // ──────────────────────────────────────────
    // 3. 普通 (Normal) AI：基礎立回走位、跳入進攻、召喚量子防護罩
    // ──────────────────────────────────────────
    if (this.difficulty === 'normal') {
      // 3.1 玩家跳躍：重踢防空或防護罩
      if (playerInAir && dist < 140) {
        const r = Math.random();
        if (r < 0.45) {
          input.kick = true; // 專屬防空踢
          return input;
        } else if (r < 0.80) {
          input.guard = true;
          return input;
        }
      }

      // 3.2 飛行道具防護
      if (incomingProjectile) {
        if (Math.random() < 0.35) {
          input.y = -1;
          input.x = dirToPlayer;
        } else if (Math.random() < 0.80) {
          input.guard = true;
        }
        return input;
      }

      // 3.3 玩家出招：65% 機率主動召喚量子防護罩
      if (playerAttacking && dist < 135) {
        const r = Math.random();
        if (r < 0.65) {
          input.guard = true;
        } else if (r < 0.80) {
          input.y = -1;
          input.x = -dirToPlayer;
        }
        return input;
      }

      // 3.4 遠距離 (`dist > 200`)：前進移動、前跳或武器
      if (dist > 200) {
        const r = Math.random();
        if (r < 0.25) {
          input.y = -1;
          input.x = dirToPlayer;
          return input;
        } else if (r < 0.55 && readySkills.length > 0) {
          const s = readySkills[Math.floor(Math.random() * readySkills.length)];
          input[`skill${s.slot + 1}`] = true;
          return input;
        } else {
          input.x = dirToPlayer;
          return input;
        }
      }

      // 3.5 中距離 (`120 <= dist <= 200`)：移動走位與跳躍
      if (dist >= 120) {
        const r = Math.random();
        if (r < 0.20 && readySkills.length > 0) {
          const s = readySkills[Math.floor(Math.random() * readySkills.length)];
          input[`skill${s.slot + 1}`] = true;
          return input;
        } else if (r < 0.60) {
          input.x = dirToPlayer;
          return input;
        } else if (r < 0.85) {
          input.x = -dirToPlayer;
          return input;
        } else {
          input.y = -1;
          input.x = 0;
          return input;
        }
      }

      // 3.6 近身戰 (`dist < 120`)：AI 專屬刺拳與猛踢
      const rClose = Math.random();
      if (rClose < 0.15) {
        input.y = -1;
        input.x = Math.random() < 0.5 ? -dirToPlayer : dirToPlayer;
        return input;
      } else if (rClose < 0.50) {
        input.punch = true; // 專屬刺拳
        return input;
      } else if (rClose < 0.80) {
        input.kick = true;  // 專屬重踢
        return input;
      } else if (rClose < 0.90 && readySkills.length > 0) {
        const s = readySkills[Math.floor(Math.random() * readySkills.length)];
        input[`skill${s.slot + 1}`] = true;
        return input;
      } else {
        input.x = -dirToPlayer;
        return input;
      }
    }

    // ──────────────────────────────────────────
    // 4. 簡單 (Easy) AI：新手適配、拳腳體術、偶爾召喚防護罩與初階神兵
    // ──────────────────────────────────────────
    // 4.1 玩家近身攻擊時：35% 機率舉起防護罩防守，15% 後跳拉開
    if (playerAttacking && dist < 120) {
      const r = Math.random();
      if (r < 0.35) {
        input.guard = true;
        return input;
      } else if (r < 0.50) {
        input.y = -1;
        input.x = -dirToPlayer;
        return input;
      }
    }

    // 4.2 遠距離 (`dist > 180`)：前進移動、偶爾前跳或施放初階神兵
    if (dist > 180) {
      const r = Math.random();
      if (r < 0.18) {
        input.y = -1;
        input.x = dirToPlayer;
        return input;
      } else if (r < 0.40 && readySkills.length > 0) {
        const s = readySkills[Math.floor(Math.random() * readySkills.length)];
        input[`skill${s.slot + 1}`] = true;
        return input;
      } else {
        input.x = dirToPlayer * 0.8;
        return input;
      }
    }

    // 4.3 中距離 (`100 <= dist <= 180`)：前進移動、偶爾後退走位或起跳
    if (dist >= 100) {
      const r = Math.random();
      if (r < 0.18) {
        input.y = -1;
        input.x = dirToPlayer;
        return input;
      } else if (r < 0.68) {
        input.x = dirToPlayer * 0.75;
        return input;
      } else {
        input.x = -dirToPlayer * 0.6;
        return input;
      }
    }

    // 4.4 近身戰 (`dist < 100`)：出拳、踢擊、後跳、舉盾或後退
    const rClose = Math.random();
    if (rClose < 0.15) {
      input.y = -1;
      input.x = dirToPlayer;
      return input;
    } else if (rClose < 0.45) {
      input.punch = true; // 專屬出拳
      return input;
    } else if (rClose < 0.70) {
      input.kick = true;  // 專屬踢擊
      return input;
    } else if (rClose < 0.85) {
      input.guard = true; // 主動召喚防護罩
      return input;
    } else {
      input.x = -dirToPlayer * 0.6;
      return input;
    }
  }

  /**
   * 自由格鬥訓練營假人行為控制 (Training Dummy Behavior)
   */
  _decideTrainingDummy(dummy, player, settings) {
    const input = { x: 0, y: 0, punch: false, kick: false, guard: false, skill1: false, skill2: false, skill3: false, skill4: false, skill5: false, burst: false };

    // 1. 起身第一幀升龍反凹 (Reversal DP)
    if (settings.dummyReversal && dummy.state === 'wakeup' && dummy.stateTime >= 13) {
      input.skill2 = true;
      return input;
    }

    // 2. 姿態設定 (Stance - 僅保留站立與起跳，下蹲已全面移除)
    if (settings.dummyStance === 'jump') {
      input.y = -1; // 持續起跳
    }

    // 3. 防守狀態設定 (Guard - 依按鍵召喚量子防護罩)
    if (settings.dummyGuard === 'stand_guard' || settings.dummyGuard === 'crouch_guard') {
      input.guard = true; // 召喚量子防護罩防禦
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
