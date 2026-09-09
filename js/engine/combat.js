/**
 * 《CyberStriker: Quantum Arena》
 * 核心格鬥與戰鬥物理引擎 (Deterministic 60 FPS Combat Engine)
 * 攻防三段體系 + 量子逆轉爆發 (Burst) + 10 大技能幀數判定
 * 完全符合 GAME_PROJECT_PLAN.md 第二章與第四章規格
 */

import { SKILLS } from '../data/skills.js';
import { soundEngine } from './audio.js';

export class CombatEngine {
  constructor() {
    this.arenaWidth = 1000;
    this.floorY = 380;
    this.p1 = null;
    this.p2 = null;
    this.projectiles = [];
    this.shockwaves = [];
    this.floatingTexts = [];
    this.roundTime = 99;
    this.timerAcc = 0;
    this.isOver = false;
    this.winner = null;
    this.isTraining = false;

    // 訓練營專屬狀態
    this.trainingSettings = {
      dummyStance: 'stand', // 'stand', 'crouch', 'jump'
      dummyGuard: 'none',   // 'none', 'stand_guard', 'crouch_guard', 'after_first_hit'
      dummyReversal: false, // 甦醒第一幀升龍
      instantCd: false      // 技能即時無冷卻
    };

    // 震動回饋開關
    this.enableHaptics = true;
  }

  initMatch(p1Data, p2Data, isTraining = false, trainingOpts = {}) {
    this.isTraining = isTraining;
    this.isOver = false;
    this.winner = null;
    this.roundTime = 99;
    this.timerAcc = 0;
    this.projectiles = [];
    this.shockwaves = [];
    this.floatingTexts = [];

    if (isTraining && trainingOpts) {
      this.trainingSettings = { ...this.trainingSettings, ...trainingOpts };
    }

    // 玩家 P1 位於左側 25%，對手 P2 位於右側 75% (全場景比例自適應)
    const p1StartX = Math.max(160, Math.round(this.arenaWidth * 0.25));
    const p2StartX = Math.min(this.arenaWidth - 160, Math.round(this.arenaWidth * 0.75));
    this.p1 = this._createFighter(1, p1StartX, p1Data);
    this.p2 = this._createFighter(2, p2StartX, p2Data);
    this.p1.facing = 1;
    this.p2.facing = -1;
  }

  _createFighter(id, x, data) {
    const skillList = (data.loadout && data.loadout.length === 3)
      ? data.loadout.map(sid => SKILLS.find(s => s.id === sid) || SKILLS[0])
      : [SKILLS[0], SKILLS[1], SKILLS[8]];

    return {
      id,
      name: data.name || (id === 1 ? 'Player 1' : 'Player 2'),
      skin: data.skin,
      x,
      y: this.floorY,
      vx: 0,
      vy: 0,
      facing: id === 1 ? 1 : -1,
      isGrounded: true,
      maxHp: 1000,
      hp: 1000,
      state: 'idle', // idle, walk_fwd, walk_back, jump, crouch, high_guard, low_guard, light_punch, heavy_kick, skill, hit_stun, knockdown, wakeup
      stateTime: 0,
      stateDuration: 0,
      currentAction: null,
      isGuarding: false,
      guardStance: 'high', // 'high' 或 'low'
      invincibleTimer: 0,

      // 量子逆轉爆發 (Burst)
      burstMeter: 500, // 滿 500 點可施展
      burstMax: 500,
      burstAvailable: true,

      // 3 大自選技能
      skills: skillList,
      cooldowns: [0, 0, 0],

      // 連段統計
      comboCount: 0,
      comboDamage: 0,
      comboResetTimer: 0,
      frameAdvantage: 0 // 幀數優劣勢 (+有利 / -不利)
    };
  }

