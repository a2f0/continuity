import { formatMonthDay } from "../../src/canon/dates";
import type { Note } from "../../src/canon/types";

// Maya's notes. A note's title is its first line. Notes that mention canon
// facts read them from the context, so a birthday change cannot leave a note
// saying something else.
export const notes: readonly Note[] = [
  {
    id: "design-review",
    text: [
      "Design review: onboarding refresh",
      "Priya wants the empty states reworked before Thursday.",
      "- Simplify the sync status copy",
      "- New illustrations for offline mode",
      "- Redlines to engineering by Friday",
    ].join("\n"),
  },
  {
    id: "sunday-dinner",
    text: [
      "Sunday dinner at Mom's",
      "- Bring the flan; Theo is making arroz con pollo",
      "- Pick up Mom's prescription at Juniper Pharmacy",
      "- Ask Sam about the porch railing (again)",
    ].join("\n"),
  },
  {
    id: "gift-ideas",
    text: ({ character }) =>
      [
        "Gift ideas",
        `- Theo (${formatMonthDay(character("theo-reyes").birthDate)}): Japanese whetstone set`,
        `- Mom (${formatMonthDay(character("rosa-reyes").birthDate)}): framed print of Aurelia harbor`,
        `- Daniel (${formatMonthDay(character("daniel-okafor").birthDate)}): new climbing shoes, size 11`,
      ].join("\n"),
  },
  {
    id: "lake-kestrel-weekend",
    text: [
      "Packing list: Lake Kestrel weekend",
      "- Passport and driver's license",
      "- Bike helmet, lights, spare tube",
      "- Rain shells",
      "- Pepper's food and leash (Hana can keep him if the cabin says no dogs)",
    ].join("\n"),
  },
  {
    id: "bike-maintenance",
    text: [
      "Bike maintenance",
      "- Chain replaced at 2,140 mi (August)",
      "- Marcus says go tubeless before gravel season",
      "- Check brake pads before the Lake Kestrel ride",
    ].join("\n"),
  },
  {
    id: "home-codes",
    text: [
      "Home codes",
      "Building door: 4417#",
      "Storage unit 22-B: 3-9-14",
      "Guest Wi-Fi: AlderCrest-3B / pepper-loves-the-beach",
    ].join("\n"),
  },
];
