package com.berksozcu.entites.collections;

import com.berksozcu.entites.customer.Customer;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "payment_company")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentCompany {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    //Tarih
    private Date date;

    //Açıklama
    private String comment;

    //Tutar
    private BigDecimal price;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    //Müşteri İsmi
    private String customerName;
}
