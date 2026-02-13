# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.1.1] - 2026-02-12

### Changed

- Extracted shared SSE stream parser for HuggingFace and Custom Server providers
- Extracted `ConfirmAction` component in EntryCard to reduce duplication
- Extracted resize handler factory in ExcalidrawBlock
- Extracted `SidebarSettings` component from Sidebar
- Replaced `Promise.resolve().then()` anti-pattern with derived state in hooks
- Fixed hook dependency arrays in AISidebar
- Improved error type guard in useAIConversation

### Removed

- Dead code: unused `useCurrentDay` hook, `getLast30DayKeys`, `getFrameworksByCategory`, `getConversation`, `deleteConversation`
- Removed `process.env.IS_PREACT` define from Vite config
- Removed version callouts from README and landing page copy

### Fixed

- Type safety: removed unnecessary type casts in App and ai-settings
- Added try-catch around JSON.parse in Ollama streaming
- Added `data-1p-ignore` to inputs to prevent 1Password autofill popups
- Renamed `checking` to `loading` in useAIFeatureGate for consistency

## [1.1.0] - 2026-02-12

### Added

- Optional AI thinking sidebar with 10 structured frameworks
  - The Thinker's Toolkit, First Principles, Six Thinking Hats, TRIZ, Design Thinking, Socratic Method, Systems Thinking, Lateral Thinking, OODA Loop, Theory of Constraints
- Three AI provider options: Ollama (local), Hugging Face (remote), Custom OpenAI-compatible server
- Lightbulb icon on note cards to open AI sidebar with that note's content
- Streaming responses with markdown rendering
- Follow-up suggestions and step navigation within each framework
- Conversation persistence in IndexedDB
- AI setup guide with connection testing
- AI settings panel (provider, model, temperature, max tokens)
- Feature-gated behind settings toggle -- off by default
- `Cmd+Shift+I` keyboard shortcut to toggle AI sidebar
- Responsive auto-collapse of left sidebar when both sidebars are open
- Landing page AI section with framework details
- New dependencies: `react-markdown`, `remark-gfm`

## [1.0.0] - 2026-02-12

### Added

- Daily entries organized by day with timestamps
- Rich text editing powered by BlockNote with slash commands
- Inline Excalidraw drawings via `/drawing` command
- Tagging system for entry categorization and filtering
- Full-text search across all entries and tags (`Cmd+K`)
- Sidebar filtering by tag or type
- Archive and restore functionality
- Import/export entries as JSON
- Wiki-style `[[links]]` between entries
- Keyboard shortcuts: `Cmd+J` (new entry), `Cmd+K` (search), `Cmd+\` (sidebar)
- Local-first storage with IndexedDB -- no server required
- Landing page

[1.1.1]: https://github.com/gruberb/workledger/releases/tag/v1.1.1
[1.1.0]: https://github.com/gruberb/workledger/releases/tag/v1.1.0
[1.0.0]: https://github.com/gruberb/workledger/releases/tag/v1.0.0
