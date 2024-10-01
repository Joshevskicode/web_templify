// app/auth/signin/page.tsx

'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function SignIn() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    setLoading(true);

    const result = await signIn('credentials', {
      redirect: true,
      username,
      password,
      callbackUrl: '/',
    });

    if (result?.error) {
      alert('Error: ' + result.error);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Sign In to WebTemplify</h1>
      <form onSubmit={handleSignIn}>
        <label>
          Username:
          <input name="username" type="text" required />
        </label>
        <br />
        <label>
          Password:
          <input name="password" type="password" required />
        </label>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