  /**
   * 60 FPS 物理推進核心
   */
  update(inputsP1, inputsP2) {
    if (this.isOver) {
      // 戰鬥結束時：持續推進勝者慶祝勝利姿態動畫與浮動文字
      if (this.p1) this.p1.stateTime++;
      if (this.p2) this.p2.stateTime++;
      this._updateFloatingTexts();
      return;
    }

    // 1. 訓練營專屬維護 (即時無冷卻與木樁血量自動回滿)
    if (this.isTraining) {
      if (this.trainingSettings.instantCd) {
        this.p1.cooldowns = [0, 0, 0];
        this.p2.cooldowns = [0, 0, 0];
      }
      if (this.p2.hp <= 150 || (this.p2.hp < this.p2.maxHp && this.p2.comboCount === 0 && this.p2.state === 'idle')) {
        this.p2.hp = Math.min(this.p2.maxHp, this.p2.hp + 12);
      }
      if (this.p1.hp <= 100) {
        this.p1.hp = this.p1.maxHp;
      }
    }

    // 2. 計時器更新 (訓練營無限時間)
    if (!this.isTraining) {
      this.timerAcc++;
      if (this.timerAcc >= 60) {
        this.timerAcc = 0;
        this.roundTime--;
        if (this.roundTime <= 0) {
          this.roundTime = 0;
          this._handleTimeOver();
        }
      }
    }

    // 3. 處理雙方冷卻與輸入
    this._updateFighter(this.p1, this.p2, inputsP1);
    this._updateFighter(this.p2, this.p1, inputsP2);

    // 4. 更新飛行道具與衝擊波
    this._updateProjectiles();
    this._updateShockwaves();
    this._updateFloatingTexts();

    // 5. 兩人間距與面向校正
    this._resolvePositions();

    // 6. 勝負判定與觸發勝利姿態
    if (!this.isTraining && !this.isOver) {
      if (this.p1.hp <= 0 && this.p2.hp <= 0) {
        this.isOver = true;
        this.winner = 0; // 平局
        soundEngine.playHit('ko');
        this._triggerMatchEndStates();
      } else if (this.p1.hp <= 0) {
        this.isOver = true;
        this.winner = 2;
        soundEngine.playHit('ko');
        this._triggerMatchEndStates();
      } else if (this.p2.hp <= 0) {
        this.isOver = true;
        this.winner = 1;
        soundEngine.playHit('ko');
        this._triggerMatchEndStates();
      }
    }
  }

  _triggerMatchEndStates() {
    if (this.winner === 1) {
      this.p1.state = 'victory';
      this.p1.stateTime = 0;
      this.p1.vx = 0;
      this.p1.vy = 0;
      if (this.p2.state !== 'knockdown') {
        this.p2.state = 'defeat';
        this.p2.stateTime = 0;
        this.p2.vx = 0;
      }
      this.floatingTexts.push({
        text: 'VICTORY!',
        x: this.p1.x,
        y: this.p1.y - 145,
        color: '#ffd700',
        life: 180
      });
    } else if (this.winner === 2) {
      this.p2.state = 'victory';
      this.p2.stateTime = 0;
      this.p2.vx = 0;
      this.p2.vy = 0;
      if (this.p1.state !== 'knockdown') {
        this.p1.state = 'defeat';
        this.p1.stateTime = 0;
        this.p1.vx = 0;
      }
      this.floatingTexts.push({
        text: 'VICTORY!',
        x: this.p2.x,
        y: this.p2.y - 145,
        color: '#ff007f',
        life: 180
      });
    }
  }

