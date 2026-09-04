import http from 'http';
import https from 'https';

/**
 * StreamSession manages a single shared upstream MJPEG connection
 * to an ESP32-CAM and distributes the raw multipart chunks to
 * multiple connected HTTP clients simultaneously.
 */
class StreamSession {
  constructor(deviceId, upstreamUrl) {
    this.deviceId = deviceId;
    this.upstreamUrl = upstreamUrl;
    this.clients = new Set();
    this.upstreamReq = null;
    this.upstreamRes = null;
    this.reconnectTimeout = null;
    this.isConnecting = false;
  }

  /**
   * Add a new client viewer response to the session
   */
  addClient(req, res) {
    // Set streaming HTTP headers
    res.writeHead(200, {
      'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    this.clients.add(res);
    console.log(`[STREAM RELAY] Viewer joined ${this.deviceId}. Active viewers: ${this.clients.size}`);

    // If first viewer, initiate shared upstream connection
    if (!this.upstreamReq && !this.isConnecting) {
      this.startUpstream();
    }

    // Clean up when client disconnects
    const cleanup = () => {
      if (this.clients.has(res)) {
        this.clients.delete(res);
        console.log(`[STREAM RELAY] Viewer disconnected from ${this.deviceId}. Active viewers: ${this.clients.size}`);
        if (this.clients.size === 0) {
          this.stopUpstream();
        }
      }
    };

    req.on('close', cleanup);
    res.on('close', cleanup);
    res.on('error', (err) => {
      console.warn(`[STREAM RELAY] Client response socket error: ${err.message}`);
      cleanup();
    });
  }

  /**
   * Establish single upstream connection to ESP32-CAM
   */
  startUpstream() {
    if (this.clients.size === 0) return;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.isConnecting = true;
    console.log(`[STREAM RELAY] Opening 1 shared upstream connection to: ${this.upstreamUrl}`);

    try {
      const parsedUrl = new URL(this.upstreamUrl);
      const httpModule = parsedUrl.protocol === 'https:' ? https : http;

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'User-Agent': 'AWARE-Node-Relay/1.0',
          'Accept': 'multipart/x-mixed-replace, image/jpeg, */*'
        },
        timeout: 10000
      };

      this.upstreamReq = httpModule.request(options, (upstreamRes) => {
        this.isConnecting = false;
        this.upstreamRes = upstreamRes;

        if (upstreamRes.statusCode !== 200) {
          console.warn(`[STREAM RELAY] Upstream camera returned status ${upstreamRes.statusCode}`);
          this.handleUpstreamDisconnect();
          return;
        }

        console.log(`[STREAM RELAY] Upstream camera connection active for ${this.deviceId}`);

        upstreamRes.on('data', (chunk) => {
          // Distribute raw frame chunk to all connected clients
          for (const clientRes of this.clients) {
            if (!clientRes.writableEnded && clientRes.writable) {
              try {
                const canWrite = clientRes.write(chunk);
                if (!canWrite) {
                  // Buffer full: slow client handling
                }
              } catch (err) {
                console.error(`[STREAM RELAY] Failed to write chunk to client: ${err.message}`);
                this.clients.delete(clientRes);
              }
            } else {
              this.clients.delete(clientRes);
            }
          }
        });

        upstreamRes.on('end', () => {
          console.log(`[STREAM RELAY] Upstream camera stream ended`);
          this.handleUpstreamDisconnect();
        });

        upstreamRes.on('error', (err) => {
          console.error(`[STREAM RELAY] Upstream camera stream error: ${err.message}`);
          this.handleUpstreamDisconnect();
        });
      });

      this.upstreamReq.on('timeout', () => {
        console.warn(`[STREAM RELAY] Upstream camera connection timed out`);
        if (this.upstreamReq) {
          try { this.upstreamReq.destroy(); } catch {}
        }
        this.handleUpstreamDisconnect();
      });

      this.upstreamReq.on('error', (err) => {
        console.warn(`[STREAM RELAY] Upstream camera connection error: ${err.message}`);
        this.handleUpstreamDisconnect();
      });

      this.upstreamReq.end();
    } catch (err) {
      console.error(`[STREAM RELAY] Error initiating upstream request: ${err.message}`);
      this.handleUpstreamDisconnect();
    }
  }

  /**
   * Handle upstream disconnect and schedule auto-reconnect if viewers remain
   */
  handleUpstreamDisconnect() {
    this.isConnecting = false;
    if (this.upstreamReq) {
      try { this.upstreamReq.destroy(); } catch {}
      this.upstreamReq = null;
    }
    this.upstreamRes = null;

    if (this.clients.size > 0 && !this.reconnectTimeout) {
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectTimeout = null;
        if (this.clients.size > 0) {
          console.log(`[STREAM RELAY] Retrying upstream connection for ${this.deviceId}...`);
          this.startUpstream();
        }
      }, 3000);
    }
  }

  /**
   * Close upstream connection when viewer count reaches zero
   */
  stopUpstream() {
    console.log(`[STREAM RELAY] Zero viewers for ${this.deviceId}. Closing upstream ESP32 connection.`);
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.isConnecting = false;
    if (this.upstreamReq) {
      try { this.upstreamReq.destroy(); } catch {}
      this.upstreamReq = null;
    }
    this.upstreamRes = null;
  }
}

class StreamRelayService {
  constructor() {
    this.sessions = new Map();
  }

  /**
   * Resolve upstream camera stream URL for a given deviceId
   */
  getUpstreamUrl(deviceId) {
    if (process.env.ESP32_STREAM_URL) {
      return process.env.ESP32_STREAM_URL;
    }
    return 'http://192.168.1.19:81/stream';
  }

  /**
   * Handle incoming GET /api/live/stream/:deviceId request
   */
  handleStreamRequest(deviceId, req, res) {
    const targetId = deviceId || 'ESP32-CAM-001';
    let session = this.sessions.get(targetId);

    if (!session) {
      const upstreamUrl = this.getUpstreamUrl(targetId);
      session = new StreamSession(targetId, upstreamUrl);
      this.sessions.set(targetId, session);
    }

    session.addClient(req, res);
  }
}

export { 
  getPublicLiveStreamUrl, 
  getCurrentPublicBaseUrl 
} from './cloudflareTunnelService.js';

export const streamRelayService = new StreamRelayService();
export default streamRelayService;
