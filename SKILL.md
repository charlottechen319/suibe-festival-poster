---
name: festival-poster
description: Create a Chinese ink-wash festival poster (9:16) in the visual style of the SUIBE Graduate Student Union series — warm rice paper, pale ink mountains, seasonal botanical branch, huge vertical brush calligraphy, Didone English masthead, vertical couplet, red seal, and the exact bottom-centered school logo lockup. Pairs a user-supplied or AI-generated painterly background with an exact typography/logo overlay, and includes an offline procedural fallback. Use whenever the user asks for a 节日海报, 节气海报, 节日祝福图, 校庆/毕业/迎新 poster, or any 1080×1920 Chinese festival poster that must keep the 上海对外经贸大学研究生会 identity.
---

# 节日海报生成

为上海对外经贸大学研究生会生成 1080×1920 的节日/节气海报：保留参考海报的**字体气质、插画语法、留白与 logo 版式**，但每次重新构图，不复制原图。

## 何时使用

- 用户给出任意节日/节气，要一张中文节日海报；
- 需要延续“新中式水墨 + 暖宣纸 + 大书法 + 校徽”的系列感；
- 需要 9:16 竖版、朋友圈/公众号可发的成品；
- 需要批量生成（同一套版式、不同节日）。

## 先读什么

按顺序读，不要跳过：

1. `references/style-analysis.md` — 6 张参考海报的配色/质感/留白/排版规律（含实测值）；
2. `references/layout-spec.md` — 1080×1920 的坐标、字阶、logo 硬规格；
3. `references/festival-playbook.md` — 节日 → 色系/花木/英文/印章/文案；
4. `references/art-direction.md` — 有图像生成工具时的背景 prompt 与选图标准；
5. `references/local-generation.md` — 本地 SDXL-Turbo 生成与清理步骤。

## 产出

- 一张 `2160×3840` PNG（默认 2×；`--scale 1` 出 1080×1920 预览）；
- 可选：透明文字层 PNG（`--overlay`，只有字/印/校徽，背景透明），用于叠加用户生成的背景；
- 一个可复用的 JSON config（改节日只改这个文件）；
- 渲染后必须自己看图检查（不能只看脚本成功）。

> **质量优先级**：参考海报的插画是 AI 绘画级栅格图。默认优先“用户图像工具出背景 + 本模板合成字/logo”（模式 B）；程序化场景（模式 A）只在没有图像工具时作为兜底，不要把它当成能 1:1 还原原图质感的方案。

## 安装位置

用户级 skill，已安装在：

```
~/.dsh/skills/festival-poster/
```

任何会话都可以直接调用；源码副本在工作区的 `festival-poster/`。

## 快速开始

**不要把输出写进 skill 目录**（默认沙箱只允许写工作区）。用绝对路径调用，输出到当前工作区：

```bash
SKILL=~/.dsh/skills/festival-poster
mkdir -p ./posters
# 复现最终版（AI 水彩背景 + 官方校标 + 宋体名称）
python3 "$SKILL/scripts/render.py" \
  --config "$SKILL/examples/dongzhi-ai.json" \
  --out ./posters/dongzhi.png --scale 1

# 确认无误后出正式图（2160×3840）
python3 "$SKILL/scripts/render.py" \
  --config "$SKILL/examples/dongzhi-ai.json" \
  --out ./posters/dongzhi.png --scale 2

# 离线矢量兜底版（无背景图，构图可复现）
python3 "$SKILL/scripts/render.py" \
  --config "$SKILL/examples/dongzhi.json" \
  --out ./posters/dongzhi-offline.png --scale 2
```

渲染器会自动在临时目录组装字体/logo/模板，因此不依赖 skill 目录可写。

依赖：macOS + Google Chrome（或 Chromium/Edge）。找不到 Chrome 时设 `CHROME_PATH`。
模板字体：`assets/fonts/MaShanZheng-Regular.ttf`（OFL）；中文宋体用系统 `Songti SC`；英文用系统 `Didot` / `Bodoni 72`。

## 工作流

### 1. 解析需求

从用户输入提取：

| 字段 | 例 | 缺省策略 |
|---|---|---|
| 节日名 `name` | 冬至 | 必填，2–4 字最佳 |
| 公历 `date` | 2026/12/22 | 不详则留空，只排农历或省略日期 |
| 农历 `lunar` | 农历冬月十四 | 查证后填；不确定就省略 |
| 英文 `english` | WINTER SOLSTICE | 查表；无通用名用拼音 |
| 印章 `seal` | 节气 / 佳节 / 节日 | 节气类用“节气”，传统节日用“佳节” |
| 竖联 `couplet` | ["天时人事日相催","冬至阳生春又来"] | 查文案库；5–7 字/列 |
| 色系 `palette` | winter / autumn / spring / summer / red / ink | 按季节 |
| 花木 `motif` | plum / osmanthus / ginkgo / maple / chrys / pine / willow / none | 按季节 |
| 天象 `celestial` | 默认太阳；`moon` | 中秋/元宵/七夕用 moon |

