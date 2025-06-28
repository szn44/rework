import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { SettingsLayout } from "@/components/SettingsLayout";

export default function SettingsPage() {
  return (
    <ResponsiveLayout>
      <main className="m-2 border dark:border-dark-bg-tertiary flex-grow bg-white dark:bg-dark-bg-primary rounded overflow-hidden">
        <div className="h-full">
          <SettingsLayout />
        </div>
      </main>
    </ResponsiveLayout>
  );
} 