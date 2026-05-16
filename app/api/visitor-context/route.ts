import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { getSiteProfile } from '@/lib/site'

const FALLBACK_QUOTES = [
  { text: '风会记得每一条认真走过的路。', from: '站点备忘' },
  { text: '慢一点没关系，重要的是一直在靠近。', from: '站点备忘' },
  { text: '把日常过细一点，生活就会亮一点。', from: '站点备忘' },
]

function parseClientIp(headerValue: string | null) {
  if (!headerValue) return null

  const value = headerValue.split(',')[0]?.trim()
  if (!value) return null
  if (value === '::1' || value === '127.0.0.1') return null

  return value.replace(/^::ffff:/, '')
}

function isPrivateIp(ip: string) {
  return (
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
    ip === 'localhost'
  )
}

function buildLocationLabel(city?: string | null, region?: string | null, country?: string | null) {
  const values = [country, region, city].filter(Boolean)
  return values.length > 0 ? values.join(' / ') : '远方'
}

function buildGreeting(locationLabel: string, city?: string | null) {
  if (city) return `来自 ${city} 的朋友，欢迎你。`
  if (locationLabel !== '远方') return `来自 ${locationLabel} 的朋友，欢迎你。`
  return '路过这里的朋友，欢迎你。'
}

async function fetchGeo(ip: string | null) {
  const headerStore = await headers()
  const city = headerStore.get('x-vercel-ip-city')
  const region = headerStore.get('x-vercel-ip-country-region')
  const country = headerStore.get('x-vercel-ip-country')

  if (city || region || country) {
    const locationLabel = buildLocationLabel(city, region, country)
    return {
      city,
      region,
      country,
      locationLabel,
      greeting: buildGreeting(locationLabel, city),
    }
  }

  if (!ip || isPrivateIp(ip)) {
    return {
      city: null,
      region: null,
      country: null,
      locationLabel: '远方',
      greeting: buildGreeting('远方'),
    }
  }

  try {
    const response = await fetch(`https://ipwho.is/${ip}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
    })

    if (!response.ok) throw new Error('geolocation request failed')

    const data = (await response.json()) as {
      success?: boolean
      city?: string
      region?: string
      country?: string
    }

    const nextCity = data.success === false ? null : data.city ?? null
    const nextRegion = data.success === false ? null : data.region ?? null
    const nextCountry = data.success === false ? null : data.country ?? null
    const locationLabel = buildLocationLabel(nextCity, nextRegion, nextCountry)

    return {
      city: nextCity,
      region: nextRegion,
      country: nextCountry,
      locationLabel,
      greeting: buildGreeting(locationLabel, nextCity),
    }
  } catch {
    return {
      city: null,
      region: null,
      country: null,
      locationLabel: '远方',
      greeting: buildGreeting('远方'),
    }
  }
}

async function fetchQuote() {
  const profile = await getSiteProfile()
  const source = profile.homeQuotePool.length > 0 ? profile.homeQuotePool : FALLBACK_QUOTES
  const picked = source[Math.floor(Math.random() * source.length)]

  return {
    text: picked.text,
    from: picked.from,
  }
}

export async function GET() {
  const headerStore = await headers()
  const ip = parseClientIp(headerStore.get('x-forwarded-for') || headerStore.get('x-real-ip'))

  const [geo, quote] = await Promise.all([fetchGeo(ip), fetchQuote()])

  return NextResponse.json({
    ...geo,
    quote,
  })
}
