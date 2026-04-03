# Miku New Tab — Extension Code Review

**Extension root:** `/mnt/u/Lucrecia/miku-newtab/`
**Files reviewed:** `manifest.json`, `index.html`, `script.js`, `extension/manifest.json`
**Node syntax check:** `script.js` passes `node --check` ✓

---

## Root Cause: Why clock shows `00:00` and widgets don't work

The **primary cause** of both symptoms is **Bug #1 (missing host_permissions)** below. In Firefox Manifest V3, `fetch()` calls from an extension page to external origins are blocked by default. All widgets that make network requests (weather, crypto, currency, joke, fact, games, news, D&D spells/monsters) silently fail. The clock showing `00:00` is a secondary symptom: the script's `updateClock()` runs fine, but without understanding the full execution context (CSP + missing permissions), the clock appearing frozen could indicate the page never fully initialized or the interval was never started due to a preceding silent failure.

---

## CRITICAL

### Bug #1 — `manifest.json`: No `host_permissions` for any external API

**File:** `manifest.json` (root), lines 10–11
```json
"permissions": [],
"host_permissions": []
```

**Problem:** `script.js` makes `fetch()` calls to 11 external origins. In Manifest V3, extension pages have no cross-origin network access by default. All of these fail silently:

| Widget | URL |
|--------|-----|
| weather | `wttr.in` |
| crypto | `api.coingecko.com` |
| currency | `api.frankfurter.app` |
| joke | `official-joke-api.appspot.com` |
| fact | `uselessfacts.jsph.pl` |
| games | `www.freetogame.com` |
| D&D spell | `www.dnd5eapi.co` |
| D&D monster | `www.dnd5eapi.co` |
| news | `hacker-news.firebaseio.com` (×2) |

**Fix:** Add all required hosts to `host_permissions`:
```json
"host_permissions": [
  "https://wttr.in/",
  "https://api.coingecko.com/",
  "https://api.frankfurter.app/",
  "https://official-joke-api.appspot.com/",
  "https://uselessfacts.jsph.pl/",
  "https://www.freetogame.com/",
  "https://www.dnd5eapi.co/",
  "https://hacker-news.firebaseio.com/"
]
```

---

### Bug #2 — `extension/manifest.json`: Overly restrictive CSP blocks script execution

**File:** `extension/manifest.json`, lines 15–17
```json
"content_security_policy": {
  "extension_pages": "script-src 'self' 'unsafe-inline'; object-src 'self'"
}
```

**Problem:** This CSP allows `'self'` and `'unsafe-inline'`, but in the context of a new tab extension page (`chrome://` URL), the `'self'` origin resolves to a very restricted context. External API calls via `fetch()` are also blocked under this CSP unless host permissions are separately declared. Additionally, the CSP does not whitelist any external origins needed by widgets (fonts, APIs).

**Fix:** Either remove the `content_security_policy` field entirely (letting the default Manifest V3 CSP apply, which at least allows `fetch` with proper host permissions), or explicitly allow the API origins:
```json
"content_security_policy": {
  "extension_pages": "script-src 'self' 'unsafe-inline'; connect-src https://wttr.in https://api.coingecko.com https://api.frankfurter.app https://official-joke-api.appspot.com https://uselessfacts.jsph.pl https://www.freetogame.com https://www.dnd5eapi.co https://hacker-news.firebaseio.com; font-src https://fonts.gstatic.com; object-src 'self'"
}
```

---

## HIGH

### Bug #3 — `script.js`, line 50 (countdown tick): Stale interval ID after countdown reaches zero

```javascript
// line 50 — inside tick()
if(diff<=0){
  el.querySelector('#cdT').textContent='00:00:00';
  el.querySelector('#cdL').textContent="IT'S TIME!";
  clearInterval(iv);   // clears the interval...
  return;               // ...but does NOT set iv=null!
}
```

**Problem:** When the countdown reaches zero, `clearInterval(iv)` is called but `iv` is never set to `null`. Then, when the user clicks **Set** again, line 52:
```javascript
if(!iv)iv=setInterval(tick,1000);
```
evaluates `!iv` as `false` (because `iv` still holds the stale interval ID, which is truthy), so no new interval is created. The old (stopped) interval object remains in `iv` and `tick()` is never called again.

**Fix:** Add `iv=null;` inside the `diff<=0` block:
```javascript
if(diff<=0){
  el.querySelector('#cdT').textContent='00:00:00';
  el.querySelector('#cdL').textContent="IT'S TIME!";
  clearInterval(iv);
  iv=null;   // ← add this
  return;
}
```

---

### Bug #4 — `script.js` (renderWidgets drag system): Document event listeners accumulate indefinitely

