import axios from 'axios';

export const fetchIntelligenceOverview = async (days = 30) => {
  const res = await axios.get(`/intelligence/overview?days=${days}`);
  return res.data.data;
};

export const fetchProductInsights = async (productId, days = 30) => {
  const res = await axios.get(`/intelligence/products/${productId}?days=${days}`);
  return res.data.data;
};

