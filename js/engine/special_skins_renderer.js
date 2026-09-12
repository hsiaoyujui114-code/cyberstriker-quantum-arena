/**
 * 《CyberStriker: Quantum Arena》
 * 漫威 (Marvel) & 七龍珠超 (Dragon Ball Super) 傳奇角色高精度正宗渲染引擎
 * 專為 10 位經典角色打造 100% 正宗視覺還原：
 *
 * 漫威宇宙 (Marvel Universe):
 * 1. 鋼鐵人・馬克85 (Mark 85): 金紅納米裝甲、金面甲、狹長蔚藍光眼、胸口方舟反應爐、掌心等離子脈衝砲
 * 2. 蜘蛛人・經典紅藍 (Spider-Man): 經典紅白蛛網戰衣、粗黑邊大白蛛眼、胸口黑蜘蛛圖騰、藍紅拼接
 * 3. 美國隊長・羅傑斯 (Captain America): 海軍藍戰鬥服、頭盔「A」字與側翼、胸口白星、紅白條紋、背後汎合金圓盾
 * 4. 雷神索爾・奧丁之子 (Thor Odinson): 阿斯嘉神銀雙翼頭盔、金色長髮、胸前 6 枚銀圓盤、深紅戰袍披風、雷電之眼
 * 5. 薩諾斯・無限手套 (Thanos): 紫色泰坦皮膚、標誌性下巴直條紋、黃金戰甲戰盔、左手鑲嵌 6 顆無限寶石之金色無限手套
 *
 * 七龍珠超 (Dragon Ball Super):
 * 6. 孫悟空・超級賽亞人 (Son Goku SSJ): 經典沖天金色刺蝟髮、碧綠賽亞人之眼、橙色龜仙流道服、胸前「悟」字徽章、經典紅條武道靴、金色氣焰
 * 7. 貝吉塔・賽亞人王子 (Vegeta SSJ): 火焰狀垂直沖天金髮、M型美人尖髮際線、賽亞人白黃胸甲、深藍緊身衣、喇叭手套與金頭戰靴
 * 8. 未來特南克斯 (Future Trunks): 中分淡紫動漫秀髮、膠囊公司短版牛仔夾克、背後斜挎勇者之劍皮帶與劍鞘、芥末黃軍靴
 * 9. 比克大魔王 (Piccolo): 那美克星綠色皮膚、額頭雙觸角、尖耳、白色頭巾、寬肩白色長披風、手臂粉紅肌肉紋理、尖頭功夫鞋
 * 10. 黃金弗利沙 (Golden Frieza): 金屬真金生物甲、頭頂與胸口深紫水晶寶石、猩紅邪惡雙眼、紫色臉頰紋理、帝皇金色光焰
 */

export class SpecialSkinsRenderer {
  constructor() {
    this.specialSkinIds = new Set([
      'skin_iron_man',
      'skin_spiderman',
      'skin_captain_america',
      'skin_thor',
      'skin_thanos',
      'skin_hawkeye',
      'skin_goku_ssj',
      'skin_vegeta_ssj',
      'skin_trunks_future',
      'skin_piccolo',
      'skin_golden_frieza'
    ]);
  }

  isSpecial(skin) {
    return skin && skin.id && this.specialSkinIds.has(skin.id);
  }

  // ─── 輔助繪圖工具 ───

