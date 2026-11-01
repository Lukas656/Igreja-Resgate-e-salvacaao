# Plano de implementação — Ministério Resgate & Salvação

## Escopo e abordagem

Será desenvolvida uma landing page institucional em **Next.js (App Router) + TypeScript + Tailwind CSS**, com uma única rota pública (`/`) e navegação por âncoras. A experiência será mobile-first, semanticamente estruturada e acessível. Componentes interativos — menu mobile, filtros/ordenação de vídeos, paginação incremental e seleção do player — ficarão isolados no cliente; conteúdo institucional e metadados serão renderizados pelo servidor.

A aplicação inclui uma rota interna `GET /api/youtube`, responsável por consultar a YouTube Data API v3 no servidor. A chave é lida apenas de `YOUTUBE_API_KEY`, sem exposição no navegador. A configuração de playlists identifica Pregações, Cultos e Eventos; quando a chave ou os IDs oficiais estiverem ausentes, a biblioteca exibe um estado claro de configuração pendente, sem vídeos fictícios. Respostas bem-sucedidas recebem cache HTTP para reduzir consumo de quota; erros são tratados no componente da biblioteca.

Dados que não foram fornecidos como oficiais — endereço, telefone/WhatsApp, links sociais, IDs do canal/playlists e embed do mapa — não serão inventados. Eles ficarão centralizados em configuração, vazios ou com estado claro de “a definir”, para substituição sem tocar nos componentes. O botão de rota será habilitado automaticamente quando um link do Google Maps for configurado.

Não há arquivos de logo oficial nem banner de domingo disponíveis no anexo recebido. O layout prevê slots de marca e de banner; até que os assets sejam enviados, será usado um monograma visual R&S construído em interface (não apresentado como logotipo oficial) e uma arte visual original sem texto, coerente com a direção fornecida. Ao receber os arquivos oficiais, eles substituirão os slots sem alteração de estrutura.

## Direção de design

- **Movimento de design:** reverência contemporânea — uma interpretação digital de iluminação arquitetural de culto, com profundidade cinematográfica e uma presença serena em vez de elementos decorativos excessivos.
- **Princípios:** contraste acolhedor; narrativa vertical que conduz do convite à conexão; superfícies translúcidas discretas; detalhe luminoso reservado aos pontos de ação e fé.
- **Filosofia de cores:** o azul profundo `#061638` sustenta introspecção e confiança; `#082D70` organiza os planos; `#087BFA` e `#19B9FF` simbolizam luz, esperança e direção; branco e cinza azulado garantem leitura confortável.
- **Paradigma de layout:** uma jornada em faixas diagonais suaves, iniciando com palco hero de alta imersão, seguida por um bloco de versículo que cria pausa, e seções de conteúdo em camadas deslocadas em vez de uma grade uniforme.
- **Elementos de assinatura:** cruz de luz azul no hero; linhas orbitais/halos muito sutis; bordas de vidro azulado e gradientes em feixe nos CTAs e cards selecionados.
- **Interações:** navegação âncora com rolagem suave; botões e cards respondem com elevação leve e brilho de borda; filtros de vídeos oferecem feedback imediato e claro; tudo deve funcionar por teclado.
- **Animação:** entrada curta por opacidade e deslocamento vertical nas seções, com respeito a `prefers-reduced-motion`; luzes e halos são lentos, pouco contrastados e nunca competem com o texto.
- **Tipografia:** `Manrope` para texto de interface e leitura, combinada com `Cormorant Garamond` nos versos e títulos de maior contemplação. Títulos usam escala fluida, peso semibold e boa largura de linha; corpos mantêm alto contraste e espaçamento generoso.
- **Essência de marca:** uma comunidade cristã que acolhe pessoas para encontrar esperança, Palavra e transformação em Cristo. Personalidade: acolhedora, firme, luminosa.
- **Voz da marca:** direta, fraterna e fundamentada no Evangelho. Exemplos: “Há um lugar para você.” e “Assista, compartilhe e seja edificado pela Palavra.”
- **Marca e cor assinatura:** os assets oficiais serão priorizados assim que enviados; o tom assinatura em UI será `#19B9FF`, usado como sinal de luz e ação, nunca como fundo dominante.

## Estrutura de projeto

