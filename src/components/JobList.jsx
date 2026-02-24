import { useEffect, useState } from "react";
import { getJobs } from "../services/api";
import JobItem from "./JobItem";

export default function JobList({ candidate }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const data = await getJobs();
        setJobs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  if (loading) {
    return <p className="text-gray-300">Loading positions...</p>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  return (
    <div className="w-full max-w-2xl mt-6 animate-fadeIn">
      {jobs.map((job) => (
        <JobItem
          key={job.id}
          job={job}
          candidate={candidate}
        />
      ))}
    </div>
  );
}