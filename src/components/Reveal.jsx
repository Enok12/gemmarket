'use client'

import { useEffect, useRef } from 'react'

/**
 * Fades its content in the first time it scrolls into view.
 *
 * Content that is already on screen at load is left alone (above-the-fold
 * entrances are plain CSS classes, which need no JS), and the hidden state is
 * only applied to content that is below the fold, so a failed script or
 * reduced-motion preference never leaves anything invisible.
 *
 * `stagger` animates the direct children one after another instead of the
 * wrapper as a whole (handy for card grids).
 */
export default function Reveal({ children, className = '', delay = 0, stagger = false }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (el.getBoundingClientRect().top < window.innerHeight) return

    el.classList.add('reveal-hidden')
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.classList.remove('reveal-hidden')
        el.classList.add('reveal-in')
        observer.disconnect()
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`${stagger ? 'reveal-stagger ' : ''}${className}`.trim()}
      style={delay ? { '--delay': `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
