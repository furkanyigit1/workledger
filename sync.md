# WorkLedger Sync — Frontend Design

## Overview

Optional background sync so notes can be accessed across devices. Follows Mullvad's model: no login/password, just a randomly generated sync ID. The sync ID also serves as the encryption key (derived via PBKDF2), so the server never sees plaintext note content. Losing the sync ID = losing remote access.

---

## New Feature Module: `src/features/sync/`

```
src/features/sync/
  index.ts                          -- Public API exports
  types/sync.ts                     -- SyncMode, SyncConfig, SyncStatus types
  storage/sync-settings.ts          -- IndexedDB persistence for sync config
  hooks/useSync.ts                  -- Core sync hook (push/pull/merge lifecycle)
  utils/crypto.ts                   -- AES-256-GCM encrypt/decrypt via WebCrypto
  utils/integrity.ts                -- SHA-256 integrity hash computation
  utils/sync-api.ts                 -- HTTP client for sync server endpoints
  utils/merge.ts                    -- LWW merge logic for pulled entries
  utils/sync-events.ts              -- Custom DOM event helpers
  components/StorageSubmenu.tsx      -- Settings UI for sync configuration
  components/SyncStatusIndicator.tsx -- Status dot/spinner in sidebar
```

---

## Types

```typescript
type SyncMode = "local" | "remote";

interface SyncConfig {
  mode: SyncMode;
  syncId: string | null;
  salt: string | null;        // base64-encoded, received from server on account creation
  lastSyncSeq: number;
  lastSyncAt: number | null;
}

type SyncPhase = "idle" | "pushing" | "pulling" | "merging" | "error";

interface SyncStatus {
  phase: SyncPhase;
  error: string | null;
  lastSyncAt: number | null;
  pendingChanges: number;
}
```

---

## Client-Side Encryption

All encryption/decryption happens in the browser via the Web Crypto API. The server never sees plaintext.

### Key Derivation

```
PBKDF2(syncId, salt, 100000, SHA-256) → 256-bit AES-GCM key
```

- `syncId`: the user's sync ID string (e.g. `wl-a7b3c9d2e1f4`)
- `salt`: 16 random bytes generated server-side on account creation, stored in `accounts` table
- The derived key is held in memory only — never written to IndexedDB

### Encrypt/Decrypt Flow

```
Push: entry → JSON.stringify(blocks+tags+dayKey) → SHA-256 integrityHash → AES-256-GCM encrypt → send {encryptedPayload, integrityHash}
Pull: receive {encryptedPayload, integrityHash} → AES-256-GCM decrypt → verify SHA-256 matches → parse JSON → merge into IndexedDB
```

### `utils/crypto.ts` API

```typescript
export async function deriveKey(syncId: string, salt: Uint8Array): Promise<CryptoKey>;
export async function encrypt(key: CryptoKey, plaintext: string): Promise<ArrayBuffer>;
export async function decrypt(key: CryptoKey, ciphertext: ArrayBuffer): Promise<string>;
```

- `encrypt` generates a random 12-byte IV, prepends it to the ciphertext
- `decrypt` reads the first 12 bytes as IV, decrypts the rest

### `utils/integrity.ts` API

```typescript
export async function computeIntegrityHash(entry: EntryPlaintext): Promise<string>;
export function verifyIntegrityHash(entry: EntryPlaintext, expectedHash: string): Promise<boolean>;
```

- Canonical form: `JSON.stringify` with sorted keys
- Returns hex-encoded SHA-256

---

## Integration with Auto-Save

Minimal modification to existing code. Add custom DOM events to `useEntries.ts` (4 one-line additions) following the existing `workledger:navigate-entry` pattern:

```typescript
// In useEntries.ts — after dbUpdateEntry succeeds:
window.dispatchEvent(new CustomEvent("workledger:entry-changed", { detail: { entryId } }));

// After dbDeleteEntry succeeds:
window.dispatchEvent(new CustomEvent("workledger:entry-deleted", { detail: { entryId } }));

// After dbCreateEntry succeeds:
window.dispatchEvent(new CustomEvent("workledger:entry-changed", { detail: { entryId } }));

// After archive toggle succeeds:
window.dispatchEvent(new CustomEvent("workledger:entry-changed", { detail: { entryId } }));
```

