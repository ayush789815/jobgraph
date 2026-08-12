import { NODE_TYPE_ORDER, NODE_TYPES } from '../../utils/nodeTypes.js';
import { LINK_STYLES } from './LINK_STYLES.js';

export default function GraphLegend() {
  return (
    <div className="card p-4 text-xs">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Nodes</p>
          <ul className="space-y-1.5">
            {NODE_TYPE_ORDER.map((type) => (
              <li key={type} className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NODE_TYPES[type].solid }} />
                {NODE_TYPES[type].label}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Relationships</p>
          <ul className="space-y-1.5">
            {Object.entries(LINK_STYLES).map(([rel, style]) => (
              <li key={rel} className="flex items-center gap-2 text-slate-600">
                <svg width="26" height="10" viewBox="0 0 26 10">
                  <line x1="0" y1="5" x2="21" y2="5" stroke={style.color} strokeWidth="2" />
                  <path d="M21,1 L26,5 L21,9 z" fill={style.color} />
                </svg>
                {rel.replace(/_/g, ' ').toLowerCase()} — {style.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-3 border-t border-slate-100 pt-3 leading-relaxed text-slate-400">
        Dotted ring = second-hop node. Drag nodes, scroll to zoom, drag the background to pan. Click a node for details.
      </p>
    </div>
  );
}
