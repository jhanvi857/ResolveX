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

const analyticsByWindow: Record<AnalyticsWindow, { time: string; latency: number; cacheEfficiency: number; volume: number }[]> = {
  '24h': [
    { time: '00:00', latency: 24, cacheEfficiency: 63, volume: 42 },
    { time: '04:00', latency: 19, cacheEfficiency: 69, volume: 28 },
    { time: '08:00', latency: 31, cacheEfficiency: 58, volume: 84 },
    { time: '12:00', latency: 22, cacheEfficiency: 71, volume: 96 },
    { time: '16:00', latency: 27, cacheEfficiency: 74, volume: 71 },
    { time: '20:00', latency: 18, cacheEfficiency: 79, volume: 54 },
  ],
  '7d': [
    { time: 'Mon', latency: 21, cacheEfficiency: 69, volume: 340 },
    { time: 'Tue', latency: 24, cacheEfficiency: 72, volume: 364 },
    { time: 'Wed', latency: 26, cacheEfficiency: 65, volume: 418 },
    { time: 'Thu', latency: 23, cacheEfficiency: 76, volume: 387 },
    { time: 'Fri', latency: 19, cacheEfficiency: 78, volume: 452 },
    { time: 'Sat', latency: 17, cacheEfficiency: 81, volume: 296 },
    { time: 'Sun', latency: 22, cacheEfficiency: 77, volume: 308 },
  ],
  '30d': [
    { time: 'W1', latency: 24, cacheEfficiency: 66, volume: 1220 },
    { time: 'W2', latency: 21, cacheEfficiency: 70, volume: 1392 },
    { time: 'W3', latency: 19, cacheEfficiency: 73, volume: 1464 },
    { time: 'W4', latency: 18, cacheEfficiency: 79, volume: 1528 },
  ],
}

const performanceBreakdown = [
  { name: 'Cache Hit', value: 72, color: '#96BBBB' },
  { name: 'Network Miss', value: 28, color: '#618985' },
]

export default function AnalyticsTab() {
  const [analyticsWindow, setAnalyticsWindow] = useState<AnalyticsWindow>('24h')
  const data = analyticsByWindow[analyticsWindow]

  // Calculate quick stats based on active window
  const stats = {
    avgLatency: Math.round(data.reduce((sum, item) => sum + item.latency, 0) / data.length),
    avgEfficiency: Math.round(data.reduce((sum, item) => sum + item.cacheEfficiency, 0) / data.length),
    totalVolume: data.reduce((sum, item) => sum + item.volume, 0),
    maxLatency: Math.max(...data.map(item => item.latency)),
  }

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
          <p className="text-sm text-text-muted">Analyze latency trends, cache ratio distribution, and query volumes.</p>
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
          { label: 'Cache Efficiency', value: `${stats.avgEfficiency}%`, desc: 'Average cache hit ratio' },
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
                  <Area
                    type="monotone"
                    dataKey="cacheEfficiency"
                    stroke="#789c9c"
                    fill="url(#cacheEffGradient)"
                    strokeWidth={2}
                  />
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
              <h4 className="font-bold text-text-main text-sm uppercase tracking-wider">
                Distribution Breakdown
              </h4>
              <span className="text-xs font-bold text-primary">72% Cache Hits (Average)</span>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceBreakdown} layout="vertical" margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6EEED" />
                  <XAxis type="number" stroke="#57706E" fontSize={10} hide />
                  <YAxis type="category" dataKey="name" stroke="#57706E" width={80} fontSize={10} tickLine={false} />
                  <Tooltip {...tooltipStyles} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                    {performanceBreakdown.map((entry, index) => (
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
