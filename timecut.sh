#!/bin/sh

node node_modules/timecut/cli.js "index.html" \
  --viewport=1280,720 \
  --fps=15 \
  --duration=10 \
  --start-delay=2 \
  --frame-cache three-golden-sections \
  --pix-fmt=yuv420p \
  --output=three-golden-sections.mp4
