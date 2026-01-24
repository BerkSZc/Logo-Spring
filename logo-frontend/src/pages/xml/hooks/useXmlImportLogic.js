import { useRef, useState } from "react";
import { useImportXml } from "../../../../backend/store/useImportXml";

export const useXmlImportLogic = () => {
  const purchaseInvoiceInputRef = useRef(null);
  const salesInvoiceInputRef = useRef(null);
  const materialInputRef = useRef(null);
  const customerInputRef = useRef(null);
  const collectionInputRef = useRef(null);
  const payrollInputRef = useRef(null);
  const voucherInputRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const {
    importPurchaseInvoice,
    importMaterials,
    importCustomers,
    importCollections,
    importSalesInvoice,
    importPayrolls,
    importVouchers,
  } = useImportXml();

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      upload(file, type, e.target);
    }
  };

  const upload = async (file, type, targetInput) => {
    if (!file) return;
    setLoading(true);

    try {
      if (type === "invoice") await importPurchaseInvoice(file);
      else if (type === "materials") await importMaterials(file);
      else if (type === "customers") await importCustomers(file);
      else if (type === "cash") await importCollections(file);
      else if (type === "sales-invoice") await importSalesInvoice(file);
      else if (type === "payroll") await importPayrolls(file);
      else if (type === "vouchers") await importVouchers(file);
    } finally {
      setLoading(false);
      if (targetInput) targetInput.value = "";
    }
  };

  return {
    state: { loading },
    refs: {
      purchaseInvoiceInputRef,
      salesInvoiceInputRef,
      materialInputRef,
      customerInputRef,
      collectionInputRef,
      payrollInputRef,
      voucherInputRef,
    },
    handlers: { handleFileChange },
  };
};
