# -*- coding: utf-8 -*-
"""
Build js/countries_data.js from GeoNames postal datasets.
Source: https://download.geonames.org/export/zip/{CC}.zip  (CC BY 4.0)

All files share the 12-column tab-separated format:
0 country, 1 zip, 2 city, 3 admin1 name, 4 admin1 code, 5 admin2 name,
6 admin2 code, 7/8 (unused), 9 lat, 10 lng, 11 accuracy

Output: window.ADDR_COUNTRIES = { CC: { regions: { CODE: {n: name, cities: [...] } }, hot: [...] } }
US keeps the large 80-cities-per-region cap (flagship dataset), other countries
get a quota-based top-N spread across regions.
"""
import collections
import json
import pathlib
import re
import shutil
import subprocess
import sys
import zipfile
from datetime import datetime

FORCE = "--force" in sys.argv

_WEIRD_REGION_KEY = re.compile(r"^L?\d{6,}$")
# postal-service / corporate service entries that pollute place names
_GARBAGE_SUBSTR = ["Дти", "ДТИ", "Fudosan", "Sumitomo", "Mitsui", "Biru", "Postfach",
                   "Packstation", "Filiale", "Niederlassung", "Geschäftsstelle",
                   "Briefzentrum", "Briefkasten", "GmbH", "Gesundheitskasse",
                   "Versicherung", "Spedition", "Logistik", "Logistics",
                   "Krankenhaus", "Bundeswehr", "Finanzamt"]


def _is_allcaps(name):
    """Corporate/institutional entries like 'AOK' - letters but no lowercase."""
    letters = [ch for ch in name if ch.isalpha()]
    return len(name) >= 3 and letters and all(not ch.islower() for ch in letters)


def _is_corporate(name):
    """Multi-word institutional names ('AOK Nordost Die Gesundheitskasse')."""
    if len(name.split()) > 4:
        return True
    return any(g.lower() in name.lower() for g in _GARBAGE_SUBSTR)

ROOT = pathlib.Path(__file__).resolve().parent.parent
TOOL = ROOT / "tools"
JS_OUT = ROOT / "js" / "countries_data.js"

COUNTRIES = ["US", "CA", "MX", "BR", "AR", "CL", "CO", "GB", "IE", "FR", "BE",
             "NL", "DE", "AT", "CH", "IT", "ES", "PT", "PL", "SE", "NO", "DK",
             "RU", "TR", "CN", "JP", "KR", "MY", "ID", "TH", "PH", "IN",
             "AE", "ZA", "NZ", "AU"]

ZIPS_PER_CITY = 5        # sample zip codes kept per city
US_CITIES_PER_REGION = 80
DEFAULT_QUOTA = 300      # total cities kept per (non-US) country
REGION_CAP = 80          # max cities of one region in the quota pool
_HOT_SUFFIX = re.compile(r"\b(County|District|Township|Parish|Prefecture|Division)\b")

# GeoNames US.zip lacks overseas territories and includes military AA/AE/AP;
# hand-curated territory city/zip maps (validated against the Census ZCTA
# gazetteer 2023_Gaz_zcta_national.txt, which supplies real coordinates).
US_EXCLUDED = {"AA", "AE", "AP", "", "MH"}
TERRITORIES = {
    "PR": {
        "San Juan": ["00901", "00907", "00909", "00911", "00912", "00915", "00917", "00918", "00920", "00921", "00923", "00925", "00926", "00927"],
        "Bayamon": ["00956", "00957", "00959", "00960", "00961"],
        "Carolina": ["00979", "00982", "00983", "00985", "00987"],
        "Ponce": ["00715", "00716", "00717", "00730", "00731"],
        "Caguas": ["00725", "00726", "00727"],
        "Mayaguez": ["00680", "00681", "00682"],
        "Arecibo": ["00612", "00613", "00614"],
        "Guaynabo": ["00965", "00966", "00968", "00969"],
        "Fajardo": ["00738", "00740"],
        "Humacao": ["00791", "00792"],
        "Aguadilla": ["00603", "00605"],
        "Rio Grande": ["00745"],
        "Cayey": ["00736", "00737"],
        "Manati": ["00674"],
        "Toa Baja": ["00949", "00951", "00952"],
        "Vega Baja": ["00693"],
        "Guayama": ["00784", "00785"],
        "Trujillo Alto": ["00976"],
        "Cidra": ["00739"],
        "Gurabo": ["00778"],
        "Juncos": ["00777"],
        "San Lorenzo": ["00754"],
        "Las Piedras": ["00771"],
        "Canovanas": ["00729"],
        "Loiza": ["00772"],
        "Naranjito": ["00719"],
        "Aibonito": ["00705"],
        "Barranquitas": ["00794"],
        "Comerio": ["00782"],
        "Corozal": ["00783"],
        "Coamo": ["00769"],
        "Yauco": ["00698"],
        "San German": ["00683"],
        "Cabo Rojo": ["00623"],
        "Dorado": ["00646"],
        "Isabela": ["00662"],
        "Juana Diaz": ["00795"],
        "Hatillo": ["00659"],
        "Camuy": ["00669"],
        "Barceloneta": ["00617"],
        "Adjuntas": ["00601"],
        "Aguada": ["00602"],
        "Anasco": ["00610"],
        "Guanica": ["00653"],
        "Guayanilla": ["00656"],
        "Lajas": ["00667"],
        "Luquillo": ["00773"],
        "Naguabo": ["00718"],
        "Patillas": ["00723"],
        "Quebradillas": ["00678"],
        "Arroyo": ["00714"],
        "Salinas": ["00751"],
        "Santa Isabel": ["00757"],
        "Villalba": ["00766"],
        "Culebra": ["00775"],
        "Vieques": ["00765"],
        "Jayuya": ["00664"],
        "Maricao": ["00606"],
        "Morovis": ["00687"],
        "Orocovis": ["00720"],
        "Toa Alta": ["00953"],
        "Aguas Buenas": ["00703"],
    },
    "GU": {
        "Hagatna": ["96910"],
        "Mangilao": ["96913"],
        "Santa Rita": ["96915"],
        "Chalan Pago": ["96928"],
        "Yigo": ["96929"],
    },
    "VI": {
        "Charlotte Amalie": ["00802", "00805"],
        "Christiansted": ["00820"],
        "Frederiksted": ["00840"],
        "Kingshill": ["00850", "00851"],
        "Cruz Bay": ["00830"],
    },
    "AS": {"Pago Pago": ["96799"]},
    "MP": {"Saipan": ["96950"], "Rota": ["96951"], "Tinian": ["96952"]},
}


