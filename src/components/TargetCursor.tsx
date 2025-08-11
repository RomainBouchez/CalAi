'use client'

import React, { useEffect, useState } from 'react'

interface TargetCursorProps {
  spinDuration?: number
  hideDefaultCursor?: boolean
  className?: string
}

export default function TargetCursor({ 
  spinDuration = 2, 
  hideDefaultCursor = true,
  className = ''
}: TargetCursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    // Add global styles
    if (hideDefaultCursor) {
      document.body.style.cursor = 'none'
      const style = document.createElement('style')
      style.textContent = '* { cursor: none !important; }'
      document.head.appendChild(style)
      
      return () => {
        document.body.style.cursor = ''
        document.head.removeChild(style)
      }
    }
  }, [hideDefaultCursor])

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('cursor-target')) {
        setIsHovering(true)
      }
    }

    const handleMouseLeave = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('cursor-target')) {
        setIsHovering(false)
      }
    }

    document.addEventListener('mousemove', updateCursor)
    document.addEventListener('mouseenter', handleMouseEnter, true)
    document.addEventListener('mouseleave', handleMouseLeave, true)

    return () => {
      document.removeEventListener('mousemove', updateCursor)
      document.removeEventListener('mouseenter', handleMouseEnter, true)
      document.removeEventListener('mouseleave', handleMouseLeave, true)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={`fixed pointer-events-none z-50 transition-all duration-200 ${className}`}
      style={{
        left: position.x - 16,
        top: position.y - 16,
        transform: `scale(${isHovering ? 1.5 : 1})`,
      }}
    >
      <div
        className="w-8 h-8 border-2 border-blue-500 rounded-full animate-spin"
        style={{
          animationDuration: `${spinDuration}s`,
        }}
      >
        <div className="w-full h-full border-2 border-transparent border-t-blue-300 rounded-full" />
      </div>
    </div>
  )
}