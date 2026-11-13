# YAF Outing guide

The participant guide for the YAF Outing on Sat 14 Nov 2026, as a static page on GitHub Pages: <https://samyipsh.github.io/yaf-outing-2026/>. It's sent to participants on WhatsApp and kept up to date if plans change on the day.

- `index.html`: the guide. Timeline, how the morning works, photo quest, what to bring, safety.
- `types.html`: the Types of Christ answers, locked with a password given out at the results.
- `style.css`: shared by both pages.

## Changing the guide

Edit `index.html`, update the "Last updated" line at the bottom, and push to `main`. Pages publishes it within a minute or two. Keep it short: the timeline and the basic rules only. Station rules are on the cards at each station, and each group's stops are in the photo app, which follows any change to the round times.

The source of truth for the event is the committee's Google Doc (Participant guide tab). Change both.

## Changing the Types of Christ answers

The answers are stored encrypted in `types.html`, so they can't be read from this public repo before the results. Ask Sam for the password, then:

```sh
TYPES_PASSWORD=… node tools/types.mjs decrypt   # writes types.src.html (not committed)
# edit types.src.html
TYPES_PASSWORD=… node tools/types.mjs encrypt   # locks it back into types.html
```

Commit `types.html` only. Scripture quotes are exact KJV, and each type uses only the link the New Testament itself draws.
