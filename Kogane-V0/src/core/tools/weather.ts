import { db } from '@/db'
import { loadApiKey } from '@/core/crypto/vault'
import type { ToolDefinition } from '@/types'

interface WeatherResult {
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  description: string
  forecast?: Array<{
    date: string
    tempMin: number
    tempMax: number
    description: string
  }>
}

async function getApiKey(): Promise<string | null> {
  try {
    const apiKey = await loadApiKey('openweathermap')
    if (apiKey) return apiKey
    
    const weatherKey = await loadApiKey('weather')
    return weatherKey
  } catch {
    return null
  }
}

export async function getWeather(location: string, apiKey?: string): Promise<WeatherResult | null> {
  const key = apiKey || (await getApiKey())
  if (!key) {
    return {
      temperature: 0,
      feelsLike: 0,
      humidity: 0,
      windSpeed: 0,
      description: 'Weather API key not configured',
    }
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${key}&units=metric`
    )

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      description: data.weather[0].description,
    }
  } catch (error) {
    console.error('Weather fetch error:', error)
    return null
  }
}

export async function getForecast(location: string, apiKey?: string): Promise<WeatherResult | null> {
  const key = apiKey || (await getApiKey())
  if (!key) return null

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${key}&units=metric`
    )

    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.status}`)
    }

    const data = await response.json()

    const forecast = data.list.slice(0, 5).map((item: any) => ({
      date: item.dt_txt,
      tempMin: item.main.temp_min,
      tempMax: item.main.temp_max,
      description: item.weather[0].description,
    }))

    return {
      temperature: data.list[0].main.temp,
      feelsLike: data.list[0].main.feels_like,
      humidity: data.list[0].main.humidity,
      windSpeed: data.list[0].wind.speed,
      description: data.list[0].weather[0].description,
      forecast,
    }
  } catch (error) {
    console.error('Forecast fetch error:', error)
    return null
  }
}

export const weatherTool: ToolDefinition = {
  name: 'weather',
  description: 'Get current weather and forecast for a location. Requires OpenWeatherMap API key.',
  parameters: {
    location: { type: 'string', description: 'City name or location' },
    type: { type: 'string', description: 'Type: current or forecast', enum: ['current', 'forecast'] },
  },
  execute: async (args) => {
    const { location, type = 'current' } = args
    if (type === 'forecast') {
      return getForecast(location as string)
    }
    return getWeather(location as string)
  },
}