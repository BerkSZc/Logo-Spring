package com.berksozcu.controller;

import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.material_price_history.MaterialPriceHistory;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface IMaterialPriceHistoryController {
    public List<MaterialPriceHistory> findByMaterialIdAndTypeOrderByDateDesc(
            @PathVariable(name = "materialId") Long materialId, @RequestParam InvoiceType invoiceType
    );
    public List<MaterialPriceHistory> findByMaterialIdOrderByDateDesc(@PathVariable(name ="materialId")
                                                                      Long materialId);
}
