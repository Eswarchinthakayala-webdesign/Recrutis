import { da } from "zod/v4/locales";
import supabaseClient from "../../utils/supabase";

supabaseClient
// Fetch Jobs
export async function getJobs(token, { location, company_id, searchQuery }) {
  const supabase = await supabaseClient(token);
  let query = supabase
    .from("jobs")
    .select("*, saved: saved_jobs(id), company: companies(name,logo_url)");

  if (location) {
    query = query.eq("location", location);
  }

  if (company_id) {
    query = query.eq("company_id", company_id);
  }

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching Jobs:", error);
    return null;
  }

  return data;
}

// Read Saved Jobs
export async function getSavedJobs(token) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("saved_jobs")
    .select("*, job: jobs(*, company: companies(name,logo_url))");

  if (error) {
    console.error("Error fetching Saved Jobs:", error);
    return null;
  }

  console.log(data)

  return data;
}

// Read single job
export async function getSingleJob(token, { job_id }) {
  const supabase = await supabaseClient(token);
  let query = supabase
    .from("jobs")
    .select(
      "*, company: companies(name,logo_url), applications: applications(*)"
    )
    .eq("id", job_id)
    .single();

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching Job:", error);
    return null;
  }

  return data;
}

// - Add / Remove Saved Job
export async function saveJob(token, _, saveData) {
  const supabase = await supabaseClient(token);
  const { user_id, job_id } = saveData || {};

  if (!user_id || !job_id) {
    console.error("❌ Missing user_id or job_id:", saveData);
    throw new Error("Missing user_id or job_id");
  }

  try {
    // 1️⃣ Check if the job is already saved by this user
    const { data: existing, error: checkError } = await supabase
      .from("saved_jobs")
      .select("id")
      .eq("user_id", user_id)
      .eq("job_id", job_id)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      // 2️⃣ Remove the saved job
      const { error: deleteError } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("user_id", user_id)
        .eq("job_id", job_id);

      if (deleteError) throw deleteError;

      console.log(`🗑️ Removed saved job ${job_id} for user ${user_id}`);
      return { status: "unsaved", job_id };
    } else {
      // 3️⃣ Save the job
      const { data, error: insertError } = await supabase
        .from("saved_jobs")
        .insert([{ user_id, job_id }])
        .select()
        .single();

      if (insertError) throw insertError;

      console.log(`💾 Saved job ${job_id} for user ${user_id}`);
      return { status: "saved", data };
    }
  } catch (error) {
    console.error("❌ Error in saveJob:", error);
    throw error;
  }
}


// - job isOpen toggle - (recruiter_id = auth.uid())
export async function updateHiringStatus(token, { job_id }, isOpen) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("jobs")
    .update({ isOpen })
    .eq("id", job_id)
    .select();

  if (error) {
    console.error("Error Updating Hiring Status:", error);
    return null;
  }

  return data;
}

// get my created jobs
export async function getMyJobs(token, { recruiter_id }) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .select("*, company: companies(name,logo_url)")
    .eq("recruiter_id", recruiter_id);

  if (error) {
    console.error("Error fetching Jobs:", error);
    return null;
  }

  return data;
}

// Delete job
export async function deleteJob(token, { job_id }) {
  const supabase = await supabaseClient(token);

  const { data, error: deleteError } = await supabase
    .from("jobs")
    .delete()
    .eq("id", job_id)
    .select();

  if (deleteError) {
    console.error("Error deleting job:", deleteError);
    return data;
  }

  return data;
}

// - post job
export async function addNewJob(token, _, jobData) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .insert([jobData])
    .select();

  if (error) {
    console.error(error);
    throw new Error("Error Creating Job");
  }

  return data;
}