# YAF Outing guide

The participant guide for the YAF Outing on Sat 14 Nov 2026, as a static page on GitHub Pages: <https://samyipsh.github.io/yaf-outing-2026/>. It's sent to participants on WhatsApp and kept up to date if plans change on the day.

- `index.html`: the guide. The timeline, scoring, the photo app link and the link to the Types of Christ answers.
- `types.html`: the Types of Christ answers, locked with a password given out at the results.
- `style.css`: shared by both pages.

## Changing the guide

Edit `index.html` and push to `main`. Pages publishes it within a minute or two, and phones may keep the old copy for up to 10 minutes. Keep it short: the timeline and scoring only. Station rules are on the cards at each station, and each group's stops are in the photo app, which follows any change to the round times. Station points are drawn as bars to scale; if the number of groups changes, change the ladder too.

The source of truth for the event is the committee's Google Doc (Participant guide tab). Change both.

## Changing the Types of Christ answers

The answers are stored encrypted in `types.html`, so they can't be read from this public repo before the results. Ask Sam for the password, then:

```sh
TYPES_PASSWORD=… node tools/types.mjs decrypt   # writes types.src.html (not committed)
# edit types.src.html
TYPES_PASSWORD=… node tools/types.mjs encrypt   # locks it back into types.html
```

Commit `types.html` only. `encrypt` refuses a password that doesn't open the current page, so a typo can't lock the answers for good. Scripture quotes are exact KJV, and each type uses only the link the New Testament itself draws.

Bible references are links to the passage in the KJV on BibleGateway (`<a class="ref" href="https://www.biblegateway.com/passage/?search=Hebrews%207%3A3&amp;version=KJV" target="_blank" rel="noopener">Hebrews 7:3</a>`). On the page, tapping one shows its verses in a box with a link to BibleGateway. The verses come from a `kjv` block at the end of `types.src.html`: after adding or changing a reference, run `python3 tools/verses.py` (it fetches them from BibleGateway), then `encrypt`.
