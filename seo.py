#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gereedschap voor de SEO-gegevens van OostersLicht.

Per pagina staat dezelfde tekst op meerdere plekken: de titel ook in
og:title, de description ook in og:description, de canonical ook in og:url.
Met de hand loopt dat uit elkaar. Dit script controleert dat het klopt, en
kan de titels en descriptions van alle pagina's tegelijk bewerken via één
tabel.

    python seo.py controleer    kijkt alles na, verandert niets
    python seo.py bewerken      exporteert en opent de tabel meteen in Excel
    python seo.py export        schrijft seo.tsv, zonder hem te openen
    python seo.py toepassen     leest seo.tsv terug de HTML in
    python seo.py sitemap       werkt de lastmod-datums bij; een pagina met
                                wijzigingen die nog niet gecommit zijn krijgt
                                de datum van vandaag

Alleen de standaardbibliotheek, dus er valt niets te installeren.
"""

import datetime
import glob
import html
import io
import json
import os
import re
import subprocess
import sys

BASIS = "https://www.oosterslicht.nl/"
TABEL = "seo.tsv"

# Google kapt af op pixelbreedte, niet op een vast aantal tekens; deze
# grenzen zijn de gebruikelijke vuistregels en bedoeld als signaal, niet
# als wet.
TITEL_MAX = 60
DESC_MIN = 70
DESC_MAX = 155


# --------------------------------------------------------------------------
# Lezen
# --------------------------------------------------------------------------

def lees(pad):
    """Leest een bestand zonder de regeleindes aan te passen."""
    with io.open(pad, encoding="utf-8", newline="") as f:
        return f.read()


def schrijf(pad, tekst):
    with io.open(pad, "w", encoding="utf-8", newline="") as f:
        f.write(tekst)


def _een(patroon, bron):
    m = re.search(patroon, bron)
    return m.group(1) if m else None


def gegevens(pad):
    """Haalt de SEO-velden uit een pagina. Tekst komt eruit zoals een
    bezoeker hem ziet: &amp; wordt & en &mdash; wordt een kwart-kastlijn."""
    s = lees(pad)
    d = {
        "bestand": os.path.basename(pad),
        "titel": _een(r"<title>(.*?)</title>", s),
        "description": _een(r'<meta name="description" content="(.*?)">', s),
        "og_titel": _een(r'<meta property="og:title" content="(.*?)">', s),
        "og_description": _een(r'<meta property="og:description" content="(.*?)">', s),
        "canonical": _een(r'<link rel="canonical" href="(.*?)">', s),
        "og_url": _een(r'<meta property="og:url" content="(.*?)">', s),
        "robots": _een(r'<meta name="robots" content="(.*?)">', s),
        "h1": len(re.findall(r"<h1[\s>]", s)),
        "img_zonder_alt": [t for t in re.findall(r"<img [^>]*>", s) if "alt=" not in t],
        "bron": s,
    }
    for k in ("titel", "description", "og_titel", "og_description"):
        if d[k] is not None:
            d[k] = html.unescape(d[k])
    d["indexeerbaar"] = not (d["robots"] and "noindex" in d["robots"])
    return d


def paginas():
    """Alle pagina's met een titel, op alfabet."""
    uit = []
    for pad in sorted(glob.glob("*.html")):
        d = gegevens(pad)
        if d["titel"]:
            uit.append(d)
    return uit


def verwachte_url(bestand):
    return BASIS if bestand == "index.html" else BASIS + bestand


# --------------------------------------------------------------------------
# Controleren
# --------------------------------------------------------------------------

class Meldingen(object):
    def __init__(self):
        self.fouten = []
        self.waarschuwingen = []

    def fout(self, waar, tekst):
        self.fouten.append((waar, tekst))

    def let_op(self, waar, tekst):
        self.waarschuwingen.append((waar, tekst))


