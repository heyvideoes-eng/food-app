'use client'

import { useEffect, useState } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  
  const springConfig = { damping: 25, stiffness: 250 }
  const x = useSpring(cursorX, springConfig)
  const y = useSpring(cursorY, springConfig)

  useEffect(() => {
    if (!mounted) return
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      
      if (!isVisible) setIsVisible(true)
      
      const target = e.target as HTMLElement
      const isClickable = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') || 
        target.closest('a') ||
        window.getComputedStyle(target).cursor === 'pointer'
        
      setIsHovered(!!isClickable)
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener('mousemove', moveCursor)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [cursorX, cursorY, isVisible, mounted])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] mix-blend-difference">
      <motion.div
        className="w-8 h-8 rounded-full border border-white flex items-center justify-center"
        style={{
          x: x,
          y: y,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          scale: isHovered ? 2.5 : 1,
          backgroundColor: isHovered ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0)',
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300, mass: 0.5 }}
      />
      <motion.div
        className="fixed w-1.5 h-1.5 bg-white rounded-full"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
        }}
      />
    </div>
  )
}
