/**
 * Sheet Initialization Script
 * Sets up all required Google Sheets with proper structure and initial data
 *
 * Run this script once to initialize the Chemical Inventory System
 */

/**
 * Main function to initialize all sheets
 * Run this function once to set up the entire sheet structure
 */
function initializeAllSheets() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    console.log("Starting sheet initialization...");

    // Create all required sheets (Form Responses sheet is created automatically when form is linked)
    createStaffListSheet(ss);
    createChemListSheet(ss);
    createSupplierBrandsSheet(ss);
    createLocListSheet(ss);
    createBatchesSheet(ss);
    createMasterlistSheet(ss);

    // Initialize with sample data
    populateInitialData(ss);

    console.log("All sheets initialized successfully!");
  } catch (error) {
    console.error("Error initializing sheets:", error);
    throw error;
  }
}

/**
 * Creates STAFF_LIST sheet with initial data
 */
function createStaffListSheet(ss) {
  let sheet = ss.getSheetByName("STAFF_LIST");

  if (!sheet) {
    sheet = ss.insertSheet("STAFF_LIST");
  } else {
    sheet.clear();
  }

  // Headers
  const headers = ["chemist_id", "chemist_name"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Initial data
  const initialData = [
    [1, "Kim"],
    [2, "Khent"],
    [3, "Nikko"],
  ];

  sheet
    .getRange(2, 1, initialData.length, headers.length)
    .setValues(initialData);

  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#34A853");
  headerRange.setFontColor("white");
  headerRange.setFontWeight("bold");

  console.log("STAFF_LIST sheet created with initial data");
}

/**
 * Creates CHEM_LIST sheet with initial data
 */
function createChemListSheet(ss) {
  let sheet = ss.getSheetByName("CHEM_LIST");

  if (!sheet) {
    sheet = ss.insertSheet("CHEM_LIST");
  } else {
    sheet.clear();
  }

  // Headers
  const headers = ["chem_name", "liq_sol", "UOM", "safety_lvl"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Initial data
  const initialData = [
    ["Sodium Chloride", "solid", "g", 750],
    ["Ethanol", "liquid", "mL", 1800],
    ["Ammonium metavanadate", "solid", "g", 3],
  ];

  sheet
    .getRange(2, 1, initialData.length, headers.length)
    .setValues(initialData);

  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#FF9900");
  headerRange.setFontColor("white");
  headerRange.setFontWeight("bold");

  console.log("CHEM_LIST sheet created with initial data");
}

/**
 * Creates SUPPLIER_BRANDS sheet with initial data
 */
function createSupplierBrandsSheet(ss) {
  let sheet = ss.getSheetByName("SUPPLIER_BRANDS");

  if (!sheet) {
    sheet = ss.insertSheet("SUPPLIER_BRANDS");
  } else {
    sheet.clear();
  }

  // Headers
  const headers = ["supplier", "brand_name"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Separate lists - each column is independent
  const suppliers = [
    "Yana Chemodities",
    "Belman Laboratories",
    "Cebu Far Eastern Drug, Inc.",
    "Inphilco, Inc.",
    "Hamburg Trading Corporation",
    "SMFI",
  ];

  const brands = [
    "N/A",
    "Chem-Supply",
    "RCI Labscan",
    "Loba Chemie",
    "Supelco",
    "Scharlau",
    "Himedia",
    "Sisco Research Laboratories",
    "Microtracers TM",
    "Sigma Aldrich",
    "Merck",
    "Ajax Finechem",
  ];

  // Populate suppliers in column A (starting from row 2)
  if (suppliers.length > 0) {
    const supplierData = suppliers.map((supplier) => [supplier]);
    sheet.getRange(2, 1, suppliers.length, 1).setValues(supplierData);
  }

  // Populate brands in column B (starting from row 2)
  if (brands.length > 0) {
    const brandData = brands.map((brand) => [brand]);
    sheet.getRange(2, 2, brands.length, 1).setValues(brandData);
  }

  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#9C27B0");
  headerRange.setFontColor("white");
  headerRange.setFontWeight("bold");

  console.log(
    "SUPPLIER_BRANDS sheet created with separate lists:",
    suppliers.length,
    "suppliers,",
    brands.length,
    "brands"
  );
}

/**
 * Creates LOC_LIST sheet with initial data
 */
function createLocListSheet(ss) {
  let sheet = ss.getSheetByName("LOC_LIST");

  if (!sheet) {
    sheet = ss.insertSheet("LOC_LIST");
  } else {
    sheet.clear();
  }

  // Headers
  const headers = ["location"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Initial data
  const initialData = [
    ["Chemical Storage Room A"],
    ["Chemical Storage Room B"],
    ["Chemical Storage Room C"],
    ["Refrigerated Storage"],
    ["Hazardous Material Storage"],
    ["General Laboratory Storage"],
  ];

  sheet
    .getRange(2, 1, initialData.length, headers.length)
    .setValues(initialData);

  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#607D8B");
  headerRange.setFontColor("white");
  headerRange.setFontWeight("bold");

  console.log("LOC_LIST sheet created with initial data");
}

/**
 * Creates BATCHES sheet with proper structure
 */
function createBatchesSheet(ss) {
  let sheet = ss.getSheetByName("BATCHES");

  if (!sheet) {
    sheet = ss.insertSheet("BATCHES");
  } else {
    sheet.clear();
  }

  // Headers
  const headers = [
    "in_date", // A
    "batch_num", // B
    "chem_name", // C
    "supplier", // D
    "brand", // E
    "liq_sol", // F
    "UOM", // G
    "qty_bottle", // H
    "vol_per_bottle", // I
    "vol_total", // J
    "exp_date", // K
    "out_prep", // L
    "out_xfer", // M
    "ending_vol", // N
    "location", // O
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#E91E63");
  headerRange.setFontColor("white");
  headerRange.setFontWeight("bold");

  // Set column formats
  sheet.getRange("A:A").setNumberFormat("MM/dd/yyyy"); // in_date
  sheet.getRange("J:J").setNumberFormat("#,##0.00"); // vol_total
  sheet.getRange("K:K").setNumberFormat("MM/dd/yyyy"); // exp_date
  sheet.getRange("L:L").setNumberFormat("#,##0.00"); // out_prep
  sheet.getRange("M:M").setNumberFormat("#,##0.00"); // out_xfer
  sheet.getRange("N:N").setNumberFormat("#,##0.00"); // ending_vol

  console.log("BATCHES sheet created");
}

/**
 * Creates MASTERLIST sheet with proper structure and formulas
 */
function createMasterlistSheet(ss) {
  let sheet = ss.getSheetByName("MASTERLIST");

  if (!sheet) {
    sheet = ss.insertSheet("MASTERLIST");
  } else {
    sheet.clear();
  }

  // Headers
  const headers = [
    "chem_name", // A
    "liq_sol", // B
    "UOM", // C
    "beginning_inv", // D
    "in_supplier_total", // E
    "in_transfer_total", // F
    "out_prep_total", // G
    "out_xfer_total", // H
    "current_total", // I
    "status", // J
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#795548");
  headerRange.setFontColor("white");
  headerRange.setFontWeight("bold");

  // Set column formats
  sheet.getRange("D:I").setNumberFormat("#,##0.00");

  console.log("MASTERLIST sheet created");
}

/**
 * Populates MASTERLIST with chemicals from CHEM_LIST
 */
function populateInitialData(ss) {
  const chemListSheet = ss.getSheetByName("CHEM_LIST");
  const masterlistSheet = ss.getSheetByName("MASTERLIST");

  const chemData = chemListSheet.getDataRange().getValues();

  // Skip header row and populate MASTERLIST
  for (let i = 1; i < chemData.length; i++) {
    const chemName = chemData[i][0];
    const liqSol = chemData[i][1];
    const uom = chemData[i][2];
    const safetyLvl = chemData[i][3];

    const newRow = [
      chemName, // chem_name
      liqSol, // liq_sol
      uom, // UOM
      0, // beginning_inv (manual input)
      0, // in_supplier_total
      0, // in_transfer_total
      0, // out_prep_total
      0, // out_xfer_total
      0, // current_total
      "OK", // status
    ];

    masterlistSheet.appendRow(newRow);
  }

  console.log("MASTERLIST populated with initial chemicals");
}

/**
 * Utility function to add sample transaction data for testing
 */
function addSampleTransactionData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const formResponsesSheet = ss.getSheetByName("Form Responses");

  // Sample IN transaction
  const sampleInData = [
    new Date(), // Timestamp
    new Date("2024-12-15"), // Transaction Date
    "Kim", // Staff Name
    "Sodium Chloride", // Chemical Name
    "IN", // Transaction Type
    "Yana Chemodities", // Supplier
    "Sigma Aldrich", // Brand
    "L001", // Batch/Lot Number
    5, // Number of Bottles
    1000, // Volume/Weight per Bottle
    new Date("2025-12-31"), // Expiration Date
    "Chemical Storage Room A", // Location (Storage)
    "", // Out Type
    "", // Select Batch/Lot Number Out
    "", // Total Volume/Weight Out
    "", // Outgoing Transaction Comment
  ];

  formResponsesSheet.appendRow(sampleInData);

  console.log("Sample transaction data added for testing");
}

/**
 * Function to reset all sheets (use with caution!)
 */
function resetAllSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const sheetNames = [
    "Form Responses",
    "STAFF_LIST",
    "CHEM_LIST",
    "SUPPLIER_BRANDS",
    "LOC_LIST",
    "BATCHES",
    "MASTERLIST",
  ];

  sheetNames.forEach((name) => {
    const sheet = ss.getSheetByName(name);
    if (sheet) {
      ss.deleteSheet(sheet);
    }
  });

  // Recreate all sheets
  initializeAllSheets();

  console.log("All sheets have been reset and recreated");
}

/**
 * Function to verify sheet structure
 */
function verifySheetStructure() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const requiredSheets = [
    "Form Responses",
    "STAFF_LIST",
    "CHEM_LIST",
    "SUPPLIER_BRANDS",
    "LOC_LIST",
    "BATCHES",
    "MASTERLIST",
  ];

  const issues = [];

  requiredSheets.forEach((sheetName) => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      issues.push(`Missing sheet: ${sheetName}`);
    } else {
      const lastRow = sheet.getLastRow();
      if (lastRow === 0) {
        issues.push(`Empty sheet: ${sheetName}`);
      }
    }
  });

  if (issues.length === 0) {
    console.log("✅ All required sheets are present and have data");
    return true;
  } else {
    console.error("❌ Sheet structure issues found:");
    issues.forEach((issue) => console.error(`  - ${issue}`));
    return false;
  }
}

/**
 * Function to export sheet structure as documentation
 */
function documentSheetStructure() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheets = ss.getSheets();

  console.log("=== SHEET STRUCTURE DOCUMENTATION ===");

  sheets.forEach((sheet) => {
    const name = sheet.getName();
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();

    console.log(`\nSheet: ${name}`);
    console.log(`Rows: ${lastRow}, Columns: ${lastColumn}`);

    if (lastRow > 0) {
      const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
      console.log(`Headers: ${headers.join(", ")}`);
    }
  });
}
