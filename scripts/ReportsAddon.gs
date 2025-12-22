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

// Sheet names - MUST match your actual spreadsheet sheet names
const REPORTS_SHEET_NAMES = {
  FORM_RESPONSES: "Form Responses 1", // Check actual name in your spreadsheet
  BATCHES: "BATCHES",
  CHEM_LIST: "CHEM_LIST",
  REPORTS: "REPORTS",
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
  reportsSheet
    .getRange(1, 1)
    .setFontSize(16)
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  // User Interface Section
  reportsSheet.getRange(3, 1).setValue("📊 REPORT GENERATOR");
  reportsSheet
    .getRange(3, 1)
    .setFontSize(14)
    .setFontWeight("bold")
    .setBackground("#e6f3ff");

  // Input fields
  reportsSheet.getRange(4, 1).setValue("1. Select Chemical:");
  reportsSheet.getRange(4, 1).setFontWeight("bold");

  reportsSheet.getRange(5, 1).setValue("2. Start Date:");
  reportsSheet.getRange(5, 1).setFontWeight("bold");
  reportsSheet.getRange(5, 3).setValue("(YYYY-MM-DD format)");
  reportsSheet.getRange(5, 3).setFontStyle("italic").setFontColor("#666666");

  reportsSheet.getRange(6, 1).setValue("3. End Date:");
  reportsSheet.getRange(6, 1).setFontWeight("bold");
  reportsSheet.getRange(6, 3).setValue("(YYYY-MM-DD format)");
  reportsSheet.getRange(6, 3).setFontStyle("italic").setFontColor("#666666");

  reportsSheet.getRange(7, 1).setValue("4. Generate Report:");
  reportsSheet.getRange(7, 1).setFontWeight("bold");
  
  // Create Generate Report button
  reportsSheet.getRange(7, 2).setValue("🔍 GENERATE REPORT");
  reportsSheet.getRange(7, 2)
    .setBackground("#4CAF50")
    .setFontColor("white")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, false, false);
    
  // Create Clear Form button
  reportsSheet.getRange(8, 1).setValue("5. Start New Report:");
  reportsSheet.getRange(8, 1).setFontWeight("bold");
  reportsSheet.getRange(8, 2).setValue("🔄 CLEAR FORM");
  reportsSheet.getRange(8, 2)
    .setBackground("#FF9800")
    .setFontColor("white")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, false, false);

  // Set up input cells with formatting
  reportsSheet
    .getRange(4, 2)
    .setBackground("#f9f9f9")
    .setBorder(true, true, true, true, false, false);
  reportsSheet
    .getRange(5, 2)
    .setBackground("#f9f9f9")
    .setBorder(true, true, true, true, false, false);
  reportsSheet
    .getRange(6, 2)
    .setBackground("#f9f9f9")
    .setBorder(true, true, true, true, false, false);

  // Example values and instructions
  reportsSheet.getRange(5, 2).setValue("2025-12-01");
  reportsSheet.getRange(6, 2).setValue("2025-12-31");

  // Separator
  reportsSheet.getRange(10, 1, 1, 10).setBackground("#e0e0e0");

  // Set up chemical dropdown
  setupChemicalDropdown(reportsSheet);

  console.log("REPORTS sheet headers and UI set up");
}

/**
 * Sets up chemical dropdown in the REPORTS sheet
 */
