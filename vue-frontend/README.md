# Vue Frontend Application

A modern Vue.js 3 application built with TypeScript, Vite, and Element Plus. This frontend application provides a user interface for interacting with an API, featuring user profile management and other functionalities.

## 🚀 Features

- **Vue 3** - Composition API with TypeScript
- **Vite** - Next Generation Frontend Tooling
- **Element Plus** - UI Component Library
- **Vue Router** - Client-side routing
- **Pinia** - State Management
- **Axios** - HTTP Client
- **TypeScript** - Static type checking
- **ESLint + Prettier** - Code linting and formatting

## 📁 Project Structure

```
src/
├── assets/         # Static assets (images, fonts, etc.)
├── components/     # Reusable Vue components
├── composables/    # Vue composition API functions
├── constants/      # Application constants
├── router/         # Vue Router configuration
├── services/       # API services and HTTP clients
├── stores/         # Pinia stores
├── styles/         # Global styles and CSS variables
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── views/          # Page components
├── App.vue         # Root Vue component
└── main.ts         # Application entry point
```

## 🛠️ Prerequisites

- Node.js (^20.19.0 or >=22.12.0)
- npm (comes with Node.js)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Development Server

Start the development server with hot-reload:

```bash
npm run dev
```

### 3. Build for Production

Build the application for production:

```bash
npm run build
```

### 4. Linting and Formatting

Run ESLint for code linting:

```bash
npm run lint
```

Format code with Prettier:

```bash
npm run format
```

## 🛠️ Development

### Available Scripts

- `dev` - Start development server
- `build` - Build for production
- `preview` - Preview production build locally
- `type-check` - Run TypeScript type checking
- `lint` - Run all linters
- `format` - Format code with Prettier

## 🎨 Styling

This project uses:
- Element Plus component library
- CSS custom properties for theming
- Component-scoped styles with `<style scoped>`

## 🔌 API Integration

The application uses Axios for API requests. API services are located in `src/services/`.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
