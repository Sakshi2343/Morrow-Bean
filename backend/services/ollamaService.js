const defaultHost = process.env.OLLAMA_API_URL || "https://ollama.com/api";
const defaultModel = process.env.OLLAMA_MODEL || "gpt-oss:20b";
const defaultTimeout = Number(process.env.OLLAMA_TIMEOUT_MS || 20000);

const chatWithOllama = async ({ messages, model = defaultModel }) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), defaultTimeout);

  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (process.env.OLLAMA_API_KEY) {
      headers.Authorization = `Bearer ${process.env.OLLAMA_API_KEY}`;
    }

    const response = await fetch(`${defaultHost}/chat`, {
      method: "POST",
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model,
        stream: false,
        messages,
      }),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      throw new Error(`Ollama request failed: ${response.status} ${details}`.trim());
    }

    const payload = await response.json();
    return payload?.message?.content?.trim() || "";
  } finally {
    clearTimeout(timeoutId);
  }
};

export { chatWithOllama };
