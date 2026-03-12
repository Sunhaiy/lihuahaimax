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
      onSubmit={(e) => {
        if (!confirm(`确认删除《${title}》？此操作不可撤销。`)) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-[11px] px-2 py-1 rounded border border-red-500/20
                   text-red-400 hover:bg-red-400/10 transition-colors"
      >
        删除
      </button>
    </form>
  )
}
