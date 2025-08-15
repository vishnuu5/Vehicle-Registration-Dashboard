import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function GET() {
  return new Promise((resolve) => {
    const pythonScriptPath = path.join(
      process.cwd(),
      "..",
      "backend",
      "process_data.py"
    );
    console.log(`Attempting to execute Python script at: ${pythonScriptPath}`);

    const pythonProcess = spawn("python", [pythonScriptPath]);

    let data = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (chunk) => {
      data += chunk.toString();
      console.log("Python stdout chunk:", chunk.toString());
    });

    pythonProcess.stderr.on("data", (chunk) => {
      errorOutput += chunk.toString();
      console.error("Python stderr chunk:", chunk.toString());
    });

    pythonProcess.on("close", (code) => {
      if (errorOutput) {
        console.error(
          `Python script exited with code ${code} but had stderr output: ${errorOutput}`
        );
        return resolve(
          NextResponse.json(
            { error: "Python script error", details: errorOutput },
            { status: 500 }
          )
        );
      }

      if (code !== 0) {
        console.error(
          `Python script exited with non-zero code ${code}: ${errorOutput}`
        );
        return resolve(
          NextResponse.json(
            { error: "Failed to process data", details: errorOutput },
            { status: 500 }
          )
        );
      }

      if (!data.trim() || !data.trim().startsWith("{")) {
        console.error(
          "Python script did not output valid JSON to stdout:",
          data
        );
        return resolve(
          NextResponse.json(
            {
              error: "Python script output was not valid JSON",
              pythonOutput: data.trim(),
            },
            { status: 500 }
          )
        );
      }

      try {
        const processedData = JSON.parse(data);
        resolve(NextResponse.json(processedData));
      } catch (e: any) {
        console.error("Failed to parse Python script output:", e);
        resolve(
          NextResponse.json(
            {
              error: "Failed to parse data",
              details: e.message,
              pythonOutput: data.trim(),
            },
            { status: 500 }
          )
        );
      }
    });

    pythonProcess.on("error", (err) => {
      console.error("Failed to start Python process:", err);
      resolve(
        NextResponse.json(
          { error: "Failed to start Python process", details: err.message },
          { status: 500 }
        )
      );
    });
  });
}
