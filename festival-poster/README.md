# festival-poster 使用说明

上经贸大研究生会节日海报生成 skill。保留参考海报的字体气质、留白、插画语法和校徽版式。

---

## 1. 最省事：直接在对话里说

打开任意会话，直接说：

> 做一张春节海报，2027/02/06，农历正月初一，竖联用“爆竹声中一岁除 / 春风送暖入屠苏”。

> 用 festival-poster 做一张中秋海报，桂花、满月，竖联“海上生明月 / 天涯共此时”。

我会自动加载这个 skill：查节日 → 选色系/花木 → 生成背景 → 排字 → 出 2160×3840 成品。你不需要记命令。

---

## 2. 想自己复现 / 改字重出

```bash
SKILL=~/.dsh/skills/festival-poster
mkdir -p ./posters

# 冬至最终版（带 AI 水彩背景 + 官方校标）
python3 "$SKILL/scripts/render.py" \
  --config "$SKILL/examples/dongzhi-ai.json" \
  --out ./posters/dongzhi.png --scale 2

# 1x 预览
python3 "$SKILL/scripts/render.py" \
  --config "$SKILL/examples/dongzhi-ai.json" \
  --out ./posters/dongzhi-preview.png --scale 1
```

**不要把输出写进 skill 目录**，统一写到当前工作区（默认沙箱只允许写工作区）。

---

## 3. 换节日：只改 config

复制 `examples/dongzhi-ai.json`，改这几项：

```json
{
  "name": "春节",
  "english": "SPRING FESTIVAL",
  "date": "2027/02/06",
  "lunar": "农历正月初一",
  "seal": "春节",
  "couplet": ["爆竹声中一岁除", "春风送暖入屠苏"],
  "palette": "red",
  "motif": "plum",
  "background": "assets/你的背景.png",
  "layout": "left"
}
```

| 字段 | 作用 |
|---|---|
| `name` | 书法标题，2–4 字 |
| `english` | 顶部 Didone 英文，可留空 |
| `date` / `lunar` | 公历 / 农历，农历不确定可省略 |
| `seal` | 印章文字（节气/佳节/节日/春节…） |
| `couplet` | 竖联两列，5–7 字/列 |
| `palette` | `winter` / `autumn` / `spring` / `summer` / `red` / `ink` |
| `motif` | `plum` / `osmanthus` / `ginkgo` / `maple` / `chrys` / `pine` / `willow` |
| `layout` | `left` = 英文/日期/书法/对联全在左侧（背景树在右时用） |
| `titleOffsets` | 标题逐字水平微调，如 `[0, -6]` |
| `background` | 背景图路径，相对 config 文件 |
| `celestial` | `moon` = 满月；默认暖阳 |

---

## 4. 背景从哪来

### A. 本地 SDXL-Turbo（当前工作区已有，最接近参考图）

模型在 `models/sdxl-turbo`（约 6.5GB，不随 skill 打包）。生成一张：

```bash
MODEL=/Users/chenxinyi/Documents/deepseek-harness/default-workspace/models/sdxl-turbo
PY=/Users/chenxinyi/Documents/deepseek-harness/default-workspace/.venv-img/bin/python
"$PY" "$SKILL/scripts/local_sd.py" \
  --model "$MODEL" --seed 22 \
  --out ./posters/bg.png \
  --prompt "Chinese ink wash watercolor painting on warm cream rice paper, ..."
```

**一张图一个进程**（脚本已按此设计）；同一进程连续生成，MPS 上半精度 VAE 可能出黑图。

### B. 你提供背景

把你的图放进工作区，config 里写 `"background": "相对路径"`，渲染器会自动 cover 裁切、加纸感罩和字。

### C. 离线矢量兜底

没有模型、没有背景图时用 `examples/dongzhi.json`；版式/字/校徽仍准确，但插画是程序化 SVG，质感弱于 AI 绘画。

---

## 5. 透明文字层（二次合成）

```bash
python3 "$SKILL/scripts/render.py" \
  --config "$SKILL/examples/dongzhi-ai.json" \
  --out ./posters/overlay.png --scale 1 --overlay

# 深色背景用浅色字
python3 "$SKILL/scripts/render.py" \
  --config "$SKILL/examples/dongzhi-ai.json" \
  --out ./posters/overlay-light.png --scale 1 --overlay --theme light
```

输出为透明 PNG，只有字/印章/校徽；放在背景图上 0,0、100% 即可。

---

## 6. 校标

页脚固定为：

- 校标图形：`assets/logo-mark-official.png`（用户原图上半部分，完整盾形 + U + 三条书页线）；
- 名称：`上海对外经贸大学研究生会`，深色宋体 36px、字距 0.36em；
- 校标在左、名称在右、底部居中、距底 58px。

---

## 7. 文件

```
~/.dsh/skills/festival-poster/
├── SKILL.md                  # agent 用的完整规则
├── README.md                 # 本说明
├── references/               # 风格分析、版式、节日手册、本地生成
├── templates/                # HTML/CSS/scene.js
├── scripts/                  # render.py / local_sd.py
├── assets/                   # 官方校标、字标、字体
└── examples/                 # 可直接跑的 config 和预览图
```
