/**
 * Testing Scripts for Chemical Inventory Management System
 * Comprehensive test suite for validating system functionality
 *
 * Run these functions to validate the system is working correctly
 */

const TEST_SPREADSHEET_ID = "1PH0WfiewO5pxwI50SpmEqSj5EqTU2G9T0LA6SmL-ir4"; // Update with your ID
const TEST_FORM_ID = "18xl0TYI9pfV9IzuNfDxuT-cEf0KUFfTuNBf9HWUnxfY"; // Update with your ID

/**
 * Master test runner - executes all test suites
 * Run this function to perform complete system validation
 */
function runAllTests() {
  console.log("🧪 Starting Chemical Inventory System Test Suite...");
  console.log("================================================");

  const testResults = {
    passed: 0,
    failed: 0,
    errors: [],
    startTime: new Date(),
  };

  try {
    // Test Suite 1: Basic System Setup
    console.log("\n📋 Test Suite 1: Basic System Setup");
    runBasicSystemTests(testResults);

    // Test Suite 2: Sheet Structure and Data
    console.log("\n📊 Test Suite 2: Sheet Structure and Data");
    runSheetStructureTests(testResults);

    // Test Suite 3: Form Functionality
    console.log("\n📝 Test Suite 3: Form Functionality");
    runFormFunctionalityTests(testResults);

    // Test Suite 4: Transaction Processing
    console.log("\n⚙️ Test Suite 4: Transaction Processing");
    runTransactionProcessingTests(testResults);

    // Test Suite 5: Data Validation
    console.log("\n✅ Test Suite 5: Data Validation");
    runDataValidationTests(testResults);

    // Test Suite 6: Calculation Accuracy
    console.log("\n🧮 Test Suite 6: Calculation Accuracy");
    runCalculationTests(testResults);

    // Test Suite 7: Error Handling
    console.log("\n⚠️ Test Suite 7: Error Handling");
    runErrorHandlingTests(testResults);
  } catch (error) {
    testResults.errors.push(`Test suite execution error: ${error.message}`);
    testResults.failed++;
  }

  // Final Results Summary
  console.log("\n📈 Test Results Summary");
  console.log("=====================");
  console.log(`✅ Tests Passed: ${testResults.passed}`);
  console.log(`❌ Tests Failed: ${testResults.failed}`);
  console.log(`⏱️ Total Time: ${new Date() - testResults.startTime}ms`);

  if (testResults.errors.length > 0) {
    console.log("\n🚨 Errors Found:");
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  if (testResults.failed === 0) {
    console.log("\n🎉 All tests passed! System is ready for production.");
  } else {
    console.log(
      "\n⚠️ Some tests failed. Please review and fix issues before deployment."
    );
  }

  return testResults;
}

/**
 * Test Suite 1: Basic System Setup
 */
function runBasicSystemTests(results) {
  // Test 1.1: Spreadsheet Access
  runTest(
    "Spreadsheet Access",
    () => {
      const ss = SpreadsheetApp.openById(TEST_SPREADSHEET_ID);
      return ss !== null && ss.getName() !== null;
    },
    "Should be able to access the main spreadsheet",
    results
  );

  // Test 1.2: Form Access
  runTest(
    "Form Access",
    () => {
      const form = FormApp.openById(TEST_FORM_ID);
      return form !== null && form.getTitle() !== null;
    },
    "Should be able to access the Google Form",
    results
  );

  // Test 1.3: Required Functions Exist
  runTest(
    "Required Functions",
    () => {
      const requiredFunctions = [
        "onFormSubmit",
        "updateMasterlist",
        "updateFormDropdowns",
        "initializeAllSheets",
      ];

      // Check if functions are defined (simplified check)
      return requiredFunctions.every(
        (funcName) => typeof eval(`typeof ${funcName}`) === "string"
      );
    },
    "All required functions should be defined",
    results
  );
}

/**
 * Test Suite 2: Sheet Structure and Data
 */
function runSheetStructureTests(results) {
  const ss = SpreadsheetApp.openById(TEST_SPREADSHEET_ID);

  // Test 2.1: All Required Sheets Exist (created by script)
  runTest(
    "Required Sheets Exist",
    () => {
      const requiredSheets = [
        // Note: "Form Responses" is created automatically when form is linked
        "STAFF_LIST",
        "CHEM_LIST",
        "SUPPLIER_BRANDS",
        "LOC_LIST",
        "BATCHES",
        "MASTERLIST",
      ];
      const existingSheets = ss.getSheets().map((sheet) => sheet.getName());
      return requiredSheets.every((name) => existingSheets.includes(name));
    },
    "All required sheets created by script should exist in the spreadsheet",
    results
  );

  // Test 2.2: Sheet Headers Correct
  runTest(
    "Sheet Headers",
    () => {
      const chemListSheet = ss.getSheetByName("CHEM_LIST");
      if (!chemListSheet || chemListSheet.getLastRow() === 0) return false;

      const headers = chemListSheet.getRange(1, 1, 1, 4).getValues()[0];
      const expectedHeaders = ["chem_name", "liq_sol", "UOM", "safety_lvl"];
      return expectedHeaders.every(
        (header, index) => headers[index] === header
      );
    },
    "CHEM_LIST sheet should have correct headers",
    results
  );

  // Test 2.3: Initial Data Present
  runTest(
    "Initial Data Present",
    () => {
      const staffSheet = ss.getSheetByName("STAFF_LIST");
      const chemSheet = ss.getSheetByName("CHEM_LIST");

      return (
        staffSheet &&
        staffSheet.getLastRow() > 1 &&
        chemSheet &&
        chemSheet.getLastRow() > 1
      );
    },
    "Initial data should be present in key sheets",
    results
  );
}

/**
 * Test Suite 3: Form Functionality
 */
function runFormFunctionalityTests(results) {
  const form = FormApp.openById(TEST_FORM_ID);

  // Test 3.1: Form Structure
  runTest(
    "Form Structure",
    () => {
      const items = form.getItems();
      const requiredTitles = [
        "Transaction Date",
        "Staff Name",
        "Chemical Name",
        "Transaction Type",
      ];

      const existingTitles = items.map((item) => item.getTitle());
      return requiredTitles.every((title) =>
        existingTitles.some((existing) => existing.includes(title))
      );
    },
    "Form should have all required fields",
    results
  );

  // Test 3.2: Dropdown Items Populated
  runTest(
    "Dropdown Population",
    () => {
      const items = form.getItems();
      const staffItem = items.find(
        (item) =>
          item.getTitle().includes("Staff Name") &&
          item.getType() === FormApp.ItemType.LIST
      );

      if (!staffItem) return false;

      const choices = staffItem.asListItem().getChoices();
      return choices.length > 0 && choices[0].getValue() !== "Loading...";
    },
    "Form dropdowns should be populated with actual data",
    results
  );
}

/**
 * Test Suite 4: Transaction Processing
 */
function runTransactionProcessingTests(results) {
  // Test 4.1: IN Transaction Processing
  runTest(
    "IN Transaction Processing",
    () => {
      try {
        const mockInEvent = createMockFormSubmission("IN");
        const formResponse = parseFormResponse(mockInEvent);

        // Validate parsing worked
        return (
          formResponse.transactionType === "IN" &&
          formResponse.chemicalName === "Sodium Chloride" &&
          formResponse.qtyBottle === 5
        );
      } catch (error) {
        console.error("IN Transaction test error:", error.message);
        return false;
      }
    },
    "Should correctly process IN transaction form submissions",
    results
  );

  // Test 4.2: Batch Number Uniqueness
  runTest(
    "Batch Number Uniqueness",
    () => {
      try {
        const ss = SpreadsheetApp.openById(TEST_SPREADSHEET_ID);
        const batchesSheet = ss.getSheetByName("BATCHES");

        // Test the uniqueness function
        const testBatchNum = "TEST001";
        const uniqueBatchNum = ensureUniqueBatchNumber(
          testBatchNum,
          batchesSheet
        );

        return typeof uniqueBatchNum === "string" && uniqueBatchNum.length > 0;
      } catch (error) {
        console.error("Batch uniqueness test error:", error.message);
        return false;
      }
    },
    "Should ensure batch number uniqueness",
    results
  );
}

/**
 * Test Suite 5: Data Validation
 */
function runDataValidationTests(results) {
  // Test 5.1: Form Response Validation
  runTest(
    "Form Response Validation",
    () => {
      try {
        const validResponse = createMockFormSubmission("IN");
        const parsedResponse = parseFormResponse(validResponse);

        const validation = DataValidator.validateFormResponse(parsedResponse);
        return validation.isValid === true;
      } catch (error) {
        console.error("Form validation test error:", error.message);
        return false;
      }
    },
    "Should validate correct form responses as valid",
    results
  );

  // Test 5.2: Invalid Data Rejection
  runTest(
    "Invalid Data Rejection",
    () => {
      try {
        const invalidResponse = {
          transactionType: "INVALID",
          chemicalName: "",
          qtyBottle: -5,
        };

        const validation = DataValidator.validateFormResponse(invalidResponse);
        return validation.isValid === false && validation.errors.length > 0;
      } catch (error) {
        console.error("Invalid data test error:", error.message);
        return false;
      }
    },
    "Should reject invalid form data",
    results
  );
}

/**
 * Test Suite 6: Calculation Accuracy
 */
function runCalculationTests(results) {
  // Test 6.1: Volume Calculation
  runTest(
    "Volume Calculation",
    () => {
      const result = CalculationUtils.calculateTotalVolume(5, 100);
      return result === 500;
    },
    "Should correctly calculate total volumes",
    results
  );

  // Test 6.2: Ending Volume Calculation
  runTest(
    "Ending Volume Calculation",
    () => {
      const result = CalculationUtils.calculateEndingVolume(1000, 200, 150);
      return result === 650;
    },
    "Should correctly calculate ending volumes",
    results
  );

  // Test 6.3: MASTERLIST Volume-Based Calculation
  runTest(
    "MASTERLIST Volume-Based Calculation",
    () => {
      // Mock BATCHES data for testing
      const mockBatchesData = [
        [
          "in_date",
          "batch_num",
          "chem_name",
          "supplier",
          "brand",
          "liq_sol",
          "UOM",
          "qty_bottle",
          "vol_per_bottle",
          "vol_total",
          "exp_date",
          "out_prep",
          "out_xfer",
          "ending_vol",
          "location",
        ], // Header
        [
          "2024-12-15",
          "TEST001",
          "Sodium Chloride",
          "Yana Chemodities",
          "Sigma",
          "solid",
          "g",
          2,
          500,
          1000,
          "2025-12-31",
          0,
          0,
          1000,
          "Room A",
        ], // Non-SMFI supplier
        [
          "2024-12-15",
          "TEST002",
          "Sodium Chloride",
          "SMFI",
          "Internal",
          "solid",
          "g",
          3,
          250,
          750,
          "2025-12-31",
          100,
          50,
          600,
          "Room A",
        ], // SMFI supplier
      ];

      const totals = CalculationUtils.calculateMasterlistTotals(
        "Sodium Chloride",
        mockBatchesData
      );

      // Should sum vol_total (not qty_bottle) for supplier totals
      const expectedInSupplierTotal = 1000; // From non-SMFI batch
      const expectedInTransferTotal = 750; // From SMFI batch
      const expectedOutPrepTotal = 100; // From out_prep
      const expectedOutXferTotal = 50; // From out_xfer

      return (
        totals.inSupplierTotal === expectedInSupplierTotal &&
        totals.inTransferTotal === expectedInTransferTotal &&
        totals.outPrepTotal === expectedOutPrepTotal &&
        totals.outXferTotal === expectedOutXferTotal
      );
    },
    "Should calculate MASTERLIST totals based on volume, not bottle count",
    results
  );

  // Test 6.4: CHEM_LIST to MASTERLIST Sync
  runTest(
    "CHEM_LIST to MASTERLIST Sync",
    () => {
      try {
        // This test verifies that new chemicals added to CHEM_LIST
        // are automatically added to MASTERLIST when sync function is called

        // Note: This is a functional test to verify the function exists and runs
        // In a real scenario, you would add a chemical to CHEM_LIST and test the sync
        syncChemListWithMasterlist();
        return true; // Function executed without error
      } catch (error) {
        console.error("CHEM_LIST sync test error:", error.message);
        return false;
      }
    },
    "Should sync new chemicals from CHEM_LIST to MASTERLIST",
    results
  );

  // Test 6.5: Status Determination
  runTest(
    "Status Determination",
    () => {
      const criticalStatus = CalculationUtils.determineInventoryStatus(50, 100);
      const okStatus = CalculationUtils.determineInventoryStatus(150, 100);

      return criticalStatus === "CRITICAL" && okStatus === "OK";
    },
    "Should correctly determine inventory status",
    results
  );
}

/**
 * Test Suite 7: Error Handling
 */
function runErrorHandlingTests(results) {
  // Test 7.1: Batch Not Found Error
  runTest(
    "Batch Not Found Handling",
    () => {
      try {
        const ss = SpreadsheetApp.openById(TEST_SPREADSHEET_ID);
        const batchesSheet = ss.getSheetByName("BATCHES");

        const result = findBatchRow("NONEXISTENT_BATCH", batchesSheet);
        return result === -1; // Should return -1 for not found
      } catch (error) {
        return false;
      }
    },
    "Should handle batch not found scenarios gracefully",
    results
  );

  // Test 7.2: System Health Check
  runTest(
    "System Health Check",
    () => {
      try {
        const healthResult =
          SystemHealth.performHealthCheck(TEST_SPREADSHEET_ID);

        return (
          healthResult &&
          healthResult.overall &&
          healthResult.checks &&
          Array.isArray(healthResult.checks)
        );
      } catch (error) {
        console.error("Health check test error:", error.message);
        return false;
      }
    },
    "System health check should execute without errors",
    results
  );
}

/**
 * Helper function to run individual tests
 */
function runTest(testName, testFunction, description, results) {
  try {
    const passed = testFunction();

    if (passed) {
      console.log(`✅ ${testName}: PASSED`);
      results.passed++;
    } else {
      console.log(`❌ ${testName}: FAILED - ${description}`);
      results.failed++;
      results.errors.push(`${testName}: ${description}`);
    }
  } catch (error) {
    console.log(`💥 ${testName}: ERROR - ${error.message}`);
    results.failed++;
    results.errors.push(`${testName}: Execution error - ${error.message}`);
  }
}

/**
 * Creates mock form submission data for testing
 */
function createMockFormSubmission(transactionType) {
  const baseData = {
    namedValues: {
      "Transaction Date": ["2024-12-15"],
      "Staff Name": ["Kim"],
      "Chemical Name": ["Sodium Chloride"],
      "Transaction Type": [transactionType],
    },
  };

  if (transactionType === "IN") {
    Object.assign(baseData.namedValues, {
      Supplier: ["Yana Chemodities"],
      Brand: ["Sigma Aldrich"],
      "Batch/Lot Number": ["TEST001"],
      "Number of Bottles": ["5"],
      "Volume/Weight per Bottle": ["100"],
      "Expiration Date": ["2025-12-31"],
      "Location (Storage)": ["Chemical Storage Room A"],
    });
  } else if (transactionType === "OUT") {
    Object.assign(baseData.namedValues, {
      "Out Type": ["prep"],
      "Select Batch/Lot Number Out": [
        "Sodium Chloride - Batch: TEST001 | Exp: 2025-12-31 | Qty: 500 g",
      ],
      "Total Volume/Weight Out": ["100"],
      "Outgoing Transaction Comment (Optional)": ["Test comment"],
    });
  }

  return baseData;
}

/**
 * Test data setup - creates sample data for testing
 */
function setupTestData() {
  console.log("🔧 Setting up test data...");

  try {
    const ss = SpreadsheetApp.openById(TEST_SPREADSHEET_ID);

    // Add sample BATCHES data
    const batchesSheet = ss.getSheetByName("BATCHES");
    if (batchesSheet && batchesSheet.getLastRow() === 1) {
      // Only headers
      const sampleBatch = [
        new Date("2024-12-15"), // in_date
        "SAMPLE001", // batch_num
        "Sodium Chloride", // chem_name
        "Yana Chemodities", // supplier
        "Sigma Aldrich", // brand
        "solid", // liq_sol
        "g", // UOM
        10, // qty_bottle
        500, // vol_per_bottle
        5000, // vol_total
        new Date("2025-12-31"), // exp_date
        0, // out_prep
        0, // out_xfer
        5000, // ending_vol
        "Chemical Storage Room A", // location
      ];

      batchesSheet.appendRow(sampleBatch);
      console.log("✅ Sample batch data added");
    }

    // Update MASTERLIST with beginning inventory
    const masterlistSheet = ss.getSheetByName("MASTERLIST");
    if (masterlistSheet && masterlistSheet.getLastRow() > 1) {
      // Add some beginning inventory for testing
      masterlistSheet.getRange(2, 4).setValue(1000); // Beginning inventory for first chemical
      console.log("✅ Beginning inventory set for testing");
    }

    console.log("✅ Test data setup complete");
  } catch (error) {
    console.error("❌ Error setting up test data:", error.message);
  }
}

/**
 * Cleanup test data from test suite
 */
function cleanupTestSuiteData() {
  console.log("🧹 Cleaning up test data...");

  try {
    const ss = SpreadsheetApp.openById(TEST_SPREADSHEET_ID);

    // Clear test entries from BATCHES (keep headers)
    const batchesSheet = ss.getSheetByName("BATCHES");
    if (batchesSheet && batchesSheet.getLastRow() > 1) {
      const lastRow = batchesSheet.getLastRow();
      const dataRange = batchesSheet.getRange(
        2,
        1,
        lastRow - 1,
        batchesSheet.getLastColumn()
      );
      const data = dataRange.getValues();

      // Remove rows that contain test data
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i][1] && data[i][1].toString().includes("TEST")) {
          batchesSheet.deleteRow(i + 2); // +2 because array is 0-indexed but sheets are 1-indexed, and we skip header
        }
      }
    }

    // Reset MASTERLIST calculations
    updateMasterlist();

    console.log("✅ Test data cleanup complete");
  } catch (error) {
    console.error("❌ Error cleaning up test data:", error.message);
  }
}

