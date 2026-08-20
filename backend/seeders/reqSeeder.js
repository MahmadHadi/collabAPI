import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import readline from "readline";
import axios from "axios";

import ReqModel from "../models/ReqModel.js";

configDotenv();

// Setup readline for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return false;
  }
};

// Question helper
const askQuestion = (query) => {
  return new Promise((resolve) => rl.question(query, resolve));
};

// RUN REQUEST
const runRequest = async () => {
  console.log("\nCall Request");
  console.log("-".repeat(30));

  const id = await askQuestion("Enter Request ID: ");

  if (!id) {
    console.log("ID is required!");
    return;
  }

  try {
    const request = await ReqModel.findById(id);

    if (!request) {
      console.log("Request not found!");
      return;
    }

    const headers = Object.fromEntries(
      request.req_headers.map((item) => [item.key, item.value]),
    );

    const params = Object.fromEntries(
      request.req_query.map((item) => [item.key, item.value]),
    );

    console.log(`\nCalling ${request.req_method} ${request.req_url}`);

    const startTime = Date.now();

    const response = await axios({
      method: request.req_method,
      url: request.req_url,
      headers,
      params,
      data: request.req_body || undefined,
      validateStatus: () => true,
    });

    const responseTime = Date.now() - startTime;

    console.log("\n" + "=".repeat(50));
    console.log("RESPONSE");
    console.log("=".repeat(50));

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Response Time: ${responseTime} ms`);

    console.log("\nHeaders:");
    console.log(JSON.stringify(response.headers, null, 2));

    console.log("\nBody:");
    console.log(
      typeof response.data === "object"
        ? JSON.stringify(response.data, null, 2)
        : response.data,
    );

    console.log("=".repeat(50));
  } catch (error) {
    console.error("\nRequest failed:", error.message);
  }
};

// Display menu
const showMenu = () => {
  console.log("\n" + "=".repeat(50));
  console.log("REQUEST MANAGEMENT SYSTEM");
  console.log("=".repeat(50));
  console.log("1. Create New Request");
  console.log("2.  View All Requests");
  console.log("3.  View Single Request");
  console.log("4.  Call request");
  console.log("5.  Update Request");
  console.log("6.  Delete Request");
  console.log("7.  Seed Dummy Data");
  console.log("8.  Exit");
  console.log("=".repeat(50));
};

// CREATE
const createRequest = async () => {
  console.log("\nCreate New Request");
  console.log("-".repeat(30));

  const title =
    (await askQuestion("Title (default: new request): ")) || "new request";
  const url = await askQuestion("URL (required): ");
  if (!url) {
    console.log("URL is required!");
    return;
  }

  const method = await askQuestion("Method (GET/POST/PUT/DELETE/PATCH): ");
  if (
    !["GET", "POST", "PUT", "DELETE", "PATCH"].includes(method.toUpperCase())
  ) {
    console.log("Invalid method!");
    return;
  }

  const headersInput = await askQuestion(
    "Headers (key:value, comma separated, e.g., Auth:token,Content-Type:json): ",
  );
  const headers = headersInput
    ? headersInput.split(",").map((h) => {
        const [key, value] = h.split(":");
        return { key: key.trim(), value: value.trim() };
      })
    : [];

  const queryInput = await askQuestion(
    "Query params (key:value, comma separated): ",
  );
  const query = queryInput
    ? queryInput.split(",").map((q) => {
        const [key, value] = q.split(":");
        return { key: key.trim(), value: value.trim() };
      })
    : [];

  const body = await askQuestion("Body (JSON string or empty): ");

  try {
    const newRequest = new ReqModel({
      req_title: title,
      req_url: url,
      req_method: method.toUpperCase(),
      req_headers: headers,
      req_query: query,
      req_body: body || "",
    });

    const saved = await newRequest.save();
    console.log(`Request created successfully! (ID: ${saved._id})`);
  } catch (error) {
    console.error("Error creating request:", error.message);
  }
};

// READ ALL
const viewAllRequests = async () => {
  console.log("\nAll Requests");
  console.log("-".repeat(30));

  try {
    const requests = await ReqModel.find();
    if (requests.length === 0) {
      console.log("No requests found!");
      return;
    }

    console.log(`Total: ${requests.length} requests\n`);
    requests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.req_title}`);
      console.log(`   Method: ${req.req_method} | URL: ${req.req_url}`);
      console.log(`   ID: ${req._id}`);
      console.log(
        `   Headers: ${req.req_headers.length} | Query: ${req.req_query.length}`,
      );
      console.log("-".repeat(30));
    });
  } catch (error) {
    console.error("Error fetching requests:", error.message);
  }
};

