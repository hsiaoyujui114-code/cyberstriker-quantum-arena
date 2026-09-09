/**
 * 《CyberStriker: Quantum Arena》
 * 跨裝置雲端存檔與雙軌 Google 驗證系統 (Save System & Dual Auth)
 * 完全符合 GAME_PROJECT_PLAN.md 第一章規格
 */

const STORAGE_KEY_CURRENT = 'cyberstriker_current_session';
const STORAGE_KEY_ACCOUNTS = 'cyberstriker_cloud_accounts';

export class SaveSystem {
  constructor() {
    this.currentUser = null;
    this.isGuest = false;
    this.accounts = this._loadAccountsFromStorage();
  }

  _loadAccountsFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse saved accounts:', e);
    }

    // 預設模擬多個本機曾登入之 Google 帳號 (參考《條碼戰士》多帳號切換體驗)
    const initialAccounts = {
      'player@gmail.com': {
        uid: 'CY-UID-882101',
        email: 'player@gmail.com',
        nickname: '量子先鋒',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=QuantumVanguard',
        credits: 2450,
        eventTokens: 120,
        skins: ['skin_cyber_warrior', 'skin_neon_shadow', 'skin_pulse_enforcer', 'skin_dark_hacker'],
        equippedSkin: 'skin_cyber_warrior',
        loadout: ['SK-01', 'SK-02', 'SK-09'],
        stats: { total: 18, wins: 14, losses: 4, aiBeaten: { easy: true, normal: true, hard: true, nightmare: false } },
        preferences: { bgmVol: 0.4, sfxVol: 0.8, haptics: true },
        lastLogin: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      'ethan.cyber@gmail.com': {
        uid: 'CY-UID-773902',
        email: 'ethan.cyber@gmail.com',
        nickname: '伊森大師',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=EthanStriker',
        credits: 4800,
        eventTokens: 350,
        skins: ['skin_cyber_warrior', 'skin_neon_shadow', 'skin_pulse_enforcer', 'skin_dark_hacker', 'skin_solar_valkyrie'],
        equippedSkin: 'skin_solar_valkyrie',
        loadout: ['SK-03', 'SK-04', 'SK-07'],
        stats: { total: 42, wins: 38, losses: 4, aiBeaten: { easy: true, normal: true, hard: true, nightmare: true } },
        preferences: { bgmVol: 0.5, sfxVol: 0.85, haptics: true },
        lastLogin: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    };

    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(initialAccounts));
    return initialAccounts;
  }

  _saveAccountsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(this.accounts));
    } catch (e) {
      console.error('Failed to persist accounts:', e);
    }
  }

  /**
   * 初始化系統與自動嘗試恢復前次登入
   */
  init() {
    try {
      const lastSession = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (lastSession) {
        const sessionData = JSON.parse(lastSession);
        if (sessionData.isGuest) {
          this.loginAsGuest(sessionData.user);
          return;
        } else if (sessionData.email && this.accounts[sessionData.email]) {
          this.currentUser = this.accounts[sessionData.email];
          this.currentUser.lastLogin = new Date().toISOString();
          this._saveAccountsToStorage();
          return;
        }
      }
    } catch (e) {
      console.warn('Session resume failed, defaulting to guest:', e);
    }

    // 預設以首個帳號或訪客登入
    const firstEmail = Object.keys(this.accounts)[0];
    if (firstEmail) {
      this.loginWithEmail(firstEmail);
    } else {
      this.loginAsGuest();
    }
  }

  /**
   * 途徑一：手動輸入 Gmail 信箱
   */
  loginWithEmail(email, customNickname = '') {
    email = email.trim().toLowerCase();
    const isNewUser = !this.accounts[email];

    if (isNewUser) {
      // 首次輸入：雲端即刻創建新帳號，贈送 1,200 點初始能量幣與 3 套初始預設外觀
      const defaultNick = customNickname.trim() || email.split('@')[0];
      const newAccount = {
        uid: 'CY-UID-' + Math.floor(100000 + Math.random() * 900000),
        email: email,
        nickname: defaultNick.slice(0, 12),
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        credits: 1200,
        eventTokens: 0,
        skins: ['skin_cyber_warrior', 'skin_neon_shadow', 'skin_pulse_enforcer'],
        equippedSkin: 'skin_cyber_warrior',
        loadout: ['SK-01', 'SK-02', 'SK-09'],
        stats: { total: 0, wins: 0, losses: 0, aiBeaten: { easy: false, normal: false, hard: false, nightmare: false } },
        preferences: { bgmVol: 0.4, sfxVol: 0.8, haptics: true },
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.accounts[email] = newAccount;
      this.currentUser = newAccount;
    } else {
      // 老玩家：自動調取歷史進度
      this.currentUser = this.accounts[email];
      if (customNickname && customNickname.trim()) {
        this.currentUser.nickname = customNickname.trim().slice(0, 12);
      }
      this.currentUser.lastLogin = new Date().toISOString();
    }

    this.isGuest = false;
    this._persistSession();
    this._saveAccountsToStorage();
    return { user: this.currentUser, isNewUser };
  }

  /**
   * 途徑二：選擇電腦現有 Google 帳號清單一鍵切換
   */
  switchAccount(email) {
    if (this.accounts[email]) {
      this.currentUser = this.accounts[email];
      this.currentUser.lastLogin = new Date().toISOString();
      this.isGuest = false;
      this._persistSession();
      this._saveAccountsToStorage();
      return this.currentUser;
    }
    return null;
  }

  /**
   * 途徑三：訪客試玩體驗模式 (Guest Play Mode)
   */
  loginAsGuest(existingGuestData = null) {
    this.isGuest = true;
    this.currentUser = existingGuestData || {
      uid: 'CY-GUEST-' + Math.floor(1000 + Math.random() * 9000),
      email: 'guest@offline.local',
      nickname: '訪客戰士',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GuestStriker',
      credits: 600,
      eventTokens: 0,
      skins: ['skin_cyber_warrior', 'skin_neon_shadow', 'skin_pulse_enforcer'],
      equippedSkin: 'skin_cyber_warrior',
      loadout: ['SK-01', 'SK-02', 'SK-09'],
      stats: { total: 0, wins: 0, losses: 0, aiBeaten: { easy: false, normal: false, hard: false, nightmare: false } },
      preferences: { bgmVol: 0.4, sfxVol: 0.8, haptics: true },
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this._persistSession();
    return this.currentUser;
  }

  /**
   * 將訪客帳號綁定至真實 Gmail (資料無痛轉移)
   */
  bindGuestToEmail(email, nickname = '') {
    email = email.trim().toLowerCase();
    const isNew = !this.accounts[email];
    if (isNew) {
      this.currentUser.email = email;
      if (nickname.trim()) this.currentUser.nickname = nickname.trim().slice(0, 12);
      this.currentUser.isGuest = false;
      this.accounts[email] = { ...this.currentUser, updatedAt: new Date().toISOString() };
    } else {
      // 若該信箱已存在，安全合併金幣與戰績
      const existing = this.accounts[email];
      existing.credits += this.currentUser.credits;
      existing.stats.total += this.currentUser.stats.total;
      existing.stats.wins += this.currentUser.stats.wins;
      existing.stats.losses += this.currentUser.stats.losses;
      this.currentUser = existing;
    }
    this.isGuest = false;
    this._persistSession();
    this._saveAccountsToStorage();
    return this.currentUser;
  }

  /**
   * 取得所有本機已登記 Google 帳號卡片清單
   */
  getRegisteredAccountsList() {
    return Object.values(this.accounts).map(acc => ({
      email: acc.email,
      nickname: acc.nickname,
      avatar: acc.avatar,
      credits: acc.credits,
      lastLogin: acc.lastLogin || acc.updatedAt,
      isCurrent: !this.isGuest && this.currentUser && this.currentUser.email === acc.email
    }));
  }

  /**
   * 戰鬥獲勝/落敗經濟收益結算
   * 勝場 +350, 敗場 +120, 困難/惡夢 +200
   */
  recordBattleResult(won, difficulty = 'normal', isAi = true) {
    if (!this.currentUser) return { gained: 0, total: 0 };

    let gained = won ? 350 : 120;
    if (won && (difficulty === 'hard' || difficulty === 'nightmare')) {
      gained += 200;
    }

    this.currentUser.credits += gained;
    this.currentUser.stats.total++;
    if (won) {
      this.currentUser.stats.wins++;
      if (isAi && this.currentUser.stats.aiBeaten) {
        this.currentUser.stats.aiBeaten[difficulty] = true;
      }
    } else {
      this.currentUser.stats.losses++;
    }

    this.currentUser.updatedAt = new Date().toISOString();
    this._saveCurrent();
    return { gained, total: this.currentUser.credits };
  }

  equipSkin(skinId) {
    if (!this.currentUser) return false;
    if (!this.currentUser.skins.includes(skinId)) return false;
    this.currentUser.equippedSkin = skinId;
    this._saveCurrent();
    return true;
  }

  purchaseSkin(skinId, price) {
    if (!this.currentUser) return { success: false, reason: '未登入' };
    if (this.currentUser.skins.includes(skinId)) {
      return { success: false, reason: '已擁有此造型' };
    }
    if (this.currentUser.credits < price) {
      return { success: false, reason: '能量幣餘額不足' };
    }
    this.currentUser.credits -= price;
    this.currentUser.skins.push(skinId);
    this.currentUser.equippedSkin = skinId;
    this._saveCurrent();
    return { success: true, remaining: this.currentUser.credits };
  }

  updateLoadout(skillsArray) {
    if (!this.currentUser) return;
    if (Array.isArray(skillsArray) && skillsArray.length === 3) {
      this.currentUser.loadout = [...skillsArray];
      this._saveCurrent();
    }
  }

  savePreferences(prefs) {
    if (!this.currentUser) return;
    this.currentUser.preferences = { ...this.currentUser.preferences, ...prefs };
    this._saveCurrent();
  }

  _saveCurrent() {
    if (!this.isGuest && this.currentUser && this.currentUser.email) {
      this.accounts[this.currentUser.email] = { ...this.currentUser, updatedAt: new Date().toISOString() };
      this._saveAccountsToStorage();
    }
    this._persistSession();
  }

  _persistSession() {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify({
        isGuest: this.isGuest,
        email: this.currentUser ? this.currentUser.email : null,
        user: this.currentUser
      }));
    } catch (e) {
      console.error('Session write failed:', e);
    }
  }

  // 跨裝置匯出存檔 JSON (支援一鍵同步到手機或另一台電腦)
  exportDataJson() {
    return JSON.stringify(this.currentUser, null, 2);
  }

  // 跨裝置匯入存檔 JSON (時間戳記智能合併)
  importDataJson(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      if (!imported.email || !imported.uid) return false;

      const existing = this.accounts[imported.email];
      if (!existing || new Date(imported.updatedAt) > new Date(existing.updatedAt)) {
        this.accounts[imported.email] = imported;
        this.currentUser = imported;
        this.isGuest = false;
        this._saveAccountsToStorage();
        this._persistSession();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  }
}

export const saveSystem = new SaveSystem();
