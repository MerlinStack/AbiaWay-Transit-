const config = {
  absin: {
    apiUrl: import.meta.env.VITE_ABSIN_API_URL || '',
    apiKey: import.meta.env.VITE_ABSIN_API_KEY || '',
    merchantId: import.meta.env.VITE_ABSIN_MERCHANT_ID || 'ABIA-WAY-001',
    enabled: import.meta.env.VITE_ENABLE_ABSIN === 'true',
    mockMode: import.meta.env.VITE_ABSIN_MOCK_MODE !== 'false',
  },

  demo: {
    adminPassword: import.meta.env.VITE_DEMO_ADMIN_PASSWORD || '',
    driverPassword: import.meta.env.VITE_DEMO_DRIVER_PASSWORD || '',
    passengerPassword: import.meta.env.VITE_DEMO_PASSENGER_PASSWORD || '',
    goldPassword: import.meta.env.VITE_DEMO_GOLD_PASSWORD || '',
    authToken: import.meta.env.VITE_DEMO_AUTH_TOKEN || '',
    mockJwtToken: import.meta.env.VITE_MOCK_JWT_TOKEN || '',
    absinApiKey: import.meta.env.VITE_DEMO_ABSIN_API_KEY || '',
  },
};

export default config;
