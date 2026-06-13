# 🔨 Whack-a-Isaac

A real, replayable arcade game — with Isaac as the mole. Built to send to your brother.

## Put Isaac's actual face on the moles (recommended)

The game can use a real photo of Isaac for the pop-up heads. To bake one in:

1. Open **`WhackAIsaac.html`** in a browser (just double-click it).
2. On the start screen click **📷 Add Isaac's photo** and pick his picture. It auto-crops to a circle and shrinks it.
3. Click **⬇️ Download ready-to-send file**. This produces **`WhackAIsaac-ready.html`** with his face baked right in.
4. Send **`WhackAIsaac-ready.html`** to Isaac. It's a single self-contained file — works offline, no install.

No photo? You can send `WhackAIsaac.html` as-is and it falls back to a cartoon Isaac.

## How to use it

1. Send your brother the file (text, email, AirDrop — whatever).
2. He double-clicks it. It opens in any web browser. No install, no internet needed.
3. He gets hooked and (gently) roasted — by his own face.

## How to play

Isaac heads pop out of holes — **click or tap them** to score. You get **30 seconds**.

| Pop-up | Worth |
| --- | --- |
| 🙂 **Isaac** | +1 |
| ✨ **Golden Isaac** | +5 (rare!) |
| 😠 **Mom** | **–3** — do NOT whack Mom |

- **Combo multiplier:** keep landing hits quickly to build `x2`, `x3`… up to `x9`. Pause too long and it resets.
- **It speeds up:** heads pop faster and stay visible for less time as the clock runs down.
- **High score** is saved on his device, so there's always one more run.
- The **game-over screen roasts him** based on his score.
- Full **sound effects** (whacks, jingles) — no external files.

Works on desktop (mouse) and phones/tablets (touch).

## Want to tweak it?

Open `WhackAIsaac.html` in any text editor:

- **`GAME_SECONDS`** — round length.
- **`TYPES`** — point values, spawn weights, and the SVG faces. Add your own characters.
- **`roastFor()`** — the game-over insults, keyed by score.
- **`isaacFace()`** — tweak skin/hair/shirt colors to make the moles actually look like Isaac.

Enjoy. 🔨
