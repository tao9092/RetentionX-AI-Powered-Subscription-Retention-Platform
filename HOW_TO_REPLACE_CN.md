# RetentionX v9 替换说明

本版本已经：

- 删除顶部的 **Curated hackathon demo** 状态标签；
- 删除 Sidebar 底部的 **Customer Success / Demo workspace** 卡片；
- Sidebar 导航区可上下滚动；
- 展开 **More tools** 后会自动滚动，让下面的工具可以正常看到与点击。

## 替换方法

1. 备份现有项目。
2. 保留项目根目录隐藏的 `.git` 文件夹。
3. 删除旧的 `src` 文件夹。
4. 将 v9 压缩包中的全部文件复制到现有项目根目录并选择 Replace。
5. 在包含 `package.json` 的目录运行：

```cmd
npm install
npm run build
npm run dev
```

确认正常后提交：

```cmd
git add .
git commit -m "Fix RetentionX sidebar scrolling and remove demo cards"
git push origin main
```
