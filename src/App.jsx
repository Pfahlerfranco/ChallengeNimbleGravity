import { useState } from "react";
import { getCandidateByEmail } from "./services/api";
import JobList from "./components/JobList";
import Squares from "./components/Squares";
import SplitText from "./components/SplitText";

export default function App() {
  const [email, setEmail] = useState("");
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [started, setStarted] = useState(false);

  const sanitizedEmail = email.trim();

  const isValidEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail);

  const handleSearch = async () => {
    if (!sanitizedEmail) {
      setError("Email is required");
      return;
    }

    if (!isValidEmail) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);
    setCandidate(null);

    try {
      const data = await getCandidateByEmail(sanitizedEmail);
      setCandidate(data);
    } catch (err) {
      if (err.status === 404) {
        setError("Email not found");
      } else {
        setError(err?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading && isValidEmail) {
      handleSearch();
    }
  };

  return (
    <>
      <div className="fixed inset-0 -z-20">
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#321a5b"
          hoverFillColor="#222222"
        />
      </div>

      <div className="fixed inset-0 bg-black/75 -z-10" />

      <div className="relative min-h-screen text-white flex items-center justify-center p-8">
        {!started && (
          <div className="relative w-full h-screen flex items-center justify-center">
            <SplitText
              text="Nimble Gravity Challenge"
              tag="h1"
              enableScrollTrigger={false}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white/90 text-center leading-tight px-4"
            />

            <button
              onClick={() => setStarted(true)}
              className="absolute bottom-16 left-1/2 -translate-x-1/2 px-10 py-3 
                         bg-gray-600 hover:bg-gray-700 transition 
                         rounded-lg text-lg focus:outline-none 
                         focus:ring-2 focus:ring-gray-400"
              aria-label="Start challenge"
              type="button"
            >
              Enter
            </button>
          </div>
        )}

        {started && (
          <div
            className="w-full max-w-2xl text-center 
                       animate-fadeIn transition-all 
                       duration-500 ease-out"
          >
            <h1 className="text-4xl font-bold mb-4">Find Your Position</h1>

            <p className="text-gray-400 mb-8">
              Enter your email to retrieve your candidate information
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value.trimStart());
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyDown}
                required
                className="flex-1 px-4 py-2 rounded bg-gray-800 border border-gray-700 
                           text-white focus:outline-none focus:ring-2 
                           focus:ring-gray-500"
                aria-label="Candidate email"
              />

              <button
                onClick={handleSearch}
                disabled={loading || !isValidEmail}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 
                           disabled:opacity-50 transition rounded-lg 
                           focus:outline-none focus:ring-2 
                           focus:ring-gray-400"
                aria-label="Search candidate by email"
                type="button"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>

            {error && (
              <p className="text-red-400 mb-6" role="alert">
                {error}
              </p>
            )}

            {candidate && (
              <div
                className="bg-gray-800/90 backdrop-blur p-6 
                           rounded-lg mb-8 shadow-lg text-left 
                           animate-fadeIn transition-all 
                           duration-500 ease-out"
              >
                <h2 className="text-2xl font-semibold mb-3">
                  Candidate Information
                </h2>

                <p>
                  <strong>Name:</strong> {candidate.firstName}{" "}
                  {candidate.lastName}
                </p>

                <p>
                  <strong>Email:</strong> {candidate.email}
                </p>

                <p className="text-gray-400 text-sm mt-2">
                  UUID: {candidate.uuid}
                </p>

                <JobList candidate={candidate} />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}