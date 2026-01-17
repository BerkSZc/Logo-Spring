import { useEffect, useMemo, useRef, useState } from "react";
import { usePurchaseInvoice } from "../../../../backend/store/usePurchaseInvoice";
import { useSalesInvoice } from "../../../../backend/store/useSalesInvoice";
import { useMaterial } from "../../../../backend/store/useMaterial";
import { useClient } from "../../../../backend/store/useClient";
import { useCurrency } from "../../../../backend/store/useCurrency.js";
import { useYear } from "../../../context/YearContext";
import { useTenant } from "../../../context/TenantContext";
import { generateInvoiceHTML } from "../../../utils/printHelpers.js";

export const useInvoicePageLogic = () => {
  const {
    purchase,
    editPurchaseInvoice,
    deletePurchaseInvoice,
    getPurchaseInvoiceByYear,
  } = usePurchaseInvoice();
  const {
    sales,
    editSalesInvoice,
    deleteSalesInvoice,
    getSalesInvoicesByYear,
  } = useSalesInvoice();
  const { materials, getMaterials } = useMaterial();
  const { customers, getAllCustomers } = useClient();
  const { convertCurrency } = useCurrency();
  const { year } = useYear();
  const { tenant } = useTenant();

  const [invoiceType, setInvoiceType] = useState("purchase");
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const [printItem, setPrintItem] = useState(null);
  const [form, setForm] = useState(null);
  const [totals, setTotals] = useState({
    kdvToplam: 0,
    totalPrice: 0,
    grandTotal: 0,
  });

  useEffect(() => {
    if (!year) return;
    getMaterials();
    getAllCustomers();
    invoiceType === "purchase"
      ? getPurchaseInvoiceByYear(year)
      : getSalesInvoicesByYear(year);
  }, [year, invoiceType, tenant]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const executePrint = (inv) => {
    if (!inv) return;
    const printWindow = window.open("", "_blank", "width=1000, height=800");
    if (printWindow) {
      const html = generateInvoiceHTML(inv, invoiceType);
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      setPrintItem(null);
    }
  };

  const handleRateChange = (field, value) => {
    let formattedValue = value.replace(/[^0-9.]/g, "");

    const pointCount = (formattedValue.match(/\./g) || []).length;
    if (pointCount > 1) return;

    if (formattedValue.length > 5) return;

    if (
      formattedValue.length === 2 &&
      !formattedValue.includes(".") &&
      formattedValue.length > (form[field]?.length || 0)
    ) {
      formattedValue += ".";
    }
    const numericRate = Number(formattedValue) || 0;

    setForm((prev) => {
      const updatedItems = prev.items.map((item) => {
        const material = materials.find(
          (m) => m.id === Number(item.materialId)
        );
        if (!material) return item;

        const mCurrency =
          invoiceType === "sales"
            ? material.salesCurrency
            : material.purchaseCurrency;
        const mPrice =
          invoiceType === "sales"
            ? material.salesPrice
            : material.purchasePrice;

        let newUnitPrice = item.unitPrice;

        if (field === "usdSellingRate" && mCurrency === "USD")
          newUnitPrice = mPrice * numericRate;
        if (field === "eurSellingRate" && mCurrency === "EUR")
          newUnitPrice = mPrice * numericRate;

        const qty = Number(item.quantity) || 0;
        const kdvRate = Number(item.kdv) || 0;
        const newLineTotal = newUnitPrice * qty;
        const newKdvTutar = (newLineTotal * kdvRate) / 100;

        return {
          ...item,
          unitPrice: newUnitPrice,
          lineTotal: newLineTotal,
          kdvTutar: newKdvTutar,
        };
      });

      return { ...prev, [field]: formattedValue, items: updatedItems };
    });
  };

  const handleMaterialSelect = async (index, materialId) => {
    const selectedMaterial = materials.find((m) => m.id === Number(materialId));
    if (!selectedMaterial) return;

    let finalPrice = 0;

    const basePrice =
      invoiceType === "sales"
        ? selectedMaterial.salesPrice || 0
        : selectedMaterial.purchasePrice || 0;

    const currency =
      invoiceType === "sales"
        ? selectedMaterial.salesCurrency || "TRY"
        : selectedMaterial.purchaseCurrency || "TRY";

    if (currency !== "TRY" && basePrice > 0) {
      const calculatedPrice = await convertCurrency(basePrice, currency);
      finalPrice = calculatedPrice || basePrice;
    } else {
      finalPrice = basePrice;
    }

    setForm((prev) => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        materialId: String(materialId),
        unitPrice: finalPrice,
      };
      return { ...prev, items: newItems };
    });
  };

  const handleItemChange = (index, field, value) => {
    if (field === "materialId") {
      handleMaterialSelect(index, value);
    } else {
      setForm((prev) => {
        const newItems = [...prev.items];
        newItems[index] = { ...newItems[index], [field]: value };
        return { ...prev, items: newItems };
      });
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);

    const totalPrice =
      Number(invoice.totalPrice) - Number(invoice.kdvToplam) || 0;
    const kdvToplam = Number(invoice.kdvToplam) || 0;

    setTotals({
      totalPrice: Number(totalPrice.toFixed(2)),
      kdvToplam: Number(kdvToplam.toFixed(2)),
      grandTotal: Number(invoice.totalPrice).toFixed(2) || 0,
    });

    setForm({
      date: invoice.date,
      fileNo: invoice.fileNo,
      customerId: invoice.customer.id,
      usdSellingRate: invoice.usdSellingRate || "",
      eurSellingRate: invoice.eurSellingRate || "",
      items: invoice.items.map((i) => ({
        materialId: String(i.material.id),
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        kdv: i.kdv,
        lineTotal: i.lineTotal || i.unitPrice * i.quantity || 0,
        kdvTutar: i.kdvTutar,
      })),
    });
  };

  const handleSave = async () => {
    const payload = {
      date: form.date,
      fileNo: form.fileNo,
      customer: { id: Number(form.customerId) },
      usdSellingRate: Number(form.usdSellingRate),
      eurSellingRate: Number(form.eurSellingRate),
      items: form.items.map((i) => ({
        material: { id: Number(i.materialId) },
        unitPrice: Number(i.unitPrice),
        quantity: Number(i.quantity),
        kdv: Number(i.kdv),
      })),
    };
    invoiceType === "purchase"
      ? await editPurchaseInvoice(editingInvoice.id, payload)
      : await editSalesInvoice(editingInvoice.id, payload);
    invoiceType === "purchase"
      ? getPurchaseInvoiceByYear(year)
      : getSalesInvoicesByYear(year);
    setEditingInvoice(null);
    setForm(null);
  };

  const confirmDelete = async () => {
    invoiceType === "purchase"
      ? await deletePurchaseInvoice(deleteTarget.id)
      : await deleteSalesInvoice(deleteTarget.id);
    invoiceType === "purchase"
      ? getPurchaseInvoiceByYear(year)
      : getSalesInvoicesByYear(year);
    setDeleteTarget(null);
  };

  const calculateRow = (price, qty, kdvRate) => {
    const lineTotal = (Number(price) || 0) * (Number(qty) || 0);
    const kdvTutar = (lineTotal * (Number(kdvRate) || 0)) / 100;
    return { lineTotal, kdvTutar };
  };

  const modalTotals = useMemo(() => {
    if (!form || !form.items) return { subTotal: 0, kdvTotal: 0 };
    return form.items.reduce(
      (acc, item) => {
        const { lineTotal, kdvTutar } = calculateRow(
          item.unitPrice,
          item.quantity,
          item.kdv
        );
        return {
          subTotal: acc.subTotal + lineTotal,
          kdvTotal: acc.kdvTotal + kdvTutar,
        };
      },
      { subTotal: 0, kdvTotal: 0 }
    );
  }, [form?.items]);

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          materialId: "",
          unitPrice: "",
          quantity: "",
          kdv: 20,
          kdvTutar: 0,
          lineTotal: 0,
        },
      ],
    }));
  };

  const removeItem = (idx) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handlePriceSelect = (index, price, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setForm((prev) => {
      const updated = [...prev.items];
      const qty = Number(updated[index].quantity) || 0;
      const kdv = Number(updated[index].kdv) || 0;

      const currentLineTotal = price * qty;
      const currentKdvTutar = (currentLineTotal * kdv) / 100;

      updated[index] = {
        ...updated[index],
        unitPrice: price,
        lineTotal: currentLineTotal,
        kdvTutar: currentKdvTutar,
      };
      return { ...prev, items: updated };
    });
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const filteredInvoices = (
    Array.isArray(invoiceType === "purchase" ? purchase : sales)
      ? invoiceType === "purchase"
        ? purchase
        : sales
      : []
  ).filter((inv) => {
    const term = searchTerm.toLocaleLowerCase("tr-TR");
    return (
      inv.fileNo?.toString().toLocaleLowerCase("tr-TR").includes(term) ||
      inv.customer?.name?.toLocaleLowerCase("tr-TR").includes(term) ||
      inv.date?.toLocaleLowerCase("tr-TR").includes(term)
    );
  });

  return {
    state: {
      invoiceType,
      editingInvoice,
      deleteTarget,
      searchTerm,
      openMenuId,
      menuRef,
      printItem,
      form,
      totals,
      modalTotals,
      filteredInvoices,
      year,
      materials,
      customers,
    },
    handlers: {
      toggleMenu,
      setEditingInvoice,
      setInvoiceType,
      setSearchTerm,
      setPrintItem,
      setForm,
      handleItemChange,
      addItem,
      removeItem,
      handlePriceSelect,
      executePrint,
      handleEdit,
      handleSave,
      handleRateChange,
      confirmDelete,
      setDeleteTarget,
    },
  };
};
