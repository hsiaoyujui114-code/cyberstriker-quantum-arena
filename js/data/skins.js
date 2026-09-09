/**
 * 《CyberStriker: Quantum Arena》
 * 5 套外觀專屬打擊視覺特效 (VFX) 分離映射表
 * 完全符合 GAME_PROJECT_PLAN.md 第 3.1 節
 * 
 * 核心原則：所有外觀的物理受擊盒 (Hurtbox) 與判定盒 (Hitbox) 精確至像素級 100% 相同，
 * 僅造型塗裝、光影色彩與招式專屬 VFX 特效分離獨立渲染。
 */

export const SKINS = [
  {
    id: 'skin_cyber_warrior',
    name: '賽博武者',
    title: '全息前線尖兵',
    category: 'default',
    price: 0,
    isDefault: true,
    themeColor: '#00f3ff',
    secondaryColor: '#ffffff',
    glowColor: 'rgba(0, 243, 255, 0.6)',
    accentColor: '#38bdf8',
    armorColor: '#0f172a',
    visorColor: '#00f3ff',
    coreColor: '#00f3ff',
    desc: '標準配置型全息武裝，流暢的人體工學幾何外裝，搭載第 4 代量子光子反應爐。',
    vfx: {
      punchTrail: '青藍色全息數位刀光、全息光方塊',
      sk1: '青藍色等離子電漿球，附帶藍色電流拖尾',
      sk2: '拔地而起之青色旋轉電弧光柱',
      guardShield: '全息立方體幾何防禦陣',
      hitEffect: '藍色晶片火花'
    },
    creator: 'Official Core'
  },
  {
    id: 'skin_neon_shadow',
    name: '霓虹暗影刺客',
    title: '暗影匿蹤駭客',
    category: 'default',
    price: 0,
    isDefault: true,
    themeColor: '#ff007f',
    secondaryColor: '#c084fc',
    glowColor: 'rgba(255, 0, 127, 0.6)',
    accentColor: '#e879f9',
    armorColor: '#180d24',
    visorColor: '#ff007f',
    coreColor: '#ff007f',
    desc: '專為夜間潛入設計的暗影外裝，武器搭載洋紅超頻高頻光刃與櫻花煙霧匿蹤塗層。',
    vfx: {
      punchTrail: '洋紅能量光刃切痕、暗影殘像',
      sk1: '洋紅櫻花狀光子螺旋彈，拖曳暗影煙霧',
      sk2: '紫色昇空暗影旋風，伴隨櫻花粒子',
      guardShield: '暗影煙幕幾何護盾',
      hitEffect: '粉紫光芒斬痕'
    },
    creator: 'Official Core'
  },
  {
    id: 'skin_pulse_enforcer',
    name: '脈衝重裝執法官',
    title: '極限警備重裝',
    category: 'default',
    price: 0,
    isDefault: true,
    themeColor: '#ffd700',
    secondaryColor: '#f59e0b',
    glowColor: 'rgba(255, 215, 0, 0.6)',
    accentColor: '#fbbf24',
    armorColor: '#1c1917',
    visorColor: '#ffd700',
    coreColor: '#ffd700',
    desc: '特種治安裝甲，厚重金屬陶瓷裝甲板與超導重力發電機，出拳附帶電閃雷鳴。',
    vfx: {
      punchTrail: '金色金屬重拳氣浪、金黃爆裂電磁',
      sk1: '金黃色重音爆震波彈，帶有重力波圈',
      sk2: '金色電閃雷鳴巨拳，震碎地面裂痕',
      guardShield: '金色菱形厚甲護盾',
      hitEffect: '金黃色雷電炸裂'
    },
    creator: 'Official Core'
  },
  {
    id: 'skin_dark_hacker',
    name: '暗黑駭客',
    title: '二進制深網幻影',
    category: 'shop',
    price: 2500,
    isDefault: false,
    themeColor: '#00ff66',
    secondaryColor: '#34d399',
    glowColor: 'rgba(0, 255, 102, 0.6)',
    accentColor: '#10b981',
    armorColor: '#052e16',
    visorColor: '#00ff66',
    coreColor: '#00ff66',
    desc: '深網漫遊者的神秘黑客裝，全身湧動著 0 與 1 的二進制綠色代碼流，斬擊破壞現實。',
    vfx: {
      punchTrail: '綠色 0 與 1 二進制代碼流揮砍',
      sk1: '綠色終端字符代碼光束球',
      sk2: '垂直升騰之綠色數據矩陣光牆',
      guardShield: '綠色掃描線力場',
      hitEffect: '綠色像素光塵'
    },
    creator: 'Community Workshop (PR #42)'
  },
  {
    id: 'skin_solar_valkyrie',
    name: '太陽女武神',
    title: '恆星烈焰戰神',
    category: 'event',
    price: 3500,
    isDefault: false,
    themeColor: '#ff4500',
    secondaryColor: '#fbbf24',
    glowColor: 'rgba(255, 69, 0, 0.6)',
    accentColor: '#f97316',
    armorColor: '#270802',
    visorColor: '#ff4500',
    coreColor: '#ff4500',
    desc: '首季「賽博頂尖決賽盛典」限定外觀。萃取太陽耀斑能量打造，羽翼光軌宛如鳳凰展翅。',
    vfx: {
      punchTrail: '金紅熾烈高熱羽翼光軌',
      sk1: '旋轉的太陽耀斑火球，帶有火星拖尾',
      sk2: '鳳凰展翅般之沖天烈焰火柱',
      guardShield: '金紅光芒羽翼格擋',
      hitEffect: '熾熱火星迸發'
    },
    creator: 'Season 1 Grand Master'
  }
];
