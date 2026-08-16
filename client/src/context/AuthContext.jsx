import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { resetSocket } from "../lib/socket.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("studysync_token");
    if (!token) return setLoading(false);
    api("/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => localStorage.removeItem("studysync_token"))
      .finally(() => setLoading(false));
  }, []);

  async function authenticate(path, payload) {
    const data = await api(path, { method: "POST", body: payload });
    localStorage.setItem("studysync_token", data.token);
    resetSocket();
    setUser(data.user);
    return data.user;
  }

  const value = {
    user,
    loading,
    login: (email, password) => authenticate("/auth/login", { email, password }),
    register: (name, email, password) => authenticate("/auth/register", { name, email, password }),
    logout: () => {
      localStorage.removeItem("studysync_token");
      resetSocket();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
