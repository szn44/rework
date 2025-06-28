import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    console.log("AI API - Request received");
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log("AI API - User auth check:", { user: user?.id, error: userError?.message });
    
    if (userError || !user) {
      console.log("AI API - Authentication failed:", userError?.message || "No user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("AI API - Request body received:", { 
      message: body.message?.substring(0, 50) + "...", 
      spaceId: body.spaceId,
      spaceName: body.spaceName,
      userId: body.userId 
    });
    
    const { 
      message, 
      spaceId, 
      spaceName, 
      userId, 
      userEmail,
      recentMessages = []
    } = body;

    if (!message || !spaceId) {
      console.log("AI API - Missing required fields:", { message: !!message, spaceId: !!spaceId });
      return NextResponse.json({ error: "Message and spaceId are required" }, { status: 400 });
    }

    // Get basic workspace context
    const { data: space } = await supabase
      .from("spaces")
      .select("id, name, description, team_id")
      .eq("id", spaceId)
      .single();

    // Get recent messages for context
    const { data: recentSpaceMessages } = await supabase
      .from("chat_messages")
      .select("content, message_type, created_at")
      .eq("channel_id", spaceId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Create context-aware system prompt
    const systemPrompt = `You are Zero, an intelligent AI assistant for the Rework workspace collaboration platform. You are helping users in the "${spaceName}" space.

CURRENT CONTEXT:
- Space: ${spaceName}
- User: ${userEmail?.split('@')[0] || 'User'}
- Recent Activity: ${recentSpaceMessages?.length || 0} recent messages

PERSONALITY & BEHAVIOR:
- Be helpful, concise, and professional
- Keep responses focused and under 200 words
- Reference workspace context when relevant
- Suggest actionable next steps
- Help with task management, collaboration, and productivity

Current user's message: ${message}`;

    // Generate response using Claude 3.5 Sonnet
    console.log("AI API - Calling Claude with messages");
    
    // Create Anthropic client with API key
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    
    // Convert recent messages to Anthropic format
    const conversationHistory = recentMessages.slice(-5).map((msg: any) => ({
      role: msg.role === "assistant" ? "assistant" as const : "user" as const,
      content: msg.content
    }));
    
    // Add the current user message
    const anthropicMessages = [
      ...conversationHistory,
      { role: "user" as const, content: message }
    ];
    
    console.log("AI API - Sending to Claude:", { messageCount: anthropicMessages.length });
    
    const result = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: anthropicMessages
    });

    // Extract text response
    const textContent = result.content.find(block => block.type === 'text');
    const responseText = textContent ? textContent.text : "Sorry, I couldn't generate a response.";
    
    console.log("AI API - Claude response received:", responseText.substring(0, 100) + "...");
    
    return NextResponse.json({ 
      content: responseText,
      model: "claude-3-5-sonnet-20241022"
    });

  } catch (error) {
    console.error("AI API error:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Return a helpful fallback response
    return NextResponse.json({ 
      content: "I'm experiencing some technical difficulties right now. Please try again in a moment, or feel free to ask your question in a different way!",
      error: "AI_SERVICE_ERROR",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 