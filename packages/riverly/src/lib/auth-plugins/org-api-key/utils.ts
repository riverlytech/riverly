import type { BetterAuthOptions } from "better-auth";
import { isDevelopment, isTest } from "better-auth";
import z from "zod/v4";

export const getDate = (span: number, unit: "sec" | "ms" = "ms") => {
  return new Date(Date.now() + (unit === "sec" ? span * 1000 : span));
};

export function getIp(req: Request | Headers, options: BetterAuthOptions): string | null {
  if (options.advanced?.ipAddress?.disableIpTracking) {
    return null;
  }

  if (isTest()) {
    return "127.0.0.1"; // Use a fixed IP for test environments
  }
  if (isDevelopment()) {
    return "127.0.0.1"; // Use a fixed IP for development environments
  }

  const headers = "headers" in req ? req.headers : req;

  const defaultHeaders = ["x-forwarded-for"];

  const ipHeaders = options.advanced?.ipAddress?.ipAddressHeaders || defaultHeaders;

  for (const key of ipHeaders) {
    const value = "get" in headers ? headers.get(key) : headers[key];
    if (typeof value === "string") {
      const ip = value.split(",")[0]!.trim();
      if (isValidIP(ip)) {
        return ip;
      }
    }
  }
  return null;
}

function isValidIP(ip: string): boolean {
  const ipv4 = z.ipv4().safeParse(ip);

  if (ipv4.success) {
    return true;
  }

  const ipv6 = z.ipv6().safeParse(ip);
  if (ipv6.success) {
    return true;
  }

  return false;
}

export function safeJSONParse<T>(data: unknown): T | null {
  function reviver(_: string, value: any): any {
    if (typeof value === "string") {
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
      if (iso8601Regex.test(value)) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    return value;
  }
  try {
    if (typeof data !== "string") {
      return data as T;
    }
    return JSON.parse(data, reviver);
  } catch (e) {
    console.error("Error parsing JSON", { error: e });
    return null;
  }
}
