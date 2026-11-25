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

  const ghUrl = (cfg, pfad) => `https://github.com/${cfg.repo}/${pfad}`;
  const formUrl = (cfg, vorlage, felder = {}) => ghUrl(cfg, "issues/new?" + new URLSearchParams({ template: vorlage, ...felder }).toString());

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
        <a href="${esc(formUrl(cfg, "roadmap-eintrag.yml"))}" ${extern}>Eingabe machen</a>
        <a href="${esc(ghUrl(cfg, "issues"))}" ${extern}>Offene Eingaben</a>
      </nav>
    </div></div>`;

  const footer = (cfg, stand) => `
    <footer><div class="wrap">
      <span class="wortmarke">BVDW</span>
      <span>Bereich KI · Datenstand ${esc(stand || "–")} · Inhalte: <a href="${esc(cfg.quelle)}" ${extern}>bvdw.org</a> ·
      Änderungen über <a href="${esc(ghUrl(cfg, ""))}" ${extern}>GitHub</a></span>
    </div></footer>`;

  const heroBild = () => `<div class="hero-block" aria-hidden="true"></div>
    <img class="hero-bild" src="assets/hero.png" alt="" aria-hidden="true">`;

  /* ---------- Startseite ---------- */
  function startseite(root, { cfg, labs, felder, stand }) {
    const leitungen = labs.reduce((n, l) => n + (l.leitung || []).length, 0);

    root.innerHTML = `
      ${topbar(cfg)}
      <header class="hero"><div class="wrap">
        ${heroBild()}
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
        <div class="filter" role="toolbar" aria-label="Nach Themenfeld filtern">
          <button class="chip" data-feld="" aria-pressed="true">Alle Themenfelder</button>
          ${felder.map((f) => `<button class="chip" data-feld="${f.nr}" aria-pressed="false">${f.nr} · ${esc(f.name)}</button>`).join("")}
          <input class="suche" type="search" placeholder="Lab, Person oder Unternehmen suchen …" aria-label="Suche">
        </div>
        <div id="gruppen"></div>
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
    const ziel = root.querySelector("#gruppen");

    const kachel = (l) => {
      const namen = (l.leitung || []).map((p) => p.name).join(", ");
      const projekte = (l.aktuell || []).length + (l.roadmap2027 || []).length;
      return `
        <a class="kachel" href="lab.html?id=${encodeURIComponent(l.id)}">
          <div class="kopf"><span class="nr">${l.nr}</span>${badge(l.status)}</div>
          <h3>${esc(l.name)}</h3>
          <p class="heimat">${esc(l.heimat)}</p>
          <p class="kurz">${esc(l.kurz)}</p>
          <div class="fuss">
            <span>${namen ? "Lab-Leitung: " + esc(namen) : (l.bvdw || []).length ? "BVDW: " + esc(l.bvdw.map((b) => b.name).join(", ")) : ""}</span>
            <span class="pfeil" aria-hidden="true">→</span>
          </div>
        </a>`;
    };

    function zeichnen() {
      const q = suchbegriff.toLowerCase();
      const passt = (l) => {
        if (aktivesFeld && String(l.themenfeld) !== aktivesFeld) return false;
        if (!q) return true;
        return [l.name, l.kurz, l.heimat, ...(l.leitung || []).map((p) => `${p.name} ${p.unternehmen}`), ...(l.bvdw || []).map((b) => b.name)]
          .join(" ").toLowerCase().includes(q);
      };
      const html = felder.map((f) => {
        const treffer = labs.filter((l) => l.themenfeld === f.nr && passt(l));
        if (!treffer.length) return "";
        return `
          <section class="feldgruppe">
            <div class="feldkopf"><div>
              <h2><span class="feldnr">${f.nr}</span> · ${esc(f.name)}</h2>
              <p>${esc(f.leitfrage)}</p>
            </div></div>
            <div class="kacheln">${treffer.map(kachel).join("")}</div>
          </section>`;
      }).join("");
      ziel.innerHTML = html || `<p class="hinweis" style="margin-top:32px">Keine Labs gefunden.</p>`;
    }

    root.querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => {
      aktivesFeld = b.dataset.feld;
      root.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      zeichnen();
    }));
    root.querySelector(".suche").addEventListener("input", (e) => { suchbegriff = e.target.value; zeichnen(); });
    zeichnen();
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
            </div>`).join("") : `<p class="leer">Noch keine Einträge.</p>`}
        </div>`;
    }).join("");

    const roadmapLink = esc(formUrl(cfg, "roadmap-eintrag.yml", { lab: lab.id, title: `[Roadmap] ${lab.name}: ` }));
    const infoLink = esc(formUrl(cfg, "lab-info.yml", { lab: lab.id, title: `[Lab-Info] ${lab.name}` }));

    root.innerHTML = `
      ${topbar(cfg)}
      <header class="hero"><div class="wrap">
        ${heroBild()}
        <div class="hero-inhalt">
          <a class="zurueck" href="index.html#labs">← Alle Labs</a>
          <p class="eyebrow">Themenfeld ${lab.feld ? `${lab.feld.nr} · ${esc(lab.feld.name)}` : ""}</p>
          <h1>${esc(lab.name)}</h1>
          <div class="lab-meta"><span>${esc(lab.heimat)}</span>${badge(lab.status)}</div>
          <p class="lead" style="margin-top:22px">${esc(lab.kurz)}</p>
          ${lab.hinweis ? `<p class="hinweis" style="margin-top:20px">${esc(lab.hinweis)}</p>` : ""}
          <div class="aktionen">
            <a class="btn" ${extern} href="${roadmapLink}">+ Roadmap-Eintrag vorschlagen</a>
            <a class="btn sekundaer" ${extern} href="${infoLink}">Lab-Infos aktualisieren</a>
          </div>
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
            ${!(lab.leitung || []).length ? `<div class="person leer-person"><div class="rolle">Lab-Leitung</div><div class="name">Noch nicht hinterlegt</div>
              <a class="firma" ${extern} href="${infoLink}">Jetzt ergänzen →</a></div>` : ""}
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
            : `<p class="hinweis">Noch keine Ziele 2027 hinterlegt. <a href="${infoLink}" ${extern}>Ziele ergänzen →</a></p>`}
        </section>

        <section class="block">
          <p class="eyebrow">Roadmap</p>
          <h2>Roadmap 2027</h2>
          <p class="unter">Meilensteine pro Quartal. Neue Einträge kommen über das Formular und erscheinen nach Freigabe durch den Bereich KI.</p>
          <div class="roadmap">${spalten}</div>
          <div class="aktionen"><a class="btn" ${extern} href="${roadmapLink}">+ Roadmap-Eintrag vorschlagen</a></div>
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
