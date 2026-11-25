// Kleine Selbsttests für eingabe-verarbeiten.js – ausführen mit: node .github/scripts/test.js
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { parseFormular, verarbeiten } = require("./eingabe-verarbeiten.js");

const frisch = () => JSON.parse(fs.readFileSync(path.join(__dirname, "../../data/labs.json"), "utf8"));

// 1) Roadmap-Eintrag
let d = frisch();
let body = "### Lab\n\nagentic-media-buying\n\n### Quartal\n\nQ3\n\n### Titel des Meilensteins\n\nWebinar Agentic Buying\n\n### Beschreibung\n\n_No response_\n\n### Format\n\nEvent\n\n### Status\n\ngeplant\n\n### Verantwortlich\n\nMax Muster";
let t = verarbeiten({ body, labels: ["eingabe", "roadmap", "freigegeben"], nummer: "7", daten: d });
let lab = d.labs.find((l) => l.id === "agentic-media-buying");
assert.strictEqual(lab.roadmap2027.at(-1).titel, "Webinar Agentic Buying");
assert.strictEqual(lab.roadmap2027.at(-1).beschreibung, "");
console.log("ok:", t);

// 2) Lab-Info per Name statt Kürzel
d = frisch();
body = "### Lab\n\nLab AI Technology\n\n### Lab-Leitung\n\nErika Muster | Beispiel AG\nMax Muster | Test GmbH | Stellv. Lab-Leitung\n\n### Verantwortlich BVDW\n\nMax BVDW | max@bvdw.org\n\n### Termine\n\n_No response_\n\n### Aktuelle Projekte\n\n_No response_\n\n### Kurzbeschreibung\n\n_No response_\n\n### Status des Labs\n\n(unverändert)\n\n### Ziele 2027\n\n- Ziel A\n- Ziel B\n\n### Links\n\nSharePoint | https://example.com\nkaputt";
t = verarbeiten({ body, labels: ["lab-info"], nummer: "8", daten: d });
lab = d.labs.find((l) => l.id === "ai-technology");
assert.deepStrictEqual(lab.leitung[1], { name: "Max Muster", unternehmen: "Test GmbH", rolle: "Stellv. Lab-Leitung" });
assert.deepStrictEqual(lab.ziele2027, ["Ziel A", "Ziel B"]);
assert.strictEqual(lab.links.length, 1);
assert.deepStrictEqual(lab.bvdw, [{ name: "Max BVDW", email: "max@bvdw.org" }]);
assert.strictEqual(lab.status, "aktiv");
console.log("ok:", t);

// 3) Neues Lab
d = frisch();
body = "### Name des Labs\n\nLab KI & Recht\n\n### Heimat (Working Group / Initiative)\n\nWG Test\n\n### Themenfeld\n\n5 · Vertrauen, Recht, Governance & Politik\n\n### Kurzbeschreibung\n\nAI Act in der Praxis.\n\n### Lab-Leitung\n\n_No response_\n\n### Verantwortlich BVDW\n\n_No response_";
t = verarbeiten({ body, labels: ["neues-lab"], nummer: "9", daten: d });
assert.strictEqual(d.labs.find((l) => l.id === "lab-ki-recht").themenfeld, 5);
console.log("ok:", t);

assert.strictEqual(Object.keys(parseFormular("")).length, 0);
console.log("Alle Tests bestanden.");
