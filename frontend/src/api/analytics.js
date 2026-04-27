import axios from 'axios';

export const fetchSupplierLeadTimes = async (days = 180) => {
  const res = await axios.get(`/analytics/suppliers/lead-times?days=${days}`);
  return res.data.data;
};

export const fetchProductSegmentation = async ({ days = 90, weeks = 12 } = {}) => {
  const res = await axios.get(`/analytics/products/segmentation?days=${days}&weeks=${weeks}`);
  return res.data.data;
};

export const fetchProductAnomalies = async ({
  spikeDays = 7,
  baselineDays = 28,
  spikeFactor = 2.5,
  adjustAbs = 50
} = {}) => {
  const res = await axios.get(
    `/analytics/products/anomalies?spikeDays=${spikeDays}&baselineDays=${baselineDays}&spikeFactor=${spikeFactor}&adjustAbs=${adjustAbs}`
  );
  return res.data.data;
};

export const fetchMovements = async ({
  productId,
  warehouseId,
  reason,
  page = 1,
  limit = 25
} = {}) => {
  const params = new URLSearchParams();
  if (productId) params.set('productId', productId);
  if (warehouseId) params.set('warehouseId', warehouseId);
  if (reason) params.set('reason', reason);
  params.set('page', String(page));
  params.set('limit', String(limit));

  const res = await axios.get(`/movements?${params.toString()}`);
  return res.data;
};
