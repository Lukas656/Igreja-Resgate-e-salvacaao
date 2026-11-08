# Ministério Resgate & Salvação

Landing page institucional responsiva desenvolvida com Next.js App Router, TypeScript, Tailwind CSS e Lucide React. Contém apresentação do ministério, horários dos cultos, contatos configuráveis, redes sociais e biblioteca integrada à YouTube Data API v3.

## Requisitos

- Node.js 20.9 ou superior.
- pnpm 11.25.0 (versão declarada em `package.json`).

## Instalação e execução local

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Abra `http://localhost:3000`. Para verificar tipos e criar build de produção:

```bash
pnpm typecheck
pnpm build
pnpm start
```

## YouTube Data API v3

1. Crie/seleciona um projeto no Google Cloud e habilite a YouTube Data API v3.
2. Crie uma API key e restrinja-a à YouTube Data API v3. Mantenha-a somente no ambiente de servidor.
3. Configure `YOUTUBE_API_KEY` no ambiente seguro do servidor. Os IDs públicos podem ser definidos pelas variáveis `YOUTUBE_CHANNEL_ID`, `YOUTUBE_PLAYLIST_SERMONS`, `YOUTUBE_PLAYLIST_SERVICES` e `YOUTUBE_PLAYLIST_EVENTS` ou pelos campos `ministryConfig.youtube` em `lib/config.ts`. No Manus, cadastre a chave no cofre de segredos, nunca em `NEXT_PUBLIC_*`, no chat ou no código.
4. A rota `/api/youtube` lê a chave exclusivamente no servidor, recupera uploads do canal e itens das playlists, e aplica cache curto para reduzir chamadas/quota.

O filtro “Todos” usa a playlist de uploads do canal. Os filtros “Pregações”, “Cultos” e “Eventos” usam os IDs de playlist próprios. A chave, o canal e a playlist “Cultos” fornecida já estão configurados; inclua os IDs oficiais de Pregações e Eventos em `lib/config.ts` para ativar essas categorias. Sem os dados necessários para cada categoria, a interface informa que ela aguarda configuração; não são exibidos vídeos fictícios.

## Dados oficiais do ministério

Edite `lib/config.ts` para informar IDs adicionais de playlists; links de Instagram/Facebook; endereço, telefone/WhatsApp e URLs de Google Maps; e o banner oficial de domingo quando disponível. Campos ainda não preenchidos são intencionais: não foram inventados. A logo oficial R&S foi aplicada; o horário “Culto de Domingo — 09:00” e o versículo de 1 Samuel 7:12 seguem a especificação entregue.

A origem de produção pode ser configurada com `NEXT_PUBLIC_SITE_URL` (HTTPS). Até que um domínio real seja definido, o site omite URLs canônicas absolutas e não inventa o domínio para Open Graph/sitemap.

## Estrutura

- `app/`: página, metadados, manifesto de rotas e endpoint interno do YouTube.
- `components/`: cabeçalho, hero, conteúdo institucional, cultos, vídeos, redes, contato e rodapé.
- `lib/config.ts`: identidade e dados ajustáveis do ministério.
- `lib/youtube-types.ts`: tipos compartilhados de vídeos/categorias.
- `public/`: favicon e manifesto estático das rotas.


## Painel administrativo: autenticação por MongoDB

O acesso a `/admin` usa e-mail/senha validados no banco `auth`, coleção `auth` por padrão, conforme a estrutura existente no Compass. Não existe rota de cadastro público. A variável `ADMIN_EMAIL` limita o login à conta administrativa autorizada; o documento no banco precisa ter `email`, `passwordHash` (bcrypt), `role: "admin"` e `active: true`. O campo legado `senha` em texto puro não é usado.

Configure `MONGODB_URI`, opcionalmente `MONGODB_DB_NAME` (banco que contém `site_content`), `ADMIN_DB_NAME` (padrão `auth`), `ADMIN_USERS_COLLECTION` (padrão `auth`), `ADMIN_EMAIL` e `ADMIN_SESSION_SECRET` no `.env.local` e na Vercel. O banco administrativo fica separado do conteúdo mesmo quando usam o mesmo cluster/URI. Gere a chave de sessão com `openssl rand -base64 48`; ela deve ter pelo menos 32 bytes. Não compartilhe nem versione os valores reais. As antigas variáveis `MANUS_PROJECT_ID`, `MANUS_OAUTH_PORTAL_URL`, `MANUS_OAUTH_API_URL` e `MANUS_JWT_SECRET` não são mais usadas e podem ser removidas do ambiente da Vercel.

Para criar ou redefinir a única conta autorizada, execute `pnpm admin:seed` em um terminal interativo com `MONGODB_URI` e `ADMIN_EMAIL` carregados. O comando pede uma senha nova sem exibi-la, pede confirmação e grava apenas o hash bcrypt (fator 12) na coleção configurada; ao atualizar o documento existente, preserva o identificador `id` e remove `senha` em texto puro. A conta é criada/atualizada somente para o endereço definido em `ADMIN_EMAIL`. Use senha única e longa; como a senha anteriormente compartilhada na conversa não deve ser considerada confidencial, prefira definir outra antes de liberar o painel.

O login aplica limite de tentativas por e-mail e endereço de origem, com janela de 15 minutos armazenada em `admin_login_attempts`; o token de sessão é assinado com `ADMIN_SESSION_SECRET`, usa cookie `HttpOnly`, `SameSite=Lax` e `Secure` em produção, expira após 8 horas e mantém validação CSRF nas operações administrativas. A conexão ao Atlas deve permitir o IP de saída do ambiente em que o seed for executado e da aplicação publicada.
