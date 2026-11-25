/* BVDW AI Orchestrator Hub – rendert Startseite und Lab-Seiten aus data/*.json */
(function () {
  "use strict";

  const QUARTALE = ["Q1", "Q2", "Q3", "Q4"];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slug = (s) => String(s || "").toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const badge = (s) => (s ? `<span class="badge ${slug(s)}">${esc(s)}</span>` : "");
  const extern = 'target="_blank" rel="noopener"';

  async function laden() {
    const [cfg, daten] = await Promise.all([
      fetch("data/config.json", { cache: "no-store" }).then((r) => r.json()),
      fetch("data/labs.json", { cache: "no-store" }).then((r) => r.json()),
    ]);
    const felder = daten.themenfelder || [];
    const labs = (daten.labs || [])
      .map((l, i) => ({ ...l, _i: i }))
      .sort((a, b) => a.themenfeld - b.themenfeld || a._i - b._i)
      .map((l, i) => ({ ...l, nr: i + 1, feld: felder.find((f) => f.nr === l.themenfeld) }));
    return { cfg, labs, felder, stand: daten.stand };
  }


  const logo = () => `
    <a class="logo-link" href="index.html" aria-label="BVDW AI Orchestrator Hub – Startseite">
      <span class="wortmarke" data-logo>BVDW</span>
      <span class="logo-zusatz">AI Orchestrator<br>Hub</span>
    </a>`;

  const topbar = (cfg) => `
    <div class="wrap"><div class="topbar">
      ${logo()}
      <nav>
        <a href="index.html#labs">Labs</a>
        <a href="index.html#formate">Formate</a>
        <a href="index.html#publikationen">Publikationen</a>
      </nav>
    </div></div>`;

  const footer = (cfg, stand) => `
    <footer><div class="wrap">
      <span class="wortmarke">BVDW</span>
      <span>Bereich KI · Datenstand ${esc(stand || "–")} · Inhalte: <a href="${esc(cfg.quelle)}" ${extern}>bvdw.org</a></span>
    </div></footer>`;

  const heroBild = () => `<div class="hero-block" aria-hidden="true"></div>
    <img class="hero-bild" src="assets/hero.png" alt="" aria-hidden="true">`;

  /* Visual Startseite: KI im Zentrum, sieben Themenfelder als orchestrierte Knoten */
  function heroNetz(felder) {
    const cx = 250, cy = 290, r = 150, n = felder.length || 7;
    const knoten = Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), nr: felder[i]?.nr ?? i + 1 };
    });
    const linien = knoten.map((k, i) => `
      <line x1="${cx}" y1="${cy}" x2="${k.x.toFixed(1)}" y2="${k.y.toFixed(1)}" class="netz-linie"/>
      <circle r="5" class="netz-puls"><animateMotion dur="${(2.4 + (i % 3) * 0.5).toFixed(1)}s" begin="-${(i * 0.35 + 0.1).toFixed(2)}s" repeatCount="indefinite"
        path="M${k.x.toFixed(1)},${k.y.toFixed(1)} L${cx},${cy}"/></circle>`).join("");
    const ring = knoten.map((k, i) => {
      const m = knoten[(i + 1) % n];
      return `<line x1="${k.x.toFixed(1)}" y1="${k.y.toFixed(1)}" x2="${m.x.toFixed(1)}" y2="${m.y.toFixed(1)}" class="netz-ring"/>`;
    }).join("");
    const punkte = knoten.map((k) => `
      <g class="netz-knoten" data-feld="${k.nr}"><circle cx="${k.x.toFixed(1)}" cy="${k.y.toFixed(1)}" r="27"/>
      <text x="${k.x.toFixed(1)}" y="${(k.y + 8).toFixed(1)}">${k.nr}</text></g>`).join("");
    return `
      <svg class="hero-netz" viewBox="0 0 460 500" aria-hidden="true">
        <path d="M150 0 H450 V294 a36 36 0 0 1 -36 36 H186 a36 36 0 0 1 -36 -36 Z" fill="#0045C3"/>
        ${ring}${linien}
        <circle cx="${cx}" cy="${cy}" r="58" fill="#FF5833"/>
        <circle cx="${cx}" cy="${cy}" r="72" class="netz-halo"/>
        <text x="${cx}" y="${cy + 14}" class="netz-ki">KI</text>
        ${punkte}
      </svg>`;
  }

  /* ---------- Startseite ---------- */
  function startseite(root, { cfg, labs, felder, stand }) {
    const leitungen = labs.reduce((n, l) => n + (l.leitung || []).length, 0);

    root.innerHTML = `
      ${topbar(cfg)}
      <header class="hero"><div class="wrap">
        ${heroNetz(felder)}
        <div class="hero-inhalt">
          <p class="eyebrow">Künstliche Intelligenz im BVDW</p>
          <h1>BVDW<br>${esc(cfg.titel)}</h1>
          <p class="lead">${esc(cfg.untertitel)}</p>
          <div class="kennzahlen">
            <div class="kennzahl"><b>${labs.length}</b><span>Labs & Einheiten</span></div>
            <div class="kennzahl"><b>${felder.length}</b><span>Themenfelder</span></div>
            <div class="kennzahl"><b>${leitungen}</b><span>Lab-Leitungen</span></div>
          </div>
        </div>
      </div></header>

      <section class="wrap intro">
        <p class="intro-text">${esc(cfg.intro)}</p>
        <div class="leitlinien">
          ${(cfg.leitlinien || []).map((x, i) => `<div class="leitlinie"><span class="nr">${i + 1}</span><h3>${esc(x.titel)}</h3><p>${esc(x.text)}</p></div>`).join("")}
        </div>
      </section>

      <main class="wrap" id="labs">
        <div class="felder-kopf">
          <div>
            <p class="eyebrow">Themenfelder</p>
            <h2>${felder.length} Themenfelder bündeln ${labs.length} Labs</h2>
            <p class="unter">Themenfeld anklicken, um die zugehörigen Labs, Working Groups und AGs zu sehen.</p>
          </div>
          <input class="suche" type="search" placeholder="Lab, Person oder Unternehmen suchen …" aria-label="Labs durchsuchen">
        </div>
        <div class="feldkacheln" role="list">
          ${felder.map((f) => {
            const n = labs.filter((l) => l.themenfeld === f.nr).length;
            return `
            <button class="feldkachel" role="listitem" data-feld="${f.nr}" aria-expanded="false" aria-controls="feldpanel">
              <span class="feldkachel-nr">${f.nr}</span>
              <span class="feldkachel-name">${esc(f.name)}</span>
              <span class="feldkachel-frage">${esc(f.leitfrage)}</span>
              <span class="feldkachel-fuss"><span>${n} ${n === 1 ? "Lab" : "Labs"}</span><span class="pfeil" aria-hidden="true">↓</span></span>
            </button>`;
          }).join("")}
          <button class="feldkachel alle" data-feld="alle" aria-expanded="false" aria-controls="feldpanel">
            <span class="feldkachel-name">Alle ${labs.length} Labs</span>
            <span class="feldkachel-frage">Der Bereich KI orchestriert alle Themenfelder im Querschnitt.</span>
            <span class="feldkachel-fuss"><span>Gesamtübersicht</span><span class="pfeil" aria-hidden="true">↓</span></span>
          </button>
        </div>
        <section id="feldpanel" class="feldpanel" hidden></section>
      </main>

      <section class="wrap block" id="formate">
        <p class="eyebrow">Mitmachen</p>
        <h2>Formate & Einstieg</h2>
        <div class="formate">
          ${(cfg.formate || []).map((f) => `
            <${f.url ? `a href="${esc(f.url)}" ${extern}` : "div"} class="format">
              <h3>${esc(f.titel)}</h3><p>${esc(f.text)}</p>${f.url ? '<span class="pfeil">→</span>' : ""}
            </${f.url ? "a" : "div"}>`).join("")}
        </div>
      </section>

      <section class="wrap block" id="publikationen">
        <p class="eyebrow">Veröffentlichungen</p>
        <h2>Neueste KI-Publikationen</h2>
        <div class="publis">
          ${(cfg.publikationen || []).map((p) => `
            <a class="publi" href="${esc(p.url)}" ${extern}><span class="datum">${esc(p.datum)}</span><span class="titel">${esc(p.titel)}</span><span class="pfeil">→</span></a>`).join("")}
        </div>
        <div class="aktionen">
          <a class="btn sekundaer" href="${esc(cfg.alle_publikationen)}" ${extern}>Alle KI-Publikationen</a>
          <a class="btn sekundaer" href="${esc(cfg.academy)}" ${extern}>BVDW Academy: KI-Kurse</a>
        </div>
      </section>

      <section class="wrap block">
        <div class="kontakt">
          <div>
            <p class="eyebrow">Kontakt</p>
            <h2>${esc(cfg.kontakt?.name)}</h2>
            <p>${esc(cfg.kontakt?.rolle)}<br>${esc(cfg.kontakt?.telefon)}</p>
          </div>
          <a class="btn" href="${esc(cfg.kontakt?.url)}" ${extern}>Kontakt aufnehmen</a>
        </div>
      </section>
      ${footer(cfg, stand)}`;

    let aktivesFeld = "", suchbegriff = "";
    const panel = root.querySelector("#feldpanel");
    const feldKacheln = [...root.querySelectorAll(".feldkachel")];

    const kachel = (l) => {
      const namen = (l.leitung || []).map((p) => p.name).join(", ");
      const bvdw = (l.bvdw || []).map((b) => b.name).join(", ");
      return `
        <a class="kachel" href="lab.html?id=${encodeURIComponent(l.id)}">
          <div class="kopf"><span class="nr">${l.nr}</span>${badge(l.status)}</div>
          <h3>${esc(l.name)}</h3>
          <p class="heimat">${esc(l.heimat)}</p>
          <p class="kurz">${esc(l.kurz)}</p>
          <div class="fuss">
            <span>${namen ? "Lab-Leitung: " + esc(namen) : bvdw ? "BVDW: " + esc(bvdw) : ""}</span>
            <span class="pfeil" aria-hidden="true">→</span>
          </div>
        </a>`;
    };

    const passt = (l, q) => !q || [l.name, l.kurz, l.heimat, ...(l.leitung || []).map((p) => `${p.name} ${p.unternehmen}`), ...(l.bvdw || []).map((b) => b.name)]
      .join(" ").toLowerCase().includes(q);

    function zeichnen(scrollen) {
      const q = suchbegriff.trim().toLowerCase();
      feldKacheln.forEach((k) => {
        const an = !q && k.dataset.feld === aktivesFeld;
        k.classList.toggle("aktiv", an);
        k.setAttribute("aria-expanded", String(an));
        if (q) {
          const nr = k.dataset.feld;
          const n = labs.filter((l) => (nr === "alle" || String(l.themenfeld) === nr) && passt(l, q)).length;
          k.classList.toggle("treffer", n > 0);
          k.classList.toggle("gedimmt", n === 0);
        } else k.classList.remove("treffer", "gedimmt");
      });

      if (!q && !aktivesFeld) { panel.hidden = true; panel.innerHTML = ""; return; }

      let titel, unter, liste;
      if (q) {
        liste = labs.filter((l) => passt(l, q));
        titel = `${liste.length} Treffer für „${esc(suchbegriff.trim())}“`;
        unter = "Suche über alle Themenfelder";
      } else if (aktivesFeld === "alle") {
        liste = labs; titel = `Alle ${labs.length} Labs`; unter = "Sortiert nach Themenfeld";
      } else {
        const f = felder.find((x) => String(x.nr) === aktivesFeld);
        liste = labs.filter((l) => String(l.themenfeld) === aktivesFeld);
        titel = `<span class="feldnr">${f.nr}</span> · ${esc(f.name)}`; unter = esc(f.leitfrage);
      }
      panel.hidden = false;
      panel.innerHTML = `
        <div class="feldkopf">
          <div><h2>${titel}</h2><p>${unter}</p></div>
          <button class="schliessen" type="button" aria-label="Schließen">Schließen ×</button>
        </div>
        ${liste.length ? `<div class="kacheln">${liste.map(kachel).join("")}</div>` : `<p class="hinweis">Keine Labs gefunden.</p>`}`;
      panel.querySelector(".schliessen").addEventListener("click", () => {
        aktivesFeld = ""; suchbegriff = ""; root.querySelector(".suche").value = "";
        history.replaceState(null, "", location.pathname + location.search + "#labs");
        zeichnen();
        root.querySelector("#labs").scrollIntoView({ behavior: "smooth", block: "start" });
      });
      if (scrollen) panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    feldKacheln.forEach((k) => k.addEventListener("click", () => {
      suchbegriff = ""; root.querySelector(".suche").value = "";
      aktivesFeld = aktivesFeld === k.dataset.feld ? "" : k.dataset.feld;
      history.replaceState(null, "", location.pathname + location.search + (aktivesFeld ? `#feld-${aktivesFeld}` : "#labs"));
      zeichnen(!!aktivesFeld);
    }));
    root.querySelector(".suche").addEventListener("input", (e) => { suchbegriff = e.target.value; zeichnen(); });

    const m = location.hash.match(/^#feld-(\d+|alle)$/);
    if (m) { aktivesFeld = m[1]; zeichnen(true); }
  }

  /* ---------- Lab-Seite ---------- */
  function labseite(root, { cfg, labs, stand }) {
    const id = new URLSearchParams(location.search).get("id");
    const lab = labs.find((l) => l.id === id);
    if (!lab) {
      root.innerHTML = `${topbar(cfg)}<header class="hero"><div class="wrap"><h1>Lab nicht gefunden</h1>
        <div class="aktionen"><a class="btn" href="index.html">Zur Übersicht</a></div></div></header>`;
      return;
    }
    document.title = `${lab.name} · BVDW AI Orchestrator Hub`;

    const rm = lab.roadmap2027 || [];
    const spalten = QUARTALE.map((q) => {
      const items = rm.filter((m) => m.quartal === q);
      return `
        <div class="quartal">
          <h3>${q} <small>2027</small></h3>
          ${items.length ? items.map((m) => `
            <div class="meilenstein">
              <div class="typ">${esc(m.typ || "")}</div>
              <div class="titel">${esc(m.titel)}</div>
              ${m.beschreibung ? `<p>${esc(m.beschreibung)}</p>` : ""}
              ${badge(m.status || "geplant")} ${m.verantwortlich ? `<span class="wer">· ${esc(m.verantwortlich)}</span>` : ""}
            </div>`).join("") : `<p class="leer">Noch keine Meilensteine.</p>`}
        </div>`;
    }).join("");


    root.innerHTML = `
      ${topbar(cfg)}
      <header class="hero"><div class="wrap">
        ${heroBild()}
        <div class="hero-inhalt">
          <a class="zurueck" href="index.html#feld-${lab.themenfeld}">← Themenfeld ${lab.feld ? esc(lab.feld.name) : ""}</a>
          <p class="eyebrow">Themenfeld ${lab.feld ? `${lab.feld.nr} · ${esc(lab.feld.name)}` : ""}</p>
          <h1>${esc(lab.name)}</h1>
          <div class="lab-meta"><span>${esc(lab.heimat)}</span>${badge(lab.status)}</div>
          <p class="lead" style="margin-top:22px">${esc(lab.kurz)}</p>
          ${lab.hinweis ? `<p class="hinweis" style="margin-top:20px">${esc(lab.hinweis)}</p>` : ""}
        </div>
      </div></header>

      <main class="wrap">
        <section class="block">
          <p class="eyebrow">Team</p>
          <h2>Lab-Leitung & Ansprechpersonen</h2>
          <div class="personen">
            ${(lab.leitung || []).map((p) => `
              <div class="person"><div class="rolle">${esc(p.rolle || "Lab-Leitung")}</div>
                <div class="name">${esc(p.name)}</div>${p.unternehmen ? `<div class="firma">${esc(p.unternehmen)}</div>` : ""}</div>`).join("")}
            ${(lab.bvdw || []).map((b) => `
              <div class="person bvdw"><div class="rolle">Verantwortlich BVDW</div>
                <div class="name">${esc(b.name)}</div>${b.email ? `<a class="firma" href="mailto:${esc(b.email)}">${esc(b.email)}</a>` : ""}</div>`).join("")}
            ${!(lab.leitung || []).length ? `<div class="person leer-person"><div class="rolle">Lab-Leitung</div><div class="name">Noch nicht hinterlegt</div></div>` : ""}
          </div>
          ${lab.termine ? `<p class="termine"><b>Termine:</b> ${esc(lab.termine)}</p>` : ""}
        </section>

        ${(lab.aktuell || []).length ? `
        <section class="block">
          <p class="eyebrow">Aktuell</p>
          <h2>Laufende Projekte</h2>
          <ul class="ziele">${lab.aktuell.map((z) => `<li>${esc(z)}</li>`).join("")}</ul>
        </section>` : ""}

        <section class="block">
          <p class="eyebrow">Agenda 2027</p>
          <h2>Ziele 2027</h2>
          ${(lab.ziele2027 || []).length
            ? `<ul class="ziele">${lab.ziele2027.map((z) => `<li>${esc(z)}</li>`).join("")}</ul>`
            : `<p class="hinweis">Die Ziele 2027 werden aktuell mit der Lab-Leitung abgestimmt.</p>`}
        </section>

        <section class="block">
          <p class="eyebrow">Roadmap</p>
          <h2>Roadmap 2027</h2>
          <p class="unter">Meilensteine pro Quartal.</p>
          <div class="roadmap">${spalten}</div>
        </section>

        ${(lab.links || []).length ? `
        <section class="block">
          <p class="eyebrow">Material</p>
          <h2>Links</h2>
          <div class="aktionen">${lab.links.map((l) => `<a class="btn sekundaer" href="${esc(l.url)}" ${extern}>${esc(l.label)}</a>`).join("")}</div>
        </section>` : ""}
      </main>
      ${footer(cfg, stand)}`;
  }

  /* Logo: assets/bvdw-logo.svg oder .png verwenden, sonst Wortmarke behalten */
  function logoEinsetzen() {
    const ziele = document.querySelectorAll("[data-logo]");
    if (!ziele.length) return;
    const versuche = (quellen) => {
      if (!quellen.length) return;
      const img = new Image();
      img.onload = () => ziele.forEach((z) => {
        const el = img.cloneNode(); el.className = "logo"; el.alt = "BVDW"; z.replaceWith(el);
      });
      img.onerror = () => versuche(quellen.slice(1));
      img.src = quellen[0];
    };
    versuche(["assets/bvdw-logo.svg", "assets/bvdw-logo.png"]);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const root = document.getElementById("app");
    try {
      const d = await laden();
      (document.body.dataset.seite === "lab" ? labseite : startseite)(root, d);
      logoEinsetzen();
    } catch (e) {
      root.innerHTML = `<div class="wrap" style="padding:48px 0"><p class="hinweis">Daten konnten nicht geladen werden (${esc(e.message)}).</p></div>`;
    }
  });
})();