def controleer_pagina(d, m):
    b = d["bestand"]

    # De titel en og:title horen hetzelfde te zeggen; staan ze uit elkaar,
    # dan ziet een bezoeker iets anders in Google dan op Facebook.
    if d["og_titel"] is not None and d["og_titel"] != d["titel"]:
        m.fout(b, "titel en og:title verschillen")

    # De og:description mag korter zijn dan de description: in een
    # gedeelde link is er minder ruimte, en op deze site staat daar
    # bewust een kortere zin. Langer dan de description is wel verdacht,
    # want dan is er ergens een oude tekst blijven staan.
    if d["description"] and d["og_description"] is None:
        m.let_op(b, "wel een description, geen og:description")
    elif (d["og_description"] and d["description"]
          and len(d["og_description"]) > len(d["description"])):
        m.let_op(b, "og:description is langer dan de description; "
                    "staat daar nog een oude tekst?")
    if d["canonical"] and d["og_url"] and d["canonical"] != d["og_url"]:
        m.fout(b, "canonical en og:url verschillen")

    if d["h1"] != 1:
        m.fout(b, "%d keer een h1 (dat hoort er precies een te zijn)" % d["h1"])
    for tag in d["img_zonder_alt"]:
        m.fout(b, "afbeelding zonder alt: " + tag[:70])

    if not d["indexeerbaar"]:
        # Een pagina op noindex hoeft geen nette description of canonical;
        # hij komt toch niet in een zoekresultaat terecht.
        return

    if not d["canonical"]:
        m.fout(b, "geen canonical")
    elif d["canonical"] != verwachte_url(b):
        m.fout(b, "canonical wijst naar %s in plaats van %s"
               % (d["canonical"], verwachte_url(b)))

    n = len(d["titel"])
    if n > TITEL_MAX:
        m.let_op(b, "titel is %d tekens; boven de %d kapt Google af" % (n, TITEL_MAX))

    if not d["description"]:
        m.fout(b, "geen description")
    else:
        n = len(d["description"])
        if n > DESC_MAX:
            m.let_op(b, "description is %d tekens; boven de %d valt de staart weg"
                     % (n, DESC_MAX))
        elif n < DESC_MIN:
            m.let_op(b, "description is %d tekens; onder de %d blijft ruimte onbenut"
                     % (n, DESC_MIN))


def controleer_dubbel(lijst, m):
    """Twee pagina's met dezelfde titel laten Google kiezen welke hij toont.
    Dat is een keuze die je zelf wilt maken."""
    for veld, naam in (("titel", "titel"), ("description", "description")):
        gezien = {}
        for d in lijst:
            if not d["indexeerbaar"] or not d[veld]:
                continue
            gezien.setdefault(d[veld], []).append(d["bestand"])
        for waarde, waar in gezien.items():
            if len(waar) > 1:
                m.fout(", ".join(waar), "delen dezelfde %s: %s" % (naam, waarde[:60]))


def controleer_schema(d, m):
    """Elk blok moet geldige JSON zijn, en een @id-verwijzing zonder
    definitie op dezelfde pagina is een knoop die nergens op slaat."""
    b = d["bestand"]
    blokken = re.findall(
        r'<script type="application/ld\+json">(.*?)</script>', d["bron"], re.S)
    for blok in blokken:
        try:
            json.loads(blok)
        except ValueError as e:
            m.fout(b, "ongeldige JSON-LD: %s" % e)

    for ident in set(re.findall(r'"@id": "([^"]+)"', d["bron"])):
        definities = re.findall(
            r'"@type": "[^"]+",\s*\n\s*"@id": "%s"' % re.escape(ident), d["bron"])
        if not definities:
            m.fout(b, "verwijst naar %s maar definieert hem nergens" % ident)


def _git(*args):
    uit = subprocess.check_output(["git"] + list(args), stderr=subprocess.STDOUT)
    return uit.decode("utf-8", "replace").strip()


def git_datum(bestand):
    """De datum waarop een pagina voor het laatst veranderd is.

    Heeft het bestand wijzigingen die nog niet gecommit zijn, dan is dat
    vandaag. Zo kan de sitemap bijgewerkt worden vóór de commit, en gaan de
    pagina en de sitemap in dezelfde commit mee. Anders de datum van de
    laatste commit waarin het bestand zat."""
    try:
        if _git("status", "--porcelain", "--", bestand):
            return datetime.date.today().isoformat()
        return _git("log", "-1", "--format=%ad", "--date=short", "--", bestand)
    except Exception:
        return ""


def sitemap_regels():
    if not os.path.exists("sitemap.xml"):
        return []
    s = lees("sitemap.xml")
    return re.findall(r"<loc>([^<]*)</loc>\s*(?:<lastmod>([^<]*)</lastmod>)?", s)