function setupChemicalDropdown(reportsSheet) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID_REPORTS);
    const chemListSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.CHEM_LIST);

    if (!chemListSheet) {
      console.log("CHEM_LIST sheet not found, skipping dropdown setup");
      return;
    }

    const chemData = chemListSheet.getDataRange().getValues();
    const chemicals = [];

    // Get chemical names from CHEM_LIST (skip header row)
    for (let i = 1; i < chemData.length; i++) {
      if (chemData[i][0]) {
        chemicals.push(chemData[i][0]);
      }
    }

    if (chemicals.length > 0) {
      // Create dropdown validation
      const rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(chemicals)
        .setAllowInvalid(false)
        .setHelpText("Select a chemical from the list")
        .build();

      reportsSheet.getRange(4, 2).setDataValidation(rule);
      console.log(
        `Chemical dropdown set up with ${chemicals.length} chemicals`
      );
    } else {
      reportsSheet.getRange(4, 2).setValue("No chemicals found");
      console.log("No chemicals found in CHEM_LIST");
    }
  } catch (error) {
    console.error("Error setting up chemical dropdown:", error);
    reportsSheet.getRange(4, 2).setValue("Error loading chemicals");
  }
}

/**
 * Handles automatic report generation when user inputs are detected
 * This function is triggered by the onEdit event
 */
function handleReportTrigger(e) {
  try {
    const sheet = e.source.getActiveSheet();

    // Only process if this is the REPORTS sheet
    if (sheet.getName() !== REPORTS_SHEET_NAMES.REPORTS) {
      return;
    }

    const range = e.range;
    const row = range.getRow();
    const col = range.getColumn();

    // Check if user clicked the Generate Report button (row 7, col 2)
    if (row === 7 && col === 2) {
      const buttonText = range.getValue();
      if (buttonText && buttonText.toString().includes("GENERATE REPORT")) {
        // Show processing state
        range.setValue("⏳ GENERATING...");
        range.setBackground("#9E9E9E");

        // Get input values
        const chemical = sheet.getRange(4, 2).getValue();
        const startDate = sheet.getRange(5, 2).getValue();
        const endDate = sheet.getRange(6, 2).getValue();

        // Generate report
        generateReportFromUI(chemical, startDate, endDate, sheet);

        // Reset button
        range.setValue("🔍 GENERATE REPORT");
        range.setBackground("#4CAF50");
      }
    }
    
    // Check if user clicked the Clear Form button (row 8, col 2)
    if (row === 8 && col === 2) {
      const buttonText = range.getValue();
      if (buttonText && buttonText.toString().includes("CLEAR FORM")) {
        clearFormForNewReport(sheet);
      }
    }
  } catch (error) {
    console.error("Error in report trigger handler:", error);
    // Clear trigger cell on error
    try {
      e.source.getActiveSheet().getRange(7, 3).setValue("Error - try again");
    } catch (clearError) {
      console.error("Failed to clear trigger cell:", clearError);
    }
  }
}

/**
 * Generates report from user interface inputs with user-friendly error handling
 */
function generateReportFromUI(chemical, startDate, endDate, reportsSheet) {
  try {
    // Validate inputs
    if (!chemical || chemical.toString().trim() === "") {
      showUserError(reportsSheet, "Please select a chemical from the dropdown");
      return;
    }

    if (!startDate || !endDate) {
      showUserError(reportsSheet, "Please enter both start and end dates");
      return;
    }

    // Convert dates
    let reportStartDate, reportEndDate;

    if (startDate instanceof Date) {
      reportStartDate = startDate;
    } else {
      reportStartDate = new Date(startDate);
    }

    if (endDate instanceof Date) {
      reportEndDate = endDate;
    } else {
      reportEndDate = new Date(endDate);
    }

    // Validate dates
    if (isNaN(reportStartDate) || isNaN(reportEndDate)) {
      showUserError(
        reportsSheet,
        "Invalid date format. Please use YYYY-MM-DD (e.g., 2025-12-01)"
      );
      return;
    }

    if (reportStartDate > reportEndDate) {
      showUserError(
        reportsSheet,
        "Start date must be before or equal to end date"
      );
      return;
    }

    // Clear previous report
    clearReportArea(reportsSheet);

    // Show progress message
    reportsSheet.getRange(11, 1).setValue("🔄 Generating report...");
    reportsSheet.getRange(11, 1).setFontStyle("italic");

    // Generate the report
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID_REPORTS);
    const reportData = collectReportData(
      chemical,
      reportStartDate,
      reportEndDate,
      ss
    );

    // Clear progress message
    reportsSheet.getRange(11, 1).setValue("");

    // Write report
    writeReportToSheet(
      reportsSheet,
      reportData,
      chemical,
      reportStartDate,
      reportEndDate
    );

    // Show success message
    reportsSheet.getRange(9, 1).setValue(`✅ Report generated successfully! Click 'CLEAR FORM' to generate another report.`);
    reportsSheet.getRange(9, 1).setFontColor("#008000").setFontStyle("italic").setFontSize(11);

    console.log(`Report generated successfully for ${chemical}`);
  } catch (error) {
    console.error("Error generating report from UI:", error);
    showUserError(reportsSheet, `Error: ${error.message}`);
  }
}