  _updateFighter(char, opp, input) {
    char.stateTime++;
    if (char.invincibleTimer > 0) char.invincibleTimer--;

    // 冷卻倒數 (秒數轉幀數)
    for (let i = 0; i < char.cooldowns.length; i++) {
      if (char.cooldowns[i] > 0) {
        char.cooldowns[i] = Math.max(0, char.cooldowns[i] - 1 / 60);
      }
    }

    // 連段重置計時
    if (char.comboResetTimer > 0) {
      char.comboResetTimer--;
      if (char.comboResetTimer <= 0) {
        char.comboCount = 0;
        char.comboDamage = 0;
      }
    }

    // 重力物理運算 (更敏捷、起落更俐落)
    if (!char.isGrounded) {
      char.vy += 1.05; // 俐落重力
      char.x += char.vx;
      char.y += char.vy;
      if (char.y >= this.floorY) {
        char.y = this.floorY;
        char.vy = 0;
        char.vx = 0;
        char.isGrounded = true;
        char.facing = char.x < opp.x ? 1 : -1; // 落地確保面向對手
        if (char.state === 'jump') {
          char.state = 'idle';
          char.stateTime = 0;
        }
      }
    } else {
      char.x += char.vx;
      char.vx *= 0.75; // 地面摩擦力快速剎車
    }

    // 邊界限制
    char.x = Math.max(50, Math.min(this.arenaWidth - 50, char.x));

    // ─── 檢查量子逆轉爆發 (Quantum Burst) ───
    // 在受擊硬直 (hit_stun) 中可消耗能量進行緊急脫身
    const tryBurst = input && (input.burst || (input.punch && input.kick));
    if (tryBurst && char.state === 'hit_stun' && char.burstMeter >= char.burstMax && char.burstAvailable) {
      this._executeBurst(char, opp);
      return;
    }

    // 狀態機處理
    switch (char.state) {
      case 'idle':
      case 'walk_fwd':
      case 'walk_back':
      case 'crouch':
      case 'high_guard':
      case 'low_guard':
        this._handleNormalInputs(char, opp, input);
        break;

      case 'jump':
        // 空中越頂自動校正面向（若越過對手，且尚未出招，自動朝向對手）
        if (char.currentAction !== 'air_attack') {
          char.facing = char.x < opp.x ? 1 : -1;
        }
        // 空中可施展跳躍攻擊 (逆向 Cross-up 打擊)
        if (input && (input.punch || input.kick) && char.currentAction !== 'air_attack') {
          char.facing = char.x < opp.x ? 1 : -1; // 出招時面向對手
          char.currentAction = 'air_attack';
          this._executeAirAttack(char, opp, input.kick ? 'kick' : 'punch');
        }
        break;

      case 'light_punch':
      case 'heavy_kick':
      case 'skill':
        this._updateAttackAction(char, opp);
        break;

      case 'hit_stun':
        if (char.stateTime >= char.stateDuration) {
          char.state = 'idle';
          char.stateTime = 0;
          char.currentAction = null;
        }
        break;

      case 'knockdown':
        if (char.stateTime >= 40) { // 平躺 40 幀
          char.state = 'wakeup';
          char.stateTime = 0;
          char.invincibleTimer = 15; // 起身無敵 15 幀
          soundEngine.playHit('slide');
        }
        break;

      case 'wakeup':
        if (char.stateTime >= 15) {
          char.state = 'idle';
          char.stateTime = 0;
          char.currentAction = null;
        }
        break;
    }
  }

