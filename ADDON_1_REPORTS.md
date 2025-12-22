# Chemical Inventory System - Reports Add-on (v1.1)

## 📊 Overview

The Reports Add-on provides comprehensive reporting capabilities for your Chemical Inventory Management System. Generate detailed transaction reports and summaries for specific chemicals within custom date ranges.

## 🎯 Features

- **Chemical-Specific Reports**: Focus on individual chemicals
- **Custom Date Ranges**: Analyze any time period
- **Comprehensive Summaries**: IN/OUT transactions with detailed breakdowns
- **Supplier Analysis**: Track which suppliers provide which chemicals
- **Transaction Details**: Complete transaction history with staff, dates, and volumes
- **Professional Formatting**: Clean, printable reports in Google Sheets

## 🚀 Quick Setup

### Prerequisites

- Existing Chemical Inventory Management System (v1.0) working
- Access to Google Apps Script for your project

### Step 1: Add the Reports Script

1. **Open Your Apps Script Project**:

   - Go to your existing Chemical Inventory spreadsheet
   - Extensions → Apps Script

2. **Add New Script File**:

   - Click the "+" next to Files
   - Choose "Script"
   - Name it: `ReportsAddon`
   - Copy and paste the content from `ReportsAddon.gs`

3. **Update Configuration**:

   - In `ReportsAddon.gs`, update the `SPREADSHEET_ID_REPORTS` constant with your spreadsheet ID:

   ```javascript
   const SPREADSHEET_ID_REPORTS = "YOUR_SPREADSHEET_ID_HERE";
   ```

4. **Set Up User Interface Trigger** (Important!):

   **Option A: Create New Trigger (Recommended)**

   - In Apps Script: Triggers → Add Trigger
   - Function: `onEditReports` ← **Must be exactly this!**
   - Event source: From spreadsheet
   - Event type: On edit
   - Save trigger

   **Option B: Add to Existing onEdit Function**
   Add this to your existing `onEdit` function in `Code.gs`:

   ```javascript
   // Add this to your existing onEdit function in Code.gs
   function onEdit(e) {
     try {
       const range = e.range;
       const sheet = range.getSheet();

       // Existing CHEM_LIST sync code
       if (sheet.getName() === SHEET_NAMES.CHEM_LIST) {
         console.log("CHEM_LIST edited - triggering sync...");
         syncChemListWithMasterlist();
         updateMasterlist();
         updateFormDropdowns();
         console.log("Auto-sync completed due to CHEM_LIST edit");
       }

       // NEW: Reports add-on trigger
       if (sheet.getName() === "REPORTS") {
         handleReportTrigger(e);
       }
     } catch (error) {
       console.error("Error in onEdit trigger:", error);
     }
   }
   ```

### Step 2: Initialize the Reports Sheet

1. **Run Setup Function**:

   - In Apps Script, open `ReportsAddon.gs`
   - Run the function: `initializeReportsSheet()`
   - Authorize when prompted

2. **Verify Setup**:

   - Check your spreadsheet - you should now see a "REPORTS" sheet
   - The sheet will have headers and instructions

3. **Test the Trigger**:
   - Run the function: `testReportsSetup()`
   - Check the console for any errors
   - Go to your REPORTS sheet and try typing "GO" in cell C7

**Setup Time: ~2 minutes**

---

## 📋 How to Generate Reports

### ✨ **User-Friendly Interface** (Recommended - No Scripts!)

Generate reports directly from the REPORTS sheet interface:

#### 📱 **Simple 4-Step Process:**

1. **Select Chemical**: Click dropdown in cell B4 → Choose your chemical
2. **Enter Start Date**: Cell B5 → Type: `2025-12-01`
3. **Enter End Date**: Cell B6 → Type: `2025-12-31`
4. **Generate Report**: Click the green **🔍 GENERATE REPORT** button in B7

**The report appears automatically below!** ✨

#### 📋 **Visual Interface:**

```
📊 REPORT GENERATOR
1. Select Chemical:    [Sodium Chloride    ▼]
2. Start Date:         [2025-12-01        ] (YYYY-MM-DD format)
3. End Date:           [2025-12-31        ] (YYYY-MM-DD format)
4. Generate Report:    [🔍 GENERATE REPORT ] ← Click this button!
5. Start New Report:   [🔄 CLEAR FORM     ] ← Click to start over
```

#### 🔄 **Starting a New Report:**

