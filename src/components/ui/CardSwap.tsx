'use client'

import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import gsap from 'gsap'

/* ─────────────────────────── TYPES ─────────────────────────── */

export interface CardSwapProps {
  width?: number
  height?: number
  cardDistance?: number
  verticalDistance?: number
  delay?: number
  pauseOnHover?: boolean
  onCardClick?: (idx: number) => void
  skewAmount?: number
  easing?: 'linear' | 'elastic'
  children: ReactNode
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  customClass?: string
}

/* ─────────────────────────── CARD ──────────────────────────── */

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ customClass, children, style, ...rest }, ref) => (
    <div
      ref={ref}
      {...rest}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.10)',
        background: '#0d1117',
        boxShadow:
          '0 32px 72px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
        overflow: 'hidden',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transformStyle: 'preserve-3d',
        ...style,
      }}
      className={
        [customClass ?? '', rest.className ?? ''].filter(Boolean).join(' ') || undefined
      }
    >
      {children}
    </div>
  )
)
Card.displayName = 'Card'

/* ────────────────────────── HELPERS ────────────────────────── */

/**
 * Slot i=0 is the FRONT card (bottom-left of the fan).
 * Each step behind shifts RIGHT by distX and UP by distY.
 *
 *   i=0 → front:  x=0,        y=0,        z=0,    scale=1
 *   i=1 → behind: x=+distX,   y=-distY,   z=-55,  scale=0.97
 *   …
 */
function makeSlot(i: number, distX: number, distY: number, total: number) {
  return {
    x:      i * distX,
    y:      -(i * distY),    // negative → move UP
    z:      -(i * 55),
    zIndex: total - i,
    scale:  1 - i * 0.028,
  }
}

/* ──────────────────────────── MAIN ─────────────────────────── */

