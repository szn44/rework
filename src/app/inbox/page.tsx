import { Inbox } from "@/components/Inbox";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";

export default function PageHome() {
  return (
    <ResponsiveLayout>
      <main className="m-2 border flex-grow bg-white rounded flex flex-row overflow-hidden">
        <div className="border-r w-[300px]">
          <Inbox />
        </div>
        <div className="flex-grow flex items-center justify-center text-sm text-neutral-500 font-medium">
          Select an issue
        </div>
      </main>
    </ResponsiveLayout>
  );
}