After generating a report, simply click the orange **🔄 CLEAR FORM** button to:
- Clear the chemical selection
- Reset the date fields
- Clear any previous report data
- Show a ready-for-new-report message

#### ⚡ **Quick Shortcuts:**

- **Current Month**: Select chemical, then run `generateCurrentMonthReport()` in Scripts
- **Last 30 Days**: Select chemical, then run `generateLast30DaysReportUI()` in Scripts

### 🔧 **Advanced: Script-Based Generation** (For Power Users)

If you prefer using scripts directly:

```javascript
// See which chemicals have transaction history
getChemicalsWithTransactions();
```

---

## 📊 Report Structure

### Report Sections

1. **Header Information**

   - Chemical name and report period
   - Generation timestamp
   - Chemical properties (type, UOM, safety level)

2. **Summary Statistics**

   - Total transaction counts
   - Volume summaries (IN vs OUT)
   - Supplier breakdowns
   - Net volume change

3. **Detailed Transactions**
   - Complete transaction list
   - Staff member, date, type, volume
   - Supplier/operation type details
   - Batch information and comments

### Sample Report Output

```
REPORT: Sodium Chloride
Period: Mon Dec 01 2025 to Tue Dec 31 2025
Generated: 12/20/2025, 2:30:45 PM

CHEMICAL PROPERTIES
Type: solid
Unit of Measure: g
Safety Level: 750

SUMMARY STATISTICS
Total Transactions: 8
IN Transactions: 5
OUT Transactions: 3

IN TRANSACTIONS BREAKDOWN
Total IN Volume: 5000
From Suppliers: 4000
From Transfers: 1000

SUPPLIER BREAKDOWN
Yana Chemodities: 2500
Belman Laboratories: 1500

OUT TRANSACTIONS BREAKDOWN
Total OUT Volume: 1200
For Preparation: 800
For Transfer: 400

NET VOLUME CHANGE: +3800

DETAILED TRANSACTIONS
Date          Staff  Type  Volume  Details              Supplier/Type      Batch    Location
Dec 05 2025   Kim    IN    1000    2 bottles × 500 each Yana Chemodities  L103     Storage A
Dec 10 2025   Khent  OUT   300     prep operation       prep              L103
...
```

---

## 🔧 Advanced Usage

### Custom Date Ranges

```javascript
// Specific date range (multiple format options)
generateChemicalReport(
  "Acetone",
  new Date(2025, 11, 1),
  new Date(2025, 11, 15)
);
generateChemicalReport("Acetone", "2025-12-01", "2025-12-15");
```

### Multiple Reports

```javascript
// Generate reports for multiple chemicals
const chemicals = ["Sodium Chloride", "Ethanol", "Acetone"];
chemicals.forEach((chemical) => {
  generateChemicalReport(chemical, "2025-12-01", "2025-12-31", false);
  // Note: false parameter prevents clearing sheet between reports
});
```

### Example Workflow

```javascript
function generateWeeklyReports() {
  // Get current week dates
  const today = new Date();
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));

  // Get all chemicals with transactions
  const chemicals = getChemicalsWithTransactions();

  // Generate reports for each
  chemicals.forEach((chemical, index) => {
    generateChemicalReport(chemical, weekStart, weekEnd, index === 0);
    // Only clear sheet for first report
  });
}
```

---

## 📈 Understanding Report Data

### IN Transaction Analysis

**Supplier vs Transfer Classification**:

- **Supplier**: External purchases (supplier ≠ "SMFI")
- **Transfer**: Internal transfers (supplier = "SMFI")

**Supplier Breakdown**: Shows volume received from each external supplier

### OUT Transaction Analysis

**Prep vs Transfer Classification**:

- **Prep**: Chemical used for laboratory preparations
- **Transfer**: Chemical moved to another location/department

### Net Volume Change

**Calculation**: Total IN Volume - Total OUT Volume

- **Positive**: Net increase in inventory
- **Negative**: Net decrease in inventory
- **Zero**: Balanced IN/OUT activity

---

## 🛠️ Troubleshooting

### User Interface Issues

| Issue                         | Solution                                                 |
| ----------------------------- | -------------------------------------------------------- |
| Typing 'GO' does nothing      | Check that edit trigger is set up properly               |
| "No chemicals found" dropdown | Run `refreshChemicalDropdown()` or check CHEM_LIST sheet |
| Dropdown is empty             | Run `setupChemicalDropdown()` in Apps Script             |
| 'GO' button not responsive    | Verify `handleReportTrigger` trigger exists              |
| Error messages persist        | Clear cell C7 manually and try again                     |
| Interface layout broken       | Run `initializeReportsSheet()` to reset                  |

