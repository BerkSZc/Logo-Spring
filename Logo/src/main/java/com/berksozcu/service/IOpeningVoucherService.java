package com.berksozcu.service;

import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;

import java.time.LocalDate;

public interface IOpeningVoucherService {
     OpeningVoucher calculateAndSetOpeningVoucher(Customer customer, int targetYear);
     void transferAllCustomers(int targetYear);
     OpeningVoucher getOpeningVoucherByCustomer(Long customerId, LocalDate date);

}
