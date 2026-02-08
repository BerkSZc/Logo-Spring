package com.berksozcu.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

//    @Value("${POSTGRES_URL}")
//    private String url;
//
//    @Value("${POSTGRES_USER}")
//    private String username;
//
//    @Value("${POSTGRES_PASSWORD}")
//    private String password;

    @Bean
    @Primary
    public DataSource dataSource() {
       return DataSourceBuilder.create()
               .url("jdbc:postgresql://localhost:5432/postgres")
               .username("postgres")
               .password("1")
               .driverClassName("org.postgresql.Driver")
               .build();
    }
}

