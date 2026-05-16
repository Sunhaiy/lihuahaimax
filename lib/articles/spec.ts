export const ARTICLE_CALLOUT_VARIANTS = ['info', 'tip', 'warning', 'summary'] as const
export type ArticleCalloutVariant = (typeof ARTICLE_CALLOUT_VARIANTS)[number]

export const ARTICLE_IMAGE_DISPLAYS = ['regular', 'wide', 'full'] as const
export type ArticleImageDisplay = (typeof ARTICLE_IMAGE_DISPLAYS)[number]

export const ARTICLE_BLOCK_LIBRARY = [
  {
    type: 'heading',
    label: '标题',
    description: '用于建立清晰的层级结构',
  },
  {
    type: 'paragraph',
    label: '段落',
    description: '普通正文内容',
  },
  {
    type: 'callout',
    label: '提示块',
    description: '说明、提示、注意、结论',
  },
  {
    type: 'codeBlock',
    label: '代码块',
    description: '带语言标签与复制按钮',
  },
  {
    type: 'table',
    label: '表格',
    description: '结构化数据展示',
  },
  {
    type: 'imageFigure',
    label: '图片卡片',
    description: '支持说明文字与宽度模式',
  },
  {
    type: 'stepFlow',
    label: '步骤流',
    description: '适合教程与流程拆解',
  },
  {
    type: 'faqBlock',
    label: 'FAQ',
    description: '收纳常见问题与回答',
  },
  {
    type: 'timelineBlock',
    label: '时间线',
    description: '展示阶段与里程碑',
  },
  {
    type: 'infoColumns',
    label: '双栏信息',
    description: '左右对照信息卡',
  },
  {
    type: 'fileTree',
    label: '文件树',
    description: '展示项目目录结构',
  },
  {
    type: 'terminalDemo',
    label: '终端演示',
    description: '适合命令行输出与说明',
  },
] as const
