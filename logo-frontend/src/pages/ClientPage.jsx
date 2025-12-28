import { useEffect, useState, useRef } from "react";
import { useClient } from "../../backend/store/useClient";

export default function ClientsPage() {
  const {
    customers,
    getAllCustomers,
    addCustomer,
    updateCustomer,
    setArchived,
  } = useClient();

  const formRef = useRef(null); // Form için ref

  const [form, setForm] = useState({
    name: "",
    balance: 0,
    address: "",
    country: "",
    local: "",
    district: "",
    vdNo: "",
  });

  const [archiveAction, setArchiveAction] = useState("archive");

  const [contextMenu, setContextMenu] = useState(null);

  const [editClient, setEditClient] = useState(null);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  useEffect(() => {
    getAllCustomers();
  }, [getAllCustomers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editClient) {
      updateCustomer(editClient.id, form);
      setEditClient(null);
    } else {
      addCustomer(form);
    }

    setForm({
      name: "",
      balance: 0,
      address: "",
      country: "",
      local: "",
      district: "",
      vdNo: "",
    });
  };

  const handleEdit = (customer) => {
    if (customer.archived) return;

    setEditClient(customer);
    setForm({
      name: customer.name || "",
      balance: customer.balance || "",
      address: customer.address || "",
      country: customer.country || "",
      local: customer.local || "",
      district: customer.district || "",
      vdNo: customer.vdNo || "",
    });

    // Formun bulunduğu bölüme kaydır
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditClient(null);
    setForm({
      name: "",
      balance: 0,
      address: "",
      country: "",
      local: "",
      district: "",
      vdNo: "",
    });
  };

  const filteredCustomers = Array.isArray(customers)
    ? customers
        .filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()))
        .filter((c) => (showArchived ? c.archived : !c.archived))
    : [];

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleArchiveToggle = async (customer) => {
    await setArchived(customer.id, !customer.archived);
    setOpenMenuId(null);
  };

  const handleCheckboxChange = (customerId) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleArchiveModal = async () => {
    const archivedValue = archiveAction === "archive";

    if (selectedCustomers.length < 2) return;

    for (const id of selectedCustomers) {
      await setArchived(id, archivedValue);
    }

    setSelectedCustomers([]);
    setShowArchiveModal(false);
    setOpenMenuId(null);
  };

  useEffect(() => {
    setSelectedCustomers([]);
    setContextMenu(null);
    setOpenMenuId(null);
  }, [showArchived]);

  const selectedList = filteredCustomers.filter((c) =>
    selectedCustomers.includes(c.id)
  );

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-gray-100 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* ÜST BAŞLIK VE AKSİYONLAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Müşteri Yönetimi
            </h1>
            <p className="text-gray-400 text-lg">
              Müşteri portföyünüzü ve bakiye durumlarını bu alandan kontrol
              edin.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <input
                type="text"
                placeholder="Müşteri ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 pr-4 py-3 bg-gray-900/60 border-2 border-gray-800 rounded-2xl w-full md:w-80 text-white focus:border-blue-500 transition-all outline-none"
              />
              <svg
                className="w-5 h-5 text-gray-500 absolute left-4 top-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 ${
                showArchived
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30"
              }`}
            >
              {showArchived ? "Aktif Listeye Dön" : "Arşivdekiler"}
            </button>
          </div>
        </div>

        {/* EKLEME / DÜZENLEME FORMU KARTI */}
        <div
          className={`p-8 bg-gray-900/40 border rounded-[2.5rem] transition-all duration-500 ${
            editClient
              ? "border-blue-500/50 bg-blue-500/5 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
              : "border-gray-800"
          }`}
        >
          <h3
            className={`text-xl font-bold mb-8 flex items-center gap-3 ${
              editClient ? "text-blue-400" : "text-emerald-400"
            }`}
          >
            <span
              className={`w-2 h-7 rounded-full ${
                editClient ? "bg-blue-500" : "bg-emerald-500"
              }`}
            ></span>
            {editClient
              ? "Müşteri Bilgilerini Güncelle"
              : "Yeni Müşteri Tanımla"}
          </h3>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {[
              ["name", "Müşteri Unvanı"],
              ["balance", "Bakiye"],
              ["country", "Ülke"],
              ["local", "İl"],
              ["district", "İlçe"],
              ["vdNo", "Vergi No"],
            ].map(([key, label]) => (
              <div key={key} className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                  {label}
                </label>
                <input
                  type={key === "balance" || key === "vdNo" ? "number" : "text"}
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none"
                />
              </div>
            ))}

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                Tam Adres
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none"
              />
            </div>

            <div className="md:col-span-4 flex justify-end gap-4 pt-4 mt-2 border-t border-gray-800">
              {editClient && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-8 py-3 bg-transparent border-2 border-gray-700 text-gray-400 font-bold rounded-xl hover:bg-gray-800 transition-all"
                >
                  İptal
                </button>
              )}
              <button
                type="submit"
                className={`px-10 py-3 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg ${
                  editClient
                    ? "bg-blue-600 hover:bg-blue-500"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {editClient ? "Güncelle" : "Sisteme Kaydet"}
              </button>
            </div>
          </form>
        </div>

        {/* TABLO LİSTESİ */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold flex items-center gap-3">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
            Kayıtlı Müşteri Listesi
          </h3>

          <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-800/30 text-gray-500 border-b border-gray-800">
                    <th className="p-5 w-12 text-center">
                      {/* Checkbox Placeholder */}
                    </th>
                    <th className="p-5 text-xs font-bold uppercase tracking-widest">
                      Unvan / Adres
                    </th>
                    <th className="p-5 text-xs font-bold uppercase tracking-widest">
                      Bölge
                    </th>
                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-right">
                      Bakiye
                    </th>
                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-center w-24">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((c) => (
                      <tr
                        key={c.id}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenu({
                            x: e.clientX,
                            y: e.clientY,
                            customer: c,
                          });
                          if (selectedCustomers.length === 0)
                            setSelectedCustomers([c.id]);
                        }}
                        className={`group transition-all duration-200 ${
                          c.archived
                            ? "opacity-40 grayscale bg-gray-900/20"
                            : "hover:bg-blue-500/5"
                        }`}
                      >
                        <td className="p-5 text-center">
                          <input
                            type="checkbox"
                            checked={selectedCustomers.includes(c.id)}
                            onChange={() => handleCheckboxChange(c.id)}
                            className="w-5 h-5 rounded-lg accent-blue-500 bg-gray-800 border-gray-700"
                          />
                        </td>
                        <td className="p-5">
                          <div className="font-bold text-white text-lg">
                            {c.name}
                          </div>
                          <div className="text-xs text-gray-500 font-mono mt-1">
                            {c.address || "Adres bilgisi yok"}
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="text-gray-300 text-sm">
                            {c.local} / {c.district}
                          </div>
                          <div className="text-[10px] text-blue-500 uppercase font-bold mt-1 tracking-widest">
                            {c.country}
                          </div>
                        </td>
                        <td className="p-5 text-right font-mono">
                          <span
                            className={`text-lg font-bold ${
                              Number(c.balance) < 0
                                ? "text-red-400"
                                : "text-emerald-400"
                            }`}
                          >
                            ₺{" "}
                            {Number(c.balance || 0).toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </td>
                        <td className="p-5 text-center">
                          <button
                            onClick={() => toggleMenu(c.id)}
                            className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-400 transition-all"
                          >
                            <svg
                              className="w-6 h-6"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>

                          {openMenuId === c.id && (
                            <div className="absolute right-12 top-0 bg-white border border-gray-100 rounded-xl shadow-xl w-48 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                              {!c.archived && (
                                <button
                                  onClick={() => handleEdit(c)}
                                  className="flex items-center gap-2 w-full px-4 py-3 hover:bg-gray-50 text-sm text-gray-700"
                                >
                                  <svg
                                    className="w-4 h-4 text-blue-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Düzenle
                                </button>
                              )}
                              <button
                                onClick={() => handleArchiveToggle(c)}
                                className="flex items-center gap-2 w-full px-4 py-3 hover:bg-gray-50 text-sm text-orange-600 border-t border-gray-50"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                                {c.archived ? "Arşivden Çıkar" : "Arşivle"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-20 text-center text-gray-600 italic"
                      >
                        Arama kriterlerine uygun müşteri bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {showArchiveModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-xl w-[420px] shadow-xl text-center">
                  <h3 className="text-xl font-semibold mb-4">
                    Müşteriler{" "}
                    {archiveAction === "unarchive"
                      ? "Arşivden çıkartılsın mı?"
                      : "Arşivlensin mi?"}
                  </h3>

                  <p className="mb-6 text-gray-600">
                    <strong>{selectedCustomers.length}</strong> adet müşteri
                    {archiveAction === "unarchive"
                      ? " arşivden çıkartılacak"
                      : " arşivlenecek"}
                    . . Devam etmek istiyor musunuz?
                  </p>

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setShowArchiveModal(false)}
                      className="px-4 py-2 bg-gray-400 text-white rounded"
                    >
                      Vazgeç
                    </button>

                    <button
                      onClick={handleArchiveModal}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Devam et
                    </button>
                  </div>
                </div>
              </div>
            )}
            {contextMenu && (
              <div
                className="fixed inset-0 z-50"
                onClick={() => setContextMenu(null)}
              >
                <div
                  style={{ top: contextMenu.y, left: contextMenu.x }}
                  className="absolute bg-white border rounded-lg shadow-lg w-48"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* 1 SEÇİM VARSA */}
                  {selectedCustomers.length === 1 && (
                    <button
                      onClick={() => {
                        const customer = selectedList[0];
                        handleEdit(customer);
                        setContextMenu(null);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Düzenle
                    </button>
                  )}

                  {/* 1 VEYA FAZLA SEÇİM */}
                  {selectedCustomers.length >= 1 && (
                    <button
                      onClick={() => {
                        setArchiveAction(
                          selectedList.every((c) => c.archived)
                            ? "unarchive"
                            : "archive"
                        );
                        setShowArchiveModal(true);
                        setContextMenu(null);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {selectedList.every((c) => c.archived)
                        ? "Seçilenleri Arşivden Çıkar"
                        : "Seçilenleri Arşivle"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
