/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ABSIN_API_URL: string
  readonly VITE_ABSIN_API_KEY: string
  readonly VITE_ABSIN_MERCHANT_ID: string
  readonly VITE_ENABLE_ABSIN: string
  readonly VITE_ABSIN_MOCK_MODE: string

  readonly VITE_DEMO_ADMIN_PASSWORD: string
  readonly VITE_DEMO_DRIVER_PASSWORD: string
  readonly VITE_DEMO_PASSENGER_PASSWORD: string
  readonly VITE_DEMO_GOLD_PASSWORD: string

  readonly VITE_DEMO_AUTH_TOKEN: string
  readonly VITE_MOCK_JWT_TOKEN: string
  readonly VITE_DEMO_ABSIN_API_KEY: string
  readonly VITE_DEMO_ABSIN_PIN: string
  readonly VITE_DEMO_ABSIN_CARDS: string
  readonly VITE_DEMO_BANK_CARDS: string

  readonly VITE_PAYSTACK_PUBLIC_KEY: string
  readonly VITE_TICKET_SIGNING_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
