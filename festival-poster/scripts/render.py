#!/usr/bin/env python3
"""Render a festival poster from a JSON config.

Usage:
  python3 scripts/render.py --config examples/dongzhi.json --out out/dongzhi.png
  python3 scripts/render.py --config examples/dongzhi.json --out out/preview.png --scale 1

The renderer assembles a self-contained bundle in a temporary directory, so it
works even when the skill is installed read-only outside the current workspace.
Requires Google Chrome (or Chromium/Edge).
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATES = ROOT / "templates"
ASSETS = ROOT / "assets"

CHROME_CANDIDATES = [
    os.environ.get("CHROME_PATH", ""),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
]


def find_chrome() -> str:
    for path in CHROME_CANDIDATES:
        if path and Path(path).exists():
            return path
    sys.exit(
        "Chrome/Chromium not found. Set CHROME_PATH, e.g.\n"
        '  CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"'
    )


def build_bundle(config_path: Path, config: dict) -> tuple[Path, Path]:
    """Create a temp bundle that mirrors the template's relative layout."""
    bundle = Path(tempfile.mkdtemp(prefix="festival-poster-"))
    tdir = bundle / "templates"
    adir = bundle / "assets"
    (adir / "fonts").mkdir(parents=True, exist_ok=True)
    tdir.mkdir(parents=True, exist_ok=True)

    for asset in ("logo-mark.svg", "logo-mark-official.png", "logo-wordmark.png"):
        if (ASSETS / asset).exists():
            shutil.copy2(ASSETS / asset, adir / asset)
    shutil.copy2(ASSETS / "fonts" / "MaShanZheng-Regular.ttf", adir / "fonts" / "MaShanZheng-Regular.ttf")
    shutil.copy2(TEMPLATES / "poster.css", tdir / "poster.css")
    shutil.copy2(TEMPLATES / "scene.js", tdir / "scene.js")

    # 背景图一并放进 bundle，避免外部路径读取受限
    bg = config.get("background")
    if bg and not str(bg).startswith(("http://", "https://", "data:")):
        bg_path = Path(str(bg))
        if not bg_path.is_absolute():
            bg_path = (config_path.parent / bg_path).resolve()
        if not bg_path.exists():
            shutil.rmtree(bundle, ignore_errors=True)
            sys.exit(f"Background image not found: {bg_path}")
        suffix = bg_path.suffix.lower() or ".png"
        dest = adir / f"background{suffix}"
        shutil.copy2(bg_path, dest)
        config["background"] = f"../assets/{dest.name}"

    html = (TEMPLATES / "poster.html").read_text(encoding="utf-8")
    payload = json.dumps(config, ensure_ascii=False, indent=2).replace("</", "<\\/")
    html = html.replace("__CONFIG__", payload)
    html_path = tdir / "poster.html"
    html_path.write_text(html, encoding="utf-8")
    return bundle, html_path


def render(config_path: Path, out_path: Path, scale: int, keep_html: bool,
           overlay: bool = False, theme: str = "") -> Path:
    config = json.loads(config_path.read_text(encoding="utf-8"))
    if overlay:
        config["transparent"] = True
    if theme:
        config["textTheme"] = theme
    bundle, html_path = build_bundle(config_path, config)
    out_path = out_path.resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)

    profile = Path(tempfile.mkdtemp(prefix="poster-chrome-"))
    chrome = find_chrome()
    cmd = [
        chrome,
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--disable-breakpad",
        "--disable-crash-reporter",
        "--hide-scrollbars",
        "--disable-lcd-text",
        f"--user-data-dir={profile}",
        "--window-size=1080,1920",
        f"--force-device-scale-factor={scale}",
        "--virtual-time-budget=5000",
        "--force-color-profile=srgb",
        f"--screenshot={out_path}",
        html_path.as_uri(),
    ]
    if overlay:
        cmd.insert(-2, "--default-background-color=00000000")
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
        err = (proc.stderr or "").strip()
        if not out_path.exists() or out_path.stat().st_size < 2000:
            sys.exit(f"Render failed (exit {proc.returncode}).\n{err[-2000:]}")
        print(f"✓ {out_path}  ({out_path.stat().st_size / 1024:.0f} KB, {scale}x)")
        return out_path
    finally:
        shutil.rmtree(profile, ignore_errors=True)
        if keep_html:
            print(f"  bundle kept: {bundle}")
        else:
            shutil.rmtree(bundle, ignore_errors=True)


def main() -> None:
    ap = argparse.ArgumentParser(description="Render a SUIBE graduate-union festival poster.")
    ap.add_argument("--config", required=True, help="Path to a JSON config file")
    ap.add_argument("--out", required=True, help="Output PNG path (workspace recommended)")
    ap.add_argument("--scale", type=int, default=2, choices=(1, 2, 3), help="Device scale factor (2 = 2160×3840)")
    ap.add_argument("--keep-html", action="store_true", help="Keep the temp bundle for debugging")
    ap.add_argument("--overlay", action="store_true", help="Export a transparent text/logo overlay (no background)")
    ap.add_argument("--theme", choices=("", "light"), default="", help="Text theme for overlays on dark backgrounds")
    args = ap.parse_args()

    cfg = Path(args.config)
    if not cfg.exists():
        sys.exit(f"Config not found: {cfg}")
    render(cfg, Path(args.out), args.scale, args.keep_html, args.overlay, args.theme)


if __name__ == "__main__":
    main()
