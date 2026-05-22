import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'

type CacheEntry = {
  domain: string
  ip: string
  type: string
  ttl: number
  maxTtl: number
  size: string
  expiresIn: number
}

type CacheTabProps = {
  entries: CacheEntry[]
  onRefresh: () => Promise<void>
}

export default function CacheTab({ entries, onRefresh }: CacheTabProps) {
  const [search, setSearch] = useState('')

  const filteredEntries = useMemo(() => {
    return entries.filter(
      (entry) =>
        entry.domain.toLowerCase().includes(search.toLowerCase()) ||
        entry.ip.toLowerCase().includes(search.toLowerCase())
    )
  }, [entries, search])

  const activeKeys = entries.length
  const totalMemory = entries.reduce((sum, entry) => sum + Math.max(1, parseInt(entry.size, 10) || 1), 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Metrics Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Cached Records', value: `${activeKeys} keys`, desc: 'Live entries from backend cache' },
          { label: 'Cache Hit Ratio', value: activeKeys > 0 ? 'Live' : '0%', desc: 'Resolved entries returned from cache' },
          { label: 'Memory Footprint', value: `${totalMemory} B`, desc: 'Approximate rendered entry size' },
          { label: 'Lookup Latency', value: activeKeys > 0 ? '< 1 ms' : '0 ms', desc: 'Backend snapshot fetch' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border-subtle bg-white p-4 shadow-premium"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{stat.label}</p>
            <p className="mt-1 text-2xl font-black text-primary-dark">{stat.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div className="rounded-3xl border border-border-subtle bg-white p-6 shadow-premium">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-border-subtle pb-4">
          <div>
            <h3 className="text-xl font-bold text-text-main">DNS Resolver Cache</h3>
            <p className="text-sm text-text-muted">Inspect the backend cache snapshot populated by actual resolver responses.</p>
          </div>
          <button type="button" onClick={() => void onRefresh()} className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-primary/10 transition">
            Refresh Cache
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 max-w-md flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-app px-3 py-2">
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4.5 w-4.5 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cached hostname or target IP..."
            className="w-full bg-transparent text-xs font-semibold text-text-main outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Table list */}
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-app/40">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-subtle text-left text-xs">
              <thead className="bg-bg-app text-[10px] font-bold uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-bold">Domain</th>
                  <th className="px-4 py-3 font-bold">Type</th>
                  <th className="px-4 py-3 font-bold">Resolved IP</th>
                  <th className="px-4 py-3 font-bold">TTL Remaining</th>
                  <th className="px-4 py-3 font-bold">Size</th>
                  <th className="px-4 py-3 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/60 bg-white text-text-main">
                <AnimatePresence>
                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry) => {
                      const percentage = Math.max(0, Math.min(100, (entry.ttl / entry.maxTtl) * 100))
                      const ttlColor = percentage > 50 ? 'bg-primary' : percentage > 20 ? 'bg-amber-500' : 'bg-rose-500'

                      return (
                        <motion.tr
                          key={entry.domain}
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="px-4 py-3 font-bold text-text-main">{entry.domain}</td>
                          <td className="px-4 py-3">
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-600">
                              {entry.type || 'A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold text-primary-dark truncate max-w-[200px]" title={entry.ip}>
                            {entry.ip}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
                                <div className={`h-full ${ttlColor} transition-all duration-300`} style={{ width: `${percentage}%` }} />
                              </div>
                              <span className="font-mono font-semibold text-text-main text-[11px]">{entry.ttl}s / {entry.maxTtl}s</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-text-muted">{entry.size}</td>
                          <td className="px-4 py-3 text-right text-[10px] font-semibold text-text-muted">{entry.expiresIn}s left</td>
                        </motion.tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                        No live cache entries yet. Resolve a hostname to populate the backend cache.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
