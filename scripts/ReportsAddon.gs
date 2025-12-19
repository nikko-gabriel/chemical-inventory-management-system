/**
 * Chemical Inventory Management System - Reports Add-on
 * Version: 1.1
 * Author: Chemical Inventory System
 * Date: December 2025
 * 
 * This add-on provides reporting capabilities for the Chemical Inventory System
 * Generates detailed transaction reports and summaries for specific chemicals and time periods
 */

// Configuration constants (same as main system)
const SPREADSHEET_ID_REPORTS = "1PH0WfiewO5pxwI50SpmEqSj5EqTU2G9T0LA6SmL-ir4";

// Sheet names
const REPORTS_SHEET_NAMES = {
  FORM_RESPONSES: "Form Responses",
  BATCHES: "BATCHES", 
  CHEM_LIST: "CHEM_LIST",
  REPORTS: "REPORTS"
};

/**
 * Initializes the REPORTS sheet with proper headers and formatting
 * Run this once to set up the reports functionality
 */
function initializeReportsSheet() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID_REPORTS);
    let reportsSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.REPORTS);
    
    // Create REPORTS sheet if it doesn't exist
    if (!reportsSheet) {
      reportsSheet = ss.insertSheet(REPORTS_SHEET_NAMES.REPORTS);
      console.log("Created REPORTS sheet");
    } else {
      // Clear existing content
      reportsSheet.clear();
      console.log("Cleared existing REPORTS sheet");
    }
    
    // Set up the sheet structure
    setupReportsSheetHeaders(reportsSheet);
    
    console.log("REPORTS sheet initialized successfully");
    return { success: true, message: "REPORTS sheet initialized successfully" };
  } catch (error) {
    console.error("Error initializing REPORTS sheet:", error);
    throw error;
  }
}

/**
 * Sets up headers and formatting for the REPORTS sheet
 */
function setupReportsSheetHeaders(reportsSheet) {
  // Title section
  reportsSheet.getRange(1, 1).setValue("CHEMICAL INVENTORY REPORTS");
  reportsSheet.getRange(1, 1, 1, 10).merge();
  reportsSheet.getRange(1, 1).setFontSize(16).setFontWeight('bold').setHorizontalAlignment('center');
  
  // Instructions section
  reportsSheet.getRange(3, 1).setValue("INSTRUCTIONS:");
  reportsSheet.getRange(3, 1).setFontWeight('bold');
  reportsSheet.getRange(4, 1).setValue("1. Use generateChemicalReport() function to create reports");
  reportsSheet.getRange(5, 1).setValue("2. Specify chemical name, start date, and end date");
  reportsSheet.getRange(6, 1).setValue("3. Report will appear below this section");
  
  // Separator
  reportsSheet.getRange(8, 1, 1, 10).setBackground('#e0e0e0');
  
  console.log("REPORTS sheet headers set up");
}

/**
 * Generates a comprehensive report for a specific chemical within a date range
 * @param {string} chemicalName - Name of the chemical to report on
 * @param {Date|string} startDate - Start date for the report period
 * @param {Date|string} endDate - End date for the report period
 * @param {boolean} clearSheet - Whether to clear the sheet before generating report (default: true)
 */
function generateChemicalReport(chemicalName, startDate, endDate, clearSheet = true) {
  try {
    console.log(`Generating report for ${chemicalName} from ${startDate} to ${endDate}`);
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID_REPORTS);
    let reportsSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.REPORTS);
    
    // Initialize sheet if it doesn't exist
    if (!reportsSheet) {
      initializeReportsSheet();
      reportsSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.REPORTS);
    }
    
    // Convert dates to Date objects
    const reportStartDate = new Date(startDate);
    const reportEndDate = new Date(endDate);
    
    // Validate inputs
    if (!chemicalName || chemicalName.trim() === '') {
      throw new Error("Chemical name is required");
    }
    
    if (isNaN(reportStartDate) || isNaN(reportEndDate)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD or Date objects");
    }
    
    if (reportStartDate > reportEndDate) {
      throw new Error("Start date must be before or equal to end date");
    }
    
    // Clear report area if requested
    if (clearSheet) {
      clearReportArea(reportsSheet);
    }
    
    // Generate report data
    const reportData = collectReportData(chemicalName, reportStartDate, reportEndDate, ss);
    
    // Write report to sheet
    writeReportToSheet(reportsSheet, reportData, chemicalName, reportStartDate, reportEndDate);
    
    console.log("Report generated successfully");
    return {
      success: true,
      message: `Report generated for ${chemicalName} from ${reportStartDate.toDateString()} to ${reportEndDate.toDateString()}`,
      transactionCount: reportData.transactions.length,
      summary: reportData.summary
    };
    
  } catch (error) {
    console.error("Error generating chemical report:", error);
    throw error;
  }
}

