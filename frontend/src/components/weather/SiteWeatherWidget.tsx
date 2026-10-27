"use client"

import React, { useState, useEffect } from "react"
import {
  CloudRain,
  Sun,
  Cloud,
  CloudLightning,
  CloudDrizzle,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  RefreshCw,
  ShieldAlert,
  HardHat,
  Calendar,
} from "lucide-react"

export interface WeatherTask {
  id: string
  name: string
  duration: number
  start_day?: number
  finish_day?: number
  is_critical?: boolean
}

interface SiteWeatherWidgetProps {
  tasks?: WeatherTask[]
  projectCity?: string
}

interface CityOption {
  name: string
  lat: number
  lon: number
  state: string
}

const MAHARASHTRA_CITIES: CityOption[] = [
  { name: "Pune", lat: 18.5204, lon: 73.8567, state: "Maharashtra (SPPU Hub)" },
  { name: "Mumbai", lat: 19.076, lon: 72.8777, state: "Maharashtra (MahaRERA HQ)" },
  { name: "Thane", lat: 19.2183, lon: 72.9781, state: "Maharashtra" },
  { name: "Nagpur", lat: 21.1458, lon: 79.0882, state: "Maharashtra" },
  { name: "Nashik", lat: 19.9975, lon: 73.7898, state: "Maharashtra" },
  { name: "Chh. Sambhajinagar", lat: 19.8762, lon: 75.3433, state: "Maharashtra" },
]

interface DailyForecast {
  date: string
  dayName: string
  weatherCode: number
  tempMax: number
  tempMin: number
  precipitationMm: number
  precipitationProb: number
  riskLevel: "LOW" | "MODERATE" | "HIGH"
  advisory: string
}

interface WeatherData {
  currentTemp: number
  humidity: number
  windSpeed: number
  precipitationNow: number
  weatherCode: number
  daily: DailyForecast[]
}

function getWeatherDescription(code: number): { label: string; icon: React.ReactNode; isRain: boolean } {
  if (code === 0) {
    return { label: "Clear Sky", icon: <Sun className="w-4 h-4 text-amber-500" />, isRain: false }
  }
  if (code >= 1 && code <= 3) {
    return { label: "Partly Cloudy", icon: <Cloud className="w-4 h-4 text-slate-400" />, isRain: false }
  }
  if (code >= 51 && code <= 57) {
    return { label: "Light Drizzle", icon: <CloudDrizzle className="w-4 h-4 text-blue-400" />, isRain: true }
  }
  if (code >= 61 && code <= 67) {
    return { label: "Rain Showers", icon: <CloudRain className="w-4 h-4 text-blue-500" />, isRain: true }
  }
  if (code >= 80 && code <= 82) {
    return { label: "Heavy Rain", icon: <CloudRain className="w-4 h-4 text-orange-500" />, isRain: true }
  }
  if (code >= 95) {
    return { label: "Thunderstorm", icon: <CloudLightning className="w-4 h-4 text-red-500" />, isRain: true }
  }
  return { label: "Overcast", icon: <Cloud className="w-4 h-4 text-slate-400" />, isRain: false }
}

function getConstructionAdvisory(rainMm: number, rainProb: number, tempMax: number, windKm: number): {
  risk: "LOW" | "MODERATE" | "HIGH"
  message: string
} {
  if (rainMm > 5 || rainProb > 65) {
    return {
      risk: "HIGH",
      message: "Severe Rain Risk: Halt outdoor RCC concreting & deep excavation. Stage dewatering pumps.",
    }
  }
  if (rainMm > 1.5 || rainProb > 40) {
    return {
      risk: "MODERATE",
      message: "Precipitation Warning: Protect fresh plaster/curing slabs. Monitor concrete slump.",
    }
  }
  if (windKm > 38) {
    return {
      risk: "MODERATE",
      message: "High Wind Alert: Tower crane operations require wind-speed monitoring (IS 7293).",
    }
  }
  if (tempMax > 38) {
    return {
      risk: "MODERATE",
      message: "Hot Weather Concreting: Use chilled mixing water & continuous wet burlap curing (IS 456).",
    }
  }
  return {
    risk: "LOW",
    message: "Optimal Conditions: All structural and external finishes safe for execution.",
  }
}

