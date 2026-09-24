/**
 * 《CyberStriker: Quantum Arena》
 * 跨裝置全球雲端存檔與雙軌驗證系統 (Save System & Cloud Sync)
 * 支援跨電腦 / 跨瀏覽器自動同步進度、雲端代碼備份與時間戳智能合併
 */

import { antiCheat } from './engine/anti_cheat.js';

const STORAGE_KEY_CURRENT = "cyberstriker_current_session";
const STORAGE_KEY_ACCOUNTS = "cyberstriker_cloud_accounts";
const CLOUD_KV_ENDPOINT = "https://kvdb.io/LjcEsRKfWahraYeimuojjQ/";

/**
 * 輔助：安全 UTF-8 Base64 編碼（支援中文字符）
 */
function utf8ToBase64(str) {
  try {
    if (typeof btoa === "function") {
      return btoa(unescape(encodeURIComponent(str)));
    }
    return Buffer.from(str, "utf8").toString("base64");
  } catch (e) {
    return btoa(str);
  }
}

/**
 * 輔助：安全 UTF-8 Base64 解碼
 */
function base64ToUtf8(b64) {
  try {
    if (typeof atob === "function") {
      return decodeURIComponent(escape(atob(b64)));
    }
    return Buffer.from(b64, "base64").toString("utf8");
  } catch (e) {
    return atob(b64);
  }
}

/**
 * 將使用者 Email 轉換為雲端安全的 Key
 */
function emailToCloudKey(email) {
  const clean = email.trim().toLowerCase();
  const safeB64 = utf8ToBase64(clean)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return "cs_u_" + safeB64;
}

function safeGetItem(key) {
  try {
    if (typeof localStorage !== "undefined" && localStorage) {
      return localStorage.getItem(key);
    }
  } catch (e) {}
  return null;
}

function safeSetItem(key, val) {
  try {
    if (typeof localStorage !== "undefined" && localStorage) {
      localStorage.setItem(key, val);
    }
  } catch (e) {}
}