```text
app/
  api/youtube/route.ts        # Proxy seguro, cache e classificação por playlist
  globals.css                 # Tokens, gradientes, animações e base Tailwind
  layout.tsx                  # Fonts, metadata, Open Graph e viewport
  page.tsx                    # Composição semântica da landing page
  robots.ts / sitemap.ts      # Documentos SEO condicionados à origem real
components/
  header.tsx                  # Navegação fixa, redes e menu mobile
  hero.tsx                    # Hero e CTAs por âncora
  about.tsx                   # Apresentação e cards de propósito
  worship.tsx                 # Agenda de cultos e direcionamento de mapa
  video-library.tsx           # Cliente: filtros, ordem, carregar mais e player lazy
  social-links.tsx            # Cards configuráveis de redes
  contact.tsx                 # Contato configurável, mapa e WhatsApp
  footer.tsx                  # Rodapé institucional e atalhos
lib/
  config.ts                   # Identidade, contatos, culto e IDs públicos do YouTube
  youtube-types.ts             # Tipos compartilhados da biblioteca
  utils.ts                    # Validação de origem e formatação de datas
public/
  favicon.svg                 # Favicon em linguagem visual coerente
  manus-routes.json           # Manifesto da rota pública
app.config.ts                 # URL HTTPS literal do ícone do projeto
.env.example                  # Variáveis necessárias sem valores reais
README.md                     # Instalação, configuração e operação
TODO.md                       # Critérios de entrega e estado dos resultados
```

A arte do hero é referenciada pelo caminho gerenciado `/manus-storage/async-images/1qWIF5YtMoRUtUIVds0uI6/image-1.webp`. A logo oficial enviada posteriormente está em `public/images/logo.png` e no armazenamento do projeto; o cabeçalho e o rodapé a exibem. O banner oficial do Culto de Domingo ainda não foi enviado.

## Conteúdo e funcionalidades

1. **Cabeçalho e hero:** logo/slot oficial, navegação fixa, links de redes configuráveis, menu hamburger acessível, hero com a mensagem e CTAs exatos solicitados.
2. **Versículo e ministério:** destaque de Mateus 11:28, introdução institucional e cards de Nossa missão, Nossa fé e Nossa visão.
3. **Cultos:** primeiro cartão para Culto de Domingo — 09:00 e 1 Samuel 7:12; arquitetura para eventos futuros, sem endereço oficial inventado.
4. **Pregações e eventos:** biblioteca de vídeos com integração YouTube no servidor, categorias, ordenação, botão “Carregar mais”, estados de carregamento/erro e player incorporado carregado somente após a seleção de um vídeo.
5. **Redes, contato e rodapé:** três cards de rede social; contato e mapa renderizados somente quando configurados; frase institucional exata no rodapé.
6. **SEO e desempenho:** metadata do Next.js, favicon, Open Graph pronto para uma URL pública configurada, imagens com `next/image`, lazy loading, HTML semântico, atributos ARIA, `robots.ts` e `sitemap.ts` compatíveis com a futura URL de produção.

## Recursos e configuração

- `YOUTUBE_API_KEY` foi cadastrada pelo formulário seguro do projeto. O ID público do canal proprietário e a playlist de Cultos foram configurados a partir do link fornecido; as playlists de Pregações e Eventos ainda dependem de seus IDs oficiais.
- `NEXT_PUBLIC_SITE_URL` será opcional até que o domínio real seja conhecido; canônicos e URLs absolutas de Open Graph só serão ativados com uma origem pública real.
- Endereço, URL do Google Maps, telefone/WhatsApp, Instagram, Facebook e YouTube serão alteráveis em `lib/config.ts`.
- O projeto usa recurso de servidor já habilitado para a rota segura de vídeos; não exige banco de dados.

## Fluxo de entrega

Implementação concluída: diagnósticos TypeScript configurados; site, API segura, documentação e Preview implementados; `pnpm typecheck` e `pnpm build` passaram; o conteúdo institucional é pré-renderizado e a API é dinâmica. O endpoint “Todos” e o filtro “Cultos” retornam vídeos reais do YouTube. Permanecem dependentes de informação do ministério as playlists de Pregações e Eventos, links de Instagram/Facebook, endereço/telefone/Google Maps, origem HTTPS do domínio e o banner oficial de domingo.
