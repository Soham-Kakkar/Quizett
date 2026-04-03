"use client"

import Link from "next/link"

export default function QuestionsList({ quizId, current = 1, count = 10 }: { quizId: string; current?: number; count?: number }) {
  const items = Array.from({ length: count }, (_, i) => i + 1)
  return (
    <aside className="w-56 min-h-200">
      <div className="sticky h-full overflow-auto rounded border border-sidebar-border bg-sidebar p-4">
        <h4 className="text-sm font-medium mb-3">Questions</h4>
        <nav className="flex flex-col gap-2">
          {items.map((n) => (
            <Link
              key={n}
              href={`/quiz/${encodeURIComponent(quizId)}/${n}`}
              className={
                `block rounded px-3 py-2 text-sm transition-colors ${n === current ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`
              }
            >
              <span className="font-medium mr-2">Q{n}</span>
              <span className="text-xs text-muted-foreground">Tap to open</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
