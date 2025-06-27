import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ChatInterface } from "@/components/ChatInterface";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";

interface ChatPageProps {
  params: {
    spaceId: string;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  const { spaceId } = params;

  return (
    <ResponsiveLayout>
      <div className="flex flex-col h-full">
        <ChatInterface spaceName={spaceId} user={user} />
      </div>
    </ResponsiveLayout>
  );
}