/**
 * Shows user-friendly error messages in the interface
 */
function showUserError(reportsSheet, message) {
  reportsSheet.getRange(9, 1).setValue(`❌ ${message}`);
  reportsSheet.getRange(9, 1).setFontColor("#ff0000").setFontStyle("italic").setFontSize(11);
}

/**
 * Clears the form for a new report
 */
function clearFormForNewReport(reportsSheet) {
  try {
    // Clear input fields
    reportsSheet.getRange(4, 2).clearContent(); // Chemical
    reportsSheet.getRange(5, 2).setValue("2025-12-01"); // Reset start date
    reportsSheet.getRange(6, 2).setValue("2025-12-31"); // Reset end date
    
    // Clear any status messages
    reportsSheet.getRange(9, 1).clearContent();
    
    // Clear the report area
    clearReportArea(reportsSheet);
    
    // Show confirmation
    reportsSheet.getRange(9, 1).setValue("✨ Form cleared! Ready for a new report.");
    reportsSheet.getRange(9, 1).setFontColor("#4CAF50").setFontStyle("italic").setFontSize(11);
    
    // Auto-clear the confirmation message after a moment
    Utilities.sleep(2000);
    reportsSheet.getRange(9, 1).clearContent();
    
  } catch (error) {
    console.error("Error clearing form:", error);
    reportsSheet.getRange(9, 1).setValue("❌ Error clearing form. Please refresh the page.");
    reportsSheet.getRange(9, 1).setFontColor("#ff0000").setFontStyle("italic");
  }
}

/**
 * Generates a chemical report for the specified chemical and date range
 * @param {string} chemicalName - Name of the chemical to report on
 * @param {Date|string} startDate - Start date for the report period
 * @param {Date|string} endDate - End date for the report period
 * @param {boolean} clearSheet - Whether to clear the sheet before generating report (default: true)
 */
