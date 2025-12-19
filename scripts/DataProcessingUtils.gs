/**
 * Data Processing Utilities
 * Utility functions for data validation, calculations, and batch processing
 *
 * This script provides helper functions for the Chemical Inventory System
 */

/**
 * Data validation utilities
 */
class DataValidator {
  /**
   * Validates form response data
   * @param {Object} formResponse - Parsed form response
   * @returns {Object} Validation result with isValid flag and errors array
   */
  static validateFormResponse(formResponse) {
    const errors = [];

    // Basic required field validation
    if (!formResponse.transactionDate) {
      errors.push("Transaction Date is required");
    }

    if (!formResponse.staffName || formResponse.staffName.trim() === "") {
      errors.push("Staff Name is required");
    }

    if (!formResponse.chemicalName || formResponse.chemicalName.trim() === "") {
      errors.push("Chemical Name is required");
    }

    if (
      !formResponse.transactionType ||
      !["IN", "OUT"].includes(formResponse.transactionType)
    ) {
      errors.push("Transaction Type must be either IN or OUT");
    }

    // IN transaction validation
    if (formResponse.transactionType === "IN") {
      const inErrors = this.validateInTransaction(formResponse);
      errors.push(...inErrors);
    }

    // OUT transaction validation
    if (formResponse.transactionType === "OUT") {
      const outErrors = this.validateOutTransaction(formResponse);
      errors.push(...outErrors);
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  /**
   * Validates IN transaction specific fields
   * @param {Object} formResponse - Parsed form response
   * @returns {Array} Array of error messages
   */
  static validateInTransaction(formResponse) {
    const errors = [];

    if (!formResponse.supplier || formResponse.supplier.trim() === "") {
      errors.push("Supplier is required for IN transactions");
    }

    if (!formResponse.brand || formResponse.brand.trim() === "") {
      errors.push("Brand is required for IN transactions");
    }

    if (!formResponse.batchNum || formResponse.batchNum.trim() === "") {
      errors.push("Batch/Lot Number is required for IN transactions");
    }

    if (!formResponse.qtyBottle || formResponse.qtyBottle <= 0) {
      errors.push("Number of Bottles must be a positive number");
    }

    if (!formResponse.volPerBottle || formResponse.volPerBottle <= 0) {
      errors.push("Volume/Weight per Bottle must be a positive number");
    }

    if (!formResponse.expirationDate) {
      errors.push("Expiration Date is required for IN transactions");
    } else {
      // Check if expiration date is in the future
      const today = new Date();
      if (formResponse.expirationDate <= today) {
        errors.push("Expiration Date should be in the future");
      }
    }

    if (!formResponse.location || formResponse.location.trim() === "") {
      errors.push("Storage Location is required for IN transactions");
    }

    return errors;
  }

  /**
   * Validates OUT transaction specific fields
   * @param {Object} formResponse - Parsed form response
   * @returns {Array} Array of error messages
   */
  static validateOutTransaction(formResponse) {
    const errors = [];

    if (
      !formResponse.outType ||
      !["prep", "transfer"].includes(formResponse.outType.toLowerCase())
    ) {
      errors.push('Out Type must be either "prep" or "transfer"');
    }

    if (
      !formResponse.selectedBatchNum ||
      formResponse.selectedBatchNum.trim() === ""
    ) {
      errors.push("Batch selection is required for OUT transactions");
    }

    if (formResponse.selectedBatchNum === "No available batches") {
      errors.push("No batches available for OUT transactions");
    }

    if (!formResponse.outVol || formResponse.outVol <= 0) {
      errors.push("Total Volume/Weight Out must be a positive number");
    }

    return errors;
  }

  /**
   * Validates batch availability for OUT transactions
   * @param {string} batchSelection - Selected batch from dropdown
   * @param {number} requestedVolume - Requested volume to remove
   * @param {Sheet} batchesSheet - BATCHES sheet
   * @returns {Object} Validation result
   */
  static validateBatchAvailability(
    batchSelection,
    requestedVolume,
    batchesSheet
  ) {
    try {
      const batchNum = this.extractBatchNumberFromSelection(batchSelection);
      const batchRow = BatchProcessor.findBatchRow(batchNum, batchesSheet);

      if (batchRow === -1) {
        return {
          isValid: false,
          error: `Batch ${batchNum} not found`,
        };
      }

      const availableVolume = batchesSheet.getRange(batchRow, 14).getValue(); // ending_vol column

      if (requestedVolume > availableVolume) {
        return {
          isValid: false,
          error: `Insufficient volume. Requested: ${requestedVolume}, Available: ${availableVolume}`,
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error.message,
      };
    }
  }

  /**
   * Extracts batch number from dropdown selection
   * @param {string} selection - Dropdown selection
   * @returns {string} Batch number
   */
  static extractBatchNumberFromSelection(selection) {
    const match = selection.match(/Batch:\s*([^\s|]+)/);
    if (match) {
      return match[1];
    }
    throw new Error(`Invalid batch selection format: ${selection}`);
  }

  /**
   * Validates chemical exists in CHEM_LIST
   * @param {string} chemName - Chemical name
   * @param {Sheet} chemListSheet - CHEM_LIST sheet
   * @returns {boolean} True if chemical exists
   */
  static validateChemicalExists(chemName, chemListSheet) {
    const data = chemListSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === chemName) {
        return true;
      }
    }

    return false;
  }
}

/**
 * Batch processing utilities
 */
class BatchProcessor {
  /**
   * Ensures batch number uniqueness by adding suffix if necessary
   * @param {string} batchNum - Original batch number
   * @param {Sheet} batchesSheet - BATCHES sheet
   * @returns {string} Unique batch number
   */
  static ensureUniqueBatchNumber(batchNum, batchesSheet) {
    const data = batchesSheet.getDataRange().getValues();
    const existingBatchNums = data
      .slice(1)
      .map((row) => row[1])
      .filter((num) => num); // Column B, skip header

    let uniqueBatchNum = batchNum;
    let suffix = 1;

    while (existingBatchNums.includes(uniqueBatchNum)) {
      uniqueBatchNum = `${batchNum}(${suffix})`;
      suffix++;
    }

    return uniqueBatchNum;
  }

