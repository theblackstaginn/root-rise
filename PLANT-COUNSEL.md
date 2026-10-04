# Ember plant journal

Root & Rise remains a static GitHub Pages app. Plant care dates and the tending ledger still use the existing local keys. A separate Supabase Edge Function stores request text and advice; photos are attached in chat rather than uploaded to the database.

## Backend

Project: `pqifpislzljilqatmtly` (existing Quest Board project). Only the new `rr_counsel_requests` table, `rr_create_counsel` function and `root-rise-counsel` Edge Function are involved. No gameplay tables or functions are modified.

The SQL in `supabase/plant-counsel.sql` describes the deployed schema. The Edge Function uses its runtime service key server-side; there are no private project keys in the browser or plugin. Direct anon/authenticated table and RPC access is revoked, with RLS and an explicit deny policy. HTTP access is protected by SHA-256 hashes of 256-bit random capabilities.

- A device owner capability permits reading that device’s journal. It is stored in `rr.counselOwner.v1` and included in garden backups for recovery and transfer. Keep backup files private.
- A separate per-request return capability permits reading and answering one request for seven days. Only that capability travels to chat. The owner capability is never part of the handoff.
- Replies are write-once. Identical response retries succeed; a different response cannot overwrite advice. Request creation is idempotent and rate limited transactionally to 20/device, 40/source and 200 total per rolling day. Browser CORS permits the GitHub Pages origin; CORS is not treated as authentication.
- The server stores request text and advice until explicitly removed by a future retention or deletion feature. Ten recent conversations per plant are shown. No photo files are retained by this backend.

## Plugin

The private **Root Rise** plugin connects to the same verified MCP endpoint and exposes only `get_plant_request` and `submit_plant_response`. The source lives in `plugins/root-rise/`. The icon in the uploaded package is a copy of the existing repository `icon-1024.png`, placed at `assets/icon.png` when packaging.

Created workspace plugin: `Plugin_462d80c727448191890968da0980bdb4`; release `pluginrel_6ac296469d1081919d787dca3d463871`.

Connect the plugin before testing real requests. Jess also needs access to the plugin in her ChatGPT account/workspace. Plugin creation does not prove that her account has connected it.

## Browser flow

Open a plant, select a photo and enter symptoms. Copying first persists the request, then produces its chat handoff. Share may require a second tap after preparation to preserve iPhone share-sheet activation. Attach the photo in chat and select Root Rise. Ember reads the request and returns her advice with the plugin. The existing plant dialog retrieves replies when opened, when focus returns, or when Check for Ember’s reply is pressed. Advice is rendered as text and remains bounded in the dialog.

Successful reply fetches are cached in `rr.counselCache.v1` for offline viewing. Clearing browser storage loses journal access unless a garden backup containing the owner key is restored. Older backups still restore the original care records and leave the current journal key intact. Imported journal keys clear stale cached replies and pending requests; the existing restore rollback now covers those keys too.

## Validation

Live backend: MCP discovery, request creation/retry, separate-owner isolation, incorrect-capability rejection, response saving/retrieval, identical retries and overwrite prevention. Synthetic test records were removed afterward. Direct browser grants were verified absent; Supabase security advisors reported no findings for the new table or function.

Browser: Chromium at 320, 390, 768 and 1440px with mocked API replies. Required inputs, scoped handoff excluding the owner key, safe rendering of HTML-like advice, offline cache, share/cancel, care/undo and plant isolation passed. Backup and restore checks passed, including invalid journal keys, old backups and rollback on a failed journal write. Native iPhone sharing and a real ChatGPT plugin round trip remain final user-device checks after connection and publication.
