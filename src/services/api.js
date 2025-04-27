const API_BASE_URL = 'http://localhost:5000/api';

export const fetchStores = async () => {
  const response = await fetch(`${API_BASE_URL}/stores`);
  return response.json();
};