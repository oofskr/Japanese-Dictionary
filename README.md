# 🇯🇵 Japanese Dictionary (日語文法與單字學習系統)

一個專為個人日語自學者量身打造的極簡、無干擾日語學習輔助工具。支援文法與單字分類整理、多例句管理、Google Gemini AI 智慧翻譯、全域/單句語音朗讀，以及離線 JSON 資料庫備份與還原。

---

## ✨ 核心特色與功能亮點

### 1. 📖 極簡沉浸式閱讀模式（預設開啟）
- **專注學習**：進入頁面預設為閱讀模式，自動隱藏所有按鈕與操作框，只呈現日文單字/文法與例句本體，避免中文翻譯干擾記憶。
- **全域一鍵切換**：頁首設有一鍵切換按鈕，可隨時在「閱讀模式」與「編輯模式」之間無縫切換。
- **分類標籤指引**：即使在極簡閱讀模式下，每張卡片依然清晰標記分類（例如 `TryN2 - 1`），學習進度一目了然。

### 2. 📝 文法與單字分類管理
- **精準篩選**：左側側邊欄支援「全部 / 文法 / 單字」類型切換，並自動統計每個分類下的條目數量。
- **自訂分類順序**：新增的分類會自動排在列表最下方；清單顯示完全遵循自訂分類順序排列。
- **智慧預填**：在特定分類清單（如 `TryN2 - 1`）下點擊新增時，系統會自動帶入當前的分類名稱與類型。

### 3. ✍️ 便捷流暢的例句編輯體驗
- **Enter 快速收合**：輸入完新例句或手動翻譯後，直接按下 `Enter` 鍵即可完成建立並自動收合，完全不需額外點擊滑鼠。
- **輸入法友善**：內建 IME 選字防誤觸機制，日文輸入法確認選字時不觸發送出。
- **自動平滑滾動**：新增例句後畫面自動滾動至當前卡片底部並保持輸入框聚焦，連續輸入大量例句不需手動往下滑動。
- **底部快速新增**：在編輯模式拉到最下方時，設有「＋ 新增文法 / 單字」按鈕，快速建立新項目。

### 4. 🤖 Google Gemini AI 智慧翻譯整合
- **一鍵自動生成**：整合 Google Gemini API（預設使用快速且支援 Free Tier 的 `gemini-flash-latest`），一鍵生成精準自然的繁體中文翻譯。
- **翻譯與「意味」合併**：單字與文法卡片不再有重複冗餘的輸入框，AI 生成結果直接寫入意味欄位。
- **遮蔽自測**：提供「隱藏翻譯 / 顯示翻譯」切換鈕，可遮蔽中文意思（顯示為 `•••`），便於自我測驗背誦。

### 5. 🔊 瀏覽器原生語音朗讀 (Web Speech API)
- **零額外成本**：採用瀏覽器原生語音合成技術，完全免費且無需第三方語音 API Key。
- **🔊 朗讀全部**：頁首一鍵朗讀當前篩選清單中的所有單字、文法與所有例句。
- **單項重點朗讀**：每張卡片皆有「🔊 朗讀該單字 / 該文法」按鈕，精準複習特定條目。
- **即時播放狀態偵測**：朗讀時按鈕會即時變為醒目的 **「⏹️ 停止朗讀」**，隨時可一鍵中斷播放。

### 6. 💾 離線資料備份與還原
- **📤 匯出單字庫**：一鍵將個人所有單字、文法、例句與翻譯匯出為標準 `JSON` 備份檔。
- **📥 匯入單字庫**：支援選擇本機 JSON 檔匯入，並提供：
  - **合併至現有單字庫**：保留既有資料並擴充新內容。
  - **覆蓋現有單字庫**：完整重置還原。

---

## 🛠️ 技術技術堆疊

- **前端框架**：[React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **資料持久化**：瀏覽器原生 `localStorage`（免架設資料庫，開箱即用）
- **AI 翻譯服務**：Google Gemini REST API (`gemini-flash-latest`)
- **語音合成**：Web Speech API (`SpeechSynthesis` - `ja-JP`)
- **樣式設計**：純原生 CSS（無厚重外部 UI 庫，極致輕量快速）

---

## 🚀 快速上手

### 1. 複製專案
```bash
git clone https://github.com/oofskr/Japanese-Dictionary.git
cd Japanese-Dictionary/japanese-learner
```
### 2. 安裝相依套件
```bash
npm install
```
### 3. 設定 Gemini API Key
```bash
前往 Google AI Studio 免費申請一組 API Key。
在 japanese-learner 資料夾下建立 .env 檔案（或複製 .env.example）：
VITE_GEMINI_API_KEY=你的_Gemini_API_Key
VITE_GEMINI_MODEL=gemini-flash-latest
⚠️ 安全提醒：請務必將 .env 保留在本機，切勿 Commit 或上傳至公開儲存庫。專案已在 .gitignore 中預設排除。
```
### 4. 啟動開發伺服器
```bash
npm run dev
啟動後在瀏覽器開啟 http://localhost:5173。
💡 Windows 使用者：亦可直接雙擊專案目錄下的 start.bat，系統會自動檢查環境、啟動並在預設瀏覽器中開啟網站。
```
## 📁 專案目錄結構
```bash
japanese-learner/
├── public/                 # 靜態資源圖標
├── src/
│   ├── api/
│   │   └── gemini.js       # Gemini 翻譯 API 整合與錯誤捕捉
│   ├── components/
│   │   ├── ExampleItem.jsx # 例句收合/編輯獨立元件
│   │   ├── Sidebar.jsx     # 分類切換側邊欄
│   │   ├── TranslationSection.jsx # 翻譯與顯示切換元件
│   │   └── WordCard.jsx    # 單字/文法主卡片（含閱讀模式）
│   ├── data/
│   │   └── seed.js         # 初始預設種子資料
│   ├── hooks/
│   │   └── useLocalStorage.js # 本機快取自訂 Hook
│   ├── utils/
│   │   └── speech.js       # 語音朗讀合成與狀態監聽
│   ├── App.jsx             # 應用程式主畫面與匯入/匯出邏輯
│   ├── index.css           # 全域樣式表
│   ├── main.jsx            # React 進入點
│   └── types.js            # 資料結構與工廠函式
├── .env.example            # 環境變數範本
├── .gitignore              # Git 排除清單 (已嚴格排除 .env)
├── package.json
├── start.bat               # Windows 一鍵啟動腳本
└── README.md
```
## 📄 授權條款
本專案採用 MIT License 授權。
