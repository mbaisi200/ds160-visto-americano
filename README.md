# DS-160 Visto Americano

Sistema para preenchimento e gestão do formulário DS-160 para visto americano. Clientes preenchem o formulário online e administradores gerenciam CPFs autorizados e processam as solicitações.

## Funcionalidades

### Cliente
- Login via CPF com senha padrão
- Cadastro com validação de CPF autorizado
- Formulário DS-160 completo com todas as seções:
  - Informações Pessoais, Contato, Passaporte, Viagem, Vistos Anteriores
  - Família, Trabalho, Educação, Viagens Internacionais, I-20
- Salvamento automático de rascunho
- Revisão e confirmação de envio
- Geração de arquivo TXT com todos os dados

### Admin
- Painel com visão geral de formulários (rascunho/pendente/processado)
- Gestão de CPFs autorizados (autorizar, bloquear, editar, remover)
- Exibição do nome do cliente ao lado do CPF
- Visualização completa de formulários
- Marcação como processado (bloqueia acesso do cliente)
- Geração de TXT e PDF dos formulários
- Exportação de dados
- Gestão de senhas de usuários

## Tecnologias

- **Next.js 16** (App Router, Turbopack)
- **TypeScript 5**
- **Tailwind CSS 4** + shadcn/ui
- **Firebase** (Authentication, Firestore)
- **Prisma** (SQLite - dados auxiliares)

## Requisitos

- Node.js >= 20.9.0

## Setup

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start
```

## Estrutura

```
src/
  app/
    admin/          - Painel administrativo
    admin-setup/    - Configuração inicial do admin
    formulario/     - Formulário DS-160 do cliente
    login/          - Login por CPF
    cadastro/       - Cadastro de novo usuário
    api/            - API routes (admin, setup)
  components/       - Componentes React reutilizáveis
  contexts/         - Contextos (Auth)
  lib/              - Utilitários (Firebase, masks)
```
