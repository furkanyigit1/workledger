import type { PartialBlock } from "@blocknote/core";

export interface EntryTemplate {
  id: string;
  name: string;
  icon: string;
  tag: string;
  blocks: PartialBlock[];
}

function italic(text: string) {
  return [{ type: "text" as const, text, styles: { italic: true, textColor: "gray" } }];
}

export const ENTRY_TEMPLATES: EntryTemplate[] = [
  {
    id: "decision-log",
    name: "Decision Log",
    icon: "D",
    tag: "decision",
    blocks: [
      { type: "heading", props: { level: 2 }, content: "Context" },
      { type: "paragraph", content: italic("What situation or problem prompted this decision?") },
      { type: "bulletListItem", content: italic("Who is affected?") },
      { type: "bulletListItem", content: italic("What constraints exist (time, budget, tech)?") },
      { type: "bulletListItem", content: italic("What alternatives were considered?") },
      { type: "heading", props: { level: 2 }, content: "Decision" },
      { type: "paragraph", content: italic("State the decision clearly in one sentence.") },
      { type: "paragraph", content: italic("Why this option over the alternatives?") },
      { type: "heading", props: { level: 2 }, content: "Consequences" },
      { type: "bulletListItem", content: italic("What improves as a result?") },
      { type: "bulletListItem", content: italic("What trade-offs are we accepting?") },
      { type: "bulletListItem", content: italic("What risks does this introduce?") },
      { type: "heading", props: { level: 2 }, content: "Follow-up" },
      { type: "checkListItem", content: italic("Communicate decision to team") },
      { type: "checkListItem", content: italic("Review decision in 2 weeks") },
      { type: "paragraph", content: "" },
    ],
  },
  {
    id: "debugging-session",
    name: "Debugging Session",
    icon: "B",
    tag: "debugging",
    blocks: [
      { type: "heading", props: { level: 2 }, content: "Problem" },
      { type: "paragraph", content: italic("What is the symptom? What did you expect vs. what happened?") },
      { type: "bulletListItem", content: italic("Error message or unexpected behavior:") },
      { type: "bulletListItem", content: italic("How to reproduce:") },
      { type: "bulletListItem", content: italic("When did it start? What changed recently?") },
      { type: "heading", props: { level: 2 }, content: "Hypothesis" },
      { type: "numberedListItem", content: italic("Most likely cause and why you think so") },
      { type: "numberedListItem", content: italic("Alternative cause") },
      { type: "heading", props: { level: 2 }, content: "Investigation" },
      { type: "checkListItem", content: italic("Check logs / error output") },
      { type: "checkListItem", content: italic("Reproduce in isolation") },
      { type: "checkListItem", content: italic("Add logging / breakpoints") },
      { type: "checkListItem", content: italic("Test hypothesis") },
      { type: "heading", props: { level: 2 }, content: "Root Cause" },
      { type: "paragraph", content: italic("What was actually wrong?") },
      { type: "heading", props: { level: 2 }, content: "Fix" },
      { type: "paragraph", content: italic("What did you change? Link to PR/commit if applicable.") },
      { type: "heading", props: { level: 2 }, content: "Lessons" },
      { type: "bulletListItem", content: italic("What would have caught this sooner?") },
      { type: "bulletListItem", content: italic("Should a test/alert be added?") },
      { type: "paragraph", content: "" },
    ],
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    icon: "M",
    tag: "meeting",
    blocks: [
      { type: "heading", props: { level: 2 }, content: "Meeting Info" },
      { type: "bulletListItem", content: italic("Topic:") },
      { type: "bulletListItem", content: italic("Date:") },
      { type: "bulletListItem", content: italic("Attendees:") },
      { type: "heading", props: { level: 2 }, content: "Agenda" },
      { type: "numberedListItem", content: italic("First topic") },
      { type: "numberedListItem", content: italic("Second topic") },
      { type: "heading", props: { level: 2 }, content: "Discussion Notes" },
      { type: "paragraph", content: italic("Key points, context, and decisions made during the meeting.") },
      { type: "paragraph", content: "" },
      { type: "heading", props: { level: 2 }, content: "Decisions" },
      { type: "bulletListItem", content: italic("Decision 1 — rationale") },
      { type: "heading", props: { level: 2 }, content: "Action Items" },
      { type: "checkListItem", content: italic("Action — @owner — due date") },
      { type: "checkListItem", content: italic("Action — @owner — due date") },
      { type: "heading", props: { level: 2 }, content: "Open Questions" },
      { type: "bulletListItem", content: italic("Question that needs follow-up") },
      { type: "paragraph", content: "" },
    ],
  },
  {
    id: "learning-log",
    name: "Learning Log",
    icon: "L",
    tag: "learning",
    blocks: [
      { type: "heading", props: { level: 2 }, content: "What I Learned" },
      { type: "paragraph", content: italic("Explain the concept in your own words, as if teaching someone else.") },
      { type: "paragraph", content: "" },
      { type: "heading", props: { level: 2 }, content: "Key Takeaways" },
      { type: "bulletListItem", content: italic("Most important insight") },
      { type: "bulletListItem", content: italic("Second insight") },
      { type: "bulletListItem", content: italic("What surprised you?") },
      { type: "heading", props: { level: 2 }, content: "Source" },
      { type: "bulletListItem", content: italic("Article, talk, documentation, conversation, etc.") },
      { type: "bulletListItem", content: italic("Link:") },
      { type: "heading", props: { level: 2 }, content: "How to Apply" },
      { type: "paragraph", content: italic("Where in your current work could you use this?") },
      { type: "checkListItem", content: italic("Try it in a real project") },
      { type: "checkListItem", content: italic("Share with the team") },
      { type: "heading", props: { level: 2 }, content: "Related" },
      { type: "paragraph", content: italic("Link to related entries with [[ or note connections to other topics.") },
      { type: "paragraph", content: "" },
    ],
  },
];
