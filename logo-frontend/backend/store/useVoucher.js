import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useVoucher = create((set, get) => ({
  balance: null,

  // transferBalance: async (customerId, currentYear) => {
  //   try {
  //     const res = await axiosInstance.post(
  //       "/voucher/transfer-balance",
  //       {},
  //       {
  //         params: { customerId, currentYear },
  //       }
  //     );
  //     set({ balance: res.data });
  //     toast.success(`${currentYear} yılı devir işlemi başarılı!`);
  //     return res.data;
  //   } catch (error) {
  //     const backendErr =
  //       error?.response?.data?.exception?.message || "Bilinmeyen Hata";
  //     toast.error("Error at transferBalance: " + backendErr);
  //   }
  // },
  transferAllBalances: async (targetYear) => {
    try {
      const res = await axiosInstance.post(
        "/voucher/transfer-all",
        {},
        {
          params: { targetYear },
        }
      );
      toast.success(`${targetYear} yılı tüm cari devirleri tamamlandı.`);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at transferBalance: " + backendErr);
    }
  },
  getOpeningVoucherByYear: async (customerId, date) => {
    try {
      const res = await axiosInstance.get("/voucher/get-by-year", {
        params: { customerId, date },
      });
      return res.data;
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at getOpeningVoucherByYear: " + backendErr);
    }
  },
}));
