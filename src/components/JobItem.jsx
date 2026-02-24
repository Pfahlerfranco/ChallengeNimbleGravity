import { useState } from "react";
import { applyToJob } from "../services/api";

export default function JobItem({ job, candidate }) {
  const [showInput, setShowInput] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleApply = async () => {
    if (!repoUrl) {
      setError("Repository URL is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await applyToJob({
        uuid: candidate.uuid,
        jobId: job.id,
        candidateId: candidate.id,
        repoUrl,
      });

      setSuccess(true);
      setShowInput(false);
    } catch (err) {
      setError(err.message || "Error submitting application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-gray-900/80 backdrop-blur border border-gray-700 
                 p-5 rounded-xl shadow-md transition-all duration-300 
                 hover:scale-[1.02] hover:border-gray-500"
    >
      <h3 className="text-lg font-semibold text-white">
        {job.title}
      </h3>

      {!showInput && !success && (
        <button
          onClick={() => setShowInput(true)}
          className="mt-4 w-full bg-gray-600 hover:bg-gray-700 
                     transition rounded-lg py-2 text-sm"
        >
          Submit GitHub Repository
        </button>
      )}

      {showInput && !success && (
        <div className="mt-4 space-y-3">
          <input
            type="url"
            placeholder="https://github.com/your-repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 
                       text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
          />

          <button
            onClick={handleApply}
            disabled={loading}
            className="w-full bg-gray-600 hover:bg-gray-700 
                       transition rounded-lg py-2 text-sm disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Confirm Submission"}
          </button>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
        </div>
      )}

      {success && (
        <p className="mt-4 text-green-400 text-sm">
          Application submitted successfully ✔
        </p>
      )}
    </div>
  );
}