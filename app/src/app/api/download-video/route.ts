import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get("url");

  if (!videoUrl) {
    return NextResponse.json(
      { error: "URL do vídeo é obrigatória." },
      { status: 400 }
    );
  }

  try {
    // Caso seja uma URL de arquivo de mídia direto (.mp4, .webm, .mov)
    if (videoUrl.match(/\.(mp4|webm|mov)(\?.*)?$/i)) {
      const directResponse = await fetch(videoUrl);
      if (directResponse.ok && directResponse.body) {
        return new NextResponse(directResponse.body as any, {
          headers: {
            "Content-Type": "video/mp4",
            "Content-Disposition": 'attachment; filename="video-direto.mp4"',
          },
        });
      }
    }

    // Chamada formatada para a API v10 do Cobalt
    const cobaltResponse = await fetch("https://api.cobalt.tools/", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: videoUrl,
        videoQuality: "720",
        downloadMode: "auto",
      }),
    });

    const data = await cobaltResponse.json();

    if (!cobaltResponse.ok || data.status === "error") {
      return NextResponse.json(
        {
          error:
            data?.text ||
            "A plataforma de origem bloqueou a raspagem automatizada. Tente o upload direto do arquivo.",
        },
        { status: 400 }
      );
    }

    // Mídia obtida com sucesso
    let streamUrl = data.url;
    if (!streamUrl && data.picker && data.picker.length > 0) {
      streamUrl = data.picker[0].url;
    }

    if (!streamUrl) {
      return NextResponse.json(
        { error: "Link de download não encontrado." },
        { status: 404 }
      );
    }

    // Faz o redirecionamento em modo Stream para o frontend
    const mediaResponse = await fetch(streamUrl);

    if (!mediaResponse.ok || !mediaResponse.body) {
      return NextResponse.json(
        { error: "Falha ao obter o vídeo da plataforma." },
        { status: 502 }
      );
    }

    return new NextResponse(mediaResponse.body as any, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="short-video.mp4"',
      },
    });
  } catch (error: any) {
    console.error("Erro na API de download:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar o vídeo. Tente o upload do arquivo local." },
      { status: 500 }
    );
  }
}