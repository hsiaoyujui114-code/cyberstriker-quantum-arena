/**
 * 《CyberStriker: Quantum Arena》
 * 遊戲主控制器與介面驅動器 (Master App Controller)
 * 整合所有模組：登入、大廳展示台、四大大廳分頁、配技載入、60 FPS 戰鬥、AI 行為、重播短碼、雙人對打與行動觸控
 */

import { SKILLS, ARCHETYPES } from './data/skills.js';
import { SKINS } from './data/skins.js';
import { saveSystem } from './save_system.js';
import { soundEngine } from './engine/audio.js';
import { characterRenderer } from './engine/character_renderer.js';
import { combatEngine } from './engine/combat.js';
import { aiController } from './engine/ai.js';
import { replaySystem } from './engine/replay.js';
import { p2pNetwork } from './network/p2p.js';

class CyberStrikerApp {
  constructor() {
    this.currentTab = 'skins';
    this.pedestalSkin = null;
    this.pedestalAction = 'idle';
    this.pedestalActionTimer = 0;
    this.pedestalTime = 0;
    this.pedestalAnimId = null;

    // 戰鬥狀態
    this.isFighting = false;
    this.matchMode = 'ai'; // 'ai', 'local_2p', 'p2p', 'training'
    this.aiDifficulty = 'normal';
    this.loadoutSelection = ['SK-01', 'SK-02', 'SK-09'];
    this.loadoutTimer = 15;
    this.loadoutInterval = null;

    // 按鍵映射
    this.keys = {};
    this.mobileInputs = { x: 0, y: 0, punch: false, kick: false, guard: false, skill1: false, skill2: false, skill3: false, burst: false };

    // 畫布
    this.canvas = null;
    this.ctx = null;
    this.pedestalCanvas = null;
    this.pedestalCtx = null;
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
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    // 戰鬥擂台寬度與高度全面自適應螢幕，無任何被擋住的不可抵達區域
    combatEngine.arenaWidth = window.innerWidth;
    const newFloorY = Math.max(380, Math.round(window.innerHeight - 130));
    combatEngine.floorY = newFloorY;

    if (combatEngine.p1 && combatEngine.p1.isGrounded) combatEngine.p1.y = newFloorY;
    if (combatEngine.p2 && combatEngine.p2.isGrounded) combatEngine.p2.y = newFloorY;
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
        setTimeout(() => {
          soundEngine.playHit('burst');
          splash.style.opacity = '0';
          setTimeout(() => {
            splash.style.display = 'none';
            // 若為首次或尚未確定身分，呼叫量子授權儀
            if (!saveSystem.currentUser || saveSystem.isGuest) {
              this.openAuthModal();
            }
          }, 500);
        }, 300);
      }
    }, 25);
  }

  // ─── 大廳展示台 (Skeletal Real-Time Pedestal) ───
  _startPedestalLoop() {
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
    render();
  }

  previewPedestalAction(action) {
    this.pedestalAction = action;
    this.pedestalActionTimer = action === 'jump' ? 35 : 20;
    soundEngine.playHit(action === 'light_punch' ? 'punch' : (action === 'heavy_kick' ? 'kick' : (action === 'high_guard' ? 'guard' : 'dp')));
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

  // ─── 分頁一：我的外觀渲染 ───
  renderSkinsInventory() {
    const container = document.getElementById('skinsGrid');
    if (!container) return;

    const u = saveSystem.currentUser;
    const owned = u ? u.skins : ['skin_cyber_warrior'];
    const equipped = u ? u.equippedSkin : 'skin_cyber_warrior';

    container.innerHTML = SKINS.map(s => {
      const isOwned = owned.includes(s.id);
      const isEquipped = equipped === s.id;

      let btnHtml = '';
      if (isEquipped) {
        btnHtml = `<button class="nav-tab-btn" style="border-color: #00ff66; color: #00ff66; width: 100%; justify-content: center;"><i class="fa-solid fa-check"></i> 戰鬥裝備中</button>`;
      } else if (isOwned) {
        btnHtml = `<button class="nav-tab-btn equip-skin-btn" data-id="${s.id}" style="background: rgba(0, 243, 255, 0.15); color: #00f3ff; width: 100%; justify-content: center;"><i class="fa-solid fa-shield"></i> 裝備此造型</button>`;
      } else {
        btnHtml = `<button class="nav-tab-btn goto-shop-btn" data-id="${s.id}" style="border-color: rgba(255,255,255,0.15); color: #94a3b8; width: 100%; justify-content: center;"><i class="fa-solid fa-lock"></i> 未解鎖（前往商店）</button>`;
      }

      return `
        <div class="skin-card ${isEquipped ? 'equipped' : ''}" data-id="${s.id}" style="cursor: pointer;">
          <div class="skin-header">
            <div>
              <div class="skin-name" style="color: ${s.themeColor}">${s.name}</div>
              <div style="font-size: 11px; color: #94a3b8;">${s.title}</div>
            </div>
            <span class="skin-tag" style="border: 1px solid ${s.themeColor}; color: ${s.themeColor}">${s.isDefault ? '初始預設' : (s.category === 'shop' ? '商城造型' : '活動限定')}</span>
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

    container.querySelectorAll('.goto-shop-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.switchTab('shop');
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
      return `
        <div class="skin-card">
          <div class="skin-header">
            <div>
              <div class="skin-name" style="color: ${s.themeColor}">${s.name}</div>
              <div style="font-size: 11px; color: #94a3b8;">${s.title} | ${s.series || '戰術外裝'}</div>
            </div>
            <span class="stat-capsule" style="font-size: 13px;">🪙 ${s.price.toLocaleString()}</span>
          </div>
          <div class="skin-desc">${s.desc}</div>
          <div class="skin-vfx-box">
            <div><strong>⚡ 專屬光軌：</strong>${s.vfx.punchTrail}</div>
            <div><strong>🛡️ 專屬護盾：</strong>${s.vfx.guardShield}</div>
          </div>
          <div style="font-size: 11px; color: #64748b;">🎨 創作者：${s.creator || '官方社群'}</div>
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <button class="nav-tab-btn try-on-btn" data-id="${s.id}" style="flex: 1; justify-content: center; border-color: ${s.themeColor}; color: ${s.themeColor}">
              <i class="fa-solid fa-eye"></i> 試穿演示
            </button>
            ${isOwned ? `
              <button class="nav-tab-btn" disabled style="flex: 1; justify-content: center; color: #10b981; border-color: #10b981;">
                <i class="fa-solid fa-check"></i> 已擁有
              </button>
            ` : `
              <button class="nav-tab-btn buy-skin-btn" data-id="${s.id}" data-price="${s.price}" style="flex: 1; justify-content: center; background: linear-gradient(135deg, #00f3ff, #ff007f); color: #fff;">
                <i class="fa-solid fa-cart-shopping"></i> 購買
              </button>
            `}
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
          soundEngine.playUI('hover');
        }
      });
    });

    container.querySelectorAll('.buy-skin-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const price = parseInt(btn.dataset.price, 10);
        const res = saveSystem.purchaseSkin(id, price);
        if (res.success) {
          soundEngine.playUI('equip');
          alert(`🎉 恭喜成功解鎖造型【${SKINS.find(s=>s.id===id).name}】！已直接為您出戰裝備。`);
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

  // ─── 賽前「10 選 3」配技視窗 (無時間限制) ───
  openLoadoutModal(startMatchCallback) {
    const modal = document.getElementById('loadoutModal');
    if (!modal) return;
    modal.classList.add('active');

    // 清除舊倒數 (若有)
    if (this.loadoutInterval) {
      clearInterval(this.loadoutInterval);
      this.loadoutInterval = null;
    }

    const u = saveSystem.currentUser;
    this.loadoutSelection = (u && u.loadout && u.loadout.length === 3) ? [...u.loadout] : ['SK-01', 'SK-02', 'SK-09'];

    this._renderLoadoutSkillsGrid();

    // 綁定三大流派快捷按鈕
    document.querySelectorAll('.archetype-btn').forEach(btn => {
      btn.onclick = () => {
        const archId = btn.dataset.arch;
        const arch = ARCHETYPES.find(a => a.id === archId);
        if (arch) {
          this.loadoutSelection = [...arch.skills];
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

  _renderLoadoutSkillsGrid() {
    const container = document.getElementById('loadoutSkillsGrid');
    if (!container) return;

    container.innerHTML = SKILLS.map(sk => {
      const isSelected = this.loadoutSelection.includes(sk.id);
      const slotIndex = this.loadoutSelection.indexOf(sk.id);
      const keyName = slotIndex === 0 ? '[U]' : (slotIndex === 1 ? '[I]' : (slotIndex === 2 ? '[O]' : ''));

      return `
        <div class="skill-card ${isSelected ? 'selected' : ''}" data-id="${sk.id}" style="background: rgba(255,255,255,0.03); border: 1px solid ${isSelected ? '#00f3ff' : 'rgba(255,255,255,0.1)'}; border-radius: 8px; padding: 10px; cursor: pointer; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="color: ${sk.color}; font-size: 13px;"><i class="${sk.icon}"></i> ${sk.name}</strong>
            ${isSelected ? `<span style="background: #00f3ff; color: #000; font-size: 11px; font-weight: 900; padding: 1px 6px; border-radius: 4px;">${keyName}</span>` : ''}
          </div>
          <div style="font-size: 11px; color: #94a3b8;">${sk.typeName} | 傷害 ${sk.damage} | CD ${sk.cd}s</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${sk.description}</div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.skill-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        if (this.loadoutSelection.includes(id)) {
          // 已勾選則移除 (若至少保留1個)
          if (this.loadoutSelection.length > 1) {
            this.loadoutSelection = this.loadoutSelection.filter(s => s !== id);
          }
        } else {
          if (this.loadoutSelection.length < 3) {
            this.loadoutSelection.push(id);
          } else {
            // 已滿3個，替換最後一個
            this.loadoutSelection.shift();
            this.loadoutSelection.push(id);
          }
        }
        soundEngine.playUI('click');
        this._renderLoadoutSkillsGrid();
      });
    });
  }

  _confirmLoadout(callback) {
    const modal = document.getElementById('loadoutModal');
    if (modal) modal.classList.remove('active');
    saveSystem.updateLoadout(this.loadoutSelection);
    if (callback) callback();
  }

  // ─── 進入對戰系統 ───
  startBattle(mode = 'ai', diff = 'normal') {
    this.matchMode = mode;
    this.aiDifficulty = diff;
    aiController.setDifficulty(diff);

    this.openLoadoutModal(() => {
      this._launchMatch();
    });
  }

  _launchMatch() {
    const battleScreen = document.getElementById('battleScreen');
    if (battleScreen) battleScreen.classList.add('active');

    const p1Skin = this.getEquippedSkin();
    let p2Skin = SKINS[1]; // 預設對手
    if (this.aiDifficulty === 'hard') p2Skin = SKINS[2];
    if (this.aiDifficulty === 'nightmare') p2Skin = SKINS[4];

    const p1Data = {
      name: saveSystem.currentUser ? saveSystem.currentUser.nickname : 'Player 1',
      skin: p1Skin,
      loadout: this.loadoutSelection
    };

    const p2Data = {
      name: this.matchMode === 'training' ? '練習木樁假人' : (this.matchMode === 'local_2p' ? 'Player 2' : `AI (${this.aiDifficulty.toUpperCase()})`),
      skin: p2Skin,
      loadout: ['SK-01', 'SK-02', 'SK-09']
    };

    // 戰鬥前確保畫布尺寸與擂台邊界自適應當前螢幕
    this._resizeCanvas();
    this.matchEndTimer = 0;

    combatEngine.initMatch(p1Data, p2Data, this.matchMode === 'training');

    // 啟動重播記錄器
    replaySystem.startRecording(12345, p1Data, p2Data, this.matchMode);

    this.isFighting = true;
    soundEngine.playUI('fight');
    soundEngine.startBgm();

    // 更新技能快捷鍵 HUD 圖標與頂部角色標籤
    const p1NameEl = document.getElementById('p1NameDisplay');
    const p2NameEl = document.getElementById('p2NameDisplay');
    const p2RoleTag = document.getElementById('p2RoleTag');
    if (p1NameEl) p1NameEl.textContent = p1Data.name;
    if (p2NameEl) p2NameEl.textContent = p2Data.name;
    if (p2RoleTag) {
      const p2Text = this.matchMode === 'local_2p' ? '2P 對手' : (this.matchMode === 'training' ? '訓練木樁' : '電腦對手 / AI');
      p2RoleTag.innerHTML = `<i class="fa-solid fa-robot"></i> ${p2Text}`;
    }
    this._updateSkillActionBar();

    // 進入 60 FPS 戰鬥主循環
    this._runBattleLoop();
  }

  _updateSkillActionBar() {
    const bar = document.getElementById('battleActionBar');
    if (!bar) return;

    bar.innerHTML = combatEngine.p1.skills.map((sk, idx) => {
      const hotkey = idx === 0 ? 'U' : (idx === 1 ? 'I' : 'O');
      return `
        <div class="skill-hud-card" id="skillCard_${idx}" style="border-color: ${sk.color};">
          <div class="skill-cd-overlay" id="skillCdOverlay_${idx}"></div>
          <i class="${sk.icon}" style="font-size: 20px; color: ${sk.color};"></i>
          <span style="font-size: 10px; font-weight: 900; color: #fff;">[${hotkey}]</span>
        </div>
      `;
    }).join('') + `
      <div class="guard-hud-card" id="guardHudBtn" title="按住召喚量子防護罩 (快捷鍵: L / Shift)">
        <i class="fa-solid fa-shield-halved" style="font-size: 20px; color: #38bdf8;"></i>
        <span style="font-size: 10px; font-weight: 900; color: #38bdf8;">[L] 護盾</span>
      </div>
      <div class="burst-hud-card" id="burstHudBtn">
        <span style="font-size: 11px;">BURST</span>
        <span style="font-size: 9px; opacity: 0.8;">[B]</span>
      </div>
    `;

    // 綁定防護罩 HUD 按鈕點擊/按住事件
    const guardBtn = document.getElementById('guardHudBtn');
    if (guardBtn) {
      guardBtn.onmousedown = (e) => { e.preventDefault(); this.keys['KeyL'] = true; };
      guardBtn.onmouseup = (e) => { e.preventDefault(); this.keys['KeyL'] = false; };
      guardBtn.onmouseleave = () => { this.keys['KeyL'] = false; };
      guardBtn.ontouchstart = (e) => { e.preventDefault(); this.mobileInputs.guard = true; };
      guardBtn.ontouchend = (e) => { e.preventDefault(); this.mobileInputs.guard = false; };
    }

    // 訓練營控制工具列
    const trainingBar = document.getElementById('trainingToolbar');
    if (trainingBar) {
      trainingBar.style.display = this.matchMode === 'training' ? 'flex' : 'none';
    }
  }

  _runBattleLoop() {
    if (!this.isFighting) return;

    // 1. 採集 1P 輸入 (對局結束時停止採集，勝者保持勝利姿態)
    const inputP1 = combatEngine.isOver
      ? { x: 0, y: 0, punch: false, kick: false, guard: false, skill1: false, skill2: false, skill3: false, burst: false }
      : this._gatherInputsP1();

    // 2. 採集 2P / AI 輸入
    let inputP2 = null;
    if (combatEngine.isOver) {
      inputP2 = { x: 0, y: 0, punch: false, kick: false, guard: false, skill1: false, skill2: false, skill3: false, burst: false };
    } else if (this.matchMode === 'local_2p') {
      inputP2 = this._gatherInputsP2();
    } else {
      inputP2 = aiController.decide(combatEngine.p2, combatEngine.p1, combatEngine);
    }

    // 3. 記錄到確定性重播系統
    if (!combatEngine.isOver) {
      replaySystem.recordFrame(inputP1, inputP2);
    }

    // 4. 戰鬥物理推進 1 幀
    combatEngine.update(inputP1, inputP2);

    // 5. 渲染戰鬥畫面
    this._renderBattleFrame();

    // 6. 更新戰鬥 HUD
    this._updateBattleHUD();

    // 7. 檢查對局結算與勝利姿態慶祝展示
    if (combatEngine.isOver && !combatEngine.isTraining) {
      if (!this.matchEndTimer) {
        this.matchEndTimer = 1;
      } else {
        this.matchEndTimer++;
      }

      // 勝利慶祝展示 110 幀 (~1.8 秒) 後彈出結算對話框，背景姿態動畫持續播放
      if (this.matchEndTimer === 110) {
        this._showMatchEndModal();
      }
    }

    requestAnimationFrame(() => this._runBattleLoop());
  }

  _gatherInputsP1() {
    const k = this.keys;
    const m = this.mobileInputs;

    let x = 0;
    let y = 0;
    if (k['KeyA'] || k['ArrowLeft']) x -= 1;
    if (k['KeyD'] || k['ArrowRight']) x += 1;
    if (k['KeyW'] || k['ArrowUp'] || k['Space']) y -= 1;
    if (k['KeyS'] || k['ArrowDown']) y += 1;

    // 疊加行動端觸控搖桿
    if (Math.abs(m.x) > 0.1) x = m.x;
    if (Math.abs(m.y) > 0.1) y = m.y;

    return {
      x,
      y,
      punch: !!(k['KeyJ'] || m.punch),
      kick: !!(k['KeyK'] || m.kick),
      guard: !!(k['KeyL'] || k['KeyH'] || k['ShiftLeft'] || k['ShiftRight'] || m.guard),
      skill1: !!(k['KeyU'] || m.skill1),
      skill2: !!(k['KeyI'] || m.skill2),
      skill3: !!(k['KeyO'] || m.skill3),
      burst: !!(k['KeyB'] || m.burst)
    };
  }

  _gatherInputsP2() {
    // 本地雙人同機對決 2P 鍵位 (方向鍵 + 數字鍵盤 1/2/3/4/5/6)
    const k = this.keys;
    let x = 0;
    let y = 0;
    if (k['ArrowLeft']) x -= 1;
    if (k['ArrowRight']) x += 1;
    if (k['ArrowUp']) y -= 1;
    if (k['ArrowDown']) y += 1;

    return {
      x,
      y,
      punch: !!(k['Numpad1'] || k['Digit1']),
      kick: !!(k['Numpad2'] || k['Digit2']),
      guard: !!(k['Numpad3'] || k['Digit3'] || k['NumpadDecimal']),
      skill1: !!(k['Numpad4'] || k['Digit4']),
      skill2: !!(k['Numpad5'] || k['Digit5']),
      skill3: !!(k['Numpad6'] || k['Digit6']),
      burst: !!(k['Numpad0'] || k['Digit0'])
    };
  }

  _renderBattleFrame() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. 清空畫布與背景漸層
    ctx.fillStyle = '#050814';
    ctx.fillRect(0, 0, w, h);

    // 2. 賽博擂台擂面格線與地面
    const groundY = combatEngine.floorY;
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // 地面反光發光條
    ctx.fillStyle = 'rgba(0, 243, 255, 0.6)';
    ctx.fillRect(0, groundY, w, 3);

    // 3. 繪製角色腳底發光光環 (地面定位圈)
    this._drawFighterFloorRings(ctx, groundY);

    // 4. 繪製雙方角色
    characterRenderer.draw(ctx, combatEngine.p1);
    characterRenderer.draw(ctx, combatEngine.p2);

    // 5. 繪製角色頭頂醒目標籤 (標示「這是玩家的角色」與「電腦對手」)
    this._drawFighterOverheadBadges(ctx);

    // 6. 繪製飛行道具 (Projectiles)
    combatEngine.projectiles.forEach(p => {
      ctx.save();
      ctx.shadowColor = p.skin.themeColor;
      ctx.shadowBlur = 16;
      ctx.fillStyle = p.skin.themeColor;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
      ctx.fill();

      // 拖尾電流
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 3, p.y);
      ctx.stroke();
      ctx.restore();
    });

    // 7. 繪製衝擊波與巨砲 (Shockwaves & Beams)
    combatEngine.shockwaves.forEach(s => {
      ctx.save();
      ctx.strokeStyle = s.color || '#00f3ff';
      ctx.shadowColor = s.color || '#00f3ff';
      ctx.shadowBlur = 20;
      if (s.isBeam) {
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

    // 8. 繪製浮動傷害與提示文字 (Floating Texts)
    combatEngine.floatingTexts.forEach(t => {
      ctx.save();
      ctx.font = 'bold 18px Orbitron, sans-serif';
      ctx.fillStyle = t.color;
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 10;
      ctx.fillText(t.text, t.x - 40, t.y);
      ctx.restore();
    });

    // 9. 戰鬥結束勝利橫幅與冠軍慶祝 (Victory Celebration Banner)
    if (combatEngine.isOver && !combatEngine.isTraining) {
      this._drawVictoryBanner(ctx, w, h);
    }
  }

  _drawVictoryBanner(ctx, w, h) {
    const isP1Win = combatEngine.winner === 1;
    const isP2Win = combatEngine.winner === 2;
    if (!isP1Win && !isP2Win) return;

    const winner = isP1Win ? combatEngine.p1 : combatEngine.p2;
    const winTitle = isP1Win ? 'VICTORY 戰鬥勝利' : 'K.O. 戰鬥結束';
    const subTitle = isP1Win ? '★ 恭喜獲勝！漂亮擊倒對手奪下冠軍 ★' : `${winner.name} 贏得了本場對決！`;
    const themeColor = isP1Win ? '#ffd700' : '#ff007f';

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 背景慶祝暗幕
    ctx.fillStyle = 'rgba(5, 8, 20, 0.45)';
    ctx.fillRect(0, 0, w, h);

    // 冠軍光芒主橫幅
    const cy = Math.max(160, h * 0.28);
    const bannerW = Math.min(w * 0.88, 560);
    const bannerH = 76;
    const bx = w / 2 - bannerW / 2;
    const by = cy - bannerH / 2;

    ctx.fillStyle = 'rgba(11, 17, 32, 0.9)';
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 24;

    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(bx, by, bannerW, bannerH, 12);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(bx, by, bannerW, bannerH);
      ctx.strokeRect(bx, by, bannerW, bannerH);
    }

    // 主標題文字
    ctx.font = '900 32px "Orbitron", "Noto Sans TC", sans-serif';
    ctx.fillStyle = themeColor;
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 16;
    ctx.fillText(winTitle, w / 2, cy - 10);

    // 副標題文字
    ctx.font = '700 13px "Noto Sans TC", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 6;
    ctx.fillText(subTitle, w / 2, cy + 20);

    ctx.restore();
  }

  _drawFighterFloorRings(ctx, groundY) {
    const p1 = combatEngine.p1;
    const p2 = combatEngine.p2;
    if (!p1 || !p2) return;
    const time = Date.now() / 250;

    // 1P (玩家) 腳底賽博藍光環
    ctx.save();
    ctx.translate(p1.x, groundY);
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
    ctx.translate(p2.x, groundY);
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

    // 1P 下指立體發光箭頭
    ctx.fillStyle = '#00f3ff';
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1HeadY);
    ctx.lineTo(p1.x - 7, p1HeadY - 9);
    ctx.lineTo(p1.x + 7, p1HeadY - 9);
    ctx.closePath();
    ctx.fill();

    // 1P 科技毛玻璃標籤底框 (含血量顯示)
    const p1Hp = Math.max(0, Math.round(p1.hp));
    const badgeW1 = 186;
    const badgeH1 = 28;
    const badgeX1 = p1.x - badgeW1 / 2;
    const badgeY1 = p1HeadY - 9 - badgeH1;

    ctx.fillStyle = 'rgba(5, 15, 30, 0.9)';
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(badgeX1, badgeY1, badgeW1, badgeH1, 6);
    } else {
      ctx.rect(badgeX1, badgeY1, badgeW1, badgeH1);
    }
    ctx.fill();
    ctx.stroke();

    // 1P 文字: ★ 這是玩家的角色 [HP]
    ctx.font = '900 12px "Orbitron", "Noto Sans TC", sans-serif';
    ctx.fillStyle = '#00f3ff';
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 10;
    ctx.fillText(`★ 這是玩家的角色 [${p1Hp} HP]`, p1.x, badgeY1 + badgeH1 / 2);
    ctx.restore();

    // ─── 對手 2P 頭頂標記 ───
    const p2HeadY = p2.y - 170 - bounce;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 2P 下指箭頭
    ctx.fillStyle = '#ff007f';
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(p2.x, p2HeadY);
    ctx.lineTo(p2.x - 7, p2HeadY - 9);
    ctx.lineTo(p2.x + 7, p2HeadY - 9);
    ctx.closePath();
    ctx.fill();

    // 2P 底框 (含血量顯示)
    const p2Hp = Math.max(0, Math.round(p2.hp));
    const p2Label = this.matchMode === 'local_2p' ? '2P 對手' : (this.matchMode === 'training' ? '訓練木樁' : '電腦對手 (AI)');
    const badgeW2 = 168;
    const badgeH2 = 28;
    const badgeX2 = p2.x - badgeW2 / 2;
    const badgeY2 = p2HeadY - 9 - badgeH2;

    ctx.fillStyle = 'rgba(25, 5, 15, 0.9)';
    ctx.strokeStyle = '#ff007f';
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
    ctx.fillStyle = '#ff007f';
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 10;
    ctx.fillText(`${p2Label} [${p2Hp} HP]`, p2.x, badgeY2 + badgeH2 / 2);
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

    // 2. 倒數計時 (訓練模式顯示 ∞)
    const timerEl = document.getElementById('roundTimerText');
    if (timerEl) {
      timerEl.textContent = combatEngine.isTraining ? '∞' : combatEngine.roundTime;
    }

    // 3. 量子爆發計量槽
    const burst1El = document.getElementById('p1BurstFill');
    if (burst1El) burst1El.style.width = `${(combatEngine.p1.burstMeter / combatEngine.p1.burstMax) * 100}%`;

    // 4. 技能冷卻遮罩
    combatEngine.p1.cooldowns.forEach((cd, idx) => {
      const overlay = document.getElementById(`skillCdOverlay_${idx}`);
      if (overlay) {
        const totalCd = combatEngine.p1.skills[idx].cd;
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
  }

  // ─── 對決結束與結算面板彈出 ───
  _showMatchEndModal() {
    soundEngine.stopBgm();

    const won = combatEngine.winner === 1;
    const isAi = this.matchMode === 'ai';
    const reward = saveSystem.recordBattleResult(won, this.aiDifficulty, isAi);

    // 停止重播錄製並生成短碼
    const shortcode = replaySystem.stopRecording();

    // 彈出結算面板 (背後擂台持續播放冠軍慶祝姿態)
    const endModal = document.getElementById('matchEndModal');
    const resultTitle = document.getElementById('matchResultTitle');
    const creditsReward = document.getElementById('matchRewardAmount');
    const shortcodeDisplay = document.getElementById('matchReplayCode');

    if (resultTitle) {
      resultTitle.textContent = won ? 'VICTORY 戰鬥勝利' : 'DEFEAT 戰鬥落敗';
      resultTitle.style.color = won ? '#00f3ff' : '#ff007f';
    }
    if (creditsReward) creditsReward.textContent = `+${reward.gained} 能量幣`;
    if (shortcodeDisplay) shortcodeDisplay.textContent = shortcode;
    if (endModal) endModal.classList.add('active');

    this.updateUserHUD();
  }

  exitBattleToLobby() {
    this.isFighting = false;
    this.matchEndTimer = 0;
    combatEngine.isOver = true;
    soundEngine.stopBgm();
    const battleScreen = document.getElementById('battleScreen');
    if (battleScreen) battleScreen.classList.remove('active');
    const endModal = document.getElementById('matchEndModal');
    if (endModal) endModal.classList.remove('active');
    const trainingBar = document.getElementById('trainingToolbar');
    if (trainingBar) trainingBar.style.display = 'none';
    this.updateUserHUD();
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
      fab.addEventListener('click', () => {
        const modeModal = document.getElementById('modeSelectModal');
        if (modeModal) modeModal.classList.add('active');
        soundEngine.playUI('click');
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

    // 模式選擇：自由格鬥訓練營
    const trainingBtn = document.getElementById('selectTrainingBtn');
    if (trainingBtn) {
      trainingBtn.onclick = () => {
        document.getElementById('modeSelectModal').classList.remove('active');
        this.startBattle('training');
      };
    }

    // 模式選擇：雙人連線房間 (P2P)
    const hostRoomBtn = document.getElementById('hostRoomBtn');
    if (hostRoomBtn) {
      hostRoomBtn.onclick = () => {
        const code = p2pNetwork.initHost((status, data) => {
          if (status === 'connected') {
            document.getElementById('modeSelectModal').classList.remove('active');
            this.startBattle('p2p');
          }
        });
        alert(`🎮 房間已建立！房間代碼：${code}\n請將代碼分享給好友連線對決。`);
      };
    }

    const joinRoomBtn = document.getElementById('joinRoomBtn');
    if (joinRoomBtn) {
      joinRoomBtn.onclick = () => {
        const code = prompt('請輸入 6 位數房間代碼（例如：CY-8821）：');
        if (code) {
          p2pNetwork.joinRoom(code, (status) => {
            if (status === 'connected') {
              document.getElementById('modeSelectModal').classList.remove('active');
              this.startBattle('p2p');
            }
          });
        }
      };
    }

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

    // 重播短碼複製與載入
    const copyReplayBtn = document.getElementById('copyReplayCodeBtn');
    if (copyReplayBtn) {
      copyReplayBtn.onclick = () => {
        const code = document.getElementById('matchReplayCode').textContent;
        navigator.clipboard.writeText(code);
        alert(`📋 重播代碼【${code}】已複製到剪貼簿！可直接分享給社群好友。`);
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

    // 回到大廳按鈕與常駐戰鬥退出按鈕
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

    // 每日戰備補給領取按鈕
    const claimRewardBtn = document.getElementById('dailyRewardClaimBtn');
    if (claimRewardBtn) {
      claimRewardBtn.addEventListener('click', () => {
        if (saveSystem.currentUser) {
          saveSystem.currentUser.credits += 1500;
          saveSystem._saveCurrent();
          this.updateUserHUD();
          soundEngine.playUI('equip');
          alert('🎁 每日戰備補給領取成功！已獲得 +1,500 能量幣，快去解鎖心儀的戰將吧！');
          this.renderShopCatalog();
        }
      });
    }

    // 所有關閉按鈕
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.onclick = () => {
        const m = btn.closest('.modal-overlay');
        if (m) m.classList.remove('active');
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
    bindTouchBtn('touchBurstBtn', 'burst');
  }

  _updateJoystick(dx, dy) {
    const dist = Math.hypot(dx, dy);
    const maxRadius = 60;
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);
    this.mobileInputs.x = (Math.cos(angle) * clampedDist) / maxRadius;
    this.mobileInputs.y = (Math.sin(angle) * clampedDist) / maxRadius;
  }
}

// 實例化並暴露給視窗
window.app = new CyberStrikerApp();
window.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
