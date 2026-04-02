'use client';

interface Props {
  score: number; // 0-100
  size?: 'sm' | 'md';
}

export default function ConfidenceGauge({ score, size = 'md' }: Props) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'HIGH' : score >= 60 ? 'MEDIUM' : 'LOW';
  const radius = size === 'sm' ? 18 : 26;
  const stroke = size === 'sm' ? 4 : 5;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const svgSize = (radius + stroke) * 2;

  return (
    <div className="flex items-center gap-2">
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        <circle
          cx={svgSize / 2} cy={svgSize / 2} r={radius}
          fill="none" stroke="#374151" strokeWidth={stroke}
        />
        <circle
          cx={svgSize / 2} cy={svgSize / 2} r={radius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${svgSize / 2} ${svgSize / 2})`}
        />
        <text
          x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          fill={color} fontSize={size === 'sm' ? '9' : '11'} fontWeight="bold"
        >
          {score}
        </text>
      </svg>
      <span style={{ color }} className={`font-semibold ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {label}
      </span>
    </div>
  );
}
