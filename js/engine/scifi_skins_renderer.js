/**
 * 《CyberStriker: Quantum Arena》
 * 15 大原創賽博科幻戰將專屬造型高精度獨立渲染引擎 (Sci-Fi Skins Custom Renderer)
 * 確保遊戲內「所有外觀皆不重複，每一款皆具備獨一無二之頭盔、髮型、身形外甲與背部飾品」！
 *
 * 15 款外觀獨立視覺特徵：
 * 1. 賽博武者 (Cyber Warrior): 日式機武兜盔 (Kabuto)、額前雙角金翼 V-fin、金屬武士胸甲、腰部青藍配刀刀鞘
 * 2. 霓虹暗影刺客 (Neon Shadow): 狐面鬼忍兜帽、雙斜向螢光粉尖眼、身後隨風飄逸之洋紅長圍巾 (Ninja Scarf)、胸前苦無背帶
 * 3. 脈衝重裝執法官 (Pulse Enforcer): 特警鎮暴頭盔、頭頂金黃警燈閃爍、厚重透明防彈面甲、警徽胸甲、黑黃斑馬防暴肩盾
 * 4. 星穹量子浪人 (Cosmic Ronin): 經典東方編織竹笠 (Ronin Kasa 浪人斗笠)、斗笠邊緣靛藍霓虹光環、飄帶頭巾、星辰浪人羽織羽衣
 * 5. 雷霆神速遊俠 (Volt Ranger): 空氣動力神速流線盔、頭頂雷電導流鰭、耳側雷電雙翼、胸前金色閃電紋章、肩部特斯拉電圈
 * 6. 深淵幽靈特工 (Abyssal Ghost): 三眼夜視儀 (Tri-Ocular NVG)、戰術雙濾罐防毒面具、深海潛行戰術背帶與背後微型氧氣瓶
 * 7. 暗黑駭客 (Dark Hacker): 賽博龐克大號連帽風衣 (Hacker Hoodie)、綠色矩陣 VR 眼鏡 (動態串流 0 與 1 二進制代碼)、風衣下擺
 * 8. 奈米生化戰警 (Nano Cyborg): 魔鬼終結者半人造骨骼、右半邊外露鈦金屬機械頭骨與血紅機械眼、外露脊椎與綠色生化毒素導管
 * 9. 赤紅暴君重機甲 (Crimson Tyrant): 惡魔重機甲雙巨角 (Curved Magma Horns)、橫向血紅威壓狹長眼、厚重尖刺巨肩、胸前熔岩排氣孔火星
 * 10. 極寒超導武姬 (Cryo Maiden): 5 晶棱極地冰晶王冠 (Ice Crown)、冰霜結晶髮辮、浮空懸浮菱形冰錐肩飾、半透明極光冰披風
 * 11. 虛空吞噬者 (Void Devourer): 無面異次元虛空面具、額前中心微型黑洞坍縮奇點、胸前事件視界吸積盤、背部暗物質陰影觸手
 * 12. 太陽女武神 (Solar Valkyrie): 奧丁神殿金翼女武神盔、雙側金色羽翼飛天飾角、胸口烈陽星辰徽飾、金邊烈紅戰袍披風
 * 13. 賽博歌姬音律 (Cyber Diva): 雙側長青藍全息雙馬尾 (Twin-tails)、立體 DJ 等化器耳機、胸前即時起伏跳動之音頻頻譜跳躍燈
 * 14. 曜白裁決聖使 (Archangel Judicator): 頭頂懸浮聖潔天使金光環 (Floating Halo)、金色十字架面甲、背部展開之六翼幾何天翔光羽
 * 15. 黃金終極機神 (Omega Emperor): 帝皇三重金冠、雄獅龍頭巨型金肩甲、頸後帝皇日冕金輪光盤、帝王鎏金披風
 */

export class SciFiSkinsRenderer {
  constructor() {
    this.sciFiSkinIds = new Set([
      'skin_cyber_warrior',
      'skin_neon_shadow',
      'skin_pulse_enforcer',
      'skin_cosmic_ronin',
      'skin_volt_ranger',
      'skin_abyssal_ghost',
      'skin_dark_hacker',
      'skin_nano_cyborg',
      'skin_crimson_tyrant',
      'skin_cryo_maiden',
      'skin_void_devourer',
      'skin_solar_valkyrie',
      'skin_cyber_diva',
      'skin_archangel_judicator',
      'skin_omega_emperor'
    ]);
  }

  isSciFi(skin) {
    return skin && skin.id && this.sciFiSkinIds.has(skin.id);
  }

