import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
} from "@blocknote/core";
import { excalidrawBlockSpec } from "./ExcalidrawBlock.tsx";
import { entryLinkSpec } from "./EntryLinkSpec.tsx";

export const workledgerSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    excalidraw: excalidrawBlockSpec() as any,
  },
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entryLink: entryLinkSpec as any,
  },
});

export type WorkLedgerSchema = typeof workledgerSchema;
