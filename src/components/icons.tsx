// Custom game icons — drawn to feel at home next to the 3D buttons.

type P = { className?: string; dim?: boolean };

export function FlameIcon({ className = "size-6", dim }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 2c.6 3.2 2.6 5 4.4 6.9C18.2 10.8 20 12.9 20 16a8 8 0 0 1-16 0c0-2.6 1.2-4.5 2.6-5.9.3 1.7 1.2 2.9 2.4 3.4C8.6 9.6 10 5.4 12 2Z"
        fill={dim ? "var(--locked)" : "var(--flame)"}
      />
      <path d="M12 12c.4 1.6 1.4 2.4 2.2 3.3.8.9 1.3 1.6 1.3 2.7a3.5 3.5 0 0 1-7 0c0-1.9 1.4-3 2.4-3.9.6-.6 1-1.2 1.1-2.1Z" fill={dim ? "var(--locked-strong)" : "#ffd23f"} />
    </svg>
  );
}

export function GemIcon({ className = "size-6" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M6 3h12l4 6-10 12L2 9l4-6Z" fill="var(--gem)" />
      <path d="M2 9h20L12 21 2 9Z" fill="#0e8fd0" />
      <path d="M8 9l4 12 4-12-4-6-4 6Z" fill="#62d0ff" opacity=".85" />
      <path d="M6 3l2 6H2l4-6Zm12 0-2 6h6l-4-6Z" fill="#8fe0ff" opacity=".7" />
    </svg>
  );
}

export function HeartIcon({ className = "size-6", dim }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 21s-7.5-4.6-9.6-9.3C.9 8.4 2.9 4 7 4c2.2 0 3.7 1.2 5 3 1.3-1.8 2.8-3 5-3 4.1 0 6.1 4.4 4.6 7.7C19.5 16.4 12 21 12 21Z"
        fill={dim ? "var(--locked)" : "var(--heart)"}
      />
      <ellipse cx="7.5" cy="8.5" rx="2" ry="1.3" fill="#fff" opacity={dim ? 0.2 : 0.45} transform="rotate(-30 7.5 8.5)" />
    </svg>
  );
}

export function BoltIcon({ className = "size-6" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M13.5 2 4 13.5h6.5L9.5 22 20 9.5h-6.6L13.5 2Z" fill="var(--gold)" stroke="#e0a800" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

export function FreezeIcon({ className = "size-6" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="#5ac8fa" />
      <path d="M12 6v12M7 9l10 6M17 9 7 15" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function TrophyIcon({ className = "size-6", color = "var(--gold)" }: P & { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M7 3h10v6a5 5 0 0 1-10 0V3Z" fill={color} />
      <path d="M7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4" fill="none" stroke={color} strokeWidth="2" />
      <path d="M10 14h4l1 4H9l1-4Z" fill={color} opacity=".8" />
      <rect x="7" y="18" width="10" height="3" rx="1" fill={color} />
    </svg>
  );
}
