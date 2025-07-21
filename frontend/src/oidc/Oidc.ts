import * as client from "openid-client";

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

export const beginLogin = async () => {
  const redirectUrl = `${window.location.origin}/auth/callback`;
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
  const code_verifier: string = client.randomPKCECodeVerifier();
  const code_challenge: string =
    await client.calculatePKCECodeChallenge(code_verifier);
  const parameters: Record<string, string> = {
    redirectUrl,
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
  }

  const redirectTo = client.buildAuthorizationUrl(config, parameters);

  console.log("Redirecting to OIDC server:", redirectTo);
  window.location.href = redirectTo.href;
};
