'use client'

import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'

interface PasswordStrengthProps {
  password: string
  onStrengthChange?: (strength: number, isValid: boolean) => void
}

interface PasswordCriteria {
  label: string
  test: (password: string) => boolean
}

const criteria: PasswordCriteria[] = [
  {
    label: 'Pelo menos 8 caracteres',
    test: (password) => password.length >= 8
  },
  {
    label: 'Pelo menos uma letra maiúscula',
    test: (password) => /[A-Z]/.test(password)
  },
  {
    label: 'Pelo menos uma letra minúscula',
    test: (password) => /[a-z]/.test(password)
  },
  {
    label: 'Pelo menos um número',
    test: (password) => /\d/.test(password)
  },
  {
    label: 'Pelo menos um caractere especial',
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
]

export function PasswordStrength({ password, onStrengthChange }: PasswordStrengthProps) {
  const [strength, setStrength] = useState(0)
  const [passedCriteria, setPassedCriteria] = useState<boolean[]>([])

  useEffect(() => {
    const passed = criteria.map(criterion => criterion.test(password))
    const strengthScore = passed.filter(Boolean).length
    const isValid = strengthScore >= 4 // Pelo menos 4 dos 5 critérios

    setPassedCriteria(passed)
    setStrength(strengthScore)
    
    if (onStrengthChange) {
      onStrengthChange(strengthScore, isValid)
    }
  }, [password, onStrengthChange])

  const getStrengthLabel = () => {
    if (strength === 0) return { label: '', color: '' }
    if (strength <= 2) return { label: 'Fraca', color: 'text-red-600' }
    if (strength <= 3) return { label: 'Média', color: 'text-yellow-600' }
    if (strength <= 4) return { label: 'Boa', color: 'text-blue-600' }
    return { label: 'Forte', color: 'text-green-600' }
  }

  const getStrengthBarColor = () => {
    if (strength <= 2) return 'bg-red-500'
    if (strength <= 3) return 'bg-yellow-500'
    if (strength <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  if (!password) return null

  const { label, color } = getStrengthLabel()

  return (
    <div className="mt-2 space-y-2">
      {/* Barra de Força */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Força da senha:</span>
          <span className={`text-xs font-medium ${color}`}>{label}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthBarColor()}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Lista de Critérios */}
      <div className="space-y-1">
        {criteria.map((criterion, index) => (
          <div key={index} className="flex items-center space-x-2">
            {passedCriteria[index] ? (
              <Check size={12} className="text-green-500" />
            ) : (
              <X size={12} className="text-gray-400" />
            )}
            <span
              className={`text-xs ${
                passedCriteria[index] ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {criterion.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
