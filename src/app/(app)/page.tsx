export default function WelcomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-3xl mx-auto text-center bg-white/60 backdrop-blur-lg p-8 rounded-lg shadow-md">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Welcome to Ingredient Imposter
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-900">
          Replace ingredients in recipes with other ingredients.
        </p>
      </div>
    </div>
  );
} 