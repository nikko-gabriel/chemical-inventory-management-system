# Chemical Inventory Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4.svg?logo=google&logoColor=white)](https://script.google.com/)
[![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853.svg?logo=google-sheets&logoColor=white)](https://sheets.google.com/)

A comprehensive Google Sheets and Google Forms-based solution for managing chemical inventory transactions with automated processing and real-time updates.

## Quick Start

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/chemical-inventory-management-system.git
   cd chemical-inventory-management-system
   ```

2. **Follow the setup guide:** See [QUICK_START.md](QUICK_START.md) for detailed setup instructions

3. **Deploy to Google Apps Script:** Copy the scripts from the `scripts/` folder to your Google Apps Script project

## Table of Contents

1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Setup Instructions](#setup-instructions)
4. [System Architecture](#system-architecture)
5. [Usage Guide](#usage-guide)
6. [Testing Procedures](#testing-procedures)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance](#maintenance)
9. [Security Considerations](#security-considerations)

## System Overview

The Chemical Inventory Management System automates the tracking of chemical inventory using:

- **Google Forms** for data entry (IN/OUT transactions)
- **Google Sheets** for data storage and calculations
- **Google Apps Script** for automation and business logic
- **Automated dropdowns** that update based on current inventory
- **Real-time calculations** for inventory levels and status alerts

### Key Features

- ✅ Automated inventory tracking (IN/OUT transactions)
- ✅ **Enhanced Batch/lot number management** with support for all formats (numeric, alphanumeric, special characters)
- ✅ **Robust Type Handling** - Fixed Google Sheets number vs string comparison issues
- ✅ Dynamic form dropdowns based on current data
- ✅ Automatic safety level monitoring with CRITICAL alerts
- ✅ Real-time masterlist calculations
- ✅ **Comprehensive Data Validation** with debug-friendly error reporting
- ✅ Supplier and brand management
- ✅ Location-based storage tracking
- ✅ **Professional Reports Add-on** with drawing button interface

## Prerequisites

Before setting up the system, ensure you have:

1. **Google Account** with access to:
   - Google Sheets
   - Google Forms
   - Google Apps Script
2. **Permissions** to:

   - Create and edit Google Sheets
   - Create and edit Google Forms
   - Run Google Apps Scripts
   - Set up triggers

3. **Data Preparation**:
   - List of staff members (chemists)
   - List of chemicals with properties
   - List of suppliers and brands
   - List of storage locations

## Setup Instructions

### Step 1: Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named **"Chem Inventory"**
3. Note the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
4. Replace the SPREADSHEET_ID in all script files with your actual ID

### Step 2: Set Up Google Apps Script

1. In your Google Spreadsheet, go to **Extensions > Apps Script**
2. Delete the default `Code.gs` file
3. Create the following script files by copying from the `scripts/` folder:

#### File 1: Code.gs

```javascript
// Copy the entire content from scripts/Code.gs
```

#### File 2: SheetInitializer.gs

```javascript
// Copy the entire content from scripts/SheetInitializer.gs
```

#### File 3: FormManager.gs

```javascript
// Copy the entire content from scripts/FormManager.gs
```

#### File 4: DataProcessingUtils.gs

```javascript
// Copy the entire content from scripts/DataProcessingUtils.gs
```

### Step 3: Update Configuration

1. In each script file, update these constants with your actual IDs:
   ```javascript
   const FORM_ID = "YOUR_FORM_ID_HERE";
   const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";
   ```

### Step 4: Initialize Sheets

1. In Google Apps Script, run the function: `initializeAllSheets()`
2. Authorize the script when prompted
3. This will create all required sheets with proper structure and initial data

### Step 5: Create Google Form

1. Go to [Google Forms](https://forms.google.com)
2. Create a new form named **"Chemical Inventory Transaction Form"**
3. Note the Form ID from the URL:
   ```
   https://docs.google.com/forms/d/[FORM_ID]/edit
   ```
4. Update the FORM_ID in all script files

### Step 6: Set Up Form Structure

1. In Google Apps Script, run the function: `createChemicalInventoryForm()`
2. This will create the complete form structure with conditional logic

### Step 7: Set Up Triggers

**Important**: Triggers must be set up manually in the Apps Script interface:

1. **Go to Apps Script → Triggers** (left sidebar)
2. **Add Form Submit Trigger**:

   - Click "+ Add Trigger"
   - Function: `onFormSubmit`
   - Event source: From spreadsheet
   - Event type: On form submit
   - Save trigger

3. **Add Timed Update Trigger**:

   - Click "+ Add Trigger"
   - Function: `timedUpdateDropdowns`
   - Event source: Time-driven
   - Type: Hours timer, Every 6 hours
   - Save trigger

4. **Add Auto-Sync Trigger**:
   - Click "+ Add Trigger"
   - Function: `onEdit`
   - Event source: From spreadsheet
   - Event type: On edit
   - Save trigger

**Result**:

- Automatic form processing
- Scheduled dropdown updates (every 6 hours)
- Instant CHEM_LIST to MASTERLIST sync when chemicals are added

### Step 8: Initial Data Population

1. Manually populate the following sheets with your data:

#### STAFF_LIST

```
chemist_id | chemist_name
1          | Kim
2          | Khent
3          | Nikko
```

#### CHEM_LIST

```
chem_name              | liq_sol | UOM | safety_lvl
Sodium Chloride        | solid   | g   | 750
Ethanol               | liquid  | mL  | 1800
Ammonium metavanadate | solid   | g   | 3
```

#### SUPPLIER_BRANDS

```
supplier                    | brand_name
Yana Chemodities           | Sigma Aldrich
Belman Laboratories        | Merck
Cebu Far Eastern Drug, Inc.| RCI Labscan
```

#### LOC_LIST

```
location
Chemical Storage Room A
Chemical Storage Room B
Chemical Storage Room C
```

### Step 9: Update Form Dropdowns

1. Run the function: `updateAllFormDropdowns()`
2. This will populate all form dropdowns with current data

### Step 10: Test the System

1. Open your Google Form
2. Submit a test IN transaction
3. Verify data appears in sheets correctly
4. Submit a test OUT transaction
5. Verify calculations are correct

## System Architecture

### Data Flow

```
Google Form Submission
        ↓
Form Response Processing (Apps Script)
        ↓
Data Validation & Business Logic
        ↓
Update BATCHES Sheet
        ↓
Update MASTERLIST Calculations
        ↓
Update Form Dropdowns
```

### Sheet Structure

#### Form Responses

- **Purpose**: Stores raw form submission data
- **Updates**: Automatically by Google Forms
- **Key Fields**: Transaction details, timestamps

#### STAFF_LIST

- **Purpose**: Manages staff/chemist information
- **Updates**: Manual by users
- **Key Fields**: chemist_id, chemist_name

#### CHEM_LIST

- **Purpose**: Chemical master data with properties
- **Updates**: Manual by users
- **Key Fields**: chem_name, liq_sol, UOM, safety_lvl

#### SUPPLIER_BRANDS

- **Purpose**: Supplier and brand combinations
- **Updates**: Manual by users
- **Key Fields**: supplier, brand_name

#### LOC_LIST

- **Purpose**: Storage location master data
- **Updates**: Manual by users
- **Key Fields**: location

#### BATCHES

- **Purpose**: Individual batch tracking with volumes
- **Updates**: Automatic via Apps Script
- **Key Fields**: batch_num, chem_name, vol_total, ending_vol, exp_date

#### MASTERLIST

- **Purpose**: Aggregated inventory levels and status
- **Updates**: Transaction totals via Apps Script, current_total & status via formulas
- **Manual Fields**: beginning_inv (user editable)
- **Formula Fields**: current_total, status (auto-update)
- **Key Fields**: chem_name, current_total, status

## Usage Guide

### Recording IN Transactions

1. Open the Chemical Inventory Transaction Form
2. Fill in basic information:
   - Transaction Date
   - Staff Name
   - Chemical Name
   - Transaction Type: **IN**
3. Complete IN transaction details:
   - Supplier
   - Brand
   - Batch/Lot Number
   - Number of Bottles
   - Volume/Weight per Bottle
   - Expiration Date
   - Storage Location
4. Submit the form

**Result**: New batch added to BATCHES, MASTERLIST updated automatically

### Recording OUT Transactions

1. Open the Chemical Inventory Transaction Form
2. Fill in basic information:
   - Transaction Date
   - Staff Name
   - Chemical Name
   - Transaction Type: **OUT**
3. Complete OUT transaction details:
   - Out Type: prep or transfer
   - Select Batch/Lot Number (from available batches)
   - Total Volume/Weight Out
   - Optional comment
4. Submit the form

**Result**: Selected batch volume reduced, MASTERLIST updated automatically

### Monitoring Inventory Status

1. Open the **MASTERLIST** sheet
2. Check the **status** column:
   - **OK**: Inventory above safety level
   - **CRITICAL**: Inventory at or below safety level
3. Review **current_total** for actual quantities
4. Monitor expiration dates in **BATCHES** sheet

### Adding New Chemicals

1. **Add to CHEM_LIST Sheet**:

   - chem_name: Full chemical name
   - liq_sol: "liquid" or "solid"
   - UOM: Unit of measurement (mL, g, etc.)
   - safety_lvl: Minimum safe quantity

2. **Sync with MASTERLIST** (Choose one option):

   **Option A: Automatic Sync (Recommended)**

   - New chemicals automatically added to MASTERLIST:
     - **Instantly** when you edit CHEM_LIST (requires `onEdit` trigger)
     - During form submissions (if chemical is used in transaction)
     - During scheduled updates (every 6 hours via `timedUpdateDropdowns()`)

   **Option B: Manual Sync (Immediate)**

   ```javascript
   // Run in Apps Script → Code.gs
   manualSyncChemicals();
   ```

3. **Verify Results**:
   - Check MASTERLIST for new chemical row
   - Set beginning inventory manually in MASTERLIST if needed (current_total & status auto-update)
   - New chemical appears in form dropdown

**Important**: Always sync chemicals after adding to CHEM_LIST to ensure form dropdowns and MASTERLIST are updated correctly.

## Testing Procedures

### Pre-Deployment Testing

#### Test 1: Sheet Structure Verification

```javascript
// Run in Apps Script
verifySheetStructure();
```

**Expected Result**: All required sheets exist with correct headers

#### Test 2: Form Creation

```javascript
// Run in Apps Script
createChemicalInventoryForm();
```

**Expected Result**: Form created with all sections and conditional logic

#### Test 3: Sample IN Transaction

1. Submit form with test data:
   - Chemical: Sodium Chloride
   - Transaction: IN
   - Batch: TEST001
   - Quantity: 5 bottles × 500g
2. **Expected Results**:
   - New row in BATCHES
   - MASTERLIST updated
   - Form dropdowns refreshed

#### Test 4: Sample OUT Transaction

1. Submit form with test data:
   - Chemical: Sodium Chloride
   - Transaction: OUT
   - Selected batch from dropdown
   - Out volume: 1000g
2. **Expected Results**:
   - BATCHES ending_vol reduced
   - MASTERLIST current_total updated
   - Batch dropdown updated

#### Test 5: Data Validation

1. Submit form with invalid data:
   - Negative quantities
   - Missing required fields
   - OUT volume exceeding available
2. **Expected Results**:
   - Appropriate error messages
   - Data integrity maintained

### Post-Deployment Monitoring

#### Daily Checks

- [ ] Form submissions processing correctly
- [ ] MASTERLIST calculations accurate
- [ ] No CRITICAL status items overlooked
- [ ] Form dropdowns up to date

#### Weekly Checks

- [ ] Batch expiration dates reviewed
- [ ] System health check passed
- [ ] Backup data verified
- [ ] User feedback collected

#### Monthly Checks

- [ ] Performance optimization review
- [ ] Security audit completed
- [ ] System documentation updated
- [ ] User training refresher

## Troubleshooting

### Common Issues

#### Issue: Form Not Submitting

**Symptoms**: Form shows error on submission
**Solutions**:

1. Check trigger setup: `setupTriggers()`
2. Verify script permissions authorized
3. Check Apps Script execution log
4. Validate form-sheet linking

#### Issue: Dropdowns Not Updating

**Symptoms**: Old data in form dropdowns
**Solutions**:

1. Manually run: `updateFormDropdowns()`
2. Check timed trigger status
3. Verify sheet data integrity
4. Check Apps Script quota limits

#### Issue: Calculations Incorrect

**Symptoms**: MASTERLIST totals don't match BATCHES
**Solutions**:

1. Run: `updateMasterlist()` (only needed if transaction totals are incorrect)
2. Check for data entry errors
3. Verify formula logic in scripts
4. Check for duplicate batch numbers

#### Issue: Batch Not Found Error

**Symptoms**: OUT transaction fails with "batch not found"
**Solutions**:

1. Check batch number format consistency
2. Verify batch exists in BATCHES sheet
3. Check dropdown selection parsing
4. Update form dropdowns

### Error Diagnosis

#### Check System Health

```javascript
// Run in Apps Script
const health = SystemHealth.performHealthCheck(SPREADSHEET_ID);
console.log(health);
```

#### Manual Data Reprocessing

```javascript
// For specific form response row
reprocessFormEntry(ROW_NUMBER);
```

#### Reset Form Dropdowns

```javascript
// Force refresh all dropdowns
updateAllFormDropdowns();
```

## Maintenance

### Regular Maintenance Tasks

#### Daily (Automated)

- Form submission processing
- MASTERLIST calculations
- Inventory status updates

#### Every 6 Hours (Automated)

- Form dropdown updates
- Batch availability refresh
- **CHEM_LIST to MASTERLIST sync** (new chemicals automatically added)

#### Weekly (Manual)

- Review CRITICAL inventory items
- Check expiration date alerts
- Verify system performance
- Update chemical lists if needed
- **Run `manualSyncChemicals()`** after adding new chemicals to CHEM_LIST

#### Monthly (Manual)

- System health check
- Performance optimization
- User access review
- Backup verification
- **Verify MASTERLIST completeness** - ensure all CHEM_LIST chemicals are present

### Data Backup

#### Automated Backup (Google)

- Google automatically saves all changes
- Version history available for 30 days
- Deleted items recoverable for 30 days

#### Manual Backup Recommended

1. **Weekly**: Download copies of key sheets
2. **Monthly**: Export complete spreadsheet
3. **Before Major Changes**: Create backup copy

### System Updates

#### Adding New Features

1. Test in development copy first
2. Deploy during low-usage periods
3. Notify users of changes
4. Monitor for issues post-deployment

#### Modifying Calculations

1. Document current logic
2. Test extensively with sample data
3. Verify backward compatibility
4. Update user documentation

## Security Considerations

### Access Control

#### Spreadsheet Permissions

- **Editor**: System administrators only
- **Commenter**: Lab supervisors
- **Viewer**: All authorized staff
- **Form Access**: All lab staff

#### Apps Script Security

- Scripts run with editor permissions
- Triggers execute automatically
- External API access controlled
- Execution logs monitored

### Data Protection

#### Sensitive Information

- No personal health information stored
- Chemical data may be sensitive
- Access logs maintained by Google
- Regular permission audits recommended

#### Best Practices

- [ ] Regular password updates
- [ ] Two-factor authentication enabled
- [ ] Minimum necessary access granted
- [ ] Sharing links disabled when not needed
- [ ] Regular access review conducted

### Compliance Considerations

#### Audit Trail

- All form submissions timestamped
- Change history maintained
- User actions logged
- Data modification tracking

#### Data Retention

- Historical data preserved
- Deletion policies defined
- Backup retention scheduled
- Compliance documentation maintained

---

## Data Management and Cleanup

### Development to Production Transition

When moving from testing to production use, you'll need to clean up test data while preserving the system structure.

#### Available Cleanup Functions

**1. Quick Test Cleanup (Recommended)**

```javascript
quickCleanupTestData();
```

- **Safe**: Only removes test data (batches containing "TEST")
- **Preserves**: Beginning inventory, chemical lists, system structure
- **Clears**: Test batches, form responses, recalculates totals
- **Use Case**: Standard transition from testing to production

**2. Custom Cleanup**

```javascript
cleanupTestData({
  clearBatches: true, // Remove batch data
  clearFormResponses: true, // Clear form history
  resetMasterlistTotals: true, // Reset calculations
  preserveBeginningInventory: true, // Keep beginning values
  testBatchPattern: "TEST", // Pattern to match for removal
});
```

- **Flexible**: Configurable options for specific needs
- **Pattern Matching**: Remove only batches matching specific patterns
- **Selective**: Choose which data types to clear
- **Use Case**: Targeted cleanup of specific data sets

**3. Complete System Reset**

```javascript
nuclearCleanupAllData();
```

- **DANGEROUS**: Removes ALL transaction data
- **Confirmation Required**: Built-in safety confirmation dialog
- **Complete Reset**: Returns system to initial state
- **Use Case**: Starting completely over or emergency reset

#### Cleanup Process Workflow

1. **Pre-Cleanup Checklist**:

   - [ ] Export current data as backup
   - [ ] Verify test data patterns (e.g., batches with "TEST")
   - [ ] Note any real inventory to preserve
   - [ ] Ensure beginning inventory values are documented

2. **Execute Cleanup**:

   ```javascript
   // Open Apps Script Editor
   // Go to Code.gs
   // Run appropriate cleanup function
   quickCleanupTestData();
   ```

3. **Post-Cleanup Setup**:
   - [ ] Manually set beginning inventory in MASTERLIST
   - [ ] Verify form dropdowns are updated
   - [ ] Test a sample transaction
   - [ ] Confirm calculations are correct

#### Safety Features

- **Pattern Matching**: Default removal only affects batches with "TEST" pattern
- **Preservation Options**: Beginning inventory can be preserved during cleanup
- **Confirmation Dialogs**: Nuclear cleanup requires user confirmation
- **Header Preservation**: All sheet headers and structure maintained
- **Automatic Updates**: Form dropdowns automatically refreshed after cleanup

#### Data Backup Recommendations

**Before Cleanup**:

1. File → Download → Excel (.xlsx) for each sheet
2. Copy spreadsheet: File → Make a copy
3. Export form responses if needed separately

**After Cleanup**:

1. Document beginning inventory values
2. Test system functionality
3. Begin production data entry

---

## Support and Documentation

### Quick Reference Cards

#### For End Users

- **Form Submission**: [Quick Guide Link]
- **Inventory Checking**: [Status Guide Link]
- **Error Resolution**: [Troubleshooting Link]

#### For Administrators

- **System Setup**: This document
- **Maintenance Tasks**: [Maintenance Checklist]
- **Emergency Procedures**: [Emergency Guide]

### Getting Help

1. **First**: Check this documentation
2. **Second**: Review system logs in Apps Script
3. **Third**: Contact system administrator
4. **Last Resort**: Google Support (for platform issues)

### System Information

- **Version**: 1.0
- **Last Updated**: December 2025
- **Compatibility**: Google Workspace
- **Required Permissions**: Editor access to Sheets and Forms

---

_This documentation is maintained as part of the Chemical Inventory Management System. Please keep it updated as the system evolves._
