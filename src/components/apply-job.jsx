/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BarLoader } from "react-spinners";
import useFetch from "../../hooks/use-fetch";
import { applyToJob } from "../api/apiApplications";
import {
  Ban,
  BookCheck,
  User,
  GraduationCap,
  FileText,
  ClipboardList,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const schema = z.object({
  name: z.string().min(1, { message: "Full name is required" }),
  experience: z
    .number()
    .min(0, { message: "Experience must be at least 0" })
    .int(),
  skills: z.string().min(1, { message: "Skills are required" }),
  education: z.enum(["Intermediate", "Graduate", "Post Graduate"], {
    message: "Education is required",
  }),
  resume: z
    .any()
    .refine(
      (file) =>
        file[0] &&
        (file[0].type === "application/pdf" ||
          file[0].type === "application/msword" ||
          file[0].type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      { message: "Only PDF or Word documents are allowed" }
    ),
});

export function ApplyJobDrawer({ user, job, fetchJob, applied = false }) {
  const { theme } = useTheme();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const {
    loading: loadingApply,
    error: errorApply,
    fn: fnApply,
  } = useFetch(applyToJob);

  useEffect(() => {
    if (user?.fullName) {
      setValue("name", user.fullName);
    }
  }, [user, setValue]);

  const onSubmit = (data) => {
    fnApply({
      ...data,
      job_id: job.id,
      candidate_id: user.id,
      status: "applied",
      resume: data.resume[0],
    }).then(() => {
      fetchJob();
      reset();
    });
  };

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <Drawer open={applied ? false : undefined}>
      <DrawerTrigger asChild>
        <Button
          size="lg"
          variant={job?.isOpen && !applied ? "" : "destructive"}
          disabled={!job?.isOpen || applied}
          className={`cursor-pointer rounded-xl text-base font-medium px-6 py-2.5 
            transition-all duration-300 
          `}
        >
          <BookCheck className="mr-2 h-4 w-4" />
          {job?.isOpen ? (applied ? "Applied" : "Apply") : "Hiring Closed"}
        </Button>
      </DrawerTrigger>

      <DrawerContent
        className={`rounded-t-2xl border-t ${
          isDark
            ? "bg-gradient-to-br from-gray-950 to-gray-950 text-gray-100 border-gray-100/30"
            : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 border-gray-300"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <DrawerHeader className="text-center space-y-1">
            <DrawerTitle className="text-xl font-semibold flex justify-center items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Apply for {job?.title}
            </DrawerTitle>
            <DrawerDescription className="text-gray-500">
              at {job?.company?.name}
            </DrawerDescription>
          </DrawerHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 p-4 pb-0"
          >
            {/* Name Field */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-gray-500" />
                <Label className="text-sm">Full Name</Label>
              </div>
              <Input
                type="text"
                placeholder="Enter your full name"
                className="flex-1"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Experience */}
           

            {/* Skills */}
            <div className="flex flex-row items-center gap-3 w-full">
               <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-4 h-4 text-gray-500" />
                <Label className="text-sm">Experience (years)</Label>
              </div>
              <Input
                type="number"
                placeholder="Years of Experience"
                className="flex-1"
                {...register("experience", {
                  valueAsNumber: true,
                })}
              />
              {errors.experience && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.experience.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-gray-500" />
                <Label className="text-sm">Skills</Label>
              </div>
              <Input
                type="text"
                placeholder="e.g. React, Node.js, Python"
                className="flex-1"
                {...register("skills")}
              />
              {errors.skills && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.skills.message}
                </p>
              )}
            </div>
            </div>

            {/* Education */}
            <div className="space-y-2">
              <Label>Education</Label>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    {["Intermediate", "Graduate", "Post Graduate"].map(
                      (edu) => (
                        <div
                          key={edu}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <RadioGroupItem value={edu} id={edu} />
                          <Label htmlFor={edu}>{edu}</Label>
                        </div>
                      )
                    )}
                  </RadioGroup>
                )}
              />
              {errors.education && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.education.message}
                </p>
              )}
            </div>

            {/* Resume Upload */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-gray-500" />
                <Label className="text-sm">Upload Resume</Label>
              </div>
              <Input
                type="file"
                accept=".pdf, .doc, .docx"
                className="flex-1 file:cursor-pointer file:rounded-md file:border-0 file:px-3 file:py-2 file:bg-gray-200 dark:file:bg-gray-700 file:text-gray-800 dark:file:text-gray-200"
                {...register("resume")}
              />
              {errors.resume && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.resume.message}
                </p>
              )}
            </div>

            {errorApply?.message && (
              <p className="text-red-500 text-sm">{errorApply?.message}</p>
            )}
            {loadingApply && (
              <BarLoader width={"100%"} color={isDark ? "#36d7b7" : "#111"} />
            )}

            <motion.div
              whileHover={{ scale: 1.00 }}
              whileTap={{ scale: 0.97 }}
              className="mt-2"
            >
              <Button
                type="submit"
                size="lg"
                className={`w-full cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 
                  ${
                    isDark
                      ? "bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-gray-100"
                      : "bg-gradient-to-r from-gray-200 to-gray-100 hover:from-gray-300 hover:to-gray-200 text-gray-900"
                  }`}
              >
                <BookCheck className="h-5 w-5" />
                Submit Application
              </Button>
            </motion.div>
          </form>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="cursor-pointer flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-300"
              >
                <Ban className="h-4 w-4" />
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </motion.div>
      </DrawerContent>
    </Drawer>
  );
}
