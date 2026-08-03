const config = {
  absin: {
    apiUrl: import.meta.env.VITE_ABSIN_API_URL || '',
    apiKey: import.meta.env.VITE_ABSIN_API_KEY || '',
    merchantId: import.meta.env.VITE_ABSIN_MERCHANT_ID || 'ABIA-WAY-001',
    enabled: import.meta.env.VITE_ENABLE_ABSIN === 'true',
    mockMode: import.meta.env.VITE_ABSIN_MOCK_MODE !== 'false',
  },
  demo: {
    mockJwtToken: 'mock-jwt-token-for-development',
  },
};

export default config;
