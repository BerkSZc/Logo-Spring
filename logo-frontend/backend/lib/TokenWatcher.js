import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useAuthentication } from "../store/useAuthentication.js";

export default function TokenWatcher() {
  const { logout } = useAuthentication();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode(token);
    const now = Date.now() / 1000; // saniye cinsinden
    const timeLeft = decoded.exp - now;

    if (timeLeft <= 0) {
      logout(); // token süresi zaten dolmuşsa hemen logout
      return;
    }

    // Token süresi dolunca otomatik logout
    const timeout = setTimeout(() => {
      logout();
    }, timeLeft * 1000);

    return () => clearTimeout(timeout); // cleanup
  }, [logout]);

  return null;
}
