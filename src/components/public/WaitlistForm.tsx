'use client'

import { FormEvent, useEffect, useState } from 'react'

type WaitlistState = {
  loading: boolean
  success: string | null
  error: string | null
}

const SUBMITTED_KEY = 'bbb_waitlist_submitted'

export function WaitlistForm() {
  const [state, setState] = useState<WaitlistState>({
    loading: false,
    success: null,
    error: null,
  })
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(SUBMITTED_KEY) === 'true') {
        setAlreadySubmitted(true)
        setState({
          loading: false,
          success: 'You are already on the waitlist. We will share early access updates soon.',
          error: null,
        })
      }
    } catch {
      /* localStorage unavailable */
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // React nulls `event.currentTarget` after the synchronous handler returns,
    // so capture the form before any await.
    const form = event.currentTarget
    const formData = new FormData(form)
    const name = String(formData.get('name') || '').trim()
    const email = String(formData.get('email') || '').trim()

    if (!name || !email) {
      setState({
        loading: false,
        success: null,
        error: 'Please provide both your name and email.',
      })
      return
    }

    setState({ loading: true, success: null, error: null })

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || 'Could not join the waitlist right now.')
      }

      try {
        localStorage.setItem(SUBMITTED_KEY, 'true')
      } catch {
        /* localStorage unavailable */
      }

      form.reset()
      setAlreadySubmitted(true)
      setState({
        loading: false,
        success: 'You are on the waitlist. We will share early access updates soon.',
        error: null,
      })
    } catch (error) {
      setState({
        loading: false,
        success: null,
        error: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      })
    }
  }

  if (alreadySubmitted && state.success) {
    return (
      <div className="w-full max-w-2xl bg-white p-6 border border-emerald-200 rounded-lg">
        <p className="text-sm font-semibold text-emerald-700">{state.success}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4 bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-black">Name</span>
          <input
            name="name"
            type="text"
            required
            placeholder="Your full name"
            className="h-11 bg-transparent border-b-2 border-black px-1 text-sm text-black outline-none transition focus:border-orange-600"
          />
        </label>

        <label className="flex flex-col gap-2 text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-black">Email</span>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="h-11 bg-transparent border-b-2 border-black px-1 text-sm text-black outline-none transition focus:border-orange-600"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={state.loading}
        className="h-11 w-full bg-orange-600 px-5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 rounded-lg"
      >
        {state.loading ? 'Joining...' : 'Join the Waitlist'}
      </button>

      <p className="text-xs text-zinc-600">No spam. Early access and updates only.</p>

      {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
    </form>
  )
}
