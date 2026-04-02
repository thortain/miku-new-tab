# 🎀 Miku New Tab — Firefox Extension

A Hatsune Miku themed new tab page with widgets.

## Installation

### Temporary Install (for testing)
1. Open Firefox
2. Go to `about:debugging#/runtime/this-firefox`
3. Click **"Load Temporary Add-on..."**
4. Navigate to this folder and select `manifest.json`

### Permanent Install
1. Zip the extension folder:
   ```
   cd /mnt/u/Lucrecia/miku-newtab/extension
   zip -r ../miku-newtab.xpi *
   ```
2. Sign via [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/) or use [web-ext](https://extensionworkshop.com/documentation/getting-started/what-is-a-web-extension/):
   ```
   web-ext sign --api-key=YOUR_API_KEY --api-secret=YOUR_API_SECRET
   ```

## Features
- 🕐 Clock with glowing neon text
- 🔍 Google search
- 🌤️ Weather widget (auto-detects location)
- 🍅 Pomodoro timer
- 📝 Quick notes (saved locally)
- ⚡ Quick links (YouTube, Twitter, Reddit, GitHub)
- 🎵 Now Playing placeholder
- 💻 System stats
- ✨ Floating particles & animated music bars

## Structure
```
extension/
├── manifest.json   # Extension manifest
├── index.html      # New tab page
└── icons/          # Extension icons
    ├── icon-48.png
    ├── icon-96.png
    └── icon-128.png
```

## Customization
Edit `index.html` to change:
- Quick links (search for `quick-link`)
- Colors (CSS variables at top)
- Widgets (the widgets-grid section)
- Weather location (modify the wttr.in URL)
