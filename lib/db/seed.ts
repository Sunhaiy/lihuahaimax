/**
 * lib/db/seed.ts
 *
 * 测试数据种子脚本。
 * 执行: npm run db:seed
 *
 * ⚠️  会先清空所有业务表再插入，仅供开发环境使用。
 */

import fs from 'node:fs'
import path from 'node:path'
import { Pool } from 'pg'

function loadEnv(filePath: string) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf-8')
  for (const line of content.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const match = t.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const val = match[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  }
}

// ──────────────────────────────────────────────────────────────
// Tiptap JSON 内容构建辅助
// ──────────────────────────────────────────────────────────────

function h2(text: string) {
  return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] }
}
function h3(text: string) {
  return { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text }] }
}
function para(...texts: (string | { type: string; text: string; marks?: { type: string }[] })[]) {
  return {
    type: 'paragraph',
    content: texts.map((t) =>
      typeof t === 'string' ? { type: 'text', text: t } : t
    ),
  }
}
function bold(text: string) {
  return { type: 'text', text, marks: [{ type: 'bold' }] }
}
function code(text: string) {
  return { type: 'text', text, marks: [{ type: 'code' }] }
}
function codeBlock(lang: string, text: string) {
  return { type: 'codeBlock', attrs: { language: lang }, content: [{ type: 'text', text }] }
}
function blockquote(text: string) {
  return { type: 'blockquote', content: [para(text)] }
}
function doc(...nodes: object[]) {
  return JSON.stringify({ type: 'doc', content: nodes })
}

// ──────────────────────────────────────────────────────────────
// 内容数据
// ──────────────────────────────────────────────────────────────

const POST_CONTENT_1 = doc(
  h2('为什么选择 ESP32-C3'),
  para(
    'ESP32-C3 是乐鑫推出的一款基于 ',
    bold('RISC-V 单核 32-bit'),
    ' 架构的低功耗 SoC。相比经典的 ESP8266，它拥有更完善的蓝牙 5.0 支持、更大的 RAM，以及内置的硬件安全加速器——而价格依然亲民。'
  ),
  h3('开发环境搭建'),
  para('使用 ESP-IDF v5.x 工具链，以下命令完成基础安装：'),
  codeBlock(
    'bash',
    `git clone --recursive https://github.com/espressif/esp-idf.git
cd esp-idf && ./install.sh esp32c3 && source ./export.sh
idf.py --version  # 期望输出: ESP-IDF v5.x.x`
  ),
  h3('MQTT 连接核心代码'),
  codeBlock(
    'c',
    `static void mqtt_event_handler(void *handler_args, esp_event_base_t base,
                               int32_t event_id, void *event_data) {
    esp_mqtt_event_handle_t event = event_data;
    switch (event->event_id) {
        case MQTT_EVENT_CONNECTED:
            ESP_LOGI(TAG, "MQTT 已连接");
            esp_mqtt_client_subscribe(client, "/lihuahai/sensor", 0);
            break;
        case MQTT_EVENT_DATA:
            ESP_LOGI(TAG, "收到数据: topic=%.*s, data=%.*s",
                event->topic_len, event->topic,
                event->data_len, event->data);
            break;
        default: break;
    }
}`
  ),
  blockquote('ESP32-C3 的 GPIO9 在上电时用于下载模式选择，请避免连接外部下拉电阻。'),
  h2('低功耗睡眠策略'),
  para(
    '在低频采集场景（如每 5 分钟上报一次），将 ESP32-C3 配置为 ',
    bold('Deep Sleep'),
    ' 模式，唤醒后重连 Wi-Fi 与 MQTT Broker，平均电流可压到 15μA 以内。'
  ),
  codeBlock(
    'c',
    `// 配置 10 分钟 Deep Sleep
esp_sleep_enable_timer_wakeup(10 * 60 * 1000000ULL);
esp_deep_sleep_start();`
  )
)

