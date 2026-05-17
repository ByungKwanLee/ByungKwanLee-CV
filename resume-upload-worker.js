const DEFAULT_MAX_FILE_BYTES = 15 * 1024 * 1024;

function buildCorsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}

function resolveCorsOrigin(request, env) {
  const configured = String(env.ALLOWED_ORIGIN || "*").trim();
  if (configured === "*") return "*";
  const requestOrigin = request.headers.get("Origin") || "";
  return requestOrigin === configured ? configured : "";
}

function jsonResponse(payload, status, origin) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...buildCorsHeaders(origin || "*")
    }
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function bytesToBase64(uint8) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < uint8.length; i += chunkSize) {
    const chunk = uint8.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

function normalizeText(input, maxLength, fallback) {
  const text = String(input || "").trim();
  if (!text) return fallback;
  return text.slice(0, maxLength);
}

export default {
  async fetch(request, env) {
    const allowedOrigin = resolveCorsOrigin(request, env);
    const configuredOrigin = String(env.ALLOWED_ORIGIN || "*").trim();
    const responseOrigin = configuredOrigin === "*" ? "*" : (allowedOrigin || configuredOrigin);

    if (request.method === "OPTIONS") {
      if (configuredOrigin !== "*" && !allowedOrigin) {
        return jsonResponse({ ok: false, error: "Origin not allowed." }, 403, responseOrigin);
      }
      return new Response(null, {
        status: 204,
        headers: buildCorsHeaders(responseOrigin)
      });
    }

    if (request.method === "GET") {
      return jsonResponse({ ok: true, service: "resume-upload-worker" }, 200, responseOrigin);
    }

    if (request.method !== "POST") {
      return jsonResponse({ ok: false, error: "Method not allowed." }, 405, responseOrigin);
    }

    if (configuredOrigin !== "*" && !allowedOrigin) {
      return jsonResponse({ ok: false, error: "Origin not allowed." }, 403, responseOrigin);
    }

    if (!env.RESEND_API_KEY) {
      return jsonResponse({ ok: false, error: "Server is not configured (missing RESEND_API_KEY)." }, 500, responseOrigin);
    }

    const recipients = [env.PRIMARY_TO, env.SECONDARY_TO].filter(Boolean);
    if (!recipients.length) {
      return jsonResponse({ ok: false, error: "Server is not configured (missing recipients)." }, 500, responseOrigin);
    }

    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      return jsonResponse({ ok: false, error: "Invalid form data." }, 400, responseOrigin);
    }

    const resume = formData.get("resume");
    if (!(resume instanceof File)) {
      return jsonResponse({ ok: false, error: "Resume file is required." }, 400, responseOrigin);
    }

    const maxFileBytes = Number(env.MAX_FILE_BYTES || DEFAULT_MAX_FILE_BYTES);
    if (resume.size > maxFileBytes) {
      return jsonResponse({ ok: false, error: "File too large. Max 15 MB." }, 413, responseOrigin);
    }

    const applicationType = normalizeText(formData.get("applicationType"), 120, "Application");
    const submittedAtUtc = normalizeText(formData.get("submittedAtUtc"), 64, new Date().toISOString());
    const source = normalizeText(formData.get("source"), 500, "unknown");

    const attachmentBuffer = await resume.arrayBuffer();
    const attachmentBase64 = bytesToBase64(new Uint8Array(attachmentBuffer));
    const subject = `[CV Website] ${applicationType} Resume`;

    const textBody = [
      "A new resume submission has arrived.",
      "",
      `Application Type: ${applicationType}`,
      `Submitted At (UTC): ${submittedAtUtc}`,
      `Source: ${source}`,
      `Filename: ${resume.name}`,
      `Filesize (bytes): ${resume.size}`
    ].join("\n");

    const htmlBody = `
      <h3>New resume submission</h3>
      <p><strong>Application Type:</strong> ${escapeHtml(applicationType)}</p>
      <p><strong>Submitted At (UTC):</strong> ${escapeHtml(submittedAtUtc)}</p>
      <p><strong>Source:</strong> ${escapeHtml(source)}</p>
      <p><strong>Filename:</strong> ${escapeHtml(resume.name)}</p>
      <p><strong>Filesize (bytes):</strong> ${escapeHtml(resume.size)}</p>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL || "CV Website <onboarding@resend.dev>",
        to: recipients,
        subject,
        text: textBody,
        html: htmlBody,
        attachments: [
          {
            filename: resume.name,
            content: attachmentBase64
          }
        ]
      })
    });

    const resendPayload = await resendResponse.json().catch(() => ({}));
    if (!resendResponse.ok) {
      const message = resendPayload.message || resendPayload.error || `Resend API error (${resendResponse.status}).`;
      return jsonResponse({ ok: false, error: message }, 502, responseOrigin);
    }

    return jsonResponse({ ok: true, id: resendPayload.id || null }, 200, responseOrigin);
  }
};
