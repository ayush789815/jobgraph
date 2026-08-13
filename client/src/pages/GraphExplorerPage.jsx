import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import PageHeader from '../components/PageHeader.jsx';
import SearchInput from '../components/SearchInput.jsx';
import ConnectionGraph from '../components/graph/ConnectionGraph.jsx';
import GraphLegend from '../components/graph/GraphLegend.jsx';
import NodePanel from '../components/graph/NodePanel.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { cx } from '../utils/format.js';

const TABS = [
  { key: 'job', label: 'Jobs', icon: '💼', plural: 'jobs' },
  { key: 'skill', label: 'Skills', icon: '🧠', plural: 'skills' },
  { key: 'company', label: 'Companies', icon: '🏢', plural: 'companies' },
];

function fetchList(type) {
  if (type === 'job') return api.get('/jobs', { params: { limit: 60 } });
  if (type === 'skill') return api.get('/skills');
  return api.get('/companies');
}

export default function GraphExplorerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = TABS.find((t) => searchParams.get(t.key)) ? TABS.find((t) => searchParams.get(t.key)).key : 'job';
  const nodeId = searchParams.get(type) || '';

  const [pickerQuery, setPickerQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [graphKey, setGraphKey] = useState(0);

  const { data: list } = useApi(() => fetchList(type), [type]);

  // Auto-select the first item of the tab when nothing is chosen yet.
  useEffect(() => {
    if (!nodeId && list && list.length > 0) {
      selectNode(list[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, list, nodeId]);

  const { data: graph, loading, error, reload } = useApi(
    () => (nodeId ? api.get(`/${type === 'company' ? 'companies' : type === 'skill' ? 'skills' : 'jobs'}/${nodeId}/connections`) : Promise.resolve(null)),
    [type, nodeId],
  );

  function selectNode(id) {
    const params = new URLSearchParams(searchParams);
    for (const t of TABS) params.delete(t.key);
    params.set(type, id);
    setSearchParams(params, { replace: false });
    // Graph node ids are prefixed with the node type ("Job:job-042"), so store
    // the full key — otherwise the selection ring and panel lookup miss.
    setSelectedNodeId(`${type.charAt(0).toUpperCase()}${type.slice(1)}:${id}`);
    setPickerQuery('');
    setGraphKey((k) => k + 1);
  }

  const filteredList = useMemo(() => {
    if (!list) return [];
    const query = pickerQuery.trim().toLowerCase();
    if (!query) return list;
    return list.filter((item) => (item.title || item.name || '').toLowerCase().includes(query)).slice(0, 30);
  }, [list, pickerQuery]);

  const selectedNode = useMemo(
    () => (graph ? graph.nodes.find((n) => n.id === selectedNodeId) || graph.nodes.find((n) => n.depth === 0) : null),
    [graph, selectedNodeId],
  );

  const currentTab = TABS.find((t) => t.key === type);

  return (
    <div>
      <PageHeader
        title="Graph Explorer"
        subtitle="Visualize the neighborhood around a job, skill, or company — up to two hops deep."
        icon="🕸️"
      />

      {/* Type tabs */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                for (const t of TABS) params.delete(t.key);
                setSearchParams(params, { replace: true });
                setSelectedNodeId(null);
                setPickerQuery('');
              }}
              className={cx(
                'rounded-md px-4 py-1.5 text-sm font-semibold transition-colors',
                type === tab.key ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50',
              )}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        <button className="btn-secondary text-xs" onClick={() => setGraphKey((k) => k + 1)}>
          ⟲ Re-layout graph
        </button>
      </div>

      {/* Picker */}
      <div className="relative mb-5">
        <SearchInput
          className="max-w-xl"
          value={pickerQuery}
          onChange={setPickerQuery}
          placeholder={`Pick a ${currentTab.label.toLowerCase()} to explore (${list?.length ?? 0} available)…`}
          autoFocus={false}
        />
        {pickerQuery && (
          <div className="card absolute z-30 mt-2 max-h-80 w-full max-w-xl overflow-y-auto p-1 nice-scroll">
            {filteredList.length === 0 ? (
              <p className="px-3 py-3 text-sm text-slate-400">No {currentTab.plural} match "{pickerQuery}".</p>
            ) : (
              filteredList.map((item) => {
                const name = item.title || item.name;
                const sub = item.companyName || (item.category ? `${item.category} · ${item.jobCount ?? ''} jobs` : `${item.jobCount ?? 0} open jobs`);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectNode(item.id)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-brand-50"
                  >
                    <span className="truncate font-medium text-slate-800">{name}</span>
                    <span className="shrink-0 text-xs text-slate-400">{sub}</span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {!nodeId ? (
        <EmptyState title="Pick something to explore" description="Choose a job, skill, or company above and watch its connections light up." icon="🕸️" />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading || !graph ? (
        <div className="card flex h-[420px] items-center justify-center sm:h-[560px]">
          <div className="flex flex-col items-center gap-3 text-sm text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
            Traversing the graph…
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">
                Focus: <span className="font-bold text-slate-800">{graph.focus.name}</span>
                <span className="ml-2 text-slate-400">· {graph.nodes.length} nodes · {graph.links.length} relationships</span>
              </p>
            </div>
            <ConnectionGraph
              key={graphKey}
              nodes={graph.nodes}
              links={graph.links}
              selectedId={selectedNodeId}
              onSelect={setSelectedNodeId}
            />
            <div className="mt-4">
              <GraphLegend />
            </div>
          </div>

          <div>
            <NodePanel node={selectedNode} connections={graph.links} nodes={graph.nodes} onClose={() => setSelectedNodeId(null)} />
            <div className="card mt-4 p-4 text-xs leading-relaxed text-slate-500">
              <p className="mb-1 font-bold text-slate-700">Why this is a graph query</p>
              <p>
                The neighbors you see here come from Cypher traversals — e.g. related jobs are found by                  walking <code className="rounded bg-slate-100 px-1">(job)-[:REQUIRES]-&gt;(:Skill)&lt;-[:REQUIRES]-(other)</code>.
                Following relationships is the whole point of a graph database; this page would be much
                harder to build on top of normalized SQL tables.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
