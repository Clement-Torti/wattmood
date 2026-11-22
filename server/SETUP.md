# WattMood server setup: Google Sheet + Apps Script

This takes about 10 minutes and costs nothing. The spreadsheet stays **private**: only the Apps Script web app is public,
and it runs as you, so nobody can read or edit the sheet directly.

## 1. Create the sheet and the script

1. Create a new Google Sheet named **WattMood**.
2. Open **Extensions ▸ Apps Script**, delete the sample code and paste the content of [`Code.gs`](Code.gs). Save.
3. In the editor, select the function **`setup`** and click **Run**. Accept the permissions (it's your own script).
   This creates the tabs Events, Pledges, Donations, Coupons, Feedback, Goals and Meta.
4. Reload the spreadsheet. A **WattMood** menu appears.

## 2. Deploy the web app

1. **Deploy ▸ New deployment ▸ Select type: Web app**.
2. Set **Execute as: Me** and **Who has access: Anyone**.
3. Click **Deploy** and copy the URL ending in `/exec`.
4. Paste it in `extension/src/core/config.js`:

   ```js
   ENDPOINT: 'https://script.google.com/macros/s/AKfy…/exec',
   ```

5. Run `node extension/tools/build-site.mjs` so the public site uses the same endpoint, then commit and push.

After you change `Code.gs`, use **Deploy ▸ Manage deployments ▸ Edit ▸ Version: New version**. The URL stays the same.

## 3. Daily routine

### When someone donates on Buy Me a Coffee

1. Find the donor's code (`WM-XXXXXX`) in their Buy Me a Coffee message. The **Pledges** tab shows what they said they would give,
   with the same code.
2. Add a row in **Donations**: date, code, amount in €, points (= € × 10), note.
   Any edit in this tab updates "last update" automatically, which clears that donor's "in review" stripe in the extension.
3. If they gave **€5 or more**:
   - choose **WattMood ▸ New coupon — 1 skin** (€5 to €9.99) or **New coupon — all skins** (€10 or more);
   - type a note (their code and the amount);
   - copy the generated coupon (`WMC-XXXX-XXXX`) and reply to the donor with it.
4. The donor enters the coupon in WattMood ("I have a coupon"). A coupon works **once**. Only the same person (same
   WattMood code or same Wattpad username) can re-enter it on another device.

### Other tasks

- **Change a goal:** add or edit a row in **Goals** (`ventana | 2000`). It takes effect within about 20 minutes for everyone.
- **Read feedback:** in the **Feedback** tab (rating 1–5, text, skin, version, page, language).
- **See the total:** **WattMood ▸ Show community total**.

## How points are counted

```
total = 10 × (unique installs) + 5 × (people who shared at least once) + sum of the Donations "points" column
```

**Known limit:** install and share events come from the extension and can't be verified, so a determined person could
inflate them. For this audience and these stakes that's acceptable. If it ever matters, lower the weights or
review the Events tab.
