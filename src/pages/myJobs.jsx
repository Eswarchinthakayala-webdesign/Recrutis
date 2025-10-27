import CreatedApplications from "@/components/created-applications";
import CreatedJobs from "@/components/created-jobs";
import { useUser } from "@clerk/clerk-react";
import { BarLoader } from "react-spinners";
import TextShimmer from "../components/text-shimmer";

const MyJobs = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  return (
    <div className="overflow-hidden">
      <TextShimmer className="px-1 gradient-title font-extrabold text-4xl sm:text-7xl flex items-center justify-center pb-8">
        {user?.unsafeMetadata?.role === "candidate"
          ? "My Applications"
          : ""}
      </TextShimmer>
      {user?.unsafeMetadata?.role === "candidate" ? (
        <CreatedApplications />
      ) : (
        <CreatedJobs />
      )}
    </div>
  );
};

export default MyJobs;