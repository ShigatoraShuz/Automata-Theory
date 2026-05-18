import type { PDADefinition, PDAState, PDATransition } from '../types';

interface PDAGraphProps {
  pda: PDADefinition;
  currentState?: string | null;
  visitedTransition?: { from: string; to: string; label: string } | null;
  isTeal?: boolean;
  isRejectedFinal?: boolean;
}

const RECT_W = 120;
const RECT_H = 50;
const DIAMOND_HW = 60; // half-width
const DIAMOND_HH = 40; // half-height

function getTransitionPath(
  from: PDAState,
  to: PDAState,
  curve?: PDATransition['curve'],
): { d: string; labelX: number; labelY: number; headX: number; headY: number; headAngle: number } {
  const isFromDiamond = from.type === 'read' || from.type === 'pop';
  const isToDiamond = to.type === 'read' || to.type === 'pop';

  const fromEdgeX = isFromDiamond ? DIAMOND_HW : RECT_W / 2;
  const fromEdgeY = isFromDiamond ? DIAMOND_HH : RECT_H / 2;
  const toEdgeX = isToDiamond ? DIAMOND_HW : RECT_W / 2;
  const toEdgeY = isToDiamond ? DIAMOND_HH : RECT_H / 2;

  // Self-loop cases
  if (curve === 'self-loop-top' || curve === 'self-loop-bottom' || curve === 'self-loop-left' || curve === 'self-loop-right') {
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
    const sx = from.x + fromEdgeX * Math.cos(toRad(startAngle));
    const sy = from.y + fromEdgeY * Math.sin(toRad(startAngle));
    const ex = from.x + fromEdgeX * Math.cos(toRad(endAngle));
    const ey = from.y + fromEdgeY * Math.sin(toRad(endAngle));
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

  // step-down / step-up: curved transitions
  if (curve === 'step-down' || curve === 'step-up') {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) {
      // fallback self-loop
      return {
        d: `M ${from.x + fromEdgeX} ${from.y - 10} C ${from.x + fromEdgeX + 40} ${from.y - 40} ${from.x + fromEdgeX + 40} ${from.y + 40} ${from.x + fromEdgeX} ${from.y + 10}`,
        labelX: from.x + fromEdgeX + 40,
        labelY: from.y,
        headX: from.x + fromEdgeX,
        headY: from.y + 10,
        headAngle: 90,
      };
    }
    const nx = dx / dist;
    const ny = dy / dist;
    const sx = from.x + nx * fromEdgeX;
    const sy = from.y + ny * fromEdgeY;
    const ex = to.x - nx * toEdgeX;
    const ey = to.y - ny * toEdgeY;
    const perpX = -ny;
    const perpY = nx;
    const bend = curve === 'step-down' ? 60 : -60;
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

  // Straight line (default)
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) {
    // Self-loop fallback
    return {
      d: `M ${from.x + fromEdgeX} ${from.y - 10} C ${from.x + fromEdgeX + 40} ${from.y - 40} ${from.x + fromEdgeX + 40} ${from.y + 40} ${from.x + fromEdgeX} ${from.y + 10}`,
      labelX: from.x + fromEdgeX + 40,
      labelY: from.y,
      headX: from.x + fromEdgeX,
      headY: from.y + 10,
      headAngle: 90,
    };
  }

  const nx = dx / dist;
  const ny = dy / dist;
  const sx = from.x + nx * fromEdgeX;
  const sy = from.y + ny * fromEdgeY;
  const ex = to.x - nx * toEdgeX;
  const ey = to.y - ny * toEdgeY;
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

interface NodeShapeProps {
  state: PDAState;
  isCurrent: boolean;
  isTeal: boolean;
  isStuck: boolean;
}

function NodeShape({ state, isCurrent, isTeal, isStuck }: NodeShapeProps) {
  const { type, label, x, y } = state;
  // Stuck (final rejected) state overrides accent to red
  const accentColor = isStuck ? '#ef4444' : isTeal ? '#14b8a6' : '#06b6d4';
  const scale = isCurrent ? 1.15 : 1;

  if (type === 'read' || type === 'pop') {
    // Diamond shape
    const hw = DIAMOND_HW * scale;
    const hh = DIAMOND_HH * scale;
    const d = `M ${x} ${y - hh} L ${x + hw} ${y} L ${x} ${y + hh} L ${x - hw} ${y} Z`;

    return (
      <g>
        {/* Active Resonance Rings */}
        {isCurrent && (
          <g>
            <circle
              cx={x}
              cy={y}
              r={DIAMOND_HW + 12}
              fill="none"
              stroke={accentColor}
              strokeWidth="1"
              opacity="0.3"
              className="animate-ping"
            />
            <circle
              cx={x}
              cy={y}
              r={DIAMOND_HW + 6}
              fill="none"
              stroke={accentColor}
              strokeWidth="2"
              opacity="0.2"
            />
          </g>
        )}

        {/* Diamond path */}
        <path
          d={d}
          fill={isCurrent ? 'url(#grad-pda-current)' : '#0f172a'}
          stroke={isCurrent ? accentColor : '#3b82f6'}
          strokeWidth={isCurrent ? 3 : 2}
          filter="url(#shadow)"
          className="transition-all duration-300"
        />

        {/* Technical Scanline for diamond */}
        {isCurrent && (
          <g>
            <clipPath id={`clip-diamond-${state.id}`}>
              <path d={d} />
            </clipPath>
            <g clipPath={`url(#clip-diamond-${state.id})`}>
              <rect x={x - hw} y={y - hh} width={hw * 2} height={hh * 2} fill="transparent">
                <animate
                  attributeName="y"
                  from={y - hh * 2}
                  to={y + hh * 2}
                  dur="2s"
                  repeatCount="indefinite"
                />
                <rect width={hw * 2} height="2" fill={accentColor} opacity="0.3" />
              </rect>
            </g>
          </g>
        )}

        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontWeight="bold"
          fill={isCurrent ? '#fff' : '#94a3b8'}
          className="uppercase"
        >
          {label}
        </text>
      </g>
    );
  }

  if (type === 'start' || type === 'accept' || type === 'reject' || type === 'push') {
    // Rectangle shape
    const w = RECT_W * scale;
    const h = RECT_H * scale;
    const rx = (type === 'start' || type === 'accept' || type === 'reject') ? 25 * scale : 0;
    const baseStroke = type === 'accept' ? '#10b981' : type === 'reject' ? '#ef4444' : type === 'push' ? '#8b5cf6' : '#64748b';

    return (
      <g>
        {/* Active Resonance Rings */}
        {isCurrent && (
          <g>
            <circle
              cx={x}
              cy={y}
              r={RECT_W / 2 + 12}
              fill="none"
              stroke={accentColor}
              strokeWidth="1"
              opacity="0.3"
              className="animate-ping"
            />
            <circle
              cx={x}
              cy={y}
              r={RECT_W / 2 + 6}
              fill="none"
              stroke={accentColor}
              strokeWidth="2"
              opacity="0.2"
            />
          </g>
        )}

        {/* Rectangle */}
        <rect
          x={x - w / 2}
          y={y - h / 2}
          width={w}
          height={h}
          rx={rx}
          fill={isCurrent ? 'url(#grad-pda-current)' : '#0f172a'}
          stroke={isCurrent ? accentColor : baseStroke}
          strokeWidth={isCurrent ? 3 : 2}
          filter="url(#shadow)"
          className="transition-all duration-300"
        />

        {/* Technical Scanline for rectangle */}
        {isCurrent && (
          <g>
            <clipPath id={`clip-rect-${state.id}`}>
              <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={rx} />
            </clipPath>
            <g clipPath={`url(#clip-rect-${state.id})`}>
              <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill="transparent">
                <animate
                  attributeName="y"
                  from={y - h * 1.5}
                  to={y + h * 1.5}
                  dur="2s"
                  repeatCount="indefinite"
                />
                <rect width={w} height="2" fill={accentColor} opacity="0.3" />
              </rect>
            </g>
          </g>
        )}

        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={type === 'start' || type === 'accept' || type === 'reject' ? "12" : "11"}
          fontWeight="bold"
          fill={isCurrent ? '#fff' : '#94a3b8'}
          className={type === 'start' || type === 'accept' || type === 'reject' ? 'uppercase tracking-widest' : 'uppercase'}
        >
          {label}
        </text>

        {/* Start Prompt Arrow */}
        {type === 'start' && (
          <g transform={`translate(${x - RECT_W / 2 * scale - 35}, ${y})`}>
            <path
              d="M 0,0 L 25,0"
              stroke={isCurrent ? accentColor : '#475569'}
              strokeWidth="3"
              strokeLinecap="round"
              className={isCurrent ? 'animate-pulse' : ''}
            />
            <path
              d="M 18,-6 L 25,0 L 18,6"
              fill="none"
              stroke={isCurrent ? accentColor : '#475569'}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        )}
      </g>
    );
  }

  return null;
}

export default function PDAGraph({
  pda,
  currentState = null,
  visitedTransition = null,
  isTeal = false,
  isRejectedFinal = false,
}: PDAGraphProps) {
  const stateMap = Object.fromEntries(pda.states.map((s) => [s.id, s]));
  const accentColor = isTeal ? '#14b8a6' : '#06b6d4';

  return (
    <svg
      viewBox={pda.viewBox}
      className="w-full h-full"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      <defs>
        {/* Gradient for current state */}
        <linearGradient id="grad-pda-current" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isTeal ? '#0891b2' : '#0891b2'} />
          <stop offset="100%" stopColor={isTeal ? '#164e63' : '#164e63'} />
        </linearGradient>

        {/* Professional Glow Filters */}
        <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.5" />
        </filter>

        {/* Arrowhead markers */}
        <marker
          id="arrowhead-pda"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
        </marker>
        <marker
          id="arrowhead-pda-active"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={accentColor} />
        </marker>
      </defs>

      {/* Transitions Layer */}
      {pda.transitions.map((t, i) => {
        const fromState = stateMap[t.from];
        const toState = stateMap[t.to];
        if (!fromState || !toState) return null;

        const path = getTransitionPath(fromState, toState, t.curve);
        const isActive = !!(
          visitedTransition &&
          visitedTransition.from === t.from &&
          visitedTransition.to === t.to &&
          visitedTransition.label === t.label
        );
        const color = isActive ? accentColor : '#334155';

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

            {/* Main Path */}
            <path
              d={path.d}
              fill="none"
              stroke={color}
              strokeWidth={isActive ? 3 : 1.5}
              strokeLinecap="round"
              className="transition-all duration-300"
              style={{ opacity: isActive ? 1 : 0.4 }}
              markerEnd={isActive ? 'url(#arrowhead-pda-active)' : 'url(#arrowhead-pda)'}
            />

            {/* Particle Stream */}
            {isActive && (
              <circle r="2.5" fill="#fff" filter="url(#neon-glow)">
                <animateMotion dur="0.8s" repeatCount="indefinite" path={path.d} />
              </circle>
            )}

            {/* Arrow Head */}
            <ArrowHead
              x={path.headX}
              y={path.headY}
              angle={path.headAngle}
              color={color}
              isActive={isActive}
            />

            {/* Label with technical backplate */}
            {t.label && (
              <g transform={`translate(${path.labelX + (t.labelOffset?.x ?? 0)}, ${path.labelY + (t.labelOffset?.y ?? 0)})`}>
                <rect
                  x="-14"
                  y="-10"
                  width="28"
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
            )}
          </g>
        );
      })}

      {/* States Layer */}
      {pda.states.map((s) => (
        <NodeShape
          key={s.id}
          state={s}
          isCurrent={s.id === currentState}
          isTeal={isTeal}
          isStuck={isRejectedFinal && s.id === currentState}
        />
      ))}
    </svg>
  );
}
