import Evidence from '../models/Evidence.js';
import Sensor from '../models/Sensor.js';
import cloudinary from '../config/cloudinary.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc    Get all evidence
// @route   GET /api/evidence
// @access  Private/Admin
export const getEvidences = async (req, res) => {
  try {
    const evidence = await Evidence.find({}).sort({ createdAt: -1 });
    res.json(evidence);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get evidence by ID
// @route   GET /api/evidence/:id
// @access  Private/Admin
export const getEvidenceById = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id);
    if (evidence) {
      res.json(evidence);
    } else {
      res.status(404).json({ message: 'Evidence not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create new evidence
// @route   POST /api/evidence
// @access  Private/Hardware/Admin
export const createEvidence = async (req, res) => {
  try {
    const { 
      evidenceId, detectionType, aqi, confidence, 
      location, latitude, longitude, sensorId, cameraId 
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Upload image to Cloudinary using a buffer stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'aware_evidence' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const evidence = new Evidence({
      evidenceId,
      imageUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      detectionType,
      aqi,
      confidence,
      location,
      latitude,
      longitude,
      sensorId,
      cameraId
    });

    const createdEvidence = await evidence.save();

    await ActivityLog.create({
      deviceName: location || 'ESP32-CAM',
      deviceId: sensorId,
      category: 'Evidence',
      severity: 'Success',
      description: `New evidence captured for ${detectionType}`,
      location: location,
      metadata: { evidenceId, confidence, aqi }
    });

    res.status(201).json(createdEvidence);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error while creating evidence' });
  }
};

// @desc    Update evidence status
// @route   PUT /api/evidence/:id
// @access  Private/Admin
export const updateEvidence = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id);

    if (evidence) {
      const prevStatus = evidence.status;
      evidence.status = req.body.status || evidence.status;
      evidence.verifiedBy = req.body.verifiedBy || evidence.verifiedBy;
      evidence.notes = req.body.notes || evidence.notes;
      evidence.reportStatus = req.body.reportStatus || evidence.reportStatus;
      evidence.emailStatus = req.body.emailStatus || evidence.emailStatus;
      evidence.penaltyAmount = req.body.penaltyAmount !== undefined ? req.body.penaltyAmount : evidence.penaltyAmount;

      const updatedEvidence = await evidence.save();

      if (prevStatus !== updatedEvidence.status) {
        await ActivityLog.create({
          deviceName: evidence.location || 'ESP32-CAM',
          deviceId: evidence.sensorId,
          category: 'Evidence',
          severity: updatedEvidence.status === 'Verified' ? 'Success' : (updatedEvidence.status === 'Rejected' ? 'Warning' : 'Info'),
          description: `Evidence ${evidence.evidenceId} marked as ${updatedEvidence.status}`,
          location: evidence.location,
          metadata: { evidenceId: evidence.evidenceId }
        });
      }

      res.json(updatedEvidence);
    } else {
      res.status(404).json({ message: 'Evidence not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete evidence
// @route   DELETE /api/evidence/:id
// @access  Private/Admin
export const deleteEvidence = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id);

    if (evidence) {
      // Delete from Cloudinary
      if (evidence.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(evidence.cloudinaryPublicId);
      }
      
      await Evidence.deleteOne({ _id: evidence._id });
      res.json({ message: 'Evidence removed completely' });
    } else {
      res.status(404).json({ message: 'Evidence not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Upload real ESP32-CAM JPEG image & create Evidence record
// @route   POST /api/evidence/upload
// @access  Public (Hardware Ingestion)
export const uploadEvidenceFromDevice = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded. Expected field: image'
      });
    }

    const { deviceId, sensorId, voltage, timestamp, detectionType, location } = req.body;
    const targetDeviceId = (deviceId || sensorId || 'ESP32-CAM-001').trim();
    const parsedVoltage = voltage !== undefined && voltage !== '' ? Number(voltage) : 0;

    let readingTimestamp = new Date();
    if (timestamp) {
      const parsedTime = new Date(timestamp);
      if (!isNaN(parsedTime.getTime())) {
        readingTimestamp = parsedTime;
      }
    }

    // Find device to pull location / metadata
    const sensor = await Sensor.findOne({ sensorId: targetDeviceId });
    const threshold = sensor?.threshold !== undefined ? sensor.threshold : 0.400;
    const isThresholdExceeded = parsedVoltage >= threshold;

    const evidenceId = `EVT-${Date.now()}`;
    const imageUrl = `/uploads/${req.file.filename}`;

    const evidence = await Evidence.create({
      evidenceId,
      imageUrl,
      cloudinaryPublicId: '',
      voltage: parsedVoltage,
      detectionType: detectionType || (isThresholdExceeded ? 'Threshold Exceeded' : 'Monitoring Snapshot'),
      aqi: 0,
      confidence: 95,
      location: location || sensor?.location || 'ESP32 Station',
      latitude: sensor?.latitude || 0,
      longitude: sensor?.longitude || 0,
      sensorId: targetDeviceId,
      cameraId: targetDeviceId,
      status: 'Verified',
      createdAt: readingTimestamp
    });

    // Create ActivityLog entry
    await ActivityLog.create({
      deviceName: sensor?.location || 'ESP32-CAM',
      deviceId: targetDeviceId,
      category: 'Evidence',
      severity: isThresholdExceeded ? 'Critical' : 'Success',
      description: `Visual evidence captured: ${evidence.evidenceId} (Voltage: ${parsedVoltage.toFixed(3)} V)`,
      location: evidence.location,
      metadata: {
        evidenceId: evidence.evidenceId,
        voltage: parsedVoltage,
        imageUrl: evidence.imageUrl
      }
    });

    // Broadcast real-time Socket.io event
    const io = req.app.get('io');
    if (io) {
      io.emit('evidence-captured', {
        evidenceId: evidence.evidenceId,
        imageUrl: evidence.imageUrl,
        deviceId: targetDeviceId,
        voltage: parsedVoltage,
        detectionType: evidence.detectionType,
        location: evidence.location,
        status: evidence.status,
        createdAt: evidence.createdAt
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Evidence uploaded successfully',
      data: {
        evidenceId: evidence.evidenceId,
        imageUrl: evidence.imageUrl,
        deviceId: targetDeviceId,
        voltage: parsedVoltage,
        detectionType: evidence.detectionType,
        status: evidence.status,
        timestamp: evidence.createdAt
      }
    });

  } catch (error) {
    console.error('Error in uploadEvidenceFromDevice:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error while uploading evidence',
      error: error.message
    });
  }
};

