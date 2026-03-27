import type { ZodError } from "zod";

import type { ActionState } from "@/lib/domain/validation";

export function fromZodError(error: ZodError): ActionState {
  return {
    status: "error",
    fieldErrors: error.flatten().fieldErrors,
  };
}

export function actionError(message: string): ActionState {
  return {
    status: "error",
    message,
  };
}

export function actionSuccess(message: string): ActionState {
  return {
    status: "success",
    message,
  };
}

export function actionWarning(message: string): ActionState {
  return {
    status: "warning",
    message,
  };
}
