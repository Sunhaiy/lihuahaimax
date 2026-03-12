/**
 * app/dashboard/editor/PostEditor.tsx
 *
 * 文章编辑器主体 — 粘性顶栏 + 全幅写作区 + 右侧元数据栏。
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TiptapEditor } from '@/features/editor/TiptapEditor'
import { createPost, updatePost } from '@/features/posts/api'
import { Button } from '@/components/ui/Button'
import {
  RiArrowLeftLine,
  RiEyeLine,
  RiSaveLine,
  RiSendPlaneLine,
  RiPriceTag3Line,
  RiLink,
  RiFileTextLine,
  RiImageLine,
  RiLoader4Line,
} from '@remixicon/react'
import type { JSONContent } from '@tiptap/core'
import type { PostRow } from '@/types/post'

// ── 假数据（新建文章时预填充，方便预览 UI 效果） ─────────────────────
const MOCK_TITLE = 'ESP32-C3 开发实战：从零搭建 MQTT 物联网节点'

const MOCK_TAGS = 'ESP32, 物联网, MQTT, C语言'

const MOCK_EXCERPT =
  '本文详细记录了使用 ESP32-C3 构建轻量级 MQTT 客户端的全过程，包含环境配置、引脚复用与低功耗睡眠策略，适合嵌入式初学者参考。'

const MOCK_SLUG = 'esp32c3-mqtt-iot-node-from-scratch'

const MOCK_CONTENT: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '为什么选择 ESP32-C3？' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'ESP32-C3 是乐鑫推出的一款基于 ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'RISC-V 单核 32-bit' },
        {
          type: 'text',
          text: ' 架构的低功耗 SoC。相比经典的 ESP8266，它拥有更完善的蓝牙 5.0 支持、更大的 RAM，以及内置的硬件安全加速器——而价格依然亲民。',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: '环境配置' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: '使用 ESP-IDF v5.x 工具链。以下命令完成基础安装：' },
      ],
    },
    {
      type: 'codeBlock',
      attrs: { language: 'bash' },
      content: [
        {
          type: 'text',
          text: '# 克隆 ESP-IDF 并初始化子模块\ngit clone --recursive https://github.com/espressif/esp-idf.git\ncd esp-idf\n\n# 安装 ESP32-C3 工具链\n./install.sh esp32c3\nsource ./export.sh\n\n# 验证安装\nidf.py --version  # 应输出 ESP-IDF v5.x.x',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'MQTT 连接核心代码' }],
    },
    {
      type: 'codeBlock',
      attrs: { language: 'c' },
      content: [
        {
          type: 'text',
          text: 'static esp_err_t mqtt_event_handler_cb(esp_mqtt_event_handle_t event)\n{\n    switch (event->event_id) {\n        case MQTT_EVENT_CONNECTED:\n            ESP_LOGI(TAG, "MQTT connected");\n            esp_mqtt_client_subscribe(client, "/lihuahai/sensor", 0);\n            break;\n        case MQTT_EVENT_DATA:\n            ESP_LOGI(TAG, "topic=%.*s data=%.*s",\n                     event->topic_len, event->topic,\n                     event->data_len, event->data);\n            break;\n        default:\n            break;\n    }\n    return ESP_OK;\n}',
        },
      ],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '注意：ESP32-C3 的 GPIO9 在上电时会拉低采样以进入下载模式，开发板上请避免将其连接到外部下拉电阻。',
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '低功耗睡眠策略' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: '在采集频率较低的场景中（如温湿度每 5 分钟上报一次），可以将 ESP32-C3 配置为 ',
        },
        { type: 'text', marks: [{ type: 'italic' }], text: 'Deep Sleep' },
        {
          type: 'text',
          text: ' 模式。唤醒后重新连接 Wi-Fi 和 MQTT Broker，平均电流可压到 15μA 以内。',
        },
      ],
    },
  ],
}
// ──────────────────────────────────────────────────────────────────────

interface PostEditorProps {
  post?: PostRow
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter()
  const isNew = !post

  const [title, setTitle] = useState(isNew ? MOCK_TITLE : (post?.title ?? ''))
  const [slug, setSlug] = useState(isNew ? MOCK_SLUG : (post?.slug ?? ''))
  const [excerpt, setExcerpt] = useState(isNew ? MOCK_EXCERPT : (post?.excerpt ?? ''))
  const [tags, setTags] = useState(isNew ? MOCK_TAGS : (post?.tags ?? []).join(', '))
  const [content, setContent] = useState<JSONContent>(
    isNew ? MOCK_CONTENT : ((post?.content as JSONContent) ?? {})
  )
  const [saving, setSaving] = useState(false)
  const [savedStatus, setSavedStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [error, setError] = useState('')

  function autoSlug(t: string) {
    return t
      .toLowerCase()
      .replace(/[\u4e00-\u9fa5]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  async function handleSave(targetStatus: 'draft' | 'published') {
    setSaving(true)
    setSavedStatus('saving')
    setError('')
    try {
      const payload = {
        title,
        slug: slug || autoSlug(title),
        content,
        excerpt: excerpt || undefined,
        status: targetStatus,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      }

      if (post) {
        await updatePost(post.id, payload)
      } else {
        await createPost(payload)
      }

      setSavedStatus('saved')
      setTimeout(() => setSavedStatus('idle'), 2500)
      if (targetStatus === 'published') {
        router.push('/dashboard/posts')
        router.refresh()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败')
      setSavedStatus('idle')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="-m-6 flex flex-col">
      {/* ══════════════════════════════════════════════════════
          顶栏：返回 / 状态指示 / 操作按钮
      ══════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 flex items-center gap-3 px-5 h-13
                      border-b border-border
                      bg-background/95 backdrop-blur-xl">
        {/* 返回 */}
        <Link
          href="/dashboard/posts"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground
                     transition-colors px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
        >
          <RiArrowLeftLine size={14} />
          文章列表
        </Link>

        <div className="w-px h-4 bg-foreground/10" />

        {/* 状态指示 */}
        <StatusBadge status={post?.status ?? 'draft'} saved={savedStatus} />

        <div className="flex-1" />

        {/* 错误提示 */}
        {error && (
          <span className="text-xs text-red-400 max-w-[200px] truncate">{error}</span>
        )}

        {/* 预览 */}
        {(slug || post?.slug) && (
          <a
            href={`/posts/${slug || post?.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-ember
                       transition-colors px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
          >
            <RiEyeLine size={14} />
            预览
          </a>
        )}

        {/* 保存草稿 */}
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave('draft')}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground
                     px-3 py-1.5 rounded border border-border hover:border-foreground/20
                     bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-all disabled:opacity-50"
        >
          {saving ? <RiLoader4Line size={13} className="animate-spin" /> : <RiSaveLine size={13} />}
          保存草稿
        </button>

        {/* 发布 */}
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave('published')}
          className="flex items-center gap-1.5 text-xs text-white font-medium
                     px-3 py-1.5 rounded
                     bg-ember hover:bg-ember-600 transition-all
                     [box-shadow:0_0_0_1px_rgba(255,138,107,0.25)]
                     hover:[box-shadow:0_0_16px_rgba(255,138,107,0.4),0_0_0_1px_rgba(255,138,107,0.35)]
                     disabled:opacity-50"
        >
          <RiSendPlaneLine size={13} />
          {post?.status === 'published' ? '更新发布' : '立即发布'}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          主体：编辑区 + 右侧元数据栏
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-1 min-h-0">

        {/* ── 左侧：标题 + 编辑器 ──────────────────────────── */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {/* 标题输入 */}
          <div className="px-10 pt-10 pb-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="文章标题"
              className="w-full text-[2rem] font-bold leading-tight
                         bg-transparent border-none outline-none
                         text-foreground placeholder:text-foreground/15
                         tracking-tight"
            />
            {/* Slug 预览行 */}
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground font-mono">
              <RiLink size={12} />
              <span>/posts/</span>
              <span className="text-muted-foreground/70">{slug || autoSlug(title) || 'url-slug'}</span>
            </div>
          </div>

          {/* 分隔线 */}
          <div className="mx-10 border-t border-border mb-2" />

          {/* Tiptap 编辑器（含内置粘性工具栏） */}
          <TiptapEditor
            initialContent={content}
            onChange={setContent}
            placeholder="在此开始你的写作…"
            className="min-h-[600px]"
          />
        </div>

        {/* ── 右侧：元数据面板 ─────────────────────────────── */}
        <aside className="w-[260px] flex-shrink-0 border-l border-border
                          sticky top-[3.25rem] self-start h-[calc(100vh-3.25rem)]
                          overflow-y-auto bg-card">
          <div className="px-5 py-6 space-y-6">

            {/* 区块标题 */}
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              文章元数据
            </p>

            {/* Slug */}
            <Field icon={<RiLink size={13} />} label="URL Slug">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder={autoSlug(title) || 'url-slug'}
                className={inputCls + ' font-mono text-xs'}
              />
            </Field>

            {/* 标签 */}
            <Field icon={<RiPriceTag3Line size={13} />} label="标签（逗号分隔）">
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="ESP32, 物联网, 生活"
                className={inputCls}
              />
              {/* 标签预览 */}
              {tags && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded
                                 bg-ember/10 text-ember border border-ember/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Field>

            {/* 摘要 */}
            <Field icon={<RiFileTextLine size={13} />} label="摘要">
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="150 字以内的文章简介…"
                rows={4}
                className={inputCls + ' resize-none leading-relaxed'}
              />
            </Field>

            {/* 封面图（预留） */}
            <Field icon={<RiImageLine size={13} />} label="封面图">
              <button
                type="button"
                className="w-full h-20 rounded-base border border-dashed border-border
                           text-muted-foreground text-xs hover:border-foreground/30 hover:text-foreground/50
                           transition-colors flex flex-col items-center justify-center gap-1"
              >
                <RiImageLine size={18} />
                点击上传封面
              </button>
            </Field>

            {/* 字数统计（示意） */}
            <div className="pt-2 border-t border-border text-[10px] text-muted-foreground font-mono space-y-1">
              <div className="flex justify-between">
                <span>段落</span>
                <span>—</span>
              </div>
              <div className="flex justify-between">
                <span>代码块</span>
                <span>—</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

// ── 子组件 ────────────────────────────────────────────────────────────

const inputCls = `
  w-full px-3 py-2 rounded-base text-sm
  bg-background border border-border
  text-foreground placeholder:text-muted-foreground
  focus:outline-none focus:border-[rgba(14,165,233,0.5)] focus:bg-card
  transition-colors
`.trim()

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="text-muted-foreground/60">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  )
}

function StatusBadge({
  status,
  saved,
}: {
  status: string
  saved: 'idle' | 'saving' | 'saved'
}) {
  if (saved === 'saving')
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <RiLoader4Line size={12} className="animate-spin" />
        保存中…
      </span>
    )

  if (saved === 'saved')
    return (
      <span className="flex items-center gap-1.5 text-xs text-green-400/70">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        已保存
      </span>
    )

  const map: Record<string, [string, string]> = {
    draft: ['草稿', 'text-muted-foreground'],
    published: ['已发布', 'text-green-400/60'],
    archived: ['已存档', 'text-muted-foreground/60'],
  }
  const [label, cls] = map[status] ?? ['未知', 'text-muted-foreground/60']

  return (
    <span className={`flex items-center gap-1.5 text-xs ${cls}`}>
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'published' ? 'bg-green-400' : 'bg-muted-foreground/30'
        }`}
      />
      {label}
    </span>
  )
}
