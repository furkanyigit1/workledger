## React component & state patterns

When writing or modifying React components:

1. **Keep components small and focused.** If a component has more than 5-6 props, split it or use composition (`children`/slots). Never define nested render functions inside a component — extract them as separate components.

2. **State starts local, lifts only when needed.** Use `useState` first. Only move to Context when multiple distant components need the same state. Don't pre-emptively globalize.

3. **Wrap third-party components.** BlockNote, Excalidraw, and other external UI libraries should always be behind app-specific wrapper components so they can be swapped without touching feature code.

4. **Error boundaries around risky integrations.** Excalidraw, editor, and AI features each need error boundaries so failures don't crash the whole app.

5. **Use `useState(() => expensive())` not `useState(expensive())`.** The initializer function form avoids re-running on every render.

6. **Categorize state by type:**
   - Component state → `useState`/`useReducer`
   - Feature state → React Context (one per feature)
   - Storage state → IndexedDB via `src/storage/` wrappers
   - Don't mix these categories in a single store
