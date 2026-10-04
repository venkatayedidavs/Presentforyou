export const BALLOON_LOOKS = [
  { color: "#c4534a", shade: "#8a332c", highlight: "#f3c2b6" },
  { color: "#d3923e", shade: "#9a6424", highlight: "#f6ddb4" },
  { color: "#2f6f62", shade: "#1c463d", highlight: "#b7ddd2" },
  { color: "#3d628c", shade: "#2a4564", highlight: "#c5d5e6" },
  { color: "#8d4d6e", shade: "#5e3148", highlight: "#e7c4d4" },
  { color: "#c46b4a", shade: "#8a4630", highlight: "#f3cbb8" },
  { color: "#4f6e46", shade: "#33462d", highlight: "#c5d6b6" },
  { color: "#a78468", shade: "#6e5642", highlight: "#ead6c4" },
] as const

export function BalloonArt({
  color,
  shade,
  highlight,
  letter,
  gradientId,
}: {
  color: string
  shade: string
  highlight: string
  letter: string
  gradientId: string
}) {
  return (
    <svg viewBox="0 0 100 150" className="h-auto w-full overflow-visible" aria-hidden>
      <defs>
        <radialGradient id={gradientId} cx="36%" cy="32%" r="68%">
          <stop offset="0%" stopColor={highlight} />
          <stop offset="42%" stopColor={color} />
          <stop offset="100%" stopColor={shade} />
        </radialGradient>
      </defs>
      <path
        d="M50 114 C46 126 34 130 40 146"
        fill="none"
        stroke={shade}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M50 16
           C29 16 16 34 16 54
           C16 78 33 94 46 100
           L50 110
           L54 100
           C67 94 84 78 84 54
           C84 34 71 16 50 16 Z"
        fill={`url(#${gradientId})`}
      />
      <ellipse cx="36" cy="40" rx="8" ry="13" fill="white" opacity="0.28" transform="rotate(-22 36 40)" />
      <path d="M45 106 L50 114 L55 106 Z" fill={shade} />
      <text
        x="50"
        y="64"
        textAnchor="middle"
        fill="white"
        fontSize="18"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        {letter}
      </text>
    </svg>
  )
}
