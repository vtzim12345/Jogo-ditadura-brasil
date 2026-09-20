import { CharPalette } from '../game/sprites';

export interface CharDef {
  id: string;
  name: string;
  role: string;          // short label
  playable?: boolean;
  bio: string;
  palette: CharPalette;
}

// Elenco com aparência deliberadamente variada (tons de pele, cabelos, roupas e
// acessórios distintos) para que nenhum personagem se repita visualmente.
export const CHARACTERS: Record<string, CharDef> = {
  // ---- PLAYABLE (7) ----
  antonio: {
    id: 'antonio', name: 'Antônio Ferreira', role: 'Pessoa comum — operário', playable: true,
    bio: 'Trabalhador de fábrica e pai de família. Vê o país mudar a partir do cotidiano: o custo de vida, o medo na rua, as conversas silenciadas.',
    palette: { skin: '#a8734a', hair: '#241a12', shirt: '#3f6a86', pants: '#37414a', shoes: '#241a14', accent: '#2f4a66', outfit: 'shirt', hairStyle: 'short', beard: true }
  },
  helena: {
    id: 'helena', name: 'Helena Rocha', role: 'Estudante universitária', playable: true,
    bio: 'Estudante de Letras e militante do movimento estudantil. Acredita na força das passeatas e no direito de pensar livremente.',
    palette: { skin: '#e2b98e', hair: '#3a2a1a', shirt: '#b5533f', pants: '#2f3a4a', shoes: '#3a2a1a', accent: '#3a7a5a', outfit: 'shirt', hairStyle: 'ponytail', scarf: '#3a7a5a' }
  },
  beatriz: {
    id: 'beatriz', name: 'Beatriz Nunes', role: 'Artista / música', playable: true,
    bio: 'Cantora e compositora. Suas letras dizem o que os jornais não podem. Convive de perto com a censura cultural.',
    palette: { skin: '#7a4a30', hair: '#171008', shirt: '#7a3f8a', pants: '#2a2430', shoes: '#2a2118', accent: '#e0b23c', outfit: 'dress', hairStyle: 'afro' }
  },
  carlos: {
    id: 'carlos', name: 'Carlos Menezes', role: 'Jornalista', playable: true,
    bio: 'Repórter de um grande jornal. Todo dia decide entre a manchete que quer escrever e a que o censor deixa passar.',
    palette: { skin: '#e6c29a', hair: '#4a3524', shirt: '#c9c4b4', pants: '#3a3f45', shoes: '#2a2118', accent: '#6a6f78', outfit: 'shirt', hairStyle: 'short', glasses: true, mustache: true }
  },
  ricardo: {
    id: 'ricardo', name: 'Ricardo Albuquerque', role: 'Empresário / elite', playable: true,
    bio: 'Industrial que a princípio vê estabilidade e crescimento, mas passa a enxergar o custo humano por trás dos números.',
    palette: { skin: '#e0bd94', hair: '#40342a', shirt: '#2f3a44', pants: '#232c34', shoes: '#1c1814', accent: '#8a2f2f', outfit: 'suit', hairStyle: 'gray', tie: '#8a2f2f', glasses: true }
  },
  paulo: {
    id: 'paulo', name: 'Ten. Paulo Andrade', role: 'Militar', playable: true,
    bio: 'Oficial jovem que jurou servir ao país. Recebe ordens que o obrigam a confrontar o limite entre dever e consciência.',
    palette: { skin: '#b5875c', hair: '#20180f', shirt: '#4a5232', pants: '#3a4026', shoes: '#20180f', accent: '#2f3a1c', hat: '#3a4026', outfit: 'uniform', hairStyle: 'buzz' }
  },
  maria: {
    id: 'maria', name: 'Maria da Conceição', role: 'Costureira e mãe', playable: true,
    bio: 'Costureira e mãe que busca o irmão desaparecido. Descobre, na luta pela verdade, a força de quem não aceita o silêncio.',
    palette: { skin: '#8a5a3a', hair: '#171009', shirt: '#5a7a6a', pants: '#3a3a44', shoes: '#2a2118', accent: '#a05a7a', outfit: 'apron', hairStyle: 'bun' }
  },

  // ---- SECONDARY / SUPPORT ----
  mother: { id: 'mother', name: 'Dona Lúcia', role: 'Mãe de família', bio: 'Mãe de Antônio; segura a casa em tempos difíceis.', palette: { skin: '#cfa578', hair: '#8a8378', shirt: '#8a6a5a', pants: '#4a3f36', accent: '#6a5a4a', outfit: 'dress', hairStyle: 'bun' } },
  child: { id: 'child', name: 'Zeca', role: 'Filho', bio: 'Criança curiosa que faz as perguntas difíceis.', palette: { skin: '#e0b48a', hair: '#2a2018', shirt: '#5aa469', pants: '#3a3a44', hairStyle: 'curly' } },
  professor: { id: 'professor', name: 'Prof. Amaral', role: 'Professor', bio: 'Docente que tenta ensinar mesmo sob vigilância.', palette: { skin: '#d0a074', hair: '#c9c4b4', shirt: '#3a4a5a', pants: '#2a2f36', accent: '#6a6f78', outfit: 'suit', hairStyle: 'gray', glasses: true, tie: '#3a4a5a', mustache: true } },
  student2: { id: 'student2', name: 'Marcos', role: 'Estudante', bio: 'Colega de Helena, mais exaltado nas assembleias.', palette: { skin: '#6a4028', hair: '#140d06', shirt: '#2f6a5a', pants: '#3a3f45', hairStyle: 'curly' } },
  editor: { id: 'editor', name: 'Editor-chefe Vargas', role: 'Editor de jornal', bio: 'Precisa manter o jornal vivo sem cruzar as linhas vermelhas do regime.', palette: { skin: '#d8b48a', hair: '#6a6258', shirt: '#c9c4b4', pants: '#3a3f45', accent: '#5a5f66', outfit: 'suit', hairStyle: 'gray', glasses: true, tie: '#5a5f66' } },
  censor: { id: 'censor', name: 'Agente Soldá', role: 'Censor', bio: 'Funcionário da censura. Carimba o que pode e o que não pode ser dito.', palette: { skin: '#c8916a', hair: '#2a2018', shirt: '#4a4a52', pants: '#2f2f36', accent: '#20242c', outfit: 'suit', hairStyle: 'short', tie: '#20242c', glasses: true } },
  colonel: { id: 'colonel', name: 'Coronel Brandão', role: 'Oficial superior', bio: 'Superior de Paulo; representa a cadeia de comando.', palette: { skin: '#caa07a', hair: '#6a6258', shirt: '#4a5232', pants: '#3a4026', accent: '#8a7a2f', hat: '#3a4026', outfit: 'uniform', hairStyle: 'gray', mustache: true } },
  soldier: { id: 'soldier', name: 'Soldado', role: 'Praça', bio: 'Soldado em serviço de patrulha.', palette: { skin: '#9a6a44', hair: '#20180f', shirt: '#4a5232', pants: '#3a4026', hat: '#3a4026', outfit: 'uniform', hairStyle: 'buzz' } },
  radioman: { id: 'radioman', name: 'Ary Locutor', role: 'Radialista', bio: 'Voz da rádio; escolhe cada palavra com cuidado.', palette: { skin: '#d6a878', hair: '#3a2f22', shirt: '#8a6a2f', pants: '#3a3f45', outfit: 'shirt', hairStyle: 'short', glasses: true, mustache: true } },
  worker2: { id: 'worker2', name: 'Sebastião', role: 'Operário / sindicato', bio: 'Colega de fábrica ligado ao movimento sindical do ABC.', palette: { skin: '#7a4a2e', hair: '#140d06', shirt: '#6a5540', pants: '#3a3a44', outfit: 'shirt', hairStyle: 'short', beard: true, mustache: true } },
  wife: { id: 'wife', name: 'Clara', role: 'Esposa de Carlos', bio: 'Companheira do jornalista; teme pela segurança da família.', palette: { skin: '#e0b48a', hair: '#2a2018', shirt: '#4a8a7a', pants: '#3a3f45', outfit: 'dress', hairStyle: 'wavy' } },
  actor: { id: 'actor', name: 'Diretor Teixeira', role: 'Diretor de teatro', bio: 'Encena peças que driblam a censura com metáforas.', palette: { skin: '#c9a074', hair: '#2a2018', shirt: '#6a4a8a', pants: '#2a2430', accent: '#e0b23c', outfit: 'shirt', hairStyle: 'wavy', beard: true, scarf: '#8a2f2f' } },
  lawyer: { id: 'lawyer', name: 'Dra. Inês', role: 'Advogada', bio: 'Defende presos políticos e famílias em busca de desaparecidos.', palette: { skin: '#a86a44', hair: '#171009', shirt: '#33414a', pants: '#26303a', accent: '#8a2f2f', outfit: 'suit', hairStyle: 'braids' } },
  bishop: { id: 'bishop', name: 'Padre Antônio', role: 'Religioso', bio: 'Membro da Igreja que abriga perseguidos e denuncia abusos.', palette: { skin: '#d6a878', hair: '#c9c4b4', shirt: '#2a2a30', pants: '#20242c', accent: '#c9c4b4', outfit: 'robe', hairStyle: 'gray' } },
  narrator: { id: 'narrator', name: 'Narrador', role: 'Narração', bio: 'Voz que contextualiza a História.', palette: { skin: '#c9c4b4', hair: '#c9c4b4', shirt: '#141821', pants: '#141821' } }
};

export const PLAYABLE = ['antonio', 'helena', 'beatriz', 'carlos', 'ricardo', 'paulo', 'maria'];
