/**
 * 《CyberStriker: Quantum Arena》
 * 10 大核心標準技能數值與機制規格表
 * 完全符合 GAME_PROJECT_PLAN.md 第 2.4 節
 */

export const SKILLS = [
  {
    id: 'SK-01',
    name: '能量脈衝彈',
    type: 'projectile',
    typeName: '飛行道具',
    cd: 0.8, // 快速冷卻：迅捷壓制
    damage: 120,
    startup: 5,
    active: 60,
    recovery: 6,
    guardType: 'all',
    chipRatio: 0.5,
    description: '掌心聚能射出直線高速波導彈，具備優異的遠程壓制與逼跳能力。',
    counterGuide: '可站立格擋、下蹲格擋，或抓準起跳時機翻越躲避。',
    icon: 'fa-solid fa-bolt',
    color: '#00f3ff'
  },
  {
    id: 'SK-02',
    name: '升龍衝天擊',
    type: 'anti_air',
    typeName: '對空突進',
    cd: 1.2, // 快速冷卻
    damage: 160,
    startup: 3,
    active: 12,
    recovery: 10,
    invincibleFrames: 4,
    guardType: 'all',
    chipRatio: 0.5,
    description: '前 3 幀全身無敵，斜上方高高躍起旋轉昇龍打擊，極致防空與解圍神技。',
    counterGuide: '前搖無敵難以搶攻；若對方落空後搖極長，著地時可進行滿額確反處罰。',
    icon: 'fa-solid fa-dragon',
    color: '#38bdf8'
  },
  {
    id: 'SK-03',
    name: '音速滑踢',
    type: 'low',
    typeName: '下段突進',
    cd: 1.0, // 快速冷卻
    damage: 130,
    startup: 4,
    active: 14,
    recovery: 6,
    guardType: 'crouch_only',
    chipRatio: 0.5,
    knockdown: true,
    description: '貼地疾衝滑鏟，命中必定造成對手下盤失衡擊倒。站立防禦無效！',
    counterGuide: '不可站立防禦，必須迅速切換為下蹲防禦方可化解。',
    icon: 'fa-solid fa-shoe-prints',
    color: '#a855f7'
  },
  {
    id: 'SK-04',
    name: '躍空震地砸',
    type: 'overhead',
    typeName: '中段破防',
    cd: 1.3, // 快速冷卻
    damage: 170,
    startup: 8,
    active: 10,
    recovery: 8,
    guardType: 'stand_only',
    chipRatio: 0.5,
    knockdown: true,
    description: '縱身躍上半空雙拳合錘重擊地面，破除對手下蹲龜縮。下蹲防禦無效！',
    counterGuide: '不可蹲防！看見角色躍起前搖時必須立即切換為站立格擋。',
    icon: 'fa-solid fa-hand-fist',
    color: '#f59e0b'
  },
  {
    id: 'SK-05',
    name: '幻影反擊壁',
    type: 'parry',
    typeName: '架招反制',
    cd: 1.5, // 快速冷卻
    damage: 190,
    startup: 1,
    active: 22,
    recovery: 6,
    guardType: 'none',
    chipRatio: 0.5,
    description: '展開 22 幀的反擊力場。受近身肉搏時直接吸收傷害並反擊擊暈對手。',
    counterGuide: '看見架招力場切勿出拳，直接使用指令摔技（SK-08）或後撤等待收招。',
    icon: 'fa-solid fa-shield-halved',
    color: '#ec4899'
  },
  {
    id: 'SK-06',
    name: '虛空折躍斬',
    type: 'teleport',
    typeName: '位移奇襲',
    cd: 1.8, // 快速冷卻
    damage: 150,
    startup: 5,
    active: 8,
    recovery: 8,
    guardType: 'all',
    chipRatio: 0.5,
    description: '化作殘影直接瞬移至對手正背後劃出橫斬，能穿透一切波導與飛行道具。',
    counterGuide: '對手瞬移消失瞬間，需立刻轉身拉向反方向維持防守姿態。',
    icon: 'fa-solid fa-wand-magic-sparkles',
    color: '#6366f1'
  },
  {
    id: 'SK-07',
    name: '百裂連擊衝',
    type: 'rush',
    typeName: '高段壓制',
    cd: 1.2, // 快速冷卻
    damage: 180,
    startup: 4,
    active: 20,
    recovery: 6,
    guardType: 'all',
    chipRatio: 0.5,
    description: '前跨快速打出 5 連段密集體術，最後一掌擊退對手，削防量與壓迫感極高。',
    counterGuide: '保持連續格擋，等待其打完 5 段進入收招硬直時果斷出拳確反。',
    icon: 'fa-solid fa-meteor',
    color: '#10b981'
  },
  {
    id: 'SK-08',
    name: '磁暴重摔投',
    type: 'command_grab',
    typeName: '指令摔技',
    cd: 1.6, // 快速冷卻
    damage: 210,
    startup: 4,
    active: 6,
    recovery: 8,
    armor: true,
    guardType: 'unblockable',
    chipRatio: 0.5,
    knockdown: true,
    description: '前搖附帶霸體，向前強抓對手狠狠貫入地面，完全無視防禦力場！',
    counterGuide: '無法防禦！不可龜縮防守，必須在距離外起跳躲避或搶先出刺拳打斷。',
    icon: 'fa-solid fa-magnet',
    color: '#e11d48'
  },
  {
    id: 'SK-09',
    name: '奈米震波罩',
    type: 'radial_blast',
    typeName: '擊退防護',
    cd: 1.8, // 快速冷卻
    damage: 100,
    startup: 3,
    active: 10,
    recovery: 6,
    guardType: 'all',
    chipRatio: 0.5,
    knockback: 280,
    description: '周身向外迸發環形脈衝衝擊波，強行推開貼身對手，化解版邊壓制危機。',
    counterGuide: '傷害較低但擊退距離極遠，避免貼身貪刀，保持中距離拉扯。',
    icon: 'fa-solid fa-atom',
    color: '#14b8a6'
  },
  {
    id: 'SK-10',
    name: '超載終結砲',
    type: 'ultimate_beam',
    typeName: '終極巨砲',
    cd: 2.5, // 快速冷卻
    damage: 260,
    startup: 10,
    active: 16,
    recovery: 12,
    guardType: 'all',
    chipRatio: 0.5,
    knockdown: true,
    description: '胸部反應爐超載聚能，射出貫穿全螢幕之離子巨砲，具備毀滅級打擊力。',
    counterGuide: '前搖蓄能明顯，看準光芒及時起跳越過或使用折躍斬奇襲。',
    icon: 'fa-solid fa-sun',
    color: '#f97316'
  }
];

// 三大主流經典戰術流派快捷配置
export const ARCHETYPES = [
  {
    id: 'wave_dp',
    name: '波升控制流',
    desc: '遠程發波逼跳，升龍空中截擊，震波化解近身',
    skills: ['SK-01', 'SK-02', 'SK-09'],
    badge: '經典牽制'
  },
  {
    id: 'low_rush',
    name: '下段狂攻流',
    desc: '交替使用滑踢（下段）與躍空砸（中段）破壞對手防守重心',
    skills: ['SK-03', 'SK-04', 'SK-07'],
    badge: '雙擇破防'
  },
  {
    id: 'counter_cross',
    name: '奇襲反打流',
    desc: '瞬移穿透遠程波導，架招反制近戰，指令摔強制破防',
    skills: ['SK-05', 'SK-06', 'SK-08'],
    badge: '靈活反擊'
  }
];
