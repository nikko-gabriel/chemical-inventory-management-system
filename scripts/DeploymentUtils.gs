/**
 * Deployment Configuration and System Utilities
 * Helper functions for system deployment, maintenance, and monitoring
 */

// Deployment Configuration
const DEPLOYMENT_CONFIG = {
  version: "1.0.0",
  deploymentDate: "2024-12-15",
  environment: "production", // 'development', 'staging', 'production'

  // System IDs (UPDATE THESE FOR YOUR DEPLOYMENT)
  spreadsheetId: "1PH0WfiewO5pxwI50SpmEqSj5EqTU2G9T0LA6SmL-ir4",
  formId: "18xl0TYI9pfV9IzuNfDxuT-cEf0KUFfTuNBf9HWUnxfY",

  // System Settings
  settings: {
    autoUpdateInterval: 6, // hours
    maxBatchAge: 365, // days
    criticalInventoryAlert: true,
    logLevel: "INFO", // 'DEBUG', 'INFO', 'WARN', 'ERROR'
    enablePerformanceLogging: true,
  },

  // Feature Flags
  features: {
    enableBatchExpirationAlerts: true,
    enableAutomaticReordering: false,
    enableAdvancedReporting: true,
    enableDataExport: true,
  },
};

/**
 * One-click deployment function
 * Run this function to deploy the complete system
 */
function deployChemicalInventorySystem() {
  console.log("🚀 Starting Chemical Inventory System Deployment...");
  console.log(`📦 Version: ${DEPLOYMENT_CONFIG.version}`);
  console.log(`🌍 Environment: ${DEPLOYMENT_CONFIG.environment}`);
  console.log("================================================");

  const deploymentLog = {
    startTime: new Date(),
    steps: [],
    errors: [],
    warnings: [],
  };

  try {
    // Step 1: System Pre-checks
    addDeploymentStep(deploymentLog, "System Pre-checks", () => {
      validateDeploymentEnvironment();
    });

    // Step 2: Initialize Sheets
    addDeploymentStep(deploymentLog, "Initialize Sheets", () => {
      initializeAllSheets();
    });

    // Step 3: Create Form
    addDeploymentStep(deploymentLog, "Create Form", () => {
      createChemicalInventoryForm();
    });

    // Note: Triggers must be set up manually
    deploymentLog.steps.push({
      step: "Setup Triggers",
      status: "MANUAL",
      message:
        "Triggers must be set up manually. See QUICK_START.md for instructions.",
      timestamp: new Date(),
    });

    // Step 4: Update Dropdowns
    addDeploymentStep(deploymentLog, "Update Dropdowns", () => {
      updateAllFormDropdowns();
    });

    // Step 5: Run Tests
    addDeploymentStep(deploymentLog, "Run Tests", () => {
      const testResults = runAllTests();
      if (testResults.failed > 0) {
        throw new Error(`${testResults.failed} tests failed`);
      }
    });

    // Step 7: Final Configuration
    addDeploymentStep(deploymentLog, "Final Configuration", () => {
      setupSystemConfiguration();
    });

    // Deployment Summary
    const duration = new Date() - deploymentLog.startTime;
    console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("========================");
    console.log(`⏱️ Total time: ${duration}ms`);
    console.log(`✅ Steps completed: ${deploymentLog.steps.length}`);
    console.log(`⚠️ Warnings: ${deploymentLog.warnings.length}`);

    if (deploymentLog.warnings.length > 0) {
      console.log("\n⚠️ Deployment Warnings:");
      deploymentLog.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }

    console.log("\n📋 Next Steps:");
    console.log("1. Share form with lab staff");
    console.log("2. Train users on system usage");
    console.log("3. Set up regular monitoring");
    console.log("4. Schedule periodic system health checks");

    return {
      success: true,
      duration: duration,
      steps: deploymentLog.steps,
      warnings: deploymentLog.warnings,
    };
  } catch (error) {
    console.error("❌ DEPLOYMENT FAILED!");
    console.error("Error:", error.message);

    deploymentLog.errors.push({
      step: "Deployment",
      error: error.message,
      timestamp: new Date(),
    });

    return {
      success: false,
      error: error.message,
      steps: deploymentLog.steps,
      errors: deploymentLog.errors,
    };
  }
}

