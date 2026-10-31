const mysql = require("mysql2/promise");

async function runMigration() {
  console.log("[Migration] Connecting to MySQL on port 3307...");
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3307,
    user: "root",
    password: "",
    database: "avantus_db",
  });

  console.log("[Migration] Running safe incremental migrations...");

  // 1. cms_media table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS cms_media (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      original_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(255) NOT NULL,
      file_type VARCHAR(100) NOT NULL,
      file_size INT NOT NULL,
      alt_text VARCHAR(255) NULL,
      caption TEXT NULL,
      folder VARCHAR(100) DEFAULT 'uploads',
      category VARCHAR(100) DEFAULT 'General',
      is_private BOOLEAN DEFAULT FALSE,
      uploaded_by VARCHAR(100) DEFAULT 'Admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_filename (filename)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 2. crm_clients table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS crm_clients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      contact_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(100) NULL,
      address TEXT NULL,
      country VARCHAR(100) DEFAULT 'United Kingdom',
      website VARCHAR(255) NULL,
      status VARCHAR(50) DEFAULT 'Active',
      account_manager VARCHAR(100) DEFAULT 'Usman Farooq',
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 3. finance_invoices table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS finance_invoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_number VARCHAR(100) NOT NULL UNIQUE,
      client_id INT NULL,
      client_name VARCHAR(255) NOT NULL,
      client_email VARCHAR(255) NOT NULL,
      project_id INT NULL,
      issue_date DATE NOT NULL,
      due_date DATE NOT NULL,
      currency VARCHAR(10) DEFAULT 'USD',
      subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      tax_rate DECIMAL(5, 2) DEFAULT 0.00,
      tax_amount DECIMAL(12, 2) DEFAULT 0.00,
      total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      balance_due DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      status VARCHAR(50) DEFAULT 'Sent',
      notes TEXT NULL,
      line_items_json LONGTEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_invoice_num (invoice_number)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 4. finance_expenses table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS finance_expenses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category VARCHAR(100) NOT NULL,
      description VARCHAR(255) NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'USD',
      expense_date DATE NOT NULL,
      vendor_name VARCHAR(255) NULL,
      receipt_url VARCHAR(255) NULL,
      payment_method VARCHAR(100) DEFAULT 'Corporate Card',
      approved_by VARCHAR(100) DEFAULT 'Laiba Baig',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_date (expense_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 5. finance_payments table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS finance_payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_id INT NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'USD',
      payment_date DATE NOT NULL,
      payment_method VARCHAR(100) DEFAULT 'Bank Wire Transfer',
      transaction_reference VARCHAR(255) NULL,
      notes TEXT NULL,
      recorded_by VARCHAR(100) DEFAULT 'Admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_invoice (invoice_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 6. hrms_employees table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS hrms_employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_code VARCHAR(50) NOT NULL UNIQUE,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(100) NULL,
      department VARCHAR(100) NOT NULL,
      designation VARCHAR(100) NOT NULL,
      date_of_joining DATE NOT NULL,
      employment_type VARCHAR(50) DEFAULT 'Full-time',
      status VARCHAR(50) DEFAULT 'Active',
      base_salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      currency VARCHAR(10) DEFAULT 'PKR',
      emergency_contact VARCHAR(255) NULL,
      bank_details_json TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_department (department)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 7. hrms_attendance table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS hrms_attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      date DATE NOT NULL,
      check_in TIME NULL,
      check_out TIME NULL,
      status VARCHAR(50) DEFAULT 'Present',
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_employee_date (employee_id, date),
      INDEX idx_date (date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 8. hrms_leave_requests table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS hrms_leave_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      leave_type VARCHAR(50) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      total_days INT NOT NULL DEFAULT 1,
      reason TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'Pending',
      approved_by VARCHAR(100) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_employee (employee_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 9. hrms_payroll_runs table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS hrms_payroll_runs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      month_year VARCHAR(20) NOT NULL UNIQUE,
      period_start DATE NOT NULL,
      period_end DATE NOT NULL,
      total_gross DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
      total_deductions DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
      total_net DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
      currency VARCHAR(10) DEFAULT 'PKR',
      status VARCHAR(50) DEFAULT 'Draft',
      approved_by VARCHAR(100) NULL,
      payment_date DATE NULL,
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 10. hrms_payslips table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS hrms_payslips (
      id INT AUTO_INCREMENT PRIMARY KEY,
      payroll_run_id INT NOT NULL,
      employee_id INT NOT NULL,
      base_salary DECIMAL(12, 2) NOT NULL,
      allowances_json TEXT NULL,
      deductions_json TEXT NULL,
      gross_amount DECIMAL(12, 2) NOT NULL,
      net_amount DECIMAL(12, 2) NOT NULL,
      payment_method VARCHAR(100) DEFAULT 'Bank Direct Deposit',
      status VARCHAR(50) DEFAULT 'Generated',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_run (payroll_run_id),
      INDEX idx_employee (employee_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 11. system_integrations table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS system_integrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      service_key VARCHAR(100) NOT NULL UNIQUE,
      service_name VARCHAR(255) NOT NULL,
      is_enabled BOOLEAN DEFAULT FALSE,
      config_json LONGTEXT NULL,
      last_tested_at TIMESTAMP NULL,
      test_status VARCHAR(50) DEFAULT 'Not Tested',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Seed authentic seed data for clients if empty
  const [clientCount] = await conn.query("SELECT COUNT(*) as c FROM crm_clients");
  if (clientCount[0].c === 0) {
    await conn.query(`
      INSERT INTO crm_clients (company_name, contact_name, email, phone, country, website, status, account_manager, notes)
      VALUES 
      ('Caremon Wellness Ltd', 'Marcus Thorne', 'm.thorne@caremon.co.uk', '+44 20 7946 0912', 'United Kingdom', 'caremon.co.uk', 'Active', 'Usman Farooq', 'Shopify 2.0 theme engineering and conversion optimization contract.'),
      ('FAMA Luxury Goods', 'Fatima Al-Mansoor', 'contact@famaleather.ae', '+971 4 312 8890', 'United Arab Emirates', 'famaleather.ae', 'Active', 'Usman Farooq', 'Multi-currency direct-to-consumer digital flagship deployment.'),
      ('Dexlo Systems International', 'David Evans', 'd.evans@dexlosystems.com', '+1 415 555 0198', 'United States', 'dexlosystems.com', 'Active', 'Hamza Tariq', 'Modular block architecture and corporate cloud presence.')
    `);
  }

  // Seed authentic seed data for employees if empty
  const [empCount] = await conn.query("SELECT COUNT(*) as c FROM hrms_employees");
  if (empCount[0].c === 0) {
    await conn.query(`
      INSERT INTO hrms_employees (employee_code, full_name, email, phone, department, designation, date_of_joining, employment_type, status, base_salary, currency)
      VALUES 
      ('AF-001', 'Laiba Baig', 'laiba@avantusforge.com', '+92 327 4074472', 'Executive Leadership', 'Chief Executive Officer', '2023-01-15', 'Full-time', 'Active', 350000.00, 'PKR'),
      ('AF-002', 'Bilal', 'bilal@avantusforge.com', '+92 300 1234567', 'Engineering', 'Technical Director', '2023-03-01', 'Full-time', 'Active', 280000.00, 'PKR'),
      ('AF-003', 'Muzamil', 'muzamil@avantusforge.com', '+92 301 2345678', 'Operations', 'Operations Director', '2023-04-10', 'Full-time', 'Active', 250000.00, 'PKR'),
      ('AF-004', 'Maira', 'maira@avantusforge.com', '+92 302 3456789', 'Design & Creative', 'Lead Graphic Designer', '2023-06-01', 'Full-time', 'Active', 180000.00, 'PKR')
    `);
  }

  // Seed default integrations if empty
  const [intCount] = await conn.query("SELECT COUNT(*) as c FROM system_integrations");
  if (intCount[0].c === 0) {
    await conn.query(`
      INSERT INTO system_integrations (service_key, service_name, is_enabled, config_json, test_status)
      VALUES 
      ('ga4', 'Google Analytics 4', TRUE, '{"measurement_id": "G-XXXXXXXXXX"}', 'Configured'),
      ('smtp', 'Enterprise SMTP Gateway', TRUE, '{"host": "smtp.avantusforge.com", "port": 587, "user": "noreply@avantusforge.com"}', 'Verified'),
      ('search_console', 'Google Search Console', TRUE, '{"site_url": "https://avantusforge.com"}', 'Verified'),
      ('storage', 'Secure Encrypted Media Storage', TRUE, '{"provider": "local_encrypted", "base_dir": "public/uploads"}', 'Active')
    `);
  }

  console.log("  ✓ All master business & HRMS tables successfully migrated.");
  await conn.end();
}

runMigration().catch((err) => {
  console.error("[Migration Error]", err);
  process.exit(1);
});
