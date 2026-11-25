#!/usr/bin/env node
/*
 * Baut blog/index.json aus allen Markdown-Dateien in blog/.
 * Jede Datei beginnt mit einem Kopf zwischen zwei Zeilen „---“:
 *   titel, datum (JJJJ-MM-TT), autor, teaser, tags (kommagetrennt), entwurf (ja/nein)
 * Läuft automatisch beim Veröffentlichen; lokal: node .github/scripts/blog-index.js
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ORDNER = path.join(__dirname, "..", "..", "blog");

function kopfLesen(text) {
  const m = String(text).replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n?/);
  const kopf = {};
  if (m) for (const zeile of m[1].split("\n")) {
    const i = zeile.indexOf(":");
    if (i > 0) kopf[zeile.slice(0, i).trim().toLowerCase()] = zeile.slice(i + 1).trim();
  }
  return kopf;
}

const beitraege = fs.readdirSync(ORDNER)
  .filter((d) => d.endsWith(".md"))
  .map((d) => {
    const kopf = kopfLesen(fs.readFileSync(path.join(ORDNER, d), "utf8"));
    const slug = d.replace(/\.md$/, "");
    return {
      slug,
      titel: kopf.titel || slug,
      datum: kopf.datum || slug.slice(0, 10),
      autor: kopf.autor || "Bereich KI",
      teaser: kopf.teaser || "",
      tags: (kopf.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
      entwurf: /^(ja|true|yes)$/i.test(kopf.entwurf || ""),
    };
  })
  .filter((b) => !b.entwurf)
  .sort((a, b) => b.datum.localeCompare(a.datum));

fs.writeFileSync(path.join(ORDNER, "index.json"), JSON.stringify(beitraege, null, 2) + "\n");
console.log(`${beitraege.length} Blog-Beiträge indexiert`);