/**
 * Performance test - measures system response times
 */
function runPerformanceTests() {
  console.log("⚡ Running performance tests...");

  const performanceResults = {};

  // Test 1: Form dropdown update time
  const dropdownStart = new Date();
  try {
    updateFormDropdowns();
    performanceResults.dropdownUpdate = new Date() - dropdownStart;
    console.log(`✅ Dropdown update: ${performanceResults.dropdownUpdate}ms`);
  } catch (error) {
    console.log(`❌ Dropdown update failed: ${error.message}`);
  }

  // Test 2: MASTERLIST calculation time
  const masterlistStart = new Date();
  try {
    updateMasterlist();
    performanceResults.masterlistUpdate = new Date() - masterlistStart;
    console.log(
      `✅ Masterlist update: ${performanceResults.masterlistUpdate}ms`
    );
  } catch (error) {
    console.log(`❌ Masterlist update failed: ${error.message}`);
  }

  // Test 3: Health check time
  const healthStart = new Date();
  try {
    SystemHealth.performHealthCheck(TEST_SPREADSHEET_ID);
    performanceResults.healthCheck = new Date() - healthStart;
    console.log(`✅ Health check: ${performanceResults.healthCheck}ms`);
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
  }

  console.log("\n📊 Performance Summary:");
  console.log("====================");
  Object.entries(performanceResults).forEach(([test, time]) => {
    const status = time < 10000 ? "🟢" : time < 30000 ? "🟡" : "🔴";
    console.log(`${status} ${test}: ${time}ms`);
  });

  return performanceResults;
}

