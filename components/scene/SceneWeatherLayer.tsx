'use client'

import { useEffect, useState } from 'react'
import type { WeatherPreset } from '@/types/work'

interface RainDrop {
  left: string
  height: string
  opacity: number
  duration: string
  delay: string
}

function createDrops(count: number): RainDrop[] {
  return Array.from({ length: count }, () => ({
    left: `${Math.random() * 100}%`,
    height: `${56 + Math.random() * 72}px`,
    opacity: 0.12 + Math.random() * 0.24,
    duration: `${0.4 + Math.random() * 0.4}s`,
    delay: `${Math.random() * 5}s`,
  }))
}

interface SceneWeatherLayerProps {
  preset: WeatherPreset
  intensity: number
  enabled: boolean
}

export function SceneWeatherLayer({
  preset,
  intensity,
  enabled,
}: SceneWeatherLayerProps) {
  const [drops, setDrops] = useState<RainDrop[]>(() => createDrops(120))
  const [isFlashing, setIsFlashing] = useState(false)
  const [boltPos, setBoltPos] = useState(50)

  useEffect(() => {
    if (!enabled || preset !== 'storm') return

    const updateDrops = () => {
      const isMobile = window.innerWidth < 768
      const base = isMobile ? 90 : 150
      const extra = isMobile ? 18 : 32
      setDrops(createDrops(Math.round(base + intensity * extra)))
    }

    updateDrops()
    window.addEventListener('resize', updateDrops)
    return () => window.removeEventListener('resize', updateDrops)
  }, [enabled, intensity, preset])

  useEffect(() => {
    if (!enabled || preset !== 'storm') return

    const timers: number[] = []
    const interval = window.setInterval(() => {
      const threshold = 0.8 - intensity * 0.12

      if (Math.random() <= threshold) return

      setBoltPos(Math.random() * 95)
      setIsFlashing(true)
      timers.push(window.setTimeout(() => setIsFlashing(false), 50))
      timers.push(window.setTimeout(() => setIsFlashing(true), 100))
      timers.push(window.setTimeout(() => setIsFlashing(false), 250))
    }, 1000)

    return () => {
      window.clearInterval(interval)
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [enabled, intensity, preset])

  if (!enabled || preset !== 'storm') return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0">
        {drops.map((drop, index) => (
          <span
            key={`${drop.left}-${index}`}
            className="absolute -top-[140px] w-[1.5px]"
            style={{
              left: drop.left,
              height: drop.height,
              opacity: drop.opacity,
              background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.86))',
              mixBlendMode: 'screen',
              animation: `scene-rain-fall ${drop.duration} linear infinite`,
              animationDelay: drop.delay,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 z-[5]">
        <div
          className={`absolute inset-0 transition-opacity duration-75 ${isFlashing ? 'opacity-100' : 'opacity-0'}`}
          style={{
            background: 'rgba(255, 255, 255, 0.14)',
            animation: isFlashing ? 'scene-lightning-flash 0.25s ease-out forwards' : undefined,
          }}
        />

        {isFlashing ? (
          <div
            className="absolute top-0 bottom-0 z-[6] w-[2px] blur-[1px]"
            style={{
              left: `${boltPos}%`,
              background: '#fff',
              boxShadow: '0 0 20px #fff, 0 0 40px #fff, 0 0 80px rgba(242, 185, 75, 0.65)',
              transform: 'skewX(-15deg)',
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