### Common Report Issues

| Issue                             | Solution                                       |
| --------------------------------- | ---------------------------------------------- |
| "REPORTS sheet not found"         | Run `initializeReportsSheet()`                 |
| "Chemical not found in CHEM_LIST" | Verify chemical name spelling (case-sensitive) |
| "Invalid date format"             | Use "YYYY-MM-DD" format (e.g., 2025-12-01)     |
| No transactions shown             | Check date range and chemical name             |
| Script timeout                    | Try smaller date ranges or fewer chemicals     |

### Quick Fixes

**Reset Everything:**

```javascript
// Run these in Apps Script
initializeReportsSheet();
refreshChemicalDropdown();
```

**Fix Dropdown Issues:**

```javascript
refreshChemicalDropdown();
```

**Test Interface:**

```javascript
exampleReportUsage();
```

### Data Requirements

- **Chemical must exist in CHEM_LIST**: Reports can only be generated for chemicals in your chemical list
- **Transactions must exist**: No transactions = empty report
- **Date format**: Use consistent date formats (ISO format recommended)

### Performance Tips

- **Limit date ranges**: Large ranges with many transactions may be slow
- **Clear sheet strategically**: Use `clearSheet=false` when generating multiple reports
- **Check chemical names**: Use `getChemicalsWithTransactions()` to verify available chemicals

---

## 🎨 Customization Options

### Report Formatting

The report automatically formats with:

- **Bold headers** for easy section identification
- **Color coding** for different section types
- **Auto-sized columns** for optimal viewing
- **Frozen headers** for easy scrolling

### Extending Functionality

**Add New Summary Statistics**:

```javascript
// In generateSummary() function, add:
summary.averageTransactionSize = summary.totalInVolume / summary.inTransactions;
summary.mostActiveMonth = getMostActiveMonth(transactions);
```

**Custom Report Layouts**:

```javascript
// Create your own report writing function
function writeCustomReport(reportsSheet, reportData, startRow) {
  // Your custom layout logic here
}
```

---

## 💡 Use Cases

### Laboratory Management

- **Monthly chemical usage reports** for budget planning
- **Supplier performance analysis** for procurement decisions
- **Usage pattern analysis** for safety compliance
- **Inventory trend tracking** for optimal stock levels

### Compliance and Auditing

- **Complete transaction audit trail** for regulatory requirements
- **Usage documentation** for safety inspections
- **Supplier documentation** for quality assurance
- **Batch tracking** for contamination investigations

### Operational Insights

- **Staff usage patterns** for training needs identification
- **Seasonal usage trends** for inventory planning
- **Waste reduction analysis** through prep vs transfer ratios
- **Supply chain optimization** through supplier analysis

---

## 🔄 Integration with Main System

### Seamless Operation

- **No interference**: Reports add-on doesn't modify existing functionality
- **Real-time data**: Reports use current transaction data
- **Consistent formatting**: Follows same conventions as main system
- **Same authorization**: Uses existing Google Apps Script permissions

### Data Sources

- **Form Responses**: Raw transaction data
- **BATCHES**: Processed batch information
- **CHEM_LIST**: Chemical properties and safety levels

### Trigger Independence

Reports are **manually generated** - they don't run automatically. This ensures:

- **No performance impact** on daily operations
- **User control** over when reports are generated
- **Resource efficiency** - only runs when needed

---

## 📚 Function Reference

### Core Functions

| Function                         | Purpose                  | Parameters                               |
| -------------------------------- | ------------------------ | ---------------------------------------- |
| `initializeReportsSheet()`       | Set up REPORTS sheet     | None                                     |
| `generateChemicalReport()`       | Generate detailed report | chemical, startDate, endDate, clearSheet |
| `generateMonthlyReport()`        | Current month report     | chemical                                 |
| `generateLast30DaysReport()`     | Last 30 days report      | chemical                                 |
| `getChemicalsWithTransactions()` | List available chemicals | None                                     |

### Utility Functions

| Function               | Purpose                      |
| ---------------------- | ---------------------------- |
| `clearReportArea()`    | Clear report content area    |
| `collectReportData()`  | Gather transaction data      |
| `generateSummary()`    | Calculate summary statistics |
| `writeReportToSheet()` | Format and write report      |
| `formatReportSheet()`  | Apply formatting             |

---

## 🎯 Best Practices

