import { FEATURE_FLAGS, getTierByPoints } from "@/lib/domain/constants";
import type {
  AppStore,
  GistCommentRecord,
  GistReactionRecord,
  GistRecord,
  LocationSnapshot,
  UserPointsLedgerRecord,
  UserRecord,
} from "@/lib/domain/types";
import {
  createAccountCode,
  daysAgo,
  daysFromNow,
  hashSecretValue,
  hoursAgo,
  makeId,
  minutesAgo,
} from "@/lib/server/store/helpers";
import { NIGERIA_LOCATION_POINTS } from "@/lib/server/location/nigeria-points";

type SeedUserInput = {
  username: string;
  state: string;
  ageRange: UserRecord["ageRange"];
  gender: UserRecord["gender"];
  area: LocationSnapshot;
  points: number;
  pin: string;
  isOga?: boolean;
  recoveryCode?: string;
  createdAt?: string;
};

const LOCATIONS: LocationSnapshot[] = NIGERIA_LOCATION_POINTS.map((point) => ({
  displayLocality: point.displayLocality,
  areaBucket: point.areaBucket,
  admin2Name: point.admin2Name,
  admin2Type: point.admin2Type,
  stateName: point.stateName,
  confidenceScore: point.confidenceScore,
}));

function locationByArea(area: string) {
  const match = LOCATIONS.find((location) => location.displayLocality === area);

  if (!match) {
    throw new Error(`Unknown location seed: ${area}`);
  }

  return match;
}

function createUser(input: SeedUserInput): UserRecord {
  const recoveryCode = input.recoveryCode ?? createAccountCode();

  return {
    id: makeId("usr"),
    username: input.username,
    usernameNormalized: input.username.toLowerCase(),
    pinHash: hashSecretValue(input.pin),
    accountCodeHash: hashSecretValue(recoveryCode),
    homeState: input.state,
    ageRange: input.ageRange,
    gender: input.gender,
    tier: getTierByPoints(input.points),
    pointsBalance: input.points,
    isOga: input.isOga ?? false,
    comotTagged: false,
    createdAt: input.createdAt ?? daysAgo(30),
    lastActiveAt: minutesAgo(Math.floor(Math.random() * 500)),
    homeAreaDisplay: input.area.displayLocality,
    homeAreaBucket: input.area.areaBucket,
    homeAdmin2Name: input.area.admin2Name,
    homeAdmin2Type: input.area.admin2Type,
    locationConfidence: input.area.confidenceScore,
    referredByUserId: null,
    referralCodeUsed: null,
    devRecoveryCode: recoveryCode,
  };
}