/**
 * Clears the report area (below row 8) while preserving headers and instructions
 */
function clearReportArea(reportsSheet) {
  const lastRow = reportsSheet.getLastRow();
  const lastCol = reportsSheet.getLastColumn();
  
  if (lastRow > 8) {
    reportsSheet.getRange(9, 1, lastRow - 8, Math.max(lastCol, 10)).clear();
  }
}

/**
 * Collects all relevant transaction data for the specified chemical and date range
 */
function collectReportData(chemicalName, startDate, endDate, ss) {
  const formResponsesSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.FORM_RESPONSES);
  const batchesSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.BATCHES);
  const chemListSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.CHEM_LIST);
  
  // Get chemical properties
  const chemProps = getChemicalProperties(chemicalName, chemListSheet);
  
  // Get all form responses
  const formData = formResponsesSheet.getDataRange().getValues();
  const formHeaders = formData[0];
  
  // Filter transactions for this chemical within date range
  const transactions = [];
  for (let i = 1; i < formData.length; i++) {
    const row = formData[i];
    const transactionDate = new Date(row[formHeaders.indexOf("Transaction Date")]);
    const transactionChemical = row[formHeaders.indexOf("Chemical Name")];
    
    if (transactionChemical === chemicalName && 
        transactionDate >= startDate && 
        transactionDate <= endDate) {
      
      const transaction = {
        date: transactionDate,
        staff: row[formHeaders.indexOf("Staff Name")] || "",
        chemical: transactionChemical,
        type: row[formHeaders.indexOf("Transaction Type")] || "",
        
        // IN transaction fields
        supplier: row[formHeaders.indexOf("Supplier")] || "",
        brand: row[formHeaders.indexOf("Brand")] || "",
        batchNum: row[formHeaders.indexOf("Batch/Lot Number")] || "",
        qtyBottle: row[formHeaders.indexOf("Number of Bottles")] || 0,
        volPerBottle: row[formHeaders.indexOf("Volume/Weight per Bottle")] || 0,
        expDate: row[formHeaders.indexOf("Expiration Date")] || "",
        location: row[formHeaders.indexOf("Location (Storage)")] || "",
        
        // OUT transaction fields
        outType: row[formHeaders.indexOf("Out Type")] || "",
        selectedBatch: row[formHeaders.indexOf("Select Batch/Lot Number Out")] || "",
        outVol: row[formHeaders.indexOf("Total Volume/Weight Out")] || 0,
        comment: row[formHeaders.indexOf("Outgoing Transaction Comment (Optional)")] || ""
      };
      
      // Calculate total volume for IN transactions
      if (transaction.type === "IN") {
        transaction.totalVolume = transaction.qtyBottle * transaction.volPerBottle;
      } else {
        transaction.totalVolume = transaction.outVol;
      }
      
      transactions.push(transaction);
    }
  }
  
  // Generate summary statistics
  const summary = generateSummary(transactions, chemProps);
  
  return {
    transactions: transactions,
    summary: summary,
    chemicalProperties: chemProps,
    dateRange: {
      start: startDate,
      end: endDate
    }
  };
}

/**
 * Generates summary statistics from transaction data
 */
