"use client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { checkQuizExists, registerUser } from "@/lib/api"

export default function Home() {
  const router = useRouter()
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const fd = new FormData(form)
    const quizId = String(fd.get("quizId") || "").trim()
    const userName = String(fd.get("userName") || "").trim()
    if (!quizId) return

    // client-side username validation: 3-20 chars, letters, numbers, dash or underscore
    const valid = /^[A-Za-z0-9_-]{3,20}$/.test(userName)
    if (!valid) return alert('Username must be 3-20 characters long and only letters, numbers, - or _')

    try {
      const exists = await checkQuizExists(quizId)
      if (!exists) return alert(`Quiz with id "${quizId}" does not exist.`)

      // try to register user; if already registered (400) proceed
      try {
        await registerUser(quizId, userName)
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'status' in err) {
          const status = (err as { status?: number }).status
          if (status === 400) {
            // already registered; continue
          } else {
            console.warn('Registration error', err)
          }
        } else {
          console.warn('Registration error', err)
        }
      }

      // store username locally
      try { localStorage.setItem('quizett:username', userName) } catch {}
      router.push(`/quiz/${encodeURIComponent(quizId)}/1`)
    } catch (e) {
      console.error(e)
      alert('Failed to start quiz')
    }
  }
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-20 px-6">
        <h1 className="text-4xl font-bold mb-4">Quizett</h1>
        <p className="text-lg text-muted-foreground mb-8">Interactive learning quizzes — answer questions, reveal hints, and track progress.</p>
        
        <div className="w-full max-w-xs">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Join a quiz</CardTitle>
              <CardDescription>Enter a quiz id to start (example: demo).</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-2 mx-auto">
                <input
                  name="quizId"
                  placeholder="quiz id"
                  className="flex-1 rounded border px-3 py-2"
                />
                <input
                  name="userName"
                  placeholder="your username"
                  className="flex-1 rounded border px-3 py-2"
                />
                <Button type="submit">Go</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
