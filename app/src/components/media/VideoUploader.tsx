"use client";

import React, { useState } from "react";
import { Upload, Link as LinkIcon, Sparkles, Trash2, Loader2, RefreshCw } from "lucide-react";
import { useFFmpeg } from "@/hooks/useFFmpeg";

interface VideoUploaderProps {
  onVideoSelect?: (file: File | null) => void;
  onCleanComplete?: (cleanedUrl: string) => void;
}

export function VideoUploader({ onVideoSelect, onCleanComplete }: VideoUploaderProps) {
  const [sourceType, setSourceType] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCleaned, setIsCleaned] = useState(false);

  // Hook do FFmpeg
  const { load: loadFFmpeg, loaded: ffmpegLoaded, processVideo } = useFFmpeg();

  React.useEffect(() => {
    loadFFmpeg();
  }, [loadFFmpeg]);

  // Upload Local
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const createdUrl = URL.createObjectURL(file);
      setVideoUrl(createdUrl);
      setOriginalUrl(createdUrl);
      setIsCleaned(false);
      if (onVideoSelect) onVideoSelect(file);
    }
  };

  // Upload via URL
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      setVideoUrl(urlInput.trim());
      setOriginalUrl(urlInput.trim());
      setIsCleaned(false);
    }
  };

  // Ação de Limpeza com o FFmpeg integrando o filtro delogo
  const handleCleanVideo = async () => {
    if (!videoUrl) return;
    setIsProcessing(true);

    try {
      // Busca o vídeo atual e gera um Blob para o FFmpeg
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const inputFile = new File([blob], "input.mp4", { type: "video/mp4" });

      // Aplica o filtro de limpeza via motor FFmpeg
      const cleanedBlob = await processVideo(inputFile, "cleaned.mp4");

      if (cleanedBlob) {
        const cleanedResultUrl = URL.createObjectURL(cleanedBlob);
        setVideoUrl(cleanedResultUrl);
        setIsCleaned(true);
        if (onCleanComplete) onCleanComplete(cleanedResultUrl);
      }
    } catch (error) {
      console.error("Erro ao limpar vídeo:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Desfazer Edição
  const handleDiscardEdit = () => {
    setVideoUrl(originalUrl);
    setIsCleaned(false);
  };

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
      {/* 1. Escolha de Entrada: Arquivo ou URL */}
      {!videoUrl ? (
        <div className="space-y-4">
          <div className="flex gap-4 border-b border-zinc-800 pb-2">
            <button
              type="button"
              onClick={() => setSourceType("file")}
              className={`text-xs font-semibold flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                sourceType === "file" ? "border-indigo-500 text-indigo-400" : "text-zinc-400"
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Arquivo Local
            </button>
            <button
              type="button"
              onClick={() => setSourceType("url")}
              className={`text-xs font-semibold flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                sourceType === "url" ? "border-indigo-500 text-indigo-400" : "text-zinc-400"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" /> URL do Vídeo
            </button>
          </div>

          {sourceType === "file" ? (
            <div className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center text-center">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="uploader-file-input"
              />
              <label
                htmlFor="uploader-file-input"
                className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Selecionar Vídeo
              </label>
            </div>
          ) : (
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                required
                className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg"
              >
                Carregar
              </button>
            </form>
          )}
        </div>
      ) : (
        /* 2. Visualizador com Botão de Limpeza embutido */
        <div className="space-y-3">
          <div className="relative aspect-[9/16] max-h-[380px] mx-auto bg-black rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2 text-indigo-400">
                <Loader2 className="w-7 h-7 animate-spin" />
                <span className="text-xs font-medium">Limpando marca d'água...</span>
              </div>
            ) : (
              <video src={videoUrl} controls className="w-full h-full object-contain" />
            )}

            {isCleaned && !isProcessing && (
              <span className="absolute top-2 right-2 bg-emerald-500/90 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Limpo
              </span>
            )}
          </div>

          {/* Botões de Ação no próprio Uploader */}
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={handleCleanVideo}
              disabled={isProcessing || !ffmpegLoaded}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> {isCleaned ? "Reaplicar Limpeza" : "Limpar Vídeo"}
                </>
              )}
            </button>

            {isCleaned && (
              <button
                type="button"
                onClick={handleDiscardEdit}
                disabled={isProcessing}
                className="px-3 py-2 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Excluir Edição
              </button>
            )}

            <button
              type="button"
              onClick={() => setVideoUrl(null)}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs"
            >
              Trocar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}