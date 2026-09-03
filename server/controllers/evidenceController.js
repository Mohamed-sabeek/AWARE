import mongoose from 'mongoose';
import Evidence from '../models/Evidence.js';
import Sensor from '../models/Sensor.js';
import cloudinary from '../config/cloudinary.js';
import ActivityLog from '../models/ActivityLog.js';

// Helper to look up evidence by Mongo ObjectId or custom evidenceId string
const findEvidenceRecord = async (id) => {
  let evidence = null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    evidence = await Evidence.findById(id);
  }
  if (!evidence) {
    evidence = await Evidence.findOne({ evidenceId: id });
  }
  return evidence;
};

// @desc    Get evidence records (supports role-based isolation, limits, and status filtering)
// @route   GET /api/evidence
// @access  Private
export const getEvidences = async (req, res) => {
  try {
    const { limit, status, incidentStatus, assignedDepartment, assignedOfficerRole } = req.query;
    const filter = {};

    // Role-based visibility enforcement
    if (req.user && req.user.role === 'fire_officer') {
      filter.$or = [
        { assignedDepartment: 'FIRE_OFFICER' },
        { assignedOfficerRole: 'fire_officer' },
        { assignedOfficerId: req.user._id }
      ];
    } else if (req.user && req.user.role === 'pollution_officer') {
      filter.$or = [
        { assignedDepartment: 'POLLUTION_OFFICER' },
        { assignedOfficerRole: 'pollution_officer' },
        { assignedOfficerId: req.user._id }
      ];
    } else {
      // Authority / Admin can filter by department if specified in query
      if (assignedDepartment) {
        filter.assignedDepartment = assignedDepartment;
      } else if (assignedOfficerRole) {
        filter.assignedOfficerRole = assignedOfficerRole;
      }
    }

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
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get system-wide evidence and incident statistics
// @route   GET /api/evidence/stats
// @access  Private
export const getEvidenceStats = async (req, res) => {
  try {
    const filter = {};
    if (req.user?.role === 'fire_officer') {
      filter.$or = [
        { assignedDepartment: 'FIRE_OFFICER' },
        { assignedOfficerRole: 'fire_officer' }
      ];
    } else if (req.user?.role === 'pollution_officer') {
      filter.$or = [
        { assignedDepartment: 'POLLUTION_OFFICER' },
        { assignedOfficerRole: 'pollution_officer' }
      ];
    }

    const totalCount = await Evidence.countDocuments(filter);
    const activeCount = await Evidence.countDocuments({
      ...filter,
      incidentStatus: { $in: ['NEW', 'ASSIGNED', 'ACKNOWLEDGED', 'UNDER INVESTIGATION'] }
    });
    const resolvedCount = await Evidence.countDocuments({
      ...filter,
      incidentStatus: 'RESOLVED'
    });

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newTodayCount = await Evidence.countDocuments({
      ...filter,
      createdAt: { $gte: oneDayAgo }
    });

    res.json({
      totalCount,
      activeCount,
      resolvedCount,
      newTodayCount
    });
  } catch (error) {
    console.error('Error getting evidence stats:', error);
    res.status(500).json({ message: 'Server error retrieving statistics' });
  }
};

// @desc    Get single evidence by ID
// @route   GET /api/evidence/:id
// @access  Private
export const getEvidenceById = async (req, res) => {
  try {
    const evidence = await findEvidenceRecord(req.params.id);

    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    // Role-based check: officers can only access their assigned incidents
    if (req.user?.role === 'fire_officer' && evidence.assignedDepartment !== 'FIRE_OFFICER' && evidence.assignedOfficerRole !== 'fire_officer') {
      return res.status(403).json({ message: 'Access restricted: Incident not assigned to Fire Response Department.' });
    }
    if (req.user?.role === 'pollution_officer' && evidence.assignedDepartment !== 'POLLUTION_OFFICER' && evidence.assignedOfficerRole !== 'pollution_officer') {
      return res.status(403).json({ message: 'Access restricted: Incident not assigned to Pollution Control Department.' });
    }

    res.json(evidence);
  } catch (error) {
    console.error('Error fetching evidence by ID:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Authority assigns incident to Fire Officer or Pollution Officer
// @route   POST /api/evidence/:id/assign
// @access  Private/Authority/Admin
export const assignIncident = async (req, res) => {
  try {
    const { officerType, officerId, officerName, notes } = req.body;

    if (!officerType || !['fire_officer', 'pollution_officer'].includes(officerType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid officer type. Must be fire_officer or pollution_officer.'
      });
    }

    const evidence = await findEvidenceRecord(req.params.id);
    if (!evidence) {
      return res.status(404).json({ success: false, message: 'Incident record not found' });
    }

    const dept = officerType === 'fire_officer' ? 'FIRE_OFFICER' : 'POLLUTION_OFFICER';
    const deptLabel = officerType === 'fire_officer' ? 'Fire Officer' : 'Pollution Officer';
    const authorityName = req.user?.fullName || 'Regional Environmental Authority';

    evidence.assignedDepartment = dept;
    evidence.assignedOfficerRole = officerType;
    evidence.assignedOfficerId = officerId && mongoose.Types.ObjectId.isValid(officerId) ? officerId : null;
    evidence.assignedOfficerName = officerName || deptLabel;
    evidence.assignedBy = req.user?._id || null;
    evidence.assignedByName = authorityName;
    evidence.assignedAt = new Date();
    evidence.assignmentNotes = notes || '';
    evidence.incidentStatus = 'ASSIGNED';

    const updated = await evidence.save();

    // Log in ActivityLog
    await ActivityLog.create({
      deviceName: evidence.locationName || evidence.location || evidence.sensorId,
      deviceId: evidence.sensorId,
      category: 'Alert',
      severity: 'Warning',
      description: `Authority (${authorityName}) assigned incident ${evidence.evidenceId} to ${deptLabel} (${evidence.assignedOfficerName}).`,
      location: evidence.locationName || evidence.location || 'System Wide',
      metadata: {
        evidenceId: evidence.evidenceId,
        assignedDepartment: dept,
        assignedOfficerName: evidence.assignedOfficerName,
        assignedBy: authorityName,
        incidentStatus: 'ASSIGNED'
      }
    });

    // Broadcast Socket.io events
    const io = req.app.get('io');
    if (io) {
      const payload = {
        evidenceId: evidence.evidenceId,
        _id: evidence._id,
        incidentStatus: 'ASSIGNED',
        assignedDepartment: dept,
        assignedOfficerRole: officerType,
        assignedOfficerId: evidence.assignedOfficerId,
        assignedOfficerName: evidence.assignedOfficerName,
        assignedBy: authorityName,
        assignedAt: evidence.assignedAt,
        assignmentNotes: evidence.assignmentNotes,
        locationName: evidence.locationName || evidence.location,
        voltage: evidence.voltage,
        sensorId: evidence.sensorId
      };

      io.emit('incident-assigned', payload);
      io.emit('incident-status-updated', payload);
    }

    res.status(200).json({
      success: true,
      message: `Incident successfully assigned to ${deptLabel}`,
      data: updated
    });
  } catch (error) {
    console.error('Error assigning incident:', error);
    res.status(500).json({ success: false, message: 'Server error assigning incident', error: error.message });
  }
};

// @desc    Field Officer updates operational status (ASSIGNED -> ACKNOWLEDGED -> UNDER INVESTIGATION -> RESOLVED)
// @route   PUT /api/evidence/:id/incident-status
// @access  Private/Officer/Admin
export const updateIncidentStatus = async (req, res) => {
  try {
    const { nextStatus, notes, resolutionNotes, resolutionImageUrl } = req.body;
    const evidence = await findEvidenceRecord(req.params.id);

    if (!evidence) {
      return res.status(404).json({ success: false, message: 'Incident record not found' });
    }

    // Restriction: Authority cannot advance operational states or resolve
    if (req.user?.role === 'authority' && ['UNDER INVESTIGATION', 'RESOLVED', 'ACKNOWLEDGED'].includes(nextStatus)) {
      return res.status(403).json({
        success: false,
        message: 'Authority coordinates assignments. Operational investigation and resolution must be conducted by the assigned field response officer.'
      });
    }

    const currentStatus = evidence.incidentStatus || 'NEW';
    const validTransitions = {
      'NEW': ['ASSIGNED', 'ACKNOWLEDGED'],
      'ASSIGNED': ['ACKNOWLEDGED'],
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

    const officerName = req.user?.fullName || 'Field Response Officer';

    evidence.incidentStatus = nextStatus;
    if (notes) evidence.investigationNotes = notes;
    if (resolutionNotes) evidence.resolutionNotes = resolutionNotes;
    if (resolutionImageUrl) evidence.resolutionImageUrl = resolutionImageUrl;

    if (nextStatus === 'RESOLVED') {
      evidence.resolvedBy = req.user?._id || null;
      evidence.resolvedByName = officerName;
      evidence.resolvedAt = new Date();
    }

    const updated = await evidence.save();

    // Log in ActivityLog
    const logDesc = nextStatus === 'ACKNOWLEDGED'
      ? `Officer (${officerName}) acknowledged incident ${evidence.evidenceId}.`
      : (nextStatus === 'UNDER INVESTIGATION'
        ? `Officer (${officerName}) commenced field investigation on ${evidence.evidenceId}.`
        : `Officer (${officerName}) marked incident ${evidence.evidenceId} as RESOLVED.`);

    await ActivityLog.create({
      deviceName: evidence.locationName || evidence.location || evidence.sensorId,
      deviceId: evidence.sensorId,
      category: 'Alert',
      severity: nextStatus === 'RESOLVED' ? 'Success' : (nextStatus === 'UNDER INVESTIGATION' ? 'Warning' : 'Info'),
      description: logDesc,
      location: evidence.locationName || evidence.location || 'System Wide',
      metadata: {
        evidenceId: evidence.evidenceId,
        previousStatus: currentStatus,
        newStatus: nextStatus,
        updatedBy: officerName,
        resolutionNotes: evidence.resolutionNotes || '',
        hasResolutionEvidence: !!evidence.resolutionImageUrl
      }
    });

    // Broadcast Socket.io event for realtime updates across all portals
    const io = req.app.get('io');
    if (io) {
      io.emit('incident-status-updated', {
        evidenceId: evidence.evidenceId,
        _id: evidence._id,
        incidentStatus: nextStatus,
        previousStatus: currentStatus,
        investigationNotes: evidence.investigationNotes,
        resolutionNotes: evidence.resolutionNotes,
        resolutionImageUrl: evidence.resolutionImageUrl,
        resolvedByName: evidence.resolvedByName,
        resolvedAt: evidence.resolvedAt,
        updatedBy: officerName,
        updatedAt: new Date()
      });
    }

    return res.status(200).json({
      success: true,
      message: `Incident status successfully updated to ${nextStatus}`,
      data: updated
    });
  } catch (error) {
    console.error('Error updating incident status:', error);
    res.status(500).json({ success: false, message: 'Server error updating incident status', error: error.message });
  }
};

// @desc    Save Officer investigation notes
// @route   PUT /api/evidence/:id/notes
// @access  Private/Officer/Admin
export const saveInvestigationNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const evidence = await findEvidenceRecord(req.params.id);

    if (!evidence) {
      return res.status(404).json({ success: false, message: 'Incident record not found' });
    }

    evidence.investigationNotes = notes || '';
    const updated = await evidence.save();

    const officerName = req.user?.fullName || 'Field Officer';
    await ActivityLog.create({
      deviceName: evidence.locationName || evidence.location || evidence.sensorId,
      deviceId: evidence.sensorId,
      category: 'System',
      severity: 'Info',
      description: `Officer (${officerName}) updated investigation notes for incident ${evidence.evidenceId}.`,
      location: evidence.locationName || evidence.location || 'Field Station',
      metadata: { evidenceId: evidence.evidenceId, updatedBy: officerName }
    });

    res.status(200).json({
      success: true,
      message: 'Investigation notes saved.',
      data: updated
    });
  } catch (error) {
    console.error('Error saving notes:', error);
    res.status(500).json({ success: false, message: 'Server error saving notes' });
  }
};

// @desc    Field Officer uploads resolution evidence photo & resolves incident
// @route   POST /api/evidence/:id/resolve
// @access  Private/Officer/Admin
export const resolveIncidentWithEvidence = async (req, res) => {
  try {
    const { resolutionNotes, resolutionImageUrl } = req.body;
    const evidence = await findEvidenceRecord(req.params.id);

    if (!evidence) {
      return res.status(404).json({ success: false, message: 'Incident record not found' });
    }

    const officerName = req.user?.fullName || 'Field Response Officer';

    evidence.incidentStatus = 'RESOLVED';
    evidence.resolutionNotes = resolutionNotes || '';
    if (resolutionImageUrl) {
      evidence.resolutionImageUrl = resolutionImageUrl;
    }
    evidence.resolvedBy = req.user?._id || null;
    evidence.resolvedByName = officerName;
    evidence.resolvedAt = new Date();

    const updated = await evidence.save();

    // Log resolution in ActivityLog
    await ActivityLog.create({
      deviceName: evidence.locationName || evidence.location || evidence.sensorId,
      deviceId: evidence.sensorId,
      category: 'Alert',
      severity: 'Success',
      description: `Officer (${officerName}) verified remediation and RESOLVED incident ${evidence.evidenceId}.`,
      location: evidence.locationName || evidence.location || 'Field Station',
      metadata: {
        evidenceId: evidence.evidenceId,
        newStatus: 'RESOLVED',
        resolvedByName: officerName,
        hasResolutionEvidence: !!evidence.resolutionImageUrl
      }
    });

    // Broadcast Socket.io event
    const io = req.app.get('io');
    if (io) {
      io.emit('incident-status-updated', {
        evidenceId: evidence.evidenceId,
        _id: evidence._id,
        incidentStatus: 'RESOLVED',
        resolutionNotes: evidence.resolutionNotes,
        resolutionImageUrl: evidence.resolutionImageUrl,
        resolvedByName: evidence.resolvedByName,
        resolvedAt: evidence.resolvedAt,
        updatedBy: officerName,
        updatedAt: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Incident successfully resolved with resolution evidence.',
      data: updated
    });
  } catch (error) {
    console.error('Error resolving incident:', error);
    res.status(500).json({ success: false, message: 'Server error resolving incident', error: error.message });
  }
};

// @desc    Capture new evidence from ESP32 camera
// @route   POST /api/evidence/capture
// @access  Public/Sensor
export const captureEvidence = async (req, res) => {
  try {
    const { deviceId, voltage, detectionType } = req.body;

    let imageUrl = '';
    let cloudinaryPublicId = '';

    if (req.file) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'aware_evidence',
              transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });

        imageUrl = uploadResult.secure_url;
        cloudinaryPublicId = uploadResult.public_id;
      } catch (uploadError) {
        console.warn('Cloudinary upload failed, using local upload path:', uploadError.message);
        imageUrl = `/uploads/${req.file.filename}`;
      }
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    } else {
      imageUrl = '/assets/sample-evidence.jpg';
    }

    const sensor = await Sensor.findOne({ sensorId: deviceId || 'ESP32-CAM-001' });

    const evidenceCount = await Evidence.countDocuments();
    const evidenceId = `EVT-${Date.now()}`;

    const newEvidence = new Evidence({
      evidenceId,
      imageUrl,
      cloudinaryPublicId,
      voltage: voltage !== undefined ? Number(voltage) : (sensor ? sensor.voltage : 0),
      detectionType: detectionType || 'Threshold Exceeded',
      sensorId: deviceId || 'ESP32-CAM-001',
      cameraId: deviceId || 'ESP32-CAM-001',
      locationName: sensor ? (sensor.locationName || sensor.location) : null,
      location: sensor ? (sensor.locationName || sensor.location) : null,
      latitude: sensor && sensor.latitude !== undefined ? sensor.latitude : null,
      longitude: sensor && sensor.longitude !== undefined ? sensor.longitude : null,
      status: 'Verified',
      incidentStatus: 'NEW'
    });

    const savedEvidence = await newEvidence.save();

    // Broadcast via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('evidence-captured', savedEvidence);
    }

    res.status(201).json({
      success: true,
      message: 'Evidence captured successfully',
      data: savedEvidence
    });
  } catch (error) {
    console.error('Error capturing evidence:', error);
    res.status(500).json({ success: false, message: 'Server error capturing evidence', error: error.message });
  }
};

// @desc    Delete evidence record
// @route   DELETE /api/evidence/:id
// @access  Private/Admin
export const deleteEvidence = async (req, res) => {
  try {
    const evidence = await findEvidenceRecord(req.params.id);

    if (!evidence) {
      return res.status(404).json({ message: 'Evidence record not found' });
    }

    if (evidence.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(evidence.cloudinaryPublicId);
      } catch (cErr) {
        console.warn('Cloudinary delete error:', cErr.message);
      }
    }

    await Evidence.deleteOne({ _id: evidence._id });
    res.json({ success: true, message: 'Evidence deleted successfully' });
  } catch (error) {
    console.error('Error deleting evidence:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