  _handleNormalInputs(char, opp, input) {
    if (!input) {
      char.state = 'idle';
      char.isGuarding = false;
      return;
    }

    // 面向自動校正 (在地面可動時)
    if (char.isGrounded) {
      char.facing = char.x < opp.x ? 1 : -1;
    }

    // 1. 技能觸發 (優先級最高)
    if (input.skill1 && char.cooldowns[0] <= 0) {
      this._executeSkill(char, opp, 0);
      return;
    }
    if (input.skill2 && char.cooldowns[1] <= 0) {
      this._executeSkill(char, opp, 1);
      return;
    }
    if (input.skill3 && char.cooldowns[2] <= 0) {
      this._executeSkill(char, opp, 2);
      return;
    }

    // 2. 基礎攻擊
    if (input.punch) {
      this._executeLightPunch(char, opp);
      return;
    }
    if (input.kick) {
      this._executeHeavyKick(char, opp);
      return;
    }

    // 3. 移動、起跳與格擋
    const moveX = input.x || 0;
    const moveY = input.y || 0;

    // 起跳 (更敏捷爆發)
    if (moveY < -0.4 && char.isGrounded) {
      char.isGrounded = false;
      char.vy = -18.5; // 俐落起跳
      char.vx = moveX * 6.8; // 躍進加速
      char.state = 'jump';
      char.stateTime = 0;
      char.isGuarding = false;
      soundEngine.playHit('dp');
      return;
    }

    // 下蹲
    if (moveY > 0.4 && char.isGrounded) {
      // 蹲姿時若同時向後拉，進入下段格擋 (Low Guard)
      const isPullingBack = (char.facing === 1 && moveX < -0.2) || (char.facing === -1 && moveX > 0.2);
      if (isPullingBack) {
        char.state = 'low_guard';
        char.guardStance = 'low';
        char.isGuarding = true;
      } else {
        char.state = 'crouch';
        char.isGuarding = false;
      }
      return;
    }

    // 橫向移動 (移動速度大幅加速，動作更靈敏)
    if (Math.abs(moveX) > 0.2) {
      const isMovingFwd = (char.facing === 1 && moveX > 0) || (char.facing === -1 && moveX < 0);
      if (isMovingFwd) {
        char.x += char.facing * 7.5; // 由 4.2 加速至 7.5
        char.state = 'walk_fwd';
        char.isGuarding = false;
      } else {
        // 後撤防守步：上身微仰收緊，自動高段格擋 (High Guard)
        char.x -= char.facing * 5.6; // 由 3.2 加速至 5.6
        char.state = 'walk_back';
        char.guardStance = 'high';
        char.isGuarding = true;
      }
      return;
    }

    // 無方向操作，恢復待機
    char.state = 'idle';
    char.isGuarding = false;
  }

  // ─── 量子逆轉爆發系統 (Quantum Burst) ───
  _executeBurst(char, opp) {
    char.burstMeter = 0;
    char.burstAvailable = false; // 每回合限用 1 次
    char.state = 'idle';
    char.stateTime = 0;
    char.invincibleTimer = 10; // 前 10 幀全身無敵

    soundEngine.playHit('burst');
    this._triggerHaptic(80);

    // 爆發直徑 300 像素金色環形氣浪
    this.shockwaves.push({
      x: char.x,
      y: char.y - 70,
      radius: 10,
      maxRadius: 150,
      color: '#ffd700',
      duration: 20
    });

    // 將近身對手推開至 3 個身位 (約 240px)，打斷其連招
    const dist = Math.abs(char.x - opp.x);
    if (dist < 260) {
      opp.vx = char.facing * 18;
      opp.state = 'hit_stun';
      opp.stateTime = 0;
      opp.stateDuration = 20; // 造成對手短暫 20 幀推擠硬直
      opp.hp = Math.max(1, opp.hp - 40); // 造成 40 點微量衝擊反傷
      this.floatingTexts.push({
        text: 'QUANTUM BURST!',
        x: char.x,
        y: char.y - 120,
        color: '#ffd700',
        life: 45
      });
    }
  }

  // ─── 普攻打擊 (大幅縮短前搖與硬直，極致靈敏) ───
  _executeLightPunch(char, opp) {
    char.state = 'light_punch';
    char.stateTime = 0;
    char.stateDuration = 9; // 9 幀極速出拳收招
    char.currentAction = {
      name: '刺拳打擊',
      startup: 3, // 3 幀秒出
      active: 3,
      recovery: 3,
      damage: 40,
      guardType: 'all',
      hitChecked: false
    };
    soundEngine.playHit('punch');
  }

  _executeHeavyKick(char, opp) {
    char.state = 'heavy_kick';
    char.stateTime = 0;
    char.stateDuration = 13; // 13 幀破空重踢
    char.currentAction = {
      name: '重力猛踢',
      startup: 5, // 5 幀迅猛出踢
      active: 4,
      recovery: 4,
      damage: 80,
      guardType: 'all',
      hitChecked: false
    };
    soundEngine.playHit('kick');
  }

