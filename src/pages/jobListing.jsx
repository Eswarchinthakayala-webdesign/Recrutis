/* eslint-disable react/prop-types */
import { useEffect, useState, useMemo } from "react";
import { useUser } from "@clerk/clerk-react";
import { State } from "country-state-city";
import { BarLoader } from "react-spinners";
import { motion } from "framer-motion";
import {
  AlertCircle,
  BarChart2,
  BookMarked,
  Briefcase,
  Building2,
  ChartArea,
  Database,
  FileUser,
  Hourglass,
  MapPin,
  Palette,
} from "lucide-react";
import JobCard from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TextShimmer from "../components/text-shimmer";

import { getCompanies } from "@/api/apiCompanies";
import { getJobs } from "@/api/apiJobs";
import useFetch from "../../hooks/use-fetch";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getApplications } from "../api/apiApplications";

// 🎨 Color palettes (20 themes like shadcn)
const COLOR_THEMES = {
  zinc: ["#71717a", "#a1a1aa", "#27272a", "#52525b", "#3f3f46"],
  gray: ["#9ca3af", "#4b5563", "#6b7280", "#374151", "#1f2937"],
  slate: ["#64748b", "#94a3b8", "#334155", "#475569", "#1e293b"],
  stone: ["#78716c", "#a8a29e", "#57534e", "#44403c", "#292524"],
  orange: ["#f97316", "#fb923c", "#ea580c", "#fdba74", "#ffedd5"],
  green: ["#22c55e", "#4ade80", "#16a34a", "#86efac", "#dcfce7"],
  emerald: ["#10b981", "#34d399", "#059669", "#6ee7b7", "#a7f3d0"],
  teal: ["#14b8a6", "#2dd4bf", "#0d9488", "#5eead4", "#99f6e4"],
  cyan: ["#06b6d4", "#22d3ee", "#0891b2", "#67e8f9", "#a5f3fc"],
  sky: ["#0ea5e9", "#38bdf8", "#0284c7", "#7dd3fc", "#bae6fd"],
  blue: ["#3b82f6", "#60a5fa", "#2563eb", "#93c5fd", "#bfdbfe"],
  indigo: ["#6366f1", "#818cf8", "#4f46e5", "#a5b4fc", "#c7d2fe"],
  violet: ["#8b5cf6", "#a78bfa", "#7c3aed", "#c4b5fd", "#ddd6fe"],
  purple: ["#9333ea", "#a855f7", "#7e22ce", "#d8b4fe", "#f3e8ff"],
  pink: ["#ec4899", "#f472b6", "#db2777", "#f9a8d4", "#fce7f3"],
  rose: ["#f43f5e", "#fb7185", "#e11d48", "#fecdd3", "#ffe4e6"],
  red: ["#ef4444", "#f87171", "#dc2626", "#fca5a5", "#fee2e2"],
  yellow: ["#eab308", "#facc15", "#ca8a04", "#fde047", "#fef9c3"],
  amber: ["#f59e0b", "#fbbf24", "#d97706", "#fcd34d", "#fef3c7"],
};

