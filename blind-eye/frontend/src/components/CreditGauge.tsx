// SVG arc gauge for credit/visibility scores — like a FICO score dial.
// Renders a 180-degree arc from red → yellow → green with an animated needle.

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
  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = size / 2 - 20;

  // Arc from 180° (left) to 0° (right) — a semicircle
  const startAngle = Math.PI; // left

  // Needle angle: score 0 = 180°, score 100 = 0°
  const needleAngle = Math.PI - (score / 100) * Math.PI;
  const needleLen = r - 10;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy - needleLen * Math.sin(needleAngle);

  // Arc path helper
  const arcPoint = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos(angle),
    y: cy - radius * Math.sin(angle),
  });

  const outerR = r;
  const innerR = r - 16;

  // Build the colored arc in 3 segments: red (0-40), yellow (40-70), green (70-100)
  const segments = [
    { from: 0, to: 40, color: "#ef4444" },
    { from: 40, to: 70, color: "#eab308" },
    { from: 70, to: 100, color: "#22c55e" },
  ];

  const segmentPaths = segments.map((seg) => {
    const a1 = startAngle - (seg.from / 100) * Math.PI;
    const a2 = startAngle - (seg.to / 100) * Math.PI;
    const p1o = arcPoint(a1, outerR);
    const p2o = arcPoint(a2, outerR);
    const p1i = arcPoint(a2, innerR);
    const p2i = arcPoint(a1, innerR);

    return (
      <path
        key={seg.from}
        d={`M ${p1o.x} ${p1o.y} A ${outerR} ${outerR} 0 0 0 ${p2o.x} ${p2o.y} L ${p1i.x} ${p1i.y} A ${innerR} ${innerR} 0 0 1 ${p2i.x} ${p2i.y} Z`}
        fill={seg.color}
        opacity={0.85}
      />
    );
  });

  // Score label text
  let rating = "Poor";
  if (score >= 70) rating = "Great";
  else if (score >= 40) rating = "Fair";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 40} viewBox={`0 0 ${size} ${size / 2 + 40}`}>
        {segmentPaths}

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const a = startAngle - (tick / 100) * Math.PI;
          const p1 = arcPoint(a, outerR + 4);
          const p2 = arcPoint(a, outerR + 10);
          return (
            <line
              key={tick}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
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
          y={cy - 20}
          textAnchor="middle"
          className="text-3xl font-bold"
          fill="#111827"
          fontSize={32}
          fontWeight="bold"
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy + 2}
          textAnchor="middle"
          fill="#6b7280"
          fontSize={12}
        >
          / 100
        </text>
      </svg>
      <p className="text-sm font-medium text-gray-600 -mt-2">{rating}</p>
      {label && <p className="text-xs text-gray-400 mt-0.5">{label}</p>}
    </div>
  );
}
