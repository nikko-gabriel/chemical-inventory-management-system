# Contributing to Chemical Inventory Management System

Thank you for considering contributing to this project! This guide will help you get started.

## Code of Conduct

This project follows a simple code of conduct:

- Be respectful and constructive
- Focus on what's best for the community
- Help others learn and grow

## How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Use the bug report template** when creating new issues
3. **Provide detailed information** including steps to reproduce
4. **Don't include sensitive data** (actual Form/Spreadsheet IDs)

### Suggesting Features

1. **Check existing feature requests** to avoid duplicates
2. **Use the feature request template**
3. **Explain the use case** and why it would be valuable
4. **Consider implementation complexity**

### Contributing Code

#### Getting Started

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test thoroughly** (see Testing section below)
5. **Submit a pull request**

#### Development Guidelines

##### Code Style

- Use clear, descriptive function names
- Add JSDoc comments for all functions
- Use consistent indentation (2 spaces)
- Include error handling
- Follow existing patterns in the codebase

##### Function Documentation

```javascript
/**
 * Brief description of what the function does
 * @param {type} paramName - Description of parameter
 * @returns {type} Description of return value
 */
function exampleFunction(paramName) {
  // Implementation
}
```

##### Error Handling

```javascript
function safeFunction() {
  try {
    // Main logic
  } catch (error) {
    console.error("Error in safeFunction:", error);
    // Handle error appropriately
    throw error; // Re-throw if caller needs to handle
  }
}
```

#### Testing

Before submitting a pull request:

1. **Test with sample data**:

   ```javascript
   // Use the provided test functions
   runTestSuite();
   ```

2. **Test edge cases**:

   - Empty form submissions
   - Invalid data
   - Large datasets
   - Concurrent access

3. **Test integration**:
   - Form submissions
   - Sheet updates
   - Dropdown refreshes

#### Security Considerations

- **Never commit actual IDs** (Form, Spreadsheet, etc.)
- **Use placeholder values** in code examples
- **Validate all inputs** before processing
- **Handle sensitive data appropriately**

### Pull Request Process

1. **Ensure your PR description** clearly describes the changes
2. **Reference related issues** using keywords like "Fixes #123"
3. **Include test results** or testing notes
4. **Keep PRs focused** - one feature/fix per PR
5. **Update documentation** if needed

#### PR Checklist

- [ ] Code follows the style guidelines
- [ ] Self-review completed
- [ ] Code is commented, particularly hard-to-understand areas
- [ ] Documentation updated (if applicable)
- [ ] No sensitive data included
- [ ] Tests pass
- [ ] No breaking changes (or clearly documented)

## Development Setup

### Local Development

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/chemical-inventory-management-system.git
   cd chemical-inventory-management-system
   ```

2. **Set up your test environment**:

   - Create a copy of the Google Sheets template
   - Create a test Google Form
   - Update configuration with your test IDs

3. **Install Google clasp** (optional but recommended):
   ```bash
   npm install -g @google/clasp
   clasp login
   ```

### Project Structure

```
chemical-inventory-management-system/
├── scripts/              # Google Apps Script files
├── .github/             # GitHub templates and workflows
├── docs/                # Documentation
├── data/                # Sample CSV files
└── tests/               # Test files (future)
```

## Release Process

### Version Numbering

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

### Creating Releases

1. **Update version numbers** in relevant files
2. **Update CHANGELOG.md** with new features and fixes
3. **Create and push a tag**:
   ```bash
   git tag -a v1.1.0 -m "Release version 1.1.0"
   git push origin v1.1.0
   ```
4. **Create GitHub release** with release notes

## Questions?

- **Check the documentation** in the `docs/` folder
- **Search existing issues** for similar questions
- **Create a new issue** with the question label
- **Join discussions** in GitHub Discussions (if enabled)

## Recognition

Contributors will be recognized in:

- GitHub contributor statistics
- Release notes
- CONTRIBUTORS.md file (if maintained)

Thank you for contributing! 🎉