  _executeAirAttack(char, opp, type) {
    char.currentAction = {
      name: type === 'kick' ? '躍空重踢' : '跳躍刺拳',
      startup: 2, // 2 幀瞬發
      active: 6,
      recovery: 3,
      damage: type === 'kick' ? 90 : 50,
      guardType: 'stand_only', // 空中打擊視為中段，不可蹲防
      hitChecked: false
    };
    soundEngine.playHit(type === 'kick' ? 'kick' : 'punch');
  }

  // ─── 10 大核心技能執行 ───
  _executeSkill(char, opp, slotIdx) {
    const skill = char.skills[slotIdx];
    if (!skill) return;

    // 設定冷卻
    char.cooldowns[slotIdx] = skill.cd;
    char.state = 'skill';
    char.stateTime = 0;
    char.stateDuration = skill.startup + skill.active + skill.recovery;
    char.currentAction = {
      ...skill,
      hitChecked: false
    };

    // 招式前搖特效與音效
    switch (skill.id) {
      case 'SK-01': // 能量脈衝彈
        soundEngine.playHit('laser');
        break;

      case 'SK-02': // 升龍衝天擊
        char.invincibleTimer = skill.invincibleFrames || 4;
        char.isGrounded = false;
        char.vy = -17; // 迅猛升空
        char.vx = char.facing * 5;
        soundEngine.playHit('dp');
        break;

      case 'SK-03': // 音速滑踢
        char.vx = char.facing * 24; // 貼地疾衝
        soundEngine.playHit('slide');
        break;

      case 'SK-04': // 躍空震地砸
        char.isGrounded = false;
        char.vy = -14;
        char.vx = char.facing * 8;
        soundEngine.playHit('dp');
        break;

      case 'SK-05': // 幻影反擊壁 (架招)
        soundEngine.playHit('guard');
        break;

      case 'SK-06': // 虛空折躍斬 (瞬移穿透)
        soundEngine.playHit('teleport');
        break;

      case 'SK-07': // 百裂連擊衝
        char.vx = char.facing * 12; // 敏捷突進
        soundEngine.playHit('punch');
        break;

      case 'SK-08': // 磁暴重摔投 (霸體)
        char.invincibleTimer = 8;
        soundEngine.playHit('punch');
        break;

      case 'SK-09': // 奈米震波罩
        soundEngine.playHit('burst');
        break;

      case 'SK-10': // 超載終結砲
        soundEngine.playHit('beam');
        break;
    }
  }

  _updateAttackAction(char, opp) {
    const action = char.currentAction;
    if (!action) return;

    const t = char.stateTime;
    const hitStart = action.startup;
    const hitEnd = action.startup + action.active;

    // 虛空折躍斬：瞬移判定
    if (action.id === 'SK-06' && t === action.startup) {
      char.x = opp.x + (opp.facing * -50); // 瞬移至對手正背後
      char.facing = char.x < opp.x ? 1 : -1;
    }

    // 招式命中幀檢查
    if (t >= hitStart && t <= hitEnd && !action.hitChecked) {
      this._checkHitbox(char, opp, action);
    }

    // 動作結束，恢復正常
    if (t >= char.stateDuration) {
      char.state = 'idle';
      char.stateTime = 0;
      char.currentAction = null;
    }
  }

