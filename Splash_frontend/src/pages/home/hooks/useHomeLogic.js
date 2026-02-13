import { useEffect, useMemo } from "react";
import { usePurchaseInvoice } from "../../../../backend/store/usePurchaseInvoice.js";
import { useSalesInvoice } from "../../../../backend/store/useSalesInvoice.js";
import { useClient } from "../../../../backend/store/useClient.js";
import { useReceivedCollection } from "../../../../backend/store/useReceivedCollection.js";
import { usePaymentCompany } from "../../../../backend/store/usePaymentCompany.js";
import { useYear } from "../../../context/YearContext.jsx";
import { useTenant } from "../../../context/TenantContext.jsx";
import { useCompany } from "../../../../backend/store/useCompany.js";

export const useHomeLogic = () => {
  const { companies, getAllCompanies } = useCompany();
  const { purchase, getPurchaseInvoiceByYear } = usePurchaseInvoice();
  const { sales, getSalesInvoicesByYear } = useSalesInvoice();
  const { customers, getAllCustomers } = useClient();
  const { collections, getReceivedCollectionsByYear } = useReceivedCollection();
  const { payments, getPaymentCollectionsByYear } = usePaymentCompany();

  const { year } = useYear();
  const { tenant } = useTenant();

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      if (!year || !tenant) return;
      await Promise.all([
        getAllCompanies(),
        getAllCustomers(),
        getReceivedCollectionsByYear(year),
        getPaymentCollectionsByYear(year),
        getPurchaseInvoiceByYear(year),
        getSalesInvoicesByYear(year),
      ]);
    };
    if (ignore) return;

    fetchData();
    return () => {
      ignore = true;
    };
  }, [year, tenant]);

  // Finansal hesaplamalar
  const financialSummary = useMemo(() => {
    const totalCredits = (Array.isArray(collections) ? collections : []).reduce(
      (sum, c) => sum + Number(c?.price || 0),
      0,
    );
    const totalDebts = (Array.isArray(payments) ? payments : []).reduce(
      (sum, p) => sum + Number(p?.price || 0),
      0,
    );
    return { totalCredits, totalDebts };
  }, [collections, payments]);

  const currentCompany = (Array.isArray(companies) ? companies : []).find(
    (c) => c?.schemaName === tenant,
  );
  const companyDisplayName = currentCompany
    ? currentCompany.name
    : tenant?.toUpperCase();

  return {
    state: {
      purchase: Array.isArray(purchase) ? purchase : [],
      sales: Array.isArray(sales) ? sales : [],
      customers: Array.isArray(customers) ? customers : [],
      totalCredits: financialSummary.totalCredits,
      totalDebts: financialSummary.totalDebts,
      companyDisplayName,
      year,
      lastUpdate: new Date().toLocaleString("tr-TR"),
    },
  };
};
