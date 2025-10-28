import { useUser } from "@clerk/clerk-react";
import ApplicationCard from "./application-card";
import { useEffect, useState } from "react";
import { HashLoader } from "react-spinners";
import useFetch from "../../hooks/use-fetch";
import { getApplications } from "../api/apiApplications";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ClipboardList, ClipboardX, RotateCw } from "lucide-react";
import TextShimmer from "../components/text-shimmer";

const CreatedApplications = () => {
  const { user, isLoaded } = useUser();

  const {
    loading: loadingApplications,
    data: fetchedApplications,
    fn: fnApplications,
  } = useFetch(getApplications, { user_id: user?.id });

  const [applications, setApplications] = useState([]);

  // Fetch applications when loaded
  useEffect(() => {
    if (isLoaded && user) fnApplications();
  }, [isLoaded, user]);

  // Sync data when fetched
  useEffect(() => {
    if (fetchedApplications) setApplications(fetchedApplications);
  }, [fetchedApplications]);

  // Loading state
  if (!isLoaded || loadingApplications) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <HashLoader color="#374151" />
        <p className="text-gray-500 mt-3">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <TextShimmer className="font-extrabold text-4xl sm:text-5xl bg-gradient-to-r from-gray-700 via-gray-900 to-gray-600 dark:from-gray-200 dark:via-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
            My Applications
          </TextShimmer>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-1">
            View all the job applications you’ve submitted.
          </p>
        </div>

        {/* Refresh Button */}
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            className="flex items-center gap-2 cursor-pointer rounded-xl border-gray-300 text-gray-700 bg-white/60 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-100 dark:hover:bg-gray-700 transition-all"
            onClick={fnApplications}
            disabled={loadingApplications}
          >
            <RotateCw
              size={18}
              className={`transition-transform ${
                loadingApplications ? "animate-spin text-primary" : ""
              }`}
            />
            Refresh
          </Button>
        </motion.div>
      </motion.div>

      {/* Applications Grid */}
      <div className="mt-10 grid gap-6 grid-cols-1">
        {applications?.length ? (
          applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              job={application.job} // ✅ passes full job details
              isCandidate={true}
            />
          ))
        ) : (
          <EmptyApplications />
        )}
      </div>
    </div>
  );
};

export default CreatedApplications;

/* --------------------
   Empty State Component
-------------------- */
const EmptyApplications = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="col-span-full flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-950/40"
    >
      <div className="bg-gray-200 dark:bg-gray-800 p-6 rounded-full mb-6">
        <ClipboardX className="w-12 h-12 text-gray-600 dark:text-gray-300" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
        No Applications Yet
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6 max-w-md">
        You haven’t submitted any applications yet. Start applying to your
        dream jobs today!
      </p>
      <Button
        asChild
        className="flex items-center gap-2 cursor-pointer bg-gray-800 hover:bg-gray-700 text-white dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-gray-200 transition"
      >
        <a href="/jobs">
          <ClipboardList size={18} />
          Browse Jobs
        </a>
      </Button>
    </motion.div>
  );
};
