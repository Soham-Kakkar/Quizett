import QuestionView from '@/components/QuestionView'
import QuestionsList from '@/components/QuestionsList'
import { getQuestionCount } from '@/lib/api';

export default async function QuestionPage({ params }: { params: { quizId: string; questionNumber: string } }) {
  const { quizId, questionNumber } = await params
  const { count: questionCount } = await getQuestionCount(quizId)
  const qNum = parseInt(questionNumber, 10) || 1

  return (
    <div className="flex">
        <QuestionsList quizId={quizId} current={qNum} count={questionCount} />
        <main className="flex-1 py-10 px-10 max-w-7xl">
            <QuestionView quizId={quizId} questionNumber={qNum} totalQuestions={questionCount} />
        </main>
    </div>
  )
}
