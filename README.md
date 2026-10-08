# OwnRing Storefront

The shop for the **OwnRing R02**: a single-product page plus cart, checkout (guest or signed in), account and app download. Angular 22, Tailwind CSS 4, Keycloak OIDC/PKCE (optional for shoppers), Stripe Elements and PayPal. Forked from the OpenTaberna storefront.

## Pages

| Route | What it is |
|---|---|
| `/` | The product page: hero and buy box with the size picker, metrics, why OwnRing, the app, about, datasheet, limits, FAQ. `/shop` and `/shop/:id` redirect here. |
| `/cart` | Cart |
| `/checkout` | Checkout. Signed out → guest form (`POST /v1/orders/guest-checkout`); signed in → saved address and the account order flow. No sign-in required. |
| `/account` | Customer account (sign-in required) |
| `/app` | App download after purchase; links come from the product's `custom.app` catalogue field |
| `/impressum`, `/datenschutz`, `/widerruf`, `/produktsicherheit` | Legal pages |

**Sizes:** every ring size is its own catalogue item (SKU `OWNRING-R02-08` … `-13`, `productSkuPrefix` in `storefront.config.ts`) with `size` and `inner_diameter_mm` in its attributes. The page lists them smallest first, greys out sold-out sizes and enables buying once a size is chosen.

All copy lives in `src/app/core/i18n.service.ts` (German default, English); a test fails if a key exists in only one language.

## Design

Dark, matched to the OwnRing app's design tokens (`app/lib/ui/tokens.dart` in the app repository): the colours are defined once in `src/tailwind.css` (`screen`, `card`, `ink`, `muted`, `pulse` and the metric colours `hrv`, `stress`, `spo2`, `steps`). Fonts are Geist and Geist Mono, **self-hosted** from `public/fonts/` (OFL, see `Geist-OFL.txt`) so no visitor request goes to a font CDN.

Pictures live in `public/img/` and can be replaced by photos with the same file names:

- `ring-hero.webp`, `ring-inside.webp`, `ring-thumb.webp` — renders of the R02, produced by `tools/ring-render/` (see its README).
- `app-today.webp`, `app-devices.webp` — screenshots of the OwnRing app (status bar cropped).

## Configuration

The defaults match the development stack:

- Storefront: `http://localhost:4300`
- API: proxied from `/api` to `http://host.docker.internal:8000`
- Keycloak: `http://localhost:8080`, realm `opentaberna`, client `opentaberna-store-ui`

Set `stripePublishableKey` (and `paypalClientId` for PayPal) in `src/app/storefront.config.ts` before testing payment.

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
