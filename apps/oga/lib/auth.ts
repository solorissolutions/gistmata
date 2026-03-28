import "server-only";

import { redirect } from "next/navigation";

import { canAccessOgaDashboard, getCurrentUser } from "@/lib/server/services/auth";

export async function getOperatorViewer() {
  return getCurrentUser();
}

export async function requireOperatorViewer() {
  const viewer = await getCurrentUser();
  const access = await canAccessOgaDashboard(viewer);

  if (!access.allowed) {
    redirect(access.reason === "anonymous" ? "/login" : "/403?reason=oga-only");
  }

  return access.viewer;
}
