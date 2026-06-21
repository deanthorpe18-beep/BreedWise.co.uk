/** Persist which breeder an admin is previewing in the breeding portal. */

const ID_KEY = "breedwise_portal_admin_as";
const NAME_KEY = "breedwise_portal_admin_name";

export function setPortalAdminContext(breederId, breederName) {
  if (typeof window === "undefined" || !breederId) return;
  sessionStorage.setItem(ID_KEY, breederId);
  if (breederName) sessionStorage.setItem(NAME_KEY, breederName);
}

export function clearPortalAdminContext() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ID_KEY);
  sessionStorage.removeItem(NAME_KEY);
}

export function readPortalAdminContext() {
  if (typeof window === "undefined") return { id: null, name: null };
  return {
    id: sessionStorage.getItem(ID_KEY),
    name: sessionStorage.getItem(NAME_KEY),
  };
}
