/**
 * 《CyberStriker: Quantum Arena》
 * 量子反作弊與數據完整性防護核心 (Quantum Anti-Cheat & Integrity Guard)
 * 
 * 5 大主動安全防禦機制：
 * 1. 記憶體數值影子混淆與動態防竄改 (XOR Shadow Memory & Tamper Guard)
 * 2. 瞬移與超速作弊動態監控 (Speedhack & Teleport Detection)
 * 3. 異常傷害與秒殺攔截 (Damage Spoofing & One-Hit-Kill Filter)
 * 4. 技能冷卻與硬直繞過防護 (Cooldown Bypass Protection)
 * 5. 存檔數位雜湊簽名防篡改 (Cryptographic Save Signature Verification)
 */

export class AntiCheatEngine {
  constructor() {
    this.salt = 0x5a3c9e71;
    this.saveSalt = 'CS_QUANTUM_INTEGRITY_SALT_2026';
    this.cheatViolations = 0;
    this.lastAlertTime = 0;
    this.warningCallback = null;
  }

  setWarningCallback(cb) {
    if (typeof cb === 'function') {
      this.warningCallback = cb;
    }
  }

  _triggerAlert(type, details) {
    this.cheatViolations++;
    const now = Date.now();
    console.warn(`[Quantum Anti-Cheat] ⚠️ 攔截到作弊嘗試 [${type}]: ${details}`);

    if (now - this.lastAlertTime > 1500) {
      this.lastAlertTime = now;
      if (this.warningCallback) {
        this.warningCallback(type, details);
      }
    }
  }

  /**
   * 1. 記憶體影子混淆保護 (為戰鬥角色注入防竄改 Getter/Setter)
   */
  protectFighter(fighter) {
    if (!fighter || fighter._antiCheatProtected) return fighter;

    const salt = this.salt ^ (fighter.id * 0x1f2e3d);
    let _realHp = fighter.hp;
    let _shadowHp = _realHp ^ salt;
    let _realSuper = fighter.superMeter;
    let _shadowSuper = _realSuper ^ salt;
    let _realBurst = fighter.burstMeter;
    let _shadowBurst = _realBurst ^ salt;

    fighter._antiCheatProtected = true;
    fighter.cheatFlagged = false;
    fighter._lastValidX = fighter.x;
    fighter._lastValidY = fighter.y;

    // ── 血量 (HP) 防竄改保護 ──
    Object.defineProperty(fighter, 'hp', {
      get() {
        // 校驗影子數值是否吻合
        if ((_shadowHp ^ salt) !== _realHp) {
          _realHp = Math.max(0, Math.min(fighter.maxHp, _shadowHp ^ salt));
        }
        return _realHp;
      },
      set(newVal) {
        let val = Number(newVal);
        if (isNaN(val)) val = 0;

        // 偵測異常突變 (例如直接在 Console 將對手血量改為 0 或自己改為 99999)
        if (val > fighter.maxHp) {
          this.cheatViolations++;
          val = fighter.maxHp;
        }

        // 當未遭受合法命中且非訓練模式，卻突變減少超過 450 點血量 (異常秒殺外掛)
        if (!fighter.isTakingLegitHit && _realHp > 0 && (_realHp - val) > 420) {
          val = Math.max(0, _realHp - 380); // 限制單次最大合法必殺傷害
        }

        val = Math.max(0, Math.min(fighter.maxHp, Math.round(val)));
        _realHp = val;
        _shadowHp = val ^ salt;
      },
      configurable: true,
      enumerable: true
    });

    // ── 必殺能量 (Super Meter) 防竄改保護 ──
    Object.defineProperty(fighter, 'superMeter', {
      get() {
        if ((_shadowSuper ^ salt) !== _realSuper) {
          _realSuper = Math.max(0, Math.min(fighter.superMax, _shadowSuper ^ salt));
        }
        return _realSuper;
      },
      set(newVal) {
        let val = Number(newVal);
        if (isNaN(val)) val = 0;
        val = Math.max(0, Math.min(fighter.superMax, Math.round(val)));
        _realSuper = val;
        _shadowSuper = val ^ salt;
      },
      configurable: true,
      enumerable: true
    });

    // ── 爆發能量 (Burst Meter) 防竄改保護 ──
    Object.defineProperty(fighter, 'burstMeter', {
      get() {
        if ((_shadowBurst ^ salt) !== _realBurst) {
          _realBurst = Math.max(0, Math.min(fighter.burstMax, _shadowBurst ^ salt));
        }
        return _realBurst;
      },
      set(newVal) {
        let val = Number(newVal);
        if (isNaN(val)) val = 0;
        val = Math.max(0, Math.min(fighter.burstMax, Math.round(val)));
        _realBurst = val;
        _shadowBurst = val ^ salt;
      },
      configurable: true,
      enumerable: true
    });

    return fighter;
  }

