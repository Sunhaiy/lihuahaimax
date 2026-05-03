import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/storage/LocalStorage'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(req: NextRequest) {
  let formData: FormData

  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: '无效的表单数据。' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: '请选择要上传的图片。' }, { status: 400 })
  }

  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: '只支持 JPG、PNG、WebP、AVIF 或 GIF 图片。' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: '图片不能超过 5MB。' }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await storage.upload(buffer, file.name, file.type, 'images')
    return NextResponse.json({ url: result.url })
  } catch {
    return NextResponse.json({ error: '图片上传失败，请稍后再试。' }, { status: 500 })
  }
}
