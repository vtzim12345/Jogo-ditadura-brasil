# Ditadura no Brasil — Vozes de um Tempo

Jogo 2D educativo (side-scroller narrativo) sobre a Ditadura Militar no Brasil (1964–1985).
Roda no navegador, em PC e celular. Desenvolvido em **TypeScript + Canvas + Vite** (sem
frameworks de jogo externos). Todos os gráficos são gerados por código (pixel art procedural)
e a trilha é sintetizada via Web Audio API — nenhum material protegido é utilizado.

> Trabalho Extra de História — Victor Gabriel Silva de Melo — Nº 39, 9º B — Prof. Jefferson — Escola PMC.

## Como executar (desenvolvimento)

```bash
npm install
npm run dev
```
Abra o endereço mostrado no terminal (http://127.0.0.1:5173).

## Como gerar o build de produção

```bash
npm run build      # gera a pasta dist/
npm run preview    # testa o build localmente
```

## Publicar no Vercel

1. Suba a pasta do projeto para um repositório (GitHub/GitLab) **ou** use a Vercel CLI.
2. Na Vercel, importe o projeto. As configurações já vêm prontas em `vercel.json`:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Deploy. Alternativa por CLI:
   ```bash
   npm i -g vercel
   vercel
   ```

## Controles

**PC**
- `WASD` / `← →` — andar
- `E` — interagir
- `ESPAÇO` / `ENTER` / clique — avançar diálogos e cutscenes
- `SHIFT` (segurar) — acelerar o texto
- `M` ou botão `ARQUIVO` — abrir Documentos / Linha do tempo / Enciclopédia / Presidentes / Config
- `ESC` — pausar (salvar e sair)

**Celular**
- Joystick virtual (canto inferior esquerdo) — andar
- Botão `E` (canto inferior direito) — interagir
- Toque na tela — avançar diálogos; toque nos botões — escolhas/menus
- Em retrato, aparece o aviso "Gire o dispositivo para jogar".

## O que tem no jogo

- Tela inicial cinematográfica (capa do trabalho) + tela **Sobre**.
- 6 personagens jogáveis (pessoa comum, estudante, artista, jornalista, empresário, militar)
  e ~22 personagens no total.
- Prólogo + 8 capítulos (1964 → 1985) com narrativa, diálogos, cutscenes, escolhas e consequências.
- Cenários em pixel art com parallax, chuva, iluminação e mudança de atmosfera por momento histórico.
- Mecânica de **censura** (original x publicada x contexto), **jornais** interativos com trechos
  censurados, **documentos** desbloqueáveis, **linha do tempo**, **enciclopédia** e **presidentes**.
- Save local automático (localStorage), acessibilidade (volume, velocidade de texto, pausa),
  responsivo para celular/tablet/desktop.
- Final educativo + créditos + nota do projeto.

## Fontes históricas de referência

Arquivo Nacional • CPDOC/FGV • Biblioteca Nacional • Senado Federal • Câmara dos Deputados •
Comissão Nacional da Verdade (2014) • acervos de universidades e museus brasileiros.

Jornais, cartas e diálogos do jogo são **reconstituições educativas / dramatizações** e não
reproduzem documentos reais. Cenas sensíveis (repressão) são sugeridas por sombras, som e
silêncio, **sem violência explícita**.

## Estrutura

```
src/
  core/     input, audio, save, gfx (helpers)
  game/     sprites, scenery, dialogue, hud, cutscene, censor, newspaper, play (motor da campanha)
  scenes/   menus (title/about/select/gamemenu), ending (final/créditos/nota)
  data/     characters, chapters (roteiro), timeline, encyclopedia, presidents, documents, newspapers
  main.ts   loop do jogo, máquina de estados, controles mobile, orientação
```
