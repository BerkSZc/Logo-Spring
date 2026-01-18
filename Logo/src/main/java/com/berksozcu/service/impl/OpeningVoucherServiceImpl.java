package com.berksozcu.service.impl;

import com.berksozcu.entites.collections.PaymentCompany;
import com.berksozcu.entites.collections.ReceivedCollection;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.entites.payroll.Payroll;
import com.berksozcu.entites.purchase.PurchaseInvoice;
import com.berksozcu.entites.sales.SalesInvoice;
import com.berksozcu.repository.*;
import com.berksozcu.service.IOpeningVoucherService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


@Service
public class OpeningVoucherServiceImpl implements IOpeningVoucherService {


    @Autowired
    private OpeningVoucherRepository openingVoucherRepository;

    @Autowired
    private PurchaseInvoiceRepository purchaseInvoiceRepository;

    @Autowired
    private SalesInvoiceRepository salesInvoiceRepository;

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private ReceivedCollectionRepository receivedCollectionRepository;

    @Autowired
    private PaymentCompanyRepository paymentCompanyRepository;

    @Autowired
    private CustomerRepository customerRepository;


    @Transactional
    @Override
    public OpeningVoucher calculateAndSetOpeningVoucher(Customer customer, int targetYear) {
        LocalDate calculationLimit = LocalDate.of(targetYear, 1, 1);



        BigDecimal totalSales = salesInvoiceRepository.findByCustomerIdAndDateBefore(customer.getId(), calculationLimit)
                .stream().map(SalesInvoice::getTotalPrice).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPayments = paymentCompanyRepository.findByCustomerIdAndDateBefore(customer.getId(), calculationLimit)
                .stream().map(PaymentCompany::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPurchases = purchaseInvoiceRepository.findByCustomerIdAndDateBefore(customer.getId(), calculationLimit)
                .stream().map(PurchaseInvoice::getTotalPrice).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCollections = receivedCollectionRepository.findByCustomerIdAndDateBefore(customer.getId(), calculationLimit)
                .stream().map(ReceivedCollection::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPayrolls = payrollRepository.findByCustomerIdAndTransactionDateBefore(customer.getId(), calculationLimit)
                .stream().map(Payroll::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal initialBalance = customer.getOpeningBalance() != null ? customer.getOpeningBalance() : BigDecimal.ZERO;


        BigDecimal debitSum = totalSales.add(totalPayments).add(initialBalance);
        BigDecimal creditSum = totalPurchases.add(totalCollections).add(totalPayrolls);

        BigDecimal finalBalance = debitSum.subtract(creditSum);


        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDate(customer.getId(), calculationLimit)
                .orElse(new OpeningVoucher());

        voucher.setCustomer(customer);
        voucher.setCustomerName(customer.getName());
        voucher.setDate(calculationLimit);
        voucher.setDescription(targetYear + " Yılı Otomatik Devir");


        // Bakiyeyi Borç (Debit) veya Alacak (Credit) sütununa yerleştir
        if (finalBalance.compareTo(BigDecimal.ZERO) >= 0) {
            voucher.setDebit(finalBalance.setScale(2, RoundingMode.HALF_UP));
            voucher.setCredit(BigDecimal.ZERO);
        } else {
            voucher.setDebit(BigDecimal.ZERO);
            voucher.setCredit(finalBalance.abs().setScale(2, RoundingMode.HALF_UP));
        }

        return openingVoucherRepository.save(voucher);
    }

    @Transactional
    public void transferAllCustomers(int targetYear) {

        List<Customer> allCustomers = customerRepository.findAll();

        for (Customer customer : allCustomers) {
            try {
                this.calculateAndSetOpeningVoucher(customer, targetYear);
            } catch (Exception e) {
                System.err.println("Müşteri devir hatası (" + customer.getName() + "): " + e.getMessage());
            }
        }
    }

    @Override
    public OpeningVoucher getOpeningVoucherByCustomer(Long customerId, LocalDate date) {
        LocalDate start = LocalDate.of(date.getYear(), 1, 1);
        LocalDate end = LocalDate.of(date.getYear(), 12, 31);
        return openingVoucherRepository
                .findByCustomerIdAndDateBetween(customerId, start, end).stream().findFirst()
                .orElse(null);
    }
}