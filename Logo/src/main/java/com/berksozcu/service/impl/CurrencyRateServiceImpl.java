package com.berksozcu.service.impl;

import com.berksozcu.entites.currency.CurrencyRate;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CurrencyRateRepository;
import com.berksozcu.service.ICurrencyRateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;


@Service
public class CurrencyRateServiceImpl implements ICurrencyRateService {

    @Autowired
    private CurrencyRateRepository currencyRateRepository;

    private static final String TCMB_URL = "https://www.tcmb.gov.tr/kurlar/today.xml";


    @Scheduled(cron = "0 0 10 * * *")
    @Override
    public void updateRatesFromTcmb() {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(TCMB_URL);

            NodeList nodeList = doc.getElementsByTagName("Currency");

            for (int i = 0; i < nodeList.getLength(); i++) {
                Element element = (Element) nodeList.item(i);
                String code = element.getAttribute("CurrencyCode");

                if (code.equals("USD") || code.equals("EUR")) {
                    saveOrUpdateRate(code, element);
                }
            }
        } catch (Exception e) {
            throw new BaseException(new ErrorMessage(MessageType.KUR_HATASI));
        }
    }

    @Override
    public BigDecimal getRateOrDefault(String currency, LocalDate invoiceDate) {

        return currencyRateRepository.findFirstByCurrencyAndLastUpdatedOrderByLastUpdatedDesc(
                currency, invoiceDate)
                .map(CurrencyRate :: getSellingRate)
                .orElse(BigDecimal.ONE);
    }

    @Override
    public BigDecimal getTodaysRate(String code, LocalDate invoiceDate) {

      return  currencyRateRepository.findFirstByCurrencyAndLastUpdatedOrderByLastUpdatedDesc(code, invoiceDate)
                .map(CurrencyRate :: getSellingRate)
                .orElse(BigDecimal.ONE);
    }

    private void saveOrUpdateRate(String code, Element element) {

        LocalDate today = LocalDate.now();

        CurrencyRate rate = currencyRateRepository.findByCurrencyAndLastUpdated(code, today).
                orElse(new CurrencyRate());

        rate.setCurrency(code);

        String buyingRate = element.getElementsByTagName("ForexBuying").item(0).getTextContent();
        String sellingRate =  element.getElementsByTagName("ForexSelling").item(0).getTextContent();

        rate.setSellingRate(sellingRate != null ? new BigDecimal(sellingRate) : BigDecimal.ONE);
        rate.setBuyingRate(buyingRate != null ? new BigDecimal(buyingRate) : BigDecimal.ONE);
        rate.setLastUpdated(today);

        currencyRateRepository.save(rate);
    }

    @EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    private void onStartup() {
        System.out.println(">>> UYGULAMA BASLATILDI: TCMB Kurlari veritabanina isleniyor...");
        updateRatesFromTcmb();
    }

}