function generateChemicalReport(
  chemicalName,
  startDate,
  endDate,
  clearSheet = true
) {
  try {
    console.log(
      `Generating report for ${chemicalName} from ${startDate} to ${endDate}`
    );

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
    if (!chemicalName || chemicalName.trim() === "") {
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
    const reportData = collectReportData(
      chemicalName,
      reportStartDate,
      reportEndDate,
      ss
    );

    // Write report to sheet
    writeReportToSheet(
      reportsSheet,
      reportData,
      chemicalName,
      reportStartDate,
      reportEndDate
    );

    console.log("Report generated successfully");
    return {
      success: true,
      message: `Report generated for ${chemicalName} from ${reportStartDate.toDateString()} to ${reportEndDate.toDateString()}`,
      transactionCount: reportData.transactions.length,
      summary: reportData.summary,
    };
  } catch (error) {
    console.error("Error generating chemical report:", error);
    throw error;
  }
}

/**
 * Clears the report area (below row 10) while preserving headers and interface
 */
function clearReportArea(reportsSheet) {
  const lastRow = reportsSheet.getLastRow();
  const lastCol = reportsSheet.getLastColumn();

  if (lastRow > 10) {
    reportsSheet.getRange(11, 1, lastRow - 10, Math.max(lastCol, 10)).clear();
  }

  // Also clear any status messages
  reportsSheet.getRange(9, 1).clearContent();
}

/**
 * Collects all relevant transaction data for the specified chemical and date range
 */
function collectReportData(chemicalName, startDate, endDate, ss) {
  try {
    // Get sheets with error checking
    const formResponsesSheet = ss.getSheetByName(
      REPORTS_SHEET_NAMES.FORM_RESPONSES
    );
    if (!formResponsesSheet) {
      throw new Error(
        `Sheet "${
          REPORTS_SHEET_NAMES.FORM_RESPONSES
        }" not found. Available sheets: ${ss
          .getSheets()
          .map((s) => s.getName())
          .join(", ")}`
      );
    }

    const batchesSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.BATCHES);
    if (!batchesSheet) {
      throw new Error(
        `Sheet "${
          REPORTS_SHEET_NAMES.BATCHES
        }" not found. Available sheets: ${ss
          .getSheets()
          .map((s) => s.getName())
          .join(", ")}`
      );
    }

    const chemListSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.CHEM_LIST);
    if (!chemListSheet) {
      throw new Error(
        `Sheet "${
          REPORTS_SHEET_NAMES.CHEM_LIST
        }" not found. Available sheets: ${ss
          .getSheets()
          .map((s) => s.getName())
          .join(", ")}`
      );
    }

    // Get chemical properties
    const chemProps = getChemicalPropertiesForReports(
      chemicalName,
      chemListSheet
    );

    // Get all form responses
    const formData = formResponsesSheet.getDataRange().getValues();
    const formHeaders = formData[0];

    // Filter transactions for this chemical within date range
    const transactions = [];
    for (let i = 1; i < formData.length; i++) {
      const row = formData[i];
      const transactionDate = new Date(
        row[formHeaders.indexOf("Transaction Date")]
      );
      const transactionChemical = row[formHeaders.indexOf("Chemical Name")];

      if (
        transactionChemical === chemicalName &&
        transactionDate >= startDate &&
        transactionDate <= endDate
      ) {
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
          volPerBottle:
            row[formHeaders.indexOf("Volume/Weight per Bottle")] || 0,
          expDate: row[formHeaders.indexOf("Expiration Date")] || "",
          location: row[formHeaders.indexOf("Location (Storage)")] || "",

          // OUT transaction fields
          outType: row[formHeaders.indexOf("Out Type")] || "",
          selectedBatch:
            row[formHeaders.indexOf("Select Batch/Lot Number Out")] || "",
          outVol: row[formHeaders.indexOf("Total Volume/Weight Out")] || 0,
          comment:
            row[
              formHeaders.indexOf("Outgoing Transaction Comment (Optional)")
            ] || "",
        };

        // Calculate total volume for IN transactions
        if (transaction.type === "IN") {
          transaction.totalVolume =
            transaction.qtyBottle * transaction.volPerBottle;
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
        end: endDate,
      },
    };
  } catch (error) {
    console.error("Error collecting report data:", error);
    throw error;
  }
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
      latest: null,
    },
  };

  transactions.forEach((transaction) => {
    // Update date range
    if (
      !summary.dateRange.earliest ||
      transaction.date < summary.dateRange.earliest
    ) {
      summary.dateRange.earliest = transaction.date;
    }
    if (
      !summary.dateRange.latest ||
      transaction.date > summary.dateRange.latest
    ) {
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
        summary.supplierBreakdown[transaction.supplier] +=
          transaction.totalVolume;
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
function writeReportToSheet(
  reportsSheet,
  reportData,
  chemicalName,
  startDate,
  endDate
) {
  let currentRow = 12; // Start below the user interface

  // Report title and metadata
  reportsSheet.getRange(currentRow, 1).setValue(`REPORT: ${chemicalName}`);
  reportsSheet.getRange(currentRow, 1).setFontSize(14).setFontWeight("bold");
  currentRow++;

  reportsSheet
    .getRange(currentRow, 1)
    .setValue(
      `Period: ${startDate.toDateString()} to ${endDate.toDateString()}`
    );
  reportsSheet.getRange(currentRow, 1).setFontWeight("bold");
  currentRow++;

  reportsSheet
    .getRange(currentRow, 1)
    .setValue(`Generated: ${new Date().toLocaleString()}`);
  reportsSheet.getRange(currentRow, 1).setFontStyle("italic");
  currentRow += 2;

  // Chemical properties
  reportsSheet.getRange(currentRow, 1).setValue("CHEMICAL PROPERTIES");
  reportsSheet
    .getRange(currentRow, 1)
    .setFontWeight("bold")
    .setBackground("#f0f0f0");
  currentRow++;

  reportsSheet.getRange(currentRow, 1).setValue("Type:");
  reportsSheet
    .getRange(currentRow, 2)
    .setValue(reportData.chemicalProperties.liqSol);
  currentRow++;

  reportsSheet.getRange(currentRow, 1).setValue("Unit of Measure:");
  reportsSheet
    .getRange(currentRow, 2)
    .setValue(reportData.chemicalProperties.uom);
  currentRow++;

  reportsSheet.getRange(currentRow, 1).setValue("Safety Level:");
  reportsSheet
    .getRange(currentRow, 2)
    .setValue(reportData.chemicalProperties.safetyLvl);
  currentRow += 2;

  // Summary section
  currentRow = writeSummarySection(
    reportsSheet,
    reportData.summary,
    currentRow
  );

  // Detailed transactions
  currentRow = writeTransactionsSection(
    reportsSheet,
    reportData.transactions,
    currentRow
  );

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
  reportsSheet
    .getRange(currentRow, 1)
    .setFontWeight("bold")
    .setBackground("#e6f3ff");
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
  reportsSheet.getRange(currentRow, 1).setFontWeight("bold");
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
    reportsSheet.getRange(currentRow, 1).setFontWeight("bold");
    currentRow++;

    for (const [supplier, volume] of Object.entries(
      summary.supplierBreakdown
    )) {
      reportsSheet.getRange(currentRow, 1).setValue(`${supplier}:`);
      reportsSheet.getRange(currentRow, 2).setValue(volume);
      currentRow++;
    }
  }

  // OUT Transaction Details
  currentRow++;
  reportsSheet.getRange(currentRow, 1).setValue("OUT TRANSACTIONS BREAKDOWN");
  reportsSheet.getRange(currentRow, 1).setFontWeight("bold");
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
  reportsSheet
    .getRange(currentRow, 1, 1, 2)
    .setFontWeight("bold")
    .setBackground("#fff2cc");
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
  reportsSheet
    .getRange(currentRow, 1)
    .setFontWeight("bold")
    .setBackground("#f9f9f9");
  currentRow++;

  if (transactions.length === 0) {
    reportsSheet
      .getRange(currentRow, 1)
      .setValue("No transactions found for this period.");
    return currentRow + 1;
  }

  // Headers
  const headers = [
    "Date",
    "Staff",
    "Type",
    "Volume",
    "Details",
    "Supplier/Type",
    "Batch",
    "Location",
    "Comments",
  ];

  for (let col = 0; col < headers.length; col++) {
    reportsSheet.getRange(currentRow, col + 1).setValue(headers[col]);
    reportsSheet
      .getRange(currentRow, col + 1)
      .setFontWeight("bold")
      .setBackground("#e0e0e0");
  }
  currentRow++;

  // Transaction rows
  transactions.forEach((transaction) => {
    reportsSheet
      .getRange(currentRow, 1)
      .setValue(transaction.date.toDateString());
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

  // Add borders to the report area (starting from row 12)
  if (lastRow > 12) {
    reportsSheet
      .getRange(12, 1, lastRow - 11, 10)
      .setBorder(true, true, true, true, true, true);
  }

  // Freeze the user interface area
  reportsSheet.setFrozenRows(10);
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
 * Gets chemical properties from CHEM_LIST sheet for reports
 */
function getChemicalPropertiesForReports(chemName, chemListSheet) {
  const data = chemListSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === chemName) {
      return {
        liqSol: data[i][1],
        uom: data[i][2],
        safetyLvl: data[i][3],
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
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  return generateChemicalReport(chemicalName, thirtyDaysAgo, today);
}

/**
 * Lists all chemicals that have had transactions (for easy reference)
 */
function getChemicalsWithTransactions() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID_REPORTS);
    const formResponsesSheet = ss.getSheetByName(
      REPORTS_SHEET_NAMES.FORM_RESPONSES
    );

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
 * Main onEdit trigger for the reports system
 * Add this function to your existing onEdit trigger in Code.gs, or create a new trigger
 */
function onEditReports(e) {
  handleReportTrigger(e);
}

/**
 * Alternative: If you want to add this to your existing Code.gs onEdit function,
 * add this code block to your existing onEdit function:
 *
 * // Reports add-on trigger
 * if (sheet.getName() === "REPORTS") {
 *   handleReportTrigger(e);
 * }
 */

/**
 * Refreshes the chemical dropdown with current chemicals from CHEM_LIST
 * Call this function if you add new chemicals and want to update the dropdown
 */
function refreshChemicalDropdown() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID_REPORTS);
    const reportsSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.REPORTS);

    if (!reportsSheet) {
      throw new Error(
        "REPORTS sheet not found. Run initializeReportsSheet() first."
      );
    }

    setupChemicalDropdown(reportsSheet);
    console.log("Chemical dropdown refreshed successfully");

    return {
      success: true,
      message: "Chemical dropdown refreshed successfully",
    };
  } catch (error) {
    console.error("Error refreshing chemical dropdown:", error);
    throw error;
  }
}

/**
 * Quick helper functions for common date ranges - can be called from UI buttons or manually
 */

/**
 * Generates current month report for the selected chemical
 */
function generateCurrentMonthReport() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID_REPORTS);
    const reportsSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.REPORTS);

    if (!reportsSheet) {
      throw new Error("REPORTS sheet not found");
    }

    const chemical = reportsSheet.getRange(4, 2).getValue();

    if (!chemical || chemical.toString().trim() === "") {
      throw new Error("Please select a chemical first");
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Set dates in the UI
    reportsSheet
      .getRange(5, 2)
      .setValue(startOfMonth.toISOString().split("T")[0]);
    reportsSheet
      .getRange(6, 2)
      .setValue(endOfMonth.toISOString().split("T")[0]);

    // Generate report
    generateReportFromUI(chemical, startOfMonth, endOfMonth, reportsSheet);

    return { success: true, message: "Current month report generated" };
  } catch (error) {
    console.error("Error generating current month report:", error);
    throw error;
  }
}

