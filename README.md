# AI-Under-The-Contract

A payer-contract simulator for mission-driven digital health.

## What the tool argues

The same AI documentation copilot does not create the same company under every payer contract. Fee-for-service pushes visit coding and billable documentation. MSSP pushes care management when savings and quality gates matter. Medicare Advantage risk adjustment pushes HCC capture and audit exposure when documentation outruns the medical record. Employer direct contracts push engagement unless the contract pays for outcomes. The simulator lets an operator move the contract mix, panel size, and diagnosis distribution, then see the operating model change in the comparison cards, three-year projection, share URL, and one-page PDF.

## Current deploy status

The source is ready for GitHub, Render, and Neon. The live Render URL is not filled in because this workspace does not have your Render, GitHub, Neon, or DNS credentials.

Target production URL:

```text
https://payer-contract-sim.onrender.com
```

Recommended public link:

```text
https://wayan.com/ai-healthcare-contract
```

That page can point to the Render app, or the `wayan.com` subdomain can point at Render through DNS.

## Run locally

```bash
npm install
npm run prisma:generate
npm run dev
```

Open:

```text
http://localhost:3000
```

Local development can save scenarios without Neon. The app writes local saved scenarios to `.data/scenarios.json`, which is ignored by Git.

## Environment variables

Production requires:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST/dbname?sslmode=require
```

No analytics key, email tool, tracking pixel, or login provider is used.

## Deploy to Render

1. Create a Neon Postgres database.
2. Copy the pooled Neon connection string.
3. Create a public GitHub repository and push this project.
4. In Render, create a Web Service from that GitHub repository.
5. Set the service name to `payer-contract-sim`.
6. Add `DATABASE_URL` as an environment variable.
7. Use the Render settings below:

```text
Build command: npm install && npm run deploy:render
Start command: npm run start
```

One-command path after Render is connected to GitHub:

```bash
git push origin main
```

Render will install dependencies, apply Prisma migrations, build Next.js, and start the standalone service.

## Where the incentive logic lives

The editorial argument is encoded here:

```text
lib/incentives/ffs.ts
lib/incentives/mssp.ts
lib/incentives/ma.ts
lib/incentives/employer.ts
```

Each file includes the model comment for that contract and the prompt, behavior, revenue, risk, and patient-consequence outputs. Shared helpers are in `lib/incentives/shared.ts`. The claim registry behind the source modal is in `lib/sources/claims.ts`.

## How to extend with another contract type

1. Add the contract key to `lib/types.ts`.
2. Add its label, color, and default mix value in `lib/defaults.ts`.
3. Create a new file in `lib/incentives/`.
4. Return a `ComparisonBlock` and `ContractProjection`.
5. Add the new builder to `lib/incentives/index.ts`.
6. Add source notes in `lib/sources/claims.ts`.
7. Add the contract to the PDF summary in `components/ScenarioPdf.tsx`.

## Verification list before publication

Every numeric claim displayed in the tool is listed in `VERIFICATION.md`. Before the LinkedIn article goes live, fill in the verified URL and retrieval date for each claim. If a claim cannot be verified, lower the precision in the UI or mark it as an estimate.

## License

The software is released under the MIT License. See `LICENSE`.

## Local build checks

Use:

```bash
npm run typecheck
npm run lint
npm run build
```

Then test:

```text
http://localhost:3000
```

Core flows to check:

```text
Move contract sliders
Edit diagnosis distribution
Open source notes
Toggle industry archetype
Save scenario
Open /s/{slug}
Export PDF
```
