const BASE_URL =
  "https://botfilter-h5ddh6dye8exb7ha.centralus-01.azurewebsites.net";

const DEFAULT_TIMEOUT = 8000;

async function fetchWithTimeout(url, options = {}, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);

    if (error.name === "AbortError") {
      const timeoutError = new Error("Request timed out. Please try again.");
      timeoutError.status = 408;
      throw timeoutError;
    }

    const networkError = new Error(
      "Network error. Please check your connection."
    );
    networkError.status = 0;
    throw networkError;
  }
}

async function handleResponse(response) {
  const contentType = response.headers.get("content-type");
  let data = null;

  try {
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch {
    const parseError = new Error("Failed to parse server response.");
    parseError.status = response.status;
    throw parseError;
  }

  if (!response.ok) {
    console.error("❌ API ERROR RESPONSE:", data);

    const message =
      (typeof data === "object" && data?.message) ||
      JSON.stringify(data) ||
      `Request failed with status ${response.status}`;

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function getCandidateByEmail(email) {
  try {
    const sanitizedEmail = email.trim().toLowerCase();

    const response = await fetchWithTimeout(
      `${BASE_URL}/api/candidate/get-by-email?email=${encodeURIComponent(
        sanitizedEmail
      )}`
    );

    return await handleResponse(response);
  } catch (error) {
    console.error("getCandidateByEmail error:", error);
    throw error;
  }
}

export async function getJobs() {
  try {
    const response = await fetchWithTimeout(
      `${BASE_URL}/api/jobs/get-list`
    );

    const data = await handleResponse(response);

    if (!Array.isArray(data)) {
      const formatError = new Error("Invalid jobs data format.");
      formatError.status = 500;
      throw formatError;
    }

    return data;
  } catch (error) {
    console.error("getJobs error:", error);
    throw error;
  }
}

export async function applyToJob({
  uuid,
  jobId,
  candidateId,
  applicationId,
  repoUrl,
}) {
  try {
    console.log("=== APPLY BODY ===");
    console.log({
      uuid,
      jobId,
      candidateId,
      applicationId,
      repoUrl,
    });

    if (!uuid || !jobId || !candidateId || !applicationId || !repoUrl) {
      throw new Error("Missing required fields in applyToJob.");
    }

    const cleanRepoUrl = repoUrl.trim();

    const response = await fetchWithTimeout(
      `${BASE_URL}/api/candidate/apply-to-job`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uuid,
          jobId: String(jobId),
          candidateId,
          applicationId,
          repoUrl: cleanRepoUrl,
        }),
      }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error("applyToJob error:", error);
    throw error;
  }
}