/**
 * Helper function to add deployment steps
 */
function addDeploymentStep(log, stepName, stepFunction) {
  console.log(`🔧 ${stepName}...`);

  try {
    const stepStart = new Date();
    stepFunction();
    const stepDuration = new Date() - stepStart;

    log.steps.push({
      name: stepName,
      status: "completed",
      duration: stepDuration,
      timestamp: new Date(),
    });

    console.log(`✅ ${stepName} completed (${stepDuration}ms)`);
  } catch (error) {
    log.steps.push({
      name: stepName,
      status: "failed",
      error: error.message,
      timestamp: new Date(),
    });

    throw new Error(`${stepName} failed: ${error.message}`);
  }
}

/**
 * Validates deployment environment
 */
function validateDeploymentEnvironment() {
  // Check spreadsheet access
  try {
    const ss = SpreadsheetApp.openById(DEPLOYMENT_CONFIG.spreadsheetId);
    if (!ss) throw new Error("Cannot access spreadsheet");
  } catch (error) {
    throw new Error("Spreadsheet access failed - check SPREADSHEET_ID");
  }

  // Check form access
  try {
    const form = FormApp.openById(DEPLOYMENT_CONFIG.formId);
    if (!form) throw new Error("Cannot access form");
  } catch (error) {
    throw new Error("Form access failed - check FORM_ID");
  }

  console.log("✅ Environment validation passed");
}

/**
 * Sets up system configuration
 */
function setupSystemConfiguration() {
  // Create system configuration sheet for monitoring
  const ss = SpreadsheetApp.openById(DEPLOYMENT_CONFIG.spreadsheetId);

  let configSheet = ss.getSheetByName("SYSTEM_CONFIG");
  if (!configSheet) {
    configSheet = ss.insertSheet("SYSTEM_CONFIG");
  }

  // Clear and set up configuration
  configSheet.clear();

  const configData = [
    ["Configuration Item", "Value", "Last Updated"],
    ["System Version", DEPLOYMENT_CONFIG.version, new Date()],
    ["Environment", DEPLOYMENT_CONFIG.environment, new Date()],
    [
      "Auto Update Interval (hours)",
      DEPLOYMENT_CONFIG.settings.autoUpdateInterval,
      new Date(),
    ],
    [
      "Max Batch Age (days)",
      DEPLOYMENT_CONFIG.settings.maxBatchAge,
      new Date(),
    ],
    [
      "Critical Alerts Enabled",
      DEPLOYMENT_CONFIG.settings.criticalInventoryAlert,
      new Date(),
    ],
    ["Form ID", DEPLOYMENT_CONFIG.formId, new Date()],
    ["Spreadsheet ID", DEPLOYMENT_CONFIG.spreadsheetId, new Date()],
    ["Last Health Check", "", ""],
    ["Last Maintenance", "", ""],
  ];

  configSheet.getRange(1, 1, configData.length, 3).setValues(configData);

  // Format headers
  const headerRange = configSheet.getRange(1, 1, 1, 3);
  headerRange.setBackground("#4285F4");
  headerRange.setFontColor("white");
  headerRange.setFontWeight("bold");

  console.log("✅ System configuration created");
}

/**
 * System monitoring and maintenance functions
 */
class SystemMonitor {
  /**
   * Comprehensive system status check
   */
  static getSystemStatus() {
    const status = {
      timestamp: new Date(),
      version: DEPLOYMENT_CONFIG.version,
      environment: DEPLOYMENT_CONFIG.environment,
      components: {},
      metrics: {},
      alerts: [],
    };

    // Component Health Checks
    status.components.spreadsheet = this.checkSpreadsheetHealth();
    status.components.form = this.checkFormHealth();
    status.components.triggers = this.checkTriggerHealth();
    status.components.data = this.checkDataIntegrity();

    // System Metrics
    status.metrics = this.gatherSystemMetrics();

    // System Alerts
    status.alerts = this.checkSystemAlerts();

    // Overall Health
    const unhealthyComponents = Object.values(status.components).filter(
      (comp) => comp.status !== "healthy"
    ).length;

    status.overallHealth =
      unhealthyComponents === 0
        ? "healthy"
        : unhealthyComponents <= 2
        ? "warning"
        : "critical";

    return status;
  }

