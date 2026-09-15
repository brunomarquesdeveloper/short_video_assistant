import React, { useState } from 'react';
import { VideoMetadata, SocialPlatform } from '@/types/media';
import { processVideoMetadata } from '@/utils/textProcessor';

interface Props {
  onSubmit: (data: VideoMetadata) => void;
  isLoading?: boolean;
}

interface Props {
  onSubmit: (data: VideoMetadata) => void;
  isLoading?: boolean;
}

const AVAILABLE_PLATFORMS: { id: SocialPlatform; name: string }[] = [
  { id: 'youtube', name: 'YouTube Shorts' },
  { id: 'instagram', name: 'Instagram Reels' },
  { id: 'tiktok', name: 'TikTok' },
];
export const VideoMetadataForm: React.FC<Props> = ({ onSubmit, isLoading = false }) => {
  const [caption, setCaption] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Manipulação de Tags (Adiciona ao pressionar Enter ou Vírgula)
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Seleção / Desseleção de Plataformas
  const togglePlatform = (id: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Obtém a data/hora atual no formato 'YYYY-MM-DDTHH:mm' para o atributo min do input
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  // Validação e Envio
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const processed = processVideoMetadata(caption, tags);

    if (!caption.trim()) {
      newErrors.caption = 'A legenda/descrição é obrigatória.';
    }

    if (selectedPlatforms.length === 0) {
      newErrors.platforms = 'Selecione pelo menos uma plataforma de destino.';
    }

    if (!scheduledAt) {
      newErrors.scheduledAt = 'Selecione a data e horário do agendamento.';
    } else if (new Date(scheduledAt) <= new Date()) {
      newErrors.scheduledAt = 'O agendamento deve ser para uma data e hora futuras.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      caption: processed.cleanCaption,
      tags: processed.tags,
      platforms: selectedPlatforms,
      scheduledAt,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Metadados e Agendamento</h2>

      {/* Legenda / Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Legenda / Descrição <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Escreva a legenda do seu vídeo..."
          className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 text-sm"
        />
        {errors.caption && <p className="text-red-500 text-xs mt-1">{errors.caption}</p>}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hashtags / Tags
        </label>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Digite uma tag e pressione Enter..."
          className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300 text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">Pressione Enter ou vírgula para adicionar cada tag.</p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-blue-900 font-bold ml-1"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Seleção de Plataformas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Plataformas de Destino <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {AVAILABLE_PLATFORMS.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform.id);
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => togglePlatform(platform.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${isSelected
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
              >
                {platform.name}
              </button>
            );
          })}
        </div>
        {errors.platforms && <p className="text-red-500 text-xs mt-1">{errors.platforms}</p>}
      </div>

      {/* Agendamento (Data e Hora) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data e Hora de Publicação <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          min={getMinDateTime()}
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300 text-sm"
        />
        {errors.scheduledAt && <p className="text-red-500 text-xs mt-1">{errors.scheduledAt}</p>}
      </div>

      {/* Botão de Envio */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Agendando...' : 'Confirmar Agendamento'}
      </button>
    </form>
  );
};