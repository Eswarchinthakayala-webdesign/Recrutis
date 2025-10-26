import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ComposedChart,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getJobs, getSavedJobs, getMyJobs } from "../api/apiJobs";
import { useAuth } from "@clerk/clerk-react";

const colors = ["#f97316", "#a1a1aa", "#71717a", "#3f3f46", "#18181b", "#e4e4e7"];

const JobAnalytics = () => {
  const { getToken, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Load jobs + saved jobs safely
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken({ template: "supabase" });
        if (!token || !user?.id) return;

        const [jobsData, savedData] = await Promise.all([
          getMyJobs(token, { recruiter_id: user.id }),
          getSavedJobs(token),
        ]);

        console.log("Fetched Jobs:", jobsData);
        console.log("Fetched Saved Jobs:", savedData);

        setJobs(jobsData || []);
        setSavedJobs(savedData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getToken, user]);

  // ✅ If still loading
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg text-orange-400 font-medium"
        >
          Loading analytics...
        </motion.div>
      </div>
    );
  }

  // ✅ Safe fallback demo data if Supabase is empty
  const demoJobs = [
    { created_at: "2025-01-12", isOpen: true, company: { name: "Acme Inc" } },
    { created_at: "2025-02-09", isOpen: true, company: { name: "BetaWorks" } },
    { created_at: "2025-03-05", isOpen: false, company: { name: "Acme Inc" } },
    { created_at: "2025-03-17", isOpen: true, company: { name: "Zenith" } },
  ];

  const safeJobs = jobs?.length ? jobs : demoJobs;
  const safeSaved = savedJobs?.length ? savedJobs : [{ job: { title: "Example Job" } }];

  // ✅ Normalize and aggregate data
  const jobsByMonth = safeJobs.reduce((acc, job) => {
    const date = new Date(job.created_at || Date.now());
    const month = date.toLocaleString("default", { month: "short" });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const chartDataJobsByMonth = Object.entries(jobsByMonth).map(([month, count]) => ({
    month,
    count,
  }));

  const jobsByCompany = safeJobs.reduce((acc, job) => {
    const name = job.company?.name || "Unknown";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const chartDataCompanies = Object.entries(jobsByCompany).map(([company, count]) => ({
    company,
    count,
  }));

  const openJobs = safeJobs.filter((j) => j.isOpen).length;
  const closedJobs = safeJobs.length - openJobs;

  const pieData = [
    { name: "Open", value: openJobs },
    { name: "Closed", value: closedJobs },
  ];

  const savedTrend = safeSaved.map((item, i) => ({
    job: item.job?.title || `Job ${i + 1}`,
    saves: 1,
  }));

  // ✅ Chart Components
  const chartContainer = "bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden";
  const tooltipStyle = { background: "#18181b", border: "1px solid #27272a" };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 space-y-8">
      <motion.h1
        className="text-3xl font-bold text-orange-400 mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Job Analytics Dashboard
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1️⃣ AreaChart - Jobs Created */}
        <Card className={chartContainer}>
          <CardHeader>
            <CardTitle>Jobs Created Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <AreaChart data={chartDataJobsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#f97316" }} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 2️⃣ LineChart - Saved Jobs */}
        <Card className={chartContainer}>
          <CardHeader>
            <CardTitle>Saved Jobs Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <LineChart data={savedTrend}>
                <CartesianGrid stroke="#27272a" />
                <XAxis dataKey="job" hide />
                <YAxis stroke="#a1a1aa" />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#f97316" }} />
                <Line
                  type="monotone"
                  dataKey="saves"
                  stroke="#f97316"
                  strokeDasharray="4 2"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 3️⃣ BarChart - Jobs per Company */}
        <Card className={chartContainer}>
          <CardHeader>
            <CardTitle>Jobs per Company</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <BarChart data={chartDataCompanies}>
                <CartesianGrid stroke="#27272a" />
                <XAxis dataKey="company" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 4️⃣ PieChart - Status */}
        <Card className={chartContainer}>
          <CardHeader>
            <CardTitle>Open vs Closed Jobs</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 5️⃣ RadarChart - Distribution */}
        <Card className={chartContainer}>
          <CardHeader>
            <CardTitle>Job Distribution (Radar)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <RadarChart data={chartDataCompanies}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="company" stroke="#a1a1aa" />
                <PolarRadiusAxis stroke="#a1a1aa" />
                <Radar
                  name="Jobs"
                  dataKey="count"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.4}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 6️⃣ ComposedChart - Overview */}
        <Card className={chartContainer}>
          <CardHeader>
            <CardTitle>Monthly Hiring Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <ComposedChart data={chartDataJobsByMonth}>
                <CartesianGrid stroke="#27272a" />
                <XAxis dataKey="month" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" fill="#f97316" fillOpacity={0.3} />
                <Line type="monotone" dataKey="count" stroke="#a1a1aa" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobAnalytics;
