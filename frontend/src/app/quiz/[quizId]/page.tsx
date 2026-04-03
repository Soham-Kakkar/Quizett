import Link from "next/link"

export default async function QuizPage({ params }: { params: { quizId: string } }) {
  const { quizId } = await params
  return (
    <div className="py-10">
      <div className="mx-auto">
        <h1 className="text-2xl font-bold mb-2">Quiz: {quizId}</h1>
        <p className="text-sm text-muted-foreground mb-4">Start the quiz or jump to a question.</p>

        <div className="flex gap-2">
          <Link href={`/quiz/${quizId}/1`} className="rounded bg-primary px-4 py-2 text-white">Start!</Link>
        </div>

        <div className="mt-6 rounded border bg-card p-4">
          <p className="text-sm">Note: this UI assumes questions are accessible at /questions/:quizId/:questionNumber on the API. If you have a different quiz structure, adjust accordingly.</p>
        </div>
      </div>
    </div>
  )
}
