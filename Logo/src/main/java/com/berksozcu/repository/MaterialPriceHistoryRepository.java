package com.berksozcu.repository;

import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.material_price_history.MaterialPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialPriceHistoryRepository extends JpaRepository<MaterialPriceHistory, Long> {
    //Belli bir malzemenin liste şeklinde fiyat geçmişine bakmak için kullanılır hem alış hem satış.
    List<MaterialPriceHistory> findByMaterialIdOrderByDateDesc(Long materialId);

    //Belli bir malzemenin son fiyatına bakmak için kullanılır.
//    MaterialPriceHistory findTopByMaterialIdAndTypeOrderByDateDesc(
//           Long materialId, InvoiceType invoiceType
//   );
//
   //Fatura tipine göre belli bir malzemenin liste şeklinde fiyat geçmişine bakmak için kullanılır.
   List<MaterialPriceHistory> findByMaterialIdAndInvoiceTypeOrderByDateDesc(
            Long materialId, InvoiceType invoiceType
   );

    void deleteByMaterialIdAndInvoiceId(Long material, Long invoiceId);
}
