# Chemical Inventory System - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Prerequisites

- Google account with Sheets, Forms, and Apps Script access
- Basic familiarity with Google Workspace

### Step 1: Get Your IDs

1. **Create Google Spreadsheet**:

   - Go to [sheets.google.com](https://sheets.google.com)
   - Create new spreadsheet: "Chem Inventory"
   - Copy ID from URL: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`

2. **Create Google Form**:
   - Go to [forms.google.com](https://forms.google.com)
   - Create new form: "Chemical Inventory Transaction Form"
   - Copy ID from URL: `https://docs.google.com/forms/d/[FORM_ID]/edit`

### Step 2: Deploy Scripts

1. **Open Apps Script**:

   - In your spreadsheet: Extensions → Apps Script
   - Delete default `Code.gs`

2. **Add Script Files**:
   Create these 6 files with content from the `scripts/` folder:

   - `Code.gs` (main processing logic)
   - `SheetInitializer.gs` (sheet setup)
   - `FormManager.gs` (dropdown management)
   - `DataProcessingUtils.gs` (utilities)
   - `DeploymentUtils.gs` (deployment & maintenance)
   - `TestSuite.gs` (testing)

3. **Update Configuration**:
   In ALL script files, update these lines:
   ```javascript
   const FORM_ID = "YOUR_FORM_ID_HERE";
   const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";
   ```

### Step 3: Deploy System

**Important: Authorization Required**

> 🔑 First time running any script? You'll see "Authorization Required" - this is normal!
> See [Authorization Instructions](#authorization-instructions) below for step-by-step guidance.

1. **Initialize Sheets**:

   Open `SheetInitializer.gs`, then run:

   ```javascript
   initializeAllSheets();
   ```

   ✅ Creates all required sheets with headers and sample data

2. **Set Up Automation (Manual)**:

   **Form Submission Trigger:**

   1. In Apps Script: Triggers → Add Trigger
   2. Choose function: `onFormSubmit`
   3. Event source: From spreadsheet
   4. Event type: On form submit
   5. Save trigger

   **Timed Update Trigger:**

   1. In Apps Script: Triggers → Add Trigger
   2. Choose function: `timedUpdateDropdowns`
   3. Event source: Time-driven
   4. Time based trigger: Hours timer
   5. Every: 6 hours
   6. Save trigger

   **Auto-Sync Trigger (for CHEM_LIST edits):**

   1. In Apps Script: Triggers → Add Trigger
   2. Choose function: `onEdit`
   3. Event source: From spreadsheet
   4. Event type: On edit
   5. Save trigger

   ✅ Enables automatic processing and scheduled updates plus auto-sync when CHEM_LIST is edited

3. **Update Dropdowns**:
   Open `FormManager.gs`, then run:
   ```javascript
   updateAllFormDropdowns();
   ```
   ✅ Populates form dropdowns with current data

### Step 4: Create and Link Form (Manual)

1. **Create Form Fields with Conditional Logic**:

   **Section 1: Basic Transaction Info**

   1. **Transaction Date** (Date field)

      - Required: Yes

   2. **Staff Name** (Dropdown)

      - Required: Yes
      - Will be populated by script

   3. **Chemical Name** (Dropdown)

      - Required: Yes
      - Will be populated by script

   4. **Transaction Type** (Multiple choice)
      - Required: Yes
      - Options: `IN`, `OUT`
      - **⚠️ CRITICAL**: This field controls conditional sections below

   **Setting Up Conditional Logic:**

   5. **Configure Transaction Type Routing**:

      - Click the Transaction Type question (step 4 above)
      - Click the 3-dots menu (⋮) → "Go to section based on answer"
      - For "IN" option: Select "Go to section" → "IN Transaction Details"
      - For "OUT" option: Select "Go to section" → "OUT Transaction Details"

   6. **Add Section Break for IN**: Click "Add section" (➕) after Transaction Type
      - Title: "IN Transaction Details"
      - Description: "Complete these fields for incoming chemicals"

   **Section 2: IN Transaction Fields**

   7. **Supplier** (Dropdown)

      - Required: Yes
      - Will be populated by script

   8. **Brand** (Dropdown)

      - Required: Yes
      - Will be populated by script

   9. **Batch/Lot Number** (Short answer)

      - Required: Yes
      - Validation: Text format

   10. **Number of Bottles** (Number)

       - Required: Yes
       - Validation: Number, Greater than 0

   11. **Volume/Weight per Bottle** (Number)

       - Required: Yes
       - Validation: Number, Greater than 0
       - Description: "Enter amount per bottle in grams or mL"

   12. **Expiration Date** (Date)

       - Required: Yes

   13. **Location** (Dropdown)

       - Required: Yes
       - Will be populated by script

   14. **Add Section Break for OUT**: Click "Add section" (➕) after "IN Transaction Details"
       - Title: "OUT Transaction Details"
       - Description: "Complete these fields for outgoing chemicals"

   **Section 3: OUT Transaction Fields**

   15. **Out Type** (Multiple choice)

       - Required: Yes
       - Options: `prep`, `transfer`
       - Description: "prep = laboratory preparation, transfer = moving to another location"

   16. **Select Batch/Lot Number Out** (Dropdown)

       - Required: Yes
       - Will be populated by script with available batches
       - Description: "Choose from available batches with current quantities"

   17. **Total Volume/Weight Out** (Number)

       - Required: Yes
       - Validation: Number, Greater than 0
       - Description: "Enter total amount to remove in grams or mL"

   18. **Outgoing Transaction Comment** (Paragraph text)
       - Required: No
       - Description: "Optional notes about this transaction"

   **Final Section Setup:**

   20. **Add Submit Form Section**: Click "Add section" (➕) after "OUT Transaction Details"

       - Title: "Submit Form"
       - Description: "Review and submit your transaction"

   21. **Configure Section Navigation for Both Paths**:
       - **IN Transaction Details section**: After last question (Location), automatically goes to "Submit Form"
       - **OUT Transaction Details section**: After last question (Comment), automatically goes to "Submit Form"
       - Both paths converge at the final "Submit Form" section

   **Visual Form Flow:**

   ```
   Section 1: Basic Info (Transaction Type selection)
   ├─ Transaction Type = "IN" → Section 2: IN Transaction Details → Submit Form
   └─ Transaction Type = "OUT" → Section 3: OUT Transaction Details → Submit Form
   ```

   **✅ Conditional Logic Verification:**

   - Transaction Type "IN" → Shows IN Transaction Details section
   - Transaction Type "OUT" → Shows OUT Transaction Details section
   - Both paths → End at Submit Form section
   - Users only see fields relevant to their transaction type

2. **Link Form to Spreadsheet**:

- In your form: Responses → Link to sheets → Select existing spreadsheet
- This automatically creates the "Form Responses" sheet

3. **Update Dropdowns**:
   Open `FormManager.gs`, then run:
   ```javascript
   updateAllFormDropdowns();
   ```

### Step 5: Test System

1. **Run Test Suite**:

   Open `TestSuite.gs`, then run:

   ```javascript
   runAllTests();
   ```

   ✅ Validates entire system functionality

2. **Manual Transaction Testing**:

   **🔬 Test IN Transaction:**

   1. **Submit IN Transaction with these test values**:

      - Transaction Date: Today's date
      - Staff Name: Kim (from dropdown)
      - Chemical Name: Sodium Chloride (from dropdown)
      - Transaction Type: IN
      - Supplier: Yana Chemodities (from dropdown)
      - Brand: Chem-Supply (from dropdown)
      - Batch/Lot Number: TEST001
      - Number of Bottles: 2
      - Volume/Weight per Bottle: 500
      - Expiration Date: 2025-12-31
      - Location: Chemical Storage Room A (from dropdown)

   2. **Check Results - BATCHES Sheet**:
      ✅ New row added with:

      - `batch_num`: TEST001
      - `chem_name`: Sodium Chloride
      - `vol_total`: 1000 (2 × 500)
      - `ending_vol`: 1000
      - `out_prep`: 0, `out_xfer`: 0

   3. **Check Results - MASTERLIST Sheet**:
      ✅ Sodium Chloride row updated:

      - `in_supplier_total`: increased by 1000 (2 bottles × 500g per bottle = 1000g total volume)
      - `current_total`: auto-calculated via formula (beginning_inv + in_supplier_total + in_transfer_total - out_prep_total - out_xfer_total)
      - `status`: auto-calculated via formula (based on safety level vs current_total)

   4. **Check Form Dropdown**:
      ✅ "Select Batch/Lot Number Out" should now show:
      - "Sodium Chloride - Batch: TEST001 | Exp: 2025-12-31 | Qty: 1000 g"

   **🧪 Test OUT Transaction:**

   1. **Submit OUT Transaction with these test values**:

      - Transaction Date: Today's date
      - Staff Name: Khent (from dropdown)
      - Chemical Name: Sodium Chloride (from dropdown)
      - Transaction Type: OUT
      - Out Type: prep
      - Select Batch/Lot Number Out: Choose "Sodium Chloride - Batch: TEST001..." from dropdown
      - Total Volume/Weight Out: 200
      - Comment: Test preparation

   2. **Check Results - BATCHES Sheet**:
      ✅ TEST001 row updated:

      - `out_prep`: 200 (increased from 0)
      - `ending_vol`: 800 (1000 - 200)

   3. **Check Results - MASTERLIST Sheet**:
      ✅ Sodium Chloride row updated:

      - `out_prep_total`: increased by 200 (total volume removed)
      - `current_total`: auto-decreased by 200 (via formula: beginning_inv + in_supplier_total + in_transfer_total - out_prep_total - out_xfer_total)
      - `status`: may auto-change to "CRITICAL" if current_total falls below safety level (750g)

   4. **Check Form Dropdown**:
      ✅ "Select Batch/Lot Number Out" should now show:
      - "Sodium Chloride - Batch: TEST001 | Exp: 2025-12-31 | Qty: 800 g"

   **⚡ Automatic Updates Confirmed:**

   - ✅ Dropdowns update after EVERY form submission
   - ✅ MASTERLIST transaction totals update automatically
   - ✅ **current_total & status use formulas** - update instantly when beginning_inv is edited
   - ✅ Batch quantities reflect in dropdown immediately

   **🚨 Test Error Handling:**

   Try submitting OUT transaction with `Total Volume/Weight Out: 1000` (more than available):

   - ✅ Should show error: "Insufficient volume. Requested: 1000, Available: 800"

### Step 6: Go Live! 🎉

- Share form with lab staff
- Train users on transaction entry
- Monitor MASTERLIST for inventory status

---

## � Authorization Instructions

**First time running scripts? Follow these steps for "Authorization Required" dialog:**

### When You See "Authorization Required"

1. **Click "Review Permissions"**

   - You'll be redirected to Google's authorization page

2. **Choose Your Google Account**

   - Select the account that owns the spreadsheet

3. **Review Permissions Screen**

   - You'll see: "Google hasn't verified this app"
   - Click "Advanced" (bottom left)

4. **Proceed Safely**

   - Click "Go to [Project Name] (unsafe)"
   - This is YOUR script, so it's safe to proceed

5. **Grant Permissions**

   - Review the requested permissions:
     - ✅ See, edit, create, delete your spreadsheets
     - ✅ Connect to an external service
     - ✅ Allow this application to run when you're not present
   - Click "Allow"

6. **Return to Apps Script**
   - You'll be redirected back to Apps Script
   - The script will now run normally

### What Permissions Do?

- **Spreadsheets**: Create and manage inventory sheets
- **Forms**: Update dropdowns and link responses
- **Triggers**: Enable automatic processing
- **External Service**: Connect form to spreadsheet

> ⚠️ **Security Note**: Only authorize scripts you created or trust. This system only accesses your Google Sheets and Forms.

---

## �📋 Common Issues & Solutions

| Issue                          | Solution                                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| "Authorization Required"       | Follow [Authorization Instructions](#authorization-instructions) above                                   |
| "Function not found"           | Authorize all scripts and set up triggers manually (see Step 2)                                          |
| "Loading..." in dropdowns      | Run `updateAllFormDropdowns()` in `FormManager.gs`                                                       |
| Form not submitting            | Check manual trigger setup (Step 2) and form-sheet linking                                               |
| Calculations wrong             | Check formulas in MASTERLIST columns I & J; run `updateMasterlist()` if transaction totals are incorrect |
| New chemical not in MASTERLIST | Run `manualSyncChemicals()` in `Code.gs` after adding to CHEM_LIST                                       |
| Chemical missing from dropdown | Run `manualSyncChemicals()` then `updateAllFormDropdowns()`                                              |
| System health issues           | Run `SystemMonitor.getSystemStatus()` in `DataProcessingUtils.gs`                                        |
| Complete system reset          | Run `deployChemicalInventorySystem()` in `DeploymentUtils.gs`                                            |

---

## 🆘 Need Help?

1. Check the [full README](README.md) for detailed instructions
2. Run system health check: `SystemMonitor.getSystemStatus()` in `DataProcessingUtils.gs`
3. Run deployment diagnostics: `getDeploymentInfo()` in `DeploymentUtils.gs`
4. Review Apps Script execution logs for errors
5. Contact your system administrator

---

## 📊 System Status Check

After setup, verify these items:

- [ ] All 6 required sheets exist with headers (Form Responses sheet created automatically when form is linked)
- [ ] Form has all sections with conditional logic
- [ ] Sample data loaded in STAFF_LIST, CHEM_LIST, etc.
- [ ] **Triggers set up manually**: Check Apps Script → Triggers for `onFormSubmit`, `timedUpdateDropdowns`, and `onEdit`
- [ ] Test transaction processes correctly
- [ ] MASTERLIST calculations accurate
- [ ] Form dropdowns populated
- [ ] **CHEM_LIST sync working**: Add test chemical to CHEM_LIST, run `manualSyncChemicals()`, verify it appears in MASTERLIST

### 🔧 Verify Triggers Are Active

1. **Check Trigger List**:

   - In Apps Script: Go to Triggers (left sidebar)
   - Should see 3 triggers:
     - `onFormSubmit` (Form submit trigger)
     - `timedUpdateDropdowns` (Time-driven trigger, every 6 hours)
     - `onEdit` (Edit trigger, for automatic CHEM_LIST sync)

2. **Test Form Submission**:
   - Submit test form data
   - Check if data appears in BATCHES sheet
   - Verify MASTERLIST calculations update

**Time to complete setup: ~10-15 minutes (including manual trigger setup)**
**Ready for production use immediately after setup**

---

## 💡 Understanding MASTERLIST Calculations

### Automatic Formula-Based System

The MASTERLIST uses **formulas** for calculated fields, ensuring real-time accuracy:

**Formula Fields (Auto-Update):**

- `current_total` = `beginning_inv` + `in_supplier_total` + `in_transfer_total` - `out_prep_total` - `out_xfer_total`
- `status` = IF(`current_total` ≤ `safety_lvl`, "CRITICAL", "OK")

**Benefits:**

- ✅ **Edit beginning_inv anytime** - totals update instantly
- ✅ **No script execution needed** for inventory adjustments
- ✅ **Real-time status alerts** when stock goes critical
- ✅ **Standard spreadsheet behavior** - works like Excel

**What This Means:**

- Transaction totals calculated by scripts when processing forms
- Final calculations done by spreadsheet formulas
- Users can freely edit beginning inventory values
- System maintains accuracy automatically

---

## 🧪 Managing Chemical Lists

### Adding New Chemicals

When you need to add new chemicals to your inventory system:

1. **Add to CHEM_LIST Sheet**:

   - Open your Google Spreadsheet
   - Go to CHEM_LIST sheet
   - Add new row with: `chem_name`, `liq_sol`, `UOM`, `safety_lvl`
   - Example: `Methyl red`, `solid`, `g`, `100`

2. **Sync with MASTERLIST** (Choose one option):

   **Option A: Automatic Sync (Recommended)**

   - New chemicals are automatically added to MASTERLIST during:
     - Form submissions (if the chemical is used in a transaction)
     - Scheduled updates (every 6 hours)

   **Option B: Manual Sync (Immediate)**

   - Open Apps Script → Code.gs
   - Run the function: `manualSyncChemicals()`
   - This immediately adds new chemicals to MASTERLIST

3. **Verify Addition**:

   - Check MASTERLIST sheet for new chemical
   - New chemical should have default values:
     - `beginning_inv`: 0
     - All transaction totals: 0
     - `current_total`: Uses formula (auto-calculates)
     - `status`: Uses formula (auto-calculates)

4. **Set Beginning Inventory**:
   - Manually update `beginning_inv` in MASTERLIST if needed
   - `current_total` and `status` update automatically (uses formulas)

### 🔧 Chemical Sync Functions

| Function                       | Purpose                                                     | When to Use                        |
| ------------------------------ | ----------------------------------------------------------- | ---------------------------------- |
| `manualSyncChemicals()`        | Immediately sync new chemicals from CHEM_LIST to MASTERLIST | After adding chemicals manually    |
| `syncChemListWithMasterlist()` | Internal sync function                                      | Called automatically by system     |
| `updateMasterlist()`           | Recalculate transaction totals from BATCHES data            | After batch corrections or cleanup |

### ⚠️ Important Notes

- **Never delete chemicals** from CHEM_LIST if they have existing batches in BATCHES
- **Always sync** after adding new chemicals to ensure form dropdowns work correctly
- **Beginning inventory** can be edited directly - `current_total` and `status` update automatically (formula-based)
- **No manual recalculation needed** when changing `beginning_inv` values

---

## 🧹 Data Cleanup and Management

### Cleaning Up Test Data

When transitioning from testing to production, or when you need to remove test transactions:

#### Quick Cleanup (Recommended)

Removes only test data while preserving real inventory:

```javascript
quickCleanupTestData();
```

**What it does:**

- ✅ Removes batches containing "TEST" in batch number
- ✅ Clears form response history
- ✅ Resets MASTERLIST calculations
- ✅ Preserves beginning inventory values
- ✅ Updates form dropdowns

#### Custom Cleanup

For more control over what gets removed:

```javascript
cleanupTestData({
  clearBatches: true, // Remove batch data
  clearFormResponses: true, // Clear form submissions
  resetMasterlistTotals: true, // Reset calculations
  preserveBeginningInventory: true, // Keep beginning inventory
  testBatchPattern: "TEST", // Only remove batches with "TEST"
});
```

#### Complete Reset (DANGER)

⚠️ **WARNING: This removes ALL data!**

```javascript
nuclearCleanupAllData();
```

- Requires user confirmation
- Removes ALL transaction history
- Resets ALL inventory calculations
- Use only for complete system reset

### 🔧 Cleanup Functions Reference

| Function                  | Safety Level | Purpose                      | Preserves Beginning Inventory |
| ------------------------- | ------------ | ---------------------------- | ----------------------------- |
| `quickCleanupTestData()`  | 🟢 Safe      | Remove test data only        | ✅ Yes                        |
| `cleanupTestData()`       | 🟡 Custom    | Configurable cleanup options | ⚙️ Configurable               |
| `nuclearCleanupAllData()` | 🔴 DANGER    | Complete system reset        | ❌ No                         |

### 📝 Best Practices

1. **Before Production**: Run `quickCleanupTestData()` to remove test transactions
2. **Regular Maintenance**: Use custom cleanup to remove specific batch patterns
3. **Emergency Reset**: Only use nuclear cleanup for complete restart
4. **Always Backup**: Export sheets before running cleanup functions
5. **Test First**: Try cleanup on a copy of your sheet if unsure

### 🚀 Transition to Production

**Recommended cleanup sequence:**

1. Test your system thoroughly with test data
2. Export/backup your current sheets
3. Run `quickCleanupTestData()` to remove test transactions
4. Manually set beginning inventory values in MASTERLIST
5. Begin production use

**Time required: ~2-3 minutes for cleanup + manual inventory setup**
