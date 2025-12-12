package com.berksozcu.service.xmlService;

import com.berksozcu.entites.Customer;
import com.berksozcu.entites.Material;
import com.berksozcu.entites.PurchaseInvoice;
import com.berksozcu.entites.PurchaseInvoiceItem;
import com.berksozcu.entites.xmlEntity.*;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.MaterialRepository;
import com.berksozcu.repository.PurchaseInvoiceRepository;
import jakarta.xml.bind.JAXBContext;
import jakarta.xml.bind.Unmarshaller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class XmlImportService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PurchaseInvoiceRepository invoiceRepository;

    @Autowired
    private MaterialRepository materialRepository;

    public void importPurchaseInvoices(MultipartFile file) throws Exception {

        JAXBContext context = JAXBContext.newInstance(PurchaseInvoicesXml.class);
        Unmarshaller unmarshaller = context.createUnmarshaller();

        PurchaseInvoicesXml invoicesXml =
                (PurchaseInvoicesXml) unmarshaller.unmarshal(file.getInputStream());

        for (InvoiceXml xmlInv : invoicesXml.getInvoices()) {

            PurchaseInvoice invoice = new PurchaseInvoice();

            // Tarih Logo formatı: 01.01.2025
            invoice.setDate(LocalDate.parse(xmlInv.getDATE(),
                    DateTimeFormatter.ofPattern("dd.MM.yyyy")));

            invoice.setFileNo(xmlInv.getDOC_NUMBER());
            invoice.setKdvToplam(xmlInv.getTOTAL_VAT());
            invoice.setTotalPrice(xmlInv.getTOTAL_NET());
            // Customer eşleştirme
            Customer customer = customerRepository.findByCode(xmlInv.getARP_CODE())
                    .orElseThrow(() -> new RuntimeException("Müşteri bulunamadı: " + xmlInv.getARP_CODE()));

            invoice.setCustomer(customer);

            List<PurchaseInvoiceItem> itemList = new ArrayList<>();

            // Fatura satırları
            for (TransactionXml tx : xmlInv.getTRANSACTIONS().getList()) {

                PurchaseInvoiceItem item = new PurchaseInvoiceItem();
                item.setPurchaseInvoice(invoice);

                // Malzeme eşleştirme
                Material material = materialRepository.findByCode(tx.getMASTER_CODE())
                        .orElseThrow(() -> new RuntimeException("Malzeme bulunamadı: " + tx.getMASTER_CODE()));


                item.setMaterial(material);

                item.setQuantity(tx.getQUANTITY());
                item.setUnitPrice(tx.getPRICE());
                item.setKdv(tx.getVAT_RATE());
                item.setKdvTutar(tx.getVAT_AMOUNT());
                item.setLineTotal(tx.getTOTAL());


                itemList.add(item);
            }

            invoice.setItems(itemList);

            // Cascade ALL sayesinde item'lar otomatik kaydedilir
            invoiceRepository.save(invoice);
        }
    }

    public void importMaterials(MultipartFile file) throws Exception {
        JAXBContext context = JAXBContext.newInstance(ItemsXml.class);
        Unmarshaller unmarshaller = context.createUnmarshaller();

        ItemsXml itemsXml = (ItemsXml) unmarshaller.unmarshal(file.getInputStream());

        for (MaterialXml m : itemsXml.getItems()) {
            Material material = new Material();

            material.setCode(m.getCODE());
            material.setComment(m.getNAME());
//        material.setUnit(m.getUNITSET_CODE());
            materialRepository.save(material);
        }
    }

    public void importCustomers(MultipartFile file) throws Exception {
        JAXBContext context = JAXBContext.newInstance(CustomersXml.class);
        Unmarshaller unmarshaller = context.createUnmarshaller();

        CustomersXml customersXml = (CustomersXml) unmarshaller.unmarshal(file.getInputStream());

        for(CustomerXml c : customersXml.getCustomers()) {
            Customer customer = new Customer();

            customer.setCode(c.getCODE());
            customer.setName(c.getTITLE());
            customer.setCountry("TÜRKİYE");
            customer.setLocal(c.getCITY());
            customer.setDistrict(c.getDISTRICT());
            customer.setAddress(c.getADDRESS1());

            customer.setBalance(parseBigDecimal(c.getACC_RISK_TOTAL()));
            customer.setVdNo(c.getTAX_ID());

            customerRepository.save(customer);
        }
    }

    private BigDecimal parseBigDecimal(String value) {
        if (value == null || value.isBlank()) return BigDecimal.ZERO;
        return new BigDecimal(value.replace(",", "."));
    }

}
