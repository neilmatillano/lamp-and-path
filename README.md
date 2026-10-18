# Le Sentier

A daily Bible reading plan with one Old Testament and one New Testament passage every day.
Installable web app (PWA): static files, no build step, works offline.

- `index.html` — page structure and styles
- `app.js` — the app: verse-count data, plan maths, screens, backup, install prompts
- `sw.js` — service worker; keeps the app and its fonts on the device for offline use
- `manifest.webmanifest`, `icons/` — install metadata and home-screen icons
- `vercel.json` — cache headers so updates reach installed copies

## Deploy

From this folder: `npx vercel --prod` (first time: log in, accept the defaults,
framework "Other", no build command). Or push to a GitHub repo and import it in Vercel.

## Updating

When you change `index.html` or `app.js`, also change `VERSION` in `sw.js` (any new value).
That is how installed copies learn a new version exists; they then show a "Reload" banner.

## Data

The app is in English or French; the EN/FR button in the header switches language.

Progress is stored in the browser on each device (localStorage key `lamp-path-plans-v2`; the
older single-plan key `lamp-path-plan-v1` is migrated on first open and left in place).
Settings › Backup saves and restores a `.json` file with every plan, to move progress between devices.

## Plans and groups

Each device can keep several plans (chips under the header switch between them), each with its
own schedule and ticks. Settings › Read with a group turns a plan into a group plan and gives an
invite link (`/#join=<code>`). The code is the group's id, name and schedule in base64url JSON; it
never contains anyone's ticks, and there is no server. People who open the link get the same
schedule as a locked plan and tick it off privately. If the leader changes the schedule, the new
link offers members an update. On iPhone, links open in Safari rather than the installed app, so
members paste the link under Settings › Your plans › Join a group.

Verse counts follow modern English Bibles (NIV/ESV): 23,145 OT and 7,958 NT verses.
