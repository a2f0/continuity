import type { Passcode } from "../../src/canon/types";

// Maya's password manager: the household's door, safe, and network codes.
export const passcodes: readonly Passcode[] = [
  {
    id: "garage-door",
    title: "Garage door",
    password: "7302",
    notes: "Keypad left of the garage door; press Enter after the code.",
    tags: ["home"],
  },
  {
    id: "home-safe",
    title: "Home safe",
    password: "28-61-03",
    notes: "Bedroom closet safe. Passports and the spare car key live here.",
    tags: ["home"],
  },
  {
    id: "building-door",
    title: "Building door",
    password: "4417#",
    tags: ["home"],
  },
  {
    id: "storage-unit",
    title: "Storage unit 22-B",
    password: "3-9-14",
    notes: "Combination padlock; turn right first.",
    tags: ["home"],
  },
  {
    id: "guest-wifi",
    title: "Guest Wi-Fi",
    username: "AlderCrest-3B",
    password: "pepper-loves-the-beach",
    tags: ["home", "network"],
  },
  {
    id: "alarm-system",
    title: "Alarm system",
    username: "maya.reyes",
    password: "2580",
    url: "https://account.kestrelwatch.example",
    notes: "Kestrel Watch panel by the front door.",
    tags: ["home"],
    attributes: [
      { name: "Monitoring account", value: "KW-20817" },
      { name: "Duress code", value: "2581", protected: true },
    ],
  },
];
