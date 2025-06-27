import { IssueProvider } from "@/app/IssueProvider";
import { Issue } from "@/components/Issue";
import { Inbox } from "@/components/Inbox";
import { DisplayWhenInboxOpen } from "@/components/InboxContext";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";

export const revalidate = 0;

export default async function PageHome({
  params: { id },
}: {
  params: { id: string };
}) {
  return (
    <IssueProvider issueId={id}>
      <ResponsiveLayout>
        <main className="m-2 border flex-grow bg-white rounded flex flex-row overflow-hidden">
          <DisplayWhenInboxOpen>
            <div className="border-r w-[200px] xl:w-[300px]">
              <Inbox />
            </div>
          </DisplayWhenInboxOpen>
          <div className="flex-grow">
            <Issue issueId={id} />
          </div>
        </main>
      </ResponsiveLayout>
    </IssueProvider>
  );
}
