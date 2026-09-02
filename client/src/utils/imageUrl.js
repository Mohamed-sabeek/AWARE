/**
 * Helper to resolve evidence image URLs.
 * Converts relative paths like `/uploads/evidence-xxx.jpg` to full backend URLs
 * supporting both localhost and local LAN IP environments (e.g. http://172.17.144.124:5009).
 */
export const getEvidenceImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  
  // Return absolute or data URLs as-is
  if (
    url.startsWith('http://') || 
    url.startsWith('https://') || 
    url.startsWith('data:') || 
    url.startsWith('blob:')
  ) {
    return url;
  }

  let backendBase = '';
  const envApiUrl = import.meta.env.VITE_API_URL;
  
  if (envApiUrl) {
    backendBase = envApiUrl.replace(/\/api\/?$/, '');
  } else if (typeof window !== 'undefined' && window.location?.hostname) {
    backendBase = `http://${window.location.hostname}:5009`;
  } else {
    backendBase = 'http://localhost:5009';
  }

  // If accessed via LAN IP (e.g., 172.17.144.124) but env was localhost, adapt dynamically
  if (
    typeof window !== 'undefined' && 
    window.location?.hostname && 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1' &&
    (backendBase.includes('localhost') || backendBase.includes('127.0.0.1'))
  ) {
    backendBase = backendBase
      .replace('localhost', window.location.hostname)
      .replace('127.0.0.1', window.location.hostname);
  }

  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${backendBase}${cleanPath}`;
};

export default getEvidenceImageUrl;