const JobListing = () => {
  const [activeTab, setActiveTab] = useState("data");
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [company_id, setCompany_id] = useState("");
  const [themeKey, setThemeKey] = useState("zinc"); // default theme
  const { isLoaded, user } = useUser();

  const COLORS = COLOR_THEMES[themeKey];

  const { data: companies, fn: fnCompanies } = useFetch(getCompanies);
  const { loading: loadingJobs, data: jobs, fn: fnJobs } = useFetch(getJobs, {
    location,
    company_id,
    searchQuery,
  });

  // ✅ Correct fetch order and dependencies
  useEffect(() => {
    if (isLoaded) fnCompanies();
  }, [isLoaded]);

  const {
    loading: loadingApplications,
    data: applications,
    fn: fnApplications,
  } = useFetch(getApplications, { user_id: user?.id });

  useEffect(() => {
    if (isLoaded && user?.id) fnApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user?.id]);

  useEffect(() => {
    if (isLoaded) fnJobs();
  }, [isLoaded, location, company_id, searchQuery]);



  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setSearchQuery(formData.get("search-query") || "");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCompany_id("");
    setLocation("");
  };

  // ✅ Merge jobs with applications correctly
  const analyticsData = useMemo(() => {
    if (!jobs) return {};

    const jobsByLocation = Object.values(
      jobs.reduce((acc, j) => {
        acc[j.location] = acc[j.location] || { name: j.location, count: 0 };
        acc[j.location].count++;
        return acc;
      }, {})
    );

    const jobsByCompany = Object.values(
      jobs.reduce((acc, j) => {
        const companyName = j.company?.name || "Unknown";
        acc[companyName] = acc[companyName] || { name: companyName, count: 0 };
        acc[companyName].count++;
        return acc;
      }, {})
    );

    const jobStatus = [
      { name: "Open", value: jobs.filter((j) => j.isOpen).length },
      { name: "Closed", value: jobs.filter((j) => !j.isOpen).length },
    ];

    const jobsOverTime = Object.values(
      jobs.reduce((acc, j) => {
        const date = new Date(j.created_at).toLocaleDateString("en-GB");
        acc[date] = acc[date] || { date, jobs: 0 };
        acc[date].jobs++;
        return acc;
      }, {})
    );

    const savedJobsRatio = [
      { name: "Saved", value: jobs.filter((j) => j.saved?.length > 0).length },
      { name: "Not Saved", value: jobs.filter((j) => !j.saved?.length).length },
    ];

    // ✅ Applications per Job (correct logic)
    const jobApplicationCounts = jobs.map((j) => {
      const appCount = applications
        ? applications.filter((a) => a.job_id === j.id).length
        : 0;
      return {
        name: j.title || "Untitled",
        applications: appCount,
      };
    });

    return {
      jobsByLocation,
      jobsByCompany,
      jobStatus,
      jobsOverTime,
      savedJobsRatio,
      applicationsPerJob: jobApplicationCounts,
    };
  }, [jobs, applications]);

  if (!isLoaded) {
    return <BarLoader className="mb-4" width={"100%"} color={"#374151"} />;
  }

  return (
    <div className="px-4 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <TextShimmer className="font-extrabold text-5xl sm:text-6xl pb-4 text-center sm:text-left">
          Job Portal
        </TextShimmer>

        <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
          <Button
            variant={activeTab === "data" ? "default" : "outline"}
            onClick={() => setActiveTab("data")}
            className="flex cursor-pointer items-center gap-2"
          >
            <Database className="w-4 h-4" />
            Data
          </Button>
          <Button
            variant={activeTab === "analytics" ? "default" : "outline"}
            onClick={() => setActiveTab("analytics")}
            className="flex items-center cursor-pointer gap-2"
          >
            <BarChart2 className="w-4 h-4" />
            Analytics
          </Button>

          {/* 🎨 Theme Picker */}
          {activeTab === "analytics" && (
           <Select value={themeKey} onValueChange={(v) => setThemeKey(v)}>
  <SelectTrigger className="sm:w-44 cursor-pointer  check-text">
    <SelectValue placeholder="Select Color Theme " />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      {Object.keys(COLOR_THEMES).map((theme) => (
        <SelectItem
  key={theme}
  value={theme}
  className="cursor-pointer transition-colors duration-200 check"
  style={{
    "--hover-color": COLOR_THEMES[theme][0],
  }}
>
  <div className="flex items-center gap-2 px-2 py-1 rounded-md transition-colors duration-150">
    <Palette className="w-4 h-4 hover:text-black" />
    {theme.charAt(0).toUpperCase() + theme.slice(1)}
  </div>

  <style jsx>{`
    .check:hover {
      background-color: var(--hover-color) !important;
    }
    .check-text {
      color: var(--hover-color) !important;
    }
  `}</style>
</SelectItem>

      ))}
    </SelectGroup>
  </SelectContent>
</Select>

          )}
        </div>
      </div>

      {/* Data Section */}
      {activeTab === "data" && (
        <>
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          >
          <form
            onSubmit={handleSearch}
            className="h-14 flex flex-row w-full gap-2 items-center mb-3"
          >
            <Input
              type="text"
              placeholder="Search Jobs by Title..."
              name="search-query"
              className="h-full flex-1 px-4 text-md"
            />
            <Button type="submit" className="h-full sm:w-28 cursor-pointer">
              Search
            </Button>
          </form>

          <div className="flex flex-row gap-2">
            <Select value={location} onValueChange={(v) => setLocation(v)}>
              <SelectTrigger className="text-black cursor-pointer dark:text-white">
                <SelectValue placeholder="Filter by Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {State.getStatesOfCountry("IN").map(({ name }) => (
                    <SelectItem className="cursor-pointer" key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select value={company_id} onValueChange={(v) => setCompany_id(v)}>
              <SelectTrigger className="cursor-pointer text-black dark:text-white">
                <SelectValue placeholder="Filter by Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {companies?.map(({ name, id }) => (
                    <SelectItem className="cursor-pointer" key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="mt-5 cursor-pointer"
            variant="destructive"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>

          {loadingJobs && (
            <BarLoader className="mt-4" width={"100%"} color="#374151" />
          )}

          {!loadingJobs && (
            <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs?.length ? (
                jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    savedInit={job?.saved?.length > 0}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center justify-start p-4 rounded-xl bg-red-600/70 backdrop-blur-md border border-red-400/30 shadow-lg gap-2"
                >
                  <AlertCircle className="h-6 w-6 text-red-700" />
                  <span className="text-red-800 font-semibold text-lg">
                    No Jobs Found
                  </span>
                </motion.div>
              )}
            </div>
          )}
          </motion.div>
        </>
      )}

      {/* Analytics Section */}
      {activeTab === "analytics" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6"
        >
          {/* 1️⃣ Jobs by Location */}
                    <div className="bg-gradient-to-br 
            from-gray-100/10 to-gray-200/50 
            dark:from-gray-900 dark:to-gray-950  p-4 rounded-2xl shadow-lg border dark:border-gray-100/20 border-gray-900/20">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-zinc-700 dark:text-zinc-100">
              <MapPin className="w-5 h-5 text-zinc-500" /> Jobs by Location
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analyticsData.jobsByLocation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#52525b" />
                <XAxis dataKey="name" stroke="#71717a" />
                <YAxis stroke="#71717a" />
               <Tooltip
  contentStyle={{
    backgroundColor: "rgba(24,24,27,0.9)", // dark zinc overlay
    border: "1px solid rgba(113,113,122,0.4)", // subtle zinc border
    borderRadius: "0.75rem",
    backdropFilter: "blur(8px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    color: "#e4e4e7",
    fontSize: "0.875rem",
    padding: "0.5rem 0.75rem",
  }}
  itemStyle={{
    color: "#f4f4f5", // text color
    textTransform: "capitalize",
  }}
  labelStyle={{
    color: "#a1a1aa",
    fontWeight: "500",
    marginBottom: "0.25rem",
  }}
  cursor={{ fill: "rgba(113,113,122,0.2)" }}
/>
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={COLORS[0]}
                  fill={COLORS[1]}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 2️⃣ Jobs by Company */}
                   <div className="bg-gradient-to-br 
            from-gray-100/10 to-gray-200/50 
            dark:from-gray-900 dark:to-gray-950  p-4 rounded-2xl shadow-lg border dark:border-gray-100/20 border-gray-900/20">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-zinc-700 dark:text-zinc-100">
              <Building2 className="w-5 h-5 text-zinc-500" /> Jobs by Company
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData.jobsByCompany}
                  dataKey="count"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {analyticsData.jobsByCompany?.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
               <Tooltip
  contentStyle={{
    backgroundColor: "rgba(24,24,27,0.9)", // dark zinc overlay
    border: "1px solid rgba(113,113,122,0.4)", // subtle zinc border
    borderRadius: "0.75rem",
    backdropFilter: "blur(8px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    color: "#e4e4e7",
    fontSize: "0.875rem",
    padding: "0.5rem 0.75rem",
  }}
  itemStyle={{
    color: "#f4f4f5", // text color
    textTransform: "capitalize",
  }}
  labelStyle={{
    color: "#a1a1aa",
    fontWeight: "500",
    marginBottom: "0.25rem",
  }}
  cursor={{ fill: "rgba(113,113,122,0.2)" }}
/>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 3️⃣ Jobs Over Time */}
                   <div className="bg-gradient-to-br 
            from-gray-100/10 to-gray-200/50 
            dark:from-gray-900 dark:to-gray-950  p-4 rounded-2xl shadow-lg border dark:border-gray-100/20 border-gray-900/20">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-zinc-700 dark:text-zinc-100">
               <Hourglass className="w-5 h-5 text-zinc-500" /> Jobs Over Time
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analyticsData.jobsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#52525b" />
                <XAxis dataKey="date" stroke="#71717a" />
                <YAxis stroke="#71717a" />
                <Tooltip
  contentStyle={{
    backgroundColor: "rgba(24,24,27,0.9)", // dark zinc overlay
    border: "1px solid rgba(113,113,122,0.4)", // subtle zinc border
    borderRadius: "0.75rem",
    backdropFilter: "blur(8px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    color: "#e4e4e7",
    fontSize: "0.875rem",
    padding: "0.5rem 0.75rem",
  }}
  itemStyle={{
    color: "#f4f4f5", // text color
    textTransform: "capitalize",
  }}
  labelStyle={{
    color: "#a1a1aa",
    fontWeight: "500",
    marginBottom: "0.25rem",
  }}
  cursor={{ fill: "rgba(113,113,122,0.2)" }}