  /**
   * Check spreadsheet health
   */
  static checkSpreadsheetHealth() {
    try {
      const ss = SpreadsheetApp.openById(DEPLOYMENT_CONFIG.spreadsheetId);
      const sheets = ss.getSheets();
      const requiredSheets = [
        "Form Responses",
        "STAFF_LIST",
        "CHEM_LIST",
        "SUPPLIER_BRANDS",
        "LOC_LIST",
        "BATCHES",
        "MASTERLIST",
      ];

      const missingSheets = requiredSheets.filter(
        (name) => !sheets.some((sheet) => sheet.getName() === name)
      );

      return {
        status: missingSheets.length === 0 ? "healthy" : "critical",
        message:
          missingSheets.length === 0
            ? "All required sheets present"
            : `Missing sheets: ${missingSheets.join(", ")}`,
        lastCheck: new Date(),
      };
    } catch (error) {
      return {
        status: "critical",
        message: `Spreadsheet access failed: ${error.message}`,
        lastCheck: new Date(),
      };
    }
  }

  /**
   * Check form health
   */
  static checkFormHealth() {
    try {
      const form = FormApp.openById(DEPLOYMENT_CONFIG.formId);
      const items = form.getItems();

      const requiredItems = [
        "Transaction Date",
        "Staff Name",
        "Chemical Name",
        "Transaction Type",
      ];
      const missingItems = requiredItems.filter(
        (title) => !items.some((item) => item.getTitle().includes(title))
      );

      return {
        status: missingItems.length === 0 ? "healthy" : "warning",
        message:
          missingItems.length === 0
            ? "Form structure complete"
            : `Missing form items: ${missingItems.join(", ")}`,
        lastCheck: new Date(),
      };
    } catch (error) {
      return {
        status: "critical",
        message: `Form access failed: ${error.message}`,
        lastCheck: new Date(),
      };
    }
  }

  /**
   * Check trigger health
   */
  static checkTriggerHealth() {
    try {
      const triggers = ScriptApp.getProjectTriggers();

      const hasFormTrigger = triggers.some(
        (trigger) => trigger.getHandlerFunction() === "onFormSubmit"
      );

      const hasTimedTrigger = triggers.some(
        (trigger) => trigger.getHandlerFunction() === "timedUpdateDropdowns"
      );

      let status = "healthy";
      let message = "All triggers active";

      if (!hasFormTrigger || !hasTimedTrigger) {
        status = "warning";
        message = "Some triggers missing - run setupTriggers()";
      }

      return {
        status: status,
        message: message,
        triggerCount: triggers.length,
        lastCheck: new Date(),
      };
    } catch (error) {
      return {
        status: "critical",
        message: `Trigger check failed: ${error.message}`,
        lastCheck: new Date(),
      };
    }
  }

  /**
   * Check data integrity
   */
  static checkDataIntegrity() {
    try {
      const ss = SpreadsheetApp.openById(DEPLOYMENT_CONFIG.spreadsheetId);
      const issues = [];

      // Check for orphaned data
      const batchesSheet = ss.getSheetByName("BATCHES");
      const chemListSheet = ss.getSheetByName("CHEM_LIST");

      if (batchesSheet && chemListSheet) {
        const batchesData = batchesSheet.getDataRange().getValues();
        const validChems = chemListSheet
          .getDataRange()
          .getValues()
          .slice(1)
          .map((row) => row[0]);

        for (let i = 1; i < batchesData.length; i++) {
          const chemName = batchesData[i][2];
          if (chemName && !validChems.includes(chemName)) {
            issues.push(`Unknown chemical in BATCHES: ${chemName}`);
          }

          const endingVol = batchesData[i][13];
          if (endingVol < 0) {
            issues.push(`Negative volume in batch: ${batchesData[i][1]}`);
          }
        }
      }

      return {
        status: issues.length === 0 ? "healthy" : "warning",
        message:
          issues.length === 0
            ? "Data integrity check passed"
            : `${issues.length} issues found`,
        issues: issues,
        lastCheck: new Date(),
      };
    } catch (error) {
      return {
        status: "critical",
        message: `Data integrity check failed: ${error.message}`,
        lastCheck: new Date(),
      };
    }
  }

