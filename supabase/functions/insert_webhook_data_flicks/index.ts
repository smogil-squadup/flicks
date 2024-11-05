// File: insert_webhook_data_flicks/index.ts

// @ts-ignore: Deno compatibility
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"; // Using esm.sh for Deno compatibility

// Retrieve environment variables using Deno.env.get
// @ts-ignore: Deno compatibility
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
// @ts-ignore: Deno compatibility
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
// @ts-ignore: Deno compatibility
Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "POST") {
    try {
      const body = await req.json();
      console.log("Received body:", JSON.stringify(body, null, 2));

      // Validate required fields
      const requiredFields = [
        "quantity",
        "amount",
        "trans_id",
        "box_office",
        "event_name",
        "created_at",
        "payment_method",
        "start_at",
      ];
      const missingFields = requiredFields.filter((field) => !(field in body));
      if (missingFields.length > 0) {
        return new Response(
          JSON.stringify({
            error: `Missing required fields: ${missingFields.join(", ")}`,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const transformedData: Record<string, string | Date> = {};
      const invalidFields: string[] = [];

      for (const field of requiredFields) {
        const value = body[field];
        if (field === "created_at") {
          // Handle created_at field
          if (typeof value === "string") {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              transformedData[field] = date;
            } else {
              invalidFields.push(field);
            }
          } else {
            invalidFields.push(field);
          }
        } else if (typeof value === "string" || typeof value === "number") {
          transformedData[field] = String(value);
        } else {
          invalidFields.push(field);
        }
      }

      if (invalidFields.length > 0) {
        return new Response(
          JSON.stringify({
            error: `Invalid data types for fields: ${invalidFields.join(", ")}`,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      console.log(
        "Transformed data:",
        JSON.stringify(transformedData, null, 2),
      );

      // Insert data into the flicks table
      console.log("Attempting to insert data into flicks table");
      const { data, error } = await supabase
        .from("flicks")
        .insert([transformedData])
        .select();

      if (error) {
        console.error("Error inserting data:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }

      console.log(
        "Insertion successful. Returned data:",
        JSON.stringify(data, null, 2),
      );
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: unknown) {
      console.error("Error processing request:", err);
      const errorMessage = err instanceof Error
        ? err.message
        : "An unknown error occurred";
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
});

console.log("Supabase client config:", {
  supabaseUrl: SUPABASE_URL,
  hasSupabaseKey: !!SUPABASE_KEY,
});
