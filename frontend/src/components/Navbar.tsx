'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import {SunIcon, Moon02Icon} from "@hugeicons/core-free-icons"
import { useEffect, useState } from 'react'

function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
      return stored ?? 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem('theme', theme)
    } catch {}
  }, [theme])

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
      <HugeiconsIcon icon={Moon02Icon} altIcon={SunIcon} showAlt={theme === 'dark'} strokeWidth={2}/>
    </Button>
  )
}

export function Navbar() {
  return (
    <nav className="bg-card border-b border-border">
      <div className="container max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Quizett
        </Link>
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link href="/about">About</Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}