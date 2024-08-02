
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  return headers;
}
