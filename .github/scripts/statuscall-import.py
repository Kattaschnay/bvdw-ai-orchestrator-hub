#!/usr/bin/env python3
"""
Liest das Word-Dokument „Agenda_Statuscall_KI.docx“ und schreibt data/statuscalls.json.
Jeder fett gesetzte Datums-Absatz (z. B. „23.Oktober 2026“, „31.07.2026“) beginnt einen neuen Termin.

Aufruf:  python3 .github/scripts/statuscall-import.py Pfad/zu/Agenda_Statuscall_KI.docx
Benötigt: pip install python-docx
"""
import json, re, sys
from pathlib import Path
from docx import Document
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph

MONATE = {m: i + 1 for i, m in enumerate(
    ["januar", "februar", "märz", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "dezember"])}

def datum_erkennen(text, vorheriges):
    """vorheriges = ISO-Datum des zuletzt erkannten Termins (Dokument ist absteigend sortiert)."""
    t = text.strip()
    m = re.match(r"^(\d{1,2})\.\s*(\d{1,2})\.(\d{4})\b\s*[–-]?\s*(.*)$", t)
    if m:
        return f"{m[3]}-{int(m[2]):02d}-{int(m[1]):02d}", m[4].strip()
    m = re.match(r"^(\d{1,2})\.\s*([A-Za-zÄÖÜäöü]+)\s+(\d{4})\b\s*[–-]?\s*(.*)$", t)
    if m and m[2].lower() in MONATE:
        return f"{m[3]}-{MONATE[m[2].lower()]:02d}-{int(m[1]):02d}", m[4].strip()
    m = re.match(r"^Agenda Statuscall.*?(\d{1,2})\.(\d{1,2})\.?$", t)
    if m and vorheriges:
        jahr = int(vorheriges[:4])
        kandidat = f"{jahr}-{int(m[2]):02d}-{int(m[1]):02d}"
        if kandidat >= vorheriges:  # Jahr fehlt: liegt vor dem vorherigen Termin
            kandidat = f"{jahr - 1}-{int(m[2]):02d}-{int(m[1]):02d}"
        return kandidat, ""
    return None

def absatz_text(el, doc):
    """Text eines Absatzes mit Links als [Text](URL) und Zeilenumbrüchen."""
    teile = []
    for kind in el.iterchildren():
        if kind.tag == qn("w:r"):
            teile.append(lauf_text(kind))
        elif kind.tag == qn("w:hyperlink"):
            txt = "".join(lauf_text(r) for r in kind.iter(qn("w:r")))
            rid = kind.get(qn("r:id"))
            url = doc.part.rels[rid].target_ref if rid and rid in doc.part.rels else ""
            url = url.strip()
            if url and txt.strip() and url.strip() != txt.strip():
                teile.append(f"[{txt.strip()}]({url.replace(' ', '%20')})")
            else:
                teile.append(txt or url)
    return "".join(teile).replace(" ", " ").strip()

def lauf_text(r):
    out = []
    for k in r.iterchildren():
        if k.tag == qn("w:t"):
            out.append(k.text or "")
        elif k.tag in (qn("w:br"), qn("w:cr")):
            out.append("\n")
        elif k.tag == qn("w:tab"):
            out.append(" ")
    return "".join(out)

def ist_fett(p):
    runs = [r for r in p.runs if r.text.strip()]
    return bool(runs) and all(r.bold or (r.style and r.style.font.bold) for r in runs)

def ebene(el):
    np = el.find(".//" + qn("w:numPr"))
    if np is None:
        return None
    il = np.find(qn("w:ilvl"))
    return int(il.get(qn("w:val"))) if il is not None else 0

def zelle_text(zelle, doc):
    return "\n".join(t for t in (absatz_text(p._p, doc) for p in zelle.paragraphs) if t)

def main(pfad):
    doc = Document(pfad)
    termine, aktuell, vorheriges = [], None, None
    for el in doc.element.body.iterchildren():
        if el.tag == qn("w:p"):
            p = Paragraph(el, doc)
            text = absatz_text(el, doc)
            if not text:
                continue
            fett = ist_fett(p)
            if fett:
                d = datum_erkennen(p.text, vorheriges)
                if d:
                    vorheriges = d[0]
                    aktuell = {"datum": d[0], "titel": d[1] or "Statuscall KI", "bloecke": []}
                    termine.append(aktuell)
                    continue
            if aktuell is None:
                continue
            stil = (p.style.name or "").lower()
            lv = ebene(el)
            if stil.startswith("heading"):
                aktuell["bloecke"].append({"t": "h", "text": re.sub(r"^\d+\s+", "", text)})
            elif lv is not None:
                aktuell["bloecke"].append({"t": "li", "lvl": lv, "text": text, "b": fett})
            else:
                aktuell["bloecke"].append({"t": "h" if fett and len(text) < 90 and "\n" not in text else "p", "text": text})
        elif el.tag == qn("w:tbl") and aktuell is not None:
            tb = Table(el, doc)
            zeilen = []
            for r in tb.rows:
                zellen = []
                for c in r.cells:
                    t = zelle_text(c, doc)
                    if not zellen or t != zellen[-1]:
                        zellen.append(t)
                if any(zellen):
                    zeilen.append(zellen)
            if zeilen:
                aktuell["bloecke"].append({"t": "tab", "zeilen": zeilen})
    termine.sort(key=lambda t: t["datum"], reverse=True)
    ziel = Path(__file__).resolve().parents[2] / "data" / "statuscalls.json"
    ziel.write_text(json.dumps({"termine": termine}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(termine)} Termine nach {ziel} geschrieben")
    for t in termine:
        print(" ", t["datum"], t["titel"], len(t["bloecke"]), "Blöcke")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "Agenda_Statuscall_KI.docx")
