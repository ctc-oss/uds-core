/**
 * Copyright 2025 Defense Unicorns
 * SPDX-License-Identifier: AGPL-3.0-or-later OR LicenseRef-Defense-Unicorns-Commercial
 */

import { Component, setupLogger } from "../../../../logger";
import { UDSConfig } from "../../config/config";

const internalBaseUrl =
  process.env.PEPR_MODE === "dev"
    ? "http://localhost:8080"
    : "http://keycloak-http.keycloak.svc.cluster.local:8080";

export const log = setupLogger(Component.OPERATOR_KEYCLOAK);

export function getBaseUrl() {
  const ssoBaseUrl = UDSConfig.ssoBaseUrl || "";
  if (!ssoBaseUrl || ssoBaseUrl.includes("###ZARF_VAR")) {
    return internalBaseUrl;
  }

  try {
    const path = new URL(ssoBaseUrl).pathname.replace(/\/+$/, "");
    const prefix = !path || path === "/" ? "" : path;
    return `${internalBaseUrl}${prefix}`;
  } catch {
    // Keep operator calls functional even if a malformed URL is provided.
    return internalBaseUrl;
  }
}

export interface RestResponse {
  ok: boolean;
  status: number;
  statusText: string;
  data: unknown;
}

export async function throwErrorIfNeeded(response: RestResponse, onError?: (error: Error) => void) {
  if (!response.ok) {
    const { status, statusText, data } = response;
    const err = new Error(`${status}, ${statusText}, ${data ? JSON.stringify(data) : ""}`);
    if (onError) {
      onError(err);
    }
    throw err;
  }
}