// READ ONE
const viewSingleRequest = async () => {
  console.log("\nView Single Request");
  console.log("-".repeat(30));

  const id = await askQuestion("Enter Request ID: ");
  if (!id) {
    console.log("ID is required!");
    return;
  }

  try {
    const request = await ReqModel.findById(id);
    if (!request) {
      console.log("Request not found!");
      return;
    }

    console.log("\nRequest Details:");
    console.log("=".repeat(40));
    console.log(`ID: ${request._id}`);
    console.log(`Title: ${request.req_title}`);
    console.log(`URL: ${request.req_url}`);
    console.log(`Method: ${request.req_method}`);
    console.log(`Headers: ${JSON.stringify(request.req_headers, null, 2)}`);
    console.log(`Query: ${JSON.stringify(request.req_query, null, 2)}`);
    console.log(`Body: ${request.req_body || "(empty)"}`);
    console.log("=".repeat(40));
  } catch (error) {
    console.error("Error fetching request:", error.message);
  }
};

// UPDATE
const updateRequest = async () => {
  console.log("\n Upd✏️  ate Request");
  console.log("-".repeat(30));

  const id = await askQuestion("Enter Request ID to update: ");
  if (!id) {
    console.log("ID is required!");
    return;
  }

  try {
    const existing = await ReqModel.findById(id);
    if (!existing) {
      console.log("Request not found!");
      return;
    }

    console.log("\n Leave empty to keep current value");
    console.log(`Current title: ${existing.req_title}`);
    const title = (await askQuestion("New title: ")) || existing.req_title;

    console.log(`Current URL: ${existing.req_url}`);
    const url = (await askQuestion("New URL: ")) || existing.req_url;

    console.log(`Current method: ${existing.req_method}`);
    const method =
      (await askQuestion("New method (GET/POST/PUT/DELETE/PATCH): ")) ||
      existing.req_method;

    const headersInput = await askQuestion(
      `Current headers: ${JSON.stringify(existing.req_headers)}\nNew headers (key:value, comma separated): `,
    );
    const headers = headersInput
      ? headersInput.split(",").map((h) => {
          const [key, value] = h.split(":");
          return { key: key.trim(), value: value.trim() };
        })
      : existing.req_headers;

    const queryInput = await askQuestion(
      `Current query: ${JSON.stringify(existing.req_query)}\nNew query (key:value, comma separated): `,
    );
    const query = queryInput
      ? queryInput.split(",").map((q) => {
          const [key, value] = q.split(":");
          return { key: key.trim(), value: value.trim() };
        })
      : existing.req_query;

    console.log(`Current body: ${existing.req_body || "(empty)"}`);
    const body =
      (await askQuestion("New body (JSON string): ")) || existing.req_body;

    const updated = await ReqModel.findByIdAndUpdate(
      id,
      {
        req_title: title,
        req_url: url,
        req_method: method.toUpperCase(),
        req_headers: headers,
        req_query: query,
        req_body: body,
      },
      { new: true, runValidators: true },
    );

    console.log(`Request updated successfully!`);
    console.log(`New title: ${updated.req_title}`);
  } catch (error) {
    console.error("Error updating request:", error.message);
  }
};

// DELETE
const deleteRequest = async () => {
  console.log("\n Delete Request");
  console.log("-".repeat(30));

  const id = await askQuestion("Enter Request ID to delete: ");
  if (!id) {
    console.log("ID is required!");
    return;
  }

  try {
    const request = await ReqModel.findById(id);
    if (!request) {
      console.log("Request not found!");
      return;
    }

    console.log(`\n Are you sure you want to delete: "${request.req_title}"?`);
    const confirm = await askQuestion("Type 'yes' to confirm: ");

    if (confirm.toLowerCase() === "yes") {
      await ReqModel.findByIdAndDelete(id);
      console.log("Request deleted successfully!");
    } else {
      console.log("Deletion cancelled!");
    }
  } catch (error) {
    console.error("Error deleting request:", error.message);
  }
};

