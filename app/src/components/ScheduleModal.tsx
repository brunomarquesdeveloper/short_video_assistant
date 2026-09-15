"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { 
  Calendar, 
  Clock, 
  X, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Wand2, 
  Tag, 
  Sparkles 
} from "lucide-react";
import { MediaItem, MediaStatus } from "@/types/media";
import { generateAutoVideoPackage } from "@/services/videoEnhancer";

export interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule?: (scheduledData: { date: string; time: string; caption?: string; tags?: string[] }) => void;
  items?: MediaItem[];
  currentCaption?: string; // Legenda atual do vídeo (opcional)
}

export function ScheduleModal({ 
  isOpen, 
  onClose, 
  onSchedule, 
  items = [],
  currentCaption = ""
}: ScheduleModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [activeTab, setActiveTab] = useState<"form" | "list" | "ai">(
    items.length > 0 ? "list" : "form"
  );

  // Estados da IA
  const [brandHandle, setBrandHandle] = useState("@seu_canal");
  const [rawText, setRawText] = useState(currentCaption);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    cleanCaption: string;
    tags: string[];
    descriptions: Record<string, string>;
  } | null>(null);

  // Gera sugestões automáticas com base na legenda ou transcrição
  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const result = await generateAutoVideoPackage({
        rawCaption: rawText || "Confira este vídeo sobre tecnologia e dicas rápidas",
        brandHandle: brandHandle || "@meucanal",
      });
      setAiSuggestions(result);
    } catch (error) {
      console.error("Erro ao gerar sugestões:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSchedule) {
      onSchedule({ 
        date, 
        time, 
        caption: aiSuggestions?.cleanCaption || rawText,
        tags: aiSuggestions?.tags || []
      });
    }
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background p-6 rounded-xl border shadow-lg w-full max-w-lg z-50 max-h-[85vh] flex flex-col">
          
          {/* Header com Navegação de Abas */}
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className={`text-sm font-semibold flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                  activeTab === "list"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="w-4 h-4" />
                Agendados ({items.length})
              </button>
              
              <button
                type="button"
                onClick={() => setActiveTab("form")}
                className={`text-sm font-semibold flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                  activeTab === "form"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Horário
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("ai")}
                className={`text-sm font-semibold flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                  activeTab === "ai"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                Sugestões de IA
              </button>
            </div>

            <Dialog.Close
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          {/* Aba 1: Listagem dos Vídeos Agendados */}
          {activeTab === "list" && (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum vídeo agendado na fila.
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border rounded-lg bg-card flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">
                        {item.metadata.caption || "Sem legenda"}
                      </p>
                      <p className="text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.metadata.scheduledAt).toLocaleString("pt-BR")}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {item.metadata.platforms.map((p) => (
                          <span
                            key={p}
                            className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-[10px] capitalize"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    <StatusIcon status={item.status} />
                  </div>
                ))
              )}
            </div>
          )}

          {/* Aba 2: Formulário Rápido de Agendamento */}
          {activeTab === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Data de envio
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Horário
                </label>
                <div className="relative">
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Clock className="w-4 h-4 absolute right-3 top-3 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Exibe resumo das sugestões caso tenham sido geradas na aba de IA */}
              {aiSuggestions && (
                <div className="p-3 bg-muted/50 rounded-lg text-xs space-y-1">
                  <p className="font-semibold text-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Sugestões prontas:
                  </p>
                  <p className="text-muted-foreground truncate">{aiSuggestions.cleanCaption}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {aiSuggestions.tags.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 bg-background border rounded text-[10px]">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          )}

          {/* Aba 3: Sugestões Automáticas de Tags e Legendas */}
          {activeTab === "ai" && (
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-medium mb-1 text-foreground">
                  Sua Marca / Canal (para marca d'água)
                </label>
                <input
                  type="text"
                  value={brandHandle}
                  onChange={(e) => setBrandHandle(e.target.value)}
                  placeholder="@seu_canal"
                  className="w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-foreground">
                  Texto base ou ideia da legenda
                </label>
                <textarea
                  rows={3}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Ex: Como criar vídeos automáticos com IA..."
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground text-xs"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" /> Gerar Novas Tags e Legenda
                  </>
                )}
              </button>

              {aiSuggestions && (
                <div className="mt-4 p-3 border rounded-lg bg-card space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-foreground block mb-1">Legenda Limpa:</span>
                    <p className="text-muted-foreground bg-muted p-2 rounded">{aiSuggestions.cleanCaption}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-foreground block mb-1 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Tags Geradas:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {aiSuggestions.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[11px]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("form")}
                    className="w-full mt-2 py-1.5 border border-primary text-primary hover:bg-primary/10 rounded-md text-xs font-medium transition-colors"
                  >
                    Usar estas sugestões no Agendamento →
                  </button>
                </div>
              )}
            </div>
          )}

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function StatusIcon({ status }: { status: MediaStatus }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
    case "processing":
      return <Loader2 className="w-4 h-4 text-indigo-500 animate-spin flex-shrink-0" />;
    case "queued":
      return <Clock className="w-4 h-4 text-zinc-400 flex-shrink-0" />;
    case "failed":
      return <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />;
  }
}