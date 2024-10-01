import { NextResponse } from "next/server";

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(req: any) {
  const response = NextResponse.json({}, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function POST(req: any) {
  const vercelToken = process.env.NEXT_PUBLIC_VERCEL_TOKEN;
  console.log("Vercel Token:", vercelToken); // Log the token to check if it's available

  try {
    const { username, template } = await req.json(); // Get the template and username from the request

    // Validate the request payload
    if (!username || typeof username !== 'string') {
      console.error("Invalid or missing 'username'");
      return NextResponse.json({ error: "Invalid or missing 'username'" }, { status: 400 });
    }

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

    // Generate a unique deployment name using username and a timestamp
    const uniqueDeploymentName = `${template}-deployment-${username}-${Date.now()}`;

    const deploymentPayload = {
      name: uniqueDeploymentName, // Use the unique name for deployment
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
      console.error("Deployment Error:", errorData); // Log the API error
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
