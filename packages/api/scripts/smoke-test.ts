const apiUrl =
  process.env.MEMORA_API_URL ??
  process.env.SUPAVEC_API_URL ??
  "https://memora-api-drew.fly.dev";
const apiKey = process.env.MEMORA_API_KEY ?? process.env.SUPAVEC_API_KEY;

if (!apiKey) {
  console.error(
    "Missing MEMORA_API_KEY. Run with MEMORA_API_KEY=<your key> bun run test:smoke",
  );
  process.exit(1);
}

type TestResult = {
  name: string;
  ok: boolean;
  ms: number;
  status?: number;
  details?: Record<string, unknown>;
  error?: string;
};

type ListedFile = {
  file_id?: unknown;
};

const results: TestResult[] = [];
const createdFileIds: string[] = [];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const isUuid = (value: unknown) =>
  typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value);

async function request(
  path: string,
  options: {
    method?: string;
    json?: unknown;
    body?: BodyInit;
    authorization?: string;
  } = {},
) {
  const response = await fetch(`${apiUrl}${path}`, {
    method: options.method ?? "POST",
    headers: {
      ...(options.authorization === undefined
        ? { Authorization: apiKey }
        : options.authorization
          ? { Authorization: options.authorization }
          : {}),
      ...(options.json ? { "Content-Type": "application/json" } : {}),
    },
    body: options.json ? JSON.stringify(options.json) : options.body,
  });

  const text = await response.text();
  try {
    return {
      status: response.status,
      data: JSON.parse(text) as Record<string, unknown>,
      text,
    };
  } catch {
    return {
      status: response.status,
      data: { raw: text },
      text,
    };
  }
}

