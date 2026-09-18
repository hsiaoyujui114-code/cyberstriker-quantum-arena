/**
 * 《CyberStriker: Quantum Arena》
 * 遊戲主控制器與介面驅動器 (Master App Controller)
 * 整合所有模組：登入、大廳展示台、四大大廳分頁、配技載入、60 FPS 戰鬥、AI 行為、重播短碼、雙人對打與行動觸控
 */

import { SKILLS, ARCHETYPES, WEAPON_TIERS, TIER_CONFIG, getRandomAiWeapons } from './data/skills.js';
import { SKINS } from './data/skins.js';
import { STAGES, getStageById, getRandomStage } from './data/stages.js';
import { saveSystem } from './save_system.js';
import { soundEngine } from './engine/audio.js';
import { characterRenderer } from './engine/character_renderer.js';
import { combatEngine } from './engine/combat.js';
import { stageRenderer } from './engine/stage_renderer.js';
import { announcerEngine } from './engine/announcer.js';
import { aiController } from './engine/ai.js';
import { p2pNetwork } from './network/p2p.js';

class CyberStrikerApp {
  constructor() {
    this.currentTab = 'skins';
    this.pedestalSkin = null;
    this.pedestalAction = 'idle';
    this.pedestalActionTimer = 0;
    this.pedestalTime = 0;
    this.pedestalAnimId = null;

    // 商城外觀正面全息預覽動畫
    this.shopPreviewAnimId = null;
    this.shopPreviewTime = 0;
    this.visibleShopCanvases = new Set();
    this.shopObserver = null;

    // 戰鬥狀態
    this.isFighting = false;
    this.matchMode = 'ai'; // 'ai', 'local_2p', 'p2p', 'training', 'arcade'
    this.aiDifficulty = 'normal';
    this.loadoutSelection = ['SK-01', 'SK-02', 'SK-03', 'SK-10', 'SK-11'];
    this.loadoutTimer = 15;
    this.loadoutInterval = null;

    // 雙人連線房間 (P2P Room) 狀態
    this.multiplayerRole = null; // 'host' (1P) 或 'guest' (2P)
    this.multiplayerRoomCode = null;
    this.multiplayerOpponentConnected = false;
    this.multiplayerMyReady = false;
    this.multiplayerOpponentReady = false;
    this.multiplayerOpponentData = null;
    this.multiplayerRoomFilter = 'all';
    this.isCountdownActive = false;
    this.countdownTimerId = null;
    this.networkP1Input = null;
    this.networkP2Input = null;
    this._isSimulatedOpponent = false;
    this._p2pMatchData = null;
    this.rematchRequestedByMe = false;
    this.rematchRequestedByOpponent = false;
    this.isMultiplayerMatchUnlocked = false;
    this.peerArenaLoaded = false;

    // 自訂技能槽位按鍵綁定 (預設 U, I, O, Y, H)
    let savedKeys = null;
    try {
      savedKeys = JSON.parse(localStorage.getItem('quantum_arena_skill_keys') || 'null');
    } catch (e) { savedKeys = null; }
    this.skillKeyBindings = (Array.isArray(savedKeys) && savedKeys.length === 5)
      ? savedKeys
      : ['KeyU', 'KeyI', 'KeyO', 'KeyY', 'KeyH'];

    // 我的最愛攻擊技能清單
    let savedFavs = null;
    try {
      savedFavs = JSON.parse(localStorage.getItem('quantum_arena_favorite_skills') || 'null');
    } catch (e) { savedFavs = null; }
    this.favoriteSkills = Array.isArray(savedFavs)
      ? savedFavs
      : ['SK-01', 'SK-02', 'SK-03', 'SK-10', 'SK-11'];

    // 主題戰鬥場景與單人街機闖關
    this.selectedStageId = 'random';
    this.currentStage = STAGES[0];
    this.arcadeMode = false;
    this.arcadeStage = 1;
    this.arcadeMaxStages = 5;
    this.arcadeScore = 0;
    this.arcadeStreakWins = 0;

    // 按鍵映射
    this.keys = {};
    this.mobileInputs = { x: 0, y: 0, punch: false, kick: false, guard: false, skill1: false, skill2: false, skill3: false, skill4: false, skill5: false, burst: false, superMove: false };

    // 畫布
    this.canvas = null;
    this.ctx = null;
    this.pedestalCanvas = null;
    this.pedestalCtx = null;
    this._battleLoopId = null;
  }

  init() {
    // 1. 初始化存檔與音效
    saveSystem.init();
    saveSystem.onSyncChange((state, msg) => {
      this.updateCloudSyncUI(state, msg);
    });
    this.pedestalSkin = this.getEquippedSkin();

    // 2. 畫布初始化
    this.canvas = document.getElementById('gameCanvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this._resizeCanvas();
      window.addEventListener('resize', () => this._resizeCanvas());
    }

    this.pedestalCanvas = document.getElementById('pedestalCanvas');
    if (this.pedestalCanvas) {
      this.pedestalCtx = this.pedestalCanvas.getContext('2d');
      this.pedestalCanvas.width = 400;
      this.pedestalCanvas.height = 360;
    }

    // 3. 綁定全域事件
    this._bindDOMEvents();
    this._bindKeyboardEvents();
    this._bindTouchEvents();

    // 4. 啟動開場載入動畫 (Splash Flow)
    this._startLoadingFlow();

    // 5. 啟動展示台渲染循環
    this._startPedestalLoop();

    // 6. 更新 UI 初始狀態
    this.updateUserHUD();
    this.renderSkinsInventory();
    this.renderShopCatalog();
  }

  _resizeCanvas() {
    if (!this.canvas) return;
    const dpr = Math.min(Math.max((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 1), 3);
    this.dpr = dpr;
    this.logicalWidth = window.innerWidth;
    this.logicalHeight = window.innerHeight;
    this.canvas.width = Math.round(window.innerWidth * dpr);
    this.canvas.height = Math.round(window.innerHeight * dpr);
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';

    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }

    // 戰鬥擂台寬度與高度全面自適應螢幕，無任何被擋住的不可抵達區域
    combatEngine.arenaWidth = window.innerWidth;
    const newFloorY = Math.max(380, Math.round(window.innerHeight - 130));
    combatEngine.floorY = newFloorY;
    if (combatEngine.updatePlatforms) {
      combatEngine.updatePlatforms(window.innerWidth, newFloorY);
    }

    if (combatEngine.p1 && combatEngine.p1.isGrounded && !combatEngine.p1.currentPlatform) combatEngine.p1.y = newFloorY;
    if (combatEngine.p2 && combatEngine.p2.isGrounded && !combatEngine.p2.currentPlatform) combatEngine.p2.y = newFloorY;
  }

  // ─── 開場前置載入動畫 ───
  _startLoadingFlow() {
    const splash = document.getElementById('splashScreen');
    const bar = document.getElementById('splashProgressBar');
    const text = document.getElementById('splashStatusText');
    if (!splash || !bar || !text) return;

    let progress = 0;
    const stages = [
      { p: 35, text: '正在初始化量子戰鬥引擎 (60 FPS Physical Engine)...' },
      { p: 75, text: '正在編譯 10 大核心技能矩陣數據庫...' },
      { p: 100, text: '正在連接全息裝備網絡與雲端資料庫...' }
    ];

    const interval = setInterval(() => {
      progress += 2;
      bar.style.width = progress + '%';

      if (progress < 35) text.textContent = stages[0].text;
      else if (progress < 75) text.textContent = stages[1].text;
      else text.textContent = stages[2].text;

      if (progress >= 100) {
        clearInterval(interval);
        splash.style.pointerEvents = 'none';
        soundEngine.playHit('burst');
        splash.style.opacity = '0';
        setTimeout(() => {
          splash.style.display = 'none';
          if (splash.parentNode) {
            splash.parentNode.removeChild(splash);
          }
        }, 350);
      }
    }, 25);
  }

  // ─── 大廳展示台 (Skeletal Real-Time Pedestal) ───
  _startPedestalLoop() {
    if (this.pedestalAnimId) {
      cancelAnimationFrame(this.pedestalAnimId);
      this.pedestalAnimId = null;
    }

    const render = () => {
      this.pedestalTime++;
      if (this.pedestalCanvas && this.pedestalCtx) {
        const ctx = this.pedestalCtx;
        const w = this.pedestalCanvas.width;
        const h = this.pedestalCanvas.height;
        ctx.clearRect(0, 0, w, h);

        const currentSkin = this.pedestalSkin || SKINS[0];

        // 1. 繪製全息光圈底座
        characterRenderer.drawPedestal(ctx, w / 2, h - 50, 90, currentSkin, this.pedestalTime);

        // 2. 處理預覽動作計時
        if (this.pedestalActionTimer > 0) {
          this.pedestalActionTimer--;
          if (this.pedestalActionTimer <= 0) {
            this.pedestalAction = 'idle';
          }
        }

        // 3. 繪製 2D 骨骼角色
        const dummyModel = {
          x: w / 2,
          y: h - 60,
          facing: 1,
          state: this.pedestalAction,
          stateTime: this.pedestalTime,
          skin: currentSkin,
          isGuarding: this.pedestalAction.includes('guard'),
          guardStance: 'high',
          invincibleTimer: 0
        };
        characterRenderer.draw(ctx, dummyModel);
      }
      this.pedestalAnimId = requestAnimationFrame(render);
    };
    this.pedestalAnimId = requestAnimationFrame(render);
  }

  previewPedestalAction(action) {
    this.pedestalAction = action;
    this.pedestalActionTimer = action === 'jump' ? 35 : 20;
    soundEngine.playHit(action === 'light_punch' ? 'punch' : (action === 'heavy_kick' ? 'kick' : (action === 'high_guard' ? 'guard' : (action === 'ranged_attack' ? 'projectile' : 'dp'))));
  }

  // ─── 商城卡片外觀正面即時渲染 (Shop Skin Preview Rendering) ───
  _renderSingleShopSkinCanvas(canvas, skin, time = 0, action = 'idle') {
    if (!canvas || !skin) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // 1. 全息光圈底座 (置於腳底)
    const cx = w / 2;
    const cy = h - 34;
    characterRenderer.drawPedestal(ctx, cx, cy, 54, skin, time);

    // 2. 正面人體骨骼外觀
    const dummyModel = {
      x: cx,
      y: h - 44,
      facing: 1,
      state: action,
      stateTime: time,
      skin: skin,
      isGuarding: action.includes('guard'),
      guardStance: 'high',
      invincibleTimer: 0
    };
    characterRenderer.draw(ctx, dummyModel);
  }

  _startShopPreviewLoop() {
    if (this.shopPreviewAnimId) {
      cancelAnimationFrame(this.shopPreviewAnimId);
      this.shopPreviewAnimId = null;
    }
    if (this.currentTab !== 'shop') return;

    const render = () => {
      this.shopPreviewTime++;
      const container = document.getElementById('shopGrid');
      if (container && this.currentTab === 'shop') {
        const canvases = (this.visibleShopCanvases && this.visibleShopCanvases.size > 0)
          ? Array.from(this.visibleShopCanvases)
          : Array.from(container.querySelectorAll('.shop-skin-canvas'));

        canvases.forEach(canvas => {
          const skinId = canvas.dataset.skinId;
          const skin = SKINS.find(s => s.id === skinId);
          if (skin) {
            let action = 'idle';
            if (canvas.dataset.actionTimer && Number(canvas.dataset.actionTimer) > 0) {
              const timer = Number(canvas.dataset.actionTimer) - 1;
              canvas.dataset.actionTimer = timer;
              action = canvas.dataset.action || 'light_punch';
            }
            this._renderSingleShopSkinCanvas(canvas, skin, this.shopPreviewTime, action);
          }
        });
      }
      if (this.currentTab === 'shop') {
        this.shopPreviewAnimId = requestAnimationFrame(render);
      } else {
        this.shopPreviewAnimId = null;
      }
    };
    this.shopPreviewAnimId = requestAnimationFrame(render);
  }

  _stopShopPreviewLoop() {
    if (this.shopPreviewAnimId) {
      cancelAnimationFrame(this.shopPreviewAnimId);
      this.shopPreviewAnimId = null;
    }
  }

