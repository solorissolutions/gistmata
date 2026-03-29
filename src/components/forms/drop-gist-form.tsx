"use client";

import { useActionState, useEffect, useState } from "react";
import { LocateFixed, RefreshCcw, SignalLow } from "lucide-react";

import type { DraftAssistResponse } from "@/lib/ai/contracts";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { GIST_TAGS, MAX_GIST_LENGTH } from "@/lib/domain/constants";
import type { Viewer } from "@/lib/domain/types";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { submitGist } from "@/lib/server/mata-actions";

type ResolvedLocation = {
  displayLocality: string;
  areaBucket: string;
  admin2Name: string;
  admin2Type: string;
  stateName: string;
  confidenceScore: number;
  provider?: string;
  providerLabel?: string;
  fallbackUsed?: boolean;
};

function fromViewer(viewer: Viewer): ResolvedLocation | null {
  if (!viewer.location) {
    return null;
  }

  return viewer.location;
}

export function DropGistForm({ viewer }: { viewer: Viewer }) {
  const [state, action] = useActionState(submitGist, INITIAL_ACTION_STATE);
  const [bodyCount, setBodyCount] = useState(0);
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("General");
  const [tagTouched, setTagTouched] = useState(false);
  const [draftAssist, setDraftAssist] = useState<DraftAssistResponse | null>(null);
  const [location, setLocation] = useState<ResolvedLocation | null>(() => fromViewer(viewer));
  const [locationState, setLocationState] = useState<
    "idle" | "loading" | "ready" | "error"
  >(fromViewer(viewer) ? "ready" : "idle");
  const [online, setOnline] = useState(true);
  const [locationMessage, setLocationMessage] = useState<string | null>(
    fromViewer(viewer)
      ? "Saved posting area ready. Refresh if you want your current spot."
      : null,
  );

  async function resolveWithCoords(coords?: {
    latitude?: number;
    longitude?: number;
  }) {
    setLocationState("loading");
    setLocationMessage(null);

    try {
      const response = await fetch("/api/location/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coords ?? {}),
      });

      if (!response.ok) {
        throw new Error("Location request no clear.");
      }

      const data = (await response.json()) as ResolvedLocation;
      setLocation(data);
      setLocationState("ready");
      setLocationMessage(
        data.fallbackUsed
          ? `Using ${data.stateName} fallback from ${data.providerLabel}.`
          : `${data.providerLabel} matched your current spot.`,
      );
    } catch {
      setLocationState("error");
      setLocation(fromViewer(viewer));
      setLocationMessage(
        fromViewer(viewer)
          ? "Current spot no clear, so we kept your saved posting area."
          : "Current spot no clear yet. Try again or allow location once more.",
      );
    }
  }

  useEffect(() => {
    const syncStatus = () => setOnline(window.navigator.onLine);
    syncStatus();
    window.addEventListener("online", syncStatus);
    window.addEventListener("offline", syncStatus);
    return () => {
      window.removeEventListener("online", syncStatus);
      window.removeEventListener("offline", syncStatus);
    };
  }, []);

  useEffect(() => {
    const trimmedBody = body.trim();

    if (trimmedBody.length < 12) {
      setDraftAssist(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/ai/draft-hints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            body: trimmedBody,
            currentTag: tag,
            context: "new-gist",
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as DraftAssistResponse;
        setDraftAssist(data);

        if (!tagTouched && data.tagSuggestion.confidence >= 0.74) {
          setTag(data.tagSuggestion.suggestedTag);
        }
      } catch {
        // Quiet failure keeps the composer usable.
      }
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [body, tag, tagTouched]);

  async function requestLocation() {
    if (!navigator.geolocation) {
      await resolveWithCoords();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await resolveWithCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      async () => {
        await resolveWithCoords();
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="muted-label">Posting area</p>
            <p className="mt-1 text-sm text-[var(--gm-ink-soft)]">
              {location
                ? `${location.displayLocality} · ${location.stateName}`
                : "Make we place this gist for the correct Mata."}
            </p>
            <p className="mt-2 text-xs leading-5 text-[var(--gm-ink-soft)]">
              {location
                ? `${location.providerLabel ?? "Saved posting area"} · confidence ${Math.round(
                    (location.confidenceScore ?? 0.68) * 100,
                  )}%${location.fallbackUsed ? " · state fallback" : ""}`
                : "Location permission starts here, not during signup."}
            </p>
            {locationMessage ? (
              <p
                className={`mt-2 text-xs leading-5 ${
                  locationState === "error"
                    ? "text-[var(--destructive)]"
                    : "text-[var(--accent)]"
                }`}
              >
                {locationMessage}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={requestLocation}
            disabled={locationState === "loading"}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold"
          >
            {location ? <RefreshCcw className="h-4 w-4" /> : <LocateFixed className="h-4 w-4" />}
            {locationState === "loading" ? "Finding..." : location ? "Refresh spot" : "Use current spot"}
          </button>
        </div>
      </div>

      <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm leading-6 text-[var(--gm-ink-soft)]">
        We only keep your resolved locality, area, and state labels. Raw coordinates no dey save.
      </div>

      {!online ? (
        <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm text-[var(--gm-ink-soft)]">
          <div className="flex items-center gap-2 font-semibold text-[var(--foreground)]">
            <SignalLow className="h-4 w-4" />
            Weak connection
          </div>
          <p className="mt-2">
            Queue state never land for web MVP yet. Reconnect before you drop this gist.
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-semibold">Wetin happen?</label>
        <Textarea
          name="body"
          maxLength={MAX_GIST_LENGTH}
          placeholder="Wetin happen?"
          className="min-h-44"
          onChange={(event) => {
            setBody(event.currentTarget.value);
            setBodyCount(event.currentTarget.value.length);
          }}
        />
        <div className="flex items-center justify-between gap-3 text-xs text-[var(--gm-ink-soft)]">
          <span>No full names, no phone numbers, no addresses.</span>
          <span>{bodyCount}/{MAX_GIST_LENGTH}</span>
        </div>
        {draftAssist?.safety.severity === "warn" ? (
          <p className="text-xs leading-5 text-[var(--accent)]">
            {draftAssist.safety.reason}
          </p>
        ) : null}
        {draftAssist?.safety.severity === "block" ? (
          <p className="text-xs leading-5 text-[var(--destructive)]">
            {draftAssist.safety.reason}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">This gist na mostly about wetin?</label>
        <select
          name="tag"
          className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
          value={tag}
          onChange={(event) => {
            setTagTouched(true);
            setTag(event.currentTarget.value);
          }}
        >
          {GIST_TAGS.map((gistTag) => (
            <option key={gistTag} value={gistTag}>
              {gistTag}
            </option>
          ))}
        </select>
        {draftAssist?.tagSuggestion.confidence && draftAssist.tagSuggestion.confidence >= 0.58 ? (
          <p className="text-xs leading-5 text-[var(--gm-ink-soft)]">
            Suggested tag: {draftAssist.tagSuggestion.suggestedTag}. {draftAssist.tagSuggestion.reason}
          </p>
        ) : null}
      </div>

      <input type="hidden" name="displayLocality" value={location?.displayLocality ?? viewer.homeState} />
      <input type="hidden" name="areaBucket" value={location?.areaBucket ?? viewer.homeState} />
      <input type="hidden" name="admin2Name" value={location?.admin2Name ?? viewer.homeState} />
      <input type="hidden" name="admin2Type" value={location?.admin2Type ?? "State"} />
      <input type="hidden" name="stateName" value={location?.stateName ?? viewer.homeState} />
      <input
        type="hidden"
        name="confidenceScore"
        value={String(location?.confidenceScore ?? 0.68)}
      />

      {state.message ? (
        <p
          className={
            state.status === "error"
              ? "text-sm text-[var(--destructive)]"
              : "text-sm text-[var(--accent)]"
          }
        >
          {state.message}
        </p>
      ) : null}
      <SubmitButton
        idleLabel="Drop Gist"
        pendingLabel="Dropping..."
        disabled={!online || locationState === "loading"}
        className="w-full sm:w-auto"
      />
    </form>
  );
}