export function getTodayDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export class SaveSystem {
  constructor() {
    this.currentUser = null;
    this.isGuest = false;
    this.accounts = this._loadAccountsFromStorage();
    this.cloudEndpoint = CLOUD_KV_ENDPOINT;
    this.syncListeners = [];
    this.syncState = "idle"; // "idle" | "syncing" | "synced" | "error"
    this.lastSyncMessage = "雲端就緒";
  }

  /**
   * 註冊雲端同步狀態變更監聽器
   */
  onSyncChange(fn) {
    if (typeof fn === "function") {
      this.syncListeners.push(fn);
    }
  }

  _setSyncState(state, message = "") {
    this.syncState = state;
    this.lastSyncMessage = message;
    this.syncListeners.forEach(fn => {
      try {
        fn(this.syncState, this.lastSyncMessage);
      } catch (e) {
        console.error("Error in sync listener:", e);
      }
    });
  }

  _loadAccountsFromStorage() {
    try {
      const raw = safeGetItem(STORAGE_KEY_ACCOUNTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        const defaultStarterSkins = ["skin_cyber_warrior", "skin_neon_shadow", "skin_pulse_enforcer"];

        for (const email in parsed) {
          if (parsed[email]) {
            if (!Array.isArray(parsed[email].purchasedSkins)) {
              parsed[email].purchasedSkins = [];
            }
            if (!Array.isArray(parsed[email].skins)) {
              parsed[email].skins = [...defaultStarterSkins];
            }
            // 確保 3 套初始預設外觀都在
            defaultStarterSkins.forEach(sid => {
              if (!parsed[email].skins.includes(sid)) parsed[email].skins.push(sid);
            });
            // 雙向確保：purchasedSkins 內的所有造型都納入 skins，skins 內的所有非預設造型也都納入 purchasedSkins
            parsed[email].purchasedSkins.forEach(sid => {
              if (!parsed[email].skins.includes(sid)) parsed[email].skins.push(sid);
            });
            parsed[email].skins.forEach(sid => {
              if (!defaultStarterSkins.includes(sid) && !parsed[email].purchasedSkins.includes(sid)) {
                parsed[email].purchasedSkins.push(sid);
              }
            });
            // 穿戴外觀若未擁有則切回預設賽博武者
            if (!parsed[email].skins.includes(parsed[email].equippedSkin)) {
              parsed[email].equippedSkin = parsed[email].skins[0] || "skin_cyber_warrior";
            }
          }
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse saved accounts:", e);
    }

    const initialAccounts = {
      "player@gmail.com": {
        uid: "CY-UID-882101",
        email: "player@gmail.com",
        nickname: "量子先鋒",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=QuantumVanguard",
        credits: 50000,
        eventTokens: 120,
        skins: [
          "skin_cyber_warrior", "skin_neon_shadow", "skin_pulse_enforcer"
        ],
        purchasedSkins: [],
        equippedSkin: "skin_cyber_warrior",
        loadout: ["SK-01", "SK-02", "SK-03", "SK-10", "SK-11"],
        stats: { total: 18, wins: 14, losses: 4, aiBeaten: { easy: true, normal: true, hard: true, nightmare: false } },
        preferences: { bgmVol: 0.4, sfxVol: 0.8, haptics: true },
        lastLogin: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
      },
      "ethan.cyber@gmail.com": {
        uid: "CY-UID-773902",
        email: "ethan.cyber@gmail.com",
        nickname: "伊森大師",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EthanStriker",
        credits: 50000,
        eventTokens: 350,
        skins: [
          "skin_cyber_warrior", "skin_neon_shadow", "skin_pulse_enforcer"
        ],
        purchasedSkins: [],
        equippedSkin: "skin_cyber_warrior",
        loadout: ["SK-03", "SK-04", "SK-07", "SK-22", "SK-27"],
        stats: { total: 42, wins: 38, losses: 4, aiBeaten: { easy: true, normal: true, hard: true, nightmare: true } },
        preferences: { bgmVol: 0.5, sfxVol: 0.85, haptics: true },
        lastLogin: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
      }
    };

    safeSetItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(initialAccounts));
    return initialAccounts;
  }

  _saveAccountsToStorage() {
    try {
      safeSetItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(this.accounts));
    } catch (e) {
      console.error("Failed to persist accounts:", e);
    }
  }

  /**
   * 初始化系統：自動嘗試恢復前次登入，並在背景向雲端驗證有無最新資料
   */
  init() {
    try {
      const lastSession = safeGetItem(STORAGE_KEY_CURRENT);
      if (lastSession) {
        const sessionData = JSON.parse(lastSession);
        if (sessionData.isGuest) {
          this.loginAsGuest(sessionData.user);
          return;
        } else if (sessionData.email) {
          const acc = this.accounts[sessionData.email] || sessionData.user;
          if (acc) {
            this.currentUser = acc;
            this.accounts[sessionData.email] = acc;
            antiCheat.verifySaveIntegrity(this.currentUser);
            this.currentUser.lastLogin = new Date().toISOString();
            this._saveAccountsToStorage();

            // 背景靜默同步雲端資料（若玩家在別台電腦玩過，無縫拉回最新進度）
            this.syncWithCloud(sessionData.email).catch(err => {
              console.warn("Background sync on init:", err);
            });
            return;
          }
        }
      }
    } catch (e) {
      console.warn("Session resume failed, defaulting to first or guest:", e);
    }

    // 若無前次登入紀錄，初始為訪客身分，使開場能主動彈出登入授權儀供玩家輸入帳號
    this.loginAsGuest();
  }

  /**
   * 雲端存檔讀取 (GET from kvdb.io)
   */
  async fetchFromCloud(email) {
    if (!email || email.includes("offline.local")) return null;
    const key = emailToCloudKey(email);
    const url = this.cloudEndpoint + key;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { "Accept": "application/json" },
        signal: controller.signal
      });
      clearTimeout(timer);

      if (res.status === 200) {
        const data = await res.json();
        return data;
      } else if (res.status === 404) {
        return null;
      } else {
        console.warn("Cloud fetch returned status " + res.status);
        return null;
      }
    } catch (e) {
      clearTimeout(timer);
      console.warn("Cloud fetch failed or timed out:", e.message);
      return null;
    }
  }

  /**
   * 雲端存檔寫入 (POST to kvdb.io)
   */
  async saveToCloud(userData) {
    if (!userData || !userData.email || userData.email.includes("offline.local")) {
      return false;
    }

    this._setSyncState("syncing", "正在上傳存檔至全球雲端...");
    const key = emailToCloudKey(userData.email);
    const url = this.cloudEndpoint + key;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (res.ok) {
        this._setSyncState("synced", "已於 " + new Date().toLocaleTimeString() + " 成功同步至雲端");
        return true;
      } else {
        console.warn("Cloud save status " + res.status);
        this._setSyncState("error", "雲端同步回應異常，已保存於本機");
        return false;
      }
    } catch (e) {
      clearTimeout(timer);
      console.warn("Cloud save failed:", e.message);
      this._setSyncState("error", "網路連線受限，存檔暫存於本機");
      return false;
    }
  }

  /**
   * 智能合併演算法：確保任何裝置解鎖的造型與最高能量幣永遠不遺失
   */
  _mergeAccounts(cloud, local) {
    if (!cloud) return local;
    if (!local) return cloud;

    const cloudTime = new Date(cloud.updatedAt || 0).getTime();
    const localTime = new Date(local.updatedAt || 0).getTime();
    const defaultStarterSkins = ["skin_cyber_warrior", "skin_neon_shadow", "skin_pulse_enforcer"];

    // 購買紀錄與造型完整聯集（兩端購買或解鎖過之任何造型，100% 完整雙向繼承！）
    const cloudPurchased = Array.isArray(cloud.purchasedSkins) ? cloud.purchasedSkins : [];
    const localPurchased = Array.isArray(local.purchasedSkins) ? local.purchasedSkins : [];
    const cloudSkins = Array.isArray(cloud.skins) ? cloud.skins : [];
    const localSkins = Array.isArray(local.skins) ? local.skins : [];

    const mergedPurchased = Array.from(new Set([
      ...cloudPurchased,
      ...localPurchased,
      ...cloudSkins.filter(sid => !defaultStarterSkins.includes(sid)),
      ...localSkins.filter(sid => !defaultStarterSkins.includes(sid))
    ]));

    const allSkins = Array.from(new Set([
      ...defaultStarterSkins,
      ...cloudSkins,
      ...localSkins,
      ...mergedPurchased
    ]));

    // 當前穿戴外觀（優先遵從較新紀錄，且保證在擁有名單內）
    const newerAcc = cloudTime >= localTime ? cloud : local;
    let equipped = newerAcc.equippedSkin || cloud.equippedSkin || local.equippedSkin;
    if (!allSkins.includes(equipped)) {
      equipped = allSkins[0] || "skin_cyber_warrior";
    }

    // 能量幣與活動代幣：取兩端最大值，防止任何一方進度被覆蓋
    const credits = Math.max(Number(cloud.credits) || 0, Number(local.credits) || 0);
    const eventTokens = Math.max(Number(cloud.eventTokens) || 0, Number(local.eventTokens) || 0);

    // 戰績合併
    const stats = {
      total: Math.max(cloud.stats?.total || 0, local.stats?.total || 0),
      wins: Math.max(cloud.stats?.wins || 0, local.stats?.wins || 0),
      losses: Math.max(cloud.stats?.losses || 0, local.stats?.losses || 0),
      aiBeaten: {
        easy: !!(cloud.stats?.aiBeaten?.easy || local.stats?.aiBeaten?.easy),
        normal: !!(cloud.stats?.aiBeaten?.normal || local.stats?.aiBeaten?.normal),
        hard: !!(cloud.stats?.aiBeaten?.hard || local.stats?.aiBeaten?.hard),
        nightmare: !!(cloud.stats?.aiBeaten?.nightmare || local.stats?.aiBeaten?.nightmare)
      }
    };

    return {
      uid: cloud.uid || local.uid || ("CY-UID-" + Math.floor(100000 + Math.random() * 900000)),
      email: local.email || cloud.email,
      nickname: (local.nickname && local.nickname !== "量子先鋒") ? local.nickname : (cloud.nickname || local.nickname || "量子戰士"),
      avatar: cloud.avatar || local.avatar,
      credits: credits,
      eventTokens: eventTokens,
      purchasedSkins: mergedPurchased,
      skins: allSkins,
      equippedSkin: equipped,
      loadout: (Array.isArray(newerAcc.loadout) && newerAcc.loadout.length > 0) ? newerAcc.loadout : (cloud.loadout || local.loadout || ["SK-01", "SK-02", "SK-03", "SK-10", "SK-11"]),
      stats: stats,
      preferences: { ...(cloud.preferences || {}), ...(local.preferences || {}) },
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * 手動或定時強制向雲端進行雙向同步
   */
  async syncWithCloud(targetEmail = null) {
    const email = targetEmail || (this.currentUser ? this.currentUser.email : null);
    if (!email || email.includes("offline.local")) {
      return { success: false, reason: "訪客帳號無法進行雲端同步" };
    }

    this._setSyncState("syncing", "正在連接全球雲端資料庫...");
    try {
      const cloudData = await this.fetchFromCloud(email);
      const localData = this.accounts[email] || this.currentUser;

      let merged;
      if (cloudData && localData) {
        merged = this._mergeAccounts(cloudData, localData);
      } else if (cloudData) {
        merged = cloudData;
      } else if (localData) {
        merged = localData;
      } else {
        return { success: false, reason: "找不到帳號資料" };
      }

      merged.updatedAt = new Date().toISOString();
      this.accounts[email] = merged;
      if (this.currentUser && this.currentUser.email === email) {
        this.currentUser = merged;
      }

      this._saveAccountsToStorage();
      this._persistSession();

      // 同步回推給雲端
      await this.saveToCloud(merged);
      this._setSyncState("synced", "已完成跨電腦雙向同步 (" + new Date().toLocaleTimeString() + ")");
      return { success: true, user: merged };
    } catch (e) {
      console.error("syncWithCloud error:", e);
      this._setSyncState("error", "雲端同步失敗，已維持本機進度");
      return { success: false, error: e.message };
    }
  }

  /**
   * 途徑一：手動輸入 Gmail 信箱（非同步雲端查找與漫遊恢復）
   */
  async loginWithEmail(email, customNickname = "") {
    email = email.trim().toLowerCase();
    this._setSyncState("syncing", "正在檢索雲端伺服器存檔...");

    const localData = this.accounts[email] || null;
    let cloudData = null;
    let isNewUser = false;
    let restoreSource = "local";

    try {
      cloudData = await this.fetchFromCloud(email);
    } catch (e) {
      console.warn("Failed to query cloud on login:", e);
    }

    if (cloudData) {
      // 雲端有紀錄：跨電腦登入成功！執行智慧合併
      restoreSource = "cloud";
      isNewUser = false;
      this.currentUser = this._mergeAccounts(cloudData, localData);
      if (customNickname && customNickname.trim()) {
        this.currentUser.nickname = customNickname.trim().slice(0, 12);
      }
      this.currentUser.lastLogin = new Date().toISOString();
      this.accounts[email] = this.currentUser;
    } else if (localData) {
      // 本機有紀錄但雲端尚無：自動上傳至雲端
      restoreSource = "local";
      isNewUser = false;
      this.currentUser = localData;
      if (customNickname && customNickname.trim()) {
        this.currentUser.nickname = customNickname.trim().slice(0, 12);
      }
      this.currentUser.lastLogin = new Date().toISOString();
    } else {
      // 兩端皆無：初次創建新帳號
      isNewUser = true;
      restoreSource = "new";
      const defaultNick = customNickname.trim() || email.split("@")[0];
      const newAccount = {
        uid: "CY-UID-" + Math.floor(100000 + Math.random() * 900000),
        email: email,
        nickname: defaultNick.slice(0, 12),
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=" + encodeURIComponent(email),
        credits: 50000,
        eventTokens: 0,
        skins: [
          "skin_cyber_warrior", "skin_neon_shadow", "skin_pulse_enforcer"
        ],
        purchasedSkins: [],
        equippedSkin: "skin_cyber_warrior",
        loadout: ["SK-01", "SK-02", "SK-03", "SK-10", "SK-11"],
        stats: { total: 0, wins: 0, losses: 0, aiBeaten: { easy: false, normal: false, hard: false, nightmare: false } },
        preferences: { bgmVol: 0.4, sfxVol: 0.8, haptics: true },
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.accounts[email] = newAccount;
      this.currentUser = newAccount;
    }

    this.isGuest = false;
    this._persistSession();
    this._saveAccountsToStorage();

    // 背景推播最新進度至雲端以確保跨電腦即時生效
    this.saveToCloud(this.currentUser).catch(err => {
      console.warn("Initial cloud push failed:", err);
    });

    return { user: this.currentUser, isNewUser, restoreSource };
  }

  /**
   * 途徑二：選擇電腦現有 Google 帳號清單一鍵切換
   */
  async switchAccount(email) {
    if (this.accounts[email]) {
      this.currentUser = this.accounts[email];
      this.currentUser.lastLogin = new Date().toISOString();
      this.isGuest = false;
      this._persistSession();
      this._saveAccountsToStorage();

      // 切換後於背景同步該帳號之最新雲端紀錄
      this.syncWithCloud(email).catch(e => console.warn("Switch sync error:", e));
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
      uid: "CY-GUEST-" + Math.floor(1000 + Math.random() * 9000),
      email: "guest@offline.local",
      nickname: "訪客戰士",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=GuestStriker",
      credits: 50000,
      eventTokens: 0,
      skins: [
        "skin_cyber_warrior", "skin_neon_shadow", "skin_pulse_enforcer"
      ],
      purchasedSkins: [],
      equippedSkin: "skin_cyber_warrior",
      loadout: ["SK-01", "SK-02", "SK-03", "SK-10", "SK-11"],
      stats: { total: 0, wins: 0, losses: 0, aiBeaten: { easy: false, normal: false, hard: false, nightmare: false } },
      preferences: { bgmVol: 0.4, sfxVol: 0.8, haptics: true },
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this._setSyncState("idle", "離線訪客模式");
    this._persistSession();
    return this.currentUser;
  }

  /**
   * 將訪客帳號綁定至真實 Gmail (資料無痛轉移並上傳雲端)
   */
  async bindGuestToEmail(email, nickname = "") {
    email = email.trim().toLowerCase();
    const isNew = !this.accounts[email];
    if (isNew) {
      this.currentUser.email = email;
      if (nickname.trim()) this.currentUser.nickname = nickname.trim().slice(0, 12);
      this.currentUser.isGuest = false;
      this.accounts[email] = { ...this.currentUser, updatedAt: new Date().toISOString() };
    } else {
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
    await this.saveToCloud(this.currentUser);
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
   */
  recordBattleResult(won, difficulty = "normal", isAi = true) {
    if (!this.currentUser) return { gained: 0, total: 0 };

    let gained = won ? 350 : 120;
    if (won && (difficulty === "hard" || difficulty === "nightmare")) {
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
    this.currentUser.updatedAt = new Date().toISOString();
    this._saveCurrent();
    return true;
  }

  purchaseSkin(skinId, price) {
    if (!this.currentUser) return { success: false, reason: "未登入" };
    if (this.currentUser.skins.includes(skinId)) {
      return { success: false, reason: "已擁有此造型" };
    }
    if (this.currentUser.credits < price) {
      return { success: false, reason: "能量幣餘額不足（可領取每日戰備補給或進行對戰賺取能量幣）" };
    }
    this.currentUser.credits -= price;
    if (!Array.isArray(this.currentUser.purchasedSkins)) {
      this.currentUser.purchasedSkins = [];
    }
    if (!this.currentUser.purchasedSkins.includes(skinId)) {
      this.currentUser.purchasedSkins.push(skinId);
    }
    this.currentUser.skins.push(skinId);
    this.currentUser.equippedSkin = skinId;
    this.currentUser.updatedAt = new Date().toISOString();
    this._saveCurrent();
    return { success: true, remaining: this.currentUser.credits };
  }

  /**
   * 檢查當天是否可以領取戰備補給 (每日嚴格限領一次)
   */
  canClaimDailySupply() {
    const today = getTodayDateString();
    if (this.currentUser && this.currentUser.lastDailySupplyDate) {
      return this.currentUser.lastDailySupplyDate !== today;
    }
    const storedDate = safeGetItem("cyberstriker_daily_supply_date");
    if (storedDate === today) {
      return false;
    }
    return true;
  }

  /**
   * 領取每日戰備補給 (當天僅能領取 1 次，拿完隔日 00:00 才能再次領取)
   */
  claimDailySupply(amount = 1500) {
    if (!this.currentUser) return { success: false, reason: "未登入帳號" };
    const today = getTodayDateString();
    if (!this.canClaimDailySupply()) {
      return {
        success: false,
        reason: "今日戰備補給已領取完畢！每日僅限領取一次，請於明天再來領取！",
        nextReset: this.getTimeUntilNextDailyReset()
      };
    }

    this.currentUser.credits = (this.currentUser.credits || 0) + amount;
    this.currentUser.lastDailySupplyDate = today;
    safeSetItem("cyberstriker_daily_supply_date", today);
    this._saveCurrent();
    return {
      success: true,
      amount,
      newBalance: this.currentUser.credits,
      date: today
    };
  }

  /**
   * 計算距離隔日 00:00:00 重置剩餘時間
   */
  getTimeUntilNextDailyReset() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const diffMs = tomorrow - now;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} 小時 ${mins} 分鐘`;
  }

  updateLoadout(skillsArray) {
    if (Array.isArray(skillsArray) && skillsArray.length > 0) {
      safeSetItem('quantum_arena_last_loadout', JSON.stringify(skillsArray));
      if (this.currentUser) {
        this.currentUser.loadout = [...skillsArray];
        this.currentUser.updatedAt = new Date().toISOString();
        this._saveCurrent();
      }
    }
  }

  addCredits(amount) {
    // 防作弊：單次最多發放 5,000 幣，杜絕惡意控制台注入
    const num = Math.max(0, Math.min(5000, Number(amount) || 0));
    if (this.currentUser) {
      this.currentUser.credits = (Number(this.currentUser.credits) || 0) + num;
      this.currentUser.updatedAt = new Date().toISOString();
      this._saveCurrent();
      return this.currentUser.credits;
    }
    return 0;
  }

  savePreferences(prefs) {
    if (!this.currentUser) return;
    this.currentUser.preferences = { ...this.currentUser.preferences, ...prefs };
    this.currentUser.updatedAt = new Date().toISOString();
    this._saveCurrent();
  }

  /**
   * 存檔核心：先寫入本機 localStorage，並在背景非同步上傳至全球雲端
   */
  _saveCurrent() {
    if (this.currentUser) {
      this.currentUser.updatedAt = new Date().toISOString();
      // 數位簽名防篡改保護
      this.currentUser._sig = antiCheat.generateSaveSignature(this.currentUser);
    }

    if (!this.isGuest && this.currentUser && this.currentUser.email) {
      this.accounts[this.currentUser.email] = { ...this.currentUser };
      this._saveAccountsToStorage();

      // 背景向全球雲端持久化儲存（不阻塞前台畫面渲染）
      this.saveToCloud(this.currentUser).catch(err => {
        console.warn("Auto cloud sync failed:", err);
      });
    }
    this._persistSession();
  }

  _persistSession() {
    try {
      safeSetItem(STORAGE_KEY_CURRENT, JSON.stringify({
        isGuest: this.isGuest,
        email: this.currentUser ? this.currentUser.email : null,
        user: this.currentUser
      }));
    } catch (e) {
      console.error("Session write failed:", e);
    }
  }

  /**
   * 匯出萬用量子存檔代碼 (CY-SAVE-...)
   */
  exportSaveToken() {
    if (!this.currentUser) return "";
    try {
      const payload = JSON.stringify(this.currentUser);
      const b64 = utf8ToBase64(payload);
      return "CY-SAVE-" + b64;
    } catch (e) {
      console.error("Failed to export save token:", e);
      return "";
    }
  }

  /**
   * 導入萬用量子存檔代碼 (CY-SAVE-...)
   */
  async importSaveToken(tokenStr) {
    if (!tokenStr || !tokenStr.startsWith("CY-SAVE-")) {
      return { success: false, reason: "代碼格式無效，必須以 CY-SAVE- 開頭" };
    }

    try {
      const b64 = tokenStr.slice("CY-SAVE-".length).trim();
      const json = base64ToUtf8(b64);
      const imported = JSON.parse(json);

      if (!imported.email || !imported.skins) {
        return { success: false, reason: "代碼內容缺少必要遊戲欄位" };
      }

      const email = imported.email.toLowerCase();
      const existing = this.accounts[email] || null;
      const merged = this._mergeAccounts(imported, existing);

      this.accounts[email] = merged;
      this.currentUser = merged;
      this.isGuest = false;

      this._saveAccountsToStorage();
      this._persistSession();

      // 上傳至全球雲端
      await this.saveToCloud(merged);
      return { success: true, user: merged };
    } catch (e) {
      console.error("Failed to parse save token:", e);
      return { success: false, reason: "存檔代碼解析失敗：" + e.message };
    }
  }

  exportDataJson() {
    return JSON.stringify(this.currentUser, null, 2);
  }

  importDataJson(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      if (!imported.email || !imported.uid) return false;

      const existing = this.accounts[imported.email];
      const merged = this._mergeAccounts(imported, existing);
      this.accounts[imported.email] = merged;
      this.currentUser = merged;
      this.isGuest = false;
      this._saveAccountsToStorage();
      this._persistSession();
      this.saveToCloud(merged).catch(console.warn);
      return true;
    } catch (e) {
      console.error("Failed to import data:", e);
      return false;
    }
  }
}

export const saveSystem = new SaveSystem();
