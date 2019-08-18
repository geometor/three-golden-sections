#!/bin/sh

node node_modules/timecut/cli.js "index.html" \
  --viewport=1920,1080 \
  --fps=30 \
  --duration=90 \
  --start-delay=2 \
  --frame-cache three-golden-sections \
  --pix-fmt=yuv420p \
  --output=three-golden-sections.mp4
