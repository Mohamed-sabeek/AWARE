import express from 'express';
import { streamRelayService } from '../services/streamRelayService.js';
import { getTunnelStatus, setTunnelUrl } from '../services/cloudflareTunnelService.js';

const router = express.Router();

/**
 * @route   GET /api/live/status
 * @desc    Get current Cloudflare tunnel public URL status (Development-safe)
 * @access  Public
 */
router.get('/status', (req, res) => {
  const status = getTunnelStatus();
  res.status(200).json(status);
});

/**
 * @route   POST /api/live/tunnel-url
 * @desc    Update active Cloudflare Quick Tunnel URL dynamically from runner/script
 * @access  Public
 */
router.post('/tunnel-url', (req, res) => {
  const { url, tunnelUrl } = req.body || {};
  const targetUrl = url || tunnelUrl;

  if (!targetUrl) {
    return res.status(400).json({ success: false, message: 'URL is required' });
  }

  const updated = setTunnelUrl(targetUrl, 'api_hook');
  res.status(200).json({
    success: true,
    updated,
    current: getTunnelStatus()
  });
});

/**
 * @route   GET /api/live/stream
 * @route   GET /api/live/stream/:deviceId
 * @desc    Multiplexed MJPEG live stream relay from ESP32-CAM
 * @access  Public (No login / JWT required)
 */
const handleStream = (req, res) => {
  const deviceId = req.params.deviceId || 'ESP32-CAM-001';
  streamRelayService.handleStreamRequest(deviceId, req, res);
};

router.get('/stream', handleStream);
router.get('/stream/:deviceId', handleStream);

export default router;