SyncProvider listens for these events → marks entries dirty → debounced push (2s after last change).

---

## Sync Lifecycle

1. **User enables Remote**: enters or generates sync ID in Storage submenu
2. **Validate**: `GET /accounts/validate` to check sync ID exists on server
3. **Key derivation**: derive AES key from sync ID + salt (salt from validate response or account creation)
4. **Initial sync**: `POST /sync/full` — encrypt all local entries, send to server, receive merged result, decrypt and store
5. **Ongoing sync**:
   - Pull every 30s (only when tab is visible, via `document.visibilityState`)
   - Push 2s after local changes (debounced, triggered by DOM events)
   - Cycle: pull first, then push — reduces conflicts
6. **Offline**: changes accumulate locally. On reconnect, queue is reconstructed by comparing `updatedAt > lastSyncAt`
7. **Disconnect**: user switches back to Local mode, sync stops, derived key is discarded

---

## Provider Hierarchy Change

```
ThemeContext → EntriesProvider → SyncProvider → SidebarProvider → FocusModeProvider → AIProvider
```

SyncProvider inserted after EntriesProvider (needs entry data access), before SidebarProvider.

### SyncProvider Responsibilities

- Holds `SyncConfig` and `SyncStatus` in state
- Manages the derived `CryptoKey` in a ref (never in state/storage)
- Sets up `setInterval` for periodic pull (30s)
- Listens for `workledger:entry-changed` / `workledger:entry-deleted` events
- Debounces push calls
- Exposes via context: `syncStatus`, `connect(syncId)`, `disconnect()`, `generateSyncId()`, `syncNow()`

---

## UI: Storage Submenu

Extends the existing submenu pattern in SidebarSettings. Add `"storage"` to the submenu type:

```typescript
type Submenu = "theme" | "font" | "storage" | null;
```

### Main Menu Trigger

Added to the settings dropdown alongside Theme and Font:

```
[cloud icon]  Storage    Local  >
```

Shows current mode ("Local" or "Remote") as the right-side label.

### Storage Submenu — Local Mode (Default)

```
< STORAGE
─────────────────────
  [Local ✓]  [Remote]     ← segmented toggle

  12 entries · 5 tags
```

Switching to Remote reveals the sync ID controls.

### Storage Submenu — Remote Mode (Not Connected)

```
< STORAGE
─────────────────────
  [Local]  [Remote ✓]     ← segmented toggle

  Sync ID
  [wl-____________] [Generate]  ← text input + Generate button
                    [Connect]   ← appears once field has a value

  12 entries · 5 tags
```

- **Generate**: calls `POST /accounts` on the sync server, fills the text field with the new sync ID
- **Connect**: validates the ID via `GET /accounts/validate`, then performs initial full sync
- User can also paste an existing sync ID from another device
- Input validates format: must match `wl-` + 12 hex chars

### Storage Submenu — Remote Mode (Connected)

```
< STORAGE
─────────────────────
  [Local]  [Remote ✓]     ← segmented toggle

  Sync ID
  wl-a7b3c9d2e1f4   [📋]  ← read-only display + copy-to-clipboard button

  ● Connected              ← green dot when idle
  Last sync: 2 min ago

  [Disconnect]             ← reverts to Local mode, clears sync config

  12 entries · 5 tags
```

### Status Indicator States

| Phase | Display |
|---|---|
| `idle` (connected) | Green dot + "Connected" |
| `pushing` / `pulling` / `merging` | Spinner + "Syncing..." |
| Success (2s after sync) | Checkmark + "Synced just now" |
| `error` | Red dot + error message (e.g. "Network error — retrying...") |

### SyncStatusIndicator Component

