#!/usr/bin/env node
/**
 * Eletrica A - verificacao local de integridade do site estatico.
 *
 * Executa sem dependencias externas ( apenas Node.js ):
 *   1. Confere se todos os arquivos locais referenciados no HTML existem.
 *   2. Valida que os blocos JSON-LD (Schema.org) sao JSON valido.
 *   3. Garante existe exatamente um <h1> e que todas as <img> tem `alt`.
 *   4. Detecta marcadores de arquivos incompletos (ex.: @@SERVICOS@@).
 *
 * Uso:  node scripts/check-assets.mjs   (ou `npm run check`)
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const HTML = resolve(ROOT, 'index.html');

const errors = [];
const warnings = [];

if (!existsSync(HTML)) {
  console.error('ERRO: index.html nao encontrado em ' + ROOT);
  process.exit(1);
}

const html = readFileSync(HTML, 'utf8');

/* ---------- 1. Arquivos locais referenciados ---------- */
const localRefs = new Set();
const refRegex = /(?:src|href)="([^"]+)"/g;
let match;
while ((match = refRegex.exec(html)) !== null) {
  const ref = match[1];
  if (/^(https?:|mailto:|tel:|#|data:|javascript:)/i.test(ref)) continue;
  localRefs.add(ref.split('?')[0].split('#')[0]);
}

for (const ref of localRefs) {
  if (!ref) continue;
  if (!existsSync(resolve(ROOT, ref))) {
    errors.push(`Referencia local ausente: ${ref}`);
  }
}

/* ---------- 2. JSON-LD ---------- */
const ldRegex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g;
let ldCount = 0;
while ((match = ldRegex.exec(html)) !== null) {
  ldCount += 1;
  try {
    JSON.parse(match[1]);
  } catch (error) {
    errors.push(`JSON-LD invalido (#${ldCount}): ${error.message}`);
  }
}
if (ldCount === 0) {
  warnings.push('Nenhum bloco JSON-LD (Schema.org) encontrado.');
}

/* ---------- 3. Estrutura semantica ---------- */
const h1Count = (html.match(/<h1\b/gi) || []).length;
if (h1Count !== 1) {
  errors.push(`Deve existir exatamente um <h1> (encontrados: ${h1Count}).`);
}

const imgTags = html.match(/<img\b[^>]*>/gi) || [];
for (const tag of imgTags) {
  if (!/\balt="[^"]*"/i.test(tag)) {
    errors.push('Imagem sem atributo alt: ' + tag.slice(0, 80));
  }
}

/* ---------- 4. Marcadores de trabalho incompleto ---------- */
const leftovers = html.match(/@@[A-Z_]+@@/g) || [];
for (const marker of leftovers) {
  errors.push('Marcador de placeholder encontrado: ' + marker);
}

/* ---------- Resultado ---------- */
warnings.forEach((w) => console.warn('AVISO: ' + w));

if (errors.length > 0) {
  console.error('\nVerificacao FALHOU (' + errors.length + ' problema(s)):');
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}

console.log('Verificacao OK: ' + localRefs.size + ' asset(s) local(is), ' +
  ldCount + ' JSON-LD valido(s), ' + imgTags.length + ' imagem(ns) com alt.');
