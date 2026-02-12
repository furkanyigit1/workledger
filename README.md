<p align="center">
  <img src="public/logo.svg" alt="WorkLedger" width="64">
</p>

<h1 align="center">WorkLedger</h1>

<p align="center">An open-source engineering notebook for documenting your daily work.<br>Built with React, BlockNote, and Excalidraw.</p>

<p align="center">
  <img src="landing/images/product.png" alt="WorkLedger" width="720">
</p>

## Features

- **Daily entries** -- Organized by day with timestamps, create entries with `Cmd+J`
- **Rich text editing** -- Powered by [BlockNote](https://blocknotejs.org/) with slash commands for headings, lists, code blocks, and more
- **Inline drawings** -- Embed [Excalidraw](https://excalidraw.com/) diagrams directly in your notes via `/drawing`
- **Tagging** -- Tag entries for easy categorization and filtering
- **Search** -- Full-text search across all entries and tags (`Cmd+K`)
- **Sidebar filtering** -- Click a tag or type to filter entries in real-time
- **Archive & restore** -- Archive old entries to keep your workspace clean, browse and restore them anytime
- **Import & export** -- Export all entries as JSON for backup, import them back anytime
- **Local-first** -- All data stored in IndexedDB, no server required
- **Keyboard-driven** -- `Cmd+J` new entry, `Cmd+K` search, `Cmd+\` toggle sidebar, `Escape` clear filter

## Getting Started

```bash
git clone https://github.com/gruberb/workledger.git
cd workledger
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## License

MIT
