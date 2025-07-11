import { WebhookHandler } from "@liveblocks/node";
import { liveblocks } from "@/liveblocks.server.config";
import { Metadata } from "@/config";

// This route is called from the `storageUpdated` webhook event
// Learn how to set up webhooks on localhost:
// https://liveblocks.io/docs/guides/how-to-test-webhooks-on-localhost

// Not your secret key, but your _webhook_ secret key
const webhookHandler = new WebhookHandler(
  process.env.LIVEBLOCKS_WEBHOOK_SECRET_KEY || "whsec_..."
);

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const event = webhookHandler.verifyRequest({
      headers: req.headers,
      rawBody: JSON.stringify(data),
    });

    // When Storage has updated
    if (event.type === "storageUpdated") {
      const { roomId } = event.data;

      // Get the properties from the room
      const { meta, properties, labels } = await liveblocks.getStorageDocument(
        roomId,
        "json"
      );

      // Handle assignedTo - convert LiveList to legacy single assignee for metadata
      let assignedTo: string = "none";
      if (properties.assignedTo && Array.isArray(properties.assignedTo)) {
        // Take the first assignee for legacy metadata compatibility
        assignedTo = properties.assignedTo.length > 0 ? properties.assignedTo[0] : "none";
      } else if (typeof properties.assignedTo === "string") {
        // Handle legacy single assignee format
        assignedTo = properties.assignedTo;
      }

      // And add them to room metadata, for use with `liveblocks.getRooms`
      const metadata: Partial<Metadata> = {
        title: meta.title,
        progress: properties.progress,
        priority: properties.priority,
        assignedTo,
        labels: labels as string[],
      };
      const room = await liveblocks.updateRoom(roomId, { metadata });
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify(error), { status: 400 });
  }

  return new Response(null, { status: 200 });
}