不确定的日期、农历、英文名：先 `web_search` 复核，再写 config。**不要凭记忆写农历。**

### 2. 选模式

**模式 B：AI 背景 + 模板排字（默认，优先）**

参考图的质感来自 AI 绘画，不是矢量。只要用户有图像工具（即梦/Midjourney/SD），就走这条：

1. 按 `references/art-direction.md` 的 prompt 生成 1080×1920 背景（无文字、无 logo）；
2. 选图（左上干净、底部中央干净、有纸纹、低饱和）；
3. config 里加 `"background": "assets/xxx.png"`；
4. 渲染。模板会自动隐藏程序化场景，保留纸感罩、文字、印章、logo。

用户不想发原图、想自己叠时：导出透明文字层，让对方把 PNG 放在背景上：

```bash
python3 "$SKILL/scripts/render.py" --config "$SKILL/examples/dongzhi.json" \
  --out ./posters/dongzhi-overlay.png --scale 1 --overlay
# 深色背景用浅色字
python3 "$SKILL/scripts/render.py" --config "$SKILL/examples/dongzhi.json" \
  --out ./posters/dongzhi-overlay-light.png --scale 1 --overlay --theme light
```

**模式 C：本地 SDXL-Turbo（有模型时最接近参考图）**

Apple Silicon 可本地跑 SDXL-Turbo，生成真栅格水彩背景，再套字/校徽。模型约 6.9GB，不随 skill 打包；步骤见 `references/local-generation.md`。已有成品：`examples/dongzhi-ai.json` + `examples/preview-dongzhi-final.png`。

**模式 A：程序化场景（兜底，离线可复现）**

只有在没有图像工具、或需要批量/离线时使用。用 `templates/scene.js` 画纸、山、雾、校园、湖、花枝、光；版式/留白完全可控，但插画质感明显弱于 AI 绘画，**必须提前向用户说明这个上限**。

### 3. 写 config

复制 `examples/dongzhi.json`，改字段：

```json
{
  "name": "冬至",
  "english": "WINTER SOLSTICE",
  "date": "2026/12/22",
  "lunar": "农历冬月十四",
  "seal": "节气",
  "couplet": ["天时人事日相催", "冬至阳生春又来"],
  "palette": "winter",
  "motif": "plum",
  "seed": 20261222,
  "logoTextColor": "ink"
}
```

可选字段：

| 字段 | 作用 |
|---|---|
| `celestial: "moon"` | 冷白满月（默认暖阳）；`"none"` 去掉光源 |
| `layout: "left"` | 左侧竖排版式（英文→日期→书法→对联），适合树在右的背景 |
| `titleOffsets: [0, 0]` | 按字逐个微调书法水平位置（默认 0；标题字以墨迹中心对齐） |
| `pavilion: true` | 山间小亭（中景焦点） |
| `foregroundBranch: true` | 右下角前景折枝（需注意别压 Logo） |
| `snowfall: 110` | 雪量（默认 42） |
| `sun: [x, y]` | 光源位置，默认 `[748, 760]` |
| `englishLines: 2` | 强制英文两行 |
| `colors` | 覆盖任意色 token（见 `layout-spec.md`） |
| `background` | 背景图路径（相对 config） |
| `logoTextColor: "light"` | 深底/红底时 logo 名称转纸白 |
| `seed` | 固定随机构图；同 seed 完全可复现 |

### 4. 渲染

```bash
python3 "$SKILL/scripts/render.py" --config "$SKILL/examples/xxx.json" --out ./posters/xxx.png --scale 1
```

首次先出 1× 预览，检查版式；确认后出 2×。

### 5. 必检（看图，不是看日志）

- [ ] 书法标题是画面最黑、最大的元素，没有被花枝/山压住；
- [ ] 英文没压日期、没超出左右安全边；
- [ ] 日期 + 农历 + 细线完整，右对齐；
- [ ] 竖联 5–7 字/列，两侧竖线、不压花；
- [ ] 印章只有一枚，在书法右侧，不压笔画；
- [ ] **Logo 底部居中，校标 + 名称横式组合，距底 58px，名称 36px/字距 .36em**；
- [ ] Logo 周围 120px 干净，没有被花/建筑/深色块干扰；
- [ ] 留白 40–55%，上半部不闷；
- [ ] 画面有纸纹/颗粒，不是硬矢量；
- [ ] 没有复刻参考图的具体构图/元素组合；
- [ ] 若是模式 B：背景没有文字/水印，左上和底部中央干净，字没有被背景吃掉；
- [ ] 若是透明层：PNG 带 alpha、位置与 1080×1920 画布对齐。

不合格就改 config（seed、motif、sun、palette）或微调 `templates/poster.css`，再渲染。