**File:** `script.js`, lines 107–108
```javascript
document.addEventListener('mousemove', e => { ... });
document.addEventListener('mouseup', () => { ... });
```

**Problem:** `renderWidgets()` is called on every widget-add operation (via `openAddModal`). Every call adds **new** `mousemove` and `mouseup` listeners to `document`. These are never removed. After adding/removing several widgets, many duplicate listeners accumulate. When dragging ANY widget, ALL accumulated `mousemove` handlers fire, each updating `card.style.left/top` — causing jittery, incorrect positioning. Memory usage also grows unboundedly.

**Fix:** Use named functions and explicitly remove them, or track and remove previous listeners:
```javascript
// Store handlers so they can be removed
let _currentMousemove = null;
let _currentMouseup = null;

function startDrag(card, item) {
  if (_currentMousemove) document.removeEventListener('mousemove', _currentMousemove);
  if (_currentMouseup) document.removeEventListener('mouseup', _currentMouseup);

  _currentMousemove = (e) => { ... };
  _currentMouseup = () => { ... };

  document.addEventListener('mousemove', _currentMousemove);
  document.addEventListener('mouseup', _currentMouseup);
}
```

---

## MEDIUM

### Bug #5 — `index.html`, `<head>`: CSP meta tag blocks Google Fonts and all external resources

