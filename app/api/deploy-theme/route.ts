import { NextResponse } from "next/server";

export async function POST() {
  const vercelToken = process.env.NEXT_PUBLIC_VERCEL_TOKEN;

  const deploymentPayload = {
    name: "webtemplify-deployment",
    gitSource: {
      type: "github",
      repo: "Joshevskicode/web_templify",
      ref: "main",
      repoId: 865908307,  // This is your repoId
    },
    target: "production",
    projectSettings: {
      buildCommand: "npm run build",  // Build command for Next.js
      outputDirectory: ".next",  // The default Next.js build output directory
      framework: "nextjs",  // Specify that the project is using Next.js
    },
  };

  try {
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
      console.log("Error Data:", errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const deploymentData = await response.json();
    return NextResponse.json({ url: deploymentData.url }, { status: 200 });

  } catch (error) {
    console.error("Error while deploying:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
