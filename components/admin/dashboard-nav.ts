export type DashboardNavItem = {
  href: string
  label: string
  icon: string
  description: string
}

export type DashboardNavGroup = {
  label: string
  items: DashboardNavItem[]
}

export const DASHBOARD_NAV_GROUPS: DashboardNavGroup[] = [
  {
    label: '总览',
    items: [
      { href: '/dashboard', label: '控制台', icon: 'dashboard', description: '概览与快捷入口' },
    ],
  },
  {
    label: '内容',
    items: [
      { href: '/dashboard/posts', label: '文章', icon: 'article', description: '管理文章与发布状态' },
      { href: '/dashboard/moments', label: '瞬间', icon: 'dynamic_feed', description: '发布与整理动态' },
      { href: '/dashboard/comments', label: '评论', icon: 'forum', description: '审核与清理评论' },
      { href: '/dashboard/categories', label: '分类', icon: 'grid_view', description: '维护分类结构' },
      { href: '/dashboard/links', label: '友链', icon: 'link', description: '整理链接与合作信息' },
    ],
  },
  {
    label: '作品与资源',
    items: [
      { href: '/dashboard/works', label: '作品', icon: 'deployed_code', description: '项目与作品资料' },
      { href: '/dashboard/acg', label: 'ACG', icon: 'stadia_controller', description: '动漫与游戏收藏' },
      { href: '/dashboard/gallery', label: '相册', icon: 'photo_library', description: '图像与画廊项目' },
    ],
  },
  {
    label: '系统',
    items: [
      { href: '/dashboard/settings', label: '设置', icon: 'wallpaper', description: '站点资料与场景设置' },
    ],
  },
]

export const DASHBOARD_EDITOR_ITEM: DashboardNavItem = {
  href: '/dashboard/editor',
  label: '新建文章',
  icon: 'edit_square',
  description: '直接进入编辑器',
}

export const DASHBOARD_ITEM_MAP = [
  ...DASHBOARD_NAV_GROUPS.flatMap((group) => group.items),
  DASHBOARD_EDITOR_ITEM,
]
