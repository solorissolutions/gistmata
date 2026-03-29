import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/server/services/auth";
import { resolvePostingLocation } from "@/lib/server/services/location";

export async function POST(request: Request) {
  const viewer = await getCurrentUser();

  if (!viewer) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    latitude?: number;
    longitude?: number;
  };

  try {
    const location = await resolvePostingLocation(body, viewer);
    return NextResponse.json(location);
  } catch {
    return NextResponse.json({
      displayLocality: viewer.homeState,
      areaBucket: viewer.homeState,
      admin2Name: viewer.homeState,
      admin2Type: "State",
      stateName: viewer.homeState,
      confidenceScore: 0.5,
      provider: "state-fallback",
      providerLabel: "State Fallback",
      fallbackUsed: true,
    });
  }
}
