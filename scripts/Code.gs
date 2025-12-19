/**
 * Chemical Inventory Management System
 * Main Google Apps Script code for handling form submissions and sheet updates
 *
 * Version: 1.0
 * Author: Chemical Inventory System
 * Date: December 2025
 * 
 * GitHub: https://github.com/nikko-gabriel/chemical-inventory-management-system
 */

// Configuration - REPLACE WITH YOUR ACTUAL IDs
// See config.template.js for configuration template
const FORM_ID = "YOUR_FORM_ID_HERE"; // Replace with your Google Form ID
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE"; // Replace with your Google Spreadsheet ID

// Sheet names
const SHEET_NAMES = {
  FORM_RESPONSES: "Form Responses",
  STAFF_LIST: "STAFF_LIST",
  CHEM_LIST: "CHEM_LIST",
  SUPPLIER_BRANDS: "SUPPLIER_BRANDS",
  LOC_LIST: "LOC_LIST",
  BATCHES: "BATCHES",
  MASTERLIST: "MASTERLIST",
};

/**
 * Main function triggered on form submission
 * Processes form response and updates BATCHES and MASTERLIST sheets
 */
function onFormSubmit(e) {
  try {
    console.log("Form submission triggered");

    const formResponse = parseFormResponse(e);
    console.log("Parsed form response:", JSON.stringify(formResponse));

    if (formResponse.transactionType === "IN") {
      processInTransaction(formResponse);
    } else if (formResponse.transactionType === "OUT") {
      processOutTransaction(formResponse);
    }

    updateMasterlist();
    syncChemListWithMasterlist(); // Ensure new chemicals are added to MASTERLIST
    updateFormDropdowns();

    console.log("Form submission processed successfully");
  } catch (error) {
    console.error("Error processing form submission:", error);
    throw error;
  }
}

/**
 * Triggered when any cell in the spreadsheet is edited
 * Automatically syncs CHEM_LIST with MASTERLIST when CHEM_LIST is modified
 */
function onEdit(e) {
  try {
    const range = e.range;
    const sheet = range.getSheet();

    // Only trigger sync if CHEM_LIST sheet was edited
    if (sheet.getName() === SHEET_NAMES.CHEM_LIST) {
      console.log("CHEM_LIST edited - triggering sync...");
      syncChemListWithMasterlist();
      updateMasterlist(); // Recalculate in case properties changed
      updateFormDropdowns(); // Update dropdowns with new chemicals
      console.log("Auto-sync completed due to CHEM_LIST edit");
    }
  } catch (error) {
    console.error("Error in onEdit trigger:", error);
    // Don't throw error to avoid disrupting user's edit experience
  }
}

/**
 * Parses form response data into structured object
 * @param {Event} e - Form submission event
 * @returns {Object} Parsed form response data
 */
function parseFormResponse(e) {
  const responses = e.namedValues;

  return {
    timestamp: new Date(),
    transactionDate: new Date(responses["Transaction Date"][0]),
    staffName: responses["Staff Name"][0],
    chemicalName: responses["Chemical Name"][0],
    transactionType: responses["Transaction Type"][0],

    // IN transaction fields
    supplier: responses["Supplier"] ? responses["Supplier"][0] : null,
    brand: responses["Brand"] ? responses["Brand"][0] : null,
    batchNum: responses["Batch/Lot Number"]
      ? responses["Batch/Lot Number"][0]
      : null,
    qtyBottle: responses["Number of Bottles"]
      ? parseInt(responses["Number of Bottles"][0])
      : null,
    volPerBottle: responses["Volume/Weight per Bottle"]
      ? parseFloat(responses["Volume/Weight per Bottle"][0])
      : null,
    expirationDate: responses["Expiration Date"]
      ? new Date(responses["Expiration Date"][0])
      : null,
    location: responses["Location (Storage)"]
      ? responses["Location (Storage)"][0]
      : null,

    // OUT transaction fields
    outType: responses["Out Type"] ? responses["Out Type"][0] : null,
    selectedBatchNum: responses["Select Batch/Lot Number Out"]
      ? responses["Select Batch/Lot Number Out"][0]
      : null,
    outVol: responses["Total Volume/Weight Out"]
      ? parseFloat(responses["Total Volume/Weight Out"][0])
      : null,
    outComment: responses["Outgoing Transaction Comment (Optional)"]
      ? responses["Outgoing Transaction Comment (Optional)"][0]
      : null,
  };
}