  /**
   * Finds batch row in BATCHES sheet
   * @param {string} batchNum - Batch number to find
   * @param {Sheet} batchesSheet - BATCHES sheet
   * @returns {number} Row number (1-indexed) or -1 if not found
   */
  static findBatchRow(batchNum, batchesSheet) {
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
   * Gets batch information by batch number
   * @param {string} batchNum - Batch number
   * @param {Sheet} batchesSheet - BATCHES sheet
   * @returns {Object} Batch information or null if not found
   */
  static getBatchInfo(batchNum, batchesSheet) {
    const rowNum = this.findBatchRow(batchNum, batchesSheet);

    if (rowNum === -1) {
      return null;
    }

    const data = batchesSheet.getRange(rowNum, 1, 1, 15).getValues()[0]; // Get all columns

    return {
      row: rowNum,
      inDate: data[0],
      batchNum: data[1],
      chemName: data[2],
      supplier: data[3],
      brand: data[4],
      liqSol: data[5],
      uom: data[6],
      qtyBottle: data[7],
      volPerBottle: data[8],
      volTotal: data[9],
      expDate: data[10],
      outPrep: data[11],
      outXfer: data[12],
      endingVol: data[13],
      location: data[14],
    };
  }

  /**
   * Updates batch ending volume after OUT transaction
   * @param {string} batchNum - Batch number
   * @param {number} outVol - Volume being removed
   * @param {string} outType - Type of OUT transaction (prep/transfer)
   * @param {Sheet} batchesSheet - BATCHES sheet
   */
  static updateBatchVolume(batchNum, outVol, outType, batchesSheet) {
    const batchRow = this.findBatchRow(batchNum, batchesSheet);
    if (batchRow === -1) {
      throw new Error(`Batch ${batchNum} not found`);
    }

    const outPrepCol = 12; // Column L
    const outXferCol = 13; // Column M
    const endingVolCol = 14; // Column N

    // Get current values
    const currentOutPrep = batchesSheet
      .getRange(batchRow, outPrepCol)
      .getValue();
    const currentOutXfer = batchesSheet
      .getRange(batchRow, outXferCol)
      .getValue();
    const volTotal = batchesSheet.getRange(batchRow, 10).getValue(); // Column J

    // Update appropriate out column
    if (outType.toLowerCase() === "prep") {
      batchesSheet
        .getRange(batchRow, outPrepCol)
        .setValue(currentOutPrep + outVol);
    } else if (outType.toLowerCase() === "transfer") {
      batchesSheet
        .getRange(batchRow, outXferCol)
        .setValue(currentOutXfer + outVol);
    }

    // Update ending volume
    const newOutPrep = batchesSheet.getRange(batchRow, outPrepCol).getValue();
    const newOutXfer = batchesSheet.getRange(batchRow, outXferCol).getValue();
    const newEndingVol = volTotal - (newOutPrep + newOutXfer);

    batchesSheet.getRange(batchRow, endingVolCol).setValue(newEndingVol);

    return newEndingVol;
  }

  /**
   * Gets all available batches for a specific chemical
   * @param {string} chemName - Chemical name
   * @param {Sheet} batchesSheet - BATCHES sheet
   * @returns {Array} Array of available batch information
   */
  static getAvailableBatches(chemName, batchesSheet) {
    const data = batchesSheet.getDataRange().getValues();
    const availableBatches = [];

    for (let i = 1; i < data.length; i++) {
      // Skip header
      const batchData = data[i];
      const batchChemName = batchData[2]; // Column C
      const endingVol = batchData[13]; // Column N

      if (batchChemName === chemName && endingVol > 0) {
        availableBatches.push({
          batchNum: batchData[1],
          chemName: batchData[2],
          expDate: batchData[10],
          endingVol: batchData[13],
          location: batchData[14],
        });
      }
    }

    return availableBatches;
  }
}

/**
 * Calculation utilities
 */
class CalculationUtils {
  /**
   * Calculates total volume for IN transaction
   * @param {number} qtyBottle - Number of bottles
   * @param {number} volPerBottle - Volume per bottle
   * @returns {number} Total volume
   */
  static calculateTotalVolume(qtyBottle, volPerBottle) {
    return qtyBottle * volPerBottle;
  }

