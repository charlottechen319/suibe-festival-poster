# 插画生成 / 选图指南

当会话里有图像生成工具时，优先用「生成背景 + 模板排字」的方式，能得到最接近参考图的质感。
具体到本地 SDXL-Turbo 的下载、生成与清理，见 `references/local-generation.md`；外部工具直接用本文件的 prompt。
没有图像工具时，才用模板的 `scene.js` 程序化场景（见 SKILL.md 模式 A），并明确它是兜底。

---

## 1. 职责分离

```
AI 生成：1080×1920 背景插画（无文字、无 logo）
模板叠加：书法标题、英文、日期、竖联、印章、校徽
```

不要让图像模型生成文字或校徽——它一定会写错字、画错 logo。

---

## 2. 背景构图分区（必须写进 prompt）

```
┌──────────────────────────────┐
│ 左上：安静纸面 / 淡雾          │  ← 留白，给书法和英文
│ 右上：应季花枝入画（可密）      │  ← 视觉口袋
│ 中部：远山 + 雾 + 校园剪影      │  ← 中景，低对比
│ 下部：湖 / 雪 / 石 / 倒影       │  ← 前景，可虚化
│ 底部中央：干净浅色区            │  ← 给 logo，不要放深色物体
└──────────────────────────────┘
```

硬性要求：

- **左上 40% 区域必须是低对比、无主体**，否则标题读不出来；
- 右上花枝可以入画、可以被裁切，但不要盖住“日期区”（右上角 300×160）；
- 底部中央 700×200 保持干净，不要把石头、船、深色树枝放在那里；
- 不要生成文字、印章、logo、水印、边框。

---

## 3. 风格关键词（中文 prompt）

### 3.1 通用底稿

> 新中式节日海报背景插画，竖版 9:16。手工宣纸质感，暖米白纸底（#F7F1E4），细密纸纤维与轻微水痕，四周淡暖暗角。淡墨远山三层，墨色由远及近逐渐加深，山脊有湿边与皴擦，山间横向雾带。中景是低对比的大学校园剪影：钟楼、教学楼、湖面、石桥，局部窗户透出暖光，被薄雾笼罩。前景一角是应季花枝，含水彩洇开与干笔飞白。低角度暖阳，柔光晕，逆光物体有细亮边。整体低饱和、高明度、留白约 45%。画面无文字、无 logo、无水印。

### 3.2 冬至（梅 + 雪 + 冰湖）

> 在通用底稿基础上：冬日下午，低角度橘色暖阳贴近地平线，远山覆薄雪，近处是结冰的湖面与雪岸，冰面有淡淡倒影和裂纹；右侧一枝红梅从画外斜入，枝干苍劲、花朵疏密有致，枝上覆薄雪；左侧与上方留出大片安静纸面。色调：暖米白 + 冷灰蓝 + 朱砂红。前景左下角可有虚化的雪苇。画面无文字。

### 3.3 中秋（桂 + 月 + 湖）

> 在通用底稿基础上：中秋夜，满月低悬在右侧，月光冷白，云雾轻薄；右侧桂花枝入画，墨绿椭圆叶 + 金黄色小花簇，花枝被月光勾出细亮边；中景是校园钟楼与拱桥，湖面倒映月光与建筑；纸底偏月白，整体暖中带冷。留白在左上与中左。画面无文字。

### 3.4 春节（红 + 梅 + 灯笼）

> 在通用底稿基础上：除夕/春节清晨，暖红霞光，远处校园与雪松剪影；右侧红梅与少量灯笼（不要密集），灯笼暖光；桌上可有一角红纸/茶盏；纸底暖米白，强调色正红 + 金；留白在左上。不要大面积铺红，红色只占 10–15%。画面无文字。

### 3.5 教师节（桂 + 书 + 校园）

> 在通用底稿基础上：秋日午后，暖金光从右上方斜射，空气中有一层薄雾；右侧桂花枝，左下角是旧书堆、摊开的书、毛笔与笔筒，书页被阳光照亮；中景是校园教学楼与树下师生剪影；纸底奶油米白，金棕色调。画面无文字。

---

## 4. 英文 prompt（给只支持英文的模型）

```
A vertical 9:16 Chinese festival poster background illustration, new-Chinese
ink-wash style, on warm off-white handmade rice paper (#F7F1E4) with visible
paper fibers, subtle water stains and a soft warm vignette. Three layers of
pale ink mountains fading into horizontal mist, wet edges and dry-brush
texture. Midground: a low-contrast silhouette of a Chinese university campus
— clock tower, teaching buildings, a lake and a stone bridge — veiled in mist,
a few warm lit windows. Foreground: a seasonal flowering branch entering from
the right edge, watercolor blooms, flying-white brush strokes, slightly blurred
bokeh at the near corner. Low warm sun with a soft halo, thin rim light on
backlit branches. Muted, high-key, 45% negative space in the upper left and
center-left. No text, no letters, no logo, no watermark, no border.
Palette: warm cream, ink grey-blue, one restrained accent (vermilion or
autumn gold).
```

替换季节句：

- Winter: `bare plum branch with sparse red blossoms, thin snow on branches, frozen lake, snow banks, low orange sun.`
- Autumn: `golden osmanthus branch with dark green oval leaves, small gold flower clusters, full moon, misty lake.`
- Spring: `drooping willow branch with fresh green leaves, peach blossoms, soft morning light.`
- Summer: `lotus leaves and pink lotus flowers at the water edge, bamboo shadows, bright hazy light.`

---

## 5. Negative prompt

```
text, Chinese characters, calligraphy, logo, watermark, signature, border,
frame, 3D render, octane, photorealistic photo, HDR, neon, cyberpunk,
oversaturated, pure white background, pure black, hard vector edges,
flat gradients, clipart, cartoon, sticker, collage, duplicated elements,
crowded composition, high contrast in the upper-left corner
```

---

## 6. 选图标准

生成 2–4 张后，按顺序筛：

1. **左上是否干净？** 有主体直接淘汰；
2. **底部中央是否干净？** 有深色物体淘汰；
3. **是否有文字/印章/logo？** 有就淘汰或裁掉；
4. **山/雾是否有层次？** 只有一块平涂的淘汰；
5. **花枝是否自然？** 像贴纸、像花束的淘汰；
6. **色调是否低饱和？** 过艳的淘汰；
7. **放大 200% 是否有纸纹？** 没有的淘汰。

---

## 7. 合成

1. 把选中的图放到 `examples/assets/` 或任意路径；
2. 在 config 里写 `"background": "assets/xxx.png"`（相对 config 文件）；
3. 运行 `python3 scripts/render.py --config ... --out ...`；
4. 模板会自动隐藏程序化场景，保留纸纹/暗角/文字/logo；
5. 若背景太花，调低 `.poster.has-bg .veil` 的透明度，或换图。

> 背景图不要预先加文字或 logo；模板会统一排字。
> 背景图建议 1080×1920 或 2160×3840；`object-fit: cover` 会裁切。

---

## 8. 兜底：何时不用图像生成

- 没有图像工具；
- 需要批量、可复现、完全离线；
- 需要严格保证上半部留白；
- 节日名称含生僻字，图像模型容易“脑补”文字。

以上情况用 `scene.js` 程序化场景：它不如图像模型华丽，但版式、留白、字感、logo 完全可控。
