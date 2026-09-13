/**
 * 《CyberStriker: Quantum Arena》
 * 《荒野亂鬥》(Brawl Stars) 傳奇英雄極致高畫質細膩渲染引擎
 * 專為 6 位代表性英雄打造 100% 標誌性視覺美學：
 *
 * 1. 雪莉・散彈獵手 (Shelly):
 *    紫色立體蓬鬆捲髮、鮮黃牛仔領巾、深藍戰術背心、大口徑金屬雙管散彈槍、牛仔皮帶與星形扣
 * 2. 柯爾特・雙槍神警 (Colt):
 *    鮮紅流線飛機頭、白襯衫藍警長背心、金色六角警星徽章、雙持雕花銀白左輪手槍、自信神采
 * 3. 斯派克・傳奇仙人掌 (Spike):
 *    圓潤可愛翠綠仙人掌、頭頂盛開粉紅小花、深紫刺繡精緻短背心、萌系大黑圓眼與微笑、刺球手雷
 * 4. 普里莫・摔角霸王 (El Primo):
 *    藍金相間傳奇摔角手面具、健碩英雄胸肌體格、金色冠軍巨星重型金腰帶、火焰重拳護腕
 * 5. 黑鴉・暗影劇毒刺客 (Crow):
 *    黑色朋克機車皮夾克、銳利金黃鷹喙與血紅雙眼、背部黑色羽翼、雙持淬毒翡翠飛刀
 * 6. 里昂・變色龍神隱客 (Leon):
 *    鮮綠色變色龍連帽衛衣、巨大變色龍雙鈕扣眼、嘴角咬著紅白螺旋棒棒糖、旋轉四刃手裏劍
 */

export class BrawlSkinsRenderer {
  constructor() {
    this.brawlSkinIds = new Set([
      'skin_brawl_shelly',
      'skin_brawl_colt',
      'skin_brawl_spike',
      'skin_brawl_el_primo',
      'skin_brawl_crow',
      'skin_brawl_leon'
    ]);
  }

  isBrawl(skin) {
    return skin && skin.id && this.brawlSkinIds.has(skin.id);
  }

  _safeLinearGrad(ctx, x0, y0, x1, y1, stops, fallbackColor) {
    if (ctx && typeof ctx.createLinearGradient === 'function') {
      try {
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        if (g && typeof g.addColorStop === 'function') {
          for (const stop of stops) {
            g.addColorStop(stop[0], stop[1]);
          }
          return g;
        }
      } catch (e) {}
    }
    return fallbackColor;
  }

  _safeRadialGrad(ctx, x0, y0, r0, x1, y1, r1, stops, fallbackColor) {
    if (ctx && typeof ctx.createRadialGradient === 'function') {
      try {
        const g = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
        if (g && typeof g.addColorStop === 'function') {
          for (const stop of stops) {
            g.addColorStop(stop[0], stop[1]);
          }
          return g;
        }
      } catch (e) {}
    }
    return fallbackColor;
  }

  _setLineDash(ctx, pattern) {
    if (ctx && typeof ctx.setLineDash === 'function') {
      try {
        ctx.setLineDash(pattern);
      } catch (e) {}
    }
  }

  // ─── 輔助繪圖工具 ───

