// Story script (data-driven). All fictional characters & dialogues are
// DRAMATIZACAO / RECONSTITUICAO EDUCATIVA. 'hero' = chosen playable character.

export type Emotion = 'normal' | 'worried' | 'afraid' | 'determined' | 'sad' | 'surprised';

export interface ChoiceOption {
  key: string; label: string; conseq: string; context: string; risk?: number; doc?: string;
}
export interface ExploreProp {
  x: number; label: string; kind: string;
  say?: { who: string; emo?: Emotion; text: string }[];
  doc?: string; goal?: boolean;
}

export type Beat =
  | { t: 'set'; biome: string; mood: 'calm'|'tense'|'hope'|'heavy'; year: number }
  | { t: 'obj'; items: string[] }
  | { t: 'narrate'; text: string }
  | { t: 'say'; who: string; emo?: Emotion; text: string }
  | { t: 'cut'; action: string; text?: string }
  | { t: 'choice'; id: string; prompt: string; options: ChoiceOption[] }
  | { t: 'result' }
  | { t: 'doc'; id: string }
  | { t: 'news'; id: string }
  | { t: 'censor' }
  | { t: 'explore'; hint: string; props: ExploreProp[] };

export interface Chapter { id: string; title: string; subtitle: string; year: number; beats: Beat[]; }

