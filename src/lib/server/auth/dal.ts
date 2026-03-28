import "server-only";

export {
  getCurrentUser as getCurrentViewer,
  requireUser as requireViewer,
} from "@/lib/server/services/auth";