/**
 * Processes IN transaction and updates BATCHES sheet
 * @param {Object} formResponse - Parsed form response
 */
function processInTransaction(formResponse) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const batchesSheet = ss.getSheetByName(SHEET_NAMES.BATCHES);
  const chemListSheet = ss.getSheetByName(SHEET_NAMES.CHEM_LIST);

  // Get chemical properties
  const chemProps = getChemicalProperties(
    formResponse.chemicalName,
    chemListSheet
  );

  // Check for duplicate batch numbers and make unique
  const uniqueBatchNum = ensureUniqueBatchNumber(
    formResponse.batchNum,
    batchesSheet
  );

  // Calculate total volume
  const volTotal = formResponse.qtyBottle * formResponse.volPerBottle;

  // Add new row to BATCHES
  const newRow = [
    formResponse.transactionDate,
    uniqueBatchNum,
    formResponse.chemicalName,
    formResponse.supplier,
    formResponse.brand,
    chemProps.liqSol,
    chemProps.uom,
    formResponse.qtyBottle,
    formResponse.volPerBottle,
    volTotal,
    formResponse.expirationDate,
    0, // out_prep
    0, // out_xfer
    volTotal, // ending_vol (initially equals vol_total)
    formResponse.location,
  ];

  batchesSheet.appendRow(newRow);
  console.log("Added new batch to BATCHES:", uniqueBatchNum);
}

/**
 * Processes OUT transaction and updates BATCHES sheet
 * @param {Object} formResponse - Parsed form response
 */
function processOutTransaction(formResponse) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const batchesSheet = ss.getSheetByName(SHEET_NAMES.BATCHES);

  // Parse batch number from dropdown selection
  const batchNum = extractBatchNumberFromSelection(
    formResponse.selectedBatchNum
  );

  // Find the batch row
  const batchRow = findBatchRow(batchNum, batchesSheet);
  if (batchRow === -1) {
    throw new Error(`Batch ${batchNum} not found in BATCHES sheet`);
  }

  // Validate sufficient volume
  const currentEndingVol = batchesSheet.getRange(batchRow, 14).getValue(); // ending_vol column
  if (formResponse.outVol > currentEndingVol) {
    throw new Error(
      `Insufficient volume. Requested: ${formResponse.outVol}, Available: ${currentEndingVol}`
    );
  }

  // Update out_prep or out_xfer based on out_type
  let outPrepCol = 12; // Column L
  let outXferCol = 13; // Column M

  if (formResponse.outType.toLowerCase() === "prep") {
    const currentOutPrep = batchesSheet
      .getRange(batchRow, outPrepCol)
      .getValue();
    batchesSheet
      .getRange(batchRow, outPrepCol)
      .setValue(currentOutPrep + formResponse.outVol);
  } else if (formResponse.outType.toLowerCase() === "transfer") {
    const currentOutXfer = batchesSheet
      .getRange(batchRow, outXferCol)
      .getValue();
    batchesSheet
      .getRange(batchRow, outXferCol)
      .setValue(currentOutXfer + formResponse.outVol);
  }

  // Update ending_vol (formula will recalculate automatically if using formula)
  const newOutPrep = batchesSheet.getRange(batchRow, outPrepCol).getValue();
  const newOutXfer = batchesSheet.getRange(batchRow, outXferCol).getValue();
  const volTotal = batchesSheet.getRange(batchRow, 10).getValue(); // vol_total column
  const newEndingVol = volTotal - (newOutPrep + newOutXfer);
  batchesSheet.getRange(batchRow, 14).setValue(newEndingVol);

  console.log("Updated batch:", batchNum, "New ending volume:", newEndingVol);
}

/**
 * Gets chemical properties from CHEM_LIST sheet
 * @param {string} chemName - Chemical name
 * @param {Sheet} chemListSheet - CHEM_LIST sheet
 * @returns {Object} Chemical properties
 */
