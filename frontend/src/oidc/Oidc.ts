import * as client from "openid-client";
import type {
  TokenEndpointResponse,
  AuthorizationCodeGrantChecks,
} from "openid-client";
import { AuthUtils } from "../utils/auth.utils";

const serverUrl = import.meta.env.VITE_OIDC_SERVER_URL;
if (!serverUrl) {
  throw new Error(
    "VITE_OIDC_SERVER_URL is not defined in environment variables"
  );
}
const clientId = import.meta.env.VITE_OIDC_CLIENT_ID;
if (!clientId) {
  throw new Error(
    "VITE_OIDC_CLIENT_ID is not defined in environment variables"
  );
}

const retrieveConfig = async () => {
  let config: client.Configuration;
  if (import.meta.env.DEV) {
    // Allow insecure requests to HTTP in development mode
    config = await client.discovery(
      new URL(serverUrl),
      clientId,
      undefined,
      undefined,
      {
        execute: [client.allowInsecureRequests],
      }
    );
  } else {
    config = await client.discovery(new URL(serverUrl), clientId);
  }
  return config;
};

const buildRedirectUri = () => `${window.location.origin}/auth/callback`;

export const beginLogin = async () => {
  const config = await retrieveConfig();
  const redirectUrl = buildRedirectUri();
  const code_verifier: string = client.randomPKCECodeVerifier();
  localStorage.setItem("oidc_code_verifier", code_verifier);
  const code_challenge: string =
    await client.calculatePKCECodeChallenge(code_verifier);
  const parameters: Record<string, string> = {
    redirect_uri: redirectUrl,
    scope: "openid profile email",
    code_challenge,
    code_challenge_method: "S256",
  };

  if (!config.serverMetadata().supportsPKCE()) {
    /**
     * We cannot be sure the server supports PKCE so we're going to use state too.
     * Use of PKCE is backwards compatible even if the AS doesn't support it which
     * is why we're using it regardless. Like PKCE, random state must be generated
     * for every redirect to the authorization_endpoint.
     */
    parameters.state = client.randomState();
    localStorage.setItem("oidc_state", parameters.state);
  } else {
    // If the server supports PKCE, we can skip the state parameter
    // clear any previous state to avoid checking with it later
    localStorage.removeItem("oidc_state");
  }

  const redirectTo = client.buildAuthorizationUrl(config, parameters);

  console.log("Redirecting to OIDC server:", redirectTo);
  window.location.href = redirectTo.href;
};

export const consumeCallback = async (): Promise<void> => {
  const config = await retrieveConfig();
  const code_verifier = localStorage.getItem("oidc_code_verifier");
  localStorage.removeItem("oidc_code_verifier");
  if (!code_verifier) {
    throw new Error("No code verifier found in local storage");
  }

  const state = localStorage.getItem("oidc_state");
  localStorage.removeItem("oidc_state");

  // Prepare the checks for the authorization code grant
  const checks: AuthorizationCodeGrantChecks = {
    pkceCodeVerifier: code_verifier,
  };
  if (state) {
    checks.expectedState = state;
  }

  const tokens: TokenEndpointResponse = await client.authorizationCodeGrant(
    config,
    new URL(window.location.href),
    checks
  );

  console.log("Received tokens from OIDC server:", tokens);

  // save the tokens in local storage
  AuthUtils.setOidcTokenEndpointResponse(tokens);
};
