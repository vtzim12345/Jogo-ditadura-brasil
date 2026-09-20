export interface President { id: string; name: string; period: string; events: string; context: string; }

export const PRESIDENTS: President[] = [
  {
    id: 'castelo', name: 'Humberto de Alencar Castelo Branco', period: '1964–1967',
    events: 'Edição do AI-1 e do AI-2, cassações de mandatos, instituição do bipartidarismo (ARENA e MDB) e preparação da Constituição de 1967.',
    context: 'Primeiro presidente do regime. Marechal ligado ao grupo que defendia um governo militar de caráter mais transitório, o que não se concretizou.'
  },
  {
    id: 'costa', name: 'Artur da Costa e Silva', period: '1967–1969',
    events: 'Crescimento das manifestações (1968), endurecimento do regime e edição do AI-5 em dezembro de 1968.',
    context: 'Seu governo marcou a virada para a chamada "linha dura". Afastado por doença em 1969, foi sucedido por uma junta militar.'
  },
  {
    id: 'medici', name: 'Emílio Garrastazu Médici', period: '1969–1974',
    events: 'Auge da repressão política combinado ao "milagre econômico" e a forte propaganda oficial.',
    context: 'Período mais duro do regime em relação à perseguição de opositores, segundo documentação oficial posterior.'
  },
  {
    id: 'geisel', name: 'Ernesto Geisel', period: '1974–1979',
    events: 'Início da abertura política "lenta, gradual e segura"; fim do AI-5 (a partir de 1979).',
    context: 'Conduziu a distensão em meio a tensões com a linha dura das Forças Armadas.'
  },
  {
    id: 'figueiredo', name: 'João Baptista Figueiredo', period: '1979–1985',
    events: 'Lei da Anistia (1979), continuidade da abertura, campanha das Diretas Já (1984) e transição para um presidente civil.',
    context: 'Último presidente militar. Seu governo encerrou o ciclo iniciado em 1964.'
  }
];
