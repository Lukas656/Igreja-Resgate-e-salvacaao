# TODO — Critérios de entrega

## 1. Landing page institucional, identidade e navegação — Parcial
**Estado:** estrutura responsiva, navegação, hero e seções institucionais implementados; a logo oficial enviada foi aplicada no cabeçalho e no rodapé. A imagem do hero usa o caminho de asset reservado pelo armazenamento gerenciado do Manus. O banner oficial de domingo ainda não foi enviado.

- Desenvolver um website institucional moderno, elegante, profissional e totalmente responsivo para o Ministério Resgate & Salvação, a principal presença digital do ministério.
- Utilizar preferencialmente React, Next.js com App Router, TypeScript, Tailwind CSS, Lucide React e Framer Motion ou Motion para animações, quando necessário; utilizar componentes reutilizáveis, organização modular e boas práticas.
- Usar como referência o banner do Culto de Domingo e a logo oficial R&S quando os arquivos estiverem disponíveis. Aplicar azul profundo #061638, azul institucional #082D70, azul elétrico #087BFA, azul claro #19B9FF, branco #FFFFFF e cinza claro #D5DCEB. Manter fundos predominantemente escuros, gradientes azuis, iluminação azul, cruz cristã em destaque, tipografia moderna e elegante, cards arredondados, transparência sutil, animações leves e imagens relacionadas à fé, culto, oração e comunhão; transmitir fé, esperança, acolhimento e profissionalismo, evitando aparência genérica de template.
- Criar cabeçalho fixo com logo oficial, links Início, O Ministério, Cultos, Pregações e Eventos, ícones de Instagram, Facebook e YouTube, navegação suave por âncoras e menu hamburger em dispositivos móveis.
- Criar hero cinematográfico azul escuro e cruz iluminada, com título “Um lugar de fé, esperança e transformação.”, subtítulo “Conheça o Ministério Resgate & Salvação. Uma igreja comprometida em anunciar o Evangelho de Jesus Cristo e transformar vidas através da Palavra de Deus.” e botões “Conheça nosso ministério” e “Assista às pregações”.
- Criar seção de versículo com “Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.” e Mateus 11:28.
- Sobre o ministério: título “Mais que uma igreja, uma família em Cristo.”; apresentar a missão de anunciar o Evangelho, acolher pessoas e compartilhar o amor de Jesus Cristo; incluir cards Nossa missão, Nossa fé e Nossa visão.
- Manter hierarquia visual, espaçamentos consistentes, tipografia definida, contraste adequado, cards modernos, estados hover dos botões, transições suaves, seções distintas, experiência mobile excelente e ícones Lucide React; não utilizar emojis como substitutos de ícones.

## 2. Cultos, localização e contato configuráveis — Parcial
**Estado:** culto, horário, versículo e interfaces de localização/contato estão implementados. Endereço, telefone, URLs do Google Maps e embed aguardam os dados oficiais; o mapa e as ações de direção só serão ativados após configuração.

- Divulgar os encontros da igreja e incluir primeiro evento “Culto de Domingo — 09:00”.
- Exibir “Ebenézer — Até aqui nos ajudou o Senhor.” e 1 Samuel 7:12.
- Deixar estrutura preparada para adicionar outros cultos e eventos; prever endereço, localização e botão para abrir Google Maps.
- Criar localização/contato com endereço da igreja, Google Maps incorporado, botão Como chegar, telefone ou WhatsApp e redes sociais.
- Não inventar dados oficiais; manter campos configuráveis para endereço, mapas, telefone/WhatsApp e demais contatos.

## 3. Biblioteca de pregações e eventos YouTube — Parcial
**Estado:** endpoint interno, filtros, ordenação, paginação, cache, tratamento de estados e player sob seleção implementados. A chave `YOUTUBE_API_KEY` está configurada no ambiente seguro; a playlist de Cultos fornecida e o canal proprietário associado foram configurados. As categorias “Todos” e “Cultos” retornaram nove vídeos públicos cada. Faltam os IDs das playlists oficiais de Pregações e Eventos; até serem informados, essas categorias mostram configuração pendente e não exibem vídeos fictícios.

- Criar biblioteca de vídeos integrada automaticamente ao canal oficial do YouTube, na seção com título “Assista e seja edificado pela Palavra.” e subtítulo “Acompanhe nossas pregações, cultos, eventos e mensagens que fortalecem nossa fé.”
- Implementar integração com YouTube Data API v3 por uma API interna do Next.js; não expor chave da API no frontend. Consultar vídeos do canal e recuperar thumbnails, títulos, descrições, datas de publicação e identificadores dos vídeos.
- Implementar filtros Todos, Pregações, Cultos e Eventos e ordenação Mais recentes primeiro/Mais antigos primeiro. Preferir playlists específicas do YouTube para identificar as categorias, evitando depender exclusivamente de palavras-chave.
- Permitir configurar YouTube Channel ID, Playlist ID de Pregações, Playlist ID de Cultos e Playlist ID de Eventos.
- Criar player responsivo 16:9; carregar iframe somente quando o visitante selecionar um vídeo.
- Implementar carregamento progressivo, estados de carregamento e erro, botão “Carregar mais” e cache para reduzir requisições e consumo de quota da API.
- Garantir que filtros funcionem e que os vídeos selecionados sejam reproduzidos.

## 4. Redes sociais, footer e informação institucional — Parcial
**Estado:** cards Instagram, Facebook e YouTube e rodapé implementados; o link do YouTube usa o canal público proprietário da playlist fornecida. Os links de Instagram/Facebook, endereço e telefone ainda não foram fornecidos, portanto os campos correspondentes permanecem sem destinos inventados.

- Criar três cards para Instagram, Facebook e YouTube, cada um com ícone, nome, descrição e botão para acessar a rede correspondente; deixar links configuráveis.
- No footer, incluir logo, nome do ministério, frase institucional “Ministério Resgate & Salvação — Anunciando o Evangelho, resgatando vidas e proclamando a salvação em Cristo Jesus.”, links de navegação, redes sociais, informações de contato e direitos autorais.
- Todos os botões deverão funcionar; todos os links deverão estar preparados para receber os endereços oficiais.

## 5. Organização técnica e documentação — Concluído
**Evidência:** `pnpm typecheck` e `pnpm build` concluídos com sucesso; `README.md`, `.env.example`, configuração central, manifesto de rotas e rota de API estão presentes.

- Organizar o projeto com componentes independentes, tipos TypeScript, arquivos de configuração, integração YouTube isolada, variáveis de ambiente, tratamento de erros e componentes reutilizáveis.
- Criar arquivo de configuração central para nome do ministério, logo, redes sociais, endereço, horários dos cultos e dados do YouTube.
- Criar README com instruções de instalação, execução e configuração da API.
- Entregar landing page completa e funcional, não apenas protótipo ou imagem ilustrativa; deixar o projeto organizado e pronto para execução local.

## 6. Responsividade, SEO, acessibilidade e performance — Concluído com configuração de domínio pendente
**Evidência:** HTML institucional é pré-renderizado; metadata, favicon, manifesto, robots/sitemap condicionais, navegação mobile, semântica e controles acessíveis estão implementados. URLs absolutas de compartilhamento/canônicas aparecem após definir a origem pública HTTPS real.

- Garantir funcionamento em desktop, notebook, tablet e smartphone, com abordagem mobile first.
- Implementar metadata do Next.js, Open Graph, favicon personalizado, imagens otimizadas, lazy loading, URLs amigáveis, semântica HTML, acessibilidade e boa pontuação de performance.