def controleer_sitemap(lijst, m):
    in_sitemap = dict((url, datum) for url, datum in sitemap_regels())
    if not in_sitemap:
        m.fout("sitemap.xml", "niet gevonden of leeg")
        return

    for d in lijst:
        url = verwachte_url(d["bestand"])
        if d["indexeerbaar"] and url not in in_sitemap:
            m.fout("sitemap.xml", "%s ontbreekt" % d["bestand"])
        if not d["indexeerbaar"] and url in in_sitemap:
            m.fout("sitemap.xml", "%s staat erin maar is noindex" % d["bestand"])

    for url, datum in in_sitemap.items():
        bestand = url[len(BASIS):] or "index.html"
        if not os.path.exists(bestand):
            m.fout("sitemap.xml", "%s bestaat niet" % url)
            continue
        echt = git_datum(bestand)
        if datum and echt and echt > datum:
            m.let_op("sitemap.xml", "%s: lastmod %s, laatste wijziging %s"
                     % (bestand, datum, echt))


def opdracht_controleer():
    lijst = paginas()
    m = Meldingen()
    for d in lijst:
        controleer_pagina(d, m)
        controleer_schema(d, m)
    controleer_dubbel(lijst, m)
    controleer_sitemap(lijst, m)

    for waar, tekst in m.fouten:
        print("FOUT  %-24s %s" % (waar, tekst))
    for waar, tekst in m.waarschuwingen:
        print("let op  %-22s %s" % (waar, tekst))

    print()
    print("%d pagina's nagekeken, waarvan %d indexeerbaar."
          % (len(lijst), sum(1 for d in lijst if d["indexeerbaar"])))
    print("%d fouten, %d waarschuwingen." % (len(m.fouten), len(m.waarschuwingen)))
    return 1 if m.fouten else 0


# --------------------------------------------------------------------------
# Exporteren en toepassen
# --------------------------------------------------------------------------

KOPPEN = ["bestand", "indexeerbaar", "titel", "tekens", "description", "tekens.",
          "og:description"]


def zoek_excel():
    """Windows koppelt .tsv niet aan Excel -- dubbelklikken opent Kladblok.
    Daarom Excel zelf opzoeken. Eerst de plekken waar hij gewoonlijk staat,
    dan wat het register zegt."""
    kandidaten = [
        r"C:\Program Files\Microsoft Office\root\Office16\EXCEL.EXE",
        r"C:\Program Files (x86)\Microsoft Office\root\Office16\EXCEL.EXE",
        r"C:\Program Files\Microsoft Office\Office16\EXCEL.EXE",
    ]
    for pad in kandidaten:
        if os.path.exists(pad):
            return pad
    try:
        sleutel = (r"HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion"
                   r"\App Paths\excel.exe")
        uit = subprocess.check_output(["reg", "query", sleutel, "/ve"],
                                      stderr=subprocess.STDOUT)
        uit = uit.decode("utf-8", "replace")
        m = re.search(r"REG_SZ\s+(.+\.EXE)", uit, re.I)
        if m and os.path.exists(m.group(1).strip()):
            return m.group(1).strip()
    except Exception:
        pass
    return None


def opdracht_bewerken():
    """Exporteren en meteen openen, want los van elkaar zijn ze onhandig."""
    opdracht_export()
    excel = zoek_excel()
    if excel:
        subprocess.Popen([excel, os.path.abspath(TABEL)])
        print()
        print("Excel wordt geopend. Bewerk de kolommen titel, description en")
        print("og:description, sla op met Ctrl+S (behoud de tab-indeling als")
        print("Excel daarnaar vraagt) en draai daarna: python seo.py toepassen")
    else:
        try:
            os.startfile(os.path.abspath(TABEL))
            print("Geopend met het standaardprogramma voor .tsv.")
        except Exception:
            print("Excel niet gevonden; open %s zelf." % TABEL)
    return 0


def opdracht_export():
    regels = ["\t".join(KOPPEN)]
    for d in paginas():
        regels.append("\t".join([
            d["bestand"],
            "ja" if d["indexeerbaar"] else "nee",
            d["titel"] or "",
            str(len(d["titel"] or "")),
            d["description"] or "",
            str(len(d["description"] or "")),
            d["og_description"] or "",
        ]))
    schrijf(TABEL, "\n".join(regels) + "\n")
    print("%s geschreven: %d pagina's." % (TABEL, len(regels) - 1))
    print("Bewerk de kolommen titel, description en og:description,")
    print("daarna: python seo.py toepassen")
    return 0


