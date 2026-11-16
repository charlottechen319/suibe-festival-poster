# 本地生成背景（可选，Apple Silicon）

> 这条路的成品最接近参考图：真栅格绘画 + 精确排字。
> 代价：需要下载约 6.9GB 的 SDXL-Turbo fp16 模型；模型不随 skill 打包。

## 1. 环境

已在这台机器验证：arm64、16GB RAM、macOS、MPS 可用。

```bash
python3 -m venv .venv-img
.venv-img/bin/pip install torch diffusers transformers accelerate safetensors
.venv-img/bin/pip install opencv-python-headless   # 需要清理背景时
```

## 2. 模型

ModelScope 的 `AI-ModelScope/sdxl-turbo` 有 fp16 diffusers 分片。
下载这些文件到 `models/sdxl-turbo/`：

```
model_index.json
scheduler/scheduler_config.json
tokenizer/{vocab.json,merges.txt,special_tokens_map.json,tokenizer_config.json}
tokenizer_2/{...}
text_encoder/{config.json,model.fp16.safetensors}
text_encoder_2/{config.json,model.fp16.safetensors}
unet/{config.json,diffusion_pytorch_model.fp16.safetensors}
vae/{config.json,diffusion_pytorch_model.fp16.safetensors}
```

文件地址前缀：

```
https://www.modelscope.cn/models/AI-ModelScope/sdxl-turbo/resolve/master/
```

大文件建议用 range 分片并行下载（8 段），实测约 6–8MB/s，总计 15–20 分钟。

## 3. 生成

```bash
MODEL=../models/sdxl-turbo
PROMPT="Chinese ink wash watercolor painting on warm cream rice paper, winter solstice, \
pale grey-blue misty mountains, low soft orange sun, distant Chinese university campus clock tower, \
frozen lake, red plum blossom branch entering from the right, large empty paper in the upper left, \
minimal, muted colors, soft watercolor edges, visible paper fibers, elegant, no text, no calligraphy"

for s in 11 22 33 44; do
  python scripts/local_sd.py --model "$MODEL" --seed $s \
    --out ../bg/seed$s.png --prompt "$PROMPT"
done
```

**必须一张图一个进程**：MPS 上 fp16 VAE 在同一进程里第二次解码常出黑图；新进程稳定。

## 4. 选图

- 左上要有纸/雾，不能有大树/建筑压字；
- 底部中央干净；
- 没有模型乱写的字/签名；
- 树在左就考虑翻转，把树放到右；
- 一张里出现两个太阳/月亮时，用 inpaint 或雾化去掉一个。

## 5. 清理 / 适配

```python
from PIL import Image, ImageOps, ImageFilter
img = ImageOps.mirror(Image.open("bg/seed22.png")).resize((1080, 1920), Image.LANCZOS)
# 提亮 + 降饱和，贴近暖宣纸
# 裁掉底部签名，补 100px 纸底给 logo（或用模板的 bottom-wash 盖住）
# 放大到 2160×3840，UnsharpMask
```

模板侧：

- `layout: "left"` → 英文/日期/书法/对联全部走左侧竖排，适合“树在右”的背景；
- `background` → 背景图路径（相对 config）；
- `.bottom-wash` → 底部纸感渐隐，压住画面下缘，给 logo 干净底；
- `.has-bg .veil` → 左上纸感罩，保证字可读。

## 6. 提醒

- 模型会写错字、加签名；选图时优先无字，必要时裁掉/雾化；
- 不要用模型生成文字或 logo，字和校徽永远由模板排；
- 这条路的产出是“模型画的背景 + 模板的字”，不是直接复制参考图。
