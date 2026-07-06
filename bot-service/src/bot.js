// ============================================================
// bot.js — The Bot's Brain
// Receives messages from Teams/Slack/WhatsApp,
// calls AI Service, sends answer back to user
// ============================================================
const { ActivityHandler, MessageFactory } = require('botbuilder');
const axios = require('axios');

class EnterpriseBot extends ActivityHandler {
  constructor() {
    super();
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    // --------------------------------------------------------
    // EVENT: onMessage — runs EVERY TIME a user sends a message
    // --------------------------------------------------------
    this.onMessage(async (context, next) => {
      const userMessage = context.activity.text;
      const userId = context.activity.from.id;
      const userName = context.activity.from.name || 'User';
      const channel = context.activity.channelId;

      console.log('─'.repeat(50));
      console.log(`[${new Date().toISOString()}]`);
      console.log(`Channel  : ${channel}`);
      console.log(`User     : ${userName} (${userId})`);
      console.log(`Message  : ${userMessage}`);
      console.log('─'.repeat(50));

      // Show typing indicator while AI is thinking
      await context.sendActivity({ type: 'typing' });

      try {
        const response = await axios.post(`${this.aiServiceUrl}/ask`, {
          question: userMessage,
          user_id: userId,
          conversation_id: context.activity.conversation.id,
          channel: channel
        }, { timeout: 25000 });

        await context.sendActivity(
          MessageFactory.text(response.data.answer)
        );
      } catch (error) {
        console.error('Bot error:', error.message);
        await context.sendActivity(
          MessageFactory.text('Sorry, I encountered an error. Please try again.')
        );
      }
      await next();
    });

    // Welcome message when user first joins
    this.onMembersAdded(async (context, next) => {
      for (const member of context.activity.membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          await context.sendActivity(
            MessageFactory.text(
              '👋 Hello! I am your Enterprise AI Agent.\n\n' +
              'Ask me anything about your data, clinical trials, sales, or finance.\n\n' +
              'Type **help** to see what I can do.'
            )
          );
        }
      }
      await next();
    });
  }
}

module.exports.EnterpriseBot = EnterpriseBot;
