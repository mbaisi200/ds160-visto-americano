// CPF mask: 000.000.000-00
export function maskCPF(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
}

// Clean CPF (remove non-digits)
export function cleanCPF(value: string): string {
  return value.replace(/\D/g, '');
}

// Validate CPF
export function validateCPF(cpf: string): boolean {
  cpf = cleanCPF(cpf);
  
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

// Phone mask: (00) 00000-0000
export function maskPhone(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
}

// CEP mask: 00000-000
export function maskCEP(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
}

// RG mask: general format
export function maskRG(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
}

// Date mask: DD/MM/YYYY
export function maskDate(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\/\d{4})\d+?$/, '$1');
}

// Passport mask: AA0000000
export function maskPassport(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
}

// Remove accents from string
export function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Get current date/time in Brazil timezone (UTC-3)
// Esta função retorna a data/hora atual no fuso horário do Brasil
export function getBrazilDateTime(): Date {
  const now = new Date();
  // Brasil é UTC-3, então subtraímos 3 horas do UTC
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const brazilTime = new Date(utcTime - (3 * 3600000)); // UTC-3
  return brazilTime;
}

// Get current date in Brazilian format (DD/MM/YYYY) using Brazil timezone
export function getBrazilDate(): string {
  const now = new Date();
  // Converte para o fuso do Brasil (UTC-3)
  const brazilDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const day = brazilDate.getDate().toString().padStart(2, '0');
  const month = (brazilDate.getMonth() + 1).toString().padStart(2, '0');
  const year = brazilDate.getFullYear();
  return `${day}/${month}/${year}`;
}

// Get current datetime in Brazilian format using Brazil timezone
export function getBrazilDateTimeString(): string {
  const now = new Date();
  return now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

// Get current date in ISO format (YYYY-MM-DD) using Brazil timezone
export function getBrazilDateISO(): string {
  const now = new Date();
  const brazilDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const day = brazilDate.getDate().toString().padStart(2, '0');
  const month = (brazilDate.getMonth() + 1).toString().padStart(2, '0');
  const year = brazilDate.getFullYear();
  return `${year}-${month}-${day}`;
}

// Format date for display (from ISO to Brazilian format)
// Corrigido: trata a data como local para evitar problema de fuso horário
export function formatDateToBrazilian(dateString: string): string {
  if (!dateString) return '';
  
  // Se já estiver no formato DD/MM/YYYY, retorna como está
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }
  
  // Se estiver no formato ISO (YYYY-MM-DD), divide diretamente para evitar problema de fuso
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }
  
  // Fallback: tenta criar data e formatar
  const date = new Date(dateString + 'T12:00:00'); // Adiciona meio-dia para evitar problema de fuso
  if (isNaN(date.getTime())) return dateString;

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Format date for TXT output - returns date in Brazilian format (DD/MM/YYYY)
export function formatDateForTXT(dateString: string): string {
  if (!dateString) return '';
  
  // Se estiver no formato ISO (YYYY-MM-DD), converte para DD/MM/YYYY
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }
  
  // Se já estiver no formato DD/MM/YYYY, retorna como está
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }
  
  return dateString;
}

// Clean phone number - remove all non-digit characters
export function cleanPhone(value: string): string {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

// Format date for display
export function formatDate(date: { seconds?: number; nanoseconds?: number } | Date | string | null | undefined): string {
  if (!date) return '-';
  
  try {
    // Firestore timestamp format
    if (date && typeof date === 'object' && 'seconds' in date && date.seconds !== undefined) {
      const d = new Date(date.seconds * 1000);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('pt-BR');
      }
    }
    
    // Date object
    if (date instanceof Date) {
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR');
      }
    }
    
    // String date
    if (typeof date === 'string') {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('pt-BR');
      }
    }
    
    return '-';
  } catch {
    return '-';
  }
}

// Format datetime for display
export function formatDateTime(date: { seconds?: number; nanoseconds?: number } | Date | string | null | undefined): string {
  if (!date) return '-';
  
  try {
    // Firestore timestamp format
    if (date && typeof date === 'object' && 'seconds' in date && date.seconds !== undefined) {
      const d = new Date(date.seconds * 1000);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString('pt-BR');
      }
    }
    
    // Date object
    if (date instanceof Date) {
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('pt-BR');
      }
    }
    
    // String date
    if (typeof date === 'string') {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString('pt-BR');
      }
    }
    
    return '-';
  } catch {
    return '-';
  }
}

// Brazilian states
export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

// US States
export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' },
];

// Application locations (consulates)
export const APPLICATION_LOCATIONS = [
  { value: 'brasilia', label: 'Brasília' },
  { value: 'sao_paulo', label: 'São Paulo' },
  { value: 'rio_de_janeiro', label: 'Rio de Janeiro' },
  { value: 'recife', label: 'Recife' },
  { value: 'porto_alegre', label: 'Porto Alegre' },
];

// Social media platforms
export const SOCIAL_PLATFORMS = [
  'Facebook',
  'Instagram',
  'LinkedIn',
  'TikTok',
  'X (Twitter)',
  'YouTube',
  'WhatsApp',
  'Telegram',
  'Outra'
];
