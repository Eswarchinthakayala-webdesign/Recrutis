import React, { useState, useMemo, useCallback } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
  CommandGroup,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

const JobSearchBar = ({ jobs = [], onSearch }) => {
  const [query, setQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  // ✅ Always filter from the full dataset
  const filteredJobs = useMemo(() => {
    if (!query.trim()) return [];
    return jobs
      .filter((job) =>
        job.title.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 6);
  }, [query, jobs]);

  // ✅ When searching manually (button or Enter)
  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    onSearch(query);
  }, [query, onSearch]);

  // ✅ Selecting a suggestion
  const handleSelect = (jobTitle) => {
    setQuery(jobTitle);
    setSelectedJob(jobTitle);
    onSearch(jobTitle);
  };

  // ✅ Typing clears the previous selection so new suggestions appear
  const handleInputChange = (value) => {
    setQuery(value);
    if (selectedJob) setSelectedJob(null);
  };

  return (
    <motion.div
      className="relative w-full mb-3  overflow-hidden"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Command
        className="
          w-full rounded-2xl border dark:border-zinc-700/50 backdrop-blur-xl
          bg-gradient-to-br from-white via-white to-white
          dark:from-gray-900 dark:via-gray-950/90 dark:to-black/80
          text-gray-800 dark:text-gray-100
          shadow-lg overflow-hidden transition-all duration-300
        "
      >
        {/* 🔍 Search Input */}
        <div className="flex items-center justify-between px-3 border-b border-gray-300/40 dark:border-gray-700/50">
         
          <CommandInput
            placeholder="Search jobs by title..."
            value={query}
            onValueChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="
              flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100
              placeholder:text-gray-500 dark:placeholder:text-gray-400
              focus-visible:outline-none
            "
          />
          <Button
            size="sm"
            className="
              ml-2 sm:w-24 rounded-lg bg-gray-800 cursor-pointer text-gray-100
              hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600
              transition-all duration-200 m-2
            "
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>

        {/* 💡 Suggestion List */}
        <CommandList
          className="
            max-h-56 overflow-y-auto
            bg-gradient-to-b from-gray-50 via-white to-white
            dark:from-gray-950/90 dark:via-gray-950 dark:to-gray-950/90
          "
        >
          {/* Show only when user is typing */}
          {query.trim() && filteredJobs.length === 0 && (
            <CommandEmpty className="p-3 text-gray-500 text-sm">
              No matching jobs found.
            </CommandEmpty>
          )}

          {filteredJobs.length > 0 && (
            <CommandGroup
              heading="Suggestions"
              className="text-xs text-gray-500 uppercase tracking-wide px-3 mt-2"
            >
              {filteredJobs.map((job) => (
                <CommandItem
                  key={job.id}
                  value={job.title}
                  onSelect={() => handleSelect(job.title)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer
                    text-gray-700 dark:text-gray-200
                    hover:text-gray-900 dark:hover:text-gray-50
                    hover:bg-gray-200/50 dark:hover:bg-gray-800/60
                    transition-all duration-150
                    ${selectedJob === job.title ? "bg-gray-300/40 dark:bg-gray-800/40" : ""}
                  `}
                >
                  <Briefcase className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <span className="truncate">{job.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </motion.div>
  );
};

export default JobSearchBar;
