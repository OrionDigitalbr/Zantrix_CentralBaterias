'use client'

import { useState, useEffect, useRef } from 'react'

interface EmailSuggestionsProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  className?: string
  placeholder?: string
  required?: boolean
}

const emailProviders = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'yahoo.com.br',
  'uol.com.br',
  'bol.com.br',
  'terra.com.br',
  'ig.com.br',
  'globo.com',
  'r7.com',
  'live.com',
  'icloud.com',
  'protonmail.com'
]

export function EmailSuggestions({
  value,
  onChange,
  onBlur,
  className = '',
  placeholder = '',
  required = false
}: EmailSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value.includes('@') && !value.includes('.')) {
      const [localPart, domain] = value.split('@')
      if (domain) {
        const filteredProviders = emailProviders.filter(provider =>
          provider.toLowerCase().startsWith(domain.toLowerCase())
        )
        const newSuggestions = filteredProviders.map(provider => `${localPart}@${provider}`)
        setSuggestions(newSuggestions.slice(0, 5)) // Mostrar apenas 5 sugestões
        setShowSuggestions(newSuggestions.length > 0)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
    setSelectedIndex(-1)
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          onChange(suggestions[selectedIndex])
          setShowSuggestions(false)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleBlur = (e: React.FocusEvent) => {
    // Delay para permitir clique nas sugestões
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
        if (onBlur) onBlur()
      }
    }, 150)
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={className}
        placeholder={placeholder}
        required={required}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                index === selectedIndex ? 'bg-gray-100' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