const POST_CONTENT_2 = doc(
  h2('技术栈选型'),
  para(
    '本博客采用 ',
    bold('Next.js 15 App Router'),
    ' + TypeScript + PostgreSQL 原生驱动构建，服务端渲染与静态生成混合使用，不依赖任何 ORM。'
  ),
  h3('数据层设计'),
  para('所有 SQL 集中在 ', code('lib/db/dao/'), ' 层，调用方不直接接触 SQL：'),
  codeBlock(
    'typescript',
    `// lib/db/dao/postDao.ts
export async function findPostBySlug(slug: string): Promise<PostRow | null> {
  const result = await query<PostRow>(
    'SELECT * FROM posts WHERE slug = $1',
    [slug]
  )
  return result.rows[0] ?? null
}`
  ),
  h3('认证方案'),
  para('采用 NextAuth v5（Auth.js）的 Credentials Provider，单管理员模式，无需数据库存储 session。'),
  h2('部署与性能'),
  para('静态页面通过 ', code('revalidate = 60'), ' 实现 ISR，API 路由部署在同一 Node.js 进程中，避免冷启动开销。'),
  blockquote('选择 App Router 的最大收益是 Server Components — 从数据库直接渲染 HTML，无需客户端 fetch。')
)

const POST_CONTENT_3 = doc(
  h2('为什么选择 Arch Linux'),
  para(
    'Arch Linux 奉行 ',
    bold('KISS 原则'),
    '（Keep It Simple, Stupid），只安装你真正需要的包，让你完全掌控每一个系统组件。这种哲学与我的工程理念高度契合。'
  ),
  h3('基础配置'),
  codeBlock(
    'bash',
    `# 更新系统
pacman -Syu

# 安装基础开发工具
pacman -S base-devel git neovim tmux

# 配置 AUR 助手 (paru)
git clone https://aur.archlinux.org/paru.git
cd paru && makepkg -si`
  ),
  h3('桌面环境选择'),
  para('我选择了 ', bold('Hyprland'), ' 作为 Wayland 合成器，配合 Waybar 状态栏，启动速度极快，动画流畅。'),
  codeBlock(
    'bash',
    `paru -S hyprland waybar wofi kitty swww
# 拷贝配置文件
cp -r dotfiles/.config/* ~/.config/`
  ),
  h2('日常工作流'),
  para('编辑器：Neovim（LazyVim 发行版）；终端：Kitty；浏览器：Firefox Developer Edition。所有配置文件统一管理在 dotfiles 仓库中。'),
  blockquote('滚动更新发行版对于跟上最新内核和驱动至关重要，但也要做好偶尔需要修复的心理准备。')
)

const POST_CONTENT_4 = doc(
  h2('出发前的忐忑'),
  para(
    '背上 28L 的背包，订了一张去', bold('敦煌'), '的高铁票，独自出发。这是我第一次完全按自己节奏安排的旅行——没有攻略，只有一张粗略的行程图。'
  ),
  h3('莫高窟的震撼'),
  para(
    '壁画并不像照片里那么鲜艳——一千年的风沙已经消去了大半色彩，但正是这种历史的沉淀让它显得如此真实。站在第 96 窟前，我沉默了很久。'
  ),
  h2('鸣沙山日落'),
  para('骑着骆驼走进沙漠时已经接近傍晚，沙丘背面的阴影一点一点覆盖上来，太阳以肉眼可见的速度坠落。此刻没有任何 AI 生成的图片能够替代这种体验。'),
  blockquote('旅行的意义不在于到达某个地方，而在于你在路上成为了什么样的人。')
)

const POST_CONTENT_5 = doc(
  h2('关于认知偏误'),
  para(
    '《清醒思考的艺术》（Die Kunst des klaren Denkens）收录了 52 种常见的思维错误，作者罗尔夫·多贝里以简洁的案例拆解每一种偏误。'
  ),
  h3('最值得铭记的三条'),
  para(bold('1. 幸存者偏差'), '——我们看到的成功案例只是幸存下来的样本，失败的沉没于沉默之中。'),
  para(bold('2. 禀赋效应'), '——一旦拥有某物，我们会高估它的价值，即使它本来平淡无奇。'),
  para(bold('3. 社会认同'), '——当不确定时，我们倾向于跟随大多数人，这在金融市场中尤为危险。'),
  h2('读后感'),
  para('每章只有两三页，适合碎片时间阅读。不过书中的解药往往留白，更多的是让你意识到问题的存在——解法需要靠自己实践摸索。'),
  blockquote('意识不到偏误，才是最大的偏误。')
)

