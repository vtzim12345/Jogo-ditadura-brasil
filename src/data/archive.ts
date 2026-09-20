// ARQUIVO HISTÓRICO. tag: 'HISTÓRICO' = fatos documentados; 'FICÇÃO' = elementos narrativos do jogo.
export interface ArchiveEntry { id: string; title: string; tag: 'HISTÓRICO' | 'FICÇÃO'; year: string; text: string; }

export const ARCHIVE: Record<string, ArchiveEntry> = {
  periodo: {
    id: 'periodo', title: 'A Ditadura Militar (1964–1985)', tag: 'HISTÓRICO', year: '1964–1985',
    text: 'Em 31 de março / 1º de abril de 1964, um golpe militar derrubou o presidente João Goulart. Seguiram-se 21 anos de regime autoritário, com cinco presidentes-generais: Castelo Branco, Costa e Silva, Médici, Geisel e Figueiredo. O período combinou crescimento econômico, censura, cassação de direitos, perseguição e tortura de opositores. A redemocratização veio com a campanha das Diretas Já (1984) e a posse de José Sarney em 1985. Fontes: Arquivo Nacional, CPDOC/FGV, Comissão Nacional da Verdade (2014).'
  },
  ai5: {
    id: 'ai5', title: 'AI-5 (Ato Institucional nº 5)', tag: 'HISTÓRICO', year: '1968',
    text: 'Editado em 13 de dezembro de 1968, o AI-5 foi o mais duro dos atos institucionais: fechou o Congresso, suspendeu garantias como o habeas corpus para crimes políticos, autorizou cassações e institucionalizou a censura prévia à imprensa e às artes. Marca o início dos "anos de chumbo".'
  },
  censura: {
    id: 'censura', title: 'Censura à imprensa e às artes', tag: 'HISTÓRICO', year: '1968–1978',
    text: 'Jornais, músicas, peças e filmes passavam por censores. Redações driblavam a censura publicando receitas de bolo ou versos de Camões nos espaços vetados. Muitos artistas foram para o exílio. As canções usavam metáforas para escapar do corte.'
  },
  estudantes: {
    id: 'estudantes', title: 'Movimento estudantil e a UNE', tag: 'HISTÓRICO', year: '1968',
    text: 'Em 1968 houve grandes passeatas, como a Passeata dos Cem Mil no Rio. A UNE atuava na clandestinidade após ser posta na ilegalidade. O Congresso da UNE em Ibiúna (SP) terminou com centenas de estudantes presos.'
  },
  operarios: {
    id: 'operarios', title: 'Greves e o novo sindicalismo', tag: 'HISTÓRICO', year: '1978–1980',
    text: 'No fim dos anos 1970, greves no ABC paulista (metalúrgicos) desafiaram a proibição de paralisações. O movimento fortaleceu lideranças sindicais e foi decisivo na reabertura política.'
  },
  desaparecidos: {
    id: 'desaparecidos', title: 'Presos e desaparecidos políticos', tag: 'HISTÓRICO', year: '1964–1985',
    text: 'A Comissão Nacional da Verdade (2014) reconheceu centenas de mortos e desaparecidos políticos e documentou a prática de tortura em órgãos de repressão. Familiares organizaram-se por décadas em busca de informações e reconhecimento.'
  },
  diretas: {
    id: 'diretas', title: 'Diretas Já e a redemocratização', tag: 'HISTÓRICO', year: '1984–1985',
    text: 'Em 1984, milhões foram às ruas pedir eleições diretas para presidente. A emenda Dante de Oliveira não passou, mas o clamor popular acelerou o fim do regime. Tancredo Neves foi eleito indiretamente; com sua morte, José Sarney assumiu em 1985.'
  },
  fic_universo: {
    id: 'fic_universo', title: 'Sobre este jogo (ficção)', tag: 'FICÇÃO', year: '—',
    text: 'Personagens, diálogos, jornais, cartas, fotografias e documentos deste jogo são RECONSTITUIÇÕES EDUCATIVAS / DRAMATIZAÇÕES. Não representam pessoas reais nem reproduzem documentos autênticos. Cenas de repressão são sugeridas por sombra, som e silêncio, sem violência explícita. O objetivo é educar sobre o período com responsabilidade histórica.'
  },
};
