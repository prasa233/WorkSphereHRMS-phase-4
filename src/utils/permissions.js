export function hasRole(user, allowedRoles = []) {
  if (!user) return false;

  if (user.is_superuser === true) return true;

  const role = String(user.role || "").toLowerCase();

  return allowedRoles.some(
    (allowed) => allowed.toLowerCase() === role
  );
}