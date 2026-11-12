#!/usr/bin/env bash
# ==========================================================
# Eletrica A - publicacao no GitHub (macOS / Linux)
# Conecta o projeto local ao repositorio:
#   https://github.com/saboia-ia/eletrica-A
# Uso:
#   ./scripts/publish.sh
#   ./scripts/publish.sh -m "fix: ajusta contraste do tema claro"
#   ./scripts/publish.sh -r https://github.com/saboia-ia/eletrica-A.git -b main
# ==========================================================
set -euo pipefail

REMOTE_URL="https://github.com/saboia-ia/eletrica-A.git"
BRANCH="main"
MESSAGE="chore: publica versao atual do site"
SKIP_CHECKS=0
FORCE=0

while getopts "r:b:m:sfh" opt; do
  case "$opt" in
    r) REMOTE_URL="$OPTARG" ;;
    b) BRANCH="$OPTARG" ;;
    m) MESSAGE="$OPTARG" ;;
    s) SKIP_CHECKS=1 ;;
    f) FORCE=1 ;;
    h) sed -n '2,12p' "$0"; exit 0 ;;
    *) echo "Opcao invalida"; exit 1 ;;
  esac
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

step() { printf '\n==> %s\n' "$1"; }
ok()   { printf '    [ok] %s\n' "$1"; }
warn() { printf '    [!] %s\n' "$1"; }

step "Verificando o ambiente"
command -v git >/dev/null 2>&1 || { echo "Git nao encontrado."; exit 1; }
ok "git: $(git --version)"

if [ ! -d ".git" ]; then
  warn "Repositorio nao inicializado - executando git init"
  git init
fi
ok "repositorio git pronto"

step "Verificando integridade do site"
if [ "$SKIP_CHECKS" -eq 0 ] && command -v node >/dev/null 2>&1; then
  node scripts/check-assets.mjs
  ok "integridade dos assets validada"
else
  warn "verificacao ignorada"
fi

step "Configurando o remoto"
if git remote | grep -q '^origin$'; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi
ok "origin -> $(git remote get-url origin)"

git checkout -B "$BRANCH" >/dev/null 2>&1 || git checkout "$BRANCH"
ok "branch ativa: $BRANCH"

step "Preparando commit"
git add -A
if [ -n "$(git status --porcelain)" ]; then
  git commit -m "$MESSAGE"
  ok "commit criado: $MESSAGE"
else
  warn "nenhuma alteracao local - commit ignorado"
fi

step "Enviando para o GitHub"
if [ "$FORCE" -eq 1 ]; then
  git push --force-with-lease -u origin "$BRANCH"
else
  git push -u origin "$BRANCH"
fi

printf '\nPublicacao concluida: https://github.com/saboia-ia/eletrica-A\n'
