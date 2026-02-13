## Feature boundary rules

When adding or modifying imports in `src/features/`:

1. **Cross-feature imports must use public APIs only.** Import from `../../<feature>/index.ts`, never from internal paths like `../../<feature>/context/`, `../../<feature>/hooks/`, `../../<feature>/storage/`, etc.

2. **Shared utilities live in `src/utils/`, `src/hooks/`, `src/components/`, `src/storage/`.** These shared directories must never import from `src/features/`.

3. **General-purpose utilities (dates, colors, ID generation) belong in `src/utils/`.** Don't put feature-agnostic helpers inside a feature's `utils/` folder.

4. **When adding a new export to a feature**, add it to that feature's `index.ts` — don't let consumers reach into internal files.

5. **Dependency direction:** `shared → features → app`. Features depend on shared code and other features' public APIs. The `app/` layer composes features together.
