'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

function ShareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Recebendo e processando vídeo...');

  useEffect(() => {
    async function handleIncomingShare() {
      try {
        // Captura parâmetros enviados via Web Share Target (ou query string)
        const sharedUrl = searchParams.get('url') || searchParams.get('text') || searchParams.get('title');

        if (sharedUrl) {
          console.log('Conteúdo recebido via compartilhamento:', sharedUrl);
          
          // Salva no sessionStorage para ler na página principal (Home)
          sessionStorage.setItem('shared_video_url', sharedUrl);
          
          setStatus('success');
          setMessage('Vídeo recebido com sucesso! Redirecionando...');
          
          setTimeout(() => {
            router.push('/');
          }, 1500);
          return;
        }

        setStatus('error');
        setMessage('Nenhum vídeo ou link foi detectado no compartilhamento.');
      } catch (err) {
        console.error('Erro ao processar compartilhamento:', err);
        setStatus('error');
        setMessage('Falha ao processar o conteúdo recebido.');
      }
    }

    handleIncomingShare();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
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

export default function SharePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-50 p-4">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          <span className="text-sm text-zinc-400">Carregando compartilhamento...</span>
        </div>
      }>
        <ShareContent />
      </Suspense>
    </main>
  );
}