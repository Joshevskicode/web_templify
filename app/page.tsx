'use client';
import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Import the router

export default function Home() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [deployStatus, setDeployStatus] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const router = useRouter(); // Initialize router

  const startTimer = () => {
    setElapsedTime(0);
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  function modifyUrl(url: string) {
    const lastDashIndex = url.lastIndexOf('-');
    const vercelIndex = url.lastIndexOf('.vercel');
    if (lastDashIndex !== -1 && vercelIndex !== -1) {
      return url.slice(0, lastDashIndex) + url.slice(vercelIndex);
    }
    return url;
  }

  const pollDeploymentStatus = async (deploymentId: string, startTime: number) => {
    let readyState = "building";
    setDeployStatus("building");
    startTimer();

    let attempts = 0;
    const maxAttempts = 15;

    while (readyState !== "READY" && readyState !== "ERROR" && attempts < maxAttempts) {
      const res = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_TOKEN}`,
        },
      });

      const data = await res.json();
      readyState = data.readyState;

      if (readyState === "READY") {
        setDeployStatus("done");

        const modifiedDeploymentUrl = modifyUrl(`https://${data.url}`);
        setDeployedUrl(modifiedDeploymentUrl);

        stopTimer();
        setLoading(false);

        return { status: "done", url: modifiedDeploymentUrl, deploymentId };
      } else if (readyState === "ERROR") {
        setDeployStatus("error");
        stopTimer();
        setLoading(false);
        alert("Deployment failed.");
        return { status: "error" };
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    if (attempts >= maxAttempts) {
      alert("Deployment is taking longer than expected.");
      return { status: "timeout" };
    }

    return { status: readyState };
  };

  const handleBuyRestaurantTheme = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      const response = await fetch("/api/deploy-theme", {
        method: "POST",
        body: JSON.stringify({
          username: "anonymous",
          template: "restaurant_template",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        const projectId = data?.project?.id;
        setProjectId(projectId);
        const deploymentId = data.url.split("/").pop();

        const deploymentResult = await pollDeploymentStatus(deploymentId, startTime);

        if (deploymentResult.status === "done" && deploymentResult.url && deploymentResult.deploymentId) {
          const userResponse = await fetch("/api/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              acc: "anonymous",
              pass: "securepassword123",
              projectId: projectId || deploymentResult.deploymentId,
              url: deploymentResult.url,
            }),
          });

          const userData = await userResponse.json();
          if (userResponse.ok) {
            console.log("User created successfully:", userData);

            // Navigate to the dashboard after successful deployment
            router.push(`/dashboard?projectId=${projectId}&url=${deploymentResult.url}`);
          } else {
            console.error("Failed to create user:", userData.error);
            alert("User creation failed. Please try again.");
          }
        }
      } else {
        console.error("Failed to deploy the restaurant theme:", data);
        alert("Failed to deploy the restaurant theme");
        setLoading(false);
      }
    } catch (error) {
      console.error("An error occurred during deployment:", error);
      alert("An error occurred during deployment.");
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1>Welcome to WebTemplify!</h1>
      <p>Select the restaurant theme to purchase. It will automatically be deployed for free!</p>

      {status === "loading" && <p>Loading...</p>}

      {status === "unauthenticated" && (
        <button
          onClick={() => signIn()}
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '8px',
            fontSize: '16px',
          }}
        >
          Sign In to Buy Theme
        </button>
      )}

      {session && (
        <div>
          {loading && deployStatus !== "done" && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #3498db',
                  borderRadius: '50%',
                  animation: 'spin 2s linear infinite',
                }}
              ></div>
              <p>Deployment in progress... {elapsedTime} seconds</p>
            </div>
          )}

          {deployedUrl ? (
            <div>
              <p>
                Theme deployed at:{" "}
                <a href={deployedUrl} target="_blank" rel="noopener noreferrer">
                  {deployedUrl}
                </a>
              </p>
              <p style={{ color: 'green' }}>Deployment Status: Done ✅</p>
            </div>
          ) : (
            <div>
              <button
                onClick={handleBuyRestaurantTheme}
                disabled={loading}
                style={{
                  padding: '1rem 2rem',
                  backgroundColor: loading ? '#cccccc' : '#f39c12',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  fontSize: '16px',
                }}
              >
                {loading ? 'Deploying Restaurant Theme...' : 'Buy Restaurant Theme'}
              </button>
              {deployStatus === "building" && <p style={{ color: 'orange' }}>Deployment Status: Building... 🛠️</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