Small component rendered in the sidebar footer (next to entry/tag stats). Shows a colored dot reflecting current sync phase. Only visible when mode is "remote".

---

## Files Modified (Existing Code)

| File | Change |
|---|---|
| `src/features/entries/hooks/useEntries.ts` | Add 4 `CustomEvent` dispatches after create/update/delete/archive operations |
| `src/features/entries/storage/entries.ts` | Export new `getAllEntries()` function for full sync |
| `src/features/entries/index.ts` | Add `getAllEntries` to public API |
| `src/app/AppProviders.tsx` | Import and insert `SyncProvider` between `EntriesProvider` and `SidebarProvider` |
| `src/app/App.tsx` | Pass sync-related props down to Sidebar if needed |
| `src/features/sidebar/components/Sidebar.tsx` | Pass submenu props to SidebarSettings |
| `src/features/sidebar/components/SidebarSettings.tsx` | Add `"storage"` submenu type, add Storage trigger row, render `StorageSubmenu` |

---

## New Files

| File | Purpose |
|---|---|
| `src/features/sync/index.ts` | Public API: exports `SyncProvider`, `useSync`, types |
| `src/features/sync/types/sync.ts` | `SyncMode`, `SyncConfig`, `SyncStatus`, `SyncPhase` |
| `src/features/sync/storage/sync-settings.ts` | Read/write `SyncConfig` to IndexedDB (new object store) |
| `src/features/sync/hooks/useSync.ts` | Core hook: manages sync lifecycle, exposes context |
| `src/features/sync/utils/crypto.ts` | `deriveKey`, `encrypt`, `decrypt` using WebCrypto |
| `src/features/sync/utils/integrity.ts` | `computeIntegrityHash`, `verifyIntegrityHash` |
| `src/features/sync/utils/sync-api.ts` | HTTP client for all `/api/v1/` endpoints |
| `src/features/sync/utils/merge.ts` | LWW merge logic: compare `updatedAt`, apply winner |
| `src/features/sync/utils/sync-events.ts` | Helpers for dispatching/listening to sync DOM events |
| `src/features/sync/components/StorageSubmenu.tsx` | Full storage settings UI |
| `src/features/sync/components/SyncStatusIndicator.tsx` | Dot/spinner status display |

---

## Edge Cases

| Scenario | Resolution |
|---|---|
| Device A creates ID, Device B enters same ID | B does full sync, merging both datasets via LWW |
| Both devices edit same entry while offline | LWW by `updatedAt` — later write wins |
| Delete on Device A, edit on Device B | LWW — later timestamp wins. If delete is newer, entry stays deleted. If edit is newer, entry is restored with edits. |
| Network failure mid-push | Retry with exponential backoff (1s, 2s, 4s, max 30s). Push is idempotent — safe to retry. |
| App closed with pending changes | No in-memory queue persisted. On reload, reconstruct dirty set by comparing each entry's `updatedAt > lastSyncAt`. |
| Invalid/expired sync ID | Show error in Storage submenu, revert to disconnected state |
| Integrity hash mismatch on pull | Flag entry as corrupted in console warning, skip merge for that entry, surface error in UI |
| Tab hidden for extended period | Pull paused while hidden. On visibility change back to visible, immediate pull to catch up. |
| Sync ID lost | No recovery possible — this is by design (zero-knowledge). User starts fresh with a new ID. Emphasize this in UI copy. |

---

## IndexedDB Schema Addition

Add a new object store to the existing database in `src/storage/db.ts`:

```typescript
// In the upgrade handler, add:
if (!db.objectStoreNames.contains("syncSettings")) {
  db.createObjectStore("syncSettings");
}
```

Stores a single `SyncConfig` object under key `"config"`.

---

## Server URL Configuration

The sync server URL defaults to the production endpoint but can be overridden for development:

```typescript
const SYNC_SERVER_URL = import.meta.env.VITE_SYNC_SERVER_URL ?? "https://sync.workledger.app";
```

Add `VITE_SYNC_SERVER_URL` to `.env.development` for local testing.
