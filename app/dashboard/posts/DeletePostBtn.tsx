'use client'

interface Props {
  id: number
  title: string
  action: (fd: FormData) => void | Promise<void>
}

export function DeletePostBtn({ id, title, action }: Props) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm(`确认删除《${title}》？此操作不可撤销。`)) event.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex h-8 items-center justify-center rounded-full border border-red-500/22 bg-red-500/8 px-3 text-xs text-red-300 transition-colors hover:border-red-500/35 hover:bg-red-500/14"
      >
        删除
      </button>
    </form>
  )
}
