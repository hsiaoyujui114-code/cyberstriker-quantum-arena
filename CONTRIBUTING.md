# 《CyberStriker: Quantum Arena》開源社群共創指引 (Contributing Guide)

歡迎來到《CyberStriker: Quantum Arena》（賽博衝擊：量子競技場）開源共創社群！

本遊戲堅持 **「100% 公平競技・零課金數值・外觀純換裝」** 的核心理念。我們非常歡迎全球的玩家、繪師、格鬥遊戲愛好者與工程師共同參與開發，將您喜愛的角色、帥氣的武器招式與新玩法融入遊戲中！

---

## 🌟 創作者激勵計畫 (Creator Rewards)

只要您提交的作品通過官方審核並正式合併（Merge）收錄至遊戲中：
1. **永久創作者署名**：遊戲內該英雄外觀卡片將永久標註「🎨 創作者署名 (例如：PR #42)」與您的 GitHub 個人主頁連結。
2. **10,000 點能量幣啟動金**：直接發放至您的遊戲帳號中，自由解鎖喜愛的內容。
3. **金色「尊貴共創者」專屬稱號**：遊戲內獲頒金色動態頭銜與專屬頭像框。

---

## 🛠️ 你可以參與共創哪些內容？

1. **🎨 設計全新英雄外觀 (New Skins)**
   - 繪製原創科幻機甲、動漫熱門角色（例如七龍珠、漫威、荒野亂鬥風格）或電競主題塗裝。
   - 自訂專屬色系（主色、副色、裝甲色、反應爐光芒）與揮拳光軌粒子。
2. **⚔️ 擴充 30 款武器攻擊庫 (New Skills)**
   - 設計全新的遠程神兵（如：多角度折射雷射、追蹤浮游砲、裂地火浪）或近戰武術（居合拔刀、寸勁拳、旋風破空踢）。
   - 設定公平合理的傷害與冷卻時間。
3. **🐞 錯誤修復與流暢度優化 (Bug Fixes & Performance)**
   - 改善手機虛擬搖桿操作手感。
   - 優化 60 FPS 物理判定幀數與瀏覽器相容性。
4. **💡 玩法許願與數值平衡反饋 (Ideas & Balance)**
   - 不會寫程式也沒關係！您可以到 GitHub [Issues](https://github.com/hsiaoyujui114-code/cyberstriker-quantum-arena/issues) 提出您的創意、角色草圖或對戰平衡建議。

---

## 🚀 手把手共創 4 步驟指南

### 第 1 步：Fork 專案倉庫
點擊本倉庫右上角的 **`Fork`** 按鈕，將專案複製一份到您的個人 GitHub 帳號中。

### 第 2 步：修改對應代碼檔案
專案核心檔案架構清晰明瞭：
- **新增英雄造型**：修改 `js/data/skins.js`，在陣列中加入新的物件。
- **新增武器招式**：修改 `js/data/skills.js`，配置技能傷害、攻擊範圍與冷卻時間。
- **骨骼關節繪製**：查看 `js/engine/character_renderer.js` 的 8 大骨骼標準尺寸。

#### 英雄造型範例 (`js/data/skins.js`)：
```javascript
{
  id: 'skin_your_hero',
  name: '英雄名稱',
  title: '稱號頭銜',
  category: 'shop',
  series: '系列分類', // 例如：'暗夜霓虹', '動漫宇宙'
  price: 2500,
  themeColor: '#00f3ff',     // 主題光芒色 (HEX)
  secondaryColor: '#ffffff', // 副光軌色
  armorColor: '#0f172a',     // 裝甲主體色
  visorColor: '#00f3ff',     // 目鏡/雙眼光芒
  coreColor: '#00f3ff',      // 量子反應爐核心色
  desc: '詳細背景故事與外觀特色描述。',
  vfx: {
    punchTrail: '專屬出拳光軌說明',
    guardShield: '專屬力場防護罩說明'
  },
  creator: 'YourName (PR #XX)'
}
```

### 第 3 步：本機免編譯即時測試
本遊戲為**純前端靜態結構**，完全不需要安裝龐大環境！
- 直接使用瀏覽器雙擊打開 `index.html` 即可立即進入遊戲試玩。
- 或在 VS Code 中點擊 `Go Live` (Live Server) 進行即時預覽除錯。

### 第 4 步：提交 Pull Request (PR)
1. 將您的修改提交（Commit）並推送（Push）到您的 Fork 倉庫。
2. 在 GitHub 頁面點擊 **`Contribute`** → **`Open Pull Request`**。
3. 簡要描述您的設計亮點與修改內容，送出合併請求！

---

## ⚖️ 官方審查三大黃金原則

為了維護全球玩家公平對稱的競技環境，所有收錄作品必須符合以下原則：
1. **判定盒對稱一致 (100% Symmetrical Hitboxes)**：所有英雄造型之受擊盒（Hurtbox）與碰撞體積完全相同，絕無模型縮小或手長優勢。
2. **零數值課金加成 (Pure Aesthetics)**：純外觀自訂，不得附帶任何額外攻擊力或生命值加成。
3. **代碼安全透明 (Clean & Safe)**：不得引入任何外部未經授權的第三方程式或惡意腳本。

---

感謝您對《CyberStriker: Quantum Arena》的熱愛與貢獻，讓我們一起打造最好玩的網頁格鬥競技場！🎮
