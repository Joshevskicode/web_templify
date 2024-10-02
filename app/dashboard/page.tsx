'use client';
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import React, { Suspense } from "react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const url = searchParams.get("url");

  // Ensure the url is valid and is a string, otherwise provide a fallback or handle undefined
  const validUrl = typeof url === "string" ? url : "/fallback-url";

  return (
    <div className="container">
      <div className="card">
        <h1 className="heading">🎉 Congratulations! 🎉</h1>
        <p className="text">Your theme has been successfully deployed.</p>
        <p className="text">
          <strong>Project ID:</strong> {projectId}
        </p>
        <p className="text">
          <strong>URL:</strong>{" "}
          <Link href={validUrl} target="_blank" rel="noopener noreferrer" className="link">
            {validUrl}
          </Link>
        </p>
        <p className="text">Feel free to manage your theme in the Admin Panel.</p>
        <Link
          href="https://admin-panel-nu-two.vercel.app/"
          className="button"
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to Admin Panel
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
