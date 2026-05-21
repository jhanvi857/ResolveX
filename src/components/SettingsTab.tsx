import { motion } from 'framer-motion'
import { useState } from 'react'

interface SettingsTabProps {
  clearLogs: () => void
}

export default function SettingsTab({ clearLogs }: SettingsTabProps) {
  const [upstreamDns, setUpstreamDns] = useState<'cloudflare' | 'google' | 'quad9' | 'local'>('cloudflare')
  const [dnssec, setDnssec] = useState(true)
  const [cacheSize, setCacheSize] = useState('1024')
  const [latencyMultiplier, setLatencyMultiplier] = useState('1.0')
  const [ttlOverride, setTtlOverride] = useState('default')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showSaveMessage, setShowSaveMessage] = useState(false)

  const handleSave = () => {
    setShowSaveMessage(true)
    setTimeout(() => setShowSaveMessage(false), 2000)
  }

  const handleClearHistory = () => {
    clearLogs()
    setShowClearConfirm(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="rounded-3xl border border-border-subtle bg-white p-6 shadow-premium">
        <h3 className="text-xl font-bold text-text-main border-b border-border-subtle pb-4 mb-6">
          Resolver Settings
        </h3>

        <div className="space-y-6">
          {/* Upstream DNS Nameservers */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-main">Upstream DNS Resolver</label>
            <p className="text-xs text-text-muted">Select the primary recursive nameserver used for root query forwarding.</p>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 pt-1">
              {[
                { id: 'cloudflare', name: 'Cloudflare', ip: '1.1.1.1' },
                { id: 'google', name: 'Google DNS', ip: '8.8.8.8' },
                { id: 'quad9', name: 'Quad9', ip: '9.9.9.9' },
                { id: 'local', name: 'Local Host', ip: '127.0.0.1' },
              ].map((provider) => {
                const isActive = upstreamDns === provider.id
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => setUpstreamDns(provider.id as any)}
                    className={`rounded-xl border p-3.5 text-left transition ${
                      isActive
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border-subtle bg-white text-text-main hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold">{provider.name}</p>
                    <p className={`font-mono text-[10px] mt-1 ${isActive ? 'text-primary/80' : 'text-slate-400'}`}>
                      {provider.ip}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Grid for toggles and inputs */}
          <div className="grid gap-6 md:grid-cols-2 pt-2 border-t border-border-subtle">
            {/* DNSSEC Toggle */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main">DNSSEC Verification</label>
              <p className="text-xs text-text-muted">Enforce cryptographic verification checks on zone RR signatures.</p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDnssec(!dnssec)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    dnssec ? 'bg-primary' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      dnssec ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-bold text-text-main">
                  {dnssec ? 'Enabled (Enforced)' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Cache Override Policy */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main">Cache Override Policy</label>
              <p className="text-xs text-text-muted">Adjust how resolver handles record expiration values.</p>
              <select
                value={ttlOverride}
                onChange={(e) => setTtlOverride(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-white px-3 py-2 text-xs font-semibold text-text-main outline-none cursor-pointer focus:border-primary"
              >
                <option value="default">Honor standard TTL response headers</option>
                <option value="min">Enforce minimum 300s cache TTL</option>
                <option value="no-cache">Disable cache completely (Pass-through)</option>
              </select>
            </div>

            {/* Max Cache Entry Limit */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main">Max Cache Capacity</label>
              <p className="text-xs text-text-muted">Maximum number of entries permitted in RAM cache index.</p>
              <select
                value={cacheSize}
                onChange={(e) => setCacheSize(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-white px-3 py-2 text-xs font-semibold text-text-main outline-none cursor-pointer focus:border-primary"
              >
                <option value="512">512 Records (Compact)</option>
                <option value="1024">1024 Records (Standard)</option>
                <option value="2048">2048 Records (Developer)</option>
                <option value="4096">4096 Records (Enterprise)</option>
              </select>
            </div>

            {/* Simulated Trace Latency Multiplier */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main">Recursion Trace Speed</label>
              <p className="text-xs text-text-muted">Adjust trace delay interval for hops diagram animation.</p>
              <select
                value={latencyMultiplier}
                onChange={(e) => setLatencyMultiplier(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-white px-3 py-2 text-xs font-semibold text-text-main outline-none cursor-pointer focus:border-primary"
              >
                <option value="0.5">Fast (0.5x speed delay)</option>
                <option value="1.0">Standard Speed (1.0x delay)</option>
                <option value="2.0">Slow (2.0x debug animation delay)</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between border-t border-border-subtle pt-6">
            <span className="text-xs font-semibold text-emerald-600">
              {showSaveMessage && '✓ Settings saved successfully'}
            </span>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white hover:bg-primary-dark shadow-sm transition"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-3xl border border-rose-200 bg-rose-50/20 p-6">
        <h4 className="text-sm font-bold uppercase tracking-wider text-rose-800 border-b border-rose-200 pb-3 mb-4">
          Danger Zone
        </h4>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold text-rose-800">Clear Search History Database</p>
            <p className="text-[11px] text-rose-700/80 mt-0.5">Wipe all DNS query logs, resolve trace histories, and cached list counters.</p>
          </div>
          <div>
            {showClearConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition"
                >
                  Confirm Delete
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-sm transition"
              >
                Clear Database Logs
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
