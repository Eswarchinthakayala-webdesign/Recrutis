/* eslint-disable react/prop-types */
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { addNewCompany } from "@/api/apiCompanies";
import { BarLoader } from "react-spinners";
import { useEffect } from "react";
import useFetch from "../../hooks/use-fetch";
import { Building2, Plus, UploadCloud, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const schema = z.object({
  name: z.string().min(1, { message: "Company name is required" }),
  logo: z
    .any()
    .refine(
      (file) =>
        file?.[0] &&
        ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
          file[0].type
        ),
      {
        message: "Only image files are allowed",
      }
    ),
});

const AddCompanyDrawer = ({ fetchCompanies }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const {
    loading: loadingAddCompany,
    error: errorAddCompany,
    data: dataAddCompany,
    fn: fnAddCompany,
  } = useFetch(addNewCompany);

  const onSubmit = async (data) => {
    fnAddCompany({
      ...data,
      logo: data.logo[0],
    });
  };

  useEffect(() => {
    if (dataAddCompany?.length > 0) {
      fetchCompanies();
      reset();
    }
  }, [loadingAddCompany]);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div
         
          className="cursor-pointer"
        >
          <Button
            size="sm"
            className="
              flex items-center gap-2 
              rounded-xl 
              bg-gradient-to-r from-white via-gray-100 to-white 
              dark:from-gray-800 dark:via-gray-900 dark:to-gray-800
              border border-gray-400/30 dark:border-gray-700/60 
              text-gray-800 dark:text-gray-100
              shadow-md 
              transition-all duration-300
              cursor-pointer
            "
          >
            <div className="flex items-center gap-1 sm:hidden">
              <Building2 size={16} />
              <Plus size={16} />
            </div>
            <span className="hidden sm:flex items-center gap-2">
              <Building2 size={16} />
              Add Company
            </span>
          </Button>
        </div>
      </DrawerTrigger>

      <DrawerContent
        className="
          backdrop-blur-xl 
          bg-gradient-to-b from-white to-white
          dark:from-gray-900/80 dark:to-gray-800/60
          border-t border-gray-400/40 dark:border-gray-700/40
          shadow-2xl rounded-t-3xl
          p-6 sm:p-8 
          transition-all duration-700
        "
      >
        {/* Header */}
        <DrawerHeader className="text-center space-y-2">
          <DrawerTitle className="text-lg sm:text-xl font-semibold flex justify-center items-center gap-2 text-gray-800 dark:text-gray-100">
            <Badge
              variant="secondary"
              className="
                bg-gradient-to-r from-gray-200 to-gray-100 
                dark:from-gray-800 dark:to-gray-700
                border border-gray-300 dark:border-gray-700
                text-gray-800 dark:text-gray-100
                rounded-full px-4 py-1 text-sm font-medium
                shadow-inner
              "
            >
              <Sparkles size={15} className="mr-1 inline" />
              Add a New Company
            </Badge>
          </DrawerTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create a new company profile and upload its logo.
          </p>
        </DrawerHeader>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6 mt-4 px-4"
        >
          {/* Company Name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Company Name
            </label>
            <Input
              placeholder="e.g. Recrutis Pvt Ltd"
              {...register("name")}
              className="
                rounded-xl 
                bg-white/70 dark:bg-gray-800/60 
                border-gray-300 dark:border-gray-700
                focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600
                focus:border-transparent 
                transition-all
                cursor-pointer
              "
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Logo Upload */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Company Logo
            </label>
            <div className="relative group cursor-pointer">
              <Input
                type="file"
                accept="image/*"
                {...register("logo")}
                className="
                  cursor-pointer
                  bg-white/70 dark:bg-gray-800/60 
                  border-gray-300 dark:border-gray-700 
                  file:bg-transparent file:border-none 
                  file:text-gray-700 dark:file:text-gray-300 
                  file:font-medium rounded-xl
                  hover:shadow-md hover:shadow-gray-300/20 dark:hover:shadow-gray-800/50
                  transition-all
                "
              />
              <UploadCloud
                size={18}
                className="absolute right-3 top-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
              />
            </div>
            {errors.logo && (
              <p className="text-xs text-red-500">{errors.logo.message}</p>
            )}
          </div>

          {/* Loader */}
          {loadingAddCompany && (
            <BarLoader width={"100%"} color="#9ca3af" className="rounded-full" />
          )}

          {/* Submit */}
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              type="submit"
              className="
                w-full py-2
                bg-gradient-to-r from-gray-800 to-gray-600 
                dark:from-gray-100 dark:to-gray-300 
                text-white dark:text-gray-900
                rounded-xl 
                shadow-md hover:shadow-xl 
                transition-all duration-300 
                cursor-pointer
              "
            >
              <Plus size={16} className="mr-2" />
              Add Company
            </Button>
          </motion.div>

          {/* Error Message */}
          {errorAddCompany?.message && (
            <p className="text-sm text-red-500">{errorAddCompany?.message}</p>
          )}
        </motion.form>

        {/* Footer */}
        <DrawerFooter className="mt-6">
          <DrawerClose asChild>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                variant="outline"
                className="
                  w-full rounded-xl 
                  border-gray-400/50 dark:border-gray-700/60 
                  hover:bg-gray-200 dark:hover:bg-gray-800 
                  text-gray-700 dark:text-gray-300
                  transition-all cursor-pointer
                "
              >
                Cancel
              </Button>
            </motion.div>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AddCompanyDrawer;
