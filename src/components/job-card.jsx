/* eslint-disable react/prop-types */
import {
  Heart,
  MapPin,
  Trash2,
  Building2,
  CalendarDays,
  Briefcase,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Link } from "react-router-dom";
import { deleteJob, saveJob } from "@/api/apiJobs";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import useFetch from "../../hooks/use-fetch";
import { motion } from "framer-motion";

const JobCard = ({
  job,
  savedInit = false,
  onJobAction = () => {},
  isMyJob = false,
}) => {
  const [saved, setSaved] = useState(savedInit);
  const { user } = useUser();

  // Custom hooks for fetching
  const { loading: loadingDeleteJob, fn: fnDeleteJob } = useFetch(deleteJob, {
    job_id: job.id,
  });

  const {
    loading: loadingSavedJob,
    data: savedJob,
    fn: fnSavedJob,
  } = useFetch(saveJob);

  // 🔄 Toggle Save/Unsave Job
  const handleSaveJob = async () => {
    try {
      setSaved((prev) => !prev); // Optimistic UI update

      await fnSavedJob({
        user_id: user.id,
        job_id: job.id,
      });

      onJobAction();
    } catch (error) {
      console.error("Error saving job:", error);
      setSaved(saved); // revert state on error
    }
  };

  // 🗑️ Delete Job (Recruiter only)
  const handleDeleteJob = async () => {
    await fnDeleteJob();
    onJobAction();
  };

  // Update local saved state when API returns
  useEffect(() => {
    if (savedJob !== undefined) setSaved(savedJob?.length > 0);
  }, [savedJob]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="flex"
    >
      <Card
        className="
          relative overflow-hidden flex flex-col  justify-between
          border border-zinc-700/50
          backdrop-blur-md
          rounded-2xl shadow-md transition-all duration-300 
          h-full w-full
          bg-white/70 text-gray-800 
          dark:bg-gray-900/60 dark:text-gray-100
          dark:border-white/30
        "
      >
        {/* Loader (top bar) */}
        {loadingDeleteJob && (
          <BarLoader
            width={'100%'}
            color='#36d7b7'
            className='absolute top-0 left-0 z-10'
          />
        )}

        {/* Trash Icon (Only visible for recruiters) */}
        {isMyJob && (
          <motion.div
            whileHover={{ scale: 1.15 }}
            className="absolute top-3 right-3 text-red-400 hover:text-red-500 cursor-pointer transition"
            onClick={handleDeleteJob}
          >
            <Trash2 size={18} />
          </motion.div>
        )}

        {/* Header Section */}
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Briefcase size={16} className="text-primary shrink-0" />
              <span className="font-semibold text-base sm:text-lg line-clamp-2">
                {job.title}
              </span>
            </div>
          </CardTitle>

          {job.company && (
            <div className="flex items-center gap-2 mt-1">
              {job.company.logo_url ? (
                <img
                  src={job.company.logo_url}
                  alt={job.company.name}
                  className="h-10 w-10 rounded object-contain bg-white/10 p-1"
                />
              ) : (
                <Building2 size={16} className="text-gray-500" />
              )}
              <span className="text-sm text-muted-foreground truncate">
                {job.company.name}
              </span>
            </div>
          )}
        </CardHeader>

        {/* Content Section */}
        <CardContent className="flex flex-col gap-3 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <MapPin size={14} />
            <span className="truncate max-w-[75%]">
              {job.location || "Remote"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <CalendarDays size={14} />
            <span>
              Posted on {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Status and Type */}
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge
              variant="secondary"
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                job.isOpen
                  ? "bg-green-500/20 border-green-400 text-green-600 dark:text-green-300"
                  : "bg-red-500/20 border-red-400 text-red-600 dark:text-red-300"
              }`}
            >
              {job.isOpen ? "Open" : "Closed"}
            </Badge>
            {job.type && (
              <Badge
                className="bg-blue-500/20 border-blue-400 text-blue-600 dark:text-blue-300 rounded-full px-3 py-1 text-xs"
              >
                {job.type}
              </Badge>
            )}
          </div>
        </CardContent>

        {/* Footer Section */}
        <CardFooter className="flex gap-2 pt-4 mt-auto">
          <motion.div whileTap={{ scale: 0.97 }} className="flex-1">
            <Link to={`/job/${job.id}`} className="w-full">
              <Button
                variant="outline"
                className="
                  w-full text-sm rounded-xl 
                  border-gray-300 text-gray-700 bg-white/60 
                  hover:bg-primary/10 hover:text-primary 
                  dark:border-gray-700 cursor-pointer dark:bg-gray-800/40 dark:text-white 
                  dark:hover:bg-primary/20
                "
              >
                More Details
              </Button>
            </Link>
          </motion.div>

          {/* Heart / Like Button */}
          {!isMyJob && (
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                className="
                  p-2 rounded-xl border cursor-pointer border-transparent 
                  hover:bg-red-500/10 
                  dark:hover:bg-red-500/20
                  dark:hover:border-red-600
                "
                onClick={handleSaveJob}
                disabled={loadingSavedJob}
              >
                {saved ? (
                  <Heart
                    size={20}
                    fill="red"
                    stroke="red"
                    className="transition-all duration-200"
                  />
                ) : (
                  <Heart
                    size={20}
                    className="text-gray-400 dark:text-gray-300 transition-all duration-200"
                  />
                )}
              </Button>
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default JobCard;
