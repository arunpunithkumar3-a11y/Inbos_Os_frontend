
export const API_BASE =
  window.location.hostname === "inboxos-ai.onrender.com" ||
  window.location.hostname === "inbox-os-ai.onrender.com" ||
  window.location.port === "8000"
    ? window.location.origin
    : "https://inboxos-ai.onrender.com";

export function decodeToken(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );

    const payload = JSON.parse(jsonPayload);

    if (payload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime >= payload.exp) {
        console.warn("Stored JWT token has expired according to its claim.");
        return null;
      }
    }

    return payload.user_data || null;
  } catch (e) {
    console.error("Failed to decode JWT token:", e);
    return null;
  }
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("inbox_os_refresh_token");
  if (!refreshToken) {
    return null;
  }

  try {
    console.log("Attempting token refresh...");
    const res = await fetch(`${API_BASE}/api/auth/refresh_token`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.access_token) {
        console.log("Token refresh successful!");
        localStorage.setItem("inbox_os_token", data.access_token);
        if (data.refresh_token) {
          localStorage.setItem("inbox_os_refresh_token", data.refresh_token);
        }
        return data.access_token;
      }
    }
  } catch (err) {
    console.error("Token refresh API call error:", err);
  }

  return null;
}

export async function apiRequest(endpoint, options = {}, onAuthFailure = null) {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE}${endpoint}`;

  if (!options.headers) options.headers = {};

  let token = localStorage.getItem("inbox_os_token");
  if (token && !options.headers["Authorization"]) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type");
    let data = null;
    let text = "";

    if (contentType && contentType.includes("application/json")) {
      text = await res.text();
      if (text && text.trim().length > 0) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error(
            "Failed to parse response JSON despite content-type header:",
            e,
          );
          throw new Error("Malformed JSON response from server", { cause: e });
        }
      }
    } else {
      text = await res.text();
    }

    if (!res.ok) {

      if (res.status === 401) {
        if (!options._isRetry) {
          const refreshedToken = await refreshAccessToken();
          if (refreshedToken) {
            options._isRetry = true;
            options.headers["Authorization"] = `Bearer ${refreshedToken}`;
            return await apiRequest(endpoint, options, onAuthFailure);
          }
        }

        console.warn("Authentication session expired (401). Signing out...");
        localStorage.removeItem("inbox_os_token");
        localStorage.removeItem("inbox_os_refresh_token");
        if (onAuthFailure) {
          onAuthFailure();
        }
      }

      let errorMsg = "Request failed";

      if (data) {
        if (data.detail) {
          if (typeof data.detail === "string") {
            errorMsg = data.detail;
          } else if (typeof data.detail === "object") {
            if (Array.isArray(data.detail)) {

              errorMsg = data.detail
                .map((err) => {
                  const field = err.loc ? err.loc[err.loc.length - 1] : "";
                  return field ? `${field}: ${err.msg}` : err.msg;
                })
                .join(", ");
            } else {

              errorMsg =
                data.detail.message ||
                data.detail.error ||
                JSON.stringify(data.detail);
            }
          }
        } else if (data.message) {
          errorMsg = data.message;
        } else {
          errorMsg = JSON.stringify(data);
        }
      } else if (text) {
        errorMsg = text;
      } else {
        errorMsg = `Request failed with status ${res.status}`;
      }

      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error(`API Client Error [${endpoint}]:`, err);
    throw err;
  }
}