function getChemicalProperties(chemName, chemListSheet) {
  const data = chemListSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    // Skip header row
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
 * Ensures batch number is unique by adding suffix if necessary
 * @param {string} batchNum - Original batch number
 * @param {Sheet} batchesSheet - BATCHES sheet
 * @returns {string} Unique batch number
 */
function ensureUniqueBatchNumber(batchNum, batchesSheet) {
  const data = batchesSheet.getDataRange().getValues();
  const existingBatchNums = data.slice(1).map((row) => row[1]); // Column B (batch_num)

  let uniqueBatchNum = batchNum;
  let suffix = 1;

  while (existingBatchNums.includes(uniqueBatchNum)) {
    uniqueBatchNum = `${batchNum}(${suffix})`;
    suffix++;
  }

  return uniqueBatchNum;
}

/**
 * Extracts batch number from dropdown selection
 * Format: "Chemical Name - Batch: L103 | Exp: 2024-12-31 | Qty: 500 mL"
 * @param {string} selection - Dropdown selection
 * @returns {string} Batch number
 */
function extractBatchNumberFromSelection(selection) {
  const match = selection.match(/Batch:\s*([^\s|]+)/);
  if (match) {
    return match[1];
  }
  throw new Error(`Invalid batch selection format: ${selection}`);
}

/**
 * Finds batch row in BATCHES sheet
 * @param {string} batchNum - Batch number to find
 * @param {Sheet} batchesSheet - BATCHES sheet
 * @returns {number} Row number (1-indexed) or -1 if not found
 */
function findBatchRow(batchNum, batchesSheet) {
  const data = batchesSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    // Skip header row
    if (data[i][1] === batchNum) {
      // Column B (batch_num)
      return i + 1; // Return 1-indexed row number
    }
  }

  return -1;
}

/**
 * Updates MASTERLIST sheet with calculated values
 */
function updateMasterlist() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const masterlistSheet = ss.getSheetByName(SHEET_NAMES.MASTERLIST);
  const batchesSheet = ss.getSheetByName(SHEET_NAMES.BATCHES);
  const chemListSheet = ss.getSheetByName(SHEET_NAMES.CHEM_LIST);

  const masterlistData = masterlistSheet.getDataRange().getValues();
  const batchesData = batchesSheet.getDataRange().getValues();
  const chemListData = chemListSheet.getDataRange().getValues();

  // Create chemical safety levels map
  const safetyLevels = {};
  for (let i = 1; i < chemListData.length; i++) {
    safetyLevels[chemListData[i][0]] = chemListData[i][3]; // chem_name: safety_lvl
  }

  // Update each chemical in MASTERLIST
  for (let i = 1; i < masterlistData.length; i++) {
    // Skip header
    const chemName = masterlistData[i][0];

    let inSupplierTotal = 0;
    let inTransferTotal = 0;
    let outPrepTotal = 0;
    let outXferTotal = 0;

    // Calculate totals from BATCHES
    for (let j = 1; j < batchesData.length; j++) {
      // Skip header
      const batchChemName = batchesData[j][2]; // Column C

      if (batchChemName === chemName) {
        const supplier = batchesData[j][3]; // Column D
        const volTotal = batchesData[j][9]; // Column J - vol_total (qty_bottle * vol_per_bottle)
        const outPrep = batchesData[j][11]; // Column L
        const outXfer = batchesData[j][12]; // Column M

        if (supplier === "SMFI") {
          inTransferTotal += volTotal; // Use total volume instead of bottle count
        } else {
          inSupplierTotal += volTotal; // Use total volume instead of bottle count
        }

        outPrepTotal += outPrep;
        outXferTotal += outXfer;
      }
    }

    // Get beginning inventory
    const beginningInv = masterlistData[i][3]; // Column D

    // Update the row with values for totals
    const rowNum = i + 1;
    masterlistSheet.getRange(rowNum, 5).setValue(inSupplierTotal); // Column E
    masterlistSheet.getRange(rowNum, 6).setValue(inTransferTotal); // Column F
    masterlistSheet.getRange(rowNum, 7).setValue(outPrepTotal); // Column G
    masterlistSheet.getRange(rowNum, 8).setValue(outXferTotal); // Column H

    // Set formulas for calculated columns so they update automatically when beginning_inv changes
    // current_total formula: beginning_inv + in_supplier_total + in_transfer_total - out_prep_total - out_xfer_total
    const currentTotalFormula = `=D${rowNum}+E${rowNum}+F${rowNum}-G${rowNum}-H${rowNum}`;
    masterlistSheet.getRange(rowNum, 9).setFormula(currentTotalFormula); // Column I

    // status formula: IF(current_total <= safety_lvl, "CRITICAL", "OK")
    // Get safety level from CHEM_LIST for this chemical
    const statusFormula = `=IF(I${rowNum}<=C${rowNum},"CRITICAL","OK")`;
    masterlistSheet.getRange(rowNum, 10).setFormula(statusFormula); // Column J
  }

  console.log("MASTERLIST updated successfully");
}

