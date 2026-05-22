import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import ResolverTab from './components/ResolverTab'
import type { ResolverStep } from './components/ResolverTab'
import QueryLogsTab from './components/QueryLogsTab'
import type { QueryRecord } from './components/QueryLogsTab'
import AnalyticsTab from './components/AnalyticsTab'
import CacheTab from './components/CacheTab'
import SettingsTab from './components/SettingsTab'

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
    detail: 'Points the resolver to the domain’s authoritative name server.',
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

const baseQueryHistory: QueryRecord[] = [
  {
    domain: 'docs.cloudflare.com',
    time: '09:14:05',
    resolvedIp: '104.18.12.98',
    latency: '12 ms',
    status: 'Cache hit',
    source: 'cache',
    queryType: 'A',
  },
  {
    domain: 'github.com',
    time: '09:12:49',
    resolvedIp: '140.82.121.4',
    latency: '18 ms',
    status: 'Success',
    source: 'network',
    queryType: 'A',
  },
  {
    domain: 'api.openai.com',
    time: '09:10:33',
    resolvedIp: '104.18.33.45',
    latency: '23 ms',
    status: 'Success',
    source: 'network',
    queryType: 'AAAA',
  },
  {
    domain: 'fonts.gstatic.com',
    time: '09:09:02',
    resolvedIp: '142.250.72.3',
    latency: '7 ms',
    status: 'Cache hit',
    source: 'cache',
    queryType: 'A',
  },
  {
    domain: 'status.aws.amazon.com',
    time: '09:06:21',
    resolvedIp: '52.94.76.7',
    latency: '29 ms',
    status: 'Success',
    source: 'network',
    queryType: 'MX',
  },
  {
    domain: 'developer.mozilla.org',
    time: '09:03:18',
    resolvedIp: '151.101.2.132',
    latency: '14 ms',
    status: 'Cache hit',
    source: 'cache',
    queryType: 'A',
  },
]

const shellFeed = [
  '[resolver] Query accepted and normalized.',
  '[cache] Cache lookup completed in 1.4 ms.',
  '[root] Delegation received from root server.',
  '[tld] .com authoritative NS returned.',
  '[auth] Final A record resolved successfully.',
]

function hashToNumber(value: string) {
  return value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function formatIp(domain: string) {
  const value = hashToNumber(domain)
  const octetA = 23 + (value % 197)
  const octetB = 11 + ((value * 3) % 233)
  const octetC = 10 + ((value * 5) % 240)
  const octetD = 2 + ((value * 7) % 252)

  return `${octetA}.${octetB}.${octetC}.${octetD}`
}

function formatLatency(domain: string) {
  const value = hashToNumber(domain)
  return 12 + (value % 18)
}

function App() {
  const [activeTab, setActiveTab] = useState('Resolver')
  const [domain, setDomain] = useState('google.com')
  const [queryType, setQueryType] = useState<'A' | 'AAAA' | 'MX'>('A')
  const [isResolving, setIsResolving] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [history, setHistory] = useState<QueryRecord[]>(baseQueryHistory)
  const [liveLogs, setLiveLogs] = useState(shellFeed)
  const [copied, setCopied] = useState(false)

  const displayLatency = useMemo(() => formatLatency(domain), [domain])
  const displayIp = useMemo(() => formatIp(domain), [domain])

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
      `[done] ${domain} resolved to ${displayIp}`,
    ]

    let index = 0
    setLiveLogs((current) => [messages[0], ...current].slice(0, 10))

    const timer = window.setInterval(() => {
      index += 1
      setActiveStep(index)
      setLiveLogs((current) => [messages[index], ...current].slice(0, 10))

      if (index >= resolutionSteps.length - 1) {
        window.clearInterval(timer)
        window.setTimeout(() => {
          setIsResolving(false)
          setHistory((current) => [
            {
              domain,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              resolvedIp: displayIp,
              latency: `${displayLatency} ms`,
              status: hashToNumber(domain) % 5 === 0 ? 'Cache hit' : 'Success',
              source: hashToNumber(domain) % 5 === 0 ? 'cache' : 'network',
              queryType,
            },
            ...current,
          ])
        }, 300)
      }
    }, 850)

    return () => window.clearInterval(timer)
  }, [displayIp, displayLatency, domain, isResolving, queryType])

  useEffect(() => {
    if (!copied) {
      return undefined
    }

    const timer = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  const cacheHitMiss = hashToNumber(domain) % 5 === 0 ? 'Hit' : 'Miss'
  const ttl = 60 + (hashToNumber(domain) % 240)

  const handleResolve = () => {
    const trimmed = domain.trim()
    if (!trimmed || isResolving) {
      return
    }

    setDomain(trimmed)
    setIsResolving(true)
    setActiveStep(0)
  }

  const handleCopyIp = async () => {
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
                    className={`rounded-full px-4.5 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/25 scale-102'
                        : 'bg-transparent text-text-muted hover:text-text-main hover:bg-slate-100/60'
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
              {activeTab === 'Query Logs' && (
                <QueryLogsTab
                  history={history}
                  clearLogs={() => setHistory([])}
                />
              )}
              {activeTab === 'Analytics' && (
                <AnalyticsTab />
              )}
              {activeTab === 'Cache' && (
                <CacheTab />
              )}
              {activeTab === 'Settings' && (
                <SettingsTab
                  clearLogs={() => {
                    setHistory([])
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
