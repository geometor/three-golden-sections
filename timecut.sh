#!/bin/sh

node node_modules/timecut/cli.js "logo.html" \
  --viewport=1920,1080 \
  --fps=30 \
  --duration=14 \
  --start-delay=0 \
  --frame-cache timecut \
  --pix-fmt=yuv420p \
  --output=logo3.mp4
