import { on } from "../../../utils/events.ts";

export function onEntryChanged(handler: (entryId: string) => void): () => void {
  return on("entry-changed", ({ entryId }) => handler(entryId));
}

export function onEntryDeleted(handler: (entryId: string) => void): () => void {
  return on("entry-deleted", ({ entryId }) => handler(entryId));
}
