# RetentionX Preliminary v1 替换说明

这个压缩包是一个完整的 Vue 3 + TypeScript 项目版本，不是单独几个组件。

## 建议做法

1. 先复制现有 GitHub 项目文件夹作为备份。
2. 在现有项目根目录中删除旧的 `src` 文件夹。
3. 将本压缩包内的所有文件复制到现有项目根目录并选择 Replace。
4. 旧的 `.git` 文件夹必须保留，不要删除；压缩包本身不包含 `.git`。

## Windows Terminal / PowerShell

进入项目目录后执行：

```powershell
npm install
npm run dev
```

浏览器打开终端显示的本地网址，例如：

```text
http://localhost:5173
```

验证正式构建：

```powershell
npm run build
```

## 推送到 GitHub

```powershell
git add .
git commit -m "Build RetentionX preliminary MVP"
git push origin main
```

## 不安装依赖也能先查看

直接双击根目录的 `preview.html`，可以查看 Overview 的静态视觉预览。真正提交和部署时使用 Vue 项目，而不是 `preview.html`。

## 本版本已经包括

- Executive Overview
- Customer risk list
- Search and filters
- Customer 360 detail drawer
- Churn probability
- Customer health score
- Explainable risk reasons
- Under-utilised subscription detection
- Next-best retention action
- Revenue at risk
- Potential revenue protected
- Mobile responsive layout

## Preliminary Demo 建议

1. 从 Overview 说明公司目前的风险收入。
2. 点击 CloudNine Commerce 或 NovaTech Solutions。
3. 展示该客户为什么被标记为高风险。
4. 展示系统建议的处理行动和时间。
5. 打开 Actions 页面，说明系统会按照风险、收入和可挽回程度决定处理顺序。
