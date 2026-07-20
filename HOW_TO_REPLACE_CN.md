# RetentionX v5 替换方法

这个版本重点解决上一版的两个问题：字体太小、页面过度拥挤。

## 替换

1. 备份目前项目。
2. 保留项目根目录隐藏的 `.git` 文件夹。
3. 删除旧的 `src` 文件夹。
4. 将 v5 压缩包内所有文件复制到现有项目根目录并选择 Replace。
5. 确认项目根目录同时存在 `.git`、`package.json`、`src` 和 `index.html`。

## 本机测试

```cmd
npm install
npm run build
npm run dev
```

浏览器打开终端显示的本机网址，通常是：

```text
http://localhost:5173/
```

## Push

```cmd
git status
git add .
git commit -m "Redesign RetentionX with comfort-first UI"
git push origin main
```
