import { parse } from 'csv-parse/sync';
import { AppError } from './AppError.js';

const columnMap = {
  batteryage: 'batteryAge',
  battery_age: 'batteryAge',
  'battery age': 'batteryAge',
  chargingcycles: 'chargingCycles',
  charging_cycles: 'chargingCycles',
  'charging cycles': 'chargingCycles',
  chargingfrequency: 'chargingFrequency',
  charging_frequency: 'chargingFrequency',
  'charging frequency': 'chargingFrequency',
  fastchargingusage: 'fastChargingUsage',
  fast_charging_usage: 'fastChargingUsage',
  'fast charging usage': 'fastChargingUsage',
  averagetemperature: 'averageTemperature',
  average_temperature: 'averageTemperature',
  'average temperature': 'averageTemperature',
  chargingduration: 'chargingDuration',
  charging_duration: 'chargingDuration',
  'charging duration': 'chargingDuration',
  dailydistance: 'dailyDistance',
  daily_distance: 'dailyDistance',
  'daily distance': 'dailyDistance',
  sochistory: 'socHistory',
  soc_history: 'socHistory',
  'soc history': 'socHistory',
  batterycapacity: 'batteryCapacity',
  battery_capacity: 'batteryCapacity',
  'battery capacity': 'batteryCapacity',
  voltage: 'voltage',
  current: 'current',
  notes: 'notes',
};

function normalizeHeader(header) {
  return String(header).trim().toLowerCase().replace(/\s+/g, ' ');
}

export function parseBatteryCsv(buffer) {
  if (!buffer?.length) {
    throw new AppError('CSV file is empty', 400);
  }

  const rows = parse(buffer.toString('utf-8'), {
    columns: (headers) => headers.map((header) => columnMap[normalizeHeader(header)] ?? normalizeHeader(header)),
    skip_empty_lines: true,
    trim: true,
  });

  if (!rows.length) {
    throw new AppError('CSV file does not contain battery records', 400);
  }

  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, value === '' ? value : Number.isNaN(Number(value)) ? value : Number(value)]),
    ),
  );
}
