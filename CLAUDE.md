# Claude Development Guidelines

## Project Overview
Priority Matrix - A personal task organization system using the Eisenhower Matrix with multi-language support.

## Development Commands

### Setup
```bash
npm install
```

### Development
```bash
npm run dev          # Start development server on port 8080
npm run start        # Same as dev
```

### Testing
```bash
npm run test         # Run Jest unit tests
npm run test:watch   # Run Jest in watch mode
npm run test:coverage # Run tests with coverage report
npm run cypress:open # Open Cypress test runner
npm run cypress:run  # Run Cypress tests headlessly
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run build        # Run lint + tests (CI pipeline)
```

## Project Structure
```
priority/
├── src/
│   ├── js/           # JavaScript modules
│   ├── css/          # Stylesheets
│   ├── i18n/         # Language files
│   └── index.html    # Main HTML file
├── tests/            # Jest unit tests
├── cypress/          # E2E tests
│   ├── integration/  # Test specs
│   ├── fixtures/     # Test data
│   └── support/      # Test utilities
├── tasks/            # Project documentation
└── docs/             # Generated documentation
```

## Code Style Guidelines

### JavaScript
- Use ES6+ features
- Follow ESLint configuration
- Use camelCase for variables and functions
- Use PascalCase for classes
- Use SCREAMING_SNAKE_CASE for constants

### Testing
- Write unit tests for all business logic
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Maintain >90% code coverage

### Internationalization
- All user-facing text must be translatable
- Use translation keys in the format: `section.subsection.key`
- Support Portuguese, English, and Spanish

## Git Workflow
- Use conventional commits
- Create feature branches for new functionality
- Run `npm run build` before committing
- All tests must pass before merging

## Key Features to Implement
1. **Eisenhower Matrix**: 4-quadrant task organization
2. **Multi-language**: PT/EN/ES support
3. **Battle Mode**: Pairwise task comparison
4. **Print Reports**: Export-ready formatting
5. **Data Persistence**: Local storage + export/import

## Performance Considerations
- Vanilla JavaScript only (no frameworks)
- Minimize DOM manipulations
- Use event delegation
- Optimize for print media queries