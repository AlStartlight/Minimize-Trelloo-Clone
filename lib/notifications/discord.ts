interface DiscordWebhookMessage {
  content?: string;
  embeds?: Array<{
    title: string;
    description?: string;
    color?: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    footer?: {
      text: string;
    };
    timestamp?: string;
  }>;
}

interface ReviewNotificationPayload {
  taskTitle: string;
  taskDescription?: string;
  taskLink: string;
  reviewerName: string;
  requesterName: string;
  boardName: string;
}

export class DiscordNotificationService {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async sendReviewRequest(payload: ReviewNotificationPayload): Promise<boolean> {
    try {
      const message: DiscordWebhookMessage = {
        embeds: [
          {
            title: '🔍 Review Requested',
            description: `A review has been requested for a task.`,
            color: 0x7c3aed, // Purple color
            fields: [
              {
                name: 'Task',
                value: payload.taskTitle,
                inline: true,
              },
              {
                name: 'Board',
                value: payload.boardName,
                inline: true,
              },
              {
                name: 'Requested by',
                value: payload.requesterName,
                inline: true,
              },
              {
                name: 'Reviewer',
                value: payload.reviewerName,
                inline: true,
              },
              {
                name: 'Link',
                value: `[Open Task](${payload.taskLink})`,
                inline: false,
              },
            ],
            footer: {
              text: 'Treeloo Kanban',
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      return response.ok;
    } catch (error) {
      console.error('Discord notification error:', error);
      return false;
    }
  }

  async sendReviewApproved(payload: ReviewNotificationPayload): Promise<boolean> {
    try {
      const message: DiscordWebhookMessage = {
        embeds: [
          {
            title: '✅ Review Approved',
            description: `A task review has been approved.`,
            color: 0x22c55e, // Green color
            fields: [
              {
                name: 'Task',
                value: payload.taskTitle,
                inline: true,
              },
              {
                name: 'Board',
                value: payload.boardName,
                inline: true,
              },
              {
                name: 'Reviewer',
                value: payload.reviewerName,
                inline: true,
              },
              {
                name: 'Link',
                value: `[Open Task](${payload.taskLink})`,
                inline: false,
              },
            ],
            footer: {
              text: 'Treeloo Kanban',
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      return response.ok;
    } catch (error) {
      console.error('Discord notification error:', error);
      return false;
    }
  }

  async sendReviewRejected(payload: ReviewNotificationPayload & { reason?: string }): Promise<boolean> {
    try {
      const message: DiscordWebhookMessage = {
        embeds: [
          {
            title: '❌ Review Rejected',
            description: `A task review has been rejected.`,
            color: 0xef4444, // Red color
            fields: [
              {
                name: 'Task',
                value: payload.taskTitle,
                inline: true,
              },
              {
                name: 'Board',
                value: payload.boardName,
                inline: true,
              },
              {
                name: 'Reviewer',
                value: payload.reviewerName,
                inline: true,
              },
              ...(payload.reason
                ? [
                    {
                      name: 'Reason',
                      value: payload.reason,
                      inline: false,
                    },
                  ]
                : []),
              {
                name: 'Link',
                value: `[Open Task](${payload.taskLink})`,
                inline: false,
              },
            ],
            footer: {
              text: 'Treeloo Kanban',
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      return response.ok;
    } catch (error) {
      console.error('Discord notification error:', error);
      return false;
    }
  }
}

export default DiscordNotificationService;
