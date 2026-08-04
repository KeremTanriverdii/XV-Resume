-- ============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES FOR RESUMEX AI
-- Run these SQL statements in your Supabase SQL Editor (Database -> SQL Editor)
-- ============================================================================

-- 1. Enable RLS on core tables
ALTER TABLE IF EXISTS "Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Resumes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "ResumeTranslations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Educations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Experiences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "ProfileProjects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "ProfileEducations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "ProfileExperiences" ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. Users Table Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users owner access" ON "Users";
CREATE POLICY "Users owner access" ON "Users"
  FOR ALL
  USING (auth.uid()::text = "Id")
  WITH CHECK (auth.uid()::text = "Id");

-- ----------------------------------------------------------------------------
-- 3. Profiles Table Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles owner access" ON "Profiles";
CREATE POLICY "Profiles owner access" ON "Profiles"
  FOR ALL
  USING (auth.uid()::text = "UserId")
  WITH CHECK (auth.uid()::text = "UserId");

-- ----------------------------------------------------------------------------
-- 4. Resumes Table Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Resumes owner access" ON "Resumes";
CREATE POLICY "Resumes owner access" ON "Resumes"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Profiles" p
      WHERE p."Id" = "Resumes"."ProfileId" AND p."UserId" = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Profiles" p
      WHERE p."Id" = "Resumes"."ProfileId" AND p."UserId" = auth.uid()::text
    )
  );

-- ----------------------------------------------------------------------------
-- 5. ResumeTranslations Table Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "ResumeTranslations owner access" ON "ResumeTranslations";
CREATE POLICY "ResumeTranslations owner access" ON "ResumeTranslations"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Resumes" r
      JOIN "Profiles" p ON r."ProfileId" = p."Id"
      WHERE r."Id" = "ResumeTranslations"."ResumeId" AND p."UserId" = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Resumes" r
      JOIN "Profiles" p ON r."ProfileId" = p."Id"
      WHERE r."Id" = "ResumeTranslations"."ResumeId" AND p."UserId" = auth.uid()::text
    )
  );

-- ----------------------------------------------------------------------------
-- 6. Standalone Entity Tables Policies (Projects, Educations, Experiences)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Projects owner access" ON "Projects";
CREATE POLICY "Projects owner access" ON "Projects"
  FOR ALL
  USING (auth.uid()::text = "UserId")
  WITH CHECK (auth.uid()::text = "UserId");

DROP POLICY IF EXISTS "Educations owner access" ON "Educations";
CREATE POLICY "Educations owner access" ON "Educations"
  FOR ALL
  USING (auth.uid()::text = "UserId")
  WITH CHECK (auth.uid()::text = "UserId");

DROP POLICY IF EXISTS "Experiences owner access" ON "Experiences";
CREATE POLICY "Experiences owner access" ON "Experiences"
  FOR ALL
  USING (auth.uid()::text = "UserId")
  WITH CHECK (auth.uid()::text = "UserId");

-- ----------------------------------------------------------------------------
-- 7. Join Tables Policies (ProfileProjects, ProfileEducations, ProfileExperiences)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "ProfileProjects owner access" ON "ProfileProjects";
CREATE POLICY "ProfileProjects owner access" ON "ProfileProjects"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Profiles" p
      WHERE p."Id" = "ProfileProjects"."ProfileId" AND p."UserId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "ProfileEducations owner access" ON "ProfileEducations";
CREATE POLICY "ProfileEducations owner access" ON "ProfileEducations"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Profiles" p
      WHERE p."Id" = "ProfileEducations"."ProfileId" AND p."UserId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "ProfileExperiences owner access" ON "ProfileExperiences";
CREATE POLICY "ProfileExperiences owner access" ON "ProfileExperiences"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Profiles" p
      WHERE p."Id" = "ProfileExperiences"."ProfileId" AND p."UserId" = auth.uid()::text
    )
  );
