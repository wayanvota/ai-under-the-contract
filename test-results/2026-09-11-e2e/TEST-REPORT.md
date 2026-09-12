# AI Under the Contract end-to-end test and repair report

## Outcome

- Run status: COMPLETE for this repository's bounded E2E rollout
- Tool and purpose: payer-contract scenario simulator, persistence, shared links, and PDF boundary
- Run date and report location: 2026-09-11, `test-results/2026-09-11-e2e/TEST-REPORT.md`
- Initial revision: `7cc7039` (`origin/main`)
- Final tested state: branch `test/e2e-harness-2026-09-11`
- Environment: macOS, Node 26.5.0, Next.js 16.3.4, Playwright 1.55.1, Chromium 149.0.7827.55
- Authorization and isolation: localhost production server, synthetic scenarios, isolated JSON store, empty database URL, no production data or external service
- Remaining failures, blockers, or decisions: none for the deterministic release contract; live Neon and deployed Render behavior are outside this PR run

| Coverage | Initial PASS | Initial FAIL | Initial BLOCKED | Initial NOT RUN | Final PASS | Final FAIL | Final BLOCKED | Final NOT RUN |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| User behavior, 10 categories | 0 | 0 | 10 | 0 | 10 | 0 | 0 | 0 |
| Adversarial, 10 categories | 6 | 0 | 4 | 0 | 10 | 0 | 0 | 0 |

The first runnable attempt reached all six API-only categories, which passed, but the 14 browser-dependent categories were blocked by an incomplete local Playwright browser download. A complete existing Chromium installation resolved that environment issue. The final full rerun produced 20 passes in 6.9 seconds.

## Scope and expectations

The harness builds and starts the real production Next.js application, drives the shipped interface in Chromium, calls the real route handlers, and uses the application's local JSON persistence fallback. The store is isolated as `.data/e2e-scenarios.json` and deleted before every category. No production record, credential, Neon database, or deployed endpoint is used.

Expected behavior comes from the README, UI copy, TypeScript domain types, and existing scenario-route validation. Authentication and multi-user authorization do not exist in this public simulator. The adversarial cases therefore concentrate on public request validation, stored markup, generated paths, cross-origin headers, resource bounds, and error disclosure.

## Primary test matrix

| ID | Category | Initial | Final | Defect | Evidence |
| --- | --- | --- | --- | --- | --- |
| U01 | First use and decision boundary | BLOCKED | PASS | H01 | Primary heading, modeled-estimate disclosure, and save action visible |
| U02 | Core calculation workflow | BLOCKED | PASS | H01 | Contract sliders rebalance to exactly 100 percent |
| U03 | Input mistakes and recovery | BLOCKED | PASS | H01 | Invalid diagnosis total is explained; corrected scenario saves |
| U04 | Valid boundaries | BLOCKED | PASS | H01 | Panel minimum and zero diagnosis value are preserved |
| U05 | Persistence and resumption | BLOCKED | PASS | H01 | Saved scenario survives its deep link and browser reload |
| U06 | Editing and reversal | BLOCKED | PASS | H01 | Archetype and methodology interfaces open and close |
| U07 | Interrupted service and recovery | BLOCKED | PASS | H01 | Visible 503 save failure is followed by a successful retry |
| U08 | Accessible interaction | BLOCKED | PASS | H01 | Keyboard changes a slider and opens the source dialog |
| U09 | Supported viewport | BLOCKED | PASS | H01 | Core controls remain available at 390 by 844 with no horizontal overflow |
| U10 | Timing and repeated actions | BLOCKED | PASS | H01 | Double save creates exactly one POST request |
| A01 | Unknown shared identifier | BLOCKED | PASS | H01 | Invented slug returns HTTP 404 and the not-found page |
| A02 | Type-confused request | PASS | PASS | D01 | Object-valued panel size returns 400 |
| A03 | Script and markup injection | BLOCKED | PASS | H01, D01 | Stored hostile name cannot create an image or execute its handler |
| A04 | Interpreter injection | BLOCKED | PASS | H01, D01 | SQL-shaped name remains inert data and the shared page loads |
| A05 | Forged cross-origin request | PASS | PASS | | Response grants neither origin access nor credentials |
| A06 | Encoded path traversal | BLOCKED | PASS | H01, D02 | Encoded traversal cannot select the local scenario store |
| A07 | Unsafe generated value | PASS | PASS | D01 | JavaScript-scheme PDF label is rejected with 400 |
| A08 | Caller-controlled identifier | PASS | PASS | D01 | Supplied traversal slug is ignored; server emits an eight-character slug |
| A09 | Resource abuse | PASS | PASS | D01 | JSON beyond 64 KiB returns 413 and creates no store |
| A10 | Confidential error exposure | PASS | PASS | D01 | Malformed JSON returns a generic 400 without framework or database details |

## Test evidence

Each category is a distinct test in `tests/e2e/simulator.spec.ts`. The stable commands are:

```bash
npm ci
npm run build
npm run test:e2e
```

Final output:

```text
20 passed (6.9s)
```

Type checking, lint, production build, and the high-severity dependency audit also passed. The audit reported zero known vulnerabilities. GitHub Actions installs Chromium, runs the same production-boundary suite, and retains the HTML report, screenshots, traces, and video when a run fails.

## Defects and repairs

### D01: Public JSON boundaries relied on partial assumptions

- Affected tests: A02, A03, A04, A07, A08, A09, A10
- Severity and impact: medium hardening gap; malformed or oversized public requests could consume unnecessary resources or reach route logic with weakly checked values
- Root cause: both routes parsed unbounded JSON directly, the shared scenario validator was local to one route, and PDF labels accepted arbitrary strings
- Fix: shared structural validation, a 64 KiB request limit, safe HTTP/HTTPS or local share labels, and stable client-facing 400/413 responses
- Regression evidence: all seven adversarial categories pass through the real production route handlers
- Original-state verification: established by direct source inspection at `7cc7039`; a pre-fix dynamic run was unavailable because the harness and guards were introduced together
- Final status: FIXED AND VERIFIED

### D02: Test-store configuration could expand the deployment trace

- Affected tests: A06 and the production build
- Severity and impact: build-quality issue; a dynamically resolved path caused Next.js to trace the whole project into the server bundle
- Root cause: the first harness implementation accepted a full environment-supplied store path
- Fix: only a basename may be supplied, and it is always joined beneath the existing `.data` directory
- Regression evidence: the production build passes without the whole-project tracing warning; path traversal remains blocked
- Final status: FIXED AND VERIFIED

### H01: Local Playwright browser installation was incomplete

- Affected tests: all browser-dependent categories
- Severity and impact: harness environment only; no application request or page assertion ran in the first attempt
- Root cause: the Playwright 1.55.1 headless-shell download did not complete, while an earlier full Chromium directory was also incomplete
- Fix: the local verification run used a complete installed Chromium through Playwright's documented launch option; CI installs the version-matched Chromium automatically
- Regression evidence: the U01 smoke rerun passed, followed by all 20 categories passing in one run
- Final status: RESOLVED

## Final verification and handoff

- `npm ci`, `npm run typecheck`, `npm run lint`, and `npm run build` passed.
- `npm run test:e2e` passed all 20 categories against the production server.
- `npm audit --audit-level=high` reported zero vulnerabilities.
- The harness uses synthetic inputs and the isolated local fallback store.
- No live database, deployed application, secret, or paid service was touched.
- CI uses the same application build and test command and retains failure evidence for 14 days.

This establishes the deterministic browser-to-route release contract. It does not establish continuous availability of Neon or Render, nor does it replace a post-deployment smoke check.