function generateSummary(transactions, chemProps) {
  const summary = {
    totalTransactions: transactions.length,
    inTransactions: 0,
    outTransactions: 0,
    
    // IN transaction summaries
    totalInVolume: 0,
    supplierInVolume: 0,
    transferInVolume: 0,
    supplierBreakdown: {},
    
    // OUT transaction summaries  
    totalOutVolume: 0,
    prepOutVolume: 0,
    transferOutVolume: 0,
    
    // Net change
    netVolumeChange: 0,
    
    // Other stats
    uniqueBatches: new Set(),
    uniqueSuppliers: new Set(),
    dateRange: {
      earliest: null,
      latest: null
    }
  };
  
  transactions.forEach(transaction => {
    // Update date range
    if (!summary.dateRange.earliest || transaction.date < summary.dateRange.earliest) {
      summary.dateRange.earliest = transaction.date;
    }
    if (!summary.dateRange.latest || transaction.date > summary.dateRange.latest) {
      summary.dateRange.latest = transaction.date;
    }
    
    if (transaction.type === "IN") {
      summary.inTransactions++;
      summary.totalInVolume += transaction.totalVolume;
      summary.uniqueBatches.add(transaction.batchNum);
      summary.uniqueSuppliers.add(transaction.supplier);
      
      // Classify as supplier or transfer based on supplier name
      if (transaction.supplier === "SMFI") {
        summary.transferInVolume += transaction.totalVolume;
      } else {
        summary.supplierInVolume += transaction.totalVolume;
        
        // Track supplier breakdown
        if (!summary.supplierBreakdown[transaction.supplier]) {
          summary.supplierBreakdown[transaction.supplier] = 0;
        }
        summary.supplierBreakdown[transaction.supplier] += transaction.totalVolume;
      }
      
    } else if (transaction.type === "OUT") {
      summary.outTransactions++;
      summary.totalOutVolume += transaction.totalVolume;
      
      // Classify as prep or transfer
      if (transaction.outType.toLowerCase() === "prep") {
        summary.prepOutVolume += transaction.totalVolume;
      } else if (transaction.outType.toLowerCase() === "transfer") {
        summary.transferOutVolume += transaction.totalVolume;
      }
    }
  });
  
  // Calculate net change
  summary.netVolumeChange = summary.totalInVolume - summary.totalOutVolume;
  
  // Convert sets to arrays for easier handling
  summary.uniqueBatches = Array.from(summary.uniqueBatches);
  summary.uniqueSuppliers = Array.from(summary.uniqueSuppliers);
  
  return summary;
}

/**
 * Writes the complete report to the REPORTS sheet
 */
function writeReportToSheet(reportsSheet, reportData, chemicalName, startDate, endDate) {
  let currentRow = 10; // Start below headers
  
  // Report title and metadata
  reportsSheet.getRange(currentRow, 1).setValue(`REPORT: ${chemicalName}`);
  reportsSheet.getRange(currentRow, 1).setFontSize(14).setFontWeight('bold');
  currentRow++;
  
  reportsSheet.getRange(currentRow, 1).setValue(`Period: ${startDate.toDateString()} to ${endDate.toDateString()}`);
  reportsSheet.getRange(currentRow, 1).setFontWeight('bold');
  currentRow++;
  
  reportsSheet.getRange(currentRow, 1).setValue(`Generated: ${new Date().toLocaleString()}`);
  reportsSheet.getRange(currentRow, 1).setFontStyle('italic');
  currentRow += 2;
  
  // Chemical properties
  reportsSheet.getRange(currentRow, 1).setValue("CHEMICAL PROPERTIES");
  reportsSheet.getRange(currentRow, 1).setFontWeight('bold').setBackground('#f0f0f0');
  currentRow++;
  
  reportsSheet.getRange(currentRow, 1).setValue("Type:");
  reportsSheet.getRange(currentRow, 2).setValue(reportData.chemicalProperties.liqSol);
  currentRow++;
  
  reportsSheet.getRange(currentRow, 1).setValue("Unit of Measure:");
  reportsSheet.getRange(currentRow, 2).setValue(reportData.chemicalProperties.uom);
  currentRow++;
  
  reportsSheet.getRange(currentRow, 1).setValue("Safety Level:");
  reportsSheet.getRange(currentRow, 2).setValue(reportData.chemicalProperties.safetyLvl);
  currentRow += 2;
  
  // Summary section
  currentRow = writeSummarySection(reportsSheet, reportData.summary, currentRow);
  
  // Detailed transactions
  currentRow = writeTransactionsSection(reportsSheet, reportData.transactions, currentRow);
  
  // Format the sheet
  formatReportSheet(reportsSheet, currentRow);
}

/**
 * Writes the summary statistics section
 */
