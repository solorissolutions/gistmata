import { redirect } from "next/navigation";

import { getOperatorViewer } from "../lib/auth";

export default async function OperatorHomePage() {
  const viewer = await getOperatorViewer();

  redirect(viewer?.isOga ? "/oga-v2" : "/login");
}