**File:** `index.html`, line 4
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com;">
```

**Problem:** The `default-src 'self'` directive blocks ALL cross-origin resource loading unless explicitly allowed. This includes the Google Fonts `@import` in the `<style>` block, which will silently fail. Users will see fallback fonts instead of Quicksand/Nunito.

**Fix:** Either move Google Fonts import to the CSP's `style-src` (already partially done but overridden by `default-src`), or use a `<link rel="preconnect">` + `<link>` approach and update CSP:
```html
<!-- In <head>, update CSP meta tag: -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com https://fonts.googleapis.com; connect-src https://wttr.in https://api.coingecko.com https://api.frankfurter.app https://official-joke-api.appspot.com https://uselessfacts.jsph.pl https://www.freetogame.com https://www.dnd5eapi.co https://hacker-news.firebaseio.com;">
```

Note: In Firefox extensions, the CSP meta tag is overridden by the manifest's CSP (if defined). However, for maximum compatibility, ensure consistency between the meta tag and the manifest CSP.

---

### Bug #6 — `script.js` (weather widget): No defensive check on `wttr.in` response structure

**File:** `script.js`, line 22
```javascript
const c = d.current_condition[0];
const wd = c.weatherDesc[0].value.toLowerCase();
```

**Problem:** The code accesses `d.current_condition[0]` and `c.weatherDesc[0]` without verifying these exist or are arrays. If the API returns an unexpected structure (e.g., empty `current_condition`), this throws `TypeError: Cannot read property '0' of undefined`, which is caught by the catch block — but the user only sees "Unavailable" without knowing the actual failure.

**Fix:** Add defensive checks:
```javascript
if (!d.current_condition || !d.current_condition[0]) throw new Error('Invalid weather data');
const c = d.current_condition[0];
if (!c.weatherDesc || !c.weatherDesc[0]) throw new Error('Missing weather description');
```

---

### Bug #7 — `script.js` (crypto widget): Wrong API property path for 24h change

**File:** `script.js`, line 57
```javascript
const c = (data.gbp_24h_change || 0).toFixed(1);
```

**Problem:** CoinGecko's `simple/price` endpoint returns `gbp_24h_change` as a top-level field in the response object (e.g., `d.bitcoin.gbp_24h_change`). The code accesses `data.gbp_24h_change` (looking at the `data` object directly) rather than `data.bitcoin.gbp_24h_change`. Since `data.gbp_24h_change` is always `undefined` for this endpoint, the fallback `0` is always used, so the 24h change is always shown as `+0.0%` / `-0.0%`.

**Fix:**
```javascript
const c = (data.gbp_24h_change !== undefined ? data.gbp_24h_change : 0).toFixed(1);
```
Or better, access the correct nested path if CoinGecko returns it differently for GBP prices.

---

### Bug #8 — `script.js` (pomodoro tick): Timer stops silently at 00:00 — `clearInterval` called but interval ID not nulled

**File:** `script.js`, line 38 (inside `tick` for pomodoro)
```javascript
if(pom.rem<=0){
  pom.run=false;
  pom.rem=pom.dur;
  clearInterval(pom.iv);
  pom.iv=null;         // ← correctly nulled here (good)
  el.querySelector('#pStart').textContent='Start'
}
```

**Status:** Actually correctly handled in pomodoro (unlike countdown). The `pomodoro` widget properly sets `pom.iv=null` inside the `if(pom.rem<=0)` block. This is **NOT a bug** for pomodoro. The bug is **only in countdown** (Bug #3).

---

## LOW

### Bug #9 — `index.html`: Duplicate/unused CSS classes in decal HTML

**File:** `index.html`, decals section

Several decal `<div>` elements use non-existent CSS classes:
- `<div class="decal-ring decal-ring-1">` — `.decal-ring` class doesn't exist in CSS; only `.decal-ring-1` is defined
- `<div class="decal decal-note" ...>` — `.decal` class doesn't exist; only `.decal-note` is defined
- `<div class="decal-headphones decal-h-l">` — `.decal-headphones` doesn't exist
- `<div class="decal-vinyl decal-v-r">` — `.decal-vinyl` doesn't exist
- `<div class="decal-soundbars decal-sb-l">` — `.decal-soundbars` doesn't exist
- `<div class="decal-eq decal-eq-r">` — `.decal-eq` doesn't exist

**Problem:** These extra class names have no CSS rules and create confusion about the intended structure. No functional impact.

**Fix:** Remove unused class names; keep only the class that has CSS rules.

---

### Bug #10 — `script.js` (quicklinks): Global `FAV` object is not scoped

**File:** `script.js`, line 8
```javascript
const FAV={'youtube.com':'▶', ...};
```

**Problem:** `FAV` is declared as a `const` in the module scope of the `quicklinks.render` function. Since `render` is called once per quicklinks widget instance, this is fine for a single widget. However, if multiple quicklinks widgets were ever added (which `unique:true` prevents), each call to `render` would re-declare `FAV` in the same scope, causing a `SyntaxError: Identifier 'FAV' has already been declared`.

**Fix:** Wrap the entire `quicklinks.render` function body in an IIFE, or move `FAV` and `DEFAULTS` outside the render function but inside the widget definition.

---

### Bug #11 — `script.js` (D&D spell/monster): Random ID range may hit non-existent entries

**File:** `script.js`, lines 60 (spell) and 62 (monster)
```javascript
const id = Math.floor(Math.random()*300+1);  // 1–300
```

**Problem:** The D&D 5e API has ~328 spells and ~300+ monsters. A random ID between 1–300 will occasionally hit retired or non-existent entries that return `{ error: true }`. The spell widget checks `if(d.error)throw new Error()` and shows "Unavailable" — but the monster widget does the same. This causes a poor user experience (shows "Unavailable" for a random failure).

**Fix:** Use a known-good list of IDs, or retry with a new random ID when an error is received:
```javascript
async function fetchRandomSpell() {
  for (let i = 0; i < 5; i++) {
    const id = Math.floor(Math.random()*300+1);
    const r = await fetch('https://www.dnd5eapi.co/api/spells/'+id);
    const d = await r.json();
    if (!d.error) return d;
  }
  throw new Error('No valid spell found');
}
```

---

## Summary Table

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | CRITICAL | `manifest.json` | Missing `host_permissions` — all fetch calls blocked |
| 2 | CRITICAL | `extension/manifest.json` | Overly restrictive CSP |
| 3 | HIGH | `script.js:50` | `countdown`: stale `iv` after countdown ends — timer can't restart |
| 4 | HIGH | `script.js:107–108` | Drag event listeners accumulate; memory leak + jittery dragging |
| 5 | MEDIUM | `index.html` | CSP meta tag blocks Google Fonts |
| 6 | MEDIUM | `script.js:22` | Weather: no defensive check on API response structure |
| 7 | MEDIUM | `script.js:57` | Crypto: wrong property path for 24h change — always shows `±0.0%` |
| 8 | LOW | `index.html` | Duplicate/non-existent CSS class names on decal elements |
| 9 | LOW | `script.js` | `quicklinks`: `FAV`/`DEFAULTS` not in safe IIFE scope |
| 10 | LOW | `script.js` | D&D spell/monster: random ID may hit retired API entries |

## Things That Are Working Correctly

- **`manifest.json`**: Valid Manifest V3 structure. `chrome_url_overrides.newtab` is correct.
- **`index.html`**: All DOM IDs referenced in JS (`#clock`, `#date`, `#searchInput`, `#widget-canvas`, `#add-widget-modal`, `#particles`, `#editModeBtn`, `#addWidgetBtn`, `#closeModalBtn`, `#modalGrid`) exist in the HTML.
- **`script.js`**: Passes `node --check`. No syntax errors.
- **All localStorage keys**: Consistent (`miku-links`, `miku-notes`, `miku-cd`, `miku-widget-layout`) across read/write sites.
- **Pomodoro timer**: Correctly nulls interval ID after reaching zero (unlike countdown).
- **Quicklinks add/remove**: Logic is sound, DOM IDs are unique per widget instance.
- **Countdown date overflow**: Correctly handles past dates by incrementing to next year.
