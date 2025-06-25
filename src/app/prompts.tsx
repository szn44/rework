import { ReactNode } from "react";

export interface PromptOption {
  text: string;
  description: string;
  icon?: ReactNode;
  children?: PromptOption[];
}

export interface PromptGroup {
  group: string;
  options: PromptOption[];
}

export const optionsGroups: PromptGroup[] = [
  {
    group: "Edit or review selection",
    options: [
      {
        text: "Improve writing",
        description: "Fix grammar and make it clearer",
      },
      {
        text: "Fix spelling & grammar",
        description: "Correct any spelling or grammar mistakes",
      },
      {
        text: "Make shorter",
        description: "Make the text more concise",
      },
      {
        text: "Make longer",
        description: "Add more detail and context",
      },
      {
        text: "Simplify language",
        description: "Use simpler words and phrases",
      },
      {
        text: "Change tone",
        description: "Adjust the tone of the text",
        children: [
          {
            text: "Professional",
            description: "Make it sound more professional",
          },
          {
            text: "Casual",
            description: "Make it sound more casual",
          },
          {
            text: "Confident",
            description: "Make it sound more confident",
          },
          {
            text: "Friendly",
            description: "Make it sound more friendly",
          },
        ],
      },
    ],
  },
  {
    group: "Generate from selection",
    options: [
      {
        text: "Summarize",
        description: "Create a summary of the selected text",
      },
      {
        text: "Explain",
        description: "Explain the selected text in detail",
      },
      {
        text: "Find action items",
        description: "Extract action items from the text",
      },
      {
        text: "Translate",
        description: "Translate to another language",
        children: [
          {
            text: "Spanish",
            description: "Translate to Spanish",
          },
          {
            text: "French",
            description: "Translate to French",
          },
          {
            text: "German",
            description: "Translate to German",
          },
          {
            text: "Japanese",
            description: "Translate to Japanese",
          },
        ],
      },
    ],
  },
  {
    group: "Generate new content",
    options: [
      {
        text: "Brainstorm ideas",
        description: "Generate creative ideas on this topic",
      },
      {
        text: "Write outline",
        description: "Create an outline for this topic",
      },
      {
        text: "Create pros and cons",
        description: "List advantages and disadvantages",
      },
      {
        text: "Continue writing",
        description: "Continue the text from where it left off",
      },
    ],
  },
]; 