### Report Generation

1. **Start with date ranges** that you know have data
2. **Use `getChemicalsWithTransactions()`** to see available chemicals first
3. **Generate test reports** with known good data before creating production reports
4. **Save important reports** by copying to another sheet or exporting

### Performance

1. **Limit to 90-day periods** for large datasets
2. **Generate one chemical at a time** for detailed analysis
3. **Use monthly/weekly helpers** for regular reporting
4. **Clear old reports** before generating new ones to save space

### Data Analysis

1. **Compare net changes** across different periods
2. **Analyze supplier patterns** for procurement optimization
3. **Track prep vs transfer ratios** for usage pattern insights
4. **Monitor safety level approaches** through volume tracking

---

## � Troubleshooting

### **Button Not Working**

If clicking the "🔍 GENERATE REPORT" button doesn't generate a report:

#### 1. **Check Trigger Setup**

Run this test function to diagnose:

```javascript
// Run this in Apps Script to test
function testReportsSetup() {
  console.log("=== TESTING REPORTS SETUP ===");

  // Check if REPORTS sheet exists
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reportsSheet = ss.getSheetByName("REPORTS");
  console.log("REPORTS sheet exists:", !!reportsSheet);

  // Check triggers
  const triggers = ScriptApp.getProjectTriggers();
  console.log("Project triggers:", triggers.length);
  triggers.forEach((trigger) => {
    console.log("- Function:", trigger.getHandlerFunction());
    console.log("- Event:", trigger.getEventType());
  });

  // Test manual trigger
  console.log("Testing manual button click...");
  try {
    const mockEvent = {
      range: reportsSheet.getRange(7, 2),
      source: ss
    };
    handleReportTrigger(mockEvent);
    console.log("Manual trigger test completed");
  } catch (error) {
    console.error("Manual trigger failed:", error);
  }
}
```

#### 2. **Common Issues & Fixes**

**Issue**: No trigger set up

- **Fix**: Go to Apps Script → Triggers → Add Trigger
- Function: `onEditReports` (not `handleReportTrigger`)
- Event: On edit

**Issue**: Wrong function in trigger

- **Fix**: Delete old trigger, create new one with `onEditReports`

**Issue**: Typing in wrong cell

- **Fix**: Must type "GO" in cell **C7** (column C, row 7)

**Issue**: Chemical dropdown empty

- **Fix**: Run `refreshChemicalDropdown()` function

#### 3. **Manual Testing**

Test without UI - run this in Apps Script:

```javascript
function testReportGeneration() {
  // Replace with your actual chemical name
  const chemical = "Sodium Chloride";
  const startDate = new Date("2025-12-01");
  const endDate = new Date("2025-12-31");

  console.log("Generating test report for:", chemical);
  const result = generateChemicalReport(chemical, startDate, endDate);
  console.log("Report generated:", !!result);
}
```

### **Empty Chemical Dropdown**

If the chemical dropdown in B4 is empty:

1. **Check Data**: Run `getChemicalsWithTransactions()`
2. **Refresh**: Run `refreshChemicalDropdown()`
3. **Verify**: Check if you have transaction data in your Form Responses sheet

### **Report Shows "No Data"**

If the report generates but shows no transactions:

1. **Check Date Range**: Ensure your dates cover actual transaction periods
2. **Verify Chemical Name**: Must match exactly (case-sensitive)
3. **Check Raw Data**: Look at Form Responses sheet for actual data

### **Permission Errors**

If you get authorization errors:

1. Re-run `initializeReportsSheet()` and authorize all permissions
2. Check that your script has access to the spreadsheet
3. Verify the `SPREADSHEET_ID_REPORTS` matches your actual spreadsheet ID

---

## �🚀 Getting Started Checklist

- [ ] Added `ReportsAddon.gs` to your Apps Script project
- [ ] Updated `SPREADSHEET_ID_REPORTS` constant
- [ ] Run `initializeReportsSheet()` successfully
- [ ] REPORTS sheet appears in your spreadsheet
- [ ] Run `getChemicalsWithTransactions()` to see available data
- [ ] Generate test report with `generateLast30DaysReport("ChemicalName")`
- [ ] Verify report appears in REPORTS sheet with proper formatting
- [ ] Ready to generate production reports! 🎉

**Welcome to enhanced chemical inventory reporting!**

---

_This add-on extends the Chemical Inventory Management System v1.0 without affecting existing functionality. For main system documentation, see README.md and QUICK_START.md._
