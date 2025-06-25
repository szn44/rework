import { Document, ErrorData } from "@/types";

export async function getDocument({ documentId }: { documentId: string }) {
  try {
    // For the wiki, we'll create a default document structure
    // In a real implementation, this would fetch from a database
    const document: Document = {
      id: documentId,
      title: documentId === "wiki-main" ? "Wiki" : documentId,
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { data: document, error: null };
  } catch (error) {
    console.error("Failed to get document:", error);
    
    const errorData: ErrorData = {
      message: "Failed to load document",
      code: "DOCUMENT_LOAD_ERROR",
    };

    return { data: null, error: errorData };
  }
} 