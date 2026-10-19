export function PlanDrawing({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`plan-drawing ${className}`}
      viewBox="0 0 640 500"
      fill="none"
      role="img"
      aria-label="Illustrative room plan with a living area, work table and open central space"
    >
      <defs>
        <pattern id="plan-hatch" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 14 14 0" stroke="currentColor" strokeWidth="0.4" opacity=".17" />
        </pattern>
      </defs>
      <path d="M66 65h510v375H66z" fill="url(#plan-hatch)" stroke="currentColor" strokeWidth="7" />
      <path
        d="M66 320v82m0-82h82a82 82 0 0 1-82 82"
        stroke="currentColor"
        strokeWidth="1"
        fill="var(--paper)"
      />
      <path d="M576 135v150" stroke="var(--paper)" strokeWidth="10" />
      <path d="M576 135v150m-5-150v150" stroke="currentColor" strokeWidth="1" />
      <g className="drawing-furniture" stroke="currentColor" strokeWidth="1.2">
        <rect x="105" y="290" width="170" height="76" rx="5" fill="var(--paper)" />
        <path d="M115 353v-53h150v53m-102-53v53m51-53v53" />
        <rect x="125" y="220" width="123" height="46" rx="22" fill="var(--paper)" />
        <rect x="315" y="310" width="55" height="55" rx="5" fill="var(--paper)" />
        <path d="M322 356v-38h41v38" />
        <rect x="412" y="130" width="120" height="65" fill="var(--paper)" />
        <circle cx="472" cy="226" r="23" fill="var(--paper)" />
        <rect x="405" y="85" width="145" height="23" fill="var(--paper)" />
        <circle cx="525" cy="385" r="23" fill="var(--paper)" />
        <path d="m515 374 20 21m-20 0 20-21m-10-3v28m-14-14h28" />
      </g>
      <path
        d="M66 39h510M66 31v16m510-16v16M601 65v375m-8-375h16m-16 375h16"
        stroke="currentColor"
        strokeWidth=".8"
      />
      <text
        x="320"
        y="27"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="monospace"
        fontSize="10"
      >
        6.00 m
      </text>
      <text
        x="620"
        y="253"
        textAnchor="middle"
        transform="rotate(90 620 253)"
        fill="currentColor"
        fontFamily="monospace"
        fontSize="10"
      >
        4.50 m
      </text>
      <text x="87" y="481" fill="currentColor" fontFamily="monospace" fontSize="10">
        27 m² / A LIVING STUDY
      </text>
      <circle cx="51" cy="65" r="3" fill="currentColor" />
      <circle cx="51" cy="440" r="3" fill="currentColor" />
    </svg>
  );
}
