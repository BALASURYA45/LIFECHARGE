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

export async function listBatteryRecords(userId, query) {
  const filter = { user: userId };

  if (query.source) {
    filter.source = query.source;
  }

  const skip = (query.page - 1) * query.limit;
  const [records, total] = await Promise.all([
    BatteryData.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit),
    BatteryData.countDocuments(filter),
  ]);

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
