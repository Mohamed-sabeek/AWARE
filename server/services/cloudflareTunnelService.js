import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory active tunnel state
let currentPublicBaseUrl = null;
let lastDetectedAt = null;
let detectionSource = 'none';
let fileWatcherActive = false;

// Shared file paths monitored for tunnel URL updates
const TUNNEL_FILE_CANDIDATES = [
  path.resolve(__dirname, '..', '.tunnel_url'),
  path.resolve(__dirname, '..', '..', '.tunnel_url'),
  path.resolve(os.tmpdir(), '.aware_tunnel_url'),
  path.resolve(__dirname, '..', 'cloudflared.log'),
  path.resolve(__dirname, '..', 'logs', 'cloudflared.log')
];

/**
 * Extract trycloudflare.com URL from raw text or log content
 * @param {string} text 
 * @returns {string|null}
 */
export const extractTunnelUrl = (text) => {
  if (!text || typeof text !== 'string') return null;
  const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/i);
  return match ? match[0].trim() : null;
};

/**
 * Set the currently active Cloudflare tunnel URL
 * @param {string} newUrl 
 * @param {string} source 
 * @returns {boolean} true if updated
 */
export const setTunnelUrl = (newUrl, source = 'manual') => {
  if (!newUrl || typeof newUrl !== 'string') return false;

  const cleanedUrl = newUrl.trim().replace(/\/+$/, '');
  const isValidTunnel = /^https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com$/i.test(cleanedUrl) ||
                        /^https?:\/\/[a-zA-Z0-9.-]+(?::[0-9]+)?$/i.test(cleanedUrl);

  if (!isValidTunnel) {
    console.warn(`[Cloudflare] Invalid tunnel URL format ignored: ${newUrl}`);
    return false;
  }

  if (currentPublicBaseUrl !== cleanedUrl) {
    if (!currentPublicBaseUrl) {
      console.log(`[Cloudflare] Public tunnel URL detected:\n${cleanedUrl}`);
    } else {
      console.log(`[Cloudflare] Public tunnel URL changed\nOld: ${currentPublicBaseUrl}\nNew: ${cleanedUrl}`);
    }

    currentPublicBaseUrl = cleanedUrl;
    lastDetectedAt = new Date().toISOString();
    detectionSource = source;

    // Cache to local sync file for fast reload / cross-process discovery
    try {
      const targetFile = path.resolve(__dirname, '..', '.tunnel_url');
      fs.writeFileSync(targetFile, cleanedUrl, 'utf8');
    } catch {
      // Ignore file write errors
    }

    return true;
  }

  return false;
};

/**
 * Get the currently active public base URL
 * Priority:
 * 1. Currently detected active Cloudflare Quick Tunnel URL
 * 2. Optional configured PUBLIC_LIVE_STREAM_BASE_URL fallback (if static or explicitly configured)
 * 3. null
 * @returns {string|null}
 */
export const getCurrentPublicBaseUrl = () => {
  if (currentPublicBaseUrl) {
    return currentPublicBaseUrl;
  }

  // Fallback to environment variable if configured and not empty
  const envUrl = process.env.PUBLIC_LIVE_STREAM_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  return null;
};

/**
 * Generate public live stream URL for an incident or sensor alert
 * @param {string} deviceId 
 * @returns {string|null}
 */
export const getPublicLiveStreamUrl = (deviceId = 'ESP32-CAM-001') => {
  const targetId = deviceId || 'ESP32-CAM-001';
  const baseUrl = getCurrentPublicBaseUrl();

  if (!baseUrl) {
    console.warn('[Live Stream] Warning: No public live-stream URL currently available. Incident created without liveStreamUrl.');
    return null;
  }

  const liveUrl = `${baseUrl}/api/live/stream/${targetId}`;
  console.log(`[Live Stream] Incident live URL:\n${liveUrl}`);
  return liveUrl;
};

/**
 * Get status info for /api/live/status endpoint
 * @returns {object}
 */
export const getTunnelStatus = () => {
  const baseUrl = getCurrentPublicBaseUrl();
  return {
    active: !!baseUrl,
    publicBaseUrl: baseUrl,
    source: currentPublicBaseUrl ? detectionSource : (baseUrl ? 'env_fallback' : 'none'),
    lastUpdated: lastDetectedAt
  };
};

/**
 * Read candidate tunnel files and sync memory state
 */
const checkTunnelFiles = () => {
  for (const filePath of TUNNEL_FILE_CANDIDATES) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const detected = extractTunnelUrl(content);
        if (detected) {
          setTunnelUrl(detected, `file:${path.basename(filePath)}`);
          break;
        }
      }
    } catch {
      // Ignore file read errors
    }
  }
};

/**
 * Start background file & tunnel log watcher
 */
export const startTunnelWatcher = () => {
  if (fileWatcherActive) return;
  fileWatcherActive = true;

  // Immediate check on startup
  checkTunnelFiles();

  // Periodic check every 3 seconds for tunnel changes/restarts
  setInterval(() => {
    checkTunnelFiles();
  }, 3000);

  console.log('[Cloudflare] Dynamic Quick Tunnel URL watcher initialized.');
};

export default {
  getCurrentPublicBaseUrl,
  getPublicLiveStreamUrl,
  setTunnelUrl,
  getTunnelStatus,
  startTunnelWatcher,
  extractTunnelUrl
};
