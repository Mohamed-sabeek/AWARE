import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_ROOT = path.resolve(__dirname, '..');
const TUNNEL_FILE = path.resolve(SERVER_ROOT, '.tunnel_url');

const BACKEND_PORT = process.env.PORT || 5009;
const TARGET_LOCAL_URL = `http://localhost:${BACKEND_PORT}`;

console.log('====================================================');
console.log(' [AWARE] Starting Dynamic Cloudflare Quick Tunnel   ');
console.log(` Target local URL: ${TARGET_LOCAL_URL}              `);
console.log('====================================================\n');

/**
 * Notify running AWARE backend server of the detected tunnel URL
 */
const notifyBackend = (tunnelUrl) => {
  try {
    const postData = JSON.stringify({ url: tunnelUrl });
    const req = http.request({
      hostname: 'localhost',
      port: BACKEND_PORT,
      path: '/api/live/tunnel-url',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 3000
    }, (res) => {
      // Backend notified successfully
    });

    req.on('error', () => {
      // Backend may be starting up; the .tunnel_url file watcher will catch it
    });

    req.write(postData);
    req.end();
  } catch {
    // Ignore notification errors
  }
};

/**
 * Handle a detected Cloudflare tunnel URL
 */
let lastUrl = null;
const handleDetectedUrl = (tunnelUrl) => {
  const cleaned = tunnelUrl.trim().replace(/\/+$/, '');
  if (cleaned !== lastUrl) {
    lastUrl = cleaned;
    console.log('\n====================================================');
    console.log(' [AWARE] Cloudflare Quick Tunnel is LIVE!');
    console.log(` Public Live Stream Base URL: ${cleaned}`);
    console.log(` Camera Stream Endpoint:     ${cleaned}/api/live/stream/ESP32-CAM-001`);
    console.log('====================================================\n');

    // 1. Write to .tunnel_url file
    try {
      fs.writeFileSync(TUNNEL_FILE, cleaned, 'utf8');
    } catch (err) {
      console.warn('Could not write .tunnel_url file:', err.message);
    }

    // 2. Notify backend endpoint
    notifyBackend(cleaned);
  }
};

// Determine executable path
const LOCAL_BIN_NAME = 'cloudflared-windows-amd64.exe';
const LOCAL_BIN_PATH = path.resolve(SERVER_ROOT, LOCAL_BIN_NAME);

const getExecutable = () => {
  if (fs.existsSync(LOCAL_BIN_PATH)) {
    return LOCAL_BIN_PATH;
  }
  return 'cloudflared';
};

// Spawn cloudflared tunnel
const runTunnel = () => {
  const binaryPath = getExecutable();
  console.log(`Executing: ${binaryPath} tunnel --url ${TARGET_LOCAL_URL} ...\n`);

  const child = spawn(binaryPath, ['tunnel', '--url', TARGET_LOCAL_URL], {
    cwd: SERVER_ROOT,
    env: process.env,
    windowsHide: true
  });

  const processOutput = (data) => {
    const str = data.toString();
    process.stdout.write(str);

    const match = str.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/i);
    if (match) {
      handleDetectedUrl(match[0]);
    }
  };

  child.stdout.on('data', processOutput);
  child.stderr.on('data', processOutput);

  child.on('error', (err) => {
    console.error('\n[Error] Failed to spawn cloudflared binary:');
    console.error(err.message);
    console.error(`Binary path attempted: ${binaryPath}`);
  });

  child.on('close', (code) => {
    console.log(`\ncloudflared process exited with code ${code}.`);
    if (code !== 0) {
      console.log('Restarting tunnel in 5 seconds...');
      setTimeout(runTunnel, 5000);
    }
  });
};

runTunnel();
