"use client";

export default function LoginPage() {
  const handleSteamLogin = () => {
    window.location.href = "http://localhost:8000/api/auth/steam/login";
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-black flex-col gap-8">
      <h1 className="text-white text-3xl font-bold">Login to GameLib.Ai</h1>
      <button
        onClick={handleSteamLogin}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Sign in with Steam
      </button>
    </main>
  );
}
