"use client";

import { useState, useCallback } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export function useFFmpeg() {
  const [loaded, setLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const load = useCallback(async () => {
    try {
      const ffmpeg = await getFFmpeg();
      ffmpeg.on("progress", ({ progress }) => {
        setProgress(Math.round(progress * 100));
      });
      setLoaded(true);
    } catch (error) {
      console.error("Erro ao carregar FFmpeg:", error);
    }
  }, []);

  const processVideo = async (inputFile: File, outputName: string = "output.mp4"): Promise<Blob | null> => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const ffmpeg = await getFFmpeg();
      
      // Escreve o arquivo na memória virtual do FFmpeg
      await ffmpeg.writeFile(inputFile.name, await fetchFile(inputFile));

      // Exemplo: Transcodificação para MP4
      await ffmpeg.exec(["-i", inputFile.name, outputName]);

      // Lê o resultado da memória como um Uint8Array explicitamente
      const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
      setIsProcessing(false);

      // Garante conversão segura para ArrayBuffer tradicional compatível com BlobPart
      const safeBuffer = data.buffer.slice(
        data.byteOffset, 
        data.byteOffset + data.byteLength
      ) as ArrayBuffer;

      return new Blob([safeBuffer], { type: "video/mp4" });
    } catch (error) {
      console.error("Erro no processamento do vídeo:", error);
      setIsProcessing(false);
      return null;
    }
  };

  return { load, loaded, isProcessing, progress, processVideo };
}