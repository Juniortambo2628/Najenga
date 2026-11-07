# Najenga launch: brief

**What it is:** a ~40s launch video for Najenga, a construction project-management app for Kenya. 9:16 (main) and 16:9.

**The one thing:** Najenga keeps the money, the site, the paperwork and the people in one calm place.

**Device:** each thing Najenga files (a receipt, a photo, a plan, a person) becomes one more floor of a house on the desk; the finished house slams into the real dashboard. Red (#B3122E) marks only what Najenga has filed.

**Format:** fixed stage, voice-led (the voice is the clock), one hard cut (the slam). Story formats F2 (fixed stage) family; no morph bridges.

**Style:** `styles/najenga-iso`: the skill's isometric kit in Najenga's colours (paper #FBF9F7, warm-grey hairlines, accent #B3122E), from `frontend/okjt.config.js`.

**Voice:** ElevenLabs, Keith (warm East African narrator), eleven_v4, one take per line. Word times heard by faster-whisper.

| id | line |
|---|---|
| open | Building is never just bricks. |
| mess | It's receipts in a pocket, photos in a chat, plans in a drawer, and a spreadsheet nobody trusts. |
| money | Send a receipt on WhatsApp. It's read, checked, and filed to its project. |
| site | Site photos are dated and kept, week by week. |
| files | Plans and permits wait in folders, right where you left them. |
| team | And everyone gets the right say. |
| calm | The money, the site, the paperwork and the people, in one calm place. |
| name | Najenga. I'm building. |

**Beats:** foundation → the mess piles up → receipt read on the phone, floor 1 → photos dated, floor 2 → folders, floor 3 → owner/editor/viewer, roof → hold (silence) → SLAM: real Expenses then Analytics screens → the card lands in the laptop; logo, "I'm building."

**Sound:** composed in code, C major, 120 BPM, under the voice at −12 dB. Thin → 8th groove → 16ths at the roof → dry stop, ~1.1s silence → chord stab + sub on the slam (loudest) → flat chord → opening pad and the house motif (rising fifth) on "Najenga".

**Real product UI:** `assets/expenses.webp`, `assets/analytics.webp` (from `public/marketing/`), `assets/logo.webp` (from `public/Najenga-logos/`). Demo data, as on the marketing site.

## Claims and sources

| claim (spoken or on screen) | source |
|---|---|
| Receipts sent on WhatsApp are read, checked and filed to a project | `frontend/src/content/marketing.js` (Money) |
| Site photos dated and kept with their project | `frontend/src/content/marketing.js` (Site) |
| Plans and permits in folders per project | `frontend/src/content/marketing.js` (Files) |
| Owner, editor and viewer roles | `frontend/src/content/marketing.js` (Team) |
| "One calm place" | `frontend/src` landing copy: "keeps the money, the site, the paperwork and the people in one calm place" |
| "Najenga" means "I'm building" | Swahili *-jenga* "to build", 1st person present *najenga/ninajenga*: [Wiktionary: jenga](https://kiwix.lema.org/wiktionary_en_all_maxi_2024-01/A/jenga), [Habari Leo](https://habarileo.co.tz/jifunze-kiswahili-91/) |
