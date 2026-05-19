import type { DFADefinition, DFAState, DFATransition } from '../types';

interface DFAGraphProps {
  dfa: DFADefinition;
  currentState: string | null;
  visitedTransition: { from: string; to: string; label: string } | null;
}

const NODE_RADIUS = 30;

function getArrowPath(
  from: DFAState,
  to: DFAState,
  curve: DFATransition['curve'],
): { d: string; labelX: number; labelY: number; headX: number; headY: number; headAngle: number } {
  if (curve === 'self-loop-top' || curve === 'self-loop-bottom' || curve === 'self-loop-left' || curve === 'self-loop-right') {
    const r = NODE_RADIUS;
    let startAngle: number, endAngle: number;
    let loopOffX = 0, loopOffY = 0;

    if (curve === 'self-loop-top') {
      startAngle = -150; endAngle = -30;
      loopOffY = -55;
    } else if (curve === 'self-loop-bottom') {
      startAngle = 30; endAngle = 150;
      loopOffY = 55;
    } else if (curve === 'self-loop-left') {
      startAngle = -60; endAngle = 60;
      loopOffX = -55;
    } else {
      startAngle = 120; endAngle = 240;
      loopOffX = 55;
    }

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const sx = from.x + r * Math.cos(toRad(startAngle));
    const sy = from.y + r * Math.sin(toRad(startAngle));
    const ex = from.x + r * Math.cos(toRad(endAngle));
    const ey = from.y + r * Math.sin(toRad(endAngle));
    const cpx = from.x + loopOffX * 2.8;
    const cpy = from.y + loopOffY * 2.8;

    const dx = ex - (cpx * 2 - ex);
    const dy = ey - (cpy * 2 - ey);
    const ang = Math.atan2(ey - dy, ex - dx) * (180 / Math.PI);

    return {
      d: `M ${sx} ${sy} Q ${cpx} ${cpy} ${ex} ${ey}`,
      labelX: cpx,
      labelY: cpy,
      headX: ex,
      headY: ey,
      headAngle: ang,
    };
  }

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / dist;
  const ny = dy / dist;

  const sx = from.x + nx * NODE_RADIUS;
  const sy = from.y + ny * NODE_RADIUS;
  const ex = to.x - nx * NODE_RADIUS;
  const ey = to.y - ny * NODE_RADIUS;

  if (curve === 'straight') {
    const ang = Math.atan2(ey - sy, ex - sx) * (180 / Math.PI);
    return {
      d: `M ${sx} ${sy} L ${ex} ${ey}`,
      labelX: (sx + ex) / 2,
      labelY: (sy + ey) / 2,
      headX: ex,
      headY: ey,
      headAngle: ang,
    };
  }

  const perpX = -ny;
  const perpY = nx;
  const bend = curve === 'curve-up' ? -60 : 60;

  const midX = (sx + ex) / 2 + perpX * bend;
  const midY = (sy + ey) / 2 + perpY * bend;

  const endDx = ex - midX;
  const endDy = ey - midY;
  const ang = Math.atan2(endDy, endDx) * (180 / Math.PI);

  return {
    d: `M ${sx} ${sy} Q ${midX} ${midY} ${ex} ${ey}`,
    labelX: midX,
    labelY: midY,
    headX: ex,
    headY: ey,
    headAngle: ang,
  };
}

interface ArrowHeadProps {
  x: number;
  y: number;
  angle: number;
  color: string;
  isActive?: boolean;
}

function ArrowHead({ x, y, angle, color, isActive }: ArrowHeadProps) {
  return (
    <g style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <path
        d="M -10,-6 L 0,0 L -10,6 C -8,2 -8,-2 -10,-6 Z"
        transform={`translate(${x},${y}) rotate(${angle})`}
        fill={color}
        style={{
          filter: isActive ? `drop-shadow(0 0 8px ${color})` : 'none',
        }}
      />
    </g>
  );
}

function transitionMatches(
  transition: DFATransition,
  visitedTransition: DFAGraphProps['visitedTransition'],
): boolean {
  if (!visitedTransition) return false;
  if (visitedTransition.from !== transition.from || visitedTransition.to !== transition.to) return false;

  const labels = transition.label.split(',').map((label) => label.trim());
  return labels.includes(visitedTransition.label);
}

