import "server-only";

const operatorOrigin = process.env.OGA_APP_ORIGIN?.trim().replace(/\/$/, "") || null;

function externalizeOperatorPath(path: string) {
  return operatorOrigin ? `${operatorOrigin}${path}` : null;
}

export function hasStandaloneOperatorApp() {
  return operatorOrigin !== null;
}

export function getOperatorDashboardDestination() {
  return externalizeOperatorPath("/oga-v2") ?? "/oga-v2";
}

export function getOperatorLoginDestination() {
  return externalizeOperatorPath("/login") ?? "/oga-login";
}

export function getOperatorRecoveryDestination() {
  return externalizeOperatorPath("/recovery") ?? "/locker/recovery";
}
