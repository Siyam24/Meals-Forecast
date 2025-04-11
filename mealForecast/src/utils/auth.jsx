export const getAuthDetails = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // Retrieve role from storage
  return { isAuthenticated: !!token, role: role || "" };
};
