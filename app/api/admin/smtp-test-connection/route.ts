import { NextRequest, NextResponse } from "next/server"
import * as nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { host, port, user, pass, encryption } = body

    // Validar campos obrigatórios
    if (!host || !port || !user || !pass) {
      return NextResponse.json(
        {
          success: false,
          message: "Todos os campos são obrigatórios: host, port, user, pass"
        },
        { status: 400 }
      )
    }

    // Configurar transporter baseado no tipo de criptografia
    let transporterConfig: any = {
      host: host,
      port: parseInt(port),
      auth: {
        user: user,
        pass: pass,
      },
    }

    // Configurar criptografia
    if (encryption === 'ssl') {
      transporterConfig.secure = true // SSL/TLS
    } else if (encryption === 'tls') {
      transporterConfig.secure = false
      transporterConfig.requireTLS = true
    } else {
      transporterConfig.secure = false
    }

    console.log('🔧 Configuração SMTP:', {
      host,
      port: parseInt(port),
      user,
      encryption,
      secure: transporterConfig.secure
    })

    // Criar transporter com logging detalhado
    const transporter = nodemailer.createTransport({
      ...transporterConfig,
      logger: true, // Habilita logging detalhado
      debug: true, // Habilita debug para Nodemailer
    })

    console.log('🔧 Testando conexão SMTP...')

    // Testar conexão
    await transporter.verify()

    console.log('✅ Conexão SMTP bem-sucedida!')

    return NextResponse.json({
      success: true,
      message: "Conexão SMTP bem-sucedida. Pronto para enviar e-mails de teste."
    })

  } catch (error: any) {
    console.error('❌ Erro na conexão SMTP:', error)

    let errorMessage = "Erro desconhecido na conexão SMTP"

    if (error.code === 'EAUTH') {
      errorMessage = "Falha na autenticação. Verifique usuário e senha."
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = "Conexão recusada. Verifique host e porta."
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = "Timeout na conexão. Verifique host e porta."
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      {
        success: false,
        message: `Falha na conexão SMTP: ${errorMessage}`,
        errorDetails: error.message || error.toString()
      },
      { status: 500 }
    )
  }
}