  _drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, fillStyle, strokeStyle = null, lineWidth = 1) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
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

  _drawSpiderWebOnHead(ctx, cx, cy, radius, color = 'rgba(0, 0, 0, 0.75)') {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.9;

    // 放射狀蛛網輻條
    const angles = [
      -Math.PI * 0.9, -Math.PI * 0.7, -Math.PI * 0.5, -Math.PI * 0.3, -Math.PI * 0.1,
      Math.PI * 0.1, Math.PI * 0.3, Math.PI * 0.5, Math.PI * 0.7, Math.PI * 0.9
    ];

    for (const ang of angles) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang) * radius, cy + Math.sin(ang) * radius);
      ctx.stroke();
    }

    // 2 層同心向內弧形蜘蛛網環
    for (const r of [radius * 0.45, radius * 0.85]) {
      ctx.beginPath();
      for (let i = 0; i < angles.length; i++) {
        const ang = angles[i];
        const px = cx + Math.cos(ang) * r;
        const py = cy + Math.sin(ang) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // ─── 1. 特殊氣場與光環 (Special Aura) ───
  drawAura(ctx, char, skin, t) {
    if (!this.isSpecial(skin)) return;
    const id = skin.id;

    ctx.save();

    if (id === 'skin_goku_ssj' || id === 'skin_vegeta_ssj') {
      // ── 超級賽亞人金色升騰氣焰 (Super Saiyan Golden Ki Aura) ──
      const isVegeta = id === 'skin_vegeta_ssj';
      const mainGold = isVegeta ? '#facc15' : '#fde047';
      const glowGold = isVegeta ? 'rgba(250, 204, 21, 0.45)' : 'rgba(254, 240, 138, 0.5)';

      ctx.shadowColor = mainGold;
      ctx.shadowBlur = 24;

      // 氣焰外層洶湧輪廓
      for (let f = 0; f < 3; f++) {
        const wave = Math.sin(t * 0.2 + f * 1.8) * 6;
        ctx.fillStyle = glowGold;
        ctx.beginPath();
        // 腳底寬，腰部聚攏，頭部上方如火焰升騰
        ctx.moveTo(-26 - wave, 4);
        ctx.quadraticCurveTo(-38 + wave, -45, -18 - wave, -88);
        ctx.quadraticCurveTo(0, -112 - Math.sin(t * 0.3) * 8, 18 + wave, -88);
        ctx.quadraticCurveTo(38 - wave, -45, 26 + wave, 4);
        ctx.closePath();
        ctx.fill();
      }

      // 向上飄升的金色聚能氣芒粒子
      for (let i = 0; i < 7; i++) {
        const pSpeed = (t * 2.2 + i * 16) % 110;
        const px = Math.sin(t * 0.15 + i * 2) * (20 - pSpeed * 0.12);
        const py = 4 - pSpeed;
        const alpha = Math.max(0, 1 - pSpeed / 100);

        ctx.fillStyle = isVegeta && i % 3 === 0 ? '#60a5fa' : '#ffffff';
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        // 菱形氣芒微粒
        ctx.moveTo(px, py - 3);
        ctx.lineTo(px + 2, py);
        ctx.lineTo(px, py + 3);
        ctx.lineTo(px - 2, py);
        ctx.closePath();
        ctx.fill();
      }

      // 貝吉塔特有：高傲藍金電光火花 (Saiyan Prince Blue Sparks)
      if (isVegeta) {
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1.5;
        for (let s = 0; s < 3; s++) {
          const sparkPhase = (t * 0.1 + s * 2.1) % (Math.PI * 2);
          if (Math.sin(sparkPhase) > 0.4) {
            const sx = Math.sin(sparkPhase * 3) * 22;
            const sy = -30 - Math.cos(sparkPhase * 2) * 35;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + 5, sy - 6);
            ctx.lineTo(sx + 2, sy - 12);
            ctx.stroke();
          }
        }
      }
    } else if (id === 'skin_golden_frieza') {
      // ── 黃金弗利沙：宇宙帝王金色死亡光焰 (Golden Death Ki Flame) ──
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 26;

      const wave = Math.sin(t * 0.25) * 5;
      ctx.fillStyle = 'rgba(255, 215, 0, 0.45)';
      ctx.beginPath();
      ctx.moveTo(-24 - wave, 4);
      ctx.quadraticCurveTo(-34, -40, -16, -85);
      ctx.quadraticCurveTo(0, -108, 16, -85);
      ctx.quadraticCurveTo(34, -40, 24 + wave, 4);
      ctx.closePath();
      ctx.fill();

      // 紫色死亡火花 (Imperial Violet Sparks)
      for (let i = 0; i < 5; i++) {
        const pSpeed = (t * 2.5 + i * 22) % 100;
        const px = Math.cos(t * 0.2 + i) * 24;
        const py = -pSpeed;
        ctx.fillStyle = '#c084fc';
        ctx.globalAlpha = Math.max(0, 1 - pSpeed / 90);
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (id === 'skin_thor') {
      // ── 雷神索爾：阿斯嘉雷霆電光 (Asgardian Thunder Lightning Arcs) ──
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 2;

      for (let i = 0; i < 3; i++) {
        const arcT = (t * 0.3 + i * 2.3) % 4;
        if (arcT < 2.5) {
          const startX = -15 + i * 15;
          const startY = -70 + i * 20;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(startX + 8, startY + 12);
          ctx.lineTo(startX - 4, startY + 22);
          ctx.lineTo(startX + 10, startY + 34);
          ctx.stroke();
        }
      }
    } else if (id === 'skin_thanos') {
      // ── 薩諾斯：無限寶石宇宙脈衝微光 (Infinity Stones Cosmic Pulse) ──
      const colors = ['#facc15', '#a855f7', '#3b82f6', '#ef4444', '#f97316', '#22c55e'];
      const activeIdx = Math.floor(t * 0.15) % colors.length;
      ctx.shadowColor = colors[activeIdx];
      ctx.shadowBlur = 16;
      ctx.strokeStyle = colors[activeIdx];
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5 + Math.sin(t * 0.3) * 0.3;

      ctx.beginPath();
      ctx.arc(0, -45, 34 + Math.sin(t * 0.2) * 4, 0, Math.PI * 2);
      ctx.stroke();
    } else if (id === 'skin_hawkeye') {
      // ── 鷹眼：頂級神射手專注紫芒與戰術瞄準十字光圈 ──
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, -60, 22 + Math.sin(t * 0.1) * 3, 0, Math.PI * 2);
      ctx.stroke();
      // 戰術瞄準十字刻度
      ctx.beginPath();
      ctx.moveTo(-8, -60); ctx.lineTo(-4, -60);
      ctx.moveTo(4, -60); ctx.lineTo(8, -60);
      ctx.moveTo(0, -68); ctx.lineTo(0, -64);
      ctx.moveTo(0, -56); ctx.lineTo(0, -52);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ─── 2. 特殊頭部渲染 (Special Head) ───
  drawHead(ctx, head, skin) {
    if (!this.isSpecial(skin)) return false;
    const id = skin.id;
    const t = Date.now() / 250;

    switch (id) {
      // ══════════════════════════════════════════════════
      // 1. 鋼鐵人・馬克85 (Iron Man Mark 85)
      // ══════════════════════════════════════════════════
      case 'skin_iron_man': {
        // (A) 深金紅頭盔底座 (Crimson Helmet Shell)
        ctx.fillStyle = '#b91c1c';
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-14, 8);
        ctx.quadraticCurveTo(-18, -4, -14, -14);
        ctx.quadraticCurveTo(-6, -19, 4, -19);
        ctx.lineTo(13, -12);
        ctx.lineTo(15, -2);
        ctx.lineTo(13, 8);
        ctx.lineTo(6, 16);
        ctx.lineTo(-6, 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 頭頂金色空氣動力導流脊
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(-8, -17);
        ctx.lineTo(4, -18);
        ctx.lineTo(10, -13);
        ctx.lineTo(4, -15);
        ctx.closePath();
        ctx.fill();

        // (B) 正宗馬克85金鈦合金面甲 (Signature Gold Faceplate)
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(2, -14); // 額頭中央 V 形微凹折
        ctx.lineTo(12, -12);
        ctx.lineTo(15, -3);
        ctx.lineTo(13, 7);
        ctx.lineTo(7, 15);
        ctx.lineTo(1, 15);
        ctx.lineTo(2, 6);
        ctx.lineTo(0, -3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 下顎深紅呼吸排氣格柵
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(4, 11, 5, 2.5);

        // (C) 標誌性蔚藍光學目鏡雙眼 (Glowing Cyan Slit Eyes)
        const eyePulse = Math.sin(t * 1.5) * 0.15 + 0.85;
        ctx.save();
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10 * eyePulse;
        ctx.fillStyle = '#ffffff';

        // 前側主眼 (銳利斜切微縫)
        ctx.beginPath();
        ctx.moveTo(5, -4);
        ctx.lineTo(13, -3);
        ctx.lineTo(12, -1);
        ctx.lineTo(6, -1.5);
        ctx.closePath();
        ctx.fill();

        // 後側遠眼 (立體感斜切)
        ctx.beginPath();
        ctx.moveTo(1, -4);
        ctx.lineTo(3.5, -3.5);
        ctx.lineTo(3.2, -1.8);
        ctx.lineTo(1, -2.2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 耳部金色圓形通訊關節 puck
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.arc(-8, 1, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(-8, 1, 1.8, 0, Math.PI * 2);
        ctx.fill();
        return true;
      }

      // ══════════════════════════════════════════════════
      // 2. 蜘蛛人・經典紅藍 (Spider-Man Classic Suit)
      // ══════════════════════════════════════════════════
      case 'skin_spiderman': {
        // (A) 鮮紅面罩圓潤外輪廓 (Crimson Cowl)
        ctx.fillStyle = '#dc2626';
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-13, 8);
        ctx.quadraticCurveTo(-16, -2, -13, -13);
        ctx.quadraticCurveTo(-5, -18, 4, -18);
        ctx.quadraticCurveTo(14, -14, 15, -2);
        ctx.quadraticCurveTo(14, 8, 7, 16);
        ctx.lineTo(-6, 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (B) 標誌性蜘蛛網網格紋理 (Spider-Web Mesh)
        this._drawSpiderWebOnHead(ctx, 8, -2, 16, 'rgba(15, 23, 42, 0.7)');

        // (C) 正宗大白蛛眼與粗黑鏡框 (Iconic Large Angular Spider Lenses)
        // 1. 粗黑鏡框外框
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        // 前側主眼：銳利上揚幾何外框
        ctx.moveTo(4, -8);
        ctx.lineTo(15, -4);
        ctx.quadraticCurveTo(16, 2, 13, 5);
        ctx.lineTo(5, 1);
        ctx.closePath();
        ctx.fill();

        // 2. 鏡片純白內部高亮
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(6, -6);
        ctx.lineTo(13.5, -3);
        ctx.quadraticCurveTo(14.5, 1.5, 12, 3.5);
        ctx.lineTo(6.5, 0);
        ctx.closePath();
        ctx.fill();

        // 3. 後側立體副眼 (3/4 視角)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(3.5, -5.5);
        ctx.lineTo(3, 0);
        ctx.lineTo(0.5, -1);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(1, -5.5);
        ctx.lineTo(3, -4.5);
        ctx.lineTo(2.5, -0.8);
        ctx.lineTo(1.2, -1.5);
        ctx.closePath();
        ctx.fill();
        return true;
      }

      // ══════════════════════════════════════════════════
      // 3. 美國隊長・羅傑斯 (Captain America Steve Rogers)
      // ══════════════════════════════════════════════════
      case 'skin_captain_america': {
        // (A) 深海軍藍戰術戰盔 (Navy Blue Tactical Helmet)
        ctx.fillStyle = '#1e3a8a';
        ctx.strokeStyle = '#172554';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-13, 8);
        ctx.quadraticCurveTo(-17, -2, -14, -13);
        ctx.quadraticCurveTo(-6, -19, 4, -19);
        ctx.lineTo(13, -12);
        ctx.lineTo(15, -4);
        // 戰盔邊緣切線露臉部
        ctx.lineTo(6, -1);
        ctx.lineTo(3, 8);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (B) 額頭正中標誌性純白「A」字 (Bold White Letter "A")
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('A', 8, -10);
        ctx.restore();

        // 戰盔側邊白色小羽翼印記 (Side Wings Decal)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.moveTo(-7, -8);
        ctx.lineTo(-2, -10);
        ctx.lineTo(-4, -6);
        ctx.lineTo(0, -7);
        ctx.lineTo(-5, -4);
        ctx.closePath();
        ctx.fill();

        // (C) 面部露出的堅毅臉龐與下巴 (Determined Skin & Chin)
        ctx.fillStyle = '#fed7aa'; // 膚色
        ctx.beginPath();
        ctx.moveTo(6, -1);
        ctx.lineTo(15, -1);
        ctx.lineTo(13, 7);
        ctx.lineTo(6, 15);
        ctx.lineTo(2, 14);
        ctx.lineTo(3, 8);
        ctx.closePath();
        ctx.fill();

        // 棕色皮革戰術下顎帶 (Brown Leather Chinstrap)
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-3, 8);
        ctx.lineTo(4, 15);
        ctx.stroke();

        // 湛藍剛毅眼眸 (Focused Blue Eyes)
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(8, -3, 3, 2);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(7, -5, 5, 1.2); // 粗眉
        return true;
      }

      // ══════════════════════════════════════════════════
      // 4. 雷神索爾・奧丁之子 (Thor Odinson)
      // ══════════════════════════════════════════════════
      case 'skin_thor': {
        // (A) 金色阿斯嘉長髮 (Flowing Golden Locks)
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-10, -12);
        ctx.quadraticCurveTo(-22, -2, -19, 16);
        ctx.lineTo(-14, 18);
        ctx.lineTo(-10, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (B) 阿斯嘉神銀戰盔 (Asgardian Winged Silver Helmet)
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-12, 6);
        ctx.quadraticCurveTo(-16, -4, -12, -14);
        ctx.quadraticCurveTo(-4, -19, 4, -19);
        ctx.lineTo(13, -12);
        ctx.lineTo(14, -3);
        ctx.lineTo(4, 0);
        ctx.lineTo(-4, 7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 戰盔標誌性雙銀翼 (Silver Wings)
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-6, -12);
        ctx.lineTo(-16, -26);
        ctx.lineTo(-10, -20);
        ctx.lineTo(-18, -20);
        ctx.lineTo(-8, -14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (C) 英俊戰神容顏與雷電之眼 (Face & Lightning Eyes)
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.moveTo(4, 0);
        ctx.lineTo(14, -1);
        ctx.lineTo(13, 8);
        ctx.lineTo(6, 16);
        ctx.lineTo(0, 15);
        ctx.lineTo(-2, 7);
        ctx.closePath();
        ctx.fill();

        // 絡腮金色戰神短鬚 (Blond Stubble/Beard)
        ctx.fillStyle = '#eab308';
        ctx.fillRect(4, 13, 4, 2.5);

        // 雷神專屬湛藍電光眼 (Lightning Blue Optic Eyes)
        ctx.save();
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(8, -2, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(8, -2, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }

      // ══════════════════════════════════════════════════
      // 5. 薩諾斯・無限手套 (Thanos Titan Warlord)
      // ══════════════════════════════════════════════════
      case 'skin_thanos': {
        // (A) 魁梧紫色泰坦頭部 (Purple Titan Skull)
        ctx.fillStyle = '#8b5cf6';
        ctx.strokeStyle = '#6d28d9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-14, 8);
        ctx.quadraticCurveTo(-18, -4, -14, -15);
        ctx.quadraticCurveTo(-6, -20, 5, -20);
        ctx.lineTo(14, -12);
        ctx.lineTo(16, 2);
        ctx.lineTo(14, 12);
        ctx.lineTo(6, 18);
        ctx.lineTo(-6, 17);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (B) 標誌性霸氣黃金戰甲戰盔 (Titan Gold Warlord Helmet)
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-12, -4);
        ctx.lineTo(-14, -16);
        ctx.lineTo(5, -21);
        ctx.lineTo(13, -14);
        ctx.lineTo(11, -5);
        ctx.lineTo(5, -12);
        ctx.lineTo(-5, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 戰盔頭頂中央突起金脊
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-2, -21, 5, 8);

        // (C) 薩諾斯標誌性下巴 4 道垂直條紋 (Iconic 4 Vertical Chin Ridges)
        ctx.strokeStyle = '#581c87';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
          const rx = 3 + i * 2.8;
          ctx.beginPath();
          ctx.moveTo(rx, 11);
          ctx.lineTo(rx, 17);
          ctx.stroke();
        }

        // 睥睨一切的暗紅金色眼眸 (Menacing Glowing Eyes)
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(8, -4, 3.5, 2);
        ctx.fillStyle = '#4c1d95';
        ctx.fillRect(6, -6, 7, 1.5); // 沉重眉脊
        return true;
      }

      // ══════════════════════════════════════════════════
      // 5.5 鷹眼・克林特巴頓 (Hawkeye Clint Barton)
      // ══════════════════════════════════════════════════
      case 'skin_hawkeye': {
        // (A) 帥氣俐落深褐黑削邊髮型 (Tactical Undercut Hair)
        ctx.fillStyle = '#27272a';
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-12, 4);
        ctx.lineTo(-14, -14);
        ctx.lineTo(2, -18);
        ctx.lineTo(12, -14);
        ctx.lineTo(14, -6);
        ctx.lineTo(6, -16);
        ctx.lineTo(-4, -15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (B) 神射手面龐 (Sharp Archer Face)
        ctx.fillStyle = '#fed7aa';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(2, -14);
        ctx.lineTo(13, -10);
        ctx.lineTo(14, 0);
        ctx.lineTo(12, 9);
        ctx.lineTo(6, 16);
        ctx.lineTo(-2, 15);
        ctx.lineTo(-8, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (C) 標誌性復仇者紫色戰術面罩護目鏡 / 頭帶 (Tactical Archer Cowl & Mask)
        ctx.fillStyle = '#581c87';
        ctx.strokeStyle = '#3b0764';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-6, -4);
        ctx.lineTo(14, -4);
        ctx.lineTo(13, 3);
        ctx.lineTo(-4, 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 鷹眼紫色箭頭人字紋章 (Purple Arrow Chevron Emblem on forehead)
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.moveTo(4, -12);
        ctx.lineTo(8, -7);
        ctx.lineTo(5, -7);
        ctx.lineTo(2, -10);
        ctx.closePath();
        ctx.fill();

        // (D) 鷹眼銳利鷹隼之眼 (Focused Eagle Eyes)
        ctx.fillStyle = '#facc15';
        ctx.fillRect(7, -2, 4, 2);
        ctx.fillStyle = '#581c87';
        ctx.fillRect(9, -2, 2, 2); // 瞳孔
        return true;
      }

      // ══════════════════════════════════════════════════
      // 6. 孫悟空・超級賽亞人 (Son Goku SSJ)
      // ══════════════════════════════════════════════════
      case 'skin_goku_ssj': {
        // (A) 經典超級賽亞人狂暴沖天金色刺蝟髮 (Iconic Spiky SSJ Golden Hair)
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.8;

        ctx.beginPath();
        // 1. 頭頂後側第一大巨刺
        ctx.moveTo(-4, -18);
        ctx.lineTo(-14, -38);
        ctx.lineTo(-5, -23);
        // 2. 腦後第二大尖刺
        ctx.lineTo(-24, -32);
        ctx.lineTo(-14, -16);
        // 3. 後頸第三尖刺
        ctx.lineTo(-26, -18);
        ctx.lineTo(-14, -5);
        // 4. 頭頂高聳衝天主刺
        ctx.lineTo(2, -20);
        ctx.lineTo(8, -36);
        ctx.lineTo(12, -18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 金髮高光層 (Golden Core Sheen)
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.moveTo(-2, -18);
        ctx.lineTo(-10, -32);
        ctx.lineTo(-4, -22);
        ctx.lineTo(6, -30);
        ctx.closePath();
        ctx.fill();

        // (B) 悟空帥氣動漫臉龐 (Handsome Goku Anime Face)
        ctx.fillStyle = '#fed7aa'; // 賽亞人膚色
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(2, -14);
        ctx.lineTo(14, -10);
        ctx.lineTo(15, -1);
        ctx.lineTo(12, 8);
        ctx.lineTo(6, 16);
        ctx.lineTo(-3, 15);
        ctx.lineTo(-10, 6);
        ctx.closePath();
        ctx.fill();

        // (C) 標誌性前額飄逸垂落金黃劉海 (Iconic Front Bangs)
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.4;

        // 前劉海 1
        ctx.beginPath();
        ctx.moveTo(11, -14);
        ctx.lineTo(15, -4);
        ctx.lineTo(10, -7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 前額中央劉海 2
        ctx.beginPath();
        ctx.moveTo(7, -13);
        ctx.lineTo(9, -2);
        ctx.lineTo(5, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (D) 標誌性碧綠色超級賽亞人之眼 (Emerald Turquoise SSJ Eyes)
        ctx.fillStyle = '#0f172a'; // 銳利動漫眼角線
        ctx.beginPath();
        ctx.moveTo(6, -5);
        ctx.lineTo(13, -3);
        ctx.lineTo(12, 1);
        ctx.lineTo(7, 0);
        ctx.closePath();
        ctx.fill();

        // 碧綠虹膜 (Turquoise Iris)
        ctx.fillStyle = '#2dd4bf';
        ctx.fillRect(8, -3.5, 3.5, 3);
        ctx.fillStyle = '#ffffff'; // 高光點
        ctx.fillRect(9, -3, 1.2, 1.2);

        // 嚴肅決意動漫眉毛
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(5, -6);
        ctx.lineTo(14, -4);
        ctx.lineTo(13, -2.5);
        ctx.lineTo(5, -4.5);
        ctx.closePath();
        ctx.fill();
        return true;
      }

      // ══════════════════════════════════════════════════
      // 7. 貝吉塔・賽亞人王子 (Vegeta SSJ)
      // ══════════════════════════════════════════════════
      case 'skin_vegeta_ssj': {
        // (A) 貝吉塔經典直立火焰刺蝟金髮 (Vegeta Vertical Flame Hair)
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.8;

        ctx.beginPath();
        // 垂直沖天火焰外廓
        ctx.moveTo(5, -12);
        ctx.lineTo(11, -44); // 沖天主焰
        ctx.lineTo(3, -28);
        ctx.lineTo(-2, -46); // 中央高焰
        ctx.lineTo(-7, -26);
        ctx.lineTo(-14, -40); // 後側高焰
        ctx.lineTo(-13, -18);
        ctx.lineTo(-22, -26); // 腦後小刺
        ctx.lineTo(-12, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 金色火焰光澤內核
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.moveTo(3, -14);
        ctx.lineTo(8, -38);
        ctx.lineTo(1, -26);
        ctx.lineTo(-2, -38);
        ctx.lineTo(-5, -24);
        ctx.lineTo(-9, -32);
        ctx.closePath();
        ctx.fill();

        // (B) 標誌性 M 型美人尖髮際線 (Saiyan Widow's Peak)
        ctx.fillStyle = '#fed7aa'; // 膚色臉頰
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(8, -12);
        ctx.lineTo(5, -7); // M型美人尖尖端往下突入
        ctx.lineTo(0, -12);
        ctx.lineTo(-6, -11);
        ctx.lineTo(-10, 4);
        ctx.lineTo(-3, 15);
        ctx.lineTo(5, 16);
        ctx.lineTo(13, 7);
        ctx.lineTo(14, -2);
        ctx.closePath();
        ctx.fill();

        // (C) 賽亞人王子的霸氣高傲神情 (Proud Scowl & Green Eyes)
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        // 斜向下壓的憤怒嚴峻眼眶
        ctx.moveTo(5, -4);
        ctx.lineTo(13, -1);
        ctx.lineTo(11, 3);
        ctx.lineTo(5, 1);
        ctx.closePath();
        ctx.fill();

        // 碧綠賽亞人瞳孔
        ctx.fillStyle = '#2dd4bf';
        ctx.fillRect(7, -2.5, 3.8, 3.5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(8, -2, 1.2, 1.2);

        // 緊皺金眉
        ctx.fillStyle = '#facc15';
        ctx.fillRect(4, -5.5, 9, 2);
        return true;
      }

      // ══════════════════════════════════════════════════
      // 8. 未來特南克斯 (Future Trunks)
      // ══════════════════════════════════════════════════
      case 'skin_trunks_future': {
        // (A) 帥氣中分淡紫動漫秀髮 (Center-Parted Lavender Hair)
        ctx.fillStyle = '#c084fc';
        ctx.strokeStyle = '#9333ea';
        ctx.lineWidth = 1.6;

        ctx.beginPath();
        ctx.moveTo(2, -18); // 中分點
        // 左側柔順長劉海
        ctx.quadraticCurveTo(12, -14, 15, -2);
        ctx.lineTo(14, 5);
        ctx.lineTo(11, 0);
        ctx.lineTo(7, -10);
        ctx.lineTo(2, -18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 後側及右側飄逸秀髮
        ctx.beginPath();
        ctx.moveTo(2, -18);
        ctx.quadraticCurveTo(-10, -18, -16, -10);
        ctx.quadraticCurveTo(-20, 2, -16, 12);
        ctx.lineTo(-11, 8);
        ctx.lineTo(-10, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (B) 俊俏動漫臉龐 (Handsome Peach Face)
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.moveTo(2, -11);
        ctx.lineTo(11, -7);
        ctx.lineTo(13, 3);
        ctx.lineTo(7, 15);
        ctx.lineTo(-2, 14);
        ctx.lineTo(-8, 5);
        ctx.closePath();
        ctx.fill();

        // 湛藍動漫眼眸 (Anime Blue Eyes)
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(6, -2, 4, 2.5);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(5, -4, 6, 1.5);
        return true;
      }

      // ══════════════════════════════════════════════════
      // 9. 比克大魔王 (Piccolo)
      // ══════════════════════════════════════════════════
      case 'skin_piccolo': {
        // (A) 那美克星純白戰術頭巾 (White Namekian Turban)
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.6;

        ctx.beginPath();
        ctx.moveTo(-14, 2);
        ctx.quadraticCurveTo(-18, -10, -10, -18);
        ctx.quadraticCurveTo(2, -22, 12, -15);
        ctx.lineTo(14, -6);
        ctx.lineTo(3, -6);
        ctx.lineTo(-6, 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 頭巾中央紫色緊箍束帶 (Purple Wrap Band)
        ctx.fillStyle = '#581c87';
        ctx.fillRect(-1, -19, 5, 8);

        // (B) 那美克星純綠皮膚與尖耳 (Green Skin & Pointed Ears)
        ctx.fillStyle = '#22c55e';
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 1.4;

        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(12, -5);
        ctx.lineTo(14, 5);
        ctx.lineTo(7, 16);
        ctx.lineTo(-2, 15);
        ctx.lineTo(-8, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 標誌性長尖耳 (Pointed Namekian Ears)
        ctx.beginPath();
        ctx.moveTo(-10, 2);
        ctx.lineTo(-20, -3); // 向後上方尖刺
        ctx.lineTo(-9, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (C) 額頭標誌性雙觸角 (Dual Forehead Antennae)
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 2.2;
        // 觸角 1
        ctx.beginPath();
        ctx.moveTo(8, -7);
        ctx.quadraticCurveTo(12, -14, 15, -17);
        ctx.stroke();
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(15, -17, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // 觸角 2
        ctx.beginPath();
        ctx.moveTo(4, -8);
        ctx.quadraticCurveTo(8, -16, 10, -19);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(10, -19, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // 黃黑那美克星戰士眼神
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(7, 0, 4, 2.5);
        ctx.fillStyle = '#000000';
        ctx.fillRect(8.5, 0.5, 1.5, 1.5);
        return true;
      }

      // ══════════════════════════════════════════════════
      // 10. 黃金弗利沙 (Golden Frieza)
      // ══════════════════════════════════════════════════
      case 'skin_golden_frieza': {
        // (A) 高貴奢華黃金頭部生物裝甲 (Metallic Gold Bio-Chassis)
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.8;

        ctx.beginPath();
        ctx.moveTo(-13, 6);
        ctx.quadraticCurveTo(-17, -6, -12, -15);
        ctx.quadraticCurveTo(0, -20, 11, -15);
        ctx.lineTo(15, -3);
        ctx.lineTo(13, 8);
        ctx.lineTo(6, 16);
        ctx.lineTo(-4, 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (B) 頭頂標誌性紫水晶寶石 (Glossy Purple Bio-Crystal)
        ctx.save();
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#9333ea';
        ctx.beginPath();
        ctx.ellipse(-1, -14, 7, 4.5, -0.1, 0, Math.PI * 2);
        ctx.fill();
        // 水晶高光折射白點
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-2, -15, 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // (C) 弗利沙臉頰紫色水滴條紋 (Purple Cheek Markings)
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.moveTo(9, 2);
        ctx.lineTo(11, 9);
        ctx.lineTo(7, 8);
        ctx.closePath();
        ctx.fill();

        // (D) 猩紅邪惡雙眼 (Cruel Ruby-Red Eyes)
        ctx.fillStyle = '#000000'; // 邪惡眼影輪廓
        ctx.beginPath();
        ctx.moveTo(5, -4);
        ctx.lineTo(14, -2);
        ctx.lineTo(12, 2);
        ctx.lineTo(6, 1);
        ctx.closePath();
        ctx.fill();

        // 猩紅瞳孔
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(8, -2.5, 3.5, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(9, -2, 1, 1);
        return true;
      }

      default:
        return false;
    }
  }

  // ─── 3. 特殊軀幹渲染 (Special Torso) ───
  drawTorso(ctx, torso, skin, t) {
    if (!this.isSpecial(skin)) return false;
    const id = skin.id;

    ctx.save();
    ctx.translate(torso.x, torso.y);
    ctx.rotate(torso.angle);

    switch (id) {
      // ══════════════════════════════════════════════════
      // 1. 鋼鐵人・馬克85 (Iron Man Mark 85)
      // ══════════════════════════════════════════════════
      case 'skin_iron_man': {
        // (A) 金紅相間納米胸甲 (Mark 85 Nanotech Armor)
        ctx.fillStyle = '#b91c1c';
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, -23);
        ctx.lineTo(16, -23);
        ctx.lineTo(12, 16);
        ctx.lineTo(-12, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 鎖骨與肩窩金色納米嵌板
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(-14, -21);
        ctx.lineTo(-6, -21);
        ctx.lineTo(-9, -13);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(14, -21);
        ctx.lineTo(6, -21);
        ctx.lineTo(9, -13);
        ctx.closePath();
        ctx.fill();

        // 腹部金紅分層肋條裝甲
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-7, 4, 14, 3);
        ctx.fillRect(-6, 9, 12, 3);

        // 深金紅腰帶與骨盆
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(-11, 16, 22, 12);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-4, 18, 8, 8); // 金色皮帶扣

        // (B) 標誌性高能弧形方舟反應爐 (Arc Reactor Core)
        const pulse = 1 + Math.sin(t * 0.2) * 0.18;
        ctx.save();
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15 * pulse;

        // 銀白外框環 (倒梯形幾何)
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(-6, -11);
        ctx.lineTo(6, -11);
        ctx.lineTo(4, -2);
        ctx.lineTo(-4, -2);
        ctx.closePath();
        ctx.fill();

        // 蔚藍光學聚能環
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, -6.5, 4.5 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // 極限高溫純白核心
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -6.5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }

      // ══════════════════════════════════════════════════
      // 2. 蜘蛛人・經典紅藍 (Spider-Man Classic Suit)
      // ══════════════════════════════════════════════════
      case 'skin_spiderman': {
        // (A) 軀幹側面經典海軍藍拼接 (Blue Side Panels)
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.moveTo(-16, -23);
        ctx.lineTo(16, -23);
        ctx.lineTo(12, 16);
        ctx.lineTo(-12, 16);
        ctx.closePath();
        ctx.fill();

        // (B) 軀幹中央鮮紅戰衣板塊 (Center Crimson Vest)
        ctx.fillStyle = '#dc2626';
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-9, -23);
        ctx.lineTo(9, -23);
        ctx.lineTo(7, 16);
        ctx.lineTo(-7, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (C) 胸前黑色精緻蜘蛛圖騰 (Iconic Black Spider Emblem)
        ctx.fillStyle = '#0f172a';
        // 蜘蛛腹部與胸部
        ctx.beginPath();
        ctx.ellipse(0, -7, 2.5, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // 8 條向外延伸的經典黑蛛腿
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.2;
        // 4 條上蛛腿
        ctx.beginPath();
        ctx.moveTo(0, -9);
        ctx.lineTo(7, -15);
        ctx.lineTo(10, -10);
        ctx.moveTo(0, -9);
        ctx.lineTo(-7, -15);
        ctx.lineTo(-10, -10);
        ctx.moveTo(0, -8);
        ctx.lineTo(8, -12);
        ctx.lineTo(11, -8);
        ctx.moveTo(0, -8);
        ctx.lineTo(-8, -12);
        ctx.lineTo(-11, -8);
        // 4 條下蛛腿
        ctx.moveTo(0, -5);
        ctx.lineTo(6, -2);
        ctx.lineTo(8, 5);
        ctx.moveTo(0, -5);
        ctx.lineTo(-6, -2);
        ctx.lineTo(-8, 5);
        ctx.moveTo(0, -6);
        ctx.lineTo(5, 0);
        ctx.lineTo(6, 7);
        ctx.moveTo(0, -6);
        ctx.lineTo(-5, 0);
        ctx.lineTo(-6, 7);
        ctx.stroke();

        // 經典紅色網紋腰帶 (Red Webbed Belt)
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-11, 16, 22, 10);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-11, 16, 22, 10);
        ctx.fillStyle = '#1d4ed8'; // 藍色短褲骨盆
        ctx.fillRect(-11, 22, 22, 6);
        break;
      }

      // ══════════════════════════════════════════════════
      // 3. 美國隊長・羅傑斯 (Captain America Steve Rogers)
      // ══════════════════════════════════════════════════
      case 'skin_captain_america': {
        // (A) 海軍藍戰術戰鬥服 (Navy Blue Tunic)
        ctx.fillStyle = '#1e3a8a';
        ctx.strokeStyle = '#172554';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, -23);
        ctx.lineTo(16, -23);
        ctx.lineTo(12, 16);
        ctx.lineTo(-12, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (B) 胸前標誌性純白大五角星 (Bold 5-Pointed White Star)
        this._drawStar(ctx, 0, -10, 5, 7.5, 3.2, '#ffffff', '#cbd5e1', 0.8);

        // (C) 腹部經典紅白相間戰術直條紋 (Red & White Vertical Stripes)
        const numStripes = 5;
        const stripeW = 3.6;
        const startX = -((numStripes * stripeW) / 2);
        for (let i = 0; i < numStripes; i++) {
          ctx.fillStyle = i % 2 === 0 ? '#dc2626' : '#ffffff';
          ctx.fillRect(startX + i * stripeW, -1, stripeW, 17);
        }

        // 棕色皮革戰術腰帶與口袋 (Brown Utility Belt with Pouches)
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-12, 16, 24, 10);
        // 金屬皮帶扣
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-3, 18, 6, 6);
        // 兩側彈藥包
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-10, 18, 4, 6);
        ctx.fillRect(6, 18, 4, 6);

        // (D) 背後背負的正宗汎合金圓盾！ (Authentic Vibranium Shield on Back)
        const shieldX = -13;
        const shieldY = -6;
        // 1. 最外層紅環
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(shieldX, shieldY, 13, 0, Math.PI * 2);
        ctx.fill();
        // 2. 次外層白環
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(shieldX, shieldY, 10, 0, Math.PI * 2);
        ctx.fill();
        // 3. 次內層紅環
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(shieldX, shieldY, 7.2, 0, Math.PI * 2);
        ctx.fill();
        // 4. 中央藍圓
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.arc(shieldX, shieldY, 4.5, 0, Math.PI * 2);
        ctx.fill();
        // 5. 盾心純白小五角星
        this._drawStar(ctx, shieldX, shieldY, 5, 3.8, 1.6, '#ffffff');
        break;
      }

      // ══════════════════════════════════════════════════
      // 4. 雷神索爾・奧丁之子 (Thor Odinson)
      // ══════════════════════════════════════════════════
      case 'skin_thor': {
        // (A) 背後飄逸深紅戰袍披風 (Flowing Crimson Cape)
        ctx.fillStyle = '#b91c1c';
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-14, -20);
        ctx.quadraticCurveTo(-24, 0, -22, 28);
        ctx.lineTo(-12, 28);
        ctx.quadraticCurveTo(-14, 5, -8, -18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (B) 黑色阿斯嘉戰甲胸甲 (Charcoal Cuirass)
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, -23);
        ctx.lineTo(16, -23);
        ctx.lineTo(12, 16);
        ctx.lineTo(-12, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (C) 標誌性 6 枚阿斯嘉神銀圓盤 (6 Silver Thor Discs)
        const discs = [
          { x: -7, y: -13, r: 4 },
          { x: 7, y: -13, r: 4 },
          { x: -8, y: -4, r: 4.5 },
          { x: 8, y: -4, r: 4.5 },
          { x: -6, y: 6, r: 3.8 },
          { x: 6, y: 6, r: 3.8 }
        ];

        for (const d of discs) {
          ctx.fillStyle = '#e2e8f0';
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // 銀色金屬光澤高光點
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(d.x - 1, d.y - 1, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // 金色北歐符文戰術腰帶 (Gold Norse Belt)
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-11, 16, 22, 10);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-3, 17, 6, 8);
        break;
      }

      // ══════════════════════════════════════════════════
      // 5. 薩諾斯・無限手套 (Thanos Titan Warlord)
      // ══════════════════════════════════════════════════
      case 'skin_thanos': {
        // (A) 霸氣黃金重型戰甲胸甲 (Golden Titan Warlord Cuirass)
        ctx.fillStyle = '#d97706';
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-17, -23);
        ctx.lineTo(17, -23);
        ctx.lineTo(13, 16);
        ctx.lineTo(-13, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 皇家海軍藍條紋裝甲肋骨 (Navy Blue Rib Segments)
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.moveTo(-12, -18);
        ctx.lineTo(12, -18);
        ctx.lineTo(8, -1);
        ctx.lineTo(-8, -1);
        ctx.closePath();
        ctx.fill();

        // 腹部黃金橫向重裝骨片
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-7, 3, 14, 3.5);
        ctx.fillRect(-6, 9, 12, 3.5);

        // 泰坦厚重黃金戰帶與護腰
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-12, 16, 24, 12);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-4, 17, 8, 9);
        break;
      }

      // ══════════════════════════════════════════════════
      // 5.5 鷹眼・克林特巴頓 (Hawkeye Clint Barton)
      // ══════════════════════════════════════════════════
      case 'skin_hawkeye': {
        // (A) 深黑碳纖維戰術背心 (Charcoal Tactical Vest)
        ctx.fillStyle = '#18181b';
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-16, -23);
        ctx.lineTo(16, -23);
        ctx.lineTo(12, 16);
        ctx.lineTo(-12, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (B) 標誌性經典紫色 V 字箭頭胸甲嵌板 (Iconic Purple Chevron Panel)
        ctx.fillStyle = '#7e22ce';
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-10, -22);
        ctx.lineTo(10, -22);
        ctx.lineTo(0, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#9333ea';
        ctx.beginPath();
        ctx.moveTo(-7, -22);
        ctx.lineTo(7, -22);
        ctx.lineTo(0, -10);
        ctx.closePath();
        ctx.fill();

        // (C) 斜挎箭筒皮革肩帶 (Diagonal Leather Quiver Harness)
        ctx.fillStyle = '#581c87';
        ctx.beginPath();
        ctx.moveTo(-14, -20);
        ctx.lineTo(12, 14);
        ctx.lineTo(8, 16);
        ctx.lineTo(-16, -17);
        ctx.closePath();
        ctx.fill();

        // (D) 背後背負的高科技特種箭筒 (Tactical Quiver with Trick Arrows)
        ctx.fillStyle = '#27272a';
        ctx.strokeStyle = '#581c87';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-18, -26, 8, 28, 2);
        ctx.fill();
        ctx.stroke();

        // 露出的 4 支紫色羽毛特種箭 (4 Trick Arrows with Purple Fletching)
        const arrowColors = ['#a855f7', '#c084fc', '#38bdf8', '#ef4444'];
        for (let i = 0; i < 4; i++) {
          const ax = -17 + i * 2;
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ax, -26);
          ctx.lineTo(ax - 2, -34);
          ctx.stroke();

          // 箭羽
          ctx.fillStyle = arrowColors[i];
          ctx.fillRect(ax - 3.5, -34, 3, 4);
        }

        // 戰術多功能腰帶 (Utility Belt)
        ctx.fillStyle = '#27272a';
        ctx.fillRect(-12, 16, 24, 10);
        ctx.fillStyle = '#9333ea';
        ctx.fillRect(-3, 18, 6, 6); // 紫色金屬扣
        ctx.fillStyle = '#18181b';
        ctx.fillRect(-10, 18, 4, 6);
        ctx.fillRect(6, 18, 4, 6);
        break;
      }

      // ══════════════════════════════════════════════════
      // 6. 孫悟空・超級賽亞人 (Son Goku SSJ)
      // ══════════════════════════════════════════════════
      case 'skin_goku_ssj': {
        // (A) 經典龜仙流橙色武道服 (Orange Turtle Hermit Dogi)
        ctx.fillStyle = '#f97316';
        ctx.strokeStyle = '#c2410c';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-16, -23);
        ctx.lineTo(16, -23);
        ctx.lineTo(12, 16);
        ctx.lineTo(-12, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (B) 領口露出的深藍色內搭汗衫 (Dark Blue Undershirt V-Neck)
        ctx.fillStyle = '#1e40af';
        ctx.beginPath();
        ctx.moveTo(-8, -23);
        ctx.lineTo(8, -23);
        ctx.lineTo(0, -9);
        ctx.closePath();
        ctx.fill();

        // 露出的賽亞人胸肌膚色 (Toned Chest Muscle)
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.moveTo(-4, -23);
        ctx.lineTo(4, -23);
        ctx.lineTo(0, -15);
        ctx.closePath();
        ctx.fill();

        // (C) 胸前標誌性「悟」字武道徽章 (Signature "Go" Kanji Emblem)
        const badgeX = 5;
        const badgeY = -5;
        // 白色圓底徽章
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 徽章內黑色「悟」字書法微筆畫 (Kanji "Go")
        ctx.fillStyle = '#000000';
        ctx.fillRect(badgeX - 3, badgeY - 3, 2, 6); // 左側「忄」旁
        ctx.fillRect(badgeX, badgeY - 3.5, 3.5, 1.2); // 「五」頂橫
        ctx.fillRect(badgeX + 1, badgeY - 2.5, 1.2, 3); // 豎筆
        ctx.fillRect(badgeX - 1, badgeY + 1.5, 4.5, 1.2); // 「口」頂
        ctx.strokeRect(badgeX - 0.5, badgeY + 1.5, 3.5, 2.5); // 「口」

        // (D) 深深藍色武道打結腰帶 (Navy Martial Arts Sash Belt)
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(-11, 15, 22, 9);
        // 腰帶側邊飄落繫繩結 (Fluttering Belt Ties)
        ctx.beginPath();
        ctx.moveTo(-9, 19);
        ctx.lineTo(-14, 28);
        ctx.lineTo(-10, 29);
        ctx.lineTo(-6, 20);
        ctx.closePath();
        ctx.fill();
        break;
      }

      // ══════════════════════════════════════════════════
      // 7. 貝吉塔・賽亞人王子 (Vegeta SSJ)
      // ══════════════════════════════════════════════════
      case 'skin_vegeta_ssj': {
        // (A) 深皇家藍連身戰鬥緊身衣 (Dark Royal Blue Compression Bodysuit)
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(-12, 16, 24, 12);

        // (B) 經典賽亞人白黃背心胸甲 (Saiyan Ribbed Battle Armor)
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-16, -23);
        ctx.lineTo(16, -23);
        ctx.lineTo(12, 16);
        ctx.lineTo(-12, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 金黃色厚重肩甲束帶 (Gold Shoulder Straps)
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.2;
        ctx.fillRect(-15, -23, 7, 10);
        ctx.fillRect(8, -23, 7, 10);

        // 腹部金黃色橫條紋分段護甲 (Segmented Yellow Abdominal Plates)
        for (let i = 0; i < 3; i++) {
          const sy = -1 + i * 5.5;
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(-6, sy, 12, 4.2);
          ctx.strokeStyle = '#d97706';
          ctx.strokeRect(-6, sy, 12, 4.2);
        }
        break;
      }

      // ══════════════════════════════════════════════════
      // 8. 未來特南克斯 (Future Trunks)
      // ══════════════════════════════════════════════════
      case 'skin_trunks_future': {
        // (A) 膠囊公司經典短版靛藍牛仔夾克 (Capsule Corp Cropped Jacket)
        ctx.fillStyle = '#4338ca';
        ctx.strokeStyle = '#312e81';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, -23);
        ctx.lineTo(16, -23);
        ctx.lineTo(12, 4); // 短版夾克長度僅至胸下肋骨
        ctx.lineTo(-12, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 翻起的高立領 (Standing Collar)
        ctx.fillStyle = '#3730a3';
        ctx.fillRect(-14, -24, 28, 5);

        // 夾克內搭黑色無袖汗衫 (Black Undershirt)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-10, 4, 20, 14);

        // 白色皮帶與骨盆
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-10, 16, 20, 5);
        ctx.fillStyle = '#334155'; // 深灰軍裝長褲骨盆
        ctx.fillRect(-11, 20, 22, 8);

        // (B) 勇者之劍背帶與背後劍鞘！ (Broadsword Harness & Back Scabbard)
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(10, -22);
        ctx.lineTo(-10, 14);
        ctx.stroke();

        // 背後露出的劍柄與橘紅劍鞘
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(-17, -24, 5, 20); // 橘紅劍鞘
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-19, -30, 9, 3); // 銀色十字護手
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-16, -37, 3, 7); // 藍色纏繩劍柄
        break;
      }

      // ══════════════════════════════════════════════════
      // 9. 比克大魔王 (Piccolo)
      // ══════════════════════════════════════════════════
      case 'skin_piccolo': {
        // (A) 經典深紫色那美克星道服 (Purple Dogi)
        ctx.fillStyle = '#6b21a8';
        ctx.strokeStyle = '#581c87';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, -23);
        ctx.lineTo(16, -23);
        ctx.lineTo(12, 16);
        ctx.lineTo(-12, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (B) 天藍色寬版武道腰帶 (Sky Blue Waist Sash)
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-11, 14, 22, 10);

        // (C) 標誌性寬大厚重純白尖肩長披風！ (Iconic Wide White Shoulder Cape)
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.6;

        ctx.beginPath();
        ctx.moveTo(-22, -20); // 突出左肩
        ctx.lineTo(-10, -25);
        ctx.lineTo(0, -18);
        ctx.lineTo(10, -25);
        ctx.lineTo(22, -20); // 突出右肩
        ctx.lineTo(16, -11);
        ctx.lineTo(-16, -11);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      // ══════════════════════════════════════════════════
      // 10. 黃金弗利沙 (Golden Frieza)
      // ══════════════════════════════════════════════════
      case 'skin_golden_frieza': {
        // (A) 高貴真金金屬生物裝甲胸甲 (Metallic Golden Bio-Armor)
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-16, -23);
        ctx.lineTo(16, -23);
        ctx.lineTo(12, 16);
        ctx.lineTo(-12, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 腹部深紫深淵生物肌肉 (Violet Muscle Plate)
        ctx.fillStyle = '#4c1d95';
        ctx.beginPath();
        ctx.moveTo(-7, 3);
        ctx.lineTo(7, 3);
        ctx.lineTo(5, 16);
        ctx.lineTo(-5, 16);
        ctx.closePath();
        ctx.fill();

        // (B) 胸前標誌性深紫橢圓水晶核心 (Chest Purple Bio-Crystal)
        ctx.save();
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#9333ea';
        ctx.beginPath();
        ctx.ellipse(0, -7, 5, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // 水晶反光
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-1.5, -8.5, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 真金骨盆生物板塊
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-10, 16, 20, 12);
        break;
      }

      default:
        ctx.restore();
        return false;
    }

    ctx.restore();
    return true;
  }

  // ─── 4. 特殊手臂渲染 (Special Arm) ───
  drawArm(ctx, arm, skin, layer) {
    if (!this.isSpecial(skin)) return false;
    const id = skin.id;
    const isBack = layer === 'backArm';

    ctx.save();
    ctx.translate(arm.shoulderX, arm.shoulderY);
    ctx.rotate(arm.upperAngle);

    switch (id) {
      // ══════════════════════════════════════════════════
      // 1. 鋼鐵人・馬克85 (Iron Man Mark 85)
      // ══════════════════════════════════════════════════
      case 'skin_iron_man': {
        // 上臂：深紅納米板甲與金嵌條
        ctx.fillStyle = isBack ? '#7f1d1d' : '#b91c1c';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(-4, 0, 8, 22, 3);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-2, 4, 4, 12);

        // 前臂與掌心等離子脈衝砲 (Palm Repulsor Gauntlet)
        ctx.translate(0, 20);
        ctx.rotate(arm.foreAngle);

        ctx.fillStyle = isBack ? '#991b1b' : '#b91c1c';
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 22, 4);
        ctx.fill();
        ctx.stroke();

        // 手腕金色關節護套
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-4, 8, 8, 4);

        // 掌心脈衝發射口 (Glowing Cyan Palm Repulsor)
        ctx.save();
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, 17, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 17, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }

      // ══════════════════════════════════════════════════
      // 2. 蜘蛛人・經典紅藍 (Spider-Man Classic Suit)
      // ══════════════════════════════════════════════════
      case 'skin_spiderman': {
        // 上臂：海軍藍戰衣
        ctx.fillStyle = isBack ? '#1d4ed8' : '#2563eb';
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-4, 0, 8, 22, 3);
        ctx.fill();
        ctx.stroke();

        // 前臂：經典鮮紅蛛網手套 (Red Webbed Gloves)
        ctx.translate(0, 20);
        ctx.rotate(arm.foreAngle);

        ctx.fillStyle = isBack ? '#991b1b' : '#dc2626';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 22, 4);
        ctx.fill();
        ctx.stroke();

        // 手套上的黑色細緻蛛網刻線
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 22);
        ctx.moveTo(-5, 10);
        ctx.lineTo(5, 10);
        ctx.moveTo(-5, 16);
        ctx.lineTo(5, 16);
        ctx.stroke();

        // 手腕內側銀色蛛絲發射口 (Silver Web-Shooter)
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-2, 14, 4, 2);
        break;
      }

      // ══════════════════════════════════════════════════
      // 3. 美國隊長・羅傑斯 (Captain America Steve Rogers)
      // ══════════════════════════════════════════════════
      case 'skin_captain_america': {
        // 上臂：深海軍藍戰術長袖
        ctx.fillStyle = isBack ? '#172554' : '#1e3a8a';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(-4, 0, 8, 22, 3);
        ctx.fill();
        ctx.stroke();

        // 前臂：經典暗紅加厚戰術格鬥手套 (Red Combat Gauntlets)
        ctx.translate(0, 20);
        ctx.rotate(arm.foreAngle);

        ctx.fillStyle = isBack ? '#7f1d1d' : '#b91c1c';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 22, 4);
        ctx.fill();
        ctx.stroke();

        // 棕色皮帶扣環
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-5, 10, 10, 3.5);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-1.5, 10.5, 3, 2.5);

        // 汎合金圓盾 (Vibranium Shield in Hand / on Forearm)
        if (!isBack && (arm.holdingWeapon === 'shield' || arm.holdingWeapon === undefined)) {
          ctx.save();
          ctx.translate(0, 12);
          // 1. 最外層紅環
          ctx.fillStyle = '#dc2626';
          ctx.strokeStyle = '#991b1b';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(0, 0, 17, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // 2. 第二層白銀環
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(0, 0, 13.5, 0, Math.PI * 2);
          ctx.fill();

          // 3. 第三層紅環
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(0, 0, 9.8, 0, Math.PI * 2);
          ctx.fill();

          // 4. 核心深藍圓盤
          ctx.fillStyle = '#1e3a8a';
          ctx.beginPath();
          ctx.arc(0, 0, 6.2, 0, Math.PI * 2);
          ctx.fill();

          // 5. 核心純白五角星
          this._drawStar(ctx, 0, 0, 5, 5.5, 2.4, '#ffffff', '#cbd5e1', 0.6);
          ctx.restore();
        }
        break;
      }

      // ══════════════════════════════════════════════════
      // 4. 雷神索爾・奧丁之子 (Thor Odinson)
      // ══════════════════════════════════════════════════
      case 'skin_thor': {
        // 上臂：強壯肌肉二頭肌
        ctx.fillStyle = isBack ? '#fed7aa' : '#ffedd5';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(-4.5, 0, 9, 22, 4);
        ctx.fill();
        ctx.stroke();

        // 前臂：阿斯嘉神銀金屬護腕 (Silver Bracers)
        ctx.translate(0, 20);
        ctx.rotate(arm.foreAngle);

        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 22, 4);
        ctx.fill();
        ctx.stroke();

        // 護腕金色鑲邊與指關節雷電火花
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-5, 6, 10, 3);
        ctx.fillRect(-5, 14, 10, 2);

        // 拳頭聚集的劈啪藍色雷芒
        ctx.save();
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 19, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 標誌性雷神之鎚 (Mjolnir in Front Hand)
        if (!isBack || arm.holdingWeapon === 'hammer') {
          ctx.save();
          ctx.translate(0, 19);
          // 鎚柄 (Leather-wrapped handle)
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-2, -3, 4, 18);
          // 柄首鋼箍 (Steel pommel)
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(-3, 14, 6, 3);
          // 皮製手腕帶
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(0, 17, 3, 0, Math.PI);
          ctx.stroke();

          // 鎚頭 (Silver Mjolnir Head)
          ctx.fillStyle = '#e2e8f0';
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.roundRect(-10, -14, 20, 12, 2.5);
          ctx.fill();
          ctx.stroke();

          // 鎚面斜角 (Beveled Inset)
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(-8, -12, 16, 8);

          // 阿斯嘉如尼符文與雷電火花 (Runic engravings & lightning arcs)
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-5, -8);
          ctx.lineTo(0, -11);
          ctx.lineTo(5, -8);
          ctx.stroke();

          // 縈繞電弧
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.strokeStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(-11, -9);
          ctx.lineTo(-14, -12);
          ctx.lineTo(-12, -15);
          ctx.moveTo(11, -9);
          ctx.lineTo(15, -7);
          ctx.stroke();
          ctx.restore();
        }
        break;
      }

      // ══════════════════════════════════════════════════
      // 5. 薩諾斯・無限手套 (Thanos Infinity Gauntlet)
      // ══════════════════════════════════════════════════
      case 'skin_thanos': {
        const isGauntlet = !isBack;

        // 上臂：紫色泰坦手臂與金色護臂
        ctx.fillStyle = isBack ? '#6d28d9' : '#8b5cf6';
        ctx.strokeStyle = '#4c1d95';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 22, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-3, 6, 6, 12);

        // 前臂：無限手套本體！ (Golden Infinity Gauntlet)
        ctx.translate(0, 20);
        ctx.rotate(arm.foreAngle);

        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-6, 0, 12, 23, 4);
        ctx.fill();
        ctx.stroke();

        if (isGauntlet) {
          // ══════════════════════════════════════════════════
          // 鑲嵌 6 顆正宗全能無限寶石 (All 6 Infinity Stones)
          // ══════════════════════════════════════════════════
          ctx.save();

          // 1. 手背正中：黃色【心靈寶石】(Mind Stone)
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.ellipse(0, 13, 3, 4.2, 0, 0, Math.PI * 2);
          ctx.fill();

          // 2. 食指：紫色【力量寶石】(Power Stone)
          ctx.shadowColor = '#a855f7';
          ctx.fillStyle = '#c084fc';
          ctx.beginPath();
          ctx.arc(3.5, 20, 1.8, 0, Math.PI * 2);
          ctx.fill();

          // 3. 中指：藍色【空間寶石】(Space Stone)
          ctx.shadowColor = '#3b82f6';
          ctx.fillStyle = '#60a5fa';
          ctx.beginPath();
          ctx.arc(1.2, 21, 1.8, 0, Math.PI * 2);
          ctx.fill();

          // 4. 無名指：紅色【現實寶石】(Reality Stone)
          ctx.shadowColor = '#ef4444';
          ctx.fillStyle = '#f87171';
          ctx.beginPath();
          ctx.arc(-1.2, 21, 1.8, 0, Math.PI * 2);
          ctx.fill();

          // 5. 小指：橙色【靈魂寶石】(Soul Stone)
          ctx.shadowColor = '#f97316';
          ctx.fillStyle = '#fb923c';
          ctx.beginPath();
          ctx.arc(-3.5, 20, 1.8, 0, Math.PI * 2);
          ctx.fill();

          // 6. 拇指關節：綠色【時間寶石】(Time Stone)
          ctx.shadowColor = '#22c55e';
          ctx.fillStyle = '#4ade80';
          ctx.beginPath();
          ctx.arc(4.2, 14, 1.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
        break;
      }

      // ══════════════════════════════════════════════════
      // 5.5 鷹眼・克林特巴頓 (Hawkeye Clint Barton)
      // ══════════════════════════════════════════════════
      case 'skin_hawkeye': {
        // 上臂：無袖戰術深灰紫配色與肌肉線條
        ctx.fillStyle = isBack ? '#18181b' : '#27272a';
        ctx.strokeStyle = '#581c87';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(-4, 0, 8, 22, 3);
        ctx.fill();
        ctx.stroke();

        // 紫色戰術肩章
        ctx.fillStyle = '#9333ea';
        ctx.fillRect(-3, 2, 6, 4);

        // 前臂：戰術射手護臂 (Archer Bracer)
        ctx.translate(0, 20);
        ctx.rotate(arm.foreAngle);

        ctx.fillStyle = isBack ? '#27272a' : '#3f3f46';
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 22, 4);
        ctx.fill();
        ctx.stroke();

        // 護臂上三道紫色箭道凹槽與加固條
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(-3, 6, 6, 2);
        ctx.fillRect(-3, 10, 6, 2);
        ctx.fillRect(-3, 14, 6, 2);

        // 手套與射手三指皮革指套
        ctx.fillStyle = '#18181b';
        ctx.fillRect(-4, 18, 8, 4);

        // ══════════════════════════════════════════════════
        // 標誌性高科技戰術複合弓 (Tactical Compound Bow)
        // ══════════════════════════════════════════════════
        if (!isBack || arm.holdingWeapon === 'bow') {
          ctx.save();
          ctx.translate(0, 18);
          // 弓身握把
          ctx.fillStyle = '#18181b';
          ctx.strokeStyle = '#7e22ce';
          ctx.lineWidth = 2.2;

          // 1. 上弓臂 (Upper Limb)
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(8, -14, 4, -28);
          ctx.stroke();

          // 2. 下弓臂 (Lower Limb)
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(8, 14, 4, 28);
          ctx.stroke();

          // 3. 雙滑輪偏心輪 (Compound Cams)
          ctx.fillStyle = '#c084fc';
          ctx.beginPath();
          ctx.arc(4, -28, 3.5, 0, Math.PI * 2);
          ctx.arc(4, 28, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // 4. 戰術高張力弓弦 (Bowstring)
          ctx.strokeStyle = '#f5d0fe';
          ctx.lineWidth = 1;
          ctx.beginPath();
          if (arm.drawingArrow) {
            // 被拉滿的弓弦，頂點向後延伸
            ctx.moveTo(4, -28);
            ctx.lineTo(-14, 0);
            ctx.lineTo(4, 28);
          } else {
            ctx.moveTo(4, -28);
            ctx.lineTo(-2, 0);
            ctx.lineTo(4, 28);
          }
          ctx.stroke();

          // 5. 若正在射擊或拉弦：搭在箭台上的紫色能量穿甲箭！
          if (arm.holdingWeapon === 'bow' || arm.drawingArrow) {
            ctx.strokeStyle = '#e9d5ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-16, 0);
            ctx.lineTo(24, 0);
            ctx.stroke();

            // 箭鏃 (High-Tech Arrowhead)
            ctx.fillStyle = '#9333ea';
            ctx.beginPath();
            ctx.moveTo(24, -3);
            ctx.lineTo(30, 0);
            ctx.lineTo(24, 3);
            ctx.closePath();
            ctx.fill();

            // 箭羽 (Fletching)
            ctx.fillStyle = '#c084fc';
            ctx.fillRect(-16, -2.5, 5, 1.2);
            ctx.fillRect(-16, 1.3, 5, 1.2);
          }

          ctx.restore();
        }
        break;
      }

      // ══════════════════════════════════════════════════
      // 6. 孫悟空・超級賽亞人 (Son Goku SSJ)
      // ══════════════════════════════════════════════════
      case 'skin_goku_ssj': {
        // 上臂：強悍賽亞人二頭肌膚色
        ctx.fillStyle = isBack ? '#fed7aa' : '#ffedd5';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(-4.5, 0, 9, 22, 4);
        ctx.fill();
        ctx.stroke();

        // 前臂：粗黑藍色武道護腕 (Navy Blue Wristbands)
        ctx.translate(0, 20);
        ctx.rotate(arm.foreAngle);

        // 前臂肌肉
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.roundRect(-4.5, 0, 9, 10, 3);
        ctx.fill();

        // 寬大深藍色護腕 (Iconic Dark Blue Wristband)
        ctx.fillStyle = '#1e40af';
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(-5, 9, 10, 11, 2);
        ctx.fill();
        ctx.stroke();

        // 握緊的膚色拳頭
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(0, 20, 3.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // ══════════════════════════════════════════════════
      // 7. 貝吉塔・賽亞人王子 (Vegeta SSJ)
      // ══════════════════════════════════════════════════
      case 'skin_vegeta_ssj': {
        // 上臂：深皇家藍緊身長袖
        ctx.fillStyle = isBack ? '#172554' : '#1e3a8a';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-4, 0, 8, 22, 3);
        ctx.fill();
        ctx.stroke();

        // 前臂：正宗賽亞人純白喇叭格鬥手套 (Flared White Saiyan Gloves)
        ctx.translate(0, 20);
        ctx.rotate(arm.foreAngle);

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.8;

        // 標誌性肘部喇叭外擴開口
        ctx.beginPath();
        ctx.moveTo(-6, 2);
        ctx.lineTo(6, 2);
        ctx.lineTo(5, 22);
        ctx.lineTo(-5, 22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 手套手腕處的賽亞人環形條紋
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-5, 9);
        ctx.lineTo(5, 9);
        ctx.moveTo(-5, 14);
        ctx.lineTo(5, 14);
        ctx.stroke();
        break;
      }

      // ══════════════════════════════════════════════════
      // 8. 未來特南克斯 (Future Trunks)
      // ══════════════════════════════════════════════════
      case 'skin_trunks_future': {
        // 上臂：靛藍夾克長袖
        ctx.fillStyle = isBack ? '#312e81' : '#4338ca';
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(-4, 0, 8, 22, 3);
        ctx.fill();
        ctx.stroke();

        // 夾克袖口膠囊公司圓形臂章
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(0, 8, 3, 0, Math.PI * 2);
        ctx.fill();

        // 前臂：挽起袖子的手臂與黑色半指手套
        ctx.translate(0, 20);
        ctx.rotate(arm.foreAngle);

        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.roundRect(-4, 0, 8, 12, 3);
        ctx.fill();

        // 黑色戰術格鬥手套
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(-5, 10, 10, 12, 3);
        ctx.fill();

        // 標誌性勇者之劍 (Brave Sword / Tapion Sword in Front Hand)
        if (!isBack || arm.holdingWeapon === 'sword') {
          ctx.save();
          ctx.translate(0, 18);
          // 劍柄 (Blue wrapped hilt)
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(-2, -2, 4, 15);
          // 金色圓形劍首 (Golden Pommel)
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(0, 14, 3, 0, Math.PI * 2);
          ctx.fill();

          // 金色寬幅護手 (Golden Crossguard)
          ctx.fillStyle = '#f59e0b';
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.roundRect(-9, -4, 18, 5, 2);
          ctx.fill();
          ctx.stroke();

          // 雙刃銀白鋒芒劍身 (Double-edged Silver Blade)
          ctx.fillStyle = '#f8fafc';
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(-4, -4);
          ctx.lineTo(-3, -38);
          ctx.lineTo(0, -44); // 銳利劍尖
          ctx.lineTo(3, -38);
          ctx.lineTo(4, -4);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 劍身中央血槽 (Fuller Ridge)
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, -4);
          ctx.lineTo(0, -36);
          ctx.stroke();

          // 劍刃流轉的次元劍氣白芒
          ctx.shadowColor = '#60a5fa';
          ctx.shadowBlur = 8;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-3, -30);
          ctx.lineTo(0, -44);
          ctx.lineTo(3, -30);
          ctx.stroke();
          ctx.restore();
        }
        break;
      }

      // ══════════════════════════════════════════════════
      // 9. 比克大魔王 (Piccolo)
      // ══════════════════════════════════════════════════
      case 'skin_piccolo': {
        // 上臂：那美克星翠綠手臂
        ctx.fillStyle = isBack ? '#16a34a' : '#22c55e';
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(-4.5, 0, 9, 22, 4);
        ctx.fill();
        ctx.stroke();

        // 二頭肌粉紅肌肉分段紋理 (Pink Muscle Patch)
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.ellipse(0, 11, 2.8, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // 前臂：翠綠前臂與前臂粉紅肌肉塊
        ctx.translate(0, 20);
        ctx.rotate(arm.foreAngle);

        ctx.fillStyle = isBack ? '#16a34a' : '#22c55e';
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 22, 4);
        ctx.fill();
        ctx.stroke();

        // 前臂粉紅肌肉斑塊
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.ellipse(0, 10, 3, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // ══════════════════════════════════════════════════
      // 10. 黃金弗利沙 (Golden Frieza)
      // ══════════════════════════════════════════════════
      case 'skin_golden_frieza': {
        // 上臂：真金金屬生物裝甲
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(-4.5, 0, 9, 22, 4);
        ctx.fill();
        ctx.stroke();

        // 前臂與黃金尖銳利爪 (Golden Claws)
        ctx.translate(0, 20);
        ctx.rotate(arm.foreAngle);

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 22, 4);
        ctx.fill();
        ctx.stroke();

        // 手腕深紫水晶嵌環 (Purple Wrist Crystal)
        ctx.fillStyle = '#9333ea';
        ctx.fillRect(-5, 12, 10, 3.5);

        // 弗利沙尖銳指爪
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-4, 20, 8, 4);
        break;
      }

      default:
        ctx.restore();
        return false;
    }

    ctx.restore();
    return true;
  }

  // ─── 5. 特殊腿部與戰靴渲染 (Special Limb) ───
  drawLimb(ctx, leg, skin, layer) {
    if (!this.isSpecial(skin)) return false;
    const id = skin.id;
    const isBack = layer === 'backLeg';

    ctx.save();
    ctx.translate(leg.hipX, leg.hipY);
    ctx.rotate(leg.thighAngle);

    switch (id) {
      // ══════════════════════════════════════════════════
      // 1. 鋼鐵人・馬克85 (Iron Man Mark 85)
      // ══════════════════════════════════════════════════
      case 'skin_iron_man': {
        // 大腿：深金紅裝甲與膝蓋金護片
        ctx.fillStyle = isBack ? '#7f1d1d' : '#b91c1c';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 26, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-3, 16, 6, 8); // 金色膝甲

        // 小腿與噴射戰靴 (Thruster Greaves & Boots)
        ctx.translate(0, 24);
        ctx.rotate(leg.shinAngle);

        ctx.fillStyle = isBack ? '#991b1b' : '#b91c1c';
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 28, 4);
        ctx.fill();
        ctx.stroke();

        // 金色小腿導流板
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-4, 10, 8, 12);

        // 腳掌推進器
        ctx.translate(0, 24);
        if (leg.footAngle) ctx.rotate(leg.footAngle);
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(-4, 0, 16, 7);
        ctx.fillStyle = '#38bdf8'; // 鞋底脈衝噴射藍光
        ctx.fillRect(-2, 5, 12, 2.5);
        break;
      }

      // ══════════════════════════════════════════════════
      // 2. 蜘蛛人・經典紅藍 (Spider-Man Classic Suit)
      // ══════════════════════════════════════════════════
      case 'skin_spiderman': {
        // 大腿：經典海軍藍戰衣緊身褲
        ctx.fillStyle = isBack ? '#1d4ed8' : '#2563eb';
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 26, 4);
        ctx.fill();
        ctx.stroke();

        // 小腿：經典及膝鮮紅蜘蛛戰靴 (Calf-High Red Spider Boots)
        ctx.translate(0, 24);
        ctx.rotate(leg.shinAngle);

        ctx.fillStyle = isBack ? '#1d4ed8' : '#2563eb';
        ctx.fillRect(-5, 0, 10, 10);

        ctx.fillStyle = isBack ? '#991b1b' : '#dc2626';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-5, 8, 10, 20, 3);
        ctx.fill();
        ctx.stroke();

        // 蛛網靴面紋理
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, 8);
        ctx.lineTo(0, 28);
        ctx.moveTo(-5, 16);
        ctx.lineTo(5, 16);
        ctx.stroke();

        // 腳掌紅色戰靴底
        ctx.translate(0, 24);
        if (leg.footAngle) ctx.rotate(leg.footAngle);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-4, 0, 16, 6.5);
        break;
      }

      // ══════════════════════════════════════════════════
      // 3. 美國隊長・羅傑斯 (Captain America Steve Rogers)
      // ══════════════════════════════════════════════════
      case 'skin_captain_america': {
        // 大腿：深海軍藍戰術軍褲與加強膝墊
        ctx.fillStyle = isBack ? '#172554' : '#1e3a8a';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 26, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0f172a'; // 戰術膝墊
        ctx.fillRect(-4, 18, 8, 6);

        // 小腿與正宗深紅戰術傘兵靴 (Red Combat Jump Boots)
        ctx.translate(0, 24);
        ctx.rotate(leg.shinAngle);

        ctx.fillStyle = isBack ? '#7f1d1d' : '#991b1b';
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 28, 4);
        ctx.fill();
        ctx.stroke();

        // 棕色繫帶皮扣
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-5, 8, 10, 3);
        ctx.fillRect(-5, 16, 10, 3);

        // 腳掌深紅傘兵靴
        ctx.translate(0, 24);
        if (leg.footAngle) ctx.rotate(leg.footAngle);
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(-4, 0, 16, 7);
        break;
      }

      // ══════════════════════════════════════════════════
      // 4. 雷神索爾・奧丁之子 (Thor Odinson)
      // ══════════════════════════════════════════════════
      case 'skin_thor': {
        // 大腿：深黑戰術長褲
        ctx.fillStyle = isBack ? '#0f172a' : '#1e293b';
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 26, 4);
        ctx.fill();
        ctx.stroke();

        // 小腿：阿斯嘉銀黑戰靴與金色交叉繫帶
        ctx.translate(0, 24);
        ctx.rotate(leg.shinAngle);

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 28, 4);
        ctx.fill();
        ctx.stroke();

        // 銀色膝蓋圓甲
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(0, 2, 4, 0, Math.PI * 2);
        ctx.fill();

        // 金色交叉綁帶
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-5, 10);
        ctx.lineTo(5, 18);
        ctx.moveTo(5, 10);
        ctx.lineTo(-5, 18);
        ctx.stroke();

        // 腳掌阿斯嘉黑色戰靴
        ctx.translate(0, 24);
        if (leg.footAngle) ctx.rotate(leg.footAngle);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-4, 0, 16, 6.5);
        break;
      }

      // ══════════════════════════════════════════════════
      // 5. 薩諾斯・無限手套 (Thanos Titan Warlord)
      // ══════════════════════════════════════════════════
      case 'skin_thanos': {
        // 大腿：皇家海軍藍軍褲
        ctx.fillStyle = isBack ? '#172554' : '#1e3a8a';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(-5.5, 0, 11, 26, 4);
        ctx.fill();
        ctx.stroke();

        // 小腿：厚重黃金泰坦脛甲 (Heavy Golden Titan Greaves)
        ctx.translate(0, 24);
        ctx.rotate(leg.shinAngle);

        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-6, 0, 12, 28, 4);
        ctx.fill();
        ctx.stroke();

        // 腳掌厚重黃金戰靴
        ctx.translate(0, 24);
        if (leg.footAngle) ctx.rotate(leg.footAngle);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-5, 0, 18, 8);
        break;
      }

      // ══════════════════════════════════════════════════
      // 5.5 鷹眼・克林特巴頓 (Hawkeye Clint Barton)
      // ══════════════════════════════════════════════════
      case 'skin_hawkeye': {
        // 大腿：深灰戰術工裝長褲與紫色側邊縫線
        ctx.fillStyle = isBack ? '#18181b' : '#27272a';
        ctx.strokeStyle = '#581c87';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 26, 4);
        ctx.fill();
        ctx.stroke();

        // 紫色工裝側袋
        ctx.fillStyle = '#3f3f46';
        ctx.fillRect(-4, 8, 8, 10);
        ctx.fillStyle = '#9333ea';
        ctx.fillRect(-4, 7, 8, 2);

        // 小腿：加固戰術護膝與黑色特勤戰靴 (Tactical Boots with Purple Soles)
        ctx.translate(0, 24);
        ctx.rotate(leg.shinAngle);

        ctx.fillStyle = isBack ? '#18181b' : '#27272a';
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 28, 4);
        ctx.fill();
        ctx.stroke();

        // 紫色戰術護膝
        ctx.fillStyle = '#7e22ce';
        ctx.beginPath();
        ctx.roundRect(-4, 0, 8, 8, 2);
        ctx.fill();

        // 腳掌特勤戰靴與紫色鞋底
        ctx.translate(0, 24);
        if (leg.footAngle) ctx.rotate(leg.footAngle);
        ctx.fillStyle = '#18181b';
        ctx.fillRect(-5, 0, 18, 8);
        ctx.fillStyle = '#9333ea';
        ctx.fillRect(-5, 6, 18, 3);
        break;
      }

      // ══════════════════════════════════════════════════
      // 6. 孫悟空・超級賽亞人 (Son Goku SSJ)
      // ══════════════════════════════════════════════════
      case 'skin_goku_ssj': {
        // 大腿：經典橙色寬鬆武道褲 (Baggy Orange Dogi Pants)
        ctx.fillStyle = isBack ? '#ea580c' : '#f97316';
        ctx.strokeStyle = '#c2410c';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(-5.5, 0, 11, 26, 4);
        ctx.fill();
        ctx.stroke();

        // 褲管褶皺動漫線條
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-2, 6);
        ctx.lineTo(-2, 20);
        ctx.stroke();

        // 小腿：正宗悟空武道靴 (Authentic Son Goku Boots!)
        ctx.translate(0, 24);
        ctx.rotate(leg.shinAngle);

        // 深藍色及膝靴身 (Navy Boot Body)
        ctx.fillStyle = '#1e3a8a';
        ctx.strokeStyle = '#172554';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 28, 4);
        ctx.fill();
        ctx.stroke();

        // 標誌性正中鮮紅垂直裝飾縫線 (Signature Red Center Stripe)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-1.2, 0, 2.4, 28);

        // 標誌性腳踝黃色繫繩結 (Yellow Cord Tied at Ankles)
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-5, 14, 10, 3);

        // 腳掌深藍靴底與紅包邊
        ctx.translate(0, 24);
        if (leg.footAngle) ctx.rotate(leg.footAngle);
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(-4, 0, 16, 7);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(8, 0, 4, 7); // 鞋頭紅邊
        break;
      }

      // ══════════════════════════════════════════════════
      // 7. 貝吉塔・賽亞人王子 (Vegeta SSJ)
      // ══════════════════════════════════════════════════
      case 'skin_vegeta_ssj': {
        // 大腿：深皇家藍連身戰鬥褲
        ctx.fillStyle = isBack ? '#172554' : '#1e3a8a';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 26, 4);
        ctx.fill();
        ctx.stroke();

        // 小腿：正宗賽亞人純白格鬥靴 (White Saiyan Boots)
        ctx.translate(0, 24);
        ctx.rotate(leg.shinAngle);

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 28, 4);
        ctx.fill();
        ctx.stroke();

        // 靴筒上緣金黃橫邊 (Gold Boot Trim)
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-5, 0, 10, 4);

        // 腳掌純白戰靴與標誌性金黃橫紋鞋尖！ (Gold Ribbed Toe-Caps)
        ctx.translate(0, 24);
        if (leg.footAngle) ctx.rotate(leg.footAngle);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, 0, 16, 6.5);
        // 金黃鞋尖
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(5, 0, 7, 6.5);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1;
        ctx.strokeRect(5, 0, 7, 6.5);
        break;
      }

      // ══════════════════════════════════════════════════
      // 8. 未來特南克斯 (Future Trunks)
      // ══════════════════════════════════════════════════
      case 'skin_trunks_future': {
        // 大腿：寬鬆深鐵灰特勤長褲
        ctx.fillStyle = isBack ? '#1e293b' : '#334155';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(-5.5, 0, 11, 26, 4);
        ctx.fill();
        ctx.stroke();

        // 小腿與正宗膠囊公司芥末黃軍靴 (Iconic Golden-Yellow Boots)
        ctx.translate(0, 24);
        ctx.rotate(leg.shinAngle);

        ctx.fillStyle = '#eab308'; // 標誌性芥末黃
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 28, 4);
        ctx.fill();
        ctx.stroke();

        // 白色鞋帶交錯紋路
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-3, 8);
        ctx.lineTo(3, 8);
        ctx.moveTo(-3, 14);
        ctx.lineTo(3, 14);
        ctx.moveTo(-3, 20);
        ctx.lineTo(3, 20);
        ctx.stroke();

        // 腳掌芥末黃戰靴與黑色厚鞋底
        ctx.translate(0, 24);
        if (leg.footAngle) ctx.rotate(leg.footAngle);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-4, 0, 16, 5);
        ctx.fillStyle = '#0f172a'; // 黑色厚底
        ctx.fillRect(-4, 5, 16, 2.5);
        break;
      }

      // ══════════════════════════════════════════════════
      // 9. 比克大魔王 (Piccolo)
      // ══════════════════════════════════════════════════
      case 'skin_piccolo': {
        // 大腿：深紫色那美克星燈籠褲
        ctx.fillStyle = isBack ? '#581c87' : '#6b21a8';
        ctx.strokeStyle = '#3b0764';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(-6, 0, 12, 26, 5);
        ctx.fill();
        ctx.stroke();

        // 小腿：深紫褲管收束
        ctx.translate(0, 24);
        ctx.rotate(leg.shinAngle);

        ctx.fillStyle = isBack ? '#581c87' : '#6b21a8';
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 28, 4);
        ctx.fill();
        ctx.stroke();

        // 腳掌那美克星尖頭功夫鞋 (Curled Pointed Shoes)
        ctx.translate(0, 24);
        if (leg.footAngle) ctx.rotate(leg.footAngle);
        ctx.fillStyle = '#d97706'; // 經典黃褐色
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(12, 0);
        ctx.quadraticCurveTo(18, -3, 16, 5); // 尖端微上翹
        ctx.lineTo(-4, 6);
        ctx.closePath();
        ctx.fill();
        break;
      }

      // ══════════════════════════════════════════════════
      // 10. 黃金弗利沙 (Golden Frieza)
      // ══════════════════════════════════════════════════
      case 'skin_golden_frieza': {
        // 大腿：金屬真金生物大腿
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 26, 4);
        ctx.fill();
        ctx.stroke();

        // 小腿：黃金小腿與腳踝紫色水晶
        ctx.translate(0, 24);
        ctx.rotate(leg.shinAngle);

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.roundRect(-5, 0, 10, 28, 4);
        ctx.fill();
        ctx.stroke();

        // 腳踝深紫晶球
        ctx.fillStyle = '#9333ea';
        ctx.beginPath();
        ctx.arc(0, 20, 3, 0, Math.PI * 2);
        ctx.fill();

        // 腳掌三趾黃金生物足 (Three-Toed Golden Feet)
        ctx.translate(0, 24);
        if (leg.footAngle) ctx.rotate(leg.footAngle);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-4, 0, 16, 6.5);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(8, 0, 4, 6.5);
        break;
      }

      default:
        ctx.restore();
        return false;
    }

    ctx.restore();
    return true;
  }

  // ─── 6. 特殊防禦幾何力場 (Special Guard Shield) ───
  drawGuardShield(ctx, stance, skin, t) {
    if (!this.isSpecial(skin)) return false;
    const id = skin.id;

    ctx.save();
    const shieldY = stance === 'low' ? -35 : -74;
    const pulse = Math.sin(t * 0.2) * 0.12 + 0.92;

    switch (id) {
      // 美國隊長：擴散汎合金能量光盾 (Vibranium Star Shield)
      case 'skin_captain_america': {
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 20;
        const cx = 35;
        const cy = shieldY;
        const r = 38 * pulse;

        // 外紅環
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // 白環
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
        ctx.stroke();

        // 內紅環
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        // 藍心與白星
        ctx.fillStyle = 'rgba(30, 58, 138, 0.6)';
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
        ctx.fill();

        this._drawStar(ctx, cx, cy, 5, r * 0.35, r * 0.15, '#ffffff');
        ctx.restore();
        return true;
      }

      // 鋼鐵人：六角微晶納米力場盾 (Nanotech Hex Shield)
      case 'skin_iron_man': {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = '#38bdf8';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.lineWidth = 2.5;

        const cx = 36;
        const cy = shieldY;
        const rad = 36 * pulse;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const ang = (Math.PI / 3) * i;
          const px = cx + Math.cos(ang) * rad;
          const py = cy + Math.sin(ang) * rad;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 內部六角蜂巢細線
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, rad * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return true;
      }

      // 蜘蛛人：蛛絲防護陣 (Spider Web Shield)
      case 'skin_spiderman': {
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 14;
        const cx = 34;
        const cy = shieldY;
        this._drawSpiderWebOnHead(ctx, cx, cy, 36 * pulse, 'rgba(255, 255, 255, 0.85)');
        ctx.restore();
        return true;
      }

      // 鷹眼：複合神弓高能偏折護盾 (Tactical Bow Parrying Forcefield)
      case 'skin_hawkeye': {
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 18;
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 3;

        // 弧形高能量偏轉偏光盾
        ctx.beginPath();
        ctx.arc(28, shieldY, 34 * pulse, -Math.PI * 0.35, Math.PI * 0.35);
        ctx.stroke();

        // 交叉十字瞄準刻線
        ctx.fillStyle = '#e9d5ff';
        ctx.beginPath();
        ctx.arc(32, shieldY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }

      // 孫悟空 & 貝吉塔：超級賽亞人球形氣功防護罩 (Ki Spherical Barrier)
      case 'skin_goku_ssj':
      case 'skin_vegeta_ssj': {
        const isVegeta = id === 'skin_vegeta_ssj';
        const color = isVegeta ? '#60a5fa' : '#fde047';
        ctx.shadowColor = color;
        ctx.shadowBlur = 24;

        ctx.strokeStyle = color;
        ctx.fillStyle = isVegeta ? 'rgba(96, 165, 250, 0.25)' : 'rgba(253, 224, 71, 0.25)';
        ctx.lineWidth = 3.5;

        const cx = 34;
        const cy = shieldY;
        const r = 40 * pulse;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 護罩上的游離氣電弧
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.85, t * 0.2, t * 0.2 + Math.PI * 0.6);
        ctx.stroke();
        ctx.restore();
        return true;
      }

      // 薩諾斯：6 色無限寶石環狀結界 (Infinity Hexagonal Forcefield)
      case 'skin_thanos': {
        const cx = 36;
        const cy = shieldY;
        const r = 42 * pulse;
        const stones = ['#facc15', '#a855f7', '#3b82f6', '#ef4444', '#f97316', '#22c55e'];

        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 20;
        ctx.fillStyle = 'rgba(217, 119, 6, 0.25)';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 6 顆無限寶石環繞防禦圈旋轉
        for (let i = 0; i < 6; i++) {
          const ang = (Math.PI / 3) * i + t * 0.08;
          const sx = cx + Math.cos(ang) * (r * 0.85);
          const sy = cy + Math.sin(ang) * (r * 0.85);
          ctx.fillStyle = stones[i];
          ctx.shadowColor = stones[i];
          ctx.beginPath();
          ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }

      // 黃金弗利沙：黃金死亡防禦圓球 (Golden Death Sphere)
      case 'skin_golden_frieza': {
        const cx = 35;
        const cy = shieldY;
        const r = 38 * pulse;

        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 24;
        ctx.strokeStyle = '#ffd700';
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.lineWidth = 3.5;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 猩紅死亡光環
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return true;
      }

      default:
        ctx.restore();
        return false;
    }
  }

  // ─── 7. 特殊打擊專屬 VFX (Attack VFX) ───
  drawAttackVFX(ctx, vfx, skin) {
    if (!this.isSpecial(skin)) return false;
    const id = skin.id;
    const type = vfx.type;

    ctx.save();

    // 1. 鷹眼・克林特巴頓：高科技穿甲神箭 (Hawkeye Tactical Arrow Streak)
    if (type === 'bow_arrow' || id === 'skin_hawkeye') {
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 18;

      // 超音速穿甲碳纖箭桿
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(vfx.x - 30, vfx.y);
      ctx.lineTo(vfx.x + 8, vfx.y);
      ctx.stroke();

      // 特種箭頭爆裂光芒
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.moveTo(vfx.x + 8, vfx.y - 4);
      ctx.lineTo(vfx.x + 18, vfx.y);
      ctx.lineTo(vfx.x + 8, vfx.y + 4);
      ctx.closePath();
      ctx.fill();

      // 箭尾羽 (Purple Fletching)
      ctx.fillStyle = '#7e22ce';
      ctx.fillRect(vfx.x - 30, vfx.y - 3.2, 7, 2);
      ctx.fillRect(vfx.x - 30, vfx.y + 1.2, 7, 2);

      // 音爆氣環 (Sonic Vapor Cone)
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(vfx.x - 10, vfx.y, 9, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
      ctx.restore();
      return true;
    }

    // 2. 鋼鐵人：掌心等離子脈衝砲 (Palm Repulsor Blast)
    if (type === 'repulsor_blast' || (id === 'skin_iron_man' && type === 'punch')) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;
      // 推進等離子束 (Plasma Beam)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(vfx.x - 22, vfx.y);
      ctx.lineTo(vfx.x + 16, vfx.y);
      ctx.stroke();

      // 白光高溫光心
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(vfx.x - 20, vfx.y);
      ctx.lineTo(vfx.x + 16, vfx.y);
      ctx.stroke();

      // 前端同心擴散衝擊光環
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(vfx.x + 14, vfx.y, 11, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return true;
    }

    // 3. 蜘蛛人：蛛網爆裂衝擊 (Web Stream & Burst)
    if (type === 'web_stream' || (id === 'skin_spiderman' && type === 'punch')) {
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 14;
      // 蛛絲彈射主線
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(vfx.x - 28, vfx.y);
      ctx.lineTo(vfx.x + 10, vfx.y);
      ctx.stroke();

      // 前端爆裂蛛網陣 (Spider Web Impact)
      this._drawSpiderWebOnHead(ctx, vfx.x + 10, vfx.y, 16, '#ffffff');
      ctx.restore();
      return true;
    }

    // 4. 美國隊長：汎合金盾牌破空星芒撞擊 (Vibranium Shield Slam)
    if (type === 'shield_strike' || (id === 'skin_captain_america' && type === 'punch')) {
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 18;

      // 外層紅白衝擊弧波
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(vfx.x, vfx.y, 20, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();

      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(vfx.x - 4, vfx.y, 15, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();

      // 核心星芒衝擊
      this._drawStar(ctx, vfx.x, vfx.y, 5, 12, 4.5, '#ffffff', '#dc2626', 1.5);
      ctx.restore();
      return true;
    }

    // 5. 雷神索爾：天雷怒擊與阿斯嘉電弧 (Mjolnir Thunder Strike)
    if (type === 'thor_lightning' || (id === 'skin_thor' && type === 'punch')) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 3;

      // 狂暴折線天雷
      ctx.beginPath();
      ctx.moveTo(vfx.x - 16, vfx.y - 18);
      ctx.lineTo(vfx.x - 4, vfx.y - 4);
      ctx.lineTo(vfx.x - 10, vfx.y + 4);
      ctx.lineTo(vfx.x + 12, vfx.y + 16);
      ctx.stroke();

      // 分支電光
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(vfx.x - 4, vfx.y - 4);
      ctx.lineTo(vfx.x + 8, vfx.y - 10);
      ctx.moveTo(vfx.x - 10, vfx.y + 4);
      ctx.lineTo(vfx.x - 18, vfx.y + 12);
      ctx.stroke();
      ctx.restore();
      return true;
    }

    // 6. 薩諾斯：6 彩無限寶石毀滅巨拳 (Infinity Gauntlet Cosmic Strike)
    if (type === 'infinity_vfx' || (id === 'skin_thanos' && type === 'punch')) {
      const colors = ['#facc15', '#a855f7', '#3b82f6', '#ef4444', '#f97316', '#22c55e'];
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI / 3) * i;
        ctx.shadowColor = colors[i];
        ctx.shadowBlur = 14;
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.arc(vfx.x + Math.cos(ang) * 14, vfx.y + Math.sin(ang) * 14, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(vfx.x, vfx.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true;
    }

    // 7. 孫悟空：超級賽亞人龜派氣功聚能爆發 (Kamehameha Ki Wave)
    if (type === 'kamehameha_vfx' || (id === 'skin_goku_ssj' && type === 'punch')) {
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 22;

      // 金色氣焰衝擊波主體
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(vfx.x, vfx.y, 16, 0, Math.PI * 2);
      ctx.fill();

      // 蔚藍高能聚能核
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(vfx.x, vfx.y, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(vfx.x, vfx.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true;
    }

    // 8. 貝吉塔：賽亞人王子大霹靂閃光 (Big Bang / Final Flash Strike)
    if (type === 'final_flash_vfx' || (id === 'skin_vegeta_ssj' && type === 'punch')) {
      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = 22;

      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(vfx.x, vfx.y, 18, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(vfx.x, vfx.y, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(vfx.x, vfx.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true;
    }

    // 9. 未來特南克斯：勇者之劍次元斬光弧 (Brave Sword Slash)
    if (type === 'sword_slash_vfx' || (id === 'skin_trunks_future' && type === 'punch')) {
      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = 18;

      // 藍白破空劍弧
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(vfx.x - 10, vfx.y, 32, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(vfx.x - 10, vfx.y, 32, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.stroke();
      ctx.restore();
      return true;
    }

    // 10. 比克大魔王：那美克星魔臂伸縮突刺衝擊 (Namekian Elastic Strike)
    if (type === 'namek_arm_vfx' || (id === 'skin_piccolo' && type === 'punch')) {
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 16;

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(vfx.x - 26, vfx.y);
      ctx.lineTo(vfx.x + 10, vfx.y);
      ctx.stroke();

      // 粉紅肌肉紋理
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(vfx.x - 18, vfx.y);
      ctx.lineTo(vfx.x + 4, vfx.y);
      ctx.stroke();
      ctx.restore();
      return true;
    }

    // 11. 黃金弗利沙：帝皇猩紅死亡光線 (Death Beam Piercing Ray)
    if (type === 'death_beam_vfx' || (id === 'skin_golden_frieza' && type === 'punch')) {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 20;

      // 極細極銳利貫穿光線
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(vfx.x - 24, vfx.y);
      ctx.lineTo(vfx.x + 20, vfx.y);
      ctx.stroke();

      // 金色高溫閃芒
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(vfx.x + 18, vfx.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true;
    }

    ctx.restore();
    return false;
  }
}

export const specialSkinsRenderer = new SpecialSkinsRenderer();
