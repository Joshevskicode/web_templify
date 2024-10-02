import { NextResponse } from "next/server";

function sanitizeName(name: string) {
  // Replace any invalid characters with a dash and remove forbidden sequences like '---'
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-') // Replace any character that's not a letter, digit, '.', '_', or '-'
    .replace(/-{2,}/g, '-') // Replace multiple dashes with a single dash
    .replace(/\.+/g, '.') // Replace multiple dots with a single dot
    .replace(/^-|-$/g, '') // Remove leading or trailing dashes
    .slice(0, 100); // Ensure the name is up to 100 characters long
}

export async function POST(req: any) {
  const vercelToken = process.env.NEXT_PUBLIC_VERCEL_TOKEN;
  console.log("Vercel Token:", vercelToken); // Log the token to check if it's available

  try {
    const { template } = await req.json(); // Get the template from the request

    // Validate the request payload
    if (!template || typeof template !== 'string') {
      console.error("Invalid or missing 'template'");
      return NextResponse.json({ error: "Invalid or missing 'template'" }, { status: 400 });
    }

    let repoName: string;
    let repoId: number;

    if (template === "restaurant_template") {
      // Use the restaurant template repo and ID
      repoName = "Joshevskicode/restaurant_template";
      repoId = 865978617; // This is your restaurant template repoId
    } else {
      // Default to sales page repo
      repoName = "Joshevskicode/web_templify";
      repoId = 865908307; // Existing web_templify repoId
    }

    // Sanitize the template name only
    const sanitizedTemplate = sanitizeName(template);

    // Generate a unique deployment name using only the template and current timestamp
    const uniqueDeploymentName = `${sanitizedTemplate}-deployment-${Date.now()}`;

    const deploymentPayload = {
      name: uniqueDeploymentName, // Use the sanitized unique name for deployment
      gitSource: {
        type: "github",
        repo: repoName,
        ref: "main",
        repoId: repoId, // Use the correct repoId
      },
      target: "production",
      projectSettings: {
        buildCommand: "npm run build", // Build command for Next.js
        outputDirectory: ".next", // The default Next.js build output directory
        framework: "nextjs", // Specify that the project is using Next.js
      },
    };

    // Make the POST request to Vercel's deployments API
    const response = await fetch(`https://api.vercel.com/v13/deployments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`, // Ensure proper token is passed
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deploymentPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Deployment Error Details:", errorData); // Log the API error
      const errorResponse = NextResponse.json({ error: errorData }, { status: response.status });

      // Adding CORS headers to the error response
      errorResponse.headers.set('Access-Control-Allow-Origin', '*');
      errorResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return errorResponse;
    }

    const deploymentData = await response.json();
    console.log("Deployment Successful:", deploymentData);

    // Adding CORS headers to the successful response
    const responseWithCORS = NextResponse.json({ url: deploymentData.url }, { status: 200 });
    responseWithCORS.headers.set('Access-Control-Allow-Origin', '*');
    responseWithCORS.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    responseWithCORS.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return responseWithCORS;
  } catch (error) {
    console.error("Internal Server Error:", error); // Log internal server error
    const errorResponse = NextResponse.json({ error: "Internal Server Error" }, { status: 500 });

    // Add CORS headers to the error response as well
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    errorResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return errorResponse;
  }
}
