import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export class GoogleSheetsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleSheetsError";
  }
}

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

export async function getGoogleSheet() {
  try {
    console.log("Creating JWT client...");
    const jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      scopes: SCOPES,
    });
    console.log("JWT client created successfully");

    console.log("Initializing Google Spreadsheet...");
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, jwt);
    console.log("Google Spreadsheet initialized");

    console.log("Loading sheet info...");
    await doc.loadInfo();
    console.log("Sheet info loaded successfully");

    return doc;
  } catch (error) {
    console.error("Error in getGoogleSheet:", error);
    throw new GoogleSheetsError(
      `Failed to get Google Sheet: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
