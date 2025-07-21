export const AuthUtils = {
  getToken: () => {
    return localStorage.getItem("token");
  },

  setToken: (token: string) => {
    localStorage.setItem("token", token);
  },

  setOidcTokenEndpointResponse: (response: Record<string, unknown>) => {
    localStorage.setItem(
      "oidc_token_endpoint_response",
      JSON.stringify(response)
    );
  },

  getOidcTokenEndpointResponse: (): Record<string, unknown> | null => {
    const response = localStorage.getItem("oidc_token_endpoint_response");
    return response ? JSON.parse(response) : null;
  },

  clearToken: () => {
    localStorage.removeItem("token");
  },
};
