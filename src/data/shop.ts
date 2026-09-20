// Loja clandestina — itens funcionais comprados com Recursos (Cruzeiros).
export interface ShopItem {
  id: string; name: string; desc: string; price: number;
  kind: 'life' | 'susp' | 'inv';  // life: +1 vida; susp: reduz suspeita; inv: vai pro inventário
  value?: number;
  glyph: string;
}

export const SHOP: ShopItem[] = [
  { id: 'vida', name: 'Abrigo seguro', desc: 'Um lugar para respirar. Recupera 1 vida.', price: 12, kind: 'life', value: 1, glyph: '♥' },
  { id: 'salvo', name: 'Salvo-conduto', desc: 'Documento que acalma uma abordagem. Reduz a suspeita em 30.', price: 10, kind: 'susp', value: 30, glyph: '◈' },
  { id: 'lupa', name: 'Lupa de investigador', desc: 'Revela pistas escondidas no cenário e dá uma dica nos enigmas. (consumível)', price: 8, kind: 'inv', glyph: '◎' },
  { id: 'cafe', name: 'Contato de confiança', desc: 'Uma conversa discreta reduz a suspeita em 15 e rende ânimo.', price: 6, kind: 'susp', value: 15, glyph: '✉' },
];

// Itens de inventário utilizáveis fora da loja.
export const USABLE: Record<string, { name: string; desc: string; glyph: string }> = {
  lupa: { name: 'Lupa de investigador', desc: 'Revela pistas escondidas na sala atual e ativa a dica do próximo enigma.', glyph: '◎' },
};
