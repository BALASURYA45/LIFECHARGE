import {
  createBatteryRecord,
  deleteBatteryRecord,
  getBatteryRecord,
  importBatteryCsv,
  listBatteryRecords,
  updateBatteryRecord,
} from '../services/battery.service.js';

export async function addBatteryRecord(request, response) {
  const record = await createBatteryRecord(request.user._id, request.body);
  response.status(201).json({ success: true, record });
}

export async function getBatteryHistory(request, response) {
  const result = await listBatteryRecords(request.user._id, request.query);
  response.status(200).json({ success: true, ...result });
}

export async function getBatteryById(request, response) {
  const record = await getBatteryRecord(request.user._id, request.params.id);
  response.status(200).json({ success: true, record });
}

export async function editBatteryRecord(request, response) {
  const record = await updateBatteryRecord(request.user._id, request.params.id, request.body);
  response.status(200).json({ success: true, record });
}

export async function removeBatteryRecord(request, response) {
  await deleteBatteryRecord(request.user._id, request.params.id);
  response.status(200).json({ success: true, message: 'Battery record deleted successfully' });
}

export async function uploadBatteryCsv(request, response) {
  const result = await importBatteryCsv(request.user._id, request.file);
  response.status(result.errors.length ? 400 : 201).json({ success: result.errors.length === 0, ...result });
}
