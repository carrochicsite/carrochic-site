export const SITE = {
  nome: 'CARROCHIC®',
  url: 'https://carrochic.com.br',
  whatsapp: '5531996385412',
  telefone: '(31) 99638-5412',
  email: 'carrochicsite@gmail.com',
  cidade: 'Sete Lagoas',
  uf: 'MG',
  area: 'Sete Lagoas e região',
};

export const TIPOS: Record<string, { slug: string; rotulo: string; plural: string }> = {
  carro: { slug: 'carros-sete-lagoas', rotulo: 'Carros', plural: 'carros' },
  moto: { slug: 'motos-sete-lagoas', rotulo: 'Motos', plural: 'motos' },
  caminhao: { slug: 'caminhoes-sete-lagoas', rotulo: 'Caminhões', plural: 'caminhões' },
  utilitario: { slug: 'utilitarios-sete-lagoas', rotulo: 'Utilitários', plural: 'utilitários' },
};

// Quantos veículos aparecem por página nas listagens. Mude só aqui (ex.: 18 ou 24).
export const POR_PAGINA = 12;

export const NOINDEX = import.meta.env.PUBLIC_NOINDEX === 'true';

export const brl = (n: number | string | null) => {
  const valor = Number(n);
  if (n == null || n === '' || !Number.isFinite(valor)) return 'Consulte';
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const kmFmt = (n: number | null) => (n == null ? '' : `${n.toLocaleString('pt-BR')} km`);

export const waLink = (msg: string, numero: string = SITE.whatsapp) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
