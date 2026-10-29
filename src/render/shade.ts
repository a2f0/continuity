/** Mix a #rrggbb color toward black (negative) or white (positive). */
export function shade(hex: string, amount: number): string {
  const value = Number.parseInt(hex.slice(1), 16);
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map(
    (channel) => {
      const target = amount < 0 ? 0 : 255;
      return Math.round(channel + (target - channel) * Math.abs(amount));
    },
  );
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}
