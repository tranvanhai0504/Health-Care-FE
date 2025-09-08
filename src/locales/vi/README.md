# Vietnamese Locale Module Structure

This directory contains the Vietnamese language translations organized by feature modules for better maintainability.

## File Structure

```
vi/
├── index.ts           # Main module loader that combines all translations
├── common.json        # Common UI elements (buttons, labels, etc.)
├── header.json        # Header component translations
├── chat.json          # Chat/AI assistant related translations
├── navigation.json    # Navigation, breadcrumbs, menus
├── auth.json          # Authentication pages (login, register, setup)
├── dashboard.json     # Dashboard pages (booking, schedules, etc.)
├── landing.json       # Landing page components
├── admin.json         # Admin panel translations
├── doctor.json        # Doctor dashboard and features
└── pagination.json    # Pagination component translations
```

## Module Descriptions

### `common.json`
Contains commonly used translations across the application:
- Basic actions (save, cancel, edit, delete)
- Status messages (loading, error, success)
- General UI elements

### `header.json`
Header component specific translations:
- Language selector
- Basic header labels

### `chat.json`
AI Assistant and chat functionality:
- Welcome messages
- Chat suggestions
- Schedule confirmation dialogs
- Message input placeholders

### `navigation.json`
Navigation related translations:
- Main navigation items
- Breadcrumbs
- User profile menu
- Notifications

### `auth.json`
Authentication flow translations:
- Login page
- Registration page  
- OTP verification
- Account setup process

### `dashboard.json`
Dashboard pages and features:
- Booking system
- Schedule management
- Medical services
- Health packages
- Prescriptions
- Profile settings

### `landing.json`
Landing page components:
- Hero section
- Services overview
- Features highlights
- Specialties section
- Blog section

### `admin.json`
Admin panel functionality:
- User management
- Schedule management
- Form validation messages
- Admin navigation

### `doctor.json`
Doctor dashboard features:
- Medical examinations
- Prescription creation
- Doctor schedules
- Patient management

### `pagination.json`
Pagination component:
- Page navigation
- Items per page
- Page indicators

## Usage

The modular structure is automatically combined by the `index.ts` file. The i18n configuration imports from `@/locales/vi` which loads all modules.

To add new translations:
1. Add them to the appropriate module file
2. If a new module is needed, create a new JSON file and add it to `index.ts`

## Benefits

- **Maintainability**: Easier to find and update specific translations
- **Team Collaboration**: Multiple developers can work on different modules
- **Performance**: Potential for lazy loading in the future
- **Organization**: Clear separation of concerns by feature area