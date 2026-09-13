import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // TODO: Implementar envio de Web Push com web-push library
    console.log('Notificação agendada enviada:', body);

    return NextResponse.json({ success: true, message: 'Notificação processada.' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao processar notificação.' },
      { status: 500 }
    );
  }
}