const CardSwap: React.FC<CardSwapProps> = ({
  width            = 300,
  height           = 380,
  cardDistance     = 28,
  verticalDistance = 14,
  delay            = 3200,
  pauseOnHover     = true,
  onCardClick,
  skewAmount       = 3,
  easing           = 'elastic',
  children,
}) => {
  const childArr = useMemo(
    () => Children.toArray(children) as ReactElement<CardProps>[],
    [children]
  )

  const refs      = useRef<(HTMLDivElement | null)[]>([])
  const order     = useRef<number[]>([])
  const tlRef     = useRef<gsap.core.Timeline | null>(null)
  const ivRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const isPaused  = useRef(false)
  const container = useRef<HTMLDivElement>(null)
  const cbRef     = useRef(onCardClick)

  useEffect(() => { cbRef.current = onCardClick }, [onCardClick])

  useEffect(() => {
    if (!childArr.length) return

    const total   = childArr.length
    order.current = childArr.map((_, i) => i)

    // Place cards at initial resting slots
    refs.current.forEach((el, i) => {
      if (!el) return
      const s = makeSlot(i, cardDistance, verticalDistance, total)
      gsap.set(el, {
        x:               s.x,
        y:               s.y,
        z:               s.z,
        scale:           s.scale,
        skewY:           i === 0 ? 0 : -skewAmount,
        zIndex:          s.zIndex,
        transformOrigin: '50% 50%',
        force3D:         true,
        opacity:         1,
      })
    })

    const isElastic  = easing === 'elastic'
    const durDrop    = 0.45
    const durMove    = isElastic ? 0.68 : 0.44
    const durReturn  = isElastic ? 0.68 : 0.44
    const moveEase   = isElastic ? 'elastic.out(0.62, 0.72)' : 'power2.inOut'
    const retEase    = isElastic ? 'elastic.out(0.62, 0.72)' : 'power2.out'

    const swap = () => {
      if (isPaused.current || order.current.length < 2) return

      const [frontIdx, ...restIdxs] = order.current
      const elFront = refs.current[frontIdx]
      if (!elFront) return

      const tl = gsap.timeline({
        onComplete: () => { order.current = [...restIdxs, frontIdx] },
      })
      tlRef.current = tl

      // 1. Front card drops DOWN off screen
      tl.to(elFront, {
        y:        '+=500',
        z:        0,
        scale:    0.88,
        skewY:    0,
        opacity:  0,
        duration: durDrop,
        ease:     'power3.in',
      })

      // 2. Remaining cards each move one slot forward
      tl.addLabel('promote', `-=${durDrop * 0.68}`)
      tl.call(() => { cbRef.current?.(restIdxs[0]) }, [], 'promote')

      restIdxs.forEach((idx, i) => {
        const el   = refs.current[idx]
        if (!el) return
        const slot = makeSlot(i, cardDistance, verticalDistance, total)
        tl.set(el, { zIndex: slot.zIndex }, 'promote')
        tl.to(el, {
          x:        slot.x,
          y:        slot.y,
          z:        slot.z,
          scale:    slot.scale,
          skewY:    i === 0 ? 0 : -skewAmount,
          duration: durMove,
          ease:     moveEase,
        }, `promote+=${i * 0.05}`)
      })

      // 3. Snap dropped card to back slot (below screen), spring it up
      const back       = makeSlot(total - 1, cardDistance, verticalDistance, total)
      const snapAt     = `promote+=${durMove * 0.52}`
      const animateAt  = `promote+=${durMove * 0.52 + 0.03}`

      tl.call(() => {
        gsap.set(elFront, {
          zIndex:  back.zIndex,
          x:       back.x,
          y:       back.y + 520,   // parked below screen
          z:       back.z,
          scale:   back.scale,
          skewY:   -skewAmount,
          opacity: 1,
        })
      }, [], snapAt)

      tl.to(elFront, {
        y:        back.y,
        duration: durReturn,
        ease:     retEase,
      }, animateAt)
    }

    swap()
    ivRef.current = setInterval(swap, delay)

    if (pauseOnHover && container.current) {
      const node = container.current
      const pause = () => {
        isPaused.current = true
        tlRef.current?.pause()
        clearInterval(ivRef.current!)
      }
      const resume = () => {
        isPaused.current = false
        tlRef.current?.play()
        ivRef.current = setInterval(swap, delay)
      }
      node.addEventListener('mouseenter', pause)
      node.addEventListener('mouseleave', resume)
      return () => {
        node.removeEventListener('mouseenter', pause)
        node.removeEventListener('mouseleave', resume)
        clearInterval(ivRef.current!)
        tlRef.current?.kill()
      }
    }

    return () => {
      clearInterval(ivRef.current!)
      tlRef.current?.kill()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childArr.length, cardDistance, verticalDistance, delay, skewAmount, easing, pauseOnHover])

  const rendered = childArr.map((child, i) => {
    if (!isValidElement(child)) return null
    return cloneElement(
      child as ReactElement<CardProps & { ref?: React.Ref<HTMLDivElement | null> }>,
      {
        key: i,
        ref: (el: HTMLDivElement | null) => { refs.current[i] = el },
        style: { width, height, ...(child.props.style ?? {}) },
      }
    )
  })

  /*
    The outer div owns perspective.
    The inner div is EXACTLY card-sized — it's the anchor point.
    GSAP x/y offsets are applied from (0,0) of this inner div,
    which means card[0] sits flush at top-left, and subsequent
    cards fan right/up from there.

    overflow: visible on both divs so the fan can bleed outside.
  */
  return (
    <div
      ref={container}
      style={{
        position:   'relative',
        width:      '100%',
        height:     '100%',
        overflow:   'visible',
        perspective: '900px',
        perspectiveOrigin: '20% 60%',
      }}
    >
      {/* Anchor: positioned at bottom-left of the container */}
      <div
        style={{
          position: 'absolute',
          bottom:   0,
          left:     0,
          width,
          height,
          overflow: 'visible',
        }}
      >
        {rendered}
      </div>
    </div>
  )
}

export default CardSwap