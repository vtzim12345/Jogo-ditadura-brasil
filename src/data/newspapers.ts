// Educational reconstructions (RECONSTITUICAO EDUCATIVA) - not real newspapers.
export interface NewsPage {
  headline: string;
  body: string;         // use [[CENSURADO]] to mark blacked-out passages
  note: string;         // historical context shown after
}
export interface Newspaper { id: string; name: string; date: string; pages: NewsPage[]; }

export const NEWSPAPERS: Record<string, Newspaper> = {
  n1964: {
    id: 'n1964', name: 'DIÁRIO DA CIDADE — RECONSTITUIÇÃO EDUCATIVA', date: 'Abril de 1964',
    pages: [
      { headline: 'MOVIMENTO MILITAR MUDA O GOVERNO',
        body: 'Forças militares assumem o controle político do país. Autoridades falam em "restauração da ordem". Setores da oposição denunciam [[CENSURADO]] e pedem [[CENSURADO]].',
        note: 'Em 1964, parte da imprensa apoiou a mudança; outra parte começou a sofrer restrições. Historiadores hoje classificam o episódio como golpe civil-militar.' }
    ]
  },
  n1968: {
    id: 'n1968', name: 'JORNAL DA TARDE — RECONSTITUIÇÃO EDUCATIVA', date: 'Dezembro de 1968',
    pages: [
      { headline: 'GOVERNO ENDURECE MEDIDAS',
        body: 'Novo ato amplia poderes do Executivo. A reportagem sobre [[CENSURADO]] não pôde ser publicada. No lugar, a redação imprimiu uma receita de bolo — sinal que os leitores aprenderam a reconhecer.',
        note: 'Após o AI-5, muitos jornais tiveram matérias vetadas. Espaços censurados eram preenchidos com poemas ou receitas.' }
    ]
  },
  n1984: {
    id: 'n1984', name: 'GAZETA POPULAR — RECONSTITUIÇÃO EDUCATIVA', date: 'Abril de 1984',
    pages: [
      { headline: 'MULTIDÃO PEDE DIRETAS JÁ',
        body: 'Comícios reúnem centenas de milhares de pessoas em várias capitais pedindo eleições diretas para presidente. A campanha ganha as ruas e a imprensa volta a noticiar com mais liberdade.',
        note: 'Em 1984, a censura já havia recuado. A campanha das Diretas Já foi um dos maiores movimentos populares da história do Brasil.' }
    ]
  }
};
