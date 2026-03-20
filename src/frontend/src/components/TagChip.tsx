// Alternates between sage and sand colors for variety
const COLORS = [
  { bg: "oklch(0.888 0.040 150)", text: "oklch(0.250 0.040 150)" }, // sage
  { bg: "oklch(0.868 0.040 76)", text: "oklch(0.350 0.040 76)" }, // sand
  { bg: "oklch(0.875 0.035 220)", text: "oklch(0.280 0.050 220)" }, // sky blue
];

function hashTag(tag: string): number {
  let h = 0;
  for (let i = 0; i < tag.length; i++) {
    h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  }
  return h;
}

export default function TagChip({ tag }: { tag: string }) {
  const color = COLORS[hashTag(tag) % COLORS.length];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: color.bg, color: color.text }}
    >
      {tag}
    </span>
  );
}
