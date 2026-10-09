export const storefrontConfig = {
  apiUrl: '/api/v1',
  /** The one product this storefront sells; one SKU per ring size (OWNRING-R02-08 … -13). */
  productSkuPrefix: 'OWNRING-R02-',
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'opentaberna',
    clientId: 'opentaberna-store-ui',
  },
  stripePublishableKey: '',

  /**
   * PayPal Checkout (smart buttons / Orders API).
   *
   * `clientId` is the public PayPal REST client id (safe to ship to the
   * browser). Leave it empty to hide the PayPal option at checkout — the
   * customer then pays with a card via Stripe only. The backend must have
   * matching PAYPAL_* credentials configured for the option to work.
   */
  paypalClientId: '',

  /**
   * Anonymous shopper telemetry.
   *
   * Enabled for the OwnRing local monitoring stack. Also requires
   * STOREFRONT_ANALYTICS_ENABLED on the API, which
   * otherwise answers the ingest endpoint with a 404.
   *
   * Uses a per-tab identifier, not a tracking cookie. Review privacy and consent
   * requirements before public deployment. Point `endpoint` elsewhere to use a
   * different backend — no page imports an analytics library directly.
   */
  analytics: {
    enabled: true,
    endpoint: '/api/v1/analytics/events',
  },

  /**
   * Uncaught error reporting.
   *
   * Enabled for OwnRing. Requires FRONTEND_ERRORS_ENABLED on the
   * API, which otherwise answers the endpoint with a 404.
   */
  errorReporting: {
    enabled: true,
    endpoint: '/api/v1/telemetry/errors',
  },
} as const;
