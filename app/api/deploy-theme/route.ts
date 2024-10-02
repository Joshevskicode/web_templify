import { NextResponse } from "next/server";

export async function POST(req: any) {
  const vercelToken = process.env.NEXT_PUBLIC_VERCEL_TOKEN;

  try {
    const { template } = await req.json();

    if (!template || typeof template !== 'string') {
      return NextResponse.json({ error: "Invalid or missing 'template'" }, { status: 400 });
    }

    let repoName: string;
    let repoId: number;

    if (template === "restaurant_template") {
      repoName = "Joshevskicode/restaurant_template";
      repoId = 865978617;
    } else {
      repoName = "Joshevskicode/web_templify";
      repoId = 865908307;
    }

    const sanitizedTemplate = template.replace(/[^a-z0-9._-]/g, '-').slice(0, 100);

    const uniqueDeploymentName = `${sanitizedTemplate}-deployment-${Date.now()}`;

    // MongoDB URI you want to inject into every deployment
    const mongoDbUri = process.env.NEXT_PUBLIC_MONGODB_URI || "your-fallback-mongodb-uri"; // Use the environment variable or a fallback URI

    const deploymentPayload = {
        name: uniqueDeploymentName,
        gitSource: {
          type: "github",
          repo: repoName,
          ref: "main",
          repoId: repoId,
        },
        target: "production",
        projectSettings: {
          buildCommand: "MONGODB_URI=mongodb+srv://admin:Forsafi4o.@cluster0.1oopa.mongodb.net/ npm run build", // Inject MongoDB URI into the build command
          outputDirectory: ".next",
          framework: "nextjs",
        },
        env: {
          MONGODB_URI: mongoDbUri, // Set MongoDB URI for runtime
        }
      };
      

    const response = await fetch(`https://api.vercel.com/v13/deployments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deploymentPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const deploymentData = await response.json();
    console.log("Deployment Successful:", deploymentData);

    // Return the full deployment data, not just the URL
    return NextResponse.json(deploymentData, { status: 200 });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