/**
 * Synchronizes CHEM_LIST with MASTERLIST
 * Adds any new chemicals from CHEM_LIST that don't exist in MASTERLIST
 * Call this function after manually updating CHEM_LIST
 */
function syncChemListWithMasterlist() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const masterlistSheet = ss.getSheetByName(SHEET_NAMES.MASTERLIST);
  const chemListSheet = ss.getSheetByName(SHEET_NAMES.CHEM_LIST);

  const masterlistData = masterlistSheet.getDataRange().getValues();
  const chemListData = chemListSheet.getDataRange().getValues();

  // Get existing chemicals in MASTERLIST
  const existingChemicals = new Set();
  for (let i = 1; i < masterlistData.length; i++) {
    if (masterlistData[i][0]) {
      existingChemicals.add(masterlistData[i][0]);
    }
  }

  // Find new chemicals in CHEM_LIST that aren't in MASTERLIST
  const newChemicals = [];
  for (let i = 1; i < chemListData.length; i++) {
    const chemName = chemListData[i][0];
    const liqSol = chemListData[i][1];
    const uom = chemListData[i][2];
    const safetyLvl = chemListData[i][3];

    if (chemName && !existingChemicals.has(chemName)) {
      newChemicals.push({
        name: chemName,
        liqSol: liqSol,
        uom: uom,
        safetyLvl: safetyLvl,
      });
    }
  }

  // Add new chemicals to MASTERLIST
  if (newChemicals.length > 0) {
    for (const chemical of newChemicals) {
      const newRow = [
        chemical.name, // chem_name
        chemical.liqSol, // liq_sol
        chemical.uom, // UOM
        0, // beginning_inv (manual input)
        0, // in_supplier_total
        0, // in_transfer_total
        0, // out_prep_total
        0, // out_xfer_total
        // current_total and status will be set as formulas below
      ];

      masterlistSheet.appendRow(newRow);

      // Get the row number of the newly added chemical
      const lastRow = masterlistSheet.getLastRow();

      // Set formulas for calculated columns
      const currentTotalFormula = `=D${lastRow}+E${lastRow}+F${lastRow}-G${lastRow}-H${lastRow}`;
      masterlistSheet.getRange(lastRow, 9).setFormula(currentTotalFormula); // Column I

      const statusFormula = `=IF(I${lastRow}<=C${lastRow},"CRITICAL","OK")`;
      masterlistSheet.getRange(lastRow, 10).setFormula(statusFormula); // Column J
    }

    console.log(
      `Added ${newChemicals.length} new chemicals to MASTERLIST:`,
      newChemicals.map((c) => c.name)
    );
  } else {
    console.log("No new chemicals found - MASTERLIST is up to date");
  }
}

/**
 * Updates Google Form dropdowns with current data
 */
function updateFormDropdowns() {
  try {
    const form = FormApp.openById(FORM_ID);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    updateStaffDropdown(form, ss);
    updateChemicalDropdown(form, ss);
    updateSupplierBrandsDropdown(form, ss);
    updateLocationDropdown(form, ss);
    updateBatchDropdown(form, ss);

    console.log("Form dropdowns updated successfully");
  } catch (error) {
    console.error("Error updating form dropdowns:", error);
  }
}

/**
 * Updates staff dropdown from STAFF_LIST sheet
 */
