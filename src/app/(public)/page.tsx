import { WaitlistForm } from '@/components/public/WaitlistForm'
import { InvestmentCalculator } from '@/components/learn/InvestmentCalculator'

const investingProblems = [
  'REITs are accessible, but limited in scope',
  'SM REITs offer deeper opportunities, but require high capital and understanding',
  'Information is scattered across platforms',
  'Most investors lack a clear way to evaluate options',
]

const platformPillars = [
  {
    title: 'Education',
    body: 'Learn how REITs and SM REITs actually work',
  },
  {
    title: 'Wealth building (SIP mindset)',
    body: 'Build capital gradually instead of waiting for large lump sums',
  },
  {
    title: 'Real estate access',
    body: 'Explore both REITs and SM REIT opportunities in one place',
  },
]

const howItWorks = [
  {
    title: 'Learn',
    body: 'Understand REITs, SM REITs, and key concepts like yield, risk, and lease structures',
  },
  {
    title: 'Compare',
    body: 'View and compare opportunities across both REITs and SM REITs',
  },
  {
    title: 'Build',
    body: 'Track your progress and build capital towards larger investments',
  },
  {
    title: 'Explore',
    body: 'Access opportunities through trusted, regulated platforms',
  },
]

const doesNotDo = [
  'Provide personalized investment advice',
  'Handle or store your money',
  'Push specific investment decisions',
]

const helpsYouDo = [
  'Understand before you invest',
  'Compare options objectively',
  'Make informed decisions independently',
]

const whyNow = [
  'REITs have made it accessible',
  'SM REITs are opening new opportunities',
  'But understanding and navigating both remains difficult',
]

const faqItems = [
  {
    question: 'Why use BrickByBrick instead of other apps or FDs?',
    answer:
      'You can invest through stock apps or FDs, but they do not provide a complete view of real estate investing. BrickByBrick combines education, wealth building (SIP approach), and real estate opportunities (REITs and SM REITs) in one place so you can build real estate exposure with better understanding.',
  },
  {
    question: 'This is a long-term goal. How will you keep me motivated?',
    answer:
      'We focus on clarity and progress. Track your journey, learn as you go, and get relevant insights without noise. No spam or unnecessary notifications, just tools to help you stay consistent.',
  },
  {
    question: 'How do I know the properties are any good?',
    answer:
      'BrickByBrick does not create or manage properties. We provide detailed property-level information, tenant profiles, lease terms, and yield data, with access to opportunities from SEBI-regulated platforms. You always make the final decision.',
  },
  {
    question: 'How do I actually make money?',
    answer:
      'Returns typically come from rental income distributed periodically and capital appreciation over time. We help you understand these clearly, but do not guarantee returns.',
  },
  {
    question: 'Who manages my money and picks the properties? Where is SEBI?',
    answer:
      'BrickByBrick does not manage your money. REIT investments are executed via brokers, SM REIT investments are handled by SEBI-regulated platforms and asset managers, and any advisory layer (if introduced) will be through SEBI-registered partners. Your funds remain with regulated entities.',
  },
  {
    question: 'Is this a scam? Is my money safe?',
    answer:
      'BrickByBrick does not handle your funds. All investments happen through trusted, regulated platforms. You have full visibility before making any decision, and control always remains with you.',
  },
  {
    question: 'Is this investment advice?',
    answer:
      'No. BrickByBrick is an education and discovery platform. We do not provide personalized investment advice.',
  },
]

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 text-zinc-700">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-1 text-orange-600">●</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <section className="w-full bg-black text-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-16 md:px-10 md:py-24">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-500">BrickByBrick</p>
          <h1 className="mt-4 max-w-5xl text-5xl font-black uppercase leading-[0.95] md:text-8xl">
            Real estate,
            <br />
            made easy.
          </h1>
          <p className="mt-6 max-w-3xl text-base text-zinc-300 md:text-xl">
            Explore, understand, and invest in real estate opportunities. All in one place.
          </p>
          <div className="mt-10 max-w-4xl bg-white p-2">
            <WaitlistForm />
          </div>
          <p className="mt-4 text-sm font-medium text-zinc-400">Built for first-time and curious investors</p>
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 py-10 md:px-8 md:py-16">

        <section className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-black md:text-3xl">Real estate investing is fragmented</h2>
            <p className="mt-5 text-zinc-700">
              As a result, people either stay within the same stocks and mutual funds, or avoid real estate
              altogether.
            </p>
          </div>
          <BulletList items={investingProblems} />
        </section>

        <section>
          <h2 className="text-2xl font-black md:text-3xl">
            One platform for education, wealth building, and real estate investing
          </h2>
          <p className="mt-4 text-zinc-700">BrickByBrick brings together:</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {platformPillars.map((pillar) => (
              <article key={pillar.title} className="bg-zinc-50 px-5 py-4">
                <h3 className="text-lg font-bold text-orange-600">{pillar.title}</h3>
                <p className="mt-2 text-sm text-zinc-700">{pillar.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 text-zinc-700">
            This allows you to go beyond just investing in the same stocks and mutual funds, and start building
            real estate exposure with clarity.
          </p>
        </section>

        <section className="bg-black px-6 py-12 text-white md:px-10">
          <h2 className="text-2xl font-black md:text-3xl">How it works</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {howItWorks.map((step) => (
              <article key={step.title} className="bg-zinc-950 p-5">
                <h3 className="text-lg font-bold text-orange-500">{step.title}</h3>
                <p className="mt-2 text-sm text-zinc-300">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-12">
          <h2 className="text-2xl font-black md:text-3xl mb-8">See how your money can grow</h2>
          <InvestmentCalculator />
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-black md:text-3xl">Built for clarity, not complexity</h2>
            <p className="mt-5 text-zinc-700">BrickByBrick does not:</p>
            <div className="mt-4">
              <BulletList items={doesNotDo} />
            </div>
          </div>
          <div>
            <p className="text-zinc-700">Instead, it helps you:</p>
            <div className="mt-4">
              <BulletList items={helpsYouDo} />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black md:text-3xl">Why now</h2>
          <p className="mt-5 text-zinc-700">Real estate investing is evolving:</p>
          <div className="mt-4 max-w-2xl">
            <BulletList items={whyNow} />
          </div>
          <p className="mt-6 text-zinc-700">BrickByBrick simplifies this.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black md:text-3xl">Frequently Asked Questions</h2>
          <div className="mt-8 space-y-8">
            {faqItems.map((item) => (
              <article key={item.question}>
                <h3 className="text-lg font-bold">{item.question}</h3>
                <p className="mt-2 text-zinc-700">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-zinc-100 px-6 py-12 text-center md:px-10">
          <h2 className="text-3xl font-black md:text-4xl">Start exploring real estate investing</h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-700">
            Join early access and be part of building a better way to invest in real estate.
          </p>
          <div className="mt-8 flex justify-center">
            <WaitlistForm />
          </div>
        </section>
      </main>

      <footer className="bg-black px-4 py-10 text-white md:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 text-sm text-zinc-300 md:flex-row md:items-center md:justify-between">
          <p>Early-stage project</p>
          <p>Not an investment advisor</p>
          <p>Built by a student team exploring real estate investing</p>
        </div>
      </footer>
    </div>
  )
}