'use client';
import { useSession, signIn } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);

  const handleBuyTheme = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/deploy-theme", {
        method: "POST",
        body: JSON.stringify({
          username: session?.user?.name || "anonymous",  // Pass the user's name or a fallback
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        const deploymentUrl = `https://${data.url}`;  // Use the full Vercel URL
        setDeployedUrl(deploymentUrl);  // Set the deployed theme URL
        alert(`Your theme has been deployed at ${deploymentUrl}`);
      } else {
        alert("Failed to deploy the theme");
      }
    } catch (error) {
      alert("An error occurred during deployment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Welcome to WebTemplify!</h1>
      <p>Get started by purchasing a theme. After your purchase, the theme will be automatically deployed for free!</p>

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
          {loading && <p>Deployment in progress... This usually takes about 1-2 minutes.</p>}

          {deployedUrl ? (
            <p>
              Theme deployed at:{" "}
              <a href={deployedUrl} target="_blank" rel="noopener noreferrer">
                {deployedUrl}
              </a>
            </p>
          ) : (
            <button
              onClick={handleBuyTheme}
              disabled={loading}
              style={{
                padding: '1rem 2rem',
                backgroundColor: loading ? '#cccccc' : '#28a745',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '8px',
                fontSize: '16px',
              }}
            >
              {loading ? 'Deploying Theme...' : 'Buy Theme'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
