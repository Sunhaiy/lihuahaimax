import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getSiteProfile, normalizeSiteProfile, persistSiteProfile } from '@/lib/site'
import { siteProfileSchema } from '@/lib/validation/site'

export async function GET() {
  const profile = await getSiteProfile()
  return NextResponse.json(profile)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = siteProfileSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const profile = await persistSiteProfile(
    normalizeSiteProfile({
      ...parsed.data,
      avatarUrl: parsed.data.avatarUrl || null,
      defaultPostCoverUrl: parsed.data.defaultPostCoverUrl || null,
    })
  )

  return NextResponse.json(profile)
}
