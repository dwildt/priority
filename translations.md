# Internationalization (i18n) Guidelines

## Overview
The Priority Matrix application supports three languages: Portuguese (pt), English (en), and Spanish (es). This document outlines the translation system architecture and guidelines for maintaining multilingual support.

## File Structure
```
src/i18n/
├── en.json          # English translations
├── pt.json          # Portuguese translations
├── es.json          # Spanish translations
└── i18n.js          # Translation system logic
```

## Translation Key Format

### Naming Convention
Use hierarchical keys with dot notation:
```
section.subsection.element
```

### Examples
```json
{
  "matrix.quadrants.urgent_important": "Urgent & Important",
  "matrix.quadrants.not_urgent_important": "Important & Not Urgent",
  "forms.task.title": "Task Title",
  "forms.task.description": "Description",
  "buttons.save": "Save",
  "buttons.cancel": "Cancel",
  "battle.question": "Which task is more important?",
  "reports.title": "Priority Report",
  "reports.the_one": "The One",
  "reports.up_next": "Up Next"
}
```

## Language Files

### English (en.json)
```json
{
  "app": {
    "title": "Priority Matrix",
    "subtitle": "Organize your tasks with the Eisenhower Matrix"
  },
  "matrix": {
    "quadrants": {
      "urgent_important": "Do First",
      "urgent_important_desc": "Urgent & Important",
      "not_urgent_important": "Schedule",
      "not_urgent_important_desc": "Important & Not Urgent",
      "urgent_not_important": "Delegate",
      "urgent_not_important_desc": "Urgent & Not Important",
      "not_urgent_not_important": "Eliminate",
      "not_urgent_not_important_desc": "Not Urgent & Not Important"
    }
  },
  "forms": {
    "task": {
      "title": "Add New Task",
      "name": "Task Name",
      "description": "Description",
      "importance_question": "How important is this task for your goals?",
      "urgency_question": "How urgent is this task?",
      "importance_scale": {
        "1": "Not important",
        "2": "Slightly important",
        "3": "Moderately important",
        "4": "Very important",
        "5": "Extremely important"
      },
      "urgency_scale": {
        "1": "Can wait weeks",
        "2": "Can wait days",
        "3": "Should be done soon",
        "4": "Should be done today",
        "5": "Must be done now"
      }
    }
  },
  "buttons": {
    "add_task": "Add Task",
    "save": "Save",
    "cancel": "Cancel",
    "edit": "Edit",
    "delete": "Delete",
    "battle_mode": "Battle Mode",
    "generate_report": "Generate Report"
  },
  "battle": {
    "title": "Battle Mode",
    "question": "Which task is more important?",
    "task_a": "Task A",
    "task_b": "Task B",
    "choose_a": "Choose A",
    "choose_b": "Choose B",
    "complete": "Battle Complete!",
    "the_one_determined": "The One has been determined"
  },
  "reports": {
    "title": "Priority Report",
    "the_one": "The One",
    "up_next": "Up Next",
    "matrix_overview": "Matrix Overview",
    "generated_on": "Generated on"
  }
}
```

### Portuguese (pt.json)
```json
{
  "app": {
    "title": "Matriz de Prioridades",
    "subtitle": "Organize suas tarefas com a Matriz de Eisenhower"
  },
  "matrix": {
    "quadrants": {
      "urgent_important": "Fazer Primeiro",
      "urgent_important_desc": "Urgente e Importante",
      "not_urgent_important": "Agendar",
      "not_urgent_important_desc": "Importante e Não Urgente",
      "urgent_not_important": "Delegar",
      "urgent_not_important_desc": "Urgente e Não Importante",
      "not_urgent_not_important": "Eliminar",
      "not_urgent_not_important_desc": "Não Urgente e Não Importante"
    }
  },
  "forms": {
    "task": {
      "title": "Adicionar Nova Tarefa",
      "name": "Nome da Tarefa",
      "description": "Descrição",
      "importance_question": "Quão importante é esta tarefa para seus objetivos?",
      "urgency_question": "Quão urgente é esta tarefa?",
      "importance_scale": {
        "1": "Não importante",
        "2": "Pouco importante",
        "3": "Moderadamente importante",
        "4": "Muito importante",
        "5": "Extremamente importante"
      },
      "urgency_scale": {
        "1": "Pode esperar semanas",
        "2": "Pode esperar dias",
        "3": "Deve ser feito em breve",
        "4": "Deve ser feito hoje",
        "5": "Deve ser feito agora"
      }
    }
  },
  "buttons": {
    "add_task": "Adicionar Tarefa",
    "save": "Salvar",
    "cancel": "Cancelar",
    "edit": "Editar",
    "delete": "Excluir",
    "battle_mode": "Modo Batalha",
    "generate_report": "Gerar Relatório"
  },
  "battle": {
    "title": "Modo Batalha",
    "question": "Qual tarefa é mais importante?",
    "task_a": "Tarefa A",
    "task_b": "Tarefa B",
    "choose_a": "Escolher A",
    "choose_b": "Escolher B",
    "complete": "Batalha Completa!",
    "the_one_determined": "A Única foi determinada"
  },
  "reports": {
    "title": "Relatório de Prioridades",
    "the_one": "A Única",
    "up_next": "Próximas",
    "matrix_overview": "Visão Geral da Matriz",
    "generated_on": "Gerado em"
  }
}
```

