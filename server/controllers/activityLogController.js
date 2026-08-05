import ActivityLog from '../models/ActivityLog.js';

// @desc    Get all activity logs with optional filtering and pagination
// @route   GET /api/activity-logs
// @access  Private/Admin
export const getActivityLogs = async (req, res) => {
  try {
    const { category, severity, search, limit = 50, page = 1 } = req.query;

    let query = {};

    if (category && category !== 'All Activities') {
      query.category = category;
    }

    if (severity && severity !== 'All Severities') {
      query.severity = severity;
    }

    if (search) {
      query.$or = [
        { deviceId: { $regex: search, $options: 'i' } },
        { deviceName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(query);

    res.json({
      logs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get latest activity logs
// @route   GET /api/activity-logs/latest
// @access  Private/Admin
export const getLatestActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(10);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get activity log statistics
// @route   GET /api/activity-logs/statistics
// @access  Private/Admin
export const getActivityLogStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalActivities = await ActivityLog.countDocuments();
    const todaysActivities = await ActivityLog.countDocuments({ timestamp: { $gte: today } });
    
    const criticalEvents = await ActivityLog.countDocuments({ 
      timestamp: { $gte: today }, 
      severity: { $in: ['Critical', 'Warning'] } 
    });

    const notificationsSent = await ActivityLog.countDocuments({ 
      timestamp: { $gte: today },
      category: 'Alert'
    });

    res.json({
      totalActivities,
      todaysActivities,
      criticalEvents,
      notificationsSent
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
