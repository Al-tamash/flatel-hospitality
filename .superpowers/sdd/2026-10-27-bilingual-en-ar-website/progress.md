# SDD ledger — plan: docs/superpowers/plans/2026-10-27-bilingual-en-ar-website.md

Pre-flight scan:
- Task 1 produces: Locale, Dictionary, getDictionary, getLocaleFromPath, Cairo font. Consumed by Tasks 2, 3, 4, 5. Clean.
- Task 2 produces: LanguageSwitcher, localized SiteHeader/SiteFooter. Consumed by Task 4. Clean.
- Task 3 produces: LocalizedRoomDetail, getLocalizedRoom, getLocalizedRooms. Consumed by Tasks 4, 5. Clean.
- Task 4 produces: app/ar route tree. Consumed by Task 5, 7. Clean.
- Task 5 produces: localized checkout, booking-confirmation. Consumed by Task 6. Clean.
- Task 6 produces: /api/bookings/[id]/voucher?lang=ar. Consumed by Task 7. Clean.
- Task 7 produces: visual QA and production build verification. Clean.

Task 1: complete (commit 6b32ada, tests: npx tsx tests/i18n/dictionaries.test.ts -> pass)

Task 2: complete (commit 012814d, tests: npx tsx tests/i18n/language-switcher.test.ts -> pass)

Task 3: complete (commit 6411f3b, tests: npx tsx tests/i18n/room-localizer.test.ts -> pass)

Task 4: complete (commit 8fdbac4, build verification: npm run build 61/61 routes passed)

Task 5: complete (commit b3a7c2b, tests: npx tsx tests/i18n/checkout-confirmation.test.ts -> pass, build: npm run build 63/63 routes passed)

Task 6: complete (commit 50078eb, tests: npx tsx tests/i18n/arabic-voucher.test.ts -> pass, dual-mode /api/bookings/[id]/voucher?lang=ar implemented with Amiri TTF & shaping)

Task 7: complete (Code review fixes: query preservation, localized navigation & Arabic UI text in booking-sidebar, branch-detail-view, booking-search, featured-flats, and hospital-directory-view; tests 5/5 suites pass, npm run build 63/63 routes pass)


