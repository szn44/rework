# AI-Powered Features

This project includes a comprehensive AI system that enhances collaboration and productivity with intelligent suggestions and chat assistance.

## Features

### 💬 AI Chat Popup
- **Global availability**: Fixed chat button on all pages (bottom-left corner)
- **Smart conversations**: Context-aware responses based on your questions
- **Quick actions**: One-click shortcuts for common tasks:
  - 🔍 Code Review
  - 🐛 Debug Issue
  - ⚡ Performance
  - 🔒 Security
  - 🧪 Testing
  - 🏗️ Architecture
- **Persistent chat**: Chat history maintained during your session
- **Responsive design**: Adapts to different screen sizes

### 🤖 AI Comment Suggestions
- Click "AI Suggest" in the comment composer to generate smart suggestions
- AI analyzes context and provides relevant feedback
- Confidence scores help evaluate suggestion quality

### 🧠 Thread Analysis
- Get AI insights on existing comment threads
- Smart analysis of discussion context
- Actionable recommendations for thread resolution

### ⚡ Real-time Integration
- Works seamlessly with Liveblocks real-time collaboration
- AI suggestions appear as regular comments
- Full threading and resolution support

## How to Use

### Using the AI Chat Popup
1. **Open Chat**: Click the purple AI button in the bottom-left corner
2. **Quick Actions**: Use preset buttons for common questions
3. **Custom Questions**: Type your own questions in the input field
4. **Clear Chat**: Click the trash icon to start a new conversation

### Using AI Comments
1. **Generate Suggestions**: Click "AI Suggest" in comment composers
2. **Analyze Threads**: Click "Get Suggestion" on existing comment threads
3. **Review AI Feedback**: Check confidence scores and reasoning

## Current Implementation

The system currently uses **mock AI responses** for demonstration purposes. These provide realistic examples of what AI-powered features would look like with real AI providers.

## Chat Popup Components

- **AIChatPopup** (`src/components/AIChatPopup.tsx`) - Main chat interface
- **AIChatQuickActions** (`src/components/AIChatQuickActions.tsx`) - Quick action buttons
- **AIService** (`src/services/aiService.ts`) - AI service with chat support

## Integration Points

- **Global**: Chat popup appears on all pages via root layout
- **Issues**: AI comments available on all issue pages
- **Wiki**: AI-powered collaboration in the wiki editor
- **Real-time**: Full Liveblocks integration maintains real-time sync

## Integrating Real AI Providers

To connect real AI services like OpenAI, Claude, or Gemini:

### 1. Install AI SDK
```bash
npm install openai
# or
npm install @anthropic-ai/sdk
```

### 2. Configure Environment Variables
```bash
# .env.local
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_claude_key
```

### 3. Update AI Service Configuration

Edit `src/services/aiService.ts`:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Update the config
const config: AIServiceConfig = {
  provider: "openai", // Change from "mock"
  model: "gpt-4-turbo-preview"
};

// Implement real AI chat
static async generateChatResponse(userMessage: string): Promise<AIResponse> {
  if (config.provider === "openai") {
    const response = await openai.chat.completions.create({
      model: config.model || "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant for developers. Provide clear, actionable advice on coding, debugging, and software development best practices."
        },
        {
          role: "user", 
          content: userMessage
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    const suggestion = response.choices[0]?.message?.content || "No response available";
    
    return {
      suggestion,
      confidence: 0.9,
      reasoning: "Generated using OpenAI GPT"
    };
  }
  
  // fallback to mock
  return this.generateMockChatResponse(userMessage);
}
```

## Security Considerations

- Store API keys securely in environment variables
- Implement rate limiting for AI requests
- Add input sanitization and validation
- Consider implementing caching to reduce API costs
- Add error handling and fallbacks

## Customization

### Chat Popup Positioning
The chat button is positioned in the bottom-left corner. To change this, modify the classes in `AIChatPopup.tsx`:

```typescript
// Current: bottom-left
className="fixed bottom-4 left-4 z-50"

// Alternative: bottom-right
className="fixed bottom-4 right-4 z-50"
```

### Quick Actions
Edit the `quickActions` array in `AIChatQuickActions.tsx` to customize available shortcuts:

```typescript
const quickActions: QuickAction[] = [
  {
    id: "custom-action",
    label: "Custom Help",
    prompt: "Help me with my custom requirement",
    icon: "🎯"
  }
];
```

### Chat UI Styling
The chat popup uses Tailwind CSS classes. Modify the gradients, colors, and sizing in `AIChatPopup.tsx` to match your design system.

## Testing

1. **Start the application**: `npm run dev`
2. **Test Chat Popup**: Click the AI button in bottom-left corner
3. **Try Quick Actions**: Use preset buttons for common questions
4. **Test AI Comments**: Try AI suggestions in issues or wiki
5. **Check Responsiveness**: Test on different screen sizes

## Troubleshooting

### Chat Popup Not Appearing
- Check that `AIChatPopup` is imported in `layout.tsx`
- Verify the component is rendered in the body
- Check browser console for JavaScript errors

### AI Responses Not Working
- Verify `AIService` is properly configured
- Check that mock responses are enabled
- Review browser network tab for failed requests

### Positioning Issues
- Check z-index values for overlapping elements
- Verify fixed positioning classes are applied
- Test on different screen sizes and orientations

## Future Enhancements

- [ ] Context-aware chat based on current page
- [ ] Chat history persistence across sessions
- [ ] Integration with project files and code
- [ ] Voice input/output capabilities
- [ ] Multi-language support
- [ ] Team-specific AI training
- [ ] Integration with external documentation 