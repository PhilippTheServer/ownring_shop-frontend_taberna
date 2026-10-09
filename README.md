# OwnRing Storefront

The shop for the **OwnRing R02**: a single-product page plus cart, checkout (guest or signed in), account and app download. Angular 22, Tailwind CSS 4, Keycloak OIDC/PKCE (optional for shoppers), Stripe Elements and PayPal. Forked from the OpenTaberna storefront.

## Pages

| Route | What it is |
|---|---|
| `/` | The product page: ring and buy box beside the interactive app demo (stacked ring-first on mobile), metrics, app features, about, datasheet, limits, FAQ. `/shop` and `/shop/:id` redirect here. |
| `/cart` | Cart |
| `/checkout` | Checkout. Signed out → guest form (`POST /v1/orders/guest-checkout`); signed in → saved address and the account order flow. No sign-in required. |
| `/account` | Customer account (sign-in required) |
| `/app` | App download after purchase; links come from the product's `custom.app` catalogue field |
| `/impressum`, `/datenschutz`, `/widerruf`, `/produktsicherheit` | Legal pages |

**Sizes:** every ring size is its own catalogue item (SKU `OWNRING-R02-08` … `-13`, `productSkuPrefix` in `storefront.config.ts`) with `size` and `inner_diameter_mm` in its attributes. The page lists them smallest first, greys out sold-out sizes and enables buying once a size is chosen.

All copy lives in `src/app/core/i18n.service.ts` (German default, English); a test fails if a key exists in only one language.

## Design

Dark, matched to the OwnRing app's design tokens (`app/lib/ui/tokens.dart` in the app repository): the colours are defined once in `src/tailwind.css` (`screen`, `card`, `ink`, `muted`, `pulse` and the metric colours `hrv`, `stress`, `spo2`, `steps`). Fonts are Geist and Geist Mono, **self-hosted** from `public/fonts/` (OFL, see `Geist-OFL.txt`) so no visitor request goes to a font CDN.

The store uses the app's actual regular/medium/semibold Geist and regular/medium Geist Mono files, losslessly converted from `app/assets/fonts/*.ttf` to WOFF2. Conversion checks confirm identical glyph outlines, metrics, layout and name tables. The previous variable fonts are unused references: matching family/version names alone did not establish an exact match. Both app and store use tabular figures. The demo matches the app's typography (64px medium live value, 26px medium metric values, 13px labels), with explicit value/unit and label/readout gaps. Browser and Flutter rasterization may still differ. Core colours are background `#050506`, cards `#141416`, text `#f4f4f2`, muted `#8d8d92`, pulse `#fa8785`, HRV `#ad9dff`, stress `#e69c3a`, SpO₂ `#3cbbf9` and steps `#65c67d`.

Pictures live in `public/img/` and are served locally (no visitor requests to COLMi's CDN):

- `colmi-r02-front.webp`, `colmi-r02-inside.webp`, `colmi-r02-thumb.webp` — static black R02 manufacturer product images, used throughout the product page, cart and checkout. Converted to WebP without metadata; front/inside are 1000 × 1000, thumbnail 360 × 360. No floating ring or animated pulse line. Removed sensor pins positioned for the old custom render rather than mislabel this view.
- `ring-hero.webp`, `ring-inside.webp`, `ring-thumb.webp` — unused legacy renders produced by `tools/ring-render/`, retained as reference. Re-running that tool does not replace the current manufacturer images.
- `app-today.webp`, `app-devices.webp` — reference screenshots of the OwnRing app (status bar cropped), no longer displayed on the product page.

**Manufacturer image sources (retrieved 2026-10-09):** [COLMi R02 product page](https://www.colmi.info/products/colmi-r02-smart-ring); [front / Black1](https://www.colmi.info/cdn/shop/files/SmartRingCOLMIR02Black1.jpg?v=1753867892&width=1000), [inside / Black2](https://www.colmi.info/cdn/shop/files/SmartRingCOLMIR02Black2.jpg?v=1753867892&width=1000), [thumbnail / Black3](https://www.colmi.info/cdn/shop/files/SmartRingCOLMIR02Black3.jpg?v=1753867892&width=1000). These appear to be manufacturer renders, not confirmed photographs. They are third-party COLMi imagery, not covered by this repository's Apache licence; permission for commercial reuse has **not** been verified and must be confirmed before public commercial publication.

The landing hero embeds `src/app/components/app-demo.component.ts`, a lightweight simulation of the Today and Devices screens. Visitors can expand the five metrics, switch day/week/month/year, start/stop a sample live-pulse display, simulate sync and connect/disconnect, and switch German/English. While started, invented live pulse values and the curve update every **3.5 seconds**; stopping, disconnecting or leaving the page cancels the timer. All readings are invented and labelled as sample data; the demo needs no backend, Bluetooth, login or additional dependency. It is not the Flutter app and does not reproduce real measurement warm-up or ring discovery.

## Configuration

The defaults match the development stack:

- Storefront: `http://localhost:4300`
- API: proxied from `/api` to `http://host.docker.internal:8000`
- Keycloak: `http://localhost:8080`, realm `opentaberna`, client `opentaberna-store-ui`

Set `stripePublishableKey` (and `paypalClientId` for PayPal) in `src/app/storefront.config.ts` before testing payment.

### Monitoring

OwnRing enables the inherited OpenTaberna error reporter and shopper analytics in `src/app/storefront.config.ts`. The API must also set `FRONTEND_ERRORS_ENABLED=true` and `STOREFRONT_ANALYTICS_ENABLED=true`; the umbrella's local compose does this. These are build-time flags: rebuild the frontend after changing them. Global browser errors and unhandled promise rejections are forwarded through Angular's `ErrorHandler`, alongside Angular errors.

Errors remain batched and rate/session capped, with delivery failures swallowed; analytics uses a per-tab session ID and strips route queries/fragments. The admin Errors and Analytics pages display the collected records. No vendor SDK or external telemetry destination was added. Messages/stacks may contain sensitive data, and records persist on the API even after a tab closes. The privacy page describes collection; consent/legal basis, redaction and deletion policies still need review before public deployment. The monitoring stack and its limits are documented in the umbrella's `docs/deployment.md`.

## Run with Docker

```bash
docker compose up --build -d
```

Open `http://localhost:4300`. The Keycloak realm must contain the storefront redirect/web origin for this exact port, as provided by the backend realm import.

## Test

```bash
npm test            # unit tests (Vitest)
npx ng build        # production build
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

## Licence

Apache License 2.0 — see [LICENSE](LICENSE). Geist fonts: SIL Open Font License 1.1.