  /**
   * Calculates new ending volume after OUT transaction
   * @param {number} volTotal - Original total volume
   * @param {number} outPrep - Total prep volume removed
   * @param {number} outXfer - Total transfer volume removed
   * @returns {number} New ending volume
   */
  static calculateEndingVolume(volTotal, outPrep, outXfer) {
    return volTotal - (outPrep + outXfer);
  }

  /**
   * Calculates MASTERLIST totals for a chemical
   * @param {string} chemName - Chemical name
   * @param {Array} batchesData - BATCHES sheet data
   * @returns {Object} Calculated totals
   */
  static calculateMasterlistTotals(chemName, batchesData) {
    let inSupplierTotal = 0;
    let inTransferTotal = 0;
    let outPrepTotal = 0;
    let outXferTotal = 0;

    for (let i = 1; i < batchesData.length; i++) {
      // Skip header
      const batchChemName = batchesData[i][2]; // Column C

      if (batchChemName === chemName) {
        const supplier = batchesData[i][3]; // Column D
        const volTotal = batchesData[i][9] || 0; // Column J - vol_total (qty_bottle * vol_per_bottle)
        const outPrep = batchesData[i][11] || 0; // Column L
        const outXfer = batchesData[i][12] || 0; // Column M

        if (supplier === "SMFI") {
          inTransferTotal += volTotal; // Use total volume instead of bottle count
        } else {
          inSupplierTotal += volTotal; // Use total volume instead of bottle count
        }

        outPrepTotal += outPrep;
        outXferTotal += outXfer;
      }
    }

    return {
      inSupplierTotal,
      inTransferTotal,
      outPrepTotal,
      outXferTotal,
    };
  }

