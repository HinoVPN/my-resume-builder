# 部署指南 - Deployment Guide

## GitHub Pages 自動部署設定

### 🚀 設定步驟

#### 1. 啟用GitHub Pages
1. 前往您的GitHub repository
2. 點擊 **Settings** 標籤
3. 在左側選單中找到 **Pages**
4. 在 **Source** 下選擇 **GitHub Actions**

#### 2. 工作流程說明

我們設定了兩個GitHub Actions工作流程：

##### **📦 Deploy Workflow** (`.github/workflows/deploy.yml`)
- **觸發條件**：
  - Push到main/master分支 → 自動部署
  - Pull Request → 只建置測試，不部署
  - 手動觸發 → 可從Actions頁面手動執行

- **功能**：
  - 安裝依賴項
  - 執行ESLint檢查
  - 建置項目
  - 部署到GitHub Pages

##### **🔍 CI Workflow** (`.github/workflows/ci.yml`)
- **觸發條件**：
  - 所有push和pull request
  - 手動觸發

- **功能**：
  - 多Node.js版本測試 (18.x, 20.x)
  - 代碼質量檢查
  - TypeScript類型檢查
  - 建置測試

### 🌐 訪問您的應用程式

部署完成後，您的Resume Builder將可在以下網址訪問：
```
https://[your-username].github.io/my-resume-builder/
```

### 🔧 本地測試部署建置

在推送到GitHub之前，您可以本地測試：

```bash
# 建置項目
npm run build

# 預覽建置結果
npm run preview
```

### ⚙️ 配置說明

#### **Vite配置** (`vite.config.ts`)
- `base: '/my-resume-builder/'` - GitHub Pages的子路徑
- 代碼分割優化
- 生產環境優化

#### **工作流程權限**
- `contents: read` - 讀取代碼
- `pages: write` - 寫入GitHub Pages
- `id-token: write` - 身份驗證

### 🐛 故障排除

如果部署失敗：

1. **檢查GitHub Pages設定**
   - 確保Source設為"GitHub Actions"
   
2. **檢查分支名稱**
   - 工作流程支援`main`和`master`分支
   
3. **檢查建置錯誤**
   - 查看Actions頁面的詳細日誌
   
4. **本地測試**
   - 確保`npm run build`本地成功

### 📊 工作流程狀態

您可以在repository的**Actions**頁面查看：
- ✅ 建置狀態
- ✅ 部署狀態  
- ✅ 錯誤日誌
- ✅ 部署歷史

### 🔄 手動部署

如需手動觸發部署：
1. 前往**Actions**頁面
2. 選擇**Deploy to GitHub Pages**工作流程
3. 點擊**Run workflow**
4. 選擇分支並點擊**Run workflow**
