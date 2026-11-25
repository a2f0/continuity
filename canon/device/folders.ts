import type { SharedFolder } from "../../src/canon/types";

// Folders tearleads creates under Maya's root. The Family group can write in
// Family, so Maya starts the plan and each relative adds a line as themselves.
export const folders: readonly SharedFolder[] = [
  {
    name: "Family",
    grants: [{ group: "Family", access: "write" }],
    notes: [
      {
        id: "thanksgiving",
        text: [
          "Thanksgiving at Mom's",
          "Thursday, November 26. Dinner at 4.",
          "- Maya: flan and the folding chairs",
        ].join("\n"),
        additions: [
          {
            author: "rosa-reyes",
            text: "- Rosa: turkey is ordered from Juniper Market; I'll pick it up Wednesday",
          },
          {
            author: "daniel-okafor",
            text: "- Daniel: cider, and I'll set up the long table",
          },
          {
            author: "theo-reyes",
            text: "- Theo: pumpkin empanadas and the playlist",
          },
        ],
      },
    ],
  },
];