def merge_us_territories(regions):
    zcta = {}
    gaz = TOOL / "2023_Gaz_zcta_national.txt"
    if gaz.exists():
        with gaz.open(encoding="utf-8") as f:
            f.readline()
            for line in f:
                cols = line.split()
                if len(cols) >= 7 and cols[0].isdigit() and len(cols[0]) == 5:
                    zcta[cols[0]] = (float(cols[5]), float(cols[6]))
    for st, citymap in TERRITORIES.items():
        reg = {"name": None, "cities": {}}
        for city, zips in citymap.items():
            valid = [z for z in zips if z in zcta]
            if not valid:
                continue
            lat = sum(zcta[z][0] for z in valid) / len(valid)
            lng = sum(zcta[z][1] for z in valid) / len(valid)
            c = reg["cities"].setdefault(city, {"zips": set(), "lat": [], "lng": []})
            c["zips"].update(valid)
            c["lat"].append(lat)
            c["lng"].append(lng)
        if reg["cities"]:
            regions[st] = reg
    return regions


def spread_indices(n, k):
    if n <= k:
        return list(range(n))
    return sorted({round(i * (n - 1) / (k - 1)) for i in range(k)})


def download(cc):
    """Download and extract {cc}.zip; return path to the txt file (or None)."""
    txt = TOOL / f"{cc}.txt"
    if not FORCE and txt.exists() and txt.stat().st_size > 1000 and _looks_like_postal(txt):
        return txt
    if FORCE and txt.exists():
        txt.unlink()
    zpath = TOOL / f"{cc}.zip"
    try:
        for attempt in range(3):
            r = subprocess.run(["curl", "-sfL", "-o", str(zpath),
                                f"https://download.geonames.org/export/zip/{cc}.zip"],
                               timeout=180)
            if r.returncode == 0 and zpath.exists() and zpath.stat().st_size >= 500:
                break
            import time
            time.sleep(3)
        else:
            return None
        with zipfile.ZipFile(zpath) as z:
            names = [m for m in z.namelist() if m.upper().endswith(".TXT")]
            # the archives also contain readme.txt - pick the country data file
            name = next((m for m in names if pathlib.Path(m).stem.upper() == cc), None)
            if not name:
                name = max(names, key=lambda m: z.getinfo(m).file_size)
            with z.open(name) as src, open(txt, "wb") as dst:
                shutil.copyfileobj(src, dst)
        if not _looks_like_postal(txt):
            txt.unlink()
            return None
        return txt
    except Exception as e:
        print(f"  !! {cc}: {e}")
        return None
    finally:
        if zpath.exists():
            zpath.unlink()


def _looks_like_postal(txt):
    """Postal lines look like: CC\\tZIP\\tCity\\t... (tab separated)."""
    try:
        with txt.open(encoding="utf-8-sig") as f:
            for line in f:
                if line.count("\t") >= 10:
                    return True
    except Exception:
        return False
    return False