/**
 * Generates last 30 days report for the selected chemical
 */
function generateLast30DaysReportUI() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID_REPORTS);
    const reportsSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.REPORTS);

    if (!reportsSheet) {
      throw new Error("REPORTS sheet not found");
    }

    const chemical = reportsSheet.getRange(4, 2).getValue();

    if (!chemical || chemical.toString().trim() === "") {
      throw new Error("Please select a chemical first");
    }

    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Set dates in the UI
    reportsSheet
      .getRange(5, 2)
      .setValue(thirtyDaysAgo.toISOString().split("T")[0]);
    reportsSheet.getRange(6, 2).setValue(today.toISOString().split("T")[0]);

    // Generate report
    generateReportFromUI(chemical, thirtyDaysAgo, today, reportsSheet);

    return { success: true, message: "Last 30 days report generated" };
  } catch (error) {
    console.error("Error generating last 30 days report:", error);
    throw error;
  }
}
/**
 * Example usage function - demonstrates how to use the reports system
 * This shows both the new UI method and the original script method
 */
function exampleReportUsage() {
  console.log("=== REPORTS ADD-ON EXAMPLE USAGE ===");

  // Initialize reports sheet
  console.log("1. Initializing reports sheet...");
  initializeReportsSheet();

  console.log("2. Setting up user interface...");
  refreshChemicalDropdown();

  console.log("3. Reports are now ready for user interface!");
  console.log("   Users can:");
  console.log("   - Select chemical from dropdown in cell B4");
  console.log("   - Enter start date in cell B5 (YYYY-MM-DD)");
  console.log("   - Enter end date in cell B6 (YYYY-MM-DD)");
  console.log("   - Click 'GENERATE REPORT' button in cell B7");
  console.log("   - Click 'CLEAR FORM' button to start a new report");
  console.log("");

  // Show available chemicals
  console.log("4. Available chemicals:");
  try {
    const chemicals = getChemicalsWithTransactions();
    console.log(
      "Found chemicals:",
      chemicals.length > 0 ? chemicals : "No chemicals with transactions yet"
    );
  } catch (error) {
    console.log("Error getting chemicals:", error.message);
  }

  console.log("=== USER INTERFACE READY ===");
  console.log(
    "Check the REPORTS sheet - users can now generate reports without scripts!"
  );
}

