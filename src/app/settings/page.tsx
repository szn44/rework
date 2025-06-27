import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { SettingsLayout } from "@/components/SettingsLayout";

export default function SettingsPage() {
  return (
    <ResponsiveLayout>
      <main className="m-2 border flex-grow bg-white rounded overflow-hidden">
        <div className="h-full">
          <SettingsLayout />
        </div>
      </main>
    </ResponsiveLayout>
  );
} 