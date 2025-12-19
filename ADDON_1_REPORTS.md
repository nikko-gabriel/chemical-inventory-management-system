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

### Step 2: Initialize the Reports Sheet

1. **Run Setup Function**:
   - In Apps Script, open `ReportsAddon.gs`
   - Run the function: `initializeReportsSheet()`
   - Authorize when prompted

2. **Verify Setup**:
   - Check your spreadsheet - you should now see a "REPORTS" sheet
   - The sheet will have headers and instructions

**Setup Time: ~2 minutes**

---

## 📋 How to Generate Reports

### Basic Report Generation

**Function**: `generateChemicalReport(chemicalName, startDate, endDate)`

**Example**:
```javascript
// Generate report for Sodium Chloride from Dec 1-31, 2025
generateChemicalReport("Sodium Chloride", "2025-12-01", "2025-12-31");
```

### Quick Report Functions

**Monthly Report**:
```javascript
// Current month report for specified chemical
generateMonthlyReport("Ethanol");
```

**Last 30 Days**:
```javascript
// Last 30 days report for specified chemical  
generateLast30DaysReport("Acetone");
```

### Getting Available Chemicals

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
generateChemicalReport("Acetone", new Date(2025, 11, 1), new Date(2025, 11, 15));
generateChemicalReport("Acetone", "2025-12-01", "2025-12-15");
```

### Multiple Reports

```javascript
// Generate reports for multiple chemicals
const chemicals = ["Sodium Chloride", "Ethanol", "Acetone"];
chemicals.forEach(chemical => {
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

### Common Issues

| Issue | Solution |
|-------|----------|
| "REPORTS sheet not found" | Run `initializeReportsSheet()` |
| "Chemical not found in CHEM_LIST" | Verify chemical name spelling (case-sensitive) |  
| "Invalid date format" | Use "YYYY-MM-DD" format or Date objects |
| No transactions shown | Check date range and chemical name |
| Script timeout | Try smaller date ranges or fewer chemicals |

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

| Function | Purpose | Parameters |
|----------|---------|------------|
| `initializeReportsSheet()` | Set up REPORTS sheet | None |
| `generateChemicalReport()` | Generate detailed report | chemical, startDate, endDate, clearSheet |
| `generateMonthlyReport()` | Current month report | chemical |
| `generateLast30DaysReport()` | Last 30 days report | chemical |
| `getChemicalsWithTransactions()` | List available chemicals | None |

### Utility Functions

| Function | Purpose |
|----------|---------|  
| `clearReportArea()` | Clear report content area |
| `collectReportData()` | Gather transaction data |
| `generateSummary()` | Calculate summary statistics |
| `writeReportToSheet()` | Format and write report |
| `formatReportSheet()` | Apply formatting |

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

## 🚀 Getting Started Checklist

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

*This add-on extends the Chemical Inventory Management System v1.0 without affecting existing functionality. For main system documentation, see README.md and QUICK_START.md.*