// Type declaration for Google API
declare global {
  interface Window {
    gapi?: {
      load: (api: string, callback: () => void) => void;
      client: unknown;
      auth2: unknown;
    };
  }
}

// Google API Loader utility
let isGoogleApiLoaded = false;
let isGoogleApiLoading = false;
let loadPromise: Promise<void> | null = null;

export const loadGoogleApi = (): Promise<void> => {
  if (isGoogleApiLoaded) {
    return Promise.resolve();
  }

  if (isGoogleApiLoading && loadPromise) {
    return loadPromise;
  }

  isGoogleApiLoading = true;
  loadPromise = new Promise((resolve, reject) => {
    // Check if gapi is already available
    if (typeof window !== 'undefined' && window.gapi) {
      isGoogleApiLoaded = true;
      isGoogleApiLoading = false;
      resolve();
      return;
    }

    // Load the Google API script
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Wait for gapi to be available
      const checkGapi = () => {
        if (typeof window !== 'undefined' && window.gapi) {
          isGoogleApiLoaded = true;
          isGoogleApiLoading = false;
          resolve();
        } else {
          setTimeout(checkGapi, 100);
        }
      };
      checkGapi();
    };
    
    script.onerror = () => {
      isGoogleApiLoading = false;
      loadPromise = null;
      reject(new Error('Failed to load Google API script'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};

// Type declaration for Google API
declare global {
  interface Window {
    gapi?: {
      load: (api: string, callback: () => void) => void;
      client: unknown;
      auth2: unknown;
    };
  }
}

export const isGoogleApiReady = (): boolean => {
  return isGoogleApiLoaded && typeof window !== 'undefined' && !!window.gapi;
};