export default function DFAGraph({
  dfa,
  currentState,
  visitedTransition,
}: DFAGraphProps) {
  const stateMap = Object.fromEntries(dfa.states.map((s) => [s.id, s]));

  function getNodeFill(s: DFAState): string {
    if (s.id === currentState) {
      if (s.isTrap) return '#450a0a';
      if (s.isAccept) return 'url(#grad-accept-active)';
      return 'url(#grad-current)';
    }
    if (s.isTrap) return '#18181b';
    if (s.isAccept) return 'url(#grad-accept-inactive)';
    return '#0f172a';
  }

  function getNodeStroke(s: DFAState): string {
    if (s.id === currentState) {
      if (s.isTrap) return '#ef4444';
      if (s.isAccept) return '#10b981';
      return '#06b6d4';
    }
    if (s.isAccept) return '#0d9488';
    if (s.isTrap) return '#3f3f46';
    return '#334155';
  }

  return (
    <svg
      viewBox={dfa.viewBox}
      className="w-full h-full"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      <defs>
        {/* Enhanced Gradients */}
        <linearGradient id="grad-current" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#164e63" />
        </linearGradient>
        <radialGradient id="grad-accept-active" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="60%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#064e3b" />
        </radialGradient>
        <radialGradient id="grad-accept-inactive" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#134e4a" />
          <stop offset="100%" stopColor="#042f2e" />
        </radialGradient>

        {/* Professional Glow Filters */}
        <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.5" />
        </filter>

        <clipPath id="node-clip">
          <circle cx="0" cy="0" r={NODE_RADIUS} />
        </clipPath>
      </defs>

      {/* Background Grid */}
      <rect width="100%" height="100%" fill="none" pointerEvents="none" />

      {/* Transitions Layer */}
      {dfa.transitions.map((t, i) => {
        const fromState = stateMap[t.from];
        const toState = stateMap[t.to];
        if (!fromState || !toState) return null;
        const path = getArrowPath(fromState, toState, t.curve);
        const isActive = transitionMatches(t, visitedTransition);
        const color = isActive ? '#06b6d4' : '#334155';
        const labelWidth = Math.max(28, t.label.length * 9 + 14);

        return (
          <g key={`${t.from}-${t.to}-${t.label}-${i}`}>
            {/* Active Path Glow */}
            {isActive && (
              <path
                d={path.d}
                fill="none"
                stroke={color}
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.2"
                filter="url(#neon-glow)"
              />
            )}
            
            <path
              d={path.d}
              fill="none"
              stroke={color}
              strokeWidth={isActive ? 3 : 1.5}
              strokeLinecap="round"
              className="transition-all duration-300"
              style={{ opacity: isActive ? 1 : 0.4 }}
            />

            {/* Particle Stream */}
            {isActive && (
              <circle r="2.5" fill="#fff" filter="url(#neon-glow)">
                <animateMotion dur="0.8s" repeatCount="indefinite" path={path.d} />
              </circle>
            )}

            <ArrowHead
              x={path.headX}
              y={path.headY}
              angle={path.headAngle}
              color={color}
              isActive={isActive}
            />

            {/* Label with technical backplate */}
            <g transform={`translate(${path.labelX + (t.labelOffset?.x ?? 0)}, ${path.labelY + (t.labelOffset?.y ?? 0)})`}>
              <rect
                x={-labelWidth / 2}
                y="-10"
                width={labelWidth}
                height="20"
                rx="4"
                fill="#020617"
                stroke={isActive ? color : '#1e293b'}
                strokeWidth="1"
              />
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fontWeight="800"
                fill={isActive ? '#fff' : '#475569'}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {t.label}
              </text>
            </g>
          </g>
        );
      })}

      {/* States Layer */}
      {dfa.states.map((s) => {
        const isCurrent = s.id === currentState;
        const fill = getNodeFill(s);
        const stroke = getNodeStroke(s);

        return (
          <g key={s.id} transform={`translate(${s.x}, ${s.y})`} className="cursor-default">
            {/* Active Resonance Rings */}
            {isCurrent && (
              <g>
                <circle
                  r={NODE_RADIUS + 12}
                  fill="none"
                  stroke={stroke}
                  strokeWidth="1"
                  opacity="0.3"
                  className="animate-ping"
                />
                <circle
                  r={NODE_RADIUS + 6}
                  fill="none"
                  stroke={stroke}
                  strokeWidth="2"
                  opacity="0.2"
                />
              </g>
            )}

            {/* Accept Ring */}
            {s.isAccept && (
              <circle
                r={NODE_RADIUS + 6}
                fill="none"
                stroke={isCurrent ? stroke : '#065f46'}
                strokeWidth="1.5"
                strokeDasharray="4 2"
                opacity="0.5"
              />
            )}

            <circle
              r={NODE_RADIUS}
              fill={fill}
              stroke={stroke}
              strokeWidth={isCurrent ? "3" : "2"}
              filter="url(#shadow)"
              className="transition-all duration-300"
            />

            {/* Technical Scanline */}
            {isCurrent && (
              <g clipPath="url(#node-clip)">
                <rect x={-NODE_RADIUS} y={-NODE_RADIUS} width={NODE_RADIUS*2} height={NODE_RADIUS*2} fill="transparent">
                  <animate
                    attributeName="y"
                    from={-NODE_RADIUS*2}
                    to={NODE_RADIUS*2}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <rect width={NODE_RADIUS*2} height="2" fill={stroke} opacity="0.3" />
                </rect>
              </g>
            )}

            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="14"
              fontWeight="900"
              fill={isCurrent ? "#fff" : "#94a3b8"}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {s.label}
            </text>

            {/* Start Prompt */}
            {s.isStart && (
              <g transform={`translate(${-NODE_RADIUS - 35}, 0)`}>
                <path
                  d="M 0,0 L 25,0"
                  stroke={isCurrent ? stroke : "#475569"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
                <path
                  d="M 18,-6 L 25,0 L 18,6"
                  fill="none"
                  stroke={isCurrent ? stroke : "#475569"}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

