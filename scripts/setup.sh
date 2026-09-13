#!/usr/bin/env bash
# NEXUS setup, Linux / macOS
set -euo pipefail

cd "$(dirname "$0")/.."

echo ""
echo "  ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗"
echo "  ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝"
echo "  ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗"
echo "  ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║"
echo "  ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║"
echo "  ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝"
echo "  Open Source AI Workspace, Sep 13, 2026"
echo ""

if [ ! -f .env ]; then
  echo "✔ Creating .env from .env.example"
  cp .env.example .env
else
  echo "• .env already exists, keeping it"
fi

echo "✔ Starting NEXUS..."
docker compose up -d --build

echo ""
echo "  NEXUS is running:"
echo "    Web    → http://localhost:3000"
echo "    API    → http://localhost:3001"
echo "    Docs   → http://localhost:3001/docs"
echo ""
echo "  First run? A welcome screen will guide you."
echo ""