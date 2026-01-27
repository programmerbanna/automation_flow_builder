import dotenv from "dotenv";
import app from "./app";
import connectDB from "./config/db";
import mongoose from "mongoose";
import stringWidth from "string-width";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Helper function to create startup banner
const displayStartupBanner = (dbStatus: string) => {
  const baseUrl = `http://localhost:${PORT}`;

  const lines = [
    "🚀 Backend Server Running",
    `📍 Environment: ${NODE_ENV}`,
    `💾 Database: ${dbStatus}`,
    `🌐 URL: ${baseUrl}`,
    `📡 API: ${baseUrl}/api/`,
  ];

  const padding = 2;
  const maxWidth = Math.max(...lines.map((l) => stringWidth(l)));
  const totalWidth = maxWidth + padding * 2;

  console.log(`\n╔${"═".repeat(totalWidth)}╗`);

  for (const line of lines) {
    const leftPad = " ".repeat(padding);
    const lineWidth = stringWidth(line);
    const rightPad = " ".repeat(totalWidth - lineWidth - padding);
    console.log(`║${leftPad}${line}${rightPad}║`);
  }

  console.log(`╚${"═".repeat(totalWidth)}╝\n`);
};

// Bootstrap function
const bootstrap = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Check database connection status
    let dbStatus = "✅ Connected";
    try {
      if (mongoose.connection.readyState === 1) {
        dbStatus = "✅ Connected";
      } else {
        dbStatus = "❌ Disconnected";
      }
    } catch (error) {
      dbStatus = "❌ Disconnected";
    }

    // Start server
    const server = app.listen(PORT, () => {
      displayStartupBanner(dbStatus);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err: Error) => {
      console.error(`❌ Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

    // Handle SIGTERM
    process.on("SIGTERM", () => {
      console.log("⚠️  SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        console.log("✅ Process terminated");
      });
    });

    // Handle SIGINT (Ctrl+C)
    process.on("SIGINT", () => {
      console.log("\n⚠️  SIGINT received. Shutting down gracefully...");
      server.close(() => {
        mongoose.connection.close();
        console.log("✅ Process terminated");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    process.exit(1);
  }
};

// Start the application
bootstrap();