def parse(cc):
    """Parse one country file -> {region_key: {name, cities: {city: {zips, lat[], lng[]}}}}"""
    txt = download(cc)
    if not txt:
        return None
    regions = {}
    with txt.open(encoding="utf-8-sig") as f:
        for line in f:
            cols = line.rstrip("\n").split("\t")
            if len(cols) < 11:
                continue
            zip_, city, rname, rcode = cols[1], cols[2], cols[3].strip(), cols[4].strip()
            if not zip_ or not city:
                continue
            if cc == "US" and (rcode in US_EXCLUDED or rname in US_EXCLUDED):
                continue
            try:
                lat, lng = float(cols[9]), float(cols[10])
            except ValueError:
                continue
            key = rcode or rname or cc
            if cc == "GB" and (key == "GB" or _WEIRD_REGION_KEY.match(key)):
                continue
            reg = regions.setdefault(key, {"name": rname or rcode or cc, "cities": {}})
            if _is_allcaps(city) or _is_corporate(city):
                continue  # corporate / postal-service entries
            c = reg["cities"].setdefault(city, {"zips": set(), "lat": [], "lng": []})
            c["zips"].add(zip_)
            c["lat"].append(lat)
            c["lng"].append(lng)
    if cc == "US":
        regions = merge_us_territories(regions)
    return regions


def build_country(cc, regions):
    """Fold parsed regions into the compact output structure."""
    ranked = []  # (zipcount, rkey, city, zips, lat, lng)
    for rkey, reg in regions.items():
        for cname, c in reg["cities"].items():
            ranked.append((len(c["zips"]), rkey, cname, sorted(c["zips"]),
                           sum(c["lat"]) / len(c["lat"]), sum(c["lng"]) / len(c["lng"])))

    def city_entry(e):
        zips = e[3]
        if len(zips) > ZIPS_PER_CITY:
            zips = [zips[i] for i in spread_indices(len(zips), ZIPS_PER_CITY)]
        return {"n": e[2], "z": zips, "c": [round(e[4], 4), round(e[5], 4)], "w": len(e[3])}

    picked = {}
    if cc == "US":
        # flagship dataset: up to 80 cities per region, all 56 regions preserved
        by_region = collections.defaultdict(list)
        for e in ranked:
            by_region[e[1]].append(e)
        for rkey, lst in by_region.items():
            top = sorted(lst, key=lambda x: (-x[0], x[2]))[:US_CITIES_PER_REGION]
            picked[rkey] = [city_entry(e) for e in sorted(top, key=lambda x: x[2])]
    else:
        # every region keeps its largest city, then fill the quota with the
        # biggest cities country-wide (each region capped at REGION_CAP)
        regions_sorted = collections.defaultdict(list)
        for e in ranked:
            regions_sorted[e[1]].append(e)
        for rkey, lst in regions_sorted.items():
            top = sorted(lst, key=lambda x: (-x[0], x[2]))[0]
            picked[rkey] = [city_entry(top)]
        quota = DEFAULT_QUOTA - len(picked)
        for e in sorted(ranked, key=lambda x: (-x[0], x[2])):
            if quota <= 0:
                break
            rkey = e[1]
            if len(picked[rkey]) >= REGION_CAP:
                continue
            if any(p["n"] == e[2] for p in picked[rkey]):
                continue
            picked[rkey].append(city_entry(e))
            quota -= 1

    regions_out = {}
    for rkey in sorted(picked):
        cities = sorted(picked[rkey], key=lambda x: x["n"])
        for c in cities:
            c.pop("w", None)
        regions_out[rkey] = {"n": regions[rkey]["name"], "cities": cities}

    ranked_all = sorted(ranked, key=lambda x: (-x[0], x[2]))
    # hot list: prefer plain city names over "X County / X District" admin units
    ranked_hot = [e for e in ranked_all if not _HOT_SUFFIX.search(e[2])] or ranked_all
    hot = [{"n": e[2], "r": e[1]} for e in ranked_hot[:16]]
    return {"regions": regions_out, "hot": hot}


out = {}
for cc in COUNTRIES:
    regions = parse(cc)
    if not regions:
        print(f"SKIP {cc}: no data")
        continue
    out[cc] = build_country(cc, regions)
    n_regions = len(out[cc]["regions"])
    n_cities = sum(len(r["cities"]) for r in out[cc]["regions"].values())
    print(f"OK {cc}: regions={n_regions} cities={n_cities}")

BUILD_TIME = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
JS_OUT.write_text(
    "/* Auto-generated by tools/build_data.py - DO NOT EDIT.\n"
    "   Source: GeoNames postal datasets https://download.geonames.org/export/zip/ (CC BY 4.0). */\n"
    f'window.ADDR_DATA_BUILD_TIME = "{BUILD_TIME}";\n'
    "window.ADDR_COUNTRIES = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n",
    encoding="utf-8")

total_c = sum(len(r["cities"]) for c in out.values() for r in c["regions"].values())
print(f"\n countries={len(out)} total_cities={total_c}")
print("bytes:", JS_OUT.stat().st_size)
