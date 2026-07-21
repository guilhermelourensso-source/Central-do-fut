# Central de Jogos

Sistema completo de gestão de estatísticas para times de futebol amador — multi-time, multi-usuário, com temporadas independentes, cadastro de jogos, jogadores, goleiros, rankings, hall da fama e PWA instalável.

Stack: **React + TypeScript + Vite + Tailwind CSS + Supabase (Postgres + Auth + Storage + RLS)**.

---

## 1. Criar o projeto no Supabase

1. Crie uma conta e um novo projeto em [supabase.com](https://supabase.com).
2. Em **Project Settings > API**, copie:
   - `Project URL`
   - `anon public key`
3. Vá em **SQL Editor > New query**, cole todo o conteúdo do arquivo
   [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) e execute (**Run**).
   - Isso cria todas as tabelas, os relacionamentos, o bucket de storage `team-assets`,
     as políticas de **Row Level Security** (cada usuário só acessa o próprio time),
     e o gatilho que cria automaticamente o time, a primeira temporada e os registros
     "Convidado"/"Convidados" quando um usuário se cadastra.
4. Em **Authentication > Providers**, confirme que **Email** está habilitado.
5. Em **Authentication > URL Configuration**, adicione a URL onde o app vai rodar
   (ex: `http://localhost:5173` em desenvolvimento, e a URL de produção depois do deploy)
   em **Site URL** e **Redirect URLs**.

## 2. Configurar o projeto localmente

```bash
npm install
cp .env.example .env
```

Edite o `.env` com os dados do seu projeto Supabase:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_AQUI
```

```bash
npm run dev
```

Acesse `http://localhost:5173`, clique em **Criar conta** e cadastre-se. O time,
a primeira temporada e os registros "Convidado" são criados automaticamente.

## 3. Deploy (Vercel, Netlify, etc.)

1. Suba o projeto para um repositório Git.
2. Na Vercel/Netlify, importe o repositório e configure as variáveis de ambiente
   `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Comando de build: `npm run build` — pasta de saída: `dist`.
4. Depois do deploy, adicione a URL de produção em **Authentication > URL Configuration**
   no Supabase (senão os links de confirmação de e-mail e recuperação de senha não funcionam).

## 4. PWA — "instalar" o app

O projeto já vem com `vite-plugin-pwa` configurado (manifest, service worker, ícones).
**Isso só funciona depois de um build de produção servido via HTTPS** (não funciona em
`npm run dev`, nem em ambientes de preview sem HTTPS):

```bash
npm run build
npm run preview
```

- **Android/Chrome**: um botão "Instalar app" aparece automaticamente.
- **iPhone/Safari**: toque em Compartilhar → "Adicionar à Tela de Início".

### Sobre o ícone do app ser a logo do time

Os ícones em `public/icons/icon-192.png` e `icon-512.png` são um placeholder ("CJ").
Como o app é multi-time (cada usuário tem sua própria logo), **não é possível trocar
o ícone do app já instalado dinamicamente pelo navegador** — isso é uma limitação de
todos os PWAs, não apenas deste projeto. Duas formas de lidar com isso:

1. **Simples (já implementado)**: a logo do time aparece no menu lateral, na tela de
   login e como favicon da aba do navegador em tempo real (veja `TeamContext.tsx`).
   O ícone do app instalado usa o ícone padrão do "Central de Jogos".
2. **Avançado (não incluído, requer backend adicional)**: gerar um manifest.json
   dinâmico por usuário via uma Edge Function do Supabase, servido em uma rota tipo
   `/manifest/:teamId.json` com o `icons` apontando para a logo do time — necessário
   apenas se cada time realmente precisar de um ícone de app diferente ao instalar.

## 5. Estrutura do projeto

```
src/
  contexts/       AuthContext, TeamContext, SeasonContext, ToastContext
  hooks/          usePlayers, useGoalkeepers, useMatches, useStats (motor de estatísticas)
  components/
    layout/       Sidebar, AppLayout, SeasonSwitcher, ProtectedRoute
    ui/           Button, Card, Input, Select, Dialog, Badge, Textarea, Label
    charts/       Gráficos (Recharts)
    shared/       StatCard, EmptyState, Loading, PlayerCounterList
  pages/
    auth/         Login, Signup, ForgotPassword, ResetPassword
    Dashboard, CadastrarJogo, Jogos, Jogadores, Goleiros,
    Estatisticas, Ranking, HallDaFama, Temporadas, Configuracoes
supabase/
  migrations/0001_init.sql   Schema completo + RLS + triggers
```

## 6. Regras de negócio já implementadas

- Cada usuário só enxerga os dados do próprio time (RLS no Postgres).
- Jogador "Convidados" e goleiro "Convidado" são criados automaticamente no cadastro
  e **nunca** entram em ranking, hall da fama, dashboard ou estatísticas.
- A temporada ativa (ou a única existente) é selecionada automaticamente ao abrir o
  sistema, sem precisar dar F5.
- Não é possível excluir a temporada marcada como ativa.
- Rankings mostram apenas posição, jogador e a métrica principal (sem coluna de média).
- Hall da Fama: maior artilheiro, mais destaques, melhor goleiro e maior sequência de
  vitórias.
- Dashboard não exibe "próximo jogo" nem gráfico de assistências.

## 7. Limitações conhecidas

- O upload de logo/fotos usa o bucket público `team-assets` do Supabase Storage
  (criado pela migração). Arquivos enviados por qualquer usuário autenticado ficam
  acessíveis publicamente por URL — suficiente para um MVP, mas se for ao ar com
  muitos times, considere políticas de storage mais granulares por pasta/usuário.
- MVP é calculado com uma fórmula simples (gols × 3 + assistências × 2 + destaques × 5).
  Ajuste os pesos em `src/hooks/useStats.ts` se quiser outra fórmula.