function writeSummarySection(reportsSheet, summary, startRow) {
  let currentRow = startRow;
  
  // Summary title
  reportsSheet.getRange(currentRow, 1).setValue("SUMMARY STATISTICS");
  reportsSheet.getRange(currentRow, 1).setFontWeight('bold').setBackground('#e6f3ff');
  currentRow++;
  
  // Overview
  reportsSheet.getRange(currentRow, 1).setValue("Total Transactions:");
  reportsSheet.getRange(currentRow, 2).setValue(summary.totalTransactions);
  currentRow++;
  
  reportsSheet.getRange(currentRow, 1).setValue("IN Transactions:");
  reportsSheet.getRange(currentRow, 2).setValue(summary.inTransactions);
  currentRow++;
  
  reportsSheet.getRange(currentRow, 1).setValue("OUT Transactions:");
  reportsSheet.getRange(currentRow, 2).setValue(summary.outTransactions);
  currentRow++;
  
  // IN Transaction Details
  currentRow++;
  reportsSheet.getRange(currentRow, 1).setValue("IN TRANSACTIONS BREAKDOWN");
  reportsSheet.getRange(currentRow, 1).setFontWeight('bold');
  currentRow++;
  
  reportsSheet.getRange(currentRow, 1).setValue("Total IN Volume:");
  reportsSheet.getRange(currentRow, 2).setValue(summary.totalInVolume);
  currentRow++;
  
  reportsSheet.getRange(currentRow, 1).setValue("From Suppliers:");
  reportsSheet.getRange(currentRow, 2).setValue(summary.supplierInVolume);
  currentRow++;
  
  reportsSheet.getRange(currentRow, 1).setValue("From Transfers:");
  reportsSheet.getRange(currentRow, 2).setValue(summary.transferInVolume);
  currentRow++;
  
  // Supplier breakdown
  if (Object.keys(summary.supplierBreakdown).length > 0) {
    currentRow++;
    reportsSheet.getRange(currentRow, 1).setValue("SUPPLIER BREAKDOWN");
    reportsSheet.getRange(currentRow, 1).setFontWeight('bold');
    currentRow++;
    
    for (const [supplier, volume] of Object.entries(summary.supplierBreakdown)) {
      reportsSheet.getRange(currentRow, 1).setValue(`${supplier}:`);
      reportsSheet.getRange(currentRow, 2).setValue(volume);
      currentRow++;
    }
  }
  
  // OUT Transaction Details
  currentRow++;
  reportsSheet.getRange(currentRow, 1).setValue("OUT TRANSACTIONS BREAKDOWN");
  reportsSheet.getRange(currentRow, 1).setFontWeight('bold');
  currentRow++;
  
  reportsSheet.getRange(currentRow, 1).setValue("Total OUT Volume:");
  reportsSheet.getRange(currentRow, 2).setValue(summary.totalOutVolume);
  currentRow++;
  
  reportsSheet.getRange(currentRow, 1).setValue("For Preparation:");
  reportsSheet.getRange(currentRow, 2).setValue(summary.prepOutVolume);
  currentRow++;
  
  reportsSheet.getRange(currentRow, 1).setValue("For Transfer:");
  reportsSheet.getRange(currentRow, 2).setValue(summary.transferOutVolume);
  currentRow++;
  
  // Net change
  currentRow++;
  reportsSheet.getRange(currentRow, 1).setValue("NET VOLUME CHANGE:");
  reportsSheet.getRange(currentRow, 2).setValue(summary.netVolumeChange);
  reportsSheet.getRange(currentRow, 1, 1, 2).setFontWeight('bold').setBackground('#fff2cc');
  currentRow += 2;
  
  return currentRow;
}

/**
 * Writes the detailed transactions section
 */
function writeTransactionsSection(reportsSheet, transactions, startRow) {
  let currentRow = startRow;
  
  // Transactions title
  reportsSheet.getRange(currentRow, 1).setValue("DETAILED TRANSACTIONS");
  reportsSheet.getRange(currentRow, 1).setFontWeight('bold').setBackground('#f9f9f9');
  currentRow++;
  
  if (transactions.length === 0) {
    reportsSheet.getRange(currentRow, 1).setValue("No transactions found for this period.");
    return currentRow + 1;
  }
  
  // Headers
  const headers = [
    "Date", "Staff", "Type", "Volume", "Details", "Supplier/Type", "Batch", "Location", "Comments"
  ];
  
  for (let col = 0; col < headers.length; col++) {
    reportsSheet.getRange(currentRow, col + 1).setValue(headers[col]);
    reportsSheet.getRange(currentRow, col + 1).setFontWeight('bold').setBackground('#e0e0e0');
  }
  currentRow++;
  
  // Transaction rows
  transactions.forEach(transaction => {
    reportsSheet.getRange(currentRow, 1).setValue(transaction.date.toDateString());
    reportsSheet.getRange(currentRow, 2).setValue(transaction.staff);
    reportsSheet.getRange(currentRow, 3).setValue(transaction.type);
    reportsSheet.getRange(currentRow, 4).setValue(transaction.totalVolume);
    
    // Details column - different for IN vs OUT
    let details = "";
    let supplierType = "";
    let batch = "";
    let location = "";
    let comments = "";
    
    if (transaction.type === "IN") {
      details = `${transaction.qtyBottle} bottles × ${transaction.volPerBottle} each`;
      supplierType = transaction.supplier || "";
      batch = transaction.batchNum || "";
      location = transaction.location || "";
      comments = `Brand: ${transaction.brand || ""}`;
    } else {
      details = `${transaction.outType} operation`;
      supplierType = transaction.outType || "";
      batch = extractBatchFromSelection(transaction.selectedBatch);
      location = "";
      comments = transaction.comment || "";
    }
    
    reportsSheet.getRange(currentRow, 5).setValue(details);
    reportsSheet.getRange(currentRow, 6).setValue(supplierType);
    reportsSheet.getRange(currentRow, 7).setValue(batch);
    reportsSheet.getRange(currentRow, 8).setValue(location);
    reportsSheet.getRange(currentRow, 9).setValue(comments);
    
    currentRow++;
  });
  
  return currentRow + 1;
}

