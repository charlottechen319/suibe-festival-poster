#!/usr/bin/env python3
"""Generate ONE background with a local SDXL-Turbo model (Apple Silicon / MPS).

Why one image per process: on MPS, fp16 SDXL-Turbo can produce black images
after the first decode in the same process. A fresh process per seed is reliable.

Example:
  python scripts/local_sd.py --model ../models/sdxl-turbo --seed 22 \
    --out ../bg/seed22.png --prompt "Chinese ink wash watercolor ..."
"""
import argparse, os, time
import torch
from diffusers import StableDiffusionXLPipeline


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True, help="Path to a local SDXL-Turbo diffusers folder")
    ap.add_argument("--prompt", required=True)
    ap.add_argument("--negative", default="")
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--width", type=int, default=832)
    ap.add_argument("--height", type=int, default=1472)
    ap.add_argument("--steps", type=int, default=4)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    torch.set_grad_enabled(False)
    pipe = StableDiffusionXLPipeline.from_pretrained(
        args.model, torch_dtype=torch.float16, variant="fp16",
        use_safetensors=True, local_files_only=True,
    )
    pipe.to("mps")
    pipe.enable_attention_slicing()
    pipe.set_progress_bar_config(disable=True)

    gen = torch.Generator(device="cpu").manual_seed(args.seed)
    t = time.time()
    image = pipe(
        prompt=args.prompt,
        negative_prompt=args.negative or None,
        num_inference_steps=args.steps,
        guidance_scale=0.0,
        width=args.width,
        height=args.height,
        generator=gen,
    ).images[0]
    os.makedirs(os.path.dirname(os.path.abspath(args.out)) or ".", exist_ok=True)
    image.save(args.out)
    print(f"saved {args.out} in {time.time()-t:.1f}s")


if __name__ == "__main__":
    main()
