(() => {
  // js/data/skills.js
  var SKILLS = [
    {
      id: "SK-01",
      name: "\u80FD\u91CF\u8108\u885D\u5F48",
      type: "projectile",
      typeName: "\u98DB\u884C\u9053\u5177",
      cd: 1.5,
      // 冷卻減半：超快壓制
      damage: 120,
      startup: 6,
      // 前搖減半：極致靈敏
      active: 60,
      // projectile lifespan
      recovery: 8,
      guardType: "all",
      // 站防/蹲防皆可防
      chipRatio: 0.15,
      description: "\u638C\u5FC3\u805A\u80FD\u5C04\u51FA\u76F4\u7DDA\u9AD8\u901F\u6CE2\u5C0E\u5F48\uFF0C\u5177\u5099\u512A\u7570\u7684\u9060\u7A0B\u58D3\u5236\u8207\u903C\u8DF3\u80FD\u529B\u3002",
      counterGuide: "\u53EF\u7AD9\u7ACB\u683C\u64CB\u3001\u4E0B\u8E72\u683C\u64CB\uFF0C\u6216\u6293\u6E96\u8D77\u8DF3\u6642\u6A5F\u7FFB\u8D8A\u8EB2\u907F\u3002",
      icon: "fa-solid fa-bolt",
      color: "#00f3ff"
    },
    {
      id: "SK-02",
      name: "\u5347\u9F8D\u885D\u5929\u64CA",
      type: "anti_air",
      typeName: "\u5C0D\u7A7A\u7A81\u9032",
      cd: 2,
      // 冷卻減半
      damage: 160,
      startup: 3,
      // 前 3 幀全身無敵，秒出升龍
      active: 12,
      recovery: 12,
      invincibleFrames: 4,
      guardType: "all",
      chipRatio: 0.15,
      description: "\u524D 3 \u5E40\u5168\u8EAB\u7121\u6575\uFF0C\u659C\u4E0A\u65B9\u9AD8\u9AD8\u8E8D\u8D77\u65CB\u8F49\u6607\u9F8D\u6253\u64CA\uFF0C\u6975\u81F4\u9632\u7A7A\u8207\u89E3\u570D\u795E\u6280\u3002",
      counterGuide: "\u524D\u6416\u7121\u6575\u96E3\u4EE5\u6436\u653B\uFF1B\u82E5\u5C0D\u65B9\u843D\u7A7A\u5F8C\u6416\u6975\u9577\uFF0C\u8457\u5730\u6642\u53EF\u9032\u884C\u6EFF\u984D\u78BA\u53CD\u8655\u7F70\u3002",
      icon: "fa-solid fa-dragon",
      color: "#38bdf8"
    },
    {
      id: "SK-03",
      name: "\u97F3\u901F\u6ED1\u8E22",
      type: "low",
      typeName: "\u4E0B\u6BB5\u7A81\u9032",
      cd: 1.8,
      // 冷卻縮短
      damage: 130,
      startup: 5,
      // 靈敏啟動
      active: 14,
      recovery: 8,
      guardType: "crouch_only",
      // 站防強制破防！必須蹲防
      chipRatio: 0.15,
      knockdown: true,
      description: "\u8CBC\u5730\u75BE\u885D\u6ED1\u93DF\uFF0C\u547D\u4E2D\u5FC5\u5B9A\u9020\u6210\u5C0D\u624B\u4E0B\u76E4\u5931\u8861\u64CA\u5012\u3002\u7AD9\u7ACB\u9632\u79A6\u7121\u6548\uFF01",
      counterGuide: "\u4E0D\u53EF\u7AD9\u7ACB\u9632\u79A6\uFF0C\u5FC5\u9808\u8FC5\u901F\u5207\u63DB\u70BA\u4E0B\u8E72\u9632\u79A6\u65B9\u53EF\u5316\u89E3\u3002",
      icon: "fa-solid fa-shoe-prints",
      color: "#a855f7"
    },
    {
      id: "SK-04",
      name: "\u8E8D\u7A7A\u9707\u5730\u7838",
      type: "overhead",
      typeName: "\u4E2D\u6BB5\u7834\u9632",
      cd: 2.5,
      // 冷卻縮短
      damage: 170,
      startup: 10,
      // 靈敏起跳下砸
      active: 10,
      recovery: 10,
      guardType: "stand_only",
      // 蹲防強制破防！必須站防
      chipRatio: 0.15,
      knockdown: true,
      description: "\u7E31\u8EAB\u8E8D\u4E0A\u534A\u7A7A\u96D9\u62F3\u5408\u9318\u91CD\u64CA\u5730\u9762\uFF0C\u7834\u9664\u5C0D\u624B\u4E0B\u8E72\u9F9C\u7E2E\u3002\u4E0B\u8E72\u9632\u79A6\u7121\u6548\uFF01",
      counterGuide: "\u4E0D\u53EF\u8E72\u9632\uFF01\u770B\u898B\u89D2\u8272\u8E8D\u8D77\u524D\u6416\u6642\u5FC5\u9808\u7ACB\u5373\u5207\u63DB\u70BA\u7AD9\u7ACB\u683C\u64CB\u3002",
      icon: "fa-solid fa-hand-fist",
      color: "#f59e0b"
    },
    {
      id: "SK-05",
      name: "\u5E7B\u5F71\u53CD\u64CA\u58C1",
      type: "parry",
      typeName: "\u67B6\u62DB\u53CD\u5236",
      cd: 3,
      // 冷卻縮短
      damage: 190,
      startup: 1,
      // 1 幀極限瞬發架招
      active: 22,
      // 22 幀架招判定力場
      recovery: 8,
      guardType: "none",
      description: "\u5C55\u958B 22 \u5E40\u7684\u53CD\u64CA\u529B\u5834\u3002\u53D7\u8FD1\u8EAB\u8089\u640F\u6642\u76F4\u63A5\u5438\u6536\u50B7\u5BB3\u4E26\u53CD\u64CA\u64CA\u6688\u5C0D\u624B\u3002",
      counterGuide: "\u770B\u898B\u67B6\u62DB\u529B\u5834\u5207\u52FF\u51FA\u62F3\uFF0C\u76F4\u63A5\u4F7F\u7528\u6307\u4EE4\u6454\u6280\uFF08SK-08\uFF09\u6216\u5F8C\u64A4\u7B49\u5F85\u6536\u62DB\u3002",
      icon: "fa-solid fa-shield-halved",
      color: "#ec4899"
    },
    {
      id: "SK-06",
      name: "\u865B\u7A7A\u6298\u8E8D\u65AC",
      type: "teleport",
      typeName: "\u4F4D\u79FB\u5947\u8972",
      cd: 3.5,
      // 冷卻縮短
      damage: 150,
      startup: 6,
      // 瞬發背刺
      active: 8,
      recovery: 10,
      guardType: "all",
      chipRatio: 0.15,
      description: "\u5316\u4F5C\u6B98\u5F71\u76F4\u63A5\u77AC\u79FB\u81F3\u5C0D\u624B\u6B63\u80CC\u5F8C\u5283\u51FA\u6A6B\u65AC\uFF0C\u80FD\u7A7F\u900F\u4E00\u5207\u6CE2\u5C0E\u8207\u98DB\u884C\u9053\u5177\u3002",
      counterGuide: "\u5C0D\u624B\u77AC\u79FB\u6D88\u5931\u77AC\u9593\uFF0C\u9700\u7ACB\u523B\u8F49\u8EAB\u62C9\u5411\u53CD\u65B9\u5411\u7DAD\u6301\u9632\u5B88\u59FF\u614B\u3002",
      icon: "fa-solid fa-wand-magic-sparkles",
      color: "#6366f1"
    },
    {
      id: "SK-07",
      name: "\u767E\u88C2\u9023\u64CA\u885D",
      type: "rush",
      typeName: "\u9AD8\u6BB5\u58D3\u5236",
      cd: 2.2,
      // 冷卻縮短
      damage: 180,
      startup: 4,
      // 快速前突
      active: 24,
      // 5連段快速打擊
      recovery: 8,
      guardType: "all",
      chipRatio: 0.25,
      // 較高削防
      description: "\u524D\u8DE8\u5FEB\u901F\u6253\u51FA 5 \u9023\u6BB5\u5BC6\u96C6\u9AD4\u8853\uFF0C\u6700\u5F8C\u4E00\u638C\u64CA\u9000\u5C0D\u624B\uFF0C\u524A\u9632\u91CF\u8207\u58D3\u8FEB\u611F\u6975\u9AD8\u3002",
      counterGuide: "\u4FDD\u6301\u9023\u7E8C\u683C\u64CB\uFF0C\u7B49\u5F85\u5176\u6253\u5B8C 5 \u6BB5\u9032\u5165\u6536\u62DB\u786C\u76F4\u6642\u679C\u65B7\u51FA\u62F3\u78BA\u53CD\u3002",
      icon: "fa-solid fa-meteor",
      color: "#10b981"
    },
    {
      id: "SK-08",
      name: "\u78C1\u66B4\u91CD\u6454\u6295",
      type: "command_grab",
      typeName: "\u6307\u4EE4\u6454\u6280",
      cd: 3,
      // 冷卻縮短
      damage: 210,
      startup: 4,
      // 快速抓取
      active: 6,
      recovery: 10,
      armor: true,
      // 前搖帶有霸體
      guardType: "unblockable",
      // 完全無視防禦
      knockdown: true,
      description: "\u524D\u6416\u9644\u5E36\u9738\u9AD4\uFF0C\u5411\u524D\u5F37\u6293\u5C0D\u624B\u72E0\u72E0\u8CAB\u5165\u5730\u9762\uFF0C\u5B8C\u5168\u7121\u8996\u9632\u79A6\u529B\u5834\uFF01",
      counterGuide: "\u7121\u6CD5\u9632\u79A6\uFF01\u4E0D\u53EF\u9F9C\u7E2E\u9632\u5B88\uFF0C\u5FC5\u9808\u5728\u8DDD\u96E2\u5916\u8D77\u8DF3\u8EB2\u907F\u6216\u6436\u5148\u51FA\u523A\u62F3\u6253\u65B7\u3002",
      icon: "fa-solid fa-magnet",
      color: "#e11d48"
    },
    {
      id: "SK-09",
      name: "\u5948\u7C73\u9707\u6CE2\u7F69",
      type: "radial_blast",
      typeName: "\u64CA\u9000\u9632\u8B77",
      cd: 3.5,
      // 冷卻縮短
      damage: 100,
      startup: 3,
      // 快速解圍
      active: 10,
      recovery: 8,
      guardType: "all",
      chipRatio: 0.1,
      knockback: 280,
      description: "\u5468\u8EAB\u5411\u5916\u8FF8\u767C\u74B0\u5F62\u8108\u885D\u885D\u64CA\u6CE2\uFF0C\u5F37\u884C\u63A8\u958B\u8CBC\u8EAB\u5C0D\u624B\uFF0C\u5316\u89E3\u7248\u908A\u58D3\u5236\u5371\u6A5F\u3002",
      counterGuide: "\u50B7\u5BB3\u8F03\u4F4E\u4F46\u64CA\u9000\u8DDD\u96E2\u6975\u9060\uFF0C\u907F\u514D\u8CBC\u8EAB\u8CAA\u5200\uFF0C\u4FDD\u6301\u4E2D\u8DDD\u96E2\u62C9\u626F\u3002",
      icon: "fa-solid fa-atom",
      color: "#14b8a6"
    },
    {
      id: "SK-10",
      name: "\u8D85\u8F09\u7D42\u7D50\u7832",
      type: "ultimate_beam",
      typeName: "\u7D42\u6975\u5DE8\u7832",
      cd: 5,
      // 冷卻大幅縮短至 5 秒
      damage: 260,
      startup: 12,
      // 蓄能加快
      active: 16,
      recovery: 16,
      guardType: "all",
      chipRatio: 0.35,
      // 即使被擋也造成極高削防
      knockdown: true,
      description: "\u80F8\u90E8\u53CD\u61C9\u7210\u8D85\u8F09\u805A\u80FD\uFF0C\u5C04\u51FA\u8CAB\u7A7F\u5168\u87A2\u5E55\u4E4B\u96E2\u5B50\u5DE8\u7832\uFF0C\u5177\u5099\u6BC0\u6EC5\u7D1A\u6253\u64CA\u529B\u3002",
      counterGuide: "\u524D\u6416\u84C4\u80FD\u660E\u986F\uFF0C\u770B\u6E96\u5149\u8292\u53CA\u6642\u8D77\u8DF3\u8D8A\u904E\u6216\u4F7F\u7528\u6298\u8E8D\u65AC\u5947\u8972\u3002",
      icon: "fa-solid fa-sun",
      color: "#f97316"
    }
  ];
  var ARCHETYPES = [
    {
      id: "wave_dp",
      name: "\u6CE2\u5347\u63A7\u5236\u6D41",
      desc: "\u9060\u7A0B\u767C\u6CE2\u903C\u8DF3\uFF0C\u5347\u9F8D\u7A7A\u4E2D\u622A\u64CA\uFF0C\u9707\u6CE2\u5316\u89E3\u8FD1\u8EAB",
      skills: ["SK-01", "SK-02", "SK-09"],
      badge: "\u7D93\u5178\u727D\u5236"
    },
    {
      id: "low_rush",
      name: "\u4E0B\u6BB5\u72C2\u653B\u6D41",
      desc: "\u4EA4\u66FF\u4F7F\u7528\u6ED1\u8E22\uFF08\u4E0B\u6BB5\uFF09\u8207\u8E8D\u7A7A\u7838\uFF08\u4E2D\u6BB5\uFF09\u7834\u58DE\u5C0D\u624B\u9632\u5B88\u91CD\u5FC3",
      skills: ["SK-03", "SK-04", "SK-07"],
      badge: "\u96D9\u64C7\u7834\u9632"
    },
    {
      id: "counter_cross",
      name: "\u5947\u8972\u53CD\u6253\u6D41",
      desc: "\u77AC\u79FB\u7A7F\u900F\u9060\u7A0B\u6CE2\u5C0E\uFF0C\u67B6\u62DB\u53CD\u5236\u8FD1\u6230\uFF0C\u6307\u4EE4\u6454\u5F37\u5236\u7834\u9632",
      skills: ["SK-05", "SK-06", "SK-08"],
      badge: "\u9748\u6D3B\u53CD\u64CA"
    }
  ];

  // js/data/skins.js
  var SKINS = [
    // ── 3 套初始預設外觀 ──
    {
      id: "skin_cyber_warrior",
      name: "\u8CFD\u535A\u6B66\u8005",
      title: "\u5168\u606F\u524D\u7DDA\u5C16\u5175",
      category: "default",
      series: "\u7D93\u5178\u5148\u92D2",
      price: 0,
      isDefault: true,
      themeColor: "#00f3ff",
      secondaryColor: "#ffffff",
      glowColor: "rgba(0, 243, 255, 0.6)",
      accentColor: "#38bdf8",
      armorColor: "#0f172a",
      visorColor: "#00f3ff",
      coreColor: "#00f3ff",
      desc: "\u6A19\u6E96\u914D\u7F6E\u578B\u5168\u606F\u6B66\u88DD\uFF0C\u6D41\u66A2\u7684\u4EBA\u9AD4\u5DE5\u5B78\u5E7E\u4F55\u5916\u88DD\uFF0C\u642D\u8F09\u7B2C 4 \u4EE3\u91CF\u5B50\u5149\u5B50\u53CD\u61C9\u7210\u3002",
      vfx: {
        punchTrail: "\u9752\u85CD\u8272\u5168\u606F\u6578\u4F4D\u5200\u5149\u3001\u5168\u606F\u5149\u65B9\u584A",
        sk1: "\u9752\u85CD\u8272\u7B49\u96E2\u5B50\u96FB\u6F3F\u7403\uFF0C\u9644\u5E36\u85CD\u8272\u96FB\u6D41\u62D6\u5C3E",
        sk2: "\u62D4\u5730\u800C\u8D77\u4E4B\u9752\u8272\u65CB\u8F49\u96FB\u5F27\u5149\u67F1",
        guardShield: "\u5168\u606F\u7ACB\u65B9\u9AD4\u5E7E\u4F55\u9632\u79A6\u9663",
        hitEffect: "\u85CD\u8272\u6676\u7247\u706B\u82B1"
      },
      creator: "Official Core"
    },
    {
      id: "skin_neon_shadow",
      name: "\u9713\u8679\u6697\u5F71\u523A\u5BA2",
      title: "\u6697\u5F71\u533F\u8E64\u99ED\u5BA2",
      category: "default",
      series: "\u6697\u591C\u9713\u8679",
      price: 0,
      isDefault: true,
      themeColor: "#ff007f",
      secondaryColor: "#c084fc",
      glowColor: "rgba(255, 0, 127, 0.6)",
      accentColor: "#e879f9",
      armorColor: "#180d24",
      visorColor: "#ff007f",
      coreColor: "#ff007f",
      desc: "\u5C08\u70BA\u591C\u9593\u6F5B\u5165\u8A2D\u8A08\u7684\u6697\u5F71\u5916\u88DD\uFF0C\u6B66\u5668\u642D\u8F09\u6D0B\u7D05\u8D85\u983B\u9AD8\u983B\u5149\u5203\u8207\u6AFB\u82B1\u7159\u9727\u533F\u8E64\u5857\u5C64\u3002",
      vfx: {
        punchTrail: "\u6D0B\u7D05\u80FD\u91CF\u5149\u5203\u5207\u75D5\u3001\u6697\u5F71\u6B98\u50CF",
        sk1: "\u6D0B\u7D05\u6AFB\u82B1\u72C0\u5149\u5B50\u87BA\u65CB\u5F48\uFF0C\u62D6\u66F3\u6697\u5F71\u7159\u9727",
        sk2: "\u7D2B\u8272\u6607\u7A7A\u6697\u5F71\u65CB\u98A8\uFF0C\u4F34\u96A8\u6AFB\u82B1\u7C92\u5B50",
        guardShield: "\u6697\u5F71\u7159\u5E55\u5E7E\u4F55\u8B77\u76FE",
        hitEffect: "\u7C89\u7D2B\u5149\u8292\u65AC\u75D5"
      },
      creator: "Official Core"
    },
    {
      id: "skin_pulse_enforcer",
      name: "\u8108\u885D\u91CD\u88DD\u57F7\u6CD5\u5B98",
      title: "\u6975\u9650\u8B66\u5099\u91CD\u88DD",
      category: "default",
      series: "\u91CD\u88DD\u9632\u79A6",
      price: 0,
      isDefault: true,
      themeColor: "#ffd700",
      secondaryColor: "#f59e0b",
      glowColor: "rgba(255, 215, 0, 0.6)",
      accentColor: "#fbbf24",
      armorColor: "#1c1917",
      visorColor: "#ffd700",
      coreColor: "#ffd700",
      desc: "\u7279\u7A2E\u6CBB\u5B89\u88DD\u7532\uFF0C\u539A\u91CD\u91D1\u5C6C\u9676\u74F7\u88DD\u7532\u677F\u8207\u8D85\u5C0E\u91CD\u529B\u767C\u96FB\u6A5F\uFF0C\u51FA\u62F3\u9644\u5E36\u96FB\u9583\u96F7\u9CF4\u3002",
      vfx: {
        punchTrail: "\u91D1\u8272\u91D1\u5C6C\u91CD\u62F3\u6C23\u6D6A\u3001\u91D1\u9EC3\u7206\u88C2\u96FB\u78C1",
        sk1: "\u91D1\u9EC3\u8272\u91CD\u97F3\u7206\u9707\u6CE2\u5F48\uFF0C\u5E36\u6709\u91CD\u529B\u6CE2\u5708",
        sk2: "\u91D1\u8272\u96FB\u9583\u96F7\u9CF4\u5DE8\u62F3\uFF0C\u9707\u788E\u5730\u9762\u88C2\u75D5",
        guardShield: "\u91D1\u8272\u83F1\u5F62\u539A\u7532\u8B77\u76FE",
        hitEffect: "\u91D1\u9EC3\u8272\u96F7\u96FB\u70B8\u88C2"
      },
      creator: "Official Core"
    },
    // ── 商城熱門角色 (依價格梯度排列，豐富多元風格) ──
    {
      id: "skin_cosmic_ronin",
      name: "\u661F\u7A79\u91CF\u5B50\u6D6A\u4EBA",
      title: "\u661F\u969B\u6D41\u6D6A\u5C45\u5408\u528D\u5BA2",
      category: "shop",
      series: "\u6771\u65B9\u6A5F\u6B66",
      price: 1800,
      isDefault: false,
      themeColor: "#818cf8",
      secondaryColor: "#c084fc",
      glowColor: "rgba(129, 140, 248, 0.6)",
      accentColor: "#a5b4fc",
      armorColor: "#1e1b4b",
      visorColor: "#818cf8",
      coreColor: "#c084fc",
      desc: "\u6F2B\u904A\u661F\u96F2\u7684\u7121\u4E3B\u6B66\u58EB\uFF0C\u4F69\u6234\u647A\u758A\u96FB\u6F3F\u592A\u5200\uFF0C\u51FA\u62DB\u5982\u6D41\u661F\u96E8\u822C\u7D62\u9E97\u6D41\u66A2\u3002",
      vfx: {
        punchTrail: "\u975B\u85CD\u661F\u5875\u5200\u5F27\u3001\u661F\u8292\u6B98\u8DE1",
        sk1: "\u7D2B\u85CD\u8272\u5F57\u661F\u6838\u5FC3\u5F48\uFF0C\u62D6\u66F3\u661F\u5875\u661F\u74B0",
        sk2: "\u7834\u7A7A\u6C96\u5929\u4E4B\u661F\u96F2\u6F29\u6E26\u65AC",
        guardShield: "\u661F\u74B0\u516B\u5366\u8B77\u9AD4\u9663",
        hitEffect: "\u7480\u74A8\u661F\u5C51\u8FF8\u767C"
      },
      creator: "Community Workshop (PR #19)"
    },
    {
      id: "skin_volt_ranger",
      name: "\u96F7\u9706\u795E\u901F\u904A\u4FE0",
      title: "\u8D85\u97F3\u901F\u96FB\u78C1\u5148\u92D2",
      category: "shop",
      series: "\u5143\u7D20\u8D85\u8F09",
      price: 2e3,
      isDefault: false,
      themeColor: "#facc15",
      secondaryColor: "#fde047",
      glowColor: "rgba(250, 204, 21, 0.6)",
      accentColor: "#eab308",
      armorColor: "#1a1702",
      visorColor: "#facc15",
      coreColor: "#fde047",
      desc: "\u5B89\u88DD\u8D85\u9AD8\u58D3\u7279\u65AF\u62C9\u7DDA\u5708\u7684\u6975\u901F\u523A\u5BA2\uFF0C\u5468\u8EAB\u6C38\u9060\u74B0\u7E5E\u8457\u6ECB\u6ECB\u4F5C\u97FF\u7684\u767E\u842C\u4F0F\u7279\u9AD8\u58D3\u96FB\u5F27\u3002",
      vfx: {
        punchTrail: "\u91D1\u9EC3\u9023\u9396\u9583\u96FB\u9739\u9742\u5149\u75D5",
        sk1: "\u9AD8\u983B\u65CB\u8F49\u7279\u65AF\u62C9\u7403\u578B\u9583\u96FB",
        sk2: "\u5F15\u96F7\u6C96\u5929\u4E4B\u66B4\u98A8\u96F7\u67F1",
        guardShield: "\u767E\u842C\u4F0F\u7279\u96FB\u78C1\u611F\u61C9\u7F69",
        hitEffect: "\u9AD8\u58D3\u96FB\u706B\u82B1\u70B8\u88C2"
      },
      creator: "Community Workshop (PR #24)"
    },
    {
      id: "skin_abyssal_ghost",
      name: "\u6DF1\u6DF5\u5E7D\u9748\u7279\u5DE5",
      title: "\u9ED1\u6C34\u6DF1\u6D77\u533F\u8E64\u523A\u5BA2",
      category: "shop",
      series: "\u7279\u52E4\u8ADC\u5F71",
      price: 2200,
      isDefault: false,
      themeColor: "#06b6d4",
      secondaryColor: "#22d3ee",
      glowColor: "rgba(6, 182, 212, 0.6)",
      accentColor: "#67e8f9",
      armorColor: "#082f49",
      visorColor: "#06b6d4",
      coreColor: "#06b6d4",
      desc: "\u914D\u5099\u5168\u50CF\u6298\u5C04\u8FF7\u5F69\u8207\u6C34\u51B7\u53CD\u61C9\u5806\u7684\u5E7D\u9748\u7279\u52D9\uFF0C\u5728\u9ED1\u6697\u4E2D\u5B9B\u5982\u6DF1\u6D77\u63A0\u98DF\u8005\u822C\u81F4\u547D\u3002",
      vfx: {
        punchTrail: "\u9752\u78A7\u8272\u6C34\u6CE2\u6F23\u6F2A\u5149\u8ECC",
        sk1: "\u9AD8\u58D3\u6C34\u6D41\u7B49\u96E2\u5B50\u7A7F\u7532\u5F48",
        sk2: "\u65CB\u8F49\u5347\u9A30\u4E4B\u6DF1\u6D77\u6F29\u6E26\u5674\u5C04\u6D41",
        guardShield: "\u8D85\u6D41\u9AD4\u6298\u5C04\u5E7E\u4F55\u529B\u5834",
        hitEffect: "\u6C34\u85CD\u8272\u8072\u7D0D\u8108\u885D\u74B0"
      },
      creator: "Community Workshop (PR #31)"
    },
    {
      id: "skin_dark_hacker",
      name: "\u6697\u9ED1\u99ED\u5BA2",
      title: "\u4E8C\u9032\u5236\u6DF1\u7DB2\u5E7B\u5F71",
      category: "shop",
      series: "\u77E9\u9663\u4EE3\u78BC",
      price: 2500,
      isDefault: false,
      themeColor: "#00ff66",
      secondaryColor: "#34d399",
      glowColor: "rgba(0, 255, 102, 0.6)",
      accentColor: "#10b981",
      armorColor: "#052e16",
      visorColor: "#00ff66",
      coreColor: "#00ff66",
      desc: "\u6DF1\u7DB2\u6F2B\u904A\u8005\u7684\u795E\u79D8\u9ED1\u5BA2\u88DD\uFF0C\u5168\u8EAB\u6E67\u52D5\u8457 0 \u8207 1 \u7684\u4E8C\u9032\u5236\u7DA0\u8272\u4EE3\u78BC\u6D41\uFF0C\u65AC\u64CA\u7834\u58DE\u73FE\u5BE6\u3002",
      vfx: {
        punchTrail: "\u7DA0\u8272 0 \u8207 1 \u4E8C\u9032\u5236\u4EE3\u78BC\u6D41\u63EE\u780D",
        sk1: "\u7DA0\u8272\u7D42\u7AEF\u5B57\u7B26\u4EE3\u78BC\u5149\u675F\u7403",
        sk2: "\u5782\u76F4\u5347\u9A30\u4E4B\u7DA0\u8272\u6578\u64DA\u77E9\u9663\u5149\u7246",
        guardShield: "\u7DA0\u8272\u6383\u63CF\u7DDA\u4EE3\u78BC\u529B\u5834",
        hitEffect: "\u7DA0\u8272\u50CF\u7D20\u6578\u64DA\u5149\u5875"
      },
      creator: "Community Workshop (PR #42)"
    },
    {
      id: "skin_nano_cyborg",
      name: "\u5948\u7C73\u751F\u5316\u6230\u8B66",
      title: "\u751F\u5316\u6DB2\u614B\u91D1\u5C6C\u6539\u9020\u4EBA",
      category: "shop",
      series: "\u751F\u5316\u79D1\u6280",
      price: 2600,
      isDefault: false,
      themeColor: "#84cc16",
      secondaryColor: "#a3e635",
      glowColor: "rgba(132, 204, 22, 0.6)",
      accentColor: "#65a30d",
      armorColor: "#142005",
      visorColor: "#84cc16",
      coreColor: "#bef264",
      desc: "\u56DB\u80A2\u7531\u5341\u5104\u7D1A\u5948\u7C73\u6A5F\u68B0\u7FA4\u69CB\u6210\uFF0C\u51FA\u62F3\u6642\u6DB2\u614B\u91D1\u5C6C\u80FD\u96A8\u5FC3\u6240\u6B32\u8B8A\u5F62\u70BA\u5C16\u523A\u8207\u5DE8\u5203\u3002",
      vfx: {
        punchTrail: "\u6BD2\u7DA0\u6DB2\u614B\u91D1\u5C6C\u8B8A\u5F62\u523A\u5203\u5149\u75D5",
        sk1: "\u5BC6\u96C6\u8702\u7FA4\u5948\u7C73\u6A5F\u68B0\u5718",
        sk2: "\u6DB2\u614B\u91D1\u5C6C\u5DE8\u77DB\u6C96\u5929\u7A7F\u523A",
        guardShield: "\u516D\u89D2\u5948\u7C73\u81EA\u6211\u4FEE\u5FA9\u76FE",
        hitEffect: "\u8702\u5DE2\u6676\u683C\u91D1\u5C6C\u788E\u5C51"
      },
      creator: "Community Workshop (PR #48)"
    },
    {
      id: "skin_crimson_tyrant",
      name: "\u8D64\u7D05\u66B4\u541B\u91CD\u6A5F\u7532",
      title: "\u7194\u5CA9\u8D85\u8F09\u91CD\u88DD\u72C2\u6230\u58EB",
      category: "shop",
      series: "\u91CD\u88DD\u9632\u79A6",
      price: 2800,
      isDefault: false,
      themeColor: "#ef4444",
      secondaryColor: "#f97316",
      glowColor: "rgba(239, 68, 68, 0.6)",
      accentColor: "#dc2626",
      armorColor: "#2b0707",
      visorColor: "#ef4444",
      coreColor: "#f97316",
      desc: "\u91CD\u578B\u8FD1\u6230\u653B\u57CE\u6A5F\u7532\uFF0C\u642D\u8F09\u7194\u5CA9\u904E\u71B1\u52D5\u529B\u7210\uFF0C\u6BCF\u4E00\u6B21\u91CD\u62F3\u63EE\u52D5\u7686\u4F34\u96A8\u6FC3\u7159\u8207\u9AD8\u6EAB\u7194\u6E23\u3002",
      vfx: {
        punchTrail: "\u71BE\u7D05\u7194\u5CA9\u904E\u71B1\u91CD\u62F3\u5149\u75D5\u3001\u706B\u661F\u56DB\u6FFA",
        sk1: "\u9AD8\u6EAB\u71C3\u71D2\u7194\u5CA9\u5DE8\u7403\uFF0C\u5E36\u9ED1\u7159\u5C3E\u8DE1",
        sk2: "\u706B\u5C71\u5674\u767C\u822C\u5730\u88C2\u706B\u67F1\u5347\u9A30",
        guardShield: "\u5C16\u523A\u91CD\u88DD\u751F\u9435\u71BE\u708E\u76FE",
        hitEffect: "\u8D64\u7D05\u9AD8\u71B1\u706B\u82B1\u788E\u88C2"
      },
      creator: "Community Workshop (PR #53)"
    },
    {
      id: "skin_cryo_maiden",
      name: "\u6975\u5BD2\u8D85\u5C0E\u6B66\u59EC",
      title: "\u7D55\u5C0D\u96F6\u5EA6\u51B0\u6676\u5B88\u885B",
      category: "shop",
      series: "\u5143\u7D20\u8D85\u8F09",
      price: 3e3,
      isDefault: false,
      themeColor: "#38bdf8",
      secondaryColor: "#e0f2fe",
      glowColor: "rgba(56, 189, 248, 0.6)",
      accentColor: "#7dd3fc",
      armorColor: "#08253a",
      visorColor: "#38bdf8",
      coreColor: "#bae6fd",
      desc: "\u642D\u8F09\u8D85\u5C0E\u4F4E\u6EAB\u51B7\u51CD\u6280\u8853\u7684\u6230\u9B25\u4EBA\u5F62\uFF0C\u5468\u8EAB\u7C60\u7F69\u8457\u6975\u81F4\u7684\u51B0\u85CD\u5BD2\u971C\u8207\u947D\u77F3\u51B0\u6676\u5875\u57C3\u3002",
      vfx: {
        punchTrail: "\u96EA\u767D\u51B0\u7A1C\u5207\u9762\u3001\u51B0\u971C\u5149\u9727",
        sk1: "\u65CB\u8F49\u6975\u5BD2\u51B0\u9B44\u6C34\u6676\u5F48",
        sk2: "\u62D4\u5730\u800C\u8D77\u4E4B\u53C3\u5929\u51B0\u523A\u5DE8\u5854",
        guardShield: "\u947D\u77F3\u7A1C\u93E1\u51B0\u58C1\u9632\u79A6",
        hitEffect: "\u51B0\u6676\u788E\u88C2\u6676\u7469\u96EA\u82B1"
      },
      creator: "Community Workshop (PR #59)"
    },
    {
      id: "skin_void_devourer",
      name: "\u865B\u7A7A\u541E\u566C\u8005",
      title: "\u53CD\u7269\u8CEA\u9ED1\u6D1E\u5947\u9EDE\u884C\u8005",
      category: "shop",
      series: "\u672A\u4F86\u6A5F\u795E",
      price: 3200,
      isDefault: false,
      themeColor: "#9333ea",
      secondaryColor: "#a855f7",
      glowColor: "rgba(147, 51, 234, 0.6)",
      accentColor: "#7e22ce",
      armorColor: "#0a0212",
      visorColor: "#c084fc",
      coreColor: "#9333ea",
      desc: "\u7531\u6697\u7269\u8CEA\u80FD\u91CF\u51DD\u805A\u800C\u6210\u7684\u7570\u6B21\u5143\u7375\u624B\uFF0C\u6838\u5FC3\u5982\u540C\u5FAE\u578B\u9ED1\u6D1E\uFF0C\u80FD\u541E\u566C\u5468\u906D\u7684\u5149\u7DDA\u8207\u7A7A\u9593\u3002",
      vfx: {
        punchTrail: "\u6DF1\u7D2B\u9ED1\u6D1E\u91CD\u529B\u6CE2\u5207\u75D5",
        sk1: "\u65CB\u8F49\u7684\u53CD\u7269\u8CEA\u574D\u7E2E\u9ED1\u6D1E\u7403",
        sk2: "\u865B\u7A7A\u6495\u88C2\u7DAD\u5EA6\u88C2\u9699\u5149\u67F1",
        guardShield: "\u4E8B\u4EF6\u8996\u754C\u5F15\u529B\u504F\u6298\u76FE",
        hitEffect: "\u7DAD\u5EA6\u7834\u788E\u6697\u5F71\u88C2\u7D0B"
      },
      creator: "Community Workshop (PR #65)"
    },
    {
      id: "skin_solar_valkyrie",
      name: "\u592A\u967D\u5973\u6B66\u795E",
      title: "\u6046\u661F\u70C8\u7130\u6230\u795E",
      category: "event",
      series: "\u7D42\u6975\u5178\u85CF",
      price: 3500,
      isDefault: false,
      themeColor: "#ff4500",
      secondaryColor: "#fbbf24",
      glowColor: "rgba(255, 69, 0, 0.6)",
      accentColor: "#f97316",
      armorColor: "#270802",
      visorColor: "#ff4500",
      coreColor: "#ff4500",
      desc: "\u9996\u5B63\u300C\u8CFD\u535A\u9802\u5C16\u6C7A\u8CFD\u76DB\u5178\u300D\u9650\u5B9A\u5916\u89C0\u3002\u8403\u53D6\u592A\u967D\u8000\u6591\u80FD\u91CF\u6253\u9020\uFF0C\u7FBD\u7FFC\u5149\u8ECC\u5B9B\u5982\u9CF3\u51F0\u5C55\u7FC5\u3002",
      vfx: {
        punchTrail: "\u91D1\u7D05\u71BE\u70C8\u9AD8\u71B1\u7FBD\u7FFC\u5149\u8ECC",
        sk1: "\u65CB\u8F49\u7684\u592A\u967D\u8000\u6591\u706B\u7403\uFF0C\u5E36\u6709\u706B\u661F\u62D6\u5C3E",
        sk2: "\u9CF3\u51F0\u5C55\u7FC5\u822C\u4E4B\u6C96\u5929\u70C8\u7130\u706B\u67F1",
        guardShield: "\u91D1\u7D05\u5149\u8292\u7FBD\u7FFC\u683C\u64CB",
        hitEffect: "\u71BE\u71B1\u706B\u661F\u8FF8\u767C"
      },
      creator: "Season 1 Grand Master"
    },
    {
      id: "skin_cyber_diva",
      name: "\u8CFD\u535A\u6B4C\u59EC\u97F3\u5F8B",
      title: "\u5168\u606F\u96FB\u5B50\u97F3\u6A02\u865B\u64EC\u5076\u50CF",
      category: "shop",
      series: "\u6697\u591C\u9713\u8679",
      price: 3800,
      isDefault: false,
      themeColor: "#14b8a6",
      secondaryColor: "#f43f5e",
      glowColor: "rgba(20, 184, 166, 0.6)",
      accentColor: "#2dd4bf",
      armorColor: "#042f2e",
      visorColor: "#14b8a6",
      coreColor: "#f43f5e",
      desc: "\u5C07\u96FB\u5B50\u97F3\u6A02\u7B49\u5316\u5668\u8F49\u5316\u70BA\u6B66\u88DD\u7684\u5168\u606F\u6B4C\u59EC\uFF0C\u63EE\u62F3\u5E36\u6709\u97F3\u5F8B\u7B26\u865F\uFF0C\u6230\u9B25\u5B9B\u5982\u76DB\u5927\u6F14\u5531\u6703\u3002",
      vfx: {
        punchTrail: "\u9752\u7DA0/\u6843\u7D05\u96D9\u8272\u52D5\u614B\u7B49\u5316\u5668\u97F3\u6CE2\u6CE2\u5F62",
        sk1: "\u5168\u606F\u516B\u5206\u97F3\u7B26\u8207\u9AD8\u97F3\u8B5C\u865F\u97F3\u7206\u7403",
        sk2: "\u4E03\u5F69\u9713\u8679\u821E\u53F0\u805A\u5149\u71C8\u97F3\u5F8B\u5149\u67F1",
        guardShield: "\u52D5\u611F\u8072\u6CE2\u983B\u8B5C\u5E7E\u4F55\u9632\u8B77\u5C4F",
        hitEffect: "\u8DF3\u8E8D\u7684\u97F3\u7B26\u8207\u70AB\u5F69\u7C92\u5B50"
      },
      creator: "Community Workshop (PR #77)"
    },
    {
      id: "skin_archangel_judicator",
      name: "\u66DC\u767D\u88C1\u6C7A\u8056\u4F7F",
      title: "\u5149\u5B50\u8056\u5F8B\u7D42\u6975\u57F7\u884C\u8005",
      category: "shop",
      series: "\u672A\u4F86\u6A5F\u795E",
      price: 4e3,
      isDefault: false,
      themeColor: "#f8fafc",
      secondaryColor: "#38bdf8",
      glowColor: "rgba(248, 250, 252, 0.7)",
      accentColor: "#93c5fd",
      armorColor: "#1e293b",
      visorColor: "#38bdf8",
      coreColor: "#f8fafc",
      desc: "\u901A\u9AD4\u63A1\u7528\u7D14\u767D\u5948\u7C73\u9676\u74F7\u8207\u767D\u91D1\u88DD\u7532\u7684\u9AD8\u6F54\u6B66\u88DD\uFF0C\u80CC\u5F8C\u5C55\u9732\u516D\u9053\u7D14\u5149\u5B50\u69CB\u6210\u7684\u5BE9\u5224\u5149\u7FFC\u3002",
      vfx: {
        punchTrail: "\u795E\u8056\u66DC\u767D\u5149\u7FBD\u5149\u5F27\u3001\u8056\u5149\u7C92\u5B50",
        sk1: "\u7D14\u6DE8\u5149\u5B50\u795E\u8056\u9577\u77DB\u5C04\u7DDA",
        sk2: "\u516D\u7FFC\u5C55\u7FC5\u62D4\u5730\u800C\u8D77\u4E4B\u5929\u5802\u8056\u5149\u67F1",
        guardShield: "\u5927\u6559\u5802\u5F69\u7E6A\u73BB\u7483\u5149\u8292\u795E\u8056\u529B\u5834",
        hitEffect: "\u91D1\u8272\u8056\u7FBD\u8207\u7D14\u767D\u5149\u74B0"
      },
      creator: "Community Workshop (PR #88)"
    },
    {
      id: "skin_omega_emperor",
      name: "\u9EC3\u91D1\u7D42\u6975\u6A5F\u795E",
      title: "\u91CF\u5B50\u5E1D\u570B\u59CB\u7956\u6A5F\u7687",
      category: "shop",
      series: "\u7D42\u6975\u5178\u85CF",
      price: 5e3,
      isDefault: false,
      themeColor: "#eab308",
      secondaryColor: "#ffffff",
      glowColor: "rgba(234, 179, 8, 0.7)",
      accentColor: "#ca8a04",
      armorColor: "#1e1601",
      visorColor: "#ffffff",
      coreColor: "#eab308",
      desc: "\u53E4\u4EE3\u8D85\u6587\u660E\u907A\u7559\u7684\u7D42\u6975\u7687\u5E1D\u6A5F\u7532\uFF0C\u901A\u9AD4\u7531\u4E0D\u6EC5\u7684\u91CF\u5B50\u771F\u91D1\u9444\u9020\uFF0C\u5C0A\u8CB4\u5A01\u56B4\u51CC\u99D5\u773E\u751F\u3002",
      vfx: {
        punchTrail: "\u5E1D\u738B\u771F\u91D1\u8F1D\u714C\u65E5\u5195\u65AC\u3001\u795E\u5A01\u91D1\u5149",
        sk1: "\u8D85\u65B0\u661F\u7206\u767C\u5E1D\u738B\u91D1\u8F2A\u6838\u7206\u5F48",
        sk2: "\u842C\u4E08\u91D1\u5149\u8CAB\u7A7F\u5929\u5730\u7684\u81F3\u5C0A\u5E1D\u7687\u67F1",
        guardShield: "\u4E5D\u4E94\u81F3\u5C0A\u771F\u91D1\u9F8D\u7D0B\u7D50\u754C",
        hitEffect: "\u5E1D\u7687\u9F8D\u9C57\u91D1\u5149\u70B8\u88C2"
      },
      creator: "Legendary Artisan (PR #99)"
    }
  ];

  // js/save_system.js
  var STORAGE_KEY_CURRENT = "cyberstriker_current_session";
  var STORAGE_KEY_ACCOUNTS = "cyberstriker_cloud_accounts";
  var SaveSystem = class {
    constructor() {
      this.currentUser = null;
      this.isGuest = false;
      this.accounts = this._loadAccountsFromStorage();
    }
    _loadAccountsFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.warn("Failed to parse saved accounts:", e);
      }
      const initialAccounts = {
        "player@gmail.com": {
          uid: "CY-UID-882101",
          email: "player@gmail.com",
          nickname: "\u91CF\u5B50\u5148\u92D2",
          avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=QuantumVanguard",
          credits: 2450,
          eventTokens: 120,
          skins: ["skin_cyber_warrior", "skin_neon_shadow", "skin_pulse_enforcer", "skin_dark_hacker"],
          equippedSkin: "skin_cyber_warrior",
          loadout: ["SK-01", "SK-02", "SK-09"],
          stats: { total: 18, wins: 14, losses: 4, aiBeaten: { easy: true, normal: true, hard: true, nightmare: false } },
          preferences: { bgmVol: 0.4, sfxVol: 0.8, haptics: true },
          lastLogin: new Date(Date.now() - 36e5 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 36e5 * 2).toISOString()
        },
        "ethan.cyber@gmail.com": {
          uid: "CY-UID-773902",
          email: "ethan.cyber@gmail.com",
          nickname: "\u4F0A\u68EE\u5927\u5E2B",
          avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EthanStriker",
          credits: 4800,
          eventTokens: 350,
          skins: ["skin_cyber_warrior", "skin_neon_shadow", "skin_pulse_enforcer", "skin_dark_hacker", "skin_solar_valkyrie"],
          equippedSkin: "skin_solar_valkyrie",
          loadout: ["SK-03", "SK-04", "SK-07"],
          stats: { total: 42, wins: 38, losses: 4, aiBeaten: { easy: true, normal: true, hard: true, nightmare: true } },
          preferences: { bgmVol: 0.5, sfxVol: 0.85, haptics: true },
          lastLogin: new Date(Date.now() - 864e5).toISOString(),
          updatedAt: new Date(Date.now() - 864e5).toISOString()
        }
      };
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(initialAccounts));
      return initialAccounts;
    }
    _saveAccountsToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(this.accounts));
      } catch (e) {
        console.error("Failed to persist accounts:", e);
      }
    }
    /**
     * 初始化系統與自動嘗試恢復前次登入
     */
    init() {
      try {
        const lastSession = localStorage.getItem(STORAGE_KEY_CURRENT);
        if (lastSession) {
          const sessionData = JSON.parse(lastSession);
          if (sessionData.isGuest) {
            this.loginAsGuest(sessionData.user);
            return;
          } else if (sessionData.email && this.accounts[sessionData.email]) {
            this.currentUser = this.accounts[sessionData.email];
            this.currentUser.lastLogin = (/* @__PURE__ */ new Date()).toISOString();
            this._saveAccountsToStorage();
            return;
          }
        }
      } catch (e) {
        console.warn("Session resume failed, defaulting to guest:", e);
      }
      const firstEmail = Object.keys(this.accounts)[0];
      if (firstEmail) {
        this.loginWithEmail(firstEmail);
      } else {
        this.loginAsGuest();
      }
    }
    /**
     * 途徑一：手動輸入 Gmail 信箱
     */
    loginWithEmail(email, customNickname = "") {
      email = email.trim().toLowerCase();
      const isNewUser = !this.accounts[email];
      if (isNewUser) {
        const defaultNick = customNickname.trim() || email.split("@")[0];
        const newAccount = {
          uid: "CY-UID-" + Math.floor(1e5 + Math.random() * 9e5),
          email,
          nickname: defaultNick.slice(0, 12),
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
          credits: 1200,
          eventTokens: 0,
          skins: ["skin_cyber_warrior", "skin_neon_shadow", "skin_pulse_enforcer"],
          equippedSkin: "skin_cyber_warrior",
          loadout: ["SK-01", "SK-02", "SK-09"],
          stats: { total: 0, wins: 0, losses: 0, aiBeaten: { easy: false, normal: false, hard: false, nightmare: false } },
          preferences: { bgmVol: 0.4, sfxVol: 0.8, haptics: true },
          lastLogin: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.accounts[email] = newAccount;
        this.currentUser = newAccount;
      } else {
        this.currentUser = this.accounts[email];
        if (customNickname && customNickname.trim()) {
          this.currentUser.nickname = customNickname.trim().slice(0, 12);
        }
        this.currentUser.lastLogin = (/* @__PURE__ */ new Date()).toISOString();
      }
      this.isGuest = false;
      this._persistSession();
      this._saveAccountsToStorage();
      return { user: this.currentUser, isNewUser };
    }
    /**
     * 途徑二：選擇電腦現有 Google 帳號清單一鍵切換
     */
    switchAccount(email) {
      if (this.accounts[email]) {
        this.currentUser = this.accounts[email];
        this.currentUser.lastLogin = (/* @__PURE__ */ new Date()).toISOString();
        this.isGuest = false;
        this._persistSession();
        this._saveAccountsToStorage();
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
        uid: "CY-GUEST-" + Math.floor(1e3 + Math.random() * 9e3),
        email: "guest@offline.local",
        nickname: "\u8A2A\u5BA2\u6230\u58EB",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=GuestStriker",
        credits: 600,
        eventTokens: 0,
        skins: ["skin_cyber_warrior", "skin_neon_shadow", "skin_pulse_enforcer"],
        equippedSkin: "skin_cyber_warrior",
        loadout: ["SK-01", "SK-02", "SK-09"],
        stats: { total: 0, wins: 0, losses: 0, aiBeaten: { easy: false, normal: false, hard: false, nightmare: false } },
        preferences: { bgmVol: 0.4, sfxVol: 0.8, haptics: true },
        lastLogin: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this._persistSession();
      return this.currentUser;
    }
    /**
     * 將訪客帳號綁定至真實 Gmail (資料無痛轉移)
     */
    bindGuestToEmail(email, nickname = "") {
      email = email.trim().toLowerCase();
      const isNew = !this.accounts[email];
      if (isNew) {
        this.currentUser.email = email;
        if (nickname.trim()) this.currentUser.nickname = nickname.trim().slice(0, 12);
        this.currentUser.isGuest = false;
        this.accounts[email] = { ...this.currentUser, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
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
      return this.currentUser;
    }
    /**
     * 取得所有本機已登記 Google 帳號卡片清單
     */
    getRegisteredAccountsList() {
      return Object.values(this.accounts).map((acc) => ({
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
     * 勝場 +350, 敗場 +120, 困難/惡夢 +200
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
      this.currentUser.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      this._saveCurrent();
      return { gained, total: this.currentUser.credits };
    }
    equipSkin(skinId) {
      if (!this.currentUser) return false;
      if (!this.currentUser.skins.includes(skinId)) return false;
      this.currentUser.equippedSkin = skinId;
      this._saveCurrent();
      return true;
    }
    purchaseSkin(skinId, price) {
      if (!this.currentUser) return { success: false, reason: "\u672A\u767B\u5165" };
      if (this.currentUser.skins.includes(skinId)) {
        return { success: false, reason: "\u5DF2\u64C1\u6709\u6B64\u9020\u578B" };
      }
      if (this.currentUser.credits < price) {
        return { success: false, reason: "\u80FD\u91CF\u5E63\u9918\u984D\u4E0D\u8DB3" };
      }
      this.currentUser.credits -= price;
      this.currentUser.skins.push(skinId);
      this.currentUser.equippedSkin = skinId;
      this._saveCurrent();
      return { success: true, remaining: this.currentUser.credits };
    }
    updateLoadout(skillsArray) {
      if (!this.currentUser) return;
      if (Array.isArray(skillsArray) && skillsArray.length === 3) {
        this.currentUser.loadout = [...skillsArray];
        this._saveCurrent();
      }
    }
    savePreferences(prefs) {
      if (!this.currentUser) return;
      this.currentUser.preferences = { ...this.currentUser.preferences, ...prefs };
      this._saveCurrent();
    }
    _saveCurrent() {
      if (!this.isGuest && this.currentUser && this.currentUser.email) {
        this.accounts[this.currentUser.email] = { ...this.currentUser, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
        this._saveAccountsToStorage();
      }
      this._persistSession();
    }
    _persistSession() {
      try {
        localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify({
          isGuest: this.isGuest,
          email: this.currentUser ? this.currentUser.email : null,
          user: this.currentUser
        }));
      } catch (e) {
        console.error("Session write failed:", e);
      }
    }
    // 跨裝置匯出存檔 JSON (支援一鍵同步到手機或另一台電腦)
    exportDataJson() {
      return JSON.stringify(this.currentUser, null, 2);
    }
    // 跨裝置匯入存檔 JSON (時間戳記智能合併)
    importDataJson(jsonString) {
      try {
        const imported = JSON.parse(jsonString);
        if (!imported.email || !imported.uid) return false;
        const existing = this.accounts[imported.email];
        if (!existing || new Date(imported.updatedAt) > new Date(existing.updatedAt)) {
          this.accounts[imported.email] = imported;
          this.currentUser = imported;
          this.isGuest = false;
          this._saveAccountsToStorage();
          this._persistSession();
          return true;
        }
        return false;
      } catch (e) {
        console.error("Failed to import data:", e);
        return false;
      }
    }
  };
  var saveSystem = new SaveSystem();

  // js/engine/audio.js
  var SoundEngine = class {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.sfxGain = null;
      this.bgmGain = null;
      this.isMuted = false;
      this.sfxVolume = 0.8;
      this.bgmVolume = 0.4;
      this.bgmPlaying = false;
      this.bgmTimer = null;
      this.stepIndex = 0;
    }
    init() {
      if (this.ctx) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
        this.bgmGain.connect(this.masterGain);
      } catch (e) {
        console.warn("Web Audio not supported or failed to initialize:", e);
      }
    }
    ensureContext() {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    }
    setMuted(muted) {
      this.isMuted = muted;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
      }
    }
    setSfxVolume(vol) {
      this.sfxVolume = Math.max(0, Math.min(1, vol));
      if (this.sfxGain && this.ctx) {
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      }
    }
    setBgmVolume(vol) {
      this.bgmVolume = Math.max(0, Math.min(1, vol));
      if (this.bgmGain && this.ctx) {
        this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
      }
    }
    // ─── 程序化打擊音效 ───
    playHit(type = "punch") {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      switch (type) {
        case "punch": {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(260, t);
          osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);
          gain.gain.setValueAtTime(0.7, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
          this._playNoise(t, 0.04, 800, 0.4);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.08);
          break;
        }
        case "kick": {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(200, t);
          osc.frequency.exponentialRampToValueAtTime(35, t + 0.16);
          gain.gain.setValueAtTime(1, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);
          this._playNoise(t, 0.07, 500, 0.6);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.16);
          break;
        }
        case "guard": {
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(1240, t);
          osc1.frequency.exponentialRampToValueAtTime(880, t + 0.12);
          osc2.type = "triangle";
          osc2.frequency.setValueAtTime(1860, t);
          osc2.frequency.exponentialRampToValueAtTime(1100, t + 0.12);
          gain.gain.setValueAtTime(0.8, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.sfxGain);
          osc1.start(t);
          osc2.start(t);
          osc1.stop(t + 0.14);
          osc2.stop(t + 0.14);
          break;
        }
        case "burst": {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(180, t);
          osc.frequency.exponentialRampToValueAtTime(30, t + 0.45);
          gain.gain.setValueAtTime(1, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);
          this._playNoise(t, 0.35, 1200, 0.8);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.45);
          break;
        }
        case "laser":
        case "projectile": {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(880, t);
          osc.frequency.exponentialRampToValueAtTime(120, t + 0.18);
          gain.gain.setValueAtTime(0.6, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.18);
          break;
        }
        case "anti_air":
        case "dp": {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(160, t);
          osc.frequency.exponentialRampToValueAtTime(650, t + 0.22);
          gain.gain.setValueAtTime(0.7, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
          this._playNoise(t, 0.2, 1400, 0.5);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.22);
          break;
        }
        case "slide": {
          this._playNoise(t, 0.22, 600, 0.6);
          break;
        }
        case "teleport": {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(300, t);
          osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
          osc.frequency.exponentialRampToValueAtTime(200, t + 0.2);
          gain.gain.setValueAtTime(0.6, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.2);
          break;
        }
        case "parry_trigger": {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(1400, t);
          osc.frequency.exponentialRampToValueAtTime(2200, t + 0.08);
          gain.gain.setValueAtTime(0.8, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.2);
          break;
        }
        case "slam": {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(150, t);
          osc.frequency.exponentialRampToValueAtTime(25, t + 0.35);
          gain.gain.setValueAtTime(1, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
          this._playNoise(t, 0.25, 400, 0.8);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.35);
          break;
        }
        case "beam": {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(240, t);
          osc.frequency.linearRampToValueAtTime(320, t + 0.4);
          osc.frequency.exponentialRampToValueAtTime(60, t + 0.7);
          gain.gain.setValueAtTime(0.9, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.7);
          this._playNoise(t, 0.6, 2e3, 0.7);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.7);
          break;
        }
        case "knockdown": {
          this._playNoise(t, 0.15, 300, 0.7);
          break;
        }
        case "ko": {
          const chords = [220, 277.18, 329.63, 440];
          chords.forEach((freq) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.4, t);
            gain.gain.exponentialRampToValueAtTime(1e-3, t + 1.2);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 1.2);
          });
          break;
        }
      }
    }
    // ─── 介面音效 ───
    playUI(type = "click") {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      if (type === "hover") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(480, t);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(1e-3, t + 0.04);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.04);
      } else if (type === "click") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.06);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(1e-3, t + 0.06);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.06);
      } else if (type === "equip") {
        const notes = [523.25, 783.99];
        notes.forEach((f, idx) => {
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = "sine";
          o.frequency.setValueAtTime(f, t + idx * 0.07);
          g.gain.setValueAtTime(0.25, t + idx * 0.07);
          g.gain.exponentialRampToValueAtTime(1e-3, t + idx * 0.07 + 0.12);
          o.connect(g);
          g.connect(this.sfxGain);
          o.start(t + idx * 0.07);
          o.stop(t + idx * 0.07 + 0.12);
        });
      } else if (type === "countdown") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, t);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.1);
      } else if (type === "fight") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(920, t);
        osc.frequency.exponentialRampToValueAtTime(1400, t + 0.25);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.25);
      }
    }
    // 噪聲發生器輔助
    _playNoise(t, duration, cutoff = 1e3, volume = 0.5) {
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(cutoff, t);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noise.start(t);
      noise.stop(t + duration);
    }
    // ─── 賽博龐克合成背景旋律 (Procedural Cyberpunk Synth BGM) ───
    startBgm() {
      if (this.bgmPlaying) return;
      this.ensureContext();
      if (!this.ctx) return;
      this.bgmPlaying = true;
      const bassScale = [65.41, 73.42, 82.41, 98, 110, 130.81];
      const leadScale = [261.63, 293.66, 329.63, 392, 440, 523.25];
      const tempo = 128;
      const stepInterval = 60 / tempo / 2 * 1e3;
      this.bgmTimer = setInterval(() => {
        if (!this.bgmPlaying || this.isMuted) return;
        const t = this.ctx.currentTime;
        this.stepIndex++;
        if (this.stepIndex % 2 === 0) {
          const bassFreq = bassScale[(Math.floor(this.stepIndex / 4) + this.stepIndex % 4) % bassScale.length];
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(bassFreq, t);
          const filter = this.ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(320, t);
          filter.frequency.exponentialRampToValueAtTime(100, t + 0.15);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(1e-3, t + 0.15);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.bgmGain);
          osc.start(t);
          osc.stop(t + 0.15);
        }
        if (this.stepIndex % 2 === 1) {
          this._playNoise(t, 0.03, 5e3, 0.05);
        }
        if (this.stepIndex % 8 === 4 || this.stepIndex % 8 === 7) {
          const leadFreq = leadScale[this.stepIndex * 3 % leadScale.length];
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(leadFreq, t);
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.exponentialRampToValueAtTime(1e-3, t + 0.18);
          osc.connect(gain);
          gain.connect(this.bgmGain);
          osc.start(t);
          osc.stop(t + 0.18);
        }
      }, stepInterval);
    }
    stopBgm() {
      this.bgmPlaying = false;
      if (this.bgmTimer) {
        clearInterval(this.bgmTimer);
        this.bgmTimer = null;
      }
    }
  };
  var soundEngine = new SoundEngine();

  // js/engine/character_renderer.js
  var CharacterRenderer = class {
    constructor() {
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
      const facing = char.facing || 1;
      const state = char.state || "idle";
      const t = char.stateTime || 0;
      ctx.translate(Math.round(char.x), Math.round(char.y));
      ctx.scale(facing, 1);
      if (char.invincibleTimer > 0 && Math.floor(char.invincibleTimer / 3) % 2 === 0) {
        ctx.globalAlpha = 0.5;
      }
      const pose = this.calculatePose(state, t, char);
      this.drawLimb(ctx, pose.backLeg, skin, "backLeg");
      this.drawArm(ctx, pose.backArm, skin, "backArm");
      this.drawTorso(ctx, pose.torso, skin, t);
      this.drawHead(ctx, pose.head, skin);
      this.drawLimb(ctx, pose.frontLeg, skin, "frontLeg");
      this.drawArm(ctx, pose.frontArm, skin, "frontArm");
      if (char.isGuarding) {
        this.drawGuardShield(ctx, char.guardStance || "high", skin, t);
      }
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
        backArm: { shoulderX: -8, shoulderY: -86, upperAngle: 0.3, foreAngle: 1 },
        frontLeg: { hipX: 6, hipY: -42, thighAngle: 0.2, shinAngle: 0.1 },
        backLeg: { hipX: -6, hipY: -42, thighAngle: -0.2, shinAngle: 0.1 },
        vfx: null
      };
      switch (state) {
        case "idle": {
          const breath = Math.sin(t * 0.08) * 3;
          defaultPose.torso.y = -74 + breath;
          defaultPose.head.y = -98 + breath;
          defaultPose.frontArm.upperAngle = 0.4 + Math.sin(t * 0.08) * 0.08;
          defaultPose.frontArm.foreAngle = 1.3 + Math.sin(t * 0.08) * 0.05;
          defaultPose.backArm.upperAngle = 0.2;
          defaultPose.backArm.foreAngle = 1.1;
          return defaultPose;
        }
        case "walk_fwd": {
          const cycle = Math.sin(t * 0.2);
          const cycleCos = Math.cos(t * 0.2);
          defaultPose.torso.angle = 0.12;
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
        case "walk_back": {
          const cycle = Math.sin(t * 0.16);
          defaultPose.torso.angle = -0.08;
          defaultPose.frontArm.upperAngle = 0.9;
          defaultPose.frontArm.foreAngle = 1.6;
          defaultPose.backArm.upperAngle = 0.7;
          defaultPose.backArm.foreAngle = 1.4;
          defaultPose.frontLeg.thighAngle = -cycle * 0.4;
          defaultPose.backLeg.thighAngle = cycle * 0.4;
          return defaultPose;
        }
        case "jump":
        case "jump_up": {
          defaultPose.torso.y = -82;
          defaultPose.head.y = -106;
          defaultPose.frontLeg.thighAngle = -0.8;
          defaultPose.frontLeg.shinAngle = 1.2;
          defaultPose.backLeg.thighAngle = -0.5;
          defaultPose.backLeg.shinAngle = 1;
          defaultPose.frontArm.upperAngle = -0.6;
          defaultPose.frontArm.foreAngle = 0.4;
          defaultPose.backArm.upperAngle = -0.8;
          defaultPose.backArm.foreAngle = 0.4;
          return defaultPose;
        }
        case "crouch": {
          defaultPose.torso.y = -48;
          defaultPose.torso.angle = 0.25;
          defaultPose.head.y = -72;
          defaultPose.frontLeg.thighAngle = -1.4;
          defaultPose.frontLeg.shinAngle = 2.1;
          defaultPose.backLeg.thighAngle = -1.2;
          defaultPose.backLeg.shinAngle = 2;
          defaultPose.frontArm.upperAngle = 0.8;
          defaultPose.frontArm.foreAngle = 0.9;
          defaultPose.backArm.upperAngle = 0.6;
          defaultPose.backArm.foreAngle = 0.8;
          return defaultPose;
        }
        case "high_guard": {
          defaultPose.frontArm.upperAngle = 1.2;
          defaultPose.frontArm.foreAngle = 1.8;
          defaultPose.backArm.upperAngle = 1;
          defaultPose.backArm.foreAngle = 1.6;
          return defaultPose;
        }
        case "low_guard": {
          defaultPose.torso.y = -50;
          defaultPose.head.y = -74;
          defaultPose.frontLeg.thighAngle = -1.3;
          defaultPose.frontLeg.shinAngle = 2;
          defaultPose.frontArm.upperAngle = 0.5;
          defaultPose.frontArm.foreAngle = 0.4;
          defaultPose.backArm.upperAngle = 0.4;
          defaultPose.backArm.foreAngle = 0.4;
          return defaultPose;
        }
        case "light_punch": {
          const pProgress = Math.min(1, t / 14);
          const reach = Math.sin(pProgress * Math.PI);
          defaultPose.torso.angle = 0.15 * reach;
          defaultPose.frontArm.upperAngle = 0.2 - reach * 0.9;
          defaultPose.frontArm.foreAngle = 1.2 - reach * 1.1;
          defaultPose.backArm.upperAngle = 0.6;
          defaultPose.backArm.foreAngle = 1.4;
          if (reach > 0.3) {
            defaultPose.vfx = { type: "punch", progress: reach, x: 50, y: -78 };
          }
          return defaultPose;
        }
        case "heavy_kick": {
          const kProgress = Math.min(1, t / 18);
          const kickWave = Math.sin(kProgress * Math.PI);
          defaultPose.torso.angle = -0.3 * kickWave;
          defaultPose.frontLeg.thighAngle = 0.2 - kickWave * 1.8;
          defaultPose.frontLeg.shinAngle = 0.1 - kickWave * 0.4;
          defaultPose.frontArm.upperAngle = -0.4;
          defaultPose.frontArm.foreAngle = 0.5;
          if (kickWave > 0.4) {
            defaultPose.vfx = { type: "kick", progress: kickWave, x: 54, y: -60 };
          }
          return defaultPose;
        }
        case "hit_stun": {
          const hOffset = Math.sin(t * 0.4) * 4;
          defaultPose.torso.angle = -0.35;
          defaultPose.head.angle = -0.45;
          defaultPose.torso.x = -8 + hOffset;
          defaultPose.head.x = -12 + hOffset;
          defaultPose.frontArm.upperAngle = -0.8;
          defaultPose.frontArm.foreAngle = 0.4;
          defaultPose.backArm.upperAngle = -0.6;
          defaultPose.backArm.foreAngle = 0.5;
          defaultPose.vfx = { type: "hit_sparks", x: 0, y: -74 };
          return defaultPose;
        }
        case "knockdown": {
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
        case "wakeup": {
          const wRatio = Math.min(1, t / 15);
          defaultPose.torso.y = -16 - wRatio * 58;
          defaultPose.head.y = -16 - wRatio * 82;
          defaultPose.torso.angle = -Math.PI / 2 * (1 - wRatio);
          defaultPose.head.angle = -Math.PI / 2 * (1 - wRatio);
          return defaultPose;
        }
        // 招式專屬姿態
        case "SK-02": {
          defaultPose.torso.angle = 0.1;
          defaultPose.frontArm.upperAngle = -2.2;
          defaultPose.frontArm.foreAngle = 0.1;
          defaultPose.frontLeg.thighAngle = -0.9;
          defaultPose.frontLeg.shinAngle = 1.4;
          defaultPose.vfx = { type: "shoryuken", x: 12, y: -110 };
          return defaultPose;
        }
        case "SK-03": {
          defaultPose.torso.y = -26;
          defaultPose.torso.angle = -0.5;
          defaultPose.head.y = -40;
          defaultPose.frontLeg.thighAngle = -1.5;
          defaultPose.frontLeg.shinAngle = 0.1;
          defaultPose.backLeg.thighAngle = 0.6;
          defaultPose.backLeg.shinAngle = 1.8;
          defaultPose.vfx = { type: "slide_dust", x: 30, y: -5 };
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
      ctx.fillStyle = skin.armorColor || "#0f172a";
      ctx.strokeStyle = skin.themeColor || "#00f3ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-16, -23);
      ctx.lineTo(16, -23);
      ctx.lineTo(12, 16);
      ctx.lineTo(-12, 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#090d16";
      ctx.fillRect(-11, 16, 22, 12);
      ctx.strokeRect(-11, 16, 22, 12);
      const pulse = 1 + Math.sin(t * 0.1) * 0.15;
      ctx.save();
      ctx.shadowColor = skin.themeColor;
      ctx.shadowBlur = 12 * pulse;
      ctx.fillStyle = skin.coreColor || skin.themeColor;
      ctx.beginPath();
      ctx.arc(0, -6, 6 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, -6, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.restore();
    }
    drawHead(ctx, head, skin) {
      ctx.save();
      ctx.translate(head.x, head.y);
      ctx.rotate(head.angle);
      ctx.fillStyle = skin.armorColor || "#0f172a";
      ctx.strokeStyle = skin.accentColor || skin.themeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.save();
      ctx.shadowColor = skin.visorColor || skin.themeColor;
      ctx.shadowBlur = 10;
      ctx.fillStyle = skin.visorColor || skin.themeColor;
      ctx.beginPath();
      ctx.roundRect(0, -4, 14, 7, 3);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(2, -3, 8, 2);
      ctx.restore();
      ctx.restore();
    }
    drawArm(ctx, arm, skin, layer) {
      ctx.save();
      ctx.translate(arm.shoulderX, arm.shoulderY);
      ctx.rotate(arm.upperAngle);
      const isBack = layer === "backArm";
      const armorCol = isBack ? "#0a0f1d" : skin.armorColor || "#0f172a";
      const strokeCol = isBack ? "#1e293b" : skin.themeColor;
      ctx.fillStyle = armorCol;
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-4, 0, 8, 22, 4);
      ctx.fill();
      ctx.stroke();
      ctx.translate(0, 20);
      ctx.rotate(arm.foreAngle);
      ctx.fillStyle = skin.accentColor || skin.themeColor;
      ctx.beginPath();
      ctx.roundRect(-5, 0, 10, 22, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-3, 16, 6, 4);
      ctx.restore();
    }
    drawLimb(ctx, leg, skin, layer) {
      ctx.save();
      ctx.translate(leg.hipX, leg.hipY);
      ctx.rotate(leg.thighAngle);
      const isBack = layer === "backLeg";
      const armorCol = isBack ? "#090d18" : skin.armorColor || "#0f172a";
      const strokeCol = isBack ? "#1e293b" : skin.themeColor;
      ctx.fillStyle = armorCol;
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-5, 0, 10, 26, 4);
      ctx.fill();
      ctx.stroke();
      ctx.translate(0, 24);
      ctx.rotate(leg.shinAngle);
      ctx.fillStyle = armorCol;
      ctx.beginPath();
      ctx.roundRect(-5, 0, 10, 28, 4);
      ctx.fill();
      ctx.stroke();
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
      ctx.fillStyle = skin.glowColor || "rgba(0, 243, 255, 0.2)";
      ctx.lineWidth = 3;
      if (stance === "low") {
        ctx.beginPath();
        ctx.moveTo(10, -10);
        ctx.lineTo(44, -20);
        ctx.lineTo(36, -60);
        ctx.lineTo(6, -45);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
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
      if (vfx.type === "punch") {
        ctx.beginPath();
        ctx.arc(vfx.x, vfx.y, 18, -Math.PI / 4, Math.PI / 4);
        ctx.lineWidth = 4;
        ctx.strokeStyle = skin.secondaryColor || "#ffffff";
        ctx.stroke();
        if (skin.id === "skin_dark_hacker") {
          ctx.font = "10px monospace";
          ctx.fillStyle = "#00ff66";
          ctx.fillText("0101", vfx.x - 10, vfx.y - 12);
        } else if (skin.id === "skin_solar_valkyrie") {
          ctx.fillStyle = "#ff4500";
          ctx.fillRect(vfx.x - 4, vfx.y - 4, 8, 8);
        } else if (skin.id === "skin_cyber_diva") {
          ctx.font = "13px sans-serif";
          ctx.fillStyle = "#f43f5e";
          ctx.fillText("\u266A", vfx.x - 6, vfx.y - 10);
        } else if (skin.id === "skin_cryo_maiden") {
          ctx.font = "12px sans-serif";
          ctx.fillStyle = "#bae6fd";
          ctx.fillText("\u2744", vfx.x - 6, vfx.y - 8);
        } else if (skin.id === "skin_cosmic_ronin") {
          ctx.font = "12px sans-serif";
          ctx.fillStyle = "#c084fc";
          ctx.fillText("\u2726", vfx.x - 6, vfx.y - 10);
        } else if (skin.id === "skin_archangel_judicator") {
          ctx.font = "14px sans-serif";
          ctx.fillStyle = "#ffffff";
          ctx.fillText("\u2727", vfx.x - 6, vfx.y - 10);
        } else if (skin.id === "skin_volt_ranger") {
          ctx.strokeStyle = "#fde047";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(vfx.x - 10, vfx.y - 10);
          ctx.lineTo(vfx.x - 4, vfx.y - 2);
          ctx.lineTo(vfx.x - 8, vfx.y + 2);
          ctx.lineTo(vfx.x, vfx.y + 8);
          ctx.stroke();
        } else if (skin.id === "skin_omega_emperor") {
          ctx.strokeStyle = "#fef08a";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(vfx.x, vfx.y, 12, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (vfx.type === "kick") {
        ctx.beginPath();
        ctx.arc(vfx.x - 10, vfx.y, 40, -Math.PI / 3, Math.PI / 6);
        ctx.lineWidth = 6;
        ctx.strokeStyle = skin.themeColor;
        ctx.stroke();
        if (skin.secondaryColor) {
          ctx.beginPath();
          ctx.arc(vfx.x - 10, vfx.y, 34, -Math.PI / 3, Math.PI / 6);
          ctx.lineWidth = 2;
          ctx.strokeStyle = skin.secondaryColor;
          ctx.stroke();
        }
      } else if (vfx.type === "shoryuken") {
        ctx.fillStyle = skin.glowColor;
        ctx.fillRect(vfx.x - 15, vfx.y, 30, 90);
        ctx.strokeStyle = skin.themeColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(vfx.x - 15, vfx.y, 30, 90);
      } else if (vfx.type === "hit_sparks") {
        for (let i = 0; i < 4; i++) {
          const ang = Math.PI * 2 / 4 * i;
          ctx.fillStyle = skin.themeColor;
          ctx.fillRect(Math.cos(ang) * 16, vfx.y + Math.sin(ang) * 16, 4, 4);
        }
      }
      ctx.restore();
    }
    /**
     * 繪製大廳外觀展示台專屬全息光圈底座
     */
    drawPedestal(ctx, cx, cy, radius, skin, t) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.save();
      ctx.rotate(t * 0.02);
      ctx.shadowColor = skin.themeColor;
      ctx.shadowBlur = 20;
      ctx.strokeStyle = skin.themeColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = Math.PI / 3 * i;
        const px = Math.cos(ang) * radius;
        const py = Math.sin(ang) * (radius * 0.35);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.rotate(-t * 0.03);
      ctx.strokeStyle = skin.secondaryColor || "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.75, radius * 0.28, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
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
  };
  var characterRenderer = new CharacterRenderer();

  // js/engine/combat.js
  var CombatEngine = class {
    constructor() {
      this.arenaWidth = 1e3;
      this.floorY = 380;
      this.p1 = null;
      this.p2 = null;
      this.projectiles = [];
      this.shockwaves = [];
      this.floatingTexts = [];
      this.roundTime = 99;
      this.timerAcc = 0;
      this.isOver = false;
      this.winner = null;
      this.isTraining = false;
      this.trainingSettings = {
        dummyStance: "stand",
        // 'stand', 'crouch', 'jump'
        dummyGuard: "none",
        // 'none', 'stand_guard', 'crouch_guard', 'after_first_hit'
        dummyReversal: false,
        // 甦醒第一幀升龍
        instantCd: false
        // 技能即時無冷卻
      };
      this.enableHaptics = true;
    }
    initMatch(p1Data, p2Data, isTraining = false, trainingOpts = {}) {
      this.isTraining = isTraining;
      this.isOver = false;
      this.winner = null;
      this.roundTime = 99;
      this.timerAcc = 0;
      this.projectiles = [];
      this.shockwaves = [];
      this.floatingTexts = [];
      if (isTraining && trainingOpts) {
        this.trainingSettings = { ...this.trainingSettings, ...trainingOpts };
      }
      this.p1 = this._createFighter(1, 200, p1Data);
      this.p2 = this._createFighter(2, 800, p2Data);
      this.p1.facing = 1;
      this.p2.facing = -1;
    }
    _createFighter(id, x, data) {
      const skillList = data.loadout && data.loadout.length === 3 ? data.loadout.map((sid) => SKILLS.find((s) => s.id === sid) || SKILLS[0]) : [SKILLS[0], SKILLS[1], SKILLS[8]];
      return {
        id,
        name: data.name || (id === 1 ? "Player 1" : "Player 2"),
        skin: data.skin,
        x,
        y: this.floorY,
        vx: 0,
        vy: 0,
        facing: id === 1 ? 1 : -1,
        isGrounded: true,
        maxHp: 1e3,
        hp: 1e3,
        state: "idle",
        // idle, walk_fwd, walk_back, jump, crouch, high_guard, low_guard, light_punch, heavy_kick, skill, hit_stun, knockdown, wakeup
        stateTime: 0,
        stateDuration: 0,
        currentAction: null,
        isGuarding: false,
        guardStance: "high",
        // 'high' 或 'low'
        invincibleTimer: 0,
        // 量子逆轉爆發 (Burst)
        burstMeter: 500,
        // 滿 500 點可施展
        burstMax: 500,
        burstAvailable: true,
        // 3 大自選技能
        skills: skillList,
        cooldowns: [0, 0, 0],
        // 連段統計
        comboCount: 0,
        comboDamage: 0,
        comboResetTimer: 0,
        frameAdvantage: 0
        // 幀數優劣勢 (+有利 / -不利)
      };
    }
    /**
     * 60 FPS 物理推進核心
     */
    update(inputsP1, inputsP2) {
      if (this.isOver) return;
      if (this.isTraining && this.trainingSettings.instantCd) {
        this.p1.cooldowns = [0, 0, 0];
        this.p2.cooldowns = [0, 0, 0];
      }
      if (!this.isTraining) {
        this.timerAcc++;
        if (this.timerAcc >= 60) {
          this.timerAcc = 0;
          this.roundTime--;
          if (this.roundTime <= 0) {
            this.roundTime = 0;
            this._handleTimeOver();
          }
        }
      }
      this._updateFighter(this.p1, this.p2, inputsP1);
      this._updateFighter(this.p2, this.p1, inputsP2);
      this._updateProjectiles();
      this._updateShockwaves();
      this._updateFloatingTexts();
      this._resolvePositions();
      if (!this.isTraining && !this.isOver) {
        if (this.p1.hp <= 0 && this.p2.hp <= 0) {
          this.isOver = true;
          this.winner = 0;
          soundEngine.playHit("ko");
        } else if (this.p1.hp <= 0) {
          this.isOver = true;
          this.winner = 2;
          soundEngine.playHit("ko");
        } else if (this.p2.hp <= 0) {
          this.isOver = true;
          this.winner = 1;
          soundEngine.playHit("ko");
        }
      }
    }
    _updateFighter(char, opp, input) {
      char.stateTime++;
      if (char.invincibleTimer > 0) char.invincibleTimer--;
      for (let i = 0; i < char.cooldowns.length; i++) {
        if (char.cooldowns[i] > 0) {
          char.cooldowns[i] = Math.max(0, char.cooldowns[i] - 1 / 60);
        }
      }
      if (char.comboResetTimer > 0) {
        char.comboResetTimer--;
        if (char.comboResetTimer <= 0) {
          char.comboCount = 0;
          char.comboDamage = 0;
        }
      }
      if (!char.isGrounded) {
        char.vy += 1.05;
        char.x += char.vx;
        char.y += char.vy;
        if (char.y >= this.floorY) {
          char.y = this.floorY;
          char.vy = 0;
          char.vx = 0;
          char.isGrounded = true;
          char.facing = char.x < opp.x ? 1 : -1;
          if (char.state === "jump") {
            char.state = "idle";
            char.stateTime = 0;
          }
        }
      } else {
        char.x += char.vx;
        char.vx *= 0.75;
      }
      char.x = Math.max(50, Math.min(this.arenaWidth - 50, char.x));
      const tryBurst = input && (input.burst || input.punch && input.kick);
      if (tryBurst && char.state === "hit_stun" && char.burstMeter >= char.burstMax && char.burstAvailable) {
        this._executeBurst(char, opp);
        return;
      }
      switch (char.state) {
        case "idle":
        case "walk_fwd":
        case "walk_back":
        case "crouch":
        case "high_guard":
        case "low_guard":
          this._handleNormalInputs(char, opp, input);
          break;
        case "jump":
          if (char.currentAction !== "air_attack") {
            char.facing = char.x < opp.x ? 1 : -1;
          }
          if (input && (input.punch || input.kick) && char.currentAction !== "air_attack") {
            char.facing = char.x < opp.x ? 1 : -1;
            char.currentAction = "air_attack";
            this._executeAirAttack(char, opp, input.kick ? "kick" : "punch");
          }
          break;
        case "light_punch":
        case "heavy_kick":
        case "skill":
          this._updateAttackAction(char, opp);
          break;
        case "hit_stun":
          if (char.stateTime >= char.stateDuration) {
            char.state = "idle";
            char.stateTime = 0;
            char.currentAction = null;
          }
          break;
        case "knockdown":
          if (char.stateTime >= 40) {
            char.state = "wakeup";
            char.stateTime = 0;
            char.invincibleTimer = 15;
            soundEngine.playHit("slide");
          }
          break;
        case "wakeup":
          if (char.stateTime >= 15) {
            char.state = "idle";
            char.stateTime = 0;
            char.currentAction = null;
          }
          break;
      }
    }
    _handleNormalInputs(char, opp, input) {
      if (!input) {
        char.state = "idle";
        char.isGuarding = false;
        return;
      }
      if (char.isGrounded) {
        char.facing = char.x < opp.x ? 1 : -1;
      }
      if (input.skill1 && char.cooldowns[0] <= 0) {
        this._executeSkill(char, opp, 0);
        return;
      }
      if (input.skill2 && char.cooldowns[1] <= 0) {
        this._executeSkill(char, opp, 1);
        return;
      }
      if (input.skill3 && char.cooldowns[2] <= 0) {
        this._executeSkill(char, opp, 2);
        return;
      }
      if (input.punch) {
        this._executeLightPunch(char, opp);
        return;
      }
      if (input.kick) {
        this._executeHeavyKick(char, opp);
        return;
      }
      const moveX = input.x || 0;
      const moveY = input.y || 0;
      if (moveY < -0.4 && char.isGrounded) {
        char.isGrounded = false;
        char.vy = -18.5;
        char.vx = moveX * 6.8;
        char.state = "jump";
        char.stateTime = 0;
        char.isGuarding = false;
        soundEngine.playHit("dp");
        return;
      }
      if (moveY > 0.4 && char.isGrounded) {
        const isPullingBack = char.facing === 1 && moveX < -0.2 || char.facing === -1 && moveX > 0.2;
        if (isPullingBack) {
          char.state = "low_guard";
          char.guardStance = "low";
          char.isGuarding = true;
        } else {
          char.state = "crouch";
          char.isGuarding = false;
        }
        return;
      }
      if (Math.abs(moveX) > 0.2) {
        const isMovingFwd = char.facing === 1 && moveX > 0 || char.facing === -1 && moveX < 0;
        if (isMovingFwd) {
          char.x += char.facing * 7.5;
          char.state = "walk_fwd";
          char.isGuarding = false;
        } else {
          char.x -= char.facing * 5.6;
          char.state = "walk_back";
          char.guardStance = "high";
          char.isGuarding = true;
        }
        return;
      }
      char.state = "idle";
      char.isGuarding = false;
    }
    // ─── 量子逆轉爆發系統 (Quantum Burst) ───
    _executeBurst(char, opp) {
      char.burstMeter = 0;
      char.burstAvailable = false;
      char.state = "idle";
      char.stateTime = 0;
      char.invincibleTimer = 10;
      soundEngine.playHit("burst");
      this._triggerHaptic(80);
      this.shockwaves.push({
        x: char.x,
        y: char.y - 70,
        radius: 10,
        maxRadius: 150,
        color: "#ffd700",
        duration: 20
      });
      const dist = Math.abs(char.x - opp.x);
      if (dist < 260) {
        opp.vx = char.facing * 18;
        opp.state = "hit_stun";
        opp.stateTime = 0;
        opp.stateDuration = 20;
        opp.hp = Math.max(1, opp.hp - 40);
        this.floatingTexts.push({
          text: "QUANTUM BURST!",
          x: char.x,
          y: char.y - 120,
          color: "#ffd700",
          life: 45
        });
      }
    }
    // ─── 普攻打擊 (大幅縮短前搖與硬直，極致靈敏) ───
    _executeLightPunch(char, opp) {
      char.state = "light_punch";
      char.stateTime = 0;
      char.stateDuration = 9;
      char.currentAction = {
        name: "\u523A\u62F3\u6253\u64CA",
        startup: 3,
        // 3 幀秒出
        active: 3,
        recovery: 3,
        damage: 40,
        guardType: "all",
        hitChecked: false
      };
      soundEngine.playHit("punch");
    }
    _executeHeavyKick(char, opp) {
      char.state = "heavy_kick";
      char.stateTime = 0;
      char.stateDuration = 13;
      char.currentAction = {
        name: "\u91CD\u529B\u731B\u8E22",
        startup: 5,
        // 5 幀迅猛出踢
        active: 4,
        recovery: 4,
        damage: 80,
        guardType: "all",
        hitChecked: false
      };
      soundEngine.playHit("kick");
    }
    _executeAirAttack(char, opp, type) {
      char.currentAction = {
        name: type === "kick" ? "\u8E8D\u7A7A\u91CD\u8E22" : "\u8DF3\u8E8D\u523A\u62F3",
        startup: 2,
        // 2 幀瞬發
        active: 6,
        recovery: 3,
        damage: type === "kick" ? 90 : 50,
        guardType: "stand_only",
        // 空中打擊視為中段，不可蹲防
        hitChecked: false
      };
      soundEngine.playHit(type === "kick" ? "kick" : "punch");
    }
    // ─── 10 大核心技能執行 ───
    _executeSkill(char, opp, slotIdx) {
      const skill = char.skills[slotIdx];
      if (!skill) return;
      char.cooldowns[slotIdx] = skill.cd;
      char.state = "skill";
      char.stateTime = 0;
      char.stateDuration = skill.startup + skill.active + skill.recovery;
      char.currentAction = {
        ...skill,
        hitChecked: false
      };
      switch (skill.id) {
        case "SK-01":
          soundEngine.playHit("laser");
          break;
        case "SK-02":
          char.invincibleTimer = skill.invincibleFrames || 4;
          char.isGrounded = false;
          char.vy = -17;
          char.vx = char.facing * 5;
          soundEngine.playHit("dp");
          break;
        case "SK-03":
          char.vx = char.facing * 24;
          soundEngine.playHit("slide");
          break;
        case "SK-04":
          char.isGrounded = false;
          char.vy = -14;
          char.vx = char.facing * 8;
          soundEngine.playHit("dp");
          break;
        case "SK-05":
          soundEngine.playHit("guard");
          break;
        case "SK-06":
          soundEngine.playHit("teleport");
          break;
        case "SK-07":
          char.vx = char.facing * 12;
          soundEngine.playHit("punch");
          break;
        case "SK-08":
          char.invincibleTimer = 8;
          soundEngine.playHit("punch");
          break;
        case "SK-09":
          soundEngine.playHit("burst");
          break;
        case "SK-10":
          soundEngine.playHit("beam");
          break;
      }
    }
    _updateAttackAction(char, opp) {
      const action = char.currentAction;
      if (!action) return;
      const t = char.stateTime;
      const hitStart = action.startup;
      const hitEnd = action.startup + action.active;
      if (action.id === "SK-06" && t === action.startup) {
        char.x = opp.x + opp.facing * -50;
        char.facing = char.x < opp.x ? 1 : -1;
      }
      if (t >= hitStart && t <= hitEnd && !action.hitChecked) {
        this._checkHitbox(char, opp, action);
      }
      if (t >= char.stateDuration) {
        char.state = "idle";
        char.stateTime = 0;
        char.currentAction = null;
      }
    }
    // ─── 判定盒 (Hitbox / Hurtbox) 檢定與攻防三段三擇 ───
    _checkHitbox(char, opp, action) {
      if (opp.invincibleTimer > 0) return;
      if (action.id === "SK-01") {
        action.hitChecked = true;
        this.projectiles.push({
          ownerId: char.id,
          x: char.x + char.facing * 40,
          y: char.y - 74,
          vx: char.facing * 12,
          damage: action.damage,
          skin: char.skin,
          life: 70
        });
        return;
      }
      if (action.id === "SK-09") {
        action.hitChecked = true;
        this.shockwaves.push({
          x: char.x,
          y: char.y - 70,
          radius: 10,
          maxRadius: 180,
          color: char.skin.themeColor,
          duration: 14
        });
        const dist = Math.abs(char.x - opp.x);
        if (dist < 190) {
          this._applyHit(char, opp, action);
        }
        return;
      }
      if (action.id === "SK-10") {
        action.hitChecked = true;
        this.shockwaves.push({
          x: char.x + char.facing * 500,
          y: char.y - 74,
          width: 1e3,
          height: 50,
          isBeam: true,
          color: char.skin.themeColor,
          duration: 16
        });
        const isInFront = char.facing === 1 && opp.x > char.x || char.facing === -1 && opp.x < char.x;
        if (isInFront && opp.y >= this.floorY - 120) {
          this._applyHit(char, opp, action);
        }
        return;
      }
      const hitReach = action.id === "SK-03" ? 120 : action.id === "SK-08" ? 90 : 80;
      const inRange = Math.abs(char.x - opp.x) <= hitReach && Math.abs(char.y - opp.y) <= 80;
      const isFacingOpp = char.facing === 1 && opp.x >= char.x - 20 || char.facing === -1 && opp.x <= char.x + 20;
      if (inRange && isFacingOpp) {
        action.hitChecked = true;
        if (opp.currentAction && opp.currentAction.id === "SK-05" && action.guardType !== "unblockable") {
          this._triggerParryCounter(opp, char);
          return;
        }
        this._applyHit(char, opp, action);
      }
    }
    // ─── 傷害計算與攻防三段三擇 ───
    _applyHit(char, opp, action) {
      let damage = action.damage || 50;
      let isBlocked = false;
      if (action.guardType === "unblockable") {
        isBlocked = false;
      } else if (action.guardType === "stand_only") {
        if (opp.isGuarding && opp.guardStance === "high") {
          isBlocked = true;
        } else {
          isBlocked = false;
        }
      } else if (action.guardType === "crouch_only") {
        if (opp.isGuarding && opp.guardStance === "low") {
          isBlocked = true;
        } else {
          isBlocked = false;
        }
      } else if (opp.isGuarding) {
        isBlocked = true;
      }
      if (isBlocked) {
        damage = Math.round(damage * (action.chipRatio || 0.15));
        opp.hp = Math.max(0, opp.hp - damage);
        soundEngine.playHit("guard");
        this._triggerHaptic(20);
        char.frameAdvantage = -4;
        this.floatingTexts.push({
          text: `GUARD -${damage}`,
          x: opp.x,
          y: opp.y - 80,
          color: "#38bdf8",
          life: 30
        });
        return;
      }
      opp.hp = Math.max(0, opp.hp - damage);
      opp.burstMeter = Math.min(opp.burstMax, opp.burstMeter + Math.round(damage * 0.9));
      char.comboCount++;
      char.comboDamage += damage;
      char.comboResetTimer = 45;
      char.frameAdvantage = 4;
      if (action.knockdown || damage >= 150) {
        soundEngine.playHit("slam");
        this._triggerHaptic(80);
      } else {
        soundEngine.playHit(action.name.includes("\u8E22") ? "kick" : "punch");
        this._triggerHaptic(action.damage > 80 ? 50 : 15);
      }
      if (action.knockdown) {
        opp.state = "knockdown";
        opp.stateTime = 0;
        opp.vx = char.facing * 12;
        opp.vy = -6;
        opp.isGrounded = false;
      } else {
        opp.state = "hit_stun";
        opp.stateTime = 0;
        opp.stateDuration = 16;
        opp.vx = char.facing * 6;
      }
      this.floatingTexts.push({
        text: `HIT! -${damage}`,
        x: opp.x,
        y: opp.y - 90,
        color: "#ff007f",
        life: 35
      });
    }
    _triggerParryCounter(parryChar, attacker) {
      parryChar.currentAction.hitChecked = true;
      soundEngine.playHit("parry_trigger");
      this._triggerHaptic(60);
      attacker.state = "hit_stun";
      attacker.stateTime = 0;
      attacker.stateDuration = 35;
      attacker.hp = Math.max(0, attacker.hp - 190);
      this.floatingTexts.push({
        text: "PARRY COUNTER! -190",
        x: parryChar.x,
        y: parryChar.y - 110,
        color: "#00ff66",
        life: 45
      });
    }
    _updateProjectiles() {
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        p.x += p.vx;
        p.life--;
        const target = p.ownerId === 1 ? this.p2 : this.p1;
        const dist = Math.abs(p.x - target.x);
        if (dist < 40 && target.y >= this.floorY - 90 && target.invincibleTimer <= 0) {
          this._applyHit(p.ownerId === 1 ? this.p1 : this.p2, target, {
            name: "\u80FD\u91CF\u8108\u885D\u5F48",
            damage: p.damage,
            guardType: "all",
            chipRatio: 0.15
          });
          this.projectiles.splice(i, 1);
          continue;
        }
        if (p.life <= 0 || p.x < 20 || p.x > this.arenaWidth - 20) {
          this.projectiles.splice(i, 1);
        }
      }
    }
    _updateShockwaves() {
      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const s = this.shockwaves[i];
        s.duration--;
        if (s.radius !== void 0) {
          s.radius += (s.maxRadius - s.radius) * 0.2;
        }
        if (s.duration <= 0) {
          this.shockwaves.splice(i, 1);
        }
      }
    }
    _updateFloatingTexts() {
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const t = this.floatingTexts[i];
        t.y -= 0.8;
        t.life--;
        if (t.life <= 0) {
          this.floatingTexts.splice(i, 1);
        }
      }
    }
    _resolvePositions() {
      const p1 = this.p1;
      const p2 = this.p2;
      if (!p1 || !p2) return;
      const isP1Passing = p1.state === "skill" && p1.currentAction && (p1.currentAction.id === "SK-03" || p1.currentAction.id === "SK-05");
      const isP2Passing = p2.state === "skill" && p2.currentAction && (p2.currentAction.id === "SK-03" || p2.currentAction.id === "SK-05");
      const isP1Down = p1.state === "knockdown" || p1.state === "wakeup";
      const isP2Down = p2.state === "knockdown" || p2.state === "wakeup";
      if (isP1Passing || isP2Passing || isP1Down || isP2Down) {
        p1.x = Math.max(50, Math.min(this.arenaWidth - 50, p1.x));
        p2.x = Math.max(50, Math.min(this.arenaWidth - 50, p2.x));
        return;
      }
      const dy = Math.abs(p1.y - p2.y);
      const p1Air = !p1.isGrounded;
      const p2Air = !p2.isGrounded;
      if ((p1Air || p2Air) && dy > 35) {
        p1.x = Math.max(50, Math.min(this.arenaWidth - 50, p1.x));
        p2.x = Math.max(50, Math.min(this.arenaWidth - 50, p2.x));
        return;
      }
      if (p1Air || p2Air) {
        const dx2 = p2.x - p1.x;
        if (Math.abs(dx2) < 40) {
          if (p1Air && Math.abs(p1.vx) > 0.5) {
            p1.x += Math.sign(p1.vx) * 2.5;
          } else if (p2Air && Math.abs(p2.vx) > 0.5) {
            p2.x += Math.sign(p2.vx) * 2.5;
          }
        }
        p1.x = Math.max(50, Math.min(this.arenaWidth - 50, p1.x));
        p2.x = Math.max(50, Math.min(this.arenaWidth - 50, p2.x));
        return;
      }
      const minDistance = 44;
      const dx = p2.x - p1.x;
      const dist = Math.abs(dx);
      if (dist < minDistance) {
        const p1Pushing = p1.state === "walk_fwd";
        const p2Pushing = p2.state === "walk_fwd";
        if (p1Pushing && !p2Pushing) {
          p1.x += p1.facing * 3.8;
          p2.x -= p1.facing * 1.2;
        } else if (p2Pushing && !p1Pushing) {
          p2.x += p2.facing * 3.8;
          p1.x -= p2.facing * 1.2;
        } else if (p1Pushing && p2Pushing) {
          p1.x += p1.facing * 2.8;
          p2.x += p2.facing * 2.8;
        } else {
          const push = (minDistance - dist) / 2;
          if (dx >= 0) {
            p1.x -= push;
            p2.x += push;
          } else {
            p1.x += push;
            p2.x -= push;
          }
        }
      }
      if (p1.x > this.arenaWidth - 65 && p2.x > this.arenaWidth - 110) {
        p2.x = this.arenaWidth - 110;
      } else if (p1.x < 65 && p2.x < 110) {
        p2.x = 110;
      }
      if (p2.x > this.arenaWidth - 65 && p1.x > this.arenaWidth - 110) {
        p1.x = this.arenaWidth - 110;
      } else if (p2.x < 65 && p1.x < 110) {
        p1.x = 110;
      }
      p1.x = Math.max(50, Math.min(this.arenaWidth - 50, p1.x));
      p2.x = Math.max(50, Math.min(this.arenaWidth - 50, p2.x));
    }
    _handleTimeOver() {
      this.isOver = true;
      if (this.p1.hp > this.p2.hp) this.winner = 1;
      else if (this.p2.hp > this.p1.hp) this.winner = 2;
      else this.winner = 0;
      soundEngine.playHit("ko");
    }
    _triggerHaptic(durationMs) {
      if (this.enableHaptics && typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(durationMs);
        } catch (e) {
        }
      }
    }
  };
  var combatEngine = new CombatEngine();

  // js/engine/ai.js
  var AiController = class {
    constructor(difficulty = "normal") {
      this.difficulty = difficulty;
      this.reactionDelay = 20;
      this.currentDelay = 0;
      this.bufferedDecision = { x: 0, y: 0, punch: false, kick: false, skill1: false, skill2: false, skill3: false, burst: false };
    }
    setDifficulty(diff) {
      this.difficulty = diff;
      this.currentDelay = 0;
    }
    /**
     * 決策每幀輸入
     */
    decide(aiChar, playerChar, combatEngine2) {
      if (combatEngine2.isTraining) {
        return this._decideTrainingDummy(aiChar, playerChar, combatEngine2.trainingSettings);
      }
      let targetDelay = 20;
      if (this.difficulty === "easy") targetDelay = 40;
      else if (this.difficulty === "normal") targetDelay = 20;
      else if (this.difficulty === "hard") targetDelay = 9;
      else if (this.difficulty === "nightmare") targetDelay = 3;
      this.currentDelay++;
      if (this.currentDelay >= targetDelay) {
        this.currentDelay = 0;
        this.bufferedDecision = this._makeDecision(aiChar, playerChar, combatEngine2);
      }
      return this.bufferedDecision;
    }
    _makeDecision(ai, player, engine) {
      const input = { x: 0, y: 0, punch: false, kick: false, skill1: false, skill2: false, skill3: false, burst: false };
      const dist = Math.abs(ai.x - player.x);
      const facingPlayer = (ai.x < player.x ? 1 : -1) === ai.facing;
      const playerInAir = !player.isGrounded;
      const playerAttacking = player.state === "light_punch" || player.state === "heavy_kick" || player.state === "skill";
      const playerGuarding = player.isGuarding;
      if (this.difficulty === "nightmare") {
        if (ai.state === "hit_stun" && ai.burstMeter >= ai.burstMax && ai.burstAvailable) {
          input.burst = true;
          return input;
        }
        if (playerInAir && dist < 160) {
          if (ai.cooldowns[1] <= 0) {
            input.skill2 = true;
            return input;
          } else {
            input.kick = true;
            return input;
          }
        }
        if (playerAttacking && dist < 120) {
          if (ai.cooldowns[0] <= 0 && ai.skills[0].id === "SK-05") {
            input.skill1 = true;
            return input;
          }
          if (player.currentAction && player.currentAction.guardType === "crouch_only") {
            input.x = ai.facing * -1;
            input.y = 1;
            return input;
          } else {
            input.x = ai.facing * -1;
            return input;
          }
        }
        if (playerGuarding && dist < 100) {
          if (ai.cooldowns[2] <= 0 && ai.skills[2].id === "SK-08") {
            input.skill3 = true;
            return input;
          } else if (ai.cooldowns[0] <= 0 && ai.skills[0].id === "SK-03") {
            input.skill1 = true;
            return input;
          }
        }
        if (dist > 220) {
          if (ai.cooldowns[0] <= 0) {
            input.skill1 = true;
            return input;
          }
          input.x = ai.facing;
          return input;
        } else {
          if (Math.random() < 0.6) input.punch = true;
          else input.kick = true;
          return input;
        }
      }
      if (this.difficulty === "hard") {
        if (playerInAir && dist < 140) {
          if (ai.cooldowns[1] <= 0) {
            input.skill2 = true;
            return input;
          }
          input.kick = true;
          return input;
        }
        if (playerAttacking && dist < 100) {
          input.x = ai.facing * -1;
          return input;
        }
        if (dist > 180) {
          if (ai.cooldowns[0] <= 0 && Math.random() < 0.7) {
            input.skill1 = true;
            return input;
          }
          input.x = ai.facing;
        } else {
          if (Math.random() < 0.5) input.punch = true;
          else if (Math.random() < 0.8) input.kick = true;
          else input.x = ai.facing * -1;
        }
        return input;
      }
      if (this.difficulty === "normal") {
        if (dist > 200) {
          if (ai.cooldowns[0] <= 0 && Math.random() < 0.4) {
            input.skill1 = true;
          } else {
            input.x = ai.facing;
          }
        } else {
          if (playerAttacking && Math.random() < 0.5) {
            input.x = ai.facing * -1;
          } else {
            const r = Math.random();
            if (r < 0.4) input.punch = true;
            else if (r < 0.7) input.kick = true;
            else if (r < 0.85 && ai.cooldowns[1] <= 0) input.skill2 = true;
          }
        }
        return input;
      }
      if (dist > 120) {
        input.x = ai.facing * 0.7;
      } else {
        if (Math.random() < 0.3) input.punch = true;
        else if (Math.random() < 0.45) input.kick = true;
      }
      return input;
    }
    /**
     * 自由格鬥訓練營假人行為控制
     */
    _decideTrainingDummy(dummy, player, settings) {
      const input = { x: 0, y: 0, punch: false, kick: false, skill1: false, skill2: false, skill3: false, burst: false };
      if (settings.dummyReversal && dummy.state === "wakeup" && dummy.stateTime >= 13) {
        input.skill2 = true;
        return input;
      }
      if (settings.dummyStance === "jump") {
        input.y = -1;
      } else if (settings.dummyStance === "crouch") {
        input.y = 1;
      }
      if (settings.dummyGuard === "stand_guard") {
        input.x = dummy.facing * -1;
      } else if (settings.dummyGuard === "crouch_guard") {
        input.x = dummy.facing * -1;
        input.y = 1;
      } else if (settings.dummyGuard === "after_first_hit") {
        if (player.comboCount >= 1) {
          input.x = dummy.facing * -1;
        }
      }
      return input;
    }
  };
  var aiController = new AiController("normal");

  // js/engine/replay.js
  var ReplaySystem = class {
    constructor() {
      this.isRecording = false;
      this.isPlaying = false;
      this.currentSeed = 12345;
      this.meta = null;
      this.frames = [];
      this.playIndex = 0;
      this.playbackSpeed = 1;
      this.isPaused = false;
      this.shortcodeMap = {};
    }
    startRecording(seed, p1Data, p2Data, mode = "ai") {
      this.isRecording = true;
      this.isPlaying = false;
      this.currentSeed = seed || Math.floor(Math.random() * 1e5);
      this.meta = {
        version: "1.0",
        timestamp: Date.now(),
        mode,
        p1: { name: p1Data.name, skin: p1Data.skin.id, loadout: p1Data.loadout },
        p2: { name: p2Data.name, skin: p2Data.skin.id, loadout: p2Data.loadout }
      };
      this.frames = [];
    }
    recordFrame(inputP1, inputP2) {
      if (!this.isRecording) return;
      const p1Bits = this._encodeInput(inputP1);
      const p2Bits = this._encodeInput(inputP2);
      this.frames.push([p1Bits, p2Bits]);
    }
    stopRecording() {
      this.isRecording = false;
      return this.generateShortcode();
    }
    // ─── 按鍵輸入位元編碼 ───
    // bit 0: Left, bit 1: Right, bit 2: Up, bit 3: Down
    // bit 4: Punch, bit 5: Kick, bit 6: Skill1, bit 7: Skill2, bit 8: Skill3, bit 9: Burst
    _encodeInput(inp) {
      if (!inp) return 0;
      let b = 0;
      if (inp.x < -0.2) b |= 1;
      if (inp.x > 0.2) b |= 2;
      if (inp.y < -0.4) b |= 4;
      if (inp.y > 0.4) b |= 8;
      if (inp.punch) b |= 16;
      if (inp.kick) b |= 32;
      if (inp.skill1) b |= 64;
      if (inp.skill2) b |= 128;
      if (inp.skill3) b |= 256;
      if (inp.burst) b |= 512;
      return b;
    }
    _decodeInput(bits) {
      return {
        x: (bits & 1 ? -1 : 0) + (bits & 2 ? 1 : 0),
        y: (bits & 4 ? -1 : 0) + (bits & 8 ? 1 : 0),
        punch: !!(bits & 16),
        kick: !!(bits & 32),
        skill1: !!(bits & 64),
        skill2: !!(bits & 128),
        skill3: !!(bits & 256),
        burst: !!(bits & 512)
      };
    }
    // ─── 產生 CY-REP-XXXXXX 戰鬥重播短碼 ───
    generateShortcode() {
      const code = "CY-REP-" + Math.floor(1e5 + Math.random() * 9e5);
      const replayPackage = {
        meta: this.meta,
        seed: this.currentSeed,
        frames: this.frames
      };
      this.shortcodeMap[code] = replayPackage;
      try {
        localStorage.setItem("cyber_replay_" + code, JSON.stringify(replayPackage));
      } catch (e) {
        console.warn("Replay storage quota exceeded:", e);
      }
      return code;
    }
    getReplayPackage(code) {
      if (this.shortcodeMap[code]) return this.shortcodeMap[code];
      try {
        const raw = localStorage.getItem("cyber_replay_" + code);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.warn("Failed to load replay for", code, e);
      }
      return null;
    }
    startPlayback(replayPackage) {
      this.isRecording = false;
      this.isPlaying = true;
      this.isPaused = false;
      this.playbackSpeed = 1;
      this.playIndex = 0;
      this.currentReplay = replayPackage;
      return replayPackage.meta;
    }
    getNextFrameInputs() {
      if (!this.isPlaying || !this.currentReplay) return null;
      if (this.playIndex >= this.currentReplay.frames.length) {
        this.isPlaying = false;
        return null;
      }
      const [b1, b2] = this.currentReplay.frames[this.playIndex];
      this.playIndex++;
      return {
        p1: this._decodeInput(b1),
        p2: this._decodeInput(b2),
        progress: this.playIndex / this.currentReplay.frames.length
      };
    }
    togglePause() {
      this.isPaused = !this.isPaused;
      return this.isPaused;
    }
    stepForward() {
      if (!this.currentReplay || this.playIndex >= this.currentReplay.frames.length) return null;
      const [b1, b2] = this.currentReplay.frames[this.playIndex];
      this.playIndex++;
      return {
        p1: this._decodeInput(b1),
        p2: this._decodeInput(b2)
      };
    }
    setSpeed(speed) {
      this.playbackSpeed = speed;
    }
  };
  var replaySystem = new ReplaySystem();

  // js/network/p2p.js
  var P2PNetwork = class {
    constructor() {
      this.peer = null;
      this.conn = null;
      this.roomCode = null;
      this.isHost = false;
      this.isConnected = false;
      this.onConnectedCallback = null;
      this.onDataCallback = null;
      this.onStatusChangeCallback = null;
    }
    generateRoomCode() {
      return "CY-" + Math.floor(1e3 + Math.random() * 9e3);
    }
    initHost(onStatusChange) {
      this.isHost = true;
      this.roomCode = this.generateRoomCode();
      this.onStatusChangeCallback = onStatusChange;
      this._initPeer("host");
      return this.roomCode;
    }
    joinRoom(code, onStatusChange) {
      this.isHost = false;
      this.roomCode = code.trim().toUpperCase();
      this.onStatusChangeCallback = onStatusChange;
      this._initPeer("guest");
    }
    _initPeer(role) {
      const peerId = role === "host" ? `cyberstriker-${this.roomCode.toLowerCase()}` : void 0;
      try {
        if (typeof Peer !== "undefined") {
          this.peer = new Peer(peerId, {
            debug: 1,
            config: {
              iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:global.stun.twilio.com:3478" }
              ]
            }
          });
          this.peer.on("open", (id) => {
            if (this.onStatusChangeCallback) {
              this.onStatusChangeCallback(role === "host" ? "waiting_guest" : "connecting");
            }
            if (role === "guest") {
              const hostPeerId = `cyberstriker-${this.roomCode.toLowerCase()}`;
              this._connectToHost(hostPeerId);
            }
          });
          this.peer.on("connection", (conn) => {
            this.conn = conn;
            this._setupConn();
          });
          this.peer.on("error", (err) => {
            console.warn("P2P Peer error:", err);
            if (this.onStatusChangeCallback) {
              this.onStatusChangeCallback("error", err.message);
            }
          });
        } else {
          console.warn("PeerJS not found, fallback to local loopback.");
          setTimeout(() => {
            if (this.onStatusChangeCallback) this.onStatusChangeCallback("waiting_guest");
          }, 500);
        }
      } catch (e) {
        console.warn("P2P Init exception:", e);
        if (this.onStatusChangeCallback) this.onStatusChangeCallback("error", e.message);
      }
    }
    _connectToHost(hostPeerId) {
      if (!this.peer) return;
      this.conn = this.peer.connect(hostPeerId, { reliable: false });
      this._setupConn();
    }
    _setupConn() {
      if (!this.conn) return;
      this.conn.on("open", () => {
        this.isConnected = true;
        if (this.onStatusChangeCallback) {
          this.onStatusChangeCallback("connected", { isHost: this.isHost, roomCode: this.roomCode });
        }
      });
      this.conn.on("data", (data) => {
        if (this.onDataCallback) {
          this.onDataCallback(data);
        }
      });
      this.conn.on("close", () => {
        this.isConnected = false;
        if (this.onStatusChangeCallback) {
          this.onStatusChangeCallback("disconnected");
        }
      });
    }
    send(data) {
      if (this.conn && this.isConnected) {
        try {
          this.conn.send(data);
        } catch (e) {
          console.warn("Send packet failed:", e);
        }
      }
    }
    disconnect() {
      if (this.conn) {
        this.conn.close();
        this.conn = null;
      }
      if (this.peer) {
        this.peer.destroy();
        this.peer = null;
      }
      this.isConnected = false;
      this.roomCode = null;
    }
  };
  var p2pNetwork = new P2PNetwork();

  // js/app.js
  var CyberStrikerApp = class {
    constructor() {
      this.currentTab = "skins";
      this.pedestalSkin = null;
      this.pedestalAction = "idle";
      this.pedestalActionTimer = 0;
      this.pedestalTime = 0;
      this.pedestalAnimId = null;
      this.isFighting = false;
      this.matchMode = "ai";
      this.aiDifficulty = "normal";
      this.loadoutSelection = ["SK-01", "SK-02", "SK-09"];
      this.loadoutTimer = 15;
      this.loadoutInterval = null;
      this.keys = {};
      this.mobileInputs = { x: 0, y: 0, punch: false, kick: false, skill1: false, skill2: false, skill3: false, burst: false };
      this.canvas = null;
      this.ctx = null;
      this.pedestalCanvas = null;
      this.pedestalCtx = null;
    }
    init() {
      saveSystem.init();
      this.pedestalSkin = this.getEquippedSkin();
      this.canvas = document.getElementById("gameCanvas");
      if (this.canvas) {
        this.ctx = this.canvas.getContext("2d");
        this._resizeCanvas();
        window.addEventListener("resize", () => this._resizeCanvas());
      }
      this.pedestalCanvas = document.getElementById("pedestalCanvas");
      if (this.pedestalCanvas) {
        this.pedestalCtx = this.pedestalCanvas.getContext("2d");
        this.pedestalCanvas.width = 400;
        this.pedestalCanvas.height = 360;
      }
      this._bindDOMEvents();
      this._bindKeyboardEvents();
      this._bindTouchEvents();
      this._startLoadingFlow();
      this._startPedestalLoop();
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
      const splash = document.getElementById("splashScreen");
      const bar = document.getElementById("splashProgressBar");
      const text = document.getElementById("splashStatusText");
      if (!splash || !bar || !text) return;
      let progress = 0;
      const stages = [
        { p: 35, text: "\u6B63\u5728\u521D\u59CB\u5316\u91CF\u5B50\u6230\u9B25\u5F15\u64CE (60 FPS Physical Engine)..." },
        { p: 75, text: "\u6B63\u5728\u7DE8\u8B6F 10 \u5927\u6838\u5FC3\u6280\u80FD\u77E9\u9663\u6578\u64DA\u5EAB..." },
        { p: 100, text: "\u6B63\u5728\u9023\u63A5\u5168\u606F\u88DD\u5099\u7DB2\u7D61\u8207\u96F2\u7AEF\u8CC7\u6599\u5EAB..." }
      ];
      const interval = setInterval(() => {
        progress += 2;
        bar.style.width = progress + "%";
        if (progress < 35) text.textContent = stages[0].text;
        else if (progress < 75) text.textContent = stages[1].text;
        else text.textContent = stages[2].text;
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            soundEngine.playHit("burst");
            splash.style.opacity = "0";
            setTimeout(() => {
              splash.style.display = "none";
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
          characterRenderer.drawPedestal(ctx, w / 2, h - 50, 90, currentSkin, this.pedestalTime);
          if (this.pedestalActionTimer > 0) {
            this.pedestalActionTimer--;
            if (this.pedestalActionTimer <= 0) {
              this.pedestalAction = "idle";
            }
          }
          const dummyModel = {
            x: w / 2,
            y: h - 60,
            facing: 1,
            state: this.pedestalAction,
            stateTime: this.pedestalTime,
            skin: currentSkin,
            isGuarding: this.pedestalAction.includes("guard"),
            guardStance: "high",
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
      this.pedestalActionTimer = action === "jump" ? 35 : 20;
      soundEngine.playHit(action === "light_punch" ? "punch" : action === "heavy_kick" ? "kick" : action === "high_guard" ? "guard" : "dp");
    }
    // ─── 畫面導航與分頁 ───
    switchTab(tabId) {
      this.currentTab = tabId;
      document.querySelectorAll(".nav-tab-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.tab === tabId);
      });
      document.querySelectorAll(".tab-view").forEach((view) => {
        view.classList.toggle("active", view.id === `view_${tabId}`);
      });
      soundEngine.playUI("click");
    }
    updateUserHUD() {
      const u = saveSystem.currentUser;
      if (!u) return;
      const nickEl = document.getElementById("userNickDisplay");
      const credEl = document.getElementById("userCreditsDisplay");
      const avatarEl = document.getElementById("userAvatarImg");
      const guestBadge = document.getElementById("guestStatusBadge");
      if (nickEl) nickEl.textContent = u.nickname;
      if (credEl) credEl.textContent = u.credits.toLocaleString();
      if (avatarEl) avatarEl.src = u.avatar;
      if (guestBadge) guestBadge.style.display = saveSystem.isGuest ? "inline-block" : "none";
      if (u.preferences) {
        soundEngine.setBgmVolume(u.preferences.bgmVol || 0.4);
        soundEngine.setSfxVolume(u.preferences.sfxVol || 0.8);
        combatEngine.enableHaptics = u.preferences.haptics !== false;
      }
    }
    getEquippedSkin() {
      const u = saveSystem.currentUser;
      const skinId = u ? u.equippedSkin : "skin_cyber_warrior";
      return SKINS.find((s) => s.id === skinId) || SKINS[0];
    }
    // ─── 分頁一：我的外觀渲染 ───
    renderSkinsInventory() {
      const container = document.getElementById("skinsGrid");
      if (!container) return;
      const u = saveSystem.currentUser;
      const owned = u ? u.skins : ["skin_cyber_warrior"];
      const equipped = u ? u.equippedSkin : "skin_cyber_warrior";
      container.innerHTML = SKINS.map((s) => {
        const isOwned = owned.includes(s.id);
        const isEquipped = equipped === s.id;
        let btnHtml = "";
        if (isEquipped) {
          btnHtml = `<button class="nav-tab-btn" style="border-color: #00ff66; color: #00ff66; width: 100%; justify-content: center;"><i class="fa-solid fa-check"></i> \u6230\u9B25\u88DD\u5099\u4E2D</button>`;
        } else if (isOwned) {
          btnHtml = `<button class="nav-tab-btn equip-skin-btn" data-id="${s.id}" style="background: rgba(0, 243, 255, 0.15); color: #00f3ff; width: 100%; justify-content: center;"><i class="fa-solid fa-shield"></i> \u88DD\u5099\u6B64\u9020\u578B</button>`;
        } else {
          btnHtml = `<button class="nav-tab-btn goto-shop-btn" data-id="${s.id}" style="border-color: rgba(255,255,255,0.15); color: #94a3b8; width: 100%; justify-content: center;"><i class="fa-solid fa-lock"></i> \u672A\u89E3\u9396\uFF08\u524D\u5F80\u5546\u5E97\uFF09</button>`;
        }
        return `
        <div class="skin-card ${isEquipped ? "equipped" : ""}" data-id="${s.id}" style="cursor: pointer;">
          <div class="skin-header">
            <div>
              <div class="skin-name" style="color: ${s.themeColor}">${s.name}</div>
              <div style="font-size: 11px; color: #94a3b8;">${s.title}</div>
            </div>
            <span class="skin-tag" style="border: 1px solid ${s.themeColor}; color: ${s.themeColor}">${s.isDefault ? "\u521D\u59CB\u9810\u8A2D" : s.category === "shop" ? "\u5546\u57CE\u9020\u578B" : "\u6D3B\u52D5\u9650\u5B9A"}</span>
          </div>
          <div class="skin-desc">${s.desc}</div>
          <div class="skin-vfx-box">
            <div><strong>\u26A1 \u666E\u653B\u5149\u8ECC\uFF1A</strong>${s.vfx.punchTrail}</div>
            <div><strong>\u{1F525} \u6280\u80FD\u7279\u6548\uFF1A</strong>${s.vfx.sk1}</div>
          </div>
          ${btnHtml}
        </div>
      `;
      }).join("");
      container.querySelectorAll(".skin-card").forEach((card) => {
        card.addEventListener("click", (e) => {
          const id = card.dataset.id;
          const skinObj = SKINS.find((s) => s.id === id);
          if (skinObj) {
            this.pedestalSkin = skinObj;
            soundEngine.playUI("hover");
          }
        });
      });
      container.querySelectorAll(".equip-skin-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;
          saveSystem.equipSkin(id);
          this.pedestalSkin = this.getEquippedSkin();
          soundEngine.playUI("equip");
          this.renderSkinsInventory();
          this.updateUserHUD();
        });
      });
      container.querySelectorAll(".goto-shop-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.switchTab("shop");
        });
      });
    }
    // ─── 分頁二：商店渲染 ───
    renderShopCatalog(filterSeries = "all") {
      const container = document.getElementById("shopGrid");
      if (!container) return;
      const u = saveSystem.currentUser;
      const owned = u ? u.skins : [];
      let forSaleSkins = SKINS.filter((s) => s.price > 0);
      if (filterSeries && filterSeries !== "all") {
        forSaleSkins = forSaleSkins.filter((s) => s.series === filterSeries);
      }
      container.innerHTML = forSaleSkins.map((s) => {
        const isOwned = owned.includes(s.id);
        return `
        <div class="skin-card">
          <div class="skin-header">
            <div>
              <div class="skin-name" style="color: ${s.themeColor}">${s.name}</div>
              <div style="font-size: 11px; color: #94a3b8;">${s.title} | ${s.series || "\u6230\u8853\u5916\u88DD"}</div>
            </div>
            <span class="stat-capsule" style="font-size: 13px;">\u{1FA99} ${s.price.toLocaleString()}</span>
          </div>
          <div class="skin-desc">${s.desc}</div>
          <div class="skin-vfx-box">
            <div><strong>\u26A1 \u5C08\u5C6C\u5149\u8ECC\uFF1A</strong>${s.vfx.punchTrail}</div>
            <div><strong>\u{1F6E1}\uFE0F \u5C08\u5C6C\u8B77\u76FE\uFF1A</strong>${s.vfx.guardShield}</div>
          </div>
          <div style="font-size: 11px; color: #64748b;">\u{1F3A8} \u5275\u4F5C\u8005\uFF1A${s.creator || "\u5B98\u65B9\u793E\u7FA4"}</div>
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <button class="nav-tab-btn try-on-btn" data-id="${s.id}" style="flex: 1; justify-content: center; border-color: ${s.themeColor}; color: ${s.themeColor}">
              <i class="fa-solid fa-eye"></i> \u8A66\u7A7F\u6F14\u793A
            </button>
            ${isOwned ? `
              <button class="nav-tab-btn" disabled style="flex: 1; justify-content: center; color: #10b981; border-color: #10b981;">
                <i class="fa-solid fa-check"></i> \u5DF2\u64C1\u6709
              </button>
            ` : `
              <button class="nav-tab-btn buy-skin-btn" data-id="${s.id}" data-price="${s.price}" style="flex: 1; justify-content: center; background: linear-gradient(135deg, #00f3ff, #ff007f); color: #fff;">
                <i class="fa-solid fa-cart-shopping"></i> \u8CFC\u8CB7
              </button>
            `}
          </div>
        </div>
      `;
      }).join("");
      container.querySelectorAll(".try-on-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          const skinObj = SKINS.find((s) => s.id === id);
          if (skinObj) {
            this.pedestalSkin = skinObj;
            this.switchTab("skins");
            soundEngine.playUI("hover");
          }
        });
      });
      container.querySelectorAll(".buy-skin-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          const price = parseInt(btn.dataset.price, 10);
          const res = saveSystem.purchaseSkin(id, price);
          if (res.success) {
            soundEngine.playUI("equip");
            alert(`\u{1F389} \u606D\u559C\u6210\u529F\u89E3\u9396\u9020\u578B\u3010${SKINS.find((s) => s.id === id).name}\u3011\uFF01\u5DF2\u76F4\u63A5\u70BA\u60A8\u51FA\u6230\u88DD\u5099\u3002`);
            this.renderShopCatalog(filterSeries);
            this.renderSkinsInventory();
            this.updateUserHUD();
          } else {
            soundEngine.playHit("guard");
            alert(`\u8CFC\u8CB7\u5931\u6557\uFF1A${res.reason}`);
          }
        });
      });
    }
    // ─── 量子身分授權儀 (Authentication Gateway) ───
    openAuthModal() {
      const modal = document.getElementById("authModal");
      if (!modal) return;
      modal.classList.add("active");
      const listContainer = document.getElementById("googleAccountsList");
      if (listContainer) {
        const accounts = saveSystem.getRegisteredAccountsList();
        listContainer.innerHTML = accounts.map((acc) => `
        <div class="google-account-card ${acc.isCurrent ? "current" : ""}" style="background: rgba(255,255,255,0.04); border: 1px solid ${acc.isCurrent ? "#00f3ff" : "rgba(255,255,255,0.1)"}; border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${acc.avatar}" style="width: 36px; height: 36px; border-radius: 50%; border: 2px solid #00f3ff;">
            <div>
              <div style="font-weight: 800; font-size: 14px;">${acc.nickname} ${acc.isCurrent ? '<span style="color:#00f3ff; font-size: 11px;">(\u7576\u524D\u4F7F\u7528)</span>' : ""}</div>
              <div style="font-size: 12px; color: #94a3b8;">${acc.email}</div>
            </div>
          </div>
          <button class="nav-tab-btn switch-acc-btn" data-email="${acc.email}" style="padding: 6px 12px; font-size: 12px; border-color: #00f3ff; color: #00f3ff;">
            \u4E00\u9375\u5207\u63DB
          </button>
        </div>
      `).join("");
        listContainer.querySelectorAll(".switch-acc-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const email = btn.dataset.email;
            saveSystem.switchAccount(email);
            this.updateUserHUD();
            this.renderSkinsInventory();
            this.renderShopCatalog();
            this.closeAuthModal();
            soundEngine.playUI("equip");
          });
        });
      }
    }
    closeAuthModal() {
      const modal = document.getElementById("authModal");
      if (modal) modal.classList.remove("active");
    }
    // ─── 賽前「10 選 3」配技視窗 (無時間限制) ───
    openLoadoutModal(startMatchCallback) {
      const modal = document.getElementById("loadoutModal");
      if (!modal) return;
      modal.classList.add("active");
      if (this.loadoutInterval) {
        clearInterval(this.loadoutInterval);
        this.loadoutInterval = null;
      }
      const u = saveSystem.currentUser;
      this.loadoutSelection = u && u.loadout && u.loadout.length === 3 ? [...u.loadout] : ["SK-01", "SK-02", "SK-09"];
      this._renderLoadoutSkillsGrid();
      document.querySelectorAll(".archetype-btn").forEach((btn) => {
        btn.onclick = () => {
          const archId = btn.dataset.arch;
          const arch = ARCHETYPES.find((a) => a.id === archId);
          if (arch) {
            this.loadoutSelection = [...arch.skills];
            this._renderLoadoutSkillsGrid();
            soundEngine.playUI("click");
          }
        };
      });
      const confirmBtn = document.getElementById("confirmLoadoutBtn");
      if (confirmBtn) {
        confirmBtn.onclick = () => {
          this._confirmLoadout(startMatchCallback);
        };
      }
    }
    _renderLoadoutSkillsGrid() {
      const container = document.getElementById("loadoutSkillsGrid");
      if (!container) return;
      container.innerHTML = SKILLS.map((sk) => {
        const isSelected = this.loadoutSelection.includes(sk.id);
        const slotIndex = this.loadoutSelection.indexOf(sk.id);
        const keyName = slotIndex === 0 ? "[U]" : slotIndex === 1 ? "[I]" : slotIndex === 2 ? "[O]" : "";
        return `
        <div class="skill-card ${isSelected ? "selected" : ""}" data-id="${sk.id}" style="background: rgba(255,255,255,0.03); border: 1px solid ${isSelected ? "#00f3ff" : "rgba(255,255,255,0.1)"}; border-radius: 8px; padding: 10px; cursor: pointer; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="color: ${sk.color}; font-size: 13px;"><i class="${sk.icon}"></i> ${sk.name}</strong>
            ${isSelected ? `<span style="background: #00f3ff; color: #000; font-size: 11px; font-weight: 900; padding: 1px 6px; border-radius: 4px;">${keyName}</span>` : ""}
          </div>
          <div style="font-size: 11px; color: #94a3b8;">${sk.typeName} | \u50B7\u5BB3 ${sk.damage} | CD ${sk.cd}s</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${sk.description}</div>
        </div>
      `;
      }).join("");
      container.querySelectorAll(".skill-card").forEach((card) => {
        card.addEventListener("click", () => {
          const id = card.dataset.id;
          if (this.loadoutSelection.includes(id)) {
            if (this.loadoutSelection.length > 1) {
              this.loadoutSelection = this.loadoutSelection.filter((s) => s !== id);
            }
          } else {
            if (this.loadoutSelection.length < 3) {
              this.loadoutSelection.push(id);
            } else {
              this.loadoutSelection.shift();
              this.loadoutSelection.push(id);
            }
          }
          soundEngine.playUI("click");
          this._renderLoadoutSkillsGrid();
        });
      });
    }
    _confirmLoadout(callback) {
      const modal = document.getElementById("loadoutModal");
      if (modal) modal.classList.remove("active");
      saveSystem.updateLoadout(this.loadoutSelection);
      if (callback) callback();
    }
    // ─── 進入對戰系統 ───
    startBattle(mode = "ai", diff = "normal") {
      this.matchMode = mode;
      this.aiDifficulty = diff;
      aiController.setDifficulty(diff);
      this.openLoadoutModal(() => {
        this._launchMatch();
      });
    }
    _launchMatch() {
      const battleScreen = document.getElementById("battleScreen");
      if (battleScreen) battleScreen.classList.add("active");
      const p1Skin = this.getEquippedSkin();
      let p2Skin = SKINS[1];
      if (this.aiDifficulty === "hard") p2Skin = SKINS[2];
      if (this.aiDifficulty === "nightmare") p2Skin = SKINS[4];
      const p1Data = {
        name: saveSystem.currentUser ? saveSystem.currentUser.nickname : "Player 1",
        skin: p1Skin,
        loadout: this.loadoutSelection
      };
      const p2Data = {
        name: this.matchMode === "training" ? "\u7DF4\u7FD2\u6728\u6A01\u5047\u4EBA" : this.matchMode === "local_2p" ? "Player 2" : `AI (${this.aiDifficulty.toUpperCase()})`,
        skin: p2Skin,
        loadout: ["SK-01", "SK-02", "SK-09"]
      };
      combatEngine.initMatch(p1Data, p2Data, this.matchMode === "training");
      replaySystem.startRecording(12345, p1Data, p2Data, this.matchMode);
      this.isFighting = true;
      soundEngine.playUI("fight");
      soundEngine.startBgm();
      const p1NameEl = document.getElementById("p1NameDisplay");
      const p2NameEl = document.getElementById("p2NameDisplay");
      const p2RoleTag = document.getElementById("p2RoleTag");
      if (p1NameEl) p1NameEl.textContent = p1Data.name;
      if (p2NameEl) p2NameEl.textContent = p2Data.name;
      if (p2RoleTag) {
        const p2Text = this.matchMode === "local_2p" ? "2P \u5C0D\u624B" : this.matchMode === "training" ? "\u8A13\u7DF4\u6728\u6A01" : "\u96FB\u8166\u5C0D\u624B / AI";
        p2RoleTag.innerHTML = `<i class="fa-solid fa-robot"></i> ${p2Text}`;
      }
      this._updateSkillActionBar();
      this._runBattleLoop();
    }
    _updateSkillActionBar() {
      const bar = document.getElementById("battleActionBar");
      if (!bar) return;
      bar.innerHTML = combatEngine.p1.skills.map((sk, idx) => {
        const hotkey = idx === 0 ? "U" : idx === 1 ? "I" : "O";
        return `
        <div class="skill-hud-card" id="skillCard_${idx}" style="border-color: ${sk.color};">
          <div class="skill-cd-overlay" id="skillCdOverlay_${idx}"></div>
          <i class="${sk.icon}" style="font-size: 20px; color: ${sk.color};"></i>
          <span style="font-size: 10px; font-weight: 900; color: #fff;">[${hotkey}]</span>
        </div>
      `;
      }).join("") + `
      <div class="burst-hud-card" id="burstHudBtn">
        <span style="font-size: 11px;">BURST</span>
        <span style="font-size: 9px; opacity: 0.8;">[B]</span>
      </div>
    `;
      const trainingBar = document.getElementById("trainingToolbar");
      if (trainingBar) {
        trainingBar.style.display = this.matchMode === "training" ? "flex" : "none";
      }
    }
    _runBattleLoop() {
      if (!this.isFighting) return;
      const inputP1 = this._gatherInputsP1();
      let inputP2 = null;
      if (this.matchMode === "local_2p") {
        inputP2 = this._gatherInputsP2();
      } else {
        inputP2 = aiController.decide(combatEngine.p2, combatEngine.p1, combatEngine);
      }
      replaySystem.recordFrame(inputP1, inputP2);
      combatEngine.update(inputP1, inputP2);
      this._renderBattleFrame();
      this._updateBattleHUD();
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
      if (k["KeyA"] || k["ArrowLeft"]) x -= 1;
      if (k["KeyD"] || k["ArrowRight"]) x += 1;
      if (k["KeyW"] || k["ArrowUp"] || k["Space"]) y -= 1;
      if (k["KeyS"] || k["ArrowDown"]) y += 1;
      if (Math.abs(m.x) > 0.1) x = m.x;
      if (Math.abs(m.y) > 0.1) y = m.y;
      return {
        x,
        y,
        punch: !!(k["KeyJ"] || m.punch),
        kick: !!(k["KeyK"] || m.kick),
        skill1: !!(k["KeyU"] || m.skill1),
        skill2: !!(k["KeyI"] || m.skill2),
        skill3: !!(k["KeyO"] || m.skill3),
        burst: !!(k["KeyB"] || m.burst)
      };
    }
    _gatherInputsP2() {
      const k = this.keys;
      let x = 0;
      let y = 0;
      if (k["ArrowLeft"]) x -= 1;
      if (k["ArrowRight"]) x += 1;
      if (k["ArrowUp"]) y -= 1;
      if (k["ArrowDown"]) y += 1;
      return {
        x,
        y,
        punch: !!(k["Numpad1"] || k["Digit1"]),
        kick: !!(k["Numpad2"] || k["Digit2"]),
        skill1: !!(k["Numpad4"] || k["Digit4"]),
        skill2: !!(k["Numpad5"] || k["Digit5"]),
        skill3: !!(k["Numpad6"] || k["Digit6"]),
        burst: !!(k["Numpad0"] || k["Digit0"])
      };
    }
    _renderBattleFrame() {
      if (!this.ctx || !this.canvas) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      ctx.fillStyle = "#050814";
      ctx.fillRect(0, 0, w, h);
      const groundY = combatEngine.floorY;
      ctx.strokeStyle = "rgba(0, 243, 255, 0.15)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(0, 243, 255, 0.6)";
      ctx.fillRect(0, groundY, w, 3);
      this._drawFighterFloorRings(ctx, groundY);
      characterRenderer.draw(ctx, combatEngine.p1);
      characterRenderer.draw(ctx, combatEngine.p2);
      this._drawFighterOverheadBadges(ctx);
      combatEngine.projectiles.forEach((p) => {
        ctx.save();
        ctx.shadowColor = p.skin.themeColor;
        ctx.shadowBlur = 16;
        ctx.fillStyle = p.skin.themeColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 3, p.y);
        ctx.stroke();
        ctx.restore();
      });
      combatEngine.shockwaves.forEach((s) => {
        ctx.save();
        ctx.strokeStyle = s.color || "#00f3ff";
        ctx.shadowColor = s.color || "#00f3ff";
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
      combatEngine.floatingTexts.forEach((t) => {
        ctx.save();
        ctx.font = "bold 18px Orbitron, sans-serif";
        ctx.fillStyle = t.color;
        ctx.shadowColor = t.color;
        ctx.shadowBlur = 10;
        ctx.fillText(t.text, t.x - 40, t.y);
        ctx.restore();
      });
    }
    _drawFighterFloorRings(ctx, groundY) {
      const p1 = combatEngine.p1;
      const p2 = combatEngine.p2;
      if (!p1 || !p2) return;
      const time = Date.now() / 250;
      ctx.save();
      ctx.translate(p1.x, groundY);
      ctx.scale(1, 0.3);
      ctx.beginPath();
      ctx.arc(0, 0, 46 + Math.sin(time) * 4, 0, Math.PI * 2);
      ctx.strokeStyle = "#00f3ff";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#00f3ff";
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.fillStyle = "rgba(0, 243, 255, 0.2)";
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.translate(p2.x, groundY);
      ctx.scale(1, 0.3);
      ctx.beginPath();
      ctx.arc(0, 0, 46 + Math.sin(time + 1.5) * 4, 0, Math.PI * 2);
      ctx.strokeStyle = "#ff007f";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#ff007f";
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 0, 127, 0.2)";
      ctx.fill();
      ctx.restore();
    }
    _drawFighterOverheadBadges(ctx) {
      const p1 = combatEngine.p1;
      const p2 = combatEngine.p2;
      if (!p1 || !p2) return;
      const bounce = Math.sin(Date.now() / 180) * 4;
      const p1HeadY = p1.y - 170 + bounce;
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#00f3ff";
      ctx.shadowColor = "#00f3ff";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1HeadY);
      ctx.lineTo(p1.x - 7, p1HeadY - 9);
      ctx.lineTo(p1.x + 7, p1HeadY - 9);
      ctx.closePath();
      ctx.fill();
      const badgeW1 = 156;
      const badgeH1 = 28;
      const badgeX1 = p1.x - badgeW1 / 2;
      const badgeY1 = p1HeadY - 9 - badgeH1;
      ctx.fillStyle = "rgba(5, 15, 30, 0.9)";
      ctx.strokeStyle = "#00f3ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(badgeX1, badgeY1, badgeW1, badgeH1, 6);
      } else {
        ctx.rect(badgeX1, badgeY1, badgeW1, badgeH1);
      }
      ctx.fill();
      ctx.stroke();
      ctx.font = '900 12px "Orbitron", "Noto Sans TC", sans-serif';
      ctx.fillStyle = "#00f3ff";
      ctx.shadowColor = "#00f3ff";
      ctx.shadowBlur = 10;
      ctx.fillText("\u2605 \u9019\u662F\u73A9\u5BB6\u7684\u89D2\u8272", p1.x, badgeY1 + badgeH1 / 2);
      ctx.restore();
      const p2HeadY = p2.y - 170 - bounce;
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ff007f";
      ctx.shadowColor = "#ff007f";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(p2.x, p2HeadY);
      ctx.lineTo(p2.x - 7, p2HeadY - 9);
      ctx.lineTo(p2.x + 7, p2HeadY - 9);
      ctx.closePath();
      ctx.fill();
      const badgeW2 = 136;
      const badgeH2 = 28;
      const badgeX2 = p2.x - badgeW2 / 2;
      const badgeY2 = p2HeadY - 9 - badgeH2;
      ctx.fillStyle = "rgba(25, 5, 15, 0.9)";
      ctx.strokeStyle = "#ff007f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(badgeX2, badgeY2, badgeW2, badgeH2, 6);
      } else {
        ctx.rect(badgeX2, badgeY2, badgeW2, badgeH2);
      }
      ctx.fill();
      ctx.stroke();
      const p2Label = this.matchMode === "local_2p" ? "2P \u5C0D\u624B" : this.matchMode === "training" ? "\u8A13\u7DF4\u6728\u6A01" : "\u96FB\u8166\u5C0D\u624B (AI)";
      ctx.font = '900 12px "Orbitron", "Noto Sans TC", sans-serif';
      ctx.fillStyle = "#ff007f";
      ctx.shadowColor = "#ff007f";
      ctx.shadowBlur = 10;
      ctx.fillText(p2Label, p2.x, badgeY2 + badgeH2 / 2);
      ctx.restore();
    }
    _updateBattleHUD() {
      const hp1El = document.getElementById("p1HpFill");
      const hp2El = document.getElementById("p2HpFill");
      if (hp1El) hp1El.style.width = `${Math.max(0, combatEngine.p1.hp / combatEngine.p1.maxHp * 100)}%`;
      if (hp2El) hp2El.style.width = `${Math.max(0, combatEngine.p2.hp / combatEngine.p2.maxHp * 100)}%`;
      const timerEl = document.getElementById("roundTimerText");
      if (timerEl) timerEl.textContent = combatEngine.roundTime;
      const burst1El = document.getElementById("p1BurstFill");
      if (burst1El) burst1El.style.width = `${combatEngine.p1.burstMeter / combatEngine.p1.burstMax * 100}%`;
      combatEngine.p1.cooldowns.forEach((cd, idx) => {
        const overlay = document.getElementById(`skillCdOverlay_${idx}`);
        if (overlay) {
          const totalCd = combatEngine.p1.skills[idx].cd;
          const ratio = cd > 0 ? cd / totalCd : 0;
          overlay.style.height = `${ratio * 100}%`;
        }
      });
      const frameEl = document.getElementById("frameAdvantageIndicator");
      if (frameEl && combatEngine.isTraining) {
        const adv = combatEngine.p1.frameAdvantage;
        if (adv > 0) {
          frameEl.innerHTML = `<span style="color: #00ff66;">\u6709\u5229 +${adv} \u5E40</span>`;
        } else if (adv < 0) {
          frameEl.innerHTML = `<span style="color: #ff007f;">\u4E0D\u5229 ${adv} \u5E40</span>`;
        } else {
          frameEl.innerHTML = `<span style="color: #94a3b8;">\u5747\u52E2 0 \u5E40</span>`;
        }
      }
    }
    // ─── 對決結束與結算 ───
    _handleMatchEnd() {
      this.isFighting = false;
      soundEngine.stopBgm();
      const won = combatEngine.winner === 1;
      const isAi = this.matchMode === "ai";
      const reward = saveSystem.recordBattleResult(won, this.aiDifficulty, isAi);
      const shortcode = replaySystem.stopRecording();
      const endModal = document.getElementById("matchEndModal");
      const resultTitle = document.getElementById("matchResultTitle");
      const creditsReward = document.getElementById("matchRewardAmount");
      const shortcodeDisplay = document.getElementById("matchReplayCode");
      if (resultTitle) {
        resultTitle.textContent = won ? "VICTORY \u6230\u9B25\u52DD\u5229" : "DEFEAT \u6230\u9B25\u843D\u6557";
        resultTitle.style.color = won ? "#00f3ff" : "#ff007f";
      }
      if (creditsReward) creditsReward.textContent = `+${reward.gained} \u80FD\u91CF\u5E63`;
      if (shortcodeDisplay) shortcodeDisplay.textContent = shortcode;
      if (endModal) endModal.classList.add("active");
      this.updateUserHUD();
    }
    exitBattleToLobby() {
      this.isFighting = false;
      soundEngine.stopBgm();
      const battleScreen = document.getElementById("battleScreen");
      if (battleScreen) battleScreen.classList.remove("active");
      const endModal = document.getElementById("matchEndModal");
      if (endModal) endModal.classList.remove("active");
      this.updateUserHUD();
    }
    // ─── 事件綁定 ───
    _bindDOMEvents() {
      document.querySelectorAll(".nav-tab-btn[data-tab]").forEach((btn) => {
        btn.addEventListener("click", () => this.switchTab(btn.dataset.tab));
      });
      const userBadge = document.getElementById("userBadge");
      if (userBadge) {
        userBadge.addEventListener("click", () => this.openAuthModal());
      }
      const pPunch = document.getElementById("pedestalPunchBtn");
      const pKick = document.getElementById("pedestalKickBtn");
      const pJump = document.getElementById("pedestalJumpBtn");
      const pGuard = document.getElementById("pedestalGuardBtn");
      if (pPunch) pPunch.onclick = () => this.previewPedestalAction("light_punch");
      if (pKick) pKick.onclick = () => this.previewPedestalAction("heavy_kick");
      if (pJump) pJump.onclick = () => this.previewPedestalAction("jump");
      if (pGuard) pGuard.onclick = () => this.previewPedestalAction("high_guard");
      const fab = document.getElementById("fabStartBtn");
      if (fab) {
        fab.addEventListener("click", () => {
          const modeModal = document.getElementById("modeSelectModal");
          if (modeModal) modeModal.classList.add("active");
          soundEngine.playUI("click");
        });
      }
      document.querySelectorAll(".select-ai-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const diff = btn.dataset.diff;
          document.getElementById("modeSelectModal").classList.remove("active");
          this.startBattle("ai", diff);
        });
      });
      const local2pBtn = document.getElementById("selectLocal2pBtn");
      if (local2pBtn) {
        local2pBtn.onclick = () => {
          document.getElementById("modeSelectModal").classList.remove("active");
          this.startBattle("local_2p");
        };
      }
      const trainingBtn = document.getElementById("selectTrainingBtn");
      if (trainingBtn) {
        trainingBtn.onclick = () => {
          document.getElementById("modeSelectModal").classList.remove("active");
          this.startBattle("training");
        };
      }
      const hostRoomBtn = document.getElementById("hostRoomBtn");
      if (hostRoomBtn) {
        hostRoomBtn.onclick = () => {
          const code = p2pNetwork.initHost((status, data) => {
            if (status === "connected") {
              document.getElementById("modeSelectModal").classList.remove("active");
              this.startBattle("p2p");
            }
          });
          alert(`\u{1F3AE} \u623F\u9593\u5DF2\u5EFA\u7ACB\uFF01\u623F\u9593\u4EE3\u78BC\uFF1A${code}
\u8ACB\u5C07\u4EE3\u78BC\u5206\u4EAB\u7D66\u597D\u53CB\u9023\u7DDA\u5C0D\u6C7A\u3002`);
        };
      }
      const joinRoomBtn = document.getElementById("joinRoomBtn");
      if (joinRoomBtn) {
        joinRoomBtn.onclick = () => {
          const code = prompt("\u8ACB\u8F38\u5165 6 \u4F4D\u6578\u623F\u9593\u4EE3\u78BC\uFF08\u4F8B\u5982\uFF1ACY-8821\uFF09\uFF1A");
          if (code) {
            p2pNetwork.joinRoom(code, (status) => {
              if (status === "connected") {
                document.getElementById("modeSelectModal").classList.remove("active");
                this.startBattle("p2p");
              }
            });
          }
        };
      }
      const emailForm = document.getElementById("manualEmailForm");
      if (emailForm) {
        emailForm.onsubmit = (e) => {
          e.preventDefault();
          const emailInput = document.getElementById("authEmailInput");
          const nickInput = document.getElementById("authNicknameInput");
          const email = emailInput ? emailInput.value.trim() : "";
          const nick = nickInput ? nickInput.value.trim() : "";
          if (!email.includes("@") || !email.includes(".")) {
            alert("\u8ACB\u8F38\u5165\u6709\u6548\u7684 Gmail \u4FE1\u7BB1\u683C\u5F0F\uFF01");
            return;
          }
          const res = saveSystem.loginWithEmail(email, nick);
          soundEngine.playUI("equip");
          alert(res.isNewUser ? `\u{1F389} \u6B61\u8FCE\u65B0\u6230\u58EB\uFF01\u5DF2\u767C\u653E 1,200 \u80FD\u91CF\u5E63\u8207 3 \u5957\u9810\u8A2D\u9020\u578B\u3002` : `\u2705 \u6B61\u8FCE\u56DE\u4F86\uFF01\u5DF2\u81EA\u96F2\u7AEF\u6210\u529F\u9084\u539F\u6240\u6709\u9032\u5EA6\u3002`);
          this.updateUserHUD();
          this.renderSkinsInventory();
          this.renderShopCatalog();
          this.closeAuthModal();
        };
      }
      const guestBtn = document.getElementById("authGuestBtn");
      if (guestBtn) {
        guestBtn.onclick = () => {
          saveSystem.loginAsGuest();
          this.updateUserHUD();
          this.closeAuthModal();
          soundEngine.playUI("click");
        };
      }
      const bugForm = document.getElementById("bugReportForm");
      if (bugForm) {
        bugForm.onsubmit = (e) => {
          e.preventDefault();
          const ticketCode = "BUG-" + (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(1e3 + Math.random() * 9e3);
          soundEngine.playUI("equip");
          alert(`\u2705 \u611F\u8B1D\u60A8\u7684\u53CD\u994B\uFF01\u5DE5\u55AE\u5DF2\u6210\u529F\u6D3E\u767C\uFF1A\u3010${ticketCode}\u3011
\u7CFB\u7D71\u5DF2\u81EA\u52D5\u6253\u5305\u60A8\u7684 UID\u3001Gmail \u8207\u6548\u80FD\u5E40\u6578\u6578\u64DA\u3002`);
          bugForm.reset();
        };
      }
      const copyReplayBtn = document.getElementById("copyReplayCodeBtn");
      if (copyReplayBtn) {
        copyReplayBtn.onclick = () => {
          const code = document.getElementById("matchReplayCode").textContent;
          navigator.clipboard.writeText(code);
          alert(`\u{1F4CB} \u91CD\u64AD\u4EE3\u78BC\u3010${code}\u3011\u5DF2\u8907\u88FD\u5230\u526A\u8CBC\u7C3F\uFF01\u53EF\u76F4\u63A5\u5206\u4EAB\u7D66\u793E\u7FA4\u597D\u53CB\u3002`);
        };
      }
      const muteBtn = document.getElementById("muteToggleBtn");
      if (muteBtn) {
        muteBtn.onclick = () => {
          soundEngine.setMuted(!soundEngine.isMuted);
          muteBtn.innerHTML = soundEngine.isMuted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
        };
      }
      const backLobbyBtn = document.getElementById("matchBackLobbyBtn");
      if (backLobbyBtn) {
        backLobbyBtn.onclick = () => this.exitBattleToLobby();
      }
      const exitTrainingBtn = document.getElementById("exitTrainingBtn");
      if (exitTrainingBtn) {
        exitTrainingBtn.onclick = () => this.exitBattleToLobby();
      }
      const workshopBtn = document.getElementById("workshopOpenBtn");
      if (workshopBtn) {
        workshopBtn.onclick = () => {
          const m = document.getElementById("workshopModal");
          if (m) m.classList.add("active");
        };
      }
      document.querySelectorAll(".shop-filter-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".shop-filter-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          const series = btn.dataset.series;
          this.renderShopCatalog(series);
          soundEngine.playUI("click");
        });
      });
      const claimRewardBtn = document.getElementById("dailyRewardClaimBtn");
      if (claimRewardBtn) {
        claimRewardBtn.addEventListener("click", () => {
          if (saveSystem.currentUser) {
            saveSystem.currentUser.credits += 1500;
            saveSystem._saveCurrent();
            this.updateUserHUD();
            soundEngine.playUI("equip");
            alert("\u{1F381} \u6BCF\u65E5\u6230\u5099\u88DC\u7D66\u9818\u53D6\u6210\u529F\uFF01\u5DF2\u7372\u5F97 +1,500 \u80FD\u91CF\u5E63\uFF0C\u5FEB\u53BB\u89E3\u9396\u5FC3\u5100\u7684\u6230\u5C07\u5427\uFF01");
            this.renderShopCatalog();
          }
        });
      }
      document.querySelectorAll(".modal-close-btn").forEach((btn) => {
        btn.onclick = () => {
          const m = btn.closest(".modal-overlay");
          if (m) m.classList.remove("active");
        };
      });
    }
    _bindKeyboardEvents() {
      window.addEventListener("keydown", (e) => {
        this.keys[e.code] = true;
      });
      window.addEventListener("keyup", (e) => {
        this.keys[e.code] = false;
      });
    }
    _bindTouchEvents() {
      const joyZone = document.getElementById("mobileJoystickZone");
      if (joyZone) {
        joyZone.addEventListener("touchstart", (e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const rect = joyZone.getBoundingClientRect();
          this._updateJoystick(touch.clientX - rect.left - rect.width / 2, touch.clientY - rect.top - rect.height / 2);
        });
        joyZone.addEventListener("touchmove", (e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const rect = joyZone.getBoundingClientRect();
          this._updateJoystick(touch.clientX - rect.left - rect.width / 2, touch.clientY - rect.top - rect.height / 2);
        });
        joyZone.addEventListener("touchend", (e) => {
          e.preventDefault();
          this.mobileInputs.x = 0;
          this.mobileInputs.y = 0;
        });
      }
      const bindTouchBtn = (id, key) => {
        const btn = document.getElementById(id);
        if (btn) {
          btn.addEventListener("touchstart", (e) => {
            e.preventDefault();
            this.mobileInputs[key] = true;
          });
          btn.addEventListener("touchend", (e) => {
            e.preventDefault();
            this.mobileInputs[key] = false;
          });
        }
      };
      bindTouchBtn("touchPunchBtn", "punch");
      bindTouchBtn("touchKickBtn", "kick");
      bindTouchBtn("touchSkill1Btn", "skill1");
      bindTouchBtn("touchSkill2Btn", "skill2");
      bindTouchBtn("touchSkill3Btn", "skill3");
      bindTouchBtn("touchBurstBtn", "burst");
    }
    _updateJoystick(dx, dy) {
      const dist = Math.hypot(dx, dy);
      const maxRadius = 60;
      const clampedDist = Math.min(dist, maxRadius);
      const angle = Math.atan2(dy, dx);
      this.mobileInputs.x = Math.cos(angle) * clampedDist / maxRadius;
      this.mobileInputs.y = Math.sin(angle) * clampedDist / maxRadius;
    }
  };
  window.app = new CyberStrikerApp();
  window.addEventListener("DOMContentLoaded", () => {
    window.app.init();
  });
})();
