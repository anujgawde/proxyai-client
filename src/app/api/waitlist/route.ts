import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

interface WaitlistBody {
  fullName: string;
  email: string;
  company: string;
  role: string;
  teamSize: string;
  useCase?: string;
}

function createJwt(
  serviceAccountEmail: string,
  privateKey: string
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccountEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const unsignedToken = `${encode(header)}.${encode(payload)}`;
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(unsignedToken)
    .sign(privateKey, "base64url");

  return `${unsignedToken}.${signature}`;
}

async function getAccessToken(
  serviceAccountEmail: string,
  privateKey: string
): Promise<string> {
  const jwt = createJwt(serviceAccountEmail, privateKey);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function appendToSheet(
  accessToken: string,
  spreadsheetId: string,
  values: string[]
): Promise<void> {
  const range = "Sheet1";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [values] }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to append to sheet: ${error}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: WaitlistBody = await request.json();

    // Validate required fields
    const { fullName, email, company, role, teamSize, useCase } = body;
    if (!fullName || !email || !company || !role || !teamSize) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const serviceAccountEmail = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n"
    );

    if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
      console.error("Missing Google Sheets environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const accessToken = await getAccessToken(serviceAccountEmail, privateKey);

    const timestamp = new Date().toISOString();
    await appendToSheet(accessToken, spreadsheetId, [
      timestamp,
      fullName,
      email,
      company,
      role,
      teamSize,
      useCase || "",
    ]);

    return NextResponse.json(
      { message: "Successfully added to waitlist" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Waitlist submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit to waitlist" },
      { status: 500 }
    );
  }
}
