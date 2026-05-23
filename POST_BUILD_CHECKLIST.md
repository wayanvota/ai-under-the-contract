# Post-Build Checklist

## Local build

- [x] All four contract types render concrete output.
- [x] Visual difference between columns is obvious through color, copy, and projection behavior.
- [x] Mobile layout stacks the four contract cards.
- [x] Save/share route is implemented.
- [x] PDF export route is implemented.
- [x] Industry benchmark toggle is implemented.
- [x] Environment variables are documented.
- [ ] Render deploy is green.
- [ ] GitHub repository is public or shared with Wayan.

## Manual QA before publishing

- [x] Run `npm run typecheck`.
- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [x] Open the app on desktop.
- [x] Open the app on a phone-width viewport.
- [x] Generate a scenario URL.
- [x] Open the scenario URL in a fresh browser tab.
- [x] Export the PDF and confirm the endpoint returns a PDF.
- [ ] Confirm there are no third-party analytics scripts.
- [ ] Search user-facing copy for banned phrasing and banned words.
- [ ] Fill in every `TBD` in `VERIFICATION.md` or revise the corresponding claim.

## External deployment

- [ ] Create Neon database.
- [ ] Add `DATABASE_URL` in Render.
- [ ] Connect GitHub repository to Render.
- [ ] Confirm migrations run during deploy.
- [ ] Confirm `https://payer-contract-sim.onrender.com` loads in under 3 seconds on mobile.
- [ ] Add a `wayan.com` landing link or DNS pointer.
