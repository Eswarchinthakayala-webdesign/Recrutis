import supabaseClient, { supabaseUrl } from "../../utils/supabase";

// Apply to job (candidate)
export async function applyToJob(token, _, jobData) {
  try {
    const supabase = await supabaseClient(token);

    const random = Math.floor(Math.random() * 90000);
    const fileName = `resume-${random}-${jobData.candidate_id}`;

    const { error: storageError } = await supabase.storage
      .from("resumes")
      .upload(fileName, jobData.resume);

    if (storageError) throw new Error("Error uploading Resume");

    const resume = `${supabaseUrl}/storage/v1/object/public/resumes/${fileName}`;

    const { data, error } = await supabase
      .from("applications")
      .insert([{ ...jobData, resume }])
      .select();

    if (error) throw error;

    return data;
  } catch (err) {
    console.error("applyToJob error:", err);
    throw new Error(err.message || "Failed to apply for job");
  }
}

// Update application status (recruiter)
export async function updateApplicationStatus(token, { job_id }, status) {
  try {
    const supabase = await supabaseClient(token);

    const { data, error } = await supabase
      .from("applications")
      .update({ status })
      .eq("job_id", job_id)
      .select();

    if (error || data.length === 0) {
      console.error("Error updating application:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("updateApplicationStatus error:", err);
    return null;
  }
}

// Fetch applications
export async function getApplications(token, { user_id }) {
  try {
    const supabase = await supabaseClient(token);

    const { data, error } = await supabase
      .from("applications")
      .select("*, job:jobs(title, company:companies(name))")
      .eq("candidate_id", user_id);

    if (error) {
      console.error("Error fetching applications:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("getApplications error:", err);
    return [];
  }
}
