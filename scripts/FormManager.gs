/**
 * Google Form Dropdown Management Script
 * Manages and updates dropdown values in the manually created Google Form
 *
 * This script focuses on keeping form dropdowns synchronized with current data
 * The Google Form itself should be created and linked manually
 */

/**
 * Main function to update all form dropdowns
 * Run this function after form setup or when data changes
 */
function updateAllFormDropdowns() {
  try {
    const form = FormApp.openById(FORM_ID);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    console.log("Starting dropdown updates...");

    updateStaffDropdownInForm(form, ss);
    updateChemicalDropdownInForm(form, ss);
    updateSupplierDropdownInForm(form, ss);
    updateBrandDropdownInForm(form, ss);
    updateLocationDropdownInForm(form, ss);
    updateBatchDropdownInForm(form, ss);

    console.log("All form dropdowns updated successfully");
  } catch (error) {
    console.error("Error updating form dropdowns:", error);
    throw error;
  }
}

/**
 * Updates staff dropdown from STAFF_LIST sheet
 */
function updateStaffDropdownInForm(form, ss) {
  try {
    const staffSheet = ss.getSheetByName("STAFF_LIST");
    if (!staffSheet) {
      console.warn("STAFF_LIST sheet not found");
      return;
    }

    const data = staffSheet.getDataRange().getValues();
    const staffNames = data
      .slice(1)
      .map((row) => row[1])
      .filter((name) => name && name.toString().trim() !== "");

    const items = form.getItems();
    const staffItem = items.find(
      (item) =>
        item.getType() === FormApp.ItemType.LIST &&
        item.getTitle() === "Staff Name"
    );

    if (staffItem && staffNames.length > 0) {
      staffItem.asListItem().setChoiceValues(staffNames);
      console.log("Staff dropdown updated with:", staffNames.length, "items");
    } else {
      console.warn(
        "Staff Name dropdown not found in form or no data available"
      );
    }
  } catch (error) {
    console.error("Error updating staff dropdown:", error);
  }
}

/**
 * Updates chemical dropdown from CHEM_LIST sheet
 */
function updateChemicalDropdownInForm(form, ss) {
  try {
    const chemSheet = ss.getSheetByName("CHEM_LIST");
    if (!chemSheet) {
      console.warn("CHEM_LIST sheet not found");
      return;
    }

    const data = chemSheet.getDataRange().getValues();
    const chemNames = data
      .slice(1)
      .map((row) => row[0])
      .filter((name) => name && name.toString().trim() !== "");

    const items = form.getItems();
    const chemItem = items.find(
      (item) =>
        item.getType() === FormApp.ItemType.LIST &&
        item.getTitle() === "Chemical Name"
    );

    if (chemItem && chemNames.length > 0) {
      chemItem.asListItem().setChoiceValues(chemNames);
      console.log("Chemical dropdown updated with:", chemNames.length, "items");
    } else {
      console.warn(
        "Chemical Name dropdown not found in form or no data available"
      );
    }
  } catch (error) {
    console.error("Error updating chemical dropdown:", error);
  }
}

/**
 * Updates supplier dropdown from SUPPLIER_BRANDS sheet
 */
function updateSupplierDropdownInForm(form, ss) {
  try {
    const supplierSheet = ss.getSheetByName("SUPPLIER_BRANDS");
    if (!supplierSheet) {
      console.warn("SUPPLIER_BRANDS sheet not found");
      return;
    }

    const data = supplierSheet.getDataRange().getValues();
    const suppliers = [
      ...new Set(
        data
          .slice(1)
          .map((row) => row[0])
          .filter((name) => name && name.toString().trim() !== "")
      ),
    ];

    const items = form.getItems();
    const supplierItem = items.find(
      (item) =>
        item.getType() === FormApp.ItemType.LIST &&
        item.getTitle() === "Supplier"
    );

    if (supplierItem && suppliers.length > 0) {
      supplierItem.asListItem().setChoiceValues(suppliers);
      console.log("Supplier dropdown updated with:", suppliers.length, "items");
    } else {
      console.warn("Supplier dropdown not found in form or no data available");
    }
  } catch (error) {
    console.error("Error updating supplier dropdown:", error);
  }
}

