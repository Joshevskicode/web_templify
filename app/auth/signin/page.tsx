'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State to manage errors

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    setLoading(true);
    setError(null); // Reset error state

    const result = await signIn('credentials', {
      redirect: false, // No immediate redirect to handle errors
      username,
      password,
      callbackUrl: '/',
    });

    if (result?.error) {
      setError(result.error); // Set error state if sign-in fails
      setLoading(false);
    } else {
      window.location.href = result?.url || '/'; // Redirect on successful sign-in
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Sign In to WebTemplify</h1>

      {error && (
        <div style={styles.error}>
          <strong>Error: </strong>{error}
        </div>
      )}

      <form onSubmit={handleSignIn} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="username" style={styles.label}>Username:</label>
          <input id="username" name="username" type="text" required style={styles.input} />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="password" style={styles.label}>Password:</label>
          <input id="password" name="password" type="password" required style={styles.input} />
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

// Simple styles for the component
const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '400px',
    margin: 'auto',
    textAlign: 'center' as 'center',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  header: {
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
    color: '#333',
  },
  error: {
    backgroundColor: '#fdd',
    color: '#900',
    padding: '0.5rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as 'column',
  },
  inputGroup: {
    marginBottom: '1rem',
    textAlign: 'left' as 'left',
  },
  label: {
    marginBottom: '0.5rem',
    fontSize: '1rem',
    fontWeight: 'bold' as 'bold',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  button: {
    padding: '0.75rem',
    fontSize: '1rem',
    fontWeight: 'bold' as 'bold',
    color: '#fff',
    backgroundColor: '#0070f3',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginTop: '1rem',
  },
};