async function run(
  name: string,
  assertion: () => Promise<{
    status?: number;
    details?: Record<string, unknown>;
  }>,
) {
  const started = Date.now();

  try {
    const result = await assertion();
    results.push({
      name,
      ok: true,
      ms: Date.now() - started,
      ...result,
    });
  } catch (error) {
    results.push({
      name,
      ok: false,
      ms: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // The public API has an IP sliding-window limiter. Keep this script useful
  // from laptops, CI, and shared office networks without special bypass keys.
  await wait(1150);
}

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function cleanup() {
  for (const fileId of createdFileIds) {
    try {
      const { status, data } = await request("/delete_file", {
        json: { file_id: fileId },
      });

      results.push({
        name: `cleanup delete_file ${fileId.slice(0, 8)}`,
        ok: status === 200 && data.success === true,
        ms: 0,
        status,
      });
      await wait(1150);
    } catch (error) {
      results.push({
        name: `cleanup delete_file ${fileId.slice(0, 8)}`,
        ok: false,
        ms: 0,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

let textFileId = "";
let multipartFileId = "";

try {
  await run("health", async () => {
    const { status, data } = await request("/", {
      method: "GET",
      authorization: "",
    });
    expect(status === 200, `Expected 200, got ${status}`);
    expect(data.service === "memora-api", "Unexpected service name");
    return { status, details: { service: data.service } };
  });

  await run("missing auth is rejected", async () => {
    const { status, data } = await request("/upload_text", {
      authorization: "",
      json: { contents: "hello world" },
    });
    expect(status === 401, `Expected 401, got ${status}`);
    return { status, details: { message: data.message ?? data.error } };
  });

  await run("invalid auth is rejected", async () => {
    const { status, data } = await request("/search", {
      authorization: "not-a-real-key",
      json: { query: "refunds", file_ids: [crypto.randomUUID()] },
    });
    expect(status === 401, `Expected 401, got ${status}`);
    return { status, details: { message: data.message ?? data.error } };
  });

  await run("upload_text raw contents", async () => {
    const { status, data } = await request("/upload_text", {
      json: {
        name: `smoke-text-${Date.now()}`,
        contents:
          "Memora smoke test: Refunds are available for 30 days. Enterprise customers receive priority support.",
      },
    });
    textFileId = String(data.file_id ?? "");
    expect(status === 200 && data.success === true, "upload_text failed");
    expect(isUuid(textFileId), "upload_text did not return a UUID file_id");
    createdFileIds.push(textFileId);
    return { status, details: { fileId: textFileId } };
  });

  await run("search uploaded text", async () => {
    const { status, data } = await request("/search", {
      json: {
        query: "How long are refunds available?",
        file_ids: [textFileId],
        k: 3,
      },
    });
    const documents = Array.isArray(data.documents) ? data.documents : [];
    expect(status === 200 && data.success === true, "search failed");
    expect(documents.length > 0, "search returned no documents");
    return { status, details: { resultCount: documents.length } };
  });

  await run("chat uploaded text", async () => {
    const { status, data } = await request("/chat", {
      json: {
        query: "How long are refunds available?",
        file_ids: [textFileId],
        k: 3,
        stream: false,
      },
    });
    expect(status === 200 && data.success === true, "chat failed");
    expect(
      typeof data.answer === "string" && /30 days/i.test(data.answer),
      `Unexpected chat answer: ${String(data.answer)}`,
    );
    return { status, details: { answer: data.answer } };
  });

  await run("embeddings compatibility endpoint", async () => {
    const { status, data } = await request("/embeddings", {
      json: {
        query: "priority support",
        file_ids: [textFileId],
        k: 2,
      },
    });
    const documents = Array.isArray(data.documents) ? data.documents : [];
    expect(status === 200 && data.success === true, "embeddings failed");
    expect(documents.length > 0, "embeddings returned no documents");
    return { status, details: { resultCount: documents.length } };
  });

  await run("overwrite_text updates retrieval", async () => {
    const { status, data } = await request("/overwrite_text", {
      json: {
        file_id: textFileId,
        name: "smoke-overwrite",
        contents:
          "Memora smoke test updated: Refunds are available for 45 days. Priority support stays enterprise only.",
      },
    });
    expect(status === 200 && data.success === true, "overwrite_text failed");
    return { status, details: { message: data.message } };
  });

  await run("chat after overwrite", async () => {
    const { status, data } = await request("/chat", {
      json: {
        query: "How long are refunds available after the update?",
        file_ids: [textFileId],
        k: 3,
        stream: false,
      },
    });
    expect(
      status === 200 && data.success === true,
      "chat after overwrite failed",
    );
    expect(
      typeof data.answer === "string" && /45 days/i.test(data.answer),
      `Unexpected updated answer: ${String(data.answer)}`,
    );
    return { status, details: { answer: data.answer } };
  });

  await run("upload_file text multipart", async () => {
    const form = new FormData();
    form.append(
      "file",
      new File(
        ["Memora multipart smoke test: onboarding takes one week."],
        "memora-smoke.txt",
        { type: "text/plain" },
      ),
    );
    const { status, data } = await request("/upload_file", { body: form });
    multipartFileId = String(data.file_id ?? "");
    expect(status === 200 && data.success === true, "upload_file failed");
    expect(
      isUuid(multipartFileId),
      "upload_file did not return a UUID file_id",
    );
    createdFileIds.push(multipartFileId);
    return {
      status,
      details: { fileId: multipartFileId, chunks: data.chunks },
    };
  });

  await run("user_files lists active files", async () => {
    const { status, data } = await request("/user_files", {
      json: { pagination: { limit: 20, offset: 0 }, order_dir: "desc" },
    });
    const files = Array.isArray(data.results)
      ? (data.results as ListedFile[])
      : [];
    expect(status === 200 && data.success === true, "user_files failed");
    expect(
      files.some((file) => file?.file_id === textFileId),
      "user_files did not include uploaded text file",
    );
    expect(
      files.some((file) => file?.file_id === multipartFileId),
      "user_files did not include multipart file",
    );
    return { status, details: { resultCount: files.length } };
  });

  await run("streaming chat responds", async () => {
    const response = await fetch(`${apiUrl}/chat`, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "How long is onboarding?",
        file_ids: [multipartFileId],
        k: 3,
        stream: true,
      }),
    });
    const text = await response.text();
    expect(response.status === 200, `Expected 200, got ${response.status}`);
    expect(
      /one week|onboarding/i.test(text),
      "Streaming response did not include expected answer",
    );
    return {
      status: response.status,
      details: { bytes: text.length },
    };
  });
} finally {
  await cleanup();
}

const failed = results.filter((result) => !result.ok);
for (const result of results) {
  const status = result.ok ? "PASS" : "FAIL";
  const suffix = result.status
    ? ` (${result.status}, ${result.ms}ms)`
    : ` (${result.ms}ms)`;
  console.log(`${status} ${result.name}${suffix}`);
  if (result.details) {
    console.log(`  ${JSON.stringify(result.details)}`);
  }
  if (result.error) {
    console.log(`  ${result.error}`);
  }
}

if (failed.length > 0) {
  process.exit(1);
}
