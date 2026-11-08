# Frontend Code Standards

> **Scope:** Universal frontend principles. Technology-specific additions via project-context.md.
> **Load:** On demand when performing frontend reviews or development.

---

## Universal Principles

### Component Design
- One component, one responsibility.
- Keep components small. When a component exceeds 150 lines, consider extracting sub-components.
- Separate presentation from business logic and data fetching.
- Props should be the minimum necessary. Do not thread unrelated data through components.

### State Management
- Minimize global state. Prefer local component state when data is not shared.
- Colocate state as close to its usage as possible.
- Do not mutate state directly. Always use the framework's state setter.

### Accessibility
- All interactive elements must be keyboard accessible.
- Images must have descriptive `alt` attributes.
- Forms must have associated labels.
- Color must not be the only way to convey information.

### Performance
- Lazy load routes and heavy components.
- Do not perform expensive operations in render functions.
- Avoid unnecessary re-renders (memoize when measurable benefit exists).
- Paginate or virtualize long lists.

### Security
- Sanitize before inserting HTML dynamically (`dangerouslySetInnerHTML`, `v-html`, `innerHTML`).
- Do not store sensitive data in `localStorage` or `sessionStorage`.
- Apply Content Security Policy headers.
- Validate data from API responses before trusting it.

---

## React / Next.js Specifics

### Components
- Use functional components with hooks. No class components in new code.
- Use TypeScript interfaces for all props.
- Use named exports, not default exports, for components.
- Use `React.memo()` only when profiling identifies unnecessary re-renders.

### Hooks
- Follow rules of hooks (call only at top level, only in React functions).
- Extract complex hook logic into custom hooks.
- Include all reactive values in `useEffect` dependency arrays.
- Clean up side effects in `useEffect` return functions.

### Data Fetching
- Use React Query / SWR / Next.js data fetching patterns — not bare `useEffect` with `fetch`.
- Handle loading, error, and empty states explicitly.
- Do not expose API error details to end users.

### Forms
- Use a form library (React Hook Form, Formik) for complex forms.
- Validate both client-side (UX) and server-side (security).
- Disable submit buttons on submission to prevent double submission.

---

## Vue / Nuxt Specifics

- Use Composition API (not Options API) in new code.
- Define prop types with `defineProps<Props>()` using TypeScript.
- Avoid `v-html` unless the content is explicitly sanitized.
- Use `defineEmits` for component events with type safety.

---

## General CSS / Styling

- Use CSS custom properties (variables) for design tokens.
- Prefer utility frameworks (Tailwind) or CSS Modules to avoid global CSS conflicts.
- Do not use `!important` to work around specificity issues.
- Test responsive layouts at defined breakpoints.
