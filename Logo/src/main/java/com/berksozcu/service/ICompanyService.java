package com.berksozcu.service;

import com.berksozcu.entites.company.Company;

import java.sql.SQLException;
import java.util.List;

public interface ICompanyService {
     void createNewTenantSchema(String schemaName, String companyName, String description) throws SQLException;
     List<Company> getAllCompanies();
}