  // ─── 判定盒 (Hitbox / Hurtbox) 檢定與攻防三段三擇 ───
  _checkHitbox(char, opp, action) {
    if (opp.invincibleTimer > 0) return;

    // 飛行道具單獨生成實體
    if (action.id === 'SK-01') {
      action.hitChecked = true;
      this.projectiles.push({
        ownerId: char.id,
        x: char.x + char.facing * 40,
        y: char.y - 74,
        vx: char.facing * 12,
        damage: action.damage,
        skin: char.skin,
        life: 70
      });
      return;
    }

    // 奈米震波罩 (SK-09)：全方位圓形判定
    if (action.id === 'SK-09') {
      action.hitChecked = true;
      this.shockwaves.push({
        x: char.x,
        y: char.y - 70,
        radius: 10,
        maxRadius: 180,
        color: char.skin.themeColor,
        duration: 14
      });
      const dist = Math.abs(char.x - opp.x);
      if (dist < 190) {
        this._applyHit(char, opp, action);
      }
      return;
    }

    // 超載終結砲 (SK-10)：全螢幕巨光束
    if (action.id === 'SK-10') {
      action.hitChecked = true;
      this.shockwaves.push({
        x: char.x + char.facing * 500,
        y: char.y - 74,
        width: 1000,
        height: 50,
        isBeam: true,
        color: char.skin.themeColor,
        duration: 16
      });
      // 判定對手是否在前方
      const isInFront = (char.facing === 1 && opp.x > char.x) || (char.facing === -1 && opp.x < char.x);
      if (isInFront && opp.y >= this.floorY - 120) {
        this._applyHit(char, opp, action);
      }
      return;
    }

    // 常規近戰範圍判定
    const hitReach = action.id === 'SK-03' ? 120 : (action.id === 'SK-08' ? 90 : 80);
    const inRange = Math.abs(char.x - opp.x) <= hitReach && Math.abs(char.y - opp.y) <= 80;
    const isFacingOpp = (char.facing === 1 && opp.x >= char.x - 20) || (char.facing === -1 && opp.x <= char.x + 20);

    if (inRange && isFacingOpp) {
      action.hitChecked = true;

      // 幻影反擊壁 (SK-05) 檢驗：若對手正處於反擊姿態，且非投技，對手架招成功反打！
      if (opp.currentAction && opp.currentAction.id === 'SK-05' && action.guardType !== 'unblockable') {
        this._triggerParryCounter(opp, char);
        return;
      }

      this._applyHit(char, opp, action);
    }
  }

  // ─── 傷害計算與攻防三段三擇 ───
  _applyHit(char, opp, action) {
    let damage = action.damage || 50;
    let isBlocked = false;

    // 攻防三段核心規則：
    // 1. 指令摔 (unblockable)：不可防禦！
    if (action.guardType === 'unblockable') {
      isBlocked = false;
    }
    // 2. 中段破防 (stand_only)：蹲防強制破除！
    else if (action.guardType === 'stand_only') {
      if (opp.isGuarding && opp.guardStance === 'high') {
        isBlocked = true;
      } else {
        isBlocked = false; // 蹲防被破
      }
    }
    // 3. 下段突進 (crouch_only)：站防強制破除！
    else if (action.guardType === 'crouch_only') {
      if (opp.isGuarding && opp.guardStance === 'low') {
        isBlocked = true;
      } else {
        isBlocked = false; // 站防被破
      }
    }
    // 4. 常規攻擊 (all)：站防/蹲防皆可防
    else if (opp.isGuarding) {
      isBlocked = true;
    }

    // 格擋減傷與削血機制
    if (isBlocked) {
      damage = Math.round(damage * (action.chipRatio || 0.15)); // 減免 85%，扣 15% 削血
      opp.hp = Math.max(0, opp.hp - damage);
      soundEngine.playHit('guard');
      this._triggerHaptic(20);

      // 訓練營幀數指示：防禦不利幀 (攻擊方 -4f ~ -6f)
      char.frameAdvantage = -4;

      this.floatingTexts.push({
        text: `GUARD -${damage}`,
        x: opp.x,
        y: opp.y - 80,
        color: '#38bdf8',
        life: 30
      });
      return;
    }

    // 命中打擊！
    opp.hp = Math.max(0, opp.hp - damage);

    // 充能挨打方的量子爆發計量槽
    opp.burstMeter = Math.min(opp.burstMax, opp.burstMeter + Math.round(damage * 0.9));

    // 連段累加
    char.comboCount++;
    char.comboDamage += damage;
    char.comboResetTimer = 45; // 45 幀內再次命中算連段
    char.frameAdvantage = 4;   // 攻擊命中享有有利幀 (+4f)

    // 音效與觸覺震動
    if (action.knockdown || damage >= 150) {
      soundEngine.playHit('slam');
      this._triggerHaptic(80);
    } else {
      soundEngine.playHit(action.name.includes('踢') ? 'kick' : 'punch');
      this._triggerHaptic(action.damage > 80 ? 50 : 15);
    }

    // 擊退與硬直 / 擊倒受身
    if (action.knockdown) {
      opp.state = 'knockdown';
      opp.stateTime = 0;
      opp.vx = char.facing * 12;
      opp.vy = -6;
      opp.isGrounded = false;
    } else {
      opp.state = 'hit_stun';
      opp.stateTime = 0;
      opp.stateDuration = 16; // 輕受擊硬直 16 幀
      opp.vx = char.facing * 6;
    }

    this.floatingTexts.push({
      text: `HIT! -${damage}`,
      x: opp.x,
      y: opp.y - 90,
      color: '#ff007f',
      life: 35
    });
  }

