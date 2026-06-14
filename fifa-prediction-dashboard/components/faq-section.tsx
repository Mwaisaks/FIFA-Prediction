'use client'

import { useState } from 'react'
import { useReveal } from '@/hooks/useReveal'

interface FAQItem {
  id: string
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How are the predictions calculated?',
    answer:
      'We use the Poisson distribution model, which analyzes team strength ratings and historical goal-scoring patterns to estimate the probability of different match outcomes. This statistical approach has proven effective for predicting football/soccer match results.',
  },
  {
    id: 'faq-2',
    question: 'What is the accuracy of these predictions?',
    answer:
      'Our Poisson model demonstrates approximately 68% accuracy in predicting match outcomes. This is substantially better than random guessing but acknowledges the inherent unpredictability of sports competitions.',
  },
  {
    id: 'faq-3',
    question: 'How often are the odds updated?',
    answer:
      'Predictions are calculated in real-time based on team strength ratings. As the tournament progresses and team performance data updates, the predictions are recalculated to reflect current conditions.',
  },
  {
    id: 'faq-4',
    question: 'Can I use this for betting?',
    answer:
      'These predictions are for entertainment and educational purposes only. Sports predictions involve risk, and we strongly advise consulting official betting resources and understanding local gambling laws before making any wagers.',
  },
  {
    id: 'faq-5',
    question: 'What factors affect team strength ratings?',
    answer:
      'Team strength is based on FIFA rankings, recent performance, squad quality, and historical World Cup achievements. These ratings are normalized on a 0-100 scale for consistency.',
  },
  {
    id: 'faq-6',
    question: 'How does home advantage factor in?',
    answer:
      'Our model accounts for home advantage by providing a slight statistical boost to the home team&apos;s expected goals. Neutral venue matches (like knockout stages at neutral stadiums) adjust this factor accordingly.',
  },
]

function FAQItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-border py-6">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left transition-colors hover:text-gold"
      >
        <span className="text-lg font-semibold text-text-primary">
          {item.question}
        </span>
        <span className={`text-gold text-2xl transition-transform ${isOpen ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      {isOpen && (
        <div className="mt-4 text-text-secondary leading-relaxed animate-in fade-in">
          {item.answer}
        </div>
      )}
    </div>
  )
}

export function FaqSection() {
  const { ref, isVisible } = useReveal()
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section
      ref={ref}
      className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'all 0.6s ease-out',
      }}
    >
      <div className="mx-auto max-w-3xl">
        <h3 className="font-display text-3xl tracking-wider text-gold sm:text-4xl">
          FREQUENTLY ASKED
        </h3>

        <div className="mt-12 rounded-lg border border-border bg-card p-6 sm:p-8">
          {faqs.map((faq) => (
            <FAQItem
              key={faq.id}
              item={faq}
              isOpen={openId === faq.id}
              onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
