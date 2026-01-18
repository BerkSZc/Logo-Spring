package com.berksozcu.service.impl;

import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.MaterialRepository;
import com.berksozcu.repository.OpeningVoucherRepository;
import com.berksozcu.repository.PurchaseInvoiceRepository;
import com.berksozcu.service.ICustomerService;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class CustomerServiceImpl implements ICustomerService {

    @Autowired
    private PurchaseInvoiceRepository purchaseInvoiceRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private MaterialRepository materialRepository;


    @Autowired
    private OpeningVoucherRepository openingVoucherRepository;

    @Override
    public Customer findCustomerById(Long id) {
        Optional<Customer> optional = customerRepository.findById(id);
        if (optional.isEmpty()) {
            throw new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI));
        }
        Customer customer = new Customer();
        customer.setId(optional.get().getId());
        customer.setName(optional.get().getName());
        customer.setBalance(optional.get().getBalance());

        return customer;
    }


    @Override
    @Transactional
    public Customer addCustomer(Customer newCustomer) {
        Customer customer = new Customer();
        customer.setName(newCustomer.getName());
        customer.setAddress(newCustomer.getAddress());
        customer.setCountry(newCustomer.getCountry());
        customer.setCode(newCustomer.getCode());
        customer.setLocal(newCustomer.getLocal());
        customer.setDistrict(newCustomer.getDistrict());
        customer.setVdNo(newCustomer.getVdNo());
        customer.setCredit(newCustomer.getCredit());
        customer.setDebit(newCustomer.getDebit());
        customer.setOpeningBalance(newCustomer.getDebit().subtract(newCustomer.getCredit()).setScale(2, RoundingMode.HALF_EVEN));
        customer.setBalance(newCustomer.getOpeningBalance());
        customerRepository.save(customer);

        OpeningVoucher openingVoucher = new OpeningVoucher();
        openingVoucher.setCustomerName(customer.getName());
        openingVoucher.setCustomer(customer);
        openingVoucher.setCredit(newCustomer.getCredit());
        openingVoucher.setDebit(newCustomer.getDebit());
        openingVoucher.setDescription("Yeni Müşteri");
        openingVoucher.setFileNo("001");
        openingVoucher.setDate(LocalDate.now());
        openingVoucherRepository.save(openingVoucher);

        return customer;
    }

    @Override
    public List<Customer> getAllCustomer() {
        return customerRepository.findAll();
    }

    @Override
    @Transactional
    public void updateCustomer(Long id, Customer updateCustomer, int currentYear) {
        Customer oldCustomer = customerRepository.findById(id).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI))
        );
        if (oldCustomer.isArchived()) {
            throw new BaseException(new ErrorMessage(MessageType.ARSIV_MUSTERI));
        }
        oldCustomer.setName(updateCustomer.getName());
        oldCustomer.setAddress(updateCustomer.getAddress());
        oldCustomer.setLocal(updateCustomer.getLocal());
        oldCustomer.setDistrict(updateCustomer.getDistrict());
        oldCustomer.setVdNo(updateCustomer.getVdNo());
        oldCustomer.setCountry(updateCustomer.getCountry());

        LocalDate start= LocalDate.of(currentYear, 1, 1);
        LocalDate end= LocalDate.of(currentYear, 12, 31);

        BigDecimal newDebit= updateCustomer.getDebit() != null ? updateCustomer.getDebit() : BigDecimal.ZERO;
        BigDecimal newCredit= updateCustomer.getCredit() != null ? updateCustomer.getCredit() : BigDecimal.ZERO;
        BigDecimal newNetValue = newDebit.subtract(newCredit.setScale(2, RoundingMode.UP));
        BigDecimal oldValueDiff = BigDecimal.ZERO;

        Optional<OpeningVoucher> optional = openingVoucherRepository.findByCustomerIdAndDateBetween(id, start, end);

        if(optional.isPresent()) {
            OpeningVoucher openingVoucher = optional.get();
            oldValueDiff = openingVoucher.getDebit().subtract(openingVoucher.getCredit().setScale(2, RoundingMode.UP));

            openingVoucher.setCredit(updateCustomer.getCredit());
            openingVoucher.setDebit(updateCustomer.getDebit());
            openingVoucherRepository.save(openingVoucher);
        } else {
            OpeningVoucher newOpeningVoucher = new OpeningVoucher();
            newOpeningVoucher.setCustomer(oldCustomer);
            newOpeningVoucher.setCustomerName(oldCustomer.getName());
            newOpeningVoucher.setDate(start);
            newOpeningVoucher.setDebit(updateCustomer.getDebit());
            newOpeningVoucher.setCredit(updateCustomer.getCredit());
            newOpeningVoucher.setDescription(currentYear + " Yılı Manuel Devir");
            newOpeningVoucher.setFileNo("01");
            openingVoucherRepository.save(newOpeningVoucher);
        }

        BigDecimal diff = newNetValue.subtract(oldValueDiff);

        BigDecimal currentBalance =  oldCustomer.getBalance() != null ? oldCustomer.getBalance() : BigDecimal.ZERO;


        oldCustomer.setBalance(currentBalance.add(diff).setScale(2, RoundingMode.HALF_UP));

        oldCustomer.setOpeningBalance(newNetValue);

        customerRepository.save(oldCustomer);
    }

    @Override
    public List<Customer> findByArchivedTrue() {
        return customerRepository.findByArchivedTrue();
    }

    @Override
    public List<Customer> findByArchivedFalse() {
        return customerRepository.findByArchivedFalse();
    }

    @Override
    @Transactional
    public void setArchived(List<Long> ids, boolean archived) {
        customerRepository.updateArchivedStatus(ids, archived);
    }
}

