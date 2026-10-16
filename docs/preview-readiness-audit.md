# Flatel Hospitality preview-readiness audit

Audit date: 2026-10-16  
Scope: local repository and `http://localhost:3000`; no production deployment or live payment was performed.

## Route checklist

The build discovered the routes below. “BLOCKED” means the route was opened where noted, but the full content, interactions, or authenticated business flow could not be verified safely or completely. Dynamic routes were checked with representative values only.

| Route | Status | Evidence / remaining check |
| --- | --- | --- |
| `/` | FIXED | Opened after fixes; filter selection showed only the 2 BHK residence, branch selection updated the active branch, and FAQ expansion was exercised. No broken images or horizontal overflow at default browser size. |
| `/properties` | FIXED | Opened after fixes; direct render checked with no broken images or horizontal overflow. Existing tablet filter correction retained. |
| `/properties/[slug]` | FIXED | 1/2/3/4 BHK representative slugs opened; 1 BHK gallery opened and closed successfully. No booking or payment submitted. No broken images or default-width overflow. |
| `/branches` | FIXED | Opened after fixes; displayed current branch cards without broken images or horizontal overflow. Branch selection tested from the homepage map/selector. |
| `/branches/[slug]` | FIXED | Both Moghal Pura and Barkas Salala opened after fixes; no broken images or default-width overflow. Owner confirmation of property-specific facts is still needed. |
| `/hospitals` | FIXED | Opened after fixes; search for Apollo filtered the directory to the matching record. Contact numbers and unsupported travel-time claims were removed. Address/specialty accuracy still needs owner review. |
| `/about` | FIXED | Opened after fixes with expected page heading and no broken images/default-width overflow. Full operational claim review remains open. |
| `/policies` | BLOCKED | Opened after fixes. Policy text was aligned to the PRD check-in/out wording; business owner must confirm it remains current operational policy. |
| `/list-property` | FIXED | Opened after fixes; fields have explicit labels. Submission was not sent to WhatsApp or another recipient. Recipient/lead handling still needs owner confirmation. |
| `/checkout` | BLOCKED | Empty-state behavior verified. A checkout with an active reservation, validation, and payment hand-off was not submitted in this pass. Owner reports the sandbox setup and tests in items 1–2 are complete; they were not independently rerun here. |
| `/booking-confirmation/[id]` | FIXED | Invalid reference settled to the expected “Booking Record Not Found” state after loading. Valid booking/voucher state not independently rechecked. |
| `/my-bookings` | BLOCKED | Guest portal eventually rendered after its loading state. Authenticated lookup and privacy behavior were not rechecked in this pass. |
| `/rooms/[id]` | FIXED | Legacy `/rooms/1bhk` redirected to `/properties/1bhk`. |
| `/admin` | FIXED | Previously verified to enter the protected admin route. |
| `/admin/login` | FIXED | Previously verified to route into protected admin access; demo login remains removed. |
| `/admin/dashboard` | FIXED | Owner session loaded dashboard and recent bookings; read-only refresh succeeded. Collection actions were not triggered. |
| `/admin/bookings` | BLOCKED | Owner session loaded the ledger; status filtering and no-results search were checked. Status and collection mutations remain untested. |
| `/admin/inventory` | FIXED | Owner session loaded inventory and the add-residence dialog. The dialog now starts empty and requires verified details; no inventory changes were submitted. |
| `/admin/services` | FIXED | Owner session loaded services and changed the purpose tab. The add-service dialog now requires an explicit price; no service changes were submitted. |
| `/admin/calendar` | FIXED | Owner session loaded the calendar. The blackout form now starts blank; no blackout was added or removed. |
| `/_not-found` | FIXED | Unknown `/not-a-page` showed the custom 404 and a working home link. |

## API inventory

Discovered APIs: `/api/admin/auth`, `/api/admin/stats`, `/api/admin/bookings`, `/api/admin/calendar`, `/api/admin/inventory`, `/api/admin/services`, `/api/bookings/[id]`, `/api/bookings/[id]/voucher`, `/api/bookings/availability`, `/api/bookings/create`, `/api/bookings/my-bookings`, `/api/bookings/verify-payment`, `/api/inventory`, `/api/services`, `/api/webhooks/razorpay`.

The admin stats endpoint returned 401 without credentials; owner-authenticated admin read views and refresh requests succeeded. Admin mutations, guest-specific booking APIs, database RPC behavior, Razorpay order/payment callbacks, and notifications remain unverified. The owner reports the isolated preview Supabase project and test credentials are configured. No booking, inventory, service, blackout, payment, email, production data, or migration was changed during the admin review.

## Confirmed changes

