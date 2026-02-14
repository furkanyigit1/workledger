import { useEffect } from "react";
import type { FontFamily } from "../themePresets.ts";

const FONT_URLS: Partial<Record<FontFamily, string>> = {
  figtree: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap",
  "plus-jakarta-sans": "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
  "dm-sans": "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap",
  urbanist: "https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&display=swap",
  inter: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  monospace: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap",
  serif: "https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&display=swap",
};

export function useFontLoader(fontFamily: FontFamily) {
  useEffect(() => {
    const url = FONT_URLS[fontFamily];
    if (!url) return;

    const id = `workledger-font-${fontFamily}`;
    if (document.getElementById(id)) return;

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
  }, [fontFamily]);
}
