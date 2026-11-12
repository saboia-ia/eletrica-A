#!/usr/bin/env bash
# Teste local da regra de deteccao de arquivos sensiveis (espelha o step do CI)
set -euo pipefail
cd "$(dirname "$0")/.."

SENSITIVE_RE='(^|/)(\.env$|\.env\.[^/]+$|.*\.(pem|key|p12|pfx|keystore)$|credentials\.json$|secrets\.json$|.*\.log$)'

FOUND="$(git ls-files | grep -Ei "$SENSITIVE_RE" | grep -vEi '(^|/)\.env\.example$' || true)"
IGNORED="$(git ls-files -i -c --exclude-standard || true)"

echo "--- FOUND (esperado: vazio) ---"
echo "$FOUND"
echo "--- IGNORED (esperado: vazio) ---"
echo "$IGNORED"
echo "--- teste positivo (esperado: .env, server.key, app.log, sub/.env.production) ---"
printf '.env\nserver.key\napp.log\n.env.example\nsub/.env.production\n' \
  | grep -Ei "$SENSITIVE_RE" | grep -vEi '(^|/)\.env\.example$'

if [ -z "$FOUND" ] && [ -z "$IGNORED" ]; then
  echo "RESULTADO: regra OK (nenhum falso positivo)"
else
  echo "RESULTADO: FALHOU"
  exit 1
fi
