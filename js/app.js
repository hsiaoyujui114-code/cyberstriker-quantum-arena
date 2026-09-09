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
    this.mobileInputs = { x: 0, y: 0, punch: false, kick: false, skill1: false, skill2: false, skill3: false, burst: false };

    // 畫布
    this.canvas = null;
    this.ctx = null;
    this.pedestalCanvas = null;
    this.pedestalCtx = null;
  }

  init() {
    // 1. 初始化存檔與音效
    saveSystem.init();
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

    // 更新設定滑桿
    if (u.preferences) {
      soundEngine.setBgmVolume(u.preferences.bgmVol || 0.4);
      soundEngine.setSfxVolume(u.preferences.sfxVol || 0.8);
      combatEngine.enableHaptics = u.preferences.haptics !== false;
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
        btn.addEventListener('click', () => {
          const email = btn.dataset.email;
          saveSystem.switchAccount(email);
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

  // ─── 賽前 15 秒「10 選 3」配技視窗 ───
  openLoadoutModal(startMatchCallback) {
    const modal = document.getElementById('loadoutModal');
    if (!modal) return;
    modal.classList.add('active');

    this.loadoutTimer = 15;
    const timerDisplay = document.getElementById('loadoutCountdown');

    const u = saveSystem.currentUser;
    this.loadoutSelection = (u && u.loadout && u.loadout.length === 3) ? [...u.loadout] : ['SK-01', 'SK-02', 'SK-09'];

    this._renderLoadoutSkillsGrid();

    // 啟動 15 秒倒數
    clearInterval(this.loadoutInterval);
    this.loadoutInterval = setInterval(() => {
      this.loadoutTimer--;
      if (timerDisplay) timerDisplay.textContent = this.loadoutTimer;
      if (this.loadoutTimer <= 3) soundEngine.playUI('countdown');

      if (this.loadoutTimer <= 0) {
        clearInterval(this.loadoutInterval);
        this._confirmLoadout(startMatchCallback);
      }
    }, 1000);

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

    // 確認按鈕
    const confirmBtn = document.getElementById('confirmLoadoutBtn');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        clearInterval(this.loadoutInterval);
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

    combatEngine.initMatch(p1Data, p2Data, this.matchMode === 'training');

    // 啟動重播記錄器
    replaySystem.startRecording(12345, p1Data, p2Data, this.matchMode);

    this.isFighting = true;
    soundEngine.playUI('fight');
    soundEngine.startBgm();

    // 更新技能快捷鍵 HUD 圖標
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
      <div class="burst-hud-card" id="burstHudBtn">
        <span style="font-size: 11px;">BURST</span>
        <span style="font-size: 9px; opacity: 0.8;">[B]</span>
      </div>
    `;

    // 訓練營控制工具列
    const trainingBar = document.getElementById('trainingToolbar');
    if (trainingBar) {
      trainingBar.style.display = this.matchMode === 'training' ? 'flex' : 'none';
    }
  }

  _runBattleLoop() {
    if (!this.isFighting) return;

    // 1. 採集 1P 輸入
    const inputP1 = this._gatherInputsP1();

    // 2. 採集 2P / AI 輸入
    let inputP2 = null;
    if (this.matchMode === 'local_2p') {
      inputP2 = this._gatherInputsP2();
    } else {
      inputP2 = aiController.decide(combatEngine.p2, combatEngine.p1, combatEngine);
    }

    // 3. 記錄到確定性重播系統
    replaySystem.recordFrame(inputP1, inputP2);

    // 4. 戰鬥物理推進 1 幀
    combatEngine.update(inputP1, inputP2);

    // 5. 渲染戰鬥畫面
    this._renderBattleFrame();

    // 6. 更新戰鬥 HUD
    this._updateBattleHUD();

    // 7. 檢查對局結算
    if (combatEngine.isOver && !combatEngine.isTraining) {
      this._handleMatchEnd();
      return;
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
      skill1: !!(k['KeyU'] || m.skill1),
      skill2: !!(k['KeyI'] || m.skill2),
      skill3: !!(k['KeyO'] || m.skill3),
      burst: !!(k['KeyB'] || m.burst)
    };
  }

  _gatherInputsP2() {
    // 本地雙人同機對決 2P 鍵位 (方向鍵 + 數字鍵盤 1/2/4/5/6)
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

    // 3. 繪製雙方角色
    characterRenderer.draw(ctx, combatEngine.p1);
    characterRenderer.draw(ctx, combatEngine.p2);

    // 4. 繪製飛行道具 (Projectiles)
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

    // 5. 繪製衝擊波與巨砲 (Shockwaves & Beams)
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

    // 6. 繪製浮動傷害與提示文字 (Floating Texts)
    combatEngine.floatingTexts.forEach(t => {
      ctx.save();
      ctx.font = 'bold 18px Orbitron, sans-serif';
      ctx.fillStyle = t.color;
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 10;
      ctx.fillText(t.text, t.x - 40, t.y);
      ctx.restore();
    });
  }

  _updateBattleHUD() {
    // 1. 生命值
    const hp1El = document.getElementById('p1HpFill');
    const hp2El = document.getElementById('p2HpFill');
    if (hp1El) hp1El.style.width = `${Math.max(0, (combatEngine.p1.hp / combatEngine.p1.maxHp) * 100)}%`;
    if (hp2El) hp2El.style.width = `${Math.max(0, (combatEngine.p2.hp / combatEngine.p2.maxHp) * 100)}%`;

    // 2. 倒數計時
    const timerEl = document.getElementById('roundTimerText');
    if (timerEl) timerEl.textContent = combatEngine.roundTime;

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
  }

  // ─── 對決結束與結算 ───
  _handleMatchEnd() {
    this.isFighting = false;
    soundEngine.stopBgm();

    const won = combatEngine.winner === 1;
    const isAi = this.matchMode === 'ai';
    const reward = saveSystem.recordBattleResult(won, this.aiDifficulty, isAi);

    // 停止重播錄製並生成短碼
    const shortcode = replaySystem.stopRecording();

    // 彈出結算面板
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
    soundEngine.stopBgm();
    const battleScreen = document.getElementById('battleScreen');
    if (battleScreen) battleScreen.classList.remove('active');
    const endModal = document.getElementById('matchEndModal');
    if (endModal) endModal.classList.remove('active');
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

    // 授權儀表單處理 (途徑一：手動 Gmail)
    const emailForm = document.getElementById('manualEmailForm');
    if (emailForm) {
      emailForm.onsubmit = (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('authEmailInput');
        const nickInput = document.getElementById('authNicknameInput');
        const email = emailInput ? emailInput.value.trim() : '';
        const nick = nickInput ? nickInput.value.trim() : '';

        if (!email.includes('@') || !email.includes('.')) {
          alert('請輸入有效的 Gmail 信箱格式！');
          return;
        }

        const res = saveSystem.loginWithEmail(email, nick);
        soundEngine.playUI('equip');
        alert(res.isNewUser ? `🎉 歡迎新戰士！已發放 1,200 能量幣與 3 套預設造型。` : `✅ 歡迎回來！已自雲端成功還原所有進度。`);
        this.updateUserHUD();
        this.renderSkinsInventory();
        this.renderShopCatalog();
        this.closeAuthModal();
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

    // 回到大廳按鈕
    const backLobbyBtn = document.getElementById('matchBackLobbyBtn');
    if (backLobbyBtn) {
      backLobbyBtn.onclick = () => this.exitBattleToLobby();
    }

    const exitTrainingBtn = document.getElementById('exitTrainingBtn');
    if (exitTrainingBtn) {
      exitTrainingBtn.onclick = () => this.exitBattleToLobby();
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
