# Copilot Instructions for AI Agents

## Project Overview

This is an Angular project structured for a food delivery or restaurant review platform. The codebase is organized by user roles (cliente, restaurante, public) and features modular separation of components, pages, and services.

## Key Architectural Patterns

- `src/app/users/cliente/`, `restaurante/`, and `public/` contain role-specific components and pages.
- Shared logic and models are in `src/app/core/` and `src/app/models/`.
- **Service Layer:**
  - All API and business logic is handled in `src/app/services/` and `src/app/core/services/`.
  - Services are injected via Angular's dependency injection and follow the singleton pattern.
- **Routing:**
  - Route definitions are in `src/app/app.routes.ts`.
- **Interceptors:**
  - HTTP interceptors (e.g., for auth) are in `src/app/core/interceptors/`.

## Developer Workflows

- **Start Dev Server:** `ng serve` (or use the npm `start` script)
- **Run Tests:** `ng test` (or npm `test`)
- **Build:** `ng build`
- **Scaffold Components:** `ng generate component <name>`

## Project-Specific Conventions

- **Component Organization:**
  - Each component/page has its own folder with `.ts`, `.html`, and `.css` files.
  - Use the Angular CLI for generating new components to maintain consistency.
- **Service Naming:**
  - Service files are named as `<feature>.service.ts`.
- **Models:**
  - Data models are in `src/app/models/` and `src/app/core/models/`.
- **No direct DOM manipulation:**
  - Use Angular templates and bindings for UI logic.

## Integration & Communication

- **API Communication:**
  - All HTTP requests go through services in `services/` or `core/services/`.
  - Auth flows use interceptors in `core/interceptors/`.
- **Cross-component Communication:**
  - Use Angular services for state sharing and event communication.

## Examples

- To add a new page for "cliente":

  1. Generate with `ng generate component users/cliente/pages/new-page`
  2. Add route in `app.routes.ts`
  3. Add business logic in a service in `services/`

- To add a new API integration:
  1. Create a new service in `services/`
  2. Inject and use it in the relevant component

## References

- Main entry: `src/main.ts`
- App config: `src/app/app.config.ts`
- Routing: `src/app/app.routes.ts`
- Example service: `src/app/services/restaurante.service.ts`

---

**Keep instructions concise and project-specific. Update this file if major patterns or workflows change.**