/**
 * Updates brand dropdown from SUPPLIER_BRANDS sheet
 */
function updateBrandDropdownInForm(form, ss) {
  try {
    const supplierSheet = ss.getSheetByName("SUPPLIER_BRANDS");
    if (!supplierSheet) {
      console.warn("SUPPLIER_BRANDS sheet not found");
      return;
    }

    const data = supplierSheet.getDataRange().getValues();
    const brands = [
      ...new Set(
        data
          .slice(1)
          .map((row) => row[1])
          .filter((name) => name && name.toString().trim() !== "")
      ),
    ];

    const items = form.getItems();
    const brandItem = items.find(
      (item) =>
        item.getType() === FormApp.ItemType.LIST && item.getTitle() === "Brand"
    );

    if (brandItem && brands.length > 0) {
      brandItem.asListItem().setChoiceValues(brands);
      console.log("Brand dropdown updated with:", brands.length, "items");
    } else {
      console.warn("Brand dropdown not found in form or no data available");
    }
  } catch (error) {
    console.error("Error updating brand dropdown:", error);
  }
}

/**
 * Updates location dropdown from LOC_LIST sheet
 */
function updateLocationDropdownInForm(form, ss) {
  try {
    const locSheet = ss.getSheetByName("LOC_LIST");
    if (!locSheet) {
      console.warn("LOC_LIST sheet not found");
      return;
    }

    const data = locSheet.getDataRange().getValues();
    const locations = data
      .slice(1)
      .map((row) => row[0])
      .filter((name) => name && name.toString().trim() !== "");

    const items = form.getItems();
    const locationItem = items.find(
      (item) =>
        item.getType() === FormApp.ItemType.LIST &&
        item.getTitle() === "Location (Storage)"
    );

    if (locationItem && locations.length > 0) {
      locationItem.asListItem().setChoiceValues(locations);
      console.log("Location dropdown updated with:", locations.length, "items");
    } else {
      console.warn(
        "Location (Storage) dropdown not found in form or no data available"
      );
    }
  } catch (error) {
    console.error("Error updating location dropdown:", error);
  }
}

/**
 * Updates batch dropdown for OUT transactions from BATCHES sheet
 * Formats as: "Chemical Name - Batch: BatchNum | Exp: Date | Qty: Volume UOM"
 */
function updateBatchDropdownInForm(form, ss) {
  try {
    const batchesSheet = ss.getSheetByName("BATCHES");
    const chemListSheet = ss.getSheetByName("CHEM_LIST");

    if (!batchesSheet || !chemListSheet) {
      console.warn("BATCHES or CHEM_LIST sheet not found");
      return;
    }

    const batchesData = batchesSheet.getDataRange().getValues();
    const chemData = chemListSheet.getDataRange().getValues();

    // Create UOM lookup from CHEM_LIST
    const uomLookup = {};
    for (let i = 1; i < chemData.length; i++) {
      if (chemData[i][0]) {
        uomLookup[chemData[i][0]] = chemData[i][2]; // chem_name: UOM
      }
    }

    // Format batch options for dropdown
    const batchOptions = [];
    for (let i = 1; i < batchesData.length; i++) {
      // Skip header
      const batchNum = batchesData[i][1]; // Column B
      const chemName = batchesData[i][2]; // Column C
      const expDate = batchesData[i][10]; // Column K
      const endingVol = batchesData[i][13]; // Column N

      if (batchNum && chemName && endingVol > 0) {
        // Only show batches with remaining volume
        const uom = uomLookup[chemName] || "units";
        const formattedExpDate =
          expDate instanceof Date
            ? expDate.toISOString().split("T")[0]
            : new Date(expDate).toISOString().split("T")[0];

        const formattedOption = `${chemName} - Batch: ${batchNum} | Exp: ${formattedExpDate} | Qty: ${endingVol} ${uom}`;
        batchOptions.push(formattedOption);
      }
    }

    // If no batches available, show default message
    if (batchOptions.length === 0) {
      batchOptions.push("No available batches");
    }

    const items = form.getItems();
    const batchItem = items.find(
      (item) =>
        item.getType() === FormApp.ItemType.LIST &&
        item.getTitle() === "Select Batch/Lot Number Out"
    );

    if (batchItem) {
      batchItem.asListItem().setChoiceValues(batchOptions);
      console.log(
        "Batch dropdown updated with",
        batchOptions.length,
        "options"
      );
    } else {
      console.warn("Select Batch/Lot Number Out dropdown not found in form");
    }
  } catch (error) {
    console.error("Error updating batch dropdown:", error);
  }
}

