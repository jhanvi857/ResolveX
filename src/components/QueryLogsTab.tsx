import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'

export type QueryRecord = {
  domain: string
  time: string
  resolvedIp: string
  latency: string
  status: 'Success' | 'Cache hit' | 'Timeout'
  source: 'cache' | 'network'
  queryType: 'A' | 'AAAA' | 'MX'
}

interface QueryLogsTabProps {
  history: QueryRecord[]
  clearLogs?: () => void
}

export default function QueryLogsTab({ history, clearLogs }: QueryLogsTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'cache' | 'network'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | QueryRecord['status']>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | QueryRecord['queryType']>('all')
  const [copiedIp, setCopiedIp] = useState<string | null>(null)

  // Filter history records based on search and filters
  const filteredHistory = useMemo(() => {
    return history.filter((entry) => {
      const searchMatches = entry.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            entry.resolvedIp.includes(searchTerm)
      const sourceMatches = sourceFilter === 'all' || entry.source === sourceFilter
      const statusMatches = statusFilter === 'all' || entry.status === statusFilter
      const typeMatches = typeFilter === 'all' || entry.queryType === typeFilter
      return searchMatches && sourceMatches && statusMatches && typeMatches
    })
  }, [history, searchTerm, sourceFilter, statusFilter, typeFilter])

  // Handle CSV export of filtered records
  const handleExportCSV = () => {
    if (filteredHistory.length === 0) return
    const header = ['Domain,Time,Resolved IP,Latency,Status,Source,Query Type']
    const rows = filteredHistory.map((entry) => 
      [entry.domain, entry.time, entry.resolvedIp, entry.latency, entry.status, entry.source, entry.queryType].join(',')
    )
    const blob = new Blob([`${header.join('\n')}\n${rows.join('\n')}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `resolver-query-logs-${new Date().toISOString().split('T')[0]}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  // Handle single IP copy
  const handleCopyIp = async (ip: string) => {
    await navigator.clipboard.writeText(ip)
    setCopiedIp(ip)
    setTimeout(() => setCopiedIp(null), 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-border-subtle bg-white p-6 shadow-premium"
    >
      {/* Header and main actions */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-border-subtle pb-4">
        <div>
          <h3 className="text-xl font-bold text-text-main">DNS Query Database</h3>
          <p className="text-sm text-text-muted">Browse historical and incoming DNS requests processed by the server.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {clearLogs && history.length > 0 && (
            <button
              type="button"
              onClick={clearLogs}
              className="rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
            >
              Clear Database
            </button>
          )}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredHistory.length === 0}
            className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-primary/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export Filtered CSV
          </button>
        </div>
      </div>

      {/* Filter controls */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-app px-3 py-2">
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4.5 w-4.5 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search domain or IP..."
            className="w-full bg-transparent text-xs font-semibold text-text-main outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Source selector */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as 'all' | 'cache' | 'network')}
          className="rounded-xl border border-border-subtle bg-bg-app px-3 py-2 text-xs font-semibold text-text-main outline-none cursor-pointer hover:border-slate-300 transition"
        >
          <option value="all">All Sources</option>
          <option value="cache">DNS Cache</option>
          <option value="network">Network Resolution</option>
        </select>

        {/* Status selector */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | QueryRecord['status'])}
          className="rounded-xl border border-border-subtle bg-bg-app px-3 py-2 text-xs font-semibold text-text-main outline-none cursor-pointer hover:border-slate-300 transition"
        >
          <option value="all">All Statuses</option>
          <option value="Success">Success</option>
          <option value="Cache hit">Cache Hit</option>
          <option value="Timeout">Timeout</option>
        </select>

        {/* Query Type selector */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'all' | QueryRecord['queryType'])}
          className="rounded-xl border border-border-subtle bg-bg-app px-3 py-2 text-xs font-semibold text-text-main outline-none cursor-pointer hover:border-slate-300 transition"
        >
          <option value="all">All Types</option>
          <option value="A">A Record (IPv4)</option>
          <option value="AAAA">AAAA Record (IPv6)</option>
          <option value="MX">MX Record (Mail)</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-app/40 shadow-inner">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-subtle text-left text-xs">
            <thead className="bg-bg-app text-[10px] font-bold uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-4 py-3 font-bold">Domain</th>
                <th className="px-4 py-3 font-bold">Time</th>
                <th className="px-4 py-3 font-bold">Type</th>
                <th className="px-4 py-3 font-bold">Resolved IP</th>
                <th className="px-4 py-3 font-bold">Latency</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60 bg-white text-text-main">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((entry, index) => {
                  const isCache = entry.status === 'Cache hit'
                  const isTimeout = entry.status === 'Timeout'
                  
                  return (
                    <tr key={`${entry.domain}-${entry.time}-${index}`} className="hover:bg-slate-50 transition duration-150">
                      <td className="px-4 py-3 font-bold text-text-main">{entry.domain}</td>
                      <td className="px-4 py-3 text-text-muted">{entry.time}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-600">
                          {entry.queryType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-primary-dark">
                        <div className="flex items-center gap-2">
                          <span className="select-all font-semibold">{entry.resolvedIp}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyIp(entry.resolvedIp)}
                            className="text-slate-400 hover:text-primary transition"
                            title="Copy IP"
                          >
                            {copiedIp === entry.resolvedIp ? (
                              <span className="text-[10px] text-primary font-bold">Copied!</span>
                            ) : (
                              <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-3.5 w-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-text-main">{entry.latency}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                            isCache
                              ? 'bg-secondary/10 border-secondary/20 text-secondary-dark'
                              : isTimeout
                              ? 'bg-rose-50 border-rose-200 text-rose-700'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-muted capitalize">{entry.source}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                    No matching records found in this view. Try adjusting filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