export const CHAPTERS: Chapter[] = [
  {
    id: 'prologo', title: 'PRÓLOGO', subtitle: 'Brasil antes de 1964', year: 1963,
    beats: [
      { t: 'set', biome: 'street', mood: 'calm', year: 1963 },
      { t: 'narrate', text: 'Início dos anos 1960. O Brasil de João Goulart vive intensa mobilização política. Nas ruas, discutem-se as "Reformas de Base". Ao fundo, a Guerra Fria divide o mundo.' },
      { t: 'say', who: 'hero', emo: 'normal', text: 'A cidade fervilha. Todo mundo fala de política — no bar, na fila do pão, no ponto de ônibus.' },
      { t: 'obj', items: ['Conhecer o bairro', 'Conversar com os vizinhos', 'Ler o jornal na banca'] },
      { t: 'explore', hint: 'Ande com WASD/setas e interaja (E ou toque) com os pontos destacados.', props: [
        { x: 420, label: 'Vizinho', kind: 'person', say: [
          { who: 'worker2', emo: 'normal', text: 'Dizem que as reformas vão mudar tudo. Outros dizem que é comunismo. E você, no que acredita?' },
          { who: 'hero', emo: 'normal', text: 'Acredito que a gente devia poder conversar sem medo. Só isso já seria muito.' } ] },
        { x: 720, label: 'Cartaz', kind: 'poster', say: [
          { who: 'narrator', text: 'Um cartaz desbotado pede "Reformas Já". Ao lado, outro responde "Ordem". A cidade está dividida.' } ] },
        { x: 1040, label: 'Banca de jornal', kind: 'news', goal: true, say: [
          { who: 'hero', emo: 'worried', text: 'As manchetes estão cada vez mais tensas. Sinto que algo grande está para acontecer.' } ], doc: 'd01' }
      ] },
      { t: 'doc', id: 'd01' }
    ]
  },
  {
    id: 'cap1', title: 'CAPÍTULO 1', subtitle: '1964 — O Golpe', year: 1964,
    beats: [
      { t: 'set', biome: 'street', mood: 'tense', year: 1964 },
      { t: 'narrate', text: '31 de março de 1964. Tropas se movimentam a partir de Minas Gerais em direção ao Rio de Janeiro.' },
      { t: 'cut', action: 'militaryArrive', text: 'CUTSCENE' },
      { t: 'say', who: 'hero', emo: 'afraid', text: 'Caminhões do Exército na avenida principal... a essa hora?' },
      { t: 'say', who: 'soldier', emo: 'determined', text: 'Circulando! Recolham-se às suas casas. É uma ordem.' },
      { t: 'say', who: 'hero', emo: 'worried', text: 'Então é verdade. O governo caiu.' },
      { t: 'choice', id: 'c1', prompt: 'Um soldado manda todos se recolherem. O que você faz?', options: [
        { key: 'obey', label: 'Ir para casa em silêncio', conseq: 'Você evita o confronto e chega em casa. As ruas se esvaziam rapidamente naquela noite.', context: 'Diante da força militar, muita gente recolheu-se em casa, sem saber ainda o alcance do que começava.', risk: 0 },
        { key: 'watch', label: 'Ficar observando de longe', conseq: 'Você presencia a movimentação das tropas, mas chama a atenção de uma patrulha.', context: 'Nos primeiros dias, a presença militar nas ruas era intensa. Observar de perto era arriscado.', risk: 2 } ] },
      { t: 'result' },
      { t: 'narrate', text: 'Entre 31 de março e 1º de abril de 1964, João Goulart deixa o país. Começa o regime militar, que duraria 21 anos.' },
      { t: 'doc', id: 'd02' },
      { t: 'news', id: 'n1964' }
    ]
  },
  {
    id: 'cap2', title: 'CAPÍTULO 2', subtitle: 'Consolidação', year: 1965,
    beats: [
      { t: 'set', biome: 'gov', mood: 'tense', year: 1965 },
      { t: 'narrate', text: 'Marechal Castelo Branco assume a presidência. É editado o AI-1, que permite cassar mandatos e suspender direitos políticos.' },
      { t: 'say', who: 'hero', emo: 'worried', text: 'Cassaram deputados. Suspenderam direitos. Dizem que é temporário...' },
      { t: 'say', who: 'lawyer', emo: 'determined', text: 'Chamam de "ato institucional". Na prática, é uma norma acima da Constituição. E não param no primeiro.' },
      { t: 'obj', items: ['Entender os Atos Institucionais', 'Falar com a advogada', 'Consultar o arquivo'] },
      { t: 'explore', hint: 'Explore o prédio público e descubra o que está mudando.', props: [
        { x: 380, label: 'Mural de avisos', kind: 'poster', say: [ { who: 'narrator', text: 'Listas de nomes cassados são afixadas no mural. Parlamentares perdem os mandatos da noite para o dia.' } ] },
        { x: 700, label: 'Dra. Inês', kind: 'person', say: [
          { who: 'lawyer', emo: 'normal', text: 'Em 1965 vem o AI-2: acabam com os partidos e criam só dois — ARENA, do governo, e MDB, a oposição permitida.' },
          { who: 'hero', emo: 'surprised', text: 'Então até a oposição passa a ser controlada pelo regime?' } ] },
        { x: 1000, label: 'Arquivo', kind: 'doc', goal: true, doc: 'd03', say: [ { who: 'hero', emo: 'determined', text: 'Preciso guardar isso. Um dia essas mudanças vão precisar ser explicadas.' } ] }
      ] },
      { t: 'doc', id: 'd03' }
    ]
  },
  {
    id: 'cap3', title: 'CAPÍTULO 3', subtitle: 'Tensão', year: 1968,
    beats: [
      { t: 'set', biome: 'school', mood: 'tense', year: 1967 },
      { t: 'narrate', text: '1967: Costa e Silva assume e entra em vigor a nova Constituição. Nas universidades, cresce a inquietação.' },
      { t: 'say', who: 'professor', emo: 'worried', text: 'Cuidado com o que dizem em sala. Nem toda porta está fechada como parece.' },
      { t: 'say', who: 'student2', emo: 'determined', text: 'Não dá mais pra ficar quieto! Os estudantes estão indo pra rua. Você vem?' },
      { t: 'obj', items: ['Decidir sobre a passeata', 'Conversar com os colegas'] },
      { t: 'explore', hint: 'Converse antes de decidir.', props: [
        { x: 360, label: 'Prof. Amaral', kind: 'person', say: [ { who: 'professor', emo: 'normal', text: 'Em 1968 a tensão explode. A morte do estudante Edson Luís leva multidões às ruas.' } ] },
        { x: 720, label: 'Mural estudantil', kind: 'poster', say: [ { who: 'narrator', text: 'Cartazes convocam para a Passeata dos Cem Mil, no Rio de Janeiro.' } ] },
        { x: 980, label: 'Marcos', kind: 'person', goal: true, say: [ { who: 'student2', emo: 'determined', text: 'Chegou a hora de escolher de que lado da História você vai estar.' } ] }
      ] },
      { t: 'choice', id: 'c3', prompt: 'Os estudantes convocam a Passeata dos Cem Mil. Você vai?', options: [
        { key: 'go', label: 'Ir à passeata', conseq: 'Você marcha com milhares de pessoas. É emocionante e assustador ao mesmo tempo. O risco de repressão é real.', context: 'A Passeata dos Cem Mil (1968) foi uma das maiores manifestações contra o regime. A repressão ao movimento estudantil aumentou no fim daquele ano.', risk: 3, doc: 'd07' },
        { key: 'stay', label: 'Não ir, mas apoiar de longe', conseq: 'Você não marcha, mas ajuda a organizar e a informar. Cada um resiste à sua maneira.', context: 'Nem toda resistência foi nas ruas: houve organização, imprensa alternativa e apoio silencioso.', risk: 1, doc: 'd07' } ] },
      { t: 'result' },
      { t: 'doc', id: 'd07' }
    ]
  },
  {
    id: 'cap4', title: 'CAPÍTULO 4', subtitle: 'AI-5', year: 1968,
    beats: [
      { t: 'set', biome: 'street', mood: 'heavy', year: 1968 },
      { t: 'narrate', text: '13 de dezembro de 1968. O governo edita o Ato Institucional nº 5.' },
      { t: 'cut', action: 'ai5', text: 'CUTSCENE ESPECIAL' },
      { t: 'say', who: 'radioman', emo: 'worried', text: '...o Congresso Nacional está fechado. Ficam suspensas garantias e ampliada a censura...' },
      { t: 'say', who: 'hero', emo: 'afraid', text: 'Sem Congresso, sem habeas corpus para crimes políticos... A noite ficou mais escura.' },
      { t: 'say', who: 'lawyer', emo: 'sad', text: 'O AI-5 é o instrumento mais duro do regime. A partir de agora, o medo vai morar em cada esquina.' },
      { t: 'doc', id: 'd03' },
      { t: 'news', id: 'n1968' },
      { t: 'narrate', text: 'O AI-5 vigoraria por dez anos, até 1978, marcando o período mais duro da ditadura.' }
    ]
  },
  {
    id: 'cap5', title: 'CAPÍTULO 5', subtitle: 'Censura e Cultura', year: 1971,
    beats: [
      { t: 'set', biome: 'newsroom', mood: 'tense', year: 1971 },
      { t: 'narrate', text: 'Início dos anos 1970. Jornais, rádio, TV, música, teatro e cinema passam por censura prévia.' },
      { t: 'say', who: 'editor', emo: 'worried', text: 'A matéria de hoje precisa passar pelo censor antes de rodar. Prepare-se para os cortes.' },
      { t: 'say', who: 'hero', emo: 'determined', text: 'Escrevi a verdade. Vamos ver quanto dela sobra.' },
      { t: 'censor' },
      { t: 'obj', items: ['Ver o resultado da censura', 'Conhecer a cultura sob vigilância'] },
      { t: 'explore', hint: 'Explore a redação e o meio cultural.', props: [
        { x: 360, label: 'Diretor de teatro', kind: 'person', say: [
          { who: 'actor', emo: 'normal', text: 'No palco, aprendemos a falar por metáforas. O que não pode ser dito, a plateia entende nas entrelinhas.' } ] },
        { x: 700, label: 'Rádio', kind: 'radio', say: [ { who: 'radioman', emo: 'worried', text: 'Muita música foi vetada. Alguns compositores foram para o exterior; outros mudaram as letras.' } ] },
        { x: 1020, label: 'Arquivo cultural', kind: 'doc', goal: true, doc: 'd05', say: [ { who: 'hero', emo: 'determined', text: 'A cultura resistiu do seu jeito — cantando o que não se podia dizer em voz alta.' } ] }
      ] },
      { t: 'doc', id: 'd04' },
      { t: 'doc', id: 'd05' }
    ]
  },
  {
    id: 'cap6', title: 'CAPÍTULO 6', subtitle: 'Repressão', year: 1972,
    beats: [
      { t: 'set', biome: 'prison', mood: 'heavy', year: 1972 },
      { t: 'narrate', text: 'Este capítulo aborda a repressão política. As cenas mais duras são sugeridas por sombras, sons e silêncios — sem violência explícita.' },
      { t: 'cut', action: 'repression', text: 'CENA SENSÍVEL' },
      { t: 'say', who: 'lawyer', emo: 'sad', text: 'Há pessoas presas sem julgamento. Famílias procuram parentes que simplesmente... desapareceram.' },
      { t: 'say', who: 'bishop', emo: 'determined', text: 'A Igreja abre suas portas para os perseguidos. Registrar cada nome é uma forma de resistência.' },
      { t: 'say', who: 'hero', emo: 'sad', text: 'Atrás daquela porta há dor que não se mostra. Mas não se pode fingir que não existe.' },
      { t: 'choice', id: 'c6', prompt: 'Uma família procura notícias de um desaparecido. O que você faz?', options: [
        { key: 'help', label: 'Ajudar a registrar o caso', conseq: 'Você ajuda a documentar o desaparecimento. É perigoso, mas esses registros serão fundamentais no futuro.', context: 'Registros feitos por advogados, familiares e setores da Igreja foram essenciais para o trabalho posterior da Comissão Nacional da Verdade.', risk: 3, doc: 'd06' },
        { key: 'careful', label: 'Orientar a procurar canais seguros', conseq: 'Você os orienta com cautela. A prudência protege, mas a angústia da família continua.', context: 'O medo da represália levava muitas famílias a buscar apoio discreto de advogados e religiosos.', risk: 1, doc: 'd06' } ] },
      { t: 'result' },
      { t: 'doc', id: 'd06' }
    ]
  },
  {
    id: 'cap7', title: 'CAPÍTULO 7', subtitle: 'Abertura', year: 1979,
    beats: [
      { t: 'set', biome: 'street', mood: 'hope', year: 1979 },
      { t: 'narrate', text: '1974: Geisel assume prometendo uma abertura "lenta, gradual e segura". A pressão social cresce.' },
      { t: 'say', who: 'hero', emo: 'normal', text: 'O ar parece um pouco mais leve. Fala-se em anistia, em volta dos exilados.' },
      { t: 'say', who: 'worker2', emo: 'determined', text: 'No ABC, os operários estão em greve. O movimento sindical voltou com força.' },
      { t: 'obj', items: ['Acompanhar a abertura política', 'Entender a Lei da Anistia'] },
      { t: 'explore', hint: 'A cidade respira de novo. Explore.', props: [
        { x: 380, label: 'Cartaz "Anistia Já"', kind: 'poster', say: [ { who: 'narrator', text: 'O AI-5 chega ao fim a partir de 1979. A campanha pela anistia toma as ruas.' } ] },
        { x: 720, label: 'Sebastião', kind: 'person', say: [ { who: 'worker2', emo: 'normal', text: 'A Lei da Anistia, de 1979, permitiu a volta de muita gente. Até hoje se discute seu alcance.' } ] },
        { x: 1020, label: 'Arquivo', kind: 'doc', goal: true, doc: 'd08', say: [ { who: 'hero', emo: 'determined', text: 'A abertura não foi um presente: foi conquistada passo a passo, com muita pressão popular.' } ] }
      ] },
      { t: 'doc', id: 'd08' }
    ]
  },
  {
    id: 'cap8', title: 'CAPÍTULO 8', subtitle: 'Redemocratização', year: 1984,
    beats: [
      { t: 'set', biome: 'protest', mood: 'hope', year: 1984 },
      { t: 'narrate', text: '1979–1985: Figueiredo, o último presidente militar. Em 1984, o país vai às ruas pelas Diretas Já.' },
      { t: 'cut', action: 'diretas', text: 'CUTSCENE' },
      { t: 'say', who: 'hero', emo: 'determined', text: 'Nunca vi tanta gente junta! Todos pedindo a mesma coisa: o direito de escolher.' },
      { t: 'say', who: 'helena', emo: 'normal', text: 'A emenda das diretas foi rejeitada no Congresso. Mas já não dá mais para deter a mudança.' },
      { t: 'news', id: 'n1984' },
      { t: 'narrate', text: 'Em 15 de janeiro de 1985, o Colégio Eleitoral elege Tancredo Neves. Com sua morte, José Sarney assume. Encerra-se o regime militar.' },
      { t: 'doc', id: 'd09' },
      { t: 'doc', id: 'd10' }
    ]
  }
];