### Spanish (es.json)
```json
{
  "app": {
    "title": "Matriz de Prioridades",
    "subtitle": "Organiza tus tareas con la Matriz de Eisenhower"
  },
  "matrix": {
    "quadrants": {
      "urgent_important": "Hacer Primero",
      "urgent_important_desc": "Urgente e Importante",
      "not_urgent_important": "Programar",
      "not_urgent_important_desc": "Importante y No Urgente",
      "urgent_not_important": "Delegar",
      "urgent_not_important_desc": "Urgente y No Importante",
      "not_urgent_not_important": "Eliminar",
      "not_urgent_not_important_desc": "No Urgente y No Importante"
    }
  },
  "forms": {
    "task": {
      "title": "Agregar Nueva Tarea",
      "name": "Nombre de la Tarea",
      "description": "Descripción",
      "importance_question": "¿Qué tan importante es esta tarea para tus objetivos?",
      "urgency_question": "¿Qué tan urgente es esta tarea?",
      "importance_scale": {
        "1": "No importante",
        "2": "Poco importante",
        "3": "Moderadamente importante",
        "4": "Muy importante",
        "5": "Extremadamente importante"
      },
      "urgency_scale": {
        "1": "Puede esperar semanas",
        "2": "Puede esperar días",
        "3": "Debería hacerse pronto",
        "4": "Debería hacerse hoy",
        "5": "Debe hacerse ahora"
      }
    }
  },
  "buttons": {
    "add_task": "Agregar Tarea",
    "save": "Guardar",
    "cancel": "Cancelar",
    "edit": "Editar",
    "delete": "Eliminar",
    "battle_mode": "Modo Batalla",
    "generate_report": "Generar Reporte"
  },
  "battle": {
    "title": "Modo Batalla",
    "question": "¿Qué tarea es más importante?",
    "task_a": "Tarea A",
    "task_b": "Tarea B",
    "choose_a": "Elegir A",
    "choose_b": "Elegir B",
    "complete": "¡Batalla Completa!",
    "the_one_determined": "La Única ha sido determinada"
  },
  "reports": {
    "title": "Reporte de Prioridades",
    "the_one": "La Única",
    "up_next": "Siguientes",
    "matrix_overview": "Vista General de la Matriz",
    "generated_on": "Generado el"
  }
}
```

## Translation System Implementation

### Core i18n.js Structure
```javascript
class I18n {
  constructor() {
    this.currentLanguage = 'en';
    this.translations = {};
    this.fallbackLanguage = 'en';
  }

  async loadLanguage(lang) {
    // Load translation file
    // Set as current language
    // Update DOM
  }

  t(key, params = {}) {
    // Get translation for key
    // Handle interpolation
    // Return fallback if not found
  }

  setLanguage(lang) {
    // Change current language
    // Reload translations
    // Update interface
  }
}
```

## Guidelines for Translators

### 1. Context Awareness
- Understand the UI context where text appears
- Consider character limits for buttons and labels
- Maintain consistent terminology across the application

### 2. Cultural Adaptation
- Use appropriate date/time formats for each locale
- Consider cultural differences in task prioritization language
- Adapt examples to be culturally relevant

### 3. Technical Considerations
- Keep HTML markup intact in translations
- Don't translate variable names in interpolation: `{taskName}`
- Maintain the same parameter structure across languages

### 4. Quality Assurance
- Test all translations in the actual UI
- Verify text fits within interface elements
- Check for proper accent and special character rendering

## Adding New Languages

### 1. Create Language File
```bash
# Create new language file
cp src/i18n/en.json src/i18n/[language_code].json
```

### 2. Update Language Support
- Add language option to language switcher
- Update HTML lang attribute
- Add language to supported languages list

### 3. Translate Content
- Translate all keys maintaining the JSON structure
- Test with actual content in the interface
- Verify cultural appropriateness

## Maintenance

### Adding New Keys
1. Add to English file first (source of truth)
2. Add to all other language files
3. Update translation documentation
4. Test in all supported languages

### Key Deprecation
1. Mark as deprecated in comments
2. Keep for one release cycle
3. Remove from all language files simultaneously
4. Update documentation