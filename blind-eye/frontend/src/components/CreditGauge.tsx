// SVG arc gauge for credit/visibility scores — like a FICO score dial.
// Uses stroke-dasharray on a semicircular path for clean arc rendering.

interface CreditGaugeProps {
  score: number; // 0-100
  size?: number; // width in px (default 220)
  label?: string;
}

export default function CreditGauge({
  score,
  size = 220,
  label,
}: CreditGaugeProps) {
  const strokeW = 18;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - strokeW / 2 - 8;
  const circumference = Math.PI * r; // semicircle length

  // Arc segments: red (0-40%), yellow (40-70%), green (70-100%)
  const segments = [
    { pct: 40, color: "#ef4444" },
    { pct: 30, color: "#eab308" },
    { pct: 30, color: "#22c55e" },
  ];

  // Semicircle path from left to right (180° arc)
  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  // Needle
  const needleAngle = Math.PI - (score / 100) * Math.PI;
  const needleLen = r - 6;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy - needleLen * Math.sin(needleAngle);

  let rating = "Poor";
  let ratingColor = "#ef4444";
  if (score >= 70) {
    rating = "Great";
    ratingColor = "#22c55e";
  } else if (score >= 40) {
    rating = "Fair";
    ratingColor = "#eab308";
  }

  // Build cumulative offsets for each segment
  let offset = 0;
  const segmentElements = segments.map((seg, i) => {
    const segLen = (seg.pct / 100) * circumference;
    const dashArray = `${segLen} ${circumference - segLen}`;
    const dashOffset = -offset;
    offset += segLen;
    return (
      <path
        key={i}
        d={arcPath}
        fill="none"
        stroke={seg.color}
        strokeWidth={strokeW}
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        strokeLinecap="butt"
        opacity={0.85}
      />
    );
  });

  const svgH = size / 2 + 36;

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={svgH}
        viewBox={`0 0 ${size} ${svgH}`}
      >
        {/* Background track */}
        <path
          d={arcPath}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeW}
          strokeLinecap="butt"
        />

        {/* Colored segments */}
        {segmentElements}

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const a = Math.PI - (tick / 100) * Math.PI;
          const x1 = cx + (r + strokeW / 2 + 2) * Math.cos(a);
          const y1 = cy - (r + strokeW / 2 + 2) * Math.sin(a);
          const x2 = cx + (r + strokeW / 2 + 8) * Math.cos(a);
          const y2 = cy - (r + strokeW / 2 + 8) * Math.sin(a);
          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#9ca3af"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke="#1f2937"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={5} fill="#1f2937" />

        {/* Score text */}
        <text
          x={cx}
          y={cy - 22}
          textAnchor="middle"
          fill="#111827"
          fontSize={32}
          fontWeight="bold"
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          fill="#6b7280"
          fontSize={12}
        >
          / 100
        </text>
      </svg>
      <p className="text-sm font-medium -mt-3" style={{ color: ratingColor }}>
        {rating}
      </p>
      {label && <p className="text-xs text-gray-400 mt-0.5">{label}</p>}
    </div>
  );
}
