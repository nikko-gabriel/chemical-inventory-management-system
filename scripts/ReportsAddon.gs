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

  // Instructions for button placement
  reportsSheet.getRange(7, 2).setValue("👆 Use the GREEN BUTTON above");
  reportsSheet.getRange(7, 2).setFontStyle("italic").setFontColor("#666666");

  // Add instruction for creating the drawing button
  reportsSheet.getRange(8, 1).setValue("📝 Instructions:");
  reportsSheet.getRange(8, 1).setFontWeight("bold");
  reportsSheet
    .getRange(8, 2)
    .setValue(
      "If no button above: Insert → Drawing → Create green button → Assign script: generateReportButton"
    );
  reportsSheet
    .getRange(8, 2)
    .setFontSize(10)
    .setFontStyle("italic")
    .setFontColor("#666666");

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
 * MAIN FUNCTION FOR DRAWING BUTTON
 * This function is called when the user clicks the drawing button
 * Assign this function name "generateReportButton" to your drawing button
 */
function generateReportButton() {
  console.log("🔘 Generate Report BUTTON CLICKED!");

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID_REPORTS);
    const reportsSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.REPORTS);

    if (!reportsSheet) {
      SpreadsheetApp.getUi().alert(
        "Error",
        "REPORTS sheet not found. Please run initializeReportsSheet() first.",
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }

    // Show immediate feedback to user
    showUserMessage(
      reportsSheet,
      "⏳ Generating report... Please wait...",
      "#FF9800"
    );

    // Get input values from the sheet
    const chemical = reportsSheet.getRange(4, 2).getValue();
    const startDate = reportsSheet.getRange(5, 2).getValue();
    const endDate = reportsSheet.getRange(6, 2).getValue();

    console.log(
      `Inputs - Chemical: "${chemical}", Start: ${startDate}, End: ${endDate}`
    );

    // Validate inputs with user-friendly messages
    if (!chemical || chemical.toString().trim() === "") {
      showUserMessage(
        reportsSheet,
        "❌ Please select a chemical from the dropdown in cell B4",
        "#f44336"
      );
      SpreadsheetApp.getUi().alert(
        "Missing Chemical",
        "Please select a chemical from the dropdown in cell B4 first.",
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }

    if (!startDate || !endDate) {
      showUserMessage(
        reportsSheet,
        "❌ Please enter both start and end dates (B5 and B6)",
        "#f44336"
      );
      SpreadsheetApp.getUi().alert(
        "Missing Dates",
        "Please enter both start and end dates in cells B5 and B6.\n\nFormat: YYYY-MM-DD (e.g., 2025-12-01)",
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }

    // Convert and validate dates
    let reportStartDate, reportEndDate;

    try {
      reportStartDate =
        startDate instanceof Date ? startDate : new Date(startDate);
      reportEndDate = endDate instanceof Date ? endDate : new Date(endDate);

      if (isNaN(reportStartDate) || isNaN(reportEndDate)) {
        throw new Error("Invalid date format");
      }

      if (reportStartDate > reportEndDate) {
        throw new Error("Start date must be before end date");
      }
    } catch (dateError) {
      showUserMessage(
        reportsSheet,
        "❌ Invalid date format. Use YYYY-MM-DD (e.g., 2025-12-01)",
        "#f44336"
      );
      SpreadsheetApp.getUi().alert(
        "Invalid Date Format",
        "Please use YYYY-MM-DD format for dates.\n\nExamples:\n• 2025-12-01\n• 2025-12-31\n\nAlso make sure start date is before end date.",
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }

    // Clear previous report and generate new one
    clearReportArea(reportsSheet);

    console.log("✅ Inputs validated, generating report...");

    // Generate the report
    const reportData = collectReportData(
      chemical,
      reportStartDate,
      reportEndDate,
      ss
    );

    // Write report to sheet
    writeReportToSheet(
      reportsSheet,
      reportData,
      chemical,
      reportStartDate,
      reportEndDate
    );

    // Show success message
    const transactionCount = reportData.transactions.length;
    const successMessage = `✅ Report generated! Found ${transactionCount} transactions for ${chemical} (${reportStartDate.toLocaleDateString()} to ${reportEndDate.toLocaleDateString()})`;

    showUserMessage(reportsSheet, successMessage, "#4CAF50");

    // Show success popup
    SpreadsheetApp.getUi().alert(
      "Report Generated Successfully!",
      `Report for ${chemical} has been generated.\n\nFound ${transactionCount} transactions from ${reportStartDate.toLocaleDateString()} to ${reportEndDate.toLocaleDateString()}\n\nScroll down to see the detailed report.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );

    console.log(
      `✅ Report generated successfully for ${chemical} with ${transactionCount} transactions`
    );
  } catch (error) {
    console.error("❌ Error in generateReportButton:", error);

    const errorMessage = `❌ Error: ${error.message}`;

    try {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID_REPORTS);
      const reportsSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.REPORTS);
      if (reportsSheet) {
        showUserMessage(reportsSheet, errorMessage, "#f44336");
      }
    } catch (displayError) {
      console.error("Could not display error in sheet:", displayError);
    }

    // Show error popup
    SpreadsheetApp.getUi().alert(
      "Error Generating Report",
      `There was an error generating the report:\n\n${error.message}\n\nPlease check:\n• Chemical is selected\n• Dates are in YYYY-MM-DD format\n• You have transaction data\n• All required sheets exist`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Helper function to show user messages in the interface
 */
function showUserMessage(reportsSheet, message, color) {
  try {
    reportsSheet.getRange(9, 1, 1, 6).merge();
    reportsSheet.getRange(9, 1).setValue(message);
    reportsSheet
      .getRange(9, 1)
      .setFontColor(color)
      .setFontWeight("bold")
      .setFontSize(11)
      .setBackground("#f8f9fa")
      .setHorizontalAlignment("center");

    SpreadsheetApp.flush(); // Force immediate display
  } catch (error) {
    console.error("Error showing user message:", error);
  }
}

/**
 * Function to clear the form and start fresh
 * Can be called manually or assigned to another drawing button if needed
 */
function clearReportForm() {
  try {
    console.log("Clearing report form...");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID_REPORTS);
    const reportsSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.REPORTS);

    if (!reportsSheet) {
      SpreadsheetApp.getUi().alert(
        "Error",
        "REPORTS sheet not found.",
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }

    // Clear input fields
    reportsSheet.getRange(4, 2).clearContent(); // Chemical
    reportsSheet.getRange(5, 2).setValue("2025-12-01"); // Reset start date
    reportsSheet.getRange(6, 2).setValue("2025-12-31"); // Reset end date

    // Clear the report area
    clearReportArea(reportsSheet);

    // Show confirmation
    showUserMessage(
      reportsSheet,
      "✨ Form cleared! Ready for a new report.",
      "#4CAF50"
    );

    SpreadsheetApp.getUi().alert(
      "Form Cleared",
      "The form has been cleared and is ready for a new report.\n\nPlease select a chemical and date range, then click the Generate Report button.",
      SpreadsheetApp.getUi().ButtonSet.OK
    );

    console.log("✅ Form cleared successfully");
  } catch (error) {
    console.error("Error clearing form:", error);
    SpreadsheetApp.getUi().alert(
      "Error",
      `Error clearing form: ${error.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Shows user-friendly error messages in the interface
 * Updated to work with new message system
 */
function showUserError(reportsSheet, message) {
  showUserMessage(reportsSheet, `❌ ${message}`, "#f44336");
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
 * Handles edit events on the REPORTS sheet to process button clicks and form interactions
 * @param {Event} e - Edit event object
 */
function handleReportTrigger(e) {
  try {
    const range = e.range;
    const sheet = range.getSheet();
    const row = range.getRow();
    const col = range.getColumn();
    const editedValue = range.getValue();

    // Only process events on REPORTS sheet
    if (sheet.getName() !== REPORTS_SHEET_NAMES.REPORTS) {
      return;
    }

    console.log(`REPORTS sheet edited at ${row},${col}: "${editedValue}"`);

    // Handle Generate Report button (assuming it's at B7)
    if (row === 7 && col === 2 && editedValue === "Generate Report") {
      console.log("Generate Report button clicked");
      generateReportButton();

      // Clear the button text after processing
      range.setValue("");
    }

    // Handle Clear Report button (assuming it's at B8)
    else if (row === 8 && col === 2 && editedValue === "Clear Report") {
      console.log("Clear Report button clicked");
      clearReportForm();

      // Clear the button text after processing
      range.setValue("");
    }
  } catch (error) {
    console.error("Error in handleReportTrigger:", error);

    // Try to show error in sheet if possible
    try {
      if (
        e.range &&
        e.range.getSheet().getName() === REPORTS_SHEET_NAMES.REPORTS
      ) {
        showUserError(e.range.getSheet(), `Error: ${error.message}`);
      }
    } catch (innerError) {
      console.error("Could not show error message in sheet:", innerError);
    }
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
    console.log(
      "B7 (Generate Button):",
      reportsSheet.getRange(7, 2).getValue()
    );
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
 * Test function to manually simulate button clicks
 * Run this if buttons aren't working
 */
function testButtonClicks() {
  console.log("=== TESTING BUTTON FUNCTIONALITY ===");

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID_REPORTS);
    const reportsSheet = ss.getSheetByName(REPORTS_SHEET_NAMES.REPORTS);

    if (!reportsSheet) {
      console.log("❌ REPORTS sheet not found");
      return;
    }

    console.log("✅ REPORTS sheet found");

    // Test Generate Report button simulation
    console.log("\n=== TESTING GENERATE REPORT BUTTON ===");

    // Set some test data
    const chemicals = getChemicalsWithTransactions();
    if (chemicals.length > 0) {
      reportsSheet.getRange(4, 2).setValue(chemicals[0]);
      reportsSheet.getRange(5, 2).setValue("2025-12-01");
      reportsSheet.getRange(6, 2).setValue("2025-12-22");
      console.log(`Set test data: ${chemicals[0]}, 2025-12-01 to 2025-12-22`);
    }

    // Simulate button click
    const mockEvent = {
      source: ss,
      range: reportsSheet.getRange(7, 2),
    };

    console.log("Simulating Generate Report button click...");
    handleReportTrigger(mockEvent);
    console.log("✅ Generate Report simulation completed");

    // Test Clear Form button
    console.log("\n=== TESTING CLEAR FORM BUTTON ===");
    const clearEvent = {
      source: ss,
      range: reportsSheet.getRange(8, 2),
    };

    console.log("Simulating Clear Form button click...");
    handleReportTrigger(clearEvent);
    console.log("✅ Clear Form simulation completed");

    console.log("\n=== TEST COMPLETE ===");
    console.log(
      "If this worked, but clicking doesn't, check your onEdit trigger!"
    );
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

/**
 * Quick function to check trigger setup and test buttons
 * Run this first if buttons aren't working
 */
function quickTriggerCheck() {
  console.log("=== QUICK TRIGGER CHECK ===");

  // Check triggers
  const triggers = ScriptApp.getProjectTriggers();
  console.log(`Found ${triggers.length} triggers total`);

  let hasReportsTrigger = false;
  triggers.forEach((trigger, index) => {
    console.log(
      `${
        index + 1
      }. Function: ${trigger.getHandlerFunction()}, Event: ${trigger.getEventType()}`
    );
    if (trigger.getHandlerFunction() === "onEditReports") {
      hasReportsTrigger = true;
      console.log("  ✅ Reports trigger found!");
    }
  });

  if (!hasReportsTrigger) {
    console.log("❌ NO 'onEditReports' TRIGGER FOUND!");
    console.log("SOLUTION:");
    console.log("1. Go to Apps Script → Triggers");
    console.log("2. Add Trigger");
    console.log("3. Function: onEditReports");
    console.log("4. Event source: From spreadsheet");
    console.log("5. Event type: On edit");
    console.log("6. Save");
    return false;
  }

  console.log("✅ Trigger setup looks good!");
  console.log("Now testing buttons...");

  // Test the buttons
  testButtonClicks();

  return true;
}

/**
 * ULTIMATE DEBUGGING FUNCTION
 * Run this if buttons aren't working at all
 */
function ultimateButtonDebug() {
  console.log("=== ULTIMATE BUTTON DEBUG ===");

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID_REPORTS);
    const sheet = ss.getSheetByName("REPORTS");

    if (!sheet) {
      console.log("❌ REPORTS sheet not found!");
      console.log(
        "Available sheets:",
        ss.getSheets().map((s) => s.getName())
      );
      return;
    }

    console.log("✅ REPORTS sheet found");

    // Check button cells
    const generateButton = sheet.getRange(7, 2);
    const clearButton = sheet.getRange(8, 2);

    console.log("\n=== BUTTON STATE ===");
    console.log("Generate button value:", `"${generateButton.getValue()}"`);
    console.log(
      "Generate button display:",
      `"${generateButton.getDisplayValue()}"`
    );
    console.log("Generate button background:", generateButton.getBackground());

    console.log("Clear button value:", `"${clearButton.getValue()}"`);
    console.log("Clear button display:", `"${clearButton.getDisplayValue()}"`);
    console.log("Clear button background:", clearButton.getBackground());

    // Test if buttons are properly formatted
    console.log("\n=== FIXING BUTTON FORMAT ===");

    // Fix Generate button
    generateButton.setValue("🔍 GENERATE REPORT");
    generateButton.setBackground("#4CAF50");
    generateButton.setFontColor("white");
    generateButton.setFontWeight("bold");
    generateButton.setBorder(
      true,
      true,
      true,
      true,
      null,
      null,
      "#2E7D32",
      SpreadsheetApp.BorderStyle.SOLID_MEDIUM
    );

    // Fix Clear button
    clearButton.setValue("🔄 CLEAR FORM");
    clearButton.setBackground("#FF9800");
    clearButton.setFontColor("white");
    clearButton.setFontWeight("bold");
    clearButton.setBorder(
      true,
      true,
      true,
      true,
      null,
      null,
      "#F57C00",
      SpreadsheetApp.BorderStyle.SOLID_MEDIUM
    );

    SpreadsheetApp.flush();

    console.log("✅ Buttons reformatted!");

    // Test manual trigger
    console.log("\n=== TESTING MANUAL TRIGGER ===");

    // Create fake event for generate button
    const fakeEvent = {
      range: generateButton,
      source: ss,
    };

    console.log("Testing handleReportTrigger with fake event...");
    handleReportTrigger(fakeEvent);

    console.log("✅ Manual trigger test completed!");
  } catch (error) {
    console.error("❌ Ultimate debug failed:", error);
  }
}
