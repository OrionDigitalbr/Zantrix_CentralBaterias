interface LogLevel {
  ERROR: 'error'
  WARN: 'warn'
  INFO: 'info'
  DEBUG: 'debug'
}

interface LogEntry {
  timestamp: string
  level: string
  message: string
  context?: Record<string, any>
  userId?: string
  ip?: string
  userAgent?: string
}

class SecureLogger {
  private readonly LOG_LEVELS: LogLevel = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  }

  private readonly currentLevel: string

  constructor() {
    this.currentLevel = process.env.LOG_LEVEL || 'info'
  }

  private shouldLog(level: string): boolean {
    const levels = Object.values(this.LOG_LEVELS)
    const currentIndex = levels.indexOf(this.currentLevel as any)
    const messageIndex = levels.indexOf(level as any)
    return messageIndex <= currentIndex
  }

  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      // Remover possíveis senhas, tokens, etc.
      return data.replace(/(password|token|key|secret)=[^&\s]+/gi, '$1=***')
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(data)) {
        if (['password', 'token', 'key', 'secret', 'authorization'].includes(key.toLowerCase())) {
          sanitized[key] = '***'
        } else {
          sanitized[key] = this.sanitizeData(value)
        }
      }
      return sanitized
    }
    
    return data
  }

  private formatLog(level: string, message: string, context?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context ? this.sanitizeData(context) : undefined
    }
  }

  private writeLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return

    const logString = JSON.stringify(entry)
    
    // Em produção, enviar para serviço de logging
    if (process.env.NODE_ENV === 'production') {
      // Aqui você pode integrar com serviços como:
      // - Sentry
      // - LogRocket
      // - DataDog
      // - CloudWatch
      console.log(logString)
    } else {
      // Em desenvolvimento, usar console colorido
      const colors = {
        error: '\x1b[31m', // Vermelho
        warn: '\x1b[33m',  // Amarelo
        info: '\x1b[36m',  // Ciano
        debug: '\x1b[35m'  // Magenta
      }
      
      const reset = '\x1b[0m'
      const color = colors[entry.level as keyof typeof colors] || ''
      
      console.log(`${color}[${entry.level.toUpperCase()}]${reset} ${entry.message}`)
      if (entry.context) {
        console.log(`${color}Context:${reset}`, entry.context)
      }
    }
  }

  error(message: string, context?: Record<string, any>): void {
    const entry = this.formatLog(this.LOG_LEVELS.ERROR, message, context)
    this.writeLog(entry)
  }

  warn(message: string, context?: Record<string, any>): void {
    const entry = this.formatLog(this.LOG_LEVELS.WARN, message, context)
    this.writeLog(entry)
  }

  info(message: string, context?: Record<string, any>): void {
    const entry = this.formatLog(this.LOG_LEVELS.INFO, message, context)
    this.writeLog(entry)
  }

  debug(message: string, context?: Record<string, any>): void {
    const entry = this.formatLog(this.LOG_LEVELS.DEBUG, message, context)
    this.writeLog(entry)
  }

  // Logs específicos para auditoria
  logUserAction(userId: string, action: string, details?: Record<string, any>): void {
    this.info(`User action: ${action}`, {
      userId,
      action,
      details: this.sanitizeData(details),
      timestamp: new Date().toISOString()
    })
  }

  logSecurityEvent(event: string, details?: Record<string, any>): void {
    this.warn(`Security event: ${event}`, {
      event,
      details: this.sanitizeData(details),
      timestamp: new Date().toISOString()
    })
  }

  logDatabaseOperation(operation: string, table: string, details?: Record<string, any>): void {
    this.debug(`Database operation: ${operation} on ${table}`, {
      operation,
      table,
      details: this.sanitizeData(details),
      timestamp: new Date().toISOString()
    })
  }

  logAPICall(method: string, endpoint: string, statusCode: number, details?: Record<string, any>): void {
    const level = statusCode >= 400 ? this.LOG_LEVELS.WARN : this.LOG_LEVELS.INFO
    
    const entry = this.formatLog(level, `API ${method} ${endpoint} - ${statusCode}`, {
      method,
      endpoint,
      statusCode,
      details: this.sanitizeData(details),
      timestamp: new Date().toISOString()
    })
    
    this.writeLog(entry)
  }
}

// Instância singleton do logger
export const logger = new SecureLogger()

// Funções de conveniência
export const logError = (message: string, context?: Record<string, any>) => logger.error(message, context)
export const logWarn = (message: string, context?: Record<string, any>) => logger.warn(message, context)
export const logInfo = (message: string, context?: Record<string, any>) => logger.info(message, context)
export const logDebug = (message: string, context?: Record<string, any>) => logger.debug(message, context)
export const logUserAction = (userId: string, action: string, details?: Record<string, any>) => logger.logUserAction(userId, action, details)
export const logSecurityEvent = (event: string, details?: Record<string, any>) => logger.logSecurityEvent(event, details)
export const logDatabaseOperation = (operation: string, table: string, details?: Record<string, any>) => logger.logDatabaseOperation(operation, table, details)
export const logAPICall = (method: string, endpoint: string, statusCode: number, details?: Record<string, any>) => logger.logAPICall(method, endpoint, statusCode, details)
