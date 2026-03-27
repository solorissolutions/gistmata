import "server-only";

export {
  getCurrentUser as getCurrentViewer,
  requireOga as requireOgaViewer,
  requireOgaV2 as requireOgaV2Viewer,
  requireUser as requireViewer,
} from "@/lib/server/services/auth";
