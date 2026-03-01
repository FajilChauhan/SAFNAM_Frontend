export const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    // support multiple claim formats
    const id =
      payload.UserId ||
      payload.userid ||
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

    return id ? parseInt(id) : null;
  } catch (err) {
    return null;
  }
};