/**
 * Scheduled function to update dropdowns (called by timed trigger)
 * This runs every 6 hours automatically
 */
function scheduledDropdownUpdate() {
  console.log("Running scheduled dropdown update...");
  updateAllFormDropdowns();
}

/**
 * Updates dropdowns after form submission
 * Call this after processing form submissions to keep data current
 */
function updateDropdownsAfterSubmission() {
  console.log("Updating dropdowns after form submission...");
  // Only update batch dropdown since it's the most dynamic
  try {
    const form = FormApp.openById(FORM_ID);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    updateBatchDropdownInForm(form, ss);
  } catch (error) {
    console.error("Error updating dropdowns after submission:", error);
  }
}

/**
 * Utility function to validate form structure
 * Use this to check if the manually created form has required fields
 */
function validateFormStructure() {
  try {
    const form = FormApp.openById(FORM_ID);
    const items = form.getItems();

    const requiredFields = [
      "Transaction Date",
      "Staff Name",
      "Chemical Name",
      "Transaction Type",
      "Supplier",
      "Brand",
      "Location (Storage)",
      "Select Batch/Lot Number Out",
    ];

    const missingFields = [];
    const existingTitles = items.map((item) => item.getTitle());

    requiredFields.forEach((field) => {
      const found = existingTitles.some(
        (title) => title.includes(field) || title === field
      );
      if (!found) {
        missingFields.push(field);
      }
    });

    if (missingFields.length === 0) {
      console.log(
        "✅ Form structure validation passed - all required fields found"
      );
      return true;
    } else {
      console.warn(
        "⚠️ Form structure validation failed - missing fields:",
        missingFields
      );
      return false;
    }
  } catch (error) {
    console.error("Error validating form structure:", error);
    return false;
  }
}

/**
 * Quick diagnostic function to check form connectivity
 */
function diagnosticFormCheck() {
  console.log("🔍 Running form connectivity diagnostic...");

  try {
    // Test form access
    const form = FormApp.openById(FORM_ID);
    console.log("✅ Form accessible:", form.getTitle());

    // Test spreadsheet access
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    console.log("✅ Spreadsheet accessible:", ss.getName());

    // Count form items
    const items = form.getItems();
    console.log(`📝 Form has ${items.length} items`);

    // List dropdown items
    const dropdowns = items.filter(
      (item) => item.getType() === FormApp.ItemType.LIST
    );
    console.log(`📋 Found ${dropdowns.length} dropdown fields:`);
    dropdowns.forEach((dropdown) => {
      console.log(`   - ${dropdown.getTitle()}`);
    });

    // Validate structure
    const isValid = validateFormStructure();

    return {
      formAccessible: true,
      spreadsheetAccessible: true,
      itemCount: items.length,
      dropdownCount: dropdowns.length,
      structureValid: isValid,
    };
  } catch (error) {
    console.error("❌ Form diagnostic failed:", error);
    return {
      error: error.message,
    };
  }
}
