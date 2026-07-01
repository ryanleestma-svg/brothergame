# 🏦 Lender Tracker — Setup Guide

A shared tracker for chasing down lenders for a **$20–50M lending package**. Built for
a small team (you + ~2 others) and ~200 lenders, with **daily task checklists** built in.

Everyone works in one live **Google Sheet** through a clean web app — no accounts to create,
no software to install, no monthly cost.

---

## What you get

- **Dashboard** — secured vs. weighted vs. active pipeline, a progress bar to your $20–50M target,
  pipeline-by-stage, today's open tasks, overdue tasks, and per-person workload.
- **Lenders** — one row per lender (up to a few hundred is fine). Search, filter by stage/owner/type,
  sort any column. Click a lender to open its full profile with a contact card, activity log, and its tasks.
- **Daily Tasks** — a completion checklist **by day**, shared live across the team. Week strip, prev/next
  day, "Today", overdue roll-up, assign tasks to people, link tasks to lenders.
- **Activity** — one feed of every call / email / meeting / note logged across all lenders.
- **CSV import/export** — paste your existing list of 200 lenders in one go; export anytime.

Data is saved in your Google Sheet (the source of truth) and cached in each browser so the
app still opens if the internet drops.

---

## One-time setup (~3 minutes, done once for the whole team)

**1. Create the Sheet**
Go to **[sheets.new](https://sheets.new)** to make a blank Google Sheet. Name it e.g. "Lender Tracker".

**2. Open the script editor**
In the Sheet: **Extensions → Apps Script**.

**3. Paste the backend code**
Delete whatever is in the editor. Open **`google-apps-script/Code.gs`** from this repo, copy the
**entire** file, paste it in, and click the **Save** icon (💾).

**4. Deploy it as a Web App**
- Click **Deploy → New deployment**.
- Click the gear ⚙️ next to "Select type" → choose **Web app**.
- Set:
  - **Description:** `Lender Tracker API`
  - **Execute as:** **Me**
  - **Who has access:** **Anyone**
    *(This only exposes your Sheet's data through the long random URL — only people you give the URL to can reach it.)*
- Click **Deploy**. Google will ask you to **authorize** — approve it (you may see an
  "unverified app" screen; click **Advanced → Go to … (unsafe)** — it's your own script).
- **Copy the Web app URL.** It ends in `/exec`.

**5. Connect the app**
Open **`LenderTracker.html`** in a browser. Paste the URL into the connect box and click **Connect**.

**6. Share with your team**
Send your 2 colleagues:
- the **`LenderTracker.html`** file (or host it — see below), and
- the same **Web app URL**.

They paste the URL once and everyone is on the same live data. Each person picks their name from the
**"You are"** dropdown (bottom-left) so their activity and task completions are stamped correctly.
Manage the team name list under **Settings → Team & target**.

---

## Loading your 200 lenders quickly

**Settings → Import lenders** accepts pasted CSV. Columns, in order:

```
name, institution, type, contact, email, phone, stage, priority, owner, amount, notes
```

- `amount` is in **millions** (e.g. `10` = $10M).
- `stage` is one of: To Contact, Contacted, Engaged, Term Sheet, Due Diligence, Committed, Funded, Declined
  (anything unrecognized becomes "To Contact").
- `priority`: High / Medium / Low. `type`: Bank, Debt Fund, Private Credit, Mezzanine, Insurance,
  Family Office, Credit Union, Other.

A header row is auto-detected and skipped. Blank cells are fine — fill details in later by clicking a lender.

Example row:
```
Acme Bank, Acme Financial, Bank, Jane Doe, jane@acme.com, 555-1000, Contacted, High, Me, 10, Warm intro via CFO
```

---

## Where to keep the HTML file

Any of these work — pick one:

- **Simplest:** each teammate keeps `LenderTracker.html` on their computer and double-clicks it.
- **Nicer:** host it so everyone opens a link. This repo already publishes static HTML, so
  GitHub Pages works — enable Pages on the repo and the app is at
  `https://<user>.github.io/<repo>/LenderTracker.html`.

Either way, the data lives in the shared Google Sheet, not in the file — so the file can be copied freely.

---

## Notes & tips

- **Live sync:** the app quietly refreshes every 30 seconds (and skips refreshing while you have a
  dialog open), so teammates' changes appear on their own. There's no manual save — edits go straight to the Sheet.
- **The Sheet stays readable:** tabs are `Lenders`, `Activities`, `Tasks`, `Config`. You can look at or
  tweak rows directly in Google Sheets if you ever want to.
- **Weighted pipeline** multiplies each active lender's indicated amount by its probability
  (set per lender, or an automatic default per stage). Good for a realistic view of where you stand.
- **Changing the backend:** edit `Code.gs`, then **Deploy → Manage deployments → edit ✏️ → Version: New version → Deploy**
  to push changes to the same URL.
- **Security:** treat the Web app URL like a password — anyone with it can read/write the data. Don't post it publicly.