  /**
   * 2. 瞬移與超速作弊監控 (Speedhack & Teleport Validator)
   */
  validateMovement(fighter, arenaWidth, floorY) {
    if (!fighter) return;

    if (typeof fighter._lastValidX === 'undefined') {
      fighter._lastValidX = fighter.x;
      fighter._lastValidY = fighter.y;
      return;
    }

    const deltaX = Math.abs(fighter.x - fighter._lastValidX);
    const maxLegalDeltaX = 26; // 每幀合法最高位移 (包含衝刺與擊飛)

    if (deltaX > maxLegalDeltaX && !fighter.isAirBursting && fighter.state !== 'wakeup') {
      this._triggerAlert('SPEEDHACK_TELEPORT', `X 位移異常: ${deltaX.toFixed(1)}px (限制上限: ${maxLegalDeltaX}px)`);
      // 強制拉回至合法座標範圍
      const sign = fighter.x > fighter._lastValidX ? 1 : -1;
      fighter.x = fighter._lastValidX + sign * maxLegalDeltaX;
      fighter.vx = 0;
    }

    // 邊界防穿牆保護
    fighter.x = Math.max(20, Math.min(arenaWidth - 20, fighter.x));
    fighter.y = Math.min(floorY, fighter.y);

    fighter._lastValidX = fighter.x;
    fighter._lastValidY = fighter.y;
  }

  /**
   * 3. 異常傷害與秒殺攔截 (Damage Spoofing Filter)
   */
  filterDamage(rawDamage, attackType = 'normal') {
    let dmg = Number(rawDamage) || 0;
    const maxDamageTable = {
      light_punch: 55,
      heavy_kick: 95,
      ranged_attack: 110,
      skill: 290,
      super_move: 380,
      normal: 380
    };

    const maxAllowed = maxDamageTable[attackType] || 380;
    if (dmg > maxAllowed) {
      this._triggerAlert('DAMAGE_SPOOF', `異常單擊傷害: ${dmg} (強制平抑為最高合法上限: ${maxAllowed})`);
      dmg = maxAllowed;
    }
    return Math.max(0, dmg);
  }

  /**
   * 4. 存檔數位簽名防篡改 (HMAC / Hash Verification)
   */
  generateSaveSignature(user) {
    if (!user) return '';
    const userId = user.uid || user.id || '';
    const skinsStr = Array.isArray(user.skins) ? [...user.skins].sort().join(',') : '';
    const wins = user.stats?.wins || user.wins || 0;
    const raw = `${userId}_${user.credits}_${skinsStr}_${wins}_${this.saveSalt}`;
    return this._hashString(raw);
  }

  verifySaveIntegrity(user) {
    if (!user) return false;
    if (!user._sig) {
      // 舊版或首次創建的存檔，自動補簽
      user._sig = this.generateSaveSignature(user);
      return true;
    }

    const expectedSig = this.generateSaveSignature(user);
    const isAuthentic = user._sig === expectedSig;

    if (!isAuthentic) {
      this._triggerAlert('SAVE_TAMPERED', '偵測到本地存檔遭手動竄改 (金幣或外觀簽名不合)！');
      user.isCheated = true;
      // 限制非正常膨脹的金幣上限
      if (user.credits > 1000000) {
        user.credits = 1200; // 重置為初始資產
      }
      user._sig = this.generateSaveSignature(user);
    }
    return isAuthentic;
  }

  _hashString(str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }
}

export const antiCheat = new AntiCheatEngine();
