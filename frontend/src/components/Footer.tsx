'use client'

export function Footer() {
  return (
    <footer className="bg-card/95 border-t border-border">
      <div className="container max-w-7xl mx-auto px-6 py-6">
        <p className="text-center text-muted-foreground">&copy; {new Date().getFullYear()} Quizett. All rights reserved.</p>
      </div>
    </footer>
  )
}