  // ─── 畫面導航與分頁 ───
  switchTab(tabId) {
    this.currentTab = tabId;
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.toggle('active', view.id === `view_${tabId}`);
    });
    soundEngine.playUI('click');

    // 切換分頁時智慧調節展示台循環
    if (tabId === 'skins') {
      this._startPedestalLoop();
    } else if (tabId === 'shop') {
      this._startShopPreviewLoop();
    } else {
      this._stopShopPreviewLoop();
    }
  }

  updateUserHUD() {
    const u = saveSystem.currentUser;
    if (!u) return;

    // 頂部導航玩家資訊
    const nickEl = document.getElementById('userNickDisplay');
    const credEl = document.getElementById('userCreditsDisplay');
    const avatarEl = document.getElementById('userAvatarImg');
    const guestBadge = document.getElementById('guestStatusBadge');

    if (nickEl) nickEl.textContent = u.nickname;
    if (credEl) credEl.textContent = u.credits.toLocaleString();
    if (avatarEl) avatarEl.src = u.avatar;
    if (guestBadge) guestBadge.style.display = saveSystem.isGuest ? 'inline-block' : 'none';
    this.updateCloudSyncUI(saveSystem.syncState, saveSystem.lastSyncMessage);

    // 更新設定滑桿
    if (u.preferences) {
      soundEngine.setBgmVolume(u.preferences.bgmVol || 0.4);
      soundEngine.setSfxVolume(u.preferences.sfxVol || 0.8);
      combatEngine.enableHaptics = u.preferences.haptics !== false;
    }

    this.updateDailySupplyUI();
  }

  updateDailySupplyUI() {
    const claimRewardBtn = document.getElementById('dailyRewardClaimBtn');
    if (!claimRewardBtn) return;
    const canClaim = saveSystem.canClaimDailySupply();
    if (canClaim) {
      claimRewardBtn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
      claimRewardBtn.style.color = '#ffffff';
      claimRewardBtn.style.cursor = 'pointer';
      claimRewardBtn.style.opacity = '1';
      claimRewardBtn.style.border = 'none';
      claimRewardBtn.innerHTML = '<i class="fa-solid fa-gift"></i> 領取戰備補給 (+1,500 能量幣・每日限領一次)';
      claimRewardBtn.title = '點擊領取今日戰備補給 +1,500 能量幣';
    } else {
      const resetTime = saveSystem.getTimeUntilNextDailyReset();
      claimRewardBtn.style.background = '#374151';
      claimRewardBtn.style.color = '#9ca3af';
      claimRewardBtn.style.cursor = 'not-allowed';
      claimRewardBtn.style.opacity = '0.75';
      claimRewardBtn.style.border = '1px solid #4b5563';
      claimRewardBtn.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #10b981;"></i> 今日戰備補給已領取 (明日再來)';
      claimRewardBtn.title = `今日戰備補給已領取完畢！距離明日 00:00 重置還剩 ${resetTime}`;
    }
  }

  updateCloudSyncUI(state, message = '') {
    // 頂部導航狀態標籤
    const headerBadge = document.getElementById('cloudSyncHeaderBadge');
    if (headerBadge) {
      if (saveSystem.isGuest) {
        headerBadge.style.display = 'none';
      } else {
        headerBadge.style.display = 'inline-flex';
        if (state === 'syncing') {
          headerBadge.innerHTML = '<i class="fa-solid fa-rotate fa-spin" style="color: #ffd700;"></i> <span style="color: #ffd700;">同步中...</span>';
          headerBadge.title = message || '正在與全球雲端同步存檔';
        } else if (state === 'synced') {
          headerBadge.innerHTML = '<i class="fa-solid fa-cloud" style="color: #00f3ff;"></i> <span style="color: #00f3ff;">雲端同步</span>';
          headerBadge.title = message || '已連線至全球雲端伺服器 (進度跨電腦同步中)';
        } else if (state === 'error') {
          headerBadge.innerHTML = '<i class="fa-solid fa-cloud-slash" style="color: #ff007f;"></i> <span style="color: #ff007f;">本機快取</span>';
          headerBadge.title = message || '雲端連線受限，進度暫存於本機';
        } else {
          headerBadge.innerHTML = '<i class="fa-solid fa-cloud" style="color: #94a3b8;"></i> <span>雲端存檔</span>';
        }
      }
    }

    // Modal 內的同步狀態面板
    const modalIcon = document.getElementById('cloudSyncModalIcon');
    const modalTitle = document.getElementById('cloudSyncModalTitle');
    const modalDesc = document.getElementById('cloudSyncModalDesc');
    if (modalTitle) {
      if (saveSystem.isGuest) {
        if (modalIcon) modalIcon.innerHTML = '<i class="fa-solid fa-user-ninja" style="color: #ffd700;"></i>';
        modalTitle.textContent = '訪客模式：進度僅儲存於本機';
        modalTitle.style.color = '#ffd700';
        if (modalDesc) modalDesc.textContent = '輸入下方 Gmail 信箱即可升級為全球雲端帳號，跨電腦永不丟失！';
      } else if (state === 'syncing') {
        if (modalIcon) modalIcon.innerHTML = '<i class="fa-solid fa-rotate fa-spin" style="color: #ffd700;"></i>';
        modalTitle.textContent = '全球雲端存檔：正在雙向同步資料...';
        modalTitle.style.color = '#ffd700';
        if (modalDesc) modalDesc.textContent = message || '正在驗證跨電腦進度並合併最新外觀與金幣';
      } else if (state === 'synced') {
        if (modalIcon) modalIcon.innerHTML = '<i class="fa-solid fa-cloud-check" style="color: #00f3ff;"></i>';
        modalTitle.textContent = '全球雲端存檔服務：已同步最新紀錄 🟢';
        modalTitle.style.color = '#00f3ff';
        if (modalDesc) modalDesc.textContent = message || '在任何電腦登入此帳號，皆能自動接續遊玩！';
      } else if (state === 'error') {
        if (modalIcon) modalIcon.innerHTML = '<i class="fa-solid fa-cloud-slash" style="color: #ff007f;"></i>';
        modalTitle.textContent = '全球雲端存檔服務：連線暫時受限 🟡';
        modalTitle.style.color = '#ff007f';
        if (modalDesc) modalDesc.textContent = message || '已先儲存至本機，網路恢復時將自動補推至雲端。';
      } else {
        if (modalIcon) modalIcon.innerHTML = '<i class="fa-solid fa-cloud" style="color: #00f3ff;"></i>';
        modalTitle.textContent = '全球雲端存檔服務：已就緒';
        modalTitle.style.color = '#00f3ff';
        if (modalDesc) modalDesc.textContent = '登入同一個 Email 即可在任何電腦自動同步金幣、造型與戰績';
      }
    }
  }

  getEquippedSkin() {
    const u = saveSystem.currentUser;
    const skinId = u ? u.equippedSkin : 'skin_cyber_warrior';
    return SKINS.find(s => s.id === skinId) || SKINS[0];
  }

  // ─── 分頁一：我的外觀渲染 (只會出現玩家擁有的外觀) ───
  renderSkinsInventory() {
    const container = document.getElementById('skinsGrid');
    if (!container) return;

    const u = saveSystem.currentUser;
    const owned = u ? u.skins : ['skin_cyber_warrior'];
    const equipped = u ? u.equippedSkin : 'skin_cyber_warrior';

    // 嚴格篩選：只顯示玩家當前已擁有的造型
    const myOwnedSkins = SKINS.filter(s => owned.includes(s.id));

    if (myOwnedSkins.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #94a3b8;">
          <i class="fa-solid fa-box-open" style="font-size: 36px; margin-bottom: 12px; color: #00f3ff;"></i>
          <div>目前無解鎖外觀，請前往商店解鎖！</div>
        </div>
      `;
      return;
    }

    container.innerHTML = myOwnedSkins.map(s => {
      const isEquipped = equipped === s.id;

      let btnHtml = '';
      if (isEquipped) {
        btnHtml = `<button class="nav-tab-btn" style="border-color: #00ff66; color: #00ff66; width: 100%; justify-content: center; font-weight: 800;"><i class="fa-solid fa-check"></i> 戰鬥裝備中</button>`;
      } else {
        btnHtml = `<button class="nav-tab-btn equip-skin-btn" data-id="${s.id}" style="background: rgba(0, 243, 255, 0.18); border-color: #00f3ff; color: #00f3ff; width: 100%; justify-content: center; font-weight: 800;"><i class="fa-solid fa-shield"></i> 裝備此造型</button>`;
      }

      return `
        <div class="skin-card ${isEquipped ? 'equipped' : ''}" data-id="${s.id}" style="cursor: pointer;">
          <div class="skin-header">
            <div>
              <div class="skin-name" style="color: ${s.themeColor}">${s.name}</div>
              <div style="font-size: 11px; color: #94a3b8;">${s.title}</div>
            </div>
            <span class="skin-tag" style="border: 1px solid ${s.themeColor}; color: ${s.themeColor}">${s.isDefault ? '初始預設' : (s.category === 'shop' ? '已擁有' : '限定外觀')}</span>
          </div>
          <div class="skin-desc">${s.desc}</div>
          <div class="skin-vfx-box">
            <div><strong>⚡ 普攻光軌：</strong>${s.vfx.punchTrail}</div>
            <div><strong>🔥 技能特效：</strong>${s.vfx.sk1}</div>
          </div>
          ${btnHtml}
        </div>
      `;
    }).join('');

    // 綁定卡片點擊預覽與裝備
    container.querySelectorAll('.skin-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = card.dataset.id;
        const skinObj = SKINS.find(s => s.id === id);
        if (skinObj) {
          this.pedestalSkin = skinObj;
          soundEngine.playUI('hover');
        }
      });
    });

    container.querySelectorAll('.equip-skin-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        saveSystem.equipSkin(id);
        this.pedestalSkin = this.getEquippedSkin();
        soundEngine.playUI('equip');
        this.renderSkinsInventory();
        this.updateUserHUD();
      });
    });
  }

  // ─── 分頁二：商店渲染 ───
  renderShopCatalog(filterSeries = 'all') {
    const container = document.getElementById('shopGrid');
    if (!container) return;

    const u = saveSystem.currentUser;
    const owned = u ? u.skins : [];

    let forSaleSkins = SKINS.filter(s => s.price > 0);
    if (filterSeries && filterSeries !== 'all') {
      forSaleSkins = forSaleSkins.filter(s => s.series === filterSeries);
    }

    container.innerHTML = forSaleSkins.map(s => {
      const isOwned = owned.includes(s.id);
      const isMarvel = s.series === '漫威宇宙';
      const isDB = s.series === '七龍珠超';
      const isBrawl = s.series === '荒野亂鬥';

      return `
        <div class="skin-card">
          <div class="skin-header">
            <div>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
                ${isBrawl ? '<span style="font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 4px; background: rgba(168,85,247,0.2); color: #d8b4fe; border: 1px solid #a855f7;">🌵 荒野亂鬥</span>' : ''}
                ${isMarvel ? '<span style="font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 4px; background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid #ef4444;">🦸 漫威宇宙</span>' : ''}
                ${isDB ? '<span style="font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 4px; background: rgba(234,179,8,0.2); color: #fde047; border: 1px solid #eab308;">🐉 七龍珠超</span>' : ''}
                <span class="skin-name" style="color: ${s.themeColor}">${s.name}</span>
              </div>
              <div style="font-size: 11px; color: #94a3b8;">${s.title} | ${s.series || '戰術外裝'}</div>
            </div>
            <span class="stat-capsule" style="font-size: 13px; font-weight: 800; color: #ffd700; border-color: #ffd700;">🪙 ${s.price.toLocaleString()}</span>
          </div>
          <div class="skin-desc">${s.desc}</div>
          <div class="skin-vfx-box">
            <div><strong>⚡ 專屬光軌：</strong>${s.vfx.punchTrail}</div>
            <div><strong>🛡️ 專屬護盾：</strong>${s.vfx.guardShield}</div>
          </div>
          <div style="font-size: 11px; color: #64748b;">🎨 官方經典還原：${s.creator || '官方經典'}</div>
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <button class="nav-tab-btn try-on-btn" data-id="${s.id}" style="flex: 1; justify-content: center; border-color: ${s.themeColor}; color: ${s.themeColor}">
              <i class="fa-solid fa-eye"></i> 試穿演示
            </button>
            ${isOwned ? `
              <button class="nav-tab-btn" disabled style="flex: 1; justify-content: center; color: #10b981; border-color: #10b981; font-weight: bold; background: rgba(16, 185, 129, 0.1);">
                <i class="fa-solid fa-check"></i> 已擁有
              </button>
            ` : `
              <button class="nav-tab-btn buy-skin-btn" data-id="${s.id}" data-price="${s.price}" style="flex: 1; justify-content: center; background: linear-gradient(135deg, #00f3ff, #ff007f); color: #fff; font-weight: 800; box-shadow: 0 0 10px rgba(0,243,255,0.4);">
                <i class="fa-solid fa-cart-shopping"></i> 購買 (🪙 ${s.price.toLocaleString()})
              </button>
            `}
          </div>
          <!-- 最下方：直接出現該角色的正面外觀展示台 (免去切換分頁滑動繁瑣操作) -->
          <div class="shop-skin-preview-wrap" style="margin-top: 10px; background: rgba(4, 7, 18, 0.92); border: 1.5px solid ${s.themeColor}55; border-radius: 8px; overflow: hidden; position: relative; box-shadow: inset 0 0 18px rgba(0,0,0,0.85);">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.06);">
              <span style="font-size: 11px; font-weight: 800; color: ${s.themeColor}; display: flex; align-items: center; gap: 5px;">
                <i class="fa-solid fa-user-shield"></i> ${s.name} 正面全息外觀
              </span>
              <span style="font-size: 9px; color: #94a3b8; font-family: 'Orbitron', monospace; letter-spacing: 0.5px;">LIVE PREVIEW</span>
            </div>
            <div style="position: relative; width: 100%; height: 200px; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 50% 85%, ${s.themeColor}18 0%, rgba(3, 7, 18, 0.98) 75%);">
              <canvas class="shop-skin-canvas" data-skin-id="${s.id}" width="260" height="200" style="width: 100%; max-width: 260px; height: 200px; display: block; border-radius: 6px; cursor: pointer;" title="點擊或滑鼠移入可展示微型即時武打動作"></canvas>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.try-on-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const skinObj = SKINS.find(s => s.id === id);
        if (skinObj) {
          this.pedestalSkin = skinObj;
          this.switchTab('skins');
          soundEngine.playUI('equip');

          // 1. 確保大廳展示台動畫處於運行狀態
          this._startPedestalLoop();

          // 2. 即時讓大廳展示台角色做出武打展示動作
          this.previewPedestalAction('light_punch');

          // 3. 自動平滑滾動至大廳展示台 (徹底解決按完商店後還要往下滑尋找的問題)
          setTimeout(() => {
            const arena = document.querySelector('.preview-arena-panel') || document.getElementById('pedestalCanvas');
            if (arena) {
              arena.scrollIntoView({ behavior: 'smooth', block: 'center' });
              arena.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
              arena.style.boxShadow = `0 0 35px ${skinObj.themeColor}`;
              setTimeout(() => {
                arena.style.boxShadow = '';
              }, 1200);
            }
          }, 60);
        }
      });
    });

    // 立即靜態渲染所有商品之正面全息外觀 (Frame 0 即時成像，零等待零延遲)
    const canvases = container.querySelectorAll('.shop-skin-canvas');
    canvases.forEach(canvas => {
      const skinId = canvas.dataset.skinId;
      const skin = SKINS.find(s => s.id === skinId);
      if (skin) {
        this._renderSingleShopSkinCanvas(canvas, skin, 0, 'idle');
      }

      // 互動微動態：移入輕拳、點擊重踢
      canvas.onmouseenter = () => {
        canvas.dataset.action = 'light_punch';
        canvas.dataset.actionTimer = '24';
        soundEngine.playHit('punch');
      };
      canvas.onclick = () => {
        canvas.dataset.action = 'heavy_kick';
        canvas.dataset.actionTimer = '28';
        soundEngine.playHit('kick');
      };
    });

    // 設置高效視窗觀察器 (IntersectionObserver)，僅針對當前可見的商品卡片進行動態全息動畫更新，滾動極致順暢無負擔
    if ('IntersectionObserver' in window) {
      if (this.shopObserver) {
        this.shopObserver.disconnect();
      }
      this.visibleShopCanvases = new Set();
      this.shopObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.visibleShopCanvases.add(entry.target);
          } else {
            this.visibleShopCanvases.delete(entry.target);
          }
        });
      }, { rootMargin: '80px' });

      canvases.forEach(cvs => this.shopObserver.observe(cvs));
    }

    // 若當前在商城分頁，啟動商城全息動畫循環
    if (this.currentTab === 'shop') {
      this._startShopPreviewLoop();
    }

    container.querySelectorAll('.buy-skin-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const price = parseInt(btn.dataset.price, 10);
        const skinObj = SKINS.find(s => s.id === id);
        const skinName = skinObj ? skinObj.name : '造型';
        const res = saveSystem.purchaseSkin(id, price);
        if (res.success) {
          soundEngine.playUI('equip');
          this.pedestalSkin = this.getEquippedSkin();
          alert(`🎉 恭喜成功購買解鎖【${skinName}】！已直接為您出戰裝備，可前往「我的外觀」查看！`);
          this.renderShopCatalog(filterSeries);
          this.renderSkinsInventory();
          this.updateUserHUD();
        } else {
          soundEngine.playHit('guard');
          alert(`購買失敗：${res.reason}`);
        }
      });
    });
  }

  // ─── 量子身分授權儀 (Authentication Gateway) ───
  openAuthModal() {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.classList.add('active');

    this.renderRegisteredAccounts();
    this.updateCloudSyncUI(saveSystem.syncState, saveSystem.lastSyncMessage);
  }

  renderRegisteredAccounts() {
    // 渲染本機已登記 Google 帳號清單 (多帳號切換體驗)
    const listContainer = document.getElementById('googleAccountsList');
    if (listContainer) {
      const accounts = saveSystem.getRegisteredAccountsList();
      listContainer.innerHTML = accounts.map(acc => `
        <div class="google-account-card ${acc.isCurrent ? 'current' : ''}" style="background: rgba(255,255,255,0.04); border: 1px solid ${acc.isCurrent ? '#00f3ff' : 'rgba(255,255,255,0.1)'}; border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${acc.avatar}" style="width: 36px; height: 36px; border-radius: 50%; border: 2px solid #00f3ff;">
            <div>
              <div style="font-weight: 800; font-size: 14px;">${acc.nickname} ${acc.isCurrent ? '<span style="color:#00f3ff; font-size: 11px;">(當前使用)</span>' : ''}</div>
              <div style="font-size: 12px; color: #94a3b8;">${acc.email}</div>
            </div>
          </div>
          <button class="nav-tab-btn switch-acc-btn" data-email="${acc.email}" style="padding: 6px 12px; font-size: 12px; border-color: #00f3ff; color: #00f3ff;">
            一鍵切換
          </button>
        </div>
      `).join('');

      listContainer.querySelectorAll('.switch-acc-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const email = btn.dataset.email;
          btn.disabled = true;
          btn.textContent = '切換中...';
          await saveSystem.switchAccount(email);
          this.updateUserHUD();
          this.renderSkinsInventory();
          this.renderShopCatalog();
          this.closeAuthModal();
          soundEngine.playUI('equip');
        });
      });
    }
  }

  closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.remove('active');
  }

  // ─── 模式選擇視窗 (Mode Select Modal) ───
  openModeSelectModal() {
    const modal = document.getElementById('modeSelectModal');
    if (!modal) return;
    modal.classList.add('active');
    soundEngine.playUI('click');
  }

  closeModeSelectModal() {
    const modal = document.getElementById('modeSelectModal');
    if (modal) modal.classList.remove('active');
  }

  // ─── 賽前戰術武器與技能配置視窗 (30 款純攻擊自由挑選 5 項・無時間限制) ───
  openLoadoutModal(startMatchCallback) {
    const modal = document.getElementById('loadoutModal');
    if (!modal) return;
    modal.classList.add('active');

    // 暫停背景展示台動畫以節省 CPU/GPU 確保滾動完全順暢
    if (this.pedestalAnimId) {
      cancelAnimationFrame(this.pedestalAnimId);
      this.pedestalAnimId = null;
    }

    // 清除舊倒數 (若有)
    if (this.loadoutInterval) {
      clearInterval(this.loadoutInterval);
      this.loadoutInterval = null;
    }

    // 優先還原玩家上次選用的武裝配置 (LocalStorage 或 雲端存檔)
    let savedLoadout = null;
    try {
      const raw = localStorage.getItem('quantum_arena_last_loadout');
      if (raw) savedLoadout = JSON.parse(raw);
    } catch (e) {}

    const u = saveSystem.currentUser;
    if (Array.isArray(savedLoadout) && savedLoadout.length > 0) {
      this.loadoutSelection = [...savedLoadout];
    } else if (u && Array.isArray(u.loadout) && u.loadout.length > 0) {
      this.loadoutSelection = [...u.loadout];
    } else {
      this.loadoutSelection = ['SK-01', 'SK-02', 'SK-03', 'SK-10', 'SK-11'];
    }

    // 確保所有選定之技能 ID 均存在於 SKILLS 且不重複
    this.loadoutSelection = this.loadoutSelection.filter(id => SKILLS.some(s => s.id === id));
    while (this.loadoutSelection.length < 5) {
      const fallback = SKILLS.find(s => !this.loadoutSelection.includes(s.id)) || SKILLS[0];
      this.loadoutSelection.push(fallback.id);
    }

    this.loadoutFilter = this.loadoutFilter || 'all';
    this._updateFavCountBadge();

    // 綁定武裝分類篩選標籤 (我的最愛 / 全部武裝 / 遠程武器庫 / 近戰格鬥武藝)
    document.querySelectorAll('.loadout-filter-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.loadout-filter-btn').forEach(b => {
          b.classList.remove('active');
          b.style.background = 'transparent';
        });
        btn.classList.add('active');
        btn.style.background = 'rgba(255,255,255,0.1)';
        this.loadoutFilter = btn.dataset.filter || 'all';
        this._renderLoadoutSkillsGrid();
        soundEngine.playUI('click');
      };
    });

    this._renderLoadoutSlotsBar();
    this._renderLoadoutSkillsGrid();

    // 綁定六大戰術流派快捷按鈕
    document.querySelectorAll('.archetype-btn').forEach(btn => {
      btn.onclick = () => {
        const archId = btn.dataset.arch;
        const arch = ARCHETYPES.find(a => a.id === archId);
        if (arch) {
          this.loadoutSelection = [...arch.skills];
          localStorage.setItem('quantum_arena_last_loadout', JSON.stringify(this.loadoutSelection));
          saveSystem.updateLoadout(this.loadoutSelection);
          this._renderLoadoutSlotsBar();
          this._renderLoadoutSkillsGrid();
          soundEngine.playUI('click');
        }
      };
    });

    // 確認按鈕 (點擊後才開戰，完全無時間限制)
    const confirmBtn = document.getElementById('confirmLoadoutBtn');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        this._confirmLoadout(startMatchCallback);
      };
    }
  }

  isFavoriteSkill(id) {
    return this.favoriteSkills && this.favoriteSkills.includes(id);
  }

  toggleFavoriteSkill(id) {
    if (this.favoriteSkills.includes(id)) {
      this.favoriteSkills = this.favoriteSkills.filter(x => x !== id);
    } else {
      this.favoriteSkills.push(id);
    }
    localStorage.setItem('quantum_arena_favorite_skills', JSON.stringify(this.favoriteSkills));
    this._updateFavCountBadge();
    this._renderLoadoutSkillsGrid();
    soundEngine.playUI('click');
  }

  _updateFavCountBadge() {
    const el = document.getElementById('favCountBadge');
    if (el) el.textContent = this.favoriteSkills ? this.favoriteSkills.length : 0;
  }

  getSkillKeyDisplayName(idx) {
    const code = (this.skillKeyBindings && this.skillKeyBindings[idx]) || ['KeyU', 'KeyI', 'KeyO', 'KeyY', 'KeyH'][idx];
    if (!code) return `K${idx + 1}`;
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    if (code.startsWith('Numpad')) return 'Num' + code.slice(6);
    return code;
  }

  _renderLoadoutSlotsBar() {
    const container = document.getElementById('loadoutSlotsContainer');
    const countEl = document.getElementById('loadoutSelectedCount');
    if (countEl) countEl.textContent = `已選擇 ${this.loadoutSelection.length} / 5 招`;
    if (!container) return;

    container.innerHTML = [0, 1, 2, 3, 4].map(slotIdx => {
      const skillId = this.loadoutSelection[slotIdx];
      const sk = SKILLS.find(s => s.id === skillId);
      const keyDisplay = this.getSkillKeyDisplayName(slotIdx);

      if (!sk) {
        return `
          <div class="loadout-slot-card" style="border-style: dashed; opacity: 0.6;">
            <span style="font-size: 10px; color: #94a3b8;">槽位 ${slotIdx + 1}</span>
            <span style="font-size: 11px; color: #64748b;">(未選定)</span>
          </div>
        `;
      }

      return `
        <div class="loadout-slot-card active" style="border-color: ${sk.color};">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <span style="font-size: 10px; color: #00f3ff; font-weight: 800;">槽位 ${slotIdx + 1}</span>
            <span class="loadout-slot-key-badge" data-slot="${slotIdx}" title="點擊自訂按鍵綁定">[ ${keyDisplay} ]</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; margin-top: 2px;">
            <i class="${sk.icon}" style="color: ${sk.color}; font-size: 13px;"></i>
            <strong style="color: #fff; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90px;">${sk.name}</strong>
          </div>
        </div>
      `;
    }).join('');

    // 綁定點擊按鍵標籤修改按鍵事件
    container.querySelectorAll('.loadout-slot-key-badge').forEach(badge => {
      badge.onclick = (e) => {
        e.stopPropagation();
        const slot = parseInt(badge.dataset.slot, 10);
        badge.textContent = '[ 請按鍵... ]';
        badge.style.background = '#ff007f';
        badge.style.color = '#fff';

        const onKeyDown = (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          window.removeEventListener('keydown', onKeyDown, true);
          if (evt.key === 'Escape') {
            this._renderLoadoutSlotsBar();
            return;
          }
          this.skillKeyBindings[slot] = evt.code;
          localStorage.setItem('quantum_arena_skill_keys', JSON.stringify(this.skillKeyBindings));
          soundEngine.playUI('click');
          this._renderLoadoutSlotsBar();
          this._renderLoadoutSkillsGrid();
        };
        window.addEventListener('keydown', onKeyDown, { capture: true, once: true });
      };
    });
  }

  _renderLoadoutSkillsGrid() {
    const container = document.getElementById('loadoutSkillsGrid');
    if (!container) return;

    const filter = this.loadoutFilter || 'all';
    let displayedSkills = SKILLS;
    if (filter === 'favorites') {
      displayedSkills = SKILLS.filter(sk => this.isFavoriteSkill(sk.id));
    } else if (filter === 'ranged') {
      displayedSkills = SKILLS.filter(sk => sk.category === 'ranged');
    } else if (filter === 'melee') {
      displayedSkills = SKILLS.filter(sk => sk.category === 'melee');
    }

    if (filter === 'favorites' && displayedSkills.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 45px 15px; color: #94a3b8;">
          <div style="font-size: 42px; color: #ffd700; margin-bottom: 10px; animation: pulse-event 1.8s infinite;">★</div>
          <strong style="color: #fff; font-size: 16px;">目前「我的最愛」尚無收藏招式！</strong>
          <p style="font-size: 13px; color: #64748b; margin-top: 6px;">點擊任意技能卡片右上角的 ⭐ 星號，即可將您偏好的攻擊加入我的最愛，快速出戰選用！</p>
        </div>
      `;
      return;
    }

    container.innerHTML = displayedSkills.map(sk => {
      const isSelected = this.loadoutSelection.includes(sk.id);
      const slotIndex = this.loadoutSelection.indexOf(sk.id);
      const keyDisplay = slotIndex >= 0 ? `[${this.getSkillKeyDisplayName(slotIndex)}]` : '';
      const slotLabel = slotIndex >= 0 ? `槽位 ${slotIndex + 1}` : '';
      const isRanged = sk.category === 'ranged';
      const isFav = this.isFavoriteSkill(sk.id);

      return `
        <div class="skill-card ${isSelected ? 'selected' : ''}" data-id="${sk.id}" style="background: rgba(255,255,255,0.03); border: 1.5px solid ${isSelected ? '#00f3ff' : 'rgba(255,255,255,0.1)'}; border-radius: 8px; padding: 10px; cursor: pointer; position: relative; transition: border-color 0.12s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; background: ${isRanged ? 'rgba(56,189,248,0.2)' : 'rgba(244,63,94,0.2)'}; color: ${isRanged ? '#38bdf8' : '#fb7185'}; border: 1px solid ${isRanged ? '#38bdf8' : '#fb7185'};">
                ${isRanged ? '🏹 遠程神兵' : '⚔️ 近戰武藝'}
              </span>
              <span style="font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 4px; background: ${sk.tierColor}26; color: ${sk.tierColor}; border: 1px solid ${sk.tierColor};">
                ${sk.tierBadge || sk.tierName}
              </span>
              <strong style="color: ${sk.color}; font-size: 13px;"><i class="${sk.icon}"></i> ${sk.name}</strong>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <button class="fav-star-btn ${isFav ? 'active' : ''}" data-fav-id="${sk.id}" title="${isFav ? '移出我的最愛' : '加入我的最愛'}">
                <i class="fa-${isFav ? 'solid' : 'regular'} fa-star"></i>
              </button>
              <span class="skill-slot-badge-wrap">${isSelected ? `<span style="background: #00f3ff; color: #000; font-size: 10px; font-weight: 900; padding: 1px 6px; border-radius: 4px; box-shadow: 0 0 8px rgba(0,243,255,0.6);">${slotLabel} ${keyDisplay}</span>` : ''}</span>
            </div>
          </div>
          <div style="font-size: 11px; color: #94a3b8; font-weight: 600;">${sk.typeName} | 傷害 ${sk.damage} | CD ${sk.cd}s</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px; line-height: 1.35;">${sk.description}</div>
        </div>
      `;
    }).join('');

    // 綁定卡片點選與我的最愛星號點擊
    container.querySelectorAll('.skill-card').forEach(card => {
      const id = card.dataset.id;
      const starBtn = card.querySelector('.fav-star-btn');
      if (starBtn) {
        starBtn.onclick = (e) => {
          e.stopPropagation();
          this.toggleFavoriteSkill(id);
        };
      }

      card.addEventListener('click', () => {
        if (this.loadoutSelection.includes(id)) {
          if (this.loadoutSelection.length > 1) {
            this.loadoutSelection = this.loadoutSelection.filter(s => s !== id);
          }
        } else {
          if (this.loadoutSelection.length < 5) {
            this.loadoutSelection.push(id);
          } else {
            this.loadoutSelection.shift();
            this.loadoutSelection.push(id);
          }
        }
        soundEngine.playUI('click');
        localStorage.setItem('quantum_arena_last_loadout', JSON.stringify(this.loadoutSelection));
        saveSystem.updateLoadout(this.loadoutSelection);
        this._renderLoadoutSlotsBar();
        this._updateLoadoutCardVisuals();
      });
    });
  }

  _updateLoadoutCardVisuals() {
    const container = document.getElementById('loadoutSkillsGrid');
    if (!container) return;

    container.querySelectorAll('.skill-card').forEach(card => {
      const id = card.dataset.id;
      const isSelected = this.loadoutSelection.includes(id);
      const slotIndex = this.loadoutSelection.indexOf(id);
      const keyDisplay = slotIndex >= 0 ? `[${this.getSkillKeyDisplayName(slotIndex)}]` : '';
      const slotLabel = slotIndex >= 0 ? `槽位 ${slotIndex + 1}` : '';

      card.classList.toggle('selected', isSelected);
      card.style.borderColor = isSelected ? '#00f3ff' : 'rgba(255,255,255,0.1)';

      const badgeWrap = card.querySelector('.skill-slot-badge-wrap');
      if (badgeWrap) {
        if (isSelected) {
          badgeWrap.innerHTML = `<span style="background: #00f3ff; color: #000; font-size: 10px; font-weight: 900; padding: 1px 6px; border-radius: 4px; box-shadow: 0 0 8px rgba(0,243,255,0.6);">${slotLabel} ${keyDisplay}</span>`;
        } else {
          badgeWrap.innerHTML = '';
        }
      }
    });
  }

  _confirmLoadout(callback) {
    const modal = document.getElementById('loadoutModal');
    if (modal) modal.classList.remove('active');
    localStorage.setItem('quantum_arena_last_loadout', JSON.stringify(this.loadoutSelection));
    saveSystem.updateLoadout(this.loadoutSelection);
    if (!this.isFighting && this.currentTab === 'skins') {
      this._startPedestalLoop();
    } else if (!this.isFighting && this.currentTab === 'shop') {
      this._startShopPreviewLoop();
    }
    if (callback) callback();
  }

  // ─── 進入對戰系統 ───
  startBattle(mode = 'ai', diff = 'normal') {
    this.matchMode = mode;
    this.aiDifficulty = diff;
    aiController.setDifficulty(diff);

    // 主題場景挑選 (隨機或指定)
    if (this.selectedStageId === 'random') {
      this.currentStage = getRandomStage();
    } else {
      this.currentStage = getStageById(this.selectedStageId);
    }

    this.openLoadoutModal(() => {
      this._launchMatch();
    });
  }

  startArcadeMode() {
    this.arcadeMode = true;
    this.arcadeStage = 1;
    this.arcadeScore = 0;
    this.arcadeStreakWins = 0;
    this.startBattle('arcade', 'normal');
  }

  nextArcadeStage() {
    const endModal = document.getElementById('matchEndModal');
    if (endModal) endModal.classList.remove('active');
    this.arcadeStage++;
    this._launchMatch();
  }

  _launchMatch() {
    if (this._battleLoopId) {
      cancelAnimationFrame(this._battleLoopId);
      this._battleLoopId = null;
    }
    const battleScreen = document.getElementById('battleScreen');
    if (battleScreen) battleScreen.classList.add('active');
    document.body.classList.add('in-battle');
    const fab = document.getElementById('fabStartBtn');
    if (fab) {
      fab.style.display = 'none';
      fab.style.pointerEvents = 'none';
    }
    const victoryOverlay = document.getElementById('battleVictoryOverlay');
    if (victoryOverlay) victoryOverlay.style.display = 'none';

    let p1Skin = this.getEquippedSkin();
    let p2Skin = SKINS[1]; // 預設對手
    let p2Name = `AI (${this.aiDifficulty.toUpperCase()})`;
    let p2Diff = this.aiDifficulty;

    const arcadeBadge = document.getElementById('arcadeStageBadge');

    if (this.matchMode === 'arcade') {
      if (arcadeBadge) {
        arcadeBadge.style.display = 'block';
        arcadeBadge.innerHTML = `<i class="fa-solid fa-trophy"></i> STAGE ${this.arcadeStage} / ${this.arcadeMaxStages}`;
      }

      // 5 大關卡對手與經典主題場景規劃
      if (this.arcadeStage === 1) {
        p2Skin = SKINS.find(s => s.id === 'skin_spiderman') || SKINS[1];
        p2Name = '第 1 關：彼得帕克・蜘蛛人';
        p2Diff = 'normal';
        this.currentStage = getStageById('stage_stark_tower');
      } else if (this.arcadeStage === 2) {
        p2Skin = SKINS.find(s => s.id === 'skin_piccolo') || SKINS[2];
        p2Name = '第 2 關：魔族大師・比克';
        p2Diff = 'hard';
        this.currentStage = getStageById('stage_namek');
      } else if (this.arcadeStage === 3) {
        p2Skin = SKINS.find(s => s.id === 'skin_trunks_future') || SKINS[3];
        p2Name = '第 3 關：未來希望・特南克斯';
        p2Diff = 'hard';
        this.currentStage = getStageById('stage_tenkaichi');
      } else if (this.arcadeStage === 4) {
        p2Skin = SKINS.find(s => s.id === 'skin_vegeta_ssj') || SKINS[4];
        p2Name = '第 4 關：賽亞人王子・達爾';
        p2Diff = 'nightmare';
        this.currentStage = getStageById('stage_cyber_matrix');
      } else {
        p2Skin = SKINS.find(s => s.id === 'skin_thanos') || SKINS.find(s => s.id === 'skin_omega_emperor') || SKINS[5];
        p2Name = '👑 最終魔王：宇宙霸主・薩諾斯';
        p2Diff = 'nightmare';
        this.currentStage = getStageById('stage_stark_tower');
      }
      this.aiDifficulty = p2Diff;
      aiController.setDifficulty(p2Diff);
    } else if (this.matchMode === 'p2p' && this._p2pMatchData) {
      if (arcadeBadge) arcadeBadge.style.display = 'none';
      p1Skin = this._p2pMatchData.p1Data.skin;
      p2Skin = this._p2pMatchData.p2Data.skin;
      p2Name = this._p2pMatchData.p2Data.name;
    } else {
      if (arcadeBadge) arcadeBadge.style.display = 'none';
      if (this.aiDifficulty === 'hard') p2Skin = SKINS[2];
      if (this.aiDifficulty === 'nightmare') p2Skin = SKINS[4];
      if (this.matchMode === 'training') p2Name = '練習木樁假人';
      else if (this.matchMode === 'local_2p') p2Name = 'Player 2';
    }

    const isAiOpponent = this.matchMode === 'p2p'
      ? false
      : (this.matchMode === 'ai' || this.matchMode === 'arcade' || this.matchMode === 'training');

    // AI 武器抽取機制：依據難度（簡單、普通、困難、噩夢），從對應強度的武器庫中隨機抽取 3 把神兵武器
    let p2Loadout = ['SK-01', 'SK-02', 'SK-06'];
    if (isAiOpponent) {
      p2Loadout = getRandomAiWeapons(p2Diff, 3);
    }

    const p1Data = (this.matchMode === 'p2p' && this._p2pMatchData)
      ? { ...this._p2pMatchData.p1Data, isAi: false }
      : {
          name: saveSystem.currentUser ? saveSystem.currentUser.nickname : 'Player 1',
          skin: p1Skin,
          isAi: false,
          loadout: this.loadoutSelection
        };

    const p2Data = (this.matchMode === 'p2p' && this._p2pMatchData)
      ? { ...this._p2pMatchData.p2Data, isAi: false }
      : {
          name: p2Name,
          skin: p2Skin,
          isAi: isAiOpponent,
          loadout: p2Loadout
        };

    // 戰鬥前確保畫布尺寸與擂台邊界自適應當前螢幕
    this._resizeCanvas();
    this.matchEndTimer = 0;
    this._lastFrameTime = 0;
    this._timeAccumulator = 0;

    combatEngine.initMatch(p1Data, p2Data, this.matchMode === 'training');

    // 開局提示 AI 本場隨機抽取的 3 把神兵武器 (僅單人對戰 AI / 街機模式觸發)
    if (isAiOpponent && combatEngine.p2 && Array.isArray(combatEngine.p2.skills)) {
      const drawnNames = combatEngine.p2.skills.map(s => `【${s.name}】`).join(' ');
      const tierObj = TIER_CONFIG[p2Diff] || TIER_CONFIG.normal;
      setTimeout(() => {
        combatEngine.floatingTexts.push({
          text: `⚡ AI (${tierObj.name}) 隨機抽選 3 把神兵：${drawnNames}`,
          x: combatEngine.arenaWidth / 2,
          y: combatEngine.floorY - 140,
          color: tierObj.color,
          duration: 130,
          vy: -0.35,
          fontSize: 14
        });
      }, 400);
    }

    // 多人連線即時 K.O.、瞬移、主動技能施放與權威傷害廣播回調
    if (this.matchMode === 'p2p') {
      this._p2pSyncTimer = 0;
      this.isMultiplayerMatchUnlocked = false;

      // 1. 瞬移即時廣播 (傳送棒 SK-06 瞬移到位同步)
      combatEngine.onTeleportCallback = (charId, toX, toY, facing) => {
        const localCharId = this.multiplayerRole === 'host' ? 'p1' : 'p2';
        if (charId === localCharId && p2pNetwork.isConnected) {
          p2pNetwork.send({
            type: 'teleport_warp',
            charId,
            x: toX,
            y: toY,
            facing
          });
        }
      };

      // 2. 技能主動施放即時廣播 (保證遠程彈道/大招0延遲同步觸發，絕不遺漏單幀輸入)
      combatEngine.onSkillCastCallback = (charId, slotIdx, skillId) => {
        const localCharId = this.multiplayerRole === 'host' ? 'p1' : 'p2';
        if (charId === localCharId && p2pNetwork.isConnected) {
          p2pNetwork.send({
            type: 'skill_cast',
            charId,
            slotIdx,
            skillId
          });
        }
      };

      // 3. 權威打擊命中即時廣播 (傷害、特效、頓幀、震屏在兩端完全同幀呈現)
      combatEngine.onHitCallback = (hitData) => {
        if (p2pNetwork.isConnected && this.multiplayerRole === 'host') {
          p2pNetwork.send({
            type: 'battle_hit_impact',
            ...hitData
          });
        }
      };

      combatEngine.onKOCallback = (winner, p1Hp, p2Hp) => {
        if (p2pNetwork.isConnected) {
          p2pNetwork.send({
            type: 'battle_ko',
            winner: winner,
            p1Hp: Math.round(p1Hp),
            p2Hp: Math.round(p2Hp)
          });
        }
      };

      combatEngine.onDamageCallback = (targetId, damage, newHp) => {
        if (p2pNetwork.isConnected) {
          p2pNetwork.send({
            type: 'battle_damage',
            target: targetId,
            damage: damage,
            p1Hp: Math.round(combatEngine.p1.hp),
            p2Hp: Math.round(combatEngine.p2.hp),
            isLethal: newHp <= 0
          });
        }
      };

      // 雙方同時開戰鎖步握手 (Lockstep Simultaneous Start)
      if (this.multiplayerRole === 'guest') {
        if (p2pNetwork.isConnected) {
          p2pNetwork.send({ type: 'arena_ready' });
        }
      } else if (this.multiplayerRole === 'host') {
        const unlockBoth = () => {
          if (this.isMultiplayerMatchUnlocked) return;
          this.isMultiplayerMatchUnlocked = true;
          soundEngine.playUI('fight');
          if (p2pNetwork.isConnected) {
            p2pNetwork.send({ type: 'battle_unlock' });
          }
        };

        if (this.peerArenaLoaded) {
          unlockBoth();
        } else {
          // 最多等待 350ms 即自動解鎖，確保兩端同步解鎖
          this._unlockSafetyTimer = setTimeout(() => {
            unlockBoth();
          }, 350);
        }
      }
    } else {
      this.isMultiplayerMatchUnlocked = true;
    }

    // 街機闖關第 2~5 關生命值恢復機制 (+350 HP 獎勵)
    if (this.matchMode === 'arcade' && this.arcadeStage > 1) {
      combatEngine.p1.hp = Math.min(combatEngine.p1.maxHp, 650 + 350);
    }

    this.isFighting = true;
    soundEngine.playUI('fight');
    soundEngine.startBgm();

    // 觸發熱血開場倒數播報與橫幅 (ROUND 1 -> FIGHT!)
    announcerEngine.startRoundIntro(1);

    // 更新技能快捷鍵 HUD 圖標與頂部角色標籤
    const p1NameEl = document.getElementById('p1NameDisplay');
    const p2NameEl = document.getElementById('p2NameDisplay');
    const p1RoleTag = document.getElementById('p1RoleTag');
    const p2RoleTag = document.getElementById('p2RoleTag');
    if (p1NameEl) p1NameEl.textContent = p1Data.name;
    if (p2NameEl) p2NameEl.textContent = p2Data.name;

    if (this.matchMode === 'p2p') {
      if (this.multiplayerRole === 'host') {
        if (p1RoleTag) p1RoleTag.innerHTML = `<i class="fa-solid fa-crown"></i> 房主 (我方 YOU)`;
        if (p2RoleTag) p2RoleTag.innerHTML = `<i class="fa-solid fa-user"></i> 連線好友 (${p2Data.name})`;
      } else {
        if (p1RoleTag) p1RoleTag.innerHTML = `<i class="fa-solid fa-crown"></i> 連線房主 (${p1Data.name})`;
        if (p2RoleTag) p2RoleTag.innerHTML = `<i class="fa-solid fa-user-check"></i> 挑戰者 (我方 YOU)`;
      }
    } else {
      if (p1RoleTag) p1RoleTag.innerHTML = `<i class="fa-solid fa-user-check"></i> 這是玩家的角色 (YOU)`;
      if (p2RoleTag) {
        const p2Text = this.matchMode === 'local_2p'
          ? '2P 對手'
          : (this.matchMode === 'training'
            ? '訓練木樁'
            : (this.matchMode === 'arcade'
              ? `街機對手 (STAGE ${this.arcadeStage})`
              : '電腦對手 / AI'));
        p2RoleTag.innerHTML = `<i class="fa-solid fa-gamepad"></i> ${p2Text}`;
      }
    }
    this._updateSkillActionBar();

    // 進入 60 FPS 戰鬥主循環
    this._runBattleLoop();
  }

  _updateSkillActionBar() {
    const bar = document.getElementById('battleActionBar');
    if (!bar) return;

    const myPlayer = (this.matchMode === 'p2p' && this.multiplayerRole === 'guest')
      ? combatEngine.p2
      : combatEngine.p1;

    bar.innerHTML = (myPlayer.skills || []).map((sk, idx) => {
      const hotkey = this.getSkillKeyDisplayName(idx);
      return `
        <div class="skill-hud-card" id="skillCard_${idx}" style="border-color: ${sk.color}; cursor: pointer;" title="${sk.name} [${hotkey}]">
          <div class="skill-cd-overlay" id="skillCdOverlay_${idx}"></div>
          <i class="${sk.icon}" style="font-size: 18px; color: ${sk.color}; pointer-events: none;"></i>
          <span style="font-size: 10px; font-weight: 900; color: #fff; pointer-events: none;">[${hotkey}]</span>
        </div>
      `;
    }).join('') + `
      <div class="guard-hud-card" id="guardHudBtn" title="按住召喚量子防護罩 (快捷鍵: L / Shift)" style="cursor: pointer;">
        <i class="fa-solid fa-shield-halved" style="font-size: 18px; color: #38bdf8; pointer-events: none;"></i>
        <span style="font-size: 10px; font-weight: 900; color: #38bdf8; pointer-events: none;">[L] 護盾</span>
      </div>
      <div class="burst-hud-card" id="burstHudBtn" title="受擊時脫身爆發 [B]" style="cursor: pointer;">
        <span style="font-size: 11px; pointer-events: none;">BURST</span>
        <span style="font-size: 9px; opacity: 0.8; pointer-events: none;">[B]</span>
      </div>
      <div class="burst-hud-card" id="superHudBtn" style="background: linear-gradient(135deg, #ffd700, #ff007f); border-color: #ffd700; cursor: pointer;" title="滿能量或殘血時發動終極奧義 [P]">
        <span style="font-size: 11px; font-weight: 900; color: #fff; pointer-events: none;">SUPER</span>
        <span style="font-size: 9px; opacity: 0.9; color: #ffd700; pointer-events: none;">[P] 奧義</span>
      </div>
    `;

    // 綁定 5 大技能 HUD 卡片點擊/觸碰釋放
    (myPlayer.skills || []).forEach((_, idx) => {
      const card = document.getElementById(`skillCard_${idx}`);
      if (card) {
        const triggerSkill = (e) => {
          e.preventDefault();
          this.mobileInputs[`skill${idx + 1}`] = true;
          setTimeout(() => { this.mobileInputs[`skill${idx + 1}`] = false; }, 90);
        };
        card.onmousedown = triggerSkill;
        card.ontouchstart = triggerSkill;
      }
    });

    // 綁定防護罩 HUD 按鈕點擊/按住事件
    const guardBtn = document.getElementById('guardHudBtn');
    if (guardBtn) {
      guardBtn.onmousedown = (e) => { e.preventDefault(); this.keys['KeyL'] = true; };
      guardBtn.onmouseup = (e) => { e.preventDefault(); this.keys['KeyL'] = false; };
      guardBtn.onmouseleave = () => { this.keys['KeyL'] = false; };
      guardBtn.ontouchstart = (e) => { e.preventDefault(); this.mobileInputs.guard = true; };
      guardBtn.ontouchend = (e) => { e.preventDefault(); this.mobileInputs.guard = false; };
    }

    // 綁定爆發 HUD 按鈕點擊事件
    const burstBtn = document.getElementById('burstHudBtn');
    if (burstBtn) {
      burstBtn.onclick = (e) => {
        e.preventDefault();
        this.keys['KeyB'] = true;
        setTimeout(() => { this.keys['KeyB'] = false; }, 80);
      };
      burstBtn.ontouchstart = (e) => {
        e.preventDefault();
        this.mobileInputs.burst = true;
      };
      burstBtn.ontouchend = (e) => {
        e.preventDefault();
        this.mobileInputs.burst = false;
      };
    }

    // 綁定終極奧義 HUD 按鈕點擊事件
    const superBtn = document.getElementById('superHudBtn');
    if (superBtn) {
      superBtn.onclick = (e) => {
        e.preventDefault();
        this.keys['KeyP'] = true;
        setTimeout(() => { this.keys['KeyP'] = false; }, 80);
      };
      superBtn.ontouchstart = (e) => {
        e.preventDefault();
        this.mobileInputs.superMove = true;
      };
      superBtn.ontouchend = (e) => {
        e.preventDefault();
        this.mobileInputs.superMove = false;
      };
    }

    // 訓練營控制工具列
    const trainingBar = document.getElementById('trainingToolbar');
    if (trainingBar) {
      trainingBar.style.display = this.matchMode === 'training' ? 'flex' : 'none';
    }
  }

  _runBattleLoop(timestamp = 0) {
    if (!this.isFighting) return;

    if (!this._lastFrameTime) {
      this._lastFrameTime = timestamp || performance.now();
      this._timeAccumulator = 0;
    }

    const now = timestamp || performance.now();
    let delta = now - this._lastFrameTime;
    this._lastFrameTime = now;

    // 防止切換分頁或背景休眠產生過大時間差
    if (delta > 100) delta = 100;
    this._timeAccumulator += delta;

    const FIXED_STEP = 1000 / 60; // 16.6667ms 標準 60 FPS 物理週期
    let steps = 0;

    // 限制每渲染幀最多執行 3 次物理步進，確保高刷新率（120Hz/144Hz）或低幀率下均極致順暢
    while (this._timeAccumulator >= FIXED_STEP && steps < 3) {
      // 1. 採集 1P 與 2P 輸入
      let inputP1 = null;
      let inputP2 = null;

      if (combatEngine.isOver) {
        inputP1 = { x: 0, y: 0, punch: false, kick: false, guard: false, skill1: false, skill2: false, skill3: false, skill4: false, skill5: false, burst: false };
        inputP2 = { x: 0, y: 0, punch: false, kick: false, guard: false, skill1: false, skill2: false, skill3: false, skill4: false, skill5: false, burst: false };

        // 房主在戰鬥結束初期的 30 幀內持續廣播終局狀態，確保客端 100% 收到權威勝負裁定
        if (this.matchMode === 'p2p' && this.multiplayerRole === 'host' && p2pNetwork.isConnected && this.matchEndTimer <= 30) {
          p2pNetwork.send({
            type: 'battle_sync',
            p1: { hp: Math.round(combatEngine.p1.hp) },
            p2: { hp: Math.round(combatEngine.p2.hp) },
            isOver: true,
            winner: combatEngine.winner
          });
        }
      } else if (this.matchMode === 'p2p') {
        this._p2pSyncTimer = (this._p2pSyncTimer || 0) + 1;

        if (this.multiplayerRole === 'host') {
          inputP1 = this._gatherInputsP1();
          inputP2 = this.networkP2Input || { x: 0, y: 0, punch: false, kick: false, guard: false, skill1: false, skill2: false, skill3: false, skill4: false, skill5: false, burst: false };
          if (p2pNetwork.isConnected) {
            p2pNetwork.send({ type: 'battle_input', p1: inputP1 });

            // 房主每 2 幀發送一次權威全域戰況同步包 (HP、坐標、動態狀態、動作、飛行道具、勝負)
            if (this._p2pSyncTimer % 2 === 0) {
              p2pNetwork.send({
                type: 'battle_sync',
                p1: {
                  hp: Math.round(combatEngine.p1.hp),
                  x: Math.round(combatEngine.p1.x),
                  y: Math.round(combatEngine.p1.y),
                  vx: Math.round(combatEngine.p1.vx * 10) / 10,
                  vy: Math.round(combatEngine.p1.vy * 10) / 10,
                  state: combatEngine.p1.state,
                  facing: combatEngine.p1.facing,
                  burstMeter: Math.round(combatEngine.p1.burstMeter),
                  superMeter: Math.round(combatEngine.p1.superMeter),
                  actionId: combatEngine.p1.currentAction?.id || null
                },
                p2: {
                  hp: Math.round(combatEngine.p2.hp),
                  x: Math.round(combatEngine.p2.x),
                  y: Math.round(combatEngine.p2.y),
                  vx: Math.round(combatEngine.p2.vx * 10) / 10,
                  vy: Math.round(combatEngine.p2.vy * 10) / 10,
                  state: combatEngine.p2.state,
                  facing: combatEngine.p2.facing,
                  burstMeter: Math.round(combatEngine.p2.burstMeter),
                  superMeter: Math.round(combatEngine.p2.superMeter),
                  actionId: combatEngine.p2.currentAction?.id || null
                },
                projectiles: combatEngine.projectiles.map(p => ({
                  type: p.type,
                  x: Math.round(p.x),
                  y: Math.round(p.y),
                  vx: Math.round(p.vx * 10) / 10,
                  vy: Math.round((p.vy || 0) * 10) / 10,
                  radius: p.radius,
                  damage: p.damage,
                  ownerId: p.ownerId,
                  life: p.life
                })),
                roundTime: combatEngine.roundTime,
                isOver: combatEngine.isOver,
                winner: combatEngine.winner
              });
            }
          }
        } else {
          // guest
          inputP2 = this._gatherInputsP1();
          inputP1 = this.networkP1Input || { x: 0, y: 0, punch: false, kick: false, guard: false, skill1: false, skill2: false, skill3: false, skill4: false, skill5: false, burst: false };
          if (p2pNetwork.isConnected) {
            p2pNetwork.send({ type: 'battle_input', p2: inputP2 });

            // 挑戰者每 3 幀回傳本地血量與位置意向
            if (this._p2pSyncTimer % 3 === 0) {
              p2pNetwork.send({
                type: 'guest_sync',
                hp: Math.round(combatEngine.p2.hp),
                x: Math.round(combatEngine.p2.x),
                y: Math.round(combatEngine.p2.y),
                burstMeter: Math.round(combatEngine.p2.burstMeter)
              });
            }
          }
        }
      } else if (this.matchMode === 'local_2p') {
        inputP1 = this._gatherInputsP1();
        inputP2 = this._gatherInputsP2();
      } else {
        inputP1 = this._gatherInputsP1();
        inputP2 = aiController.decide(combatEngine.p2, combatEngine.p1, combatEngine);
      }

      // 3. 戰鬥物理精準推進 1 幀 (60 FPS 確定性週期，多人模式需待雙方就緒解鎖後同步開始)
      if (this.matchMode !== 'p2p' || this.isMultiplayerMatchUnlocked) {
        combatEngine.update(inputP1, inputP2);
      }

      // 4. 檢查對局結算與勝利姿態慶祝展示計時
      if (combatEngine.isOver && !combatEngine.isTraining) {
        const isDraw = combatEngine.winner === 0;
        const isLocalWinner = !isDraw && (this.matchMode === 'p2p'
          ? (this.multiplayerRole === 'guest' ? combatEngine.winner === 2 : combatEngine.winner === 1)
          : combatEngine.winner === 1);
        const winnerFighter = combatEngine.winner === 1 ? combatEngine.p1 : (combatEngine.winner === 2 ? combatEngine.p2 : null);

        if (!this.matchEndTimer) {
          this.matchEndTimer = 1;
          combatEngine.floatingTexts = [];
          announcerEngine.activeBanners = [];
          this._syncVictoryOverlay(isLocalWinner, isDraw, winnerFighter);
        } else {
          this.matchEndTimer++;
          combatEngine.floatingTexts = [];
          announcerEngine.activeBanners = [];
        }

        // 勝利慶祝展示 110 幀 (~1.8 秒) 後彈出結算對話框，背景姿態動畫持續播放
        if (this.matchEndTimer === 110) {
          this._showMatchEndModal();
        }
      }

      this._timeAccumulator -= FIXED_STEP;
      steps++;
    }

    // 5. 渲染戰鬥畫面 (隨螢幕更新率即時呈現，消除撕裂與微卡頓)
    this._renderBattleFrame();

    // 6. 更新戰鬥 HUD
    this._updateBattleHUD();

    this._battleLoopId = requestAnimationFrame((ts) => this._runBattleLoop(ts));
  }

  _gatherInputsP1() {
    const k = this.keys;
    const m = this.mobileInputs;

    let x = 0;
    let y = 0;
    if (k['KeyA'] || k['ArrowLeft']) x -= 1;
    if (k['KeyD'] || k['ArrowRight']) x += 1;
    const isUp = !!(k['KeyW'] || k['ArrowUp'] || k['Space'] || m.jump || (m.y < -0.35));
    const isDown = !!(k['KeyS'] || k['ArrowDown'] || m.down || (m.y > 0.35));

    if (isUp && !isDown) y -= 1;
    if (isDown && !isUp) y += 1;

    // 疊加行動端觸控搖桿
    if (Math.abs(m.x) > 0.1) x = m.x;

    const dropThrough = isDown && isUp;
    const k1 = (this.skillKeyBindings && this.skillKeyBindings[0]) || 'KeyU';
    const k2 = (this.skillKeyBindings && this.skillKeyBindings[1]) || 'KeyI';
    const k3 = (this.skillKeyBindings && this.skillKeyBindings[2]) || 'KeyO';
    const k4 = (this.skillKeyBindings && this.skillKeyBindings[3]) || 'KeyY';
    const k5 = (this.skillKeyBindings && this.skillKeyBindings[4]) || 'KeyH';

    return {
      x,
      y: dropThrough ? 1 : y,
      jump: isUp,
      down: isDown,
      dropThrough,
      punch: false, // 拳擊與踢腿改為 AI 專屬體術，玩家專注於自選神兵武裝
      kick: false,
      guard: !!(k['KeyL'] || k['ShiftLeft'] || k['ShiftRight'] || m.guard),
      skill1: !!(k[k1] || m.skill1),
      skill2: !!(k[k2] || m.skill2),
      skill3: !!(k[k3] || m.skill3),
      skill4: !!(k[k4] || m.skill4),
      skill5: !!(k[k5] || m.skill5),
      burst: !!(k['KeyB'] || m.burst),
      superMove: !!(k['KeyP'] || m.superMove)
    };
  }

  _gatherInputsP2() {
    // 本地雙人同機對決 2P 鍵位 (方向鍵 + 數字鍵盤 1/2/4/5/6/7/9)
    const k = this.keys;
    let x = 0;
    let y = 0;
    if (k['ArrowLeft']) x -= 1;
    if (k['ArrowRight']) x += 1;
    const isUp = !!(k['ArrowUp'] || k['Numpad8']);
    const isDown = !!(k['ArrowDown'] || k['Numpad5']);

    if (isUp && !isDown) y -= 1;
    if (isDown && !isUp) y += 1;

    const dropThrough = isDown && isUp;

    return {
      x,
      y: dropThrough ? 1 : y,
      jump: isUp,
      down: isDown,
      dropThrough,
      punch: false, // 拳腳為 AI 專屬體術
      kick: false,
      guard: !!(k['Numpad0'] || k['NumpadDecimal']),
      skill1: !!(k['Numpad4'] || k['Digit4']),
      skill2: !!(k['Numpad5'] || k['Digit5']),
      skill3: !!(k['Numpad6'] || k['Digit6']),
      skill4: !!(k['Numpad7'] || k['Digit8']),
      skill5: !!(k['Numpad9'] || k['Digit9']),
      burst: !!(k['NumpadPlus'] || k['NumpadEnter'] || k['Digit7']),
      superMove: !!(k['Numpad3'] || k['Digit3'])
    };
  }

  _renderBattleFrame() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const dpr = this.dpr || 1;
    const w = this.logicalWidth || window.innerWidth;
    const h = this.logicalHeight || window.innerHeight;

    // 清除畫布並重設高解析度縮放矩陣與最高品質平滑反鋸齒
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, w, h);

    // 1. 繪製多主題經典戰鬥場景 (Multi-Themed Battle Stage: 天下第一武道會、斯塔克大樓天台、那美克星、賽博矩陣)
    stageRenderer.drawStage(ctx, this.currentStage, w, h, combatEngine.floorY);

    // 儲存戰鬥世界視口 (World Matrix)
    ctx.save();

    // 畫面震動衝擊反饋 (Screen Shake) 作用於世界視口
    if (combatEngine.screenShake && combatEngine.screenShake.intensity > 0.1) {
      ctx.translate(combatEngine.screenShake.x, combatEngine.screenShake.y);
    }

    const groundY = combatEngine.floorY;

    // 2. 繪製與場景主題深度融合之高低懸浮空中戰鬥平台
    stageRenderer.drawPlatforms(ctx, combatEngine.platforms, this.currentStage);

    // 3. 繪製角色腳底發光光環 (地面定位圈)
    this._drawFighterFloorRings(ctx, groundY);

    // 4. 繪製雙方角色
    characterRenderer.draw(ctx, combatEngine.p1);
    characterRenderer.draw(ctx, combatEngine.p2);

    // 4.5 繪製近戰體術與招式專屬超華麗武打視覺特效 (Melee & Martial Arts VFX)
    this._drawMeleeSkillVisuals(ctx, combatEngine.p1);
    this._drawMeleeSkillVisuals(ctx, combatEngine.p2);

    // 5. 繪製角色頭頂醒目標籤與攻擊招式細節
    this._drawFighterOverheadBadges(ctx);

    // 6. 繪製飛行道具 (Projectiles - 全向多元光子武裝 & 技能飛行道具)
    combatEngine.projectiles.forEach(p => {
      ctx.save();
      const themeCol = p.skin && p.skin.themeColor ? p.skin.themeColor : '#00f3ff';
      const secCol = p.skin && p.skin.secondaryColor ? p.skin.secondaryColor : '#ffffff';
      const rad = p.radius || 10;
      const angle = Math.atan2(p.vy || 0, p.vx || 1);

      if (p.type === 'ground_wave') {
        // 地裂爬行震波：貼地滑行之裂地電弧光冠
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 18;
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(p.x - 24, p.y + 4);
        ctx.lineTo(p.x - 8, p.y - 12);
        ctx.lineTo(p.x + 4, p.y - 4);
        ctx.lineTo(p.x + 20, p.y - 18);
        ctx.lineTo(p.x + 28, p.y + 4);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x + 8, p.y - 10, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'heavy') {
        // 超載穿透重砲：大型等離子重型聚能球與環繞能量光環
        ctx.shadowColor = themeCol;
        ctx.shadowBlur = 24;
        ctx.fillStyle = themeCol;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // 環形公轉離子軌道
        const ringT = Date.now() / 150;
        ctx.strokeStyle = secCol;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, rad * 1.5, rad * 0.6, ringT, 0, Math.PI * 2);
        ctx.stroke();

        // 巨型破空拖尾光柱
        ctx.strokeStyle = themeCol;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 3.5, p.y - (p.vy || 0) * 3.5);
        ctx.stroke();
      } else if (p.type === 'homing') {
        // 追蹤微型飛彈：高科技流線型微導彈與尾焰
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 15;

        // 彈體金屬梭形
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-8, -4.5);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-8, 4.5);
        ctx.closePath();
        ctx.fill();

        // 噴射尾焰
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(-7, -2);
        ctx.lineTo(-18 - Math.random() * 6, 0);
        ctx.lineTo(-7, 2);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'bouncing') {
        // 折射稜鏡激光：旋轉幾何稜鏡晶核與高亮折射射線
        ctx.translate(p.x, p.y);
        const rot = Date.now() / 120;
        ctx.rotate(rot);
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 20;

        // 八面菱形稜鏡
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.moveTo(0, -rad);
        ctx.lineTo(rad, 0);
        ctx.lineTo(0, rad);
        ctx.lineTo(-rad, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, rad * 0.45, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (p.type === 'bomb') {
        // 空對地爆彈：高能聚能核彈與警示危險紅圈
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // 下墜拖尾
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2.5, p.y - p.vy * 2.5);
        ctx.stroke();
      } else if (p.type === 'vortex') {
        // 虛空引力黑洞：事件視界與旋轉吸積盤
        const vRot = Date.now() / 200;
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 24;

        // 外層引力吸積螺旋
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.75)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad * (1 + Math.sin(vRot * 2) * 0.15), 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad * 0.75, 0, Math.PI * 2);
        ctx.stroke();

        // 黑色引力奇點核心
        ctx.fillStyle = '#050510';
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00f3ff';
        ctx.stroke();
      } else if (p.type === 'sniper') {
        // 高斯狙擊穿甲重槍：超音速針狀電磁穿甲彈與擴散音爆環
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 24;
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(-22, -3, 44, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-12, -1.5, 30, 3);
        // 超音速音爆衝擊環
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.75)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(-18, 0, 9, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-34, 0, 14, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      } else if (p.type === 'shotgun') {
        // 擴散式電漿霰彈：高溫紫曜電漿霰彈球
        ctx.shadowColor = '#d946ef';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#d946ef';
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'funnel') {
        // 脈衝浮游砲：懸浮跟隨型高科技綠曜無人戰機
        ctx.translate(p.x, p.y);
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#064e3b';
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(0, -9);
        ctx.lineTo(-12, 0);
        ctx.lineTo(0, 9);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#6ee7b7';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00f3ff';
        ctx.beginPath();
        ctx.arc(-13, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'funnel_laser') {
        // 浮游砲雷射束：翡翠高速離子光束
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#34d399';
        ctx.fillRect(p.x - 18, p.y - 3, 36, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(p.x - 12, p.y - 1.5, 24, 3);
      } else if (p.type === 'cryo_arrow') {
        // 極凍冰霜穿透箭：晶瑩透亮冰晶尖錐長箭
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#00e5ff';
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(-16, -7);
        ctx.lineTo(-10, 0);
        ctx.lineTo(-16, 7);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-8, -3);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-8, 3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, 0);
        ctx.lineTo(-28, 0);
        ctx.stroke();
      } else if (p.type === 'grenade') {
        // 燃燒榴彈：高速翻滾榴彈彈筒與引信火花
        ctx.translate(p.x, p.y);
        ctx.rotate(Date.now() / 90);
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(-8, -6, 16, 12);
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 2;
        ctx.strokeRect(-8, -6, 16, 12);
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'napalm_pool') {
        // 燃燒火海：地面燃燒熔岩火場與跳動烈焰
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 22;
        const flameH = Math.sin(Date.now() / 80 + p.x) * 5;
        const grad = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, p.radius || 48);
        grad.addColorStop(0, 'rgba(255, 235, 59, 0.85)');
        grad.addColorStop(0.45, 'rgba(234, 88, 12, 0.65)');
        grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y + 4, p.radius || 48, 13 + flameH, 0, 0, Math.PI * 2);
        ctx.fill();
        for (let s = -2; s <= 2; s++) {
          const sx = p.x + s * 15 + Math.sin(Date.now() / 110 + s) * 4;
          const sy = p.y - 6 - Math.abs(Math.cos(Date.now() / 90 + s * 2)) * 18;
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (p.type === 'boomerang') {
        // 迴旋雷霆光刃鏢：高速旋轉十字等離子雷霆飛鏢
        ctx.translate(p.x, p.y);
        ctx.rotate(Date.now() / 40);
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 22;
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2;
          ctx.lineTo(Math.cos(a) * 18, Math.sin(a) * 18);
          ctx.lineTo(Math.cos(a + Math.PI / 4) * 6, Math.sin(a + Math.PI / 4) * 6);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'shuriken') {
        // 影分身十字手裡劍 (SK-21)：高速旋轉四刃暗影手裏劍與星芒拖尾
        ctx.translate(p.x, p.y);
        ctx.rotate(Date.now() / 25);
        ctx.shadowColor = '#818cf8';
        ctx.shadowBlur = 18;

        // 四曲刃暗影十字星
        ctx.fillStyle = '#312e81';
        ctx.beginPath();
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2;
          ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14);
          ctx.lineTo(Math.cos(a + 0.35) * 5, Math.sin(a + 0.35) * 5);
          ctx.lineTo(Math.cos(a + Math.PI / 4) * 4, Math.sin(a + Math.PI / 4) * 4);
        }
        ctx.closePath();
        ctx.fill();

        // 鋒利能量外刃
        ctx.strokeStyle = '#a5b4fc';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 中心圓軸星芒
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // 殘影風輪外環
        ctx.strokeStyle = 'rgba(129, 140, 248, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'emp_mine') {
        // 電磁引力爆縮雷 (SK-24)：懸浮脈衝力場雷與環形電弧
        ctx.translate(p.x, p.y + Math.sin(Date.now() / 120) * 3);
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 20;

        // 外層旋轉電磁防護翼
        const mRot = Date.now() / 100;
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, rad + 3, mRot, mRot + Math.PI * 1.5);
        ctx.stroke();

        // 球體裝甲主機
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 核心高能 EMP 閃爍紅紫燈
        const pulse = 0.5 + Math.sin(Date.now() / 60) * 0.5;
        ctx.fillStyle = pulse > 0.4 ? '#f43f5e' : '#e879f9';
        ctx.beginPath();
        ctx.arc(0, 0, rad * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // 懸浮電弧粒子
        for (let e = 0; e < 3; e++) {
          const eAng = (e * Math.PI * 2) / 3 + Date.now() / 80;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(Math.cos(eAng) * (rad + 6), Math.sin(eAng) * (rad + 6), 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (p.type === 'cluster_bomb') {
        // 量子散裂高爆彈 (SK-28)：重型集束巡航彈體與側掛子彈
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.shadowColor = '#fb923c';
        ctx.shadowBlur = 22;

        // 彈體主體（橙黑流線重型破甲彈身）
        ctx.fillStyle = '#7c2d12';
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(-12, -7);
        ctx.lineTo(-10, 0);
        ctx.lineTo(-12, 7);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#fb923c';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 側掛微型子母彈艙
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-6, -8, 6, 2.5);
        ctx.fillRect(-6, 5.5, 6, 2.5);

        // 彈頭核心破空高光
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(6, -3);
        ctx.lineTo(6, 3);
        ctx.closePath();
        ctx.fill();

        // 噴射高溫橙紅尾焰與超音速波
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.moveTo(-10, -4);
        ctx.lineTo(-24 - Math.random() * 8, 0);
        ctx.lineTo(-10, 4);
        ctx.closePath();
        ctx.fill();
      } else {
        // 常規 / 仰角 / 躍空光彈 (Normal, Anti-air, Air dive)
        ctx.shadowColor = themeCol;
        ctx.shadowBlur = 18;
        ctx.fillStyle = themeCol;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad * 0.45, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = secCol;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 3, p.y - (p.vy || 0) * 3);
        ctx.stroke();
      }

      ctx.restore();
    });

    // 7. 繪製衝擊波與巨砲 (Shockwaves, Super Beams & K.O. Rings)
    combatEngine.shockwaves.forEach(s => {
      ctx.save();
      ctx.strokeStyle = s.color || '#00f3ff';
      ctx.shadowColor = s.color || '#00f3ff';
      ctx.shadowBlur = 20;

      if (s.isSuperBeam) {
        // 終極必殺巨型全屏光柱與衝擊波
        const beamH = s.height || 80;
        // 外層漫射發光層
        ctx.fillStyle = s.color;
        ctx.globalAlpha = 0.35;
        ctx.fillRect(0, s.y - beamH * 0.75, w, beamH * 1.5);

        // 主光柱
        ctx.globalAlpha = 0.85;
        ctx.fillRect(0, s.y - beamH / 2, w, beamH);

        // 核心白熾光核
        ctx.fillStyle = s.coreColor || '#ffffff';
        ctx.globalAlpha = 0.95;
        ctx.fillRect(0, s.y - beamH * 0.25, w, beamH * 0.5);

        // 螺旋雷霆光環 (Spiral Helix & Lightning Arcs)
        const tNow = Date.now() / 60;
        ctx.strokeStyle = s.coreColor || '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let lx = 0; lx < w; lx += 25) {
          const ly = s.y + Math.sin(tNow + lx * 0.05) * (beamH * 0.45);
          if (lx === 0) ctx.moveTo(lx, ly);
          else ctx.lineTo(lx, ly);
        }
        ctx.stroke();
      } else if (s.isKO) {
        // K.O. 終結巨型震撼擴散金芒環
        const progress = Math.min(1, s.radius / s.maxRadius);
        ctx.globalAlpha = Math.max(0, 1 - progress);
        ctx.lineWidth = Math.max(2, (1 - progress) * 14);
        ctx.strokeStyle = s.color || '#ffd700';
        ctx.shadowColor = s.color || '#ffd700';
        ctx.shadowBlur = 35;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.stroke();

        if (progress < 0.4) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(s.x, s.y, (1 - progress * 2.5) * 80, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (s.isIceSpikes) {
        // SK-27 冰晶地刺暴湧：拔地而起之冰川晶棱尖錐群
        const progress = Math.min(1, s.radius / s.maxRadius);
        const alpha = Math.max(0, 1 - progress * 0.85);
        ctx.globalAlpha = alpha;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 24;

        // 繪製 5 簇高低起伏之璀璨冰晶尖錐
        const spikeOffsets = [
          { dx: -28, h: 48, w: 12, tilt: -0.15 },
          { dx: -12, h: 72, w: 15, tilt: -0.05 },
          { dx: 4,   h: 88, w: 18, tilt: 0.05 },
          { dx: 22,  h: 68, w: 14, tilt: 0.12 },
          { dx: 38,  h: 42, w: 11, tilt: 0.22 }
        ];

        spikeOffsets.forEach(sp => {
          const currentH = sp.h * Math.min(1, progress * 2.8);
          const px = s.x + sp.dx;
          const py = s.y;

          // 冰錐主體線性漸變
          const iceGrad = ctx.createLinearGradient(px, py, px + sp.tilt * 20, py - currentH);
          iceGrad.addColorStop(0, 'rgba(14, 165, 233, 0.9)');
          iceGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.85)');
          iceGrad.addColorStop(0.85, 'rgba(186, 230, 253, 0.95)');
          iceGrad.addColorStop(1, '#ffffff');

          ctx.fillStyle = iceGrad;
          ctx.beginPath();
          ctx.moveTo(px - sp.w, py);
          ctx.lineTo(px + sp.tilt * 20, py - currentH);
          ctx.lineTo(px + sp.w, py);
          ctx.closePath();
          ctx.fill();

          // 冰棱鋒刃高光刻線
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + sp.tilt * 20, py - currentH);
          ctx.stroke();

          // 冰晶星芒閃爍
          if (progress > 0.15 && progress < 0.7) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(px + sp.tilt * 20, py - currentH, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // 地面極凍白霜冰環
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y + 2, Math.min(s.radius, 60), 8, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (s.isClusterBlast) {
        // 量子散裂空爆衝擊波
        const progress = Math.min(1, s.radius / s.maxRadius);
        const alpha = Math.max(0, 1 - progress);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#fb923c';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 22;
        ctx.lineWidth = Math.max(2, (1 - progress) * 8);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.stroke();

        // 擴散高能破片飛濺
        for (let k = 0; k < 6; k++) {
          const ang = (k * Math.PI) / 3 + progress * 2;
          const rDist = s.radius * 0.8;
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(s.x + Math.cos(ang) * rDist, s.y + Math.sin(ang) * rDist, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (s.isEmpBlast) {
        // 電磁引力爆縮雷電爆
        const progress = Math.min(1, s.radius / s.maxRadius);
        const alpha = Math.max(0, 1 - progress);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#c084fc';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 28;
        ctx.lineWidth = Math.max(2, (1 - progress) * 10);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.stroke();

        // 放射狀電弧閃電叉
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        for (let a = 0; a < 8; a++) {
          const ang = (a * Math.PI) / 4 + s.radius * 0.05;
          const len1 = s.radius * 0.45;
          const len2 = s.radius * 0.95;
          const midX = s.x + Math.cos(ang) * len1 + (Math.random() - 0.5) * 8;
          const midY = s.y + Math.sin(ang) * len1 + (Math.random() - 0.5) * 8;
          const endX = s.x + Math.cos(ang) * len2;
          const endY = s.y + Math.sin(ang) * len2;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(midX, midY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      } else if (s.isBeam) {
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x - s.width / 2, s.y - s.height / 2, s.width, s.height);
      } else {
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    });

    // 8. 繪製打擊爆裂火花與放射狀斬擊光芒 (Hit Sparks & Impact Rays)
    this._drawHitSparks(ctx);

    // 9. 繪製浮動傷害與提示文字 (Floating Texts)
    combatEngine.floatingTexts.forEach(t => {
      ctx.save();
      ctx.font = 'bold 18px Orbitron, sans-serif';
      ctx.fillStyle = t.color;
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 10;
      ctx.fillText(t.text, t.x - 40, t.y);
      ctx.restore();
    });

    // 恢復世界視口（HUD 與 UI 不受世界震動偏移影響）
    ctx.restore();

    // 10. 繪製熱血連擊計數器 (Arcade Combo Counter HUD)
    this._drawComboCounters(ctx, w, h);

    // 11. 戰鬥播報語音與華麗動態文字橫幅 (Announcer & Combat Banners)
    announcerEngine.draw(ctx, w, h);

    // 12. 戰鬥結束勝利橫幅與冠軍慶祝 (Victory Celebration Banner) - 置於最頂層最上排，絕不被任何戰鬥文字遮擋
    if (combatEngine.isOver && !combatEngine.isTraining) {
      this._drawVictoryBanner(ctx, w, h);
    }

    // 13. 多人連線雙方同步就緒提示 (Sync Ready Indicator)
    if (this.matchMode === 'p2p' && !this.isMultiplayerMatchUnlocked && !combatEngine.isOver) {
      ctx.save();
      const cx = w / 2;
      const cy = h / 2 - 30;
      ctx.fillStyle = 'rgba(5, 12, 28, 0.85)';
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 20;
      const bw = 380, bh = 48;
      if (ctx.roundRect) ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 8);
      else ctx.rect(cx - bw / 2, cy - bh / 2, bw, bh);
      ctx.fill();
      ctx.stroke();

      ctx.font = '900 16px "Orbitron", "Noto Sans TC", sans-serif';
      ctx.fillStyle = '#00f3ff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡ 雙方神經元同步連線中... 即刻開戰！ ⚡', cx, cy);
      ctx.restore();
    }
  }

  // ─── 打擊爆裂火花與斬芒特效 (Hit Sparks & Impact Rays) ───
  _drawHitSparks(ctx) {
    if (!combatEngine.hitSparks || combatEngine.hitSparks.length === 0) return;

    for (const spark of combatEngine.hitSparks) {
      const alpha = Math.max(0, spark.life / spark.maxLife);
      const progress = 1 - alpha;
      ctx.save();

      // 1. 核心衝擊擴散環 (Expanding Impact Ring)
      const currentRadius = (spark.coreRadius || 20) * (0.4 + progress * 1.3);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = spark.color || '#ff007f';
      ctx.lineWidth = Math.max(1, (1 - progress) * 4);
      ctx.shadowColor = spark.color || '#ff007f';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, currentRadius, 0, Math.PI * 2);
      ctx.stroke();

      // 2. 核心白熾爆閃 (White Flash)
      if (progress < 0.35) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, currentRadius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. 放射狀斬擊十字光芒 (Directional Slash & Impact Rays)
      const rayLen = (spark.rayLength || 40) * (0.5 + progress * 0.9);
      ctx.lineWidth = Math.max(1.5, (1 - progress) * 3);
      ctx.strokeStyle = spark.secondaryColor || '#ffd700';
      ctx.shadowColor = spark.secondaryColor || '#ffd700';
      ctx.shadowBlur = 14;

      const angles = spark.angles || [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
      for (const ang of angles) {
        const ax = spark.x + Math.cos(ang) * rayLen;
        const ay = spark.y + Math.sin(ang) * rayLen;
        ctx.beginPath();
        ctx.moveTo(spark.x, spark.y);
        ctx.lineTo(ax, ay);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // ─── 核心近戰武藝與戰技超華麗視覺特效 (Melee & Martial Arts High-Fidelity VFX) ───
  _drawMeleeSkillVisuals(ctx, fighter) {
    if (!fighter) return;
    const action = fighter.currentAction;
    const x = fighter.x;
    const y = fighter.y;
    const facing = fighter.facing || 1;
    const t = fighter.stateTime || 0;
    const skin = fighter.skin || {};
    const themeCol = skin.themeColor || '#00f3ff';
    const secCol = skin.secondaryColor || '#ffffff';
    const glowCol = skin.glowColor || 'rgba(0, 243, 255, 0.6)';

    // 1. 常規近戰拳腳動態刀光與氣刃 (Basic Melee Strike Trails)
    if (fighter.state === 'light_punch' || fighter.state === 'crouch_punch' || fighter.state === 'jump_punch') {
      ctx.save();
      const punchY = fighter.state === 'crouch_punch' ? y - 35 : (fighter.state === 'jump_punch' ? y - 55 : y - 68);
      const punchX = x + facing * (30 + Math.min(20, t * 6));
      ctx.shadowColor = themeCol;
      ctx.shadowBlur = 18;
      ctx.strokeStyle = secCol;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(punchX, punchY, 18, -Math.PI / 4, Math.PI / 4);
      ctx.stroke();

      // 前端衝擊星芒
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(punchX + facing * 8, punchY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (fighter.state === 'heavy_kick' || fighter.state === 'crouch_kick' || fighter.state === 'jump_kick') {
      ctx.save();
      const kickY = fighter.state === 'crouch_kick' ? y - 14 : (fighter.state === 'jump_kick' ? y - 45 : y - 60);
      const kickX = x + facing * (28 + Math.min(25, t * 5));
      ctx.shadowColor = themeCol;
      ctx.shadowBlur = 22;
      ctx.strokeStyle = themeCol;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(kickX - facing * 8, kickY, 36, -0.4 * Math.PI, 0.35 * Math.PI, facing === -1);
      ctx.stroke();

      ctx.strokeStyle = secCol;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(kickX - facing * 8, kickY, 30, -0.4 * Math.PI, 0.35 * Math.PI, facing === -1);
      ctx.stroke();
      ctx.restore();
    }

    // 2. 15 大專屬武藝技能獨立高畫質 VFX (Dedicated Martial Skills VFX)
    if (fighter.state === 'skill' && action) {
      const skillId = action.id;

      // ─── SK-02 升龍衝天擊 (Rising Dragon Uppercut) ───
      if (skillId === 'SK-02') {
        ctx.save();
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 24;

        // 雙螺旋盤旋神龍光帶 (Twin Rising Dragon Spirals)
        const helixH = Math.min(130, t * 14);
        const rotT = t * 0.45;

        for (let side = -1; side <= 1; side += 2) {
          ctx.strokeStyle = side === 1 ? '#38bdf8' : '#e0f2fe';
          ctx.lineWidth = 4;
          ctx.beginPath();
          for (let dy = 0; dy <= helixH; dy += 8) {
            const hx = x + Math.sin(rotT + dy * 0.08 * side) * (24 - dy * 0.12);
            const hy = y - dy;
            if (dy === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.stroke();
        }

        // 龍首沖天光焰 (Dragon Head Roar Corona)
        if (t >= 3 && t <= 12) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + facing * 8, y - helixH, 16, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          for (let c = -1; c <= 1; c++) {
            ctx.beginPath();
            ctx.moveTo(x + facing * 8 + c * 10, y - helixH + 10);
            ctx.lineTo(x + facing * 16 + c * 14, y - helixH - 18);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // ─── SK-03 音速滑踢 (Sonic Slide Kick) ───
      else if (skillId === 'SK-03') {
        ctx.save();
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 20;

        const footX = x + facing * 42;
        const footY = y - 10;

        ctx.strokeStyle = 'rgba(168, 85, 247, 0.85)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(footX, footY, 22, -0.6 * Math.PI, 0.6 * Math.PI, facing === -1);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(footX, footY, 14, -0.5 * Math.PI, 0.5 * Math.PI, facing === -1);
        ctx.stroke();

        // 摩擦火花
        ctx.fillStyle = '#fef08a';
        for (let sp = 0; sp < 6; sp++) {
          const sx = x - facing * (8 + sp * 8 + Math.random() * 6);
          const sy = y - 4 + Math.random() * 4;
          ctx.beginPath();
          ctx.arc(sx, sy, 2 + Math.random() * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // 滑行地面光軌
        const grad = ctx.createLinearGradient(x - facing * 50, y, footX, y);
        grad.addColorStop(0, 'rgba(168, 85, 247, 0)');
        grad.addColorStop(1, 'rgba(192, 132, 252, 0.7)');
        ctx.fillStyle = grad;
        ctx.fillRect(facing === 1 ? x - 45 : footX, y - 5, 80, 5);

        ctx.restore();
      }

      // ─── SK-04 躍空震地砸 (Overhead Ground Slam) ───
      else if (skillId === 'SK-04') {
        ctx.save();
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 24;

        if (t < 7) {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x + facing * 15, y - 75, 18, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + facing * 15, y - 75, 8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const impactX = x + facing * 25;
          const impactY = y;

          ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
          ctx.beginPath();
          ctx.ellipse(impactX, impactY - 2, 60, 14, 0, 0, Math.PI * 2);
          ctx.fill();

          // 放射狀地表裂紋 (Earthquake Cracks)
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.5;
          const crackDirs = [-50, -32, -15, 18, 35, 55, 75];
          crackDirs.forEach((cd, idx) => {
            ctx.beginPath();
            ctx.moveTo(impactX, impactY - 2);
            ctx.lineTo(impactX + cd * 0.5, impactY - 2 + (idx % 2 === 0 ? 3 : -2));
            ctx.lineTo(impactX + cd, impactY - 2);
            ctx.stroke();
          });

          // 向上迸射熔岩土石碎粒
          ctx.fillStyle = '#fef08a';
          for (let r = 0; r < 7; r++) {
            const rx = impactX + (r - 3) * 14 + Math.sin(t + r) * 6;
            const ry = impactY - 12 - (r % 3) * 16 - Math.random() * 10;
            ctx.fillRect(rx, ry, 4, 4);
          }
        }
        ctx.restore();
      }

      // ─── SK-05 幻影疾風破甲刺 (Phantom Piercing Thrust) ───
      else if (skillId === 'SK-05') {
        ctx.save();
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 22;

        // 3 道高速運動虛影殘像 (Phantom Afterimages)
        for (let g = 1; g <= 3; g++) {
          ctx.globalAlpha = 0.45 / g;
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.ellipse(x - facing * g * 22, y - 50, 16, 42, 0.15 * facing, 0, Math.PI * 2);
          ctx.fill();
        }

        // 超音速穿刺針芒光柱 (Piercing Needle Beam)
        ctx.globalAlpha = 1.0;
        const thrustX0 = x + facing * 20;
        const thrustX1 = x + facing * 120;
        const thrustY = y - 68;

        const thrustGrad = ctx.createLinearGradient(thrustX0, thrustY, thrustX1, thrustY);
        thrustGrad.addColorStop(0, 'rgba(236, 72, 153, 0.2)');
        thrustGrad.addColorStop(0.7, '#ec4899');
        thrustGrad.addColorStop(1, '#ffffff');

        ctx.strokeStyle = thrustGrad;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(thrustX0, thrustY);
        ctx.lineTo(thrustX1, thrustY);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(thrustX0, thrustY);
        ctx.lineTo(thrustX1, thrustY);
        ctx.stroke();

        // 雙圓弧音爆環 (Sonic Boom Rings)
        ctx.strokeStyle = 'rgba(244, 114, 182, 0.8)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(x + facing * 65, thrustY, 8, 22, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(x + facing * 95, thrustY, 12, 30, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // ─── SK-06 虛空折躍傳送棒 (Void Teleport Wand Strike) ───
      else if (skillId === 'SK-06') {
        ctx.save();
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 28;

        const slashX = x + facing * 36;
        const slashY = y - 65;

        // 紫電與高維量子光流撕裂十字裂隙 (Quantum Cross Rift)
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(slashX - facing * 45, slashY - 45);
        ctx.lineTo(slashX + facing * 45, slashY + 45);
        ctx.moveTo(slashX - facing * 45, slashY + 45);
        ctx.lineTo(slashX + facing * 45, slashY - 45);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // 傳送棒核心爆發環 (Teleport Wand Energy Ring)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(slashX, slashY, 32, 0, Math.PI * 2);
        ctx.stroke();

        // 高維量子星塵 (Quantum Warp Particles)
        for (let m = 0; m < 10; m++) {
          const ma = (m * Math.PI) / 5 + t * 0.6;
          ctx.fillStyle = m % 2 === 0 ? '#38bdf8' : '#ffffff';
          ctx.fillRect(slashX + Math.cos(ma) * 38, slashY + Math.sin(ma) * 38, 4, 4);
        }

        ctx.restore();
      }

      // ─── SK-07 百裂連擊衝 (Hundred Fist Rush) ───
      else if (skillId === 'SK-07') {
        ctx.save();
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 20;

        // 7 枚高速轟出的幻影拳影暴雨 (Fist Flurry)
        const fistCount = 7;
        for (let f = 0; f < fistCount; f++) {
          const fPhase = (t * 0.8 + f * 1.3) % 1;
          const fx = x + facing * (30 + fPhase * 65);
          const fy = y - 82 + ((f * 29) % 36);

          ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(fx - facing * 20, fy);
          ctx.lineTo(fx, fy);
          ctx.stroke();

          ctx.fillStyle = '#34d399';
          ctx.beginPath();
          ctx.ellipse(fx, fy, 10, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(fx + facing * 4, fy, 3.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(fx + facing * 4 - 6, fy);
          ctx.lineTo(fx + facing * 4 + 6, fy);
          ctx.moveTo(fx + facing * 4, fy - 6);
          ctx.lineTo(fx + facing * 4, fy + 6);
          ctx.stroke();
        }

        ctx.restore();
      }

      // ─── SK-08 磁暴重摔投 (Magnetic Heavy Grab) ───
      else if (skillId === 'SK-08') {
        ctx.save();
        ctx.shadowColor = '#e11d48';
        ctx.shadowBlur = 24;

        // 狂暴磁暴電弧纏繞雙臂與周身 (Electromagnetic Arcs)
        ctx.strokeStyle = '#fb7185';
        ctx.lineWidth = 2.5;
        for (let arc = 0; arc < 4; arc++) {
          const arcAng = (arc * Math.PI) / 2 + t * 0.4;
          const aX1 = x + Math.cos(arcAng) * 22;
          const aY1 = y - 65 + Math.sin(arcAng) * 28;
          const aX2 = x + Math.cos(arcAng + 0.6) * 36;
          const aY2 = y - 65 + Math.sin(arcAng + 0.6) * 36;
          const midX = (aX1 + aX2) / 2 + (Math.random() - 0.5) * 12;
          const midY = (aY1 + aY2) / 2 + (Math.random() - 0.5) * 12;

          ctx.beginPath();
          ctx.moveTo(aX1, aY1);
          ctx.lineTo(midX, midY);
          ctx.lineTo(aX2, aY2);
          ctx.stroke();
        }

        // 霸體金紅重力外殼 (Super Armor Red/Gold Shell)
        ctx.strokeStyle = 'rgba(225, 29, 72, 0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(x, y - 55, 32, 52, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // ─── SK-09 雷霆震波裂空掌 (Thunder Shockwave Palm) ───
      else if (skillId === 'SK-09') {
        ctx.save();
        ctx.shadowColor = '#14b8a6';
        ctx.shadowBlur = 25;

        const palmX = x + facing * 40;
        const palmY = y - 68;

        ctx.fillStyle = '#2dd4bf';
        ctx.beginPath();
        ctx.arc(palmX, palmY, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(palmX, palmY, 9, 0, Math.PI * 2);
        ctx.fill();

        // 放射狀天青雷霆閃電叉 (Branching Lightning Forks)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        for (let k = 0; k < 6; k++) {
          const ang = (k * Math.PI) / 3 + t * 0.3;
          const lx1 = palmX + Math.cos(ang) * 16;
          const ly1 = palmY + Math.sin(ang) * 16;
          const lx2 = palmX + Math.cos(ang) * 45 + (Math.random() - 0.5) * 14;
          const ly2 = palmY + Math.sin(ang) * 45 + (Math.random() - 0.5) * 14;
          const lx3 = palmX + Math.cos(ang) * 75;
          const ly3 = palmY + Math.sin(ang) * 75;

          ctx.beginPath();
          ctx.moveTo(lx1, ly1);
          ctx.lineTo(lx2, ly2);
          ctx.lineTo(lx3, ly3);
          ctx.stroke();
        }

        ctx.restore();
      }

      // ─── SK-22 熾炎烈地波 (Ground Magma Wave) ───
      else if (skillId === 'SK-22') {
        ctx.save();
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 22;

        const gX = x + facing * 25;
        const gY = y;
        ctx.fillStyle = 'rgba(249, 115, 22, 0.6)';
        ctx.beginPath();
        ctx.ellipse(gX, gY, 35, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        for (let fl = 0; fl < 5; fl++) {
          ctx.fillStyle = fl % 2 === 0 ? '#ffedd5' : '#ea580c';
          ctx.beginPath();
          ctx.arc(gX + (fl - 2) * 12, gY - 12 - Math.abs(Math.sin(t + fl)) * 24, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // ─── SK-23 疾風連環迴旋踢 (Cyclone Triple Kick) ───
      else if (skillId === 'SK-23') {
        ctx.save();
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 24;

        const kickAngle = t * 0.65;
        for (let ring = 0; ring < 3; ring++) {
          const rRadius = 32 + ring * 12;
          const rY = y - 55 + (ring - 1) * 16;
          ctx.strokeStyle = ring === 1 ? '#ffffff' : '#34d399';
          ctx.lineWidth = 3 - ring * 0.6;
          ctx.beginPath();
          ctx.ellipse(x, rY, rRadius, rRadius * 0.45, kickAngle + ring * 0.8, 0, Math.PI * 2);
          ctx.stroke();
        }

        const bladeX = x + facing * 35;
        const bladeY = y - 60;
        ctx.strokeStyle = '#a7f3d0';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(bladeX, bladeY, 38, -0.4 * Math.PI, 0.4 * Math.PI, facing === -1);
        ctx.stroke();

        ctx.restore();
      }

      // ─── SK-25 螺旋音速霸體衝 (Armor Sonic Charge) ───
      else if (skillId === 'SK-25') {
        ctx.save();
        ctx.shadowColor = '#e879f9';
        ctx.shadowBlur = 26;

        const barrierX = x + facing * 15;
        const barrierY = y - 55;
        ctx.strokeStyle = '#f0abfc';
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(232, 121, 249, 0.25)';

        ctx.beginPath();
        for (let hx = 0; hx < 6; hx++) {
          const hAng = (hx * Math.PI) / 3;
          const px = barrierX + Math.cos(hAng) * 36;
          const py = barrierY + Math.sin(hAng) * 52;
          if (hx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 衝刺音爆錐面
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(barrierX + facing * 42, barrierY);
        ctx.lineTo(barrierX + facing * 12, barrierY - 38);
        ctx.moveTo(barrierX + facing * 42, barrierY);
        ctx.lineTo(barrierX + facing * 12, barrierY + 38);
        ctx.stroke();

        // 尾部推進離子焰流
        ctx.fillStyle = '#c026d3';
        ctx.beginPath();
        ctx.moveTo(x - facing * 20, y - 55 - 10);
        ctx.lineTo(x - facing * 55 - Math.random() * 12, y - 55);
        ctx.lineTo(x - facing * 20, y - 55 + 10);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // ─── SK-26 暗影鎖鏈重錨擊 (Shadow Chain Anchor) ───
      else if (skillId === 'SK-26') {
        ctx.save();
        ctx.shadowColor = '#94a3b8';
        ctx.shadowBlur = 20;

        const chainAnchorX = x + facing * 65;
        const chainAnchorY = y - 10;
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3.5;

        ctx.beginPath();
        ctx.moveTo(x + facing * 10, y - 75);
        ctx.quadraticCurveTo(x + facing * 45, y - 105, chainAnchorX, chainAnchorY);
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(chainAnchorX, chainAnchorY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        if (t >= 4) {
          ctx.fillStyle = '#fde047';
          for (let sp = 0; sp < 6; sp++) {
            ctx.beginPath();
            ctx.arc(chainAnchorX + (Math.random() - 0.5) * 25, chainAnchorY + Math.random() * 6, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // ─── SK-29 雷神天極轟天腿 (Thunder God Axe Kick) ───
      else if (skillId === 'SK-29') {
        ctx.save();
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 28;

        const boltX = x + facing * 35;
        const boltH = 320;
        const boltTopY = y - boltH;

        ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.moveTo(boltX, boltTopY);
        ctx.lineTo(boltX, y);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        let currY = boltTopY;
        ctx.moveTo(boltX, currY);
        while (currY < y) {
          currY += 28;
          const offsetX = (Math.random() - 0.5) * 22;
          ctx.lineTo(boltX + offsetX, currY);
        }
        ctx.stroke();

        if (t >= 6) {
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(boltX, y - 8, 26, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(boltX, y - 2, 55, 12, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // ─── SK-30 光子超能連環衝拳 (Photon Overload Fists) ───
      else if (skillId === 'SK-30') {
        ctx.save();
        ctx.shadowColor = themeCol;
        ctx.shadowBlur = 26;

        const muzzleX = x + facing * 35;
        const muzzleY = y - 68;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(muzzleX - facing * 80, muzzleY);
        ctx.lineTo(muzzleX + facing * 120, muzzleY);
        ctx.stroke();

        ctx.strokeStyle = themeCol;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(muzzleX, muzzleY - 35);
        ctx.lineTo(muzzleX, muzzleY + 35);
        ctx.stroke();

        for (let ring = 1; ring <= 3; ring++) {
          ctx.strokeStyle = ring === 1 ? '#ffffff' : themeCol;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(muzzleX + facing * (ring * 16), muzzleY, ring * 12, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }
    }
  }

  // ─── 街機風格連擊計數器 (Arcade Combo Counter HUD) ───
  _drawComboCounters(ctx, w, h) {
    const p1 = combatEngine.p1;
    const p2 = combatEngine.p2;

    const renderCombo = (fighter, isLeft) => {
      if (!fighter || fighter.comboCount < 2) return;

      ctx.save();
      const count = fighter.comboCount;
      const damage = fighter.comboDamage;
      const themeColor = isLeft ? '#00f3ff' : '#ff007f';
      const secColor = isLeft ? '#ffd700' : '#ff9900';

      // 依連擊數微幅脈衝縮放
      const pulse = 1 + Math.min(0.2, (fighter.comboResetTimer / 45) * 0.15);
      const posX = isLeft ? Math.max(80, w * 0.16) : Math.min(w - 80, w * 0.84);
      const posY = Math.max(140, h * 0.35);

      ctx.translate(posX, posY);
      ctx.scale(pulse, pulse);
      ctx.textAlign = isLeft ? 'left' : 'right';

      // 1. 連擊數主文字 (Huge arcade combo number)
      ctx.font = '900 42px "Orbitron", sans-serif';
      ctx.fillStyle = themeColor;
      ctx.shadowColor = themeColor;
      ctx.shadowBlur = 18;
      ctx.fillText(`${count} HITS!`, 0, 0);

      // 2. 總傷害與連段評價 (Total damage & combo title)
      ctx.font = 'bold 15px "Orbitron", "Noto Sans TC", sans-serif';
      ctx.fillStyle = secColor;
      ctx.shadowColor = secColor;
      ctx.shadowBlur = 10;
      let praise = 'GOOD COMBO';
      if (count >= 7) praise = '★ QUANTUM MASTER! ★';
      else if (count >= 5) praise = '★ AMAZING COMBO! ★';
      else if (count >= 3) praise = 'GREAT COMBO!';

      ctx.fillText(`DAMAGE: ${damage}  [${praise}]`, 0, 24);

      ctx.restore();
    };

    renderCombo(p1, true);
    renderCombo(p2, false);
  }

  _drawVictoryBanner(ctx, w, h) {
    if (!combatEngine.isOver) return;

    const isDraw = combatEngine.winner === 0;
    const isP1Win = combatEngine.winner === 1;
    const isP2Win = combatEngine.winner === 2;
    const winner = isP1Win ? combatEngine.p1 : (isP2Win ? combatEngine.p2 : null);
    const isLocalWinner = !isDraw && (this.matchMode === 'p2p'
      ? (this.multiplayerRole === 'guest' ? isP2Win : isP1Win)
      : isP1Win);

    let winTitle = 'VICTORY';
    let subTitle = '★ 戰鬥勝利！漂亮擊倒對手奪下冠軍 ★';
    let themeColor = '#ffd700';

    if (isDraw) {
      winTitle = 'DOUBLE K.O.';
      subTitle = '⚡ 雙方同時倒下！勢均力敵的平手對決 ⚡';
      themeColor = '#38bdf8';
    } else if (!isLocalWinner) {
      winTitle = 'DEFEAT';
      subTitle = winner ? `⚡ 本場惜敗！${winner.name} 贏得了本場對決 ⚡` : '⚡ 本場惜敗！再接再厲奪回榮耀 ⚡';
      themeColor = '#ff007f';
    }

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 背景慶祝暗幕 (壓暗背景，突出 Victory / Defeat / Draw 橫幅)
    ctx.fillStyle = 'rgba(5, 8, 20, 0.55)';
    ctx.fillRect(0, 0, w, h);

    // 冠軍光芒主橫幅 - 位於血條下方清晰可見處 (Y: ~145px)，絕不被血條或任何文字遮擋
    const cy = Math.max(136, Math.min(168, h * 0.22));
    const bannerW = Math.min(w * 0.88, 580);
    const bannerH = 76;
    const bx = w / 2 - bannerW / 2;
    const by = cy - bannerH / 2;

    ctx.fillStyle = 'rgba(11, 17, 32, 0.96)';
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 26;

    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(bx, by, bannerW, bannerH, 14);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(bx, by, bannerW, bannerH);
      ctx.strokeRect(bx, by, bannerW, bannerH);
    }

    // 主標題文字 (統一 900 44px Orbitron 大字)
    ctx.font = '900 44px "Orbitron", sans-serif';
    ctx.fillStyle = themeColor;
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 22;
    ctx.fillText(winTitle, w / 2, cy - 12);

    // 副標題文字
    ctx.font = '700 13px "Noto Sans TC", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 6;
    ctx.fillText(subTitle, w / 2, cy + 20);

    ctx.restore();
  }

  // ─── 瑪利歐風格空中高低平台繪製 (Mario Style Floating Platforms) ───
  _drawPlatforms(ctx) {
    if (!combatEngine.platforms || combatEngine.platforms.length === 0) return;
    const time = Date.now() / 400;

    combatEngine.platforms.forEach(plat => {
      const { x, y, width, height, color, id } = plat;

      ctx.save();

      // 1. 底部反重力離子噴射流 (Anti-gravity Hover Jets)
      const thrusterOffsets = [width * 0.22, width * 0.78];
      thrusterOffsets.forEach(ox => {
        const tx = x + ox;
        const ty = y + height;
        const flameH = 10 + Math.sin(time * 3 + ox) * 4;

        // 噴口基座金屬塊
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(tx - 6, ty, 12, 3);

        // 離子火焰漸變
        const grad = ctx.createLinearGradient(tx, ty + 3, tx, ty + 3 + flameH);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(tx - 5, ty + 3);
        ctx.lineTo(tx + 5, ty + 3);
        ctx.lineTo(tx, ty + 3 + flameH);
        ctx.closePath();
        ctx.fill();
      });

      // 2. 平台本體外發光與高科技金屬磚塊底色
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;

      const gradBody = ctx.createLinearGradient(x, y, x, y + height);
      gradBody.addColorStop(0, '#1a2333');
      gradBody.addColorStop(0.5, '#0f172a');
      gradBody.addColorStop(1, '#080d1a');
      ctx.fillStyle = gradBody;
      ctx.fillRect(x, y, width, height);

      // 外框與高亮站立導軌
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // 頂部實體著陸能量線 (清楚標示角色站立面)
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, 3);

      // 3. 瑪利歐風格經典磚塊交錯接縫 (Mario Cyber Brick Pattern)
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 1.5;

      const midY = y + height / 2;
      ctx.beginPath();
      ctx.moveTo(x + 2, midY);
      ctx.lineTo(x + width - 2, midY);
      ctx.stroke();

      const brickCount = 5;
      const brickW = width / brickCount;
      // 上層磚塊垂直縫
      for (let i = 1; i < brickCount; i++) {
        const bx = x + i * brickW;
        ctx.beginPath();
        ctx.moveTo(bx, y + 3);
        ctx.lineTo(bx, midY);
        ctx.stroke();
      }
      // 下層交錯垂直縫 (位移半個磚長)
      for (let i = 0; i < brickCount; i++) {
        const bx = x + (i + 0.5) * brickW;
        if (bx > x + 4 && bx < x + width - 4) {
          ctx.beginPath();
          ctx.moveTo(bx, midY);
          ctx.lineTo(bx, y + height - 1);
          ctx.stroke();
        }
      }

      // 4. 四角加固鉚釘
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      const rivets = [
        [x + 4, y + 5],
        [x + width - 4, y + 5],
        [x + 4, y + height - 5],
        [x + width - 4, y + height - 5]
      ];
      rivets.forEach(([rx, ry]) => {
        ctx.beginPath();
        ctx.arc(rx, ry, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // 5. 中央高台具有象徵瑪利歐神秘問號磚的金色問號徽記 [ ? ]
      if (id === 'plat_center') {
        ctx.save();
        ctx.font = 'bold 13px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;
        ctx.fillText('?', x + width / 2, y + height / 2);
        ctx.restore();
      }

      ctx.restore();
    });
  }

  _drawFighterFloorRings(ctx, groundY) {
    const p1 = combatEngine.p1;
    const p2 = combatEngine.p2;
    if (!p1 || !p2) return;
    const time = Date.now() / 250;

    // 當角色著陸在空中平台或地面時，光環精準貼合站立面 (p.y)
    const p1Floor = p1.isGrounded ? p1.y : groundY;
    const p2Floor = p2.isGrounded ? p2.y : groundY;

    // 1P (玩家) 腳底賽博藍光環
    ctx.save();
    ctx.translate(p1.x, p1Floor);
    ctx.scale(1, 0.3);
    ctx.beginPath();
    ctx.arc(0, 0, 46 + Math.sin(time) * 4, 0, Math.PI * 2);
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.fillStyle = 'rgba(0, 243, 255, 0.2)';
    ctx.fill();
    ctx.restore();

    // 2P (對手) 腳底粉紅光環
    ctx.save();
    ctx.translate(p2.x, p2Floor);
    ctx.scale(1, 0.3);
    ctx.beginPath();
    ctx.arc(0, 0, 46 + Math.sin(time + 1.5) * 4, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 0, 127, 0.2)';
    ctx.fill();
    ctx.restore();
  }

  _drawFighterOverheadBadges(ctx) {
    const p1 = combatEngine.p1;
    const p2 = combatEngine.p2;
    if (!p1 || !p2) return;
    const bounce = Math.sin(Date.now() / 180) * 4;

    // ─── 玩家 1P 頭頂標記 (這是玩家的角色) ───
    const p1HeadY = p1.y - 170 + bounce;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const p1IsMe = !(this.matchMode === 'p2p' && this.multiplayerRole === 'guest');

    // 1P 下指立體發光箭頭
    const p1ArrowColor = p1IsMe ? '#00f3ff' : '#ff007f';
    ctx.fillStyle = p1ArrowColor;
    ctx.shadowColor = p1ArrowColor;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1HeadY);
    ctx.lineTo(p1.x - 7, p1HeadY - 9);
    ctx.lineTo(p1.x + 7, p1HeadY - 9);
    ctx.closePath();
    ctx.fill();

    // 1P 科技毛玻璃標籤底框 (含血量顯示)
    const p1Hp = Math.max(0, Math.round(p1.hp));
    let p1Label = '★ 這是玩家的角色';
    if (this.matchMode === 'p2p') {
      p1Label = this.multiplayerRole === 'host' ? '👑 我方 (房主)' : `👑 連線房主 (${p1.name || '房主'})`;
    } else if (this.matchMode === 'local_2p') {
      p1Label = '1P 玩家';
    }

    const badgeW1 = Math.max(186, p1Label.length * 12 + 65);
    const badgeH1 = 28;
    const badgeX1 = p1.x - badgeW1 / 2;
    const badgeY1 = p1HeadY - 9 - badgeH1;

    ctx.fillStyle = p1IsMe ? 'rgba(5, 15, 30, 0.9)' : 'rgba(25, 5, 15, 0.9)';
    ctx.strokeStyle = p1IsMe ? '#00f3ff' : '#ff007f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(badgeX1, badgeY1, badgeW1, badgeH1, 6);
    } else {
      ctx.rect(badgeX1, badgeY1, badgeW1, badgeH1);
    }
    ctx.fill();
    ctx.stroke();

    // 1P 文字
    ctx.font = '900 12px "Orbitron", "Noto Sans TC", sans-serif';
    ctx.fillStyle = p1IsMe ? '#00f3ff' : '#ff007f';
    ctx.shadowColor = p1IsMe ? '#00f3ff' : '#ff007f';
    ctx.shadowBlur = 10;
    ctx.fillText(`${p1Label} [${p1Hp} HP]`, p1.x, badgeY1 + badgeH1 / 2);

    // 1P 攻擊動作細節與招式屬性標籤 (所有細節即時動態顯示)
    if (p1.currentAction) {
      const act = p1.currentAction;
      let propText = '上段';
      let propColor = '#00f3ff';
      if (act.guardType === 'crouch_only') {
        propText = '下段・掃倒';
        propColor = '#ffaa00';
      } else if (act.guardType === 'stand_only') {
        propText = '中段・破蹲';
        propColor = '#ff007f';
      } else if (act.guardType === 'unblockable') {
        propText = '投技・破防';
        propColor = '#ffd700';
      } else if (act.isRanged) {
        propText = '遠程彈道';
        propColor = '#38bdf8';
      }

      const actTagW = 200;
      const actTagH = 22;
      const actTagX = p1.x - actTagW / 2;
      const actTagY = badgeY1 - actTagH - 4;
      ctx.fillStyle = 'rgba(2, 10, 24, 0.95)';
      ctx.strokeStyle = propColor;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = propColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(actTagX, actTagY, actTagW, actTagH, 5);
      else ctx.rect(actTagX, actTagY, actTagW, actTagH);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 11px "Noto Sans TC", "Orbitron", sans-serif';
      ctx.fillStyle = propColor;
      ctx.fillText(`⚔️ ${act.name} [${propText}] ${act.damage}D`, p1.x, actTagY + actTagH / 2);
    } else if (p1.isGuarding) {
      const guardTagW = 160;
      const guardTagH = 20;
      const guardTagX = p1.x - guardTagW / 2;
      const guardTagY = badgeY1 - guardTagH - 4;
      ctx.fillStyle = 'rgba(2, 16, 32, 0.9)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(guardTagX, guardTagY, guardTagW, guardTagH, 4);
      else ctx.rect(guardTagX, guardTagY, guardTagW, guardTagH);
      ctx.fill();
      ctx.stroke();
      ctx.font = 'bold 10px "Noto Sans TC", sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`🛡️ 防護罩防禦 (50%減傷)`, p1.x, guardTagY + guardTagH / 2);
    }
    ctx.restore();

    // ─── 對手 2P 頭頂標記 ───
    const p2HeadY = p2.y - 170 - bounce;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const p2IsMe = (this.matchMode === 'p2p' && this.multiplayerRole === 'guest');

    // 2P 下指箭頭
    const p2ArrowColor = p2IsMe ? '#00f3ff' : '#ff007f';
    ctx.fillStyle = p2ArrowColor;
    ctx.shadowColor = p2ArrowColor;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(p2.x, p2HeadY);
    ctx.lineTo(p2.x - 7, p2HeadY - 9);
    ctx.lineTo(p2.x + 7, p2HeadY - 9);
    ctx.closePath();
    ctx.fill();

    // 2P 底框 (含血量顯示)
    const p2Hp = Math.max(0, Math.round(p2.hp));
    let p2Label = '電腦對手 (AI)';
    if (this.matchMode === 'p2p') {
      p2Label = this.multiplayerRole === 'host' ? `⚔️ 連線好友 (${p2.name || '挑戰者'})` : '⚔️ 我方 (挑戰者)';
    } else if (this.matchMode === 'local_2p') {
      p2Label = '2P 對手';
    } else if (this.matchMode === 'training') {
      p2Label = '訓練木樁';
    } else if (this.matchMode === 'arcade') {
      p2Label = `街機對手 (STAGE ${this.arcadeStage})`;
    }
    const badgeW2 = Math.max(168, p2Label.length * 12 + 65);
    const badgeH2 = 28;
    const badgeX2 = p2.x - badgeW2 / 2;
    const badgeY2 = p2HeadY - 9 - badgeH2;

    ctx.fillStyle = p2IsMe ? 'rgba(5, 15, 30, 0.9)' : 'rgba(25, 5, 15, 0.9)';
    ctx.strokeStyle = p2IsMe ? '#00f3ff' : '#ff007f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(badgeX2, badgeY2, badgeW2, badgeH2, 6);
    } else {
      ctx.rect(badgeX2, badgeY2, badgeW2, badgeH2);
    }
    ctx.fill();
    ctx.stroke();

    // 2P 文字
    ctx.font = '900 12px "Orbitron", "Noto Sans TC", sans-serif';
    ctx.fillStyle = p2IsMe ? '#00f3ff' : '#ff007f';
    ctx.shadowColor = p2IsMe ? '#00f3ff' : '#ff007f';
    ctx.shadowBlur = 10;
    ctx.fillText(`${p2Label} [${p2Hp} HP]`, p2.x, badgeY2 + badgeH2 / 2);

    // 2P 攻擊動作細節與招式屬性標籤
    if (p2.currentAction) {
      const act = p2.currentAction;
      let propText = '上段';
      let propColor = '#ff007f';
      if (act.guardType === 'crouch_only') {
        propText = '下段・掃倒';
        propColor = '#ffaa00';
      } else if (act.guardType === 'stand_only') {
        propText = '中段・破蹲';
        propColor = '#ff007f';
      } else if (act.guardType === 'unblockable') {
        propText = '投技・破防';
        propColor = '#ffd700';
      } else if (act.isRanged) {
        propText = '遠程彈道';
        propColor = '#38bdf8';
      }

      const actTagW = 200;
      const actTagH = 22;
      const actTagX = p2.x - actTagW / 2;
      const actTagY = badgeY2 - actTagH - 4;
      ctx.fillStyle = 'rgba(25, 5, 15, 0.95)';
      ctx.strokeStyle = propColor;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = propColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(actTagX, actTagY, actTagW, actTagH, 5);
      else ctx.rect(actTagX, actTagY, actTagW, actTagH);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 11px "Noto Sans TC", "Orbitron", sans-serif';
      ctx.fillStyle = propColor;
      ctx.fillText(`⚔️ ${act.name} [${propText}] ${act.damage}D`, p2.x, actTagY + actTagH / 2);
    } else if (p2.isGuarding) {
      const guardTagW = 160;
      const guardTagH = 20;
      const guardTagX = p2.x - guardTagW / 2;
      const guardTagY = badgeY2 - guardTagH - 4;
      ctx.fillStyle = 'rgba(28, 5, 20, 0.9)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(guardTagX, guardTagY, guardTagW, guardTagH, 4);
      else ctx.rect(guardTagX, guardTagY, guardTagW, guardTagH);
      ctx.fill();
      ctx.stroke();
      ctx.font = 'bold 10px "Noto Sans TC", sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`🛡️ 防護罩防禦 (50%減傷)`, p2.x, guardTagY + guardTagH / 2);
    }
    ctx.restore();
  }

  _updateBattleHUD() {
    // 1. 生命值與數值百分比顯示
    const hp1El = document.getElementById('p1HpFill');
    const hp2El = document.getElementById('p2HpFill');
    const hp1Text = document.getElementById('p1HpText');
    const hp2Text = document.getElementById('p2HpText');

    const p1Hp = Math.max(0, Math.round(combatEngine.p1.hp));
    const p1Max = combatEngine.p1.maxHp;
    const p2Hp = Math.max(0, Math.round(combatEngine.p2.hp));
    const p2Max = combatEngine.p2.maxHp;

    if (hp1El) hp1El.style.width = `${(p1Hp / p1Max) * 100}%`;
    if (hp2El) hp2El.style.width = `${(p2Hp / p2Max) * 100}%`;
    if (hp1Text) hp1Text.textContent = `${p1Hp} / ${p1Max}`;
    if (hp2Text) hp2Text.textContent = `${p2Hp} / ${p2Max}`;

    const p1HpBig = document.getElementById('p1HpBigText');
    const p2HpBig = document.getElementById('p2HpBigText');
    if (p1HpBig) p1HpBig.textContent = `${p1Hp} / ${p1Max}`;
    if (p2HpBig) p2HpBig.textContent = `${p2Hp} / ${p2Max}`;

    // 2. 倒數計時 (訓練模式顯示 ∞)
    const timerEl = document.getElementById('roundTimerText');
    if (timerEl) {
      timerEl.textContent = combatEngine.isTraining ? '∞' : combatEngine.roundTime;
    }

    // 3. 量子爆發計量槽
    const myPlayer = (this.matchMode === 'p2p' && this.multiplayerRole === 'guest') ? combatEngine.p2 : combatEngine.p1;
    const burst1El = document.getElementById('p1BurstFill');
    if (burst1El) burst1El.style.width = `${(myPlayer.burstMeter / myPlayer.burstMax) * 100}%`;

    // 4. 技能冷卻遮罩
    myPlayer.cooldowns.forEach((cd, idx) => {
      const overlay = document.getElementById(`skillCdOverlay_${idx}`);
      if (overlay) {
        const totalCd = myPlayer.skills[idx] ? myPlayer.skills[idx].cd : 1;
        const ratio = cd > 0 ? (cd / totalCd) : 0;
        overlay.style.height = `${ratio * 100}%`;
      }
    });

    // 5. 訓練營幀數優劣勢指示燈
    const frameEl = document.getElementById('frameAdvantageIndicator');
    if (frameEl && combatEngine.isTraining) {
      const adv = combatEngine.p1.frameAdvantage;
      if (adv > 0) {
        frameEl.innerHTML = `<span style="color: #00ff66;">有利 +${adv} 幀</span>`;
      } else if (adv < 0) {
        frameEl.innerHTML = `<span style="color: #ff007f;">不利 ${adv} 幀</span>`;
      } else {
        frameEl.innerHTML = `<span style="color: #94a3b8;">均勢 0 幀</span>`;
      }
    }

    // 6. 防護罩召喚按鈕即時高亮反饋
    const guardHudBtn = document.getElementById('guardHudBtn');
    if (guardHudBtn) {
      if (combatEngine.p1.isGuarding) {
        guardHudBtn.classList.add('active');
      } else {
        guardHudBtn.classList.remove('active');
      }
    }
    const touchGuardBtn = document.getElementById('touchGuardBtn');
    if (touchGuardBtn) {
      if (combatEngine.p1.isGuarding) {
        touchGuardBtn.classList.add('active');
      } else {
        touchGuardBtn.classList.remove('active');
      }
    }

    // 7. 終極必殺能量槽與按鈕狀態即時更新
    const super1El = document.getElementById('p1SuperFill');
    const super2El = document.getElementById('p2SuperFill');
    const superBtn = document.getElementById('superHudBtn');
    const touchSuperBtn = document.getElementById('touchSuperBtn');
    const isP1SuperReady = (combatEngine.p1.superMeter >= combatEngine.p1.superMax) || (combatEngine.p1.hp <= 350 && !combatEngine.p1.usedCrisisSuper);

    if (super1El) {
      const super1Ratio = isP1SuperReady ? 1 : (combatEngine.p1.superMeter / combatEngine.p1.superMax);
      super1El.style.width = `${Math.min(100, Math.round(super1Ratio * 100))}%`;
      super1El.style.background = isP1SuperReady
        ? 'linear-gradient(90deg, #ffd700, #ff007f)'
        : 'linear-gradient(90deg, #38bdf8, #818cf8)';
    }
    if (super2El) {
      const super2Ratio = (combatEngine.p2.superMeter / combatEngine.p2.superMax);
      super2El.style.width = `${Math.min(100, Math.round(super2Ratio * 100))}%`;
    }
    if (superBtn) {
      if (isP1SuperReady) {
        superBtn.style.opacity = '1';
        superBtn.style.boxShadow = '0 0 16px #ffd700';
      } else {
        superBtn.style.opacity = '0.45';
        superBtn.style.boxShadow = 'none';
      }
    }
    if (touchSuperBtn) {
      touchSuperBtn.style.opacity = isP1SuperReady ? '1' : '0.45';
    }
  }

  // ─── 對決結束與結算面板彈出 ───
  _showMatchEndModal() {
    soundEngine.stopBgm();

    const isDraw = combatEngine.winner === 0;
    const won = !isDraw && (this.matchMode === 'p2p'
      ? (this.multiplayerRole === 'guest' ? combatEngine.winner === 2 : combatEngine.winner === 1)
      : combatEngine.winner === 1);
    const isAi = this.matchMode === 'ai' || this.matchMode === 'arcade';
    const reward = isDraw
      ? { gained: 50, newBalance: (saveSystem.currentUser?.credits || 0) + 50 }
      : saveSystem.recordBattleResult(won, this.aiDifficulty, isAi);
    if (isDraw && saveSystem && typeof saveSystem.addCredits === 'function') {
      try {
        saveSystem.addCredits(50);
      } catch (e) {
        console.warn('Failed to add draw credits:', e);
      }
    }

    const endModal = document.getElementById('matchEndModal');
    const resultTitle = document.getElementById('matchResultTitle');
    const creditsReward = document.getElementById('matchRewardAmount');
    const playAgainBtn = document.getElementById('matchPlayAgainBtn');
    const nextStageBtn = document.getElementById('matchNextStageBtn');
    const statusHint = document.getElementById('matchRematchStatus');

    // 重置再戰旗標與狀態文字
    this.rematchRequestedByMe = false;
    this.rematchRequestedByOpponent = false;
    if (statusHint) {
      statusHint.textContent = '';
      statusHint.style.color = '#cbd5e1';
    }

    if (playAgainBtn) {
      playAgainBtn.disabled = false;
      playAgainBtn.style.opacity = '1';
      playAgainBtn.style.background = 'linear-gradient(135deg, #00f3ff, #00ff66)';
      playAgainBtn.style.color = '#050814';
      playAgainBtn.style.boxShadow = '0 0 16px rgba(0, 243, 255, 0.4)';
      playAgainBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> 再玩一次';
    }

    if (this.matchMode === 'arcade') {
      if (won) {
        this.arcadeScore += 18000 + Math.round(combatEngine.p1.hp * 12);
        this.arcadeStreakWins++;
        if (this.arcadeStage < this.arcadeMaxStages) {
          // 闖過當前關卡，準備進入下一關
          if (resultTitle) {
            resultTitle.textContent = `STAGE ${this.arcadeStage} CLEAR!`;
            resultTitle.style.color = '#ffd700';
          }
          if (creditsReward) {
            creditsReward.innerHTML = `+${reward.gained} 能量幣<div style="font-size: 13px; color: #00ff88; margin-top: 4px;">生命值恢復 +350！即將迎戰第 ${this.arcadeStage + 1} 關</div>`;
          }
          if (nextStageBtn) nextStageBtn.style.display = 'flex';
          if (playAgainBtn) playAgainBtn.style.display = 'none';
        } else {
          // 全破街機 5 連關！停止戰鬥主循環，彈出大榮譽獎盃對話框
          this.isFighting = false;
          if (this._battleLoopId) {
            cancelAnimationFrame(this._battleLoopId);
            this._battleLoopId = null;
          }
          if (endModal) endModal.classList.remove('active');
          const trophyModal = document.getElementById('arcadeTrophyModal');
          const trophyScore = document.getElementById('arcadeTrophyScore');
          if (trophyScore) trophyScore.textContent = `${this.arcadeScore.toLocaleString()} PTS`;
          try {
            if (saveSystem && typeof saveSystem.addCredits === 'function') {
              saveSystem.addCredits(2500);
            }
          } catch (e) {
            console.warn('Failed to add arcade victory credits:', e);
          }
          soundEngine.playHit('super');
          if (trophyModal) trophyModal.classList.add('active');
          this.updateUserHUD();
          return;
        }
      } else {
        // 街機闖關失敗
        if (resultTitle) {
          resultTitle.textContent = `STAGE ${this.arcadeStage} FAILED`;
          resultTitle.style.color = '#ff007f';
        }
        if (creditsReward) creditsReward.textContent = `+${reward.gained} 能量幣 (闖關止步於第 ${this.arcadeStage} 關)`;
        if (nextStageBtn) nextStageBtn.style.display = 'none';
        if (playAgainBtn) {
          playAgainBtn.style.display = 'flex';
          playAgainBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> 重試本關';
        }
      }
    } else {
      if (nextStageBtn) nextStageBtn.style.display = 'none';
      if (playAgainBtn) {
        playAgainBtn.style.display = 'flex';
      }
      if (resultTitle) {
        if (isDraw) {
          resultTitle.textContent = 'DOUBLE K.O. 平手';
          resultTitle.style.color = '#38bdf8';
        } else if (won) {
          resultTitle.textContent = 'VICTORY 戰鬥勝利';
          resultTitle.style.color = '#ffd700';
        } else {
          resultTitle.textContent = 'DEFEAT 戰鬥落敗';
          resultTitle.style.color = '#ff007f';
        }
      }
      if (creditsReward) creditsReward.textContent = `+${reward.gained} 能量幣`;
    }

    if (endModal) endModal.classList.add('active');
    this.updateUserHUD();
  }

  exitBattleToLobby() {
    this.isFighting = false;
    if (this._battleLoopId) {
      cancelAnimationFrame(this._battleLoopId);
      this._battleLoopId = null;
    }
    this.matchEndTimer = 0;
    combatEngine.isOver = true;
    soundEngine.stopBgm();
    document.body.classList.remove('in-battle');
    const fab = document.getElementById('fabStartBtn');
    if (fab) {
      fab.style.display = 'flex';
      fab.style.pointerEvents = 'auto';
    }
    const victoryOverlay = document.getElementById('battleVictoryOverlay');
    if (victoryOverlay) victoryOverlay.style.display = 'none';
    const battleScreen = document.getElementById('battleScreen');
    if (battleScreen) battleScreen.classList.remove('active');
    const endModal = document.getElementById('matchEndModal');
    if (endModal) endModal.classList.remove('active');
    const trophyModal = document.getElementById('arcadeTrophyModal');
    if (trophyModal) trophyModal.classList.remove('active');
    const trainingBar = document.getElementById('trainingToolbar');
    if (trainingBar) trainingBar.style.display = 'none';
    this.arcadeMode = false;
    this.arcadeStage = 1;
    this.arcadeScore = 0;
    this.arcadeStreakWins = 0;
    this.updateUserHUD();

    if (this.matchMode === 'p2p') {
      if (p2pNetwork.isConnected) {
        p2pNetwork.send({ type: 'rematch_exit' });
      }
      this.leaveMultiplayerRoom();
    }

    // 恢復大廳擂台或商城正面預覽循環
    if (this.currentTab === 'skins') {
      this._startPedestalLoop();
    } else if (this.currentTab === 'shop') {
      this._startShopPreviewLoop();
    }
  }

  playAgain() {
    const endModal = document.getElementById('matchEndModal');
    const victoryOverlay = document.getElementById('battleVictoryOverlay');
    const playAgainBtn = document.getElementById('matchPlayAgainBtn');
    const statusHint = document.getElementById('matchRematchStatus');

    // 1. 若非多人連線 (AI、街機、練習模式)，直接啟動新對局
    if (this.matchMode !== 'p2p') {
      if (endModal) endModal.classList.remove('active');
      if (victoryOverlay) victoryOverlay.style.display = 'none';
      this._launchMatch();
      return;
    }

    // 2. 多人連線模式：方案 B 雙向確認機制
    if (!p2pNetwork.isConnected) {
      if (statusHint) {
        statusHint.textContent = '⚠️ 連線已斷開，無法再戰，請返回大廳重新配對';
        statusHint.style.color = '#ff4d4d';
      }
      if (playAgainBtn) {
        playAgainBtn.disabled = true;
        playAgainBtn.style.opacity = '0.5';
      }
      return;
    }

    // 情境 A：對方已經先按了「再玩一次」向我發出請求，我現在點擊「點此同意」！
    if (this.rematchRequestedByOpponent) {
      if (playAgainBtn) {
        playAgainBtn.disabled = true;
        playAgainBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 準備開始...';
      }
      if (statusHint) {
        statusHint.textContent = '⚡ 雙方已同意再戰！即將進入同步倒數...';
        statusHint.style.color = '#00ff88';
      }

      if (this.multiplayerRole === 'host') {
        p2pNetwork.send({ type: 'rematch_start' });
        this._launchRematchCountdown();
      } else {
        p2pNetwork.send({ type: 'rematch_accept' });
        // 為防極端延遲，若 600ms 內未收到房主的 start 亦安全啟動
        setTimeout(() => {
          if (this.matchMode === 'p2p' && !this.isFighting && !this.isCountdownActive) {
            this._launchRematchCountdown();
          }
        }, 600);
      }
      return;
    }

    // 情境 B：我是第一位按下「再玩一次」的玩家，向對方發出邀請
    this.rematchRequestedByMe = true;
    p2pNetwork.send({ type: 'rematch_request' });

    if (playAgainBtn) {
      playAgainBtn.disabled = true;
      playAgainBtn.style.opacity = '0.85';
      playAgainBtn.style.background = 'rgba(255, 255, 255, 0.15)';
      playAgainBtn.style.color = '#ffd700';
      playAgainBtn.style.boxShadow = 'none';
      playAgainBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ⏳ 等待對方同意再戰...';
    }

    if (statusHint) {
      statusHint.textContent = '📡 已向對方發送再戰邀請，等待對方確認中...';
      statusHint.style.color = '#00f3ff';
    }
  }

  _launchRematchCountdown() {
    const endModal = document.getElementById('matchEndModal');
    if (endModal) endModal.classList.remove('active');
    const victoryOverlay = document.getElementById('battleVictoryOverlay');
    if (victoryOverlay) victoryOverlay.style.display = 'none';

    this.rematchRequestedByMe = false;
    this.rematchRequestedByOpponent = false;
    this.isMultiplayerMatchUnlocked = false;
    this.peerArenaLoaded = false;
    if (this._unlockSafetyTimer) {
      clearTimeout(this._unlockSafetyTimer);
      this._unlockSafetyTimer = null;
    }

    if (this._battleLoopId) {
      cancelAnimationFrame(this._battleLoopId);
      this._battleLoopId = null;
    }
    this.isFighting = false;

    // 啟動無廣播的 3-2-1 開賽倒數，倒數結束後直接同步進入 _launchMultiplayerBattle()
    this._startMatchCountdown(false);
  }

  _syncVictoryOverlay(isLocalWinner, isDraw, winnerFighter) {
    const vOverlay = document.getElementById('battleVictoryOverlay');
    const titleEl = document.getElementById('battleVictoryTitle');
    const subEl = document.getElementById('battleVictorySub');
    if (!vOverlay || !titleEl || !subEl) return;

    const card = vOverlay.querySelector('div');

    if (isDraw) {
      if (card) {
        card.style.borderColor = '#38bdf8';
        card.style.boxShadow = '0 0 35px rgba(56, 189, 248, 0.75), inset 0 0 15px rgba(56, 189, 248, 0.25)';
      }
      titleEl.textContent = 'DOUBLE K.O.';
      titleEl.style.color = '#38bdf8';
      titleEl.style.textShadow = '0 0 25px rgba(56, 189, 248, 0.95), 0 0 50px rgba(56, 189, 248, 0.7), 2px 2px 4px #000';
      subEl.textContent = '⚡ 雙方同時倒下！勢均力敵的平手對決 ⚡';
    } else if (isLocalWinner) {
      if (card) {
        card.style.borderColor = '#ffd700';
        card.style.boxShadow = '0 0 35px rgba(255, 215, 0, 0.75), inset 0 0 15px rgba(255, 215, 0, 0.25)';
      }
      titleEl.textContent = 'VICTORY';
      titleEl.style.color = '#ffd700';
      titleEl.style.textShadow = '0 0 25px rgba(255, 215, 0, 0.95), 0 0 50px rgba(255, 215, 0, 0.7), 2px 2px 4px #000';
      subEl.textContent = '★ 戰鬥勝利！漂亮擊倒對手奪下冠軍 ★';
    } else {
      if (card) {
        card.style.borderColor = '#ff007f';
        card.style.boxShadow = '0 0 35px rgba(255, 0, 127, 0.75), inset 0 0 15px rgba(255, 0, 127, 0.25)';
      }
      titleEl.textContent = 'DEFEAT';
      titleEl.style.color = '#ff007f';
      titleEl.style.textShadow = '0 0 25px rgba(255, 0, 127, 0.95), 0 0 50px rgba(255, 0, 127, 0.7), 2px 2px 4px #000';
      subEl.textContent = winnerFighter ? `⚡ 本場惜敗！${winnerFighter.name} 贏得了本場對決 ⚡` : '⚡ 本場惜敗！再接再厲奪回榮耀 ⚡';
    }

    vOverlay.style.display = 'block';
  }

  // ─── 事件綁定 ───
  _bindDOMEvents() {
    // 導航分頁切換
    document.querySelectorAll('.nav-tab-btn[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    // 點擊使用者頭像打開量子授權儀
    const userBadge = document.getElementById('userBadge');
    if (userBadge) {
      userBadge.addEventListener('click', () => this.openAuthModal());
    }

    // 展示台 4 大動作按鈕
    const pPunch = document.getElementById('pedestalPunchBtn');
    const pKick = document.getElementById('pedestalKickBtn');
    const pJump = document.getElementById('pedestalJumpBtn');
    const pGuard = document.getElementById('pedestalGuardBtn');

    if (pPunch) pPunch.onclick = () => this.previewPedestalAction('light_punch');
    if (pKick) pKick.onclick = () => this.previewPedestalAction('heavy_kick');
    if (pJump) pJump.onclick = () => this.previewPedestalAction('jump');
    if (pGuard) pGuard.onclick = () => this.previewPedestalAction('high_guard');

    // 常駐右下角開始按鈕 (FAB)
    const fab = document.getElementById('fabStartBtn');
    if (fab) {
      fab.onclick = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        this.openModeSelectModal();
      };
    }

    // 點擊對話框半透明背景關閉
    const modeModal = document.getElementById('modeSelectModal');
    if (modeModal) {
      modeModal.addEventListener('click', (e) => {
        if (e.target === modeModal) {
          this.closeModeSelectModal();
        }
      });
    }

    // 模式選擇：對戰 AI (4 種難度)
    document.querySelectorAll('.select-ai-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const diff = btn.dataset.diff;
        document.getElementById('modeSelectModal').classList.remove('active');
        this.startBattle('ai', diff);
      });
    });

    // 模式選擇：本地同機雙人
    const local2pBtn = document.getElementById('selectLocal2pBtn');
    if (local2pBtn) {
      local2pBtn.onclick = () => {
        document.getElementById('modeSelectModal').classList.remove('active');
        this.startBattle('local_2p');
      };
    }

    // 模式選擇：單人街機闖關模式 (Arcade Mode)
    const startArcadeBtn = document.getElementById('startArcadeModeBtn');
    if (startArcadeBtn) {
      startArcadeBtn.onclick = () => {
        document.getElementById('modeSelectModal').classList.remove('active');
        this.startArcadeMode();
      };
    }

    // 街機闖關進入下一關按鈕
    const matchNextBtn = document.getElementById('matchNextStageBtn');
    if (matchNextBtn) {
      matchNextBtn.onclick = () => {
        this.nextArcadeStage();
      };
    }

    // 街機通關王者獎盃對話框領取獎勵
    const trophyClaimBtn = document.getElementById('arcadeTrophyClaimBtn');
    if (trophyClaimBtn) {
      trophyClaimBtn.onclick = () => {
        const tModal = document.getElementById('arcadeTrophyModal');
        if (tModal) tModal.classList.remove('active');
        this.exitBattleToLobby();
      };
    }
    const trophyCloseBtn = document.getElementById('arcadeTrophyCloseBtn');
    if (trophyCloseBtn) {
      trophyCloseBtn.onclick = () => {
        const tModal = document.getElementById('arcadeTrophyModal');
        if (tModal) tModal.classList.remove('active');
        this.exitBattleToLobby();
      };
    }
    const trophyModal = document.getElementById('arcadeTrophyModal');
    if (trophyModal) {
      trophyModal.addEventListener('click', (e) => {
        if (e.target === trophyModal) {
          trophyModal.classList.remove('active');
          this.exitBattleToLobby();
        }
      });
    }

    // 戰鬥主題場景選擇按鈕
    document.querySelectorAll('.stage-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.stage-select-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedStageId = btn.dataset.stage;
        soundEngine.playUI('click');
      });
    });

    // 模式選擇：自由格鬥訓練營
    const trainingBtn = document.getElementById('selectTrainingBtn');
    if (trainingBtn) {
      trainingBtn.onclick = () => {
        document.getElementById('modeSelectModal').classList.remove('active');
        this.startBattle('training');
      };
    }

    // 模式選擇：雙人連線房間 (P2P 6 位數房間大廳與對決系統)
    const hostRoomBtn = document.getElementById('hostRoomBtn');
    if (hostRoomBtn) {
      hostRoomBtn.onclick = () => {
        this.openHostRoom();
      };
    }

    const joinRoomBtn = document.getElementById('joinRoomBtn');
    if (joinRoomBtn) {
      joinRoomBtn.onclick = () => {
        this.openJoinRoomModal();
      };
    }

    const confirmJoinBtn = document.getElementById('confirmJoinRoomBtn');
    if (confirmJoinBtn) {
      confirmJoinBtn.onclick = () => {
        const input = document.getElementById('joinRoomCodeInput');
        this.confirmJoinRoom(input ? input.value : '');
      };
    }

    const cancelJoinBtn = document.getElementById('cancelJoinRoomBtn');
    if (cancelJoinBtn) {
      cancelJoinBtn.onclick = () => {
        document.getElementById('joinRoomModal').classList.remove('active');
      };
    }

    const closeJoinBtn = document.getElementById('closeJoinRoomModalBtn');
    if (closeJoinBtn) {
      closeJoinBtn.onclick = () => {
        document.getElementById('joinRoomModal').classList.remove('active');
      };
    }

    const joinInput = document.getElementById('joinRoomCodeInput');
    if (joinInput) {
      joinInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.confirmJoinRoom(joinInput.value);
        }
      };
      joinInput.oninput = (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
        const err = document.getElementById('joinRoomErrorMsg');
        if (err) err.style.display = 'none';
      };
    }

    const copyRoomBtn = document.getElementById('copyRoomCodeBtn');
    if (copyRoomBtn) {
      copyRoomBtn.onclick = () => {
        if (!this.multiplayerRoomCode) return;
        const code = this.multiplayerRoomCode;
        const showSuccess = () => {
          const s = document.getElementById('copyRoomCodeSuccess');
          if (s) {
            s.style.display = 'inline';
            setTimeout(() => { s.style.display = 'none'; }, 2200);
          }
          soundEngine.playUI('click');
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(showSuccess, () => {
            fallbackCopy();
          });
        } else {
          fallbackCopy();
        }

        function fallbackCopy() {
          const ta = document.createElement('textarea');
          ta.value = code;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          try {
            document.execCommand('copy');
            showSuccess();
          } catch (e) {}
          document.body.removeChild(ta);
        }
      };
    }

    const leaveRoomBtn = document.getElementById('leaveRoomBtn');
    if (leaveRoomBtn) {
      leaveRoomBtn.onclick = () => this.leaveMultiplayerRoom();
    }

    const closeRoomBtn = document.getElementById('closeRoomModalBtn');
    if (closeRoomBtn) {
      closeRoomBtn.onclick = () => this.leaveMultiplayerRoom();
    }

    const roomReadyBtn = document.getElementById('roomReadyBtn');
    if (roomReadyBtn) {
      roomReadyBtn.onclick = () => this.toggleMultiplayerReady();
    }

    const simOppBtn = document.getElementById('roomSimulateOpponentBtn');
    if (simOppBtn) {
      simOppBtn.onclick = () => this.simulateTestOpponent();
    }

    document.querySelectorAll('.room-loadout-filter-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.room-loadout-filter-btn').forEach(b => {
          b.classList.remove('active');
          b.style.background = 'transparent';
        });
        btn.classList.add('active');
        btn.style.background = 'rgba(255,255,255,0.1)';
        this.multiplayerRoomFilter = btn.dataset.filter || 'all';
        this._renderRoomWeaponGrid();
        soundEngine.playUI('click');
      };
    });

    // 授權儀表單處理 (途徑一：手動 Gmail，跨電腦自動雲端還原)
    const emailForm = document.getElementById('manualEmailForm');
    if (emailForm) {
      emailForm.onsubmit = async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('authEmailInput');
        const nickInput = document.getElementById('authNicknameInput');
        const submitBtn = document.getElementById('authSubmitBtn');
        const email = emailInput ? emailInput.value.trim() : '';
        const nick = nickInput ? nickInput.value.trim() : '';

        if (!email.includes('@') || !email.includes('.')) {
          alert('請輸入有效的 Gmail 信箱格式！');
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fa-solid fa-rotate fa-spin"></i> 正在檢索雲端存檔...';
        }

        try {
          const res = await saveSystem.loginWithEmail(email, nick);
          soundEngine.playUI('equip');

          if (res.restoreSource === 'cloud') {
            alert(`☁️ 跨電腦雲端存檔還原成功！\n歡迎回來，${res.user.nickname}！\n已成功自全球雲端同步您上次遊玩之能量幣 (${res.user.credits.toLocaleString()}) 與所有外觀。`);
          } else if (res.isNewUser) {
            alert(`🎉 歡迎新戰士！已發放 1,200 能量幣與 3 套預設造型，並建立全球雲端存檔。`);
          } else {
            alert(`✅ 歡迎回來！已載入進度並同步至全球雲端。`);
          }

          this.updateUserHUD();
          this.renderSkinsInventory();
          this.renderShopCatalog();
          this.closeAuthModal();
        } catch (err) {
          console.error('Login error:', err);
          alert('登入處理發生問題，請再試一次。');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> 確認登入並自雲端還原進度';
          }
        }
      };
    }

    // 立即強制雲端雙向同步按鈕
    const forceCloudSyncBtn = document.getElementById('forceCloudSyncBtn');
    if (forceCloudSyncBtn) {
      forceCloudSyncBtn.onclick = async () => {
        if (saveSystem.isGuest) {
          alert('訪客身分無法同步雲端，請先在下方輸入 Gmail 登入！');
          return;
        }
        forceCloudSyncBtn.disabled = true;
        forceCloudSyncBtn.innerHTML = '<i class="fa-solid fa-rotate fa-spin"></i> 同步中...';
        const res = await saveSystem.syncWithCloud();
        forceCloudSyncBtn.disabled = false;
        forceCloudSyncBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> 立即同步';

        if (res.success) {
          soundEngine.playUI('equip');
          this.updateUserHUD();
          this.renderSkinsInventory();
          this.renderShopCatalog();
          this.renderRegisteredAccounts();
          alert(`✅ 跨電腦雙向同步成功！\n已拉取最新雲端存檔。\n目前帳號：${res.user.email}\n能量幣：${res.user.credits.toLocaleString()}`);
        } else {
          soundEngine.playHit('guard');
          alert(`⚠️ 同步失敗：${res.reason || res.error || '網路異常'}`);
        }
      };
    }

    // 複製備用量子存檔代碼
    const exportSaveTokenBtn = document.getElementById('exportSaveTokenBtn');
    if (exportSaveTokenBtn) {
      exportSaveTokenBtn.onclick = () => {
        const token = saveSystem.exportSaveToken();
        if (!token) {
          alert('當前無有效帳號存檔可複製！');
          return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(token).then(() => {
            soundEngine.playUI('equip');
            alert('📋 萬用存檔代碼已複製到剪貼簿！\n您可以在其他電腦或瀏覽器點擊「導入存檔代碼」立即還原！');
          }).catch(() => {
            prompt('請手動複製下列存檔代碼：', token);
          });
        } else {
          prompt('請手動複製下列存檔代碼：', token);
        }
      };
    }

    // 導入備用量子存檔代碼
    const importSaveTokenBtn = document.getElementById('importSaveTokenBtn');
    if (importSaveTokenBtn) {
      importSaveTokenBtn.onclick = async () => {
        const token = prompt('請貼上以 CY-SAVE- 開頭的量子存檔代碼：');
        if (!token || !token.trim()) return;

        const res = await saveSystem.importSaveToken(token.trim());
        if (res.success) {
          soundEngine.playUI('equip');
          this.updateUserHUD();
          this.renderSkinsInventory();
          this.renderShopCatalog();
          this.renderRegisteredAccounts();
          alert(`🎉 存檔代碼導入成功！\n帳號：${res.user.email}\n暱稱：${res.user.nickname}\n能量幣：${res.user.credits.toLocaleString()}\n已自動同步至全球雲端！`);
        } else {
          soundEngine.playHit('guard');
          alert(`❌ 存檔代碼導入失敗：${res.reason || '代碼無效'}`);
        }
      };
    }

    // 訪客試玩按鈕
    const guestBtn = document.getElementById('authGuestBtn');
    if (guestBtn) {
      guestBtn.onclick = () => {
        saveSystem.loginAsGuest();
        this.updateUserHUD();
        this.closeAuthModal();
        soundEngine.playUI('click');
      };
    }

    // 錯誤回報表單送出
    const bugForm = document.getElementById('bugReportForm');
    if (bugForm) {
      bugForm.onsubmit = (e) => {
        e.preventDefault();
        const ticketCode = 'BUG-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.floor(1000 + Math.random() * 9000);
        soundEngine.playUI('equip');
        alert(`✅ 感謝您的反饋！工單已成功派發：【${ticketCode}】\n系統已自動打包您的 UID、Gmail 與效能幀數數據。`);
        bugForm.reset();
      };
    }

    // 音效開關
    const muteBtn = document.getElementById('muteToggleBtn');
    if (muteBtn) {
      muteBtn.onclick = () => {
        soundEngine.setMuted(!soundEngine.isMuted);
        muteBtn.innerHTML = soundEngine.isMuted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
      };
    }

    // 賽後「再玩一次」按鈕與「回到大廳」按鈕
    const playAgainBtn = document.getElementById('matchPlayAgainBtn');
    if (playAgainBtn) {
      playAgainBtn.onclick = () => this.playAgain();
    }

    const backLobbyBtn = document.getElementById('matchBackLobbyBtn');
    if (backLobbyBtn) {
      backLobbyBtn.onclick = () => this.exitBattleToLobby();
    }

    // 左上角常駐退出鈕
    const cornerExitBtn = document.getElementById('battleCornerExitBtn');
    if (cornerExitBtn) {
      cornerExitBtn.onclick = () => this.exitBattleToLobby();
    }

    // HUD 中央計時器下方退出鈕
    const hudExitBtn = document.getElementById('battleHudExitBtn');
    if (hudExitBtn) {
      hudExitBtn.onclick = () => this.exitBattleToLobby();
    }

    // 自由訓練營退出按鈕
    const exitTrainingBtn = document.getElementById('exitTrainingBtn');
    if (exitTrainingBtn) {
      exitTrainingBtn.onclick = () => this.exitBattleToLobby();
    }

    // 自由訓練營重置按鈕
    const resetTrainingBtn = document.getElementById('resetTrainingBtn');
    if (resetTrainingBtn) {
      resetTrainingBtn.onclick = () => {
        combatEngine.p1.hp = combatEngine.p1.maxHp;
        combatEngine.p2.hp = combatEngine.p2.maxHp;
        combatEngine.p1.x = 200;
        combatEngine.p2.x = 800;
        combatEngine.p1.vx = 0;
        combatEngine.p1.vy = 0;
        combatEngine.p2.vx = 0;
        combatEngine.p2.vy = 0;
        combatEngine.p1.state = 'idle';
        combatEngine.p2.state = 'idle';
        combatEngine.p1.cooldowns = [0, 0, 0];
        combatEngine.p2.cooldowns = [0, 0, 0];
        combatEngine.floatingTexts.push({
          text: 'RESET COMPLETED!',
          x: 500,
          y: 260,
          color: '#ffd700',
          life: 40
        });
        soundEngine.playUI('click');
      };
    }

    // 社群外觀工作坊彈窗
    const workshopBtn = document.getElementById('workshopOpenBtn');
    if (workshopBtn) {
      workshopBtn.onclick = () => {
        const m = document.getElementById('workshopModal');
        if (m) m.classList.add('active');
        soundEngine.playUI('click');
      };
    }

    // 「如何共創」詳細圖文指引彈窗入口
    const openHowToContributeBtn = document.getElementById('openHowToContributeBtn');
    if (openHowToContributeBtn) {
      openHowToContributeBtn.onclick = () => {
        const workshopModal = document.getElementById('workshopModal');
        if (workshopModal) workshopModal.classList.remove('active');
        const howToModal = document.getElementById('howToContributeModal');
        if (howToModal) howToModal.classList.add('active');
        soundEngine.playUI('click');
      };
    }

    // 從「如何共創」返回工作坊
    const backToWorkshopBtn = document.getElementById('backToWorkshopBtn');
    if (backToWorkshopBtn) {
      backToWorkshopBtn.onclick = () => {
        const howToModal = document.getElementById('howToContributeModal');
        if (howToModal) howToModal.classList.remove('active');
        const workshopModal = document.getElementById('workshopModal');
        if (workshopModal) workshopModal.classList.add('active');
        soundEngine.playUI('click');
      };
    }

    // 商城系列分類過濾
    document.querySelectorAll('.shop-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.shop-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const series = btn.dataset.series;
        this.renderShopCatalog(series);
        soundEngine.playUI('click');
      });
    });

    // 戰備補給領取按鈕（嚴格每日限領一次）
    const claimRewardBtn = document.getElementById('dailyRewardClaimBtn');
    if (claimRewardBtn) {
      claimRewardBtn.addEventListener('click', () => {
        if (!saveSystem.currentUser) return;
        const res = saveSystem.claimDailySupply(1500);
        if (res.success) {
          this.updateUserHUD();
          this.updateDailySupplyUI();
          soundEngine.playUI('equip');
          alert(`🎁 每日戰備補給領取成功！\n\n已獲得 +1,500 能量幣！\n當前能量幣餘額：${res.newBalance.toLocaleString()} 幣。\n\n⚠️ 每日僅限領取 1 次，明天 00:00 後可再次領取！快去商城解鎖心儀的英雄吧！`);
          this.renderShopCatalog();
        } else {
          soundEngine.playUI('error');
          const resetTime = saveSystem.getTimeUntilNextDailyReset();
          alert(`⚠️ 今日戰備補給已領取完畢！\n\n每天只能領取一次戰備補給，拿完就只能等隔天了。\n距離明天 00:00 重置還剩：${resetTime}。\n請明天再來領取！`);
        }
      });
    }

    // 所有關閉按鈕
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.onclick = () => {
        const m = btn.closest('.modal-overlay');
        if (m) m.classList.remove('active');
        if (!this.isFighting && this.currentTab === 'skins') {
          this._startPedestalLoop();
        } else if (!this.isFighting && this.currentTab === 'shop') {
          this._startShopPreviewLoop();
        }
      };
    });
  }

  _bindKeyboardEvents() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.key === 'Escape') {
        if (this.isFighting) {
          this.exitBattleToLobby();
        } else {
          document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
          if (this.currentTab === 'skins') {
            this._startPedestalLoop();
          } else if (this.currentTab === 'shop') {
            this._startShopPreviewLoop();
          }
        }
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  _bindTouchEvents() {
    // 左側虛擬搖桿 (動態中心)
    const joyZone = document.getElementById('mobileJoystickZone');
    if (joyZone) {
      joyZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = joyZone.getBoundingClientRect();
        this._updateJoystick(touch.clientX - rect.left - rect.width / 2, touch.clientY - rect.top - rect.height / 2);
      });
      joyZone.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = joyZone.getBoundingClientRect();
        this._updateJoystick(touch.clientX - rect.left - rect.width / 2, touch.clientY - rect.top - rect.height / 2);
      });
      joyZone.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.mobileInputs.x = 0;
        this.mobileInputs.y = 0;
      });
    }

    // 右側技能觸控按鈕
    const bindTouchBtn = (id, key) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('touchstart', (e) => {
          e.preventDefault();
          this.mobileInputs[key] = true;
        });
        btn.addEventListener('touchend', (e) => {
          e.preventDefault();
          this.mobileInputs[key] = false;
        });
      }
    };

    bindTouchBtn('touchPunchBtn', 'punch');
    bindTouchBtn('touchKickBtn', 'kick');
    bindTouchBtn('touchGuardBtn', 'guard');
    bindTouchBtn('touchSkill1Btn', 'skill1');
    bindTouchBtn('touchSkill2Btn', 'skill2');
    bindTouchBtn('touchSkill3Btn', 'skill3');
    bindTouchBtn('touchSkill4Btn', 'skill4');
    bindTouchBtn('touchSkill5Btn', 'skill5');
    bindTouchBtn('touchBurstBtn', 'burst');
    bindTouchBtn('touchSuperBtn', 'superMove');
  }

  _updateJoystick(dx, dy) {
    const dist = Math.hypot(dx, dy);
    const maxRadius = 60;
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);
    this.mobileInputs.x = (Math.cos(angle) * clampedDist) / maxRadius;
    this.mobileInputs.y = (Math.sin(angle) * clampedDist) / maxRadius;
  }

  // ─── 雙人連線房間 (P2P 6 位數房間大廳與武器即時選擇系統) ───

  openHostRoom() {
    const modeModal = document.getElementById('modeSelectModal');
    if (modeModal) modeModal.classList.remove('active');

    this.matchMode = 'p2p';
    this.multiplayerRole = 'host';
    this._isSimulatedOpponent = false;
    this.multiplayerOpponentConnected = false;
    this.multiplayerMyReady = false;
    this.multiplayerOpponentReady = false;
    this.multiplayerOpponentData = null;
    this.multiplayerRoomFilter = 'all';
    this.isCountdownActive = false;

    // 產生 6 位純數字代碼並初始化 Host
    this.multiplayerRoomCode = p2pNetwork.initHost((status, data) => {
      this._handleP2PStatusChange(status, data);
    });

    p2pNetwork.onDataCallback = (data) => {
      this._handleP2PData(data);
    };

    this._openMultiplayerRoomModal();
  }

  openJoinRoomModal() {
    const modeModal = document.getElementById('modeSelectModal');
    if (modeModal) modeModal.classList.remove('active');

    const joinModal = document.getElementById('joinRoomModal');
    if (joinModal) {
      joinModal.classList.add('active');
      const input = document.getElementById('joinRoomCodeInput');
      if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 150);
      }
      const err = document.getElementById('joinRoomErrorMsg');
      if (err) err.style.display = 'none';
    }
  }

  confirmJoinRoom(code) {
    const cleanCode = String(code || '').trim().replace(/[^0-9]/g, '');
    const err = document.getElementById('joinRoomErrorMsg');

    if (cleanCode.length !== 6) {
      if (err) {
        err.textContent = '⚠️ 請輸入完整的 6 位純數字房間代碼！';
        err.style.display = 'block';
      }
      return;
    }

    const joinModal = document.getElementById('joinRoomModal');
    if (joinModal) joinModal.classList.remove('active');

    this.matchMode = 'p2p';
    this.multiplayerRole = 'guest';
    this.multiplayerRoomCode = cleanCode;
    this._isSimulatedOpponent = false;
    this.multiplayerOpponentConnected = false;
    this.multiplayerMyReady = false;
    this.multiplayerOpponentReady = false;
    this.multiplayerOpponentData = null;
    this.multiplayerRoomFilter = 'all';
    this.isCountdownActive = false;

    p2pNetwork.joinRoom(cleanCode, (status, data) => {
      this._handleP2PStatusChange(status, data);
    });

    p2pNetwork.onDataCallback = (data) => {
      this._handleP2PData(data);
    };

    this._openMultiplayerRoomModal();
  }

  _openMultiplayerRoomModal() {
    const roomModal = document.getElementById('multiplayerRoomModal');
    if (!roomModal) return;
    roomModal.classList.add('active');

    // 顯示 6 位數房間代碼
    const codeDisplay = document.getElementById('roomCodeDisplay') || document.getElementById('multiplayerRoomCodeDisplay');
    if (codeDisplay) {
      codeDisplay.textContent = this.multiplayerRoomCode || '------';
    }

    const copySuccess = document.getElementById('copyRoomCodeSuccess');
    if (copySuccess) copySuccess.style.display = 'none';

    // 連線狀態提示
    const badge = document.getElementById('roomConnStatusBadge');
    if (badge) {
      if (this.multiplayerRole === 'host') {
        badge.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> 等待好友輸入 6 位代碼加入中...';
        badge.style.color = '#38bdf8';
      } else {
        badge.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> 正在連線至房間 ${this.multiplayerRoomCode}...`;
        badge.style.color = '#ffd700';
      }
    }

    // 載入當前武裝配置
    let savedLoadout = null;
    try {
      const raw = localStorage.getItem('quantum_arena_last_loadout');
      if (raw) savedLoadout = JSON.parse(raw);
    } catch (e) {}
    const u = saveSystem.currentUser;
    if (Array.isArray(savedLoadout) && savedLoadout.length > 0) {
      this.loadoutSelection = [...savedLoadout];
    } else if (u && Array.isArray(u.loadout) && u.loadout.length > 0) {
      this.loadoutSelection = [...u.loadout];
    } else if (!this.loadoutSelection || this.loadoutSelection.length === 0) {
      this.loadoutSelection = ['SK-01', 'SK-02', 'SK-03', 'SK-10', 'SK-11'];
    }

    this._renderRoomWeaponSlots();
    this._renderRoomWeaponGrid();
    this._updateRoomPlayersCard();
    this._updateRoomReadyButton();
    this._updateRoomFavCountBadge();
  }

  _renderRoomWeaponSlots() {
    const container = document.getElementById('roomLoadoutSlotsContainer');
    const countEl = document.getElementById('roomLoadoutSelectedCount');
    if (countEl) countEl.textContent = `已選擇 ${this.loadoutSelection.length} / 5 招`;
    if (!container) return;

    container.innerHTML = [0, 1, 2, 3, 4].map(idx => {
      const skillId = this.loadoutSelection[idx];
      const sk = SKILLS.find(s => s.id === skillId);
      if (!sk) {
        return `
          <div class="room-slot-card" style="border-style: dashed; opacity: 0.5;">
            <div style="font-size: 10px; color: #94a3b8; font-weight: 800;">槽位 ${idx + 1}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">(空)</div>
          </div>
        `;
      }
      return `
        <div class="room-slot-card" style="border-color: ${sk.color}; background: rgba(0,0,0,0.5);">
          <div style="font-size: 10px; color: ${sk.color}; font-weight: 800;">槽位 ${idx + 1}</div>
          <div style="display: flex; align-items: center; justify-content: center; gap: 4px; margin-top: 2px;">
            <i class="${sk.icon}" style="color: ${sk.color}; font-size: 11px;"></i>
            <span style="font-size: 11px; font-weight: 800; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 75px;">${sk.name}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  _updateRoomFavCountBadge() {
    const el = document.getElementById('roomFavCountBadge');
    if (el) el.textContent = this.favoriteSkills ? this.favoriteSkills.length : 0;
  }

  _renderRoomWeaponGrid() {
    const container = document.getElementById('roomSkillsGrid');
    if (!container) return;

    const filter = this.multiplayerRoomFilter || 'all';
    let list = SKILLS;
    if (filter === 'favorites') {
      list = SKILLS.filter(s => this.isFavoriteSkill(s.id));
    } else if (filter === 'ranged') {
      list = SKILLS.filter(s => s.category === 'ranged');
    } else if (filter === 'melee') {
      list = SKILLS.filter(s => s.category === 'melee');
    }

    if (filter === 'favorites' && list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 25px 10px; color: #94a3b8; font-size: 12px;">
          <i class="fa-solid fa-star" style="font-size: 24px; color: #ffd700; margin-bottom: 6px; display: block;"></i>
          尚無我的最愛招式！請點擊招式卡片上的 ⭐ 星號加入收藏。
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(sk => {
      const isSelected = this.loadoutSelection.includes(sk.id);
      const slotIndex = this.loadoutSelection.indexOf(sk.id);
      const isRanged = sk.category === 'ranged';
      const isFav = this.isFavoriteSkill(sk.id);

      return `
        <div class="room-skill-item ${isSelected ? 'equipped' : ''}" data-id="${sk.id}" style="border-color: ${isSelected ? '#00f3ff' : 'rgba(255,255,255,0.1)'};">
          <div style="width: 32px; height: 32px; border-radius: 6px; background: rgba(0,0,0,0.5); border: 1px solid ${sk.color}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <i class="${sk.icon}" style="color: ${sk.color}; font-size: 14px;"></i>
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; font-weight: 800; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${sk.name}</span>
              <div style="display: flex; align-items: center; gap: 4px;">
                <button class="room-fav-star-btn" data-fav-id="${sk.id}" style="background: none; border: none; cursor: pointer; color: ${isFav ? '#ffd700' : '#64748b'}; font-size: 12px; padding: 2px;">
                  <i class="fa-${isFav ? 'solid' : 'regular'} fa-star"></i>
                </button>
                ${isSelected ? `<span style="font-size: 9px; font-weight: 900; background: #00f3ff; color: #000; padding: 1px 4px; border-radius: 3px;">槽位 ${slotIndex + 1}</span>` : ''}
              </div>
            </div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 1px; display: flex; align-items: center; gap: 5px;">
              <span>${isRanged ? '🏹 遠程' : '⚔️ 近戰'}</span>
              <span style="color: ${sk.tierColor}; font-weight: 700;">${sk.tierName}</span>
              <span>| 傷 ${sk.damage} | CD ${sk.cd}s</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // 綁定卡片點選與星號
    container.querySelectorAll('.room-skill-item').forEach(item => {
      const id = item.dataset.id;
      const starBtn = item.querySelector('.room-fav-star-btn');
      if (starBtn) {
        starBtn.onclick = (e) => {
          e.stopPropagation();
          this.toggleFavoriteSkill(id);
          this._updateRoomFavCountBadge();
          this._renderRoomWeaponGrid();
        };
      }

      item.onclick = () => {
        if (this.loadoutSelection.includes(id)) {
          if (this.loadoutSelection.length > 1) {
            this.loadoutSelection = this.loadoutSelection.filter(x => x !== id);
          }
        } else {
          if (this.loadoutSelection.length < 5) {
            this.loadoutSelection.push(id);
          } else {
            this.loadoutSelection.shift();
            this.loadoutSelection.push(id);
          }
        }

        // 當更換武器時，自動將準備狀態取消（需重新點選準備完成）
        if (this.multiplayerMyReady) {
          this.multiplayerMyReady = false;
          if (this.isCountdownActive) this._cancelMatchCountdown();
          if (p2pNetwork.isConnected) p2pNetwork.send({ type: 'ready_status', ready: false });
          this._updateRoomReadyButton();
        }

        localStorage.setItem('quantum_arena_last_loadout', JSON.stringify(this.loadoutSelection));
        saveSystem.updateLoadout(this.loadoutSelection);
        soundEngine.playUI('click');

        if (p2pNetwork.isConnected) {
          p2pNetwork.send({ type: 'player_update', loadout: this.loadoutSelection });
        }

        this._renderRoomWeaponSlots();
        this._renderRoomWeaponGrid();
        this._updateRoomPlayersCard();
      };
    });
  }

  _updateRoomPlayersCard() {
    const isHost = this.multiplayerRole === 'host';
    const myName = saveSystem.currentUser ? saveSystem.currentUser.nickname : (isHost ? '房主 (我方)' : '挑戰者 (我方)');
    const mySkin = this.getEquippedSkin();

    // 1P Card
    const p1Label = document.getElementById('roomP1Label');
    const p1Name = document.getElementById('roomP1Name');
    const p1ReadyBadge = document.getElementById('roomP1ReadyBadge');
    const p1Summary = document.getElementById('roomP1LoadoutSummary');
    const p1Avatar = document.getElementById('roomP1Avatar');

    // 2P Card
    const p2Label = document.getElementById('roomP2Label');
    const p2Name = document.getElementById('roomP2Name');
    const p2ReadyBadge = document.getElementById('roomP2ReadyBadge');
    const p2Summary = document.getElementById('roomP2LoadoutSummary');
    const p2Avatar = document.getElementById('roomP2Avatar');

    if (isHost) {
      // 我方是 1P (Host)
      if (p1Label) p1Label.textContent = '👑 房主 (我方 1P)';
      if (p1Name) p1Name.textContent = myName;
      if (p1Summary) p1Summary.textContent = `已選 ${this.loadoutSelection.length} 款神兵 (${mySkin.name})`;
      if (p1Avatar) p1Avatar.style.borderColor = mySkin.themeColor || '#00f3ff';
      if (p1ReadyBadge) {
        if (this.multiplayerMyReady) {
          p1ReadyBadge.style.background = 'rgba(16, 185, 129, 0.2)';
          p1ReadyBadge.style.borderColor = '#10b981';
          p1ReadyBadge.style.color = '#10b981';
          p1ReadyBadge.textContent = '🟢 準備完成';
        } else {
          p1ReadyBadge.style.background = 'rgba(255, 0, 127, 0.2)';
          p1ReadyBadge.style.borderColor = '#ff007f';
          p1ReadyBadge.style.color = '#ff007f';
          p1ReadyBadge.textContent = '🔴 挑選武器中';
        }
      }

      // 對方是 2P (Guest)
      if (p2Label) p2Label.textContent = '⚔️ 挑戰者 (2P)';
      if (this.multiplayerOpponentConnected) {
        const oppName = this.multiplayerOpponentData?.name || '挑戰者好友';
        const oppSkin = this.multiplayerOpponentData?.skin || SKINS[1];
        const oppCount = this.multiplayerOpponentData?.loadout?.length || 5;
        if (p2Name) {
          p2Name.textContent = oppName;
          p2Name.style.color = '#fff';
        }
        if (p2Summary) p2Summary.textContent = `已選 ${oppCount} 款神兵 (${oppSkin.name || '賽博英雄'})`;
        if (p2Avatar) {
          p2Avatar.style.borderColor = oppSkin.themeColor || '#a855f7';
          p2Avatar.style.color = oppSkin.themeColor || '#a855f7';
        }
        if (p2ReadyBadge) {
          if (this.multiplayerOpponentReady) {
            p2ReadyBadge.style.background = 'rgba(16, 185, 129, 0.2)';
            p2ReadyBadge.style.borderColor = '#10b981';
            p2ReadyBadge.style.color = '#10b981';
            p2ReadyBadge.textContent = '🟢 準備完成';
          } else {
            p2ReadyBadge.style.background = 'rgba(255, 0, 127, 0.2)';
            p2ReadyBadge.style.borderColor = '#ff007f';
            p2ReadyBadge.style.color = '#ff007f';
            p2ReadyBadge.textContent = '🔴 挑選武器中';
          }
        }
      } else {
        if (p2Name) {
          p2Name.textContent = '等待對手輸入代碼...';
          p2Name.style.color = '#94a3b8';
        }
        if (p2Summary) p2Summary.textContent = '未連線';
        if (p2ReadyBadge) {
          p2ReadyBadge.style.background = 'rgba(255, 255, 255, 0.1)';
          p2ReadyBadge.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          p2ReadyBadge.style.color = '#94a3b8';
          p2ReadyBadge.textContent = '⏳ 等待加入...';
        }
      }
    } else {
      // 我方是 2P (Guest)
      // 對方是 1P (Host)
      if (p1Label) p1Label.textContent = '👑 房主 (1P)';
      if (this.multiplayerOpponentConnected) {
        const oppName = this.multiplayerOpponentData?.name || '房主好友';
        const oppSkin = this.multiplayerOpponentData?.skin || SKINS[0];
        const oppCount = this.multiplayerOpponentData?.loadout?.length || 5;
        if (p1Name) {
          p1Name.textContent = oppName;
          p1Name.style.color = '#fff';
        }
        if (p1Summary) p1Summary.textContent = `已選 ${oppCount} 款神兵 (${oppSkin.name || '賽博英雄'})`;
        if (p1Avatar) {
          p1Avatar.style.borderColor = oppSkin.themeColor || '#00f3ff';
          p1Avatar.style.color = oppSkin.themeColor || '#00f3ff';
        }
        if (p1ReadyBadge) {
          if (this.multiplayerOpponentReady) {
            p1ReadyBadge.style.background = 'rgba(16, 185, 129, 0.2)';
            p1ReadyBadge.style.borderColor = '#10b981';
            p1ReadyBadge.style.color = '#10b981';
            p1ReadyBadge.textContent = '🟢 準備完成';
          } else {
            p1ReadyBadge.style.background = 'rgba(255, 0, 127, 0.2)';
            p1ReadyBadge.style.borderColor = '#ff007f';
            p1ReadyBadge.style.color = '#ff007f';
            p1ReadyBadge.textContent = '🔴 挑選武器中';
          }
        }
      } else {
        if (p1Name) {
          p1Name.textContent = '連線至房主中...';
          p1Name.style.color = '#94a3b8';
        }
        if (p1Summary) p1Summary.textContent = '連線中';
        if (p1ReadyBadge) {
          p1ReadyBadge.style.background = 'rgba(255, 255, 255, 0.1)';
          p1ReadyBadge.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          p1ReadyBadge.style.color = '#94a3b8';
          p1ReadyBadge.textContent = '⏳ 連線中...';
        }
      }

      // 我方是 2P
      if (p2Label) p2Label.textContent = '⚔️ 挑戰者 (我方 2P)';
      if (p2Name) {
        p2Name.textContent = myName;
        p2Name.style.color = '#fff';
      }
      if (p2Summary) p2Summary.textContent = `已選 ${this.loadoutSelection.length} 款神兵 (${mySkin.name})`;
      if (p2Avatar) {
        p2Avatar.style.borderColor = mySkin.themeColor || '#a855f7';
        p2Avatar.style.color = mySkin.themeColor || '#a855f7';
      }
      if (p2ReadyBadge) {
        if (this.multiplayerMyReady) {
          p2ReadyBadge.style.background = 'rgba(16, 185, 129, 0.2)';
          p2ReadyBadge.style.borderColor = '#10b981';
          p2ReadyBadge.style.color = '#10b981';
          p2ReadyBadge.textContent = '🟢 準備完成';
        } else {
          p2ReadyBadge.style.background = 'rgba(255, 0, 127, 0.2)';
          p2ReadyBadge.style.borderColor = '#ff007f';
          p2ReadyBadge.style.color = '#ff007f';
          p2ReadyBadge.textContent = '🔴 挑選武器中';
        }
      }
    }
  }

  _updateRoomReadyButton() {
    const btn = document.getElementById('roomReadyBtn');
    const hint = document.getElementById('roomReadyStatusHint');
    if (!btn) return;

    if (!this.multiplayerOpponentConnected) {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
      btn.innerHTML = '<i class="fa-solid fa-user-clock"></i> 等待好友加入中...';
      btn.style.background = 'linear-gradient(90deg, #4b5563, #374151)';
      btn.style.boxShadow = 'none';
      if (hint) {
        if (this.multiplayerRole === 'host') {
          hint.innerHTML = '請將右上方 6 位數字代碼告訴好友，待好友加入房間後即可點選「準備完成」！';
        } else {
          hint.innerHTML = '正在與房主建立量子連線中，請稍候...';
        }
      }
      return;
    }

    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';

    if (this.multiplayerMyReady) {
      btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> 已準備就緒 (點擊可取消)';
      btn.style.background = 'linear-gradient(90deg, #10b981, #059669)';
      btn.style.boxShadow = '0 0 25px rgba(16, 185, 129, 0.5)';
      if (hint) {
        hint.innerHTML = '<span style="color: #00ff88; font-weight: 800;">✅ 您已準備完成！</span> 等待對手也準備完成後，將會自動進入 3、2、1 倒數開戰！';
      }
    } else {
      btn.innerHTML = '<i class="fa-solid fa-bolt"></i> 準備完成';
      btn.style.background = 'linear-gradient(90deg, #00f3ff, #10b981)';
      btn.style.boxShadow = '0 0 25px rgba(0, 243, 255, 0.4)';
      if (hint) {
        hint.innerHTML = '點選「準備完成」後，等待對方也準備完成，雙方準備就緒後將會進行 3、2、1 倒數開戰！';
      }
    }
  }

  toggleMultiplayerReady() {
    if (!this.multiplayerOpponentConnected) {
      soundEngine.playUI('click');
      alert('⚠️ 目前房間內尚無好友加入！\n請先將 6 位數房間代碼分享給好友，待好友輸入代碼進入房間後即可點擊「準備完成」。');
      return;
    }

    soundEngine.playUI('click');
    if (!this.multiplayerMyReady) {
      if (this.loadoutSelection.length < 5) {
        while (this.loadoutSelection.length < 5) {
          const fallback = SKILLS.find(s => !this.loadoutSelection.includes(s.id)) || SKILLS[0];
          this.loadoutSelection.push(fallback.id);
        }
        this._renderRoomWeaponSlots();
        this._renderRoomWeaponGrid();
      }
      this.multiplayerMyReady = true;
      if (p2pNetwork.isConnected) {
        p2pNetwork.send({ type: 'ready_status', ready: true });
      }
    } else {
      this.multiplayerMyReady = false;
      if (this.isCountdownActive) {
        this._cancelMatchCountdown();
      }
      if (p2pNetwork.isConnected) {
        p2pNetwork.send({ type: 'ready_status', ready: false });
      }
    }

    this._updateRoomReadyButton();
    this._updateRoomPlayersCard();
    this._checkBothReady();
  }

  _checkBothReady() {
    if (this.multiplayerMyReady && this.multiplayerOpponentReady && this.multiplayerOpponentConnected) {
      if (!this.isCountdownActive && this.multiplayerRole === 'host') {
        this._startMatchCountdown(true);
      }
    } else {
      if (this.isCountdownActive) {
        this._cancelMatchCountdown();
        if (this.multiplayerRole === 'host' && p2pNetwork.isConnected) {
          p2pNetwork.send({ type: 'countdown_cancel' });
        }
      }
    }
  }

  _startMatchCountdown(shouldBroadcast = true) {
    if (this.isCountdownActive) return;
    this.isCountdownActive = true;

    if (shouldBroadcast && this.multiplayerRole === 'host' && p2pNetwork.isConnected) {
      p2pNetwork.send({ type: 'countdown_start' });
    }

    const overlay = document.getElementById('multiplayerCountdownOverlay');
    const numEl = document.getElementById('countdownNumberDisplay');
    const subEl = document.getElementById('countdownSubDisplay');
    if (!overlay || !numEl) {
      this._launchMultiplayerBattle();
      return;
    }

    overlay.style.display = 'flex';

    if (this.countdownTimerId) {
      clearTimeout(this.countdownTimerId);
      this.countdownTimerId = null;
    }

    const runStep = (step) => {
      if (!this.isCountdownActive) return;

      numEl.classList.remove('countdown-anim-pop', 'countdown-anim-fight');
      void numEl.offsetWidth; // 重新觸發 CSS 動畫

      if (step === 3) {
        numEl.textContent = '3';
        numEl.style.color = '#00f3ff';
        numEl.style.textShadow = '0 0 50px rgba(0, 243, 255, 0.85), 0 0 100px rgba(0, 243, 255, 0.4)';
        if (subEl) subEl.textContent = '雙方均已準備完成！即將進入量子擂台...';
        numEl.classList.add('countdown-anim-pop');
        soundEngine.playUI('countdown');
        this.countdownTimerId = setTimeout(() => runStep(2), 1000);
      } else if (step === 2) {
        numEl.textContent = '2';
        numEl.style.color = '#ffd700';
        numEl.style.textShadow = '0 0 50px rgba(255, 215, 0, 0.85), 0 0 100px rgba(255, 215, 0, 0.4)';
        if (subEl) subEl.textContent = '神兵武裝配置同步完畢...';
        numEl.classList.add('countdown-anim-pop');
        soundEngine.playUI('countdown');
        this.countdownTimerId = setTimeout(() => runStep(1), 1000);
      } else if (step === 1) {
        numEl.textContent = '1';
        numEl.style.color = '#ff8800';
        numEl.style.textShadow = '0 0 50px rgba(255, 136, 0, 0.85), 0 0 100px rgba(255, 136, 0, 0.4)';
        if (subEl) subEl.textContent = '量子共振力場啟動，極限對決即刻爆發！';
        numEl.classList.add('countdown-anim-pop');
        soundEngine.playUI('countdown');
        this.countdownTimerId = setTimeout(() => runStep(0), 1000);
      } else if (step === 0) {
        numEl.textContent = '開始！';
        numEl.style.color = '#ff007f';
        numEl.style.textShadow = '0 0 60px rgba(255, 0, 127, 0.95), 0 0 120px rgba(255, 0, 127, 0.6)';
        if (subEl) subEl.textContent = '⚡ FIGHT! 全力以赴，奪取勝利！ ⚡';
        numEl.classList.add('countdown-anim-fight');
        soundEngine.playUI('fight');
        announcerEngine.speak('Fight!');

        this.countdownTimerId = setTimeout(() => {
          if (!this.isCountdownActive) return;
          this.isCountdownActive = false;
          overlay.style.display = 'none';
          const roomModal = document.getElementById('multiplayerRoomModal');
          if (roomModal) roomModal.classList.remove('active');
          this._launchMultiplayerBattle();
        }, 850);
      }
    };

    runStep(3);
  }

  _cancelMatchCountdown() {
    if (!this.isCountdownActive) return;
    this.isCountdownActive = false;
    if (this.countdownTimerId) {
      clearTimeout(this.countdownTimerId);
      this.countdownTimerId = null;
    }
    const overlay = document.getElementById('multiplayerCountdownOverlay');
    if (overlay) overlay.style.display = 'none';

    if (this.multiplayerRole === 'host' && p2pNetwork.isConnected) {
      p2pNetwork.send({ type: 'countdown_cancel' });
    }
  }

  _launchMultiplayerBattle() {
    this.matchMode = 'p2p';
    const isHost = this.multiplayerRole === 'host';
    const myName = saveSystem.currentUser ? saveSystem.currentUser.nickname : (isHost ? '房主 (1P)' : '挑戰者 (2P)');
    const mySkin = this.getEquippedSkin();

    let p1Data, p2Data;
    if (isHost) {
      p1Data = {
        name: myName,
        skin: mySkin,
        loadout: this.loadoutSelection,
        isAi: false
      };
      p2Data = {
        name: this.multiplayerOpponentData?.name || '挑戰者 (2P)',
        skin: this.multiplayerOpponentData?.skin || SKINS[1],
        loadout: this.multiplayerOpponentData?.loadout || ['SK-01', 'SK-02', 'SK-06', 'SK-16', 'SK-17'],
        isAi: false
      };
    } else {
      p1Data = {
        name: this.multiplayerOpponentData?.name || '房主 (1P)',
        skin: this.multiplayerOpponentData?.skin || SKINS[0],
        loadout: this.multiplayerOpponentData?.loadout || ['SK-01', 'SK-02', 'SK-03', 'SK-10', 'SK-11'],
        isAi: false
      };
      p2Data = {
        name: myName,
        skin: mySkin,
        loadout: this.loadoutSelection,
        isAi: false
      };
    }

    this._p2pMatchData = { p1Data, p2Data };
    this._launchMatch();
  }

  leaveMultiplayerRoom() {
    this._cancelMatchCountdown();
    p2pNetwork.disconnect();
    const roomModal = document.getElementById('multiplayerRoomModal');
    if (roomModal) roomModal.classList.remove('active');

    this.multiplayerRole = null;
    this.multiplayerRoomCode = null;
    this.multiplayerOpponentConnected = false;
    this.multiplayerMyReady = false;
    this.multiplayerOpponentReady = false;
    this.multiplayerOpponentData = null;
    this._isSimulatedOpponent = false;
    this.networkP1Input = null;
    this.networkP2Input = null;
    this.rematchRequestedByMe = false;
    this.rematchRequestedByOpponent = false;
  }

  simulateTestOpponent() {
    this._isSimulatedOpponent = true;
    this.multiplayerOpponentConnected = true;
    this.multiplayerOpponentData = {
      name: '量子模擬戰友 (測試)',
      skin: SKINS[1],
      loadout: ['SK-01', 'SK-04', 'SK-08', 'SK-15', 'SK-18']
    };
    this.multiplayerOpponentReady = true;

    const badge = document.getElementById('roomConnStatusBadge');
    if (badge) {
      badge.innerHTML = '🤖 模擬對手已加入並已準備！請您挑選好武器後按下「準備完成」測試倒數開戰';
      badge.style.color = '#00ff66';
    }

    soundEngine.playUI('click');
    this._updateRoomPlayersCard();
    this._updateRoomReadyButton();
    this._checkBothReady();
  }

  _handleP2PStatusChange(status, data) {
    const badge = document.getElementById('roomConnStatusBadge');

    if (status === 'waiting_guest') {
      if (badge) {
        badge.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> 等待好友輸入 6 位代碼加入中...';
        badge.style.color = '#38bdf8';
      }
      this._updateRoomReadyButton();
    } else if (status === 'connecting') {
      if (badge) {
        badge.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> 正在連線至房間 ${this.multiplayerRoomCode}...`;
        badge.style.color = '#ffd700';
      }
      this._updateRoomReadyButton();
    } else if (status === 'connected') {
      this.multiplayerOpponentConnected = true;
      if (badge) {
        badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> 雙方連線成功！請挑選武器並按「準備完成」';
        badge.style.color = '#00ff66';
      }
      soundEngine.playUI('click');

      // 送出我方玩家資訊與當前準備狀態
      p2pNetwork.send({
        type: 'player_info',
        name: saveSystem.currentUser ? saveSystem.currentUser.nickname : (this.multiplayerRole === 'host' ? '房主' : '挑戰者'),
        skin: this.getEquippedSkin(),
        loadout: this.loadoutSelection,
        ready: this.multiplayerMyReady
      });

      this._updateRoomPlayersCard();
      this._updateRoomReadyButton();
    } else if (status === 'disconnected') {
      this.multiplayerOpponentConnected = false;
      this.multiplayerOpponentReady = false;
      this.multiplayerOpponentData = null;
      if (this.isCountdownActive) this._cancelMatchCountdown();

      if (badge) {
        badge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> 對手已離開房間';
        badge.style.color = '#ff007f';
      }
      this._updateRoomPlayersCard();
      this._updateRoomReadyButton();
    } else if (status === 'error') {
      if (badge) {
        badge.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> 連線提示：${data || '未找到房間或已逾時'}`;
        badge.style.color = '#f43f5e';
      }
      this._updateRoomReadyButton();
    }
  }

  _handleP2PData(data) {
    if (!data || !data.type) return;

    if (data.type === 'player_info') {
      this.multiplayerOpponentData = {
        name: data.name,
        skin: data.skin,
        loadout: data.loadout
      };
      this.multiplayerOpponentReady = !!data.ready;

      // 回覆我方資訊
      p2pNetwork.send({
        type: 'player_info_ack',
        name: saveSystem.currentUser ? saveSystem.currentUser.nickname : (this.multiplayerRole === 'host' ? '房主' : '挑戰者'),
        skin: this.getEquippedSkin(),
        loadout: this.loadoutSelection,
        ready: this.multiplayerMyReady
      });

      this._updateRoomPlayersCard();
      this._checkBothReady();
    } else if (data.type === 'player_info_ack') {
      this.multiplayerOpponentData = {
        name: data.name,
        skin: data.skin,
        loadout: data.loadout
      };
      this.multiplayerOpponentReady = !!data.ready;
      this._updateRoomPlayersCard();
      this._checkBothReady();
    } else if (data.type === 'player_update') {
      if (!this.multiplayerOpponentData) {
        this.multiplayerOpponentData = {};
      }
      if (data.loadout) this.multiplayerOpponentData.loadout = data.loadout;
      if (data.name) this.multiplayerOpponentData.name = data.name;
      if (data.skin) this.multiplayerOpponentData.skin = data.skin;
      this._updateRoomPlayersCard();
    } else if (data.type === 'ready_status') {
      this.multiplayerOpponentReady = !!data.ready;
      this._updateRoomPlayersCard();
      this._checkBothReady();
    } else if (data.type === 'countdown_start') {
      if (!this.isCountdownActive) {
        this._startMatchCountdown(false);
      }
    } else if (data.type === 'countdown_cancel') {
      this._cancelMatchCountdown();
    } else if (data.type === 'arena_ready') {
      this.peerArenaLoaded = true;
      if (this.multiplayerRole === 'host' && this.isFighting && !this.isMultiplayerMatchUnlocked) {
        if (this._unlockSafetyTimer) {
          clearTimeout(this._unlockSafetyTimer);
          this._unlockSafetyTimer = null;
        }
        this.isMultiplayerMatchUnlocked = true;
        soundEngine.playUI('fight');
        if (p2pNetwork.isConnected) {
          p2pNetwork.send({ type: 'battle_unlock' });
        }
      }
    } else if (data.type === 'battle_unlock') {
      if (this.multiplayerRole === 'guest') {
        this.isMultiplayerMatchUnlocked = true;
        soundEngine.playUI('fight');
      }
    } else if (data.type === 'teleport_warp') {
      const char = data.charId === 'p1' ? combatEngine.p1 : combatEngine.p2;
      if (char) {
        combatEngine.shockwaves.push({
          x: char.x,
          y: char.y - 45,
          radius: 10,
          maxRadius: 48,
          color: '#6366f1',
          duration: 16
        });
        char.x = data.x;
        char.y = data.y;
        char.facing = data.facing;
        char.vx = 0;
        char.vy = 0;
        combatEngine.shockwaves.push({
          x: char.x,
          y: char.y - 45,
          radius: 12,
          maxRadius: 55,
          color: '#a855f7',
          duration: 18
        });
        soundEngine.playHit('teleport');
      }
    } else if (data.type === 'skill_cast') {
      const char = data.charId === 'p1' ? combatEngine.p1 : combatEngine.p2;
      const opp = data.charId === 'p1' ? combatEngine.p2 : combatEngine.p1;
      if (char && opp && typeof data.slotIdx === 'number') {
        const alreadyRunning = char.state === 'skill' && char.currentAction?.id === data.skillId && char.stateTime <= 4;
        if (!alreadyRunning) {
          combatEngine._executeSkill(char, opp, data.slotIdx);
        }
      }
    } else if (data.type === 'battle_hit_impact') {
      if (this.multiplayerRole === 'guest' && combatEngine.p1 && combatEngine.p2) {
        const target = data.targetId === 'p1' ? combatEngine.p1 : combatEngine.p2;
        const attacker = data.attackerId === 'p1' ? combatEngine.p1 : combatEngine.p2;

        combatEngine.p1.isTakingLegitHit = true;
        combatEngine.p2.isTakingLegitHit = true;
        if (typeof data.p1Hp === 'number') combatEngine.p1.hp = data.p1Hp;
        if (typeof data.p2Hp === 'number') combatEngine.p2.hp = data.p2Hp;
        combatEngine.p1.isTakingLegitHit = false;
        combatEngine.p2.isTakingLegitHit = false;

        const hitX = typeof data.hitX === 'number' ? data.hitX : (target ? target.x : 0);
        const hitY = typeof data.hitY === 'number' ? data.hitY : (target ? target.y - 70 : 0);

        if (data.isBlocked) {
          soundEngine.playHit('guard');
          combatEngine.hitStop = Math.max(combatEngine.hitStop, 2);
          combatEngine.triggerScreenShake(2);
          combatEngine.floatingTexts.push({
            text: `SHIELD -${data.damage}`,
            x: hitX,
            y: hitY - 10,
            color: '#38bdf8',
            life: 32
          });
        } else {
          soundEngine.playHit(data.knockdown ? 'knockdown' : 'heavy');
          combatEngine.hitStop = Math.max(combatEngine.hitStop, data.knockdown ? 6 : 4);
          combatEngine.triggerScreenShake(data.knockdown ? 7 : 4);
          combatEngine.floatingTexts.push({
            text: `-${data.damage}`,
            x: hitX,
            y: hitY - 10,
            color: data.isCounter ? '#fbbf24' : '#ef4444',
            life: 36
          });
          if (target) {
            if (data.knockdown) {
              target.state = 'knockdown';
              target.stateTimer = 0;
              target.vx = (attacker ? attacker.facing : 1) * 7.5;
              target.vy = -6.5;
            } else {
              target.state = 'hit_stun';
              target.stateTimer = 0;
              target.vx = (attacker ? attacker.facing : 1) * 2;
            }
          }
        }
      }
    } else if (data.type === 'battle_input') {
      if (data.p1) this.networkP1Input = data.p1;
      if (data.p2) this.networkP2Input = data.p2;
    } else if (data.type === 'battle_sync') {
      if (this.multiplayerRole === 'guest' && combatEngine.p1 && combatEngine.p2) {
        // 1. 同步血量 (強制合法命中繞過影子記憶體防竄改)
        combatEngine.p1.isTakingLegitHit = true;
        combatEngine.p2.isTakingLegitHit = true;
        if (typeof data.p1?.hp === 'number') combatEngine.p1.hp = data.p1.hp;
        if (typeof data.p2?.hp === 'number') combatEngine.p2.hp = data.p2.hp;
        combatEngine.p1.isTakingLegitHit = false;
        combatEngine.p2.isTakingLegitHit = false;

        // 2. 同步計量槽
        if (typeof data.p1?.burstMeter === 'number') combatEngine.p1.burstMeter = data.p1.burstMeter;
        if (typeof data.p2?.burstMeter === 'number') combatEngine.p2.burstMeter = data.p2.burstMeter;
        if (typeof data.p1?.superMeter === 'number') combatEngine.p1.superMeter = data.p1.superMeter;
        if (typeof data.p2?.superMeter === 'number') combatEngine.p2.superMeter = data.p2.superMeter;

        // 3. 房主 (1P) 坐標與面向平滑校正
        if (data.p1) {
          const dx1 = data.p1.x - combatEngine.p1.x;
          const dy1 = data.p1.y - combatEngine.p1.y;
          if (Math.abs(dx1) > 60 || Math.abs(dy1) > 60) {
            combatEngine.p1.x = data.p1.x;
            combatEngine.p1.y = data.p1.y;
          } else {
            combatEngine.p1.x += dx1 * 0.45;
            combatEngine.p1.y += dy1 * 0.45;
          }
          combatEngine.p1.facing = data.p1.facing;
          if (['knockdown', 'hit_stun', 'victory', 'defeat'].includes(data.p1.state)) {
            combatEngine.p1.state = data.p1.state;
          }
        }

        // 4. 客端 (2P) 坐標防漂移校正 (若與房主權威判定相差超過 90px，平滑收斂)
        if (data.p2) {
          const dx2 = data.p2.x - combatEngine.p2.x;
          if (Math.abs(dx2) > 90) {
            combatEngine.p2.x += dx2 * 0.35;
          }
        }

        // 5. 回合時間同步
        if (typeof data.roundTime === 'number') {
          combatEngine.roundTime = data.roundTime;
        }

        // 6. 權威勝負同步：客端無條件以房主之 winner 與 isOver 為準 (避免雙方不同步)
        if (data.isOver || (typeof data.winner === 'number' && data.winner >= 0) || data.p1?.hp <= 0 || data.p2?.hp <= 0) {
          const w = typeof data.winner === 'number'
            ? data.winner
            : ((data.p1?.hp <= 0 && data.p2?.hp <= 0) ? 0 : (data.p1?.hp <= 0 ? 2 : 1));
          if (!combatEngine.isOver || combatEngine.winner !== w) {
            this._applyRemoteKO(w, data.p1?.hp, data.p2?.hp, true);
          }
        }

        // 7. 投射物增量同步 (確保遠程神兵武器如氣功波、苦無、光刃等在客端清晰可見且軌跡一致)
        if (Array.isArray(data.projectiles)) {
          const syncedProjectiles = [];
          for (const sp of data.projectiles) {
            const existing = combatEngine.projectiles.find(localP =>
              localP.ownerId === sp.ownerId && localP.type === sp.type && Math.hypot(localP.x - sp.x, localP.y - sp.y) < 70
            );
            if (existing) {
              existing.x = sp.x;
              existing.y = sp.y;
              existing.vx = sp.vx;
              existing.vy = sp.vy;
              existing.life = sp.life;
              existing.damage = sp.damage;
              syncedProjectiles.push(existing);
            } else {
              const owner = (sp.ownerId === 'p1' || sp.ownerId === 1) ? combatEngine.p1 : combatEngine.p2;
              const skill = SKILLS.find(s => s.projectileType === sp.type);
              syncedProjectiles.push({
                ownerId: sp.ownerId,
                type: sp.type,
                x: sp.x,
                y: sp.y,
                vx: sp.vx,
                vy: sp.vy,
                radius: sp.radius,
                damage: sp.damage,
                skin: owner?.skin || null,
                color: skill?.projectileColor || '#00f3ff',
                life: sp.life,
                piercing: skill?.piercing || false,
                homing: skill?.homing || false,
                trail: []
              });
            }
          }
          combatEngine.projectiles = syncedProjectiles;
        }
      }
    } else if (data.type === 'guest_sync') {
      if (this.multiplayerRole === 'host' && combatEngine.p2) {
        // 如果客端回報血量已歸零且房主尚未裁決客端陣亡
        if (data.hp <= 0 && (!combatEngine.isOver || combatEngine.p2.hp > 0)) {
          let w = 1;
          if (combatEngine.p1.hp <= 0) w = 0; // 雙方皆陣亡
          this._applyRemoteKO(w, combatEngine.p1.hp, 0, true);
          if (p2pNetwork.isConnected) {
            p2pNetwork.send({ type: 'battle_ko', winner: w, p1Hp: Math.round(combatEngine.p1.hp), p2Hp: 0 });
          }
        }
      }
    } else if (data.type === 'battle_damage') {
      if (combatEngine.p1 && combatEngine.p2) {
        combatEngine.p1.isTakingLegitHit = true;
        combatEngine.p2.isTakingLegitHit = true;
        if (typeof data.p1Hp === 'number') combatEngine.p1.hp = Math.max(0, data.p1Hp);
        if (typeof data.p2Hp === 'number') combatEngine.p2.hp = Math.max(0, data.p2Hp);
        combatEngine.p1.isTakingLegitHit = false;
        combatEngine.p2.isTakingLegitHit = false;

        if (this.multiplayerRole === 'host') {
          // 房主為權威仲裁者：若任何一方或雙方瀕死/陣亡，裁定並向客端廣播
          if (combatEngine.p1.hp <= 0 || combatEngine.p2.hp <= 0) {
            let w = 1;
            if (combatEngine.p1.hp <= 0 && combatEngine.p2.hp <= 0) w = 0;
            else if (combatEngine.p1.hp <= 0) w = 2;
            else w = 1;

            this._applyRemoteKO(w, combatEngine.p1.hp, combatEngine.p2.hp, true);
            if (p2pNetwork.isConnected) {
              p2pNetwork.send({
                type: 'battle_ko',
                winner: w,
                p1Hp: Math.round(combatEngine.p1.hp),
                p2Hp: Math.round(combatEngine.p2.hp)
              });
            }
          }
        } else {
          // 客端：若尚未結束，先依據傷害封包預先觸發；若後續收到房主裁決則以房主為準
          if ((data.isLethal || combatEngine.p1.hp <= 0 || combatEngine.p2.hp <= 0) && !combatEngine.isOver) {
            let w = 1;
            if (combatEngine.p1.hp <= 0 && combatEngine.p2.hp <= 0) w = 0;
            else if (combatEngine.p1.hp <= 0) w = 2;
            else w = 1;
            this._applyRemoteKO(w, combatEngine.p1.hp, combatEngine.p2.hp, false);
          }
        }
      }
    } else if (data.type === 'battle_ko') {
      if (this.multiplayerRole === 'guest') {
        // 客端無條件遵從房主的勝負裁定 (forceOverride = true)
        this._applyRemoteKO(data.winner, data.p1Hp, data.p2Hp, true);
      } else if (this.multiplayerRole === 'host') {
        // 房主收到客端請求裁決：房主核查雙方當前實際血量
        let finalWinner = data.winner;
        if (combatEngine.p1 && combatEngine.p2) {
          if (combatEngine.p1.hp <= 0 && combatEngine.p2.hp <= 0) {
            finalWinner = 0; // 雙方同時倒下 (Double K.O. 平手)
          } else if (combatEngine.p1.hp <= 0) {
            finalWinner = 2;
          } else if (combatEngine.p2.hp <= 0) {
            finalWinner = 1;
          }
        }
        this._applyRemoteKO(finalWinner, data.p1Hp, data.p2Hp, true);
        if (p2pNetwork.isConnected) {
          p2pNetwork.send({
            type: 'battle_ko',
            winner: finalWinner,
            p1Hp: Math.round(combatEngine.p1 ? combatEngine.p1.hp : 0),
            p2Hp: Math.round(combatEngine.p2 ? combatEngine.p2.hp : 0)
          });
        }
      }
    } else if (data.type === 'rematch_request') {
      this.rematchRequestedByOpponent = true;
      const playAgainBtn = document.getElementById('matchPlayAgainBtn');
      const statusHint = document.getElementById('matchRematchStatus');

      if (this.rematchRequestedByMe) {
        // 雙方皆已點擊再玩一次！
        if (statusHint) {
          statusHint.textContent = '⚡ 雙方已同意再戰！即將進入同步倒數...';
          statusHint.style.color = '#00ff88';
        }
        if (this.multiplayerRole === 'host') {
          if (p2pNetwork.isConnected) p2pNetwork.send({ type: 'rematch_start' });
          this._launchRematchCountdown();
        } else {
          if (p2pNetwork.isConnected) p2pNetwork.send({ type: 'rematch_accept' });
        }
      } else {
        // 對方率先發起再戰請求，本機按鈕動態高亮提示點擊同意
        if (playAgainBtn) {
          playAgainBtn.disabled = false;
          playAgainBtn.style.opacity = '1';
          playAgainBtn.style.background = 'linear-gradient(135deg, #00ff88 0%, #00b4d8 100%)';
          playAgainBtn.style.color = '#050814';
          playAgainBtn.style.boxShadow = '0 0 25px rgba(0, 255, 136, 0.75)';
          playAgainBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> ⚡ 對方請求再玩一次！點此同意';
        }
        if (statusHint) {
          statusHint.textContent = '⚡ 對手已發起再戰請求！點擊上方按鈕即可重開對局';
          statusHint.style.color = '#00ff88';
        }
        soundEngine.playUI('ready');
      }
    } else if (data.type === 'rematch_accept') {
      const statusHint = document.getElementById('matchRematchStatus');
      if (statusHint) {
        statusHint.textContent = '⚡ 對手已同意再戰！即將進入同步倒數...';
        statusHint.style.color = '#00ff88';
      }
      if (this.multiplayerRole === 'host') {
        if (p2pNetwork.isConnected) p2pNetwork.send({ type: 'rematch_start' });
        this._launchRematchCountdown();
      } else {
        this._launchRematchCountdown();
      }
    } else if (data.type === 'rematch_start') {
      this._launchRematchCountdown();
    } else if (data.type === 'rematch_exit') {
      this.rematchRequestedByOpponent = false;
      this.rematchRequestedByMe = false;
      const playAgainBtn = document.getElementById('matchPlayAgainBtn');
      const statusHint = document.getElementById('matchRematchStatus');
      if (playAgainBtn) {
        playAgainBtn.disabled = true;
        playAgainBtn.style.opacity = '0.5';
        playAgainBtn.style.background = 'rgba(255, 255, 255, 0.08)';
        playAgainBtn.style.color = '#94a3b8';
        playAgainBtn.style.boxShadow = 'none';
        playAgainBtn.innerHTML = '<i class="fa-solid fa-user-xmark"></i> 對手已退出對決';
      }
      if (statusHint) {
        statusHint.textContent = '⚠️ 對手已退出對決並返回大廳。';
        statusHint.style.color = '#f59e0b';
      }
      if (this.isCountdownActive) {
        this._cancelMatchCountdown();
      }
    }
  }

  _applyRemoteKO(winner, p1Hp = null, p2Hp = null, forceOverride = false) {
    if (!this.isFighting) return;
    if (combatEngine.isOver && !forceOverride) return;

    // 強制雙方畫面同步觸發 K.O. 狀態 (倒地、慢動作、VICTORY/DEFEAT/DRAW 橫幅、K.O.播報)
    combatEngine.forceKO(winner, p1Hp, p2Hp, forceOverride);

    const isDraw = winner === 0;
    const isLocalWinner = !isDraw && (this.matchMode === 'p2p'
      ? (this.multiplayerRole === 'guest' ? winner === 2 : winner === 1)
      : winner === 1);
    const winnerFighter = winner === 1 ? combatEngine.p1 : (winner === 2 ? combatEngine.p2 : null);

    combatEngine.floatingTexts = [];
    announcerEngine.activeBanners = [];
    this._syncVictoryOverlay(isLocalWinner, isDraw, winnerFighter);

    if (!this.matchEndTimer || forceOverride) {
      this.matchEndTimer = 1;
    }
  }
}

export { CyberStrikerApp };

// 實例化並暴露給視窗
if (typeof window !== 'undefined') {
  window.app = new CyberStrikerApp();
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
      window.app.init();
    });
  } else {
    // DOM 已就緒，立即安全執行初始化
    window.app.init();
  }
}
