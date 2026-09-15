# 🛠️ Checklist de Desenvolvimento - Short Video Assistant

## Módulo 0: Planejamento & Configuração Inicial
- [x] definir escopo do projeto e arquitetura inicial
- [x] configurar estrutura do projeto e dependencias iniciais

## Módulo 1: Estruturação Base e PWA
- [x]  configurar projeto react typescript com tailwind css
- [x]  configurar manifesto web app e icones
- [x]  registrar service worker para suporte offline
- [x] implementar estrutura de layout mobile-first

## Módulo 2: Interface e Gestão de Mídia
- [x] adicionar componente de upload de video com pré-visualizacao
- [ ] criar formulario de metadados para legenda e agendamento
- [ ] adicionar painel para listar videos agendados e processados
- [ ] implementar status em tempo real da fila de processamento

## Módulo 3: Processamento de Vídeo (FFmpeg & BullMQ)
- [ ] configurar cliente de conexao com redis
- [ ] configurar fila de processamento em segundo plano com bullmq
- [ ] implementar script ffmpeg para conversao de proporcao 9:16
- [ ] dicionar tratamento de erros e tentativas automaticas
- [ ] implementar limpeza automatica de arquivos temporarios

## Módulo 4: Notificações & Agendamento
- [ ] configurar servidor web push com chaves vapid
- [ ] solicitar permissao de notificacoes no frontend
- [ ] adicionar worker para disparar notificacoes no horario agendado
- [ ] gerenciar clique da notificacao para abrir o video correspondente

## Módulo 5: Testes & Deploy
- [ ] verificar funcionalidade do modo offline e estrategia de cache
- [ ] realizar teste de estresse na fila de renderizacao
- [ ] configurar fluxo de integracao continua
- [ ] realizar deploy da aplicacao web e da infraestrutura de filas