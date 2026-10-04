```bash
npm run local
```

That starts Given at http://127.0.0.1:43123 with the mock registrar. Open that address, choose a domain, a purpose, and a game, add a greeting and photos, then publish. The site is created with no extra step.

# Given

Given registers a domain for someone and publishes a small site on it. Venkata Yedida owns it.

Version 1 sells one gift: a greeting site. That site is a short greeting, a small game, and a few photos — the version a parent gives a child. The shop is a catalog with that single gift, so a later gift can be added without building a second store. Those other gifts are not in this version.

`npm run local` installs dependencies if `node_modules` is missing, forces the mock registrar, and writes registrations to `data/given.json` on this machine. Domain registration is not real. Checkout does not charge a card.

`npm test` runs the gift flow tests and the deploy checks.

## Docs

- [What version 1 does](docs/version-1.md), including why the registrar is mocked.
- [Google Cloud connection](docs/deploy-gcp.md).

Nothing is deployed. There is no live URL.
