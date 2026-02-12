import { createReactInlineContentSpec } from "@blocknote/react";

export const entryLinkSpec = createReactInlineContentSpec(
  {
    type: "entryLink" as const,
    propSchema: {
      entryId: { default: "" },
      displayText: { default: "" },
    },
    content: "none",
  },
  {
    render: (props) => {
      const { entryId, displayText } = props.inlineContent.props;

      const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        window.dispatchEvent(
          new CustomEvent("workledger:navigate-entry", {
            detail: { entryId },
          }),
        );
      };

      return (
        <span
          className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 cursor-pointer hover:bg-amber-200 transition-colors"
          onClick={handleClick}
          data-entry-link={entryId}
        >
          {displayText || "Untitled entry"}
        </span>
      );
    },
  },
);
