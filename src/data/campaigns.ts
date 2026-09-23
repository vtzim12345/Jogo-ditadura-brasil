import { Campaign } from '../game/adv/types';

// RECONSTITUIÇÃO EDUCATIVA / DRAMATIZAÇÃO. Personagens e documentos são ficcionais,
// ambientados em fatos históricos do período 1964–1985. Universo compartilhado:
// o jornal 'A Voz da Cidade', a fictícia 'Operação Tordo' e o Prof. Vasconcelos
// reaparecem entre as histórias.

export const CAMPAIGNS: Record<string, Campaign> = {
  // ============ ANTÔNIO — OPERÁRIO (investigação → organização → fuga → greve) ============
  // Pergunta do arco: "Quem está mexendo nos registros dos trabalhadores — e o que a gerência esconde?"
  antonio: {
    char: 'antonio', name: 'Antônio Ferreira', role: 'Operário metalúrgico',
    premise: 'ABC paulista, fim dos anos 1970. Antônio percebe que os registros dos trabalhadores não fecham: o que a gerência anota não é o que se paga. Puxando esse fio, ele descobre vigilância interna, um informante e uma paralisação em marcha — e precisa decidir até onde ir sem entregar os companheiros.',
    rooms: [
      // ---------- CAPÍTULO 1 — O DOCUMENTO ----------
      {
        id: 'fabrica', biome: 'factory', mood: 'tense', year: 1979, worldW: 1650,
        title: 'Capítulo 1', sub: 'Os registros que não fecham',
        objective: 'Entenda por que os números do seu holerite não batem com a produção.',
        tip: 'Observe a rotina antes de agir. CTRL agacha e deixa você oculto; evite o cone de visão do capataz.',
        mission: { id: 'm_antonio_1', title: 'O documento', stages: [
          { objective: 'Entenda por que os números do seu holerite não batem com a produção.',
            subs: [
              { id: 'a_holerite', label: 'Examinar o holerite deste mês', on: { t: 'clue', v: 'c_arrocho' } },
              { id: 'a_producao', label: 'Comparar com o quadro de produção', on: { t: 'clue', v: 'c_producao' } },
            ],
            reward: { resources: 4 },
            say: [{ who: 'hero', text: 'Produzimos mais e ganhamos menos. Alguém arruma esses números — e eu quero ver onde.', emo: 'determined' }] },
          { objective: 'Descubra como entrar no arquivo do apontamento sem ser notado.',
            subs: [
              { id: 'a_rotina', label: 'Observar a rotina do apontador', on: { t: 'flag', v: 'a_rotina_ok' } },
              { id: 'a_chave', label: 'Recuperar a chave escondida no andaime', on: { t: 'item', v: 'chave_arquivo' } },
            ],
            say: [{ who: 'hero', text: 'Ele sai quando bate o apito do almoço. É a minha janela.', emo: 'normal' }] },
          { objective: 'Entre no arquivo e decifre o que a gerência registra de verdade.',
            subs: [
              { id: 'a_arquivo', label: 'Destrancar o arquivo do apontamento', on: { t: 'prop', v: 'a_arquivo' } },
              { id: 'a_memorando', label: 'Decifrar o livro-caixa em código', on: { t: 'solve', v: 'pz_a_doc' } },
            ],
            reward: { resources: 6 } },
          { objective: 'O apontador está voltando. Decida como sair com o que descobriu.',
            subs: [
              { id: 'a_saida', label: 'Escolher como deixar o escritório', on: { t: 'choice', v: 'ch_antonio_doc' } },
            ] },
        ] },
        intro: [
          { who: 'narrator', text: 'Turno da manhã. O barulho das prensas abafa as conversas — e é por isso que as conversas acontecem aqui.' },
          { who: 'hero', text: 'Meu contracheque diz uma coisa. A produção que assino todo dia diz outra.', emo: 'worried' },
        ],
        platforms: [
          { x: 980, y: 334, w: 120, kind: 'scaffold' },
          { x: 1130, y: 262, w: 130, kind: 'scaffold' },
        ],
        patrols: [
          { x0: 900, x1: 1300, speed: 46, kind: 'agent' },
        ],
        props: [
          { id: 'a_holerite', x: 300, kind: 'clue', label: 'Examinar o holerite', glyph: '▤',
            say: [{ who: 'hero', text: 'Reajuste de 40%. O pão, o ônibus, o aluguel subiram muito mais. Isso é arrocho no papel.' }],
            clue: { id: 'c_arrocho', title: 'Holerite do arrocho', text: 'Reajuste de 40% contra inflação real muito maior. A perda salarial está preta no branco.', cat: 'documento' } },
          { id: 'a_producao', x: 520, kind: 'clue', label: 'Ler o quadro de produção', glyph: '▤',
            say: [{ who: 'narrator', text: 'O quadro anota metas batidas mês após mês. Só o pagamento não acompanha o esforço registrado.' }],
            clue: { id: 'c_producao', title: 'Quadro de produção', text: 'Metas de produção sempre cumpridas — mas o valor pago não reflete o volume. Os registros não fecham.', cat: 'documento' } },
          { id: 'a_rotina', x: 760, kind: 'look', label: 'Observar o apontador', glyph: '◉', setFlag: 'a_rotina_ok',
            say: [
              { who: 'narrator', text: 'Da sombra do maquinário, você observa. O apontador confere o relógio, tranca o arquivo e some no refeitório quando bate o apito.' },
              { who: 'hero', text: 'Tenho poucos minutos entre o apito e o café dele. E o capataz ronda o corredor.', emo: 'normal' },
            ] },
          { id: 'a_chave', x: 1190, py: 262, kind: 'reward', label: 'Pegar a chave no andaime', glyph: '⚷',
            say: [{ who: 'narrator', text: 'Presa num prego do andaime, a cópia da chave do arquivo. O eletricista guardava aqui — longe dos olhos da gerência.' }],
            reward: { item: 'chave_arquivo', resources: 4 }, setFlag: 'a_chave_ok' },
          { id: 'a_arquivo', x: 980, kind: 'door', label: 'Destrancar o arquivo', glyph: '▦',
            requires: 'a_rotina_ok', needItem: 'chave_arquivo', consumesItem: true, setFlag: 'a_arquivo_ok',
            lockedSay: [{ who: 'hero', text: 'Melhor esperar o apontador sair — e ter a chave na mão.' }],
            say: [{ who: 'narrator', text: 'A chave gira. Dentro, pastas de apontamento e um livro-caixa preenchido em código: números onde deviam estar nomes.' }] },
          { id: 'a_memorando', x: 1040, kind: 'puzzle', label: 'Decifrar o livro-caixa', glyph: '⌗', requires: 'a_arquivo_ok',
            lockedSay: [{ who: 'hero', text: 'Preciso abrir o arquivo primeiro.' }],
            puzzle: { id: 'pz_a_doc', kind: 'doc', title: 'O livro-caixa em código', brief: 'A gerência anota os "vigiados" disfarçados no livro-caixa. Toque no NOME e na DATA que denunciam a vigilância.',
              hint: 'Procure o nome próprio fora de lugar e a data completa (dia/mês/ano).',
              docPrompt: 'Toque no NOME vigiado e na DATA do registro.',
              docText: 'LIVRO CAIXA setor de usinagem descontos diversos verba 07 acompanhar VASCONCELOS junto aos torneiros lancar como avaria desde 12/03/1979 reportar a seguranca patrimonial toda reuniao fora do expediente',
              docTarget: ['VASCONCELOS', '12/03/1979'],
              onSolve: { setFlag: 'a_doc_ok', clue: { id: 'c_memorando', title: 'Vigilância disfarçada de avaria', text: 'A gerência lança a vigilância de Vasconcelos como "avaria" no livro-caixa desde 12/03/1979. Há um informante interno passando os passos dos operários.', cat: 'documento' }, archive: 'operarios',
                say: [{ who: 'hero', text: 'Não é só arrocho. Eles anotam quem conversa com quem, escondido na contabilidade. Tem dedo-duro entre nós.', emo: 'worried' }] } } },
          { id: 'a_saida', x: 1360, kind: 'choice', label: 'Sair do escritório', glyph: '⚑', requires: 'a_doc_ok',
            lockedSay: [{ who: 'hero', text: 'Primeiro o documento. Depois eu penso em como sair.' }],
            choice: { id: 'ch_antonio_doc', prompt: 'Passos no corredor: o apontador volta. O que fazer com o livro-caixa?',
              options: [
                { key: 'copiar', label: 'Copiar à mão os trechos e devolver o livro', hint: 'Discreto. Ninguém percebe a falta — sua palavra vale menos que o original.', result: 'Você copia os lançamentos num papel de pão e recoloca o livro no lugar. O apontador entra assobiando, sem notar nada. Ninguém pode dizer que você esteve ali.', suspicion: -5, setFlag: 'a_copiou', clue: { id: 'c_copia', title: 'Cópia à mão', text: 'Anotação apressada dos lançamentos. Prova frágil, mas ninguém sabe que ela existe.', cat: 'documento' } },
                { key: 'levar', label: 'Arrancar a página e levar o original', hint: 'Prova irrefutável — mas a falta será notada, e vão procurar quem entrou.', result: 'Você rasga a página e some pela porta lateral. É prova de verdade. Mas amanhã darão pela falta, e a segurança vai querer saber quem tinha a chave.', suspicion: 20, setFlag: 'a_levou', reward: { archive: 'operarios' }, clue: { id: 'c_pagina', title: 'A página arrancada', text: 'Original do livro-caixa com a vigilância disfarçada. Prova irrefutável — e um rastro perigoso.', cat: 'documento' } },
              ] } },
          { id: 'a_exit1', x: 1580, kind: 'exit', label: 'Voltar ao chão de fábrica', glyph: '→', to: 1, gate: 'mission_m_antonio_1_done',
            lockedSay: [{ who: 'hero', text: 'Ainda não terminei o que vim fazer aqui.' }],
            say: [{ who: 'narrator', text: 'Com o que descobriu, você se mistura ao turno. Agora é preciso avisar os companheiros — sem que o informante perceba.' }] },
        ],
      },
      // ---------- CAPÍTULO 2 — O AVISO ----------
      {
        id: 'chao', biome: 'factory', mood: 'tense', year: 1979, worldW: 1850,
        title: 'Capítulo 2', sub: 'O aviso',
        objective: 'Espalhe a data da assembleia entre os companheiros de confiança — sem juntar gente num lugar só.',
        tip: 'Não converse com todos no mesmo canto: um informante repara em ajuntamentos. Use corredores diferentes.',
        mission: { id: 'm_antonio_2', title: 'O aviso', stages: [
          { objective: 'Avise três companheiros de confiança — em pontos diferentes do galpão.',
            subs: [
              { id: 'a_joao', label: 'Avisar João, o soldador (setor de solda)', on: { t: 'prop', v: 'a_joao' } },
              { id: 'a_zeca', label: 'Avisar Zeca, da prensa (fundo do galpão)', on: { t: 'prop', v: 'a_zeca' } },
              { id: 'a_dona', label: 'Passar o recado por dona Cida, na cantina', on: { t: 'prop', v: 'a_dona' } },
              { id: 'a_panfleto', label: 'Recolher o jornal que voou do portão', on: { t: 'clue', v: 'c_avoz' }, optional: true },
            ],
            reward: { resources: 4 },
            say: [{ who: 'hero', text: 'Recado dado, boca a boca. Se alguém ligar os pontos, vai ser tarde.', emo: 'normal' }] },
          { objective: 'Você sente que está sendo observado. Decida como agir.',
            subs: [
              { id: 'a_observado', label: 'Descobrir quem está anotando nomes', on: { t: 'flag', v: 'a_observado_ok' } },
              { id: 'a_decisao', label: 'Decidir se continua o aviso ou recua', on: { t: 'choice', v: 'ch_antonio_aviso' } },
            ] },
        ] },
        intro: [{ who: 'narrator', text: 'O galpão inteiro em movimento. A notícia da assembleia precisa correr — mas há ouvidos demais entre as máquinas.' }],
        patrols: [
          { x0: 500, x1: 900, speed: 44, kind: 'agent' },
          { x0: 1150, x1: 1600, speed: 50, kind: 'agent' },
        ],
        props: [
          { id: 'a_joao', x: 320, kind: 'talk', label: 'Avisar João', glyph: '☺',
            say: [
              { who: 'antonio', text: 'João. Assembleia no estádio, longe dos portões. Passa pra quem confia — só pra quem confia.' },
              { who: 'hero', text: 'Aguenta parar um dia?', emo: 'normal' },
              { who: 'narrator', text: 'João limpa as mãos no macacão. "Aguenta. Mas sem liderança, viram nome em lista de demissão."' },
            ] },
          { id: 'a_zeca', x: 780, kind: 'talk', label: 'Avisar Zeca', glyph: '☺',
            say: [
              { who: 'narrator', text: 'Zeca desliga a prensa por um instante para ouvir.' },
              { who: 'hero', text: 'Estádio, sábado. Sem panfleto, sem cartaz. Boca a boca.', emo: 'determined' },
            ] },
          { id: 'a_dona', x: 1200, kind: 'talk', label: 'Falar com dona Cida', glyph: '☺',
            say: [
              { who: 'narrator', text: 'Dona Cida serve o café e escuta tudo. Ela repassa recados melhor que qualquer rádio.' },
              { who: 'hero', text: 'Se a senhora contar pras mulheres da cantina, metade da fábrica sabe até a hora do almoço.', emo: 'normal' },
            ] },
          { id: 'a_panfleto', x: 1000, kind: 'clue', label: 'Recolher o jornal', glyph: '✉', hidden: true,
            say: [{ who: 'narrator', text: 'Uma folha voou do portão: "A Voz da Cidade", com um espaço em branco onde havia uma matéria. O mesmo jornal do repórter Carlos.' }],
            clue: { id: 'c_avoz', title: 'Jornal A Voz da Cidade', text: 'Edição com um vazio no lugar de uma matéria — marca da censura. As lutas se cruzam: o mesmo jornal que Carlos tenta publicar.', cat: 'documento' }, reward: { resources: 6, archive: 'censura' } },
          { id: 'a_observado', x: 1650, kind: 'look', label: 'Ver quem observa', glyph: '◉', setFlag: 'a_observado_ok',
            say: [
              { who: 'narrator', text: 'De camisa social entre os macacões, um sujeito anota num caderninho quem fala com quem. O informante do livro-caixa tem rosto.' },
              { who: 'hero', text: 'É ele. Está marcando nomes agora mesmo. Se eu insistir, entrego mais gente.', emo: 'afraid' },
            ] },
          { id: 'a_decisao', x: 1720, kind: 'choice', label: 'Continuar ou recuar', glyph: '⚑', requires: 'a_observado_ok',
            lockedSay: [{ who: 'hero', text: 'Preciso saber quem está de olho antes de decidir.' }],
            choice: { id: 'ch_antonio_aviso', prompt: 'O informante anota nomes. Continuar espalhando o recado?',
              options: [
                { key: 'recuar', label: 'Recuar e avisar só pelas mulheres da cantina', hint: 'Protege os companheiros; o recado corre mais devagar.', result: 'Você some do radar. O recado passa pela cantina, invisível ao caderninho. Ninguém novo entra na lista do informante.', suspicion: -8, setFlag: 'a_recuou' },
                { key: 'insistir', label: 'Insistir e falar com mais gente agora', hint: 'A assembleia lota — mas mais nomes vão para o caderninho.', result: 'Você corre o galpão. O estádio vai lotar. Mas o informante fecha o caderninho satisfeito: colheu meia dúzia de nomes novos, o seu entre eles.', suspicion: 18, setFlag: 'a_insistiu', reward: { resources: 6 } },
              ] } },
          { id: 'a_exit2', x: 1800, kind: 'exit', label: 'Seguir para a assembleia', glyph: '→', to: 2, gate: 'mission_m_antonio_2_done',
            lockedSay: [{ who: 'hero', text: 'O recado ainda não está completo.' }],
            say: [{ who: 'narrator', text: 'No sábado, os operários convergem para o estádio. Você vai junto — e o informante, também.' }] },
        ],
      },
      // ---------- CAPÍTULO 3 — A REUNIÃO ----------
      {
        id: 'assembleia', biome: 'union', mood: 'tense', year: 1979, worldW: 1500,
        title: 'Capítulo 3', sub: 'A assembleia',
        objective: 'Chegue à assembleia, entenda o clima — e descubra o que a segurança prepara.',
        tip: 'A segurança conversa por código no rádio. Sintonize a frequência certa para ouvir o que os poderosos combinam.',
        mission: { id: 'm_antonio_3', title: 'A assembleia', stages: [
          { objective: 'Junte-se ao comando de greve e intercepte o que a segurança combina.',
            subs: [
              { id: 'a_lider', label: 'Falar com o comando de greve', on: { t: 'prop', v: 'a_lider' } },
              { id: 'a_radio', label: 'Interceptar a transmissão da segurança', on: { t: 'solve', v: 'pz_a_radio' } },
            ],
            reward: { resources: 5 },
            say: [{ who: 'hero', text: '"Operação Tordo", dispersão ao sinal... Eles vêm. Preciso avisar o comando antes que a rua se feche.', emo: 'worried' }] },
          { objective: 'A ameaça está chegando. Defina o tom da paralisação.',
            subs: [
              { id: 'a_tom', label: 'Decidir o tom da parada', on: { t: 'choice', v: 'ch_antonio_tom' } },
            ] },
        ] },
        intro: [
          { who: 'narrator', text: 'O estádio se enche de macacões. Palavras de ordem sobem das arquibancadas. Mas, lá fora, rádios da segurança estalam num código próprio.' },
          { who: 'hero', text: 'Se eu pegar o que eles dizem no rádio, sei o que vem antes que aconteça.', emo: 'determined' },
        ],
        props: [
          { id: 'a_lider', x: 360, kind: 'talk', label: 'Falar com o comando de greve', glyph: '☺',
            say: [
              { who: 'professor', text: 'Antônio, com as provas que você trouxe, a assembleia tem argumento. Mas a polícia cercou o quarteirão.', emo: 'worried' },
              { who: 'hero', text: 'E tem informante entre nós. Vasconcelos, o senhor está na mira deles — vi seu nome no livro-caixa.', emo: 'worried' },
              { who: 'professor', text: 'Então decidimos rápido. Coragem sem prudência só enche as celas.', emo: 'worried' },
            ], setFlag: 'a_lider_ok' },
          { id: 'a_radio', x: 760, kind: 'radio', label: 'Sintonizar o rádio da segurança', glyph: '♫',
            puzzle: { id: 'pz_a_radio', kind: 'radio', title: 'A conversa dos poderosos', brief: 'A segurança fala em código. Gire o dial até captar a transmissão sob o ruído.',
              hint: 'A frequência da segurança patrimonial fica perto de 62 no dial.',
              radioTarget: 62, radioMsg: '"Tordo para base: alvo Vasconcelos confirmado. Ao sinal, dispersar a arquibancada leste. Sem farda."',
              onSolve: { setFlag: 'a_radio_ok', clue: { id: 'c_transmissao', title: 'Código da Operação Tordo', text: 'Interceptado: a segurança vai dispersar a assembleia “ao sinal”, à paisana, e conduzir Vasconcelos. Os poderosos combinam tudo por código no rádio.', cat: 'gravacao' }, archive: 'censura',
                say: [{ who: 'hero', text: 'Falam por código pra ninguém entender. Mas eu entendi. Temos minutos.', emo: 'determined' }] } } },
          { id: 'a_tom', x: 1120, kind: 'choice', label: 'Definir o tom da parada', glyph: '⚑', requires: 'a_radio_ok',
            lockedSay: [{ who: 'hero', text: 'Antes preciso ouvir o que eles combinam no rádio.' }],
            choice: { id: 'ch_antonio_tom', prompt: 'A dispersão vem aí. Como conduzir a paralisação?',
              options: [
                { key: 'aberta', label: 'Parada aberta: ocupar o estádio até o fim', hint: 'Máxima pressão e testemunhas — e máxima exposição quando eles avançarem.', result: 'A assembleia resiste de braços dados. A imprensa registra. A dispersão vira notícia — mas seu nome, e o de Vasconcelos, ficam fichados.', suspicion: 30, setFlag: 'a_publica', reward: { archive: 'operarios' } },
                { key: 'discreta', label: 'Dissolver em comissões antes do sinal', hint: 'Tira o alvo da rua; a pressão continua por dentro dos setores.', result: 'Ao primeiro sinal, a arquibancada se desfaz em pequenos grupos que somem pela cidade. Quando os agentes chegam, não há multidão — só uma pauta que já correu.', suspicion: -5, setFlag: 'a_discreta', clue: { id: 'c_comissoes', title: 'Comissões de setor', text: 'A greve pulverizada em células, difícil de mapear e de reprimir.', cat: 'objeto' } },
              ] } },
          { id: 'a_exit3', x: 1420, kind: 'exit', label: 'Sair antes do cerco fechar', glyph: '→', to: 3, gate: 'mission_m_antonio_3_done',
            lockedSay: [{ who: 'hero', text: 'Não dou as costas para a assembleia sem decidir o rumo.' }],
            say: [{ who: 'narrator', text: 'O sinal ecoa. Homens à paisana avançam pela arquibancada leste. Você precisa sumir antes de virar mais um nome conduzido.' }] },
        ],
      },
      // ---------- CAPÍTULO 4 — A FUGA ----------
      {
        id: 'fuga', biome: 'street', mood: 'heavy', year: 1979, worldW: 1750,
        title: 'Capítulo 4', sub: 'A fuga',
        objective: 'O cerco fechou. Suba pelos telhados e desapareça pelos becos antes de ser conduzido.',
        tip: 'Corra (SHIFT) e use as plataformas para ganhar altura. Se for visto, esconda-se e espere o alerta baixar para escapar.',
        mission: { id: 'm_antonio_4', title: 'A fuga', stages: [
          { objective: 'Ache a rota alta e some pelos becos sem ser pego.',
            subs: [
              { id: 'a_rota', label: 'Alcançar o telhado e mapear a saída', on: { t: 'flag', v: 'a_rota_ok' } },
              { id: 'a_evade', label: 'Despistar os agentes à paisana', on: { t: 'evade' }, optional: true },
              { id: 'a_esconde', label: 'Achar um esconderijo no beco', on: { t: 'clue', v: 'c_esconde' }, optional: true },
            ],
            reward: { resources: 6 } },
        ] },
        intro: [
          { who: 'narrator', text: 'A rua vira correria. Homens sem farda apontam para os macacões. Não dá para enfrentar — dá para sumir.' },
          { who: 'hero', text: 'Telhado, beco, e depois casa. Um pé na frente do outro.', emo: 'afraid' },
        ],
        platforms: [
          { x: 560, y: 358, w: 120, kind: 'roof' },
          { x: 720, y: 286, w: 120, kind: 'roof' },
          { x: 900, y: 262, w: 150, kind: 'roof' },
        ],
        patrols: [
          { x0: 300, x1: 820, speed: 78, kind: 'cop' },
          { x0: 1000, x1: 1500, speed: 84, kind: 'cop' },
        ],
        props: [
          { id: 'a_esconde', x: 240, kind: 'clue', label: 'Vasculhar o beco', glyph: '✉', hidden: true,
            say: [{ who: 'narrator', text: 'Atrás das latas, um vão entre muros. Dá para colar na parede e deixar a patrulha passar.' }],
            clue: { id: 'c_esconde', title: 'Vão entre muros', text: 'Esconderijo improvisado no beco: fôlego para esperar a busca esfriar.', cat: 'local' }, reward: { resources: 5 } },
          { id: 'a_rota', x: 950, py: 262, kind: 'look', label: 'Observar do telhado', glyph: '◉', setFlag: 'a_rota_ok',
            say: [
              { who: 'narrator', text: 'Do alto, a cidade se abre: a viela dos fundos leva para longe dos camburões. É por ali.' },
              { who: 'hero', text: 'Achei. Agora é descer, colar na sombra e sumir.', emo: 'determined' },
            ] },
          { id: 'a_janela', x: 1250, kind: 'window', label: 'Cortar caminho por um portão', glyph: '⊞',
            say: [{ who: 'narrator', text: 'Você pula um portão baixo e se enfia num quintal. Quando os passos passam reto, você solta o ar.' }] },
          { id: 'a_beco', x: 1650, kind: 'door', label: 'Entrar na viela dos fundos', glyph: '→', to: 4, gate: 'mission_m_antonio_4_done',
            lockedSay: [{ who: 'hero', text: 'Preciso achar a saída certa antes de me enfiar em qualquer buraco.' }],
            say: [{ who: 'narrator', text: 'A viela te engole. Atrás, o barulho da cidade fica — e você chega em casa inteiro, com as provas no bolso.' }] },
        ],
      },
      // ---------- CAPÍTULO 5 — A GREVE ----------
      {
        id: 'greve', biome: 'factory', mood: 'hope', year: 1979, worldW: 1850,
        title: 'Capítulo 5', sub: 'A greve',
        objective: 'Amanheceu o dia da paralisação. Reúna o que aprendeu e leve a greve até o fim — do seu jeito.',
        tip: 'Este é o desfecho: o que você decidiu até aqui pesa agora.',
        mission: { id: 'm_antonio_5', title: 'A greve', stages: [
          { objective: 'Prepare-se: reúna as provas e confirme o plano com o comando.',
            subs: [
              { id: 'a_dossie', label: 'Reunir o dossiê do arrocho', on: { t: 'clue', v: 'c_dossie' } },
              { id: 'a_comando', label: 'Confirmar o plano com o comando de greve', on: { t: 'prop', v: 'a_comando' } },
            ],
            reward: { resources: 5 },
            say: [{ who: 'hero', text: 'Provas na mão, gente avisada. Falta o portão — e eles trancaram.', emo: 'determined' }] },
          { objective: 'A gerência trancou os portões e pôs vigias. Ache por onde a paralisação passa.',
            subs: [
              { id: 'a_bloqueio', label: 'Entender o bloqueio da gerência', on: { t: 'flag', v: 'a_bloqueio_ok' } },
              { id: 'a_passagem', label: 'Abrir a passagem lateral para os operários', on: { t: 'prop', v: 'a_passagem' } },
            ] },
          { objective: 'No auge da tensão, decida o desfecho da paralisação.',
            subs: [
              { id: 'a_final', label: 'Decidir o desfecho da greve', on: { t: 'choice', v: 'ch_antonio_final' } },
            ] },
        ] },
        intro: [
          { who: 'narrator', text: 'Antes do apito, o pátio se enche. Ninguém bate o cartão. O silêncio das prensas é a coisa mais alta que a fábrica já ouviu.' },
          { who: 'hero', text: 'Não é só salário. É o direito de ter voz. Hoje a fábrica escuta a gente.', emo: 'determined' },
        ],
        patrols: [
          { x0: 950, x1: 1400, speed: 52, kind: 'agent' },
        ],
        props: [
          { id: 'a_dossie', x: 300, kind: 'clue', label: 'Reunir o dossiê', glyph: '▤',
            say: [{ who: 'hero', text: 'Holerite, quadro de produção, o livro-caixa e o jornal censurado. A história inteira, com prova.', emo: 'determined' }],
            clue: { id: 'c_dossie', title: 'Dossiê do arrocho', text: 'Todas as provas reunidas: o arrocho, a vigilância disfarçada e a censura. A palavra dos operários com documento por trás.', cat: 'documento' }, reward: { archive: 'diretas' } },
          { id: 'a_comando', x: 560, kind: 'talk', label: 'Confirmar com o comando', glyph: '☺',
            say: [
              { who: 'professor', text: 'Estão todos aqui, Antônio. Os portões estão trancados e há vigias no pátio. Precisamos de uma passagem.', emo: 'worried' },
              { who: 'hero', text: 'Deixa comigo. Conheço essa fábrica melhor do que quem a tranca.', emo: 'determined' },
            ], setFlag: 'a_comando_ok' },
          { id: 'a_bloqueio', x: 850, kind: 'look', label: 'Estudar o bloqueio', glyph: '◉', requires: 'a_comando_ok', setFlag: 'a_bloqueio_ok',
            lockedSay: [{ who: 'hero', text: 'Primeiro alinho o plano com o comando.' }],
            say: [
              { who: 'narrator', text: 'Cadeados novos no portão principal, dois vigias à paisana. Mas o velho portão de carga, dos fundos, ninguém lembrou de trancar.' },
              { who: 'hero', text: 'O portão de carga. É por ali que a greve sai para a rua.', emo: 'normal' },
            ] },
          { id: 'a_passagem', x: 1080, kind: 'door', label: 'Abrir o portão de carga', glyph: '▦', requires: 'a_bloqueio_ok', setFlag: 'a_passagem_ok',
            lockedSay: [{ who: 'hero', text: 'Preciso descobrir o ponto fraco do bloqueio primeiro.' }],
            say: [{ who: 'narrator', text: 'A corrente velha cede. O portão de carga range e abre — e a paralisação inteira ganha a rua, ordeira e firme.' }] },
          { id: 'a_final', x: 1400, kind: 'choice', label: 'Decidir o desfecho', glyph: '⚑', requires: 'a_passagem_ok',
            lockedSay: [{ who: 'hero', text: 'A passagem primeiro. Depois, a decisão.' }],
            choice: { id: 'ch_antonio_final', prompt: 'Os vigias avançam e a imprensa chega. Como termina a paralisação?',
              options: [
                { key: 'praca', label: 'Levar a greve em marcha até a praça, à vista de todos', hint: 'Histórico e arriscado: testemunhas demais para reprimir em silêncio — e seu nome na primeira fila.', result: 'Milhares saem em marcha. A imprensa fotografa o que a censura queria esconder. A gerência recua e negocia. Você vira referência — e alvo. A greve entra para a história do ABC.', suspicion: 30, setFlag: 'a_final_marcha', reward: { archive: 'diretas' }, clue: { id: 'c_greve_marcha', title: 'A marcha até a praça', text: 'A paralisação virou marcha pública. Pressão máxima, exposição máxima — e um recuo real da direção.', cat: 'objeto' } },
                { key: 'comissao', label: 'Encerrar por hoje e negociar por comissões', hint: 'Protege os companheiros e mantém a organização viva para a próxima rodada.', result: 'A greve se recolhe firme, sem dar alvo. As comissões sentam para negociar com a pauta que você provou. A vitória é menor no jornal, mas ninguém é conduzido — e a organização sobrevive.', suspicion: -8, setFlag: 'a_final_comissao', clue: { id: 'c_greve_negocia', title: 'Negociação por comissões', text: 'A paralisação virou mesa de negociação. Menos manchete, mais rede protegida para lutar de novo.', cat: 'objeto' } },
              ] } },
          { id: 'a_exit5', x: 1700, kind: 'exit', label: 'Encerrar a campanha', glyph: '★', to: -1, gate: 'mission_m_antonio_5_done',
            lockedSay: [{ who: 'hero', text: 'A greve ainda não teve seu desfecho.' }],
            say: [
              { who: 'narrator', text: 'DESFECHO — RECONSTITUIÇÃO EDUCATIVA.' },
              { who: 'narrator', text: 'As greves do ABC no fim dos anos 1970 desafiaram a proibição de paralisações e fortaleceram o novo sindicalismo, decisivo na reabertura política. A vigilância interna e os informantes documentados aqui foram parte real do cotidiano fábril sob a ditadura.' },
              { who: 'hero', text: 'Começou com um número que não fechava. Terminou com a fábrica inteira de pé.', emo: 'determined' },
            ] },
        ],
      },
    ],
  },


  // ============ HELENA — ESTUDANTE (bilhete → lista → reunião → passeata → depois) ============
  // Pergunta do arco: "Onde foi parar o colega desaparecido — e como proteger a lista de nomes sem entregar ninguém?"
  helena: {
    char: 'helena', name: 'Helena Rocha', role: 'Estudante universitária',
    premise: '1968. A universidade fervilha e a repressão aperta. Um colega sumiu, um bilhete com uma frequência de rádio leva a uma reunião clandestina, e uma lista com nomes de estudantes pode protegê-los — ou condená-los. Helena precisa descobrir o que houve, organizar a resposta e decidir até onde a memória vale o risco.',
    rooms: [
      // ---------- CAPÍTULO 1 — O BILHETE ----------
      {
        id: 'campus', biome: 'school', mood: 'tense', year: 1968, worldW: 1600,
        title: 'Capítulo 1', sub: 'O bilhete no caderno',
        objective: 'Sintonize a rádio clandestina indicada no bilhete, descubra a reunião e por que um colega sumiu.',
        tip: 'Observe antes de agir. Alguns achados só aparecem quando você examina o ambiente; CTRL agacha e ajuda a passar despercebida.',
        mission: { id: 'm_helena_1', title: 'O bilhete', stages: [
          { objective: 'Sintonize a frequência do bilhete e ouça o aviso da reunião.',
            subs: [
              { id: 'h_bilhete', label: 'Sintonizar a rádio clandestina', on: { t: 'solve', v: 'pz_h_reuniao' } },
            ],
            reward: { resources: 4 },
            say: [{ who: 'hero', text: '"Reunião no porão às dez." Alguém confia em mim — ou está me testando.', emo: 'determined' }] },
          { objective: 'Descubra o que aconteceu com o colega que não volta às aulas.',
            subs: [
              { id: 'h_mural', label: 'Ler o cartaz do estudante desaparecido', on: { t: 'clue', v: 'c_sumico' } },
              { id: 'h_zelador', label: 'Puxar conversa com o zelador', on: { t: 'flag', v: 'h_zelador_ok' } },
            ] },
          { objective: 'Recupere a lista de nomes antes da ronda e decida o próximo passo.',
            subs: [
              { id: 'h_lista', label: 'Recuperar a lista escondida no armário', on: { t: 'item', v: 'lista_nomes' } },
              { id: 'h_saida1', label: 'Decidir o que fazer com a lista agora', on: { t: 'choice', v: 'ch_helena_lista' } },
            ] },
        ] },
        intro: [
          { who: 'narrator', text: 'Cartazes arrancados, murmúrio nos corredores. Depois da última passeata, todo mundo fala baixo.' },
          { who: 'hero', text: 'Deixaram um bilhete no meu caderno. Só tem um número — uma frequência de rádio.', emo: 'surprised' },
        ],
        platforms: [
          { x: 1180, y: 320, w: 130, kind: 'ledge' },
        ],
        patrols: [
          { x0: 820, x1: 1300, speed: 46, kind: 'agent' },
        ],
        props: [
          { id: 'h_bilhete', x: 300, kind: 'puzzle', label: 'Sintonizar a rádio clandestina', glyph: '♫',
            puzzle: { id: 'pz_h_reuniao', kind: 'radio', title: 'A rádio clandestina', brief: 'O bilhete traz só um número: uma frequência. O movimento avisa a hora e o lugar da reunião por uma rádio clandestina. Gire o dial até o sinal ficar limpo.',
              hint: 'Gire o dial devagar. Perto de 62 kHz o chiado vira voz.',
              radioTarget: 62, radioMsg: 'REUNIAO NO PORAO AS DEZ',
              onSolve: { setFlag: 'h_msg_ok', clue: { id: 'c_reuniao', title: 'Reunião secreta', text: 'Reunião no porão às dez. Ponto de encontro do movimento estudantil, avisado pela rádio clandestina.', cat: 'local' }, archive: 'estudantes',
                say: [{ who: 'hero', text: '"Reunião no porão às dez." Então é hoje.', emo: 'determined' }] } } },
          { id: 'h_mural', x: 560, kind: 'clue', label: 'Ver o cartaz rasgado', glyph: '╤', hidden: true,
            say: [{ who: 'narrator', text: 'Sob o cartaz oficial, um outro colado às pressas: a foto de um estudante sumido há semanas. Embaixo, a rubrica de sempre — "conduzido para averiguação".' }],
            clue: { id: 'c_sumico', title: 'Estudante desaparecido', text: 'Um colega não volta às aulas há semanas. "Conduzido para averiguação" — e nunca mais devolvido.', cat: 'nome' }, reward: { resources: 6 } },
          { id: 'h_zelador', x: 800, kind: 'talk', label: 'Falar com o zelador', glyph: '☺', setFlag: 'h_zelador_ok',
            say: [
              { who: 'narrator', text: 'O zelador varre o mesmo canto há vinte minutos. Fala sem levantar os olhos do chão.' },
              { who: 'soldier', text: 'Vieram de manhãzinha, moça. Levaram o rapaz e um caderno de nomes. Eu não vi nada, entende? Não vi nada.', emo: 'afraid' },
              { who: 'hero', text: 'Um caderno de nomes. Então existe uma lista — e eles a querem.', emo: 'worried' },
            ] },
          { id: 'h_lista', x: 1240, py: 320, kind: 'reward', label: 'Pegar a lista no armário alto', glyph: '✉', hidden: true, requires: 'h_zelador_ok', setFlag: 'h_lista_ok',
            lockedSay: [{ who: 'hero', text: 'Preciso descobrir onde a lista foi parar antes de sair procurando.' }],
            say: [{ who: 'narrator', text: 'No alto do armário do grêmio, embrulhada num jornal — uma edição de "A Voz da Cidade" com um buraco de censura — está a lista dos estudantes ativos.' }],
            reward: { item: 'lista_nomes', resources: 5, archive: 'estudantes' },
            clue: { id: 'c_lista_nomes', title: 'A lista de nomes', text: 'Lista dos estudantes ativos, embrulhada num jornal censurado. Proteção ou condenação, dependendo de onde parar.', cat: 'documento' } },
          { id: 'h_saida1', x: 1440, kind: 'choice', label: 'Decidir sobre a lista', glyph: '⚑', requires: 'h_lista_ok',
            lockedSay: [{ who: 'hero', text: 'Primeiro a lista. Depois eu decido o que fazer com ela.' }],
            choice: { id: 'ch_helena_lista', prompt: 'A ronda se aproxima do grêmio. O que fazer com a lista agora?',
              options: [
                { key: 'memorizar', label: 'Copiar poucos nomes de memória e devolver a lista', hint: 'Discreto: se for revistada, não carrega prova contra ninguém.', result: 'Você grava os contatos essenciais e recoloca a lista onde estava. Se a revistarem, não encontram nada nas suas mãos.', suspicion: -6, setFlag: 'h_memorizou', clue: { id: 'c_memoria_h', title: 'Nomes de cor', text: 'Os contatos-chave guardados só na memória. Frágil como lembrança, seguro como prova.', cat: 'objeto' } },
                { key: 'levar', label: 'Levar a lista inteira para protegê-la', hint: 'Guarda todos os nomes — mas, se for pega, entrega o movimento.', result: 'Você enfia a lista sob o casaco. Todos os nomes estão com você agora — e o peso deles também.', suspicion: 14, setFlag: 'h_levou_lista', reward: { archive: 'estudantes' } },
              ] } },
          { id: 'h_exit1', x: 1560, kind: 'exit', label: 'Descer para a biblioteca', glyph: '→', to: 1, gate: 'mission_m_helena_1_done',
            lockedSay: [{ who: 'hero', text: 'Ainda não terminei o que vim fazer aqui.' }],
            say: [{ who: 'narrator', text: 'Com a lista resolvida, você desce até a biblioteca — onde alguém do movimento deixou instruções sobre a vigilância.' }] },
        ],
      },
      // ---------- CAPÍTULO 2 — A VIGILÂNCIA ----------
      {
        id: 'biblioteca', biome: 'library', mood: 'tense', year: 1968, worldW: 1550,
        title: 'Capítulo 2', sub: 'O que os arquivos escondem',
        objective: 'Descubra como a polícia política mapeia os estudantes — e quem é o alvo real.',
        tip: 'Documentos oficiais escondem a intenção em palavras técnicas. Leia até o fim antes de tocar no que denuncia.',
        mission: { id: 'm_helena_2', title: 'A vigilância', stages: [
          { objective: 'Encontre e leia o expediente que circula sobre os estudantes.',
            subs: [
              { id: 'h_ficha', label: 'Achar o expediente esquecido entre os livros', on: { t: 'clue', v: 'c_ficha_dops' } },
              { id: 'h_doc', label: 'Decifrar o que o expediente realmente ordena', on: { t: 'solve', v: 'pz_h_doc' } },
            ],
            reward: { resources: 6 },
            say: [{ who: 'hero', text: 'Não é só uma lista de presença. É um mapa de quem eles pretendem levar.', emo: 'worried' }] },
          { objective: 'Confirme com o professor quem está na mira — e por quê.',
            subs: [
              { id: 'h_prof', label: 'Falar com o Prof. Vasconcelos', on: { t: 'flag', v: 'h_prof_ok' } },
            ] },
        ] },
        intro: [
          { who: 'narrator', text: 'A biblioteca fecha cedo desde os últimos "incidentes". Entre estantes, alguém do movimento deixou um recado onde só quem procura acha.' },
          { who: 'hero', text: 'Se eles anotam nossos nomes, eu quero ver com que caneta.', emo: 'determined' },
        ],
        props: [
          { id: 'h_ficha', x: 340, kind: 'clue', label: 'Vasculhar entre os livros', glyph: '╤', hidden: true,
            say: [{ who: 'narrator', text: 'Dentro de um volume de Direito, dobrado ao meio, um expediente carimbado — esquecido por quem tinha pressa.' }],
            clue: { id: 'c_ficha_dops', title: 'Expediente da vigilância', text: 'Papel oficial que classifica estudantes por "grau de periculosidade". A burocracia da repressão, preta no branco.', cat: 'documento' } },
          { id: 'h_doc', x: 660, kind: 'puzzle', label: 'Ler o expediente com atenção', glyph: '⌗', requires: 'h_msg_ok',
            lockedSay: [{ who: 'hero', text: 'Deixa eu me situar primeiro no que está acontecendo.' }],
            puzzle: { id: 'pz_h_doc', kind: 'doc', title: 'O expediente do DOPS', brief: 'O expediente mistura rotina e ordem de prisão. Toque no NOME prioritário e na DATA da operação.',
              hint: 'Procure o nome que reaparece como "prioridade" e a data completa (dia/mês/ano).',
              docPrompt: 'Toque no NOME prioritário e na DATA da operação.',
              docText: 'SERVICO reservado acompanhamento do gremio estudantil prioridade um professor VASCONCELOS por aliciamento conduzir apos a passeata marcada para 26/06/1968 demais nomes conforme lista anexa nao alertar os visados',
              docTarget: ['VASCONCELOS', '26/06/1968'],
              onSolve: { setFlag: 'h_doc_ok', clue: { id: 'c_alvo_h', title: 'O alvo prioritário', text: 'O expediente marca o Prof. Vasconcelos como "prioridade um", a ser conduzido logo após a passeata de 26/06/1968. A lista é só o começo.', cat: 'documento' }, archive: 'estudantes',
                say: [{ who: 'hero', text: 'O professor é o alvo. E o dia é o da passeata. Eles vão usar a multidão de disfarce.', emo: 'afraid' }] } } },
          { id: 'h_prof', x: 1080, kind: 'talk', label: 'Falar com o Prof. Vasconcelos', glyph: '☺', requires: 'h_doc_ok', setFlag: 'h_prof_ok',
            lockedSay: [{ who: 'hero', text: 'Preciso entender o expediente antes de assustar o professor.' }],
            say: [
              { who: 'hero', text: 'Professor, seu nome está em primeiro lugar num expediente. Querem conduzi-lo depois da passeata.' },
              { who: 'professor', text: 'Eu sei que me observam, Helena. Já avisaram o operário Antônio a meu respeito, lá na fábrica. É tudo a mesma teia.', emo: 'worried' },
              { who: 'professor', text: 'Se a passeata acontecer, ela será a armadilha. Mas se não acontecer, calamos por medo. Coragem sem prudência só enche as celas — e prudência sem coragem também.', emo: 'worried' },
            ] },
          { id: 'h_exit2', x: 1460, kind: 'exit', label: 'Ir para a reunião no porão', glyph: '→', to: 2, gate: 'mission_m_helena_2_done',
            lockedSay: [{ who: 'hero', text: 'Ainda preciso confirmar tudo antes de descer para a reunião.' }],
            say: [{ who: 'narrator', text: 'Você desce a escada estreita até o porão combinado. Lá, o movimento decide se marcha — e como.' }] },
        ],
      },
      // ---------- CAPÍTULO 3 — A REUNIÃO ----------
      {
        id: 'porao', biome: 'home', mood: 'tense', year: 1968, worldW: 1500,
        title: 'Capítulo 3', sub: 'A reunião no porão',
        objective: 'Alinhe o plano da passeata e descubra o que a polícia prepara para o dia.',
        tip: 'A polícia coordena tudo por rádio, em código. Sintonize a frequência certa para ouvir o plano deles antes que aconteça.',
        mission: { id: 'm_helena_3', title: 'A reunião', stages: [
          { objective: 'Junte-se à organização e intercepte a comunicação da polícia.',
            subs: [
              { id: 'h_org', label: 'Alinhar o plano com a organização', on: { t: 'prop', v: 'h_org' } },
              { id: 'h_radio', label: 'Interceptar a transmissão da polícia', on: { t: 'solve', v: 'pz_h_radio' } },
            ],
            reward: { resources: 5 },
            say: [{ who: 'hero', text: '"Cerco ao dispersar, sem farda." Eles vão deixar a marcha crescer para prender melhor.', emo: 'worried' }] },
          { objective: 'Com o plano da polícia à vista, defina o trajeto da passeata.',
            subs: [
              { id: 'h_trajeto', label: 'Decidir o trajeto da passeata', on: { t: 'choice', v: 'ch_helena_trajeto' } },
            ] },
        ] },
        intro: [
          { who: 'narrator', text: 'Um porão de vela e mimeógrafo. Rostos jovens em volta de um mapa da cidade. Lá fora, um rádio da polícia estala em código.' },
          { who: 'hero', text: 'Se eu pegar o que eles dizem no rádio, a gente marcha sabendo onde não pisar.', emo: 'determined' },
        ],
        props: [
          { id: 'h_org', x: 360, kind: 'talk', label: 'Alinhar com a organização', glyph: '☺', setFlag: 'h_org_ok',
            say: [
              { who: 'narrator', text: 'O comitê estudantil discute em voz baixa. O mimeógrafo cospe panfletos ainda úmidos.' },
              { who: 'hero', text: 'O professor é alvo. Se ele for à frente, entregamos ele. Precisa ficar recuado — e a gente precisa de uma rota de saída.', emo: 'determined' },
            ] },
          { id: 'h_radio', x: 760, kind: 'radio', label: 'Sintonizar o rádio da polícia', glyph: '♫', requires: 'h_org_ok',
            lockedSay: [{ who: 'hero', text: 'Primeiro o plano com o pessoal. Depois eu ouço o outro lado.' }],
            puzzle: { id: 'pz_h_radio', kind: 'radio', title: 'O código da ronda', brief: 'A polícia combina o cerco por rádio. Gire o dial até captar a transmissão.',
              hint: 'A frequência operacional fica perto de 48 no dial.',
              radioTarget: 48, radioMsg: '"Base para ronda: deixem a passeata formar. Cerco ao dispersar, no viaduto. À paisana. Alvo prioritário conforme expediente."',
              onSolve: { setFlag: 'h_radio_ok', clue: { id: 'c_cerco', title: 'O cerco no viaduto', text: 'Interceptado: a polícia deixará a passeata crescer e fará o cerco no viaduto, no momento da dispersão, à paisana. O trajeto é tudo.', cat: 'gravacao' }, archive: 'estudantes',
                say: [{ who: 'hero', text: 'O viaduto é a ratoeira. Se a gente dispersar antes e por outro lado, o cerco fecha no vazio.', emo: 'determined' }] } } },
          { id: 'h_trajeto', x: 1120, kind: 'choice', label: 'Decidir o trajeto', glyph: '⚑', requires: 'h_radio_ok',
            lockedSay: [{ who: 'hero', text: 'Antes preciso saber onde eles vão fechar o cerco.' }],
            choice: { id: 'ch_helena_trajeto', prompt: 'O cerco será no viaduto, ao dispersar. Qual trajeto a passeata segue?',
              options: [
                { key: 'viaduto', label: 'Manter o trajeto pelo viaduto, de cara limpa', hint: 'Máximo de gente e de testemunhas — e cara a cara com o cerco planejado.', result: 'A passeata enche o viaduto. As câmeras registram tudo, mas o cerco também encontra exatamente quem procurava. É histórico — e caro.', suspicion: 26, setFlag: 'h_viaduto', reward: { archive: 'estudantes' } },
                { key: 'desvio', label: 'Desviar antes do viaduto e dispersar em células', hint: 'Tira o professor e os visados da ratoeira; a marcha vira muitas marchas.', result: 'No ponto combinado, a passeata se abre em dezenas de grupos por ruas laterais. Quando a ronda chega ao viaduto, encontra asfalto vazio e panfletos ao vento.', suspicion: -6, setFlag: 'h_desvio', clue: { id: 'c_celulas_h', title: 'Marcha em células', text: 'A passeata pulverizada em grupos pequenos, impossível de cercar num ponto só.', cat: 'objeto' } },
              ] } },
          { id: 'h_exit3', x: 1400, kind: 'exit', label: 'Subir para a passeata', glyph: '→', to: 3, gate: 'mission_m_helena_3_done',
            lockedSay: [{ who: 'hero', text: 'Não subo antes de o trajeto estar decidido.' }],
            say: [{ who: 'narrator', text: 'Ao amanhecer, os estudantes convergem para a avenida. O plano está traçado — agora é andar.' }] },
        ],
      },
      // ---------- CAPÍTULO 4 — A PASSEATA ----------
      {
        id: 'passeata', biome: 'protest', mood: 'heavy', year: 1968, worldW: 1750,
        title: 'Capítulo 4', sub: 'A passeata',
        objective: 'Atravesse a passeata mantendo os visados protegidos e decida o destino da lista.',
        tip: 'Corra (SHIFT) para acompanhar a marcha. Se a ronda te fixar, esconda-se e espere o alerta baixar para escapar.',
        mission: { id: 'm_helena_4', title: 'A passeata', stages: [
          { objective: 'Atravesse a marcha, registre a multidão e mantenha o professor recuado.',
            subs: [
              { id: 'h_frente', label: 'Manter a faixa à frente e o professor recuado', on: { t: 'prop', v: 'h_frente' } },
              { id: 'h_foto', label: 'Guardar a foto da multidão', on: { t: 'clue', v: 'c_multidao' } },
              { id: 'h_evade', label: 'Despistar a ronda à paisana', on: { t: 'evade' }, optional: true },
            ],
            reward: { resources: 6 } },
          { objective: 'No ponto do desvio, decida o destino final da lista de nomes.',
            subs: [
              { id: 'h_destino', label: 'Decidir o destino da lista', on: { t: 'choice', v: 'ch_helena_destino' } },
            ] },
        ] },
        intro: [
          { who: 'narrator', text: 'A multidão toma a avenida. Cartazes, palavras de ordem — e, à paisana, os homens do expediente misturados à gente.' },
          { who: 'hero', text: 'Firme na faixa, olho no professor, e ninguém sozinho perto do viaduto.', emo: 'determined' },
        ],
        platforms: [
          { x: 520, y: 356, w: 120, kind: 'roof' },
          { x: 700, y: 292, w: 130, kind: 'roof' },
        ],
        patrols: [
          { x0: 900, x1: 1400, speed: 80, kind: 'cop' },
          { x0: 1450, x1: 1720, speed: 74, kind: 'cop' },
        ],
        props: [
          { id: 'h_frente', x: 340, kind: 'talk', label: 'Segurar a faixa e organizar', glyph: '✉', setFlag: 'h_frente_ok',
            say: [
              { who: 'narrator', text: 'Você segura a ponta da faixa. Um grupo se anima e se junta — e você puxa o professor para o meio, longe das bordas.' },
              { who: 'hero', text: 'No meio da multidão ele é só mais um. É na beirada que eles pescam.', emo: 'determined' },
            ] },
          { id: 'h_foto', x: 780, py: 292, kind: 'clue', label: 'Guardar a foto da multidão', glyph: '╤', hidden: true,
            say: [{ who: 'narrator', text: 'Do alto de uma marquise, alguém fotografa milhares de pessoas. Prova de que não eram "poucos baderneiros", como dirá o jornal oficial.' }],
            clue: { id: 'c_multidao', title: 'Foto da multidão', text: 'Registro da passeata lotada, contradizendo a versão oficial de "pequeno grupo". A mesma foto que o Tenente Paulo veria depois num expediente.', cat: 'foto' }, reward: { archive: 'censura' } },
          { id: 'h_janela', x: 1150, kind: 'window', label: 'Cortar por uma passagem lateral', glyph: '⊞',
            say: [{ who: 'narrator', text: 'Você puxa o grupo por um portão entreaberto. Quando os homens à paisana passam reto, você solta o ar.' }] },
          { id: 'h_destino', x: 1520, kind: 'choice', label: 'Decidir o destino da lista', glyph: '⚑', requires: 'h_frente_ok',
            lockedSay: [{ who: 'hero', text: 'Primeiro atravessar em segurança. Depois, a lista.' }],
            choice: { id: 'ch_helena_destino', prompt: 'O cerco ficou para trás. E a lista de nomes — o que será dela?',
              options: [
                { key: 'destruir', label: 'Destruir a lista num beco', hint: 'Ninguém será entregue — mas perde-se o registro de quem lutou.', result: 'Você queima a lista atrás de um muro. Nenhum nome poderá ser usado contra os colegas. A memória fica só na cabeça de quem viveu.', suspicion: -10, setFlag: 'h_destruiu', clue: { id: 'c_cinzas', title: 'Cinzas no beco', text: 'A lista virou cinza. Segurança para os colegas, ao custo do registro.', cat: 'objeto' } },
                { key: 'advogada', label: 'Entregar a lista à advogada Dra. Inês', hint: 'Guarda a memória em mãos que sabem escondê-la — e usá-la para defender os presos.', result: 'Você passa a lista à Dra. Inês, que defende presos políticos. Ela a arquiva onde nenhuma busca chega. Um dia, aqueles nomes provarão quem resistiu.', suspicion: 12, setFlag: 'h_advogada', reward: { archive: 'desaparecidos' }, clue: { id: 'c_arquivo_ines', title: 'Aos cuidados da defesa', text: 'A lista guardada pela advocacia de presos políticos. Memória protegida e, um dia, prova.', cat: 'documento' } },
              ] } },
          { id: 'h_exit4', x: 1700, kind: 'exit', label: 'Sair da avenida', glyph: '→', to: 4, gate: 'mission_m_helena_4_done',
            lockedSay: [{ who: 'hero', text: 'Não deixo a passeata sem resolver a lista.' }],
            say: [{ who: 'narrator', text: 'A ronda avança sobre o viaduto vazio. Você se dissolve nas ruas laterais e some antes que a cidade se feche.' }] },
        ],
      },
      // ---------- CAPÍTULO 5 — DEPOIS ----------
      {
        id: 'esconderijo', biome: 'home', mood: 'hope', year: 1968, worldW: 1300,
        title: 'Capítulo 5', sub: 'Depois',
        objective: 'Respire, registre o que viveu e decida como seguir na luta.',
        tip: 'Este é o desfecho: o que você escolheu até aqui pesa agora.',
        mission: { id: 'm_helena_5', title: 'Depois', stages: [
          { objective: 'Registre o que viveu e decida o próximo passo.',
            subs: [
              { id: 'h_diario', label: 'Escrever no diário', on: { t: 'clue', v: 'c_diario_h' } },
              { id: 'h_seguir', label: 'Decidir como continuar', on: { t: 'choice', v: 'ch_helena_seguir' } },
            ],
            reward: { resources: 4 } },
        ] },
        intro: [
          { who: 'narrator', text: 'Um quarto emprestado. Lá fora, sirenes distantes. Aqui dentro, um caderno e a decisão de continuar.' },
          { who: 'hero', text: 'Se eu não escrever, vão dizer que nunca aconteceu.', emo: 'determined' },
        ],
        props: [
          { id: 'h_diario', x: 380, kind: 'clue', label: 'Escrever no diário', glyph: '╤',
            say: [{ who: 'hero', text: 'A passeata, a lista, o professor a salvo. Fica tudo aqui, no papel, contra o esquecimento.', emo: 'determined' }],
            clue: { id: 'c_diario_h', title: 'Diário de Helena', text: 'Relato pessoal da passeata e da reunião — memória contra o esquecimento.', cat: 'documento' }, reward: { archive: 'diretas' } },
          { id: 'h_seguir', x: 720, kind: 'choice', label: 'Decidir como continuar', glyph: '⚑', requires: 'h_msg_ok',
            choice: { id: 'ch_helena_seguir', prompt: 'A luta continua. Como você segue?',
              options: [
                { key: 'clandestina', label: 'Mergulhar na organização clandestina', hint: 'Máximo compromisso, máximo risco.', result: 'Você troca de nome e de endereço. A faculdade fica para trás; a luta, na frente. É uma vida em fuga — mas é a sua escolha.', suspicion: 20, setFlag: 'h_clandestina', reward: { archive: 'diretas' } },
                { key: 'rede', label: 'Manter a rede viva por dentro, sem se expor', hint: 'Sobreviver para lutar amanhã, tecendo a rede aos poucos.', result: 'Você volta às aulas de cara conhecida, mas por baixo mantém os fios ligados: recados, ab rigos, advogados. A resistência também se faz de paciência.', suspicion: -6, setFlag: 'h_rede', clue: { id: 'c_rede_h', title: 'A rede paciente', text: 'A resistência mantida por dentro, invisível e teimosa.', cat: 'objeto' } },
              ] } },
          { id: 'h_exit5', x: 1180, kind: 'exit', label: 'Encerrar a campanha', glyph: '★', to: -1, gate: 'mission_m_helena_5_done',
            lockedSay: [{ who: 'hero', text: 'Ainda não registrei nem decidi o meu rumo.' }],
            say: [
              { who: 'narrator', text: 'DESFECHO — RECONSTITUIÇÃO EDUCATIVA.' },
              { who: 'narrator', text: 'Em 1968, o movimento estudantil enfrentou a repressão em passeatas como a dos Cem Mil. O AI-5, decretado em dezembro daquele ano, fechou o cerco sobre estudantes, professores e a imprensa. A memória de quem resistiu ajudou a reconstruir a democracia.' },
              { who: 'hero', text: 'A gente aprende que resistir também é lembrar — e proteger quem lembra.', emo: 'determined' },
            ] },
        ],
      },
    ],
  },

  // ============ CARLOS — JORNALISTA (corte → fonte → arquivo → fechamento → consequência) ============
  // Pergunta do arco: "O que a censura cortou, quem são os doze, e como publicá-los sem condenar a fonte?"
  carlos: {
    char: 'carlos', name: 'Carlos Menezes', role: 'Repórter de A Voz da Cidade',
    premise: 'Início dos anos 1970. Uma matéria de Carlos volta da censura mutilada. Puxando o fio, ele descobre uma prisão em massa escondida, uma fonte em risco e um arquivo que liga tudo à Operação Tordo — e precisa decidir como contar a verdade sem entregar quem confiou nele.',
    rooms: [
      // ---------- CAPÍTULO 1 — O CORTE ----------
      {
        id: 'redacao', biome: 'newsroom', mood: 'tense', year: 1971, worldW: 1550,
        title: 'Capítulo 1', sub: 'O que a censura cortou',
        objective: 'Descubra o que foi alterado na sua matéria e por quem.',
        tip: 'A censura troca números e nomes por termos vagos. Compare linha a linha para achar o que sumiu.',
        mission: { id: 'm_carlos_1', title: 'O corte', stages: [
          { objective: 'Compare a sua versão com a que o censor liberou e ache a alteração.',
            subs: [
              { id: 'c_compara', label: 'Comparar original e publicado', on: { t: 'solve', v: 'pz_c_news' } },
            ],
            reward: { resources: 4 },
            say: [{ who: 'hero', text: 'Doze detidos sem mandado viraram "algumas pessoas ouvidas". Escreveram uma mentira com a minha assinatura.', emo: 'determined' }] },
          { objective: 'Entenda o risco com o editor e recupere o contato da fonte.',
            subs: [
              { id: 'c_editor', label: 'Falar com o editor-chefe', on: { t: 'flag', v: 'c_editor_ok' } },
              { id: 'c_gaveta', label: 'Recuperar o bilhete da fonte na gaveta', on: { t: 'clue', v: 'c_fonte' } },
            ] },
        ] },
        intro: [
          { who: 'narrator', text: 'Máquinas de escrever, fumaça e um envelope pardo na sua mesa: sua matéria "revisada".' },
          { who: 'hero', text: 'Devolveram cheia de buracos. Preciso saber exatamente o que sumiu — e provar.', emo: 'worried' },
        ],
        props: [
          { id: 'c_compara', x: 320, kind: 'puzzle', label: 'Comparar as duas versões', glyph: '⌗',
            puzzle: { id: 'pz_c_news', kind: 'news', title: 'Original x Publicado', brief: 'Compare a sua versão com a que o censor liberou. Toque na linha que foi ALTERADA.',
              hint: 'A censura costuma trocar números e nomes por termos vagos como "alguns" e "ouvidas".',
              newsA: ['Operação na madrugada em bairro operário', 'Doze pessoas foram detidas sem mandado', 'Familiares não têm notícias há três dias', 'Advogados pedem habeas corpus'],
              newsB: ['Operação na madrugada em bairro operário', 'Algumas pessoas foram ouvidas e liberadas', 'Familiares não têm notícias há três dias', 'Advogados pedem habeas corpus'],
              newsAnswer: 1,
              onSolve: { setFlag: 'c_corte_ok', clue: { id: 'c_corte', title: 'O corte da censura', text: '"Doze detidos sem mandado" virou "algumas pessoas ouvidas e liberadas". A censura escondeu a prisão em massa.', cat: 'documento' }, archive: 'censura',
                say: [{ who: 'hero', text: 'Doze pessoas, sem mandado. Eles transformaram isso em "conversa amigável".', emo: 'determined' }] } } },
          { id: 'c_editor', x: 680, kind: 'talk', label: 'Falar com o editor', glyph: '☺', requires: 'c_corte_ok', setFlag: 'c_editor_ok',
            lockedSay: [{ who: 'hero', text: 'Preciso saber o que cortaram antes de falar com o chefe.' }],
            say: [
              { who: 'editor', text: 'Carlos, se publicar isso, o jornal pode ser fechado. E você, preso.', emo: 'worried' },
              { who: 'hero', text: 'E se não publicar, quem vai contar? A família dessas pessoas está procurando nos necrotérios.' },
              { who: 'editor', text: 'Há formas de dizer sem dizer. Confirme na rua, proteja sua fonte, e me traga algo que o censor não consiga rasgar.', emo: 'worried' },
            ] },
          { id: 'c_gaveta', x: 1020, kind: 'clue', label: 'Vasculhar a gaveta antiga', glyph: '✉', hidden: true,
            say: [{ who: 'narrator', text: 'No fundo da gaveta, um bilhete da fonte e um envelope com uns trocados para "despesas".' }],
            reward: { resources: 12 },
            clue: { id: 'c_fonte', title: 'Bilhete da fonte', text: 'A fonte confirma os doze nomes, mas pede sigilo absoluto. Expô-la seria condená-la. Assina apenas: "O Tordo canta cedo".', cat: 'nome' } },
          { id: 'c_exit1', x: 1460, kind: 'exit', label: 'Sair para confirmar na rua', glyph: '→', to: 1, gate: 'mission_m_carlos_1_done',
            lockedSay: [{ who: 'hero', text: 'O editor ainda tem algo a dizer, e a gaveta guarda o contato.' }],
            say: [{ who: 'narrator', text: 'De gabardine e chapéu, você desce para a rua molhada. A fonte espera no ponto de sempre — se não houver quem a siga.' }] },
        ],
      },
      // ---------- CAPÍTULO 2 — A FONTE ----------
      {
        id: 'rua_c', biome: 'street', mood: 'tense', year: 1971, worldW: 1650,
        title: 'Capítulo 2', sub: 'A fonte na chuva',
        objective: 'Confirme os doze nomes com a fonte sem ser seguido.',
        tip: 'Se um agente à paisana te fixar, não vá direto à fonte: despiste primeiro, senão entrega quem confia em você.',
        mission: { id: 'm_carlos_2', title: 'A fonte', stages: [
          { objective: 'Chegue à fonte limpo — despiste quem estiver na sua cola.',
            subs: [
              { id: 'c_evade', label: 'Despistar o agente à paisana', on: { t: 'evade' } },
              { id: 'c_cartaz', label: 'Ler o cartaz de desaparecido', on: { t: 'clue', v: 'c_familia' }, optional: true },
            ] },
          { objective: 'Confirme a informação com a fonte.',
            subs: [
              { id: 'c_fonte_npc', label: 'Encontrar a fonte e confirmar os nomes', on: { t: 'flag', v: 'c_confirma_ok' } },
            ],
            reward: { resources: 5 },
            say: [{ who: 'hero', text: 'Doze nomes confirmados. E a fonte falou de um arquivo — "onde guardam o que a Tordo faz".', emo: 'determined' }] },
        ] },
        intro: [{ who: 'narrator', text: 'Chuva fina. Nos postes, cartazes de "desaparecidos". Do outro lado da rua, um homem de sobretudo lê o mesmo jornal há tempo demais.' }],
        platforms: [
          { x: 560, y: 356, w: 120, kind: 'roof' },
        ],
        patrols: [
          { x0: 700, x1: 1200, speed: 70, kind: 'agent' },
        ],
        props: [
          { id: 'c_cartaz', x: 360, kind: 'clue', label: 'Ler o cartaz de desaparecido', glyph: '╤', hidden: true,
            say: [{ who: 'narrator', text: 'Um dos rostos do cartaz coincide com um nome da lista. A família procura há dias.' }],
            clue: { id: 'c_familia', title: 'Família à procura', text: 'Um dos doze é procurado pela família. Publicar pode ajudá-la — ou expor a fonte.', cat: 'nome' }, reward: { archive: 'desaparecidos' } },
          { id: 'c_janela', x: 820, kind: 'window', label: 'Entrar num bar e sair pelos fundos', glyph: '⊞',
            say: [{ who: 'narrator', text: 'Você entra num boteco cheio e sai pela cozinha. Quando espia a rua, o sobretudo procura você onde você não está mais.' }] },
          { id: 'c_fonte_npc', x: 1300, kind: 'talk', label: 'Encontrar a fonte', glyph: '☺', needCalm: true, setFlag: 'c_confirma_ok',
            say: [
              { who: 'narrator', text: 'Sob o guarda-chuva, uma mão entrega um papel dobrado.' },
              { who: 'hero', text: 'São os doze nomes. Confirmado. E esse "Tordo" do seu bilhete?' },
              { who: 'lawyer', text: 'Operação Tordo. Está tudo num arquivo do departamento — quem levaram, quando, por ordem de quem. Se você alcançar aquilo, não é mais a minha palavra contra a deles.', emo: 'worried' },
            ],
            clue: { id: 'c_doze', title: 'Os doze nomes', text: 'Lista confirmada das doze pessoas detidas sem mandado na Operação Tordo. A fonte aponta um arquivo que prova tudo.', cat: 'documento' } },
          { id: 'c_exit2', x: 1560, kind: 'exit', label: 'Seguir até o arquivo', glyph: '→', to: 2, gate: 'mission_m_carlos_2_done',
            lockedSay: [{ who: 'hero', text: 'Sem confirmar com a fonte, não tenho matéria — tenho boato.' }],
            say: [{ who: 'narrator', text: 'A fonte some na chuva. Você segue o endereço que ela sussurrou: um arquivo que ninguém deveria alcançar.' }] },
        ],
      },
      // ---------- CAPÍTULO 3 — O ARQUIVO ----------
      {
        id: 'arquivo_c', biome: 'archive', mood: 'heavy', year: 1971, worldW: 1600,
        title: 'Capítulo 3', sub: 'O arquivo da Tordo',
        objective: 'Entre no arquivo, localize a pasta da Operação Tordo e decifre o que ela prova.',
        tip: 'CTRL agacha e te esconde entre as estantes. Pegue a credencial antes de tentar a porta reservada.',
        mission: { id: 'm_carlos_3', title: 'O arquivo', stages: [
          { objective: 'Consiga uma credencial e alcance a sala reservada sem alarme.',
            subs: [
              { id: 'c_cred', label: 'Pegar a credencial esquecida', on: { t: 'item', v: 'cred_arquivo' } },
              { id: 'c_porta', label: 'Abrir a sala reservada', on: { t: 'prop', v: 'c_porta' } },
            ],
            reward: { resources: 5 } },
          { objective: 'Localize e decifre a pasta da Operação Tordo.',
            subs: [
              { id: 'c_pasta', label: 'Decifrar a pasta da Operação Tordo', on: { t: 'solve', v: 'pz_c_doc' } },
            ],
            reward: { resources: 6 },
            say: [{ who: 'hero', text: 'Está tudo aqui: nomes, datas, a assinatura de quem mandou. A Tordo tem dono.', emo: 'determined' }] },
        ] },
        intro: [
          { who: 'narrator', text: 'Corredores de aço e papel. Um arquivo que existe para que ninguém consulte. Um vigia cochila perto da porta reservada.' },
          { who: 'hero', text: 'A fonte disse: pasta da Tordo. Se eu sair com isso, a matéria se prova sozinha.', emo: 'determined' },
        ],
        platforms: [
          { x: 900, y: 316, w: 140, kind: 'ledge' },
        ],
        patrols: [
          { x0: 600, x1: 1150, speed: 48, kind: 'agent' },
        ],
        props: [
          { id: 'c_cred', x: 320, py: 316, kind: 'reward', label: 'Pegar a credencial na estante', glyph: '⊞', hidden: true, setFlag: 'c_cred_ok',
            say: [{ who: 'narrator', text: 'Sobre a estante alta, um crachá de arquivista deixado no fim do expediente. Serve para a porta reservada.' }],
            reward: { item: 'cred_arquivo', resources: 4 } },
          { id: 'c_porta', x: 760, kind: 'door', label: 'Abrir a sala reservada', glyph: '▦', needItem: 'cred_arquivo', consumesItem: true, setFlag: 'c_porta_ok',
            lockedSay: [{ who: 'hero', text: 'Trancada. Preciso de uma credencial para passar.' }],
            say: [{ who: 'narrator', text: 'O crachá destrava a fechadura eletrônica. Lá dentro, prateleiras de pastas numeradas — e uma sem número, só um pássaro carimbado.' }] },
          { id: 'c_pasta', x: 1080, kind: 'puzzle', label: 'Examinar a pasta da Tordo', glyph: '⌗', requires: 'c_porta_ok',
            lockedSay: [{ who: 'hero', text: 'A sala reservada primeiro.' }],
            puzzle: { id: 'pz_c_doc', kind: 'doc', title: 'A pasta da Operação Tordo', brief: 'A ordem operacional está escondida na burocracia. Toque no NOME que assina e na DATA da operação.',
              hint: 'Procure quem "determina" a ação e a data completa (dia/mês/ano).',
              docPrompt: 'Toque no NOME que assina a ordem e na DATA da operação.',
              docText: 'OPERACAO TORDO relacao de conduzidos doze nomes bairro operario acao sem mandado determinada por delegado VASCONCELOS NAO o professor homonimo executada em 03/02/1971 arquivar como averiguacao de rotina',
              docTarget: ['VASCONCELOS', '03/02/1971'],
              onSolve: { setFlag: 'c_doc_ok', clue: { id: 'c_dossie_tordo', title: 'Dossiê da Operação Tordo', text: 'A ordem da Tordo, sem mandado, foi determinada por um delegado homônimo do professor — a fonte de tanta confusão de nomes. Doze conduzidos em 03/02/1971, arquivados como "rotina". Prova documental.', cat: 'documento' }, archive: 'censura',
                say: [{ who: 'hero', text: 'Um delegado Vasconcelos, homônimo do professor. É assim que fabricam confusão e prendem inocentes de tocaia.', emo: 'determined' }] } } },
          { id: 'c_exit3', x: 1520, kind: 'exit', label: 'Sair para a gráfica', glyph: '→', to: 3, gate: 'mission_m_carlos_3_done',
            lockedSay: [{ who: 'hero', text: 'Não saio daqui sem a prova na mão.' }],
            say: [{ who: 'narrator', text: 'Com a pasta fotografada, você sai antes do vigia acordar. A rotativa espera — e a decisão mais difícil ainda virá.' }] },
        ],
      },
      // ---------- CAPÍTULO 4 — O FECHAMENTO ----------
      {
        id: 'grafica', biome: 'printshop', mood: 'tense', year: 1971, worldW: 1500,
        title: 'Capítulo 4', sub: 'O fechamento',
        objective: 'Monte a edição, ouça o que a censura prepara e decida como publicar.',
        tip: 'A censura prévia avisa por rádio o que vai vigiar. Sintonize para saber o que eles esperam — e faça diferente.',
        mission: { id: 'm_carlos_4', title: 'O fechamento', stages: [
          { objective: 'Prepare a edição e descubra o que a censura vai vigiar hoje.',
            subs: [
              { id: 'c_montar', label: 'Montar a página com a prova', on: { t: 'prop', v: 'c_montar' } },
              { id: 'c_radio', label: 'Interceptar o aviso da censura', on: { t: 'solve', v: 'pz_c_radio' } },
            ],
            reward: { resources: 5 } },
          { objective: 'Com tudo em mãos, decida como a matéria vai às ruas.',
            subs: [
              { id: 'c_choice', label: 'Decidir a forma da publicação', on: { t: 'choice', v: 'ch_carlos' } },
            ] },
        ] },
        intro: [{ who: 'narrator', text: 'A rotativa espera. Tinta, chumbo e o cheiro do papel. O que você decidir aqui vira memória — ou motivo de prisão.' }],
        props: [
          { id: 'c_montar', x: 340, kind: 'talk', label: 'Montar a página', glyph: '╤', setFlag: 'c_montar_ok',
            say: [
              { who: 'narrator', text: 'Você diagrama a página: os doze nomes, as datas, o carimbo do pássaro. A prova cabe numa coluna.' },
              { who: 'hero', text: 'Cada linha aqui é uma família que vai saber onde procurar.', emo: 'determined' },
            ] },
          { id: 'c_radio', x: 700, kind: 'radio', label: 'Sintonizar a frequência da censura', glyph: '♫', requires: 'c_montar_ok',
            lockedSay: [{ who: 'hero', text: 'Deixa eu fechar a página antes de ligar o rádio.' }],
            puzzle: { id: 'pz_c_radio', kind: 'radio', title: 'O aviso da censura prévia', brief: 'A censura prévia combina o que vai apreender. Gire o dial até o sinal.',
              hint: 'A frequência da fiscalização fica perto de 55 no dial.',
              radioTarget: 55, radioMsg: '"Atenção às bancas: apreender qualquer edição que cite \'Tordo\' ou números de detidos. Liberar o resto normalmente."',
              onSolve: { setFlag: 'c_radio_ok', clue: { id: 'c_aviso_censura', title: 'O que a censura vai apreender', text: 'Interceptado: a fiscalização vai apreender edições que citem "Tordo" ou números de detidos, e liberar o resto. A metáfora passa; o número, não.', cat: 'gravacao' }, archive: 'censura',
                say: [{ who: 'hero', text: 'Se eu escrever "doze" e "Tordo", recolhem tudo. Se eu disser sem dizer... a edição chega às bancas.', emo: 'determined' }] } } },
          { id: 'c_choice', x: 1080, kind: 'choice', label: 'Decidir sobre a publicação', glyph: '⚑', requires: 'c_radio_ok',
            lockedSay: [{ who: 'hero', text: 'Preciso saber o que eles vão apreender antes de escolher a forma.' }],
            choice: { id: 'ch_carlos', prompt: 'A censura vai recolher o que citar "Tordo" ou números. Como publicar?',
              options: [
                { key: 'metafora', label: 'Publicar cifrado, em metáfora', hint: 'Escapa da apreensão; quem precisa entender, entende.', result: 'Você escreve nas entrelinhas — "doze aves não voltaram ao ninho, e o Tordo assobiou a ordem". O censor deixa passar. As bancas vendem. As famílias entendem. A fonte fica protegida.', suspicion: 6, setFlag: 'c_metafora', clue: { id: 'c_entrelinhas', title: 'Nas entrelinhas', text: 'Matéria publicada em metáfora, driblando a censura sem expor ninguém.', cat: 'documento' } },
                { key: 'aberto', label: 'Publicar tudo, com nomes e números', hint: 'Impacto máximo — e apreensão e risco máximos para todos.', result: 'A matéria completa sai em folhetos rodados de madrugada. O impacto é enorme; ao amanhecer, os fiscais recolhem as bancas e o jornal é vigiado. A fonte precisa sumir da cidade.', suspicion: 38, setFlag: 'c_aberto', reward: { archive: 'desaparecidos' } },
              ] } },
          { id: 'c_exit4', x: 1420, kind: 'exit', label: 'Ir para casa', glyph: '→', to: 4, gate: 'mission_m_carlos_4_done',
            lockedSay: [{ who: 'hero', text: 'Preciso decidir a forma da matéria antes de fechar a edição.' }],
            say: [{ who: 'narrator', text: 'A rotativa ronca. A edição está rodando. Você vai para casa — onde a família espera, e o telefone pode tocar a qualquer hora.' }] },
        ],
      },
      // ---------- CAPÍTULO 5 — A CONSEQUÊNCIA ----------
      {
        id: 'casa_c', biome: 'home', mood: 'hope', year: 1971, worldW: 1300,
        title: 'Capítulo 5', sub: 'O preço da matéria',
        objective: 'Encare a família e decida o que fazer agora que a matéria está nas ruas.',
        tip: 'Este é o desfecho: o que você decidiu até aqui pesa agora.',
        mission: { id: 'm_carlos_5', title: 'A consequência', stages: [
          { objective: 'Fale com sua companheira e decida o próximo passo.',
            subs: [
              { id: 'c_clara', label: 'Conversar com Clara', on: { t: 'flag', v: 'c_clara_ok' } },
              { id: 'c_fim', label: 'Decidir o que fazer agora', on: { t: 'choice', v: 'ch_carlos_fim' } },
            ],
            reward: { resources: 4 } },
        ] },
        intro: [
          { who: 'narrator', text: 'A matéria já está nas bancas. Em casa, o rádio ligado baixinho e um café que esfria. O telefone pode tocar a qualquer momento.' },
          { who: 'hero', text: 'Contei a verdade. Agora vem a parte em que a verdade cobra.', emo: 'worried' },
        ],
        props: [
          { id: 'c_clara', x: 360, kind: 'talk', label: 'Conversar com Clara', glyph: '☺', setFlag: 'c_clara_ok',
            say: [
              { who: 'wife', text: 'Já ligaram duas vezes e desligaram. Carlos, se te levarem, quem conta a nossa história?', emo: 'afraid' },
              { who: 'hero', text: 'Eu sei. Mas se eu calar por medo, eles já me pegaram sem sair da poltrona.', emo: 'determined' },
            ] },
          { id: 'c_fim', x: 720, kind: 'choice', label: 'Decidir o que fazer', glyph: '⚑', requires: 'c_clara_ok',
            choice: { id: 'ch_carlos_fim', prompt: 'A matéria correu. E você, o que faz agora?',
              options: [
                { key: 'ficar', label: 'Ficar e continuar publicando', hint: 'Segue na trincheira do jornal, com o alvo nas costas.', result: 'Você troca a fechadura, avisa a fonte e volta à redação na segunda. Enquanto a rotativa girar, alguém vai contar. É a sua trincheira.', suspicion: 18, setFlag: 'c_ficou', reward: { archive: 'diretas' } },
                { key: 'proteger', label: 'Tirar a família da cidade por um tempo', hint: 'Protege quem você ama; a pauta segue por outras mãos.', result: 'Você manda Clara para a casa de parentes no interior e passa a assinar com pseudônimo. A história continua — mais anônima, mais viva.', suspicion: -6, setFlag: 'c_protegeu', clue: { id: 'c_pseudonimo', title: 'Assinatura escondida', text: 'A verdade seguindo sob outro nome, para durar mais que o medo.', cat: 'objeto' } },
              ] } },
          { id: 'c_exit5', x: 1180, kind: 'exit', label: 'Encerrar a campanha', glyph: '★', to: -1, gate: 'mission_m_carlos_5_done',
            lockedSay: [{ who: 'hero', text: 'Ainda não falei com a Clara nem decidi o rumo.' }],
            say: [
              { who: 'narrator', text: 'DESFECHO — RECONSTITUIÇÃO EDUCATIVA.' },
              { who: 'narrator', text: 'Sob a censura prévia dos anos de chumbo, redações driblavam o corte com metáforas, receitas e versos — e pagavam caro quando iam longe demais. Informar tornou-se um ato de coragem e engenho. A edição de A Voz chegaria às mãos do operário Antônio, no portão da fábrica.' },
              { who: 'hero', text: 'A verdade sempre encontra uma fresta. E eu vou ficar de guarda nela.', emo: 'determined' },
            ] },
        ],
      },
    ],
  },

  // ============ BEATRIZ — ARTISTA (capa → aliados → sinal → show → fuga) ============
  // Pergunta do arco: "Como levar a música proibida ao público sem que o show seja fechado e a trupe presa?"
  beatriz: {
    char: 'beatriz', name: 'Beatriz Nunes', role: 'Música e compositora',
    premise: '1973. A censura prévia corta letras de música. Beatriz escondeu o sinal num verso que a censura tenta cortar. Para fazê-la soar num show, precisa juntar aliados na rua, combinar um sinal por rádio e decidir, no palco, entre a arte segura e a resistência — sabendo o preço de cada opção.',
    rooms: [
      // ---------- CAPÍTULO 1 — O CORTE ----------
      {
        id: 'teatro', biome: 'theater', mood: 'tense', year: 1973, worldW: 1500,
        title: 'Capítulo 1', sub: 'A letra que cortaram',
        objective: 'Descubra a mensagem oculta na capa do disco e o que o censor cortou da letra.',
        tip: 'Compare as duas colunas e toque na linha que a censura alterou ou cortou.',
        mission: { id: 'm_beatriz_1', title: 'O corte', stages: [
          { objective: 'Compare a letra original com a versão liberada pelo censor e ache o verso que foi cortado.',
            subs: [
              { id: 'b_capa', label: 'Comparar a letra com a versão do censor', on: { t: 'solve', v: 'pz_b_news' } },
            ],
            reward: { resources: 4 },
            say: [{ who: 'hero', text: '"Sussurro do tambor." Quem tiver ouvidos vai ouvir — se eu conseguir cantar.', emo: 'determined' }] },
          { objective: 'Veja o que a censura cortou e combine o essencial com o diretor.',
            subs: [
              { id: 'b_letra', label: 'Comparar a letra original com a liberada', on: { t: 'clue', v: 'c_letra_cortada' } },
              { id: 'b_diretor', label: 'Falar com o diretor do teatro', on: { t: 'flag', v: 'b_diretor_ok' } },
            ] },
        ] },
        intro: [
          { who: 'narrator', text: 'Luzes da plateia apagadas. Nos bastidores, o censor já carimbou a versão "permitida" da sua letra.' },
          { who: 'hero', text: 'Cortaram o refrão inteiro. Mas na capa do disco eu deixei uma pista.', emo: 'worried' },
        ],
        props: [
          { id: 'b_capa', x: 320, kind: 'puzzle', label: 'Comparar a letra com a versão do censor', glyph: '⌗',
            puzzle: { id: 'pz_b_news', kind: 'news', title: 'A letra e a censura', brief: 'Compare a sua letra original com a versão que o censor liberou. Toque na linha que foi CORTADA ou TROCADA — é nela que estava o sinal.',
              hint: 'Procure o verso onde o sentido mudou ou sumiu. Onde a censura apagou é onde mora a mensagem.',
              newsA: [
                'Vem que a praça é do povo, o céu é do condor',
                'No sussurro do tambor mora a nossa voz',
                'Ninguém solta a mão de ninguém no escuro',
                'Amanhã há de ser outro dia, sem temor',
              ],
              newsB: [
                'Vem que a praça é do povo, o céu é do condor',
                'Na melodia serena repousa o amor',
                'Ninguém solta a mão de ninguém no escuro',
                'Amanhã há de ser outro dia, sem temor',
              ],
              newsAnswer: 1,
              onSolve: { setFlag: 'b_capa_ok', clue: { id: 'c_sussurro', title: 'Sussurro do tambor', text: 'O verso cortado pela censura — "no sussurro do tambor mora a nossa voz" — é a senha: quando ele voltar no palco, a trupe assume a versão completa.', cat: 'codigo' }, archive: 'censura',
                say: [{ who: 'hero', text: '"Sussurro do tambor." É o verso que cortaram — e é o sinal. Falta combinar quem responde a ele.', emo: 'determined' }] } } },
          { id: 'b_letra', x: 640, kind: 'clue', label: 'Ver a letra cortada', glyph: '╤', hidden: true,
            say: [{ who: 'narrator', text: 'Lado a lado: a sua letra e a versão do censor. Onde havia "quem cala consente", ficou uma linha em branco carimbada "VETADO".' }],
            clue: { id: 'c_letra_cortada', title: 'A linha vetada', text: 'O refrão "quem cala consente" foi vetado pela censura prévia. A mensagem inteira vive nessa linha.', cat: 'documento' }, reward: { resources: 6 } },
          { id: 'b_diretor', x: 980, kind: 'talk', label: 'Falar com o diretor', glyph: '☺', requires: 'b_capa_ok', setFlag: 'b_diretor_ok',
            lockedSay: [{ who: 'hero', text: 'Preciso comparar a letra com a versão do censor antes de combinar qualquer coisa.' }],
            say: [
              { who: 'actor', text: 'Beatriz, no papel canto a versão aprovada. Mas se você der o sinal do tambor, a trupe inteira vira a letra.', emo: 'worried' },
              { who: 'hero', text: 'Então preciso de gente na plateia que entenda o sinal — e de um jeito de avisar todo mundo ao mesmo tempo.', emo: 'determined' },
            ] },
          { id: 'b_exit1', x: 1420, kind: 'exit', label: 'Sair para a rua', glyph: '→', to: 1, gate: 'mission_m_beatriz_1_done',
            lockedSay: [{ who: 'hero', text: 'Ainda preciso comparar a letra e falar com o diretor.' }],
            say: [{ who: 'narrator', text: 'Você sai pela porta dos artistas. Os convites clandestinos precisam chegar a quem sabe ouvir — sem cair na mão errada.' }] },
        ],
      },
      // ---------- CAPÍTULO 2 — OS ALIADOS ----------
      {
        id: 'rua_b', biome: 'street', mood: 'tense', year: 1973, worldW: 1650,
        title: 'Capítulo 2', sub: 'Os aliados',
        objective: 'Espalhe os convites clandestinos e encontre o músico que opera o rádio.',
        tip: 'Distribua nos pontos combinados sem juntar gente. Se um agente te fixar, despiste antes de continuar.',
        mission: { id: 'm_beatriz_2', title: 'Os aliados', stages: [
          { objective: 'Deixe os convites nos pontos certos e despiste quem observa.',
            subs: [
              { id: 'b_convite1', label: 'Deixar convite na banca de música', on: { t: 'prop', v: 'b_convite1' } },
              { id: 'b_convite2', label: 'Deixar convite no bar dos estudantes', on: { t: 'prop', v: 'b_convite2' } },
              { id: 'b_evade', label: 'Despistar o agente à paisana', on: { t: 'evade' }, optional: true },
            ],
            reward: { resources: 5 } },
          { objective: 'Encontre o músico que vai operar o rádio no dia do show.',
            subs: [
              { id: 'b_musico', label: 'Falar com o músico do rádio', on: { t: 'flag', v: 'b_musico_ok' } },
            ],
            say: [{ who: 'hero', text: 'Convites nas mãos certas, rádio combinado. Falta o sinal soar no dia.', emo: 'determined' }] },
        ] },
        intro: [{ who: 'narrator', text: 'Rua de cartazes de shows “autorizados”. Entre eles, você espalha convites que dizem uma coisa e significam outra. Um homem de óculos escuros repara demais.' }],
        platforms: [
          { x: 560, y: 356, w: 120, kind: 'roof' },
        ],
        patrols: [
          { x0: 700, x1: 1250, speed: 70, kind: 'agent' },
        ],
        props: [
          { id: 'b_convite1', x: 340, kind: 'talk', label: 'Convite na banca de música', glyph: '✉', setFlag: 'b_conv1_ok',
            say: [{ who: 'narrator', text: 'Você dobra o convite dentro de um encarte de disco. O dono da banca pisca: entendeu o recado.' }] },
          { id: 'b_convite2', x: 780, kind: 'talk', label: 'Convite no bar dos estudantes', glyph: '✉', setFlag: 'b_conv2_ok',
            say: [{ who: 'narrator', text: 'No mural do bar, entre anúncios de aluguel, o seu convite: "Sarau — tragam ouvidos". Os estudantes riem e guardam.' }] },
          { id: 'b_janela', x: 1050, kind: 'window', label: 'Cortar por uma galeria', glyph: '⊞',
            say: [{ who: 'narrator', text: 'Você entra numa galeria de lojas e sai do outro lado. Os óculos escuros perdem o seu rastro na multidão.' }] },
          { id: 'b_musico', x: 1350, kind: 'talk', label: 'Falar com o músico do rádio', glyph: '☺', needCalm: true, setFlag: 'b_musico_ok',
            say: [
              { who: 'radioman', text: 'Eu opero o rádio dos bastidores. Quando você quiser o sinal, eu ponho no ar — mas escolha bem a frequência, o censor varre o dial.', emo: 'normal' },
              { who: 'hero', text: 'Ao "sussurro do tambor", todo mundo vira a letra junto. Combinado.', emo: 'determined' },
            ] },
          { id: 'b_exit2', x: 1560, kind: 'exit', label: 'Voltar para o camarim', glyph: '→', to: 2, gate: 'mission_m_beatriz_2_done',
            lockedSay: [{ who: 'hero', text: 'Sem convites espalhados e sem o músico, não há show que resista.' }],
            say: [{ who: 'narrator', text: 'De volta ao teatro, o camarim espera — e nele, o rádio que vai carregar o sinal.' }] },
        ],
      },
      // ---------- CAPÍTULO 3 — O SINAL ----------
      {
        id: 'camarim', biome: 'camarim', mood: 'tense', year: 1973, worldW: 1400,
        title: 'Capítulo 3', sub: 'O sinal',
        objective: 'Sintonize o sinal com o músico, ensaie a troca de letra e prepare a rota de fuga.',
        tip: 'Varie a frequência devagar e preste atenção quando o ruído diminuir — é ali que o sinal mora.',
        mission: { id: 'm_beatriz_3', title: 'O sinal', stages: [
          { objective: 'Sintonize a frequência do sinal e ensaie a troca com a trupe.',
            subs: [
              { id: 'b_radio', label: 'Sintonizar a frequência do sinal', on: { t: 'solve', v: 'pz_b_radio' } },
              { id: 'b_ensaio', label: 'Ensaiar a troca de letra ao sinal', on: { t: 'prop', v: 'b_ensaio' } },
            ],
            reward: { resources: 5 } },
          { objective: 'Deixe pronta uma saída, caso o teatro seja fechado.',
            subs: [
              { id: 'b_rota', label: 'Localizar a saída dos fundos', on: { t: 'flag', v: 'b_rota_ok' } },
            ],
            say: [{ who: 'hero', text: 'Sinal na frequência, trupe pronta, saída mapeada. Agora é o palco.', emo: 'determined' }] },
        ] },
        intro: [{ who: 'narrator', text: 'Cortinas fechadas, espelho, e um rádio de válvulas zumbindo. A decisão pesa como um contrato: cantar o que mandaram ou o que a alma pede.' }],
        props: [
          { id: 'b_radio', x: 340, kind: 'radio', label: 'Sintonizar a frequência do sinal', glyph: '♫',
            puzzle: { id: 'pz_b_radio', kind: 'radio', title: 'O sinal no rádio', brief: 'O músico transmite o sinal por uma frequência combinada. Sintonize até o sinal ficar claro.',
              hint: 'A frequência combinada fica perto de 73 no dial.',
              radioTarget: 73, radioMsg: '"Ao sussurro do tambor, mude a letra. Vamos todos juntos. O censor varre acima de 80 — fique aqui embaixo."',
              onSolve: { setFlag: 'b_sinal_ok', clue: { id: 'c_sinal_radio', title: 'O sinal no rádio', text: 'Instrução por rádio clandestino: trocar a letra ao sinal do tambor, na frequência baixa que o censor não varre.', cat: 'gravacao' },
                say: [{ who: 'hero', text: 'Ao sinal do tambor... então é isso. O palco será nosso, mesmo que por três minutos.', emo: 'determined' }] } } },
          { id: 'b_ensaio', x: 720, kind: 'talk', label: 'Ensaiar a troca com a trupe', glyph: '╤', requires: 'b_sinal_ok', setFlag: 'b_ensaio_ok',
            lockedSay: [{ who: 'hero', text: 'Primeiro o sinal certo, depois o ensaio.' }],
            say: [
              { who: 'narrator', text: 'Em surdina, os músicos praticam a virada: no compasso do tambor, a letra aprovada dá lugar à verdadeira.' },
              { who: 'hero', text: 'Três batidas de tambor e a gente muda tudo. Ninguém titubeia.', emo: 'determined' },
            ] },
          { id: 'b_rota', x: 1080, kind: 'look', label: 'Mapear a saída dos fundos', glyph: '◉', requires: 'b_ensaio_ok', setFlag: 'b_rota_ok',
            lockedSay: [{ who: 'hero', text: 'Ensaio primeiro; depois cuido da saída.' }],
            say: [
              { who: 'narrator', text: 'Atrás do cenário, um corredor de serviço leva ao beco. Se a polícia entrar pela plateia, a trupe some por aqui.' },
              { who: 'hero', text: 'Corredor de serviço, beco, e a fita comigo. Se fecharem a porta, a música já saiu.', emo: 'normal' },
            ] },
          { id: 'b_exit3', x: 1300, kind: 'exit', label: 'Subir ao palco', glyph: '→', to: 3, gate: 'mission_m_beatriz_3_done',
            lockedSay: [{ who: 'hero', text: 'Sem sinal, ensaio e saída, não subo.' }],
            say: [{ who: 'narrator', text: 'A cortina vai abrir. A plateia está cheia — de quem entende o sinal e de quem veio vigiar.' }] },
        ],
      },
      // ---------- CAPÍTULO 4 — O SHOW ----------
      {
        id: 'palco', biome: 'theater', mood: 'heavy', year: 1973, worldW: 1350,
        title: 'Capítulo 4', sub: 'O show',
        objective: 'No palco, decida qual versão cantar diante da plateia e do censor.',
        tip: 'Esta é a escolha decisiva do arco: pesa o impacto contra o risco para a trupe.',
        mission: { id: 'm_beatriz_4', title: 'O show', stages: [
          { objective: 'Diante da plateia, escolha a versão do refrão.',
            subs: [
              { id: 'b_choice', label: 'Decidir a versão do show', on: { t: 'choice', v: 'ch_beatriz' } },
            ] },
        ] },
        intro: [
          { who: 'narrator', text: 'Refletores. A plateia prende a respiração. Na coxia, o censor confere a letra aprovada, lápis em riste.' },
          { who: 'hero', text: 'Uma batida de tambor separa a canção permitida da canção verdadeira.', emo: 'determined' },
        ],
        props: [
          { id: 'b_choice', x: 360, kind: 'choice', label: 'Decidir a versão do show', glyph: '⚑',
            choice: { id: 'ch_beatriz', prompt: 'O refrão vetado se aproxima. Qual versão apresentar?',
              options: [
                { key: 'censurada', label: 'A versão aprovada pelo censor', hint: 'Seguro. O show acontece; a mensagem fica só na capa, para quem decifrar.', result: 'Você canta a letra vazia. A plateia percebe o silêncio no lugar do refrão — e sorri, porque entende. A capa segue circulando, sussurrando a verdade. Arte dentro das regras, para sobreviver e voltar amanhã.', suspicion: -5, setFlag: 'b_seguro', reward: { resources: 6 }, clue: { id: 'c_silencio', title: 'O silêncio eloquente', text: 'O refrão engolido virou protesto silencioso. O que não se canta também se ouve.', cat: 'objeto' } },
                { key: 'completa', label: 'A versão completa, ao sinal do tambor', hint: 'Impacto total — e a polícia pode fechar o teatro.', result: 'Ao sinal do tambor, a trupe vira a letra: "quem cala consente" ecoa pela plateia de pé. O censor grita. Minutos depois, a polícia entra — mas a fita já está rodando, e a canção vai circular por meses.', suspicion: 40, setFlag: 'b_resistencia', reward: { archive: 'censura' }, clue: { id: 'c_show_clandestino', title: 'Show clandestino', text: 'Gravação do show com a letra completa, passando de mão em mão.', cat: 'gravacao' } },
              ] } },
          { id: 'b_exit4', x: 1180, kind: 'exit', label: 'Deixar o palco', glyph: '→', to: 4, gate: 'mission_m_beatriz_4_done',
            lockedSay: [{ who: 'hero', text: 'A plateia espera a minha escolha.' }],
            say: [{ who: 'narrator', text: 'As luzes se apagam sobre o palco. Seja aplauso ou apito de polícia, é hora de sair — e a fita vai com você.' }] },
        ],
      },
      // ---------- CAPÍTULO 5 — A SAÍDA ----------
      {
        id: 'fuga_b', biome: 'street', mood: 'heavy', year: 1973, worldW: 1600,
        title: 'Capítulo 5', sub: 'A saída',
        objective: 'Ponha a gravação a salvo, saia do cerco e decida o futuro da sua música.',
        tip: 'Corra (SHIFT) e use o beco. Se te fixarem, esconda-se e espere o alerta baixar para escapar.',
        mission: { id: 'm_beatriz_5', title: 'A saída', stages: [
          { objective: 'Leve a gravação para longe do teatro.',
            subs: [
              { id: 'b_fita', label: 'Pôr a fita a salvo com um aliado', on: { t: 'clue', v: 'c_fita_salva' } },
              { id: 'b_evade', label: 'Despistar a batida', on: { t: 'evade' }, optional: true },
            ],
            reward: { resources: 6 } },
          { objective: 'Decida o futuro da sua música.',
            subs: [
              { id: 'b_fim', label: 'Decidir o próximo passo', on: { t: 'choice', v: 'ch_beatriz_fim' } },
            ] },
        ] },
        intro: [
          { who: 'narrator', text: 'O beco atrás do teatro. Ao longe, o barulho da plateia se dispersando. A fita queima no seu bolso como uma brasa.' },
          { who: 'hero', text: 'Primeiro a fita a salvo. Ela vale mais que eu agora.', emo: 'determined' },
        ],
        platforms: [
          { x: 560, y: 356, w: 120, kind: 'roof' },
        ],
        patrols: [
          { x0: 700, x1: 1200, speed: 78, kind: 'cop' },
        ],
        props: [
          { id: 'b_fita', x: 340, kind: 'clue', label: 'Passar a fita ao aliado', glyph: '✉',
            say: [{ who: 'narrator', text: 'No portão combinado, o dono da banca estende a mão. A fita troca de bolso e some pela cidade, rumo a mil cópias.' }],
            clue: { id: 'c_fita_salva', title: 'A fita a salvo', text: 'A gravação (ou o silêncio eloquente) entregue a quem sabe copiá-la. A música agora é maior que o teatro.', cat: 'gravacao' }, reward: { archive: 'censura' } },
          { id: 'b_janela', x: 780, kind: 'window', label: 'Cortar por um quintal', glyph: '⊞',
            say: [{ who: 'narrator', text: 'Você pula um muro baixo e cola na sombra. A viatura passa reto, farol varrendo o beco vazio.' }] },
          { id: 'b_fim', x: 1180, kind: 'choice', label: 'Decidir o futuro', glyph: '⚑', requires: 'b_capa_ok',
            choice: { id: 'ch_beatriz_fim', prompt: 'A noite acabou. E a sua música — para onde vai?',
              options: [
                { key: 'exilio', label: 'Partir para o exílio e cantar lá fora', hint: 'Longe do alcance da polícia, a voz vira notícia no mundo — e saudade aqui.', result: 'Você embarca com um violo e uma mala. Do exílio, suas canções voltam em fitas contrabandeadas, mais fortes por serem proibidas.', suspicion: -8, setFlag: 'b_exilio', reward: { archive: 'diretas' } },
                { key: 'ficar', label: 'Ficar e cantar nas brechas', hint: 'Segue driblando o censor palco a palco, com o alvo nas costas.', result: 'Você troca de teatro, de nome artístico, de refrão — mas não de cidade. Enquanto houver plateia, haverá sinal do tambor.', suspicion: 16, setFlag: 'b_ficou', clue: { id: 'c_brechas', title: 'Cantar nas brechas', text: 'A resistência feita de metáfora, palco a palco, sob o nariz do censor.', cat: 'objeto' } },
              ] } },
          { id: 'b_exit5', x: 1520, kind: 'exit', label: 'Encerrar a campanha', glyph: '★', to: -1, gate: 'mission_m_beatriz_5_done',
            lockedSay: [{ who: 'hero', text: 'Ainda não pus a fita a salvo nem decidi meu rumo.' }],
            say: [
              { who: 'narrator', text: 'DESFECHO — RECONSTITUIÇÃO EDUCATIVA.' },
              { who: 'narrator', text: 'Sob a censura prévia, artistas driblavam o veto com metáforas, trocadilhos e exílio. Muitas canções proibidas viraram hinos justamente por terem sido caladas. A arte foi uma das vozes mais tenazes da resistência.' },
              { who: 'hero', text: 'Podem cortar a letra. O silêncio no lugar dela grita mais alto.', emo: 'determined' },
            ] },
        ],
      },
    ],
  },

  // ============ RICARDO — EMPRESÁRIO (pistas → cofre → confirmação → confronto → consequência) ============
  // Pergunta do arco: "Quem na diretoria repassa dados dos funcionários ao DOI-CODI — e o que fazer com a prova?"
  ricardo: {
    char: 'ricardo', name: 'Ricardo Salgado', role: 'Empresário',
    premise: '1972. Funcionários da fábrica de Ricardo somem depois de "conversas" na diretoria. Desconfiado, ele segue os números até um cofre, descobre um informante que entrega colegas ao DOI-CODI e precisa decidir o que vale mais: o negócio, a consciência ou a pele.',
    rooms: [
      // ---------- CAPÍTULO 1 — AS PISTAS ----------
      {
        id: 'escritorio', biome: 'office', mood: 'tense', year: 1972, worldW: 1550,
        title: 'Capítulo 1', sub: 'Os números que não batem',
        objective: 'Junte as pistas que revelam a combinação do cofre do diretor.',
        tip: 'Cada pista traz um número. Guarde os três: eles abrem algo que alguém quis esconder.',
        mission: { id: 'm_ricardo_1', title: 'As pistas', stages: [
          { objective: 'Reúna as três pistas numéricas espalhadas pelo escritório.',
            subs: [
              { id: 'r_seg1', label: 'Pista na agenda de reuniões', on: { t: 'clue', v: 'c_seg1' } },
              { id: 'r_seg2', label: 'Pista no arquivo de pastas', on: { t: 'clue', v: 'c_seg2' } },
              { id: 'r_seg3', label: 'Pista no organograma', on: { t: 'clue', v: 'c_seg3' } },
            ],
            reward: { resources: 6 } },
          { objective: 'Confirme a suspeita: por que há um cofre fora do registro?',
            subs: [
              { id: 'r_confirma', label: 'Examinar o cofre escondido', on: { t: 'flag', v: 'r_confirma_ok' } },
            ],
            say: [{ who: 'hero', text: 'Um cofre que não consta no inventário. Dia, pasta e setor: 1, 6, 9. Vamos ver o que guardam de mim.', emo: 'determined' }] },
        ] },
        intro: [
          { who: 'narrator', text: 'Escritório da diretoria, fim de expediente. O ar-condicionado zumbe sobre móveis caros e segredos baratos.' },
          { who: 'hero', text: 'Três funcionários "pediram demissão" depois de subir aqui. Nenhum voltou para buscar o acerto. Isso não fecha.', emo: 'worried' },
        ],
        props: [
          { id: 'r_seg1', x: 320, kind: 'clue', label: 'Ler a agenda de reuniões', glyph: '╤',
            say: [{ who: 'narrator', text: 'Na agenda, um encontro se repete: "visita — sempre no dia 1º". Sem nome do visitante.' }],
            clue: { id: 'c_seg1', title: 'O dia 1º', text: 'Um visitante sem nome comparece toda 1ª data do mês. O primeiro número: 1.', cat: 'codigo' }, setFlag: 'r_p1' },
          { id: 'r_seg2', x: 600, kind: 'clue', label: 'Ver o arquivo de pastas', glyph: '╤', hidden: true,
            say: [{ who: 'narrator', text: 'As pastas vão de 1 a 5, e há uma sexta, sem etiqueta, trancada à parte.' }],
            clue: { id: 'c_seg2', title: 'A pasta 6', text: 'Uma pasta extra, a de número 6, guardada longe das demais. O segundo número: 6.', cat: 'codigo' }, setFlag: 'r_p2' },
          { id: 'r_seg3', x: 880, kind: 'clue', label: 'Estudar o organograma', glyph: '╤',
            say: [{ who: 'narrator', text: 'No organograma, o "setor 9" não tem chefe listado — só a sigla de um órg8 externo ao lado.' }],
            clue: { id: 'c_seg3', title: 'O setor 9', text: 'Um "setor 9" fantasma, ligado a um órgão externo. O terceiro número: 9.', cat: 'codigo' }, setFlag: 'r_p3', reward: { resources: 6 } },
          { id: 'r_confirma', x: 1200, kind: 'look', label: 'Examinar o cofre escondido', glyph: '◉', requires: 'r_p3', setFlag: 'r_confirma_ok',
            lockedSay: [{ who: 'hero', text: 'Faltam pistas. Preciso dos três números antes de mexer no cofre.' }],
            say: [
              { who: 'narrator', text: 'Atrás de um quadro, um cofre de parede que não consta em inventário algum. Fechadura de três dígitos.' },
              { who: 'hero', text: '1, 6, 9. Se eu estiver certo, isto abre — e mostra quem manda de verdade nesta empresa.', emo: 'determined' },
            ] },
          { id: 'r_exit1', x: 1460, kind: 'exit', label: 'Ir até o cofre', glyph: '→', to: 1, gate: 'mission_m_ricardo_1_done',
            lockedSay: [{ who: 'hero', text: 'Sem as três pistas e sem confirmar o cofre, não adianta.' }],
            say: [{ who: 'narrator', text: 'Você encosta a porta do escritório e se aproxima do cofre. O prédio está quase vazio — quase.' }] },
        ],
      },
      // ---------- CAPÍTULO 2 — O COFRE ----------
      {
        id: 'cofre', biome: 'office', mood: 'heavy', year: 1972, worldW: 1450,
        title: 'Capítulo 2', sub: 'O dossiê',
        objective: 'Abra o cofre e descubra o que a diretoria esconde sobre os próprios funcionários.',
        tip: 'Combine os três números das pistas. Depois, leia o documento inteiro antes de tocar no que o denuncia.',
        mission: { id: 'm_ricardo_2', title: 'O cofre', stages: [
          { objective: 'Abra o cofre com a combinação das pistas.',
            subs: [
              { id: 'r_cofre', label: 'Abrir o cofre do diretor', on: { t: 'solve', v: 'pz_r_code' } },
            ],
            reward: { resources: 5 } },
          { objective: 'Leia o dossiê e entenda quem passa dados a quem.',
            subs: [
              { id: 'r_dossie', label: 'Decifrar o dossiê do informante', on: { t: 'solve', v: 'pz_r_doc' } },
            ],
            say: [{ who: 'hero', text: 'Um diretor da minha empresa entrega nomes ao DOI-CODI. Está tudo assinado. Isto é uma bomba — e ela está na minha mão.', emo: 'worried' }] },
        ] },
        intro: [{ who: 'narrator', text: 'A sala do cofre, iluminada só pela luz da rua. O quadro afastado, a fechadura à espera de três dígitos.' }],
        props: [
          { id: 'r_cofre', x: 360, kind: 'puzzle', label: 'Abrir o cofre', glyph: '⌗',
            puzzle: { id: 'pz_r_code', kind: 'code', title: 'O cofre do diretor', brief: 'Combine os números das pistas para abrir o cofre de 3 dígitos.',
              hint: 'Dia, pasta e setor: 1, 6, 9.',
              codeLen: 3, codeAnswer: '169', codeHint: 'Dia 1º, pasta 6, setor 9',
              onSolve: { setFlag: 'r_cofre_ok', clue: { id: 'c_cofre_aberto', title: 'Cofre aberto', text: 'A combinação 1-6-9 destrava o cofre. Dentro, uma pasta sem etiqueta e um dossiê datilografado.', cat: 'objeto' }, archive: 'ai5',
                say: [{ who: 'hero', text: 'Abriu. Então era mesmo isto que escondiam de mim, dentro da minha própria empresa.', emo: 'worried' }] } } },
          { id: 'r_dossie', x: 740, kind: 'puzzle', label: 'Examinar o dossiê', glyph: '⌗', requires: 'r_cofre_ok',
            lockedSay: [{ who: 'hero', text: 'Primeiro abrir o cofre.' }],
            puzzle: { id: 'pz_r_doc', kind: 'doc', title: 'O dossiê do informante', brief: 'O dossiê liga um diretor ao órgão de repressão. Toque no NOME do informante e na DATA do repasse.',
              hint: 'Procure quem "repassa" a relação e a data completa (dia/mês/ano).',
              docPrompt: 'Toque no NOME do informante e na DATA do repasse.',
              docText: 'CONFIDENCIAL relacao de operarios sindicalizados repassada ao setor 9 pelo diretor administrativo TAVARES entregue ao DOI-CODI em 08/05/1972 recompensa contratos publicos manter fora dos registros da empresa',
              docTarget: ['TAVARES', '08/05/1972'],
              onSolve: { setFlag: 'r_doc_ok', clue: { id: 'c_dossier', title: 'Dossiê do informante', text: 'O diretor Tavares repassou a relação de operários sindicalizados ao DOI-CODI em 08/05/1972, em troca de contratos públicos. Prova concreta da colaboração entre empresa e repressão.', cat: 'documento' }, archive: 'ai5',
                say: [{ who: 'hero', text: 'Tavares. Vendeu os próprios colegas por contrato. E eu apertei a mão desse homem ontem.', emo: 'worried' }] } } },
          { id: 'r_exit2', x: 1300, kind: 'exit', label: 'Sair para confirmar na rua', glyph: '→', to: 2, gate: 'mission_m_ricardo_2_done',
            lockedSay: [{ who: 'hero', text: 'Não saio sem ler o que o cofre esconde.' }],
            say: [{ who: 'narrator', text: 'Com o dossiê fotografado, você recoloca tudo no lugar. Amanhã vai seguir Tavares — e confirmar com os próprios olhos.' }] },
        ],
      },
      // ---------- CAPÍTULO 3 — A CONFIRMAÇÃO ----------
      {
        id: 'rua_r', biome: 'street', mood: 'tense', year: 1972, worldW: 1650,
        title: 'Capítulo 3', sub: 'De olho em Tavares',
        objective: 'Siga Tavares sem ser notado e confirme a quem ele entrega os nomes.',
        tip: 'Mantenha distância. Se ele te fixar, despiste; depois, sintonize o rádio para ouvir o combinado.',
        mission: { id: 'm_ricardo_3', title: 'A confirmação', stages: [
          { objective: 'Acompanhe Tavares até o ponto de encontro sem ser percebido.',
            subs: [
              { id: 'r_seguir', label: 'Observar o encontro de Tavares', on: { t: 'flag', v: 'r_seguir_ok' } },
              { id: 'r_evade', label: 'Despistar quando ele desconfiar', on: { t: 'evade' }, optional: true },
            ],
            reward: { resources: 5 } },
          { objective: 'Intercepte a combinação feita por rádio.',
            subs: [
              { id: 'r_radio', label: 'Interceptar a transmissão do encontro', on: { t: 'solve', v: 'pz_r_radio' } },
            ],
            say: [{ who: 'hero', text: '"Operação Tordo." O mesmo nome que corre nas fábricas. Tavares não é só um traidor — é uma engrenagem.', emo: 'worried' }] },
        ] },
        intro: [{ who: 'narrator', text: 'Calada da noite, bairro de depósitos. Tavares desce do carro e caminha até um portão mal iluminado. Você o segue de longe.' }],
        platforms: [
          { x: 560, y: 356, w: 120, kind: 'roof' },
        ],
        patrols: [
          { x0: 800, x1: 1300, speed: 66, kind: 'agent' },
        ],
        props: [
          { id: 'r_seguir', x: 700, kind: 'look', label: 'Observar o encontro', glyph: '◉', setFlag: 'r_seguir_ok',
            say: [
              { who: 'narrator', text: 'Da esquina, você vê Tavares entregar um envelope a um homem à paisana. Aperto de mão rápido, olhares para os lados.' },
              { who: 'hero', text: 'É ele. Entregando gente num envelope, como quem paga uma conta.', emo: 'worried' },
            ] },
          { id: 'r_janela', x: 1000, kind: 'window', label: 'Esconder-se atrás do depósito', glyph: '⊞',
            say: [{ who: 'narrator', text: 'Você se encolhe atrás de engradados. O homem à paisana varre a rua com os olhos e não vê ninguém.' }] },
          { id: 'r_radio', x: 1350, kind: 'radio', label: 'Sintonizar o rádio do encontro', glyph: '♫', requires: 'r_seguir_ok',
            lockedSay: [{ who: 'hero', text: 'Primeiro confirmar quem é o contato dele.' }],
            puzzle: { id: 'pz_r_radio', kind: 'radio', title: 'A combinação no rádio', brief: 'O contato reporta por rádio. Gire o dial até captar a transmissão.',
              hint: 'A frequência da operação fica perto de 62 no dial.',
              radioTarget: 62, radioMsg: '"Tordo confirma: lista recebida do informante da indústria. Acrescentar o professor Vasconcelos à relação. Pagamento em contratos, como combinado."',
              onSolve: { setFlag: 'r_radio_ok', clue: { id: 'c_tordo_r', title: 'A engrenagem da Tordo', text: 'Interceptado: a Operação Tordo recebe listas de informantes na indústria e paga em contratos públicos. O Prof. Vasconcelos foi acrescentado à relação. Empresa e repressão, de mãos dadas.', cat: 'gravacao' }, archive: 'ai5',
                say: [{ who: 'hero', text: 'Eles pagam em contrato o que recebem em nomes. E agora incluem um professor. Eu financio isso sem saber — ou fingindo não saber.', emo: 'worried' }] } } },
          { id: 'r_exit3', x: 1560, kind: 'exit', label: 'Voltar para a diretoria', glyph: '→', to: 3, gate: 'mission_m_ricardo_3_done',
            lockedSay: [{ who: 'hero', text: 'Preciso confirmar com meus próprios olhos e ouvidos.' }],
            say: [{ who: 'narrator', text: 'Você volta para casa com a prova viva na memória. Amanhã, na reunião de diretoria, terá de olhar Tavares nos olhos.' }] },
        ],
      },
      // ---------- CAPÍTULO 4 — O CONFRONTO ----------
      {
        id: 'diretoria', biome: 'gov', mood: 'heavy', year: 1972, worldW: 1450,
        title: 'Capítulo 4', sub: 'O confronto',
        objective: 'Diante da diretoria, decida o que fazer com a prova que você tem nas mãos.',
        tip: 'Esta é a escolha decisiva do arco: pese a justiça, o negócio e a sua própria segurança.',
        mission: { id: 'm_ricardo_4', title: 'O confronto', stages: [
          { objective: 'Encare Tavares e a diretoria — e decida o destino do dossiê.',
            subs: [
              { id: 'r_encara', label: 'Confrontar Tavares na reunião', on: { t: 'prop', v: 'r_encara' } },
              { id: 'r_choice', label: 'Decidir o destino do dossiê', on: { t: 'choice', v: 'ch_ricardo' } },
            ] },
        ] },
        intro: [
          { who: 'narrator', text: 'Sala de reuniões, mesa comprida, café e sorrisos de negócio. Tavares senta à sua frente como se nada fosse.' },
          { who: 'hero', text: 'Cada um nesta mesa lucra com o silêncio. Inclusive eu, até ontem.', emo: 'worried' },
        ],
        props: [
          { id: 'r_encara', x: 340, kind: 'talk', label: 'Confrontar Tavares', glyph: '☺', setFlag: 'r_encara_ok',
            say: [
              { who: 'hero', text: 'Tavares, o cofre. A pasta 6. O setor 9. Preciso mesmo continuar?' },
              { who: 'narrator', text: 'O sorriso de Tavares congela. Ele baixa a voz: "Você não sabe com quem está mexendo, Ricardo. Ninguém sai limpo dessa mesa."', emo: 'worried' },
            ] },
          { id: 'r_choice', x: 740, kind: 'choice', label: 'Decidir o destino do dossiê', glyph: '⚑', requires: 'r_encara_ok',
            lockedSay: [{ who: 'hero', text: 'Antes preciso olhar Tavares nos olhos.' }],
            choice: { id: 'ch_ricardo', prompt: 'A prova está com você. O que fazer com ela?',
              options: [
                { key: 'denunciar', label: 'Levar o dossiê à imprensa e à defesa dos presos', hint: 'Justiça e risco máximos: a prova sai da sua mão e vira notícia — e você, alvo.', result: 'Você entrega cópias ao repórter Carlos, de A Voz, e à advogada Dra. Inês. A denúncia ganha as ruas. A empresa treme, Tavares cai — e o seu nome entra numa lista que você preferia não integrar.', suspicion: 34, setFlag: 'r_denunciou', reward: { archive: 'ai5' }, clue: { id: 'c_denuncia_r', title: 'A denúncia pública', text: 'O dossiê nas mãos da imprensa e da defesa. A colaboração entre empresa e repressão, exposta.', cat: 'documento' } },
                { key: 'negociar', label: 'Usar a prova para afastar Tavares em silêncio', hint: 'Pragmático: o vazamento cessa, mas o sistema fica intocado — e a prova, guardada com você.', result: 'Você confronta Tavares a portas fechadas. Ele é "transferido", o repasse para. Mas a prova vira moeda no seu cofre, e a engrenagem apenas troca de peça. Você dorme mais seguro — e menos limpo.', suspicion: -6, setFlag: 'r_negociou', clue: { id: 'c_transacao', title: 'Transação silenciosa', text: 'Acordo entre elites: a verdade vira moeda de troca, não de justiça.', cat: 'documento' } },
              ] } },
          { id: 'r_exit4', x: 1300, kind: 'exit', label: 'Ir para casa', glyph: '→', to: 4, gate: 'mission_m_ricardo_4_done',
            lockedSay: [{ who: 'hero', text: 'Não saio desta mesa sem decidir.' }],
            say: [{ who: 'narrator', text: 'Você deixa a sala de reuniões. Seja qual for a escolha, a noite em casa não será tranquila.' }] },
        ],
      },
      // ---------- CAPÍTULO 5 — A CONSEQUÊNCIA ----------
      {
        id: 'casa_r', biome: 'home', mood: 'tense', year: 1972, worldW: 1300,
        title: 'Capítulo 5', sub: 'O que sobra de um homem',
        objective: 'Em casa, encare o que a sua escolha significa e decida como seguir.',
        tip: 'Este é o desfecho: o que você decidiu até aqui pesa agora.',
        mission: { id: 'm_ricardo_5', title: 'A consequência', stages: [
          { objective: 'Faça as contas do que ganhou e do que perdeu — e decida o próximo passo.',
            subs: [
              { id: 'r_espelho', label: 'Encarar-se no espelho do escritório de casa', on: { t: 'clue', v: 'c_espelho_r' } },
              { id: 'r_fim', label: 'Decidir como seguir', on: { t: 'choice', v: 'ch_ricardo_fim' } },
            ],
            reward: { resources: 4 } },
        ] },
        intro: [
          { who: 'narrator', text: 'Casa silenciosa, uísque intocado. Lá fora, um carro estacionado tempo demais na esquina.' },
          { who: 'hero', text: 'Descobri quem vende os outros. A pergunta agora é: que homem eu quero ser depois de saber.', emo: 'worried' },
        ],
        props: [
          { id: 'r_espelho', x: 360, kind: 'clue', label: 'Encarar-se no espelho', glyph: '╤',
            say: [{ who: 'hero', text: 'Lucrei com o silêncio a vida toda. Talvez saber já me obrigue a algo.', emo: 'worried' }],
            clue: { id: 'c_espelho_r', title: 'O peso de saber', text: 'Um empresário diante da própria cumplicidade. Saber, agora, tem consequência.', cat: 'objeto' }, reward: { archive: 'diretas' } },
          { id: 'r_fim', x: 720, kind: 'choice', label: 'Decidir como seguir', glyph: '⚑', requires: 'r_cofre_ok',
            choice: { id: 'ch_ricardo_fim', prompt: 'O carro na esquina não sai. Como você segue daqui?',
              options: [
                { key: 'reparar', label: 'Usar a empresa para reparar o que puder', hint: 'Reintegra famílias, financia a defesa dos presos — discreta e teimosamente.', result: 'Você passa a contratar de volta os "demitidos", a bancar advogados por baixo dos panos, a atrasar o que a repressão pede. É pouco perto do estrago — mas é o que está na sua mão.', suspicion: 10, setFlag: 'r_reparou', reward: { archive: 'diretas' } },
                { key: 'sair', label: 'Vender tudo e sair de cena', hint: 'Preserva a família; a engrenagem segue sem você.', result: 'Você liquida a participação e tira a família do país por um tempo. Lava as mãos — mas sabe que a mesa que você deixou continua servindo o mesmo café.', suspicion: -8, setFlag: 'r_saiu', clue: { id: 'c_saida_r', title: 'A saída de cena', text: 'Um homem que escolhe a própria paz e deixa a engrenagem girando. Nem toda escolha é heroísmo.', cat: 'objeto' } },
              ] } },
          { id: 'r_exit5', x: 1180, kind: 'exit', label: 'Encerrar a campanha', glyph: '★', to: -1, gate: 'mission_m_ricardo_5_done',
            lockedSay: [{ who: 'hero', text: 'Ainda não me encarei nem decidi o rumo.' }],
            say: [
              { who: 'narrator', text: 'DESFECHO — RECONSTITUIÇÃO EDUCATIVA.' },
              { who: 'narrator', text: 'Parte do empresariado apoiou e financiou o regime; setores forneceram informações sobre trabalhadores à repressão. A Comissão Nacional da Verdade (2014) documentou a colaboração entre empresas e o aparato de segurança. Nem todo poderoso é cúmplice — mas o silêncio também escolhe um lado.' },
              { who: 'hero', text: 'Descobri o preço das coisas. Agora sei quanto custa não pagar por elas.', emo: 'determined' },
            ] },
        ],
      },
    ],
  },

  // ============ PAULO — MILITAR (ordem → incongruência → casa → decisão → depois) ============
  // Pergunta do arco: "E se a ordem que eu jurei cumprir prender a pessoa errada — eu cumpro ou pergunto antes?"
  paulo: {
    char: 'paulo', name: 'Ten. Paulo Andrade', role: 'Oficial subalterno do Exército',
    premise: '1974. O Tenente Paulo recebe uma ordem de busca a um endereço suspeito. Mas o nome no papel não bate com o dono da casa — e a incongruência aponta para o Prof. Vasconcelos, inocente, como alvo. Entre a hierarquia e a consciência, Paulo precisa decidir se cumpre ou investiga — e o que fazer quando o sistema não foi feito para ser questionado.',
    rooms: [
      // ---------- CAPÍTULO 1 — A ORDEM ----------
      {
        id: 'quartel', biome: 'barracks', mood: 'tense', year: 1974, worldW: 1600,
        title: 'Capítulo 1', sub: 'O papel timbrado',
        objective: 'Entenda a ordem de busca e encontre a incongruência que ninguém deveria notar.',
        tip: 'Um documento oficial mistura rotina e irregularidade. Leia cada palavra antes de tocar na que denuncia.',
        mission: { id: 'm_paulo_1', title: 'A ordem', stages: [
          { objective: 'Leia a ordem de busca e ache a incongruência.',
            subs: [
              { id: 'p_ordem', label: 'Analisar a ordem de busca', on: { t: 'solve', v: 'pz_p_doc' } },
            ],
            reward: { resources: 4 },
            say: [{ who: 'hero', text: '"Buscar o sargento" na casa do professor. Isso é erro ou é a intenção disfarçada?', emo: 'worried' }] },
          { objective: 'Confirme a suspeita com quem pode ter visto.',
            subs: [
              { id: 'p_cabo', label: 'Puxar conversa com o cabo de ronda', on: { t: 'flag', v: 'p_cabo_ok' } },
              { id: 'p_relatorio', label: 'Ler o relatório do DOI-CODI anexo', on: { t: 'clue', v: 'c_relat_doi' } },
            ] },
        ] },
        intro: [
          { who: 'narrator', text: 'Madrugada no quartel. Papel timbrado, ordem assinada. O nome está certo — mas o endereço não.' },
          { who: 'hero', text: 'O nome é outro. Será erro de datilografia, ou estão mandando eu prender a pessoa errada de propósito?', emo: 'worried' },
        ],
        props: [
          { id: 'p_ordem', x: 300, kind: 'puzzle', label: 'Analisar a ordem de busca', glyph: '⌗',
            puzzle: { id: 'pz_p_doc', kind: 'doc', title: 'A ordem de busca', brief: 'A ordem cita um endereço e um nome. Toque na INCONGRUÊNCIA.',
              hint: 'A ordem diz "Sgt. Lima", mas o endereço é da residência do Prof. Vasconcelos. Coincidência?',
              docPrompt: 'Toque no NOME que não combina com o restante da ordem.',
              docText: 'ORDEM DE BUSCA E APREENSAO Autorizada diligencia no endereço Rua das Acácias 42, residência do Professor VASCONCELOS. Objetivo: localizar e conduzir Sgt. Lima, suspeito de subversão, conforme relatório DOI-CODI/SP. Assinado: Cap. Mendes',
              docTarget: ['VASCONCELOS'],
              onSolve: { setFlag: 'p_incon_ok', clue: { id: 'c_alvo_errado', title: 'Alvo errado', text: 'A ordem visa o Sgt. Lima, mas busca no endereço do Prof. Vasconcelos. O nome é pretexto; o professor é o alvo real.', cat: 'documento' }, archive: 'ai5',
                say: [{ who: 'hero', text: 'A ordem busca um sargento, mas o endereço é de um professor. Isso é muito conveniente.', emo: 'determined' }] } } },
          { id: 'p_cabo', x: 640, kind: 'talk', label: 'Falar com o cabo', glyph: '☺', setFlag: 'p_cabo_ok', reward: { resources: 6 },
            say: [
              { who: 'hero', text: 'Cabo, a ordem do capitão... você notou o nome?' },
              { who: 'narrator', text: 'O cabo olha os dois lados do corredor antes de responder.' },
              { who: 'soldier', text: 'Eu vi. Mas eu não vi, entende, tenente?', emo: 'afraid' },
            ] },
          { id: 'p_relatorio', x: 980, kind: 'clue', label: 'Ler o relatório anexo', glyph: '╤', hidden: true,
            say: [{ who: 'narrator', text: 'Relatório DOI-CODI: "Vasconcelos promove encontros estudantis em residência." — O jargão da repressão vendo conspiração onde havia aula.' }],
            clue: { id: 'c_relat_doi', title: 'Relatório do DOI-CODI', text: 'Vasconcelos é monitorado como "facilitador subversivo". Um encontro de estudo, na linguagem da repressão, é aliciamento.', cat: 'documento' } },
          { id: 'p_exit1', x: 1500, kind: 'exit', label: 'Seguir para o endereço', glyph: '→', to: 1, gate: 'mission_m_paulo_1_done',
            lockedSay: [{ who: 'hero', text: 'Preciso entender esta ordem antes de sair do quartel.' }],
            say: [{ who: 'narrator', text: 'Você sai de farda e de dúvida. No endereço da ordem, a resposta — ou a confirmação.' }] },
        ],
      },
      // ---------- CAPÍTULO 2 — A CASA ----------
      {
        id: 'casa_p', biome: 'home', mood: 'heavy', year: 1974, worldW: 1450,
        title: 'Capítulo 2', sub: 'O que a casa esconde',
        objective: 'Na casa de Vasconcelos, encontre provas de inocência e decida o que fazer.',
        tip: 'Uma fotografia pode contar o que o papel timbrado omite. Examine com cuidado.',
        mission: { id: 'm_paulo_2', title: 'A casa', stages: [
          { objective: 'Examine a casa e encontre a prova de que Vasconcelos é inocente.',
            subs: [
              { id: 'p_bilhete', label: 'Ler o bilhete debaixo da porta', on: { t: 'clue', v: 'c_bilhete_p' } },
              { id: 'p_foto', label: 'Examinar a fotografia encontrada', on: { t: 'solve', v: 'pz_p_photo' } },
            ],
            reward: { resources: 5 },
            say: [{ who: 'hero', text: 'Na foto, ele está na passeata — como espectador. A ordem é pretexto para prender inocente.', emo: 'afraid' }] },
          { objective: 'Com a prova nas mãos, decida: cumprir ou proteger.',
            subs: [
              { id: 'p_choice', label: 'Decidir diante da ordem', on: { t: 'choice', v: 'ch_paulo' } },
            ] },
        ] },
        intro: [
          { who: 'narrator', text: 'Uma casa simples. O sino toca sem resposta. Sob o tapete, um bilhete que alguém não teve tempo de levar.' },
          { who: 'hero', text: 'Se ele é inocente, não preciso bater — posso dar cinco minutos de aviso. Mas cinco minutos é desobediência.', emo: 'worried' },
        ],
        props: [
          { id: 'p_bilhete', x: 300, kind: 'clue', label: 'Ler o bilhete na mesa', glyph: '╤',
            say: [{ who: 'narrator', text: 'No bilhete, recado do grêmio estudantil: "Professor, não vá à passeata de amanhã. Eles marcaram você." — a mesma data que Helena interceptou.' }],
            clue: { id: 'c_bilhete_p', title: 'Aviso que não chegou', text: 'Bilhete do movimento estudantil alertando Vasconcelos: a passeata é armadilha. Ele foi marcado — e avisado tarde demais.', cat: 'documento' } },
          { id: 'p_foto', x: 640, kind: 'puzzle', label: 'Examinar a fotografia', glyph: '⌗', requires: 'p_incon_ok',
            lockedSay: [{ who: 'hero', text: 'Preciso saber o que estou procurando antes de examinar.' }],
            puzzle: { id: 'pz_p_photo', kind: 'photo', title: 'Fotografia encontrada', brief: 'Na foto há uma multidão e algo fora do lugar. Examine com cuidado e toque no detalhe.',
              hint: 'Procure no canto esquerdo inferior da foto.',
              photoScene: 'passeata', photoHot: [0.15, 0.78, 0.08], photoPrompt: 'Toque no detalhe suspeito na fotografia.',
              onSolve: { setFlag: 'p_foto_ok', clue: { id: 'c_passeata_foto', title: 'Foto da passeata', text: 'A multidão de estudantes. O professor Vasconcelos está lá — como espectador, não organizador. A ordem é pretexto.', cat: 'foto' }, archive: 'estudantes',
                say: [{ who: 'hero', text: 'Ele estava na passeata, não a organizou. Estão prendendo inocentes — e eu sou a mão que entrega.', emo: 'afraid' }] } } },
          { id: 'p_choice', x: 960, kind: 'choice', label: 'Decidir diante da ordem', glyph: '⚑', requires: 'p_foto_ok',
            lockedSay: [{ who: 'hero', text: 'Sem a prova na mão, eu não tenho argumento — só insubordinação.' }],
            choice: { id: 'ch_paulo', prompt: 'Vasconcelos é inocente. O que fazer?',
              options: [
                { key: 'cumprir', label: 'Cumprir a ordem e conduzir Vasconcelos', hint: 'Hierarquia. Você não é juiz — mas uma pessoa vai sofrer.', result: 'Você bate à porta. Vasconcelos abre, sem entender. Você o conduz. Na delegacia, ninguém pergunta se ele é inocente. O sistema não foi projetado para isso.', suspicion: -10, setFlag: 'p_cumpriu', reward: { archive: 'desaparecidos' } },
                { key: 'alertar', label: 'Alertar Vasconcelos e liberar a casa', hint: 'Consciência. Mas você desobedeceu uma ordem direta.', result: 'Você dá cinco minutos ao professor. Ele some pela porta dos fundos. Na manhã seguinte, um oficial quer saber por que a casa estava vazia.', suspicion: 35, setFlag: 'p_alertou', clue: { id: 'c_porta_fundos', title: 'Pela porta dos fundos', text: 'Vasconcelos escapou. Você se tornou alvo.', cat: 'nome' } },
              ] } },
          { id: 'p_exit2', x: 1320, kind: 'exit', label: 'Voltar ao quartel', glyph: '★', to: 2, gate: 'mission_m_paulo_2_done',
            lockedSay: [{ who: 'hero', text: 'Não saio sem tomar uma decisão.' }],
            say: [{ who: 'narrator', text: 'Seja como for, o que você fizer agora tem nome: obediência ou traição. Depende de quem conta.' }] },
        ],
      },
      // ---------- CAPÍTULO 3 — O INTERROGATÓRIO ----------
      {
        id: 'interrog', biome: 'police', mood: 'dark', year: 1974, worldW: 1400,
        title: 'Capítulo 3', sub: 'A cela que virou teatro',
        objective: 'No interrogatório de um preso, encontre a conexão com sua ordem.',
        tip: 'Quem está na outra mesa pode ser o elo que falta. Ou a prova de que a máquina não distingue.',
        mission: { id: 'm_paulo_3', title: 'O interrogatório', stages: [
          { objective: 'Participe do interrogatório e descubra o que ele revela.',
            subs: [
              { id: 'p_cela', label: 'Entrar na sala de interrogatório', on: { t: 'flag', v: 'p_cela_ok' } },
              { id: 'p_preso', label: 'Ouvir o depoimento do detido', on: { t: 'clue', v: 'c_depo_preso' } },
            ],
            reward: { resources: 6 } },
          { objective: 'Conecte o que ouviu com o que já sabe.',
            subs: [
              { id: 'p_juntar', label: 'Juntar as peças', on: { t: 'clue', v: 'c_puzzle_p' } },
            ] },
        ] },
        intro: [
          { who: 'narrator', text: 'Uma sala sem janelas. Lâmpada branca. Na mesa, um homem algemado.' },
          { who: 'hero', text: 'E se o nome dele for o que está no lugar errado da minha ordem?', emo: 'afraid' },
        ],
        props: [
          { id: 'p_cela', x: 280, kind: 'talk', label: 'Entrar na sala', glyph: '☺', setFlag: 'p_cela_ok', reward: { resources: 3 },
            say: [
              { who: 'hero', text: 'Nome e patente.' },
              { who: 'soldier', text: 'Sgt. Lima. Designado para o DOI-CODI.' },
              { who: 'hero', text: 'O sargento Lima. O nome na minha ordem. Mas ele está aqui — não em casa do professor.', emo: 'surprised' },
            ] },
          { id: 'p_preso', x: 600, kind: 'clue', label: 'Ouvir o depoimento', glyph: '╤', requires: 'p_cela_ok',
            lockedSay: [{ who: 'hero', text: 'Preciso estar na sala primeiro.' }],
            say: [
              { who: 'narrator', text: 'Lima fala devagar, marcando cada palavra com medo.' },
              { who: 'soldier', text: 'Eu emprestei minha casa pra um professor dar aula. Só isso. A aula era sobre constitucionalismo.', emo: 'afraid' },
              { who: 'hero', text: 'A "casa do Sgt. Lima" é o endereço do professor. Eles usaram o nome do militar para chegar no civil.', emo: 'determined' },
            ],
            clue: { id: 'c_depo_preso', title: 'O depoimento do sargento', text: 'Lima cedeu sua casa para aulas de Vasconcelos. A ordem usa o nome do militar como pretexto para alcançar o professor.', cat: 'documento' } },
          { id: 'p_juntar', x: 920, kind: 'clue', label: 'Juntar as peças', glyph: '╤', requires: 'p_cela_ok',
            lockedSay: [{ who: 'hero', text: 'Preciso ouvir o depoimento antes de conectar.' }],
            say: [
              { who: 'hero', text: 'Vasconcelos dava aula na casa do Lima. Lima já está preso. A ordem é fachada — querem o professor.', emo: 'determined' },
              { who: 'narrator', text: 'A peça se encaixa: Vasconcelos, Carlos (que também o vigia), e o nome de Lima no meio. O sistema devora quem cruza a linha.' },
            ],
            clue: { id: 'c_puzzle_p', title: 'O encaixe', text: 'A ordem de busca usa o nome de Lima como passagem para Vasconcelos. Carlos, o infiltrado de Carlinhos, vigia o professor. A máquina trabalha por justaposição.', cat: 'objeto' }, reward: { archive: 'infiltração' } },
          { id: 'p_exit3', x: 1260, kind: 'exit', label: 'Sair do interrogatório', glyph: '→', to: 3, gate: 'mission_m_paulo_3_done',
            lockedSay: [{ who: 'hero', text: 'Não saio sem entender o que vi aqui.' }],
            say: [{ who: 'narrator', text: 'O que você viu naquela sala muda o significado de toda ordem que você já cumpriu.' }] },
        ],
      },
      // ---------- CAPÍTULO 4 — O ROMPIMENTO ----------
      {
        id: 'despacho', biome: 'office', mood: 'stern', year: 1974, worldW: 1350,
        title: 'Capítulo 4', sub: 'A linha que não se cruza',
        objective: 'No gabinete, enfrente o superior e decida o preço da consciência.',
        tip: 'Você pode mentir — mas mentira tem prazo de validade. Você pode calar — mas silêncio vira cumplicidade.',
        mission: { id: 'm_paulo_4', title: 'O rompimento', stages: [
          { objective: 'Compareça ao gabinete e enfrente o capitão.',
            subs: [
              { id: 'p_gabinete', label: 'Entrar no gabinete do capitão', on: { t: 'flag', v: 'p_gab_ok' } },
              { id: 'p_mascara', label: 'Decidir o que vai contar', on: { t: 'choice', v: 'ch_paulo_mascara' } },
            ], reward: { resources: 6 } },
        ] },
        intro: [
          { who: 'narrator', text: 'Gabinete com duas cadeiras. Na mesa, o prontuário de Vasconcelos e o relatório da diligência.' },
          { who: 'hero', text: 'A cadeira de frente pra mesa é a do subordinado. É nela que eu tô agora.', emo: 'worried' },
        ],
        props: [
          { id: 'p_gabinete', x: 320, kind: 'talk', label: 'Entrar no gabinete', glyph: '☺', setFlag: 'p_gab_ok', reward: { resources: 3 },
            say: [
              { who: 'hero', text: 'Senhor, o detido estava na casa. Mas o alvo...' },
              { who: 'colonel', text: 'Alvo? O alvo é quem a ordem diz, tenente. O resto é politica — e politica nao é o seu posto.' },
              { who: 'hero', text: 'Ele é um professor. O sargento já está preso. A ordem é um pretexto.', emo: 'determined' },
              { who: 'colonel', text: 'Pretexto é uma palavra grande pra um tenente. Cuide do seu nariz.', emo: 'angry' },
            ] },
          { id: 'p_mascara', x: 700, kind: 'choice', label: 'Decidir o que vai contar', glyph: '⚑', requires: 'p_gab_ok',
            lockedSay: [{ who: 'hero', text: 'Preciso ouvir o que o capitão tem a dizer antes.' }],
            choice: { id: 'ch_paulo_mascara', prompt: 'O capitão quer o relatório. O que você inclui?',
              options: [
                { key: 'omitir', label: 'Omitir a incongruência', hint: 'Silêncio seletivo. Protege você; entrega Vasconcelos.', result: 'Você escreve o relatório limpo. Vasconcelos é preso na próxima diligência. Você continua na ativa — com a memória pesando.', suspicion: -15, setFlag: 'p_omitir', clue: { id: 'c_omissao', title: 'Omissão', text: 'Um relatório sem a incongruência. O crime de omissão é invisível — até a história contar.', cat: 'documento' } },
                { key: 'denunciar', label: 'Registrar a incongruência no relatório', hint: 'Verdade oficial. Você marca o sistema — o sistema marca você.', result: 'Você anota o erro no relatório. O capitão lê, engole seco e arquiva. Na semana seguinte, sua transferência sai. Mas o documento existe.', suspicion: 50, setFlag: 'p_denunciou', reward: { archive: 'desaparecidos' } },
              ] } },
          { id: 'p_prontuario', x: 1000, kind: 'clue', label: 'Vasconcelos no prontuário', glyph: '╤', hidden: true,
            say: [{ who: 'narrator', text: 'Prontuário: Vasconcelos, professor de direito, observado desde 1969. Membro do "grupo de estudos constitucionais". O grampo telefônico registrou ligações com Helena Moura — a mesma jornalista que Ricardo paga para vigiar.' }],
            clue: { id: 'c_prontuario_v', title: 'Vasconcelos no prontuário', text: 'Os arquivos da repressão conectam Vasconcelos a Helena Moura. Ricardo Salgado, por sua vez, vigia a mesma jornalista por interesse empresarial. Os fios se cruzam.', cat: 'documento' } },
          { id: 'p_exit4', x: 1260, kind: 'exit', label: 'Sair do gabinete', glyph: '→', to: 4, gate: 'mission_m_paulo_4_done',
            lockedSay: [{ who: 'hero', text: 'Não saio sem enfrentar o capitão.' }],
            say: [{ who: 'narrator', text: 'Seja mentiroso ou honesto, o que você faz aqui define o que você é daqui em diante.' }] },
        ],
      },
      // ---------- CAPÍTULO 5 — O DEPOIS ----------
      {
        id: 'rua_p', biome: 'street', mood: 'melancholy', year: 1974, worldW: 1300,
        title: 'Capítulo 5', sub: 'O que resta de uma farda',
        objective: 'Na rua, encare o que a sua escolha transformou e decida como seguir.',
        tip: 'Este é o desfecho: uniforme não protege da consciência.',
        mission: { id: 'm_paulo_5', title: 'O depois', stages: [
          { objective: 'Vasconcelos foi preso ou escapou. Encare o resultado.',
            subs: [
              { id: 'p_rua', label: 'Caminhar pela rua que mudou de significado', on: { t: 'clue', v: 'c_rua_p' } },
              { id: 'p_fim', label: 'Decidir o que fazer com a farda', on: { t: 'choice', v: 'ch_paulo_fim' } },
            ],
            reward: { resources: 4 } },
        ] },
        intro: [
          { who: 'narrator', text: 'Rua de pouco movimento. O uniforme, que antes era orgulho, agora pesa.' },
          { who: 'hero', text: 'Eu fiz o que me mandaram. Ou não fiz. O resultado é o espelho.', emo: 'worried' },
        ],
        props: [
          { id: 'p_rua', x: 360, kind: 'clue', label: 'Caminhar pela rua', glyph: '╤',
            say: [
              { who: 'narrator', text: 'A rua onde Vasconcelos dava aula está vazia. A placa da residência foi arrancada. Na vitrine da padaria, a manchete do jornal: "Forças armadas neutralizam ameaça subversiva." Onde havia constituição, agora há silêncio.', emo: 'worried' },
              { who: 'hero', text: 'Eu era a "força armada". Eu "neutralizei". A linguagem torna tudo aceitável — até o inaceitável.', emo: 'afraid' },
            ],
            clue: { id: 'c_rua_p', title: 'O que a linguagem esconde', text: 'Manchete: "neutralizar". Relatório: "conduzir". Ordem: "buscar". O vocabulário militar veste a violência de legitimidade.', cat: 'documento' } },
          { id: 'p_fim', x: 720, kind: 'choice', label: 'O que fazer com a farda', glyph: '⚑',
            choice: { id: 'ch_paulo_fim', prompt: 'O espelho é a rua. O que você faz agora?',
              options: [
                { key: 'pedir_baixa', label: 'Pedir baixa e deixar a carreira', hint: 'Abandona a hierarquia; perde a proteção do uniforme. Ganha a consciência.', result: 'Você entrega a farda. Na mesa do capitão, o pedido de baixa vira "problema disciplinar". Você sai — mas não antes de copiar o prontuário de Vasconcelos e entregá-lo a quem pode usá-lo. Um ex-militar com documentos é perigoso.', suspicion: 25, setFlag: 'p_baixou', reward: { archive: 'desaparecidos' } },
                { key: 'ficar', label: 'Continuar e tentar mudar de dentro', hint: 'Fica na engrenagem; tenta proteger o que pode — devagar, disfarçadamente.', result: 'Você veste a farda de novo. Amanhã, outra ordem, outro nome. Mas entre as ordens, você começa a filtrar — atrasar diligências, omitir endereços, dar "cinco minutos" quando pode. Resistência silenciosa, compasso a compasso.', suspicion: -5, setFlag: 'p_ficou', clue: { id: 'c_farda', title: 'A farda que protege e prende', text: 'Alguns militares tentaram frear abusos de dentro. Foram poucos, e o custo foi alto. Mas a máquina não é monolítica.', cat: 'objeto' } },
              ] } },
          { id: 'p_exit5', x: 1180, kind: 'exit', label: 'Encerrar a campanha', glyph: '★', to: -1, gate: 'mission_m_paulo_5_done',
            lockedSay: [{ who: 'hero', text: 'Ainda não enfrentei o que fiz.' }],
            say: [
              { who: 'narrator', text: 'DESFECHO — INCONGRUÊNCIA CONSTITUCIONAL.' },
              { who: 'narrator', text: 'As Forças Armadas foram peça central do regime: executavam detenções, vigiavam cidadãos, sustentavam a censura. Mas dentro do quartel havia tenentes e sargentos que questionavam — poucos, e em silêncio. Alguns foram expulsos; outros, silenciados. O Exército não foi monólito — e a história registra quem resistiu, mesmo de farda.' },
              { who: 'hero', text: 'A ordem vinha de cima. Mas de baixo também se pode olhar para cima — e recusar.', emo: 'determined' },
            ] },
        ],
      },
    ],
  },

  // ============ MARIA — CIVIL (ausência → busca → rede → arquivo → praça) ============
  // Pergunta do arco: "Quando o Estado diz que meu irmão nunca foi preso, como eu provo que ele existiu?"
  maria: {
    char: 'maria', name: 'Maria dos Santos', role: 'Operária e irmã',
    premise: '1964. O golpe estourou há poucos dias e o irmão de Maria, José, um operário sindicalizado, não voltou para casa. A polícia diz que ele nunca foi preso. Maria sabe que foi. Sem advogado, sem dinheiro, sem poder, ela sai atrás do irmão — e descobre que a busca de uma pessoa comum vira uma guerra contra o esquecimento oficial.',
    rooms: [
      // ---------- CAPÍTULO 1 — A AUSÊNCIA ----------
      {
        id: 'casa_m', biome: 'home', mood: 'tense', year: 1964, worldW: 1500,
        title: 'Capítulo 1', sub: 'A cama que ninguém desfez',
        objective: 'José não voltou. Reconstrua a última noite dele antes de sair à procura.',
        tip: 'Um papel amassado no lixo pode dizer mais que o silêncio da casa. Procure sem pressa.',
        mission: { id: 'm_maria_1', title: 'A ausência', stages: [
          { objective: 'Encontre a última pista que José deixou em casa.',
            subs: [
              { id: 'm_quarto', label: 'Revistar o quarto do irmão', on: { t: 'clue', v: 'c_quarto_m' } },
              { id: 'm_intim', label: 'Recompor o papel amassado no chão', on: { t: 'solve', v: 'pz_m_doc' } },
            ], reward: { resources: 4 } },
          { objective: 'Descubra o que o vizinho viu naquela noite.',
            subs: [
              { id: 'm_vizinho', label: 'Conversar com o vizinho da frente', on: { t: 'flag', v: 'm_vizinho_ok' } },
            ] },
        ] },
        intro: [
          { who: 'narrator', text: 'Manhã fria de abril de 1964. A cama de José continua feita. O café na mesa, frio.' },
          { who: 'hero', text: 'Meu irmão nunca dormiu fora sem avisar. Alguma coisa aconteceu — e eu vou descobrir o quê.', emo: 'worried' },
        ],
        props: [
          { id: 'm_quarto', x: 320, kind: 'clue', label: 'Revistar o quarto', glyph: '╤',
            say: [{ who: 'narrator', text: 'No quarto, a carteira do sindicato dos metalúrgicos e um panfleto: "Assembleia geral — defesa dos empregos". José era delegado sindical.' }],
            clue: { id: 'c_quarto_m', title: 'O sindicalista', text: 'José era delegado do sindicato dos metalúrgicos. Nos primeiros dias do golpe, lideranças sindicais foram os primeiros alvos.', cat: 'objeto' } },
          { id: 'm_intim', x: 640, kind: 'puzzle', label: 'Recompor o papel amassado', glyph: '⌗',
            puzzle: { id: 'pz_m_doc', kind: 'doc', title: 'O papel amassado', brief: 'Um papel oficial, rasgado. Toque na palavra que revela quem procurava José.',
              hint: 'Repare em qual órgão assina a intimação — esse nome é a chave.',
              docPrompt: 'Toque no ÓRGÃO que assina a intimação.',
              docText: 'INTIMACAO O cidadão JOSE DOS SANTOS deve comparecer para prestar esclarecimentos sobre atividades sindicais consideradas subversivas. Comparecimento obrigatorio. Emitido por: DOPS Departamento de Ordem Politica e Social',
              docTarget: ['DOPS'],
              onSolve: { setFlag: 'm_intim_ok', clue: { id: 'c_intimacao_m', title: 'A intimação do DOPS', text: 'José foi intimado pelo DOPS por "atividades sindicais subversivas". Ele foi ao órgão — e não voltou.', cat: 'documento' }, archive: 'ai1',
                say: [{ who: 'hero', text: 'DOPS. Ele foi chamado pela polícia política. É por aí que eu começo.', emo: 'determined' }] } } },
          { id: 'm_vizinho', x: 960, kind: 'talk', label: 'Conversar com o vizinho', glyph: '☺', setFlag: 'm_vizinho_ok', reward: { resources: 6 },
            say: [
              { who: 'hero', text: 'Seu Antônio, o senhor viu quando o José saiu ontem?' },
              { who: 'narrator', text: 'O vizinho fecha a porta até sobrar uma fresta.' },
              { who: 'narrator', text: 'Vieram dois carros sem placa. Levaram ele de madrugada. Eu não vi nada, dona Maria. Ninguém viu.', emo: 'afraid' },
            ] },
          { id: 'm_exit1', x: 1400, kind: 'exit', label: 'Ir à delegacia', glyph: '→', to: 1, gate: 'mission_m_maria_1_done',
            lockedSay: [{ who: 'hero', text: 'Não saio de casa sem entender o que houve aqui.' }],
            say: [{ who: 'narrator', text: 'Você guarda a intimação na bolsa como quem guarda uma prova. Na delegacia, a primeira parede de negação.' }] },
        ],
      },
      // ---------- CAPÍTULO 2 — A NEGAÇÃO ----------
      {
        id: 'delegacia', biome: 'police', mood: 'dark', year: 1964, worldW: 1450,
        title: 'Capítulo 2', sub: 'Ninguém com esse nome',
        objective: 'Na delegacia, enfrente a negação oficial e encontre a prova de que José esteve ali.',
        tip: 'O que dizem no balcão e o que está no livro de registro nem sempre combinam. Procure a contradição.',
        mission: { id: 'm_maria_2', title: 'A negação', stages: [
          { objective: 'Enfrente o balcão e busque o registro da entrada de José.',
            subs: [
              { id: 'm_balcao', label: 'Insistir no balcão da delegacia', on: { t: 'flag', v: 'm_balcao_ok' } },
              { id: 'm_livro', label: 'Ler o livro de registro esquecido', on: { t: 'solve', v: 'pz_m_reg' } },
            ], reward: { resources: 5 } },
          { objective: 'Guarde a prova de que negaram o óbvio.',
            subs: [
              { id: 'm_prova', label: 'Anotar a contradição', on: { t: 'clue', v: 'c_contra_m' } },
            ] },
        ] },
        intro: [
          { who: 'narrator', text: 'Balcão alto, luz amarela. Um escrivão folheia papel sem levantar os olhos.' },
          { who: 'hero', text: 'Eu tenho a intimação na mão. Eles não vão poder dizer que ele nunca existiu.', emo: 'determined' },
        ],
        props: [
          { id: 'm_balcao', x: 300, kind: 'talk', label: 'Insistir no balcão', glyph: '☺', setFlag: 'm_balcao_ok', reward: { resources: 3 },
            say: [
              { who: 'hero', text: 'Meu irmão, José dos Santos, foi trazido pra cá. Tenho a intimação do DOPS.' },
              { who: 'censor', text: 'Não consta ninguém com esse nome, senhora. Deve ter havido engano.' },
              { who: 'hero', text: 'O papel tem o nome dele, a assinatura de vocês. Como pode ser engano?', emo: 'angry' },
              { who: 'censor', text: 'Papel qualquer um fabrica. Consta é o que está no sistema. E não consta.' },
            ] },
          { id: 'm_livro', x: 640, kind: 'puzzle', label: 'Ler o livro de registro', glyph: '⌗', requires: 'm_balcao_ok',
            lockedSay: [{ who: 'hero', text: 'Preciso desviar a atenção do escrivão primeiro.' }],
            puzzle: { id: 'pz_m_reg', kind: 'doc', title: 'Livro de registro', brief: 'O livro de entradas ficou aberto no balcão. Toque no nome que foi riscado à pressa.',
              hint: 'Um nome aparece riscado, mas ainda legível. É o do seu irmão.',
              docPrompt: 'Toque no NOME riscado no registro.',
              docText: 'LIVRO DE ENTRADAS 02/04 Manoel Reis liberado 02/04 JOSE DOS SANTOS transferido 03/04 Pedro Alves liberado 03/04 Ana Terra liberada',
              docTarget: ['JOSE DOS SANTOS'],
              onSolve: { setFlag: 'm_reg_ok', clue: { id: 'c_registro_m', title: 'O nome riscado', text: 'O livro registra: "José dos Santos — transferido", com o nome riscado. Ele esteve ali. "Transferido" é a palavra que a repressão usa quando não quer dizer para onde.', cat: 'documento' }, archive: 'desaparecidos',
                say: [{ who: 'hero', text: '"Transferido." Riscado, mas legível. Eles mentiram na minha cara.', emo: 'angry' }] } } },
          { id: 'm_prova', x: 960, kind: 'clue', label: 'Anotar a contradição', glyph: '╤', requires: 'm_reg_ok',
            lockedSay: [{ who: 'hero', text: 'Preciso ver o registro antes de anotar qualquer coisa.' }],
            say: [{ who: 'hero', text: 'No balcão disseram "não consta". No livro, o nome dele está lá, transferido. A mentira tem prova.', emo: 'determined' }],
            clue: { id: 'c_contra_m', title: 'A contradição oficial', text: 'O Estado nega verbalmente o que registra por escrito. Essa contradição é a arma de quem busca um desaparecido: obrigar o poder a se contradizer.', cat: 'objeto' } },
          { id: 'm_exit2', x: 1360, kind: 'exit', label: 'Buscar ajuda no jornal', glyph: '→', to: 2, gate: 'mission_m_maria_2_done',
            lockedSay: [{ who: 'hero', text: 'Não vou embora sem uma prova na mão.' }],
            say: [{ who: 'narrator', text: 'Sozinha você não vence o balcão. Mas há um jornal que ainda imprime nomes que o Estado apaga: A Voz da Cidade.' }] },
        ],
      },
      // ---------- CAPÍTULO 3 — A REDE ----------
      {
        id: 'jornal_m', biome: 'newsroom', mood: 'tense', year: 1964, worldW: 1450,
        title: 'Capítulo 3', sub: 'Os nomes que o Estado apaga',
        objective: 'No jornal A Voz da Cidade, some sua prova à lista dos que somem.',
        tip: 'Uma redação vive de listas e contatos. Encontre a lista que junta os desaparecidos.',
        mission: { id: 'm_maria_3', title: 'A rede', stages: [
          { objective: 'Encontre na redação quem compila os desaparecidos.',
            subs: [
              { id: 'm_helena', label: 'Procurar a jornalista Helena Moura', on: { t: 'flag', v: 'm_helena_ok' } },
              { id: 'm_lista', label: 'Cruzar a lista de desaparecidos', on: { t: 'solve', v: 'pz_m_lista' } },
            ], reward: { resources: 6 } },
          { objective: 'Consiga a pista do arquivo público.',
            subs: [
              { id: 'm_pista_arq', label: 'Anotar o contato do arquivo', on: { t: 'clue', v: 'c_pista_arq' } },
            ] },
        ] },
        intro: [
          { who: 'narrator', text: 'Máquinas de escrever em coro. Numa mesa ao fundo, uma jornalista guarda um caderno com dezenas de nomes.' },
          { who: 'hero', text: 'Dizem que essa moça, Helena, anota todo mundo que some. Meu irmão precisa estar nessa lista.', emo: 'worried' },
        ],
        props: [
          { id: 'm_helena', x: 320, kind: 'talk', label: 'Procurar Helena Moura', glyph: '☺', setFlag: 'm_helena_ok', reward: { resources: 4 },
            say: [
              { who: 'hero', text: 'Dona Helena? Meu irmão, José dos Santos, sumiu. O DOPS diz que nunca prendeu ele.' },
              { who: 'editor', text: 'Eles sempre dizem. Tenho um caderno com 60 nomes que "nunca foram presos". Me dê o dele. E a intimação, se tiver.', emo: 'determined' },
              { who: 'hero', text: 'Tenho a intimação e o registro riscado da delegacia.' },
              { who: 'editor', text: 'Então você já fez mais que muita família consegue. Prova documental é ouro.', emo: 'surprised' },
            ] },
          { id: 'm_lista', x: 660, kind: 'puzzle', label: 'Cruzar a lista', glyph: '⌗', requires: 'm_helena_ok',
            lockedSay: [{ who: 'hero', text: 'Preciso falar com a Helena antes de mexer no caderno dela.' }],
            puzzle: { id: 'pz_m_lista', kind: 'doc', title: 'Caderno de desaparecidos', brief: 'O caderno lista vários sumiços. Toque no nome que se liga ao sindicato de José.',
              hint: 'Procure outro metalúrgico — um companheiro de sindicato de José.',
              docPrompt: 'Toque no nome ligado ao mesmo sindicato de José.',
              docText: 'DESAPARECIDOS ABRIL 1964 Clara Nunes professora Roberto Farias metalurgico sindicato Ivone Braga estudante Tarso Melo bancario',
              docTarget: ['Roberto Farias'],
              onSolve: { setFlag: 'm_lista_ok', clue: { id: 'c_lista_m', title: 'O companheiro de sindicato', text: 'Roberto Farias, metalúrgico do mesmo sindicato, desapareceu na mesma semana que José. Não é caso isolado — é uma operação contra a liderança sindical.', cat: 'documento' }, archive: 'desaparecidos',
                say: [{ who: 'hero', text: 'Não levaram só meu irmão. Levaram o sindicato inteiro. Isso é plano, não acaso.', emo: 'determined' }] } } },
          { id: 'm_pista_arq', x: 980, kind: 'clue', label: 'Anotar o contato do arquivo', glyph: '╤', requires: 'm_helena_ok',
            lockedSay: [{ who: 'hero', text: 'Preciso da orientação da Helena primeiro.' }],
            say: [{ who: 'editor', text: 'Os registros de transferência às vezes vão parar no arquivo público. Procure lá. Diga que é pesquisa de família — e reze.', emo: 'worried' }],
            clue: { id: 'c_pista_arq', title: 'A pista do arquivo', text: 'Registros de "transferência" de presos políticos às vezes sobrevivem no arquivo público. É o próximo passo da busca.', cat: 'objeto' } },
          { id: 'm_exit3', x: 1360, kind: 'exit', label: 'Ir ao arquivo público', glyph: '→', to: 3, gate: 'mission_m_maria_3_done',
            lockedSay: [{ who: 'hero', text: 'Não saio da redação sem a próxima pista.' }],
            say: [{ who: 'narrator', text: 'Com a lista de Helena e a intimação, você vai ao arquivo público — onde o papel guarda o que a boca nega.' }] },
        ],
      },
      // ---------- CAPÍTULO 4 — O ARQUIVO ----------
      {
        id: 'arquivo_m', biome: 'archive', mood: 'heavy', year: 1964, worldW: 1450,
        title: 'Capítulo 4', sub: 'Onde o papel não mente',
        objective: 'No arquivo público, encontre o último registro de José — e decida o que fazer com ele.',
        tip: 'Uma fotografia de arquivo pode conter a resposta que você teme. Examine com coragem.',
        mission: { id: 'm_maria_4', title: 'O arquivo', stages: [
          { objective: 'Localize o registro fotográfico da transferência.',
            subs: [
              { id: 'm_ficha', label: 'Puxar a ficha de transferência', on: { t: 'clue', v: 'c_ficha_m' } },
              { id: 'm_foto', label: 'Examinar a foto de arquivo', on: { t: 'solve', v: 'pz_m_photo' } },
            ], reward: { resources: 5 } },
          { objective: 'Com a verdade em mãos, decida o rumo da busca.',
            subs: [
              { id: 'm_choice', label: 'Decidir o que fazer com a prova', on: { t: 'choice', v: 'ch_maria' } },
            ] },
        ] },
        intro: [
          { who: 'narrator', text: 'Corredores de estantes e poucas mesas, cheiro de papel velho. O funcionário finge não ver quem folheia demais.' },
          { who: 'hero', text: 'Se tem um lugar onde José ainda existe no papel, é aqui. Eu preciso saber — mesmo que doa.', emo: 'worried' },
        ],
        props: [
          { id: 'm_ficha', x: 320, kind: 'clue', label: 'Puxar a ficha de transferência', glyph: '╤',
            say: [{ who: 'narrator', text: 'Ficha carimbada: "José dos Santos — transferido para unidade militar, 03/04/1964". Destino final: em branco. Um carimbo, nenhum endereço.' }],
            clue: { id: 'c_ficha_m', title: 'A ficha de transferência', text: 'José foi "transferido para unidade militar" sem destino registrado. O papel confirma a prisão — e revela o buraco onde a informação termina.', cat: 'documento' } },
          { id: 'm_foto', x: 660, kind: 'puzzle', label: 'Examinar a foto de arquivo', glyph: '⌗', requires: 'm_lista_ok',
            lockedSay: [{ who: 'hero', text: 'Preciso da lista de Helena para saber quem procurar na foto.' }],
            puzzle: { id: 'pz_m_photo', kind: 'photo', title: 'Foto de arquivo', brief: 'Uma foto de um grupo de detidos. Examine e toque no rosto que você reconhece.',
              hint: 'Procure à direita da foto, na segunda fileira.',
              photoScene: 'detidos', photoHot: [0.72, 0.42, 0.09], photoPrompt: 'Toque no rosto que você reconhece.',
              onSolve: { setFlag: 'm_foto_ok', clue: { id: 'c_foto_jose', title: 'O rosto de José', text: 'Numa foto de detidos, José aparece de pé, magro, o olhar firme. A imagem prova que ele esteve vivo e sob custódia do Estado. É a última prova de sua existência oficial.', cat: 'foto' }, archive: 'desaparecidos',
                say: [{ who: 'hero', text: 'É ele. Magro, mas de pé. Vivo. O Estado o teve nas mãos — e agora nega. Eu tenho a foto.', emo: 'afraid' }] } } },
          { id: 'm_choice', x: 980, kind: 'choice', label: 'Decidir o que fazer com a prova', glyph: '⚑', requires: 'm_foto_ok',
            lockedSay: [{ who: 'hero', text: 'Sem a foto na mão, eu só tenho suspeita.' }],
            choice: { id: 'ch_maria', prompt: 'Você tem a prova de que José foi preso. O que faz com ela?',
              options: [
                { key: 'publicar', label: 'Entregar a Helena para publicar', hint: 'Torna o caso público; pressão e risco crescem juntos.', result: 'Você entrega a foto e os documentos. A Voz da Cidade publica: "Onde está José dos Santos?" O caso vira símbolo. E você vira alvo.', suspicion: 40, setFlag: 'm_publicou', reward: { archive: 'imprensa' } },
                { key: 'guardar', label: 'Guardar e buscar pelos canais discretos', hint: 'Protege você; a busca continua nos bastidores, mais lenta.', result: 'Você guarda tudo num envelope lacrado com uma advogada de confiança. A busca segue por baixo dos panos — petitões, contatos, portas batidas em silêncio.', suspicion: -10, setFlag: 'm_guardou', clue: { id: 'c_envelope_m', title: 'O envelope lacrado', text: 'A prova guardada com uma advogada. Muitas famílias escolheram o silêncio para sobreviver — e guardaram documentos que só vieram à luz décadas depois.', cat: 'objeto' } },
              ] } },
          { id: 'm_exit4', x: 1360, kind: 'exit', label: 'Sair do arquivo', glyph: '→', to: 4, gate: 'mission_m_maria_4_done',
            lockedSay: [{ who: 'hero', text: 'Não saio sem decidir o que faço com o que encontrei.' }],
            say: [{ who: 'narrator', text: 'A prova está na sua mão. Onde vão parar as mães e irmãs que carregam provas iguais? Numa praça.' }] },
        ],
      },
      // ---------- CAPÍTULO 5 — A PRAÇA ----------
      {
        id: 'praca_m', biome: 'plaza', mood: 'melancholy', year: 1964, worldW: 1350,
        title: 'Capítulo 5', sub: 'Não se busca sozinha',
        objective: 'Na praça, encontre outras famílias e decida como continuar a busca.',
        tip: 'Este é o desfecho: uma busca individual pode virar memória coletiva.',
        mission: { id: 'm_maria_5', title: 'A praça', stages: [
          { objective: 'Junte-se a quem carrega a mesma ausência e decida o rumo.',
            subs: [
              { id: 'm_maes', label: 'Aproximar-se das outras mães e irmãs', on: { t: 'clue', v: 'c_maes_m' } },
              { id: 'm_fim', label: 'Decidir como seguir a busca', on: { t: 'choice', v: 'ch_maria_fim' } },
            ], reward: { resources: 4 } },
        ] },
        intro: [
          { who: 'narrator', text: 'Praça ao entardecer. Meia dúzia de mulheres com fotos no peito. Uma delas segura um cartaz: "Onde estão?"' },
          { who: 'hero', text: 'Eu vim procurar um irmão. Encontrei um punhado de gente procurando a mesma coisa.', emo: 'worried' },
        ],
        props: [
          { id: 'm_maes', x: 360, kind: 'clue', label: 'Aproximar-se das mães', glyph: '╤',
            say: [
              { who: 'mother', text: 'Meu filho também foi "transferido". Faz três semanas. Você tem foto? A gente junta as fotos — sozinha, ninguém aguenta.', emo: 'worried' },
              { who: 'hero', text: 'Tenho. E documento. Se juntar tudo, viram muitas provas de uma coisa só.', emo: 'determined' },
            ],
            clue: { id: 'c_maes_m', title: 'A busca que vira coletiva', text: 'Várias famílias com a mesma história. A dor individual, somada, vira testemunho histórico. Foi assim que nasceram os comitês de famílias de desaparecidos.', cat: 'documento' } },
          { id: 'm_fim', x: 720, kind: 'choice', label: 'Decidir como seguir', glyph: '⚑',
            choice: { id: 'ch_maria_fim', prompt: 'As outras famílias esperam sua decisão. Como você segue?',
              options: [
                { key: 'comite', label: 'Fundar um comitê de famílias', hint: 'Coletivo, pblico, corajoso. Transforma dor em movimento — e em risco.', result: 'Você propõe reunir as famílias toda semana, cruzar nomes, procurar advogados, bater nas portas dos quartéis juntas. É o embrião de um movimento que atravessará décadas até a Comissão da Verdade.', suspicion: 30, setFlag: 'm_comite', reward: { archive: 'diretas' } },
                { key: 'guardar_mem', label: 'Guardar tudo e esperar tempos melhores', hint: 'Prudente, silencioso. Preserva as provas para o dia em que puderem falar.', result: 'Você junta os documentos das famílias num arquivo escondido e combina um código entre vocês. "Quando puder, a gente conta tudo." A memória fica guardada, esperando a luz.', suspicion: -8, setFlag: 'm_guardou_mem', clue: { id: 'c_arquivo_maes', title: 'O arquivo das famílias', text: 'Documentos guardados por anos, em silêncio. Muitos só vieram a público com a redemocratização — provas que sustentaram investigações décadas depois.', cat: 'objeto' } },
              ] } },
          { id: 'm_exit5', x: 1180, kind: 'exit', label: 'Encerrar a campanha', glyph: '★', to: -1, gate: 'mission_m_maria_5_done',
            lockedSay: [{ who: 'hero', text: 'Ainda não me juntei às outras nem decidi o rumo.' }],
            say: [
              { who: 'narrator', text: 'DESFECHO — MEMÓRIA E VERDADE.' },
              { who: 'narrator', text: 'Centenas de brasileiros foram mortos ou desaparecidos pela repressão entre 1964 e 1985. Famílias passaram décadas buscando corpos e respostas. A Comissão Nacional da Verdade (2012-2014) reconstituiu muitos desses casos — em grande parte graças a documentos e testemunhos que famílias como a de Maria guardaram. Buscar um desaparecido é, no fim, um ato de resistência contra o esquecimento.' },
              { who: 'hero', text: 'Não achei meu irmão. Mas achei quem não vai deixar apagarem o nome dele. Enquanto lembrarmos, eles não venceram de todo.', emo: 'determined' },
            ] },
        ],
      },
    ],
  },

};
