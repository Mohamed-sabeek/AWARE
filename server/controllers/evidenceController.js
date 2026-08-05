import Evidence from '../models/Evidence.js';
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
