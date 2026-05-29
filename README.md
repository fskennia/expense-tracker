# Expense Tracker - Análises Financeiras

Aplicação full-stack para rastreamento e análise de despesas com IA.

## 📁 Estrutura do Projeto

```
expense-tracker/
├── frontend/          # React + Vite (Deploy: Vercel)
├── backend/           # Node.js/Express (Deploy: Railway)
├── .gitignore
└── README.md
```

## 🚀 Deployment

### Backend (Railway)
1. Faça login em [railway.app](https://railway.app)
2. Crie um novo projeto
3. Conecte este repositório
4. Aponte para a pasta `backend`
5. Adicione variáveis de ambiente:
   - `ANTHROPIC_API_KEY`: Sua chave da API Anthropic
   - `FRONTEND_URL`: URL do seu frontend no Vercel

### Frontend (Vercel)
1. Faça login em [vercel.com](https://vercel.com)
2. Crie um novo projeto
3. Conecte este repositório
4. Aponte para a pasta `frontend`
5. Adicione variáveis de ambiente:
   - `VITE_API_URL`: URL do seu backend no Railway

## ⚙️ Configuração Local

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📝 Variáveis de Ambiente

⚠️ **IMPORTANTE**: Nunca faça commit do arquivo `.env`. Ele já está no `.gitignore`.

### Backend (.env)
```
ANTHROPIC_API_KEY=sua_chave_aqui
FRONTEND_URL=https://seu-frontend.vercel.app
PORT=3000
```

### Frontend (.env.local)
```
VITE_API_URL=https://seu-backend.railway.app
```

## 📦 Stack Tecnológico

- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express
- **IA**: Anthropic API
- **Database**: (a configurar)
- **Deployment**: Vercel (frontend) + Railway (backend)

## 📄 Licença

MIT