export function SiteWeatherWidget({ tasks = [], projectCity = "Pune" }: SiteWeatherWidgetProps) {
  const [selectedCity, setSelectedCity] = useState<CityOption>(() => {
    const found = MAHARASHTRA_CITIES.find(
      (c) => c.name.toLowerCase() === projectCity.toLowerCase()
    )
    return found || MAHARASHTRA_CITIES[0]
  })

  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWeather = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata&forecast_days=7`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Weather service temporarily unavailable.")
      const data = await res.json()

      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const dailyList: DailyForecast[] = data.daily.time.map((t: string, idx: number) => {
        const d = new Date(t)
        const dayName = idx === 0 ? "Today" : idx === 1 ? "Tomorrow" : daysOfWeek[d.getDay()]
        const rainMm = data.daily.precipitation_sum[idx] ?? 0
        const rainProb = data.daily.precipitation_probability_max[idx] ?? 0
        const tempMax = data.daily.temperature_2m_max[idx] ?? 30
        const windKm = data.current.wind_speed_10m ?? 12

        const adv = getConstructionAdvisory(rainMm, rainProb, tempMax, windKm)

        return {
          date: t,
          dayName,
          weatherCode: data.daily.weather_code[idx] ?? 0,
          tempMax: Math.round(tempMax),
          tempMin: Math.round(data.daily.temperature_2m_min[idx] ?? 20),
          precipitationMm: Number(rainMm.toFixed(1)),
          precipitationProb: Math.round(rainProb),
          riskLevel: adv.risk,
          advisory: adv.message,
        }
      })

      setWeather({
        currentTemp: Math.round(data.current.temperature_2m),
        humidity: Math.round(data.current.relative_humidity_2m),
        windSpeed: Math.round(data.current.wind_speed_10m),
        precipitationNow: data.current.precipitation,
        weatherCode: data.current.weather_code,
        daily: dailyList,
      })
    } catch (err: any) {
      setError(err.message || "Failed to fetch live site weather.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather()
  }, [selectedCity])

  // Correlate rain risk with sensitive tasks scheduled in next 7 days
  const rainDays = weather?.daily.filter((d) => d.precipitationMm >= 1.5 || d.precipitationProb >= 40) || []
  const sensitiveKeywords = ["slab", "concrete", "pour", "excavat", "plaster", "paint", "waterproof", "external"]

  const affectedTasks = tasks.filter((t) => {
    const nameLower = t.name.toLowerCase()
    return sensitiveKeywords.some((kw) => nameLower.includes(kw))
  })

  const currentDesc = weather ? getWeatherDescription(weather.weatherCode) : null
  const hasSevereWeather = rainDays.length > 0

  return (
    <div className="border border-border bg-card rounded-sm overflow-hidden font-mono text-xs">
      {/* Top Banner Bar */}
      <div className="p-3 bg-muted/40 border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-primary/10 border border-primary/30 text-primary">
            <HardHat className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-semibold text-xs tracking-wider text-foreground uppercase">
                Site Meteorology & Rain Delay Guard
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-secondary border border-border text-muted-foreground">
                IS 456 Compliant
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
              <MapPin className="w-3 h-3 text-primary inline" />
              <span>Project Site:</span>
              <select
                value={selectedCity.name}
                onChange={(e) => {
                  const c = MAHARASHTRA_CITIES.find((item) => item.name === e.target.value)
                  if (c) setSelectedCity(c)
                }}
                className="bg-background border border-border text-foreground px-1.5 py-0.5 text-[11px] font-mono focus:outline-none focus:border-primary"
              >
                {MAHARASHTRA_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.lat}°N, {c.lon}°E)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Weather Snapshot */}
        {weather && !isLoading && (
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              {currentDesc?.icon}
              <span className="font-semibold text-foreground">{weather.currentTemp}°C</span>
              <span className="text-[10px] text-muted-foreground">({currentDesc?.label})</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
              <Droplets className="w-3 h-3 text-blue-400" />
              <span>{weather.humidity}% RH</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
              <Wind className="w-3 h-3 text-slate-400" />
              <span>{weather.windSpeed} km/h</span>
            </div>

            {hasSevereWeather ? (
              <span className="px-2 py-0.5 bg-status-warning/15 border border-status-warning/40 text-status-warning text-[10px] font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>RAIN RISK IN 7-DAY FORECAST</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-status-success/15 border border-status-success/40 text-status-success text-[10px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>FAVORABLE FOR CONCRETING</span>
              </span>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 px-2 py-1 border border-border hover:bg-muted text-[11px] text-foreground transition-colors ml-1"
            >
              <span>{isExpanded ? "Collapse" : "7-Day Advisory"}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
            <span>Fetching Live Station Radar...</span>
          </div>
        )}
      </div>

      {/* Task Delay Risk Alert Ribbon (if rain is predicted and sensitive tasks exist) */}
      {hasSevereWeather && affectedTasks.length > 0 && (
        <div className="px-4 py-2.5 bg-status-warning/10 border-b border-status-warning/30 flex items-start gap-2 text-xs">
          <ShieldAlert className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold text-status-warning">
              Advisory for Site Engineer: {rainDays.length} day(s) of rain detected during upcoming schedule
            </div>
            <p className="text-[11px] text-foreground/80 font-sans">
              Critical outdoor tasks ({affectedTasks.slice(0, 3).map((t) => t.name).join(", ")}
              {affectedTasks.length > 3 ? ` + ${affectedTasks.length - 3} more` : ""}) may experience quality non-conformance if exposed to water.
              Schedule concrete pours on clear days ({weather?.daily.filter((d) => d.riskLevel === "LOW").map((d) => d.dayName).join(", ") || "None upcoming"}).
            </p>
          </div>
        </div>
      )}

      {/* Expanded 7-Day Matrix */}
      {isExpanded && weather && (
        <div className="p-4 space-y-3 bg-card border-t border-border">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>7-DAY CONSTRUCTION WORKABILITY MATRIX (OPEN-METEO RADAR)</span>
            <span className="text-[10px]">Station Timezone: Asia/Kolkata (GMT+5:30)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {weather.daily.map((day) => {
              const dayDesc = getWeatherDescription(day.weatherCode)
              const isToday = day.dayName === "Today"

              return (
                <div
                  key={day.date}
                  className={`p-2.5 border transition-all flex flex-col justify-between ${
                    day.riskLevel === "HIGH"
                      ? "border-destructive/60 bg-destructive/10"
                      : day.riskLevel === "MODERATE"
                      ? "border-status-warning/60 bg-status-warning/10"
                      : isToday
                      ? "border-primary/60 bg-primary/5"
                      : "border-border bg-muted/20"
                  }`}
                >
                  {/* Day Header */}
                  <div>
                    <div className="flex items-center justify-between border-b border-border/40 pb-1 mb-1.5">
                      <span className={`font-bold text-xs ${isToday ? "text-primary" : "text-foreground"}`}>
                        {day.dayName}
                      </span>
                      <span className="text-[9px] text-muted-foreground">{day.date.slice(5)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 my-1">
                      {dayDesc.icon}
                      <span className="text-[10px] text-foreground truncate">{dayDesc.label}</span>
                    </div>

                    <div className="text-[11px] font-semibold text-foreground mt-1">
                      {day.tempMax}° / <span className="text-muted-foreground text-[10px]">{day.tempMin}°C</span>
                    </div>
                  </div>

                  {/* Rain Probability & Advisory */}
                  <div className="mt-2 pt-1.5 border-t border-border/40">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Rain (mm):</span>
                      <span
                        className={`font-semibold ${
                          day.precipitationMm > 2 ? "text-destructive" : day.precipitationMm > 0 ? "text-status-warning" : "text-foreground"
                        }`}
                      >
                        {day.precipitationMm} mm
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] mt-0.5">
                      <span className="text-muted-foreground">Probability:</span>
                      <span className={`${day.precipitationProb > 50 ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                        {day.precipitationProb}%
                      </span>
                    </div>

                    <div className="mt-1.5 text-[9px] leading-tight font-sans text-muted-foreground line-clamp-2" title={day.advisory}>
                      {day.advisory}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-status-success inline-block" /> Low Risk (Concreting Safe)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-status-warning inline-block" /> Moderate Risk (Plaster/Crane Precaution)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-destructive inline-block" /> High Risk (Halt External Concreting)
              </span>
            </div>
            <span>Powered by Open-Meteo High-Resolution Numerical Forecast API</span>
          </div>
        </div>
      )}
    </div>
  )
}
