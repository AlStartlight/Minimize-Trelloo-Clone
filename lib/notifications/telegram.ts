interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'Markdown' | 'HTML';
  disable_web_page_preview?: boolean;
}

interface ReviewNotificationPayload {
  taskTitle: string;
  taskDescription?: string;
  taskLink: string;
  reviewerName: string;
  requesterName: string;
  boardName: string;
}

export class TelegramNotificationService {
  private botToken: string;
  private chatId: string;

  constructor(botToken: string, chatId: string) {
    this.botToken = botToken;
    this.chatId = chatId;
  }

  async sendReviewRequest(payload: ReviewNotificationPayload): Promise<boolean> {
    try {
      const message: TelegramMessage = {
        chat_id: this.chatId,
        text: `*🔍 Review Requested*\n\n` +
              `A review has been requested for a task.\n\n` +
              `*Task:* ${payload.taskTitle}\n` +
              `*Board:* ${payload.boardName}\n` +
              `*Requested by:* ${payload.requesterName}\n` +
              `*Reviewer:* ${payload.reviewerName}\n\n` +
              `[Open Task](${payload.taskLink})`,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      };

      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Telegram notification error:', error);
      return false;
    }
  }

  async sendReviewApproved(payload: ReviewNotificationPayload): Promise<boolean> {
    try {
      const message: TelegramMessage = {
        chat_id: this.chatId,
        text: `*✅ Review Approved*\n\n` +
              `A task review has been approved.\n\n` +
              `*Task:* ${payload.taskTitle}\n` +
              `*Board:* ${payload.boardName}\n` +
              `*Reviewer:* ${payload.reviewerName}\n\n` +
              `[Open Task](${payload.taskLink})`,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      };

      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Telegram notification error:', error);
      return false;
    }
  }

  async sendReviewRejected(payload: ReviewNotificationPayload & { reason?: string }): Promise<boolean> {
    try {
      const reasonText = payload.reason ? `\n*Reason:* ${payload.reason}` : '';
      
      const message: TelegramMessage = {
        chat_id: this.chatId,
        text: `*❌ Review Rejected*\n\n` +
              `A task review has been rejected.\n\n` +
              `*Task:* ${payload.taskTitle}\n` +
              `*Board:* ${payload.boardName}\n` +
              `*Reviewer:* ${payload.reviewerName}` +
              reasonText +
              `\n\n[Open Task](${payload.taskLink})`,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      };

      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Telegram notification error:', error);
      return false;
    }
  }

  async sendAIReviewComplete(payload: ReviewNotificationPayload & { reviewSummary?: string }): Promise<boolean> {
    try {
      const summaryText = payload.reviewSummary ? `\n\n*Summary:* ${payload.reviewSummary}` : '';
      
      const message: TelegramMessage = {
        chat_id: this.chatId,
        text: `*🤖 AI Review Complete*\n\n` +
              `An AI code review has been completed.\n\n` +
              `*Task:* ${payload.taskTitle}\n` +
              `*Board:* ${payload.boardName}` +
              summaryText +
              `\n\n[Open Task](${payload.taskLink})`,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      };

      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Telegram notification error:', error);
      return false;
    }
  }
}

export default TelegramNotificationService;
