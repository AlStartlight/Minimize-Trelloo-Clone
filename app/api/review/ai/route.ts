import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';

interface ReviewRequest {
  code: string;
  language: string;
  taskId: string;
  framework?: string;
}

interface AIReviewResponse {
  status: 'success' | 'error';
  review?: {
    summary: string;
    issues: Array<{
      severity: 'error' | 'warning' | 'info';
      message: string;
      line?: number;
      suggestion?: string;
    }>;
    bestPractices: string[];
    securityIssues: string[];
    performanceTips: string[];
  };
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { code, language, taskId, framework } = body as ReviewRequest;

    if (!code || !language || !taskId) {
      return NextResponse.json(
        { error: 'Missing required fields: code, language, taskId' },
        { status: 400 }
      );
    }

    // Verify user has access to the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: { members: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const isOwner = task.project.ownerId === session.user.id;
    const isMember = task.project.members.some(m => m.userId === session.user.id);

    if (!isOwner && !isMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Generate AI review using OpenAI API
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      // Return mock review for development
      const mockReview: AIReviewResponse = {
        status: 'success',
        review: {
          summary: 'Code review completed with no critical issues found.',
          issues: [
            {
              severity: 'info',
              message: 'Consider adding type annotations for better type safety',
              line: 1,
              suggestion: 'Add explicit type annotations where TypeScript infers `any`',
            },
          ],
          bestPractices: [
            'Use consistent naming conventions',
            'Add error handling for edge cases',
            'Consider breaking down complex functions',
          ],
          securityIssues: [],
          performanceTips: [
            'Consider using memoization for expensive calculations',
            'Use React.useCallback for event handlers passed to child components',
          ],
        },
      };

      // Save review to database
      await prisma.reviewRequest.create({
        data: {
          taskId,
          type: 'ai',
          status: 'completed',
          aiReview: JSON.stringify(mockReview),
        },
      });

      return NextResponse.json(mockReview);
    }

    // Call OpenAI API for real review
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a senior code reviewer. Analyze the provided code and return a JSON response with:
            - summary: Brief overall assessment
            - issues: Array of {severity: "error"|"warning"|"info", message, line?, suggestion?}
            - bestPractices: Array of improvement suggestions
            - securityIssues: Array of security concerns
            - performanceTips: Array of performance optimizations`,
          },
          {
            role: 'user',
            content: `Review this ${language} code${framework ? ` using ${framework}` : ''}:\n\n\`\`\`${language}\n${code}\n\`\`\``,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    const aiContent = data.choices[0]?.message?.content || '';

    let aiReview: Record<string, unknown>;
    try {
      aiReview = JSON.parse(aiContent);
    } catch {
      aiReview = {
        summary: aiContent,
        issues: [],
        bestPractices: [],
        securityIssues: [],
        performanceTips: [],
      };
    }

    const reviewResponse: AIReviewResponse = {
      status: 'success',
      review: aiReview as AIReviewResponse['review'],
    };

    // Save review to database
    await prisma.reviewRequest.create({
      data: {
        taskId,
        type: 'ai',
        status: 'completed',
        aiReview: JSON.stringify(reviewResponse),
      },
    });

    return NextResponse.json(reviewResponse);
  } catch (error) {
    console.error('AI review error:', error);
    return NextResponse.json(
      { status: 'error', error: 'Failed to generate AI review' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const taskId = url.searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const reviews = await prisma.reviewRequest.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json({ error: 'Failed to get reviews' }, { status: 500 });
  }
}
