import { useEffect, useRef, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import '../index.css'
import { getCreditScoreGraph } from "../api/creditAPI"

type VisibilityEvent = {
  event_id: number
  business_id: number
  credit_score: number
  event_time: string | number
}

function formatDateShort(eventTime: string | number): string {
  const d =
    typeof eventTime === 'number'
      ? new Date(eventTime * 1000)
      : new Date(eventTime)

  if (isNaN(d.getTime())) return String(eventTime)

  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${month}/${day}`
}

function CreditScoreGraph() {
  const hasRun = useRef(false)

  const [events, setEvents] = useState<VisibilityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentCreditScore, setCurrentCreditScore] = useState(0)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const runOnPageLoad = async () => {
      try {
        setLoading(true)

        const data = await getCreditScoreGraph("1")

        const rows = Array.isArray(data.result_list) ? data.result_list : []

        setEvents(rows)
        setCurrentCreditScore(Number(data.result) ?? 0)

      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }

    runOnPageLoad()
  }, [])

  const chartData = useMemo(() => {
    let running = 0

    return events.map((event) => {
      const amount = Number((event as any).amount ?? (event as any).credit_score ?? 0)

      running += amount

      return {
        time: (event as any).event_time,
        credit_score: running,
      }
    })
  }, [events])

  return (
    <div className="CreditScoreGraph">
      <h1>Second Page</h1>
      <p>This is your second page.</p>

      <Link to="/">← Back to Home</Link>

      {loading && <p className="page2-loading">Loading events…</p>}
      {error && <p className="page2-error">{error}</p>}

      {!loading && !error && chartData.length > 0 && (
        <div className="page2-chart">
          <h2>Credit Score Graph</h2>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0 0" />

              <XAxis
                dataKey="time"
                tick={{ fontSize: 11 }}
                tickFormatter={formatDateShort}
              />

              <YAxis
                tick={{ fontSize: 12 }}
                label={{
                  value: 'Credit Score (points) per week',
                  angle: -90,
                  position: 'insideLeft'
                }}
                domain={[
                  0,
                  (dataMax: number) =>
                    Math.ceil(Math.max(dataMax * 1.2, dataMax + 5))
                ]}
              />

              <Tooltip
                labelFormatter={(value: any) =>
                  formatDateShort(value as string | number)
                }
              />

              <Area
                type="monotone"
                dataKey="credit_score"
                stroke="#646cff"
                fill="#646cff"
                fillOpacity={0.4}
                name="Credit Score"
                unit="points"
              />
            </AreaChart>
          </ResponsiveContainer>

          <p>Current Credit Score: {currentCreditScore}</p>
        </div>
      )}

      {!loading && !error && chartData.length === 0 && (
        <p>No event data to chart.</p>
      )}
    </div>
  )
}

export default CreditScoreGraph