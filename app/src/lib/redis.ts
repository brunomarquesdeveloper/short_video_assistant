import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Configurações do cliente Redis otimizadas para o BullMQ
export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Obrigatório para o funcionamento correto do BullMQ
  enableReadyCheck: false,
});

redisConnection.on('connect', () => {
  console.log(' Conectado ao Redis com sucesso.');
});

redisConnection.on('error', (err) => {
  console.error(' Erro na conexão com o Redis:', err);
});