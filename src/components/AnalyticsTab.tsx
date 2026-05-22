import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type AnalyticsWindow = '24h' | '7d' | '30d'

type AnalyticsTabProps = {
  history: {
    domain: string
    time: string
    resolvedIp: string
    latency: string
    status: 'Success' | 'Cache hit' | 'Timeout'
    source: 'cache' | 'network'
    queryType: 'A' | 'AAAA' | 'MX'
  }[]
}

export default function AnalyticsTab({ history }: AnalyticsTabProps) {
  const [analyticsWindow, setAnalyticsWindow] = useState<AnalyticsWindow>('24h')
  const windowSize = analyticsWindow === '24h' ? 6 : analyticsWindow === '7d' ? 7 : 12
  const windowHistory = history.slice(0, windowSize).reverse()

  const data = windowHistory.map((entry, index) => {
    const latencyValue = Number.parseInt(entry.latency, 10)
    return {
      time: `${index + 1}`,
      latency: Number.isNaN(latencyValue) ? 0 : latencyValue,
      cacheEfficiency: entry.source === 'cache' ? 100 : 0,
      volume: index + 1,
    }
  })

  // Calculate quick stats based on active window
  const stats = {
    avgLatency: data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.latency, 0) / data.length) : 0,
    avgEfficiency: data.length > 0 ? Math.round((history.filter((entry) => entry.source === 'cache').length / history.length) * 100) : 0,
    totalVolume: history.length,
    maxLatency: data.length > 0 ? Math.max(...data.map(item => item.latency)) : 0,
  }

  const performanceBreakdown = [
    { name: 'Cache Hit', value: history.filter((entry) => entry.source === 'cache').length, color: '#96BBBB' },
    { name: 'Network Miss', value: history.filter((entry) => entry.source === 'network').length, color: '#618985' },
  ].filter((entry) => entry.value > 0)

  const tooltipStyles = {
    contentStyle: {
      background: '#FFFFFF',
      border: '1px solid #DDE5E4',
      borderRadius: '12px',
      color: '#1D2D2B',
      fontSize: '11px',
      fontWeight: 'bold',
      boxShadow: '0 10px 30px -5px rgba(97, 137, 133, 0.15)',
    },
  }

  return (
    <div className="space-y-6">
      {/* Filters and Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border-subtle pb-4">
        <div>
          <h3 className="text-xl font-bold text-text-main">Performance Analytics</h3>
          <p className="text-sm text-text-muted">Analyze latency trends, cache ratio distribution, and query volumes from actual resolver activity.</p>
        </div>
        <select
          value={analyticsWindow}
          onChange={(event) => setAnalyticsWindow(event.target.value as AnalyticsWindow)}
          className="rounded-xl border border-border-subtle bg-white px-4 py-2.5 text-xs font-semibold text-text-main outline-none cursor-pointer hover:border-slate-300 transition"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Quick Statistics Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Average Latency', value: `${stats.avgLatency} ms`, desc: 'Average server reply speed' },
          { label: 'Cache Efficiency', value: `${stats.avgEfficiency}%`, desc: 'Cache hits over history' },
          { label: 'Total Queries', value: stats.totalVolume.toLocaleString(), desc: 'Processed request load' },
          { label: 'Peak Latency', value: `${stats.maxLatency} ms`, desc: 'Max query duration recorded' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="rounded-2xl border border-border-subtle bg-white p-4 shadow-premium hover:shadow-premium-hover transition duration-200"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{card.label}</p>
            <p className="mt-1 text-2xl font-black text-primary-dark">{card.value}</p>
            <p className="mt-1 text-[10px] text-slate-400">{card.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Latency Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-3xl border border-border-subtle bg-white p-5 shadow-premium lg:col-span-2 flex flex-col justify-between"
        >
          <div>
            <h4 className="font-bold text-text-main text-sm uppercase tracking-wider border-b border-border-subtle pb-2.5 mb-4">
              Query Latency Timeline (ms)
            </h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6EEED" />
                  <XAxis dataKey="time" stroke="#57706E" fontSize={10} tickLine={false} />
                  <YAxis stroke="#57706E" fontSize={10} tickLine={false} />
                  <Tooltip {...tooltipStyles} />
                  <Line
                    type="monotone"
                    dataKey="latency"
                    stroke="#618985"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#618985', strokeWidth: 1, stroke: '#FFFFFF' }}
                    activeDot={{ r: 6, fill: '#496b68' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Cache Efficiency Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-3xl border border-border-subtle bg-white p-5 shadow-premium flex flex-col justify-between"
        >
          <div>
            <h4 className="font-bold text-text-main text-sm uppercase tracking-wider border-b border-border-subtle pb-2.5 mb-4">
              Cache Efficiency Ratio (%)
            </h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="cacheEffGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#96BBBB" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#96BBBB" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6EEED" />
                  <XAxis dataKey="time" stroke="#57706E" fontSize={10} tickLine={false} />
                  <YAxis stroke="#57706E" fontSize={10} tickLine={false} />
                  <Tooltip {...tooltipStyles} />
                  <Area type="monotone" dataKey="cacheEfficiency" stroke="#789c9c" fill="url(#cacheEffGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request Volume Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-3xl border border-border-subtle bg-white p-5 shadow-premium flex flex-col justify-between"
        >
          <div>
            <h4 className="font-bold text-text-main text-sm uppercase tracking-wider border-b border-border-subtle pb-2.5 mb-4">
              Hourly Request Load
            </h4>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6EEED" />
                  <XAxis dataKey="time" stroke="#57706E" fontSize={10} tickLine={false} />
                  <YAxis stroke="#57706E" fontSize={10} tickLine={false} />
                  <Tooltip {...tooltipStyles} />
                  <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#618985' : '#96BBBB'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Cache Breakdown Horizontal Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="rounded-3xl border border-border-subtle bg-white p-5 shadow-premium flex flex-col justify-between"
        >
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-border-subtle pb-2.5">
              <h4 className="font-bold text-text-main text-sm uppercase tracking-wider">Distribution Breakdown</h4>
              <span className="text-xs font-bold text-primary">{stats.avgEfficiency}% Cache Hits</span>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceBreakdown.length > 0 ? performanceBreakdown : [{ name: 'No Data', value: 0, color: '#DDE5E4' }]} layout="vertical" margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6EEED" />
                  <XAxis type="number" stroke="#57706E" fontSize={10} hide />
                  <YAxis type="category" dataKey="name" stroke="#57706E" width={80} fontSize={10} tickLine={false} />
                  <Tooltip {...tooltipStyles} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                    {(performanceBreakdown.length > 0 ? performanceBreakdown : [{ name: 'No Data', value: 0, color: '#DDE5E4' }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
