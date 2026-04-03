# Firefox Manifest V3 Extension Research

_For the miku-newtab extension — new tab override with inline scripts, external API calls (wttr.in, dnd5eapi.co, coingecko.com), localStorage, and async widget render functions._

---

## 1. Firefox MV3 Restrictions vs Chrome

### Inline Scripts

**Blocked in MV3 across both Firefox and Chrome.** Neither browser allows inline `<script>` tags or inline event handlers in extension pages (`extension_pages`). This is a hard CSP restriction, not a browser-specific quirk.

**Your inline JavaScript in the HTML new tab page is the primary MV3 migration problem.** All inline `<script>` blocks must be moved to external `.js` files and loaded via `src="/path/to/script.js"`.

Workaround: **Use a bundler** (Vite, esbuild, webpack) to inline the code at build time and generate a hash, then reference it in manifest.json. Firefox MV3 CSP does support `'sha256-...'` hashes in `script-src`, but this is painful to maintain manually — a bundler is much more practical.

### CSP Policy for extension_pages

Firefox MV3 enforces a strict default CSP for `extension_pages`:

```
script-src 'self'; object-src 'self'
```

Key restrictions:
- **No remote script URLs** (`https://cdn.example.com/script.js` is blocked in `script-src`)
- **No `unsafe-eval`** (even if you add it to manifest.json, it's ignored)
- **No `unsafe-inline`** for scripts in MV3 — this is enforced by the browser regardless of what you put in `content_security_policy` in manifest.json

For your new tab override page, if it's loaded as `moz-extension://.../newtab.html`, it falls under `extension_pages` and gets the strict CSP.

### External Fetch Calls (wttr.in, dnd5eapi.co, coingecko.com)

This is where Firefox MV3 diverges from Chrome **in your favor**:

- In Firefox, background scripts (Event Pages) retain full access to Web APIs including `fetch()` and `XMLHttpRequest`, without needing extra host permissions for the target URLs
- However, **host permissions in `host_permissions` are now required for `fetch()` from content scripts and from the extension's background context when targeting those origins** — at least in principle starting Firefox 127
- For API-only calls (not modifying host data), you can also use the `permissions` array with `"<all_urls>"` or specific host patterns

**For your specific APIs**, add these to `manifest.json`:

```json
"host_permissions": [
  "https://wttr.in/*",
  "https://*.dnd5eapi.co/*",
  "https://*.coingecko.com/*"
]
```

Or use broader permissions:

```json
"permissions": [
  "https://*/*"
]
```

**Note:** In Firefox 126 and earlier, host permissions defined in `host_permissions` were NOT automatically granted at install time — users had to grant them manually. From Firefox 127+, they are shown in the install prompt and granted on install. Since your extension targets current Firefox (115+), test carefully on the permission flow.

**Firefox-specific advantage over Chrome:** Firefox MV3 background scripts are **Event Pages** (persistent but non-blocking), NOT service workers like Chrome. This means:
- No 30-second timeout on background tasks
- No service worker lifecycle issues
- `localStorage` and all Web APIs remain available without service worker restrictions
- Background scripts stay alive while events are being handled

---

## 2. Firefox Extension Debugging

### Opening the Extension Debugger

1. Navigate to **`about:debugging#/runtime/this-firefox`** (or just `about:debugging` → click **This Firefox** in the left sidebar)
2. Find your extension under **Extensions**
3. Click **Inspect** next to your extension's entry

This opens the **Developer Tools Toolbox** for the extension.

### What Each Tab Gives You

| Tab | What it shows |
|-----|---------------|
| **Console** | `console.log()`, errors, warnings, browser messages from extension scripts. Also has an interactive JS command line |
| **Debugger** | Set breakpoints, step through JS, inspect variables and scope |
| **Inspector** | View/edit HTML/CSS of extension pages |
| **Storage** | Inspect `localStorage`, `sessionStorage`, IndexedDB, cookies for the extension |

### Debugging Different Extension Parts

**Background scripts (or Event Page):**
- Open `about:debugging` → **This Firefox** → click **Inspect** next to the extension
- Console and Debugger both work here
- For **Event Pages** specifically: the page is unloaded when idle. Keep the Toolbox open to prevent the background script from going idle (makes breakpoints work reliably)

**New tab override page (`extension_pages`):**
- After loading your new tab, go to `about:debugging` → **This Firefox** → **Inspect** on your extension
- Switch to the **Storage** tab in the Toolbox — this shows the extension's storage including `localStorage`
- You can also set breakpoints in JS files loaded by the new tab page

**Content scripts (if any):**
- Open the regular page DevTools (`Ctrl+Shift+I`)
- Go to the **Debugger** tab
- Content scripts may be hidden by default — click the **gear icon** in the Sources panel → enable **Show content scripts**
- `console.log()` from content scripts appears in the page's console, not in `about:debugging`

### Quick Debugging Tips

```js
// In any extension script (background, popup, newtab page):
console.log("debug info:", someVariable);
console.error("something went wrong:", error);

// Check localStorage
// In the Storage tab of about:debugging toolbox, expand Local Storage
// Or run in the Console: localStorage.getItem("widgetState")
```

**Important:** `console.log()` in background scripts appears in the Toolbox at `about:debugging`. If you're not seeing logs, make sure you have the right context selected in the Console dropdown (e.g., "Extension" or the specific frame).

---

## 3. Common MV3 Firefox Extension Failures

### 1. Inline Scripts (Most Common)
**Symptom:** Page loads blank, or you see a CSP error like:
```
Content Security Policy: Directive 'script-src' encountered an unknown host 'unsafe-inline' or a hash violation
```
**Fix:** Move all `<script>...</script>` blocks to external `.js` files. Load them with `<script src="..."></script>` in the HTML.

### 2. Background Scripts vs Event Pages
**Symptom:** Background script doesn't load, or logs aren't appearing.
**Fix:** In MV3 Firefox, background scripts run as **Event Pages** (non-persistent). Make sure:
- Listeners are at the **top level** of the script (not inside async functions)
- Use `browser.runtime.onInstalled.addListener()` for initialization
- The background page unloads when idle — if you need it alive for debugging, keep the Toolbox open

**Manifest key:**
```json
"background": {
  "scripts": ["background.js"],
  "type": "module"  // optional, if using ES modules
}
```
Note: `"persistent": true` is not supported in MV3 (it's ignored in Firefox MV3).

### 3. Host Permissions Not Granted
**Symptom:** `fetch()` to external API fails silently (no network error, no response).
**Fix:** Add the target hosts to `host_permissions` in `manifest.json`. If the user denied the permission, use `browser.permissions.request()` at runtime to request it.

### 4. `browser_style: true` Removed
**Symptom:** Popup/options page looks broken or styles are missing.
**Fix:** Remove `"browser_style": true` from `action`, `options_ui`, `sidebar_action` keys in manifest.json. MV3 no longer supports this.

### 5. `tabs.executeScript()` / `tabs.insertCSS()` Removed
**Symptom:** Programmatically injecting content scripts no longer works.
**Fix:** Use the **Scripting API** (`browser.scripting.executeScript()`, `browser.scripting.insertCSS()`) instead. Requires adding `"scripting"` to `permissions`.

```js
// Old (MV2):
browser.tabs.executeScript(tabId, { file: "content.js" });

// New (MV3):
browser.scripting.executeScript({
  files: ["content.js"],
  target: { tabId: tabId }
});
```

### 6. Background Page State Not Persisting
**Symptom:** Widget state lost between events.
**Fix:** Event Pages unload, so `localStorage` in the background context won't persist across restarts the way it did with persistent background pages. Either:
- Read/write state from `localStorage` on every relevant event
- Use `browser.storage.local` (recommended) instead of `localStorage` for extension-managed state

### 7. `chrome.storage` vs `browser.storage`
**Symptom:** `chrome.storage` undefined errors.
**Fix:** Use `browser.storage.local` (the WebExtensions standard). Firefox supports both `browser.*` and `chrome.*` aliases in MV2, but some MV3 contexts only expose `browser.*`.

---

## 4. Key Docs and Links

| Topic | URL |
|-------|-----|
| Firefox MV3 Migration Guide | https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/ |
| Firefox Extension Debugging | https://extensionworkshop.com/documentation/develop/debugging/ |
| MDN: manifest.json content_security_policy | https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_security_policy |
| MDN: host_permissions | https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/host_permissions |
| MDN: background scripts (Event Pages) | https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Background_scripts |
| MDN: Scripting API | https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/scripting |
| Firefox MV3 Blog Post (Firefox 128) | https://blog.mozilla.org/addons/2024/07/10/manifest-v3-updates-landed-in-firefox-128/ |
| MV3 vs MV2 Update (March 2024) | https://blog.mozilla.org/addons/2024/03/13/manifest-v3-manifest-v2-march-2024-update/ |
| MDN: browser.permissions API | https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/permissions |
| about:debugging | `about:debugging#/runtime/this-firefox` |

---

## Action Plan for miku-newtab

Given the extension's structure (inline JS, external fetch APIs, localStorage), here's the priority order:

1. **Move all inline `<script>` blocks** in the new tab HTML to external files (e.g., `widgets/weather.js`, `widgets/dnd.js`, `widgets/crypto.js`, `widgets/main.js`). Load them via `<script src="..."></script>` in the HTML.

2. **Add `host_permissions`** for the three APIs to `manifest.json`.

3. **Replace `localStorage`** usage in background scripts with `browser.storage.local` for reliability across Event Page lifecycle.

4. **Test in `about:debugging`** — open the extension's Toolbox, check Console for CSP errors on first load.

5. **Verify API fetch calls** — check the Network tab in the Toolbox for failed requests (indicates missing permissions).

6. **If using `tabs.executeScript()` or `tabs.insertCSS()`**, migrate to the Scripting API with `"scripting"` permission added.