function updateStaffDropdown(form, ss) {
  const staffSheet = ss.getSheetByName(SHEET_NAMES.STAFF_LIST);
  const data = staffSheet.getDataRange().getValues();
  const staffNames = data
    .slice(1)
    .map((row) => row[1])
    .filter((name) => name); // Column B, skip header

  const items = form.getItems();
  const staffItem = items.find((item) =>
    item.getTitle().includes("Staff Name")
  );

  if (staffItem && staffItem.getType() === FormApp.ItemType.LIST) {
    staffItem.asListItem().setChoiceValues(staffNames);
  }
}

/**
 * Updates chemical dropdown from CHEM_LIST sheet
 */
function updateChemicalDropdown(form, ss) {
  const chemSheet = ss.getSheetByName(SHEET_NAMES.CHEM_LIST);
  const data = chemSheet.getDataRange().getValues();
  const chemNames = data
    .slice(1)
    .map((row) => row[0])
    .filter((name) => name); // Column A, skip header

  const items = form.getItems();
  const chemItem = items.find((item) =>
    item.getTitle().includes("Chemical Name")
  );

  if (chemItem && chemItem.getType() === FormApp.ItemType.LIST) {
    chemItem.asListItem().setChoiceValues(chemNames);
  }
}

/**
 * Updates supplier and brand dropdowns from SUPPLIER_BRANDS sheet
 */
function updateSupplierBrandsDropdown(form, ss) {
  const supplierSheet = ss.getSheetByName(SHEET_NAMES.SUPPLIER_BRANDS);
  const data = supplierSheet.getDataRange().getValues();

  const suppliers = [
    ...new Set(
      data
        .slice(1)
        .map((row) => row[0])
        .filter((name) => name)
    ),
  ]; // Column A, unique
  const brands = [
    ...new Set(
      data
        .slice(1)
        .map((row) => row[1])
        .filter((name) => name)
    ),
  ]; // Column B, unique

  const items = form.getItems();

  // Update supplier dropdown
  const supplierItem = items.find((item) =>
    item.getTitle().includes("Supplier")
  );
  if (supplierItem && supplierItem.getType() === FormApp.ItemType.LIST) {
    supplierItem.asListItem().setChoiceValues(suppliers);
  }

  // Update brand dropdown
  const brandItem = items.find((item) => item.getTitle().includes("Brand"));
  if (brandItem && brandItem.getType() === FormApp.ItemType.LIST) {
    brandItem.asListItem().setChoiceValues(brands);
  }
}

/**
 * Updates location dropdown from LOC_LIST sheet
 */
function updateLocationDropdown(form, ss) {
  const locSheet = ss.getSheetByName(SHEET_NAMES.LOC_LIST);
  const data = locSheet.getDataRange().getValues();
  const locations = data
    .slice(1)
    .map((row) => row[0])
    .filter((name) => name); // Column A, skip header

  const items = form.getItems();
  const locItem = items.find((item) =>
    item.getTitle().includes("Location (Storage)")
  );

  if (locItem && locItem.getType() === FormApp.ItemType.LIST) {
    locItem.asListItem().setChoiceValues(locations);
  }
}

/**
 * Updates batch dropdown for OUT transactions from BATCHES sheet
 */
function updateBatchDropdown(form, ss) {
  const batchesSheet = ss.getSheetByName(SHEET_NAMES.BATCHES);
  const chemListSheet = ss.getSheetByName(SHEET_NAMES.CHEM_LIST);

  const batchesData = batchesSheet.getDataRange().getValues();
  const chemData = chemListSheet.getDataRange().getValues();

  // Create UOM lookup
  const uomLookup = {};
  for (let i = 1; i < chemData.length; i++) {
    uomLookup[chemData[i][0]] = chemData[i][2]; // chem_name: UOM
  }

  // Format batch options
  const batchOptions = [];
  for (let i = 1; i < batchesData.length; i++) {
    // Skip header
    const batchNum = batchesData[i][1]; // Column B
    const chemName = batchesData[i][2]; // Column C
    const expDate = new Date(batchesData[i][10]); // Column K
    const endingVol = batchesData[i][13]; // Column N
    const uom = uomLookup[chemName] || "units";

    if (endingVol > 0) {
      // Only show batches with remaining volume
      const formattedOption = `${chemName} - Batch: ${batchNum} | Exp: ${
        expDate.toISOString().split("T")[0]
      } | Qty: ${endingVol} ${uom}`;
      batchOptions.push(formattedOption);
    }
  }

  if (batchOptions.length === 0) {
    batchOptions.push("No available batches");
  }

  const items = form.getItems();
  const batchItem = items.find((item) =>
    item.getTitle().includes("Select Batch/Lot Number Out")
  );

  if (batchItem && batchItem.getType() === FormApp.ItemType.LIST) {
    batchItem.asListItem().setChoiceValues(batchOptions);
  }
}

