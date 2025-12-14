package com.berksozcu.repository;

import com.berksozcu.entites.collections.PaymentCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentCompanyRepository extends JpaRepository<PaymentCompany, Long> {
}