/**
 * Test function to diagnose trigger and setup issues
 * Run this if typing "GO" doesn't work
 */
function testReportsSetup() {
  console.log("=== TESTING REPORTS SETUP ===");

  try {
    // Check if REPORTS sheet exists
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID_REPORTS);
    const reportsSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.REPORTS);
    console.log("REPORTS sheet exists:", !!reportsSheet);

    if (!reportsSheet) {
      console.log("REPORTS sheet missing - run initializeReportsSheet() first");
      return;
    }

    // Check triggers
    const triggers = ScriptApp.getProjectTriggers();
    console.log("Project triggers found:", triggers.length);
    let reportsTriggersFound = 0;

    triggers.forEach((trigger, index) => {
      console.log(`Trigger ${index + 1}:`);
      console.log("  - Function:", trigger.getHandlerFunction());
      console.log("  - Event:", trigger.getEventType());
      console.log("  - Source:", trigger.getTriggerSource());

      if (
        trigger.getHandlerFunction() === "onEditReports" ||
        trigger.getHandlerFunction() === "handleReportTrigger"
      ) {
        reportsTriggersFound++;
      }
    });

    console.log("Reports-related triggers found:", reportsTriggersFound);

    if (reportsTriggersFound === 0) {
      console.log("❌ NO REPORTS TRIGGERS FOUND!");
      console.log("SOLUTION: Go to Apps Script → Triggers → Add Trigger");
      console.log("  - Function: onEditReports");
      console.log("  - Event source: From spreadsheet");
      console.log("  - Event type: On edit");
    }

    // Check cells content
    console.log("\n=== CHECKING CELLS ===");
    console.log("B4 (Chemical):", reportsSheet.getRange(4, 2).getValue());
    console.log("B5 (Start Date):", reportsSheet.getRange(5, 2).getValue());
    console.log("B6 (End Date):", reportsSheet.getRange(6, 2).getValue());
    console.log("B7 (Generate Button):", reportsSheet.getRange(7, 2).getValue());
    console.log("B8 (Clear Button):", reportsSheet.getRange(8, 2).getValue());

    // Test chemical data
    console.log("\n=== CHECKING DATA ===");
    const chemicals = getChemicalsWithTransactions();
    console.log("Available chemicals:", chemicals.length);
    if (chemicals.length > 0) {
      console.log("First few:", chemicals.slice(0, 5));
    } else {
      console.log("❌ NO CHEMICALS WITH TRANSACTIONS FOUND!");
      console.log(
        "Make sure you have transaction data in your Form Responses sheet"
      );
    }

    // Test manual trigger simulation
    console.log("\n=== TESTING MANUAL TRIGGER ===");
    try {
      // Simulate clicking Generate Report button in B7
      const mockEvent = {
        range: reportsSheet.getRange(7, 2),
        source: ss,
      };

      console.log("Simulating button click on Generate Report...");
      handleReportTrigger(mockEvent);
      console.log("✅ Manual trigger simulation completed");
    } catch (error) {
      console.error("❌ Manual trigger failed:", error);
      console.log("This indicates an issue with the trigger function itself");
    }

    console.log("\n=== TEST COMPLETE ===");
    console.log("If manual trigger worked but clicking buttons doesn't:");
    console.log("1. Check that you have an onEdit trigger set up");
    console.log("2. Make sure trigger function is 'onEditReports'");
    console.log("3. Try clicking the 'GENERATE REPORT' button again");
  } catch (error) {
    console.error("Test failed:", error);
    console.log("Check your SPREADSHEET_ID_REPORTS constant");
  }
}

