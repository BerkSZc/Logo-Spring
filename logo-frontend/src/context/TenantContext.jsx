import { createContext, useContext, useEffect, useState } from "react";
import { setTenant } from "../../backend/lib/axios.js";

const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
  const [tenant, setTenantState] = useState(() => {
    return localStorage.getItem("tenant") || "A";
  });

  const changeTenant = (newTenant) => {
    setTenantState(newTenant);
    setTenant(newTenant);
    localStorage.setItem("tenant", newTenant);
  };

  useEffect(() => {
    setTenant(tenant);
  }, [tenant]);

  return (
    <TenantContext.Provider value={{ tenant, changeTenant }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
