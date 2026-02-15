# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly by emailing **security@gruber.dev** (or open a [private security advisory](https://github.com/gruberb/workledger/security/advisories/new) on GitHub).

Please do **not** open a public issue for security vulnerabilities.

## Scope

WorkLedger is a local-first application. How your data is handled depends on which features you enable:

### Local mode (default)
- All data (entries, settings) stored in your browser's IndexedDB — **unencrypted**
- No data leaves the browser
- No authentication, no server communication

### Sync mode (opt-in)
- Entries are end-to-end encrypted using your sync ID as the key
- The sync server sees metadata only: entry IDs, timestamps, archived/deleted flags
- Your sync ID is stored unencrypted in IndexedDB — treat it like a password

### AI features (opt-in)
- Note content is sent to the configured LLM provider (Ollama, Hugging Face, or a custom server)
- API keys are stored unencrypted in IndexedDB
- Ollama runs locally by default; other providers send data over the network

### Relevant concerns
- XSS via editor content or imported data
- Malicious content in imported JSON files
- Dependencies with known vulnerabilities
- Unencrypted local storage of API keys and sync IDs
