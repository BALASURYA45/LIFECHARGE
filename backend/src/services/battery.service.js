import { BatteryData } from '../models/BatteryData.js';
import { AppError } from '../utils/AppError.js';
import { parseBatteryCsv } from '../utils/batteryCsv.js';
import { batteryFeatureSchema } from '../validators/battery.validators.js';

export async function createBatteryRecord(userId, payload, source = 'manual') {
  return BatteryData.create({
    ...payload,
    source,
    user: userId,
  });
}

const defaultDemoRecords = [
  { vehicleCategory: 'four_wheeler', vehicleMake: 'Tesla', vehicleModel: 'Model 3 Pack (75 kWh)', vehicleType: 0, batteryCapacity: 75.0, voltage: 350.0, expectedCycles: 1500, typicalRange: 450, batteryAge: 2.2, totalKmDriven: 28400, dailyDistance: 45.0, chargingCycles: 380, chargingFrequency: 4.5, fastChargingUsage: 22.0, averageTemperature: 28.5, chargingDuration: 3.5, socHistory: 78, current: 35.0, is_chemistry_nmc: 1, source: 'telematics' },
  { vehicleCategory: 'four_wheeler', vehicleMake: 'BYD', vehicleModel: 'Seal Blade Pack (60 kWh)', vehicleType: 0, batteryCapacity: 60.0, voltage: 320.0, expectedCycles: 2000, typicalRange: 400, batteryAge: 1.8, totalKmDriven: 21000, dailyDistance: 40.0, chargingCycles: 290, chargingFrequency: 4.0, fastChargingUsage: 15.0, averageTemperature: 27.0, chargingDuration: 4.0, socHistory: 82, current: 30.0, is_chemistry_lfp: 1, source: 'telematics' },
  { vehicleCategory: 'four_wheeler', vehicleMake: 'Hyundai', vehicleModel: 'Ioniq 5 Pack (77.4 kWh)', vehicleType: 0, batteryCapacity: 77.4, voltage: 800.0, expectedCycles: 1600, typicalRange: 480, batteryAge: 1.2, totalKmDriven: 15200, dailyDistance: 50.0, chargingCycles: 190, chargingFrequency: 3.5, fastChargingUsage: 30.0, averageTemperature: 31.2, chargingDuration: 2.0, socHistory: 75, current: 40.0, is_chemistry_nmc: 1, source: 'telematics' },
  { vehicleCategory: 'two_wheeler', vehicleMake: 'Ather', vehicleModel: '450X Gen 3 (3.7 kWh)', vehicleType: 1, batteryCapacity: 3.7, voltage: 51.1, expectedCycles: 1200, typicalRange: 105, batteryAge: 1.5, totalKmDriven: 9800, dailyDistance: 25.0, chargingCycles: 210, chargingFrequency: 5.0, fastChargingUsage: 10.0, averageTemperature: 33.0, chargingDuration: 2.5, socHistory: 65, current: 15.0, is_chemistry_nmc: 1, source: 'telematics' },
  { vehicleCategory: 'two_wheeler', vehicleMake: 'Ola Electric', vehicleModel: 'S1 Pro (4 kWh)', vehicleType: 1, batteryCapacity: 4.0, voltage: 58.8, expectedCycles: 1200, typicalRange: 135, batteryAge: 1.0, totalKmDriven: 8200, dailyDistance: 30.0, chargingCycles: 175, chargingFrequency: 4.0, fastChargingUsage: 18.0, averageTemperature: 34.5, chargingDuration: 2.0, socHistory: 70, current: 18.0, is_chemistry_nmc: 1, source: 'telematics' },
  { vehicleCategory: 'four_wheeler', vehicleMake: 'BMW', vehicleModel: 'i4 eDrive40 (83.9 kWh)', vehicleType: 0, batteryCapacity: 83.9, voltage: 400.0, expectedCycles: 1500, typicalRange: 510, batteryAge: 2.0, totalKmDriven: 31000, dailyDistance: 55.0, chargingCycles: 410, chargingFrequency: 4.0, fastChargingUsage: 25.0, averageTemperature: 26.5, chargingDuration: 3.0, socHistory: 85, current: 42.0, is_chemistry_nmc: 1, source: 'telematics' },
  { vehicleCategory: 'three_wheeler', vehicleMake: 'Mahindra', vehicleModel: 'Treo (7.37 kWh)', vehicleType: 2, batteryCapacity: 7.37, voltage: 48.0, expectedCycles: 1800, typicalRange: 130, batteryAge: 2.8, totalKmDriven: 42000, dailyDistance: 70.0, chargingCycles: 550, chargingFrequency: 6.0, fastChargingUsage: 5.0, averageTemperature: 32.0, chargingDuration: 3.8, socHistory: 60, current: 22.0, is_chemistry_lfp: 1, source: 'telematics' },
  { vehicleCategory: 'four_wheeler', vehicleMake: 'Nissan', vehicleModel: 'Leaf e+ (62 kWh)', vehicleType: 0, batteryCapacity: 62.0, voltage: 350.0, expectedCycles: 1300, typicalRange: 385, batteryAge: 3.1, totalKmDriven: 45000, dailyDistance: 42.0, chargingCycles: 610, chargingFrequency: 5.0, fastChargingUsage: 28.0, averageTemperature: 29.0, chargingDuration: 4.5, socHistory: 72, current: 32.0, is_chemistry_nmc: 1, source: 'telematics' },
];

export async function listBatteryRecords(userId, query) {
  const filter = { user: userId };

  if (query.source) {
    filter.source = query.source;
  }

  let total = await BatteryData.countDocuments(filter);

  // Auto-seed demo telemetry data if user has no telemetry records
  if (total === 0 && userId) {
    const recordsToInsert = defaultDemoRecords.map((rec) => ({
      ...rec,
      user: userId,
    }));
    await BatteryData.insertMany(recordsToInsert);
    total = recordsToInsert.length;
  }

  const skip = (query.page - 1) * query.limit;
  const records = await BatteryData.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit);

  return {
    records,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit),
    },
  };
}

export async function getBatteryRecord(userId, recordId) {
  const record = await BatteryData.findOne({ _id: recordId, user: userId });

  if (!record) {
    throw new AppError('Battery record not found', 404);
  }

  return record;
}

export async function updateBatteryRecord(userId, recordId, payload) {
  const record = await BatteryData.findOneAndUpdate({ _id: recordId, user: userId }, payload, {
    new: true,
    runValidators: true,
  });

  if (!record) {
    throw new AppError('Battery record not found', 404);
  }

  return record;
}

export async function deleteBatteryRecord(userId, recordId) {
  const record = await BatteryData.findOneAndDelete({ _id: recordId, user: userId });

  if (!record) {
    throw new AppError('Battery record not found', 404);
  }

  return record;
}

export async function importBatteryCsv(userId, file) {
  if (!file) {
    throw new AppError('CSV file is required', 400);
  }

  const rows = parseBatteryCsv(file.buffer);
  const validRows = [];
  const errors = [];

  rows.forEach((row, index) => {
    const { error, value } = batteryFeatureSchema.validate(row, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      errors.push({
        row: index + 2,
        message: error.details.map((detail) => detail.message).join(', '),
      });
      return;
    }

    validRows.push({ ...value, user: userId, source: 'csv' });
  });

  if (errors.length) {
    return { insertedCount: 0, errors };
  }

  const insertedRecords = await BatteryData.insertMany(validRows, { ordered: true });
  return { insertedCount: insertedRecords.length, errors: [] };
}
