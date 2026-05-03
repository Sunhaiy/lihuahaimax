import { query } from '@/lib/db'
import type {
  CreateLinkSubmissionInput,
  LinkSubmissionRow,
  LinkSubmissionStatus,
  UpdateLinkSubmissionInput,
} from '@/types/link'

export async function findLinkSubmissions(
  status?: LinkSubmissionStatus
): Promise<LinkSubmissionRow[]> {
  const values: unknown[] = []
  const where = status ? `WHERE status = $1` : ''
  if (status) values.push(status)

  const result = await query<LinkSubmissionRow>(
    `SELECT * FROM link_submissions ${where} ORDER BY created_at DESC, id DESC`,
    values
  )

  return result.rows
}

export async function findLinkSubmissionById(id: number): Promise<LinkSubmissionRow | null> {
  const result = await query<LinkSubmissionRow>(
    'SELECT * FROM link_submissions WHERE id = $1',
    [id]
  )
  return result.rows[0] ?? null
}

export async function insertLinkSubmission(
  input: CreateLinkSubmissionInput
): Promise<LinkSubmissionRow> {
  const result = await query<LinkSubmissionRow>(
    `INSERT INTO link_submissions (
      site_name,
      site_url,
      site_description,
      site_avatar_url,
      site_rss_url,
      contact_email,
      contact_note
    ) VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *`,
    [
      input.siteName,
      input.siteUrl,
      input.siteDescription ?? null,
      input.siteAvatarUrl ?? null,
      input.siteRssUrl ?? null,
      input.contactEmail,
      input.contactNote ?? null,
    ]
  )

  return result.rows[0]
}

export async function updateLinkSubmission(
  id: number,
  input: UpdateLinkSubmissionInput
): Promise<LinkSubmissionRow | null> {
  const clauses: string[] = []
  const values: unknown[] = []
  let index = 1

  if (input.status !== undefined) {
    clauses.push(`status = $${index++}`)
    values.push(input.status)
    clauses.push(`reviewed_at = NOW()`)
  }

  if (input.adminNote !== undefined) {
    clauses.push(`admin_note = $${index++}`)
    values.push(input.adminNote)
  }

  if (!clauses.length) {
    return findLinkSubmissionById(id)
  }

  values.push(id)

  const result = await query<LinkSubmissionRow>(
    `UPDATE link_submissions
     SET ${clauses.join(', ')}
     WHERE id = $${index}
     RETURNING *`,
    values
  )

  return result.rows[0] ?? null
}