  _drawStar(ctx, cx, cy, spikes, outerR, innerR, fillStyle, strokeStyle = null, lineWidth = 1) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerR;
      y = cy + Math.sin(rot) * outerR;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerR;
      y = cy + Math.sin(rot) * innerR;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();

    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }
    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawEyes(ctx, x, y, size = 6, pupilColor = '#1e1b4b', highlightColor = '#ffffff', isWinking = false) {
    ctx.save();
    if (isWinking) {
      // 眨眼
      ctx.strokeStyle = pupilColor;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(x, y + 1, size * 0.9, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();
    } else {
      // 靈動大眼睛外輪廓與眼白
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 1.25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 瞳孔
      ctx.fillStyle = pupilColor;
      ctx.beginPath();
      ctx.ellipse(x + 1, y, size * 0.65, size * 0.88, 0, 0, Math.PI * 2);
      ctx.fill();

      // 水靈高光 (雙層白點 + 晶瑩反光弧)
      ctx.fillStyle = highlightColor;
      ctx.beginPath();
      ctx.arc(x, y - size * 0.4, size * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x + size * 0.4, y + size * 0.3, size * 0.18, 0, Math.PI * 2);
      ctx.fill();

      // 上眼皮眼線 (Upper Eyelid Lash Line)
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(x, y - 0.5, size * 1.05, -0.9 * Math.PI, -0.1 * Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ─── 1. 特殊氣場與光環 (Special Brawl Aura) ───
  drawAura(ctx, char, skin, t) {
    if (!this.isBrawl(skin)) return;
    const id = skin.id;

    ctx.save();

    switch (id) {
      case 'skin_brawl_shelly': {
        // 雪莉：散彈火星與旋轉金色獵手氣流
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 15;
        for (let i = 0; i < 4; i++) {
          const ang = (t * 0.08 + i * (Math.PI / 2)) % (Math.PI * 2);
          const r = 28 + Math.sin(t * 0.1 + i) * 6;
          const px = Math.cos(ang) * r;
          const py = -45 + Math.sin(ang) * 14;

          ctx.fillStyle = i % 2 === 0 ? '#facc15' : '#a855f7';
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'skin_brawl_colt': {
        // 柯爾特：飄揚的警徽六角金星與疾速銀白彈道光痕
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 16;
        for (let i = 0; i < 3; i++) {
          const prog = (t * 0.04 + i * 0.33) % 1;
          const px = -25 + prog * 50;
          const py = -10 - prog * 70;
          const alpha = Math.sin(prog * Math.PI);
          ctx.globalAlpha = alpha;
          this._drawStar(ctx, px, py, 6, 4.5, 2.2, '#ffd700');
        }
        break;
      }

      case 'skin_brawl_spike': {
        // 斯派克：飄揚的粉紅花瓣與綠色仙人掌萌系氣泡
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 18;
        for (let i = 0; i < 4; i++) {
          const prog = (t * 0.035 + i * 0.25) % 1;
          const px = Math.sin(t * 0.06 + i * 1.5) * 26;
          const py = -15 - prog * 65;
          ctx.globalAlpha = Math.sin(prog * Math.PI) * 0.85;
          ctx.fillStyle = i % 2 === 0 ? '#f472b6' : '#4ade80';
          ctx.beginPath();
          ctx.ellipse(px, py, 3.5, 5, Math.sin(t * 0.1 + i), 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'skin_brawl_el_primo': {
        // 普里莫：摔角霸王周身升騰的金色星光與熱血火星
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 20;
        for (let i = 0; i < 5; i++) {
          const prog = (t * 0.05 + i * 0.2) % 1;
          const px = Math.sin(t * 0.1 + i * 2) * (24 - prog * 8);
          const py = -prog * 85;
          ctx.globalAlpha = (1 - prog) * 0.9;
          this._drawStar(ctx, px, py, 5, 4.5, 2.2, '#fbbf24', '#f59e0b', 0.8);
        }
        break;
      }

      case 'skin_brawl_crow': {
        // 黑鴉：劇毒翡翠暗影霧氣與盤旋的烏鴉羽毛
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 18;
        for (let i = 0; i < 4; i++) {
          const prog = (t * 0.045 + i * 0.25) % 1;
          const px = Math.cos(t * 0.08 + i * 2) * 25;
          const py = -35 + Math.sin(t * 0.08 + i * 2) * 20;
          ctx.globalAlpha = Math.sin(prog * Math.PI) * 0.8;
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(px, py, 3 + prog * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'skin_brawl_leon': {
        // 里昂：變色龍七彩全息光紋與糖果光圈
        ctx.shadowColor = '#2dd4bf';
        ctx.shadowBlur = 16;
        for (let i = 0; i < 3; i++) {
          const r = 18 + ((t * 1.5 + i * 20) % 45);
          const alpha = Math.max(0, 1 - r / 50);
          ctx.globalAlpha = alpha * 0.6;
          ctx.strokeStyle = i % 2 === 0 ? '#10b981' : '#f43f5e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(0, -45, r, r * 0.45, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }
    }

    ctx.restore();
  }

  // ─── 2. 角色精緻頭部 (Expressive HD Heads) ───
  drawHead(ctx, head, skin) {
    if (!this.isBrawl(skin)) return false;
    const id = skin.id;

    switch (id) {
      // ══════════════════════════════════════════════════
      // 1. 雪莉・散彈獵手 (Shelly)
      // ══════════════════════════════════════════════════
      case 'skin_brawl_shelly': {
        // (A) 後層立體紫色蓬鬆大捲髮 (Volumetric Purple Curls with Lavender Highlights)
        const hairGrad = this._safeLinearGrad(
          ctx,
          -16,
          -18,
          16,
          16,
          [
            [0, '#c084fc'],
            [0.35, '#9333ea'],
            [0.75, '#6b21a8'],
            [1, '#4c1d95']
          ],
          '#7e22ce'
        );

        ctx.fillStyle = hairGrad;
        ctx.beginPath();
        ctx.arc(-10, -5, 12.5, 0, Math.PI * 2);
        ctx.arc(-14, 4, 9.5, 0, Math.PI * 2);
        ctx.arc(-8, -12, 10.5, 0, Math.PI * 2);
        ctx.arc(4, -14, 11.5, 0, Math.PI * 2);
        ctx.fill();

        // 紫髮捲度立體亮紋
        ctx.strokeStyle = '#e9d5ff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(-9, -10, 6, 0.4 * Math.PI, 1.2 * Math.PI);
        ctx.moveTo(1, -12);
        ctx.arc(3, -12, 7, 0.6 * Math.PI, 1.4 * Math.PI);
        ctx.stroke();

        // (B) 細膩溫潤膚色面龐 (Silky Smooth Facial Silhouette)
        const skinGrad = this._safeLinearGrad(
          ctx,
          0,
          -10,
          0,
          14,
          [
            [0, '#ffedd5'],
            [0.6, '#fed7aa'],
            [1, '#fdba74']
          ],
          '#fed7aa'
        );

        ctx.fillStyle = skinGrad;
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-10, 2);
        ctx.quadraticCurveTo(-11, -8, -3, -12);
        ctx.quadraticCurveTo(8, -12, 12, -4);
        ctx.quadraticCurveTo(14, 6, 8, 13);
        ctx.quadraticCurveTo(0, 16, -6, 13);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 雙頰可愛蜜桃腮紅 (Rosy Peach Blush)
        ctx.fillStyle = 'rgba(251, 146, 60, 0.45)';
        ctx.beginPath();
        ctx.ellipse(-4, 4, 3.5, 2, 0.1, 0, Math.PI * 2);
        ctx.ellipse(6, 4, 3.8, 2.2, -0.1, 0, Math.PI * 2);
        ctx.fill();

        // (C) 前層前額飄逸紫髮劉海
        ctx.fillStyle = '#9333ea';
        ctx.beginPath();
        ctx.moveTo(-6, -12);
        ctx.quadraticCurveTo(2, -8, 6, -3);
        ctx.quadraticCurveTo(3, -5, 0, -6);
        ctx.quadraticCurveTo(-4, -5, -6, -10);
        ctx.closePath();
        ctx.fill();

        // (D) 俏皮大眼睛 (Expressive Shelly Eyes with Eyelash)
        this._drawEyes(ctx, 4, 0, 5, '#581c87', '#ffffff');

        // 微笑自信小嘴
        ctx.strokeStyle = '#c2410c';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(3, 8, 2.5, 0.1 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();

        // (E) 招牌鮮黃色牛仔領巾 (Iconic Yellow Bandana with Folds)
        const scarfGrad = this._safeLinearGrad(
          ctx,
          -8,
          8,
          12,
          18,
          [
            [0, '#fef08a'],
            [0.4, '#fde047'],
            [1, '#ca8a04']
          ],
          '#fde047'
        );

        ctx.fillStyle = scarfGrad;
        ctx.strokeStyle = '#a16207';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-8, 9);
        ctx.quadraticCurveTo(0, 11, 10, 8);
        ctx.lineTo(12, 13);
        ctx.lineTo(2, 20); // 領巾尖角下擺
        ctx.lineTo(-7, 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 領巾褶皺與小結
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(3, 14, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // 領巾縫線小細節
        ctx.strokeStyle = 'rgba(161, 98, 7, 0.5)';
        this._setLineDash(ctx, [2, 2]);
        ctx.beginPath();
        ctx.moveTo(-5, 12);
        ctx.lineTo(2, 17);
        ctx.stroke();
        this._setLineDash(ctx, []);

        break;
      }

      // ══════════════════════════════════════════════════
      // 2. 柯爾特・雙槍神警 (Colt)
      // ══════════════════════════════════════════════════
      case 'skin_brawl_colt': {
        // (A) 高聳流線鮮紅飛機頭 (Signature Bright Red Pompadour)
        const pompadourGrad = this._safeLinearGrad(
          ctx,
          0,
          -26,
          8,
          0,
          [
            [0, '#f87171'],
            [0.4, '#ef4444'],
            [1, '#991b1b']
          ],
          '#ef4444'
        );

        ctx.fillStyle = pompadourGrad;
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-11, -5);
        ctx.quadraticCurveTo(-14, -18, -4, -22);
        ctx.quadraticCurveTo(6, -26, 14, -18);
        ctx.quadraticCurveTo(18, -10, 13, -3);
        ctx.quadraticCurveTo(8, -8, 2, -10);
        ctx.quadraticCurveTo(-4, -10, -10, -5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 飛機頭立體高光線 (Volumetric Specular Sheen)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-2, -20);
        ctx.quadraticCurveTo(5, -22, 11, -16);
        ctx.stroke();

        // (B) 神采奕奕的面部輪廓
        ctx.fillStyle = '#fed7aa';
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-9, -2);
        ctx.lineTo(8, -4);
        ctx.lineTo(13, 2);
        ctx.lineTo(10, 11);
        ctx.lineTo(2, 16); // 俊朗英挺下巴
        ctx.lineTo(-7, 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 兩側紅髮鬢角
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-10, -3, 3, 7);

        // (C) 自信水靈藍色大眼睛
        this._drawEyes(ctx, 4, 3, 4.5, '#0284c7', '#ffffff');

        // (D) 自信迷人露齒微笑
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(5, 11, 4, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // 閃耀白牙
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(4, 10, 3.5, 2);

        // 閃亮牙齒星芒 (White Teeth Twinkle Sparkle)
        this._drawStar(ctx, 7.5, 9.5, 4, 2.5, 1, '#ffffff', null, 0);

        break;
      }

      // ══════════════════════════════════════════════════
      // 3. 斯派克・傳奇仙人掌 (Spike)
      // ══════════════════════════════════════════════════
      case 'skin_brawl_spike': {
        // (A) 圓滾滾翠綠仙人掌頭部 (Chubby Cute Cactus Dome)
        const cactusGrad = this._safeRadialGrad(
          ctx,
          -3,
          -4,
          2,
          0,
          0,
          16,
          [
            [0, '#bbf7d0'],
            [0.35, '#4ade80'],
            [0.75, '#22c55e'],
            [1, '#15803d']
          ],
          '#22c55e'
        );

        ctx.fillStyle = cactusGrad;
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 斯派克萌系粉紅腮紅 (Pink Kawaii Blush)
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.ellipse(-6, 3, 3.2, 1.8, 0, 0, Math.PI * 2);
        ctx.ellipse(6, 3, 3.2, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // (B) 仙人掌表面萌趣黑色短刺 (Needles with Sharp Specular Tips)
        ctx.fillStyle = '#0f172a';
        const spikes = [
          { x: -14, y: -4, r: -0.4 },
          { x: -12, y: 7, r: 0.3 },
          { x: 13, y: -5, r: 0.5 },
          { x: 12, y: 6, r: -0.3 },
          { x: -7, y: -13, r: -0.2 }
        ];
        spikes.forEach(s => {
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.r);
          ctx.beginPath();
          ctx.moveTo(0, -1.8);
          ctx.lineTo(4.5, 0);
          ctx.lineTo(0, 1.8);
          ctx.closePath();
          ctx.fill();
          // 白光刺尖
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(3.5, -0.5, 1.2, 1);
          ctx.restore();
        });

        // (C) 斯派克標誌性呆萌黑眼黑嘴 (Signature Cute Chibi Face)
        ctx.fillStyle = '#020617';
        // 左眼
        ctx.beginPath();
        ctx.ellipse(-5, -2, 2.5, 3.5, -0.1, 0, Math.PI * 2);
        ctx.fill();
        // 右眼
        ctx.beginPath();
        ctx.ellipse(5, -2, 2.5, 3.5, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛內白色微光點
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-4.2, -3.2, 0.8, 0, Math.PI * 2);
        ctx.arc(5.8, -3.2, 0.8, 0, Math.PI * 2);
        ctx.fill();

        // 萌萌開口笑小嘴與小舌頭
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(0, 5, 3.5, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.arc(0, 6.5, 2, 0, Math.PI);
        ctx.fill();

        // (D) 頭頂盛開的五瓣粉紅仙人掌花 (Blooming Pink Blossom Flower with Veins)
        ctx.save();
        ctx.translate(0, -15);
        for (let p = 0; p < 5; p++) {
          const pAng = (p * Math.PI * 2) / 5;
          const px = Math.cos(pAng) * 5.2;
          const py = Math.sin(pAng) * 5.2;

          const petalGrad = this._safeRadialGrad(
            ctx,
            px * 0.5,
            py * 0.5,
            1,
            px,
            py,
            4.5,
            [
              [0, '#f472b6'],
              [0.7, '#ec4899'],
              [1, '#be185d']
            ],
            '#ec4899'
          );

          ctx.fillStyle = petalGrad;
          ctx.beginPath();
          ctx.arc(px, py, 4.2, 0, Math.PI * 2);
          ctx.fill();

          // 花瓣葉脈微線
          ctx.strokeStyle = '#fbcfe8';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(px * 1.2, py * 1.2);
          ctx.stroke();
        }

        // 花蕊金色小圓球
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        break;
      }

      // ══════════════════════════════════════════════════
      // 4. 普里莫・摔角霸王 (El Primo)
      // ══════════════════════════════════════════════════
      case 'skin_brawl_el_primo': {
        // (A) 皇家湛藍墨西哥摔角面具 (Royal Blue Luchador Mask)
        const maskGrad = this._safeLinearGrad(
          ctx,
          -14,
          -14,
          14,
          14,
          [
            [0, '#60a5fa'],
            [0.35, '#3b82f6'],
            [0.75, '#2563eb'],
            [1, '#1d4ed8']
          ],
          '#2563eb'
        );

        ctx.fillStyle = maskGrad;
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-11, 4);
        ctx.quadraticCurveTo(-15, -6, -11, -14);
        ctx.quadraticCurveTo(0, -18, 11, -14);
        ctx.quadraticCurveTo(15, -6, 12, 5);
        ctx.lineTo(9, 13);
        ctx.lineTo(-8, 13);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (B) 額頭閃耀金色摔角十字星徽 (Golden Cross Star Emblem)
        this._drawStar(ctx, 0, -9, 4, 6, 2.5, '#ffd700', '#b45309', 1.2);
        // 星徽中心紅寶石微光
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -9, 1.4, 0, Math.PI * 2);
        ctx.fill();

        // (C) 雙眼周圍華麗金色眼罩金邊與烈焰花紋 (Golden Luchador Eye Flame Trim)
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(-4, -1, 5.5, 3.8, -0.2, 0, Math.PI * 2);
        ctx.ellipse(5, -1, 5.5, 3.8, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 金邊向後延伸的摔角戰翼紋飾
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(9, -1);
        ctx.lineTo(13, -4);
        ctx.moveTo(-8, -1);
        ctx.lineTo(-12, -4);
        ctx.stroke();

        // 犀利純白鬥志目光 (Fierce Eyes)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-3, -1, 2.3, 0, Math.PI * 2);
        ctx.arc(4, -1, 2.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-2.6, -1, 1.2, 0, Math.PI * 2);
        ctx.arc(4.4, -1, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // (D) 面具下方露出的剛毅嘴部與下巴 (Tanned Determined Jaw)
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-5, 7);
        ctx.lineTo(6, 7);
        ctx.lineTo(4, 15);
        ctx.lineTo(-3, 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 堅毅嘴角線
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-2, 10);
        ctx.lineTo(4, 10);
        ctx.stroke();

        break;
      }

      // ══════════════════════════════════════════════════
      // 5. 黑鴉・暗影劇毒刺客 (Crow)
      // ══════════════════════════════════════════════════
      case 'skin_brawl_crow': {
        // (A) 漆黑渡鴉頭顱與朋克羽冠 (Black Raven Punk Crest with Iridescent Sheen)
        const crowFeatherGrad = this._safeLinearGrad(
          ctx,
          -14,
          -22,
          14,
          14,
          [
            [0, '#312e81'],
            [0.4, '#1e1b4b'],
            [0.7, '#0f172a'],
            [1, '#020617']
          ],
          '#0f172a'
        );

        ctx.fillStyle = crowFeatherGrad;
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        // 銳利向上翹起的朋克羽毛
        ctx.moveTo(-7, -2);
        ctx.lineTo(-14, -10);
        ctx.lineTo(-8, -12);
        ctx.lineTo(-12, -20);
        ctx.lineTo(-3, -16);
        ctx.lineTo(2, -22);
        ctx.lineTo(6, -14);
        ctx.lineTo(12, -6);
        ctx.lineTo(6, 12);
        ctx.lineTo(-4, 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 羽冠藍紫金屬光澤線
        ctx.strokeStyle = 'rgba(129, 140, 248, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-2, -15);
        ctx.lineTo(2, -21);
        ctx.lineTo(5, -13);
        ctx.stroke();

        // (B) 銳利鋒芒的金黃色金屬彎喙 (Golden Curved Beak with Specular Highlight)
        const beakGrad = this._safeLinearGrad(
          ctx,
          4,
          -4,
          18,
          5,
          [
            [0, '#fef08a'],
            [0.35, '#fde047'],
            [0.75, '#eab308'],
            [1, '#ca8a04']
          ],
          '#eab308'
        );

        ctx.fillStyle = beakGrad;
        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(5, -4);
        ctx.quadraticCurveTo(14, -4, 19, 3); // 勾喙前尖
        ctx.quadraticCurveTo(12, 6, 4, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 彎喙立體金屬高光脊線
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(7, -3);
        ctx.quadraticCurveTo(13, -3, 17, 2);
        ctx.stroke();

        // 喙上鼻孔細節
        ctx.fillStyle = '#713f12';
        ctx.beginPath();
        ctx.arc(8, -1, 1, 0, Math.PI * 2);
        ctx.fill();

        // (C) 犀利猩紅渡鴉眼 (Crimson Predator Eye with Gold Iris)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.ellipse(2, -3, 4.2, 3.2, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // 金黃外圈與細長黑瞳
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(2.5, -3, 2.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.ellipse(3, -3, 1, 2.2, 0.1, 0, Math.PI * 2);
        ctx.fill();

        break;
      }

      // ══════════════════════════════════════════════════
      // 6. 里昂・變色龍神隱客 (Leon)
      // ══════════════════════════════════════════════════
      case 'skin_brawl_leon': {
        // (A) 鮮綠變色龍連帽衛衣 (Vibrant Chameleon Hoodie)
        const hoodGrad = this._safeLinearGrad(
          ctx,
          -14,
          -14,
          14,
          14,
          [
            [0, '#6ee7b7'],
            [0.35, '#34d399'],
            [0.75, '#10b981'],
            [1, '#059669']
          ],
          '#10b981'
        );

        ctx.fillStyle = hoodGrad;
        ctx.strokeStyle = '#065f46';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-11, 4);
        ctx.quadraticCurveTo(-15, -6, -10, -14);
        ctx.quadraticCurveTo(0, -17, 10, -14);
        ctx.quadraticCurveTo(15, -6, 12, 4);
        ctx.lineTo(8, 14);
        ctx.lineTo(-7, 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (B) 衛衣兜帽頂部的一對巨大變色龍鈕扣雙眼 (Big Glossy Chameleon Eyes)
        // 左眼
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(-5, -14, 5.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // 水平黑瞳
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.ellipse(-5, -14, 3.8, 1.6, 0, 0, Math.PI * 2);
        ctx.fill();
        // 雙高光點
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-6, -15.5, 1.2, 0, Math.PI * 2);
        ctx.arc(-3.5, -13, 0.7, 0, Math.PI * 2);
        ctx.fill();

        // 右眼
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(5, -14, 5.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // 水平黑瞳
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.ellipse(5, -14, 3.8, 1.6, 0, 0, Math.PI * 2);
        ctx.fill();
        // 雙高光點
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(4, -15.5, 1.2, 0, Math.PI * 2);
        ctx.arc(6.5, -13, 0.7, 0, Math.PI * 2);
        ctx.fill();

        // (C) 兜帽深邃陰影下的神隱少年臉龐
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0.05 * Math.PI, 0.95 * Math.PI);
        ctx.fill();

        // 露出的少年雙眼與膚色
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.moveTo(-5, 4);
        ctx.lineTo(6, 4);
        ctx.lineTo(3, 12);
        ctx.lineTo(-3, 12);
        ctx.closePath();
        ctx.fill();

        // 兜帽陰影裡認真的少年雙眼
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.ellipse(-2.5, 3, 1.6, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(3.5, 3, 1.6, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-2, 2.5, 0.7, 0, Math.PI * 2);
        ctx.arc(4, 2.5, 0.7, 0, Math.PI * 2);
        ctx.fill();

        // 俏皮嘴角笑意
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(1, 7, 3, 0.1 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();

        // (D) 招牌紅白螺旋棒棒糖棍 (Lollipop Stick & Glossy Swirl Candy)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(3, 8);
        ctx.lineTo(12, 11);
        ctx.stroke();

        // 圓形糖果本體
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(13, 12, 3.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#be123c';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // 白色螺旋糖紋
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(13, 12, 2.2, 0, Math.PI * 1.6);
        ctx.stroke();

        // 糖果晶瑩高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(12, 10.5, 1, 0, Math.PI * 2);
        ctx.fill();

        break;
      }
    }

    return true;
  }

  // ─── 3. 角色服裝與軀幹 (Detailed Outfits & Torsos) ───
  drawTorso(ctx, torso, skin, t) {
    if (!this.isBrawl(skin)) return false;
    const id = skin.id;

    ctx.save();
    ctx.translate(torso.x, torso.y);
    ctx.rotate(torso.angle);

    switch (id) {
      // ══════════════════════════════════════════════════
      // 1. 雪莉・散彈獵手 (Shelly)
      // ══════════════════════════════════════════════════
      case 'skin_brawl_shelly': {
        // (A) 戰術牛仔深藍背心 (Tactical Denim Vest with HD Shading & Seams)
        const denimGrad = this._safeLinearGrad(
          ctx,
          -14, -18, 14, 14,
          [
            [0, '#2563eb'],
            [0.4, '#1d4ed8'],
            [1, '#1e3a8a']
          ],
          '#1d4ed8'
        );
        ctx.fillStyle = denimGrad;
        ctx.strokeStyle = '#172554';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(-14, -18, 28, 32, 6);
        ctx.fill();
        ctx.stroke();

        // 丹寧背心精細雙車縫線 (Double Seam Stitching)
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 0.8;
        this._setLineDash(ctx, [2, 1.5]);
        ctx.strokeRect(-12.5, -16.5, 25, 29);
        this._setLineDash(ctx, []);

        // 領口內搭白色背心與皺褶
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(-7, -18);
        ctx.lineTo(7, -18);
        ctx.lineTo(0, -9);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-3, -15);
        ctx.lineTo(0, -11);
        ctx.stroke();

        // (B) 散彈槍斜掛彈帶 (Leather Bandolier Across Chest)
        const bandGrad = this._safeLinearGrad(
          ctx,
          -14, -6, 14, 2,
          [
            [0, '#92400e'],
            [0.5, '#78350f'],
            [1, '#451a03']
          ],
          '#78350f'
        );
        ctx.fillStyle = bandGrad;
        ctx.fillRect(-13, -5, 26, 7);

        // 彈帶兩側車線
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(-13, -4.5);
        ctx.lineTo(13, -4.5);
        ctx.moveTo(-13, 1.5);
        ctx.lineTo(13, 1.5);
        ctx.stroke();

        // 4 顆高精度紅金散彈槍子彈 (Shotgun Shells with Primers & Gloss)
        for (let s = 0; s < 4; s++) {
          const sx = -9.5 + s * 6.2;
          // 紅色外殼與圓柱高光
          const shellGrad = this._safeLinearGrad(
            ctx,
            sx, -7, sx + 4.5, -7,
            [
              [0, '#dc2626'],
              [0.35, '#f87171'],
              [0.7, '#b91c1c'],
              [1, '#991b1b']
            ],
            '#dc2626'
          );
          ctx.fillStyle = shellGrad;
          ctx.fillRect(sx, -7, 4.5, 9);

          // 金色黃銅底座 (Brass Rim)
          const brassGrad = this._safeLinearGrad(
            ctx,
            sx, 0, sx + 4.5, 0,
            [
              [0, '#fbbf24'],
              [0.5, '#fef08a'],
              [1, '#b45309']
            ],
            '#fbbf24'
          );
          ctx.fillStyle = brassGrad;
          ctx.fillRect(sx, 0, 4.5, 3.5);

          // 底火凹槽 (Primer Cap Dimple)
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.arc(sx + 2.25, 1.8, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // (C) 棕色皮革牛仔腰帶與戰術腰包 (Western Belt & Utility Pouch)
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-15, 14, 30, 8);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-15, 14, 30, 8);

        // 左側皮革收納腰包 (Leather Utility Pouch)
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.roundRect(-14, 13, 6, 8, 1.5);
        ctx.fill();
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        // 金屬按扣
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(-11, 17, 0.9, 0, Math.PI * 2);
        ctx.fill();

        // 金色浮雕大圓扣 (Engraved Golden Buckle)
        const buckleGrad = this._safeRadialGrad(
          ctx,
          0, 18, 1, 0, 18, 5.5,
          [
            [0, '#fef08a'],
            [0.6, '#fbbf24'],
            [1, '#b45309']
          ],
          '#fbbf24'
        );
        ctx.fillStyle = buckleGrad;
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 18, 5.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // 扣環五角星浮雕
        this._drawStar(ctx, 0, 18, 5, 2.5, 1.1, '#78350f');

        break;
      }

      // ══════════════════════════════════════════════════
      // 2. 柯爾特・雙槍神警 (Colt)
      // ══════════════════════════════════════════════════
      case 'skin_brawl_colt': {
        // (A) 白襯衫底座 (Crisp White Shirt with Button Placket)
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-12, -18, 24, 30);

        // 襯衫領口三角陰影
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(-4, -18);
        ctx.lineTo(4, -18);
        ctx.lineTo(0, -13);
        ctx.closePath();
        ctx.fill();

        // 黑色絲質警官領帶與銀色領帶夾 (Tie & Silver Clip)
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(-2, -16);
        ctx.lineTo(2, -16);
        ctx.lineTo(3.2, -4);
        ctx.lineTo(0, -0.5);
        ctx.lineTo(-3.2, -4);
        ctx.closePath();
        ctx.fill();

        // 銀色領帶夾 (Silver Tie Clip)
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-2.5, -8, 5, 1.2);

        // (B) 寶藍色警長西裝背心 (Tailored Royal Blue Vest with Gold Piping)
        const vestGrad = this._safeLinearGrad(
          ctx,
          -13, -18, 13, 14,
          [
            [0, '#2563eb'],
            [0.5, '#1d4ed8'],
            [1, '#1e3a8a']
          ],
          '#1d4ed8'
        );
        ctx.fillStyle = vestGrad;
        ctx.strokeStyle = '#172554';
        ctx.lineWidth = 1.6;

        // 左背心片
        ctx.beginPath();
        ctx.moveTo(-13, -18);
        ctx.lineTo(-3.5, -18);
        ctx.lineTo(-2, 14);
        ctx.lineTo(-13, 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 右背心片
        ctx.beginPath();
        ctx.moveTo(13, -18);
        ctx.lineTo(3.5, -18);
        ctx.lineTo(2, 14);
        ctx.lineTo(13, 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 金色滾邊線條 (Gold Piping on Lapels)
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-3.5, -18);
        ctx.lineTo(-2, 14);
        ctx.moveTo(3.5, -18);
        ctx.lineTo(2, 14);
        ctx.stroke();

        // (C) 金色懷錶吊鏈 (Draped Pocket Watch Chain)
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(3, -2);
        ctx.quadraticCurveTo(8, 4, 10, 6);
        ctx.stroke();

        // (D) 胸前六角金色警星胸章 (Sheriff Star Badge with Radiant Polish)
        this._drawStar(ctx, -7.5, -7, 6, 4.8, 2.4, '#ffd700', '#b45309', 1);
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(-7.5, -7, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // (E) 雙槍槍套皮帶與金黃子彈 (Belt with 6 .45 Cartridges)
        ctx.fillStyle = '#5c2b0c';
        ctx.fillRect(-15, 14, 30, 8);
        ctx.strokeStyle = '#381604';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-15, 14, 30, 8);

        // 彈巢子彈裝飾
        for (let b = 0; b < 5; b++) {
          const bx = -11 + b * 5.5;
          if (Math.abs(bx) < 3.5) continue; // 留出中間皮帶扣
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(bx, 15, 2.2, 6);
          ctx.fillStyle = '#92400e';
          ctx.fillRect(bx, 15, 2.2, 1.5);
        }

        // 金色星形皮帶扣
        this._drawStar(ctx, 0, 18, 5, 5.8, 2.8, '#ffd700', '#78350f', 1.2);
        break;
      }

      // ══════════════════════════════════════════════════
      // 3. 斯派克・傳奇仙人掌 (Spike)
      // ══════════════════════════════════════════════════
      case 'skin_brawl_spike': {
        // (A) 仙人掌翠綠飽滿圓潤球體 (Succulent Cactus Body with Volumetric Lighting)
        const cBodyGrad = this._safeRadialGrad(
          ctx,
          -4, -6, 2,
          0, 0, 22,
          [
            [0, '#4ade80'],
            [0.4, '#22c55e'],
            [0.85, '#16a34a'],
            [1, '#14532d']
          ],
          '#22c55e'
        );

        ctx.fillStyle = cBodyGrad;
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(-15, -18, 30, 34, 10);
        ctx.fill();
        ctx.stroke();

        // 仙人掌縱向肉質稜線紋理 (Vertical Succulent Ridges)
        ctx.strokeStyle = 'rgba(20, 83, 45, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-6, -18);
        ctx.quadraticCurveTo(-8, 0, -6, 16);
        ctx.moveTo(6, -18);
        ctx.quadraticCurveTo(8, 0, 6, 16);
        ctx.stroke();

        // 仙人掌尖銳黑刺 (Sharp Needles with White Highlight Tips)
        const spines = [
          { x: -12, y: -4, dx: -4, dy: -2 },
          { x: 12, y: 2, dx: 4, dy: -2 },
          { x: -13, y: 8, dx: -3, dy: 3 },
          { x: 11, y: 10, dx: 4, dy: 2 }
        ];
        spines.forEach(sp => {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.moveTo(sp.x, sp.y - 1.5);
          ctx.lineTo(sp.x + sp.dx, sp.y + sp.dy);
          ctx.lineTo(sp.x, sp.y + 1.5);
          ctx.closePath();
          ctx.fill();

          // 針刺白亮高光尖
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(sp.x + sp.dx, sp.y + sp.dy, 0.6, 0, Math.PI * 2);
          ctx.fill();
        });

        // (B) 深紫色阿茲特克圖騰背心 (Aztec Embroidered Purple Vest)
        const vestGrad = this._safeLinearGrad(
          ctx,
          -13, -12, 13, 10,
          [
            [0, '#9333ea'],
            [0.5, '#7e22ce'],
            [1, '#581c87']
          ],
          '#7e22ce'
        );
        ctx.fillStyle = vestGrad;
        ctx.strokeStyle = '#fbbf24'; // 金色外邊框
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(-13, -12, 26, 22, 6);
        ctx.fill();
        ctx.stroke();

        // 金色刺繡鋸齒邊線 (Golden Aztec Zigzag Border Pattern)
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let zx = -10; zx <= 10; zx += 4) {
          ctx.lineTo(zx, -11);
          ctx.lineTo(zx + 2, -9);
        }
        ctx.stroke();

        // 背心珍珠母貝光澤鈕扣 (Mother-of-Pearl Shiny Buttons)
        [-4, 3].forEach(by => {
          const btnGrad = this._safeRadialGrad(
            ctx,
            -0.5, by - 0.5, 0.3,
            0, by, 2.2,
            [
              [0, '#ffffff'],
              [0.7, '#e2e8f0'],
              [1, '#94a3b8']
            ],
            '#ffffff'
          );
          ctx.fillStyle = btnGrad;
          ctx.beginPath();
          ctx.arc(0, by, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        });

        break;
      }

      // ══════════════════════════════════════════════════
      // 4. 普里莫・摔角霸王 (El Primo)
      // ══════════════════════════════════════════════════
      case 'skin_brawl_el_primo': {
        // (A) 健碩古銅英雄胸肌與腹肌 (Chiseled Muscular Torso with Volumetric Shading)
        const skinGrad = this._safeLinearGrad(
          ctx,
          0, -18, 0, 14,
          [
            [0, '#fbbf24'],
            [0.35, '#f59e0b'],
            [0.75, '#d97706'],
            [1, '#b45309']
          ],
          '#f59e0b'
        );

        ctx.fillStyle = skinGrad;
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(-16, -18, 32, 32, 6);
        ctx.fill();
        ctx.stroke();

        // 鎖骨線條 (Collarbones)
        ctx.strokeStyle = 'rgba(120, 53, 15, 0.45)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-11, -15);
        ctx.lineTo(-2, -13);
        ctx.moveTo(11, -15);
        ctx.lineTo(2, -13);
        ctx.stroke();

        // 雄壯胸肌深陰影與高光弧 (Pectoral Muscles with Highlights)
        ctx.strokeStyle = 'rgba(120, 53, 15, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-12, -8);
        ctx.quadraticCurveTo(-5, -3.5, 0, -8);
        ctx.quadraticCurveTo(5, -3.5, 12, -8);
        ctx.stroke();

        // 胸肌上方飽滿光澤線
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-10, -10);
        ctx.quadraticCurveTo(-5, -6, -1, -10);
        ctx.moveTo(10, -10);
        ctx.quadraticCurveTo(5, -6, 1, -10);
        ctx.stroke();

        // 六塊腹肌分界雕刻 (Six-Pack Abs & Serratus)
        ctx.strokeStyle = 'rgba(120, 53, 15, 0.55)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        // 中腹線
        ctx.moveTo(0, -8);
        ctx.lineTo(0, 12);
        // 上腹腹肌橫格
        ctx.moveTo(-7, 0);
        ctx.lineTo(7, 0);
        // 中腹腹肌橫格
        ctx.moveTo(-6.5, 6);
        ctx.lineTo(6.5, 6);
        ctx.stroke();

        // 前鋸肌斜肋線 (Serratus Anterior)
        ctx.strokeStyle = 'rgba(120, 53, 15, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-14, -2);
        ctx.lineTo(-10, 1);
        ctx.moveTo(14, -2);
        ctx.lineTo(10, 1);
        ctx.stroke();

        // (B) 摔角冠軍金色超重腰帶 (Heavy Championship Belt with Ruby Diamond)
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(-17, 12, 34, 10);
        ctx.strokeStyle = '#172554';
        ctx.lineWidth = 1;
        ctx.strokeRect(-17, 12, 34, 10);

        // 巨型金色冠軍獎牌本體 (Championship Gold Plate)
        const beltGrad = this._safeLinearGrad(
          ctx,
          -11, 10, 11, 22,
          [
            [0, '#fef08a'],
            [0.3, '#facc15'],
            [0.7, '#eab308'],
            [1, '#92400e']
          ],
          '#eab308'
        );

        ctx.fillStyle = beltGrad;
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(-10, 10.5, 20, 13, 3.5);
        ctx.fill();
        ctx.stroke();

        // 浮雕側翼飾板
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(-13, 13, 2.5, 8);
        ctx.fillRect(10.5, 13, 2.5, 8);

        // 獎牌中央八芒星與璀璨切面紅寶石 (Ruby Star Core)
        this._drawStar(ctx, 0, 17, 8, 4.8, 2.2, '#ffd700', '#92400e', 0.8);
        const rubyGrad = this._safeRadialGrad(
          ctx,
          -0.6, 16.4, 0.4,
          0, 17, 2.6,
          [
            [0, '#fecaca'],
            [0.3, '#ef4444'],
            [0.8, '#b91c1c'],
            [1, '#7f1d1d']
          ],
          '#ef4444'
        );
        ctx.fillStyle = rubyGrad;
        ctx.beginPath();
        ctx.arc(0, 17, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 0.6;
        ctx.stroke();

        break;
      }

      // ══════════════════════════════════════════════════
      // 5. 黑鴉・暗影劇毒刺客 (Crow)
      // ══════════════════════════════════════════════════
      case 'skin_brawl_crow': {
        // (A) 頂級機車皮革風衣 (Biker Leather Jacket with Specular Sheen)
        const leatherGrad = this._safeLinearGrad(
          ctx,
          0, -18, 0, 18,
          [
            [0, '#334155'],
            [0.35, '#1e293b'],
            [0.8, '#0f172a'],
            [1, '#020617']
          ],
          '#1e293b'
        );

        ctx.fillStyle = leatherGrad;
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(-14, -18, 28, 34, 6);
        ctx.fill();
        ctx.stroke();

        // 肩部皮革高光光澤感 (Specular Leather Sheen)
        const shoulderHighlight = this._safeLinearGrad(
          ctx,
          -14, -18, 14, -12,
          [
            [0, 'rgba(255, 255, 255, 0.15)'],
            [0.5, 'rgba(255, 255, 255, 0.0)'],
            [1, 'rgba(255, 255, 255, 0.15)']
          ],
          'transparent'
        );
        ctx.fillStyle = shoulderHighlight;
        ctx.fillRect(-13, -17, 26, 6);

        // 機車大翻領 (Biker Lapels with Silver Snap Studs)
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(-14, -18);
        ctx.lineTo(-4, -10);
        ctx.lineTo(-12, -3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(14, -18);
        ctx.lineTo(4, -10);
        ctx.lineTo(12, -3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 翻領銀色鉚釘按鈕
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(-10, -5, 1, 0, Math.PI * 2);
        ctx.arc(10, -5, 1, 0, Math.PI * 2);
        ctx.fill();

        // 金屬非對稱斜拉鍊 (Metallic Asymmetric Zipper & Pull-Ring)
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-2, -10);
        ctx.lineTo(1, 15);
        ctx.stroke();

        // 金屬拉鍊扣環
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, -3, 1.8, 0, Math.PI * 2);
        ctx.stroke();

        // 暗影烏鴉骷髏胸章 (Shadow Raven Skull Patch with Crimson Eye)
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(-7, 2, 3.2, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-9, 4);
        ctx.lineTo(-7, 8);
        ctx.lineTo(-5, 4);
        ctx.closePath();
        ctx.fill();

        // 骷髏眼窩微光 (Crimson Glow)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-8, 1.5, 0.9, 0, Math.PI * 2);
        ctx.arc(-6, 1.5, 0.9, 0, Math.PI * 2);
        ctx.fill();

        // (B) 重金屬金字塔鉚釘腰帶 (Chrome Pyramid Studs Belt)
        ctx.fillStyle = '#020617';
        ctx.fillRect(-15, 14, 30, 8);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-15, 14, 30, 8);

        // 立體銀色金字塔鉚釘 (3D Pyramid Studs with Light/Shadow Facets)
        for (let i = 0; i < 4; i++) {
          const px = -11 + i * 7.2;
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(px, 16, 3.5, 3.5);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(px + 1.5, 17.5, 2, 2);
        }

        break;
      }

      // ══════════════════════════════════════════════════
      // 6. 里昂・變色龍神隱客 (Leon)
      // ══════════════════════════════════════════════════
      case 'skin_brawl_leon': {
        // (A) 鮮綠色變色龍連帽拉鍊衛衣 (Chameleon Hoodie with Seamless Seams)
        const hoodieGrad = this._safeLinearGrad(
          ctx,
          0, -18, 0, 18,
          [
            [0, '#34d399'],
            [0.4, '#10b981'],
            [0.8, '#059669'],
            [1, '#047857']
          ],
          '#10b981'
        );

        ctx.fillStyle = hoodieGrad;
        ctx.strokeStyle = '#064e3b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(-14, -18, 28, 32, 6);
        ctx.fill();
        ctx.stroke();

        // 衛衣兩側運動剪裁斜線
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-13, -10);
        ctx.lineTo(-9, 14);
        ctx.moveTo(13, -10);
        ctx.lineTo(9, 14);
        ctx.stroke();

        // 胸前鮮黃色粗拉鍊軌道與拉鍊齒刻痕 (Bold Yellow Zipper with Teeth)
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.lineTo(0, 14);
        ctx.stroke();

        // 金屬拉鍊頭滑塊 (Slider & Pull Tab)
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(-1.5, -10, 3, 4);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-1, -7, 2, 3);

        // 衛衣袋鼠暖手大口袋 (Kangaroo Pocket with Copper Rivets)
        ctx.fillStyle = '#059669';
        ctx.strokeStyle = '#065f46';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-10.5, 4);
        ctx.lineTo(10.5, 4);
        ctx.lineTo(12.5, 13);
        ctx.lineTo(-12.5, 13);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 口袋轉角加固黃銅鉚釘 (Corner Rivets)
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(-9.5, 5, 0.9, 0, Math.PI * 2);
        ctx.arc(9.5, 5, 0.9, 0, Math.PI * 2);
        ctx.fill();

        // 身後俏皮捲曲變色龍尾巴 (Curled Chameleon Tail Peeking Behind)
        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(14, 12, 5, -Math.PI * 0.4, Math.PI * 1.3);
        ctx.stroke();
        // 尾端捲尖
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(14, 12, 2.5, 0, Math.PI * 1.6);
        ctx.stroke();
        ctx.restore();

        // (B) 亮眼藍色運動短褲頭與雙白賽車線 (Blue Shorts with Dual Racing Stripes)
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(-14, 14, 28, 8);
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-14, 14, 28, 8);

        // 側面雙白條紋 (Dual White Athletic Stripes)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-12, 14, 1.2, 8);
        ctx.fillRect(-9.5, 14, 1.2, 8);
        ctx.fillRect(10.8, 14, 1.2, 8);
        ctx.fillRect(8.3, 14, 1.2, 8);

        break;
      }
    }

    ctx.restore();
    return true;
  }

  // ─── 4. 角色手臂與武器道具 (Arms & Signature Weapons) ───
  drawArm(ctx, arm, skin, layer) {
    if (!this.isBrawl(skin)) return false;
    const id = skin.id;
    const isBack = layer === 'backArm';

    ctx.save();
    ctx.translate(arm.shoulderX, arm.shoulderY);
    ctx.rotate(arm.upperAngle);

    // 依角色風格定義手臂外觀色彩
    let sleeveColor = '#1e3a8a';
    let skinColor = '#fed7aa';

    if (id === 'skin_brawl_shelly') {
      sleeveColor = isBack ? '#172554' : '#1e3a8a';
      skinColor = '#fed7aa';
    } else if (id === 'skin_brawl_colt') {
      sleeveColor = '#f8fafc'; // 白襯衫捲袖
      skinColor = '#fed7aa';
    } else if (id === 'skin_brawl_spike') {
      sleeveColor = '#22c55e'; // 仙人掌本體
      skinColor = '#15803d';
    } else if (id === 'skin_brawl_el_primo') {
      sleeveColor = isBack ? '#d97706' : '#f59e0b'; // 健碩裸臂
      skinColor = '#f59e0b';
    } else if (id === 'skin_brawl_crow') {
      sleeveColor = isBack ? '#020617' : '#1e293b'; // 黑色皮夾克
      skinColor = '#0f172a';
    } else if (id === 'skin_brawl_leon') {
      sleeveColor = isBack ? '#047857' : '#10b981'; // 綠衛衣長袖
      skinColor = '#fed7aa';
    }

    // 1. 上臂
    ctx.fillStyle = sleeveColor;
    ctx.strokeStyle = isBack ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(-4, 0, 8, 22, 4);
    ctx.fill();
    ctx.stroke();

    // 2. 前臂
    ctx.translate(0, 20);
    ctx.rotate(arm.foreAngle);

    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.roundRect(-4.5, 0, 9, 20, 4);
    ctx.fill();
    ctx.stroke();

    // 手腕護腕/手套
    if (id === 'skin_brawl_shelly') {
      ctx.fillStyle = '#78350f'; // 棕色皮革戰術手套
      ctx.fillRect(-5, 12, 10, 8);
    } else if (id === 'skin_brawl_colt') {
      ctx.fillStyle = '#475569'; // 深灰神槍手半指手套
      ctx.fillRect(-5, 12, 10, 8);
    } else if (id === 'skin_brawl_el_primo') {
      // 藍金摔角護腕
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(-5.5, 8, 11, 12);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-5.5, 12, 11, 4);
    } else if (id === 'skin_brawl_crow') {
      // 朋克銀鉚釘皮手套
      ctx.fillStyle = '#020617';
      ctx.fillRect(-5, 12, 10, 8);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-3, 14, 2, 2);
      ctx.fillRect(1, 14, 2, 2);
    }

    // 3. 前手手持專屬招牌武器道具 (僅在前臂渲染)
    if (!isBack) {
      this._drawBrawlWeapon(ctx, id, arm);
    }

    ctx.restore();
    return true;
  }

  // 繪製荒野亂鬥標誌性招牌武器 (HD Signature Weapons)
  _drawBrawlWeapon(ctx, id, arm) {
    ctx.save();
    ctx.translate(0, 18);

    switch (id) {
      case 'skin_brawl_shelly': {
        // 雪莉：經典大口徑雙管霰彈槍 (Double-Barrel Shotgun with Walnut Stock & Steel Barrels)
        // 1. 胡桃木精雕槍托與握把
        const woodGrad = this._safeLinearGrad(
          ctx,
          -12, 0, -2, 12,
          [
            [0, '#78350f'],
            [0.5, '#92400e'],
            [1, '#451a03']
          ],
          '#92400e'
        );
        ctx.fillStyle = woodGrad;
        ctx.beginPath();
        ctx.moveTo(-3, -2);
        ctx.lineTo(-13, 9);
        ctx.lineTo(-7, 12);
        ctx.lineTo(-1, 3);
        ctx.closePath();
        ctx.fill();

        // 槍托木紋刻痕 (Woodgrain Texture)
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(-10, 6);
        ctx.lineTo(-4, 0);
        ctx.moveTo(-8, 9);
        ctx.lineTo(-3, 2);
        ctx.stroke();

        // 2. 槍機機匣與扳機護弓 (Receiver & Trigger Guard)
        ctx.fillStyle = '#334155';
        ctx.fillRect(-2, -4, 9, 8);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-2, -4, 9, 8);

        // 散彈槍護木握柄 (Pump Forend Ribs)
        ctx.fillStyle = '#78350f';
        ctx.fillRect(5, -2, 6, 6);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(7, -2, 1, 6);
        ctx.fillRect(9, -2, 1, 6);

        // 3. 粗獷雙金屬散彈槍管 (Twin Blued-Steel Barrels with Specular Highlight)
        const barrelGrad = this._safeLinearGrad(
          ctx,
          7, -6, 26, -1,
          [
            [0, '#475569'],
            [0.3, '#94a3b8'],
            [0.5, '#f1f5f9'],
            [0.7, '#64748b'],
            [1, '#334155']
          ],
          '#64748b'
        );

        ctx.fillStyle = barrelGrad;
        ctx.fillRect(7, -5.5, 19, 4);
        ctx.fillRect(7, -1, 19, 4);

        // 槍管分隔黑線與雙槍口
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(7, -1.8, 19, 0.8);
        ctx.beginPath();
        ctx.ellipse(26, -3.5, 1.2, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(26, 1, 1.2, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 4. 槍口金屬珠形準星 (Golden Bead Sight)
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(24, -6.5, 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        break;
      }

      case 'skin_brawl_colt': {
        // 柯爾特：雙持白銀精緻左輪手槍 (Dual Silver Revolvers with Fluted Cylinders & Ivory Star Grips)
        // 1. 白銀鉻合金槍身與頂部通風肋條
        const chromeGrad = this._safeLinearGrad(
          ctx,
          2, -5, 22, 1,
          [
            [0, '#e2e8f0'],
            [0.4, '#ffffff'],
            [0.8, '#cbd5e1'],
            [1, '#94a3b8']
          ],
          '#f1f5f9'
        );
        ctx.fillStyle = chromeGrad;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.8;
        ctx.fillRect(2, -4.5, 18, 5.5);
        ctx.strokeRect(2, -4.5, 18, 5.5);

        // 槍口刀刃準星 (Front Blade Sight)
        ctx.fillStyle = '#64748b';
        ctx.fillRect(18, -6, 2, 1.6);

        // 2. 6孔六邊凹槽轉輪輪巢 (Fluted 6-Chamber Cylinder)
        const cylGrad = this._safeRadialGrad(
          ctx,
          4, -1.5, 1,
          4, -1.5, 5,
          [
            [0, '#ffffff'],
            [0.6, '#cbd5e1'],
            [1, '#64748b']
          ],
          '#cbd5e1'
        );
        ctx.fillStyle = cylGrad;
        ctx.beginPath();
        ctx.ellipse(4, -1.5, 4.5, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 轉輪刻槽線
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(1.5, -4);
        ctx.lineTo(6.5, -4);
        ctx.moveTo(1.5, 1);
        ctx.lineTo(6.5, 1);
        ctx.stroke();

        // 3. 象牙白手柄與警星徽記 (Ivory Grip with Gold Star Medallion)
        const ivoryGrad = this._safeLinearGrad(
          ctx,
          -6, 0, 2, 10,
          [
            [0, '#fef9c3'],
            [0.5, '#fef08a'],
            [1, '#fde047']
          ],
          '#fef08a'
        );
        ctx.fillStyle = ivoryGrad;
        ctx.beginPath();
        ctx.moveTo(-1, 0);
        ctx.lineTo(-6.5, 9.5);
        ctx.lineTo(-2, 11);
        ctx.lineTo(2.5, 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // 金色微縮警星徽章
        this._drawStar(ctx, -2.8, 5.5, 5, 2.2, 0.9, '#ffd700', '#b45309', 0.5);

        // 擊錘與扳機護弓
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-1, -3);
        ctx.lineTo(-2.5, -5); // 擊錘
        ctx.moveTo(0, 1);
        ctx.arc(1.5, 2.5, 2.5, Math.PI * 0.5, Math.PI * 1.5); // 扳機護弓
        ctx.stroke();

        break;
      }

      case 'skin_brawl_spike': {
        // 斯派克：手持圓滾滾尖刺仙人掌手雷 (Spiky Cactus Bomb with Burning Fuse)
        // 仙人掌炸彈本體 (Cactus Grenade Sphere with Highlights)
        const bombGrad = this._safeRadialGrad(
          ctx,
          6, 0, 1,
          8, 2, 8,
          [
            [0, '#86efac'],
            [0.4, '#22c55e'],
            [0.85, '#15803d'],
            [1, '#14532d']
          ],
          '#22c55e'
        );
        ctx.fillStyle = bombGrad;
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(8, 2, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 仙人掌炸彈尖刺 (Bomb Spines with Highlight Tips)
        const bSpines = [
          { x: 15, y: 2, dx: 4, dy: 0 },
          { x: 8, y: 9.5, dx: 0, dy: 3.5 },
          { x: 8, y: -5.5, dx: 0, dy: -3.5 },
          { x: 13, y: -3, dx: 3, dy: -3 },
          { x: 13, y: 7, dx: 3, dy: 3 }
        ];
        bSpines.forEach(s => {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.moveTo(s.x, s.y - 1);
          ctx.lineTo(s.x + s.dx, s.y + s.dy);
          ctx.lineTo(s.x, s.y + 1);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(s.x + s.dx, s.y + s.dy, 0.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // 編織麻繩引信與躍動火花微粒 (Braided Fuse with Burning Spark Particles)
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(8, -5);
        ctx.quadraticCurveTo(12, -10, 15, -7);
        ctx.stroke();

        // 燃燒火花核心
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(15, -7, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(15, -7, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        break;
      }

      case 'skin_brawl_crow': {
        // 黑鴉：劇毒翡翠飛刀 (Toxic Emerald Dagger with Glowing Poison Trail)
        // 1. 劇毒綠芒刀鋒漸層 (Venom Emerald Blade)
        const bladeGrad = this._safeLinearGrad(
          ctx,
          0, -3.5, 22, 0,
          [
            [0, '#059669'],
            [0.3, '#10b981'],
            [0.7, '#34d399'],
            [1, '#a7f3d0']
          ],
          '#10b981'
        );

        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(2, -3.5);
        ctx.lineTo(22, 0);
        ctx.lineTo(2, 3.5);
        ctx.lineTo(4, 0);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // 刀脊暗影刻線
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(3, 0);
        ctx.lineTo(20, 0);
        ctx.stroke();

        // 2. 劇毒滴落水珠微粒 (Luminescent Poison Drops)
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(24, 1.5, 1.8, 0, Math.PI * 2);
        ctx.arc(27, 3, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(23.5, 1, 0.6, 0, Math.PI * 2);
        ctx.fill();

        break;
      }

      case 'skin_brawl_leon': {
        // 里昂：四刃飛旋手裏劍 (Quad Shuriken with Aerodynamic Motion Trail)
        ctx.save();
        ctx.translate(6, 2);
        const rot = (Date.now() / 70) % (Math.PI * 2);
        ctx.rotate(rot);

        // 藍色能量飛旋風刃外環 (Energy Whirl Trail)
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 9.5, 0, Math.PI * 2);
        ctx.stroke();

        // 4 刃尖銳手裏劍本體
        this._drawStar(ctx, 0, 0, 4, 9, 3.2, '#38bdf8', '#0284c7', 1.4);

        // 刃面高光金屬反光
        ctx.fillStyle = '#e0f2fe';
        for (let b = 0; b < 4; b++) {
          ctx.save();
          ctx.rotate(b * Math.PI * 0.5);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(2, -8);
          ctx.lineTo(0, -3.2);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // 中心能量寶石核心
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
        break;
      }
    }

    ctx.restore();
  }

  // ─── 5. 角色腿部與戰靴 (Legs & Stylish Footwear) ───
  drawLimb(ctx, leg, skin, layer) {
    if (!this.isBrawl(skin)) return false;
    const id = skin.id;
    const isBack = layer === 'backLeg';

    ctx.save();
    ctx.translate(leg.hipX, leg.hipY);
    ctx.rotate(leg.thighAngle);

    // 依外觀定義褲色與鞋色
    let pantsColor = '#1d4ed8';
    let bootColor = '#78350f';

    if (id === 'skin_brawl_shelly') {
      pantsColor = isBack ? '#1e3a8a' : '#2563eb'; // 牛仔藍褲
      bootColor = '#451a03'; // 棕黑牛仔靴
    } else if (id === 'skin_brawl_colt') {
      pantsColor = isBack ? '#0f172a' : '#1e293b'; // 深灰修身西裝褲
      bootColor = '#78350f'; // 棕色靴附銀馬刺
    } else if (id === 'skin_brawl_spike') {
      pantsColor = isBack ? '#15803d' : '#22c55e'; // 翠綠仙人掌腿
      bootColor = '#78350f';
    } else if (id === 'skin_brawl_el_primo') {
      pantsColor = isBack ? '#1d4ed8' : '#2563eb'; // 皇家藍摔角緊身褲
      bootColor = '#ffd700'; // 金色摔角長靴
    } else if (id === 'skin_brawl_crow') {
      pantsColor = isBack ? '#020617' : '#0f172a'; // 黑色緊身皮褲
      bootColor = '#dc2626'; // 紅鞋帶戰靴
    } else if (id === 'skin_brawl_leon') {
      pantsColor = isBack ? '#1e40af' : '#2563eb'; // 藍色短褲
      bootColor = '#fed7aa'; // 赤足/輕便忍者包紮
    }

    // 1. 大腿 (Thigh)
    ctx.fillStyle = pantsColor;
    ctx.strokeStyle = isBack ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-6, 0, 12, 28, 4);
    ctx.fill();
    ctx.stroke();

    // 外側接縫車線 (Seam Lines)
    if (id === 'skin_brawl_shelly') {
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 0.6;
      this._setLineDash(ctx, [2, 2]);
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(-4, 28);
      ctx.stroke();
      this._setLineDash(ctx, []);
    } else if (id === 'skin_brawl_colt' && !isBack) {
      // 柯爾特右大腿雙槍固定皮帶
      ctx.fillStyle = '#5c2b0c';
      ctx.fillRect(-6, 12, 12, 4);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-1, 12, 2, 4);
    } else if (id === 'skin_brawl_el_primo') {
      // 普里莫側面金黃火焰條紋
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(-5, 4);
      ctx.lineTo(-2, 16);
      ctx.lineTo(-5, 26);
      ctx.lineTo(-4, 16);
      ctx.closePath();
      ctx.fill();
    } else if (id === 'skin_brawl_leon') {
      // 里昂短褲側面雙白條紋
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-5, 0, 1.5, 20);
      ctx.fillRect(-2.5, 0, 1.5, 20);
    }

    // 2. 小腿與戰靴 (Shin & Boot Shaft)
    ctx.translate(0, 26);
    ctx.rotate(leg.shinAngle);

    ctx.fillStyle = pantsColor;
    ctx.beginPath();
    ctx.roundRect(-5, 0, 10, 28, 4);
    ctx.fill();
    ctx.stroke();

    // 普里莫金色摔角護膝 (Knee Pad)
    if (id === 'skin_brawl_el_primo') {
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-5.5, -2, 11, 8, 2.5);
      ctx.fill();
      ctx.stroke();
    }

    // 3. 靴子與腳掌 (Boots & Footwear Details)
    ctx.translate(0, 26);
    ctx.rotate(leg.footAngle || 0);

    ctx.fillStyle = bootColor;
    ctx.beginPath();
    ctx.roundRect(-5, 0, 18, 10, 4);
    ctx.fill();
    ctx.stroke();

    // 柯爾特靴後銀馬刺 (Colt Silver Spurs)
    if (id === 'skin_brawl_colt') {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-8, 3, 4, 3);
      // 馬刺星輪
      this._drawStar(ctx, -8, 4.5, 5, 2.5, 1, '#94a3b8');
    }

    // 雪莉西部牛仔靴帶 (Shelly Cowboy Boot Strap)
    if (id === 'skin_brawl_shelly') {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-4, 3, 15, 2.5);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(3, 4.2, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 黑鴉戰靴紅色交叉鞋帶 (Crow Red Speed-Laces)
    if (id === 'skin_brawl_crow') {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-2, 2);
      ctx.lineTo(6, 6);
      ctx.moveTo(-2, 6);
      ctx.lineTo(6, 2);
      ctx.stroke();
    }

    ctx.restore();
    return true;
  }

  // ─── 6. 專屬幾何防禦盾 (Stylized Guard Shields) ───
  drawGuardShield(ctx, stance, skin, t) {
    if (!this.isBrawl(skin)) return false;
    const id = skin.id;

    ctx.save();
    const sy = stance === 'low' ? 15 : -35;
    ctx.translate(28, sy);

    switch (id) {
      case 'skin_brawl_shelly': {
        // 金黃警星防禦盾壁
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 24;
        ctx.strokeStyle = '#facc15';
        ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 36, -Math.PI * 0.45, Math.PI * 0.45);
        ctx.lineTo(-10, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        this._drawStar(ctx, 12, 0, 5, 10, 5, '#fbbf24');
        break;
      }

      case 'skin_brawl_colt': {
        // 雙左輪全息封鎖星環
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 22;
        ctx.strokeStyle = '#38bdf8';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(10, 0, 28, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        this._drawStar(ctx, 10, 0, 6, 12, 6, '#ffd700');
        break;
      }

      case 'skin_brawl_spike': {
        // 旋轉巨大仙人掌花防禦力場
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 26;
        ctx.strokeStyle = '#22c55e';
        ctx.fillStyle = 'rgba(34, 197, 94, 0.28)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(12, 0, 38, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // 旋轉粉紅花心
        ctx.fillStyle = '#ec4899';
        for (let f = 0; f < 5; f++) {
          const fa = (t * 0.1 + f * Math.PI * 0.4);
          ctx.beginPath();
          ctx.arc(12 + Math.cos(fa) * 14, Math.sin(fa) * 14, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'skin_brawl_el_primo': {
        // 摔角霸王金光冠軍金鐘罩
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 30;
        ctx.strokeStyle = '#fbbf24';
        ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(10, 0, 42, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        this._drawStar(ctx, 10, 0, 8, 14, 7, '#ffd700');
        break;
      }

      case 'skin_brawl_crow': {
        // 劇毒羽翼暗夜護壁
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 25;
        ctx.strokeStyle = '#10b981';
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(10, 0, 24, 42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'skin_brawl_leon': {
        // 變色龍全息光學隱身屏障
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 24;
        ctx.strokeStyle = '#34d399';
        ctx.fillStyle = 'rgba(52, 211, 153, 0.25)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(0, -38, 26, 76, 12);
        ctx.fill();
        ctx.stroke();
        break;
      }
    }

    ctx.restore();
    return true;
  }

  // ─── 7. 專屬打擊攻擊特效 (VFX) ───
  drawAttackVFX(ctx, vfx, skin) {
    if (!this.isBrawl(skin)) return false;
    const id = skin.id;

    ctx.save();
    switch (id) {
      case 'skin_brawl_shelly': {
        // 散彈槍轟擊扇形火花與煙霧 (Shotgun Pellets & Blast Smoke)
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#fde047';
        for (let i = 0; i < 7; i++) {
          const ang = -0.35 + (i / 6) * 0.7;
          const dist = 32 + Math.random() * 25;
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * dist + 15, Math.sin(ang) * dist - 30, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        // 槍口金色火光
        ctx.fillStyle = 'rgba(250, 204, 21, 0.85)';
        ctx.beginPath();
        ctx.ellipse(32, -32, 16, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'skin_brawl_colt': {
        // 雙槍疾速穿透金光子彈軌跡 (Bullet Trails)
        ctx.shadowColor = '#60a5fa';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(25, -34, 24, 3);
        ctx.fillRect(32, -26, 26, 3);
        // 子彈金芒火花
        ctx.fillStyle = '#ffd700';
        this._drawStar(ctx, 52, -32, 5, 5, 2, '#ffd700');
        break;
      }

      case 'skin_brawl_spike': {
        // 仙人掌尖刺爆發彈射 (Needle Burst)
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#15803d';
        for (let n = 0; n < 6; n++) {
          const ang = (n * Math.PI) / 3;
          ctx.save();
          ctx.translate(35 + Math.cos(ang) * 16, -28 + Math.sin(ang) * 16);
          ctx.rotate(ang);
          ctx.fillRect(-1.5, 0, 3, 8);
          ctx.restore();
        }
        break;
      }

      case 'skin_brawl_el_primo': {
        // 摔角流星火焰重拳 (Meteor Fist Flame)
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 28;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(38, -30, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(42, -30, 11, 0, Math.PI * 2);
        ctx.fill();
        this._drawStar(ctx, 42, -30, 5, 8, 4, '#ffffff');
        break;
      }

      case 'skin_brawl_crow': {
        // 淬毒綠芒飛刀破空 (Toxic Green Dagger Trails)
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 22;
        ctx.fillStyle = '#34d399';
        for (let d = 0; d < 3; d++) {
          const dy = -40 + d * 10;
          ctx.beginPath();
          ctx.moveTo(25, dy);
          ctx.lineTo(48, dy);
          ctx.lineTo(25, dy + 3);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }

      case 'skin_brawl_leon': {
        // 旋轉四刃飛鏢破空幻影 (Shuriken Illusion)
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 20;
        this._drawStar(ctx, 42, -30, 4, 12, 4, '#00f3ff');
        this._drawStar(ctx, 32, -34, 4, 8, 3, 'rgba(0, 243, 255, 0.45)');
        break;
      }
    }
    ctx.restore();
    return true;
  }
}

export const brawlSkinsRenderer = new BrawlSkinsRenderer();
