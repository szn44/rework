"use server";

import { CoreMessage } from "ai";

export async function continueConversation(messages: CoreMessage[]) {
  // Convert messages to a simple prompt
  const lastUserMessage = messages.filter((m) => m.role === "user").slice(-1)[0];
  const lastSystemMessage = messages.filter((m) => m.role === "system").slice(-1)[0];
  
  const prompt = lastSystemMessage 
    ? `${lastSystemMessage.content}\n\nUser request: ${lastUserMessage?.content}`
    : lastUserMessage?.content || "";

  // Call our existing API
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get AI response');
  }

  const data = await response.json();
  
  // Return as an async generator to match the expected interface
  return (async function* () {
    yield data.content || 'No response generated.';
  })();
} 