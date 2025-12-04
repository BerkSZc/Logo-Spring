import React, { useEffect } from "react";
import { usePurchaseInvoice } from "../../backend/store/usePurchaseInvoice.js";
import { useSalesInvoice } from "../../backend/store/useSalesInvoice.js";
import { useClient } from "../../backend/store/useClient.js";
import { useReceivedCollection } from "../../backend/store/useReceivedCollection.js";
import { usePaymentCompany } from "../../backend/store/usePaymentCompany.js";

export function HomePage() {
  const { purchase, getAllPurchaseInvoices } = usePurchaseInvoice();
  const { sales, getAllSalesInvoices } = useSalesInvoice();
  const { customers, getAllCustomers } = useClient();
  const { collections, getCollections } = useReceivedCollection();
  const { payments, getPayments } = usePaymentCompany();

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    getAllPurchaseInvoices();
    getAllSalesInvoices();
    getAllCustomers();
    getCollections();
    getPayments();
  }, []);

  // Borçlar ve Alacaklar toplamını hesapla
  const totalAlacak = collections.reduce((sum, c) => sum + Number(c.price), 0);
  const totalBorc = payments.reduce((sum, p) => sum + Number(p.price), 0);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Üst Başlık */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Hoş geldiniz! Sistem özetlerini aşağıda görebilirsiniz.
        </p>
      </header>

      {/* Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition">
          <h2 className="text-lg font-medium text-gray-600">
            Satın Alma Faturaları
          </h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {purchase.length}
          </p>
          <p className="text-gray-400 mt-1">Toplam faturalar</p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition">
          <h2 className="text-lg font-medium text-gray-600">
            Satış Faturaları
          </h2>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {sales.length}
          </p>
          <p className="text-gray-400 mt-1">Toplam faturalar</p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition">
          <h2 className="text-lg font-medium text-gray-600">Müşteriler</h2>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {customers.length}
          </p>
          <p className="text-gray-400 mt-1">Kayıtlı müşteri</p>
        </div>

        {/* Borçlar */}
        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition">
          <h2 className="text-lg font-medium text-gray-600">Borçlar</h2>
          <p className="text-3xl font-bold text-red-600 mt-2">
            ₺ {totalBorc.toLocaleString("tr-TR")}
          </p>
          <p className="text-gray-400 mt-1">Firmalara ödenen toplam</p>
        </div>

        {/* Alacaklar */}
        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition">
          <h2 className="text-lg font-medium text-gray-600">Alacaklar</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">
            ₺ {totalAlacak.toLocaleString("tr-TR")}
          </p>
          <p className="text-gray-400 mt-1">Tahsil edilen toplam</p>
        </div>
      </div>

      {/* Link Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition p-6 flex flex-col justify-between">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Satış Faturaları
          </h3>
          <p className="text-gray-500 mb-6">
            Tüm satış faturalarınızı görüntüleyebilir, düzenleyebilir ve yeni
            fatura oluşturabilirsiniz.
          </p>
          <a
            href="/faturalar"
            className="mt-auto inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
          >
            Git
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition p-6 flex flex-col justify-between">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Satın Alma Faturaları
          </h3>
          <p className="text-gray-500 mb-6">
            Satın alma faturalarını görüntüleyebilir ve yeni fatura
            ekleyebilirsiniz.
          </p>
          <a
            href="/faturalar"
            className="mt-auto inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Git
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition p-6 flex flex-col justify-between">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Müşteriler
          </h3>
          <p className="text-gray-500 mb-6">
            Tüm müşterileri görüntüleyebilir ve yeni müşteri ekleyebilirsiniz.
          </p>
          <a
            href="/musteriler"
            className="mt-auto inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
          >
            Git
          </a>
        </div>
      </div>
    </div>
  );
}
