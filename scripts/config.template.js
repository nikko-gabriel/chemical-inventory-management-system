/**
 * Configuration Template for Chemical Inventory Management System
 * 
 * IMPORTANT: 
 * 1. Copy this file to your Google Apps Script project
 * 2. Replace placeholder values with your actual Google IDs
 * 3. Do NOT commit the actual IDs to public repositories
 */

// ⚠️ REPLACE THESE WITH YOUR ACTUAL IDs ⚠️
const CONFIG = {
  // Google Form ID (found in form URL)
  FORM_ID: "YOUR_FORM_ID_HERE",
  
  // Google Spreadsheet ID (found in spreadsheet URL)
  SPREADSHEET_ID: "YOUR_SPREADSHEET_ID_HERE",
  
  // Environment settings
  ENVIRONMENT: "development", // "development" or "production"
  
  // Feature flags
  FEATURES: {
    AUTO_SYNC: true,
    EMAIL_NOTIFICATIONS: false,
    ADVANCED_LOGGING: true
  },
  
  // Email settings (if using notifications)
  NOTIFICATION_EMAIL: "your-email@company.com",
  
  // System settings
  SYSTEM: {
    DEFAULT_TIMEZONE: "America/Chicago",
    DATE_FORMAT: "yyyy-MM-dd",
    DECIMAL_PLACES: 2
  }
};

// Export for use in other modules
// Usage: const config = getConfig();
function getConfig() {
  return CONFIG;
}

// Validate configuration on load
function validateConfig() {
  const requiredFields = ['FORM_ID', 'SPREADSHEET_ID'];
  
  for (const field of requiredFields) {
    if (!CONFIG[field] || CONFIG[field].includes('YOUR_') || CONFIG[field].includes('_HERE')) {
      throw new Error(`Configuration error: ${field} must be set with actual value`);
    }
  }
  
  console.log('✅ Configuration validated successfully');
  return true;
}

// Auto-validate on script load (optional)
// validateConfig();