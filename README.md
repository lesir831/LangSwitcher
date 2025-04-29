# Language Switcher Chrome Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

一个强大的Chrome扩展，允许您为不同的网站设置自定义的`Accept-Language`请求头。

## 功能特点

- 为特定域名自定义`Accept-Language`请求头参数
- 支持为不同域名设置不同的语言偏好
- 支持使用通配符进行域名匹配（例如：`*.example.com`）
- 不在规则列表中的网站使用浏览器默认设置
- 简洁直观的用户界面，方便管理语言规则

## 安装方法

### 从GitHub Release安装

1. 在GitHub仓库的[Releases页面](https://github.com/您的用户名/LangSwitcher/releases)下载最新的ZIP文件
2. 解压下载的ZIP文件到本地文件夹
3. 打开Chrome浏览器，进入扩展管理页面：`chrome://extensions/`
4. 开启右上角的「开发者模式」
5. 点击「加载已解压的扩展程序」按钮
6. 选择解压后的文件夹

### 从源代码安装

1. 克隆此仓库到本地
2. 打开Chrome浏览器，进入扩展管理页面：`chrome://extensions/`
3. 开启右上角的「开发者模式」
4. 点击「加载已解压的扩展程序」按钮
5. 选择项目文件夹中的 `src` 目录

## 使用方法

1. 点击Chrome工具栏中的Language Switcher图标
2. 在弹出的窗口中添加您想要自定义语言设置的域名
   - 在「域名」输入框中输入网站域名（支持通配符，如：`*.example.com`）
   - 在「Accept-Language值」输入框中输入语言设置（如：`zh-CN,zh;q=0.9,en;q=0.8`）
3. 点击「添加规则」按钮保存设置
4. 设置会立即生效，无需重启浏览器

您可以随时删除或修改已添加的规则。

## 常见语言代码示例

- 英语（美国）：`en-US,en;q=0.9`
- 简体中文：`zh-CN,zh;q=0.9,en;q=0.8`
- 繁体中文：`zh-TW,zh;q=0.9,en;q=0.8`
- 日语：`ja,en-US;q=0.9,en;q=0.8`
- 韩语：`ko,en-US;q=0.9,en;q=0.8`
- 法语：`fr,fr-FR;q=0.9,en;q=0.8`
- 德语：`de,de-DE;q=0.9,en;q=0.8`
- 西班牙语：`es,es-ES;q=0.9,en;q=0.8`

## 适用场景

- 开发者测试网站在不同语言环境下的表现
- 访问国际版网站时指定偏好语言
- 学习外语时强制网站显示特定语言
- 解决某些网站自动跳转到本地语言版本的问题

## 隐私声明

此扩展不收集任何用户数据。所有配置数据仅存储在用户的浏览器本地存储中，且仅用于修改请求头。扩展不会向任何外部服务器发送数据。

## 技术实现

- 使用Chrome Manifest V3 开发
- 使用`declarativeNetRequest` API 修改网络请求的请求头
- 完全符合Chrome扩展的最新开发标准

## 项目结构

```
LangSwitcher/
├── src/                  # Chrome扩展代码
│   ├── manifest.json     # 扩展配置文件
│   ├── background.js     # 后台脚本
│   ├── popup.html        # 弹出窗口HTML
│   ├── popup.js          # 弹出窗口脚本
│   ├── styles.css        # 样式文件
│   ├── rules.json        # 规则配置文件
│   └── images/           # 扩展图标
├── picture/              # README文档使用的图片
├── LICENSE               # MIT许可证
├── README.md             # 项目说明文档
└── .gitignore            # Git忽略配置
```

## 贡献指南

欢迎对此项目进行贡献！如果您有任何想法或建议，请：

1. Fork此仓库
2. 创建您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个Pull Request

## 许可证

此项目采用MIT许可证 - 详情请见 [LICENSE](LICENSE) 文件。

## 联系方式

如有任何问题或建议，请通过GitHub Issues与我们联系。

## 发布版本

可以使用以下命令从 `src` 目录创建一个可分发的ZIP文件：

```bash
cd /path/to/LangSwitcher
zip -r language-switcher.zip src/*
```

然后将生成的 `language-switcher.zip` 文件上传到Chrome开发者控制台。

---

**Language Switcher** - 自定义您的网页浏览语言环境