  /**
   * Gather system metrics
   */
  static gatherSystemMetrics() {
    try {
      const ss = SpreadsheetApp.openById(DEPLOYMENT_CONFIG.spreadsheetId);

      const metrics = {
        lastUpdated: new Date(),
      };

      // Count records in each sheet
      const sheets = [
        "Form Responses",
        "BATCHES",
        "MASTERLIST",
        "STAFF_LIST",
        "CHEM_LIST",
      ];
      sheets.forEach((sheetName) => {
        const sheet = ss.getSheetByName(sheetName);
        if (sheet) {
          metrics[`${sheetName.toLowerCase().replace(" ", "_")}_records`] =
            Math.max(0, sheet.getLastRow() - 1); // Subtract header
        }
      });

      // Calculate inventory metrics
      const masterlistSheet = ss.getSheetByName("MASTERLIST");
      if (masterlistSheet && masterlistSheet.getLastRow() > 1) {
        const data = masterlistSheet.getDataRange().getValues();
        let criticalCount = 0;
        let totalChemicals = data.length - 1; // Exclude header

        for (let i = 1; i < data.length; i++) {
          if (data[i][9] === "CRITICAL") {
            // Status column
            criticalCount++;
          }
        }

        metrics.critical_chemicals = criticalCount;
        metrics.total_chemicals = totalChemicals;
        metrics.critical_percentage =
          totalChemicals > 0
            ? ((criticalCount / totalChemicals) * 100).toFixed(1)
            : 0;
      }

      return metrics;
    } catch (error) {
      return {
        error: error.message,
        lastUpdated: new Date(),
      };
    }
  }

  /**
   * Check for system alerts
   */
  static checkSystemAlerts() {
    const alerts = [];

    try {
      const ss = SpreadsheetApp.openById(DEPLOYMENT_CONFIG.spreadsheetId);

      // Check for critical inventory levels
      const masterlistSheet = ss.getSheetByName("MASTERLIST");
      if (masterlistSheet) {
        const data = masterlistSheet.getDataRange().getValues();

        for (let i = 1; i < data.length; i++) {
          if (data[i][9] === "CRITICAL") {
            // Status column
            alerts.push({
              type: "inventory_critical",
              message: `Critical inventory: ${data[i][0]}`, // Chemical name
              severity: "high",
              timestamp: new Date(),
            });
          }
        }
      }

      // Check for expiring batches (within 30 days)
      const batchesSheet = ss.getSheetByName("BATCHES");
      if (batchesSheet) {
        const data = batchesSheet.getDataRange().getValues();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        for (let i = 1; i < data.length; i++) {
          const expDate = new Date(data[i][10]); // Expiration date
          const endingVol = data[i][13]; // Ending volume

          if (expDate <= thirtyDaysFromNow && endingVol > 0) {
            alerts.push({
              type: "batch_expiring",
              message: `Batch ${data[i][1]} expires ${
                expDate.toISOString().split("T")[0]
              }`,
              severity: "medium",
              timestamp: new Date(),
            });
          }
        }
      }
    } catch (error) {
      alerts.push({
        type: "system_error",
        message: `Alert check failed: ${error.message}`,
        severity: "high",
        timestamp: new Date(),
      });
    }

    return alerts;
  }
}

/**
 * Maintenance functions
 */
class SystemMaintenance {
  /**
   * Performs routine maintenance tasks
   */
  static performRoutineMaintenance() {
    console.log("🔧 Performing routine system maintenance...");

    const maintenanceLog = {
      startTime: new Date(),
      tasks: [],
      errors: [],
    };

    try {
      // Task 1: Update dropdowns
      this.addMaintenanceTask(maintenanceLog, "Update Form Dropdowns", () => {
        updateAllFormDropdowns();
      });

      // Task 2: Sync CHEM_LIST with MASTERLIST
      this.addMaintenanceTask(
        maintenanceLog,
        "Sync CHEM_LIST with MASTERLIST",
        () => {
          syncChemListWithMasterlist();
        }
      );

      // Task 3: Recalculate masterlist
      this.addMaintenanceTask(maintenanceLog, "Recalculate Masterlist", () => {
        updateMasterlist();
      });

      // Task 4: Clean up old data (if enabled)
      this.addMaintenanceTask(maintenanceLog, "Data Cleanup", () => {
        this.cleanupOldData();
      });

      // Task 5: Update system metrics
      this.addMaintenanceTask(maintenanceLog, "Update System Metrics", () => {
        const status = SystemMonitor.getSystemStatus();
        this.logSystemMetrics(status);
      });

      const duration = new Date() - maintenanceLog.startTime;
      console.log(`✅ Routine maintenance completed in ${duration}ms`);

      return {
        success: true,
        duration: duration,
        tasksCompleted: maintenanceLog.tasks.length,
        errors: maintenanceLog.errors,
      };
    } catch (error) {
      console.error("❌ Maintenance failed:", error.message);
      return {
        success: false,
        error: error.message,
        errors: maintenanceLog.errors,
      };
    }
  }