/**
 * Test report generation without UI
 * Use this to test if core reporting works
 */
function testReportGeneration() {
  console.log("=== TESTING REPORT GENERATION ===");

  try {
    // Get available chemicals first
    const chemicals = getChemicalsWithTransactions();
    console.log("Available chemicals:", chemicals);

    if (chemicals.length === 0) {
      console.log("❌ No chemicals with transactions found");
      console.log("Make sure you have transaction data first");
      return;
    }

    // Use first available chemical
    const chemical = chemicals[0];
    console.log("Testing with chemical:", chemical);

    // Test with last 30 days
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    console.log(
      "Date range:",
      startDate.toDateString(),
      "to",
      endDate.toDateString()
    );

    // Generate report
    const result = generateChemicalReport(chemical, startDate, endDate);

    if (result && result.summary) {
      console.log("✅ Report generated successfully!");
      console.log("Summary:", result.summary);
      console.log(
        "Total transactions:",
        result.transactions ? result.transactions.length : 0
      );
    } else {
      console.log("❌ Report generation failed or returned no data");
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

/**
 * Helper function to identify actual sheet names in your spreadsheet
 * Run this if you get "sheet not found" errors
 */
function debugSheetNames() {
  console.log("=== DEBUGGING SHEET NAMES ===");

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID_REPORTS);
    const sheets = ss.getSheets();

    console.log("Found", sheets.length, "sheets:");
    sheets.forEach((sheet, index) => {
      console.log(`${index + 1}. "${sheet.getName()}"`);
    });

    console.log("\n=== CURRENT CONFIGURATION ===");
    console.log("FORM_RESPONSES:", `"${REPORTS_SHEET_NAMES.FORM_RESPONSES}"`);
    console.log("BATCHES:", `"${REPORTS_SHEET_NAMES.BATCHES}"`);
    console.log("CHEM_LIST:", `"${REPORTS_SHEET_NAMES.CHEM_LIST}"`);
    console.log("REPORTS:", `"${REPORTS_SHEET_NAMES.REPORTS}"`);

    console.log("\n=== CHECKING MATCHES ===");
    const formSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.FORM_RESPONSES);
    console.log("Form Responses sheet found:", !!formSheet);

    const batchesSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.BATCHES);
    console.log("BATCHES sheet found:", !!batchesSheet);

    const chemListSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.CHEM_LIST);
    console.log("CHEM_LIST sheet found:", !!chemListSheet);

    console.log("\n=== INSTRUCTIONS ===");
    console.log(
      "If any sheets show 'false', update the REPORTS_SHEET_NAMES constant"
    );
    console.log("to match your actual sheet names exactly (case-sensitive).");
  } catch (error) {
    console.error("Error accessing spreadsheet:", error);
    console.log("Check your SPREADSHEET_ID_REPORTS constant");
  }
}
