# 🌵 Nourish Phoenix

**Food Access + Diabetes Prevention Navigator for Phoenix's Native American Community and all underserved Maricopa County residents.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-terracotta)](https://yourusername.github.io/nourish-phoenix)

---

## What it does

Nourish Phoenix is a free, open-source public health tool that maps:

- 🟠 **Food apartheid zones** — low-income census tracts where residents live >1 mile from a supermarket (USDA definition), with severity ratings
- 🟢 **SNAP-accepting grocery stores** — full-service grocers that accept EBT/food stamps
- 🟡 **Native health clinics** — NATIVE HEALTH Phoenix, Phoenix Indian Medical Center (IHS), and other Native-focused health services
- 🔵 **Food pantries** — emergency food resources including the Inter Tribal Council's urban FDPIR site
- 🔵 **Transit corridors** — Valley Metro Light Rail routes for car-free access

It also includes a **diabetes risk self-check** that routes high-risk users — especially Native Americans, who face 2.3× higher diabetes risk — to free local prevention programs.

### Why "food apartheid" and not "food desert"?
Many Indigenous health advocates prefer "food apartheid" because the lack of grocery access in these communities is a **policy-driven, systemic injustice** — not a natural geographic feature. This tool uses both terms and explains the distinction.

---

## Public health context

- 43% of urban Native Americans in Arizona live in low food access areas
- Native Americans experience diabetes at 2.3× the rate of the general US population
- 71% of Native Americans now live in urban areas — but most food/health programs target reservations
- ~50,000+ Native Americans live in Maricopa County
- The SDPI (Special Diabetes Program for Indians) has clinical evidence of reducing diabetes risk by 58%

---

## Deploy to GitHub Pages (5 minutes)

This is a **pure static site** — no server, no build step, no API keys required.

### Step 1 — Create a GitHub repo

```bash
git init
git add .
git commit -m "Initial Nourish Phoenix"
git remote add origin https://github.com/YOUR_USERNAME/nourish-phoenix.git
git push -u origin main
```

### Step 2 — Enable GitHub Pages

1. Go to your repo on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select `main` branch and `/ (root)` folder
4. Click **Save**

Your site will be live at:
```
https://YOUR_USERNAME.github.io/nourish-phoenix
```

(Takes ~60 seconds to deploy after pushing.)

### Step 3 — Update the GitHub link in index.html

In `index.html`, find:
```html
<a href="https://github.com/yourusername/nourish-phoenix" ...>
```
Replace `yourusername` with your actual GitHub username.

---

## Keeping data current

All data lives in two files — no database needed:

### `data/resources.js`
Add, edit, or remove clinics, pantries, and grocery stores. Each entry needs:
```js
{
  id: 'unique-id',           // lowercase, no spaces
  type: 'clinic',            // 'clinic', 'pantry', or 'grocery'
  name: 'Resource Name',
  desc: 'Description...',
  addr: 'Full address',
  phone: '(602) 555-0000',
  url: 'https://website.org',
  tags: ['native', 'free'],  // any combo of: native, free, snap, transit
  lat: 33.4484,              // from Google Maps (right-click → copy coords)
  lng: -112.0740,
}
```

### `data/zones.js`
Food apartheid zone polygons. Uses bounding boxes `[[south, west], [north, east]]`.
Severity: `1` = moderate, `2` = high, `3` = severe.

To find bounding box coordinates: Google Maps → right-click corners of the area → copy coordinates.

---

## Data sources

| Layer | Source |
|-------|--------|
| Food apartheid zones | [USDA Food Access Research Atlas](https://www.ers.usda.gov/data-products/food-access-research-atlas/) |
| Census tract demographics | [US Census Bureau ACS](https://data.census.gov) |
| SNAP-eligible stores | [USDA SNAP Retailer Locator](https://www.fns.usda.gov/snap/retailer-locator) |
| Native health clinics | [IHS Facility Locator](https://www.ihs.gov/findhealthcare/) + NATIVE HEALTH Phoenix |
| Food pantries | [AZ Food Bank Network](https://www.azfoodbanks.org) + St. Mary's Food Bank |
| Transit | [Valley Metro GTFS](https://www.valleymetro.org/maps-schedules/gtfs) |
| Map tiles | [CartoDB Dark Matter](https://carto.com/basemaps/) via OpenStreetMap |

---

## Tech stack

- **Zero dependencies to install** — pure HTML/CSS/JS
- **[Leaflet.js](https://leafletjs.com/)** — open-source interactive maps (loaded from CDN)
- **CartoDB Dark Matter** — dark map tiles (free, no API key)
- **Google Fonts** — Playfair Display + DM Sans (free)
- **GitHub Pages** — free hosting

No API keys. No backend. No build process. Just `git push`.

---

## Contributing

Pull requests welcome. Especially valuable:

- **Updated resource data** — hours, phone numbers, new pantries or clinics
- **Additional food apartheid zones** — with USDA ERS data citations
- **Language support** — Yaqui (Hiaki), O'odham, Spanish translations
- **Accessibility** — screen reader improvements, keyboard navigation

Please open an issue before large changes.

---

## Community partners

This tool was built to support and complement the work of:

- [NATIVE HEALTH Phoenix](https://nativehealthphoenix.org) — (602) 279-5262
- [Inter Tribal Council of Arizona](https://itcaonline.com)
- [Phoenix Indian Medical Center (IHS)](https://www.ihs.gov/phoenix/)
- [St. Mary's Food Bank](https://firstfoodbank.org)
- [Native Connections](https://nativeconnections.org)

---

## License

MIT — free to use, fork, and adapt for other cities.

If you adapt this for another city or community, please open a PR to add it to this README so others can find it.
