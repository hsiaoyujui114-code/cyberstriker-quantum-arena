/**
 * 《CyberStriker: Quantum Arena》
 * 2D 人體骨骼程序化渲染引擎 (Articulated Skeletal Renderer)
 * 8 大肢體關節部件 + 12 種戰鬥武打姿態 + 5 套專屬外觀 VFX 色彩分離
 * 完全符合 GAME_PROJECT_PLAN.md 第 2.3 與 3.1 節
 */

export class CharacterRenderer {
  constructor() {
    // 8 大骨骼標準尺寸規格 (像素級精確，全外觀判定盒 100% 對稱)
    this.boneSpec = {
      headRadius: 18,
      visorWidth: 16,
      visorHeight: 6,
      torsoWidth: 32,
      torsoHeight: 46,
      coreRadius: 7,
      pelvisWidth: 26,
      pelvisHeight: 14,
      upperArmLength: 24,
      upperArmWidth: 10,
      forearmLength: 26,
      forearmWidth: 12,
      thighLength: 30,
      thighWidth: 13,
      shinLength: 32,
      shinWidth: 12,
      footLength: 20,
      footHeight: 10
    };
  }

  /**
   * 渲染單一角色至 2D Canvas
   * @param {CanvasRenderingContext2D} ctx 
   * @param {Object} char 角色資料模型（包含 x, y, facing, state, stateTime, skin, isGuarding, etc.）
   */
  draw(ctx, char) {
    ctx.save();

    const skin = char.skin;
    const facing = char.facing || 1; // 1: 朝右, -1: 朝左
    const state = char.state || 'idle';
    const t = char.stateTime || 0;

    // 定位角色基準原點 (底部腳掌中心)
    ctx.translate(Math.round(char.x), Math.round(char.y));
    ctx.scale(facing, 1);

    // 起身無敵閃爍保護 (15 幀)
    if (char.invincibleTimer > 0 && Math.floor(char.invincibleTimer / 3) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // 計算 12 種姿態骨骼角度
    const pose = this.calculatePose(state, t, char);

    // 1. 繪製後層肢體 (背側手臂、背側腿)
    this.drawLimb(ctx, pose.backLeg, skin, 'backLeg');
    this.drawArm(ctx, pose.backArm, skin, 'backArm');

    // 2. 繪製軀幹、骨盆與量子反應爐
    this.drawTorso(ctx, pose.torso, skin, t);

    // 3. 繪製頭部與全息目鏡
    this.drawHead(ctx, pose.head, skin);

    // 4. 繪製前層肢體 (前側腿、前側手臂)
    this.drawLimb(ctx, pose.frontLeg, skin, 'frontLeg');
    this.drawArm(ctx, pose.frontArm, skin, 'frontArm');

    // 5. 繪製防禦幾何力場護盾 (若正在格擋)
    if (char.isGuarding) {
      this.drawGuardShield(ctx, char.guardStance || 'high', skin, t);
    }

    // 6. 繪製專屬 VFX (出拳光軌、重踢光弧、粒子殘影)
    if (pose.vfx) {
      this.drawAttackVFX(ctx, pose.vfx, skin);
    }

    ctx.restore();
  }

  /**
   * 計算 12 種武打姿態下的關節角度與位移
   */
  calculatePose(state, t, char) {
    const defaultPose = {
      torso: { x: 0, y: -74, angle: 0 },
      head: { x: 0, y: -98, angle: 0 },
      frontArm: { shoulderX: 8, shoulderY: -86, upperAngle: 0.5, foreAngle: 1.2 },
      backArm: { shoulderX: -8, shoulderY: -86, upperAngle: 0.3, foreAngle: 1.0 },
      frontLeg: { hipX: 6, hipY: -42, thighAngle: 0.2, shinAngle: 0.1 },
      backLeg: { hipX: -6, hipY: -42, thighAngle: -0.2, shinAngle: 0.1 },
      vfx: null
    };

    switch (state) {
      case 'idle': {
        // 自然呼吸起伏
        const breath = Math.sin(t * 0.08) * 3;
        defaultPose.torso.y = -74 + breath;
        defaultPose.head.y = -98 + breath;
        defaultPose.frontArm.upperAngle = 0.4 + Math.sin(t * 0.08) * 0.08;
        defaultPose.frontArm.foreAngle = 1.3 + Math.sin(t * 0.08) * 0.05;
        defaultPose.backArm.upperAngle = 0.2;
        defaultPose.backArm.foreAngle = 1.1;
        return defaultPose;
      }

      case 'walk_fwd': {
        // 向前大步邁進，軀幹前傾約 7 度
        const cycle = Math.sin(t * 0.2);
        const cycleCos = Math.cos(t * 0.2);
        defaultPose.torso.angle = 0.12; // 約 7 度前傾
        defaultPose.torso.y = -74 + Math.abs(cycle) * 4;
        defaultPose.head.y = -98 + Math.abs(cycle) * 4;

        defaultPose.frontLeg.thighAngle = cycle * 0.7;
        defaultPose.frontLeg.shinAngle = Math.max(0, -cycle * 0.6);
        defaultPose.backLeg.thighAngle = -cycle * 0.7;
        defaultPose.backLeg.shinAngle = Math.max(0, cycle * 0.6);

        defaultPose.frontArm.upperAngle = -cycle * 0.6 + 0.3;
        defaultPose.frontArm.foreAngle = 0.8;
        defaultPose.backArm.upperAngle = cycle * 0.6 + 0.3;
        defaultPose.backArm.foreAngle = 0.8;
        return defaultPose;
      }

      case 'walk_back': {
        // 後撤敏捷走位步 (純走位移動，自然戰備擺臂，無防護罩)
        const cycle = Math.sin(t * 0.16);
        defaultPose.torso.angle = -0.04;
        defaultPose.frontArm.upperAngle = -cycle * 0.4 + 0.4;
        defaultPose.frontArm.foreAngle = 0.9;
        defaultPose.backArm.upperAngle = cycle * 0.4 + 0.3;
        defaultPose.backArm.foreAngle = 0.9;

        defaultPose.frontLeg.thighAngle = -cycle * 0.45;
        defaultPose.backLeg.thighAngle = cycle * 0.45;
        return defaultPose;
      }

      case 'jump':
      case 'jump_up': {
        // 騰空躍起，膝部收斂
        defaultPose.torso.y = -82;
        defaultPose.head.y = -106;
        defaultPose.frontLeg.thighAngle = -0.8;
        defaultPose.frontLeg.shinAngle = 1.2;
        defaultPose.backLeg.thighAngle = -0.5;
        defaultPose.backLeg.shinAngle = 1.0;
        defaultPose.frontArm.upperAngle = -0.6;
        defaultPose.frontArm.foreAngle = 0.4;
        defaultPose.backArm.upperAngle = -0.8;
        defaultPose.backArm.foreAngle = 0.4;
        return defaultPose;
      }

      case 'crouch': {
        // 蹲姿壓低 30 像素，雙臂前臂向下護腹
        defaultPose.torso.y = -48;
        defaultPose.torso.angle = 0.25;
        defaultPose.head.y = -72;
        defaultPose.frontLeg.thighAngle = -1.4;
        defaultPose.frontLeg.shinAngle = 2.1;
        defaultPose.backLeg.thighAngle = -1.2;
        defaultPose.backLeg.shinAngle = 2.0;
        defaultPose.frontArm.upperAngle = 0.8;
        defaultPose.frontArm.foreAngle = 0.9;
        defaultPose.backArm.upperAngle = 0.6;
        defaultPose.backArm.foreAngle = 0.8;
        return defaultPose;
      }

      case 'high_guard': {
        // 高段格擋，雙臂垂直上抬架在面部前
        defaultPose.frontArm.upperAngle = 1.2;
        defaultPose.frontArm.foreAngle = 1.8;
        defaultPose.backArm.upperAngle = 1.0;
        defaultPose.backArm.foreAngle = 1.6;
        return defaultPose;
      }

      case 'low_guard': {
        // 下段格擋，沉腰下蹲，雙前臂向斜下方壓制
        defaultPose.torso.y = -50;
        defaultPose.head.y = -74;
        defaultPose.frontLeg.thighAngle = -1.3;
        defaultPose.frontLeg.shinAngle = 2.0;
        defaultPose.frontArm.upperAngle = 0.5;
        defaultPose.frontArm.foreAngle = 0.4;
        defaultPose.backArm.upperAngle = 0.4;
        defaultPose.backArm.foreAngle = 0.4;
        return defaultPose;
      }

      case 'light_punch': {
        // 刺拳：前手閃電般直刺出擊，手肘由屈至直，腰部轉動
        const pProgress = Math.min(1, t / 14);
        const reach = Math.sin(pProgress * Math.PI);
        defaultPose.torso.angle = 0.15 * reach;
        defaultPose.frontArm.upperAngle = 0.2 - reach * 0.9;
        defaultPose.frontArm.foreAngle = 1.2 - reach * 1.1; // 伸直
        defaultPose.backArm.upperAngle = 0.6;
        defaultPose.backArm.foreAngle = 1.4;
        if (reach > 0.3) {
          defaultPose.vfx = { type: 'punch', progress: reach, x: 50, y: -78 };
        }
        return defaultPose;
      }

      case 'heavy_kick': {
        // 重力猛踢：踢擊腿大角度破空踢擊，上身反向後仰平衡
        const kProgress = Math.min(1, t / 18);
        const kickWave = Math.sin(kProgress * Math.PI);
        defaultPose.torso.angle = -0.3 * kickWave; // 上身反向後仰
        defaultPose.frontLeg.thighAngle = 0.2 - kickWave * 1.8; // 大角度踢出
        defaultPose.frontLeg.shinAngle = 0.1 - kickWave * 0.4;
        defaultPose.frontArm.upperAngle = -0.4;
        defaultPose.frontArm.foreAngle = 0.5;
        if (kickWave > 0.4) {
          defaultPose.vfx = { type: 'kick', progress: kickWave, x: 54, y: -60 };
        }
        return defaultPose;
      }

      case 'hit_stun': {
        // 受擊仰頭，目鏡閃爍，身形後仰滑行
        const hOffset = Math.sin(t * 0.4) * 4;
        defaultPose.torso.angle = -0.35;
        defaultPose.head.angle = -0.45;
        defaultPose.torso.x = -8 + hOffset;
        defaultPose.head.x = -12 + hOffset;
        defaultPose.frontArm.upperAngle = -0.8;
        defaultPose.frontArm.foreAngle = 0.4;
        defaultPose.backArm.upperAngle = -0.6;
        defaultPose.backArm.foreAngle = 0.5;
        defaultPose.vfx = { type: 'hit_sparks', x: 0, y: -74 };
        return defaultPose;
      }

      case 'knockdown': {
        // 倒地翻滾：旋轉橫飛、平躺
        defaultPose.torso.y = -16;
        defaultPose.torso.angle = -Math.PI / 2;
        defaultPose.head.y = -16;
        defaultPose.head.x = -32;
        defaultPose.head.angle = -Math.PI / 2;
        defaultPose.frontLeg.thighAngle = -Math.PI / 2;
        defaultPose.frontLeg.shinAngle = 0.2;
        defaultPose.backLeg.thighAngle = -Math.PI / 2;
        defaultPose.frontArm.upperAngle = -Math.PI / 2;
        defaultPose.frontArm.foreAngle = 0.2;
        return defaultPose;
      }

      case 'wakeup': {
        // 單手撐地彈起
        const wRatio = Math.min(1, t / 15);
        defaultPose.torso.y = -16 - wRatio * 58;
        defaultPose.head.y = -16 - wRatio * 82;
        defaultPose.torso.angle = -Math.PI / 2 * (1 - wRatio);
        defaultPose.head.angle = -Math.PI / 2 * (1 - wRatio);
        return defaultPose;
      }

      // 招式專屬姿態
      case 'SK-02': { // 升龍拳
        defaultPose.torso.angle = 0.1;
        defaultPose.frontArm.upperAngle = -2.2; // 垂直沖天
        defaultPose.frontArm.foreAngle = 0.1;
        defaultPose.frontLeg.thighAngle = -0.9;
        defaultPose.frontLeg.shinAngle = 1.4;
        defaultPose.vfx = { type: 'shoryuken', x: 12, y: -110 };
        return defaultPose;
      }

      case 'SK-03': { // 音速滑踢
        defaultPose.torso.y = -26;
        defaultPose.torso.angle = -0.5;
        defaultPose.head.y = -40;
        defaultPose.frontLeg.thighAngle = -1.5;
        defaultPose.frontLeg.shinAngle = 0.1;
        defaultPose.backLeg.thighAngle = 0.6;
        defaultPose.backLeg.shinAngle = 1.8;
        defaultPose.vfx = { type: 'slide_dust', x: 30, y: -5 };
        return defaultPose;
      }

      case 'victory': {
        // 勝利慶祝姿態：胸部反應爐耀眼高亮，單拳高舉指天，另一手叉腰，身姿挺拔自信，散發金色勝利光輝
        const vCycle = Math.sin(t * 0.08) * 2;
        defaultPose.torso.y = -76 + vCycle;
        defaultPose.head.y = -100 + vCycle;
        defaultPose.torso.angle = -0.06; // 昂首挺胸微後仰
        defaultPose.head.angle = -0.15; // 仰頭瞻望天空

        // 前手高高舉起指向天空 (勝利冠軍拳)
        defaultPose.frontArm.upperAngle = -2.3; // 垂直指天
        defaultPose.frontArm.foreAngle = 0.3;  // 前臂握拳
        
        // 後手叉腰
        defaultPose.backArm.upperAngle = 0.8;
        defaultPose.backArm.foreAngle = 1.9;   // 肘部向外手掌抵腰

        // 雙腿自信跨立穩如泰山
        defaultPose.frontLeg.thighAngle = 0.28;
        defaultPose.frontLeg.shinAngle = 0.08;
        defaultPose.backLeg.thighAngle = -0.28;
        defaultPose.backLeg.shinAngle = 0.08;

        defaultPose.vfx = {
          type: 'victory_aura',
          color: char.skin && char.skin.themeColor ? char.skin.themeColor : '#ffd700',
          x: 0,
          y: -74,
          time: t
        };
        return defaultPose;
      }

      case 'defeat': {
        // 戰敗單膝跪地垂頭姿態
        defaultPose.torso.y = -42;
        defaultPose.torso.angle = 0.35; // 前傾垂頭
        defaultPose.head.y = -62;
        defaultPose.head.angle = 0.55;  // 垂頭喪氣
        defaultPose.frontLeg.thighAngle = -1.4;
        defaultPose.frontLeg.shinAngle = 2.2;
        defaultPose.backLeg.thighAngle = -1.6;
        defaultPose.backLeg.shinAngle = 1.9;
        defaultPose.frontArm.upperAngle = 0.6;
        defaultPose.frontArm.foreAngle = 0.5; // 單手垂地
        defaultPose.backArm.upperAngle = 0.4;
        defaultPose.backArm.foreAngle = 0.4;
        return defaultPose;
      }

      default:
        return defaultPose;
    }
  }

  // ─── 肢體繪製方法 ───

  drawTorso(ctx, torso, skin, t) {
    ctx.save();
    ctx.translate(torso.x, torso.y);
    ctx.rotate(torso.angle);

    // 胸甲護板
    ctx.fillStyle = skin.armorColor || '#0f172a';
    ctx.strokeStyle = skin.themeColor || '#00f3ff';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(-16, -23);
    ctx.lineTo(16, -23);
    ctx.lineTo(12, 16);
    ctx.lineTo(-12, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 骨盆/腰帶
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-11, 16, 22, 12);
    ctx.strokeRect(-11, 16, 22, 12);

    // 中央量子反應爐核心 (自然脈衝微光)
    const pulse = 1 + Math.sin(t * 0.1) * 0.15;
    ctx.save();
    ctx.shadowColor = skin.themeColor;
    ctx.shadowBlur = 12 * pulse;
    ctx.fillStyle = skin.coreColor || skin.themeColor;
    ctx.beginPath();
    ctx.arc(0, -6, 6 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // 核心內核高亮白
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -6, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  _hexToRgb(hex) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return '0, 243, 255';
    let c = hex.substring(1);
    if (c.length === 3) {
      c = c.split('').map(x => x + x).join('');
    }
    const num = parseInt(c, 16);
    if (isNaN(num)) return '0, 243, 255';
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `${r}, ${g}, ${b}`;
  }

  /**
   * 繪製高科技賽博頭部與機械仿生雙眼 (High-Tech Cyber Head with Dual Optic Eyes & HUD)
   */
  drawHead(ctx, head, skin) {
    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(head.angle);

    const themeColor = skin.themeColor || '#00f3ff';
    const visorColor = skin.visorColor || themeColor;
    const accentColor = skin.accentColor || themeColor;
    const armorColor = skin.armorColor || '#0f172a';
    const t = Date.now() / 250;
    const rgbVisor = this._hexToRgb(visorColor);
    const rgbTheme = this._hexToRgb(themeColor);

    // ── 1. 高科技機甲頭盔外輪廓 (Mecha Helmet Chassis) ──
    ctx.fillStyle = armorColor;
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    // 後腦勺圓弧至頭頂空氣動力導流脊
    ctx.moveTo(-12, 10);
    ctx.quadraticCurveTo(-18, 0, -15, -10);
    ctx.quadraticCurveTo(-10, -18, 2, -18);
    // 前額眉甲稜角延伸至面部
    ctx.lineTo(12, -12);
    ctx.lineTo(15, -4);
    // 下顎戰術面甲與導流線
    ctx.lineTo(13, 6);
    ctx.lineTo(6, 15);
    ctx.lineTo(-6, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // ── 2. 額頭戰術眉甲與全息電路刻線 (Forehead Crest & Circuit Trace) ──
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-6, -17);
    ctx.lineTo(6, -16);
    ctx.lineTo(11, -11);
    ctx.stroke();

    // 額頭中央量子光學處理晶片 (Quantum Optical Node)
    ctx.fillStyle = themeColor;
    ctx.beginPath();
    ctx.moveTo(3, -15);
    ctx.lineTo(6, -13);
    ctx.lineTo(3, -11);
    ctx.lineTo(0, -13);
    ctx.closePath();
    ctx.fill();

    // ── 3. 側邊戰術通訊耳部模組 (Comms Beacon & Neural Link) ──
    ctx.fillStyle = '#090d16';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-8, 1, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 耳機狀態微脈衝指示燈 (Status LED)
    const ledPulse = Math.sin(t * 1.5) * 0.3 + 0.7;
    ctx.fillStyle = visorColor;
    ctx.shadowColor = visorColor;
    ctx.shadowBlur = 6 * ledPulse;
    ctx.beginPath();
    ctx.arc(-8, 1, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 太陽穴接駁光纖導線 (Neural Fiber Line)
    ctx.strokeStyle = `rgba(${rgbTheme}, 0.65)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(0, -2);
    ctx.lineTo(3, -3);
    ctx.stroke();

    // ── 4. 戰術深黑眼眶基座 (Tactical Eye Socket Faceplate) ──
    ctx.fillStyle = 'rgba(2, 6, 18, 0.92)';
    ctx.strokeStyle = `rgba(${rgbTheme}, 0.4)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    // 銳利幾何眼眶
    ctx.moveTo(2, -7);
    ctx.lineTo(15, -4);
    ctx.lineTo(14, 3);
    ctx.lineTo(3, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // ── 5. 高科技賽博機械仿生雙眼 (Dual Cyber-Optic Eyes with HUD) ──

    // (A) 後側立體眼角光學節點 (Far Eye Node) - 呈現 3/4 視角雙眼立體感
    ctx.save();
    ctx.shadowColor = visorColor;
    ctx.shadowBlur = 8;
    ctx.fillStyle = visorColor;
    ctx.beginPath();
    ctx.ellipse(3.2, -2, 2.2, 3.2, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // 後眼瞳孔極光核
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(3.2, -2, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // (B) 前側主光學感測眼 (Main Cyber-Optic Eye) - 銳利科技戰神神韻
    ctx.save();
    ctx.shadowColor = visorColor;
    ctx.shadowBlur = 14;

    // 賽博眼白發光基底 (Glowing Cyber Sclera)
    ctx.fillStyle = `rgba(${rgbVisor}, 0.4)`;
    ctx.beginPath();
    ctx.moveTo(6, -4.5);
    ctx.lineTo(14, -3.2);
    ctx.lineTo(13, 2);
    ctx.lineTo(6.5, 1.5);
    ctx.closePath();
    ctx.fill();

    // 銳利高科技霓虹虹膜 (Angular Neon Iris)
    ctx.fillStyle = visorColor;
    ctx.beginPath();
    ctx.moveTo(7, -3.8);
    ctx.lineTo(13.2, -2.8);
    ctx.lineTo(12, 1.2);
    ctx.lineTo(7.5, 0.8);
    ctx.closePath();
    ctx.fill();

    // 數位光學聚焦瞳孔 (Digital Reticle Core)
    const pupilPulse = Math.sin(t * 2) * 0.3 + 1.2;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(10, -1, 1.8 * pupilPulse, 0, Math.PI * 2);
    ctx.fill();

    // 瞳孔十字瞄準準星 (Crosshair Targeting Reticle)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10 - 3.5, -1);
    ctx.lineTo(10 + 3.5, -1);
    ctx.moveTo(10, -1 - 3.5);
    ctx.lineTo(10, -1 + 3.5);
    ctx.stroke();

    // 全息瞄準射線 (Holographic HUD Aiming Laser)
    const laserAlpha = Math.sin(t * 3) * 0.25 + 0.65;
    ctx.strokeStyle = `rgba(${rgbVisor}, ${laserAlpha})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(14, -2);
    ctx.lineTo(25, -2);
    ctx.stroke();

    // 激光微端戰術瞄準方括號 HUD [ ] (Targeting Bracket)
    ctx.beginPath();
    ctx.moveTo(22, -5);
    ctx.lineTo(25, -2);
    ctx.lineTo(22, 1);
    ctx.stroke();

    ctx.restore();

    // ── 6. 戰術下顎呼吸濾嘴與面甲刻線 (Jawline Filter & Cyberpanel Seams) ──
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(6, 6);
    ctx.lineTo(12, 5);
    ctx.moveTo(5, 9);
    ctx.lineTo(10, 8);
    ctx.stroke();

    // 呼吸排氣微格柵
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(8, 9, 3, 2);

    ctx.restore();
  }

  drawArm(ctx, arm, skin, layer) {
    ctx.save();
    ctx.translate(arm.shoulderX, arm.shoulderY);
    ctx.rotate(arm.upperAngle);

    const isBack = layer === 'backArm';
    const armorCol = isBack ? '#0a0f1d' : (skin.armorColor || '#0f172a');
    const strokeCol = isBack ? '#1e293b' : skin.themeColor;

    // 1. 上臂
    ctx.fillStyle = armorCol;
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-4, 0, 8, 22, 4);
    ctx.fill();
    ctx.stroke();

    // 2. 前臂與科技拳套
    ctx.translate(0, 20);
    ctx.rotate(arm.foreAngle);

    ctx.fillStyle = skin.accentColor || skin.themeColor;
    ctx.beginPath();
    ctx.roundRect(-5, 0, 10, 22, 4);
    ctx.fill();
    ctx.stroke();

    // 拳套關節金屬飾邊
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3, 16, 6, 4);

    ctx.restore();
  }

  drawLimb(ctx, leg, skin, layer) {
    ctx.save();
    ctx.translate(leg.hipX, leg.hipY);
    ctx.rotate(leg.thighAngle);

    const isBack = layer === 'backLeg';
    const armorCol = isBack ? '#090d18' : (skin.armorColor || '#0f172a');
    const strokeCol = isBack ? '#1e293b' : skin.themeColor;

    // 1. 大腿護甲
    ctx.fillStyle = armorCol;
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-5, 0, 10, 26, 4);
    ctx.fill();
    ctx.stroke();

    // 2. 小腿與戰靴
    ctx.translate(0, 24);
    ctx.rotate(leg.shinAngle);

    ctx.fillStyle = armorCol;
    ctx.beginPath();
    ctx.roundRect(-5, 0, 10, 28, 4);
    ctx.fill();
    ctx.stroke();

    // 戰靴底部噴射裝甲
    ctx.fillStyle = skin.themeColor;
    ctx.fillRect(-4, 24, 15, 6);

    ctx.restore();
  }

  // ─── 防禦力場護盾渲染 ───
  drawGuardShield(ctx, stance, skin, t) {
    ctx.save();
    const pulse = Math.sin(t * 0.2) * 0.1 + 0.9;
    ctx.shadowColor = skin.themeColor;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = skin.themeColor;
    ctx.fillStyle = skin.glowColor || 'rgba(0, 243, 255, 0.2)';
    ctx.lineWidth = 3;

    if (stance === 'low') {
      // 下段斜向下菱形幾何護盾
      ctx.beginPath();
      ctx.moveTo(10, -10);
      ctx.lineTo(44, -20);
      ctx.lineTo(36, -60);
      ctx.lineTo(6, -45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // 高段正前方六角蜂巢力場
      const shieldY = -74;
      ctx.beginPath();
      ctx.moveTo(24, shieldY - 45);
      ctx.lineTo(48, shieldY - 25);
      ctx.lineTo(48, shieldY + 25);
      ctx.lineTo(24, shieldY + 45);
      ctx.lineTo(14, shieldY + 20);
      ctx.lineTo(14, shieldY - 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 護盾網格線
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(24, shieldY - 45);
      ctx.lineTo(48, shieldY + 25);
      ctx.moveTo(48, shieldY - 25);
      ctx.lineTo(24, shieldY + 45);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ─── 武打 VFX 渲染 (依外觀色彩分離映射) ───
  drawAttackVFX(ctx, vfx, skin) {
    ctx.save();
    ctx.shadowColor = skin.themeColor;
    ctx.shadowBlur = 16;
    ctx.fillStyle = skin.themeColor;

    if (vfx.type === 'punch') {
      // 刺拳能量刃弧光
      ctx.beginPath();
      ctx.arc(vfx.x, vfx.y, 18, -Math.PI / 4, Math.PI / 4);
      ctx.lineWidth = 4;
      ctx.strokeStyle = skin.secondaryColor || '#ffffff';
      ctx.stroke();

      // 外觀專屬粒子特效
      if (skin.id === 'skin_dark_hacker') {
        ctx.font = '10px monospace';
        ctx.fillStyle = '#00ff66';
        ctx.fillText('0101', vfx.x - 10, vfx.y - 12);
      } else if (skin.id === 'skin_solar_valkyrie') {
        ctx.fillStyle = '#ff4500';
        ctx.fillRect(vfx.x - 4, vfx.y - 4, 8, 8);
      } else if (skin.id === 'skin_cyber_diva') {
        ctx.font = '13px sans-serif';
        ctx.fillStyle = '#f43f5e';
        ctx.fillText('♪', vfx.x - 6, vfx.y - 10);
      } else if (skin.id === 'skin_cryo_maiden') {
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#bae6fd';
        ctx.fillText('❄', vfx.x - 6, vfx.y - 8);
      } else if (skin.id === 'skin_cosmic_ronin') {
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#c084fc';
        ctx.fillText('✦', vfx.x - 6, vfx.y - 10);
      } else if (skin.id === 'skin_archangel_judicator') {
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('✧', vfx.x - 6, vfx.y - 10);
      } else if (skin.id === 'skin_volt_ranger') {
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(vfx.x - 10, vfx.y - 10);
        ctx.lineTo(vfx.x - 4, vfx.y - 2);
        ctx.lineTo(vfx.x - 8, vfx.y + 2);
        ctx.lineTo(vfx.x, vfx.y + 8);
        ctx.stroke();
      } else if (skin.id === 'skin_omega_emperor') {
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(vfx.x, vfx.y, 12, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (vfx.type === 'kick') {
      // 重踢弧線掃光
      ctx.beginPath();
      ctx.arc(vfx.x - 10, vfx.y, 40, -Math.PI / 3, Math.PI / 6);
      ctx.lineWidth = 6;
      ctx.strokeStyle = skin.themeColor;
      ctx.stroke();

      // 重踢輔助雙色粒子
      if (skin.secondaryColor) {
        ctx.beginPath();
        ctx.arc(vfx.x - 10, vfx.y, 34, -Math.PI / 3, Math.PI / 6);
        ctx.lineWidth = 2;
        ctx.strokeStyle = skin.secondaryColor;
        ctx.stroke();
      }
    } else if (vfx.type === 'shoryuken') {
      // 昇龍衝天光柱
      ctx.fillStyle = skin.glowColor;
      ctx.fillRect(vfx.x - 15, vfx.y, 30, 90);
      ctx.strokeStyle = skin.themeColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(vfx.x - 15, vfx.y, 30, 90);
    } else if (vfx.type === 'hit_sparks') {
      // 受擊火花
      for (let i = 0; i < 4; i++) {
        const ang = (Math.PI * 2 / 4) * i;
        ctx.fillStyle = skin.themeColor;
        ctx.fillRect(Math.cos(ang) * 16, vfx.y + Math.sin(ang) * 16, 4, 4);
      }
    } else if (vfx.type === 'victory_aura') {
      // 冠軍勝利光環與指天星芒 (Victory Aura & Cosmic Star)
      const time = vfx.time || 0;
      const themeCol = skin.themeColor || '#ffd700';

      ctx.save();
      ctx.shadowColor = themeCol;
      ctx.shadowBlur = 18;

      // 1. 旋轉升騰勝利光環粒子
      for (let i = 0; i < 6; i++) {
        const angle = (time * 0.05 + i * (Math.PI / 3));
        const rad = 24 + Math.sin(time * 0.1 + i) * 6;
        const py = -30 - ((time * 2 + i * 18) % 85);
        ctx.fillStyle = i % 2 === 0 ? '#ffd700' : themeCol;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * rad, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. 指天拳頭頂部耀眼冠軍星芒 (Victory Star)
      const starX = 4;
      const starY = -132;
      const pulse = 6 + Math.sin(time * 0.2) * 3;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(starX - pulse * 2, starY);
      ctx.lineTo(starX + pulse * 2, starY);
      ctx.moveTo(starX, starY - pulse * 2);
      ctx.lineTo(starX, starY + pulse * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(starX, starY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * 繪製大廳外觀展示台專屬全息光圈底座
   */
  drawPedestal(ctx, cx, cy, radius, skin, t) {
    ctx.save();
    ctx.translate(cx, cy);

    // 旋轉全息六角外環
    ctx.save();
    ctx.rotate(t * 0.02);
    ctx.shadowColor = skin.themeColor;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = skin.themeColor;
    ctx.lineWidth = 3;

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI / 3) * i;
      const px = Math.cos(ang) * radius;
      const py = Math.sin(ang) * (radius * 0.35); // 橢圓透視
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // 內層發光光環
    ctx.save();
    ctx.rotate(-t * 0.03);
    ctx.strokeStyle = skin.secondaryColor || '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 0.75, radius * 0.28, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 向上升騰的全息微粒光芒
    ctx.fillStyle = skin.glowColor;
    for (let i = 0; i < 6; i++) {
      const partT = (t * 0.05 + i * 1.2) % 3;
      const py = -partT * 30;
      const px = (i - 2.5) * 18;
      const alpha = Math.max(0, 1 - partT / 3);
      ctx.fillStyle = skin.themeColor;
      ctx.globalAlpha = alpha;
      ctx.fillRect(px, py, 3, 3);
    }

    ctx.restore();
  }
}

export const characterRenderer = new CharacterRenderer();