  // ─── 1. 頭部獨家造型渲染 (Head Rendering) ───
  drawHead(ctx, head, skin) {
    if (!this.isSciFi(skin)) return false;
    const id = skin.id;
    const t = Date.now() / 250;
    const themeCol = skin.themeColor || '#00f3ff';
    const armorCol = skin.armorColor || '#0f172a';

    switch (id) {
      // ══════════════════════════════════════════
      // 1. 賽博武者 (Cyber Warrior): 機武兜盔 + 金色 V-fin 角 + 青藍目鏡
      // ══════════════════════════════════════════
      case 'skin_cyber_warrior': {
        // 武士頭盔底座 (Kabuto Shell)
        ctx.fillStyle = armorCol;
        ctx.strokeStyle = themeCol;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-13, 8);
        ctx.quadraticCurveTo(-18, -4, -14, -14);
        ctx.quadraticCurveTo(-8, -18, 2, -18);
        ctx.lineTo(13, -12);
        ctx.lineTo(15, -2);
        ctx.lineTo(13, 8);
        ctx.lineTo(6, 16);
        ctx.lineTo(-6, 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 額前金色 V-fin 雙角 (Samurai Crest)
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(3, -13);
        ctx.lineTo(12, -26);
        ctx.lineTo(7, -15);
        ctx.lineTo(3, -14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-1, -13);
        ctx.lineTo(-8, -24);
        ctx.lineTo(-4, -15);
        ctx.lineTo(-1, -14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 額心菱形紅寶石
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(2, -15);
        ctx.lineTo(4, -13);
        ctx.lineTo(2, -11);
        ctx.lineTo(0, -13);
        ctx.closePath();
        ctx.fill();

        // 青藍數位目鏡 (Digital Cyan Visor)
        ctx.fillStyle = 'rgba(0, 243, 255, 0.9)';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(2, -4);
        ctx.lineTo(14, -2);
        ctx.lineTo(13, 4);
        ctx.lineTo(3, 4);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // 下顎戰國面當護板 (Mengu Jaw Plate)
        ctx.fillStyle = '#090d16';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(1, 5);
        ctx.lineTo(12, 5);
        ctx.lineTo(7, 15);
        ctx.lineTo(1, 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        return true;
      }

      // ══════════════════════════════════════════
      // 2. 霓虹暗影刺客 (Neon Shadow): 狐面鬼忍兜帽 + 飄逸圍巾 + 粉光尖眼
      // ══════════════════════════════════════════
      case 'skin_neon_shadow': {
        // 隨風擺動之洋紅長圍巾 (Flowing Stealth Scarf)
        const wave1 = Math.sin(t * 1.6) * 4;
        const wave2 = Math.cos(t * 1.8) * 6;
        ctx.fillStyle = '#ff007f';
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(-10, 10);
        ctx.quadraticCurveTo(-22 + wave1, 16, -34 + wave2, 18);
        ctx.lineTo(-32 + wave2, 24);
        ctx.quadraticCurveTo(-20 + wave1, 20, -8, 14);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // 暗影鬼忍兜帽 (Shinobi Hood)
        ctx.fillStyle = armorCol;
        ctx.strokeStyle = '#e879f9';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-12, 10);
        ctx.quadraticCurveTo(-20, -2, -14, -14);
        ctx.quadraticCurveTo(-8, -20, 2, -18);
        ctx.lineTo(12, -13);
        ctx.lineTo(15, -1);
        ctx.lineTo(12, 12);
        ctx.lineTo(0, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 兜帽頂部尖耳 (Fox/Oni Pointed Ears)
        ctx.fillStyle = '#ff007f';
        ctx.beginPath();
        ctx.moveTo(-9, -17);
        ctx.lineTo(-14, -26);
        ctx.lineTo(-5, -19);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(1, -18);
        ctx.lineTo(5, -27);
        ctx.lineTo(6, -17);
        ctx.closePath();
        ctx.fill();

        // 洋紅傾斜銳利刺客目鏡 (Sharp Slanted Neon Visor)
        ctx.fillStyle = '#ff007f';
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(2, -4);
        ctx.lineTo(14, -6);
        ctx.lineTo(13, 0);
        ctx.lineTo(3, 2);
        ctx.closePath();
        ctx.fill();

        // 刺客下半面罩
        ctx.fillStyle = '#0d0614';
        ctx.strokeStyle = '#ff007f';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(1, 3);
        ctx.lineTo(13, 1);
        ctx.lineTo(10, 13);
        ctx.lineTo(0, 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        return true;
      }

      // ══════════════════════════════════════════
      // 3. 脈衝重裝執法官 (Pulse Enforcer): 警用鎮暴全罩盔 + 旋轉警燈 + 防暴盾面
      // ══════════════════════════════════════════
      case 'skin_pulse_enforcer': {
        // 頂部旋轉警示燈 (Pulsing Police Beacon)
        const flash = Math.sin(t * 3.5) > 0;
        ctx.fillStyle = flash ? '#ffd700' : '#78350f';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = flash ? 14 : 2;
        ctx.fillRect(-4, -24, 9, 6);
        ctx.strokeRect(-4, -24, 9, 6);
        ctx.shadowBlur = 0;

        // 鎮暴重型圓盔 (SWAT Dome Helmet)
        ctx.fillStyle = armorCol;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, -3, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 透明金黃防暴面罩 (Gold Blast Visor)
        ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(1, -9);
        ctx.lineTo(16, -6);
        ctx.lineTo(15, 6);
        ctx.lineTo(2, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 面罩準星刻線
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(7, -4); ctx.lineTo(11, -4);
        ctx.moveTo(9, -6); ctx.lineTo(9, -2);
        ctx.stroke();

        // 強化下顎防撞塊
        ctx.fillStyle = '#292524';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.fillRect(0, 7, 14, 8);
        ctx.strokeRect(0, 7, 14, 8);
        return true;
      }

      // ══════════════════════════════════════════
      // 4. 星穹量子浪人 (Cosmic Ronin): 斗笠 (Kasa) + 斗笠邊緣霓虹圈 + 飄帶
      // ══════════════════════════════════════════
      case 'skin_cosmic_ronin': {
        // 後方飄動之浪人頭巾飄帶 (Headband Tails)
        const ribbonW = Math.sin(t * 1.5) * 5;
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.quadraticCurveTo(-22, 6 + ribbonW, -32, 4 + ribbonW);
        ctx.stroke();

        // 臉部黑影與冷光眼
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 2, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#c084fc';
        ctx.shadowColor = '#818cf8';
        ctx.shadowBlur = 8;
        ctx.fillRect(3, -1, 8, 3);
        ctx.shadowBlur = 0;

        // 經典東方編織竹笠 (Wide Conical Kasa Hat)
        ctx.save();
        ctx.fillStyle = '#1e1b4b';
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-25, -5); // 寬斗笠左側邊緣
        ctx.lineTo(2, -22);  // 斗笠尖頂
        ctx.lineTo(26, -3);  // 寬斗笠右側邊緣
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 斗笠邊緣全息光環 (Glowing Cyan/Indigo Rim)
        ctx.strokeStyle = '#a5b4fc';
        ctx.shadowColor = '#818cf8';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-25, -5);
        ctx.lineTo(26, -3);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
        return true;
      }

      // ══════════════════════════════════════════
      // 5. 雷霆神速遊俠 (Volt Ranger): 神速雷電鰭盔 + 耳側閃電翼
      // ══════════════════════════════════════════
      case 'skin_volt_ranger': {
        // 頭盔主體
        ctx.fillStyle = armorCol;
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-13, 8);
        ctx.quadraticCurveTo(-18, -4, -13, -14);
        ctx.quadraticCurveTo(-6, -18, 4, -16);
        ctx.lineTo(15, -8);
        ctx.lineTo(16, 2);
        ctx.lineTo(12, 10);
        ctx.lineTo(4, 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 頭頂流線型導流鰭 (Speed Fin)
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(-10, -15);
        ctx.lineTo(0, -26);
        ctx.lineTo(8, -16);
        ctx.lineTo(0, -18);
        ctx.closePath();
        ctx.fill();

        // 耳側閃電翅膀飾片 (Lightning Winglets)
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-8, -2);
        ctx.lineTo(-18, -12);
        ctx.lineTo(-12, -8);
        ctx.lineTo(-20, -18);
        ctx.lineTo(-8, -8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 銳角閃電狀黃金目鏡 (Lightning Chevron Visor)
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(3, -5);
        ctx.lineTo(14, -8);
        ctx.lineTo(11, -1);
        ctx.lineTo(16, 3);
        ctx.lineTo(4, 3);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        return true;
      }

      // ══════════════════════════════════════════
      // 6. 深淵幽靈特工 (Abyssal Ghost): 三眼夜視儀 (Tri-Ocular NVG) + 戰術防毒面具
      // ══════════════════════════════════════════
      case 'skin_abyssal_ghost': {
        // 特戰戰術頭套
        ctx.fillStyle = '#082f49';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 三眼特工夜視儀鏡座 (Tri-Ocular Night Vision Goggle Rig)
        ctx.fillStyle = '#030712';
        ctx.fillRect(1, -9, 14, 10);

        // 3 顆發光青碧鏡頭 (3 Glowing Cyan Optical Lenses)
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#06b6d4';
        // 鏡頭 1 (前上)
        ctx.beginPath(); ctx.arc(11, -7, 2.8, 0, Math.PI * 2); ctx.fill();
        // 鏡頭 2 (前下)
        ctx.beginPath(); ctx.arc(11, -1, 2.8, 0, Math.PI * 2); ctx.fill();
        // 鏡頭 3 (側中)
        ctx.beginPath(); ctx.arc(5, -4, 2.8, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        // 戰術呼吸器/濾毒罐 (Tactical Rebreather Filter)
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(8, 7, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        return true;
      }

      // ══════════════════════════════════════════
      // 7. 暗黑駭客 (Dark Hacker): 寬大連帽風衣 (Hacker Hoodie) + 矩陣代碼眼鏡
      // ══════════════════════════════════════════
      case 'skin_dark_hacker': {
        // 寬大深黑駭客連帽 (Oversized Cyber Hoodie)
        ctx.fillStyle = '#022c22';
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, 12);
        ctx.quadraticCurveTo(-24, -4, -16, -16);
        ctx.quadraticCurveTo(-8, -24, 2, -22);
        ctx.quadraticCurveTo(14, -20, 16, -8);
        ctx.lineTo(16, 6);
        ctx.quadraticCurveTo(12, 16, 2, 18);
        ctx.lineTo(-12, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 兜帽深處陰影
        ctx.fillStyle = '#050c08';
        ctx.beginPath();
        ctx.arc(2, 0, 11, 0, Math.PI * 2);
        ctx.fill();

        // 矩陣綠色 VR 全息眼鏡 (Matrix Green HUD Glasses)
        ctx.fillStyle = 'rgba(0, 255, 102, 0.85)';
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 10;
        ctx.fillRect(2, -4, 12, 6);

        // 串流 0 與 1 二進制光點 (Cascading Matrix Bits)
        ctx.fillStyle = '#fff';
        ctx.font = '5px monospace';
        ctx.fillText('0', 4, 1);
        ctx.fillText('1', 8, 0);
        ctx.shadowBlur = 0;
        return true;
      }

      // ══════════════════════════════════════════
      // 8. 奈米生化戰警 (Nano Cyborg): 魔鬼終結者半鈦金屬頭骨 + 血紅機械眼
      // ══════════════════════════════════════════
      case 'skin_nano_cyborg': {
        // 左半邊頭骨 (鈦黑碳纖面具)
        ctx.fillStyle = '#14532d';
        ctx.strokeStyle = '#84cc16';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 右半邊外露終結者機械金屬頭骨 (Exposed Chrome Titanium Skull)
        ctx.fillStyle = '#94a3b8';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(2, -14);
        ctx.lineTo(14, -10);
        ctx.lineTo(16, 2);
        ctx.lineTo(12, 14);
        ctx.lineTo(2, 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 金屬骨架齒列 (Titanium Jaw Grille)
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        for (let i = 4; i <= 11; i += 3) {
          ctx.beginPath();
          ctx.moveTo(i, 8);
          ctx.lineTo(i, 13);
          ctx.stroke();
        }

        // 血紅超導機械義眼 (Glowing Red Terminator Eye)
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(8, -2, 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(8, -2, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        return true;
      }

      // ══════════════════════════════════════════
      // 9. 赤紅暴君重機甲 (Crimson Tyrant): 惡魔雙巨角 + 熔岩排氣面罩
      // ══════════════════════════════════════════
      case 'skin_crimson_tyrant': {
        // 兩側巨大向後彎曲之熔岩巨角 (Colossal Curved Magma Horns)
        ctx.fillStyle = '#7f1d1d';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.8;

        // 前角
        ctx.beginPath();
        ctx.moveTo(2, -12);
        ctx.quadraticCurveTo(14, -22, 18, -32);
        ctx.quadraticCurveTo(6, -24, -2, -16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 後角
        ctx.beginPath();
        ctx.moveTo(-10, -10);
        ctx.quadraticCurveTo(-18, -24, -14, -34);
        ctx.quadraticCurveTo(-14, -20, -6, -14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 惡魔重機甲頭顱
        ctx.fillStyle = armorCol;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-13, 8);
        ctx.lineTo(-16, -8);
        ctx.lineTo(2, -18);
        ctx.lineTo(16, -6);
        ctx.lineTo(15, 6);
        ctx.lineTo(6, 17);
        ctx.lineTo(-6, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 熾熱熔岩橫向威壓目鏡
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.fillRect(2, -4, 13, 4);
        ctx.shadowBlur = 0;

        // 嘴部金屬排氣網格
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(4, 8); ctx.lineTo(12, 8);
        ctx.moveTo(5, 11); ctx.lineTo(11, 11);
        ctx.stroke();
        return true;
      }

      // ══════════════════════════════════════════
      // 10. 極寒超導武姬 (Cryo Maiden): 5 晶棱極地冰晶王冠 + 冰霜髮辮
      // ══════════════════════════════════════════
      case 'skin_cryo_maiden': {
        // 後方飄散之淡藍冰晶秀髮 (Crystal Hair Spikes)
        ctx.fillStyle = 'rgba(186, 230, 253, 0.75)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-10, 4);
        ctx.lineTo(-24, -2);
        ctx.lineTo(-16, -6);
        ctx.lineTo(-28, -12);
        ctx.lineTo(-12, -14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 武姬秀麗面龐
        ctx.fillStyle = '#0c4a6e';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 5 棱極地冰晶王冠 (Ice Crystal Tiara)
        ctx.fillStyle = '#e0f2fe';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        const spires = [-10, -5, 1, 7, 12];
        const heights = [16, 22, 26, 22, 16];
        for (let i = 0; i < spires.length; i++) {
          ctx.beginPath();
          ctx.moveTo(spires[i] - 2, -12);
          ctx.lineTo(spires[i], -heights[i]);
          ctx.lineTo(spires[i] + 2, -12);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // 幽藍冰稜目鏡
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(2, -3, 11, 4);
        return true;
      }

      // ══════════════════════════════════════════
      // 11. 虛空吞噬者 (Void Devourer): 無面異面具 + 額前微型黑洞奇點
      // ══════════════════════════════════════════
      case 'skin_void_devourer': {
        // 暗物質無面頭顱
        ctx.fillStyle = '#090514';
        ctx.strokeStyle = '#9333ea';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 額前旋轉黑洞奇點 (Rotating Black Hole Singularity)
        const holeAngle = t * 2.5;
        ctx.save();
        ctx.translate(5, -3);
        ctx.rotate(holeAngle);

        // 紫黑吸積盤光暈
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 16;
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 1.6);
        ctx.stroke();

        // 奇點暗核
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.shadowBlur = 0;
        return true;
      }

      // ══════════════════════════════════════════
      // 12. 太陽女武神 (Solar Valkyrie): 金翼戰盔 + 金羽雙角 + 烈陽額鑽
      // ══════════════════════════════════════════
      case 'skin_solar_valkyrie': {
        // 雙側金光羽翼 (Golden Valkyrie Wings on Helmet)
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.4;

        // 側向飛天羽翼 (3 層羽片)
        ctx.beginPath();
        ctx.moveTo(-6, -4);
        ctx.lineTo(-24, -18);
        ctx.lineTo(-16, -10);
        ctx.lineTo(-28, -26);
        ctx.lineTo(-12, -18);
        ctx.lineTo(-26, -34);
        ctx.lineTo(-2, -14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 女武神金盔面甲
        ctx.fillStyle = '#451a03';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 額心烈陽寶石 (Solar Sun Gem)
        ctx.fillStyle = '#ff4500';
        ctx.shadowColor = '#ff4500';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(3, -13, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 金色高貴目鏡
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(2, -4, 12, 4);
        return true;
      }

      // ══════════════════════════════════════════
      // 13. 賽博歌姬音律 (Cyber Diva): 青綠全息雙馬尾 + DJ 耳機 + 等化器
      // ══════════════════════════════════════════
      case 'skin_cyber_diva': {
        // 隨風自然擺動之全息雙馬尾 (Holographic Twin-tails)
        const hairWave = Math.sin(t * 1.8) * 6;
        ctx.fillStyle = 'rgba(20, 184, 166, 0.85)';
        ctx.strokeStyle = '#2dd4bf';
        ctx.lineWidth = 1.6;

        // 左/後馬尾
        ctx.beginPath();
        ctx.moveTo(-10, -10);
        ctx.quadraticCurveTo(-26, 6 + hairWave, -22, 28 + hairWave);
        ctx.lineTo(-16, 24 + hairWave);
        ctx.quadraticCurveTo(-18, 4 + hairWave, -6, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 歌姬甜美面龐
        ctx.fillStyle = '#134e4a';
        ctx.strokeStyle = '#2dd4bf';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // DJ 專業立體耳機與跳動 LED 等化器 (DJ Stereo Headphones with Volume Bars)
        ctx.fillStyle = '#042f2e';
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(-8, 1, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 耳機等化器 3 根柱 (Bouncing Equalizer Bars)
        const b1 = Math.abs(Math.sin(t * 3)) * 6 + 2;
        const b2 = Math.abs(Math.cos(t * 2.5)) * 6 + 2;
        ctx.fillStyle = '#5eead4';
        ctx.fillRect(-10, 1 - b1 / 2, 2, b1);
        ctx.fillRect(-7, 1 - b2 / 2, 2, b2);

        // 歌姬青綠色目鏡
        ctx.fillStyle = '#2dd4bf';
        ctx.fillRect(2, -3, 10, 4);
        return true;
      }

      // ══════════════════════════════════════════
      // 14. 曜白裁決聖使 (Archangel Judicator): 懸浮天使光環 + 聖白金十字面甲
      // ══════════════════════════════════════════
      case 'skin_archangel_judicator': {
        // 頭頂懸浮聖潔天使金光環 (Levitating Holy Angel Halo)
        const haloBob = Math.sin(t * 1.5) * 2;
        ctx.save();
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 16;
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, -26 + haloBob, 15, 4.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 聖潔純白機甲頭盔 (Pure White Archangel Helm)
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 面甲金色神聖十字紋章 (Holy Golden Cross Visor)
        ctx.fillStyle = '#eab308';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;
        // 橫桿
        ctx.fillRect(1, -2, 13, 3.5);
        // 豎桿
        ctx.fillRect(7, -8, 3.5, 15);
        ctx.shadowBlur = 0;
        return true;
      }

      // ══════════════════════════════════════════
      // 15. 黃金終極機神 (Omega Emperor): 帝皇三重金冠 + 龍首面甲
      // ══════════════════════════════════════════
      case 'skin_omega_emperor': {
        // 帝皇三重金冠 (Triple-Spired Imperial Gold Crown)
        ctx.fillStyle = '#eab308';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.6;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(-12, -12);
        ctx.lineTo(-14, -26); // 左翼尖刺
        ctx.lineTo(-6, -16);
        ctx.lineTo(2, -32);  // 中央最高帝冠尖塔
        ctx.lineTo(8, -16);
        ctx.lineTo(16, -24); // 右翼尖刺
        ctx.lineTo(12, -12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 帝冠中央真紅寶石
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(2, -18, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 帝皇神金面甲
        ctx.fillStyle = '#713f12';
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 帝皇威嚴金黃目鏡
        ctx.fillStyle = '#fde047';
        ctx.shadowColor = '#fde047';
        ctx.shadowBlur = 8;
        ctx.fillRect(2, -3, 12, 4);
        ctx.shadowBlur = 0;
        return true;
      }

      default:
        return false;
    }
  }

  // ─── 2. 胸軀外甲與背部專屬飾物渲染 (Torso & Accessories) ───
  drawTorso(ctx, torso, skin, t) {
    if (!this.isSciFi(skin)) return false;
    const id = skin.id;
    const themeCol = skin.themeColor || '#00f3ff';
    const armorCol = skin.armorColor || '#0f172a';

    ctx.save();
    ctx.translate(torso.x, torso.y);
    ctx.rotate(torso.angle);

    // 依據角色獨立繪製胸甲造型
    switch (id) {
      // 1. 賽博武者：武士護板 + 腰間佩刀刀鞘 + 胸前反應爐
      case 'skin_cyber_warrior': {
        // 武士胸甲 (Cuirass)
        ctx.fillStyle = armorCol;
        ctx.strokeStyle = themeCol;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, -23); ctx.lineTo(16, -23); ctx.lineTo(12, 16); ctx.lineTo(-12, 16);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 腰間斜跨青藍武士刀鞘 (Katana Scabbard)
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-14, 8);
        ctx.lineTo(-28, 26);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-29, 24, 4, 4); // 刀柄

        // 中央反應爐
        this._drawCore(ctx, 0, -6, themeCol, 6);
        break;
      }

      // 2. 霓虹暗影刺客：夜行黑甲 + 交叉苦無背帶 (Kunai Harness)
      case 'skin_neon_shadow': {
        ctx.fillStyle = armorCol;
        ctx.strokeStyle = '#ff007f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-14, -22); ctx.lineTo(14, -22); ctx.lineTo(10, 15); ctx.lineTo(-10, 15);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 斜跨苦無背帶 (Kunai Bandolier)
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(-13, -20); ctx.lineTo(11, 14); ctx.stroke();

        // 兩枚金屬苦無刀柄
        ctx.fillStyle = '#ff007f';
        ctx.fillRect(-4, -8, 6, 2.5);
        ctx.fillRect(2, 0, 6, 2.5);

        this._drawCore(ctx, 0, -5, '#ff007f', 5);
        break;
      }

      // 3. 脈衝重裝執法官：厚重防暴戰術防彈背心 + 金色警徽
      case 'skin_pulse_enforcer': {
        ctx.fillStyle = '#1c1917';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-18, -24); ctx.lineTo(18, -24); ctx.lineTo(14, 17); ctx.lineTo(-14, 17);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 金色重裝警徽 (SWAT Badge)
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(6, -12, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // 黑黃警戒斑馬紋
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-12, 6, 24, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(-8, 6, 5, 4);
        ctx.fillRect(2, 6, 5, 4);

        this._drawCore(ctx, -2, -4, '#ffd700', 6);
        break;
      }

      // 4. 星穹量子浪人：浪人羽織 (Haori Coat) 隨風拂動 + 星辰紋
      case 'skin_cosmic_ronin': {
        const coatW = Math.sin(t * 1.6) * 3;
        // 寬大浪人羽織袖袍邊緣
        ctx.fillStyle = '#1e1b4b';
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-18, -23);
        ctx.lineTo(18, -23);
        ctx.lineTo(16 + coatW, 20);
        ctx.lineTo(-16 - coatW, 20);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 羽織白色居合束帶
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-12, 10, 24, 5);

        this._drawCore(ctx, 0, -6, '#818cf8', 5);
        break;
      }

      // 5. 雷霆神速遊俠：流線金色閃電胸甲 + 雙肩微型特斯拉電容
      case 'skin_volt_ranger': {
        ctx.fillStyle = armorCol;
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-15, -23); ctx.lineTo(15, -23); ctx.lineTo(11, 15); ctx.lineTo(-11, 15);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 貫穿胸甲之金黃閃電紋 (Lightning Bolt)
        ctx.fillStyle = '#fde047';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(3, -20);
        ctx.lineTo(-6, -4);
        ctx.lineTo(1, -4);
        ctx.lineTo(-4, 10);
        ctx.lineTo(6, -6);
        ctx.lineTo(-1, -6);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      }

      // 6. 深淵幽靈特工：潛水作戰胸掛 + 聲納脈衝環 + 氧氣瓶
      case 'skin_abyssal_ghost': {
        ctx.fillStyle = '#082f49';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, -22); ctx.lineTo(16, -22); ctx.lineTo(12, 16); ctx.lineTo(-12, 16);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 背部雙氧氣瓶 (Oxygen Tanks)
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-20, -18, 5, 24);
        ctx.fillRect(-22, -18, 3, 4);

        // 聲納發射環 (Sonar Transmitter Ring)
        this._drawCore(ctx, 0, -5, '#06b6d4', 6);
        break;
      }

      // 7. 暗黑駭客：長版風衣領 (Matrix Trench Coat) + 二進制綠色代碼流
      case 'skin_dark_hacker': {
        ctx.fillStyle = '#022c22';
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-18, -23); ctx.lineTo(18, -23); ctx.lineTo(14, 22); ctx.lineTo(-14, 22);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 綠色數據流刻線
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-8, -18); ctx.lineTo(-8, 14);
        ctx.moveTo(8, -18); ctx.lineTo(8, 14);
        ctx.stroke();

        this._drawCore(ctx, 0, -6, '#00ff66', 5);
        break;
      }

      // 8. 奈米生化戰警：外露金屬機械肋骨 + 綠色生化藥劑管
      case 'skin_nano_cyborg': {
        ctx.fillStyle = '#0f291e';
        ctx.strokeStyle = '#84cc16';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-15, -23); ctx.lineTo(15, -23); ctx.lineTo(11, 16); ctx.lineTo(-11, 16);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 外露銀色機械肋骨 (Chrome Ribs)
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        for (let y = -14; y <= 8; y += 7) {
          ctx.beginPath();
          ctx.moveTo(-11, y); ctx.lineTo(-2, y + 2);
          ctx.moveTo(11, y); ctx.lineTo(2, y + 2);
          ctx.stroke();
        }

        this._drawCore(ctx, 0, -6, '#84cc16', 5.5);
        break;
      }

      // 9. 赤紅暴君重機甲：尖刺巨肩 + 熔岩發光散熱排氣槽
      case 'skin_crimson_tyrant': {
        ctx.fillStyle = '#450a0a';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-20, -25); ctx.lineTo(20, -25); ctx.lineTo(14, 18); ctx.lineTo(-14, 18);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 雙側重裝尖刺肩甲 (Spiked Shoulders)
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.moveTo(-18, -25); ctx.lineTo(-30, -32); ctx.lineTo(-16, -14); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(18, -25); ctx.lineTo(30, -32); ctx.lineTo(16, -14); ctx.closePath(); ctx.fill(); ctx.stroke();

        // 熔岩排氣孔
        ctx.fillStyle = '#f97316';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.fillRect(-6, 2, 12, 6);
        ctx.shadowBlur = 0;

        this._drawCore(ctx, 0, -9, '#ef4444', 6);
        break;
      }

      // 10. 極寒超導武姬：冰晶馬甲 + 浮空鑽石冰錐飾品
      case 'skin_cryo_maiden': {
        ctx.fillStyle = '#075985';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-14, -22); ctx.lineTo(14, -22); ctx.lineTo(10, 16); ctx.lineTo(-10, 16);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 肩旁浮空冰錐 (Floating Diamond Ice Prisms)
        const iceRot = t * 2;
        ctx.fillStyle = '#e0f2fe';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.save();
        ctx.translate(-20, -18 + Math.sin(iceRot) * 3);
        ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(4, 0); ctx.lineTo(0, 6); ctx.lineTo(-4, 0); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.restore();

        this._drawCore(ctx, 0, -6, '#38bdf8', 5);
        break;
      }

      // 11. 虛空吞噬者：事件視界黑洞反應爐 + 虛空翅膀觸鬚
      case 'skin_void_devourer': {
        ctx.fillStyle = '#0b0416';
        ctx.strokeStyle = '#9333ea';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-15, -23); ctx.lineTo(15, -23); ctx.lineTo(11, 16); ctx.lineTo(-11, 16);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 背後暗物質虛空觸鬚 (Void Tendrils)
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-10, -14);
        ctx.quadraticCurveTo(-26, -26 + Math.sin(t * 2) * 5, -34, -18);
        ctx.stroke();

        this._drawCore(ctx, 0, -6, '#9333ea', 7);
        break;
      }

      // 12. 太陽女武神：金色太陽浮雕胸甲 + 戰神披風
      case 'skin_solar_valkyrie': {
        // 戰袍披風 (Valkyrie Cape)
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.moveTo(-16, -20);
        ctx.lineTo(-24, 26);
        ctx.lineTo(4, 24);
        ctx.lineTo(14, -20);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#78350f';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-16, -23); ctx.lineTo(16, -23); ctx.lineTo(12, 16); ctx.lineTo(-12, 16);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 太陽紋章
        ctx.fillStyle = '#ff4500';
        ctx.shadowColor = '#ff4500';
        ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(0, -6, 6, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        break;
      }

      // 13. 賽博歌姬音律：即時音波跳躍頻譜胸甲 (Equalizer Spectrum)
      case 'skin_cyber_diva': {
        ctx.fillStyle = '#042f2e';
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-14, -22); ctx.lineTo(14, -22); ctx.lineTo(10, 16); ctx.lineTo(-10, 16);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 胸前即時動態跳動音波 (Bouncing Audio Bars)
        ctx.fillStyle = '#2dd4bf';
        const barHeights = [4, 8, 12, 6, 10, 5];
        for (let i = 0; i < barHeights.length; i++) {
          const h = (Math.sin(t * 3 + i * 0.8) * 0.5 + 0.5) * barHeights[i] + 2;
          ctx.fillRect(-9 + i * 3.2, 2 - h, 2, h);
        }

        this._drawCore(ctx, 0, -8, '#2dd4bf', 5);
        break;
      }

      // ══════════════════════════════════════════
      // 14. 曜白裁決聖使：六翼幾何天翔光羽 (6 Geometric Light Wings) + 聖十字
      // ══════════════════════════════════════════
      case 'skin_archangel_judicator': {
        // 背部展開之六翼幾何光羽 (6 Radiant Holy Wings)
        ctx.save();
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 14;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2.2;
        const wingFlap = Math.sin(t * 1.5) * 4;

        // 上層主羽 (左右一對)
        ctx.beginPath();
        ctx.moveTo(-10, -18); ctx.lineTo(-38, -36 + wingFlap); ctx.lineTo(-24, -14);
        ctx.moveTo(10, -18); ctx.lineTo(38, -36 + wingFlap); ctx.lineTo(24, -14);
        // 中層光羽
        ctx.moveTo(-12, -10); ctx.lineTo(-44, -18 + wingFlap); ctx.lineTo(-20, -4);
        ctx.moveTo(12, -10); ctx.lineTo(44, -18 + wingFlap); ctx.lineTo(20, -4);
        // 下層羽片
        ctx.moveTo(-10, -4); ctx.lineTo(-34, 4 + wingFlap); ctx.lineTo(-14, 4);
        ctx.moveTo(10, -4); ctx.lineTo(34, 4 + wingFlap); ctx.lineTo(14, 4);
        ctx.stroke();
        ctx.restore();

        // 聖潔白金胸甲
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, -23); ctx.lineTo(16, -23); ctx.lineTo(12, 16); ctx.lineTo(-12, 16);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 金色裁決十字
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-2, -14, 4, 16);
        ctx.fillRect(-7, -10, 14, 4);
        break;
      }

      // ══════════════════════════════════════════
      // 15. 黃金終極機神：雄獅龍頭巨型金肩甲 + 日冕光環 + 鎏金披風
      // ══════════════════════════════════════════
      case 'skin_omega_emperor': {
        // 頸後帝皇日冕神輪 (Imperial Solar Halo Disc)
        ctx.save();
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 16;
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, -20, 22, 0, Math.PI * 2);
        ctx.stroke();

        // 輪盤八方日芒
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 22, -20 + Math.sin(a) * 22);
          ctx.lineTo(Math.cos(a) * 28, -20 + Math.sin(a) * 28);
          ctx.stroke();
        }
        ctx.restore();

        // 帝皇神甲
        ctx.fillStyle = '#854d0e';
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-18, -24); ctx.lineTo(18, -24); ctx.lineTo(13, 17); ctx.lineTo(-13, 17);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 雄獅金頭肩甲 (Lion Emperor Pauldrons)
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(-18, -22, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        this._drawCore(ctx, 0, -6, '#eab308', 7);
        break;
      }
    }

    // 骨盆與腰帶
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-11, 16, 22, 12);
    ctx.strokeRect(-11, 16, 22, 12);

    ctx.restore();
    return true;
  }

  // ─── 3. 專屬氣場與動態粒子 (Aura & Atmospheric Particles) ───
  drawAura(ctx, char, skin, t) {
    if (!this.isSciFi(skin)) return false;
    const id = skin.id;
    const cx = char.x;
    const cy = char.y - 45;

    ctx.save();
    switch (id) {
      // 1. 賽博武者：青藍全息像素方塊浮空
      case 'skin_cyber_warrior': {
        ctx.fillStyle = 'rgba(0, 243, 255, 0.4)';
        for (let i = 0; i < 4; i++) {
          const offX = Math.sin(t * 1.5 + i * 1.6) * 28;
          const offY = -((t * 20 + i * 25) % 80);
          ctx.fillRect(cx + offX, char.y + offY, 4, 4);
        }
        break;
      }

      // 2. 霓虹暗影刺客：粉紅櫻花瓣隨風飄飛
      case 'skin_neon_shadow': {
        ctx.fillStyle = 'rgba(255, 0, 127, 0.5)';
        for (let i = 0; i < 5; i++) {
          const offX = Math.sin(t * 1.2 + i * 1.3) * 32;
          const offY = -((t * 18 + i * 20) % 75);
          ctx.beginPath();
          ctx.ellipse(cx + offX, char.y + offY, 3, 1.5, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // 3. 脈衝重裝執法官：金黃警示電弧與重壓震波
      case 'skin_pulse_enforcer': {
        if (Math.sin(t * 4) > 0.4) {
          ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx - 15, cy - 10);
          ctx.lineTo(cx - 24, cy - 4);
          ctx.lineTo(cx - 18, cy + 12);
          ctx.stroke();
        }
        break;
      }

      // 4. 星穹量子浪人：靛藍星宿與流星光塵
      case 'skin_cosmic_ronin': {
        ctx.fillStyle = '#a5b4fc';
        for (let i = 0; i < 4; i++) {
          const offX = Math.cos(t * 0.8 + i * 1.8) * 30;
          const offY = -((t * 15 + i * 22) % 85);
          ctx.beginPath();
          ctx.arc(cx + offX, char.y + offY, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // 5. 雷霆神速遊俠：周身跳動黃金高壓閃電
      case 'skin_volt_ranger': {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.4;
        const spark = Math.sin(t * 5);
        if (spark > 0) {
          ctx.beginPath();
          ctx.moveTo(cx + 12, cy - 20);
          ctx.lineTo(cx + 22, cy - 8);
          ctx.lineTo(cx + 16, cy + 8);
          ctx.lineTo(cx + 26, cy + 24);
          ctx.stroke();
        }
        break;
      }

      // 6. 深淵幽靈特工：聲納擴散圓環
      case 'skin_abyssal_ghost': {
        const ringProgress = (t * 0.8) % 1;
        ctx.strokeStyle = `rgba(6, 182, 212, ${1 - ringProgress})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(cx, char.y - 10, 25 * ringProgress + 5, 8 * ringProgress + 2, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      // 7. 暗黑駭客：向上浮升的綠色 0 與 1
      case 'skin_dark_hacker': {
        ctx.fillStyle = 'rgba(0, 255, 102, 0.6)';
        ctx.font = '8px monospace';
        for (let i = 0; i < 3; i++) {
          const offX = Math.sin(i * 2.2) * 26;
          const offY = -((t * 22 + i * 30) % 85);
          ctx.fillText(i % 2 === 0 ? '0' : '1', cx + offX, char.y + offY);
        }
        break;
      }

      // 8. 奈米生化戰警：綠色生化修復微粒
      case 'skin_nano_cyborg': {
        ctx.fillStyle = '#84cc16';
        for (let i = 0; i < 4; i++) {
          const offX = Math.sin(t * 2 + i * 1.5) * 22;
          const offY = -((t * 20 + i * 22) % 70);
          ctx.beginPath();
          ctx.arc(cx + offX, char.y + offY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // 9. 赤紅暴君重機甲：上升熔岩火星與濃煙
      case 'skin_crimson_tyrant': {
        ctx.fillStyle = '#f97316';
        for (let i = 0; i < 5; i++) {
          const offX = Math.sin(t * 1.8 + i * 1.4) * 28;
          const offY = -((t * 25 + i * 20) % 90);
          ctx.beginPath();
          ctx.arc(cx + offX, char.y + offY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // 10. 極寒超導武姬：飄落冰晶雪花
      case 'skin_cryo_maiden': {
        ctx.fillStyle = '#e0f2fe';
        for (let i = 0; i < 5; i++) {
          const offX = Math.sin(t * 1.1 + i * 1.5) * 32;
          const offY = (t * 16 + i * 20) % 80 - 60;
          ctx.beginPath();
          ctx.arc(cx + offX, char.y + offY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // 11. 虛空吞噬者：向中心吸引之暗物質奇點
      case 'skin_void_devourer': {
        ctx.fillStyle = '#c084fc';
        for (let i = 0; i < 4; i++) {
          const dist = 40 - ((t * 18 + i * 20) % 40);
          const angle = t * 2 + i * 1.5;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // 12. 太陽女武神：金色太陽光羽閃爍
      case 'skin_solar_valkyrie': {
        ctx.fillStyle = '#fbbf24';
        for (let i = 0; i < 4; i++) {
          const offX = Math.sin(t * 1.4 + i * 1.7) * 26;
          const offY = -((t * 20 + i * 24) % 80);
          ctx.beginPath();
          ctx.arc(cx + offX, char.y + offY, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // 13. 賽博歌姬音律：漂浮動態音符 (♪ ♫)
      case 'skin_cyber_diva': {
        ctx.fillStyle = '#2dd4bf';
        ctx.font = '10px sans-serif';
        const offX1 = Math.sin(t * 1.3) * 25;
        const offY1 = -((t * 18) % 75);
        ctx.fillText('♪', cx + offX1, char.y + offY1);

        const offX2 = Math.cos(t * 1.5) * 28;
        const offY2 = -((t * 18 + 35) % 75);
        ctx.fillText('♫', cx + offX2, char.y + offY2);
        break;
      }

      // 14. 曜白裁決聖使：純白神聖羽毛飄落
      case 'skin_archangel_judicator': {
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 4; i++) {
          const offX = Math.sin(t * 0.9 + i * 1.5) * 34;
          const offY = -((t * 16 + i * 22) % 85);
          ctx.beginPath();
          ctx.ellipse(cx + offX, char.y + offY, 3.5, 1.8, Math.PI / 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // 15. 黃金終極機神：璀璨帝皇金輝光暈
      case 'skin_omega_emperor': {
        ctx.fillStyle = '#fde047';
        for (let i = 0; i < 5; i++) {
          const offX = Math.cos(t * 1.2 + i * 1.4) * 30;
          const offY = -((t * 20 + i * 25) % 85);
          ctx.beginPath();
          ctx.arc(cx + offX, char.y + offY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
    }
    ctx.restore();
    return true;
  }

  // ─── 4. 專屬護盾防護罩渲染 (Guard Shield) ───
  drawGuardShield(ctx, stance, skin, t) {
    if (!this.isSciFi(skin)) return false;
    const id = skin.id;
    const isHigh = stance === 'high';
    const shieldY = isHigh ? -50 : -25;
    const themeCol = skin.themeColor || '#00f3ff';

    ctx.save();
    ctx.shadowColor = themeCol;
    ctx.shadowBlur = 18;

    switch (id) {
      // 1. 賽博武者：全息武士家紋八角陣 (Octagonal Samurai Mon)
      case 'skin_cyber_warrior': {
        ctx.strokeStyle = '#00f3ff';
        ctx.fillStyle = 'rgba(0, 243, 255, 0.2)';
        ctx.lineWidth = 2.5;
        this._drawPolygon(ctx, 28, shieldY, 26, 8);
        break;
      }

      // 2. 霓虹暗影刺客：紫櫻煙幕幾何盾 (Cherry Blossom Smokescreen)
      case 'skin_neon_shadow': {
        ctx.strokeStyle = '#ff007f';
        ctx.fillStyle = 'rgba(255, 0, 127, 0.25)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(26, shieldY, 22, 32, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        break;
      }

      // 3. 脈衝重裝執法官：金黑重裝防暴透明大盾 (SWAT Riot Blast Shield)
      case 'skin_pulse_enforcer': {
        ctx.strokeStyle = '#ffd700';
        ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
        ctx.lineWidth = 3;
        ctx.strokeRect(18, shieldY - 34, 18, 68);
        ctx.fillRect(18, shieldY - 34, 18, 68);
        break;
      }

      // 4. 星穹量子浪人：旋轉斗笠式星辰光輪盾
      case 'skin_cosmic_ronin': {
        ctx.strokeStyle = '#818cf8';
        ctx.fillStyle = 'rgba(129, 140, 248, 0.22)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(28, shieldY, 28, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        break;
      }

      // 5. 雷霆神速遊俠：高壓電磁閃電防禦罩
      case 'skin_volt_ranger': {
        ctx.strokeStyle = '#facc15';
        ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
        ctx.lineWidth = 2.5;
        this._drawPolygon(ctx, 28, shieldY, 27, 6);
        break;
      }

      // 6. 深淵幽靈特工：水冷高壓抗壓水泡力場 (Hydro-bubble)
      case 'skin_abyssal_ghost': {
        ctx.strokeStyle = '#06b6d4';
        ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(26, shieldY, 26, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        break;
      }

      // 7. 暗黑駭客：綠色代碼防火牆 (Matrix Code Firewall)
      case 'skin_dark_hacker': {
        ctx.strokeStyle = '#00ff66';
        ctx.fillStyle = 'rgba(0, 255, 102, 0.2)';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(20, shieldY - 32, 14, 64);
        ctx.fillRect(20, shieldY - 32, 14, 64);
        break;
      }

      // 8. 奈米生化戰警：蜂巢綠色生化六角盾 (Bio-Nanite Honeycomb)
      case 'skin_nano_cyborg': {
        ctx.strokeStyle = '#84cc16';
        ctx.fillStyle = 'rgba(132, 204, 22, 0.25)';
        ctx.lineWidth = 2.5;
        this._drawPolygon(ctx, 28, shieldY, 26, 6);
        break;
      }

      // 9. 赤紅暴君重機甲：地裂熔岩固態裝甲盾 (Magma Crust Shield)
      case 'skin_crimson_tyrant': {
        ctx.strokeStyle = '#ef4444';
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.lineWidth = 3.5;
        this._drawPolygon(ctx, 28, shieldY, 28, 5);
        break;
      }

      // 10. 極寒超導武姬：尖錐冰川冰壁 (Spiked Glacier Wall)
      case 'skin_cryo_maiden': {
        ctx.strokeStyle = '#38bdf8';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.lineWidth = 2.5;
        this._drawPolygon(ctx, 28, shieldY, 27, 4);
        break;
      }

      // 11. 虛空吞噬者：事件視界吸積盤暗盾 (Singularity Event Horizon)
      case 'skin_void_devourer': {
        ctx.strokeStyle = '#9333ea';
        ctx.fillStyle = 'rgba(147, 51, 234, 0.35)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(28, shieldY, 27, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        break;
      }

      // 12. 太陽女武神：真金烈陽神聖大盾 (Solar Aegis)
      case 'skin_solar_valkyrie': {
        ctx.strokeStyle = '#f59e0b';
        ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(26, shieldY, 20, 32, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        break;
      }

      // 13. 賽博歌姬音律：音波同心漣漪盾 (Sonic Pulse Barrier)
      case 'skin_cyber_diva': {
        ctx.strokeStyle = '#14b8a6';
        ctx.fillStyle = 'rgba(20, 184, 166, 0.25)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(28, shieldY, 26, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(28, shieldY, 18, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
        break;
      }

      // 14. 曜白裁決聖使：六翼合攏聖光神聖守護 (Seraphic Wings Guard)
      case 'skin_archangel_judicator': {
        ctx.strokeStyle = '#f8fafc';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(28, shieldY, 28, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        break;
      }

      // 15. 黃金終極機神：萬丈帝皇金輪結界 (Imperial Golden Wheel)
      case 'skin_omega_emperor': {
        ctx.strokeStyle = '#eab308';
        ctx.fillStyle = 'rgba(234, 179, 8, 0.35)';
        ctx.lineWidth = 3.5;
        this._drawPolygon(ctx, 28, shieldY, 28, 8);
        break;
      }

      default:
        ctx.restore();
        return false;
    }

    ctx.restore();
    return true;
  }

  // ─── 輔助繪圖函式 ───
  _drawCore(ctx, x, y, color, radius) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _drawPolygon(ctx, cx, cy, radius, sides) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const a = (i * 2 * Math.PI) / sides;
      const px = cx + Math.cos(a) * radius;
      const py = cy + Math.sin(a) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

export const scifiSkinsRenderer = new SciFiSkinsRenderer();
