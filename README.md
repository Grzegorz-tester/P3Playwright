# P3 Tests

> [!IMPORTANT]
> **This is not a "Carbon tests" repository.** It is the **P3 (Peracto 3) test
> suite**, covering *numerous* storefronts built on the Peracto 3 engine. **Carbon is
> just one of the P3 projects under test** — alongside Kooltech, Mipa, Keylite and
> Indespension etc. Carbon is one project among
> several, all driven by the same shared framework.

End-to-end (E2E) test automation for the Peracto 3 ecommerce platform and the
storefronts built on it, written in [Playwright](https://playwright.dev/) with
TypeScript.

Peracto 3 is our own ecommerce engine. **Carbon** is its reference storefront;
the other folders (**Kooltech**, **Mipa**, **Keylite**, **Indespension**) are
live client storefronts built on the same engine. They share the same underlying
behaviour but each has its own theme, markup and data, which is exactly why the
framework is built around abstraction (see below).

---

## Table of contents

- [Repository layout](#repository-layout)
- [How the abstraction works](#how-the-abstraction-works)
- [Getting started](#getting-started)
- [Running tests](#running-tests)
- [Adding a new project (storefront)](#adding-a-new-project-storefront)
- [Adding a new test to an existing project](#adding-a-new-test-to-an-existing-project)
- [Conventions and guidelines](#conventions-and-guidelines)
  - [Locators](#locators-stable-only)
  - [Object repository pattern](#object-repository-pattern)
  - [OOP and reuse](#oop-and-reuse)
  - [Naming conventions](#naming-conventions)
  - [Test authoring](#test-authoring)
- [Authentication](#authentication)
- [Git workflow](#git-workflow)
- [CI](#ci)

---

## Repository layout

```
p3-tests/
├─ .gitlab-ci.yml                # CI pipeline, one job per storefront
├─ README.md
└─ playwright/
   ├─ playwright.config.ts       # picks testDir, baseURL and report path from env vars
   ├─ tsconfig.json              # @utils/* and @common/* path aliases
   ├─ package.json               # per-project run scripts
   │
   ├─ common/
   │  └─ abstract-pages/         # abstract base classes = shared BEHAVIOUR contracts
   │     ├─ HomePage.ts
   │     ├─ LoginPage.ts
   │     ├─ AccountPage.ts
   │     ├─ ProductListPage.ts
   │     ├─ ProductDetailPage.ts
   │     ├─ BasketPage.ts
   │     ├─ CheckoutPage.ts
   │     └─ CheckoutSuccessPage.ts
   │
   ├─ utils/                     # cross-project helpers
   │  ├─ testConfig.ts           # getUrl / getApi / getAuthFile helpers
   │  ├─ testEnvs.ts             # per-storefront URLs + API hosts per environment
   │  ├─ testUsers.ts            # test account credentials
   │  └─ fakeData.ts             # faker-based generators (e.g. generateDeliveryAddress)
   │
   └─ projects/                  # one folder per storefront
      └─ <project>/
         ├─ pages/               # concrete page objects, extend the abstract pages
         ├─ tests/               # spec files (*.test.ts) + auth.setup.ts + .auth/
         └─ utils/
            ├─ objects.ts        # the object repository: all locators for this project
            ├─ Pages.ts          # Playwright fixtures wiring page objects into `test`
            ├─ products/products.ts
            └─ promotions/promotions.ts
```

The working directory for all commands is `playwright/`.

---

## How the abstraction works

There are three layers. Keep responsibilities in the right layer.

1. **Abstract pages** (`common/abstract-pages/`) — describe *what a page can do*,
   not how. They hold shared navigation helpers (e.g. `navigateToHomePage()`) and
   declare `abstract` methods every storefront must implement
   (`chooseMenuCategory`, `addToBasket`, `payOnAccount`, …). **No locators live
   here.** A test written against these contracts reads the same for every client.

2. **Object repository** (`projects/<project>/utils/objects.ts`) — a single object,
   e.g. `CarbonObjects`, holding *every locator for that storefront*, grouped by
   page. Entries are factory functions `(page: Page) => Locator` (curried when they
   need a parameter). When a storefront's markup changes, this is usually the only
   file you touch.

3. **Concrete page objects** (`projects/<project>/pages/`) — extend an abstract page,
   pull their locators from the repository, and implement the abstract methods.
   They never inline a locator and never import another project's pages.

```
        HomePage (abstract, behaviour)
              ▲
              │ extends
   CarbonHomePage ──uses──► CarbonObjects.HomePage.*  (locators)
```

Because each project is self-contained, a change to Carbon can never break Kooltech.

---

## Getting started

Prerequisites: **Node.js >= 22.19** (enforced by the `engines` field in
`package.json`; some dev deps such as lighthouse 13 require it) and Google Chrome
installed (the suites run against system Chrome via `channel: 'chrome'` — you do
**not** need to run `playwright install`).

```bash
cd playwright
npm install
```

---

## Running tests

Tests are parameterised by two environment variables:

- `PROJECT` — which storefront (`carbon`, `kooltech`, `mipa`, `keylite`, `indespension`)
- `ENV` — which environment (`stage`, and `prod` where defined in `testEnvs.ts`)

The Playwright *project* flag (`--project`) selects the **browser**, not the
storefront. Use `Chrome` for real runs.

Convenience scripts are defined in `package.json`:

```bash
npm run test:carbon:stage
npm run test:kooltech:stage
npm run test:mipa:stage
npm run test:keylite:stage
npm run test:indespension:stage
```

Equivalent explicit form (and how CI runs it):

```bash
PROJECT=kooltech ENV=stage npx playwright test --project=Chrome
```

Useful extras:

```bash
# a single spec
PROJECT=mipa ENV=stage npx playwright test happy-path --project=Chrome

# type-check the whole workspace (no test run)
npx tsc --noEmit --skipLibCheck -p tsconfig.json

# open the last HTML report
npx playwright show-report projects/kooltech/html-report
```

Type-check before pushing — Playwright transpiles with esbuild and ignores type
errors at run time, so `tsc` is what actually catches them.

> Note on staging: Carbon staging is unstable and thin on test data, so its tests
> are expected to be *technically correct* rather than always green. Client
> storefront suites should pass; a failure there is worth investigating.
>
> Carbon's `/auth` API currently returns 404, so `auth.setup` fails under the
> `Chrome` project. Specs that log in through the UI (e.g. `my-account`) can be run
> without setup via `--project=chromium`, e.g.
> `PROJECT=carbon ENV=stage npx playwright test my-account --project=chromium`.
> Getting the carbon suite runnable under `Chrome` needs the correct auth endpoint
> (raise a ticket).

---

## Adding a new project (storefront)

1. Add the storefront's URLs and API host to `utils/testEnvs.ts`, and any
   credentials to `utils/testUsers.ts`.
2. Create `projects/<project>/` with `pages/`, `tests/`, `utils/`.
3. Create `utils/objects.ts` exporting `<Project>Objects` — visit the live site
   and collect **stable** locators (see below) for each page you need.
4. Create the page objects in `pages/`, each `extends` the relevant abstract page
   and reads its locators from the repository.
5. Wire the page objects into fixtures in `utils/Pages.ts`.
6. If the flow needs a logged-in user, add `tests/auth.setup.ts` (copy an existing
   one) and use `testConfig.getAuthFile()` for the storage path.
7. Add a job to `.gitlab-ci.yml` (copy an existing block, change `PROJECT_CLIENT`).
8. Add a `test:<project>:stage` script to `package.json`.

If a storefront diverges from the shared behaviour (Mipa, for example, is
search-driven and its category pages 404), implement the abstract methods in the
way that actually works for that site and add project-specific methods as needed —
but keep the shared method names identical so tests stay portable.

---

## Adding a new test to an existing project

- Put the spec in `projects/<project>/tests/` named `*.test.ts`.
- Import the project's fixtures: `import test from '../utils/Pages'`.
- Drive the flow through page-object methods only — no raw locators in specs.
- Wrap steps in `test.step(...)` with human-readable descriptions.
- Put product/promotion data in `utils/products/` and `utils/promotions/`, never
  hard-coded in the spec.
- For throwaway input (addresses, names, emails), generate it with the faker
  helpers in `utils/fakeData.ts` (e.g. `generateDeliveryAddress()`) rather than
  hard-coding values — they use the EN_GB locale so postcodes pass UK validation.
  Add new generators there rather than calling faker inline in specs.

---

## Conventions and guidelines

### Locators (stable only)

Use **only** stable locators, in this order of preference:

1. `page.getByTestId('...')` (a `data-testid`)
2. `page.locator('#id')` (an element `id`)
3. `page.locator('[href="..."]')` (a stable `href`)

Do **not** use CSS class chains, `nth-child` structural selectors, or long XPath
tied to page structure — storefront markup and Tailwind classes change constantly.

#### Never locate by text

**Categorically do not locate elements by their visible text.** No
`getByText(...)`, no `getByRole(..., { name })`, no `hasText` / `filter({ hasText })`
as the *primary* way to find an element. Text is the least stable attribute we have:
it changes with copy edits, translation, casing, whitespace and A/B tests, and a
suite that keys off text breaks for reasons that have nothing to do with the
behaviour under test.

This is not a "prefer not to" — it is a rule. The **only** acceptable use of text
is as an absolute last resort, when *all* of the following are true:

- the element genuinely has no `data-testid`, no `id`, and no stable `href`, **and**
- you cannot anchor to a nearby element that does have one, **and**
- you have already raised it with the project's developers (see below).

When you do hit a missing-testid case, the correct action is **not** to reach for
text — it is to:

1. **Contact a developer on that project** and ask them to add a `data-testid` (or a
   stable `id`) to the element.
2. **Raise a ticket** for it (`<PROJECT-KEY>-<number>`, e.g. `KOOL-123 add
   data-testid to checkout pay-on-account button`) so the request is tracked and
   the storefront's testability improves over time.
3. Only if you are genuinely blocked in the meantime, add a temporary text-based
   locator **with a `// TODO:` comment linking the ticket**, and replace it the
   moment the testid ships.

Treat a text locator in a review as a red flag: it needs a ticket reference and a
removal plan, or it should not be merged.

### Object repository pattern

All locators for a storefront live in its `utils/objects.ts`, grouped by page,
as factory functions:

```ts
export const CarbonObjects = {
  HomePage: {
    brandBar: (page: Page) => page.getByTestId('brand-bar'),
    // curried when parameterised:
    category: (name: string) => (page: Page) => page.locator('h2', { hasText: name }),
  },
  // ...
};
```

Page objects reference these; they never call `page.locator(...)` inline. One
markup change → one edit in one file.

### OOP and reuse

- Every concrete project page **extends** its abstract base. Shared behaviour lives in the
  base; only differences are overridden.
- **Never** import a page object from another project. If two projects genuinely
  share behaviour, it belongs in the abstract page, not copied or cross-imported.
- Reuse `testConfig` helpers (`getUrl`, `getApi`, `getAuthFile`) instead of
  rebuilding URLs or auth paths by hand.
- Keep test data (`products.ts`, `promotions.ts`) and credentials (`testUsers.ts`)
  out of specs and page objects.

### Naming conventions

| Thing                  | Convention                        | Example                       |
| ---------------------- | --------------------------------- | ----------------------------- |
| Page object class      | `<Project><Page>`                 | `KooltechCheckoutPage`        |
| Page object file       | matches the class                 | `KooltechCheckoutPage.ts`     |
| Object repository      | `<Project>Objects`                | `MipaObjects`                 |
| Spec file              | `kebab-case` + `.test.ts`         | `user-checkout-delivery.test.ts` |
| Auth setup file        | `auth.setup.ts`                   | —                             |
| Product/promo keys     | `UPPER_SNAKE_CASE`                | `VIOLET_LIGHT_LED_CHEMICALS`  |
| Methods / variables    | `camelCase`, verb-first methods   | `chooseDeliveryOption()`      |

Method names on page objects are part of the shared contract — keep them identical
across projects (e.g. every checkout page has `payOnAccount()`).

### Test authoring

- Specs describe *intent*; page objects contain *interaction*. No assertions on raw
  locators inside a spec.
- Use `test.step()` to structure a flow into readable stages.
- Prefer web-first assertions (`await expect(locator).toBeVisible()`,
  `toHaveText()`) over manual waits. Avoid `waitForTimeout` unless a third party
  (payment iframe, animation) genuinely forces it.
- A `test.skip(...)` should stay logically correct — don't let skipped tests rot.

#### Log every step

Every `test.step(...)` must start with a console log of the step name, prefixed
`[STEP]`, as its **first line**:

```ts
await test.step(`Navigate to Category PLP`, async () => {
    console.log(`[STEP] Navigate to Category PLP`)
    await homePage.navigateToHomePage()
    await homePage.chooseMenuCategory('Appliances')
})
```

This matters because CI runs headless: when a run fails, the job log is often the
first (and sometimes only) thing you have. The `[STEP]` lines give a plain,
greppable timeline of exactly how far the test got and which step was in flight
when it broke — no trace-viewer needed to answer "where did it die?". Keep the log
text identical to the step title so the log reads as the scenario.

---

## Authentication

Logged-in flows authenticate via `tests/auth.setup.ts`, which POSTs to the
storefront's auth API and saves the session with
`request.storageState({ path: testConfig.getAuthFile() })`. Specs then opt in with:

```ts
test.use({ storageState: testConfig.getAuthFile() });
```

The `setup` Playwright project runs before `Chrome` (declared as a dependency in
`playwright.config.ts`). Storefronts where the API cookie doesn't carry over to the
web domain log in through the UI instead (`loginPage.loginToApplication(...)`).

`.auth/*.json` files hold live session tokens — treat them as disposable; they are
regenerated on every run.

---

## Git workflow

- **Never commit to `main`.** `main` is the integration branch and is protected.
- Work on a **feature branch** named after the ticket, e.g. `KEYL-500-add-wishlist-test`
  or `IND-225-indespension-setup` (the `<PROJECT-KEY>-<number>-<short-desc>` pattern
  already used in history: `IND`, `KEYL`, `PERC`).
- Keep commits small and message them with the ticket key, e.g.
  `KEYL-500 add wishlist checkout test`.
- Open a merge request into `main` and let CI run before merging. Get a review.
- Do not commit `node_modules/`, `test-results/`, `*/html-report/` — they are
  gitignored.

---

## CI

`.gitlab-ci.yml` defines one job per storefront (`e2e_tests_<project>_stage`). Each
job installs dependencies, installs Chrome, and runs that project's suite against
staging, publishing the HTML report as an artifact. Jobs are gated on
`$UPSTREAM_PROJECT_NAME`, so a storefront's deploy triggers only its own suite.

The `mcr.microsoft.com/playwright` image ships Node 20.16, which is too old for our
dev deps (Node >= 22.19 required). The hidden `.node22` job installs a compatible
Node with `n` in a `before_script`; every job inherits it via `extends` (storefront
jobs through `.e2e_tests`, which extends `.node22`). If you add a new job, extend
`.node22` (or `.e2e_tests`) so it gets the right Node.

`carbon-sanity-check` is a separate gate that runs on **merge request events** and
**merges to the default branch** (not tied to `$UPSTREAM_PROJECT_NAME`). It runs the
carbon my-account scenario (`projects/carbon/tests/my-account.test.ts`) via
`npx playwright test my-account --project=chromium`. The `chromium` project is used
deliberately so the check does not pull in the `auth.setup` dependency — that spec
logs in through the UI, so it needs no storage-state setup (and sidesteps carbon's
404 `/auth` endpoint).
