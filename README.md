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
