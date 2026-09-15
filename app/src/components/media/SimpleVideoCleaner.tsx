"use client";

import React, { useState } from "react";
import { Link, Upload, Trash2, Sparkles, Loader2, Play } from "lucide-react";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export function SimpleVideoCleaner() {
  const [videoSource, setVideoSource] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Estados do processamento
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCleaned, setIsCleaned] = useState(false);

  // Seleção de arquivo local
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setVideoUrl(fileUrl);
      setIsCleaned(false);
    }
  };

  // Carregamento via URL
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      setVideoUrl(urlInput.trim());
      setIsCleaned(false);
    }
  };

  // Ação 1: Limpar Vídeo
  const handleCleanVideo = async () => {
    setIsProcessing(true);

    try {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();

      // 1. Carrega o vídeo no FS virtual do FFmpeg
      const fileData = await fetchFile(videoUrl!);
      await ffmpeg.writeFile('input.mp4', fileData);

      // 2. Executa a limpeza (ex: desfoque/remoção de marca d'água em área específica)
      // delogo=x=10:y=10:w=120:h=40
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', 'delogo=x=10:y=10:w=120:h=40',
        '-c:a', 'copy',
        'output.mp4'
      ]);

      // 3. Lê o vídeo limpo resultante
      const data = await ffmpeg.readFile('output.mp4');
      const uint8Array = data instanceof Uint8Array ? data : new Uint8Array(data as unknown as ArrayBuffer);
      const cleanedBlob = new Blob([uint8Array.buffer as ArrayBuffer], { type: 'video/mp4' });
      const cleanedUrl = URL.createObjectURL(cleanedBlob);

      setVideoUrl(cleanedUrl);
      setIsCleaned(true);
    } catch (error) {
      console.error('Erro no processamento do vídeo:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  // Ação 2: Excluir Edição (Volta ao estado original)
  const handleDiscardEdit = () => {
    setIsCleaned(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold text-foreground">Limpeza de Vídeo Simplificada</h1>

      {/* 1. Escolha da Fonte do Vídeo (Local ou URL) */}
      {!videoUrl && (
        <div className="border border-dashed rounded-xl p-6 bg-card space-y-4">
          <div className="flex gap-4 border-b pb-3">
            <button
              type="button"
              onClick={() => setVideoSource("file")}
              className={`text-sm font-medium flex items-center gap-2 ${videoSource === "file" ? "text-primary font-bold" : "text-muted-foreground"
                }`}
            >
              <Upload className="w-4 h-4" /> Arquivo Local
            </button>
            <button
              type="button"
              onClick={() => setVideoSource("url")}
              className={`text-sm font-medium flex items-center gap-2 ${videoSource === "url" ? "text-primary font-bold" : "text-muted-foreground"
                }`}
            >
              <Link className="w-4 h-4" /> URL do Vídeo
            </button>
          </div>

          {videoSource === "file" ? (
            <div className="flex flex-col items-center justify-center py-6">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
              >
                Selecionar Vídeo
              </label>
            </div>
          ) : (
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                type="url"
                placeholder="Cole a URL do vídeo aqui..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                required
                className="flex-1 px-3 py-2 border rounded-md bg-background text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
              >
                Carregar
              </button>
            </form>
          )}
        </div>
      )}

      {/* 2. Player do Vídeo e Ações */}
      {videoUrl && (
        <div className="space-y-4">
          <div className="relative aspect-[9/16] max-h-[500px] mx-auto bg-black rounded-xl overflow-hidden border flex items-center justify-center">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Limpando vídeo...</p>
              </div>
            ) : (
              <video
                src={videoUrl}
                controls
                className="w-full h-full object-contain"
              />
            )}

            {isCleaned && !isProcessing && (
              <span className="absolute top-3 right-3 bg-emerald-500/90 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Vídeo Limpo
              </span>
            )}
          </div>

          {/* Botões de Ação Simplificados */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleCleanVideo}
              disabled={isProcessing}
              className="flex-1 max-w-[200px] py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Limpar
                </>
              )}
            </button>

            {isCleaned && (
              <button
                type="button"
                onClick={handleDiscardEdit}
                disabled={isProcessing}
                className="flex-1 max-w-[200px] py-2.5 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Excluir Edição
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}