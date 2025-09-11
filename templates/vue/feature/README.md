# Vue Feature Module Template

Generates modules/__FeatureName__/ with:
- pages/: ListView.vue, DetailView.vue, FormView.vue
- components/: domain widgets
- services/: API client usage (OpenAPI TS or api.ts)
- stores/: Pinia store
- types/: TS types
- routes.ts: flat routes with meta (title/requiresAuth/requiredRoles)
- i18n/: locale messages
- tests/: basic vitest suites

Rules: follow .cursorrules and boundaries; use design tokens; lazy-load routes.
