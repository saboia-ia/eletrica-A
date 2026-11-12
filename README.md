# Eletrica A — Landing Page de Página Única

Site institucional de uma página para a **Eletrica A | Eletricista 24 Horas**, com foco em
emergências elétricas residenciais e contato direto via WhatsApp.

- **Produção:** https://eletricaa.com.br/
- **Repositório:** https://github.com/saboia-ia/eletrica-A
- **Stack:** HTML5 semântico + CSS3 + JavaScript vanilla + Tailwind CSS (CDN)
- **Build:** inexistente (site estático — basta abrir `index.html`)

---

## Sumário

- [Destaques](#destaques)
- [Stack e requisitos](#stack-e-requisitos)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Como rodar localmente](#como-rodar-localmente)
- [Publicação (deploy)](#publicação-deploy)
- [Publicação no GitHub (script)](#publicação-no-github-script)
- [Personalização](#personalização)
- [Tema claro / escuro](#tema-claro--escuro)
- [Acessibilidade](#acessibilidade)
- [SEO](#seo)
- [Verificação de segurança](#verificação-de-segurança)
- [Fluxo de trabalho Git](#fluxo-de-trabalho-git)
- [Dados reais vs. placeholders](#dados-reais-vs-placeholders)
- [Licença](#licença)

---

## Destaques

- Página única com âncoras: **Serviços → Como funciona → Avaliações → FAQ → Contato**.
- Hero de tela cheia com imagem original do site, gradiente, raios em CSS e animação de entrada.
- Cards de serviços com ícones SVG inline (sem biblioteca de ícones).
- Formulário de contato com validação que monta a mensagem e abre o
  `https://wa.me/5511988840073?text=...` via `encodeURIComponent`.
- Botão flutuante de WhatsApp, header fixo e menu mobile full-height (com `Esc`, foco e
  bloqueio de scroll).
- **Modo claro e modo escuro**, com preferência persistida em `localStorage` e respeito ao
  `prefers-color-scheme` do sistema.
- Animações de entrada com `IntersectionObserver` (com stagger) e suporte a
  `prefers-reduced-motion`.
- Zero dependências de runtime: nada para instalar, nada para compilar.

## Stack e requisitos

| Camada        | Tecnologia                              | Observação                                        |
| ------------- | --------------------------------------- | ------------------------------------------------- |
| Estrutura     | HTML5 semântico                         | Um único `<h1>`, landmarks e `aria-*`             |
| Estilos       | CSS3 + Tailwind CSS via CDN             | `cdn.tailwindcss.com` (customizado no `<head>`)   |
| Interações    | JavaScript vanilla (ES2015+)            | Sem frameworks e sem dependências                 |
| Ícones        | SVG inline (sprite `<symbol>`)          | Sem CDN extra                                     |
| Imagens       | PNG / WebP próprios                     | Logo e hero extraídos do site original            |

Requisitos para desenvolver: um navegador moderno e (opcional) **Node.js 18+** para rodar os
scripts de verificação. **Não há dependências de produção** — o `package.json` existe apenas
para conveniência de scripts e não possui `dependencies`.

## Estrutura do projeto

```
.
├── index.html              # Página única completa (HTML semântico + SEO + Schema.org)
├── style.css               # Identidade visual, animações, responsividade e temas
├── script.js               # Menu, tema, scrollspy, reveal, FAQ e formulário
├── hero-bg.webp            # Imagem original do hero (do site atual)
├── sos-eletricista.png     # Logo original (header e rodapé)
├── logo-eletrica-a.png     # Logo original 64x64 (favicon)
├── package.json            # Scripts auxiliares (sem dependências)
├── .gitignore              # Exclusão de segredos, logs, builds e arquivos temporários
├── .editorconfig           # Padronização de estilo de código
├── .env.example            # Modelo de variáveis de ambiente (sem segredos reais)
├── scripts/
│   ├── check-assets.mjs    # Valida assets locais, JSON-LD, H1 e alt
│   ├── publish.ps1         # Publicação no GitHub (Windows / PowerShell)
│   └── publish.sh          # Publicação no GitHub (macOS / Linux)
├── .github/workflows/
│   └── ci.yml              # CI: validação de integridade e checagem de arquivos sensíveis
└── README.md
```

## Como rodar localmente

**Sem servidor (mais simples):** abra `index.html` no navegador. O Tailwind via CDN exige
internet.

**Com servidor local** (recomendado para testar o comportamento real):

```bash
# Python (já instalado na maioria dos ambientes)
python -m http.server 8080
# ou, com Node.js
npm run dev        # npx serve@14 . -l 8080
```

Acesse <http://localhost:8080>.

**Validação de integridade:**

```bash
npm run check      # node scripts/check-assets.mjs
```

O script confere se todos os assets locais referenciados existem, valida o JSON-LD do
Schema.org, garante um único `<h1>`, exige `alt` em todas as imagens e detecta marcadores de
arquivos incompletos.

## Publicação (deploy)

O projeto é estático: basta enviar a raiz do repositório para o servidor.

| Opção          | Como publicar                                                                 |
| -------------- | ----------------------------------------------------------------------------- |
| **GitHub Pages** | Settings → Pages → branch `main` / pasta `/` (site estático puro).          |
| **Netlify / Vercel** | Conecte o repositório; "Build command" vazio e "Publish directory" = `/`. |
| **Hospedagem tradicional (cPanel/FTP)** | Envie `index.html`, `style.css`, `script.js` e as 3 imagens para `public_html`. |

> O Tailwind é carregado por CDN; se o site for usado em ambiente offline, compile o Tailwind
> localmente e substitua a tag `<script src="https://cdn.tailwindcss.com">`.

## Publicação no GitHub (script)

O script conecta o ambiente local ao remoto, valida o projeto, cria o commit e envia.

```powershell
# Windows (PowerShell)
.\scripts\publish.ps1
.\scripts\publish.ps1 -Message "fix: ajusta contraste do tema claro"
.\scripts\publish.ps1 -RemoteUrl "https://github.com/saboia-ia/eletrica-A.git" -Branch "main"
```

```bash
# macOS / Linux
chmod +x scripts/publish.sh
./scripts/publish.sh
./scripts/publish.sh -m "fix: ajusta contraste do tema claro"
```

Autenticação: o **Git Credential Manager** abre o navegador no primeiro push. Alternativas
descritas no próprio script: PAT com escopo `repo` (usar como senha, nunca a senha real) ou
chave SSH (`git@github.com:saboia-ia/eletrica-A.git`).

## Personalização

**Cores** — a paleta é controlada por variáveis CSS no início de `style.css`:

```css
:root {
  --gold: #daa520;   /* cor de destaque da marca */
  --ink:  #070a0f;   /* fundo base (modo escuro) */
  --night: #0b1017;  /* fundo das seções alternadas */
  --panel: #111823;
}
```

O tema claro sobrescreve essas variáveis em `html[data-theme="light"]`.

**Contatos e textos** — phone/WhatsApp/e-mail aparecem em vários pontos; para alterar em
lote, use busca e substituição por `5511988840073`, `(11) 4641-1323` e
`eletrica@eletricaa.com.br` em `index.html`.

**Ano no rodapé** — preenchido automaticamente via JavaScript (`#current-year`).

## Tema claro / escuro

- Botão `#theme-toggle` no header (ícone sol/lua), com `aria-label` e `title` dinâmicos.
- Um script inline no `<head>` aplica o tema **antes da primeira pintura**, evitando flash.
- A escolha é salva em `localStorage` (`eletrica-theme`); sem escolha salva, o site segue o
  `prefers-color-scheme` do sistema operacional.
- Toda a página (incluindo o hero) possui versão clara: fundos creme, cards brancos e dourado
  escurecido (`#745400`) para manter o contraste acessível.

## Acessibilidade

- Navegação por teclado com foco visível (`outline` dourado) e *skip link*.
- FAQ em acordeão com `aria-expanded`, `aria-controls` e `aria-hidden` sincronizados.
- Menu mobile com `aria-expanded`, fechamento por `Esc` e retorno de foco ao botão.
- Formulário com `label` associado, `aria-describedby`, `aria-invalid` e `role="status"`.
- Ícones decorativos com `aria-hidden`; botões de ícone com `aria-label`.
- Contraste validado com **axe-core**: 0 violações (WCAG 2.1 A/AA) nos dois temas.
- `prefers-reduced-motion` desativa animações e transições.

## SEO

- `<title>` e `<meta description>` próprios, `lang="pt-BR"`, `canonical` e `theme-color`.
- Open Graph e Twitter Card com imagem e descrição.
- JSON-LD `https://schema.org/Electrician` com apenas dados reais do negócio
  (telefones, e-mail, áreas atendidas, horários, formas de pagamento e catálogo de serviços).
- Hierarquia de headings coerente com um único `<h1>`.

## Verificação de segurança

A varredura do código **não encontrou chaves, tokens, senhas ou credenciais** — o site é
estático e não realiza chamadas autenticadas. Nenhuma `.env` foi versionada.

Boas práticas já aplicadas:

- `.gitignore` cobre `.env`, `.env.*`, chaves (`*.pem`, `*.key`, `*.p12`), logs, builds,
  `node_modules/`, relatórios de cobertura (`coverage/`), artefatos de teste e arquivos
  temporários.
- `.env.example` documenta as variáveis opcionais para futuras integrações
  (analytics, Maps, backend de leads) — copie para `.env`, que nunca deve ser commitado.
- O workflow de CI falha se um arquivo sensível for versionado.

## Fluxo de trabalho Git

Commits seguem [Conventional Commits](https://www.conventionalcommits.org/):

```
chore: inicializa estrutura do repositorio
feat(site): landing page de pagina unica com modo claro/escuro
docs: adiciona README do projeto
chore(devops): scripts de publicacao e workflow de CI
```

Branches sugeridos: `main` (produção), `feature/...` e `fix/...` para alterações.

## Dados reais vs. placeholders

**Dados reais** (do site atual): nome, telefone fixo `(11) 4641-1323`, WhatsApp
`(11) 98884-0073`, Telegram `https://t.me/EletricaA`, e-mail `eletrica@eletricaa.com.br`,
atendimento residencial 24h (WhatsApp fora do horário comercial), atendimento com hora
marcada, zonas Norte/Sul/Leste/Oeste, pagamento em cartão de débito ou crédito em até 3x sem
juros, lista completa de serviços e logo original.

**Placeholders:** as **6 avaliações** da seção de prova social são fictícias (marcadas com o
comentário `<!-- Avaliações fictícias: substituir por reais -->` no HTML e com uma nota
visível na interface). Substitua por depoimentos reais antes de utilizar comercialmente.
Não foram inventados preços, prazos de atendimento, endereço, CNPJ, certificações, garantias
ou anos de experiência.

## Licença

Projeto de uso interno/proprietário da **Eletrica A**. Todos os direitos reservados.
Material de marca (logos e imagens) pertencem ao negócio.
