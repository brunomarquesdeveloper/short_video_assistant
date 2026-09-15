import { SocialPlatform } from '@/types/media';

interface ProcessedMetadata {
  cleanCaption: string;
  tags: string[];
  formattedDescriptions: Record<SocialPlatform, string>;
}

/**
 * Processa a legenda informada, extrai hashtags e formata o texto para cada rede social.
 */
export function processVideoMetadata(
  rawCaption: string,
  manualTags: string[] = []
): ProcessedMetadata {
  // 1. Extrai hashtags iniciadas por '#' dentro do texto principal
  const hashtagRegex = /#([\wáàâãéèêíïóôõöúçñ]+)/gi;
  const extractedHashtags: string[] = [];
  let match;

  while ((match = hashtagRegex.exec(rawCaption)) !== null) {
    extractedHashtags.push(match[1].toLowerCase());
  }

  // 2. Remove as hashtags do corpo da legenda para manter o texto limpo
  const cleanCaption = rawCaption
    .replace(hashtagRegex, '')
    .replace(/\s+/g, ' ')
    .trim();

  // 3. Unifica as tags manuais com as extraídas do texto (removendo duplicadas)
  const allTags = Array.from(
    new Set([...manualTags.map((t) => t.toLowerCase().replace(/^#/, '')), ...extractedHashtags])
  );

  // 4. Formata a descrição de acordo com os limites e estilo de cada plataforma
  const formattedDescriptions: Record<SocialPlatform, string> = {
    youtube: formatForYouTube(cleanCaption, allTags),
    instagram: formatForInstagram(cleanCaption, allTags),
    tiktok: formatForTikTok(cleanCaption, allTags),
  };

  return {
    cleanCaption,
    tags: allTags,
    formattedDescriptions,
  };
}

function formatForYouTube(caption: string, tags: string[]): string {
  const hashString = tags.map((t) => `#${t}`).join(' ');
  return `${caption}\n\n${hashString}`.trim();
}

function formatForInstagram(caption: string, tags: string[]): string {
  const hashString = tags.map((t) => `#${t}`).join(' ');
  // Adiciona espaçamento padrão do Instagram antes das hashtags
  return `${caption}\n.\n.\n.\n${hashString}`.trim();
}

function formatForTikTok(caption: string, tags: string[]): string {
  const hashString = tags.map((t) => `#${t}`).join(' ');
  const fullText = `${caption} ${hashString}`.trim();
  // TikTok possui limite de caracteres mais rígido na legenda principal
  return fullText.length > 2200 ? fullText.slice(0, 2197) + '...' : fullText;
}