/**
 * Timed trigger function - runs every 6 hours to update form dropdowns
 */
function timedUpdateDropdowns() {
  updateFormDropdowns();
  syncChemListWithMasterlist(); // Also sync any new chemicals during scheduled updates
}

/**
 * Manual function to sync CHEM_LIST with MASTERLIST
 * Run this function after manually adding new chemicals to CHEM_LIST
 */
function manualSyncChemicals() {
  try {
    console.log("Starting manual chemical synchronization...");
    syncChemListWithMasterlist();
    updateMasterlist(); // Recalculate all values
    updateFormDropdowns(); // Update form dropdowns with new chemicals
    console.log("Manual chemical synchronization completed successfully");
  } catch (error) {
    console.error("Error during manual chemical synchronization:", error);
    throw error;
  }
}

/**
 * Manual trigger function for reprocessing specific form entries
 * Use this when manually correcting entries in Form Responses sheet
 * @param {number} rowNumber - Row number in Form Responses sheet to reprocess
 */
function reprocessFormEntry(rowNumber) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const formResponsesSheet = ss.getSheetByName(SHEET_NAMES.FORM_RESPONSES);

    const data = formResponsesSheet
      .getRange(rowNumber, 1, 1, formResponsesSheet.getLastColumn())
      .getValues()[0];

    // Create mock event object for reprocessing
    const mockEvent = {
      namedValues: {},
    };

    // Map the row data to named values format
    const headers = formResponsesSheet
      .getRange(1, 1, 1, formResponsesSheet.getLastColumn())
      .getValues()[0];

    for (let i = 0; i < headers.length; i++) {
      if (data[i] !== null && data[i] !== "") {
        mockEvent.namedValues[headers[i]] = [data[i]];
      }
    }

    onFormSubmit(mockEvent);

    console.log(`Successfully reprocessed entry at row ${rowNumber}`);
  } catch (error) {
    console.error("Error reprocessing form entry:", error);
    throw error;
  }
}

/**
 * Utility function to set up triggers
 * Run this once to set up automatic form submission handling
 */
/**
 * Note: Triggers must be set up manually in Apps Script interface
 * See QUICK_START.md for manual trigger setup instructions
 */
function setupTriggers() {
  console.log(
    "Triggers must be set up manually. See QUICK_START.md for instructions."
  );
  console.log("Required triggers:");
  console.log("1. Form submit trigger: onFormSubmit function");
  console.log(
    "2. Time-based trigger: timedUpdateDropdowns function (every 6 hours)"
  );
}

/**
 * Cleanup function to remove test data and reset system
 * CAUTION: This will remove data - use carefully!
 * @param {Object} options - Cleanup options
 */