  /**
   * Calculates current total for MASTERLIST
   * @param {number} beginningInv - Beginning inventory
   * @param {Object} totals - Calculated totals from calculateMasterlistTotals
   * @returns {number} Current total
   */
  static calculateCurrentTotal(beginningInv, totals) {
    return (
      beginningInv +
      (totals.inSupplierTotal + totals.inTransferTotal) -
      (totals.outPrepTotal + totals.outXferTotal)
    );
  }

  /**
   * Determines inventory status based on current total vs safety level
   * @param {number} currentTotal - Current inventory total
   * @param {number} safetyLevel - Safety level threshold
   * @returns {string} Status ('CRITICAL' or 'OK')
   */
  static determineInventoryStatus(currentTotal, safetyLevel) {
    return currentTotal <= safetyLevel ? "CRITICAL" : "OK";
  }
}

/**
 * Data formatting utilities
 */
class FormatUtils {
  /**
   * Formats batch dropdown option for OUT transactions
   * @param {Object} batch - Batch information
   * @param {string} uom - Unit of measurement
   * @returns {string} Formatted dropdown option
   */
  static formatBatchDropdownOption(batch, uom) {
    const formattedExpDate =
      batch.expDate instanceof Date
        ? batch.expDate.toISOString().split("T")[0]
        : new Date(batch.expDate).toISOString().split("T")[0];

    return `${batch.chemName} - Batch: ${batch.batchNum} | Exp: ${formattedExpDate} | Qty: ${batch.endingVol} ${uom}`;
  }

  /**
   * Formats date for display
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  static formatDate(date) {
    if (!date) return "";

    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toISOString().split("T")[0];
  }

  /**
   * Formats number with specified decimal places
   * @param {number} num - Number to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted number string
   */
  static formatNumber(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return "0";
    return parseFloat(num).toFixed(decimals);
  }

  /**
   * Sanitizes string input for sheet storage
   * @param {string} str - String to sanitize
   * @returns {string} Sanitized string
   */
  static sanitizeString(str) {
    if (!str) return "";
    return str.toString().trim();
  }
}

/**
 * Error handling utilities
 */
class ErrorHandler {
  /**
   * Logs error with context information
   * @param {string} operation - Operation being performed
   * @param {Error} error - Error object
   * @param {Object} context - Additional context information
   */
  static logError(operation, error, context = {}) {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      operation,
      message: error.message,
      stack: error.stack,
      context,
    };

    console.error(
      `[${timestamp}] Error in ${operation}:`,
      JSON.stringify(errorInfo, null, 2)
    );
  }

  /**
   * Creates user-friendly error message
   * @param {Error} error - Error object
   * @param {string} operation - Operation that failed
   * @returns {string} User-friendly error message
   */
  static createUserMessage(error, operation) {
    const baseMessage = `Error during ${operation}: `;

    // Common error patterns and user-friendly messages
    if (error.message.includes("not found")) {
      return (
        baseMessage + "Required data not found. Please check your selection."
      );
    }

    if (error.message.includes("Insufficient volume")) {
      return baseMessage + error.message;
    }

    if (error.message.includes("required")) {
      return baseMessage + "Please fill in all required fields.";
    }

    // Default message for unknown errors
    return (
      baseMessage +
      "An unexpected error occurred. Please try again or contact support."
    );
  }
}

/**
 * System health check utilities
 */
class SystemHealth {
  /**
   * Performs comprehensive system health check
   * @param {string} spreadsheetId - Spreadsheet ID
   * @returns {Object} Health check results
   */
  static performHealthCheck(spreadsheetId) {
    const results = {
      overall: "HEALTHY",
      checks: [],
      timestamp: new Date().toISOString(),
    };

    try {
      const ss = SpreadsheetApp.openById(spreadsheetId);

      // Check required sheets exist
      const requiredSheets = [
        "Form Responses",
        "STAFF_LIST",
        "CHEM_LIST",
        "SUPPLIER_BRANDS",
        "LOC_LIST",
        "BATCHES",
        "MASTERLIST",
      ];
      const sheetCheck = this.checkSheetsExist(ss, requiredSheets);
      results.checks.push(sheetCheck);

      // Check data integrity
      const dataCheck = this.checkDataIntegrity(ss);
      results.checks.push(dataCheck);

      // Check for orphaned data
      const orphanCheck = this.checkOrphanedData(ss);
      results.checks.push(orphanCheck);

      // Determine overall health
      const failedChecks = results.checks.filter(
        (check) => check.status === "FAILED"
      );
      if (failedChecks.length > 0) {
        results.overall = "UNHEALTHY";
      }
    } catch (error) {
      results.overall = "CRITICAL";
      results.checks.push({
        name: "System Access",
        status: "FAILED",
        message: `Cannot access system: ${error.message}`,
      });
    }

    return results;
  }

