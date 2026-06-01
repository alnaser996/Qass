import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context): Promise<Response> => {
  // Use strong consistency for critical data
  const store = getStore({
    name: "gold-loss",
    consistency: "strong",
  });

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (req.method === "GET") {
    try {
      const casting = await store.get("gold_loss_casting", { type: "json" }) || [];
      const treeCasting = await store.get("gold_loss_tree_casting", { type: "json" }) || [];
      const rolling = await store.get("gold_loss_rolling", { type: "json" }) || [];
      const production = await store.get("gold_loss_production", { type: "json" }) || [];

      return new Response(
        JSON.stringify({
          casting,
          treeCasting,
          rolling,
          production,
        }),
        { status: 200, headers }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err.message || "Failed to retrieve records" }),
        { status: 500, headers }
      );
    }
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { key, data } = body;

      if (!key || !Array.isArray(data)) {
        return new Response(
          JSON.stringify({ error: "Invalid payload. 'key' and 'data' (array) are required." }),
          { status: 400, headers }
        );
      }

      const allowedKeys = [
        "gold_loss_casting",
        "gold_loss_tree_casting",
        "gold_loss_rolling",
        "gold_loss_production",
      ];

      if (!allowedKeys.includes(key)) {
        return new Response(
          JSON.stringify({ error: `Invalid key: ${key}. Allowed keys are ${allowedKeys.join(", ")}` }),
          { status: 400, headers }
        );
      }

      await store.setJSON(key, data);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err.message || "Failed to save records" }),
        { status: 500, headers }
      );
    }
  }

  return new Response("Method not allowed", { status: 405, headers });
};