  /**
   * Helper function for maintenance tasks
   */
  static addMaintenanceTask(log, taskName, taskFunction) {
    console.log(`  🔧 ${taskName}...`);

    try {
      const taskStart = new Date();
      taskFunction();
      const taskDuration = new Date() - taskStart;

      log.tasks.push({
        name: taskName,
        status: "completed",
        duration: taskDuration,
      });

      console.log(`    ✅ ${taskName} completed (${taskDuration}ms)`);
    } catch (error) {
      log.errors.push({
        task: taskName,
        error: error.message,
      });

      console.log(`    ❌ ${taskName} failed: ${error.message}`);
    }
  }

  /**
   * Cleanup old data based on retention policies
   */
  static cleanupOldData() {
    // This is a placeholder for data cleanup logic
    // Implement based on your retention requirements
    console.log(
      "  📝 Data cleanup policies not implemented - manual review required"
    );
  }

  /**
   * Log system metrics for monitoring
   */
  static logSystemMetrics(status) {
    const ss = SpreadsheetApp.openById(DEPLOYMENT_CONFIG.spreadsheetId);

    let metricsSheet = ss.getSheetByName("SYSTEM_METRICS");
    if (!metricsSheet) {
      metricsSheet = ss.insertSheet("SYSTEM_METRICS");

      // Add headers
      const headers = [
        "Timestamp",
        "Overall Health",
        "Critical Chemicals",
        "Total Chemicals",
        "Critical %",
        "Form Records",
        "Batch Records",
        "Alerts Count",
      ];

      metricsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      metricsSheet.getRange(1, 1, 1, headers.length).setBackground("#4285F4");
      metricsSheet.getRange(1, 1, 1, headers.length).setFontColor("white");
      metricsSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    }

    // Add current metrics
    const metricsRow = [
      new Date(),
      status.overallHealth,
      status.metrics.critical_chemicals || 0,
      status.metrics.total_chemicals || 0,
      status.metrics.critical_percentage || 0,
      status.metrics.form_responses_records || 0,
      status.metrics.batches_records || 0,
      status.alerts.length,
    ];

    metricsSheet.appendRow(metricsRow);
  }
}

/**
 * Schedule maintenance tasks
 */
function scheduleMaintenanceTasks() {
  // Delete existing maintenance triggers
  const existingTriggers = ScriptApp.getProjectTriggers().filter(
    (trigger) => trigger.getHandlerFunction() === "performScheduledMaintenance"
  );

  existingTriggers.forEach((trigger) => ScriptApp.deleteTrigger(trigger));

  // Set up daily maintenance trigger
  ScriptApp.newTrigger("performScheduledMaintenance")
    .timeBased()
    .everyDays(1)
    .atHour(2) // 2 AM
    .create();

  console.log("✅ Maintenance tasks scheduled for daily execution at 2 AM");
}

/**
 * Scheduled maintenance function (called by trigger)
 */
function performScheduledMaintenance() {
  SystemMaintenance.performRoutineMaintenance();
}

/**
 * Get deployment info
 */
function getDeploymentInfo() {
  return {
    ...DEPLOYMENT_CONFIG,
    systemStatus: SystemMonitor.getSystemStatus(),
    lastMaintenance: getLastMaintenanceTime(),
    uptime: calculateSystemUptime(),
  };
}

/**
 * Helper functions
 */
function getLastMaintenanceTime() {
  // Implementation to track last maintenance time
  return new Date(); // Placeholder
}

function calculateSystemUptime() {
  // Implementation to calculate system uptime
  return { days: 0, hours: 0, minutes: 0 }; // Placeholder
}