/>
                <Area
                  type="monotone"
                  dataKey="jobs"
                  stroke={COLORS[2]}
                  fill={COLORS[3]}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 4️⃣ Job Status */}
          <div className="bg-gradient-to-br 
            from-gray-100/10 to-gray-200/50 
            dark:from-gray-900 dark:to-gray-950  p-4 rounded-2xl shadow-lg border dark:border-gray-100/20 border-gray-900/20">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-zinc-700 dark:text-zinc-100">
               <ChartArea className="w-5 h-5 text-zinc-500" /> Job Status (Open vs Closed)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData.jobStatus}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {analyticsData.jobStatus?.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
  contentStyle={{
    backgroundColor: "rgba(24,24,27,0.9)", // dark zinc overlay
    border: "1px solid rgba(113,113,122,0.4)", // subtle zinc border
    borderRadius: "0.75rem",
    backdropFilter: "blur(8px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    color: "#e4e4e7",
    fontSize: "0.875rem",
    padding: "0.5rem 0.75rem",
  }}
  itemStyle={{
    color: "#f4f4f5", // text color
    textTransform: "capitalize",
  }}
  labelStyle={{
    color: "#a1a1aa",
    fontWeight: "500",
    marginBottom: "0.25rem",
  }}
  cursor={{ fill: "rgba(113,113,122,0.2)" }}
/>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 5️⃣ Saved Jobs Ratio */}
          <div className="bg-gradient-to-br 
            from-gray-100/10 to-gray-200/50 
            dark:from-gray-900 dark:to-gray-950  p-4 rounded-2xl shadow-lg border dark:border-gray-100/20 border-gray-900/20">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-zinc-700 dark:text-zinc-100">
               <BookMarked className="w-5 h-5 text-zinc-500" /> Saved vs Not Saved Jobs
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData.savedJobsRatio}>
                <CartesianGrid strokeDasharray="3 3" stroke="#52525b" />
                <XAxis dataKey="name" stroke="#71717a" />
                <YAxis stroke="#71717a" />
               <Tooltip
  contentStyle={{
    backgroundColor: "rgba(24,24,27,0.9)", // dark zinc overlay
    border: "1px solid rgba(113,113,122,0.4)", // subtle zinc border
    borderRadius: "0.75rem",
    backdropFilter: "blur(8px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    color: "#e4e4e7",
    fontSize: "0.875rem",
    padding: "0.5rem 0.75rem",
  }}
  itemStyle={{
    color: "#f4f4f5", // text color
    textTransform: "capitalize",
  }}
  labelStyle={{
    color: "#a1a1aa",
    fontWeight: "500",
    marginBottom: "0.25rem",
  }}
  cursor={{ fill: "rgba(113,113,122,0.2)" }}
