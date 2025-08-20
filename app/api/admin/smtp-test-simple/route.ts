import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { host, port, user, pass, encryption, testEmail } = await request.json()

    console.log('📧 Iniciando teste SMTP simples (máxima entregabilidade)...')
    console.log('📧 E-mail de destino:', testEmail)
    console.log('🔧 Configurações SMTP:', { host, port, user, encryption })

    // Configuração mínima do transporter para máxima compatibilidade
    const transporterConfig = {
      host: host,
      port: parseInt(port),
      secure: encryption === 'ssl',
      auth: {
        user: user,
        pass: pass,
      },
      // Configurações mínimas para evitar problemas
      tls: {
        rejectUnauthorized: false
      }
    }

    console.log('🔧 Configuração do transporter (simples):', transporterConfig)

    const transporter = nodemailer.createTransport(transporterConfig)

    // E-mail com configuração mínima e máxima entregabilidade
    const mailOptions = {
      from: user, // Usar apenas o e-mail autenticado, sem nome personalizado
      to: testEmail,
      subject: 'Teste SMTP Sistema Zantrix',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">✅ Teste SMTP Funcionando</h2>
          <p>Este e-mail confirma que a configuração SMTP está funcionando corretamente.</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            Enviado em: ${new Date().toLocaleString('pt-BR')}<br>
            Sistema: Zantrix AI
          </p>
        </div>
      `,
      text: `✅ Teste SMTP Funcionando

Este e-mail confirma que a configuração SMTP está funcionando corretamente.

Enviado em: ${new Date().toLocaleString('pt-BR')}
Sistema: Zantrix AI`
    }

    console.log('📧 Enviando e-mail com configuração simples...')
    
    const info = await transporter.sendMail(mailOptions)
    
    console.log('✅ E-mail enviado com sucesso!')
    console.log('📧 Response:', info.response)
    console.log('📧 Message ID:', info.messageId)

    return NextResponse.json({
      success: true,
      message: `E-mail de teste simples enviado com sucesso para ${testEmail}. Message ID: ${info.messageId}`,
      messageId: info.messageId,
      response: info.response
    })

  } catch (error: any) {
    console.error('❌ Erro no teste SMTP simples:', error)
    return NextResponse.json({
      success: false,
      message: `Erro no teste simples: ${error.message}`
    }, { status: 500 })
  }
}