/**
 * Applies formatting to the report sheet
 */
function formatReportSheet(reportsSheet, lastRow) {
  // Auto-resize columns
  for (let col = 1; col <= 10; col++) {
    reportsSheet.autoResizeColumn(col);
  }
  
  // Add borders to the report area
  reportsSheet.getRange(10, 1, lastRow - 10, 10).setBorder(true, true, true, true, true, true);
  
  // Freeze the instruction area
  reportsSheet.setFrozenRows(8);
}

/**
 * Helper function to extract batch number from formatted batch selection
 */
function extractBatchFromSelection(selection) {
  if (!selection) return "";
  const match = selection.match(/Batch:\s*([^\s|]+)/);
  return match ? match[1] : "";
}

/**
 * Gets chemical properties from CHEM_LIST sheet
 */
function getChemicalProperties(chemName, chemListSheet) {
  const data = chemListSheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === chemName) {
      return {
        liqSol: data[i][1],
        uom: data[i][2],
        safetyLvl: data[i][3]
      };
    }
  }
  
  throw new Error(`Chemical ${chemName} not found in CHEM_LIST`);
}

/**
 * Helper function to generate a quick report for the current month
 * @param {string} chemicalName - Name of the chemical to report on
 */
function generateMonthlyReport(chemicalName) {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  return generateChemicalReport(chemicalName, startOfMonth, endOfMonth);
}

/**
 * Helper function to generate a report for the last 30 days
 * @param {string} chemicalName - Name of the chemical to report on  
 */
function generateLast30DaysReport(chemicalName) {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  return generateChemicalReport(chemicalName, thirtyDaysAgo, today);
}

/**
 * Lists all chemicals that have had transactions (for easy reference)
 */
function getChemicalsWithTransactions() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID_REPORTS);
    const formResponsesSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.FORM_RESPONSES);
    
    const data = formResponsesSheet.getDataRange().getValues();
    const headers = data[0];
    const chemicalIndex = headers.indexOf("Chemical Name");
    
    const chemicals = new Set();
    for (let i = 1; i < data.length; i++) {
      const chemical = data[i][chemicalIndex];
      if (chemical) {
        chemicals.add(chemical);
      }
    }
    
    const sortedChemicals = Array.from(chemicals).sort();
    console.log("Chemicals with transactions:", sortedChemicals);
    return sortedChemicals;
    
  } catch (error) {
    console.error("Error getting chemicals with transactions:", error);
    throw error;
  }
}

/**
 * Example usage function - demonstrates how to use the reports system
 */
function exampleReportUsage() {
  console.log("=== REPORTS ADD-ON EXAMPLE USAGE ===");
  
  // Initialize reports sheet
  console.log("1. Initializing reports sheet...");
  initializeReportsSheet();
  
  // Generate a report for Sodium Chloride for the last 30 days
  console.log("2. Generating sample report...");
  try {
    const result = generateLast30DaysReport("Sodium Chloride");
    console.log("Report generated:", result.message);
    console.log("Transactions found:", result.transactionCount);
  } catch (error) {
    console.log("Sample report failed (this is normal if no data exists):", error.message);
  }
  
  // List all chemicals
  console.log("3. Available chemicals:");
  try {
    const chemicals = getChemicalsWithTransactions();
    console.log("Found chemicals:", chemicals.length > 0 ? chemicals : "No chemicals with transactions yet");
  } catch (error) {
    console.log("Error getting chemicals:", error.message);
  }
  
  console.log("=== EXAMPLE COMPLETE ===");
  console.log("Check the REPORTS sheet in your spreadsheet!");
}