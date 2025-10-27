// src/pages/JobPage.jsx
/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";
import MDEditor from "@uiw/react-md-editor";
import { useUser } from "@clerk/clerk-react";
import {
  Briefcase,
  DoorClosed,
  DoorOpen,
  MapPinIcon,
  RefreshCw,
  PieChart as PieIcon,
  BarChart as BarIcon,
  LineChart as LineIcon,
  Palette,
  Activity,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner";

import { ApplyJobDrawer } from "@/components/apply-job";
import ApplicationCard from "@/components/application-card";

import useFetch from "../../hooks/use-fetch";
import { getSingleJob, updateHiringStatus } from "../api/apiJobs";
import { updateApplicationStatus } from "../api/apiApplications"; // ensure path correct

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
} from "recharts";
import { useTheme } from "../components/theme-provider";
import { Button } from "../components/ui/button";

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

export default function JobPage({ token /* optional: pass if your API needs it */ }) {
  const { id } = useParams();
  const { isLoaded, user } = useUser();

  // local UI state
  const [localJob, setLocalJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [chartTheme, setChartTheme] = useState("blue");
  const [chartsTab, setChartsTab] = useState("overview"); // tabs: overview / funnel / skills
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // useFetch hook for job & hiring status
  const { loading: loadingJob, data: job, fn: fnJob } = useFetch(getSingleJob, { job_id: id });
  const { loading: loadingHiringStatus, fn: fnHiringStatus } = useFetch(updateHiringStatus, { job_id: id });

  // fetch job once user/auth loaded
  useEffect(() => {
    if (isLoaded) {
      setLoadingLocal(true);
      fnJob()
        .then((res) => {
          const j = res || job;
          setLocalJob(j);
          // ensure we only load applications that belong to this job (job.applications)
          setApplications((j && j.applications) ? j.applications.slice() : []);
        })
        .catch((e) => console.error(e))
        .finally(() => setLoadingLocal(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  // keep in sync when hook updates job
  useEffect(() => {
    if (job) {
      setLocalJob(job);
      setApplications((job && job.applications) ? job.applications.slice() : []);
    }
  }, [job]);
  console.log(job)

  // refresh helper
  const refreshJob = useCallback(async () => {
    setLoadingLocal(true);
    try {
      const res = await fnJob();
      const j = res || job;
      setLocalJob(j);
      setApplications((j && j.applications) ? j.applications.slice() : []);
      toast.success("Refreshed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh");
    } finally {
      setLoadingLocal(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fnJob]);

  // recruiter toggles job open/closed
  const handleHiringStatusChange = async (value) => {
    const isOpen = value === "open";
    try {
      setStatusUpdating(true);
      await fnHiringStatus(isOpen);
      await refreshJob();
      toast.success(`Job marked ${isOpen ? "Open" : "Closed"}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update job status");
    } finally {
      setStatusUpdating(false);
    }
  };

  // update individual application status and refresh
  const handleApplicationStatusChange = async (application, newStatus) => {
    try {
      setStatusUpdating(true);
      // updateApplicationStatus(token, { job_id }, status) — adapt if your signature differs
      const res = await updateApplicationStatus(token, { job_id: application.job_id }, newStatus);
      if (res) {
        toast.success(`Application ${application.id} → ${newStatus}`);
        await refreshJob();
      } else {
        toast.error("Update returned no result");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating application");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Build chart data from localJob.applications
  const charts = useMemo(() => {
    // default empty arrays
    const statusCounts = {};
    const dateCounts = {};
    const expBuckets = {};
    const skillCounts = {};

    (applications || []).forEach((a) => {
      // status
      const status = a.status || "unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      // date (YYYY-MM-DD)
      const day = a.created_at ? new Date(a.created_at).toISOString().slice(0, 10) : "unknown";
      dateCounts[day] = (dateCounts[day] || 0) + 1;

      // experience bucket labeling
      const expNum = a.experience ? Math.floor(Number(a.experience)) : 0;
      const expLabel = expNum < 2 ? "0-1" : expNum < 5 ? "2-4" : expNum < 8 ? "5-7" : "8+";
      expBuckets[expLabel] = (expBuckets[expLabel] || 0) + 1;

      // skills
      if (a.skills) {
        ("" + a.skills)
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
          .forEach((sk) => (skillCounts[sk] = (skillCounts[sk] || 0) + 1));
      }
    });

    const dateSeries = Object.entries(dateCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => (a.date > b.date ? 1 : -1));

    const statusSeries = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

    const expSeries = Object.entries(expBuckets).map(([range, count]) => ({ range, count }));

    const skillSeries = Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const pieSeries = statusSeries.map((s) => ({ name: s.status, value: s.count }));

    return { dateSeries, statusSeries, expSeries, skillSeries, pieSeries };
  }, [applications]);

  const colors = COLOR_THEMES[chartTheme] || COLOR_THEMES.blue;

  // UI helpers
  const isRecruiter = localJob?.recruiter_id === user?.id;
  const candidateApps = (user && applications) ? applications.filter((a) => a.candidate_id === user.id) : [];

  // Loading guard
  if (!isLoaded || loadingJob || loadingLocal) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  if (!localJob) {
    return <div className="p-6">Job not found.</div>;
  }
  const {theme}=useTheme()
  return (
    <div className="space-y-6 px-4 py-6">
      <Toaster position="top-right" />

      {/* header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold">{localJob.title}</h1>
          <div className="text-sm text-muted-foreground mt-1">{localJob.company?.name}</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPinIcon /> <span>{localJob.location || "Remote"}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Briefcase /> <span>{applications.length} Applicants</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-2xl  flex items-center text-sm border font-semibold glass-badge ${localJob.isOpen ? "bg-green-800/30 border-green-600 text-green-600" : "bg-red-800/30 border-red-600  text-red-400"}`}>
              {localJob.isOpen ? <><DoorOpen /> Open</> : <><DoorClosed /> Closed</>}
            </span>
          </div>
        </div>
      </div>

      {/* job meta controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* analytics toggle (recruiter only) */}
          {isRecruiter && (
            <>
            <button
              onClick={() => setShowAnalytics((s) => !s)}
              className="inline-flex items-center gap-2 px-3 py-1 border cursor-pointer rounded-md bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-100 dark:text-black text-sm transition"
            >
              <Activity size={16} />
              {showAnalytics ? "Hide Analytics" : "Show Analytics"}
            </button>
            <div className={`hidden sm:flex  items-center gap-2 text-sm text-muted-foreground`}>
            <Palette size={14} />
            <span className="text-xs">Theme: <strong className="ml-1">{chartTheme}</strong></span>
          </div>
            </>
          )}

         
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => refreshJob()} className="inline-flex items-center gap-2 px-3 py-1 rounded-md cursor-pointer text-sm">
            <RefreshCw size={14} /> Refresh
          </Button>

          {isRecruiter && (
            <Select onValueChange={handleHiringStatusChange} defaultValue={localJob.isOpen ? "open" : "closed"}>
              <SelectTrigger className={`w-44 cursor-pointer ${localJob.isOpen ? "bg-green-950 text-white" : "bg-red-950 text-white"}`}>
                <SelectValue placeholder={`Hiring (${localJob.isOpen ? "Open" : "Closed"})`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="cursor-pointer" value="open">Open</SelectItem>
                <SelectItem className="cursor-pointer" value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* description & requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About the job</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base">{localJob.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What we are looking for</CardTitle>
            </CardHeader>
            <CardContent>

               <div data-color-mode={theme === "dark" ? "dark" : "light"}>
                <div className="wmde-markdown-var"> </div>
                    <MDEditor.Markdown 
                source={job?.requirements}
                className="bg-transparent sm:text-lg p-4 rounded-xl" // add global ul styles - tutorial
              />
              </div>
             
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Posted</div>
                <div className="text-sm">{new Date(localJob.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Type</div>
                <div className="text-sm">{localJob.employment_type || "Full time"}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Location</div>
                <div className="text-sm">{localJob.location || "Remote"}</div>
              </div>
            </CardContent>
          </Card>

          {/* candidate apply drawer */}
          {localJob.recruiter_id !== user?.id && (
            <ApplyJobDrawer
              job={localJob}
              user={user}
              fetchJob={() => fnJob().then((r) => { setLocalJob(r || localJob); setApplications((r || localJob)?.applications || []); })}
              applied={localJob.applications?.find((ap) => ap.candidate_id === user?.id)}
            />
          )}
        </div>
      </div>

      {/* Analytics panel — animated show/hide, contains chart theme selector and the charts */}
      <AnimatePresence>
        {isRecruiter && showAnalytics && (
          <motion.section
            key="analytics-panel"
            initial={{ height: 0, opacity: 0, y: -8 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="py-4">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">Analytics</h3>
                  <div className="text-sm text-muted-foreground">Insights for this job</div>
                </div>

                {/* Chart theme selector (moved inside analytics as requested) */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Palette size={16} />
                    <Select onValueChange={(val) => setChartTheme(val)} defaultValue={chartTheme}>
                      <SelectTrigger className="w-44 cursor-pointer">
                        <SelectValue placeholder="Chart theme" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(COLOR_THEMES).map(([name, arr]) => (
                          <SelectItem className="cursor-pointer" key={name} value={name}>
                            <div className="flex items-center gap-3">
                              <div className="flex gap-1">
                                {arr.slice(0, 5).map((c, i) => (
                                  <span key={i} style={{ background: c }} className="w-4 h-4 rounded-sm border" />
                                ))}
                              </div>
                              <div className="text-sm">{name}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Tabs defaultValue={chartsTab} onValueChange={(v) => setChartsTab(v)}>
                <TabsList
  className="
    flex gap-2 p-1 rounded-xl border 
    bg-gray-100/60 border-gray-300 
    dark:bg-gray-900/60 dark:border-gray-700
    transition-all duration-300
  "
>
  <TabsTrigger
    value="overview"
     className="
      flex-1 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer 
    text-gray-700 dark:text-gray-300
    hover:bg-gray-200 dark:hover:bg-gray-800
      data-[state=active]:shadow-md
      transition-all duration-300
    "
  >
    Overview
  </TabsTrigger>

  <TabsTrigger
    value="funnel"
     className="
      flex-1 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer 
    text-gray-700 dark:text-gray-300
    hover:bg-gray-200 dark:hover:bg-gray-800
      data-[state=active]:shadow-md
      transition-all duration-300
    "
  >
    Funnel
  </TabsTrigger>

  <TabsTrigger
    value="skills"
    className="
      flex-1 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer 
    text-gray-700 dark:text-gray-300
    hover:bg-gray-200 dark:hover:bg-gray-800
      data-[state=active]:shadow-md
      transition-all duration-300
    "
  >
    Skills
  </TabsTrigger>
</TabsList>


                {/* Overview tab */}
                <TabsContent value="overview" className="mt-4">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Area chart: applications over time */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><PieIcon /> Applications Over Time</CardTitle>
                        </CardHeader>
                        <CardContent style={{ height: 260 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={charts.dateSeries}>
                              <defs>
                                <linearGradient id="areaGrad1" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={colors[0]} stopOpacity={0.6} />
                                  <stop offset="95%" stopColor={colors[1]} stopOpacity={0.08} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                              <YAxis />
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
                              <Area type="monotone" dataKey="count" stroke={colors[2]} fill="url(#areaGrad1)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Status line (solid) */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><LineIcon /> Status Counts</CardTitle>
                        </CardHeader>
                        <CardContent style={{ height: 260 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={charts.statusSeries}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="status" />
                              <YAxis />
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
                              <Line type="monotone" dataKey="count" stroke={colors[3] || colors[2]} strokeWidth={3} />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Pie: status mix */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><BarIcon /> Status Mix</CardTitle>
                        </CardHeader>
                        <CardContent style={{ height: 260 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={charts.pieSeries} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={70} label>
                                {charts.pieSeries.map((entry, idx) => (
                                  <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
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
                              <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Funnel tab */}
                <TabsContent value="funnel" className="mt-4">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Experience (Dotted line + Bar)</CardTitle>
                        </CardHeader>
                        <CardContent style={{ height: 320 }}>
                          <ResponsiveContainer>
                            <ComposedChart data={charts.expSeries}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="range" />
                              <YAxis />
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
                              <Bar dataKey="count" barSize={18} fill={colors[1]} />
                              <Line type="monotone" dataKey="count" stroke={colors[2]} strokeDasharray="4 4" dot />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Applications Timeline (Line Dotted)</CardTitle>
                        </CardHeader>
                        <CardContent style={{ height: 320 }}>
                          <ResponsiveContainer>
                            <LineChart data={charts.dateSeries}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
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
                              <Line type="monotone" dataKey="count" stroke={colors[0]} strokeDasharray="3 4" dot />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Skills tab */}
                <TabsContent value="skills" className="mt-4">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Skills (Bar)</CardTitle>
                      </CardHeader>
                      <CardContent style={{ height: 360 }}>
                        <ResponsiveContainer>
                          <BarChart data={charts.skillSeries} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="skill" width={140} />
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
                            <Bar dataKey="count" fill={colors[2]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Applications list */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Applications</h2>
          <div className="text-sm text-muted-foreground">{(isRecruiter ? applications.length : candidateApps.length)} visible</div>
        </div>

        <div className="space-y-3 mt-3">
          <AnimatePresence>
            {(isRecruiter ? applications : candidateApps).map((app) => (
              <motion.div key={app.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <ApplicationCard
                  application={app}
                  job={job}
                  onDownload={() => {
                    if (!app.resume) return toast.error("No resume");
                    const link = document.createElement("a");
                    link.href = app.resume;
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    link.click();
                  }}
                  isCandidate={!isRecruiter}
                  onStatusChange={(application, newStatus) => handleApplicationStatusChange(application, newStatus)}
                  loadingStatus={statusUpdating}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