/>
                <Bar dataKey="value" fill={COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 6️⃣ Applications per Job */}
                  <div className="bg-gradient-to-br 
            from-gray-100/10 to-gray-200/50 
            dark:from-gray-900 dark:to-gray-950 p-4 rounded-2xl shadow-lg border dark:border-gray-100/20 border-gray-900/20">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-zinc-700 dark:text-gray-100">
              <FileUser className="w-5 h-5 text-zinc-500" /> Applications per Job
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analyticsData.applicationsPerJob}>
                <CartesianGrid strokeDasharray="3 3" stroke="#52525b" />
                <XAxis dataKey="name" stroke="#71717a" />
                <YAxis stroke="#71717a" />
              <Tooltip
  contentStyle={{
    backgroundColor: "rgba(24,24,27,0.9)", // dark zinc overlay
    border: "1px solid rgba(113,113,122,0.4)", // subtle zinc border
    borderRadius: "0.75rem",
    backdropFilter: "blur(8px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    color: "#e4e4e7",
    fontSize: "0.875rem",
    padding: "0.5rem 0.75rem",
  }}
  itemStyle={{
    color: "#f4f4f5", // text color
    textTransform: "capitalize",
  }}
  labelStyle={{
    color: "#a1a1aa",
    fontWeight: "500",
    marginBottom: "0.25rem",
  }}
  cursor={{ fill: "rgba(113,113,122,0.2)" }}
/>
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke={COLORS[4]}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default JobListing;
