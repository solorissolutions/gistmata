import { getTierByPoints } from "@/lib/domain/constants";

export const OGA_USERNAME = "oga";
export const OGA_USERNAME_NORMALIZED = OGA_USERNAME;
export const OGA_ACCOUNT_CODE = "GM-0001-OG";
export const OGA_DEFAULT_PIN = "091332";
export const OGA_DEFAULT_HOME_STATE = "FCT";
export const OGA_DEFAULT_POINTS = 999;
export const OGA_DEFAULT_TIER = getTierByPoints(OGA_DEFAULT_POINTS);
