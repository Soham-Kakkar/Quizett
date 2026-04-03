"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getQuestion, checkAnswer, submitScoreApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function QuestionView({
  quizId,
  questionNumber,
  totalQuestions,
}: {
  quizId: string
  questionNumber: number
  totalQuestions?: number
}) {
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState<string>("")
  const [hint, setHint] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [answer, setAnswer] = useState("")
  const [result, setResult] = useState<null | boolean>(null)
  const [resMessage, setResMessage] = useState<null | string>(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navTimeout = useRef<number | null>(null)
  const router = useRouter()

  // Reset state when question changes
  useEffect(() => {
    setLoading(true)
    setQuestion("")
    setHint(null)
    setShowHint(false)
    setAnswer("")
    setResult(null)
    setResMessage(null)
    setSubmitted(false)
    setError(null)
  }, [quizId, questionNumber])

  // Fetch question
  useEffect(() => {
    let mounted = true
    getQuestion(quizId, questionNumber)
      .then((res) => {
        if (!mounted) return
        setQuestion(res.question)
        setHint(res.hint ?? null)
      })
      .catch((e) => setError(String(e)))
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [quizId, questionNumber])

  const goTo = useCallback((n: number) => {
    router.push(`/quiz/${encodeURIComponent(quizId)}/${n}`)
  }, [router, quizId])

  async function submitAnswer(e?: React.FormEvent) {
    e?.preventDefault()
    setError(null)
    setResult(null)
    setResMessage(null)
    setSubmitted(true)
    console.log("Submitting answer:", answer.trim())
    if (answer.trim() === "") {
      setResult(false)
      setResMessage("Answer cannot be empty")
      return
    }

    try {
      const res = await checkAnswer(quizId, questionNumber, answer.trim())
      setResult(res.correct)
      setResMessage(res.message ?? null)
      // persist result for this quiz/question in sessionStorage
      try {
        const key = `quizett:answers:${quizId}`
        const raw = sessionStorage.getItem(key)
        const obj = raw ? JSON.parse(raw) : {}
        // store the user's text answer so server can verify and compute points
        obj[String(questionNumber)] = String(answer).trim()
        sessionStorage.setItem(key, JSON.stringify(obj))
      } catch (e) {
        console.warn('Failed to persist answer', e)
      }
    } catch (err) {
      setError(String(err))
    }
    console.log("Received result:", { result, resMessage })
  }

  // auto-move to next question shortly after a correct submission
  useEffect(() => {
    if (navTimeout.current) {
      clearTimeout(navTimeout.current)
      navTimeout.current = null
    }

    if (submitted && result === true) {
      if (totalQuestions === undefined || questionNumber < totalQuestions) {
        navTimeout.current = window.setTimeout(() => {
          goTo(questionNumber + 1)
        }, 500)
      }
    }

    return () => {
      if (navTimeout.current) {
        clearTimeout(navTimeout.current)
        navTimeout.current = null
      }
    }
  }, [submitted, result, questionNumber, totalQuestions, quizId, goTo])

  async function finishQuiz() {
    // compute score from sessionStorage
    try {
      const key = `quizett:answers:${quizId}`
      const raw = sessionStorage.getItem(key)
      const obj = raw ? JSON.parse(raw) : {}
      const userName = (typeof window !== 'undefined') ? localStorage.getItem('quizett:username') : null
      if (!userName) {
        alert('Username missing; cannot submit score')
        return
      }

      // send detailed answers object so server can compute raw points using per-question `points` from quizzes.json
      await submitScoreApi(quizId, userName, obj)
      // navigate to leaderboard
      router.push(`/quiz/${encodeURIComponent(quizId)}/leaderboard`)
    } catch (e) {
      console.error('Finish quiz failed', e)
      alert('Failed to submit score')
    }
  }

  if (loading) return <div className="py-8">Loading question...</div>
  if (error) return <div className="text-red-600 py-8">{error}</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question {questionNumber}</CardTitle>
        <CardDescription>Answer the question below.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-base text-foreground mb-4">{question}</p>

        {hint && (
          <div className="mb-4">
            <Button variant="outline" size="sm" onClick={() => setShowHint((s) => !s)}>
              {showHint ? "Hide hint" : "Show hint"}
            </Button>
            {showHint && <div className="mt-2 rounded bg-muted p-3 text-sm text-muted-foreground">{hint}</div>}
          </div>
        )}

        <form onSubmit={submitAnswer} className="flex flex-col gap-4">
          <textarea
            aria-label="Your answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer"
            className="rounded border px-4 py-3 text-base"
          />
          <div className="flex items-center gap-3">
            <Button type="submit" size="lg">
              Submit
            </Button>
            {questionNumber > 1 && (
              <Button variant="outline" size="sm" onClick={() => goTo(questionNumber - 1)}>
                Prev
              </Button>
            )}
            {(totalQuestions === undefined || questionNumber < totalQuestions) && (
              <Button variant="outline" size="sm" onClick={() => goTo(questionNumber + 1)}>
                Next
              </Button>
            )}
            {totalQuestions !== undefined && questionNumber === totalQuestions && (
              <Button variant="secondary" size="sm" onClick={() => finishQuiz()}>
                Finish Quiz
              </Button>
            )}
            {submitted && result === true && <span className="text-green-600 font-medium">Correct ✅</span>}
            {submitted && result === false &&  (
              <span className="text-red-600 font-medium">{resMessage ? resMessage : "Incorrect ❌"}</span>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter />
    </Card>
  )
}

export default QuestionView