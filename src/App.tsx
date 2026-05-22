import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import AnalyticsTab from './components/AnalyticsTab'
import CacheTab from './components/CacheTab'
import QueryLogsTab from './components/QueryLogsTab'
import type { QueryRecord } from './components/QueryLogsTab'
import ResolverTab from './components/ResolverTab'
import type { ResolverStep } from './components/ResolverTab'
import SettingsTab from './components/SettingsTab'

type ResolveResponse = {
  domain: string
  server: string
  queryType: 'A' | 'AAAA' | 'MX'
  ip: string
  cacheHit: boolean
  hops: Array<{
    server: string
    time: number
  }>
  latency: number
  ttl: number
}

type CacheSnapshotEntry = {
  domain: string
  ip: string
  type: string
  ttl: number
  maxTtl: number
  size: string
  expiresIn: number
}

type ResolvePayload = ResolveResponse & {
  Ttl?: number
  ttl?: number
}

const hostPattern = /(?:https?:\/\/)?((?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+)/i

function normalizeResolvePayload(payload: ResolvePayload): ResolveResponse {
  const ttlCandidate = payload.ttl ?? payload.Ttl
  return {
    ...payload,
    ttl: typeof ttlCandidate === 'number' && Number.isFinite(ttlCandidate) ? ttlCandidate : 0,
  }
}

function normalizeDomainInput(value: string): string {
  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  const hostMatch = trimmed.match(hostPattern)
  if (hostMatch?.[1]) {
    return hostMatch[1].replace(/\.$/, '')
  }

  for (const candidate of [trimmed, `https://${trimmed}`]) {
    try {
      const parsed = new URL(candidate)
      const hostname = parsed.hostname.replace(/\.$/, '')
      if (hostname) {
        return hostname
      }
    } catch {
      // Try the next candidate.
    }
  }

  return trimmed.replace(/\/$/, '').split(/[/?#]/)[0].replace(/\.$/, '')
}

// API base URL can be provided via Vite env `VITE_API_BASE_URL`.
// Fallback to `window.location.origin` for local development.
const API_BASE = ((import.meta as any).env?.VITE_API_BASE_URL as string) || window.location.origin

const navItems = ['Resolver', 'Query Logs', 'Analytics', 'Cache', 'Settings']

const resolutionSteps: ResolverStep[] = [
  {
    name: 'Client',
    ip: '192.168.1.12',
    responseTime: '2 ms',
    status: 'Idle',
    detail: 'Browser query initiates the recursive lookup.',
  },
  {
    name: 'Root Server',
    ip: '198.41.0.4',
    responseTime: '8 ms',
    status: 'Idle',
    detail: 'Returns the authoritative TLD delegation for the request.',
  },
  {
    name: 'TLD Server (.com)',
    ip: '192.5.6.30',
    responseTime: '14 ms',
    status: 'Idle',
    detail: 'Points the resolver to the domain\'s authoritative name server.',
  },
  {
    name: 'Authoritative Server',
    ip: '172.64.32.120',
    responseTime: '21 ms',
    status: 'Idle',
    detail: 'Responds with the final A/AAAA record and TTL metadata.',
  },
  {
    name: 'Resolved IP',
    ip: '93.184.216.34',
    responseTime: '1 ms',
    status: 'Resolved',
    detail: 'Destination returned to the client for immediate connection.',
  },
]

const shellFeed = [
  '[resolver] Query accepted and normalized.',
  '[cache] Cache lookup completed in 1.4 ms.',
  '[root] Delegation received from root server.',
  '[tld] .com authoritative NS returned.',
  '[auth] Final A record resolved successfully.',
]

function App() {
  const [activeTab, setActiveTab] = useState('Resolver')
  const [domain, setDomain] = useState('')
  const [queryType, setQueryType] = useState<'A' | 'AAAA' | 'MX'>('A')
  const [upstreamServer, setUpstreamServer] = useState('1.1.1.1')
  const [isResolving, setIsResolving] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [history, setHistory] = useState<QueryRecord[]>([])
  const [liveLogs, setLiveLogs] = useState(shellFeed)
  const [copied, setCopied] = useState(false)
  const [resolveError, setResolveError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<ResolveResponse | null>(null)
  const [cacheEntries, setCacheEntries] = useState<CacheSnapshotEntry[]>([])

  const activeResult = lastResult?.domain === domain && lastResult.queryType === queryType ? lastResult : null
  const displayLatency = activeResult ? activeResult.latency : null
  const displayIp = activeResult ? activeResult.ip : ''

  const refreshCache = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/cache`)
      if (!response.ok) {
        return
      }

      const payload = (await response.json()) as CacheSnapshotEntry[]
      setCacheEntries(payload)
    } catch {
      setCacheEntries([])
    }
  }

  useEffect(() => {
    if (!isResolving) {
      setActiveStep(0)
      return undefined
    }

    const messages = [
      `[resolver] Tracing ${domain} (${queryType})`,
      '[root] Root server response received.',
      '[tld] Following .com delegation chain.',
      '[auth] Awaiting authoritative record.',
      '[done] Awaiting backend confirmation.',
    ]

    let index = 0
    setLiveLogs((current) => [messages[0], ...current].slice(0, 10))

    const timer = window.setInterval(() => {
      index += 1
      setActiveStep(index)
      setLiveLogs((current) => [messages[index], ...current].slice(0, 10))

      if (index >= resolutionSteps.length - 1) {
        window.clearInterval(timer)
      }
    }, 850)

    return () => window.clearInterval(timer)
  }, [domain, isResolving, queryType])

  useEffect(() => {
    if (!copied) {
      return undefined
    }

    const timer = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  useEffect(() => {
    if (activeTab === 'Cache') {
      void refreshCache()
    }
  }, [activeTab])

  const cacheHitMiss = activeResult ? (activeResult.cacheHit ? 'Hit' : 'Miss') : null
  const ttl = activeResult ? activeResult.ttl : null

  const handleResolve = async () => {
    const normalizedDomain = normalizeDomainInput(domain)
    if (!normalizedDomain || isResolving) {
      return
    }

    setDomain(normalizedDomain)
    setResolveError(null)
    setIsResolving(true)
    setActiveStep(0)
    setLiveLogs((current) => [`[resolver] Dispatching ${normalizedDomain} to ${upstreamServer || 'root servers'} (${queryType})`, ...current].slice(0, 10))

    try {
      const url = new URL('/api/resolve', API_BASE)
      url.searchParams.set('domain', normalizedDomain)
      url.searchParams.set('type', queryType)
      if (upstreamServer.trim()) {
        url.searchParams.set('server', upstreamServer.trim())
      }

      const response = await fetch(url.toString())
      const payload: ResolvePayload | { error?: string } = await response.json()

      if (!response.ok) {
        const errorPayload = payload as { error?: string }
        throw new Error(errorPayload.error ?? 'Resolver request failed')
      }

      const resolved = normalizeResolvePayload(payload as ResolvePayload)

      setLastResult(resolved)
      setHistory((current) => [
        {
          domain: resolved.domain,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          resolvedIp: resolved.ip,
          latency: `${resolved.latency} ms`,
          status: resolved.cacheHit ? 'Cache hit' : 'Success',
          source: resolved.cacheHit ? 'cache' : 'network',
          queryType: resolved.queryType,
        },
        ...current,
      ])
      await refreshCache()
      setLiveLogs((current) => [`[done] ${resolved.domain} resolved via ${resolved.server || upstreamServer} to ${resolved.ip}`, ...current].slice(0, 10))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Resolver request failed'
      setResolveError(message)
      setLiveLogs((current) => [`[error] ${message}`, ...current].slice(0, 10))
    } finally {
      setIsResolving(false)
    }
  }

  const handleCopyIp = async () => {
    if (!displayIp) {
      return
    }

    await navigator.clipboard.writeText(displayIp)
    setCopied(true)
  }

  return (
    <div className="relative min-h-screen pb-12">
      <div className="relative mx-auto max-w-400 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header className="sticky top-4 z-30 mb-6 rounded-3xl border border-border-subtle bg-white/70 px-4 py-4 shadow-premium backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-sm font-semibold tracking-[0.3em] text-primary shadow-sm">
                RX
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">DNS Resolver Dashboard</p>
                <h1 className="text-xl font-black tracking-tight text-text-main">ResolveX</h1>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-1.5">
              {navItems.map((item) => {
                const isActive = activeTab === item
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setActiveTab(item)}
                    className={`cursor-pointer rounded-full px-4.5 py-2 text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'scale-102 bg-primary text-white shadow-md shadow-primary/25'
                        : 'bg-transparent text-text-muted hover:bg-slate-100/60 hover:text-text-main'
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </nav>
          </div>
        </header>

        <main className="mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              {activeTab === 'Resolver' && (
                <ResolverTab
                  domain={domain}
                  setDomain={setDomain}
                  queryType={queryType}
                  setQueryType={setQueryType}
                  upstreamServer={upstreamServer}
                  resolveError={resolveError}
                  isResolving={isResolving}
                  handleResolve={handleResolve}
                  displayIp={displayIp}
                  displayLatency={displayLatency}
                  activeStep={activeStep}
                  resolutionSteps={resolutionSteps}
                  liveLogs={liveLogs}
                  copied={copied}
                  handleCopyIp={handleCopyIp}
                  ttl={ttl}
                  cacheHitMiss={cacheHitMiss}
                />
              )}
              {activeTab === 'Query Logs' && <QueryLogsTab history={history} clearLogs={() => setHistory([])} />}
              {activeTab === 'Analytics' && <AnalyticsTab history={history} />}
              {activeTab === 'Cache' && <CacheTab entries={cacheEntries} onRefresh={refreshCache} />}
              {activeTab === 'Settings' && (
                <SettingsTab
                  upstreamServer={upstreamServer}
                  setUpstreamServer={setUpstreamServer}
                  clearLogs={() => {
                    setHistory([])
                    setCacheEntries([])
                    setLiveLogs([])
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default App