  _triggerParryCounter(parryChar, attacker) {
    parryChar.currentAction.hitChecked = true;
    soundEngine.playHit('parry_trigger');
    this._triggerHaptic(60);

    // 架招成功，反彈擊暈對手並給予反擊傷害
    attacker.state = 'hit_stun';
    attacker.stateTime = 0;
    attacker.stateDuration = 35; // 擊暈 35 幀
    attacker.hp = Math.max(0, attacker.hp - 190);

    this.floatingTexts.push({
      text: 'PARRY COUNTER! -190',
      x: parryChar.x,
      y: parryChar.y - 110,
      color: '#00ff66',
      life: 45
    });
  }

  _updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.life--;

      // 檢查是否命中對手
      const target = p.ownerId === 1 ? this.p2 : this.p1;
      const dist = Math.abs(p.x - target.x);
      if (dist < 40 && target.y >= this.floorY - 90 && target.invincibleTimer <= 0) {
        this._applyHit(p.ownerId === 1 ? this.p1 : this.p2, target, {
          name: '能量脈衝彈',
          damage: p.damage,
          guardType: 'all',
          chipRatio: 0.15
        });
        this.projectiles.splice(i, 1);
        continue;
      }

      // 超出邊界或生命耗盡
      if (p.life <= 0 || p.x < 20 || p.x > this.arenaWidth - 20) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  _updateShockwaves() {
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.duration--;
      if (s.radius !== undefined) {
        s.radius += (s.maxRadius - s.radius) * 0.2;
      }
      if (s.duration <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  _updateFloatingTexts() {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y -= 0.8;
      t.life--;
      if (t.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  _resolvePositions() {
    const p1 = this.p1;
    const p2 = this.p2;
    if (!p1 || !p2) return;

    // 1. 技能穿身或倒地/起身豁免 (Pass-through exemptions)
    // 音速滑踢 (SK-03) 貼地疾衝、折躍斬 (SK-05) 瞬移，或任一方處於倒地 (knockdown)、起身 (wakeup) 狀態時，完全豁免阻擋，允許自由穿身換邊
    const isP1Passing = (p1.state === 'skill' && p1.currentAction && (p1.currentAction.id === 'SK-03' || p1.currentAction.id === 'SK-05'));
    const isP2Passing = (p2.state === 'skill' && p2.currentAction && (p2.currentAction.id === 'SK-03' || p2.currentAction.id === 'SK-05'));
    const isP1Down = (p1.state === 'knockdown' || p1.state === 'wakeup');
    const isP2Down = (p2.state === 'knockdown' || p2.state === 'wakeup');

    if (isP1Passing || isP2Passing || isP1Down || isP2Down) {
      p1.x = Math.max(50, Math.min(this.arenaWidth - 50, p1.x));
      p2.x = Math.max(50, Math.min(this.arenaWidth - 50, p2.x));
      return;
    }

    // 2. 空中越頂跳躍檢測 (Jump Over / Cross-up)
    const dy = Math.abs(p1.y - p2.y);
    const p1Air = !p1.isGrounded;
    const p2Air = !p2.isGrounded;

    // 若有角色在空中且高度差超過 35px，代表處於越頂身位，完全不阻擋 X 軸移動，順暢越過對手頭頂換邊
    if ((p1Air || p2Air) && dy > 35) {
      p1.x = Math.max(50, Math.min(this.arenaWidth - 50, p1.x));
      p2.x = Math.max(50, Math.min(this.arenaWidth - 50, p2.x));
      return;
    }

    // 3. 空中近身交錯保護 (保持水平動量順勢越過，絕不硬阻彈回)
    if (p1Air || p2Air) {
      const dx = p2.x - p1.x;
      if (Math.abs(dx) < 40) {
        if (p1Air && Math.abs(p1.vx) > 0.5) {
          p1.x += Math.sign(p1.vx) * 2.5;
        } else if (p2Air && Math.abs(p2.vx) > 0.5) {
          p2.x += Math.sign(p2.vx) * 2.5;
        }
      }
      p1.x = Math.max(50, Math.min(this.arenaWidth - 50, p1.x));
      p2.x = Math.max(50, Math.min(this.arenaWidth - 50, p2.x));
      return;
    }

    // 4. 地面近身接觸與主動推擠換邊 (Ground Soft Collision & Slip-Through)
    const minDistance = 44;
    const dx = p2.x - p1.x;
    const dist = Math.abs(dx);

    if (dist < minDistance) {
      const p1Pushing = (p1.state === 'walk_fwd');
      const p2Pushing = (p2.state === 'walk_fwd');

      if (p1Pushing && !p2Pushing) {
        // P1 主動向前走推擠：P1 順暢前推滑過對手身側換邊
        p1.x += p1.facing * 3.8;
        p2.x -= p1.facing * 1.2;
      } else if (p2Pushing && !p1Pushing) {
        // P2 主動向前走推擠：P2 順暢前推滑過對手身側換邊
        p2.x += p2.facing * 3.8;
        p1.x -= p2.facing * 1.2;
      } else if (p1Pushing && p2Pushing) {
        // 雙方同時前推：順勢交錯互換身位
        p1.x += p1.facing * 2.8;
        p2.x += p2.facing * 2.8;
      } else {
        // 雙方均未主動推擠（待機/格擋/受擊）：維持正常站位軟隔離，防止重疊
        const push = (minDistance - dist) / 2;
        if (dx >= 0) {
          p1.x -= push;
          p2.x += push;
        } else {
          p1.x += push;
          p2.x -= push;
        }
      }
    }

    // 5. 擂台角落換邊防夾死保護 (Corner Cross-up Safeguard)
    if (p1.x > this.arenaWidth - 65 && p2.x > this.arenaWidth - 110) {
      p2.x = this.arenaWidth - 110;
    } else if (p1.x < 65 && p2.x < 110) {
      p2.x = 110;
    }
    if (p2.x > this.arenaWidth - 65 && p1.x > this.arenaWidth - 110) {
      p1.x = this.arenaWidth - 110;
    } else if (p2.x < 65 && p1.x < 110) {
      p1.x = 110;
    }

    // 6. 邊界最終限制 (完全開放至擂台邊緣)
    p1.x = Math.max(45, Math.min(this.arenaWidth - 45, p1.x));
    p2.x = Math.max(45, Math.min(this.arenaWidth - 45, p2.x));
  }

  _handleTimeOver() {
    this.isOver = true;
    if (this.p1.hp > this.p2.hp) this.winner = 1;
    else if (this.p2.hp > this.p1.hp) this.winner = 2;
    else this.winner = 0;
    soundEngine.playHit('ko');
    this._triggerMatchEndStates();
  }

  _triggerHaptic(durationMs) {
    if (this.enableHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(durationMs);
      } catch (e) {
        // Silent catch for browsers restricting vibration without user gesture
      }
    }
  }
}

export const combatEngine = new CombatEngine();
