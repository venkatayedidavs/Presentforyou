# Given, version 1

Given is a desk in the middle. Someone picks a domain and a gift. Given registers the domain and publishes a small site on it, with no human step after checkout.

This version sells one gift, the greeting site:

1. Pick a domain. The shop suggests names and asks the registrar if each one is free.
2. Pick a purpose. The purposes shipped today are a birthday gift for a child, a first day of school, and just because.
3. Pick one option for that purpose. Each option is a short game made with the recipient's name.
4. Write the greeting and add photos. Upload up to four images, or use the sample set of illustrations.
5. Finish checkout. No card is charged. The domain is recorded as registered, and the site is published immediately.

The published site shows the greeting, then the game, then the photos. On this machine the site is at `/sites/<domain>`. A real registration would point DNS at that site. Version 1 only stores the registration.

The catalog lives in `src/lib/catalog.ts`. It is a list of gifts. Version 1 has one entry, `greeting-site`. A later gift is another entry plus a site renderer. This version does not include any other gift.

There are no accounts and no payment processor.

## Why the registrar is mocked

Version 1 does not call a registrar. There is no registrar account, no API credential, and no domain is purchased. The mock exists so the rest of the path — purpose, game, greeting, photos, and publishing — can run and be tested before a provider is chosen.

`DomainRegistrar` in `src/lib/registrar.ts` is the seam. Domain search calls `checkAvailability`, and checkout calls `register`. Neither one writes a registration on its own. `createMockRegistrar` is the only implementation. Dev and tests use it. `npm run local` sets `REGISTRAR=mock`. Any other value throws, so a real provider has to be wired on purpose rather than failing open.

The mock records registrations in `data/given.json` (or `DATA_DIR`). Some names are always taken (`google.com`, `example.com`, `given.com`, `birthday.com`, `test.com`, and any name whose first label is `taken`) so the shop can show an unavailable domain. A second checkout of the same domain is rejected.

Prices are recorded in US dollars and are not collected.
