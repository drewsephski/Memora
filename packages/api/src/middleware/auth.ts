import type { NextFunction, Request, Response } from "express";
import { supabase } from "../utils/supabase";

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
  userId?: string;
}

export function getApiKeyFromAuthorizationHeader(
  authHeader: string | undefined,
): string | undefined {
  const value = authHeader?.trim();
  if (!value) {
    return undefined;
  }

  const bearerMatch = value.match(/^Bearer\s+(.+)$/i);
  return (bearerMatch?.[1] ?? value).trim() || undefined;
}

export function getApiKeyFromRequest(req: AuthenticatedRequest) {
  return (
    req.apiKey ?? getApiKeyFromAuthorizationHeader(req.headers.authorization)
  );
}

export const apiKeyAuth = () => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const apiKey = getApiKeyFromAuthorizationHeader(req.headers.authorization);

    if (!apiKey) {
      return res.status(401).json({
        status: "error",
        message: "Missing API key in authorization header",
      });
    }

    const { data, error } = await supabase
      .from("api_keys")
      .select("id")
      .match({
        api_key: apiKey,
      })
      .single();

    if (error || !data) {
      return res.status(401).json({
        status: "error",
        message: "Invalid API key",
      });
    }

    req.apiKey = apiKey;
    return next();
  };
};
