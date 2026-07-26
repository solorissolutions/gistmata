import { prisma } from "@/lib/prisma";

const ACTION_LABELS: Record<string, string> = {
  "article.create": "Created article",
  "article.update": "Updated article",
  "article.delete": "Deleted article",
  "article.publish": "Published article",
  "article.unpublish": "Unpublished article",
  "article.feature": "Featured article",
  "article.unfeature": "Unfeatured article",
  "upcoming.create": "Added upcoming",
  "upcoming.update": "Updated upcoming",
  "upcoming.delete": "Removed upcoming",
  "upcoming.reorder": "Reordered upcoming",
  "media.upload": "Uploaded media",
  "media.delete": "Deleted media",
};

export default async function AuditPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="text-xl font-light tracking-tight">Audit Log</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Recent administrative actions across the CMS.
      </p>

      {logs.length === 0 ? (
        <p className="mt-12 text-center text-sm text-muted-foreground">
          No audit events recorded yet.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 pr-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Time
                </th>
                <th className="pb-3 pr-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Action
                </th>
                <th className="pb-3 pr-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Details
                </th>
                <th className="pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-card/50">
                  <td className="py-3 pr-4 whitespace-nowrap text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(log.createdAt)}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap text-xs text-foreground">
                    {ACTION_LABELS[log.action] || log.action}
                  </td>
                  <td className="py-3 pr-4 text-xs text-muted-foreground max-w-xs truncate">
                    {log.details || "—"}
                  </td>
                  <td className="py-3 text-xs text-muted">
                    {log.ip || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
