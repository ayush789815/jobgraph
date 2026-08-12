import { useEffect, useMemo, useRef, useState } from 'react';
import { NODE_TYPES } from '../../utils/nodeTypes.js';
import { FALLBACK_LINK_COLOR, LINK_STYLES } from './LINK_STYLES.js';

const NODE_RADII = { 0: 20, 1: 14, 2: 11 };
const SIM_STEPS_PER_FRAME = 8;
const MAX_SIM_STEPS = 500;
const TRUNCATE = 20;

/** Deterministic initial layout: depth 0 center, depth 1/2 on rings. */
function layoutNodes(nodes, width, height) {
  const positions = new Map();
  const cx = width / 2;
  const cy = height / 2;
  const buckets = { 0: [], 1: [], 2: [] };
  for (const n of nodes) (buckets[n.depth] = buckets[n.depth] || []).push(n);
  const rings = { 0: 0, 1: Math.min(width, height) * 0.34, 2: Math.min(width, height) * 0.58 };
  for (const depth of [0, 1, 2]) {
    const list = buckets[depth];
    list.forEach((n, i) => {
      const angle = (i / Math.max(list.length, 1)) * Math.PI * 2 + (depth === 0 ? 0 : 0.6);
      positions.set(n.id, { x: cx + rings[depth] * Math.cos(angle), y: cy + rings[depth] * Math.sin(angle) });
    });
  }
  return positions;
}

function truncate(label) {
  return label && label.length > TRUNCATE ? `${label.slice(0, TRUNCATE - 1)}…` : label;
}

/** Creates a small force simulation. Positions live in `sim.positions` (Map). */
function createSimulation(nodes, links, width, height) {
  const positions = layoutNodes(nodes, width, height);
  const velocity = new Map();
  for (const id of positions.keys()) velocity.set(id, { x: 0, y: 0 });

  const adj = new Map(); // node id -> set of neighbor ids
  for (const l of links) {
    if (!adj.has(l.source)) adj.set(l.source, new Set());
    if (!adj.has(l.target)) adj.set(l.target, new Set());
    adj.get(l.source).add(l.target);
    adj.get(l.target).add(l.source);
  }

  let steps = 0;
  const area = width * height;
  const repulsion = area / Math.max(nodes.length, 1) * 0.12;
  const spring = 0.018;

  return {
    positions,
    step() {
      steps += 1;
      if (steps > MAX_SIM_STEPS) return true;

      // Repulsion between every pair of nodes.
      const list = [...positions.entries()];
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const [idA, a] = list[i];
          const [idB, b] = list[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let dist = Math.hypot(dx, dy) || 1;
          const force = repulsion / (dist * dist);
          dx /= dist;
          dy /= dist;
          const va = velocity.get(idA);
          const vb = velocity.get(idB);
          va.x += dx * force;
          va.y += dy * force;
          vb.x -= dx * force;
          vb.y -= dy * force;
        }
      }

      // Spring attraction along links, longer rest length for 2-hop edges.
      for (const l of links) {
        const a = positions.get(l.source);
        const b = positions.get(l.target);
        if (!a || !b) continue;
        const rest = (l.source.startsWith('Job') || l.target.startsWith('Job')) && l.relationship === 'SHARES_SKILLS' ? 150 : 110;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 1;
        const force = (dist - rest) * spring;
        dx /= dist;
        dy /= dist;
        velocity.get(l.source).x += dx * force;
        velocity.get(l.source).y += dy * force;
        velocity.get(l.target).x -= dx * force;
        velocity.get(l.target).y -= dy * force;
      }

      // Gentle centering pull so the graph stays in view.
      for (const [id, n] of positions.entries()) {
        const v = velocity.get(id);
        v.x += (cx - n.x) * 0.0015;
        v.y += (cy - n.y) * 0.0015;

        const damping = 0.82;
        n.x += v.x * damping;
        n.y += v.y * damping;
        n.x = Math.max(30, Math.min(width - 30, n.x));
        n.y = Math.max(30, Math.min(height - 30, n.y));
        v.x *= 0.82;
        v.y *= 0.82;
      }
      return false;
    },
  };
}

