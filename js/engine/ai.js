/**
 * 《CyberStriker: Quantum Arena》
 * AI 行為樹深度邏輯架構 (AI Behavior Architecture)
 * 簡單 (Easy) / 普通 (Normal) / 困難 (Hard) / 惡夢 (Nightmare) + 訓練營假人
 * 完全符合 GAME_PROJECT_PLAN.md 第 4.1 與 4.3 節
 */

export class AiController {
  constructor(difficulty = 'normal') {
    this.difficulty = difficulty; // 'easy', 'normal', 'hard', 'nightmare'
    this.reactionDelay = 20; // 延遲幀數計數
    this.currentDelay = 0;
    this.bufferedDecision = { x: 0, y: 0, punch: false, kick: false, ranged: false, guard: false, skill1: false, skill2: false, skill3: false, burst: false };
  }

  setDifficulty(diff) {
    this.difficulty = diff;
    this.currentDelay = 0;
  }

  /**
   * 決策每幀輸入
   */
  decide(aiChar, playerChar, combatEngine) {
    // 若處於訓練營模式，完全依據假人設定行動
    if (combatEngine.isTraining) {
      return this._decideTrainingDummy(aiChar, playerChar, combatEngine.trainingSettings);
    }

    // 依據難度設定反應幀數
    let targetDelay = 20;
    if (this.difficulty === 'easy') targetDelay = 40;
    else if (this.difficulty === 'normal') targetDelay = 20;
    else if (this.difficulty === 'hard') targetDelay = 9;
    else if (this.difficulty === 'nightmare') targetDelay = 3;

    this.currentDelay++;
    if (this.currentDelay >= targetDelay) {
      this.currentDelay = 0;
      this.bufferedDecision = this._makeDecision(aiChar, playerChar, combatEngine);
    }

    return this.bufferedDecision;
  }

  _makeDecision(ai, player, engine) {
    const input = { x: 0, y: 0, punch: false, kick: false, ranged: false, guard: false, skill1: false, skill2: false, skill3: false, burst: false };
    const dist = Math.abs(ai.x - player.x);
    const facingPlayer = (ai.x < player.x ? 1 : -1) === ai.facing;
    const playerInAir = !player.isGrounded;
    const playerAttacking = player.state === 'light_punch' || player.state === 'heavy_kick' || player.state === 'skill';
    const playerGuarding = player.isGuarding;

    // ─── 惡夢 (Nightmare) AI：極限反應與完美反凹 ───
    if (this.difficulty === 'nightmare') {
      // 1. 被連招受擊時立刻使用量子逆轉爆發 (Burst)
      if (ai.state === 'hit_stun' && ai.burstMeter >= ai.burstMax && ai.burstAvailable) {
        input.burst = true;
        return input;
      }

      // 2. 玩家起跳跳入：100% 升龍截擊 (SK-02) 或躍空攔截
      if (playerInAir && dist < 160) {
        if (ai.cooldowns[1] <= 0) {
          input.skill2 = true; // 升龍衝天擊
          return input;
        } else {
          input.kick = true;
          return input;
        }
      }

      // 3. 玩家出招攻擊：若有架招 (SK-05) 且為常規近戰，直接架招反打；否則進行完美高低段防守
      if (playerAttacking && dist < 120) {
        if (ai.cooldowns[0] <= 0 && ai.skills[0].id === 'SK-05') {
          input.skill1 = true; // 幻影反擊壁
          return input;
        }
        // 智能辨識玩家招式段位，召喚對應段位防護罩防守
        if (player.currentAction && player.currentAction.guardType === 'crouch_only') {
          input.guard = true;
          input.y = 1; // 召喚防護罩下蹲防守
          return input;
        } else {
          input.guard = true; // 召喚防護罩站立高段防守
          return input;
        }
      }

      // 4. 對手持續龜防：立即向前突進使用不可防禦之指令摔技 (SK-08) 破除
      if (playerGuarding && dist < 100) {
        if (ai.cooldowns[2] <= 0 && ai.skills[2].id === 'SK-08') {
          input.skill3 = true; // 磁暴重摔投
          return input;
        } else if (ai.cooldowns[0] <= 0 && ai.skills[0].id === 'SK-03') {
          input.skill1 = true; // 下段音速滑踢破破站防
          return input;
        }
      }

      // 5. 攻勢壓迫：中遠距離發波或遠程光彈，近身快速輕拳連打雙擇
      if (dist > 220) {
        if (ai.cooldowns[0] <= 0) {
          input.skill1 = true;
          return input;
        }
        if (ai.rangedCooldown <= 0 && Math.random() < 0.6) {
          input.ranged = true; // 發射量子遠程光彈
          return input;
        }
        input.x = ai.facing; // 前壓
        return input;
      } else {
        // 貼身隨機打出刺拳或下段滑踢
        if (Math.random() < 0.6) input.punch = true;
        else input.kick = true;
        return input;
      }
    }

    // ─── 困難 (Hard) AI：強防空意識與確反處罰 ───
    if (this.difficulty === 'hard') {
      // 玩家跳躍：極強防空意識
      if (playerInAir && dist < 140) {
        if (ai.cooldowns[1] <= 0) {
          input.skill2 = true; // 升龍拳
          return input;
        }
        input.kick = true;
        return input;
      }

      // 玩家出招且處於後搖硬直：按鍵召喚防護罩防禦
      if (playerAttacking && dist < 100) {
        input.guard = true;
        return input;
      }

      // 伺機進攻 (中遠距離結合遠程光彈壓制)
      if (dist > 180) {
        if (ai.cooldowns[0] <= 0 && Math.random() < 0.7) {
          input.skill1 = true;
          return input;
        } else if (ai.rangedCooldown <= 0 && Math.random() < 0.5) {
          input.ranged = true; // 遠程攻擊
          return input;
        }
        input.x = ai.facing;
      } else {
        if (Math.random() < 0.5) input.punch = true;
        else if (Math.random() < 0.8) input.kick = true;
        else input.x = ai.facing * -1; // 後拉調整立回 (純後退走位，無防護罩)
      }
      return input;
    }

    // ─── 普通 (Normal) AI：基礎立回與偶爾出招 ───
    if (this.difficulty === 'normal') {
      if (dist > 200) {
        if (ai.cooldowns[0] <= 0 && Math.random() < 0.4) {
          input.skill1 = true;
        } else if (ai.rangedCooldown <= 0 && Math.random() < 0.4) {
          input.ranged = true; // 遠程攻擊
        } else {
          input.x = ai.facing;
        }
      } else {
        if (playerAttacking && Math.random() < 0.5) {
          input.guard = true; // 50% 機率按鍵召喚防護罩防守
          return input;
        } else {
          const r = Math.random();
          if (r < 0.4) input.punch = true;
          else if (r < 0.7) input.kick = true;
          else if (r < 0.85 && ai.cooldowns[1] <= 0) input.skill2 = true;
        }
      }
      return input;
    }

    // ─── 簡單 (Easy) AI：緩慢隨意、新手沙包 ───
    if (dist > 120) {
      input.x = ai.facing * 0.7; // 慢慢走近
    } else {
      if (Math.random() < 0.3) input.punch = true;
      else if (Math.random() < 0.45) input.kick = true;
    }
    return input;
  }

  /**
   * 自由格鬥訓練營假人行為控制
   */
  _decideTrainingDummy(dummy, player, settings) {
    const input = { x: 0, y: 0, punch: false, kick: false, ranged: false, guard: false, skill1: false, skill2: false, skill3: false, burst: false };

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
