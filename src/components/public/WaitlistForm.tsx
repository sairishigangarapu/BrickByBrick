'use client'

import { FormEvent, useState } from 'react'

type WaitlistState = {
  loading: boolean
  success: string | null
  error: string | null
}

export function WaitlistForm() {
  const [state, setState] = useState<WaitlistState>({
    loading: false,
    success: null,
    error: null,
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') || '').trim()
    const email = String(formData.get('email') || '').trim()
    const age = Number(formData.get('age'))

    if (!name || !email || !Number.isInteger(age) || age < 18 || age > 100) {
      setState({
        loading: false,
        success: null,
        error: null,
      })
      return
    }

    setState({ loading: true, success: null, error: null })

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, age }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || 'Could not join the waitlist right now.')
      }

      event.currentTarget.reset()
      setState({
        loading: false,
        success: 'You are on the waitlist. We will share early access updates soon.',
        error: null,
      })
    } catch (error) {
      setState({ 
        loading: false, 
        success: null, 
        error: error instanceof Error ? error.message : 'Something went wrong. Please try again.' 
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4 bg-white p-6">
      <div className="grid gap-4 md:grid-cols-3">
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

        <label className="flex flex-col gap-2 text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-black">Age</span>
          <input
            name="age"
            type="number"
            min={18}
            max={100}
            required
            placeholder="25"
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