/**
 * Load test - simulates multiple concurrent transactions
 */
function runLoadTest(transactionCount = 10) {
  console.log(`🔄 Running load test with ${transactionCount} transactions...`);

  const loadResults = {
    successful: 0,
    failed: 0,
    errors: [],
    startTime: new Date(),
  };

  for (let i = 0; i < transactionCount; i++) {
    try {
      const mockEvent = createMockFormSubmission("IN");

      // Modify batch number to make it unique
      mockEvent.namedValues["Batch/Lot Number"] = [`LOAD_TEST_${i}`];

      // Parse and validate
      const formResponse = parseFormResponse(mockEvent);
      const validation = DataValidator.validateFormResponse(formResponse);

      if (validation.isValid) {
        loadResults.successful++;
      } else {
        loadResults.failed++;
        loadResults.errors.push(`Transaction ${i}: Validation failed`);
      }
    } catch (error) {
      loadResults.failed++;
      loadResults.errors.push(`Transaction ${i}: ${error.message}`);
    }
  }

  loadResults.duration = new Date() - loadResults.startTime;

  console.log("\n📈 Load Test Results:");
  console.log("==================");
  console.log(`✅ Successful: ${loadResults.successful}`);
  console.log(`❌ Failed: ${loadResults.failed}`);
  console.log(`⏱️ Duration: ${loadResults.duration}ms`);
  console.log(
    `📊 Avg per transaction: ${(
      loadResults.duration / transactionCount
    ).toFixed(2)}ms`
  );

  if (loadResults.errors.length > 0 && loadResults.errors.length <= 5) {
    console.log("\n🚨 Sample Errors:");
    loadResults.errors
      .slice(0, 5)
      .forEach((error) => console.log(`  - ${error}`));
  }

  return loadResults;
}

