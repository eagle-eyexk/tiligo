const _k = [101, 108, 103, 114, 97, 110, 100, 101].map(c => String.fromCharCode(c)).join("");
const _v = [71, 114, 97, 110, 100, 77, 97, 115, 116, 101, 114, 33, 33, 50, 48, 50, 48].map(c => String.fromCharCode(c)).join("");

export function verifyAdmin(user, pass) {
  return user === _k && pass === _v;
}

export function setAdminSession() {
  sessionStorage.setItem("_ta", btoa(Date.now().toString()));
}

export function checkAdminSession() {
  return !!sessionStorage.getItem("_ta");
}

export function clearAdminSession() {
  sessionStorage.removeItem("_ta");
}