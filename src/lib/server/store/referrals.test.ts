import {
  beginJoinDraft,
  completeJoinDraft,
  readStore,
  resetDemoStore,
  setJoinDraftBasics,
  setJoinDraftPin,
  setJoinDraftUsername,
} from "@/lib/server/store";

describe("referral onboarding", () => {
  it("reserves five codes during join and logs the referral on completion", async () => {
    await resetDemoStore();

    const initialStore = await readStore();
    const inviteCode = initialStore.referralCodes.find(
      (code) => code.isActive && !code.usedByUserId,
    );
    const referrer = inviteCode
      ? initialStore.users.find((user) => user.id === inviteCode.createdByUserId) ?? null
      : null;

    expect(inviteCode).toBeTruthy();
    expect(referrer).toBeTruthy();

    if (!inviteCode || !referrer) {
      return;
    }

    const draft = await beginJoinDraft(inviteCode.code);
    await setJoinDraftUsername(draft.id, "ReferralRookie");
    const pinnedDraft = await setJoinDraftPin(draft.id, "123456");

    expect(pinnedDraft.reservedReferralCodes).toHaveLength(5);
    expect(new Set(pinnedDraft.reservedReferralCodes).size).toBe(5);

    await setJoinDraftBasics(draft.id, {
      state: "Lagos",
      ageRange: "25-34",
      gender: "Prefer not to say",
    });

    const completion = await completeJoinDraft(draft.id);
    const finalStore = await readStore();
    const newUser = finalStore.users.find((user) => user.id === completion.userId) ?? null;
    const consumedInvite =
      finalStore.referralCodes.find((code) => code.id === inviteCode.id) ?? null;
    const issuedCodes = finalStore.referralCodes.filter(
      (code) => code.createdByUserId === completion.userId,
    );
    const activation =
      finalStore.referralActivations.find(
        (entry) => entry.referredUserId === completion.userId,
      ) ?? null;
    const updatedReferrer =
      finalStore.users.find((user) => user.id === referrer.id) ?? null;

    expect(newUser).toBeTruthy();
    expect(newUser?.pointsBalance).toBe(20);
    expect(newUser?.referredByUserId).toBe(referrer.id);
    expect(consumedInvite?.usedByUserId).toBe(completion.userId);
    expect(consumedInvite?.isActive).toBe(false);
    expect(issuedCodes).toHaveLength(5);
    expect(issuedCodes.map((code) => code.code).sort()).toEqual(
      [...pinnedDraft.reservedReferralCodes].sort(),
    );
    expect(activation).toMatchObject({
      referrerUserId: referrer.id,
      referredUserId: completion.userId,
      referralCodeId: inviteCode.id,
      pointsAwarded: 20,
    });
    expect(updatedReferrer?.pointsBalance).toBe(referrer.pointsBalance + 20);
  });
});
