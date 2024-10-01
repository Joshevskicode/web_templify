import { NextResponse } from "next/server";

export async function POST(req: any) {
  const vercelToken = process.env.NEXT_PUBLIC_VERCEL_TOKEN;
  console.log("Vercel Token:", vercelToken); // Log the token to check if it's available

  const { username, template } = await req.json(); // Get the template and username from the request

  let repoName;
  let repoId;

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

  try {
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
      console.log("Deployment Error:", errorData); // Log the API error
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const deploymentData = await response.json();
    console.log("Alias:", deploymentData.alias[0]);

    // Adding CORS headers to the response
    const responseWithCORS = NextResponse.json({ url: deploymentData.url }, { status: 200 });
    responseWithCORS.headers.set('Access-Control-Allow-Origin', '*');
    responseWithCORS.headers.set('Access-Control-Allow-Methods', 'POST');
    responseWithCORS.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return responseWithCORS;
  } catch (error) {
    console.log("Internal Server Error:", error); // Log internal server error
    const errorResponse = NextResponse.json({ error: "Internal Server Error" }, { status: 500 });

    // Add CORS headers to the error response as well
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    errorResponse.headers.set('Access-Control-Allow-Methods', 'POST');
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return errorResponse;
  }
}
