<#
.SYNOPSIS
    Conecta o projeto local ao repositorio remoto do GitHub e publica (push).

.DESCRIPTION
    Script idempotente de publicacao para o repositorio:
        https://github.com/saboia-ia/eletrica-A

    Ele:
      1. Verifica se o Git esta instalado e se a pasta e um repositorio (faz `git init` se preciso).
      2. Executa a verificacao de integridade do site (`npm run check` ou node scripts/check-assets.mjs).
      3. Configura o remoto `origin` e a branch principal `main`.
      4. Cria o commit (somente se houver alteracoes) e envia para o GitHub.

.EXAMPLE
    .\scripts\publish.ps1
    .\scripts\publish.ps1 -Message "fix: ajusta contraste do tema claro"
    .\scripts\publish.ps1 -RemoteUrl "https://github.com/saboia-ia/eletrica-A.git" -Branch "main"
#>
[CmdletBinding()]
param(
    [string]$RemoteUrl = "https://github.com/saboia-ia/eletrica-A.git",
    [string]$Branch = "main",
    [string]$Message = "chore: publica versao atual do site",
    [switch]$SkipChecks,
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Write-Step($text) { Write-Host "`n==> $text" -ForegroundColor Cyan }
function Write-Ok($text) { Write-Host "    [ok] $text" -ForegroundColor Green }
function Write-Warn($text) { Write-Host "    [!] $text" -ForegroundColor Yellow }

Write-Step "Verificando o ambiente"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "Git nao encontrado. Instale em https://git-scm.com/downloads e reexecute."
}
Write-Ok "git: $((git --version))"

if (-not (Test-Path (Join-Path $root ".git"))) {
    Write-Warn "Repositorio nao inicializado - executando git init"
    git init | Out-Null
}
Write-Ok "repositorio git pronto"

Write-Step "Verificando integridade do site"
if (-not $SkipChecks) {
    if (Get-Command node -ErrorAction SilentlyContinue) {
        node scripts/check-assets.mjs
        if ($LASTEXITCODE -ne 0) { throw "A verificacao de integridade falhou. Corrija antes de publicar." }
        Write-Ok "integridade dos assets validada"
    } else {
        Write-Warn "Node.js nao encontrado - verificacao ignorada"
    }
}

Write-Step "Configurando o remoto"
if ((git remote) -contains "origin") {
    git remote set-url origin $RemoteUrl
} else {
    git remote add origin $RemoteUrl
}
Write-Ok "origin -> $(git remote get-url origin)"

$currentBranch = git branch --show-current
if ($currentBranch -ne $Branch) {
    git checkout -B $Branch | Out-Null
    Write-Ok "branch ativa: $Branch"
} else {
    Write-Ok "branch ativa: $Branch"
}

Write-Step "Preparando commit"
git add -A
$hasChanges = -not [string]::IsNullOrWhiteSpace((git status --porcelain))
if ($hasChanges) {
    git commit -m $Message
    Write-Ok "commit criado: $Message"
} else {
    Write-Warn "nenhuma alteracao local - commit ignorado"
}

Write-Step "Enviando para o GitHub"
$pushArgs = @("push", "-u", "origin", $Branch)
if ($Force) { $pushArgs = @("push", "--force-with-lease", "-u", "origin", $Branch) }

git @pushArgs
if ($LASTEXITCODE -ne 0) {
    Write-Warn "O push falhou. Possivel falta de autenticacao."
    Write-Host @"

    Como autenticar (escolha uma opcao):
      1. Git Credential Manager (recomendado): o push abre o navegador para login.
      2. Token de acesso pessoal (PAT):
           git config --global credential.helper manager
           git push -u origin $Branch
         (use um PAT com escopo 'repo' como senha, nunca a sua senha real)
      3. SSH:
           git remote set-url origin git@github.com:saboia-ia/eletrica-A.git
           ssh-keygen -t ed25519 -C "saboia-ia@users.noreply.github.com"
           git push -u origin $Branch
"@ -ForegroundColor Yellow
    exit $LASTEXITCODE
}

Write-Host "`nPublicacao concluida: https://github.com/saboia-ia/eletrica-A" -ForegroundColor Green
