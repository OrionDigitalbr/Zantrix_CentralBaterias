# Central - Sistema de Gestão Zantrix

Sistema completo de gestão empresarial desenvolvido para a Zantrix, incluindo controle de produtos, usuários, unidades e funcionalidades administrativas.

## 🚀 Funcionalidades

### Frontend
- **Interface Responsiva**: Design moderno e adaptável para todos os dispositivos
- **Dashboard Administrativo**: Painel completo de controle e análise
- **Sistema de Produtos**: Catálogo, categorias e gestão de estoque
- **Gestão de Usuários**: Controle de acesso e perfis
- **Sistema de Unidades**: Gerenciamento de filiais e localizações
- **Slides e Marketing**: Sistema de banners e promoções

### Backend
- **API REST**: Endpoints para todas as funcionalidades
- **Autenticação**: Sistema seguro de login e autorização
- **Banco de Dados**: PostgreSQL com Supabase
- **Storage**: Sistema de upload e gestão de imagens
- **Notificações**: Sistema de alertas em tempo real

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL (Supabase)
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage
- **Deploy**: Vercel (recomendado)

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Git

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone [URL_DO_REPOSITORIO]
cd Central
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Configure as variáveis de ambiente**
```bash
cp env-example.txt .env.local
```

Edite o arquivo `.env.local` com suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
```

4. **Execute o projeto**
```bash
npm run dev
# ou
yarn dev
```

O projeto estará disponível em `http://localhost:3000`

## 🗄️ Configuração do Banco de Dados

1. Acesse o painel do Supabase
2. Execute os scripts SQL em `supabase/scripts/setup/`
3. Configure as políticas RLS (Row Level Security)
4. Crie os buckets de storage necessários

## 📁 Estrutura do Projeto

```
Central/
├── app/                    # Páginas Next.js 14 (App Router)
│   ├── admin/             # Painel administrativo
│   ├── api/               # API Routes
│   └── ...                # Outras páginas
├── components/             # Componentes React reutilizáveis
│   ├── admin/             # Componentes do painel admin
│   └── ui/                # Componentes de UI base
├── lib/                    # Utilitários e configurações
├── contexts/               # Contextos React
├── hooks/                  # Hooks customizados
├── types/                  # Definições de tipos TypeScript
└── supabase/               # Scripts e migrações do banco
```

## 🔐 Configuração de Segurança

- Todas as rotas administrativas são protegidas
- Políticas RLS configuradas no Supabase
- Validação de entrada em todas as APIs
- Sistema de roles e permissões

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras plataformas
- Netlify
- Railway
- DigitalOcean App Platform

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Iniciar produção
npm run lint         # Verificar código
npm run type-check   # Verificar tipos TypeScript
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e de uso exclusivo da Zantrix.

## 📞 Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento da Zantrix.

---

**Desenvolvido com ❤️ pela equipe Zantrix**
