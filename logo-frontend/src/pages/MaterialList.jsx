import { useEffect, useState } from "react";
import { useMaterial } from "../../backend/store/useMaterial.js";

export default function MaterialList() {
  const { materials, getMaterials, updateMaterials } = useMaterial();
  const [editMaterial, setEditMaterial] = useState(null);

  useEffect(() => {
    getMaterials();
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditMaterial({ ...editMaterial, [name]: value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateMaterials(editMaterial.id, editMaterial);
    setEditMaterial(null);
    await getMaterials();
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-gray-100 p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* BAŞLIK */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Malzeme Listesi
            </h2>
            <p className="text-gray-400 mt-1">
              Sistemde tanımlı tüm malzemeleri görüntüleyin ve düzenleyin.
            </p>
          </div>
        </div>

        {/* DÜZENLEME FORMU KARTI */}
        {editMaterial && (
          <div className="p-8 bg-blue-500/5 border border-blue-500/30 rounded-[2.5rem] shadow-[0_0_30px_rgba(59,130,246,0.1)] animate-in fade-in zoom-in duration-300">
            <h3 className="text-xl font-bold mb-6 text-blue-400 flex items-center gap-3">
              <span className="w-2 h-7 bg-blue-500 rounded-full"></span>
              Malzeme Düzenle{" "}
              <span className="text-gray-500 text-sm font-mono">
                (ID: {editMaterial.id})
              </span>
            </h3>

            <form
              onSubmit={handleUpdate}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Malzeme Kodu
                </label>
                <input
                  name="code"
                  value={editMaterial.code}
                  onChange={handleEditChange}
                  className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Açıklama
                </label>
                <input
                  name="comment"
                  value={editMaterial.comment}
                  onChange={handleEditChange}
                  className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Birim
                </label>
                <select
                  name="unit"
                  value={editMaterial.unit}
                  onChange={handleEditChange}
                  className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none cursor-pointer"
                >
                  <option value="KG">KG</option>
                  <option value="ADET">ADET</option>
                  <option value="M">METRE (M)</option>
                </select>
              </div>

              <div className="md:col-span-3 flex justify-end gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setEditMaterial(null)}
                  className="px-8 py-3 bg-transparent border-2 border-gray-700 text-gray-400 font-bold rounded-xl hover:bg-gray-800 transition-all"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TABLO LİSTESİ */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800/30 text-gray-500 border-b border-gray-800">
                  <th className="p-5 text-xs font-bold uppercase tracking-widest">
                    ID
                  </th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest">
                    Malzeme Kodu
                  </th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest">
                    Açıklama
                  </th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest">
                    Birim
                  </th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-center">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {materials.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-20 text-center text-gray-600 italic"
                    >
                      Henüz malzeme eklenmemiş.
                    </td>
                  </tr>
                ) : (
                  materials.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-blue-500/5 transition-all duration-200 group"
                    >
                      <td className="p-5 font-mono text-gray-500 text-sm">
                        {m.id}
                      </td>
                      <td className="p-5 font-bold text-white group-hover:text-blue-400 transition-colors">
                        {m.code}
                      </td>
                      <td className="p-5 text-gray-400 text-sm">{m.comment}</td>
                      <td className="p-5">
                        <span className="px-3 py-1 bg-gray-800 text-blue-400 rounded-lg text-xs font-mono font-bold tracking-wider border border-gray-700">
                          {m.unit}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <button
                          onClick={() => {
                            setEditMaterial(m);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="px-5 py-2 bg-gray-800 hover:bg-yellow-500/20 hover:text-yellow-500 text-gray-400 font-bold rounded-xl transition-all border border-gray-700"
                        >
                          Düzenle
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
