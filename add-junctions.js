const fs = require('fs');

let fileStr = fs.readFileSync('routes-data.js', 'utf8');

const criticalJunctions = [
  {
    id: "j-fuzhou-ramp",
    name: "浮洲橋下堤防匯流口 (進河濱首要分岔)",
    coords: [24.9968, 121.4428],
    badge: "市區進河濱首要決策點",
    summary: "剛從市區牽引道下至堤外河濱公園，地面有雙向分流指示標線。",
    decisions: [
      {
        direction: "➡️ 往右轉 (往東北・下游)",
        destination: "新月橋、江子翠、大稻埕、碧潭、淡水、八里",
        action: "右轉順大漢溪右岸平坦柏油路巡航",
        suitableRoutes: ["route-xinyue", "route-dinosaur", "route-dadaocheng", "route-bitan", "route-metropark", "route-tamsui"]
      },
      {
        direction: "⬅️ 往左轉 (往西南・上游)",
        destination: "土城抽水站、沛陂濕地、三鶯之心、鶯歌老街",
        action: "左轉沿大漢溪右岸向南前往三峽鶯歌",
        suitableRoutes: ["route-yingge"]
      }
    ],
    safetyTip: "牽引道坡度較陡，下坡至河濱地面時請務必牽車，切勿高速滑出衝入主線！"
  },
  {
    id: "j-xinyue-ramp",
    name: "新月橋板橋端引道口 (跨河新莊 vs 續行直走)",
    coords: [25.0168, 121.4532],
    badge: "跨河拱橋分岔",
    summary: "位於板橋大漢溪右岸，左側為通往新月橋巨大白色雙鋼拱的弧形自行車引道。",
    decisions: [
      {
        direction: "↖️ 靠左走新月橋引道上橋",
        destination: "新月橋天空步道、新莊廟街夜市、二重疏洪道、八里左岸",
        action: "切輕齒比順弧形引道平緩爬上新月橋",
        suitableRoutes: ["route-xinyue", "route-metropark"]
      },
      {
        direction: "➡️ 保持右側平面直行",
        destination: "大漢橋下、江子翠河濱、華江橋、大稻埕、中和恐龍園區、碧潭",
        action: "沿河岸平路直行，不需上橋",
        suitableRoutes: ["route-dinosaur", "route-dadaocheng", "route-bitan", "route-tamsui"]
      }
    ],
    safetyTip: "若要上新月橋，引道有微彎，請靠右騎行；橋上木棧板與透明玻璃遇露水濕滑，下雨請下車牽行！"
  },
  {
    id: "j-huajiang-fork",
    name: "板橋江子翠 / 華江橋下大三叉路口 (全雙北最重要轉向樞紐！)",
    coords: [25.0405, 121.4810],
    badge: "大漢溪與新店溪匯流大三叉",
    summary: "大漢溪與新店溪在此匯流成淡水河！路面寬闊並畫有巨大方向箭頭，此處是往台北市 vs 往新店碧潭的決定性路口。",
    decisions: [
      {
        direction: "↖️ 靠左騎上華江橋自行車牽引道",
        destination: "跨河進入台北市！往華江雁鴨公園、延平河濱、大稻埕碼頭、關渡宮、淡水老街",
        action: "靠左側順牽引道緩坡跨河進入台北市淡水河右岸",
        suitableRoutes: ["route-dadaocheng", "route-tamsui"]
      },
      {
        direction: "↗️ 往右大順彎切入新店溪左岸",
        destination: "新北市水岸！往中和恐龍園區、永和綠寶石、陽光運動公園、新店碧潭吊橋",
        action: "順著河岸大右彎前進，進入新店溪左岸自行車道",
        suitableRoutes: ["route-dinosaur", "route-bitan"]
      },
      {
        direction: "↙️ 原路調頭折返",
        destination: "返回板橋浮洲、土城學府公園起點",
        action: "靠外側安全迴轉原路折返",
        suitableRoutes: []
      }
    ],
    safetyTip: "華江橋牽引道坡度長且橋面風勢較大，公路車請雙手握緊車把，嚴禁並排競速！"
  },
  {
    id: "j-chenglin-ramp",
    name: "城林大橋牽引道匯流口 (往鶯歌南下出發點)",
    coords: [24.9812, 121.4312],
    badge: "南下三鶯主線起點",
    summary: "由城林大橋人行/自行車引道安全跨越堤防後的堤外匯流點。",
    decisions: [
      {
        direction: "↙️ 往西南直行一路向南",
        destination: "土城抽水站、媽祖田水門、柑園大橋、三鶯之心、鶯歌老街",
        action: "沿大漢溪右岸筆直專用車道南下",
        suitableRoutes: ["route-yingge"]
      },
      {
        direction: "↗️ 往東北方向",
        destination: "往浮洲橋、新月橋",
        action: "北上折返方向",
        suitableRoutes: []
      }
    ],
    safetyTip: "進入水門便道時有減速坡，請放慢車速避免公路車輪胎彈跳。"
  },
  {
    id: "j-sanying-fork",
    name: "三鶯大橋下分岔路口 (鶯歌老街 vs 三峽老街)",
    coords: [24.9450, 121.3660],
    badge: "三鶯雙老街分流點",
    summary: "大漢溪與三峽河交匯處，前方有跨越三峽河的自行車專用彩虹鋼橋。",
    decisions: [
      {
        direction: "↖️ 順河岸右彎直行穿過三鶯大橋下",
        destination: "新北市美術館、三鶯之心巨型陶罐、鶯歌火車站、鶯歌陶瓷老街",
        action: "靠右順車道前行，抵達三鶯之心大草坪與阿婆壽司",
        suitableRoutes: ["route-yingge"]
      },
      {
        direction: "↙️ 走左側專用陸橋跨越三峽河",
        destination: "三峽清水祖師廟、三峽民權老街、金牛角商圈",
        action: "過橋向南進入三峽市區",
        suitableRoutes: []
      }
    ],
    safetyTip: "假日三鶯之心遊客較多，進入美術館周邊請慢速滑行，停好單車再步行逛街！"
  },
  {
    id: "j-erchong-fork",
    name: "二重疏洪道重新橋下分岔 (熊猴森樂園 vs 八里微風運河)",
    coords: [25.0410, 121.4795],
    badge: "二重疏洪道中央動線",
    summary: "重新橋觀光市集旁，寬廣的綠地與多線自行車道匯聚點。",
    decisions: [
      {
        direction: "⬆️ 沿疏洪道左側專用道直行一路向北",
        destination: "新北大都會公園(熊猴森樂園滑梯)、蘆洲微風運河、關渡大橋、八里渡船頭",
        action: "順專用道直行向北，直達八里左岸",
        suitableRoutes: ["route-metropark"]
      },
      {
        direction: "➡️ 穿過橋下往重新跳蚤市集",
        destination: "重新橋觀光市集、大都會幸福水漾公園",
        action: "進入市集停車休息區",
        suitableRoutes: []
      }
    ],
    safetyTip: "熊猴森樂園周邊小朋友很多，請放慢車速，禮讓推嬰兒車與步行的家長！"
  },
  {
    id: "j-zhoumei-fork",
    name: "社子島口 / 洲美大橋引道口 (往關渡淡水關鍵分岔！)",
    coords: [25.0990, 121.5020],
    badge: "跨基隆河往淡水樞紐",
    summary: "淡水河右岸往北騎行至此，前方直走為社子島環島線，右側為上洲美快速道路的專用自行車牽引道。",
    decisions: [
      {
        direction: "↗️ 右轉騎上洲美大橋自行車牽引道",
        destination: "跨越基隆河！往北投焚化爐觀景台、關渡自然公園、關渡宮、淡水老街金色水岸",
        action: "右轉上引道跨河前往北投關渡",
        suitableRoutes: ["route-tamsui"]
      },
      {
        direction: "↖️ 沿淡水河岸平面直行",
        destination: "社子島島頭公園 (此為封閉環島線，無法直接通往淡水)",
        action: "直行繞行社子島",
        suitableRoutes: []
      }
    ],
    safetyTip: "【千萬別騎錯】要去淡水老街必須右轉上洲美大橋引道！若直走會騎進社子島繞一圈出不來！"
  },
  {
    id: "j-guandu-fork",
    name: "關渡宮水岸 / 關渡大橋下分岔 (金色水岸 vs 跨河八里)",
    coords: [25.1270, 121.4570],
    badge: "關渡淡水河口分岔",
    summary: "穿過關渡宮熱鬧廟前廣場後，抵達紅色五孔關渡大橋下方。",
    decisions: [
      {
        direction: "➡️ 沿右岸金色水岸專用道直行",
        destination: "竹圍捷運站水岸、紅樹林水上木棧道、淡水老街渡船頭 (吃阿給看夕陽)",
        action: "穿過關渡大橋下，沿水邊綠廊向北直奔淡水老街",
        suitableRoutes: ["route-tamsui"]
      },
      {
        direction: "↖️ 騎上關渡大橋自行車引道跨河",
        destination: "跨越淡水河前往八里左岸、十三行博物館",
        action: "推車上關渡大橋引道跨越至八里",
        suitableRoutes: []
      }
    ],
    safetyTip: "往淡水老街請沿水岸平路直行即可；紅樹林木棧道路段潮濕，公路車細胎請勿重踩抽車！"
  }
];

if (!fileStr.includes('criticalJunctions:')) {
  const insertContent = `  criticalJunctions: ${JSON.stringify(criticalJunctions, null, 2)},\n\n`;
  fileStr = fileStr.replace('routes: [', insertContent + '  routes: [');
  fs.writeFileSync('routes-data.js', fileStr);
  console.log('Successfully added criticalJunctions into routes-data.js!');
} else {
  console.log('criticalJunctions already exists in routes-data.js.');
}