### 6. 交付

- 给用户 2× PNG + 1× 预览；
- 说明节日、日期来源、色系/花木选择；
- 如果用户要系列，保留同一 `palette`/`motif` 逻辑，只换 `name`/`seal`/`couplet`；
- config 一起交付，方便下次改字重出。

## 不可违反的规则

1. **Logo 版式固定**：底部居中、校标在左、名称在右、垂直居中；校标用 `assets/logo-mark-official.png`（用户原图上半部分，高度 96、宽度自适应），间距 22、名称 36px 宋体/字距 .36em、距底 58。不要用重绘 SVG、不要换成橙色毛笔字标、不要竖排、不要只放图形。
2. **校标资产说明**：`assets/logo-mark-official.png` 是从用户提供的 logo 原图上半部分抠出的完整图形（盾形 + U + 三条书页线），页脚直接使用这张 PNG；不要替换为重绘 SVG 或简化图形。
3. **只用两种字体气质**：毛笔行楷写节日名；宋体写小字；英文只用 Didone（Didot/Bodoni）。不要用黑体、圆体、手写英文。
4. **纸不是白色**：纸底 `#F7F1E4` 系 + 3–6% 颗粒 + 暖暗角；不要纯白。
5. **墨不是纯黑**：`#24272A` 左右；不要 `#000`。
6. **一屏最多 2 个强调色**，面积 ≤ 15%；印章是唯一高饱和。
7. **留白 40–55%**；标题区（左上）不能放花/建筑/深色物体。
8. **不复制原图**：不把参考海报当背景、不描摹其山形/花枝位置；只复用比例、字阶、材质逻辑。
9. **校园只做中景剪影**：30–45% 对比、带雾、不画写实细节。
10. **不生成文字进图片**：文字由模板排，保证字形/字距/校名正确。
11. **日期必须复核**：农历/节气/浮动节日查权威来源。

## 目录

```
~/.dsh/skills/festival-poster/
├── SKILL.md
├── README.md               # 面向用户的中文使用说明
├── references/
│   ├── style-analysis.md      # 6 张参考的规律与实测
│   ├── layout-spec.md         # 1080×1920 坐标/字阶/logo 规格
│   ├── festival-playbook.md   # 节日→色系/花木/英文/文案
│   ├── art-direction.md       # AI 背景 prompt/选图/合成
│   └── local-generation.md    # 本地 SDXL-Turbo 生成（Apple Silicon）
├── templates/
│   ├── poster.html            # 结构
│   ├── poster.css             # 版式/字阶/logo
│   └── scene.js               # 程序化水墨场景
├── scripts/
│   ├── render.py              # Chrome headless 渲染
│   └── local_sd.py            # 本地 SDXL-Turbo 背景生成
├── assets/
│   ├── logo-mark-official.png # 底部校标（用户原图上半部分）
│   └── fonts/MaShanZheng-Regular.ttf
└── examples/
    ├── dongzhi-ai.json        # 最终版（AI 背景）
    ├── dongzhi.json           # 离线兜底
    ├── zhongqiu.json          # 中秋示例
    ├── preview-dongzhi-final.png
    └── assets/dongzhi-bg.png
```

## 扩展

- **加色系**：在 `scene.js` 的 `PALETTES` 加一组 token；在 playbook 补一行。
- **加花木**：在 `MB` 加 `{flower, leaf, leafColors}`，必要时在 `leafGroup` 加叶形分支。
- **加版式**：优先改 `layout-spec.md`，再改 CSS；不要只改一处。
- **加文案**：只进 `festival-playbook.md`，不要把长文案写进模板。

## 常见问题

**字体没生效**：确认 `assets/fonts/MaShanZheng-Regular.ttf` 存在；Chrome 需允许本地文件；`document.fonts.ready` 后再截图（模板已用 `--virtual-time-budget=5000`）。

**渲染空白/元素缺失**：用 Chrome `--enable-logging=stderr` 看 `CONSOLE` 报错；多数是 `scene.js` 运行时错误（某元素未定义）。先 `node --check templates/scene.js`。

**图片尺寸不对**：`--scale 2` 应得 2160×3840；若得到 1080×1920，检查 Chrome 是否忽略了 `--force-device-scale-factor`。

**Logo 名称太宽/太窄**：只调 `letter-spacing`（0.34–0.40em），不要改字号或换成黑体。

**画面太满**：减一个元素（花簇/校园/竖联），不要靠加雾救。

**画面太空**：加一枝花或一层近景雪岸，不要把字放大。

**模式 B 的背景太花、字读不出来**：在背景上加一层 20–30% 暖白渐变（左上到中左），或换一张左上更干净的图；不要给字加描边。

**用户说“和原图差很远”**：先判断是不是插画介质问题。如果是，直接切模式 B，并给 `references/art-direction.md` 的 prompt；不要用模式 A 的参数反复调色。
