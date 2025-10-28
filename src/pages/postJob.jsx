import { getCompanies } from "@/api/apiCompanies";
import { addNewJob } from "@/api/apiJobs";
import AddCompanyDrawer from "@/components/add-company-drawer";
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
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import MDEditor from "@uiw/react-md-editor";
import { State } from "country-state-city";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { BarLoader, HashLoader } from "react-spinners";
import { z } from "zod";
import useFetch from "../../hooks/use-fetch";
import { useTheme } from "../components/theme-provider";
import TextShimmer from "../components/text-shimmer";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import { toast } from "sonner";

// ✅ Validation Schema
const schema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  location: z.string().min(1, { message: "Select a location" }),
  company_id: z.string().min(1, { message: "Select or add a company" }),
  requirements: z.string().min(1, { message: "Requirements are required" }),
});

const PostJob = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // 🔹 Form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: { title: "", description: "", location: "", company_id: "", requirements: "" },
    resolver: zodResolver(schema),
  });

  // 🔹 Create Job
  const {
    loading: loadingCreateJob,
    error: errorCreateJob,
    data: dataCreateJob,
    fn: fnCreateJob,
  } = useFetch(addNewJob);

  const onSubmit = async (data) => {
    toast.loading("Posting your job...");
    try {
      await fnCreateJob({
        ...data,
        recruiter_id: user.id,
        isOpen: true,
      });
      toast.success("Job posted successfully 🎉");
      reset();
      navigate("/jobs");
    } catch (err) {
      toast.error("Failed to post job");
      console.error(err);
    }
  };

  // 🔹 Companies
  const {
    loading: loadingCompanies,
    data: companies,
    fn: fnCompanies,
  } = useFetch(getCompanies);

  useEffect(() => {
    if (isLoaded) fnCompanies();
  }, [isLoaded]);

  if (!isLoaded || loadingCompanies) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <HashLoader width={"60%"} color="#374151" />
        <p className="text-gray-500 mt-3">Loading company data...</p>
      </div>
    );
  }

  if (user?.unsafeMetadata?.role !== "recruiter") {
    return <Navigate to="/jobs" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* 🔹 Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-8"
      >
       <TextShimmer className="font-extrabold text-4xl sm:text-5xl bg-gradient-to-r from-gray-700 via-gray-900 to-gray-600 dark:from-gray-200 dark:via-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
                   Post a Job
                 </TextShimmer>

        {/* 🔄 Refresh Button */}
        <Button
          onClick={fnCompanies}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 transition"
        >
          <RotateCw
            size={18}
            className={`transition-transform ${loadingCompanies ? "animate-spin text-primary" : ""}`}
          />
          Refresh
        </Button>
      </motion.div>

      {/* 🔹 Job Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 bg-gray-50/70 dark:bg-gray-950/70 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-100/25 backdrop-blur"
      >
        <div>
          <Input
            placeholder="Job Title"
            {...register("title")}
            className="bg-white dark:bg-gray-950/50"
          />
          {errors.title && <p className="text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <Textarea
            placeholder="Job Description"
            {...register("description")}
            className="bg-white dark:bg-gray-950/50"
          />
          {errors.description && <p className="text-red-500 mt-1">{errors.description.message}</p>}
        </div>

        <div className="flex flex-wrap flex-row gap-4">
          {/* 🏙️ Location Select */}
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="dark:text-gray-100 cursor-pointer text-gray-800 bg-white dark:bg-gray-950/50">
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {State.getStatesOfCountry("IN").map(({ name }) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />

          {/* 🏢 Company Select */}
          <Controller
            name="company_id"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="dark:text-gray-100 cursor-pointer text-gray-800 bg-white dark:bg-gray-950/50">
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {companies?.map(({ id, name }) => (
                      <SelectItem key={id} value={String(id)}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />

          <AddCompanyDrawer fetchCompanies={fnCompanies} />
        </div>

        {(errors.location || errors.company_id) && (
          <p className="text-red-500 text-sm">
            {errors.location?.message || errors.company_id?.message}
          </p>
        )}

        {/* 🧠 Requirements */}
        <Controller
          name="requirements"
          control={control}
          render={({ field }) => (
            <div
              data-color-mode={theme === "dark" ? "dark" : "light"}
              className="rounded-md  border border-gray-200 dark:border-gray-800"
            >
              <MDEditor
                value={field.value}
                onChange={field.onChange}
                height={250}
                data-color-mode={theme === "dark" ? "dark" : "light"}
              />
            </div>
          )}
        />
        {errors.requirements && <p className="text-red-500 mt-1">{errors.requirements.message}</p>}

        {/* 🧾 Error + Loader */}
        {errorCreateJob && <p className="text-red-500">{errorCreateJob.message}</p>}
        {loadingCreateJob && <HashLoader width={"100%"} color="#374151" />}

        {/* 🔘 Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 transition cursor-pointer"
        >
          Submit Job
        </Button>
      </form>
    </div>
  );
};

export default PostJob;
