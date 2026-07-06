// ============================================================
// index.js — Bot Service Entry Point
// Starts the HTTP server and wires up the bot
// ============================================================
require('dotenv').config();
const restify = require('restify');
const { BotFrameworkAdapter } = require('botbuilder');
const { EnterpriseBot } = require('./src/bot');

// Create adapter — handles authentication with Azure Bot Service
const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Error handler
adapter.onTurnError = async (context, error) => {
  console.error('[onTurnError]', error);
  await context.sendActivity('Something went wrong. Please try again.');
};

const bot = new EnterpriseBot();
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

// Main bot endpoint — Azure Bot Service calls this for every message
server.post('/api/messages', async (req, res) => {
  await adapter.processActivity(req, res, async (context) => {
    await bot.run(context);
  });
});

// Health check endpoint
server.get('/health', (req, res, next) => {
  res.send({ status: 'healthy', service: 'bot-service', timestamp: new Date() });
  next();
});

const PORT = parseInt(process.env.PORT) || 3978;
server.listen(PORT, () => {
  console.log(`\n✅ Enterprise AI Bot Server Started Successfully!`);
  console.log(`📡 Listening on: http://localhost:${PORT}`);
  console.log(`🔗 Bot endpoint: http://localhost:${PORT}/api/messages`);
});
