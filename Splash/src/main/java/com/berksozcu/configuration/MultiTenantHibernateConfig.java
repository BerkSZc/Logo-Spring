package com.berksozcu.configuration;

import org.hibernate.bytecode.internal.none.BytecodeProviderImpl;
import org.hibernate.cfg.Environment;
import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.hibernate.engine.jdbc.connections.spi.MultiTenantConnectionProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class MultiTenantHibernateConfig {

    @Primary
    @Bean(name = "entityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            DataSource dataSource,
            MultiTenantConnectionProvider multiTenantConnectionProvider,
            CurrentTenantIdentifierResolver tenantIdentifierResolver) {

        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);
        em.setPackagesToScan("com.berksozcu.entites");

        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        em.setJpaVendorAdapter(vendorAdapter);

        Map<String, Object> properties = new HashMap<>();
        // MULTI-TENANCY AYARLARI BURADA BAĞLANIYOR
        properties.put(Environment.MULTI_TENANT_CONNECTION_PROVIDER, multiTenantConnectionProvider);
        properties.put(Environment.MULTI_TENANT_IDENTIFIER_RESOLVER, tenantIdentifierResolver);
        properties.put(Environment.DIALECT, "org.hibernate.dialect.PostgreSQLDialect");

        properties.put("hibernate.query.plan_cache_max_size", "32");
        properties.put("hibernate.query.plan_cache_parameter_metadata_max_size", "32");
        properties.put("hibernate.bytecode.provider", new BytecodeProviderImpl());
        properties.put("hibernate.proxies.validator", "false");

        properties.put("hibernate.lazy.load.no.trans", "true");


        em.setJpaPropertyMap(properties);
        return em;
    }
}
