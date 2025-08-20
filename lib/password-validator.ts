import { zxcvbn } from 'zxcvbn'

export interface PasswordValidationResult {
  isValid: boolean
  score: number
  feedback: string[]
  suggestions: string[]
  warnings: string[]
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxLength: number
  preventCommonPasswords: boolean
  preventPersonalInfo: boolean
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128,
  preventCommonPasswords: true,
  preventPersonalInfo: true
}

export class PasswordValidator {
  private policy: PasswordPolicy

  constructor(policy: Partial<PasswordPolicy> = {}) {
    this.policy = { ...DEFAULT_PASSWORD_POLICY, ...policy }
  }

  validate(password: string, userInfo?: { email?: string; name?: string }): PasswordValidationResult {
    const result: PasswordValidationResult = {
      isValid: true,
      score: 0,
      feedback: [],
      suggestions: [],
      warnings: []
    }

    // Validações básicas
    if (!password || typeof password !== 'string') {
      result.isValid = false
      result.feedback.push('Senha é obrigatória')
      return result
    }

    // Verificar comprimento mínimo
    if (password.length < this.policy.minLength) {
      result.isValid = false
      result.feedback.push(`Senha deve ter pelo menos ${this.policy.minLength} caracteres`)
    }

    // Verificar comprimento máximo
    if (password.length > this.policy.maxLength) {
      result.isValid = false
      result.feedback.push(`Senha deve ter no máximo ${this.policy.maxLength} caracteres`)
    }

    // Verificar caracteres maiúsculos
    if (this.policy.requireUppercase && !/[A-Z]/.test(password)) {
      result.isValid = false
      result.feedback.push('Senha deve conter pelo menos uma letra maiúscula')
    }

    // Verificar caracteres minúsculos
    if (this.policy.requireLowercase && !/[a-z]/.test(password)) {
      result.isValid = false
      result.feedback.push('Senha deve conter pelo menos uma letra minúscula')
    }

    // Verificar números
    if (this.policy.requireNumbers && !/\d/.test(password)) {
      result.isValid = false
      result.feedback.push('Senha deve conter pelo menos um número')
    }

    // Verificar caracteres especiais
    if (this.policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      result.isValid = false
      result.feedback.push('Senha deve conter pelo menos um caractere especial')
    }

    // Verificar se não contém informações pessoais
    if (this.policy.preventPersonalInfo && userInfo) {
      const personalInfo = [
        userInfo.email?.split('@')[0],
        userInfo.name?.toLowerCase(),
        userInfo.name?.split(' ')[0]?.toLowerCase(),
        userInfo.name?.split(' ')[1]?.toLowerCase()
      ].filter(Boolean)

      for (const info of personalInfo) {
        if (info && password.toLowerCase().includes(info.toLowerCase())) {
          result.isValid = false
          result.feedback.push('Senha não deve conter informações pessoais')
          break
        }
      }
    }

    // Análise de força com zxcvbn
    const zxcvbnResult = zxcvbn(password, userInfo ? [userInfo.email, userInfo.name].filter(Boolean) : [])
    result.score = zxcvbnResult.score

    // Adicionar feedback do zxcvbn
    if (zxcvbnResult.feedback.warning) {
      result.warnings.push(zxcvbnResult.feedback.warning)
    }

    if (zxcvbnResult.feedback.suggestions.length > 0) {
      result.suggestions.push(...zxcvbnResult.feedback.suggestions)
    }

    // Verificar se a senha é muito fraca
    if (zxcvbnResult.score < 2) {
      result.isValid = false
      result.feedback.push('Senha muito fraca. Use uma combinação mais complexa')
    }

    // Verificar se é uma senha comum
    if (this.policy.preventCommonPasswords && zxcvbnResult.score === 0) {
      result.isValid = false
      result.feedback.push('Esta senha é muito comum. Escolha uma senha mais única')
    }

    return result
  }

  // Gerar senha aleatória segura
  generateSecurePassword(length: number = 16): string {
    const charset = {
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numbers: '0123456789',
      special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    }

    let password = ''
    const allChars = charset.lowercase + charset.uppercase + charset.numbers + charset.special

    // Garantir pelo menos um de cada tipo
    password += this.getRandomChar(charset.lowercase)
    password += this.getRandomChar(charset.uppercase)
    password += this.getRandomChar(charset.numbers)
    password += this.getRandomChar(charset.special)

    // Preencher o resto aleatoriamente
    for (let i = 4; i < length; i++) {
      password += this.getRandomChar(allChars)
    }

    // Embaralhar a senha
    return this.shuffleString(password)
  }

  private getRandomChar(charset: string): string {
    return charset.charAt(Math.floor(Math.random() * charset.length))
  }

  private shuffleString(str: string): string {
    const arr = str.split('')
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr.join('')
  }

  // Verificar se a senha foi comprometida (usando API externa)
  async checkPasswordBreach(password: string): Promise<boolean> {
    try {
      // Implementar verificação com HaveIBeenPwned ou similar
      // Por enquanto, retorna false (não comprometida)
      return false
    } catch (error) {
      console.error('Erro ao verificar senha comprometida:', error)
      return false
    }
  }
}

// Instância padrão
export const passwordValidator = new PasswordValidator()

// Funções de conveniência
export const validatePassword = (password: string, userInfo?: { email?: string; name?: string }) => 
  passwordValidator.validate(password, userInfo)

export const generatePassword = (length?: number) => 
  passwordValidator.generateSecurePassword(length)
