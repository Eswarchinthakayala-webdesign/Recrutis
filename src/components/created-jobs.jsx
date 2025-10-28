// src/pages/CreatedJobs.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { BarLoader, HashLoader } from "react-spinners";
import {
  Search,
  Briefcase,
  Filter,
  Calendar,
  Users,
  ArrowUpDown,
  MapPin,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

import JobCard from "./job-card";
import useFetch from "../../hooks/use-fetch";
import { getMyJobs } from "../api/apiJobs";

const CreatedJobs = () => {
  const { user } = useUser();

  const {
    loading: loadingCreatedJobs,
    data: createdJobs,
    fn: fnCreatedJobs,
  } = useFetch(getMyJobs, {
    recruiter_id: user?.id,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    if (user?.id) fnCreatedJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // filter + sort logic
  const filteredJobs = useMemo(() => {
    if (!createdJobs) return [];

    let jobs = [...createdJobs];

    // filter by status
    if (filterStatus !== "all") {
      jobs = jobs.filter((job) =>
        filterStatus === "open" ? job.isOpen : !job.isOpen
      );
    }

    // search
    if (searchQuery.trim()) {
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.company?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // sort
    switch (sortOrder) {
      case "newest":
        jobs.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        break;
      case "oldest":
        jobs.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        break;
      case "most-applicants":
        jobs.sort((a, b) => (b.applications?.length || 0) - (a.applications?.length || 0));
        break;
    }

    return jobs;
  }, [createdJobs, searchQuery, filterStatus, sortOrder]);

  return (
    <div className="space-y-6 py-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            Created Jobs
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage, filter and view all jobs you’ve created
          </p>
        </div>

        <Badge
          variant="secondary"
          className="text-xs px-3 py-1 bg-primary/10 text-primary font-medium"
        >
          Total Jobs: {createdJobs?.length || 0}
        </Badge>
      </div>

      {/* Filters and search */}
      <Card className="p-4 bg-gray-50 dark:bg-gray-950/60 dark:border-gray-100/25 ">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search bar */}
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter and sort */}
          <div className="flex flex-row gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <Select
                defaultValue="all"
                onValueChange={(v) => setFilterStatus(v)}
              >
                <SelectTrigger className="flex-1 cursor-pointer">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="all">All</SelectItem>
                  <SelectItem className="cursor-pointer" value="open">Open</SelectItem>
                  <SelectItem className="cursor-pointer" value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown size={16} className="text-muted-foreground" />
              <Select
                defaultValue="newest"
                onValueChange={(v) => setSortOrder(v)}
              >
                <SelectTrigger className="flex-1 cursor-pointer">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="newest">Newest</SelectItem>
                  <SelectItem className="cursor-pointer" value="oldest">Oldest</SelectItem>
                  <SelectItem className="cursor-pointer" value="most-applicants">
                    Most Applicants
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Jobs grid */}
      {loadingCreatedJobs ? (
      <div className="flex items-center justify-center h-[50vh] w-full">
        <HashLoader size={70} color="#374151" />
      </div>

      ) : filteredJobs?.length ? (
        <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <ContextMenu key={job.id}>
              <ContextMenuTrigger>
                <JobCard
                  key={job.id}
                  job={job}
                  onJobAction={fnCreatedJobs}
                  isMyJob
                />
              </ContextMenuTrigger>

              {/* Context menu on right click */}
              <ContextMenuContent className="w-48">
                <ContextMenuLabel>{job.title}</ContextMenuLabel>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onClick={() =>
                    window.open(`/job/${job.id}`, "_blank", "noopener")
                  }
                >
                  View Job Details
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => navigator.clipboard.writeText(job.id)}
                >
                  Copy Job ID
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(job.title + " - " + job.company?.name)
                  }
                >
                  Copy Job Info
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center mt-6">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Briefcase className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              No jobs found matching your criteria.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CreatedJobs;
