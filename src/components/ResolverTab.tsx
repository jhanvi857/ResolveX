import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

export type ResolverStep = {
  name: string
  ip: string
  responseTime: string
  status: 'Idle' | 'Tracing' | 'Resolved'
  detail: string
}

interface ResolverTabProps {
  domain: string
  setDomain: (domain: string) => void
  queryType: 'A' | 'AAAA' | 'MX'
  setQueryType: (type: 'A' | 'AAAA' | 'MX') => void
  upstreamServer: string
  resolveError: string | null
  isResolving: boolean
  handleResolve: () => Promise<void> | void
  displayIp: string
  displayLatency: number | null
  activeStep: number
  resolutionSteps: ResolverStep[]
  liveLogs: string[]
  copied: boolean
  handleCopyIp: () => void
  ttl: number | null
  cacheHitMiss: 'Hit' | 'Miss' | null
}

export default function ResolverTab({
  domain,
  setDomain,
  queryType,
  setQueryType,
  upstreamServer,
  resolveError,
  isResolving,
  handleResolve,
  displayIp,
  displayLatency,
  activeStep,
  resolutionSteps,
  liveLogs,
  copied,
  handleCopyIp,
  ttl,
  cacheHitMiss,
}: ResolverTabProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(3)
  const hasResolvedResult = Boolean(displayIp)

  const metrics = [
    { label: 'Total Latency', value: isResolving ? 'Tracing...' : displayLatency !== null ? `${displayLatency} ms` : '-', tone: 'bg-primary/5 text-primary border-primary/20' },
    { label: 'Cache Status', value: cacheHitMiss ?? '-', tone: 'bg-secondary/10 text-secondary-dark border-secondary/20' },
    { label: 'Hops Tunnels', value: hasResolvedResult ? '4 Hops' : '-', tone: 'bg-slate-500/5 text-slate-700 border-slate-200' },
    { label: 'Time To Live', value: ttl !== null ? `${ttl}s` : '-', tone: 'bg-primary/5 text-primary border-primary/10' },
    { label: 'Query Type', value: queryType, tone: 'bg-secondary/10 text-secondary-dark border-secondary/10' },
  ]

  return (
    <div className="space-y-6">
      {/* Search Input Section */}
      <div className="grid gap-6 lg:grid-cols-[1.7fr_0.8fr]">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-border-subtle bg-white p-6 shadow-premium sm:p-8"
        >
          <div className="flex flex-col gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Recursive Tracer Ready
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-text-main sm:text-4xl">
                Trace DNS Recursion
              </h2>
              <p className="text-sm text-text-muted leading-relaxed sm:text-base">
                Input any hostname to watch a simulated trace map from Root DNS servers to TLD, then onto the Authoritative Nameserver.
              </p>
            </div>

            <div className="grid gap-4 rounded-2xl border border-border-subtle bg-bg-app p-4 md:grid-cols-[1fr_auto_auto]">
              <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-white px-4 py-3 transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 text-primary">
                  <path fill="currentColor" d="M10.5 4a6.5 6.5 0 1 0 4.13 11.54l4.41 4.42 1.41-1.42-4.42-4.41A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
                </svg>
                <input
                  value={domain}
                  onChange={(event) => setDomain(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleResolve()
                    }
                  }}
                  placeholder="Enter domain (e.g., google.com, github.com)"
                  className="w-full bg-transparent text-sm font-medium text-text-main outline-none placeholder:text-slate-400 sm:text-base"
                />
              </div>

              <select
                value={queryType}
                onChange={(event) => setQueryType(event.target.value as 'A' | 'AAAA' | 'MX')}
                className="rounded-xl border border-border-subtle bg-white px-4 py-3 text-sm font-semibold text-text-main outline-none cursor-pointer transition focus:border-primary"
              >
                <option value="A">A Record (IPv4)</option>
                <option value="AAAA">AAAA Record (IPv6)</option>
                <option value="MX">MX Record (Mail)</option>
              </select>

              <button
                type="button"
                onClick={handleResolve}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-dark transition duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
                disabled={isResolving}
              >
                {isResolving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Tracing...
                  </>
                ) : (
                  'Resolve Trace'
                )}
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-text-muted">
              <span className="rounded-lg border border-border-subtle bg-bg-app px-3 py-1">State: {isResolving ? 'Resolving' : 'Standby'}</span>
              <span className="rounded-lg border border-border-subtle bg-bg-app px-3 py-1">Active Nameserver: {upstreamServer || 'Root Servers'}</span>
            </div>
            {resolveError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                {resolveError}
              </div>
            )}
          </div>
        </motion.div>

        {/* Dynamic Metric Display */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-3xl border border-border-subtle bg-white p-6 shadow-premium flex flex-col justify-between"
        >
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="font-bold text-text-main">Hops Metrics</h3>
              <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-secondary-dark uppercase">
                Active
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className={`rounded-xl border p-3 flex flex-row items-center justify-between transition-all hover:-translate-y-0.5 ${metric.tone}`}
                >
                  <span className="text-xs font-semibold opacity-80">{metric.label}</span>
                  <span className="text-sm font-bold">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* DNS Flow Diagram and Live Shell Section */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Flow steps */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-3xl border border-border-subtle bg-white p-6 shadow-premium"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-4">
            <div>
              <h3 className="text-lg font-bold text-text-main">Recursion Flow Diagram</h3>
              <p className="text-xs text-text-muted">A step-by-step route mapping the resolution chain.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
              <span className={`h-2.5 w-2.5 rounded-full ${isResolving ? 'animate-pulse bg-emerald-500' : 'bg-primary'}`} />
              {isResolving ? 'Tracing...' : 'Ready'}
            </div>
          </div>

          <div className="space-y-4">
            {resolutionSteps.map((step, index) => {
              const statusTone = index < activeStep ? 'Resolved' : index === activeStep && isResolving ? 'Tracing' : step.status
              const isCurrent = index === activeStep && isResolving
              const borderTone = isCurrent ? 'border-primary/50 ring-2 ring-primary/5 bg-primary/5' : 'border-border-subtle bg-white'
              
              return (
                <motion.div key={step.name} layout className="flex flex-col items-stretch">
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={`rounded-2xl border p-4 transition-all duration-200 ${borderTone}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <div className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${statusTone === 'Resolved' ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' : statusTone === 'Tracing' ? 'bg-primary shadow-[0_0_8px_#618985] animate-pulse' : 'bg-slate-300'}`} />
                        <div>
                          <h4 className="font-bold text-text-main text-sm sm:text-base">{step.name}</h4>
                          <p className="mt-1 text-xs text-text-muted leading-relaxed">{step.detail}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                        className="rounded-lg border border-border-subtle bg-bg-app px-2.5 py-1 text-xs font-semibold text-text-main hover:bg-slate-100 transition"
                      >
                        {expandedStep === index ? 'Collapse' : 'Details'}
                      </button>
                    </div>

                    <div className="mt-3 grid gap-2 grid-cols-3 text-center">
                      <div className="rounded-lg border border-border-subtle/60 bg-bg-app/50 p-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Type</p>
                        <p className="text-xs font-bold text-text-main truncate mt-0.5">{step.name.split(' ')[0]}</p>
                      </div>
                      <div className="rounded-lg border border-border-subtle/60 bg-bg-app/50 p-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Target IP</p>
                        <p className="text-xs font-mono font-bold text-text-main truncate mt-0.5">
                          {index === resolutionSteps.length - 1 && !isResolving ? displayIp : step.ip}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border-subtle/60 bg-bg-app/50 p-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Latency</p>
                        <p className="text-xs font-bold text-text-main truncate mt-0.5">{step.responseTime}</p>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedStep === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 rounded-xl border border-secondary/30 bg-secondary/5 p-3 text-xs leading-relaxed text-text-muted">
                            <div className="flex flex-wrap items-center justify-between gap-2 font-bold mb-2">
                              <span className="text-secondary-dark">Status: {statusTone}</span>
                              <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-secondary/20">
                                {index === resolutionSteps.length - 1 && !isResolving ? displayIp : step.ip}
                              </span>
                            </div>
                            <p>This node processes DNS records under DNSSEC protocol validations. TTL limits are inspected and refreshed dynamically based on server authority configurations.</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Flow Arrow */}
                  {index < resolutionSteps.length - 1 && (
                    <div className="relative flex justify-center py-2">
                      <div className="h-6 w-0.5 bg-gradient-to-b from-primary/60 to-secondary/35" />
                      {isResolving && activeStep >= index && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 8 }}
                          transition={{ repeat: Infinity, repeatType: 'loop', duration: 1.2 }}
                          className="absolute top-0 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(97,137,133,0.8)]"
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Live Trace terminal & Resolved IP info */}
        <div className="space-y-6 flex flex-col">
          {/* Resolved IP information */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-3xl border border-border-subtle bg-white p-6 shadow-premium"
          >
            <div className="mb-4 flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="font-bold text-text-main">Trace Target</h3>
              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase">
                Active IP
              </span>
            </div>

            <div className="rounded-2xl border border-secondary/25 bg-bg-app p-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">Resolved Mapping IP</p>
              <p className="font-mono text-3xl font-bold tracking-tight text-primary-dark select-all truncate">{displayIp || '-'}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-semibold">
                <span className="rounded-lg border border-border-subtle bg-white px-2.5 py-1 text-text-main shadow-sm">{hasResolvedResult ? domain : '-'}</span>
                <span className="rounded-lg border border-border-subtle bg-white px-2.5 py-1 text-text-main shadow-sm">TTL: {ttl !== null ? `${ttl}s` : '-'}</span>
                <span className="rounded-lg border border-border-subtle bg-white px-2.5 py-1 text-text-main shadow-sm">{hasResolvedResult ? queryType : '-'}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyIp}
                disabled={!hasResolvedResult}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white shadow hover:bg-primary-dark transition"
              >
                {copied ? 'Copied to Clipboard!' : 'Copy IP Address'}
              </button>
            </div>
          </motion.div>

          {/* Terminal styled block */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="rounded-3xl border border-slate-900 bg-[#091012] p-5 shadow-premium flex-grow flex flex-col"
          >
            <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">live trace console</h4>
              </div>
              <button
                type="button"
                onClick={handleCopyIp}
                disabled={!hasResolvedResult}
                className="rounded-md border border-slate-700 bg-slate-800/40 px-2 py-1 text-[10px] font-mono text-slate-300 hover:bg-slate-800 transition"
              >
                Copy Shell IP
              </button>
            </div>

            <div className="font-mono text-xs text-emerald-300/90 leading-6 space-y-1.5 flex-grow overflow-y-auto max-h-72 min-h-48 pr-2">
              {liveLogs.map((log, index) => (
                <motion.p
                  key={`${log}-${index}`}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="text-emerald-600 mr-1.5">$</span>
                  {log}
                </motion.p>
              ))}
              <p className="animate-pulse text-emerald-200 mt-1 font-bold">
                {isResolving ? 'Tracing resolvers...' : hasResolvedResult ? `Resolved IP: ${displayIp}` : 'Awaiting trace execution...'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
