import type { Viewer } from "@/lib/domain/types";

export type OgaAccessResult =
  | {
      allowed: true;
      viewer: Viewer;
      reason: "allowed";
    }
  | {
      allowed: false;
      reason: "anonymous" | "not-oga";
      redirectTo: string;
    };

export function evaluateOgaAccess(viewer: Viewer | null): OgaAccessResult {
  if (!viewer) {
    return {
      allowed: false,
      reason: "anonymous",
      redirectTo: "/oga-login",
    };
  }

  if (!viewer.isOga) {
    return {
      allowed: false,
      reason: "not-oga",
      redirectTo: "/403?reason=oga-only",
    };
  }

  return {
    allowed: true,
    viewer,
    reason: "allowed",
  };
}
