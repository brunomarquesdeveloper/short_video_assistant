"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Trash2, Film, Link as LinkIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoUploaderProps {
  onVideoSelect?: (file: File | null) => void;
}

export function VideoUploader({ onVideoSelect }: VideoUploaderProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Limpa URLs anteriores da memória
  const clearPreviousUrl = () => {
    if (videoPreviewUrl && videoPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
  };

  // Processa arquivo vindo do computador
  const handleFile = (file: File) => {
    if (!file.type.startsWith("video/")) {
      setErrorMessage("Por favor, selecione um arquivo de vídeo válido.");
      return;
    }

    setErrorMessage(null);
    clearPreviousUrl();

    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoPreviewUrl(url);

    if (onVideoSelect) onVideoSelect(file);
  };

  // Processa vídeo a partir de uma URL/Link
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setErrorMessage(null);
    setIsLoadingUrl(true);

    try {
      // Redireciona a chamada para a nossa API interna
      const response = await fetch(`/api/download-video?url=${encodeURIComponent(inputUrl)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Não foi possível carregar o vídeo.");
      }

      const blob = await response.blob();
      const fileName = "video-plataforma.mp4";
      const file = new File([blob], fileName, { type: "video/mp4" });

      clearPreviousUrl();
      const previewUrl = URL.createObjectURL(file);

      setVideoFile(file);
      setVideoPreviewUrl(previewUrl);

      if (onVideoSelect) onVideoSelect(file);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao carregar o vídeo da plataforma.");
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    clearPreviousUrl();
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setInputUrl("");
    setErrorMessage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onVideoSelect) {
      onVideoSelect(null);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        accept="video/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {!videoPreviewUrl ? (
        <div className="space-y-4">
          {/* Dropzone para Arquivo Local */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            className={cn(
              "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 text-center",
              isDragging
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-zinc-800 bg-zinc-900/50 hover:border-indigo-500/50 hover:bg-zinc-900"
            )}
          >
            <div className="p-3 mb-3 rounded-full bg-zinc-800 text-zinc-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-zinc-200">
              Clique para selecionar ou arraste o vídeo aqui
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              MP4, MOV, WebM (Formatos verticais recomendados)
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 my-2">
            <div className="h-px bg-zinc-800 flex-1" />
            <span>OU COLE UM LINK</span>
            <div className="h-px bg-zinc-800 flex-1" />
          </div>

          {/* Campo para Input de URL */}
          <form onSubmit={handleUrlSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="url"
                placeholder="https://exemplo.com/video.mp4"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <button
              type="submit"
              disabled={isLoadingUrl || !inputUrl}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-xs font-medium rounded-lg transition-colors"
            >
              {isLoadingUrl ? "Carregando..." : "Carregar"}
            </button>
          </form>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      ) : (
        /* Área de Pré-visualização com Proporção Vertical 9:16 */
        <div className="relative overflow-hidden border border-zinc-800 rounded-xl bg-zinc-900/50 p-2">
          <div className="relative aspect-[9/16] max-h-[450px] mx-auto rounded-lg overflow-hidden bg-black flex items-center justify-center">
            <video
              src={videoPreviewUrl}
              controls
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex items-center justify-between mt-3 px-2">
            <div className="flex items-center space-x-2 text-xs text-zinc-400 truncate max-w-[70%]">
              <Film className="w-4 h-4 shrink-0 text-indigo-500" />
              <span className="truncate">{videoFile?.name || "Vídeo via Link"}</span>
            </div>

            <button
              onClick={handleRemove}
              type="button"
              className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Remover
            </button>
          </div>
        </div>
      )}
    </div>
  );
}