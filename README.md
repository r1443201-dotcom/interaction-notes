# 交互筆記｜Interaction Notes

以 **AGENTS.md 規範驅動**的 HCI × AI 學習筆記網站。這個範例不只完成首頁，也提供可重複的文章資料結構與一套 AI 開發規則。未來新增筆記時，只要按照 `AGENTS.md` 修改 `data/notes.json`，卡片、分類、搜尋與詳細頁面就會共用相同版型。

## 網站功能

- **首頁**（`index.html`）：主題介紹、三種分類與三篇精選筆記。
- **全部筆記**（`library.html`）：關鍵字搜尋、分類篩選與文章列表。
- **文章內頁**（`note.html?id=...`）：同一個模板展示不同文章。
- **關於專案**（`about.html`）：解釋網站架構與延伸方法。
- **內容驗證**（`scripts/validate_notes.py`）：檢查資料型別、唯一 id、分類與欄位完整性。

## 資料與技術

- 原生 HTML / CSS / JavaScript；不需要 npm 或後端。
- 文章放在 `data/notes.json`，預設提供 6 篇原創入門筆記。
- AI 協作規則：[`AGENTS.md`](./AGENTS.md)。
- 支援 GitHub Pages 專案網址子路徑部署。

## 本機啟動（推薦 VS Code）

1. 下載並解壓縮專案，使用 VS Code 開啟**整個 `interaction-notes` 資料夾**。
2. VS Code 開啟終端機（Terminal → New Terminal）。
3. 在專案根目錄執行：

   ```bash
   python -m http.server 8000
   ```

   Windows 若 `python` 無法執行，可以試 `py -m http.server 8000`。

4. 用瀏覽器開啟 `http://localhost:8000/`。
5. **不要**以 `file://` 直接開啟 HTML，瀏覽器可能阻擋 JSON 載入。
6. 關閉時在終端機按 `Ctrl + C`。

## 驗證資料

在根目錄執行：

```bash
python scripts/validate_notes.py
```

如看到 `✅ 驗證通過` 即符合規定 Schema。

## 上傳到 GitHub（免 Git 指令）

1. 登入 [GitHub](https://github.com/)，點右上角 `+` → **New repository**。
2. `Repository name` 填 `interaction-notes`，選 **Public**，按 **Create repository**。
3. 進入新儲存庫，選 **uploading an existing file**（若是空 repository 的畫面），或 **Add file → Upload files**。
4. **解壓縮後**把 `interaction-notes` 資料夾**裡面所有檔案與子資料夾**上傳到儲存庫根目錄（不要多包一層 `interaction-notes/`）。尤其確認 `index.html`、`AGENTS.md`、`data/notes.json` 與 `assets/` 都存在。
5. 輸入 Commit message，例如 `Initial website with AGENTS.md rules`，按 **Commit changes**。

重要：GitHub 網頁上傳時，最好以保留資料夾結構的方式拖入完整內容。如果瀏覽器不能正確拖放資料夾，改用 GitHub Desktop，或以本文件下方的 Git 指令上傳。

## 開啟 GitHub Pages

1. 在儲存庫頁面，進入 **Settings → Pages**。
2. 在 **Build and deployment** 下，將 **Source** 選為 `Deploy from a branch`。
3. **Branch** 選 `main`，資料夾選 `/(root)`，按 **Save**。
4. 待 GitHub Pages 發布完成，按頁面顯示的 **Visit site**。它通常會是：

   ```text
   https://你的GitHub帳號.github.io/interaction-notes/
   ```

5. 最後實際點擊四種頁面、搜尋、分類與文章連結，確認公開網站正常運作。Github Pages 初次發布可能需要數分鐘。

GitHub 官方說明：[設定發布來源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

### 另一種方式：用 Git 指令上傳

在 `interaction-notes` 目錄開啟終端機（請先在 GitHub 建好**空的** repository）：

```bash
git init
git branch -M main
git add .
git commit -m "Initial website with AGENTS.md rules"
git remote add origin https://github.com/你的GitHub帳號/interaction-notes.git
git push -u origin main
```

依 GitHub 登入提示授權；不要把帳號密碼或 Token 寫進檔案。

## 以後如何請 AI 新增筆記

將整個專案提供給可讀取程式碼的 AI，使用以下提示：

> 先閱讀 AGENTS.md。請替「交互筆記」新增一篇 **[主題]** 的筆記，分類為 **[hci / ai / research]**。依照既有 notes.json Schema 撰寫繁體中文內容，保持原有 UI 與路徑不變。完成後執行驗證並回報更新檔案及結果。

正常情況下只需要修改 `data/notes.json`。如果要增加**全新分類**，則依 AGENTS.md 第 5 節同步更新分類設定與相關畫面。

## 作業繳交輔助

- `docs/submission-template.md`：複製後填入 GitHub 帳號、學校、系級與學號即可。
- `docs/screenshot-guide.md`：詳列建議截圖、應該截到的重點、命名方式。

**注意：本套件是可部署的完整範例，但不會自動存在你的 GitHub。** GitHub Repository 與 Pages 連結必須在你上傳成功後才能提供真實網址。
