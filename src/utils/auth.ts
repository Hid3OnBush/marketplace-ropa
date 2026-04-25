const ADMIN_KEY = "is_admin_logged_in";

export function isAdminLoggedIn(): boolean {
  return localStorage.getItem(ADMIN_KEY) === "true";
}

export function loginAdmin(password: string): boolean {
  const ADMIN_PASSWORD = "admin123";

  if (password === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_KEY, "true");
    return true;
  }

  return false;
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_KEY);
}