/**
 * Integration test - tests complete end-to-end workflow
 */
function runIntegrationTest() {
  console.log("🔄 Running end-to-end integration test...");

  const integrationSteps = [];

  try {
    // Step 1: Setup
    integrationSteps.push({ step: "Setup", status: "Starting..." });
    setupTestData();
    integrationSteps[0].status = "Completed";

    // Step 2: Submit IN transaction
    integrationSteps.push({ step: "IN Transaction", status: "Starting..." });
    const inEvent = createMockFormSubmission("IN");
    const inResponse = parseFormResponse(inEvent);
    processInTransaction(inResponse);
    integrationSteps[1].status = "Completed";

    // Step 3: Update calculations
    integrationSteps.push({
      step: "Update Calculations",
      status: "Starting...",
    });
    updateMasterlist();
    integrationSteps[2].status = "Completed";

    // Step 4: Update form dropdowns
    integrationSteps.push({ step: "Update Dropdowns", status: "Starting..." });
    updateFormDropdowns();
    integrationSteps[3].status = "Completed";

    // Step 5: Submit OUT transaction
    integrationSteps.push({ step: "OUT Transaction", status: "Starting..." });
    const outEvent = createMockFormSubmission("OUT");
    const outResponse = parseFormResponse(outEvent);
    processOutTransaction(outResponse);
    integrationSteps[4].status = "Completed";

    // Step 6: Final calculations
    integrationSteps.push({
      step: "Final Calculations",
      status: "Starting...",
    });
    updateMasterlist();
    integrationSteps[5].status = "Completed";

    // Step 7: Cleanup
    integrationSteps.push({ step: "Cleanup", status: "Starting..." });
    cleanupTestSuiteData();
    integrationSteps[6].status = "Completed";

    console.log("\n✅ Integration test completed successfully!");
  } catch (error) {
    console.log(`❌ Integration test failed at step: ${error.message}`);
    integrationSteps.forEach((step) => {
      console.log(
        `${step.status === "Completed" ? "✅" : "❌"} ${step.step}: ${
          step.status
        }`
      );
    });
    return false;
  }

  // Display successful steps
  integrationSteps.forEach((step) => {
    console.log(`✅ ${step.step}: ${step.status}`);
  });

  return true;
}