- Removed demo admin login paths, client-side demo identity, and universal sample OTP. Admin access now requires the configured owner identity; admin API bearer tokens require a strong configured secret and are signature/age checked.
- Removed client-controlled payment sandbox trust and mock payment/order success paths. Razorpay confirmation is server-verified; a real booking requires the gateway and persisted booking path.
- Inventory errors no longer fall back to mock inventory or claim availability. Homepage/catalog/branch cards use live inventory and expose loading/error/empty states.
- Added an atomic availability-and-booking RPC migration and owner-only booking-row policies. These migrations are written but not applied.
- Aligned the database `stay_purpose` constraint with the existing checkout choices, including accommodation-only and wedding. The incremental migration is pending application.
- Removed fabricated review/rating and unsupported savings-comparison content, removed the digital-key claim, corrected the payment-provider FAQ, and added a custom 404.
- Corrected local date-only search parsing and fixed the properties filter row at tablet width; responsive overflow checks covered 1440, 1280, 768, 390, and 360 CSS pixels.
- Fixed the Flatel Experience amenity filter row clipping at desktop widths: all seven tabs fit at 1280px, wrap without overflow at 1024px, and remain horizontally swipeable on mobile.
- Completed authenticated, read-only checks of all five admin sections. Added a usable bookings search/filter layout at narrower desktop widths, accessible names for admin controls, and confirmation prompts before recording arrival collections, cancelling a booking, or removing a calendar blackout.
- Removed the unsupported Supabase phone OTP option from guest login and registration. Guest accounts now use email/password, with a name for the profile; phone is collected during reservation checkout. Email-confirmation-required signups now receive an accessible success message.
- Removed fabricated defaults from new residence, add-on service, and calendar forms. New residence creation now requires verified listing facts, pricing, capacity, branch, and images; inventory, service, and blackout APIs validate their submitted values server-side.
- Made blackout date iteration UTC-stable and reject invalid date ranges and unknown residence units.
- Build uses Next’s webpack builder because the default Turbopack build failed to start its CSS worker in this environment. The Next docs under `node_modules/next/dist/docs/` were consulted before code changes, per repository instructions.

## Validation

| Check | Result | Evidence |
| --- | --- | --- |
| Production build | PASS | Final `npm run build` using the documented webpack builder compiled and prerendered 46/46 pages. An initial sandbox run hit `EPERM`; the same build passed with generated-file write access. |
| TypeScript | PASS | `npx tsc --noEmit` exited 0; the final production build’s TypeScript phase also passed. |
| Design detector | PASS | `npm run lint:design` exited 0. |
| ESLint | PASS | `npm run lint` exited 0 with no warnings or errors after fixing the unused imports/hooks and related issues; no lint suppression added. |
| Automated tests | NOT RUN | `package.json` has no test script. Existing `scripts/test-*.ts` are not wired to a runner; a stale hospital script assertion was aligned with the current record schema. |
| Browser route checks | PARTIAL | 18 public paths (including representative dynamic paths, invalid confirmation, legacy redirect, and 404) and the seven protected/admin paths were opened. Routes were checked for heading/render state, broken images, and horizontal overflow at the default browser viewport. Critical homepage filter, branch selection, FAQ expansion, hospital search, and property gallery open/close were exercised. This was not a full top-to-bottom interaction audit of every page. |
| Authenticated admin | PARTIAL | Dashboard refresh, bookings status filter/search empty state, inventory and service read views/category switch, and calendar read view were checked in the owner session. Mutating operations were intentionally not submitted against existing records. |
| Responsive browser checks | PARTIAL | Current pass checked homepage, catalog, residence detail, branch detail, and lead form at 390px; no horizontal overflow. The Flatel Experience tabs now fit at 1280px, wrap at 1024px, and remain swipeable at 768px. Earlier checks covered 1440/1280/768/390/360 for homepage and properties. Full route-by-route responsive screenshots were not captured. |
| Console/network | PARTIAL | No browser runtime errors were observed in the latest public route checks or authenticated admin session. Earlier development sessions logged Next Image `sizes`/LCP performance warnings; image sizing/loading was adjusted. A complete failed-network-request audit was not completed. |
| Accessibility | PARTIAL | Input names/labels checked on representative pages, including explicit labels on lead form fields and an accessible hospital search; gallery and branch selection expose named controls. Automated axe/WCAG contrast measurement and full keyboard/screen-reader review were not run. |
| Security | PARTIAL | Demo auth paths removed; unauthenticated admin stats returned 401, and the owner session loaded authenticated admin read views. Admin writes, dependency scan, and sandbox secret/key types were not independently verified. |
| Preview deployment | NOT RUN | No Vercel preview deployment, preview access-protection check, or production deployment was performed. |

## Remaining blockers and open checks

1. [OWNER-REPORTED COMPLETE; NOT RECHECKED IN THIS PASS] User reports the three SQL migrations were applied and validated on the isolated Supabase project. This pass did not connect to Supabase or independently verify backups/rollback.
2. [OWNER-REPORTED COMPLETE; NOT RECHECKED IN THIS PASS] User reports non-production Supabase and Razorpay test credentials and the sandbox lifecycle tests are complete. Credentials were not read or printed and no payment/guest-data test was rerun in this pass.
3. [COMPLETE] Fixed ESLint errors and reviewed remaining warnings; final `npm run lint` exits 0 with no warnings.
4. [PARTIAL] Public routes and representative controls were rechecked after fixes. Authenticated admin read-only views passed; booking status/collection, inventory/service saves and deletes, and calendar block creation/removal need a disposable test record or explicit test data before they can be safely exercised. Full-page route-by-route copy/interaction checks, automated contrast scans, and exhaustive network review remain incomplete. Confirm property-specific distances, amenities, capacity, and operational claims with the owner where the PRD does not establish them.
5. Create a separate Vercel Preview Deployment and verify client access/protection and its preview environment variables. This local build does not establish preview-deployment readiness.

## Verdict

**NOT READY** — Final local build, TypeScript, design lint, and ESLint pass. Public route/render checks and representative interactions pass. The owner reports checklist items 1 and 2 complete, but this pass did not independently verify Supabase/payment flows. Authenticated admin read-only views pass, while mutating workflows still need disposable test data. The full-page/a11y/network audit and property-claim confirmation are incomplete, and no Vercel Preview Deployment was created or verified.