// ──────────────────────────────────────────────────────────────
// 主函数
// ──────────────────────────────────────────────────────────────

async function seed() {
  loadEnv(path.join(process.cwd(), '.env.local'))

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })
  const client = await pool.connect()

  console.log('[seed] 连接到数据库...')

  try {
    await client.query('BEGIN')

    // ── 1. 清空（逆 FK 顺序）────────────────────────────────
    console.log('[seed] 清空现有数据...')
    await client.query(`
      TRUNCATE TABLE
        comments, gallery_items, links, settings,
        animes, games, moments, posts
      RESTART IDENTITY CASCADE
    `)

    // ── 2. 文章 ──────────────────────────────────────────────
    console.log('[seed] 插入文章...')
    const postsResult = await client.query(`
      INSERT INTO posts
        (title, slug, content, excerpt, status, tags, category, view_count, published_at)
      VALUES
        ($1,$2,$3,$4,'published','{ESP32,物联网,MQTT,C语言,嵌入式}','技术笔记',342,NOW() - INTERVAL '15 days'),
        ($5,$6,$7,$8,'published','{Next.js,TypeScript,PostgreSQL,全栈,博客}','项目实战',218,NOW() - INTERVAL '10 days'),
        ($9,$10,$11,$12,'published','{Arch Linux,Linux,Hyprland,Wayland,开源}','技术笔记',156,NOW() - INTERVAL '6 days'),
        ($13,$14,$15,$16,'published','{旅行,敦煌,莫高窟,生活,攻略}','生活随笔',89,NOW() - INTERVAL '3 days'),
        ($17,$18,$19,$20,'draft','{读书,认知,思维,随笔}','读书笔记',0,NULL)
      RETURNING id
    `, [
      'ESP32-C3 开发实战：从零搭建 MQTT 物联网节点', 'esp32c3-mqtt-iot-node',
      POST_CONTENT_1,
      '详细记录使用 ESP32-C3 构建轻量级 MQTT 客户端的全过程，包含环境配置、引脚复用与低功耗睡眠策略。',

      'Next.js 15 全栈博客开发：App Router + PostgreSQL + Tiptap', 'nextjs15-fullstack-blog',
      POST_CONTENT_2,
      '从零开始用 Next.js 15 App Router 构建个人博客的完整记录，不依赖 ORM，原生 pg 驱动直连 PostgreSQL。',

      'Arch Linux 每日驱动配置备忘录 2025', 'arch-linux-daily-driver-2025',
      POST_CONTENT_3,
      '我的 Arch Linux 工作站配置全记录：Hyprland + Waybar + Neovim + Kitty，极简而高效。',

      '人生第一次独自旅行——敦煌七天', 'solo-trip-dunhuang',
      POST_CONTENT_4,
      '带着一个背包和一张高铁票，第一次独自来到敦煌。莫高窟、鸣沙山、戈壁日出……一些东西改变了。',

      '读《清醒思考的艺术》：52 种思维陷阱', 'reading-art-of-clear-thinking',
      POST_CONTENT_5,
      '罗尔夫·多贝里总结的 52 种认知偏误。薄薄一本，每章两三页，但每一章都能击中你日常中某个不自知的时刻。',
    ])
    const postIds = postsResult.rows.map((r: { id: number }) => r.id)

    // ── 3. 评论 ──────────────────────────────────────────────
    console.log('[seed] 插入评论...')
    await client.query(`
      INSERT INTO comments (post_id, author_name, author_email, content, is_approved, created_at)
      VALUES
        ($1,'张三','zhangsan@example.com','写得非常详细！我按照这个教程搭好了，唯一踩坑的是 GPIO9 那里，文章里专门提到了，感谢！',TRUE,NOW() - INTERVAL '12 days'),
        ($1,'嵌入式小白','','请问 ESP32-C3 连接阿里云 IoT 平台的 MQTT 和这篇文章有啥区别吗？',TRUE,NOW() - INTERVAL '10 days'),
        ($1,'李四',NULL,'代码风格很清晰，收藏了',FALSE,NOW() - INTERVAL '2 days'),
        ($2,'前端同学','fe@example.com','Server Components 的部分讲得很清楚，之前我一直搞不懂什么时候该用客户端组件',TRUE,NOW() - INTERVAL '8 days'),
        ($3,'arch_user','','Hyprland 的动画确实很丝滑，但我用 NVIDIA 显卡踩了很多坑，建议加一段 NVIDIA 专属配置',TRUE,NOW() - INTERVAL '4 days'),
        ($4,'旅行者','tourist@qq.com','敦煌太美了，我也去过，莫高窟真的震撼。强烈推荐也去一下西千佛洞，人少景美！',FALSE,NOW() - INTERVAL '1 day')
    `, [postIds[0], postIds[1], postIds[2], postIds[3]])

    // ── 4. 极客瞬间 ──────────────────────────────────────────
    console.log('[seed] 插入瞬间...')
    await client.query(`
      INSERT INTO moments (type, content, meta, mood, weather, location, is_public, created_at)
      VALUES
        ('text','把博客的评论系统终于跑通了，从数据库 Schema 到前端表单一口气写完，满满的成就感。',NULL,'😄','晴','在家',TRUE,NOW() - INTERVAL '2 hours'),
        ('sleep',NULL,'{"sleepStart":"23:15","sleepEnd":"07:30","deepSleepMinutes":92,"lightSleepMinutes":185,"remMinutes":43,"score":84}',NULL,NULL,NULL,TRUE,NOW() - INTERVAL '10 hours'),
        ('steps',NULL,'{"steps":12483,"distance":9120,"calories":487,"activeMinutes":62}','😊','多云','上海',TRUE,NOW() - INTERVAL '1 day'),
        ('text','刷到一篇关于 Zig 语言的文章，内存管理模型很有意思。也许下个项目可以尝试一下，毕竟 C 的 UB 已经让我折腾够了。',NULL,'🤔','阴',NULL,TRUE,NOW() - INTERVAL '2 days'),
        ('mood','最近睡眠质量很受影响，深睡时间明显减少。准备实验一下睡前不刷手机的方案，用实体书代替。',NULL,'😴','多云','在家',TRUE,NOW() - INTERVAL '3 days'),
        ('steps',NULL,'{"steps":6820,"distance":4950,"calories":231,"activeMinutes":28}',NULL,'小雨','上海',TRUE,NOW() - INTERVAL '4 days'),
        ('sleep',NULL,'{"sleepStart":"00:42","sleepEnd":"08:05","deepSleepMinutes":61,"lightSleepMinutes":221,"remMinutes":57,"score":72}',NULL,NULL,NULL,TRUE,NOW() - INTERVAL '5 days'),
        ('text','Tailwind CSS v4 的 CSS 变量原生支持太香了，以前要写一堆 JIT arbitrary value，现在直接用 CSS 变量搞定双主题，代码量减少了 30%。',NULL,'😍','晴','在家',TRUE,NOW() - INTERVAL '6 days'),
        ('link','分享一个好用的正则可视化工具 regex101.com，调试复杂正则必备',NULL,NULL,NULL,NULL,TRUE,NOW() - INTERVAL '8 days'),
        ('text','今天把 Neovim 配置从 init.lua 迁移到 LazyVim，快捷键几乎不用改，但插件管理清爽多了。顺手装了 nvim-tree 和 telescope，幸福感+1。',NULL,'😄','晴',NULL,TRUE,NOW() - INTERVAL '10 days'),
        ('text','读完《清醒思考的艺术》，每章两三页，轻松。其中「幸存者偏差」那章让我重新审视了自己对「成功案例」的崇拜。',NULL,'📚','阴','咖啡馆',TRUE,NOW() - INTERVAL '14 days')
    `)

    // ── 5. 动漫 ──────────────────────────────────────────────
    console.log('[seed] 插入动漫...')
    await client.query(`
      INSERT INTO animes
        (title, title_cn, type, episodes_total, episodes_watched, status, rating, short_review, start_season)
      VALUES
        ('Shingeki no Kyojin: The Final Season','进击的巨人 最终季','tv',16,16,'completed',9.8,'剧情密度极高，世界观的最终揭示令人窒息。结局争议很大，但我认为是神来之笔。','2020冬'),
        ('Kimetsu no Yaiba','鬼灭之刃','tv',26,26,'completed',8.5,'战斗作画顶级，人物情感丰富。遗刃篇和无限列车篇是巅峰。','2019春'),
        ('Ghost in the Shell: SAC_2045','攻壳机动队 SAC_2045','tv',12,7,'watching',7.2,'3D 风格需要适应，但素子的角色塑造依然在线，剧情慢慢打开了。','2020春'),
        ('Houseki no Kuni','宝石之国','tv',12,0,'plan_to_watch',NULL,'据说 CG 动画中少有的杰作，剧情很下头。找个安静的周末一口气看完。','2017秋'),
        ('Vinland Saga Season 2','冰海战记 第二季','tv',24,24,'completed',9.5,'从复仇到救赎，角色成长线极为扎实。比第一季更成熟，更克制，也更有力量。','2023冬'),
        ('Bocchi the Rock!','孤独摇滚！','tv',12,12,'completed',9.0,'治愈系神作。后藤一里的每一次台词都精准踩到了社恐的命门，笑着笑着就哭了。','2022秋')
    `)

    // ── 6. 游戏 ──────────────────────────────────────────────
    console.log('[seed] 插入游戏...')
    await client.query(`
      INSERT INTO games
        (title, platform, status, play_hours, rating, short_review, completed_at)
      VALUES
        ('Elden Ring','pc','platinum',162.5,10.0,'魂系列集大成之作。开放世界与受苦玩法完美融合，每一个 Boss 都是一首战斗诗篇。铂金值得。',NOW() - INTERVAL '200 days'),
        ('Cyberpunk 2077: Phantom Liberty','pc','completed',84.0,9.2,'V 的故事画上了完美句点。夜之城的世界观密度、配乐、演出，让我久久回味。',NOW() - INTERVAL '120 days'),
        ('Hollow Knight','pc','completed',48.3,9.5,'地图设计天才之作，Boss 难度曲线克制而精准。白色宫殿让我崩溃，但通关后的成就感无与伦比。',NOW() - INTERVAL '180 days'),
        ('Nintendo Switch Sports','switch','playing',18.5,7.8,'和朋友打保龄球很欢乐，腕带必须戴好。体感游戏的乐趣是电视游戏无法替代的。',NULL),
        ('Stardew Valley','pc','plan_to_play',NULL,NULL,'已经被无数人安利，据说可以治愈焦虑。找个周末开荒。',NULL),
        ('Balatro','pc','completed',35.0,9.6,'2024 年最上头的 Roguelike，"再来一把"的魔力强到令人发指。组合的涌现感极佳。',NOW() - INTERVAL '30 days')
    `)

    // ── 7. 相册 ──────────────────────────────────────────────
    console.log('[seed] 插入相册...')
    await client.query(`
      INSERT INTO gallery_items
        (title, description, url, thumbnail_url, file_name, category, width, height, tags, is_featured, sort_order)
      VALUES
        ('敦煌莫高窟黄昏','傍晚的阳光斜射在崖壁上，金色与土黄交织，说不出话来',
         '/uploads/gallery/mogao-sunset.jpg','/uploads/gallery/thumb/mogao-sunset.jpg',
         'mogao-sunset.jpg','photo',4032,3024,'{敦煌,旅行,黄昏,历史}',TRUE,1),
        ('鸣沙山骆驼队','夕阳下的骆驼剪影，沙漠的极简美学',
         '/uploads/gallery/camel-silhouette.jpg','/uploads/gallery/thumb/camel-silhouette.jpg',
         'camel-silhouette.jpg','photo',3840,2160,'{沙漠,骆驼,剪影,旅行}',TRUE,2),
        ('Arch Linux 桌面截图','Hyprland + Waybar，干净清爽的工作环境',
         '/uploads/gallery/arch-desktop.png','/uploads/gallery/thumb/arch-desktop.png',
         'arch-desktop.png','screenshot',2560,1440,'{Linux,Arch,桌面,开源}',FALSE,3),
        ('ESP32-C3 开发板布线','MQTT 项目的实际接线，手工焊接功率模块',
         '/uploads/gallery/esp32c3-wiring.jpg','/uploads/gallery/thumb/esp32c3-wiring.jpg',
         'esp32c3-wiring.jpg','photo',2448,3264,'{嵌入式,ESP32,硬件,DIY}',FALSE,4),
        ('某个深夜的咖啡馆','一个人，一本书，一杯美式，让城市的喧嚣退后',
         '/uploads/gallery/cafe-night.jpg','/uploads/gallery/thumb/cafe-night.jpg',
         'cafe-night.jpg','photo',4000,3000,'{夜晚,咖啡馆,氛围,生活}',TRUE,5)
    `)

    // ── 8. 友情链接 ──────────────────────────────────────────
    console.log('[seed] 插入友链...')
    await client.query(`
      INSERT INTO links (name, url, description, category, sort_order, is_active)
      VALUES
        ('GitHub','https://github.com','全球最大代码托管平台，开源精神的核心据点','resource',1,TRUE),
        ('MDN Web Docs','https://developer.mozilla.org','最权威的 Web 开发参考文档，没有之一','resource',2,TRUE),
        ('Tailwind CSS 官网','https://tailwindcss.com','原子化 CSS 框架，设计效率革命','tool',1,TRUE),
        ('Tiptap 富文本编辑器','https://tiptap.dev','基于 ProseMirror 的无头富文本框架，高度可扩展','tool',2,TRUE),
        ('乐鑫开发者社区','https://www.esp32.com','ESP32 系列芯片官方论坛，技术问题必备','resource',3,TRUE),
        ('Arch Wiki','https://wiki.archlinux.org','Linux 世界最详细的 Wiki，即使不用 Arch 也值得查阅','resource',4,TRUE),
        ('Next.js 官方文档','https://nextjs.org/docs','App Router 全部秘密都在这里','tool',3,TRUE),
        ('一位老友的博客','https://example.com','写代码也写生活，文字很有温度','friend',1,TRUE),
        ('regex101','https://regex101.com','正则表达式调试神器，支持 PCRE/Python/JS 等多种引擎','tool',4,TRUE),
        ('Excalidraw','https://excalidraw.com','手绘风格白板工具，画架构图一流','tool',5,TRUE)
    `)

    // ── 9. 设置 ──────────────────────────────────────────────
    console.log('[seed] 插入设置...')
    await client.query(`
      INSERT INTO settings (key, value, description) VALUES
        ('site.name',      '"梨花海"', '站点名称'),
        ('site.slogan',    '"用代码记录生活"', '站点口号'),
        ('site.bio',       '"嵌入式工程师 / 全栈玩家 / 开源爱好者 / 喜欢用代码解决生活里的小问题"', '个人简介'),
        ('site.avatar',    'null', '头像 URL'),
        ('site.hero_bg',   'null', '首页 Hero 背景图 URL'),
        ('site.github',    '"https://github.com"', 'GitHub 主页'),
        ('site.email',     '"hello@lihuahai.dev"', '联系邮箱')
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `)

    await client.query('COMMIT')
    console.log('')
    console.log('✅ 种子数据插入完成：')
    console.log('   文章: 5 篇  (4 已发布 + 1 草稿)')
    console.log('   评论: 6 条  (4 已审核 + 2 待审)')
    console.log('   瞬间: 11 条')
    console.log('   动漫: 6 部')
    console.log('   游戏: 6 款')
    console.log('   相册: 5 张')
    console.log('   友链: 10 条')
    console.log('   设置: 7 项')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[seed] 失败，已回滚：', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
