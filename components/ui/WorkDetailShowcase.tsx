'use client'

import { useMemo, useRef } from 'react'
import { useGsapScope } from '@/hooks/useGsapScope'
import type { WorkContributor, WorkDetail, WorkListItem } from '@/types/work'

interface WorkDetailShowcaseProps {
  work: WorkDetail
  works: WorkListItem[]
  siteUrl: string
}

export function WorkDetailShowcase({ work, siteUrl }: WorkDetailShowcaseProps) {
  const project = useMemo(() => mapWorkToProject(work, siteUrl), [work, siteUrl])
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const dragStateRef = useRef({ isDown: false, startX: 0, scrollLeft: 0 })

  const { scopeRef } = useGsapScope<HTMLDivElement>((scope, { gsap, prefersReducedMotion }) => {
    if (prefersReducedMotion) return

    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
    timeline.fromTo(
      scope.querySelectorAll('.anim-fade-up'),
      { autoAlpha: 0, y: 22 },
      { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12 }
    )
    timeline.fromTo(
      scope.querySelectorAll('.anim-scale-in'),
      { autoAlpha: 0, scale: 0.98 },
      { autoAlpha: 1, scale: 1, duration: 0.9 },
      0.15
    )
    timeline.fromTo(
      scope.querySelectorAll('.anim-slide-left'),
      { autoAlpha: 0, x: 22 },
      { autoAlpha: 1, x: 0, duration: 0.7, stagger: 0.1 },
      0.25
    )
    timeline.fromTo(
      scope.querySelectorAll('.anim-grow-h'),
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: 0.65, stagger: 0.08 },
      0.45
    )

    const shine = scope.querySelector('.shine-sweep')
    if (shine) {
      gsap.set(shine, { xPercent: -150, skewX: -25 })
      gsap.to(shine, {
        xPercent: 260,
        duration: 6,
        ease: 'power1.inOut',
        repeat: -1,
        repeatDelay: 1.4,
      })
    }
  }, [work.id])

  function startDragging(event: React.MouseEvent<HTMLDivElement>) {
    const container = scrollContainerRef.current
    if (!container) return
    dragStateRef.current = {
      isDown: true,
      startX: event.pageX - container.offsetLeft,
      scrollLeft: container.scrollLeft,
    }
    container.classList.add('grabbing')
  }

  function stopDragging() {
    dragStateRef.current.isDown = false
    scrollContainerRef.current?.classList.remove('grabbing')
  }

  function onDragging(event: React.MouseEvent<HTMLDivElement>) {
    const container = scrollContainerRef.current
    if (!container || !dragStateRef.current.isDown) return
    event.preventDefault()
    const x = event.pageX - container.offsetLeft
    const walk = (x - dragStateRef.current.startX) * 2
    container.scrollLeft = dragStateRef.current.scrollLeft - walk
  }

  function openLink(url?: string | null) {
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div ref={scopeRef} className="project-view-root">
      <div className="content-container">
        <header className="project-header anim-fade-up">
          <div className="meta-header">// CLASSIFIED_ARCHIVE_V.2026</div>
          <h1 className="title">
            {project.name}
            <span className="subtitle">摘录 / ARCHIVE</span>
          </h1>
          {project.tags.length > 0 ? (
            <div className="tags-row">
              {project.tags.map((tag) => (
                <span key={tag} className="tag-pill">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        <div className="main-layout">
          <div className="visual-section anim-scale-in">
            <div className="hero-image-wrapper">
              <div className="frame-corner tl" />
              <div className="frame-corner br" />
              <div className="shine-container">
                <div className="shine-sweep" />
                {project.image ? (
                  <img src={project.image} alt={project.name} className="hero-img" />
                ) : (
                  <div className="img-placeholder">
                    <span className="ghost-txt">[[ NO_SIGNAL_ESTABLISHED ]]</span>
                  </div>
                )}
              </div>
              {project.seal ? (
                <div className="seal-box">
                  <div className="seal">{project.seal}</div>
                </div>
              ) : null}
            </div>
            <div className="visual-meta">
              <span>COORDS: 42.08 / 15.99</span>
              <span className="divider" />
              <span>ZOOM: 1.0x</span>
            </div>
          </div>

          <aside className="info-sidebar">
            <div className="sidebar-inner">
              <div className="side-item anim-slide-left">
                <h4 className="side-label">参与者 CONTRIBUTORS</h4>
                {project.users.length > 0 ? (
                  <div className="users">
                    {project.users.map((user, index) => (
                      <div key={`${user.name}-${index}`} className="user-row">
                        <div className="avatar-box">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} className="avatar-img" />
                          ) : (
                            <span className="abbr">{user.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="u-text">
                          <span className="u-name">{user.name}</span>
                          <span className="u-role">{user.role || 'MEMBER'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">[[ NO_DATA ]]</div>
                )}
              </div>

              <div className="h-line anim-grow-h" />

              <div className="side-item anim-slide-left">
                <h4 className="side-label">当前进度 PROGRESS</h4>
                <div className="status-box">
                  <span className="val">{project.progress}</span>
                  <span className="txt">{project.statusText}</span>
                </div>
              </div>

              <div className="h-line anim-grow-h" />

              <div className="side-item purchase anim-slide-left">
                <h4 className="side-label">系统版本 VERSION</h4>
                <div className="ver-code">{project.version}</div>

                <div className="price-info">
                  <div className="price-cell">
                    <span className="p-label">PRICE_NOW</span>
                    <span className="p-val">{project.price}</span>
                  </div>
                  {project.originalPrice ? (
                    <div className="price-cell old">
                      <span className="p-label">PRICE_OLD</span>
                      <span className="p-val">{project.originalPrice}</span>
                    </div>
                  ) : null}
                </div>

                <button className="join-trigger" onClick={() => openLink(project.joinUrl)}>
                  APPLY_TO_JOIN
                </button>

                <button className="action-trigger" onClick={() => openLink(project.actionUrl)}>
                  ACCESS_NODE
                </button>
              </div>
            </div>
          </aside>
        </div>

        {project.milestones.length > 0 ? (
          <section className="progress-timeline-section anim-fade-up">
            <div className="timeline-header">
              <span className="header-tag">DEVELOPMENT_TIMELINE</span>
              <div className="header-line" />
            </div>

            <div
              ref={scrollContainerRef}
              className="scroll-x-container"
              onMouseDown={startDragging}
              onMouseLeave={stopDragging}
              onMouseUp={stopDragging}
              onMouseMove={onDragging}
            >
              <div className="timeline-track">
                {project.milestones.map((step, index) => (
                  <div key={`${step.title}-${index}`} className="timeline-node">
                    <div className="node-head">
                      <span className="node-index">{String(index + 1).padStart(2, '0')}</span>
                      <span className="node-date">{step.date}</span>
                    </div>
                    <div className="node-path">
                      <div className="node-dot" />
                      <div className="node-line" />
                    </div>
                    <div className="node-body">
                      <h5
                        className={`node-title ${step.link ? 'has-link' : ''}`}
                        onClick={() => openLink(step.link)}
                      >
                        {step.title} {step.link ? <span style={{ fontSize: 10 }}>↗</span> : null}
                      </h5>
                      <p className="node-desc">{step.desc}</p>
                    </div>
                  </div>
                ))}
                <div className="timeline-end">
                  <div className="end-dot" />
                  <span className="end-txt">EOF</span>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="product-intro-section anim-fade-up">
          <div className="intro-header">
            <span className="header-tag">PRODUCT_SPECIFICATION / 产品详述</span>
            <div className="header-line" />
          </div>
          <div className="intro-content">
            {project.description.map((paragraph, index) => (
              <p key={`${paragraph}-${index}`} className="intro-para">
                {paragraph}
              </p>
            ))}
            <p className="intro-para info-tip">
              该节点已通过核心协议验证，所有数据流向受控且加密。开发者可申请接入
              API 获取实时遥测数据。
            </p>
          </div>
        </section>
      </div>

      <div className="bg-watermark">DECODING_MODULE_{work.slug.toUpperCase()}</div>

      <style jsx>{`
        .project-view-root {
          color: #fff;
          min-height: 100vh;
          padding: 60px 5% 150px;
          font-family: 'JetBrains Mono', 'Roboto Mono Variable', 'Fira Code', monospace;
          position: relative;
          overflow-x: hidden;
          background:
            radial-gradient(circle at 18% 12%, rgba(242, 185, 75, 0.12), transparent 24%),
            radial-gradient(circle at 82% 14%, rgba(255, 255, 255, 0.04), transparent 18%),
            linear-gradient(180deg, #060606 0%, #030303 100%);
        }

        .content-container {
          max-width: 1500px;
          margin: 0 auto;
          z-index: 10;
          position: relative;
        }

        .project-header {
          margin-bottom: 50px;
        }

        .meta-header {
          font-size: 10px;
          color: rgba(242, 185, 75, 0.72);
          letter-spacing: 5px;
          margin-bottom: 10px;
        }

        .title {
          margin: 0;
          color: #f5f3ef;
          font-size: clamp(2.7rem, 5vw, 4.4rem);
          font-weight: 800;
          letter-spacing: -0.08em;
          line-height: 0.95;
        }

        .subtitle {
          margin-left: 15px;
          color: rgba(197, 178, 138, 0.92);
          font-family: 'Noto Serif SC', 'Noto Serif SC Variable', serif;
          font-size: clamp(1.35rem, 2.7vw, 2.2rem);
        }

        .tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 18px;
        }

        .tag-pill {
          padding: 4px 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.03);
          color: rgba(255, 255, 255, 0.7);
          font-size: 11px;
        }

        .main-layout {
          display: flex;
          align-items: flex-start;
          gap: 50px;
          margin-bottom: 100px;
        }

        .visual-section {
          flex: 4;
        }

        .hero-image-wrapper {
          width: 100%;
          aspect-ratio: 16 / 9;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: #000;
        }

        .shine-container {
          position: absolute;
          inset: 0;
        }

        .shine-sweep {
          position: absolute;
          top: 0;
          left: -100%;
          z-index: 5;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(242, 185, 75, 0.14), transparent);
          transform: skewX(-25deg);
        }

        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.82;
        }

        .img-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: #0a0a0a;
        }

        .ghost-txt {
          color: rgba(255, 255, 255, 0.12);
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: 5px;
        }

        .frame-corner {
          position: absolute;
          z-index: 6;
          width: 30px;
          height: 30px;
          border: 1.5px solid #f2b94b;
        }

        .tl {
          top: 15px;
          left: 15px;
          border-right: 0;
          border-bottom: 0;
        }

        .br {
          right: 15px;
          bottom: 15px;
          border-top: 0;
          border-left: 0;
        }

        .seal-box {
          position: absolute;
          right: 30px;
          bottom: 30px;
          z-index: 8;
        }

        .seal {
          padding: 10px 15px;
          background: #ff4d4d;
          color: #000;
          font-family: 'Noto Serif SC', serif;
          font-size: 14px;
          font-weight: 900;
        }

        .visual-meta {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 20px;
          margin-top: 15px;
          color: rgba(255, 255, 255, 0.28);
          font-size: 9px;
          letter-spacing: 0.22em;
        }

        .divider {
          width: 32px;
          height: 1px;
          background: rgba(255, 255, 255, 0.14);
        }

        .info-sidebar {
          min-width: 280px;
          flex: 1;
          padding-left: 40px;
          border-left: 1px solid rgba(255, 255, 255, 0.05);
        }

        .sidebar-inner {
          position: sticky;
          top: 96px;
        }

        .side-item {
          margin-bottom: 35px;
        }

        .side-label {
          margin-bottom: 15px;
          color: rgba(242, 185, 75, 0.72);
          font-size: 0.75rem;
          letter-spacing: 1px;
        }

        .user-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
        }

        .avatar-box {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 50%;
          object-fit: cover;
        }

        .abbr {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #fff;
          color: #000;
          font-size: 0.7rem;
          font-weight: 800;
        }

        .u-text span {
          display: block;
        }

        .u-name {
          color: #efefef;
          font-size: 0.9rem;
          font-weight: 700;
        }

        .u-role {
          color: rgba(255, 255, 255, 0.42);
          font-size: 0.7rem;
          letter-spacing: 0.12em;
        }

        .no-data {
          color: rgba(255, 255, 255, 0.28);
          font-size: 12px;
        }

        .status-box {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }

        .status-box .val {
          color: #eee;
          font-size: 1.8rem;
          font-weight: 800;
        }

        .status-box .txt {
          color: #f2b94b;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .h-line {
          height: 1px;
          margin-bottom: 35px;
          background: rgba(255, 255, 255, 0.08);
        }

        .ver-code {
          margin-bottom: 20px;
          color: #eee;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .price-info {
          display: flex;
          gap: 25px;
          margin-bottom: 30px;
        }

        .price-cell span {
          display: block;
        }

        .p-label {
          margin-bottom: 5px;
          color: rgba(255, 255, 255, 0.32);
          font-size: 8px;
          letter-spacing: 0.22em;
        }

        .p-val {
          color: #f2b94b;
          font-size: 1.5rem;
          font-weight: 800;
        }

        .old .p-val {
          color: rgba(255, 255, 255, 0.18);
          text-decoration: line-through;
        }

        .action-trigger,
        .join-trigger {
          width: 100%;
          padding: 15px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          transition: 0.3s;
        }

        .action-trigger {
          margin-top: 15px;
          border: 1px solid #f2b94b;
          background: #f2b94b;
          color: #000;
        }

        .action-trigger:hover {
          border-color: #fff;
          background: #fff;
        }

        .join-trigger {
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.9);
          color: #000;
        }

        .join-trigger:hover {
          border-color: #fff;
          background: #fff;
        }

        .progress-timeline-section {
          margin-top: 40px;
        }

        .timeline-header,
        .intro-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 40px;
        }

        .header-tag {
          color: rgba(242, 185, 75, 0.72);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 3px;
        }

        .header-line {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
        }

        .scroll-x-container {
          width: 100%;
          overflow-x: auto;
          padding-bottom: 40px;
          cursor: grab;
          scrollbar-width: none;
          user-select: none;
        }

        .scroll-x-container.grabbing {
          cursor: grabbing;
        }

        .scroll-x-container::-webkit-scrollbar {
          display: none;
        }

        .timeline-track {
          display: flex;
          min-width: max-content;
          padding-left: 5px;
        }

        .timeline-node {
          display: flex;
          flex-direction: column;
          width: 320px;
        }

        .node-head {
          display: flex;
          flex-direction: column;
          margin-bottom: 15px;
        }

        .node-index {
          color: #f2b94b;
          font-size: 10px;
          font-weight: 800;
        }

        .node-date {
          color: rgba(255, 255, 255, 0.34);
          font-size: 12px;
        }

        .node-path {
          display: flex;
          align-items: center;
          position: relative;
          height: 20px;
        }

        .node-dot {
          z-index: 2;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f2b94b;
          box-shadow: 0 0 10px #f2b94b;
        }

        .node-line {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }

        .node-body {
          padding-top: 20px;
          padding-right: 40px;
        }

        .node-title {
          margin-bottom: 12px;
          color: #eee;
          font-size: 1.1rem;
          font-weight: 700;
          transition: 0.2s;
        }

        .node-title.has-link {
          display: inline-block;
          cursor: pointer;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.36);
        }

        .node-title.has-link:hover {
          border-color: #f2b94b;
          color: #f2b94b;
        }

        .node-desc {
          color: rgba(255, 255, 255, 0.42);
          font-size: 13px;
          line-height: 1.6;
        }

        .timeline-end {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 40px;
        }

        .end-dot {
          width: 4px;
          height: 4px;
          margin-bottom: 10px;
          background: rgba(255, 255, 255, 0.22);
        }

        .end-txt {
          color: rgba(255, 255, 255, 0.22);
          font-size: 10px;
          letter-spacing: 2px;
        }

        .product-intro-section {
          margin-top: 60px;
        }

        .intro-content {
          max-width: 900px;
        }

        .intro-para {
          margin-bottom: 20px;
          color: rgba(255, 255, 255, 0.62);
          font-size: 14px;
          line-height: 2;
          white-space: pre-wrap;
        }

        .info-tip {
          padding-left: 15px;
          border-left: 2px solid rgba(255, 255, 255, 0.14);
          color: rgba(255, 255, 255, 0.34);
          font-style: italic;
        }

        .bg-watermark {
          position: fixed;
          bottom: -5%;
          left: -2%;
          z-index: 0;
          color: rgba(255, 255, 255, 0.015);
          font-size: 18rem;
          font-weight: 900;
          pointer-events: none;
          white-space: nowrap;
        }

        @media (max-width: 1000px) {
          .project-view-root {
            padding: 48px 20px 110px;
          }

          .main-layout {
            flex-direction: column;
            gap: 40px;
          }

          .info-sidebar {
            width: 100%;
            padding-top: 40px;
            padding-left: 0;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            border-left: none;
          }

          .sidebar-inner {
            position: static;
          }

          .bg-watermark {
            font-size: 7rem;
          }
        }
      `}</style>
    </div>
  )
}

function mapWorkToProject(work: WorkDetail, siteUrl: string) {
  const descriptionSource = work.content || work.description || work.summary || ''
  const description = descriptionSource
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return {
    name: work.title,
    tags: work.tags ?? [],
    image: work.hero_image_url || work.cover_url || '',
    seal: work.seal || null,
    users: work.contributors.length > 0 ? work.contributors : fallbackContributors(),
    progress: work.progress_text || '0/0',
    statusText: work.status_text || 'UNKNOWN',
    version: work.version_text || 'v1.0.0',
    price: formatPrice(work.price),
    originalPrice: work.original_price ? formatPrice(work.original_price) : null,
    joinUrl:
      work.secondary_url ||
      work.github_url ||
      work.primary_url ||
      work.url ||
      buildCanonicalUrl(siteUrl, work.slug),
    actionUrl: work.primary_url || work.url || buildCanonicalUrl(siteUrl, work.slug),
    milestones: work.milestones ?? [],
    description:
      description.length > 0
        ? description
        : ['该项目仍在持续迭代中，详细说明稍后会在此节点继续补充。'],
  }
}

function fallbackContributors(): WorkContributor[] {
  return [
    {
      name: 'Lihua Hai',
      role: 'MEMBER',
      avatar_url: null,
    },
  ]
}

function buildCanonicalUrl(siteUrl: string, slug: string) {
  const base = siteUrl?.trim() || 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}/works/${slug}`
}

function formatPrice(value: string | null) {
  const trimmed = value?.trim()
  if (!trimmed) return '¥0'
  if (/^[¥$]/.test(trimmed)) return trimmed
  return `¥${trimmed}`
}