export default function ConnectionGraph({ nodes, links, selectedId, onSelect }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 900, height: 560 });
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [hoveredId, setHoveredId] = useState(null);
  const [tick, setTick] = useState(0);

  const simRef = useRef(null);
  const dragRef = useRef(null); // { id, moved }
  const panRef = useRef(null); // { startX, startY, origX, origY }
  const transformRef = useRef(transform);
  transformRef.current = transform;

  // Measure the container.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Native non-passive wheel listener: React's synthetic onWheel is passive,
  // so preventDefault() would be ignored and the page would scroll while zooming.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const { x, y, k } = transformRef.current;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const nextK = Math.min(2.6, Math.max(0.4, k * factor));
      setTransform({ k: nextK, x: mx - ((mx - x) * nextK) / k, y: my - ((my - y) * nextK) / k });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // (Re)build the simulation when data or size changes.
  useEffect(() => {
    if (nodes.length === 0) return undefined;
    const sim = createSimulation(nodes, links, size.width, size.height);
    simRef.current = sim;
    let frame;
    let iterations = 0;
    const step = () => {
      let done = false;
      for (let i = 0; i < SIM_STEPS_PER_FRAME && !done; i++) {
        done = sim.step();
      }
      iterations += SIM_STEPS_PER_FRAME;
      setTick((t) => t + 1);
      if (!done && iterations < MAX_SIM_STEPS * 3) {
        frame = requestAnimationFrame(step);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [nodes, links, size.width, size.height]);

  /* ----------------------------- interactions ----------------------------- */

  const handlePointerDown = (e, nodeId) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    dragRef.current = { id: nodeId, moved: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag) return;
    const { x, y, k } = transformRef.current;
    const dx = e.movementX / k;
    const dy = e.movementY / k;
    drag.moved += Math.abs(e.movementX) + Math.abs(e.movementY);
    const pos = simRef.current.positions.get(drag.id);
    if (pos) {
      pos.x += dx;
      pos.y += dy;
    }
    setTick((t) => t + 1);
  };

  const handlePointerUp = (e) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (drag.moved < 5 && onSelect) onSelect(drag.id);
  };

  const handleBackgroundPointerDown = (e) => {
    if (e.button !== 0) return;
    panRef.current = { startX: e.clientX, startY: e.clientY, origX: transformRef.current.x, origY: transformRef.current.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleBackgroundPointerMove = (e) => {
    const pan = panRef.current;
    if (!pan) return;
    setTransform({
      ...transformRef.current,
      x: pan.origX + (e.clientX - pan.startX),
      y: pan.origY + (e.clientY - pan.startY),
    });
  };

  const endPan = () => {
    panRef.current = null;
  };

  /* ------------------------------- render -------------------------------- */

  const neighbors = useMemo(() => {
    const map = new Map();
    for (const l of links) {
      if (!map.has(l.source)) map.set(l.source, new Set());
      if (!map.has(l.target)) map.set(l.target, new Set());
      map.get(l.source).add(l.target);
      map.get(l.target).add(l.source);
    }
    return map;
  }, [links]);

  const isDimmed = (id) => hoveredId && id !== hoveredId && !(neighbors.get(hoveredId)?.has(id));

  // Fallback layout so the first paint doesn't stack every node at (0,0)
  // before the simulation effect runs.
  const fallbackPositions = useMemo(() => layoutNodes(nodes, size.width, size.height), [nodes, size.width, size.height]);

  return (
    <div
      ref={containerRef}
      className="relative h-[420px] w-full overflow-hidden rounded-xl border border-slate-200 bg-[radial-gradient(circle_at_50%_40%,#f8fafc,#eef2f7)] sm:h-[560px]"
    >
      <svg
        width={size.width}
        height={size.height}
        className="h-full w-full touch-none select-none"
        onPointerDown={handleBackgroundPointerDown}
        onPointerMove={handleBackgroundPointerMove}
        onPointerUp={endPan}
        onPointerLeave={endPan}
      >
        <defs>
          {Object.entries(LINK_STYLES).map(([rel, style]) => (
            <marker
              key={rel}
              id={`arrow-${rel}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill={style.color} />
            </marker>
          ))}
        </defs>

        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          {/* Links */}
          {links.map((l) => {
            const a = simRef.current?.positions.get(l.source) || fallbackPositions.get(l.source);
            const b = simRef.current?.positions.get(l.target) || fallbackPositions.get(l.target);
            if (!a || !b) return null;
            const style = LINK_STYLES[l.relationship] || { color: FALLBACK_LINK_COLOR };
            const dim = hoveredId && hoveredId !== l.source && hoveredId !== l.target;
            const highlighted = hoveredId && (hoveredId === l.source || hoveredId === l.target);
            return (
              <line
                key={`${l.source}-${l.target}-${l.relationship}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={style.color}
                strokeWidth={highlighted ? 2.4 : dim ? 0.6 : 1.3}
                strokeOpacity={dim ? 0.2 : highlighted ? 1 : 0.75}
                markerEnd={`url(#arrow-${l.relationship})`}
              >
                <title>
                  {l.relationship} {l.note ? `— ${l.note}` : ''}
                </title>
              </line>
            );
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const pos = simRef.current?.positions.get(n.id) || fallbackPositions.get(n.id) || { x: 0, y: 0 };
            const type = NODE_TYPES[n.type] || NODE_TYPES.Job;
            const r = NODE_RADII[n.depth] ?? 11;
            const dim = isDimmed(n.id);
            const selected = selectedId === n.id;
            return (
              <g
                key={n.id}
                transform={`translate(${pos.x},${pos.y})`}
                className="cursor-pointer"
                style={{ opacity: dim ? 0.25 : 1, transition: 'opacity 120ms' }}
                onPointerDown={(e) => handlePointerDown(e, n.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerEnter={() => setHoveredId(n.id)}
                onPointerLeave={() => setHoveredId((h) => (h === n.id ? null : h))}
              >
                {n.depth === 2 && (
                  <circle r={r + 5} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" opacity={dim ? 0.3 : 0.6} />
                )}
                <circle r={r} fill={type.solid} stroke="#ffffff" strokeWidth={selected ? 3.5 : 2} opacity={dim ? 0.6 : 1} />
                {selected && <circle r={r + 6} fill="none" stroke={type.solid} strokeWidth="2" opacity="0.8" />}
                <text
                  y={r + 14}
                  textAnchor="middle"
                  className="pointer-events-none"
                  fontSize="10.5"
                  fontWeight={n.depth === 0 ? 700 : 500}
                  fill={n.depth === 0 ? '#1e293b' : '#475569'}
                >
                  {truncate(n.name)}
                </text>
                <title>{`${n.type}: ${n.name}`}</title>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        {[
          { label: '+', fn: () => setTransform((t) => ({ ...t, k: Math.min(2.6, t.k * 1.2) })) },
          { label: '−', fn: () => setTransform((t) => ({ ...t, k: Math.max(0.4, t.k / 1.2) })) },
          { label: '⟲', fn: () => setTransform({ x: 0, y: 0, k: 1 }) },
        ].map((b) => (
          <button key={b.label} type="button" onClick={b.fn} className="btn-secondary !h-8 !w-8 !p-0 text-sm">
            {b.label}
          </button>
        ))}
      </div>

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">No connections to display</div>
      )}
    </div>
  );
}