// SEED DATA
const seedData = async () => {
  console.log("\n Seeding Dummy Data");
  console.log("-".repeat(30));

  const dummyRequests = [
    {
      req_title: "Get All Users",
      req_url: "https://jsonplaceholder.typicode.com/users",
      req_method: "GET",
      req_headers: [],
      req_query: [],
      req_body: "",
    },
    {
      req_title: "Get User By ID",
      req_url: "https://jsonplaceholder.typicode.com/users/1",
      req_method: "GET",
      req_headers: [],
      req_query: [],
      req_body: "",
    },
    {
      req_title: "Get Users With Query",
      req_url: "https://jsonplaceholder.typicode.com/users",
      req_method: "GET",
      req_headers: [],
      req_query: [{ key: "_limit", value: "3" }],
      req_body: "",
    },

    {
      req_title: "Get Users List",
      req_url: "https://api.example.com/users",
      req_method: "GET",
      req_headers: [
        { key: "Authorization", value: "Bearer token123" },
        { key: "Content-Type", value: "application/json" },
      ],
      req_query: [
        { key: "page", value: "1" },
        { key: "limit", value: "10" },
      ],
      req_body: "",
    },
    {
      req_title: "Create New User",
      req_url: "https://api.example.com/users",
      req_method: "POST",
      req_headers: [
        { key: "Authorization", value: "Bearer token123" },
        { key: "Content-Type", value: "application/json" },
      ],
      req_query: [],
      req_body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        age: 30,
      }),
    },
    {
      req_title: "Update User Details",
      req_url: "https://api.example.com/users/123",
      req_method: "PUT",
      req_headers: [
        { key: "Authorization", value: "Bearer token123" },
        { key: "Content-Type", value: "application/json" },
      ],
      req_query: [],
      req_body: JSON.stringify({
        name: "Jane Doe",
        age: 31,
      }),
    },
    {
      req_title: "Delete User",
      req_url: "https://api.example.com/users/123",
      req_method: "DELETE",
      req_headers: [{ key: "Authorization", value: "Bearer token123" }],
      req_query: [],
      req_body: "",
    }, 
    {
      req_title: "Search Products",
      req_url: "https://api.example.com/products",
      req_method: "GET",
      req_headers: [
        { key: "Authorization", value: "Bearer token123" },
        { key: "Accept", value: "application/json" },
      ],
      req_query: [
        { key: "keyword", value: "laptop" },
        { key: "category", value: "electronics" },
        { key: "sort", value: "price" },
      ],
      req_body: "",
    },
  ];

  try {
    await ReqModel.deleteMany({});
    console.log("Cleared existing requests");

    const inserted = await ReqModel.insertMany(dummyRequests);
    console.log(`${inserted.length} requests inserted successfully!`);

    console.log("\nInserted requests:");
    inserted.forEach((req, index) => {
      console.log(`${index + 1}. ${req.req_title} (${req.req_method})`);
    });
  } catch (error) {
    console.error("Error seeding data:", error.message);
  }
};

// Main program
const main = async () => {
  const connected = await connectDB();
  if (!connected) {
    rl.close();
    return;
  }

  let exit = false;

  while (!exit) {
    showMenu();
    const choice = await askQuestion("\n Enter your choice (1-7): ");

    switch (choice) {
      case "1":
        await createRequest();
        break;
      case "2":
        await viewAllRequests();
        break;
      case "3":
        await viewSingleRequest();
        break;
      case "4":
        await runRequest();
        break;
      case "5":
        await updateRequest();
        break;
      case "6":
        await deleteRequest();
        break;
      case "7":
        await seedData();
        break;
      case "8":
        console.log("\n exit!");
        exit = true;
        break;
      default:
        console.log("Invalid choice! Please enter 1-7");
    }

    if (!exit) {
      await askQuestion("\nPress Enter to continue...");
    }
  }

  await mongoose.connection.close();
  rl.close();
};

// Run the program
main().catch((error) => {
  console.error("Error:", error);
  rl.close();
});
