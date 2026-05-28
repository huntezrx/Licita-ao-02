export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-prod',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  twoFactor: {
    appName: process.env.TWO_FACTOR_APP_NAME || 'SistemaLicitacao',
  },

  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'sa-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || 'licitacao-documents',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4-turbo-preview',
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'noreply@sualicitacao.com.br',
  },

  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
  },

  pncp: {
    apiUrl: process.env.PNCP_API_URL || 'https://pncp.gov.br/api/pncp/v1',
    apiKey: process.env.PNCP_API_KEY || '',
  },

  comprasnet: {
    apiUrl: process.env.COMPRASNET_API_URL || 'https://comprasnet.gov.br/api',
  },

  crawlerSchedule: process.env.CRAWLER_SCHEDULE || '0 */6 * * *',

  encryption: {
    key: process.env.ENCRYPTION_KEY || 'your-32-char-key-here!!!!!!!!!!!!',
  },
});
