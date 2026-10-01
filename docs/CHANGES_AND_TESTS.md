# CloudPOS repair and verification report

Verification date: 30 September 2026. This package contains updated source, compiled frontend assets, setup instructions, and regression tests. It does not include vendor/node_modules, a configured .env, or the temporary QA database.

## Login and authentication

- The React API base URL now retains the browser's port. The previous hostname-only value sent requests to the wrong server on local installations.
- Correct credentials were verified against the original SQL database. A local password reset command now supports accounts whose actual password differs from the expected demo password, without changing account permissions or verification flags.
- Email input is trimmed and normalized. Missing language and role data no longer cause a login crash or an unusable token.
- Protected API requests now receive the bearer token. Network errors and API status codes are preserved, and invalid sessions clear stale browser state.
- Login attempts are rate limited. Registration no longer accepts arbitrary account flags from request input; new passwords require at least 12 characters.
- Two-factor verification requires a short-lived password-authenticated challenge. Recovery codes and challenges are consumed once. Recovery downloads use expiring signed URLs instead of public files.
- Logout and password reset revoke the relevant access tokens. Public browser migration routes were removed; cache clearing requires authenticated super-admin access.

## Interface

- New responsive sign-in page, blue/teal palette, local font files, CloudPOS logo and favicon.
- Consistent sidebar, cards, forms, tables, dashboard tiles and POS styling.
- Empty chart states show explanatory text instead of an empty circle.
- Brand/category filters use native horizontal scrolling, removing the affected Swiper dependency.
- Versioned frontend assets and a single React entry point replace the duplicated build entry and timestamp cache busting.
- `pos:brand` changes app branding. Original vendor copyright/license notices and legitimate subscription rules remain in place.

## Data and receipts

- Restored missing country/state seed files from the supplied SQL data: 246 countries and 4,108 states.
- Fresh database migration and seeding now work. New seeded accounts receive random passwords; set your password using `pos:reset-password`.
- Product units are validated before purchase/stock creation. Sales require at least one item and positive quantities; sale prices cannot be negative.
- Stock is locked during the sale update to protect simultaneous stock deductions.
- Updated PDF/media dependencies and compatible image handling. Receipt logos are read from approved local files, with file-size and image-dimension limits; PDF rendering does not fetch arbitrary logo URLs.
- Build scripts work from Windows terminals as well as Linux. Webpack is pinned to the version compatible with the existing Laravel Mix build plugins.

## Verified

| Check | Result |
| --- | --- |
| PHP regression suite | 19 tests, 59 assertions passed |
| Final PHP/Blade source syntax scan | 646 files checked; no syntax errors |
| Fresh MySQL migration and seeding | Passed |
| Original SQL credentials | Successful login verified |
| Super-admin and store-admin browser login | Passed |
| Dashboard, products, customers, sales and POS pages | Loaded without captured JavaScript errors or failed HTTP responses in the tested flows |
| Purchase and sale workflow | Created product with 15 units; sale of 2 units reduced stock to 13 |
| Actual sale PDF receipt | HTTP 200 and valid PDF output |
| Blade template compilation | Passed |
| Production frontend build | Passed; six existing CSS deprecation warnings |
| Mobile layout at 390 px | Login, dashboard and POS have no page-level horizontal overflow; tables/filters scroll within their containers |
| Dependency platform requirements | Passed on PHP 8.3; Composer resolves for PHP 8.2+ |

Desktop and mobile screenshots are in `docs/previews`. Dependency audit outputs are in `docs/security`.

## Remaining issues and limits

Composer audit still reports four Laravel framework advisories. Laravel 10 is retained. A major framework migration was rejected by automatic approval review because the broad dependency change could disrupt the application and required separate authorization. That migration has not been applied.

The final frontend audit reports 19 affected packages: 6 low, 11 moderate, 2 high, and 0 critical. These affect the older build toolchain, chart/editor/router packages, and their dependencies. The two high entries are the development server and its middleware. The pinned Webpack version has low-severity buildHttp advisories; this project does not enable that feature. The current audit JSON contains the complete list. Critical npm advisories from the original dependency tree were removed through compatible updates and removal of unused/affected packages. This is not a fully security-cleared production release.

The temporary QA setup did not configure real SMTP, SMS, Stripe, PayPal or Razorpay credentials. Those integrations, real email delivery, every report/export variant, every permission combination and every deployment environment have not been verified end to end. Browser checks and stock/PDF tests cover the named flows; they are not a guarantee that every feature is defect-free.

The supplied SQL contains old demo subscription dates. Existing expired subscriptions must be managed through the legitimate subscription workflow. No purchase-code/license checks or subscription restrictions were bypassed.

Follow `LOCAL_SETUP_URDU.md` when applying this package to an existing database. Back up your data and preserve your existing APP_KEY. Use production debug settings, HTTPS, real integration credentials and a supported, patched framework before a live release.
