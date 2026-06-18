# scripts

## Regenerating the CMS editor guide

`docs/Scope-Screenings-CMS-Guide.docx` is a brand-styled, multi-page guide for
non-technical editors, with an **annotated screenshot per section** (numbered
pins on the real page elements) plus a field legend.

It's generated in two steps - re-run both whenever the site design or the CMS
fields change, so the screenshots and field lists stay current:

```bash
# 1. Capture annotated per-section screenshots (needs the site running locally).
npm run build && PORT=3137 npm start &          # or: PORT=3137 npm run dev &
node .shots/capture-cms-guide.mjs               # writes .shots/guide/*.png
# (optional) shrink the PNGs so the .docx stays small, still crisp at full width:
for f in .shots/guide/*.png; do sips --resampleWidth 1600 "$f" >/dev/null; done

# 2. Build the .docx from those screenshots + the field legends.
python3 -m pip install --quiet python-docx       # first time only
python3 scripts/build-cms-guide.py               # writes docs/Scope-Screenings-CMS-Guide.docx
```

- **Capture script:** `.shots/capture-cms-guide.mjs` - drives Playwright, finds
  each editable element (by CSS-module class or distinctive text), drops the
  numbered pins, and screenshots each section. The hero is captured with
  reduced-motion so the curtains are open and the wordmark is visible. If you
  rename a field's seeded text or restructure a section, update that section's
  `text`/`css` locators there.
- **Doc generator:** `scripts/build-cms-guide.py` - embeds `.shots/guide/<Section>.png`
  and the numbered legend for each section. Edit the `SECTIONS` list there to
  change wording, legends, or which fields are described. Brand fonts are Aachen
  Bold (headings) + Libre Franklin (body); the header logo is `public/popcorn-logo.png`.
- The `.shots/guide/*.png` files are regenerable artifacts (not committed); the
  built `.docx` is committed as the deliverable.
