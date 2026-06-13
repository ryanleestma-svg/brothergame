# 🎉 Isaac's $1,000,000 Prize Claim

A harmless browser prank game built to mess with Isaac.

## How to use it

1. Send your brother **`IsaacsPrize.html`** (text it, email it, AirDrop it, etc.).
2. He double-clicks the file — it opens in any web browser. No install, no internet needed.
3. Watch the chaos.

## What happens

1. **The bait** — A flashy screen tells Isaac he's won **$1,000,000**. All he has to do is click the big gold button.
2. **The chase** — The button *runs away* from his cursor and taunts him personally. It gets a little easier each time, so he never quite gives up.
3. **The fake-out** — After ~12 dodges the button "gives up." He clicks it, a loading bar crawls to 99%, then stalls with goofy fake error popups.
4. **The reveal** — Confetti, a giant **PRANKED!** banner, and the bad news that there was never any money. There's a button to make him chase it all over again.

Works on desktop (mouse) and mobile/tablet (touch). Everything is self-contained in one file — no tracking, no external code, no actual harm.

## Want to tweak it?

Open `IsaacsPrize.html` in a text editor:

- **`DODGES_TO_WIN`** (near the top of the `<script>`) — how many dodges before the button surrenders.
- **`taunts`** array — add your own insults.
- The reveal text lives in the `doReveal()` function.

Enjoy. 😈
