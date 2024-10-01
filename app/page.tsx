'use client';
import { useSession, signIn } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [deployStatus, setDeployStatus] = useState<string | null>(null); // Store deployment status
  const [elapsedTime, setElapsedTime] = useState<number>(0); // Store the elapsed time
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null); // Timer

  // Function to start the timer
  const startTimer = () => {
    setElapsedTime(0);
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000); // Increment the elapsed time every second
    setTimerInterval(interval);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  // Polling function to check deployment status
  const pollDeploymentStatus = async (deploymentId: string, startTime: number) => {
    let readyState = "building";
    setDeployStatus("building");
    startTimer(); // Start the timer

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
        setDeployedUrl(`https://${data.url}`);
        stopTimer(); // Stop the timer when deployment is done
        setLoading(false); // Set loading to false
        break;
      } else if (readyState === "ERROR") {
        setDeployStatus("error");
        stopTimer();
        setLoading(false); // Set loading to false
        alert("Deployment failed.");
        break;
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    if (attempts >= maxAttempts) {
      alert("Deployment is taking longer than expected.");
    }
  };

  const handleBuyRestaurantTheme = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      const response = await fetch("/api/deploy-theme", {
        method: "POST",
        body: JSON.stringify({
          username: session?.user?.name || "anonymous", // Username or fallback
          template: "restaurant_template", // Only the restaurant template
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        const deploymentId = data.url.split("/").pop();
        await pollDeploymentStatus(deploymentId, startTime);
      } else {
        alert("Failed to deploy the restaurant theme");
        setLoading(false);
      }
    } catch (error) {
      alert("An error occurred during deployment.");
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
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
          {/* Only show the deployment progress if deployment is in progress */}
          {loading && deployStatus !== "done" && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              {deployStatus === "done" && <p style={{ color: 'green' }}>Deployment Status: Done ✅</p>}
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

