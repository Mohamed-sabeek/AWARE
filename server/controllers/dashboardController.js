import Sensor from '../models/Sensor.js';
import SensorReading from '../models/SensorReading.js';
import Alert from '../models/Alert.js';
import Evidence from '../models/Evidence.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Device Stats
    const totalDevices = await Sensor.countDocuments();
    const onlineDevices = await Sensor.countDocuments({ status: 'Online' });
    const offlineDevices = totalDevices - onlineDevices;

    // 2. Average AQI (Today's avg from SensorReadings, or latest from Sensors if no readings)
    const todayReadings = await SensorReading.aggregate([
      { $match: { timestamp: { $gte: today } } },
      { $group: { _id: null, avgAqi: { $avg: '$aqi' } } }
    ]);
    let averageAQI = null;
    if (todayReadings.length > 0) {
      averageAQI = Math.round(todayReadings[0].avgAqi);
    } else {
      const activeSensors = await Sensor.find({ aqi: { $exists: true, $ne: null } });
      if (activeSensors.length > 0) {
        averageAQI = Math.round(activeSensors.reduce((acc, curr) => acc + (curr.aqi || 0), 0) / activeSensors.length);
      }
    }

    // 3. Alerts & Evidence
    const activeAlerts = await Alert.countDocuments({ status: 'Active' });
    const evidenceCount = await Evidence.countDocuments({ createdAt: { $gte: today } });

    // 4. Latest Items
    const latestReading = await SensorReading.findOne().sort({ timestamp: -1 });
    const latestAlert = await Alert.findOne({ status: 'Active' }).sort({ timestamp: -1 });
    const latestEvidence = await Evidence.findOne().sort({ createdAt: -1 });

    // 5. System Health & Last Updated
    let systemHealth = 'Healthy';
    let systemHealthPercentage = 100;
    
    if (offlineDevices > totalDevices * 0.5) {
      systemHealth = 'Critical';
      systemHealthPercentage = 40;
    } else if (activeAlerts > 5 || offlineDevices > 0) {
      systemHealth = 'Warning';
      systemHealthPercentage = 85;
    }

    const latestSensorUpdate = await Sensor.findOne().sort({ lastUpdated: -1 });
    const lastUpdated = latestSensorUpdate ? latestSensorUpdate.lastUpdated : Date.now();

    res.json({
      totalDevices,
      onlineDevices,
      offlineDevices,
      averageAQI,
      activeAlerts,
      evidenceCount, // evidence captured today
      latestReading,
      latestAlert,
      latestEvidence,
      systemHealth,
      systemHealthPercentage,
      lastUpdated
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
