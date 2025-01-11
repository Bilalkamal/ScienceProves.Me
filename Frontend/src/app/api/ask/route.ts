import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { env } from '@/config/env';


export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);
  
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }), 
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const body = await request.json();
  const { question } = body;
  
  if (!question) {
    return new Response(
      JSON.stringify({ error: 'Question is required' }), 
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sendEvent = async (event: string, data: any) => {
    // Clean the event string and ensure proper formatting
    const cleanEvent = event.replace(/[\r\n]/g, '').trim();
    await writer.write(
      encoder.encode(`event: ${cleanEvent}\ndata: ${JSON.stringify(data)}\n\n`)
    );
  };

  (async () => {
    try {
      await sendEvent('status', { status: 'Validating your scientific question...' });

      const apiUrl = `${env.apiUrl}/ask`;

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
          },
          body: JSON.stringify({
            question,
            user_id: userId,
            stream: true,
          }),
        });

        if (response.status === 500) {
          await sendEvent('error', {
            message: "I apologize, but I'm having trouble connecting to the research service right now. Please try again in a few moments.",
            code: 'SERVICE_UNAVAILABLE'
          });
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `API request failed with status ${response.status}`);
        }

        if (!response.body) {
          throw new Error('No response body received from API');
        }

        const reader = response.body.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = new TextDecoder().decode(value);
            
            const events = chunk
              .split(/\n\n/)
              .filter(Boolean)
              .map(event => event.trim());
            
            for (const event of events) {
              const eventMatch = event.match(/^event: (.+?)\ndata: (.+)$/s);
              if (eventMatch) {
                const [, eventType, data] = eventMatch;
                const cleanEventType = eventType.replace(/[\r\n]/g, '').trim();
                await writer.write(
                  encoder.encode(`event: ${cleanEventType}\ndata: ${data.trim()}\n\n`)
                );
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

      } catch (error) {
        await sendEvent('error', {
          message: "I apologize, but I'm having trouble connecting to the research service right now. Please try again in a few moments.",
          code: 'CONNECTION_ERROR'
        });
      }

    } catch (error) {
      await sendEvent('error', {
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'STREAM_ERROR'
      });
    } finally {
      try {
        await writer.close();
      } catch (error) {
        if (error?.code !== 'ERR_INVALID_STATE') {
          console.error('Error closing stream:', error);
        }
      }
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 