def naar_html(tekst):
    """Alleen wat echt moet. Een apostrof in "productpagina's" hoeft niet
    ontsnapt te worden en zou als &#x27; alleen maar lelijk staan in de bron;
    de pagina is UTF-8, dus een kastlijn mag gewoon een kastlijn blijven."""
    return (tekst.replace("&", "&amp;")
                 .replace("<", "&lt;")
                 .replace(">", "&gt;")
                 .replace('"', "&quot;"))


def _vervang(s, patroon, waarde, sjabloon):
    """Vervangt een tag, maar alleen als de tekst werkelijk anders is.

    Anders zou een ongewijzigde rij toch het bestand aanraken: &mdash; in de
    bron wordt bij het uitlezen een kastlijn, en die zou er als kaal teken
    weer in geschreven worden. Dat is geen verbetering, alleen ruis in de
    diff -- en het maakt niet zichtbaar wat je wel echt hebt veranderd."""
    m = re.search(patroon, s)
    if not m:
        return s
    if html.unescape(m.group(1)) == waarde:
        return s
    return s[:m.start()] + sjabloon % naar_html(waarde) + s[m.end():]


def opdracht_toepassen():
    if not os.path.exists(TABEL):
        print("Geen %s gevonden. Draai eerst: python seo.py export" % TABEL)
        return 1

    regels = lees(TABEL).replace("\r\n", "\n").strip("\n").split("\n")
    aangepast = []
    for regel in regels[1:]:
        velden = regel.split("\t")
        if len(velden) < 5:
            continue
        bestand, _, titel, _, description = velden[:5]
        og_description = velden[6] if len(velden) > 6 else ""
        if not os.path.exists(bestand):
            print("overgeslagen: %s bestaat niet" % bestand)
            continue

        s = origineel = lees(bestand)

        # De titel staat op twee plekken en hoort daar hetzelfde te zeggen,
        # dus die gaan samen. De og:description heeft een eigen kolom: op
        # deze site staat daar bewust een kortere zin, en die mag niet
        # overschreven worden door de lange description.
        s = _vervang(s, r"<title>(.*?)</title>", titel,
                     "<title>%s</title>")
        s = _vervang(s, r'<meta property="og:title" content="(.*?)">', titel,
                     '<meta property="og:title" content="%s">')
        if description:
            s = _vervang(s, r'<meta name="description" content="(.*?)">', description,
                         '<meta name="description" content="%s">')
        if og_description:
            s = _vervang(s, r'<meta property="og:description" content="(.*?)">',
                         og_description,
                         '<meta property="og:description" content="%s">')

        if s != origineel:
            schrijf(bestand, s)
            aangepast.append(bestand)

    if aangepast:
        print("aangepast: %s" % ", ".join(aangepast))
    else:
        print("niets gewijzigd.")
    print("Controleer daarna met: python seo.py controleer")
    return 0


# --------------------------------------------------------------------------
# Sitemap
# --------------------------------------------------------------------------

def opdracht_sitemap():
    s = lees("sitemap.xml")
    bijgewerkt = []
    s = re.sub(r"<loc>([^<]*)</loc>(\s*)<lastmod>([^<]*)</lastmod>",
               lambda mo: vervang_hulp(mo, bijgewerkt), s)
    schrijf("sitemap.xml", s)
    if bijgewerkt:
        print("\n".join(bijgewerkt))
    else:
        print("alle datums klopten al.")
    return 0


def vervang_hulp(mo, bijgewerkt):
    url, tussen, oud = mo.group(1), mo.group(2), mo.group(3)
    bestand = url[len(BASIS):] or "index.html"
    nieuw = git_datum(bestand)
    if nieuw and nieuw != oud:
        bijgewerkt.append("%s: %s -> %s" % (bestand, oud, nieuw))
        return "<loc>%s</loc>%s<lastmod>%s</lastmod>" % (url, tussen, nieuw)
    return mo.group(0)


# --------------------------------------------------------------------------

OPDRACHTEN = {
    "controleer": opdracht_controleer,
    "bewerken": opdracht_bewerken,
    "export": opdracht_export,
    "toepassen": opdracht_toepassen,
    "sitemap": opdracht_sitemap,
}


def main():
    # De Windows-console staat standaard niet op UTF-8, en dan komt een
    # kastlijn of een e-met-accent er als vraagtekens uit.
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

    if len(sys.argv) < 2 or sys.argv[1] not in OPDRACHTEN:
        print(__doc__.strip())
        return 2
    return OPDRACHTEN[sys.argv[1]]()


if __name__ == "__main__":
    sys.exit(main())
