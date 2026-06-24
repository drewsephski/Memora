import { NextRequest, NextResponse } from "next/server";

import { getMemoraApiUrl } from "@/lib/memora-env";

const MEMORA_API_URL = getMemoraApiUrl();

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const apiKey = req.headers.get("authorization");

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing API key in authorization header",
      },
      { status: 401 },
    );
  }

  try {
    const response = await fetch(`${MEMORA_API_URL}/upload_file`, {
      method: "POST",
      headers: {
        Authorization: apiKey,
      },
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data?.message || data?.error || `HTTP error! status: ${response.status}`,
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error uploading file:", error);

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while uploading the file",
      },
      { status: 500 },
    );
  }
}
