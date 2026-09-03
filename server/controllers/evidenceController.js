import mongoose from 'mongoose';
import Evidence from '../models/Evidence.js';
import Sensor from '../models/Sensor.js';
import cloudinary from '../config/cloudinary.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc    Get evidence records (supports limit and filtering)
// @route   GET /api/evidence
// @access  Private/Admin/Authority
export const getEvidences = async (req, res) => {
  try {
    const { limit, status, incidentStatus } = req.query;
    const filter = {};

    if (incidentStatus && incidentStatus !== 'All') {
      filter.incidentStatus = incidentStatus;
    } else if (status && status !== 'All') {
      filter.status = status;
    }

    let query = Evidence.find(filter).sort({ createdAt: -1 });

    if (limit) {
      const parsedLimit = parseInt(limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        query = query.limit(parsedLimit);
      }
    }

    const evidence = await query.exec();
    res.json(evidence);
  } catch (error) {
    console.error('Error fetching evidence:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get system-wide evidence and incident statistics
// @route   GET /api/evidence/stats
// @access  Private/Admin/Authority
export const getEvidenceStats = async (req, res) => {
  try {
    const totalCount = await Evidence.countDocuments({});
    const activeCount = await Evidence.countDocuments({
      incidentStatus: { $in: ['NEW', 'ACKNOWLEDGED', 'UNDER INVESTIGATION', null] }
    });
    const resolvedCount = await Evidence.countDocuments({
      incidentStatus: 'RESOLVED'
    });

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newTodayCount = await Evidence.countDocuments({
      createdAt: { $gte: oneDayAgo }
    });

    res.json({
      totalCount,
      activeCount,
      resolvedCount,
      newTodayCount
    });
  } catch (error) {
    console.error('Error fetching evidence stats:', error);
    res.status(500).json({ message: 'Server Error calculating stats' });
  }
};

// @desc    Get evidence by ID or evidenceId
// @route   GET /api/evidence/:id
// @access  Private/Admin/Authority
export const getEvidenceById = async (req, res) => {
  try {
    let evidence = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      evidence = await Evidence.findById(req.params.id);
    }
    if (!evidence) {
      evidence = await Evidence.findOne({ evidenceId: req.params.id });
    }

    if (evidence) {
      res.json(evidence);
    } else {
      res.status(404).json({ message: 'Evidence not found' });
    }
  } catch (error) {
    console.error('Error fetching evidence by id:', error);
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
      location, locationName, latitude, longitude, sensorId, cameraId, voltage
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const targetDeviceId = (sensorId || cameraId || 'ESP32-CAM-001').trim();

    // Find sensor location snapshot if not explicitly provided
    let snapshotLocationName = (locationName || location || null);
    let snapshotLatitude = latitude !== undefined && latitude !== null ? Number(latitude) : null;
    let snapshotLongitude = longitude !== undefined && longitude !== null ? Number(longitude) : null;

    if (!snapshotLocationName || snapshotLatitude === null || snapshotLongitude === null) {
      const sensor = await Sensor.findOne({ sensorId: targetDeviceId });
      if (sensor) {
        if (!snapshotLocationName) snapshotLocationName = sensor.locationName || sensor.location || null;
        if (snapshotLatitude === null && typeof sensor.latitude === 'number') snapshotLatitude = sensor.latitude;
        if (snapshotLongitude === null && typeof sensor.longitude === 'number') snapshotLongitude = sensor.longitude;
      }
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
      evidenceId: evidenceId || `EVT-${Date.now()}`,
      imageUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      detectionType: detectionType || 'Threshold Exceeded',
      aqi: aqi || 0,
      confidence: confidence || 95,
      voltage: voltage !== undefined ? Number(voltage) : 0,
      location: snapshotLocationName,
      locationName: snapshotLocationName,
      latitude: snapshotLatitude,
      longitude: snapshotLongitude,
      sensorId: targetDeviceId,
      cameraId: cameraId || targetDeviceId
    });

    const createdEvidence = await evidence.save();

    await ActivityLog.create({
      deviceName: snapshotLocationName || targetDeviceId,
      deviceId: targetDeviceId,
      category: 'Evidence',
      severity: 'Success',
      description: `New evidence captured for ${detectionType || 'Incident'}`,
      location: snapshotLocationName || 'Location Not Configured',
      metadata: { evidenceId: createdEvidence.evidenceId, confidence, aqi, locationName: snapshotLocationName }
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
          deviceName: evidence.locationName || evidence.location || 'ESP32-CAM',
          deviceId: evidence.sensorId,
          category: 'Evidence',
          severity: updatedEvidence.status === 'Verified' ? 'Success' : (updatedEvidence.status === 'Rejected' ? 'Warning' : 'Info'),
          description: `Evidence ${evidence.evidenceId} marked as ${updatedEvidence.status}`,
          location: evidence.locationName || evidence.location,
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

// @desc    Upload real ESP32-CAM JPEG image & create Evidence record with sensor location snapshot
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

    const { deviceId, sensorId, voltage, timestamp, detectionType } = req.body;
    const targetDeviceId = (deviceId || sensorId || 'ESP32-CAM-001').trim();
    const parsedVoltage = voltage !== undefined && voltage !== '' ? Number(voltage) : 0;

    let readingTimestamp = new Date();
    if (timestamp) {
      const parsedTime = new Date(timestamp);
      if (!isNaN(parsedTime.getTime())) {
        readingTimestamp = parsedTime;
      }
    }

    // 1. Find device to pull location snapshot
    let sensor = await Sensor.findOne({ sensorId: targetDeviceId });
    if (!sensor && mongoose.Types.ObjectId.isValid(targetDeviceId)) {
      sensor = await Sensor.findById(targetDeviceId);
    }

    // 2. Read location snapshot from the sensor record
    let snapshotLocationName = null;
    let snapshotLatitude = null;
    let snapshotLongitude = null;

    if (sensor) {
      const loc = sensor.locationName || sensor.location;
      if (loc && loc.trim()) {
        snapshotLocationName = loc.trim();
      }

      if (typeof sensor.latitude === 'number' && !isNaN(sensor.latitude) && sensor.latitude !== 0) {
        snapshotLatitude = sensor.latitude;
      }
      if (typeof sensor.longitude === 'number' && !isNaN(sensor.longitude) && sensor.longitude !== 0) {
        snapshotLongitude = sensor.longitude;
      }
    }

    if (!snapshotLocationName && snapshotLatitude === null && snapshotLongitude === null) {
      console.warn(`[Evidence Upload] Note: Sensor '${targetDeviceId}' has no configured fixed location. Storing null location.`);
    }

    const threshold = sensor?.threshold !== undefined ? sensor.threshold : 0.400;
    const isThresholdExceeded = parsedVoltage >= threshold;

    const evidenceId = `EVT-${Date.now()}`;
    const imageUrl = `/uploads/${req.file.filename}`;

    // 3. Create Evidence record with location snapshot
    const evidence = await Evidence.create({
      evidenceId,
      imageUrl,
      cloudinaryPublicId: '',
      voltage: parsedVoltage,
      detectionType: detectionType || (isThresholdExceeded ? 'Threshold Exceeded' : 'Monitoring Snapshot'),
      aqi: 0,
      confidence: 95,
      location: snapshotLocationName,
      locationName: snapshotLocationName,
      latitude: snapshotLatitude,
      longitude: snapshotLongitude,
      sensorId: targetDeviceId,
      cameraId: targetDeviceId,
      status: 'Verified',
      createdAt: readingTimestamp
    });

    // 4. Create ActivityLog entry
    await ActivityLog.create({
      deviceName: snapshotLocationName || targetDeviceId,
      deviceId: targetDeviceId,
      category: 'Evidence',
      severity: isThresholdExceeded ? 'Critical' : 'Success',
      description: `Visual evidence captured: ${evidence.evidenceId} (Voltage: ${parsedVoltage.toFixed(3)} V)`,
      location: snapshotLocationName || 'Location Not Configured',
      metadata: {
        evidenceId: evidence.evidenceId,
        voltage: parsedVoltage,
        imageUrl: evidence.imageUrl,
        locationName: snapshotLocationName,
        latitude: snapshotLatitude,
        longitude: snapshotLongitude
      }
    });

    // 5. Broadcast real-time Socket.io event with location snapshot
    const io = req.app.get('io');
    if (io) {
      io.emit('evidence-captured', {
        evidenceId: evidence.evidenceId,
        imageUrl: evidence.imageUrl,
        deviceId: targetDeviceId,
        sensorId: targetDeviceId,
        voltage: parsedVoltage,
        detectionType: evidence.detectionType,
        location: snapshotLocationName,
        locationName: snapshotLocationName,
        latitude: snapshotLatitude,
        longitude: snapshotLongitude,
        status: evidence.status,
        incidentStatus: evidence.incidentStatus || 'NEW',
        createdAt: evidence.createdAt,
        timestamp: evidence.createdAt
      });
    }

    // 6. Return response with location snapshot
    return res.status(201).json({
      success: true,
      message: 'Evidence uploaded successfully',
      data: {
        evidenceId: evidence.evidenceId,
        imageUrl: evidence.imageUrl,
        deviceId: targetDeviceId,
        voltage: parsedVoltage,
        detectionType: evidence.detectionType,
        location: snapshotLocationName,
        locationName: snapshotLocationName,
        latitude: snapshotLatitude,
        longitude: snapshotLongitude,
        status: evidence.status,
        incidentStatus: evidence.incidentStatus || 'NEW',
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

// @desc    Update incident response status (NEW -> ACKNOWLEDGED -> UNDER INVESTIGATION -> RESOLVED)
// @route   PUT /api/evidence/:id/incident-status
// @access  Private/Authority/Admin
export const updateIncidentStatus = async (req, res) => {
  try {
    const { nextStatus, notes } = req.body;
    let evidence = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      evidence = await Evidence.findById(req.params.id);
    }

    if (!evidence) {
      evidence = await Evidence.findOne({ evidenceId: req.params.id });
    }

    if (!evidence) {
      return res.status(404).json({ success: false, message: 'Incident record not found' });
    }

    const currentStatus = evidence.incidentStatus || 'NEW';
    const validTransitions = {
      'NEW': ['ACKNOWLEDGED'],
      'ACKNOWLEDGED': ['UNDER INVESTIGATION'],
      'UNDER INVESTIGATION': ['RESOLVED'],
      'RESOLVED': []
    };

    const allowedNext = validTransitions[currentStatus] || [];
    if (!allowedNext.includes(nextStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status transition from '${currentStatus}' to '${nextStatus}'. Allowed next: ${allowedNext.join(', ') || 'None (Already Resolved)'}`
      });
    }

    evidence.incidentStatus = nextStatus;
    if (notes) evidence.notes = notes;
    const updated = await evidence.save();

    // Log in ActivityLog
    const authorityName = req.user?.fullName || 'Authority Officer';
    await ActivityLog.create({
      deviceName: evidence.locationName || evidence.location || evidence.sensorId,
      deviceId: evidence.sensorId,
      category: 'Alert',
      severity: nextStatus === 'RESOLVED' ? 'Success' : (nextStatus === 'UNDER INVESTIGATION' ? 'Warning' : 'Info'),
      description: `Authority (${authorityName}) updated incident ${evidence.evidenceId} status: ${currentStatus} -> ${nextStatus}`,
      location: evidence.locationName || evidence.location || 'System Wide',
      metadata: {
        evidenceId: evidence.evidenceId,
        previousStatus: currentStatus,
        newStatus: nextStatus,
        updatedBy: authorityName
      }
    });

    // Broadcast Socket.io event for realtime updates across authority dashboards
    const io = req.app.get('io');
    if (io) {
      io.emit('incident-status-updated', {
        evidenceId: evidence.evidenceId,
        _id: evidence._id,
        incidentStatus: nextStatus,
        previousStatus: currentStatus,
        updatedBy: authorityName,
        updatedAt: new Date()
      });
    }

    return res.status(200).json({
      success: true,
      message: `Incident status updated to ${nextStatus}`,
      data: updated
    });
  } catch (error) {
    console.error('Error updating incident status:', error);
    res.status(500).json({ success: false, message: 'Server error updating incident status', error: error.message });
  }
};
