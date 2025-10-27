/* eslint-disable react/prop-types */
"use client";

import {
  Boxes,
  BriefcaseBusiness,
  Download,
  School,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { motion } from "framer-motion";
import { toast } from "sonner";
import useFetch from "../../hooks/use-fetch";
import { updateApplicationStatus } from "../api/apiApplications";
import { BarLoader } from "react-spinners";
import { Button } from "./ui/button";

const ApplicationCard = ({ application, job, isCandidate = false }) => {
  const { loading: loadingHiringStatus, fn: fnHiringStatus } = useFetch(
    updateApplicationStatus,
    { job_id: application.job_id }
  );

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = application?.resume;
    link.target = "_blank";
    link.click();
  };

  const handleStatusChange = async (status) => {
    try {
      await fnHiringStatus(status);
      toast.success(`Status updated to "${status}"`);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getBadgeColor = (status) => {
    switch (status) {
      case "applied":
        return "bg-blue-500/15 text-blue-500 border border-blue-500/20";
      case "interviewing":
        return "bg-yellow-500/15 text-yellow-500 border border-yellow-500/20";
      case "hired":
        return "bg-green-500/15 text-green-500 border border-green-500/20";
      case "rejected":
        return "bg-red-500/15 text-red-500 border border-red-500/20";
      default:
        return "bg-gray-500/15 text-gray-500 border border-gray-500/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "hired":
        return <CheckCircle size={16} className="text-green-500" />;
      case "rejected":
        return <XCircle size={16} className="text-red-500" />;
      case "interviewing":
        return <UserCheck size={16} className="text-yellow-500" />;
      default:
        return <Clock size={16} className="text-blue-500" />;
    }
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        className={`
          px-8 shadow-md hover:shadow-xl transition-all border 
          bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border-gray-200 
          dark:from-gray-900 dark:to-gray-800 dark:text-gray-100 dark:border-gray-700
        `}
      >
        {loadingHiringStatus && <BarLoader width={"100%"} color="#60a5fa" />}

        <CardHeader className="flex justify-between items-center">
          <CardTitle className="flex justify-between items-center w-full text-lg font-semibold">
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 dark:text-gray-50">
                {isCandidate
                  ? `${job?.title}`
                  : application?.name || "Un-named"}
              </span>
              {isCandidate && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  at {job?.company?.name}
                </span>
              )}
            </div>

            <Button
              size="icon"
              variant="ghost"
              className="rounded-full cursor-pointer dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-700 
                         bg-gray-800/60 hover:bg-gray-700 hover:text-white text-gray-200 transition-all"
              onClick={handleDownload}
            >
              <Download size={18} />
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Separator className="bg-gray-200 dark:bg-gray-700/40" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <BriefcaseBusiness
                size={16}
                className="text-blue-500 dark:text-blue-400"
              />
              <span className="text-gray-700 dark:text-gray-300">
                {application?.experience} years experience
              </span>
            </div>

            <div className="flex items-center gap-2">
              <School size={16} className="text-yellow-500 dark:text-yellow-400" />
              <span className="text-gray-700 dark:text-gray-300">
                {application?.education}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Boxes size={16} className="text-emerald-500 dark:text-emerald-400" />
              <span className="text-gray-700 dark:text-gray-300">
                {application?.skills}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(application?.created_at).toLocaleString()}
          </span>

          {isCandidate ? (
            <Badge
              className={`capitalize flex items-center gap-1 font-semibold px-3 py-1 text-sm rounded-2xl ${getBadgeColor(
                application.status
              )}`}
            >
              {getStatusIcon(application.status)}
              {application.status}
            </Badge>
          ) : (
            <Select
              onValueChange={handleStatusChange}
              defaultValue={application.status}
            >
              <SelectTrigger
                className="w-48 bg-gray-100 cursor-pointer hover:bg-gray-200 border-gray-300 text-gray-800 
                           dark:bg-gray-800/60 dark:hover:bg-gray-700 dark:text-gray-100 dark:border-gray-700"
              >
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
                <SelectItem className="cursor-pointer" value="applied">Applied</SelectItem>
                <SelectItem className="cursor-pointer"  value="interviewing">Interviewing</SelectItem>
                <SelectItem className="cursor-pointer"  value="hired">Hired</SelectItem>
                <SelectItem className="cursor-pointer"  value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ApplicationCard;
