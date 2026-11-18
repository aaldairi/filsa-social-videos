# Filsa video motion standard (motion v2)

From 2026-11-18 every Filsa marketing video follows the motion guidance in
[kylezantos/design-motion-principles](https://github.com/kylezantos/design-motion-principles)
(Emil Kowalski, Jakub Krehel and Jhey Tompkins lenses). Abdulla asked for it: "use this for the animation on Marketing video".

The rules are built into Motion Studio (`/mnt/project-files/motion-studio/filsa-motion-studio.html`, marker `MOTION v2`),
so every render made with `render.js` follows them. The patch that applied them is
`/mnt/project-files/motion-studio/motion-v2-patch.js` (idempotent; the pre-v2 studio is kept as
`filsa-motion-studio.pre-motion-v2.html`).

## Weighting

Marketing video for a finance product: **Jakub primary** (subtle, production polish), **Jhey secondary**
(one expressive hero moment per video, such as a stamp or the logo build), **Emil as the gate**
("should this move at all?": no decorative loops, no bounce on everyday UI).

The app's own rule (UI under 300 ms) stays for the app. Video scenes may use 450 to 600 ms entrances,
because a viewer watches them once, but never longer than the moment needs.

## Rules

| Area | Rule | In the studio |
|---|---|---|
| Easing | Never plain ease. Arrivals use a strong ease-out, things changing while visible use ease-in-out, exits use ease-in. | `eOut` = cubic-bezier(.23, 1, .32, 1), `eInOut` = (.77, 0, .175, 1), `eIn` = (.55, 0, .75, .3) |
| Springs | Bounce 0 everywhere. No overshoot: bounce reads as playful, and Filsa is about money. | `eSpring` (critically damped); the old overshoot `eBack` now points to it |
| Pop-ins | Never scale from 0. Chips, pills and cards come in at scale .9 with an opacity fade. | `popIn(k)` |
| Scene enter | Opacity, a short rise (28 px at 1080) and blur 10 px to sharp: the scene "comes into focus". Blur only on the scene visual, never on text. | `render()` |
| Scene exit | Quicker and smaller than the entrance: 300 ms, lift 12 px, blur 4 px, no zoom. | `render()` |
| Text | Opacity and a 18 px rise on the no-bounce spring, lines 60 ms apart. Exit is a fade with an 8 px lift. | `drawText()` |
| Loops | No decorative loops: no twinkling, pulsing, bobbing, blinking or "breathing" elements. The background stars drift slowly but no longer twinkle. | removed everywhere |
| Allowed loops | Only loops that carry meaning: the voice waveform while someone speaks, a typing caret. | kept |
| Stagger | One deliberate stagger per scene, not on every list. Narrative reveals (rows arriving one by one) may be slower than UI stagger. | per scene |
| Hero moment | At most one expressive moment per video (a stamp, the logo build, the sticker). Everything else stays quiet. | per video |
| Comfort | No large zooms, spins or parallax. No flashing. (A rendered video has no reduced-motion setting, so it must be calm by default.) | |

## The test

If a viewer notices the animation instead of the feature, it is too much. The best compliment is
"that felt smooth", not "cool animation".

## Checklist for a new video

1. Build scenes with `ap(lt, start, dur, eOut | eInOut | eSpring)`; pop things in with `popIn(k)`.
2. No `Math.sin(t ...)` on anything that is not a waveform or caret.
3. One hero moment, named in the video's entry.
4. Render all 4 sizes (9:16, 1:1, 4:5, 16:9) in EN and AR with `render.js`, then look at a frame grid before posting.