  /**
   * Checks if all required sheets exist
   * @param {Spreadsheet} ss - Spreadsheet object
   * @param {Array} requiredSheets - Array of required sheet names
   * @returns {Object} Check result
   */
  static checkSheetsExist(ss, requiredSheets) {
    const existingSheets = ss.getSheets().map((sheet) => sheet.getName());
    const missingSheets = requiredSheets.filter(
      (name) => !existingSheets.includes(name)
    );

    return {
      name: "Sheet Existence",
      status: missingSheets.length === 0 ? "PASSED" : "FAILED",
      message:
        missingSheets.length === 0
          ? "All required sheets exist"
          : `Missing sheets: ${missingSheets.join(", ")}`,
    };
  }

  /**
   * Checks data integrity across sheets
   * @param {Spreadsheet} ss - Spreadsheet object
   * @returns {Object} Check result
   */
  static checkDataIntegrity(ss) {
    const issues = [];

    try {
      const batchesSheet = ss.getSheetByName("BATCHES");
      const chemListSheet = ss.getSheetByName("CHEM_LIST");

      if (batchesSheet && chemListSheet) {
        // Check if all chemicals in BATCHES exist in CHEM_LIST
        const batchesData = batchesSheet.getDataRange().getValues();
        const chemListData = chemListSheet.getDataRange().getValues();
        const validChems = chemListData.slice(1).map((row) => row[0]);

        for (let i = 1; i < batchesData.length; i++) {
          const chemName = batchesData[i][2];
          if (chemName && !validChems.includes(chemName)) {
            issues.push(`Unknown chemical in BATCHES: ${chemName}`);
          }
        }
      }
    } catch (error) {
      issues.push(`Data integrity check failed: ${error.message}`);
    }

    return {
      name: "Data Integrity",
      status: issues.length === 0 ? "PASSED" : "FAILED",
      message:
        issues.length === 0 ? "Data integrity check passed" : issues.join("; "),
    };
  }

  /**
   * Checks for orphaned data
   * @param {Spreadsheet} ss - Spreadsheet object
   * @returns {Object} Check result
   */
  static checkOrphanedData(ss) {
    const issues = [];

    try {
      const batchesSheet = ss.getSheetByName("BATCHES");

      if (batchesSheet) {
        const batchesData = batchesSheet.getDataRange().getValues();

        // Check for batches with zero or negative ending volume
        for (let i = 1; i < batchesData.length; i++) {
          const batchNum = batchesData[i][1];
          const endingVol = batchesData[i][13];

          if (endingVol < 0) {
            issues.push(
              `Negative ending volume for batch ${batchNum}: ${endingVol}`
            );
          }
        }
      }
    } catch (error) {
      issues.push(`Orphaned data check failed: ${error.message}`);
    }

    return {
      name: "Orphaned Data",
      status: issues.length === 0 ? "PASSED" : "WARNING",
      message:
        issues.length === 0 ? "No orphaned data found" : issues.join("; "),
    };
  }
}