function cleanupTestData(options = {}) {
  const {
    clearBatches = true,
    clearFormResponses = true,
    resetMasterlistTotals = true,
    preserveBeginningInventory = false,
    testBatchPattern = "TEST", // Will remove batches containing this string
  } = options;

  try {
    console.log("🧹 Starting cleanup process...");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // 1. Clear BATCHES sheet (keep headers)
    if (clearBatches) {
      const batchesSheet = ss.getSheetByName(SHEET_NAMES.BATCHES);
      if (batchesSheet && batchesSheet.getLastRow() > 1) {
        // Clear all data rows, keep headers
        const lastRow = batchesSheet.getLastRow();
        const lastCol = batchesSheet.getLastColumn();

        if (testBatchPattern) {
          // Remove only test batches (selective cleanup)
          const data = batchesSheet.getDataRange().getValues();
          const rowsToDelete = [];

          for (let i = data.length - 1; i >= 1; i--) {
            // Start from bottom, skip header
            const batchNum = data[i][1]; // Column B (batch_num)
            if (batchNum && batchNum.toString().includes(testBatchPattern)) {
              rowsToDelete.push(i + 1); // Convert to 1-indexed
            }
          }

          // Delete rows (from bottom to top to maintain row numbers)
          for (const rowNum of rowsToDelete) {
            batchesSheet.deleteRow(rowNum);
          }

          console.log(
            `✅ Removed ${rowsToDelete.length} test batches containing "${testBatchPattern}"`
          );
        } else {
          // Clear all data (nuclear option)
          batchesSheet.getRange(2, 1, lastRow - 1, lastCol).clear();
          console.log("✅ Cleared all BATCHES data");
        }
      }
    }

    // 2. Clear Form Responses (keep headers)
    if (clearFormResponses) {
      const formResponsesSheet = ss.getSheetByName(SHEET_NAMES.FORM_RESPONSES);
      if (formResponsesSheet && formResponsesSheet.getLastRow() > 1) {
        const lastRow = formResponsesSheet.getLastRow();
        const lastCol = formResponsesSheet.getLastColumn();
        formResponsesSheet.getRange(2, 1, lastRow - 1, lastCol).clear();
        console.log("✅ Cleared Form Responses data");
      }
    }

    // 3. Reset MASTERLIST calculations
    if (resetMasterlistTotals) {
      const masterlistSheet = ss.getSheetByName(SHEET_NAMES.MASTERLIST);
      if (masterlistSheet && masterlistSheet.getLastRow() > 1) {
        const lastRow = masterlistSheet.getLastRow();

        // Reset totals columns (E through I) and status (J)
        const masterlistData = masterlistSheet.getDataRange().getValues();

        for (let i = 1; i < masterlistData.length; i++) {
          // Skip header
          const rowNum = i + 1;
          masterlistSheet.getRange(rowNum, 5).setValue(0); // in_supplier_total
          masterlistSheet.getRange(rowNum, 6).setValue(0); // in_transfer_total
          masterlistSheet.getRange(rowNum, 7).setValue(0); // out_prep_total
          masterlistSheet.getRange(rowNum, 8).setValue(0); // out_xfer_total

          if (!preserveBeginningInventory) {
            masterlistSheet.getRange(rowNum, 4).setValue(0); // beginning_inv
          }

          // Set formulas for calculated columns (they will auto-calculate based on current values)
          const currentTotalFormula = `=D${rowNum}+E${rowNum}+F${rowNum}-G${rowNum}-H${rowNum}`;
          masterlistSheet.getRange(rowNum, 9).setFormula(currentTotalFormula); // current_total

          const statusFormula = `=IF(I${rowNum}<=C${rowNum},"CRITICAL","OK")`;
          masterlistSheet.getRange(rowNum, 10).setFormula(statusFormula); // status
        }

        console.log("✅ Reset MASTERLIST calculations");
      }
    }

    // 4. Update form dropdowns
    updateFormDropdowns();
    console.log("✅ Updated form dropdowns");

    // 5. Final summary
    console.log("🎉 Cleanup completed successfully!");
    console.log("📊 System reset to clean state");

    return {
      success: true,
      message: "Test data cleanup completed successfully",
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    throw error;
  }
}

/**
 * Quick cleanup function - removes all test batches and resets calculations
 * Safe option that only removes data containing "TEST" pattern
 */
function quickCleanupTestData() {
  return cleanupTestData({
    clearBatches: true,
    clearFormResponses: true,
    resetMasterlistTotals: true,
    preserveBeginningInventory: true, // Keep any manually set beginning inventory
    testBatchPattern: "TEST",
  });
}

/**
 * Nuclear cleanup function - removes ALL transaction data
 * DANGER: This clears everything! Use only for complete reset
 */
function nuclearCleanupAllData() {
  const confirmation = Browser.msgBox(
    "DANGER: Nuclear Cleanup",
    "This will remove ALL transaction data. Are you absolutely sure?",
    Browser.Buttons.YES_NO
  );

  if (confirmation === Browser.Buttons.YES) {
    return cleanupTestData({
      clearBatches: true,
      clearFormResponses: true,
      resetMasterlistTotals: true,
      preserveBeginningInventory: false, // Reset everything
      testBatchPattern: null, // Remove all data
    });
  } else {
    console.log("Nuclear cleanup cancelled by user");
    return { success: false, message: "Cleanup cancelled" };
  }
}
