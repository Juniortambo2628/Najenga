# Najenga launch: log

## Run 1 (2026-11-07)
- Intake: one calm place; 9:16 + 16:9; ElevenLabs voice (Keith); isometric in Najenga red; real screens; score in code; no hero (the house is the constant).
- Story approved as drafted. Look: four rounds of style frames: enlarged props, fixed a stray gable line, moved the final laptop clear of the house, swapped the Overview screen (0 photos, 0 documents) for Analytics.
- Voice: 8 lines, 39.6s. faster-whisper failed on a PyAV version mismatch; voice_words.py now decodes with ffmpeg (77/78 words heard).
- Storyboard approved (9 panels).
- Build/review 1: the loudest window was the logo motif (35.3s), not the slam; goodbye didn't decay; captions' second line under the 9:16 UI; five still stretches.
- Fixes: a sub and a stronger stab on the slam, a quieter calm chord and ending; captions up to y 1350; word-cued events (more slips on "pocket"/"drawer", the spreadsheet crossed out on "trusts", a red check on "checked", photo and folder cards that fly into their floors, chimney smoke); a slow camera push (≤7%) through each section.
- 16:9: two captions ran off the right edge; the caption column moved to x 0.675, 54px.

## Review (final)
| check | 9:16 | 16:9 |
|---|---|---|
| cut on the grid (the slam, 28.5s) | PASS | PASS |
| narration density ≤ 3.5 w/s, word hits | PASS | PASS |
| loudest 100ms window | 28.5s, the slam (−9.8 dBFS) | same mix |
| silence before it | 1.0s ≤ −40 dBFS | same |
| story arc | 6/7 (the "peak has the most cuts" rule doesn't apply to a no-cut fixed stage) | 6/7 |
| loudness | −14.3 LUFS, true peak −2.1 dBFS | same |
| text cut off / overlapping / under the UI | PASS (0) | PASS (0) |
| dead beats (>3s with little pixel change) | WARN: 5.3–11.0s (the mess: small hairline props), 12.0–15.3s, 36.8–40.0s | WARN, similar |

| shot | verdict |
|---|---|
| 1 foundation | PASS |
| 2 mess | PASS, weakest: busy but small at phone size; bigger props or a closer camera would read faster |
| 3 receipt, floor 1 | PASS |
| 4 photos, floor 2 | PASS |
| 5 folders, floor 3 | PASS |
| 6 team, roof | PASS |
| 7 hold (silence) | PASS |
| 8 slam: real Expenses → Analytics | PASS (real screens are demo data and small on a phone) |
| 9 name | PASS |

Not verified: how the score sounds (measured only). The real screens show demo data with 0 photos and 0 documents.
