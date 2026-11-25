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

  /* Navigationsmenü links */
  function sidebar({ felder, labs }, aktiv = {}) {
    const feldLink = (f) => {
      const offen = String(aktiv.feld) === String(f.nr);
      const unter = offen && aktiv.zeigeLabs ? `
        <ul class="nav-labs">${labs.filter((l) => l.themenfeld === f.nr).map((l) => `
          <li><a href="lab.html?id=${encodeURIComponent(l.id)}"${aktiv.lab === l.id ? ' aria-current="page"' : ""}>${esc(l.name)}</a></li>`).join("")}
        </ul>` : "";
      return `<li><a class="nav-feld${offen ? " aktiv" : ""}" href="index.html#feld-${f.nr}" data-feld="${f.nr}">
        <span class="nav-nr">${f.nr}</span><span>${esc(f.name)}</span></a>${unter}</li>`;
    };
    return `
      <div class="sidebar-kopf">${logo()}
        <button class="menue-knopf" type="button" aria-expanded="false" aria-controls="sidebar-nav">Menü</button>
      </div>
      <nav id="sidebar-nav" class="sidebar-nav" aria-label="Hauptnavigation">
        <ul class="nav-haupt">
          <li><a href="index.html#start"${aktiv.seite === "start" ? ' class="aktiv"' : ""}>Übersicht</a></li>
          <li><a href="blog.html"${aktiv.seite === "blog" ? ' class="aktiv"' : ""}>AI Blog</a></li>
          <li><a href="statuscall.html"${aktiv.seite === "statuscall" ? ' class="aktiv"' : ""}>Statuscall KI</a></li>
        </ul>
        <p class="nav-titel">Themenfelder</p>
        <ul class="nav-felder">
          ${felder.map(feldLink).join("")}
          <li><a class="nav-feld${aktiv.feld === "alle" ? " aktiv" : ""}" href="index.html#feld-alle" data-feld="alle"><span class="nav-nr alle">∑</span><span>Alle ${labs.length} Labs</span></a></li>
        </ul>
        <p class="nav-titel">Mitmachen</p>
        <ul class="nav-haupt">
          <li><a href="index.html#leitlinien">Leitlinien</a></li>
          <li><a href="index.html#formate">Formate & Einstieg</a></li>
          <li><a href="index.html#publikationen">Publikationen</a></li>
          <li><a href="index.html#kontakt">Kontakt</a></li>
        </ul>
        <p class="nav-fuss">Bereich KI · <a href="https://www.bvdw.org/kuenstliche-intelligenz-im-bvdw/" ${extern}>bvdw.org</a></p>
      </nav>`;
  }

  const footer = (cfg, stand) => `
    <footer><div class="wrap">
      <span class="wortmarke" data-logo>BVDW</span>
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

  /* Illustrationen für die Leitlinien Daten, Kreativität, Verantwortung */
  const LEITLINIEN_BILD = {
    daten: () => {
      const spalten = [2, 3, 3, 4, 5, 6];
      return `<svg viewBox="0 0 220 140" aria-hidden="true">${spalten.map((h, i) =>
        Array.from({ length: h }, (_, j) => `<circle cx="${24 + i * 34}" cy="${122 - j * 20}" r="${j === h - 1 ? 9 : 7}" fill="${j === h - 1 ? "#FF5833" : "#fff"}"${j === h - 1 ? "" : ' opacity="' + (0.55 + j * 0.08).toFixed(2) + '"'}/>`).join("")).join("")}
        <polyline points="${spalten.map((h, i) => `${24 + i * 34},${122 - (h - 1) * 20}`).join(" ")}" fill="none" stroke="#FF5833" stroke-width="3" stroke-dasharray="2 6" stroke-linecap="round"/></svg>`;
    },
    kreativitaet: () => `<svg viewBox="0 0 220 140" aria-hidden="true">
        <circle cx="86" cy="76" r="50" fill="#fff"/>
        <circle cx="136" cy="68" r="44" fill="#0045C3" style="mix-blend-mode:multiply"/>
        <circle cx="112" cy="104" r="26" fill="none" stroke="#000" stroke-width="3"/>
        <path d="M176 14 L182 34 L202 40 L182 46 L176 66 L170 46 L150 40 L170 34 Z" fill="#000"/>
        <path d="M36 16 L39 26 L49 29 L39 32 L36 42 L33 32 L23 29 L33 26 Z" fill="#fff"/></svg>`,
    verantwortung: () => `<svg viewBox="0 0 220 140" aria-hidden="true">
        <ellipse cx="110" cy="72" rx="92" ry="34" fill="none" stroke="#FF5833" stroke-width="3" transform="rotate(-12 110 72)"/>
        <path d="M110 12 L158 28 V70 C158 100 136 120 110 130 C84 120 62 100 62 70 V28 Z" fill="#0045C3" stroke="#fff" stroke-width="3"/>
        <path d="M88 72 L104 88 L134 56" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="196" cy="60" r="7" fill="#FF5833"/></svg>`,
  };
  const leitlinieBild = (titel) => (LEITLINIEN_BILD[slug(titel).replace(/-/g, "")] || (() => ""))();

  /* ---------- Startseite ---------- */
  function startseite(root, { cfg, labs, felder, stand }) {
    const leitungen = labs.reduce((n, l) => n + (l.leitung || []).length, 0);

    root.innerHTML = `
      <header class="hero" id="start"><div class="wrap">
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

      <section class="wrap intro" id="leitlinien">
        <p class="intro-text">${esc(cfg.intro)}</p>
        <div class="leitlinien">
          ${(cfg.leitlinien || []).map((x) => `
            <div class="leitlinie ${slug(x.titel)}">
              <div class="leitlinie-bild">${leitlinieBild(x.titel)}</div>
              <h3>${esc(x.titel)}</h3><p>${esc(x.text)}</p>
            </div>`).join("")}
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

      <section class="wrap block" id="blog-teaser" hidden>
        <div class="felder-kopf">
          <div><p class="eyebrow">AI Blog</p><h2>Neues aus dem Bereich KI</h2></div>
          <a class="btn sekundaer" href="blog.html">Alle Beiträge</a>
        </div>
        <div class="blogliste" id="blog-neu"></div>
      </section>

      <section class="wrap block" id="formate">
        <p class="eyebrow">Mitmachen</p>
        <h2>Formate & Einstieg</h2>
        <div class="formate">
          ${(cfg.formate || []).map((f) => `
            <${f.url ? `a href="${esc(f.url)}"${/^https?:/.test(f.url) ? " " + extern : ""}` : "div"} class="format">
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

      <section class="wrap block" id="kontakt">
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

    let zeichnen = function (scrollen) {
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
    };

    const navSync = () => document.querySelectorAll(".nav-feld").forEach((a) => a.classList.toggle("aktiv", a.dataset.feld === aktivesFeld));
    const _zeichnen = zeichnen;
    zeichnen = (scrollen) => { _zeichnen(scrollen); navSync(); };

    feldKacheln.forEach((k) => k.addEventListener("click", () => {
      suchbegriff = ""; root.querySelector(".suche").value = "";
      aktivesFeld = aktivesFeld === k.dataset.feld ? "" : k.dataset.feld;
      history.replaceState(null, "", location.pathname + location.search + (aktivesFeld ? `#feld-${aktivesFeld}` : "#labs"));
      zeichnen(!!aktivesFeld);
    }));
    root.querySelector(".suche").addEventListener("input", (e) => { suchbegriff = e.target.value; zeichnen(); });

    blogLaden().then((liste) => {
      if (!liste.length) return;
      root.querySelector("#blog-neu").innerHTML = liste.slice(0, 3).map(blogKarte).join("");
      root.querySelector("#blog-teaser").hidden = false;
    });

    const ausHash = () => {
      const m = location.hash.match(/^#feld-(\d+|alle)$/);
      if (m) { suchbegriff = ""; root.querySelector(".suche").value = ""; aktivesFeld = m[1]; zeichnen(true); }
    };
    window.addEventListener("hashchange", ausHash);
    ausHash();
  }

  /* ---------- Lab-Seite ---------- */
  function labseite(root, { cfg, labs, felder, stand }) {
    const id = new URLSearchParams(location.search).get("id");
    const lab = labs.find((l) => l.id === id);
    if (!lab) {
      root.innerHTML = `<header class="hero"><div class="wrap"><h1>Lab nicht gefunden</h1>
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
      <header class="hero"><div class="wrap">
        ${(window.labVisual && window.labVisual(lab.id)) || heroNetz(felder)}
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
    versuche(["assets/bvdw-logo.png"]);
  }

  /* ---------- AI Blog ---------- */
  const datumDE = (d) => {
    const m = String(d || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? `${m[3]}.${m[2]}.${m[1]}` : esc(d);
  };
  const sichereUrl = (u) => (/^(https?:\/\/|mailto:|[\w./?=&#%-]+$)/i.test(u) && !/^javascript:/i.test(u) ? u : "#");

  function inline(t) {
    return esc(t)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, u) => `<img src="${sichereUrl(u)}" alt="${alt}">`)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, u) => {
        const url = sichereUrl(u.replace(/&amp;/g, "&"));
        const ext = /^https?:/i.test(url) ? ` ${extern}` : "";
        return `<a href="${esc(url)}"${ext}>${txt}</a>`;
      })
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function markdown(md) {
    const zeilen = String(md).replace(/\r\n/g, "\n").split("\n");
    let html = "", absatz = [], liste = null;
    const absatzEnde = () => { if (absatz.length) { html += `<p>${inline(absatz.join(" "))}</p>`; absatz = []; } };
    const listeEnde = () => { if (liste) { html += `</${liste}>`; liste = null; } };
    for (const roh of zeilen) {
      const z = roh.trimEnd();
      let m;
      if (!z.trim()) { absatzEnde(); listeEnde(); continue; }
      if ((m = z.match(/^(#{1,3})\s+(.*)$/))) { absatzEnde(); listeEnde(); const e = m[1].length + 1; html += `<h${e}>${inline(m[2])}</h${e}>`; continue; }
      if ((m = z.match(/^\s*[-*]\s+(.*)$/))) { absatzEnde(); if (liste !== "ul") { listeEnde(); html += "<ul>"; liste = "ul"; } html += `<li>${inline(m[1])}</li>`; continue; }
      if ((m = z.match(/^\s*\d+[.)]\s+(.*)$/))) { absatzEnde(); if (liste !== "ol") { listeEnde(); html += "<ol>"; liste = "ol"; } html += `<li>${inline(m[1])}</li>`; continue; }
      if ((m = z.match(/^>\s?(.*)$/))) { absatzEnde(); listeEnde(); html += `<blockquote>${inline(m[1])}</blockquote>`; continue; }
      listeEnde(); absatz.push(z.trim());
    }
    absatzEnde(); listeEnde();
    return html;
  }

  function trennen(text) {
    const t = String(text).replace(/\r\n/g, "\n");
    const m = t.match(/^---\n([\s\S]*?)\n---\n?/);
    const kopf = {};
    if (m) m[1].split("\n").forEach((z) => { const i = z.indexOf(":"); if (i > 0) kopf[z.slice(0, i).trim().toLowerCase()] = z.slice(i + 1).trim(); });
    return { kopf, text: m ? t.slice(m[0].length) : t };
  }

  const blogLaden = () => fetch("blog/index.json", { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])).catch(() => []);

  const blogKarte = (b) => `
    <a class="blogkarte" href="blog.html?id=${encodeURIComponent(b.slug)}">
      <span class="blog-datum">${datumDE(b.datum)}</span>
      <h3>${esc(b.titel)}</h3>
      ${b.teaser ? `<p>${esc(b.teaser)}</p>` : ""}
      <span class="blog-fuss"><span>${esc(b.autor)}</span><span class="pfeil" aria-hidden="true">→</span></span>
      ${(b.tags || []).length ? `<span class="blog-tags">${b.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</span>` : ""}
    </a>`;

  async function blogseite(root, { cfg, stand }) {
    const id = new URLSearchParams(location.search).get("id");
    const liste = await blogLaden();

    if (!id) {
      const tags = [...new Set(liste.flatMap((b) => b.tags || []))];
      root.innerHTML = `
        <header class="hero blog-hero"><div class="wrap">
          <div class="hero-inhalt">
            <p class="eyebrow">AI Blog</p>
            <h1>Neues aus dem Bereich KI</h1>
            <p class="lead">Berichte aus den Labs, neue Publikationen und Einordnungen zur KI-Agenda des BVDW.</p>
          </div>
        </div></header>
        <main class="wrap">
          ${tags.length ? `<div class="blog-filter" role="toolbar" aria-label="Nach Thema filtern">
            <button class="chip" data-tag="" aria-pressed="true">Alle</button>
            ${tags.map((t) => `<button class="chip" data-tag="${esc(t)}" aria-pressed="false">${esc(t)}</button>`).join("")}
          </div>` : ""}
          <div class="blogliste" id="blogliste"></div>
        </main>
        ${footer(cfg, stand)}`;
      const ziel = root.querySelector("#blogliste");
      const zeigen = (tag) => {
        const auswahl = tag ? liste.filter((b) => (b.tags || []).includes(tag)) : liste;
        ziel.innerHTML = auswahl.length ? auswahl.map(blogKarte).join("") : `<p class="hinweis">Noch keine Beiträge.</p>`;
      };
      root.querySelectorAll(".blog-filter .chip").forEach((c) => c.addEventListener("click", () => {
        root.querySelectorAll(".blog-filter .chip").forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
        zeigen(c.dataset.tag);
      }));
      zeigen("");
      return;
    }

    const meta = liste.find((b) => b.slug === id);
    const antwort = /^[\w-]+$/.test(id) ? await fetch(`blog/${id}.md`, { cache: "no-store" }).catch(() => null) : null;
    if (!antwort || !antwort.ok) {
      root.innerHTML = `<header class="hero"><div class="wrap"><h1>Beitrag nicht gefunden</h1>
        <div class="aktionen"><a class="btn" href="blog.html">Zum AI Blog</a></div></div></header>`;
      return;
    }
    const { kopf, text } = trennen(await antwort.text());
    const titel = kopf.titel || meta?.titel || id;
    document.title = `${titel} · AI Blog · BVDW`;
    const idx = liste.findIndex((b) => b.slug === id);
    const weitere = liste.filter((b) => b.slug !== id).slice(0, 3);
    root.innerHTML = `
      <article class="wrap beitrag">
        <a class="zurueck" href="blog.html">← AI Blog</a>
        <p class="eyebrow">${datumDE(kopf.datum || meta?.datum)} · ${esc(kopf.autor || meta?.autor || "Bereich KI")}</p>
        <h1>${esc(titel)}</h1>
        ${kopf.teaser ? `<p class="lead">${esc(kopf.teaser)}</p>` : ""}
        <div class="beitrag-text">${markdown(text)}</div>
        ${(meta?.tags || []).length ? `<p class="blog-tags">${meta.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</p>` : ""}
      </article>
      ${weitere.length ? `<section class="wrap block"><p class="eyebrow">Weiterlesen</p><h2>Mehr aus dem AI Blog</h2>
        <div class="blogliste">${weitere.map(blogKarte).join("")}</div></section>` : ""}
      ${footer(cfg, stand)}`;
  }

  /* ---------- Statuscall KI ---------- */
  const WOCHENTAGE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const MONATSNAMEN = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const datumLang = (iso) => {
    const [j, m, t] = iso.split("-").map(Number);
    const d = new Date(Date.UTC(j, m - 1, t));
    return { tag: String(t).padStart(2, "0"), monat: MONATSNAMEN[m - 1], jahr: j, wochentag: WOCHENTAGE[d.getUTCDay()] };
  };

  function textHtml(s) {
    return String(s || "").split("\n").map((z) => inline(z.replace(/(^|\s)à(?=\s|$)/g, "$1→"))
      .replace(/(^|[\s(])(https?:\/\/[^\s<]+)/g, (_, vor, u) => `${vor}<a href="${u}" ${extern}>${u.length > 70 ? u.slice(0, 67) + "…" : u}</a>`)
      .replace(/^(→|à)\s*/, "→ ")).join("<br>");
  }

  function bloeckeHtml(bloecke) {
    let html = "";
    for (const b of bloecke) {
      if (b.t === "h") html += `<h3 class="sc-h">${textHtml(b.text)}</h3>`;
      else if (b.t === "p") html += `<p>${textHtml(b.text)}</p>`;
      else if (b.t === "li") html += `<div class="sc-li${b.b ? " fett" : ""}" style="--lvl:${b.lvl || 0}">${textHtml(b.text)}</div>`;
      else if (b.t === "tab") {
        const zeilen = b.zeilen || [];
        const kv = zeilen.every((z) => z.length >= 2 && z[0].length < 40);
        if (kv) {
          html += `<div class="sc-tabelle">${zeilen.map((z) => `<div class="sc-zeile">${z.map((c, i) => `<div class="${i === 0 ? "sc-key" : "sc-val"}">${textHtml(c)}</div>`).join("")}</div>`).join("")}</div>`;
        } else {
          html += zeilen.map((z) => `<div class="sc-karte">${z.map((c) => {
            const [erste, ...rest] = c.split("\n");
            return `<div><strong>${textHtml(erste)}</strong>${rest.length ? "<br>" + textHtml(rest.join("\n")) : ""}</div>`;
          }).join("")}</div>`).join("");
        }
      }
    }
    return html;
  }

  async function statuscallseite(root, { cfg, stand }) {
    const daten = await fetch("data/statuscalls.json", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ termine: [] }));
    const termine = (daten.termine || []).slice().sort((a, b) => b.datum.localeCompare(a.datum));
    const sc = cfg.statuscall || {};
    const heute = new Date().toISOString().slice(0, 10);
    const naechste = (sc.naechste || []).filter((t) => t.datum >= heute);
    const jahre = [...new Set(termine.map((t) => t.datum.slice(0, 4)))];
    const sauber = (x) => x.replace(/\[|\]\([^)]*\)/g, "").replace(/[:\s→à]+$/, "").trim();
    const themen = (t) => {
      const h = t.bloecke.filter((b) => b.t === "h" && !/^agenda$/i.test(b.text) && b.text.length > 6 && !/^\d/.test(b.text));
      const quelle = h.length >= 3 ? h : t.bloecke.filter((b) => b.t === "li" && b.b && !b.lvl && b.text.length < 60);
      return [...new Set(quelle.map((b) => sauber(b.text)))].filter((x) => x.length > 2).slice(0, 5);
    };

    root.innerHTML = `
      <header class="hero blog-hero"><div class="wrap">
        <div class="hero-inhalt">
          <p class="eyebrow">Monatlicher KI-Statuscall</p>
          <h1>Statuscall KI</h1>
          <p class="lead">${esc(sc.beschreibung || "")}</p>
          <div class="sc-infos">
            <div class="sc-info"><span class="sc-info-label">Rhythmus</span><b>${esc(sc.rhythmus || "")}</b></div>
            ${naechste.length ? `<div class="sc-info naechster"><span class="sc-info-label">Nächster Termin</span><b>${(() => { const d = datumLang(naechste[0].datum); return `${d.wochentag}, ${d.tag}. ${d.monat} ${d.jahr}`; })()}</b></div>` : ""}
            <div class="sc-info"><span class="sc-info-label">Archiv</span><b>${termine.length} Agenden seit ${termine.length ? datumLang(termine[termine.length - 1].datum).jahr : "–"}</b></div>
          </div>
        </div>
      </div></header>
      ${naechste.length ? `
      <section class="wrap sc-plan">
        <div class="felder-kopf">
          <div>
            <p class="eyebrow">Terminplan</p>
            <h2>Kommende Termine</h2>
            ${sc.hinweis ? `<p class="unter">${esc(sc.hinweis)}</p>` : ""}
          </div>
          ${sc.ics ? `<a class="btn" href="${esc(sc.ics)}" download>In den Kalender übernehmen (.ics)</a>` : ""}
        </div>
        <div class="sc-plan-raster">
          ${naechste.map((t, i) => { const d = datumLang(t.datum); return `
            <div class="sc-plan-termin${i === 0 ? " erster" : ""}">
              <span class="sc-plan-datum"><b>${d.tag}.</b> ${d.monat} ${d.jahr}</span>
              <span class="sc-plan-zeit">${d.wochentag}, 11:30–12:30 Uhr</span>
              ${t.notiz ? `<span class="sc-plan-notiz">${esc(t.notiz)}</span>` : ""}
            </div>`; }).join("")}
        </div>
      </section>` : ""}
      <main class="wrap">
        <div class="felder-kopf">
          <div>
            <p class="eyebrow">Agenden & Protokolle</p>
            <h2>Alle Termine</h2>
            <p class="unter">Nach Datum sortiert, der neueste zuerst. Termin anklicken, um die Agenda zu öffnen.</p>
          </div>
          <input class="suche" type="search" placeholder="In allen Agenden suchen …" aria-label="In allen Agenden suchen">
        </div>
        <div class="blog-filter sc-jahre" role="toolbar" aria-label="Nach Jahr filtern">
          <button class="chip" data-jahr="" aria-pressed="true">Alle Jahre</button>
          ${jahre.map((j) => `<button class="chip" data-jahr="${j}" aria-pressed="false">${j}</button>`).join("")}
        </div>
        <div class="sc-liste" id="sc-liste"></div>
      </main>
      ${footer(cfg, stand)}`;

    const liste = root.querySelector("#sc-liste");
    let jahr = "", q = "";
    const suchtext = termine.map((t) => JSON.stringify(t.bloecke).toLowerCase());

    function zeichnen() {
      const treffer = termine.map((t, i) => ({ t, i })).filter(({ t, i }) => (!jahr || t.datum.startsWith(jahr)) && (!q || suchtext[i].includes(q)));
      liste.innerHTML = treffer.length ? treffer.map(({ t }, n) => {
        const d = datumLang(t.datum);
        const anders = t.titel && t.titel !== "Statuscall KI";
        return `
          <details class="sc-termin${anders ? " sonder" : ""}" id="call-${t.datum}"${n === 0 && !q ? " open" : ""}>
            <summary>
              <span class="sc-datum"><b>${d.tag}</b><span>${d.monat.slice(0, 3)} ${d.jahr}</span></span>
              <span class="sc-kopf">
                <span class="sc-titel">${esc(t.titel)} <span class="sc-wt">· ${d.wochentag}</span></span>
                <span class="sc-themen">${themen(t).map((x) => `<span class="tag">${esc(x)}</span>`).join("")}</span>
              </span>
              <span class="pfeil" aria-hidden="true">↓</span>
            </summary>
            <div class="sc-inhalt" data-i="${termine.indexOf(t)}"></div>
          </details>`;
      }).join("") : `<p class="hinweis">Keine Agenden gefunden.</p>`;
      const fuellen = (det) => { const c = det.querySelector(".sc-inhalt"); if (!c.dataset.fertig) { c.innerHTML = bloeckeHtml(termine[+c.dataset.i].bloecke); c.dataset.fertig = "1"; } };
      liste.querySelectorAll("details").forEach((det) => {
        if (det.open || q) { fuellen(det); if (q) det.open = true; }
        det.addEventListener("toggle", () => det.open && fuellen(det));
      });
    }
    root.querySelectorAll(".sc-jahre .chip").forEach((c) => c.addEventListener("click", () => {
      jahr = c.dataset.jahr;
      root.querySelectorAll(".sc-jahre .chip").forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
      zeichnen();
    }));
    let timer;
    root.querySelector(".suche").addEventListener("input", (e) => { clearTimeout(timer); timer = setTimeout(() => { q = e.target.value.trim().toLowerCase(); zeichnen(); }, 200); });
    zeichnen();
    const ziel = location.hash.match(/^#call-(\d{4}-\d{2}-\d{2})$/);
    if (ziel) { const det = document.getElementById(`call-${ziel[1]}`); if (det) { det.open = true; det.scrollIntoView({ block: "start" }); } }
  }

  /* Mobil: Menü auf- und zuklappen */
  function menueEinrichten() {
    const knopf = document.querySelector(".menue-knopf");
    const sb = document.getElementById("sidebar");
    if (!knopf) return;
    knopf.addEventListener("click", () => {
      const offen = sb.classList.toggle("offen");
      knopf.setAttribute("aria-expanded", String(offen));
      knopf.textContent = offen ? "Schließen" : "Menü";
    });
    sb.querySelectorAll(".sidebar-nav a").forEach((a) => a.addEventListener("click", () => {
      sb.classList.remove("offen"); knopf.setAttribute("aria-expanded", "false"); knopf.textContent = "Menü";
    }));
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const app = document.getElementById("app");
    app.innerHTML = `<div class="layout"><aside class="sidebar" id="sidebar"></aside><div class="inhalt" id="inhalt"></div></div>`;
    const root = document.getElementById("inhalt");
    try {
      const d = await laden();
      const seite = document.body.dataset.seite;
      const istLab = seite === "lab";
      let aktiv = { seite: ["blog", "statuscall"].includes(seite) ? seite : "start" };
      if (istLab) {
        const lab = d.labs.find((l) => l.id === new URLSearchParams(location.search).get("id"));
        aktiv = { seite: "lab", feld: lab?.themenfeld, lab: lab?.id, zeigeLabs: true };
      }
      document.getElementById("sidebar").innerHTML = sidebar(d, aktiv);
      await ({ lab: labseite, blog: blogseite, statuscall: statuscallseite }[seite] || startseite)(root, d);
      menueEinrichten();
      logoEinsetzen();
    } catch (e) {
      root.innerHTML = `<div class="wrap" style="padding:48px 0"><p class="hinweis">Daten konnten nicht geladen werden (${esc(e.message)}).</p></div>`;
    }
  });
})();
