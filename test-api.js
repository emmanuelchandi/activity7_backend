// Runs the Step 7 tests automatically. Needs Node 18 or newer.
//   Local:   npm run test:api
//   Hosted:  node test-api.js https://your-backend.onrender.com
const BASE = (process.argv[2] || process.env.BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

const good = {
  title: "Test broken window",
  category: "Furniture",
  description: "The window in Room A3 will not close properly.",
  status: "Pending"
};

let passed = 0;
let failed = 0;

async function call(method, path, body, rawBody) {
  const options = { method, headers: {} };
  if (rawBody !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = rawBody;
  } else if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }
  const response = await fetch(BASE + path, options);
  const text = await response.text();
  let data = null;
  try { data = JSON.parse(text); } catch (e) { data = text; }
  return { status: response.status, data };
}

function check(name, condition, details) {
  if (condition) {
    passed += 1;
    console.log("PASS  " + name);
  } else {
    failed += 1;
    console.log("FAIL  " + name + (details ? "  ->  " + details : ""));
  }
}

async function main() {
  console.log("Testing " + BASE + "\n");

  let r = await call("GET", "/");
  check("GET / shows the guide", r.status === 200 && typeof r.data === "string" && r.data.includes("/api/records"));

  r = await call("GET", "/health");
  check("GET /health returns 200", r.status === 200, JSON.stringify(r.data));

  r = await call("GET", "/api/records");
  check("GET /api/records returns an array", r.status === 200 && Array.isArray(r.data), JSON.stringify(r.data));
  const startCount = Array.isArray(r.data) ? r.data.length : 0;

  r = await call("POST", "/api/records", { ...good, id: 9999 });
  check("POST valid body returns 201 and a new id (client id ignored)",
    r.status === 201 && Number.isInteger(r.data.id) && r.data.id !== 9999 && r.data.title === good.title,
    JSON.stringify(r.data));
  const id = r.data && r.data.id;

  r = await call("GET", "/api/records/" + id);
  check("GET one returns the created record", r.status === 200 && r.data.id === id && r.data.description === good.description);

  const changed = { title: "Updated window", category: "Furniture", description: "Window now repaired and tested.", status: "Completed" };
  r = await call("PUT", "/api/records/" + id, changed);
  check("PUT returns the updated record with the same id",
    r.status === 200 && r.data.id === id && r.data.status === "Completed" && r.data.title === "Updated window",
    JSON.stringify(r.data));

  r = await call("DELETE", "/api/records/" + id);
  check("DELETE returns the deletion message", r.status === 200 && r.data.message === "Record deleted.", JSON.stringify(r.data));

  r = await call("GET", "/api/records/" + id);
  check("GET deleted id returns 404", r.status === 404 && !!r.data.message);

  r = await call("POST", "/api/records", { ...good, title: undefined });
  check("POST missing title returns 400", r.status === 400 && !!r.data.message, JSON.stringify(r.data));

  r = await call("POST", "/api/records", { ...good, title: "   " });
  check("POST spaces-only title returns 400", r.status === 400);

  r = await call("POST", "/api/records", { ...good, status: "Done" });
  check("POST invalid status returns 400", r.status === 400 && !!r.data.message, JSON.stringify(r.data));

  r = await call("POST", "/api/records", { ...good, title: 123 });
  check("POST non-text title returns 400", r.status === 400);

  r = await call("GET", "/api/records");
  check("Invalid POSTs created no rows", Array.isArray(r.data) && r.data.length === startCount);

  r = await call("GET", "/api/records/abc");
  check("GET invalid id returns 400", r.status === 400 && !!r.data.message);

  r = await call("GET", "/api/records/0");
  check("GET id 0 returns 400", r.status === 400);

  r = await call("POST", "/api/records", undefined, "{ this is not json");
  check("Malformed JSON returns 400 with a message", r.status === 400 && !!r.data.message, JSON.stringify(r.data));

  r = await call("GET", "/api/records/99999999");
  check("GET missing id returns 404", r.status === 404);
  r = await call("PUT", "/api/records/99999999", good);
  check("PUT missing id returns 404 (does not create)", r.status === 404);
  r = await call("DELETE", "/api/records/99999999");
  check("DELETE missing id returns 404", r.status === 404);

  r = await call("GET", "/no-such-route");
  check("Unknown route returns JSON 404", r.status === 404 && !!r.data.message);

  console.log(`\n${passed} passed, ${failed} failed.`);
  console.log("Manual test still needed: create a record, restart the server, then GET it again.");
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error("Could not reach the server:", error.message);
  process.exitCode = 1;
});
