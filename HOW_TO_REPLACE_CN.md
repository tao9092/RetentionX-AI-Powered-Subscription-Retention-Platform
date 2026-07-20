# 替换到现有 GitHub 项目的方法

这个版本是 **RetentionX Preliminary MVP v2**。

## 方法一：完整替换

1. 先关闭正在运行的 `npm run dev`。
2. 打开你现有的 RetentionX Git 项目文件夹。
3. **不要删除 `.git` 隐藏文件夹**。
4. 删除旧的 `src` 文件夹。
5. 将本压缩包中的所有文件复制到现有项目根目录，并选择 Replace。
6. 如果旧项目有 `note.txt`，可以删除。

然后在包含 `package.json` 的目录运行：

```cmd
npm install
npm run build
npm run dev
```

浏览器打开终端显示的本地地址，一般是：

```text
http://localhost:5173/
```

## 推送到 GitHub

确认网页正常后：

```cmd
git status
git add .
git commit -m "Upgrade RetentionX preliminary MVP with scenario lab"
git push origin main
```

## 主要新增内容

- Scenario Lab（挽留方案比较）
- Action status 持久保存
- CSV 导出
- Customer 360 直接进入 Scenario Lab
- GitHub Actions 自动构建检查

## Demo 建议

先打开 CloudNine Commerce：

1. 展示高流失风险和风险原因。
2. 将 Action status 改成 Planned。
3. 点击 Compare what-if scenarios。
4. 比较 Support、Onboarding、Plan right-size 和 Combined plan。
5. 将最佳方案加入 Action queue。
