'use client'

import { useEffect, useRef, useState } from 'react'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import type { SiteProfile } from '@/types/site'

type LinkSiteProfileCardProps = {
  siteProfile: SiteProfile
  rssUrl: string
  stats: Array<{ label: string; value: string }>
}

type InfoItem = {
  key: string
  icon: string
  label: string
  value: string
  copyValue?: string
  href?: string
  fullWidth?: boolean
}

export function LinkSiteProfileCard({
  siteProfile,
  rssUrl,
  stats,
}: LinkSiteProfileCardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)

  const infoItems: InfoItem[] = [
    {
      key: 'site-url',
      icon: 'home',
      label: '站点地址',
      value: siteProfile.siteUrl,
      copyValue: siteProfile.siteUrl,
      href: siteProfile.siteUrl,
    },
    {
      key: 'rss-url',
      icon: 'rss_feed',
      label: 'RSS 订阅',
      value: siteProfile.rssUrl,
      copyValue: rssUrl,
      href: rssUrl,
    },
    {
      key: 'email',
      icon: 'mail',
      label: '联系邮箱',
      value: siteProfile.email,
      copyValue: siteProfile.email,
      href: `mailto:${siteProfile.email}`,
    },
    {
      key: 'avatar-url',
      icon: 'image',
      label: '博客头像地址',
      value: siteProfile.avatarUrl || '未设置',
      copyValue: siteProfile.avatarUrl || undefined,
      href: siteProfile.avatarUrl || undefined,
    },
    {
      key: 'profile',
      icon: 'person',
      label: '站点说明',
      value: `${siteProfile.ownerName} · ${siteProfile.roleLine}`,
      copyValue: `${siteProfile.ownerName} · ${siteProfile.roleLine}`,
      fullWidth: true,
    },
  ]

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  async function handleCopy(item: InfoItem) {
    if (!item.copyValue) return

    try {
      await navigator.clipboard.writeText(item.copyValue)
      setCopiedKey(item.key)

      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }

      timerRef.current = window.setTimeout(() => {
        setCopiedKey((current) => (current === item.key ? null : current))
      }, 1600)
    } catch {
      setCopiedKey(null)
    }
  }

  return (
    <section className="relative self-start overflow-hidden rounded-[30px] border border-white/10 bg-[rgba(20,20,22,0.58)] px-5 py-6 backdrop-blur-2xl sm:px-6 sm:py-7">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_58%)]" />

      <div className="relative">
        <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-white/42">简介</p>

        <div className="mt-4 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.04]">
            {siteProfile.avatarUrl ? (
              <img
                src={siteProfile.avatarUrl}
                alt={siteProfile.ownerName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold text-white/78">{siteProfile.ownerInitial}</span>
            )}
          </div>

          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-[-0.05em] text-white">
              {siteProfile.siteName}
            </h1>
            <p className="mt-2 text-sm font-mono uppercase tracking-[0.2em] text-white/42">
              {siteProfile.siteNameEn}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {stats.map((stat) => (
            <span
              key={stat.label}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/18 px-3 py-1.5 text-[11px] font-mono text-white/64 backdrop-blur-md"
            >
              <span>{stat.label}</span>
              <span className="text-white/88">{stat.value}</span>
            </span>
          ))}
        </div>

        <div className="mt-6 rounded-[22px] border border-white/10 bg-white/[0.03] p-3 sm:p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {infoItems.map((item) => {
              const copied = copiedKey === item.key

              return (
                <div
                  key={item.key}
                  className={`rounded-[16px] border border-white/8 bg-black/10 px-3 py-3 ${
                    item.fullWidth ? 'sm:col-span-2' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-white/40">
                      <MaterialSymbol icon={item.icon} size={14} className="shrink-0 text-white/40" />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {item.href ? (
                        <a
                          href={item.href}
                          target={item.href.startsWith('mailto:') ? undefined : '_blank'}
                          rel="noreferrer"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/18 text-white/62 transition-colors hover:border-white/16 hover:text-white"
                          aria-label={`打开${item.label}`}
                          title={`打开${item.label}`}
                        >
                          <MaterialSymbol icon="open_in_new" size={12} />
                        </a>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => handleCopy(item)}
                        disabled={!item.copyValue}
                        className={`inline-flex h-7 items-center gap-1 rounded-full border px-2 text-[10px] transition-colors ${
                          copied
                            ? 'border-emerald-400/30 bg-emerald-400/12 text-emerald-200'
                            : 'border-white/10 bg-black/18 text-white/62 hover:border-white/16 hover:text-white disabled:cursor-not-allowed disabled:opacity-40'
                        }`}
                        title={copied ? '已复制到剪贴板' : `复制${item.label}`}
                      >
                        <MaterialSymbol icon={copied ? 'check' : 'content_copy'} size={12} />
                        {copied ? '已复制' : '复制'}
                      </button>
                    </div>
                  </div>

                  <p className="mt-2 truncate text-sm text-white/82" title={item.value}>
                    {item.value}
                  </p>

                  {copied ? <p className="mt-1 text-[11px] text-emerald-200/90">已复制到剪贴板</p> : null}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
