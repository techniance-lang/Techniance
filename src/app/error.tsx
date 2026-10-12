"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <div className="text-6xl">🐛</div>
        <h1 className="mt-4 text-2xl font-black">Something went wrong</h1>
        <p className="mt-2 font-semibold text-muted">A bug slipped through. Try again?</p>
        <button onClick={reset} className="btn mt-6">Try again</button>
      </div>
    </div>
  );
}
