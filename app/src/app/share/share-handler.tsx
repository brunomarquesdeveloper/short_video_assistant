'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ShareHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Recebendo e processando vídeo...');

  useEffect(() => {
    async function handleIncomingShare() {
      try {
        // Captura parâmetros compartilhados via Web Share Target (ex: url, title, text)
        const sharedUrl = searchParams.get('url') || searchParams.get('text');

        if (sharedUrl) {
          console.log('URL recebida via compartilhamento:', sharedUrl);
          // Armazena temporariamente para resgatar na página principal
          sessionStorage.setItem('shared_video_url', sharedUrl);
          
          setStatus('success');
          setMessage('Vídeo recebido! Redirecionando...');
          
          setTimeout(() => {
            router.push('/');
          }, 1500);
          return;
        }

        // Caso nenhum dado válido tenha sido passado
        setStatus('error');
        setMessage('Nenhum vídeo ou link foi detectado no compartilhamento.');
      } catch (err) {
        console.error('Erro ao processar compartilhamento:', err);
        setStatus('error');
        setMessage('Falha ao processar o conteúdo compartilhado.');
      }
    }

    handleIncomingShare();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
          <p className="text-zinc-300 font-medium">{message}</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-4" />
          <p className="text-zinc-200 font-medium">{message}</p>
        </>
      )}

      {status === 'error' && (
        <>
          <AlertCircle className="h-10 w-10 text-rose-500 mb-4" />
          <p className="text-zinc-400 text-sm mb-4">{message}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm rounded-lg border border-zinc-700 transition-colors"
          >
            Voltar para o início
          </button>
        </>
      )}
    </div>
  );
}