# GitHub Deployment Guide

## Hosting Your Chemical Inventory System on GitHub

This guide explains how to properly host and maintain your Google Apps Script-based Chemical Inventory Management System on GitHub.

## Repository Structure

```
chemical-inventory-management-system/
├── scripts/                 # Google Apps Script files
│   ├── Code.gs             # Main application code
│   ├── FormManager.gs      # Form management functions
│   ├── SheetInitializer.gs # Sheet setup and initialization
│   ├── DataProcessingUtils.gs # Utility functions
│   ├── TestSuite.gs        # Testing functions
│   └── DeploymentUtils.gs  # Deployment helpers
├── data/                   # Sample data files
│   ├── brands.csv         # Brand data
│   └── suppliers.csv      # Supplier data
├── docs/                  # Documentation
│   ├── README.md
│   ├── QUICK_START.md
│   └── PROJECT_STRUCTURE.md
└── sys_reqs.txt          # System requirements
```

## Important Considerations

### 1. Security & Sensitive Data

- **Never commit:** Google Apps Script IDs, Form IDs, or Spreadsheet IDs
- **Use placeholders:** Replace actual IDs with placeholders like `YOUR_FORM_ID_HERE`
- **Environment variables:** For production, use Google Apps Script's Properties Service

### 2. Version Control Best Practices

```bash
# Always work on feature branches
git checkout -b feature/new-functionality
git add .
git commit -m "Add new functionality: detailed description"
git push origin feature/new-functionality

# Create pull requests for code review
# Merge to main only after review
```

### 3. Deployment Workflow

#### Option A: Manual Deployment
1. Copy code from GitHub to Google Apps Script Editor
2. Update IDs and configuration
3. Test in development environment
4. Deploy to production

#### Option B: Using Google clasp (Advanced)
```bash
# Install clasp globally
npm install -g @google/clasp

# Login to Google
clasp login

# Clone your existing project
clasp clone YOUR_SCRIPT_ID

# Push changes
clasp push

# Deploy
clasp deploy
```

### 4. Configuration Management

Create a separate configuration file for deployment:

```javascript
// config.js - Not committed to git
const CONFIG = {
  FORM_ID: "your_actual_form_id",
  SPREADSHEET_ID: "your_actual_spreadsheet_id",
  // Other sensitive config
};
```

### 5. Continuous Integration

Consider setting up GitHub Actions for:
- Code validation
- Testing
- Automated deployment (with clasp)

## Collaboration Guidelines

### For Team Development:

1. **Fork the repository** for external contributors
2. **Create feature branches** for new functionality
3. **Use pull requests** for code review
4. **Tag releases** for version management

### Code Review Checklist:

- [ ] No sensitive data exposed
- [ ] Code follows established patterns
- [ ] Functions are properly documented
- [ ] Error handling is implemented
- [ ] Tests are included/updated

## Maintenance

### Regular Tasks:
1. **Update dependencies** (if using clasp/npm)
2. **Review and merge** pull requests
3. **Tag stable releases**
4. **Update documentation**

### Release Management:
```bash
# Tag a new release
git tag -a v1.1.0 -m "Release version 1.1.0 - Added new features"
git push origin v1.1.0
```

## Support and Issues

1. **Use GitHub Issues** for bug reports and feature requests
2. **Provide templates** for consistent issue reporting
3. **Label issues** appropriately (bug, enhancement, question)
4. **Link to relevant documentation**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.