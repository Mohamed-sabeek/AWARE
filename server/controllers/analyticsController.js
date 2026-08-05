import SensorReading from '../models/SensorReading.js';
import Evidence from '../models/Evidence.js';
import Alert from '../models/Alert.js';
import Sensor from '../models/Sensor.js';

// @desc    Get top overview stats
// @route   GET /api/analytics/overview
export const getOverview = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // AQI Average
    const todayReadings = await SensorReading.aggregate([
      { $match: { timestamp: { $gte: today } } },
      { $group: { _id: null, avgAqi: { $avg: '$aqi' }, maxAqi: { $max: '$aqi' } } }
    ]);
    
    const yesterdayReadings = await SensorReading.aggregate([
      { $match: { timestamp: { $gte: yesterday, $lt: today } } },
      { $group: { _id: null, avgAqi: { $avg: '$aqi' } } }
    ]);

    const avgAqi = todayReadings.length > 0 ? todayReadings[0].avgAqi : null;
    const maxAqiToday = todayReadings.length > 0 ? todayReadings[0].maxAqi : null;
    const yestAvgAqi = yesterdayReadings.length > 0 ? yesterdayReadings[0].avgAqi : null;
    
    let aqiTrend = null;
    if (avgAqi !== null && yestAvgAqi !== null && yestAvgAqi !== 0) {
      aqiTrend = ((avgAqi - yestAvgAqi) / yestAvgAqi) * 100;
    }

    // Highest AQI ever recorded
    const highestReading = await SensorReading.findOne().sort({ aqi: -1 }).select('aqi timestamp sensorId');

    // Alerts Generated (Today)
    const alertsToday = await Alert.countDocuments({ timestamp: { $gte: today } });

    // Evidence Captured (Total)
    const totalEvidence = await Evidence.countDocuments({});

    res.json({
      averageAqi: avgAqi !== null ? Math.round(avgAqi) : null,
      aqiTrend: aqiTrend !== null ? Math.round(aqiTrend) : null,
      highestAqi: highestReading ? {
        value: highestReading.aqi,
        date: highestReading.timestamp,
        sensorId: highestReading.sensorId
      } : null,
      alertsToday: alertsToday || 0,
      totalEvidence: totalEvidence || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get pollution trends
// @route   GET /api/analytics/trends?range=24h|7d|30d
export const getTrends = async (req, res) => {
  try {
    const range = req.query.range || '24h';
    const now = new Date();
    let startDate = new Date();

    let groupFormat = '';
    
    if (range === '24h') {
      startDate.setHours(startDate.getHours() - 24);
      groupFormat = '%Y-%m-%d %H:00'; // Group by hour
    } else if (range === '7d') {
      startDate.setDate(startDate.getDate() - 7);
      groupFormat = '%Y-%m-%d'; // Group by day
    } else if (range === '30d') {
      startDate.setDate(startDate.getDate() - 30);
      groupFormat = '%Y-%m-%d'; // Group by day
    } else {
      startDate.setHours(startDate.getHours() - 24);
      groupFormat = '%Y-%m-%d %H:00';
    }

    const trends = await SensorReading.aggregate([
      { $match: { timestamp: { $gte: startDate, $lte: now } } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$timestamp', timezone: '+05:30' } },
          aqi: { $avg: '$aqi' },
          pm25: { $avg: '$pm25' },
          pm10: { $avg: '$pm10' },
          mq135: { $avg: '$mq135' },
          temperature: { $avg: '$temperature' },
          humidity: { $avg: '$humidity' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(trends.map(t => ({
      time: t._id,
      aqi: Math.round(t.aqi),
      pm25: Math.round(t.pm25),
      pm10: Math.round(t.pm10),
      mq135: Math.round(t.mq135),
      temperature: Math.round(t.temperature),
      humidity: Math.round(t.humidity)
    })));
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get AQI distribution
// @route   GET /api/analytics/distribution
export const getDistribution = async (req, res) => {
  try {
    const readings = await SensorReading.find().select('aqi');
    if (!readings || readings.length === 0) {
      return res.json([]);
    }

    let good = 0, moderate = 0, poor = 0, veryPoor = 0, hazardous = 0;

    readings.forEach(r => {
      if (r.aqi <= 50) good++;
      else if (r.aqi <= 100) moderate++;
      else if (r.aqi <= 150) poor++;
      else if (r.aqi <= 200) veryPoor++;
      else hazardous++;
    });

    const total = readings.length;

    res.json([
      { name: 'Good', value: good, percentage: Math.round((good/total)*100) },
      { name: 'Moderate', value: moderate, percentage: Math.round((moderate/total)*100) },
      { name: 'Poor', value: poor, percentage: Math.round((poor/total)*100) },
      { name: 'Very Poor', value: veryPoor, percentage: Math.round((veryPoor/total)*100) },
      { name: 'Hazardous', value: hazardous, percentage: Math.round((hazardous/total)*100) }
    ]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get sensor performance
// @route   GET /api/analytics/sensors
export const getSensorPerformance = async (req, res) => {
  try {
    const stats = await SensorReading.aggregate([
      {
        $group: {
          _id: null,
          avgPm25: { $avg: '$pm25' }, maxPm25: { $max: '$pm25' }, minPm25: { $min: '$pm25' },
          avgPm10: { $avg: '$pm10' }, maxPm10: { $max: '$pm10' }, minPm10: { $min: '$pm10' },
          avgMq135: { $avg: '$mq135' }, maxMq135: { $max: '$mq135' }, minMq135: { $min: '$mq135' },
          avgTemp: { $avg: '$temperature' }, maxTemp: { $max: '$temperature' }, minTemp: { $min: '$temperature' },
          avgHum: { $avg: '$humidity' }, maxHum: { $max: '$humidity' }, minHum: { $min: '$humidity' }
        }
      }
    ]);

    const latest = await SensorReading.findOne().sort({ timestamp: -1 });

    if (!stats || stats.length === 0 || !latest) {
      return res.json(null);
    }

    const s = stats[0];

    res.json({
      pm25: { latest: latest.pm25, avg: Math.round(s.avgPm25), max: s.maxPm25, min: s.minPm25 },
      pm10: { latest: latest.pm10, avg: Math.round(s.avgPm10), max: s.maxPm10, min: s.minPm10 },
      mq135: { latest: latest.mq135, avg: Math.round(s.avgMq135), max: s.maxMq135, min: s.minMq135 },
      temperature: { latest: latest.temperature, avg: Math.round(s.avgTemp), max: s.maxTemp, min: s.minTemp },
      humidity: { latest: latest.humidity, avg: Math.round(s.avgHum), max: s.maxHum, min: s.minHum }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get evidence stats
// @route   GET /api/analytics/evidence
export const getEvidenceStats = async (req, res) => {
  try {
    const total = await Evidence.countDocuments();
    const verified = await Evidence.countDocuments({ status: 'Verified' });
    const pending = await Evidence.countDocuments({ status: 'Pending' });
    const rejected = await Evidence.countDocuments({ status: 'Rejected' });

    const categories = await Evidence.aggregate([
      { $group: { _id: '$detectionType', count: { $sum: 1 } } }
    ]);

    res.json({
      total,
      verified,
      pending,
      rejected,
      categories: categories.map(c => ({ name: c._id, count: c.count }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get alert stats
// @route   GET /api/analytics/alerts
export const getAlertStats = async (req, res) => {
  try {
    const total = await Alert.countDocuments();
    const active = await Alert.countDocuments({ status: 'Active' });
    
    const byType = await Alert.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({
      total,
      active,
      byType: byType.map(b => ({ name: b._id, count: b.count }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get device health
// @route   GET /api/analytics/device
export const getDeviceHealth = async (req, res) => {
  try {
    const sensors = await Sensor.find().select('sensorId status lastUpdated');
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get AI insights (Dynamic text logic)
// @route   GET /api/analytics/insights
export const getInsights = async (req, res) => {
  try {
    const insights = [];
    
    // Check if we have data
    const count = await SensorReading.countDocuments();
    if (count < 10) {
      return res.json([]);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 1. PM2.5 change
    const todayPm25 = await SensorReading.aggregate([{ $match: { timestamp: { $gte: today } } }, { $group: { _id: null, avg: { $avg: '$pm25' } } }]);
    const yestPm25 = await SensorReading.aggregate([{ $match: { timestamp: { $gte: yesterday, $lt: today } } }, { $group: { _id: null, avg: { $avg: '$pm25' } } }]);
    
    if (todayPm25.length && yestPm25.length && yestPm25[0].avg > 0) {
      const diff = ((todayPm25[0].avg - yestPm25[0].avg) / yestPm25[0].avg) * 100;
      if (Math.abs(diff) > 5) {
        insights.push(`PM2.5 levels have ${diff > 0 ? 'increased' : 'decreased'} by ${Math.abs(Math.round(diff))}% compared to yesterday.`);
      } else {
        insights.push("PM2.5 levels have remained stable compared to yesterday.");
      }
    }

    // 2. Alert correlation
    const topAlert = await Alert.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 1 }]);
    if (topAlert.length && topAlert[0].count > 0) {
      insights.push(`Most alerts generated recently are related to ${topAlert[0]._id}.`);
    }

    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get peak hours
// @route   GET /api/analytics/peak-hours
export const getPeakHours = async (req, res) => {
  try {
    // Determine Morning (6-12), Afternoon (12-18), Evening (18-22), Night (22-6)
    const readings = await SensorReading.aggregate([
      {
        $project: {
          hour: { $hour: { date: "$timestamp", timezone: "+05:30" } },
          aqi: 1
        }
      },
      {
        $addFields: {
          period: {
            $switch: {
              branches: [
                { case: { $and: [{ $gte: ["$hour", 6] }, { $lt: ["$hour", 12] }] }, then: "Morning" },
                { case: { $and: [{ $gte: ["$hour", 12] }, { $lt: ["$hour", 18] }] }, then: "Afternoon" },
                { case: { $and: [{ $gte: ["$hour", 18] }, { $lt: ["$hour", 22] }] }, then: "Evening" }
              ],
              default: "Night"
            }
          }
        }
      },
      {
        $group: {
          _id: "$period",
          avgAqi: { $avg: "$aqi" }
        }
      }
    ]);

    if (readings.length === 0) {
      return res.json(null);
    }

    const periods = { Morning: null, Afternoon: null, Evening: null, Night: null };
    readings.forEach(r => { periods[r._id] = Math.round(r.avgAqi); });

    res.json(periods);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
