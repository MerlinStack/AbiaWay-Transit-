// This utility helps load Lucide icons dynamically
// Since we're using the CDN version, we can just call the global lucide object

export const loadIcons = () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

// For components that need to ensure icons are loaded after render
export const useIcons = () => {
  if (typeof window !== 'undefined' && window.lucide) {
    setTimeout(() => {
      window.lucide.createIcons();
    }, 0);
  }
};

// Helper to create icon element string for Leaflet markers
export const createBusIconHtml = () => {
  return '<i data-lucide="bus" class="w-5 h-5 text-white"></i>';
};

export const createStopIconHtml = () => {
  return '<i data-lucide="map-pin" class="w-4 h-4 text-white"></i>';
};