export function buildSeedStore(): AppStore {
  const oga = createUser({
    username: "oga",
    state: "FCT",
    ageRange: "35-44",
    gender: "Prefer not to say",
    area: locationByArea("Wuse 2"),
    points: 999,
    pin: "091332",
    isOga: true,
    recoveryCode: "GM-0001-OG",
    createdAt: daysAgo(120),
  });

  const users = [
    oga,
    createUser({ username: "MallamLight", state: "Kano", ageRange: "25-34", gender: "Male", area: locationByArea("Sabon Gari"), points: 362, pin: "204613", recoveryCode: "MATA-KANO-2046", createdAt: daysAgo(70) }),
    createUser({ username: "BodijaBird", state: "Oyo", ageRange: "25-34", gender: "Female", area: locationByArea("Bodija"), points: 410, pin: "892111", recoveryCode: "MATA-OYO8-9211", createdAt: daysAgo(66) }),
    createUser({ username: "PHWhisper", state: "Rivers", ageRange: "35-44", gender: "Male", area: locationByArea("GRA Phase 2"), points: 295, pin: "440113", recoveryCode: "MATA-PH44-0113", createdAt: daysAgo(54) }),
    createUser({ username: "CoalCityEye", state: "Enugu", ageRange: "25-34", gender: "Female", area: locationByArea("New Haven"), points: 515, pin: "771204", recoveryCode: "MATA-ENU7-1204", createdAt: daysAgo(62) }),
    createUser({ username: "AriariaWatch", state: "Abia", ageRange: "25-34", gender: "Male", area: locationByArea("Ariaria"), points: 178, pin: "514008", recoveryCode: "MATA-ABA5-1408", createdAt: daysAgo(48) }),
    createUser({ username: "BendelPen", state: "Edo", ageRange: "18-24", gender: "Female", area: locationByArea("Uselu"), points: 122, pin: "613119", recoveryCode: "MATA-EDO6-1311", createdAt: daysAgo(44) }),
    createUser({ username: "BarnawaMic", state: "Kaduna", ageRange: "35-44", gender: "Male", area: locationByArea("Barnawa"), points: 398, pin: "701122", recoveryCode: "MATA-KAD7-0112", createdAt: daysAgo(40) }),
    createUser({ username: "RayfieldLink", state: "Plateau", ageRange: "25-34", gender: "Male", area: locationByArea("Rayfield"), points: 167, pin: "240019", recoveryCode: "MATA-JOS2-4019", createdAt: daysAgo(35) }),
    createUser({ username: "UyoWave", state: "Akwa Ibom", ageRange: "18-24", gender: "Female", area: locationByArea("Ewet Housing"), points: 248, pin: "834505", recoveryCode: "MATA-UYO8-4505", createdAt: daysAgo(31) }),
    createUser({ username: "IkenegbuInk", state: "Imo", ageRange: "25-34", gender: "Male", area: locationByArea("Ikenegbu"), points: 278, pin: "199008", recoveryCode: "MATA-IMO1-9908", createdAt: daysAgo(28) }),
    createUser({ username: "IbaraTape", state: "Ogun", ageRange: "35-44", gender: "Female", area: locationByArea("Ibara"), points: 140, pin: "330012", recoveryCode: "MATA-OGN3-3012", createdAt: daysAgo(25) }),
    createUser({ username: "TankeVoice", state: "Kwara", ageRange: "25-34", gender: "Male", area: locationByArea("Tanke"), points: 210, pin: "570042", recoveryCode: "MATA-ILR5-7042", createdAt: daysAgo(23) }),
    createUser({ username: "WuseSignal", state: "FCT", ageRange: "25-34", gender: "Female", area: locationByArea("Wuse 2"), points: 430, pin: "664421", recoveryCode: "MATA-ABJ6-4421", createdAt: daysAgo(21) }),
    createUser({ username: "YabaLine", state: "Lagos", ageRange: "25-34", gender: "Male", area: locationByArea("Yaba"), points: 188, pin: "281999", recoveryCode: "MATA-LAG2-8199", createdAt: daysAgo(20) }),
  ];

  const byUsername = Object.fromEntries(users.map((user) => [user.username, user]));
  byUsername.WuseSignal.referredByUserId = oga.id;
  byUsername.WuseSignal.referralCodeUsed = "ABJ-ENTRY";
  byUsername.MallamLight.referredByUserId = oga.id;
  byUsername.MallamLight.referralCodeUsed = "KANO-LINE";
  byUsername.CoalCityEye.referredByUserId = oga.id;
  byUsername.CoalCityEye.referralCodeUsed = "COAL-WORD";
  byUsername.BendelPen.referredByUserId = byUsername.CoalCityEye.id;
  byUsername.BendelPen.referralCodeUsed = "COAL-CITY";
  byUsername.YabaLine.referredByUserId = byUsername.WuseSignal.id;
  byUsername.YabaLine.referralCodeUsed = "ABJ-CARRY";
  byUsername.BendelPen.locationConfidence = 0.76;
  byUsername.RayfieldLink.locationConfidence = 0.78;

  const gists: GistRecord[] = [
    { id: makeId("gst"), authorUserId: byUsername.MallamLight.id, body: "Light blink four times for Sabon Gari this morning. Shop people don resume generator anthem again.", tag: "NEPA", areaDisplay: "Sabon Gari", areaBucket: "sabon-gari", admin2Name: "Kano Municipal", admin2Type: "LGA", stateName: "Kano", feedVisibilityScore: 0.74, translationText: "Power has been unstable in Sabon Gari this morning, and traders are back on generators.", commentsCount: 0, reactionsCount: 0, reportsCount: 0, followUpCount: 0, status: "active" as const, createdAt: minutesAgo(18) },
    { id: makeId("gst"), authorUserId: byUsername.BodijaBird.id, body: "That fresh patch for Bodija road don peel again after one small rain. Na who dey approve this work?", tag: "Road", areaDisplay: "Bodija", areaBucket: "bodija", admin2Name: "Ibadan North", admin2Type: "LGA", stateName: "Oyo", feedVisibilityScore: 0.81, translationText: null, commentsCount: 0, reactionsCount: 0, reportsCount: 0, followUpCount: 0, status: "active" as const, createdAt: minutesAgo(44) },
    { id: makeId("gst"), authorUserId: byUsername.PHWhisper.id, body: "Fuel queue short for GRA side today but the pump price still high pass sense. No relief yet.", tag: "Fuel", areaDisplay: "GRA Phase 2", areaBucket: "gra-phase-2", admin2Name: "Port Harcourt", admin2Type: "LGA", stateName: "Rivers", feedVisibilityScore: 0.83, translationText: null, commentsCount: 0, reactionsCount: 0, reportsCount: 0, followUpCount: 0, status: "active" as const, createdAt: hoursAgo(2) },
    { id: makeId("gst"), authorUserId: byUsername.CoalCityEye.id, body: "Water tanker still never reach this New Haven line after yesterday promise. People don tire for explanation.", tag: "Govt", areaDisplay: "New Haven", areaBucket: "new-haven", admin2Name: "Enugu North", admin2Type: "LGA", stateName: "Enugu", feedVisibilityScore: 0.86, translationText: "Residents in New Haven are still waiting for the promised water tanker.", commentsCount: 0, reactionsCount: 0, reportsCount: 0, followUpCount: 0, status: "active" as const, createdAt: hoursAgo(3) },
    { id: makeId("gst"), authorUserId: byUsername.AriariaWatch.id, body: "Ariaria traders dey close earlier because fresh levy matter don start again this week.", tag: "Market", areaDisplay: "Ariaria", areaBucket: "ariaria", admin2Name: "Aba North", admin2Type: "LGA", stateName: "Abia", feedVisibilityScore: 0.71, translationText: null, commentsCount: 0, reactionsCount: 0, reportsCount: 0, followUpCount: 0, status: "active" as const, createdAt: hoursAgo(4) },
    { id: makeId("gst"), authorUserId: byUsername.BendelPen.id, body: "Warehouse for Uselu dey recruit dispatch hands. Dem say carry valid ID and come early.", tag: "Jobs", areaDisplay: "Uselu", areaBucket: "uselu", admin2Name: "Oredo", admin2Type: "LGA", stateName: "Edo", feedVisibilityScore: 0.69, translationText: null, commentsCount: 0, reactionsCount: 0, reportsCount: 0, followUpCount: 0, status: "active" as const, createdAt: hoursAgo(5) },
    { id: makeId("gst"), authorUserId: byUsername.BarnawaMic.id, body: "Police checkpoint return for Barnawa junction this evening. Road calm pass last week sha.", tag: "Safety", areaDisplay: "Barnawa", areaBucket: "barnawa", admin2Name: "Kaduna South", admin2Type: "LGA", stateName: "Kaduna", feedVisibilityScore: 0.82, translationText: null, commentsCount: 0, reactionsCount: 0, reportsCount: 0, followUpCount: 0, status: "active" as const, createdAt: hoursAgo(6) },
    { id: makeId("gst"), authorUserId: byUsername.RayfieldLink.id, body: "One landlord for Rayfield don add caution fee without touching leaking roof since harmattan.", tag: "Landlord", areaDisplay: "Rayfield", areaBucket: "rayfield", admin2Name: "Jos South", admin2Type: "LGA", stateName: "Plateau", feedVisibilityScore: 0.77, translationText: null, commentsCount: 0, reactionsCount: 0, reportsCount: 0, followUpCount: 0, status: "active" as const, createdAt: hoursAgo(7) },
    { id: makeId("gst"), authorUserId: byUsername.UyoWave.id, body: "Small open mic for Ewet Housing tonight. Crowd soft but the singers really try.", tag: "Entertainment", areaDisplay: "Ewet Housing", areaBucket: "ewet-housing", admin2Name: "Uyo", admin2Type: "LGA", stateName: "Akwa Ibom", feedVisibilityScore: 0.68, translationText: null, commentsCount: 0, reactionsCount: 0, reportsCount: 0, followUpCount: 0, status: "active" as const, createdAt: hoursAgo(8) },
    { id: makeId("gst"), authorUserId: byUsername.IkenegbuInk.id, body: "Church bus block half road for Ikenegbu after service again this morning. Traffic just waste everybody time.", tag: "Church", areaDisplay: "Ikenegbu", areaBucket: "ikenegbu", admin2Name: "Owerri Municipal", admin2Type: "LGA", stateName: "Imo", feedVisibilityScore: 0.75, translationText: null, commentsCount: 0, reactionsCount: 0, reportsCount: 0, followUpCount: 0, status: "active" as const, createdAt: hoursAgo(9) },
    { id: makeId("gst"), authorUserId: byUsername.IbaraTape.id, body: "Pothole near Ibara bridge don widen well after weekend rain. Motorists don dey zigzag anyhow.", tag: "Road", areaDisplay: "Ibara", areaBucket: "ibara", admin2Name: "Abeokuta South", admin2Type: "LGA", stateName: "Ogun", feedVisibilityScore: 0.7, translationText: null, commentsCount: 0, reactionsCount: 0, reportsCount: 0, followUpCount: 0, status: "active" as const, createdAt: hoursAgo(10) },
    { id: makeId("gst"), authorUserId: byUsername.TankeVoice.id, body: "Tanke cafe dey find evening shift cashier. Pay no big but dem want person to start immediate.", tag: "Jobs", areaDisplay: "Tanke", areaBucket: "tanke", admin2Name: "Ilorin South", admin2Type: "LGA", stateName: "Kwara", feedVisibilityScore: 0.66, translationText: null, commentsCount: 0, reactionsCount: 0, reportsCount: 0, followUpCount: 0, status: "active" as const, createdAt: hoursAgo(11) },
    { id: makeId("gst"), authorUserId: byUsername.WuseSignal.id, body: "Wuse 2 refuse truck finally clear that corner near the bus stop this morning. Make e no go back next week.", tag: "Govt", areaDisplay: "Wuse 2", areaBucket: "wuse-2", admin2Name: "Abuja Municipal", admin2Type: "Area Council", stateName: "FCT", feedVisibilityScore: 0.88, translationText: null, commentsCount: 0, reactionsCount: 0, reportsCount: 0, followUpCount: 0, status: "active" as const, createdAt: hoursAgo(1) },
    { id: makeId("gst"), authorUserId: byUsername.YabaLine.id, body: "Yaba transformer hum since midnight but light still no hold. Laptop people just dey sweat.", tag: "NEPA", areaDisplay: "Yaba", areaBucket: "yaba", admin2Name: "Lagos Mainland", admin2Type: "LGA", stateName: "Lagos", feedVisibilityScore: 0.73, translationText: null, commentsCount: 0, reactionsCount: 0, reportsCount: 0, followUpCount: 0, status: "active" as const, createdAt: hoursAgo(12) },
    { id: makeId("gst"), authorUserId: byUsername.MallamLight.id, body: "Kantin side riders still dey keep old transport fare even though fuel calm small this afternoon.", tag: "Fuel", areaDisplay: "Sabon Gari", areaBucket: "sabon-gari", admin2Name: "Kano Municipal", admin2Type: "LGA", stateName: "Kano", feedVisibilityScore: 0.79, translationText: null, commentsCount: 0, reactionsCount: 0, reportsCount: 0, followUpCount: 0, status: "active" as const, createdAt: hoursAgo(13) },
    { id: makeId("gst"), authorUserId: byUsername.CoalCityEye.id, body: "New Haven junction block small this evening after one bus scrape keke and everybody wan become witness.", tag: "Safety", areaDisplay: "New Haven", areaBucket: "new-haven", admin2Name: "Enugu North", admin2Type: "LGA", stateName: "Enugu", feedVisibilityScore: 0.8, translationText: null, commentsCount: 0, reactionsCount: 0, reportsCount: 0, followUpCount: 0, status: "active" as const, createdAt: hoursAgo(14) },
    { id: makeId("gst"), authorUserId: byUsername.UyoWave.id, body: "Voltage return for Ewet Housing tonight but e still dey drag freezer like tired gen.", tag: "NEPA", areaDisplay: "Ewet Housing", areaBucket: "ewet-housing", admin2Name: "Uyo", admin2Type: "LGA", stateName: "Akwa Ibom", feedVisibilityScore: 0.76, translationText: "Power came back in Ewet Housing, but the voltage is still weak.", commentsCount: 0, reactionsCount: 0, reportsCount: 0, followUpCount: 0, status: "active" as const, createdAt: hoursAgo(15) },
    { id: makeId("gst"), authorUserId: byUsername.TankeVoice.id, body: "Hostel agents for Tanke don start another inspection fee gist before new session even settle.", tag: "Landlord", areaDisplay: "Tanke", areaBucket: "tanke", admin2Name: "Ilorin South", admin2Type: "LGA", stateName: "Kwara", feedVisibilityScore: 0.72, translationText: null, commentsCount: 0, reactionsCount: 0, reportsCount: 0, followUpCount: 0, status: "active" as const, createdAt: hoursAgo(16) },
    { id: makeId("gst"), authorUserId: byUsername.AriariaWatch.id, body: "Two people for Ariaria don carry their tailoring machines enter bus park office because they wan test Ghana route next month.", tag: "Japa", areaDisplay: "Ariaria", areaBucket: "ariaria", admin2Name: "Aba North", admin2Type: "LGA", stateName: "Abia", feedVisibilityScore: 0.77, translationText: null, commentsCount: 0, reactionsCount: 0, reportsCount: 0, followUpCount: 0, status: "active" as const, createdAt: hoursAgo(17) },
    { id: makeId("gst"), authorUserId: byUsername.CoalCityEye.id, body: "Travel agent queue long for New Haven again. People dey price UK school route like say exam result don land already.", tag: "Japa", areaDisplay: "New Haven", areaBucket: "new-haven", admin2Name: "Enugu North", admin2Type: "LGA", stateName: "Enugu", feedVisibilityScore: 0.79, translationText: null, commentsCount: 0, reactionsCount: 0, reportsCount: 0, followUpCount: 0, status: "active" as const, createdAt: hoursAgo(19) },
  ];

  const rawReactionSeed: Array<
    [GistReactionRecord["type"], GistRecord, UserRecord]
  > = [
    ["wahala", gists[0], byUsername.BodijaBird], ["omo", gists[0], byUsername.PHWhisper], ["sharp", gists[0], byUsername.CoalCityEye],
    ["wahala", gists[1], byUsername.WuseSignal], ["omo", gists[1], byUsername.IbaraTape],
    ["wahala", gists[2], byUsername.YabaLine], ["omo", gists[2], byUsername.MallamLight], ["sharp", gists[2], byUsername.BarnawaMic],
    ["wahala", gists[3], byUsername.WuseSignal], ["omo", gists[3], byUsername.UyoWave],
    ["wahala", gists[6], byUsername.RayfieldLink], ["sharp", gists[6], byUsername.CoalCityEye],
    ["wahala", gists[7], byUsername.BodijaBird], ["omo", gists[8], byUsername.YabaLine],
    ["sharp", gists[12], byUsername.oga], ["wahala", gists[12], byUsername.CoalCityEye], ["omo", gists[13], byUsername.WuseSignal],
    ["wahala", gists[14], byUsername.BodijaBird], ["omo", gists[15], byUsername.BarnawaMic],
    ["sharp", gists[16], byUsername.CoalCityEye], ["wahala", gists[16], byUsername.WuseSignal],
    ["wahala", gists[17], byUsername.YabaLine], ["omo", gists[17], byUsername.IbaraTape],
  ];
  const gistReactions: GistReactionRecord[] = rawReactionSeed.map(
    ([type, gist, user], index) => ({
      id: makeId(`rct${index}`),
      gistId: gist.id,
      userId: user.id,
      type,
      createdAt: minutesAgo(30 + index),
    }),
  );

  const rawCommentSeed: Array<[GistRecord, UserRecord, string]> = [
    [gists[0], byUsername.BarnawaMic, "Generator sellers go smile again if this thing continue."],
    [gists[0], byUsername.CoalCityEye, "Same story every market day for my side too."],
    [gists[1], byUsername.IbaraTape, "Na wetin pain me pass. Rain just touch am and e don open."],
    [gists[2], byUsername.WuseSignal, "Queue short no mean price better for this country again."],
    [gists[3], byUsername.UyoWave, "Them announce am with full chest yesterday."],
    [gists[6], byUsername.MallamLight, "Good say road calm small. Last week no easy."],
    [gists[7], byUsername.YabaLine, "Landlord gist just dey universal for this country."],
    [gists[12], byUsername.BodijaBird, "Abuja refuse truck wey show once no mean say system don change."],
    [gists[14], byUsername.PHWhisper, "Transport people no dey reduce fare with the same speed dem take increase am."],
    [gists[15], byUsername.BodijaBird, "Any small incident for junction and everybody go turn traffic marshal."],
    [gists[16], byUsername.WuseSignal, "Low voltage fit spoil person mind pass full blackout sometimes."],
    [gists[17], byUsername.RayfieldLink, "Inspection fee without repair don become national anthem."],
  ];
  const gistComments: GistCommentRecord[] = rawCommentSeed.map(
    ([gist, user, body], index) => ({
      id: makeId(`cmt${index}`),
      gistId: gist.id,
      authorUserId: user.id,
      body,
      status: "active",
      createdAt: minutesAgo(12 + index * 4),
      parentCommentId: null,
    }),
  );

  for (const gist of gists) {
    gist.commentsCount = gistComments.filter((comment) => comment.gistId === gist.id).length;
    gist.reactionsCount = gistReactions.filter((reaction) => reaction.gistId === gist.id).length;
  }

  const survey = { id: makeId("srv"), question: "This week for your area, wetin press pass?", createdByUserId: oga.id, scopeType: "nigeria" as const, scopeValue: null, status: "live" as const, pinned: true, startsAt: hoursAgo(12), endsAt: daysFromNow(2), createdAt: hoursAgo(14), pointsReward: 12 };
  const surveyOptions = [
    { id: makeId("opt"), surveyId: survey.id, label: "Power", votesCount: 0 },
    { id: makeId("opt"), surveyId: survey.id, label: "Fuel", votesCount: 0 },
    { id: makeId("opt"), surveyId: survey.id, label: "Road", votesCount: 0 },
  ];
  const surveyVotes = [
    [byUsername.MallamLight.id, surveyOptions[0].id], [byUsername.BodijaBird.id, surveyOptions[2].id], [byUsername.PHWhisper.id, surveyOptions[1].id],
    [byUsername.CoalCityEye.id, surveyOptions[0].id], [byUsername.AriariaWatch.id, surveyOptions[1].id], [byUsername.BendelPen.id, surveyOptions[2].id],
    [byUsername.BarnawaMic.id, surveyOptions[0].id], [byUsername.RayfieldLink.id, surveyOptions[2].id], [byUsername.UyoWave.id, surveyOptions[1].id], [byUsername.WuseSignal.id, surveyOptions[0].id],
  ].map(([userId, optionId], index) => ({ id: makeId(`svt${index}`), surveyId: survey.id, optionId, userId, createdAt: hoursAgo(10 - index) }));

  for (const option of surveyOptions) {
    option.votesCount = surveyVotes.filter((vote) => vote.optionId === option.id).length;
  }

  const archivedSurvey = {
    id: makeId("srv"),
    question: "Last week, did road repairs improve for your side?",
    createdByUserId: oga.id,
    scopeType: "nigeria" as const,
    scopeValue: null,
    status: "closed" as const,
    pinned: false,
    startsAt: daysAgo(8),
    endsAt: daysAgo(5),
    createdAt: daysAgo(9),
    pointsReward: 8,
  };
  const archivedSurveyOptions = [
    { id: makeId("opt"), surveyId: archivedSurvey.id, label: "Yes small", votesCount: 0 },
    { id: makeId("opt"), surveyId: archivedSurvey.id, label: "No change", votesCount: 0 },
    { id: makeId("opt"), surveyId: archivedSurvey.id, label: "Worse pass before", votesCount: 0 },
  ];
  const archivedSurveyVotes = [
    [byUsername.IbaraTape.id, archivedSurveyOptions[1].id],
    [byUsername.BodijaBird.id, archivedSurveyOptions[2].id],
    [byUsername.WuseSignal.id, archivedSurveyOptions[0].id],
    [byUsername.RayfieldLink.id, archivedSurveyOptions[1].id],
  ].map(([userId, optionId], index) => ({
    id: makeId(`svt-arch${index}`),
    surveyId: archivedSurvey.id,
    optionId,
    userId,
    createdAt: daysAgo(6),
  }));

  for (const option of archivedSurveyOptions) {
    option.votesCount = archivedSurveyVotes.filter(
      (vote) => vote.optionId === option.id,
    ).length;
  }

  const referralCodes = [
    { id: makeId("ref"), code: "GREEN-MATA", createdByUserId: oga.id, usedByUserId: null, usedAt: null, expiresAt: null, isActive: true },
    { id: makeId("ref"), code: "NAIJA-YARN", createdByUserId: oga.id, usedByUserId: null, usedAt: null, expiresAt: null, isActive: true },
    { id: makeId("ref"), code: "TOWN-SQUARE", createdByUserId: oga.id, usedByUserId: null, usedAt: null, expiresAt: daysFromNow(14), isActive: true },
    { id: makeId("ref"), code: "ABJ-ENTRY", createdByUserId: oga.id, usedByUserId: byUsername.WuseSignal.id, usedAt: daysAgo(20), expiresAt: null, isActive: false },
    { id: makeId("ref"), code: "COAL-WORD", createdByUserId: oga.id, usedByUserId: byUsername.CoalCityEye.id, usedAt: daysAgo(61), expiresAt: null, isActive: false },
    { id: makeId("ref"), code: "COAL-CITY", createdByUserId: byUsername.CoalCityEye.id, usedByUserId: byUsername.BendelPen.id, usedAt: daysAgo(43), expiresAt: null, isActive: false },
    { id: makeId("ref"), code: "ABJ-CARRY", createdByUserId: byUsername.WuseSignal.id, usedByUserId: byUsername.YabaLine.id, usedAt: daysAgo(19), expiresAt: null, isActive: false },
    { id: makeId("ref"), code: "KANO-LINE", createdByUserId: oga.id, usedByUserId: byUsername.MallamLight.id, usedAt: daysAgo(69), expiresAt: null, isActive: false },
  ];

  const alerts = [
    { id: makeId("alt"), userId: byUsername.WuseSignal.id, type: "comment" as const, title: "New comment on your Gist", body: "BodijaBird replied to your sanitation gist.", link: `/gist/${gists[12].id}`, readAt: null, createdAt: minutesAgo(22) },
    { id: makeId("alt"), userId: byUsername.WuseSignal.id, type: "survey" as const, title: "Judgement Day don drop", body: "Vote the live survey and collect points.", link: `/judgement-day/${survey.id}`, readAt: null, createdAt: hoursAgo(11) },
    { id: makeId("alt"), userId: byUsername.WuseSignal.id, type: "points" as const, title: "Area Voice reached", body: "Your balance don pass 400 GistPoints.", link: "/score", readAt: hoursAgo(4), createdAt: daysAgo(2) },
    { id: makeId("alt"), userId: byUsername.YabaLine.id, type: "account" as const, title: "No full names, no numbers", body: "Keep your gist clean so Mata stay anonymous.", link: "/locker/privacy", readAt: null, createdAt: daysAgo(1) },
    { id: makeId("alt"), userId: byUsername.BendelPen.id, type: "account" as const, title: "You don dey quiet", body: "Drop one clean gist or vote Judgement Day so people for your side hear from you again.", link: "/alerts", readAt: null, createdAt: daysAgo(6) },
    { id: makeId("alt"), userId: byUsername.CoalCityEye.id, type: "activity" as const, title: "Enugu gist dey move", body: "More replies dey gather around New Haven gist this evening.", link: `/gist/${gists[15].id}`, readAt: null, createdAt: hoursAgo(5) },
  ];

  const savedGists = [
    { id: makeId("svg"), userId: byUsername.WuseSignal.id, gistId: gists[0].id, createdAt: hoursAgo(4) },
    { id: makeId("svg"), userId: byUsername.BodijaBird.id, gistId: gists[12].id, createdAt: hoursAgo(3) },
    { id: makeId("svg"), userId: byUsername.YabaLine.id, gistId: gists[18].id, createdAt: hoursAgo(2) },
  ];

  const contactOgaMessages = [
    {
      id: makeId("msg"),
      senderUserId: byUsername.WuseSignal.id,
      senderIdentity: "@WuseSignal",
      accountCodeReference: "4421",
      category: "Suggestion" as const,
      body: "Prediction slot fit make sense for Abuja transport and rent topics once una ready.",
      status: "unread" as const,
      createdAt: hoursAgo(6),
      readAt: null,
    },
    {
      id: makeId("msg"),
      senderUserId: byUsername.BarnawaMic.id,
      senderIdentity: "@BarnawaMic",
      accountCodeReference: null,
      category: "Report issue" as const,
      body: "One gist for my side disappear after refresh yesterday. Abeg check am.",
      status: "read" as const,
      createdAt: daysAgo(1),
      readAt: hoursAgo(12),
    },
    {
      id: makeId("msg"),
      senderUserId: byUsername.MallamLight.id,
      senderIdentity: "@MallamLight",
      accountCodeReference: null,
      category: "Intel" as const,
      body: "Transport fare for Kantin side never shift even though fuel don calm small. Traders say the same riders dey hold the line every evening.",
      status: "unread" as const,
      createdAt: hoursAgo(2),
      readAt: null,
    },
  ];

  const intelSubmissions = [
    {
      id: makeId("int"),
      contactMessageId: contactOgaMessages[2].id,
      senderUserId: byUsername.MallamLight.id,
      senderIdentity: "@MallamLight",
      accountCodeReference: null,
      method: "pattern-observed" as const,
      urgency: "watch" as const,
      summary: "Fare cartel may be holding Kantin side prices up",
      body: contactOgaMessages[2].body,
      locationHint: "Sabon Gari / Kantin side",
      linkedGistReference: gists[14].id,
      status: "new" as const,
      createdAt: contactOgaMessages[2].createdAt,
      reviewedAt: null,
    },
  ];

  const pinnedGists = [
    {
      gistId: gists[12].id,
      priority: 1 as const,
      pinnedByUserId: oga.id,
      createdAt: hoursAgo(9),
      updatedAt: hoursAgo(9),
    },
    {
      gistId: gists[3].id,
      priority: 2 as const,
      pinnedByUserId: oga.id,
      createdAt: hoursAgo(8),
      updatedAt: hoursAgo(8),
    },
  ];

  const predictionModules = [
    {
      id: makeId("prd"),
      title: "Prediction lane coming to Mata",
      body: "Soon, trusted members fit stake on local outcomes like rent movement, NEPA fixes, or fuel relief without exposing personal identity.",
      kicker: "Predictions",
      status: "live" as const,
      createdByUserId: oga.id,
      createdAt: hoursAgo(1),
    },
  ];

  const userPointsLedger: UserPointsLedgerRecord[] = users.flatMap(
    (user, index): UserPointsLedgerRecord[] => [
      {
        id: makeId(`pt${index}`),
        userId: user.id,
        eventType: "join",
        pointsDelta: 20,
        metadata: { source: "seed" },
        createdAt: user.createdAt,
      },
      {
        id: makeId(`pt${index}`),
        userId: user.id,
        eventType: "drop-gist",
        pointsDelta: Math.max(14, Math.floor(user.pointsBalance / 10)),
        metadata: { source: "seed" },
        createdAt: daysAgo(7),
      },
    ],
  );
  userPointsLedger.push({ id: makeId("pt"), userId: byUsername.WuseSignal.id, eventType: "milestone", pointsDelta: 25, metadata: { tier: "Area Voice" }, createdAt: daysAgo(2) });
  userPointsLedger.push({ id: makeId("pt"), userId: byUsername.CoalCityEye.id, eventType: "voted-survey", pointsDelta: 12, metadata: { surveyId: survey.id }, createdAt: hoursAgo(9) });
  userPointsLedger.push({ id: makeId("pt"), userId: byUsername.BarnawaMic.id, eventType: "report-validated", pointsDelta: 6, metadata: { reportType: "personal-data" }, createdAt: daysAgo(3) });

  const gistReports = [
    { id: makeId("rpt"), gistId: gists[1].id, reporterUserId: byUsername.WuseSignal.id, type: "general" as const, reasonText: "Road repair gist still dey attract repeated complaints.", createdAt: hoursAgo(7) },
    { id: makeId("rpt"), gistId: gists[5].id, reporterUserId: byUsername.BarnawaMic.id, type: "personal-data" as const, reasonText: "Keep job gist far from direct contact detail before e cross line.", createdAt: daysAgo(2) },
    { id: makeId("rpt"), gistId: gists[13].id, reporterUserId: byUsername.MallamLight.id, type: "fake-location" as const, reasonText: "Reporter says this transformer gist may not be from the stated side.", createdAt: daysAgo(1) },
  ];

  for (const gist of gists) {
    gist.reportsCount = gistReports.filter((report) => report.gistId === gist.id).length;
  }

  const userTrustProfiles = users.map((user, index) => ({ userId: user.id, trustScore: user.isOga ? 100 : Math.max(62, 92 - index * 2), personalDataStrikes: 0, fakeLocationStrikes: 0, validReportCount: index % 3 === 0 ? 1 : 0, invalidReportCount: 0, lastUpdatedAt: hoursAgo(index + 1) }));
  const trustByUserId = new Map(userTrustProfiles.map((profile) => [profile.userId, profile]));
  const bendelTrust = trustByUserId.get(byUsername.BendelPen.id);
  const yabaTrust = trustByUserId.get(byUsername.YabaLine.id);

  if (bendelTrust) {
    bendelTrust.personalDataStrikes = 1;
    bendelTrust.trustScore -= 5;
  }

  if (yabaTrust) {
    yabaTrust.fakeLocationStrikes = 1;
    yabaTrust.trustScore -= 4;
  }

  const locationCache = LOCATIONS.map((location, index) => ({ id: makeId(`loc${index}`), ...location, provider: "mock", providerRef: location.areaBucket, createdAt: daysAgo(45), updatedAt: daysAgo(3) }));
  const ogaActions = [
    { id: makeId("oga"), ogaUserId: oga.id, actionType: "seed_referrals_created", targetType: "referral_code", targetId: referralCodes[0].id, notes: "Initial launch batch", createdAt: daysAgo(21) },
    { id: makeId("oga"), ogaUserId: oga.id, actionType: "survey_pinned", targetType: "survey", targetId: survey.id, notes: "Weekly platform survey", createdAt: hoursAgo(12) },
    { id: makeId("oga"), ogaUserId: oga.id, actionType: "trust_queue_reviewed", targetType: "report_batch", targetId: gistReports[0].id, notes: "Morning sweep", createdAt: hoursAgo(6) },
    { id: makeId("oga"), ogaUserId: oga.id, actionType: "gist_pinned", targetType: "gist", targetId: gists[12].id, notes: "priority 1", createdAt: hoursAgo(9) },
  ];

  return {
    users,
    sessions: [],
    joinDrafts: [],
    referralCodes,
    accountRecoveryEvents: [],
    gists,
    gistRelations: [],
    gistReactions,
    gistComments,
    gistReports,
    surveys: [survey, archivedSurvey],
    surveyOptions: [...surveyOptions, ...archivedSurveyOptions],
    surveyVotes: [...surveyVotes, ...archivedSurveyVotes],
    alerts,
    savedGists,
    contactOgaMessages,
    intelSubmissions,
    pinnedGists,
    predictionModules,
    userPointsLedger,
    userTrustProfiles,
    ogaActions,
    locationCache,
    featureFlags: FEATURE_FLAGS.map((flag) => ({ ...flag })),
  };
}
