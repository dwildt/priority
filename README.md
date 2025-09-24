# Priority Matrix 🎯

A personal task organization system based on the Eisenhower Matrix, helping you prioritize tasks by importance and urgency. Features multi-language support, battle-style task comparison, and print-ready reports.

## 🚀 Live Demo

**Try it now:** [https://dwildt.github.io/priority/](https://dwildt.github.io/priority/)

The application is automatically deployed to GitHub Pages from the main branch.

## ✨ Features

### Core Functionality
- **Eisenhower Matrix**: Organize tasks into 4 quadrants (Important/Urgent, Important/Not Urgent, etc.)
- **Multi-language Support**: Portuguese, English, and Spanish
- **Battle Mode**: Pairwise task comparison to determine "The One" most important task
- **Print-Ready Reports**: Export organized task lists with "The One", "Up Next", and matrix overview
- **Data Persistence**: Local storage with import/export capabilities

### User Experience
- **Interactive UI**: Drag-and-drop task management
- **Task Assessment**: Guided questions for importance/urgency evaluation
- **Smart Categorization**: Automatic task placement in correct quadrants
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Option 1: Use Online (Recommended)
Visit the live demo at [https://dwildt.github.io/priority/](https://dwildt.github.io/priority/) - no installation required!

### Option 2: Local Development
#### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

#### Installation
```bash
# Clone the repository
git clone https://github.com/dwildt/priority.git
cd priority

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:8080` to use the application.

## 📋 How to Use

### 1. Add Tasks
- Click "Add Task" button
- Enter task description
- Answer importance and urgency questions
- Task automatically appears in the correct quadrant

### 2. Organize with Battle Mode
- Navigate to Important + Urgent quadrant
- Use "Battle Mode" to compare tasks pairwise
- System determines "The One" most critical task

### 3. Generate Reports
- Click "Generate Report" for print-ready view
- Export as PDF or print directly
- Includes "The One", "Up Next", and full matrix

### 4. Language Support
- Use language switcher in top-right corner
- Choose between Portuguese, English, or Spanish
- All interface text and reports adapt automatically

## 🏗️ Project Structure

```
priority/
├── src/
│   ├── components/      # Atomic Design Components
│   │   ├── atoms/       # Basic building blocks (buttons, inputs, icons)
│   │   ├── molecules/   # Component combinations (forms, cards)
│   │   ├── organisms/   # Complex components (grids, modals)
│   │   ├── templates/   # Page layouts
│   │   └── pages/       # Complete page implementations
│   ├── js/              # Application logic
│   │   ├── app.js       # Main application
│   │   ├── matrix.js    # Matrix logic
│   │   ├── battle.js    # Battle mode
│   │   └── i18n.js      # Internationalization
│   ├── css/             # Asana-inspired design system & styles
│   ├── i18n/            # Language files
│   └── index.html       # Main HTML
├── tests/               # Unit tests
├── cypress/             # E2E tests
└── tasks/               # Project documentation & planning
```

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run cypress:open # Open Cypress test runner
npm run lint         # Run ESLint
npm run build        # Run all checks (lint + test)
```

### Testing
- **Unit Tests**: Jest for business logic testing
- **E2E Tests**: Cypress for user interaction testing
- **Coverage**: Minimum 90% code coverage required

### Code Quality
- ESLint configuration with strict rules
- Conventional commit messages
- Pre-commit hooks for quality checks

### GitHub Copilot Optimization 🤖
This project is optimized for GitHub Copilot development:
- **Comprehensive JSDoc**: All classes and methods have detailed documentation
- **Type Hints**: Type definitions in `src/js/types.js` for better AI suggestions
- **Context Files**: `.github/copilot-instructions.md` provides project-specific guidance
- **Development Guide**: `docs/copilot-development-guide.md` with patterns and examples
- **Clear Naming**: Descriptive variable and function names for better code understanding

## 📖 The Eisenhower Matrix

The system is based on the productivity method created by President Dwight D. Eisenhower:

- **Quadrant 1**: Important + Urgent (Do First)
- **Quadrant 2**: Important + Not Urgent (Schedule)
- **Quadrant 3**: Not Important + Urgent (Delegate)
- **Quadrant 4**: Not Important + Not Urgent (Eliminate)

## 🌍 Multi-language Support

Currently supported languages:
- 🇧🇷 **Portuguese** (Português)
- 🇺🇸 **English**
- 🇪🇸 **Spanish** (Español)

## 📊 Battle Mode

Unique feature for determining task priority:
1. System presents pairs of tasks from Important+Urgent quadrant
2. User chooses which task is more critical
3. Algorithm ranks all tasks based on comparisons
4. "The One" most important task is identified

## 🎨 Design System

**Asana-Inspired Color Palette:**
- **Q1 (Do First)**: Blue (#4A90E2) - Professional urgency
- **Q2 (Schedule)**: Green (#2ECC8F) - Growth and planning
- **Q3 (Delegate)**: Orange (#FFA726) - Attention and delegation
- **Q4 (Eliminate)**: Red (#FF6B6B) - Warning and elimination

**Atomic Design Architecture:**
- **Atoms**: Buttons, inputs, icons, typography, toggles
- **Molecules**: Form groups, task cards, progress indicators
- **Organisms**: Matrix grid, modals, headers, battle interface
- **Templates**: Layout structures for different page types
- **Pages**: Complete application views

## 📄 Print Reports

Generate professional reports including:
- **The One**: Your single most important task
- **Up Next**: Next 3-5 priority tasks
- **Matrix Overview**: All tasks organized by quadrant
- **Summary Statistics**: Task counts and completion rates

## 🚀 Deployment

The project is automatically deployed to GitHub Pages using GitHub Actions:

1. **Automatic Deployment**: Every push to the `main` branch triggers deployment
2. **Live URL**: [https://dwildt.github.io/priority/](https://dwildt.github.io/priority/)
3. **Build Process**: The workflow runs tests, linting, and deploys static files
4. **Zero Configuration**: No additional setup required

### Manual Deployment (if needed)
```bash
# Ensure all tests pass
npm run build

# Push to main branch
git push origin main
```

## 🤝 Contributing

1. Fork the repository: [https://github.com/dwildt/priority](https://github.com/dwildt/priority)
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run build`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Check the documentation in `/tasks/`
- Review test examples in `/tests/` and `/cypress/`
- Open an issue on GitHub