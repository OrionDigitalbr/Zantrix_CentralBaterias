'use client'

import { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import { Check, X, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PasswordStrengthProps {
  password: string
  onPasswordChange: (password: string) => void
  onValidChange: (isValid: boolean) => void
  label?: string
  placeholder?: string
  required?: boolean
}

interface PasswordCriteria {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}

export function PasswordStrength({
  password,
  onPasswordChange,
  onValidChange,
  label = "Nova Senha",
  placeholder = "Digite sua nova senha",
  required = true
}: PasswordStrengthProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [criteria, setCriteria] = useState<PasswordCriteria>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  })

  // Calcular força da senha
  const calculateStrength = (pwd: string): number => {
    let score = 0
    
    if (pwd.length >= 8) score += 20
    if (pwd.length >= 12) score += 10
    if (/[A-Z]/.test(pwd)) score += 20
    if (/[a-z]/.test(pwd)) score += 20
    if (/[0-9]/.test(pwd)) score += 15
    if (/[^A-Za-z0-9]/.test(pwd)) score += 15
    
    return Math.min(score, 100)
  }

  // Verificar critérios
  useEffect(() => {
    const newCriteria: PasswordCriteria = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password)
    }

    setCriteria(newCriteria)

    // Verificar se todos os critérios são atendidos
    const isValid = Object.values(newCriteria).every(Boolean)
    onValidChange(isValid)
  }, [password, onValidChange])

  const strength = calculateStrength(password)
  
  const getStrengthColor = (strength: number): string => {
    if (strength < 30) return 'bg-red-500'
    if (strength < 60) return 'bg-yellow-500'
    if (strength < 80) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getStrengthText = (strength: number): string => {
    if (strength < 30) return 'Muito Fraca'
    if (strength < 60) return 'Fraca'
    if (strength < 80) return 'Boa'
    return 'Forte'
  }

  const criteriaList = [
    { key: 'minLength', text: 'Pelo menos 8 caracteres', met: criteria.minLength },
    { key: 'hasUppercase', text: 'Pelo menos 1 letra maiúscula', met: criteria.hasUppercase },
    { key: 'hasLowercase', text: 'Pelo menos 1 letra minúscula', met: criteria.hasLowercase },
    { key: 'hasNumber', text: 'Pelo menos 1 número', met: criteria.hasNumber },
    { key: 'hasSpecialChar', text: 'Pelo menos 1 caractere especial (!@#$%^&*)', met: criteria.hasSpecialChar }
  ]

  return (
    <div className="space-y-4">
      {/* Campo de Senha */}
      <div className="space-y-2">
        <Label htmlFor="password">{label}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
      </div>

      {/* Barra de Força da Senha */}
      {password && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Força da senha:</span>
            <span className={`text-sm font-medium ${
              strength < 30 ? 'text-red-600' :
              strength < 60 ? 'text-yellow-600' :
              strength < 80 ? 'text-blue-600' : 'text-green-600'
            }`}>
              {getStrengthText(strength)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(strength)}`}
              style={{ width: `${strength}%` }}
            />
          </div>
        </div>
      )}

      {/* Critérios de Validação */}
      {password && (
        <div className="space-y-2">
          <span className="text-sm font-medium">Critérios de segurança:</span>
          <div className="space-y-1">
            {criteriaList.map((criterion) => (
              <div key={criterion.key} className="flex items-center space-x-2">
                {criterion.met ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${
                  criterion.met ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {criterion.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
