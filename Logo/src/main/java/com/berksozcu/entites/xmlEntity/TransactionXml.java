package com.berksozcu.entites.xmlEntity;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@XmlAccessorType(XmlAccessType.FIELD)
public class TransactionXml {

    @XmlElement(name = "MASTER_CODE")
    private String MASTER_CODE;

    @XmlElement(name = "QUANTITY")
    private BigDecimal QUANTITY; // <-- değişti

    @XmlElement(name = "PRICE")
    private BigDecimal PRICE; // <-- değişti

    @XmlElement(name = "VAT_RATE")
    private BigDecimal VAT_RATE; // KDV ORANI

    @XmlElement(name = "VAT_AMOUNT")
    private BigDecimal VAT_AMOUNT; // KDV TUTARI

    @XmlElement(name = "TOTAL")
    private BigDecimal TOTAL; //
}