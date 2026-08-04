# Supabase Email Templates Guide

This directory contains clean, modern, responsive HTML email templates for ResumeX AI.

---

## 🛠️ How to Upload to Supabase Dashboard

1. Log in to your **[Supabase Dashboard](https://supabase.com/dashboard)** and select your project.
2. Go to **Authentication** in the sidebar and click **Email Templates**.

### 1. Confirm Signup Template
- **Subject:** `Confirm Your Email Address - ResumeX AI 🚀`
- **Body:** Copy and paste the contents of `supabase/email-templates/confirm-signup.html`.
- Click **Save**.

### 2. Reset Password Template
- **Subject:** `Reset Your Password - ResumeX AI 🔒`
- **Body:** Copy and paste the contents of `supabase/email-templates/reset-password.html`.
- Click **Save**.

---

## 🔗 Redirect URL Configuration
In **Authentication -> URL Configuration**:
- **Site URL:** `http://localhost:3000` (Production: `https://xv-resume.vercel.app`)
- **Redirect URLs:** 
  - `http://localhost:3000/auth/callback`
  - `https://xv-resume.vercel.app/auth/callback`

When users click the button in their email, they will be redirected to the callback route and logged in automatically!
