import { getSavedJobs } from "@/api/apiJobs";
import JobCard from "@/components/job-card";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import {  RotateCw, BookmarkX, Briefcase } from "lucide-react";
import useFetch from "../../hooks/use-fetch";
import TextShimmer from "../components/text-shimmer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HashLoader } from "react-spinners";

const SavedJobs = () => {
  const { isLoaded } = useUser();
  const {
    loading: loadingSavedJobs,
    data: fetchedSavedJobs,
    fn: fnSavedJobs,
  } = useFetch(getSavedJobs);

  const [savedJobs, setSavedJobs] = useState([]);

  // Fetch jobs initially
  useEffect(() => {
    if (isLoaded) fnSavedJobs();
  }, [isLoaded]);

  // Sync data when fetched
  useEffect(() => {
    if (fetchedSavedJobs) setSavedJobs(fetchedSavedJobs);
  }, [fetchedSavedJobs]);

  // Local remove handler
  const handleUnsave = (jobId) => {
    setSavedJobs((prev) => prev.filter((s) => s.job.id !== jobId));
  };

  // Loading state
  if (!isLoaded || loadingSavedJobs) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <HashLoader width={"100%"} color="#374151" />
        <p className="text-gray-500 mt-3">Loading your saved jobs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 lg:px-8">
      {/* Page Heading + Refresh Button */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-row items-center justify-between gap-4"
      >
        <div>
          <TextShimmer className="font-extrabold text-4xl sm:text-5xl bg-gradient-to-r from-gray-700 via-gray-900 to-gray-600 dark:from-gray-200 dark:via-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
            Saved Jobs
          </TextShimmer>
         
        </div>

        {/* 🔄 Refresh Button */}
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            className="flex items-center gap-2 cursor-pointer rounded-xl border-gray-300 text-gray-700 bg-white/60 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-100 dark:hover:bg-gray-700 transition-all"
            onClick={fnSavedJobs}
            disabled={loadingSavedJobs}
          >
            <RotateCw
              size={18}
              className={`transition-transform ${
                loadingSavedJobs ? "animate-spin text-primary" : ""
              }`}
            />
            Refresh
          </Button>
        </motion.div>
      </motion.div>

      {/* Saved Jobs List */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {savedJobs?.length ? (
          savedJobs.map((saved) => (
            <JobCard
              key={saved.id}
              job={saved.job}
              savedInit={true}
              onUnsave={handleUnsave} // ✅ remove instantly
            />
          ))
        ) : (
          <EmptySavedJobs />
        )}
      </div>
    </div>
  );
};

export default SavedJobs;

/* --------------------
   Empty State Component
-------------------- */
const EmptySavedJobs = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="col-span-full flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-950/40"
    >
      <div className="bg-gray-200 dark:bg-gray-800 p-6 rounded-full mb-6">
        <BookmarkX className="w-12 h-12 text-gray-600 dark:text-gray-300" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
        No Saved Jobs Yet
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6 max-w-md">
        You haven’t saved any jobs yet. Browse job listings and bookmark the
        ones that interest you.
      </p>
      <Link to="/jobs">
        <Button className="flex items-center gap-2 cursor-pointer bg-gray-800 hover:bg-gray-700 text-white dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-gray-200 transition">
          <Briefcase size={18} />
          Browse Jobs
        </Button>
      </Link>
    </motion.div>
  );
};
