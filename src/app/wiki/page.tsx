import { redirect } from "next/navigation";

export default function WikiPage() {
  // Redirect to the main spaces page
  redirect("/spaces/all-rework");
} 