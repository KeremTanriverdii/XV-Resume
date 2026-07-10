"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { fetchCurrentUser, updateCurrentUser } from "@/services/userService";
import { UserUpdateDto, MilitaryStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AutocompleteInput from "@/components/ui/autocomplete-input";
import PhoneInput from "@/components/ui/phone-input";
import { LOCATIONS } from "@/lib/autocomplete-data";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Languages, 
  Save, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  ShieldAlert
} from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { session } = useAuth();
  const token = session?.access_token;

  // Fetch current user details
  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => fetchCurrentUser(token),
    enabled: !!token,
  });

  // State management
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [militaryStatus, setMilitaryStatus] = useState<MilitaryStatus>("None");
  const [militaryPostponedUntil, setMilitaryPostponedUntil] = useState<string>("");
  const [chosenLanguage, setChosenLanguage] = useState(locale);

  // Status banners
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Sync state when data is loaded
  useEffect(() => {
    if (userData) {
      setFullname(userData.name || "");
      setPhone(userData.phone || "");
      setLocation(userData.districtAndCityLocation || "");
      setMilitaryStatus(userData.militaryStatus || "None");
      setChosenLanguage(userData.choosedLanguage || locale);

      if (userData.militaryPostponedUntil) {
        // Format to YYYY-MM-DD for date input
        const date = new Date(userData.militaryPostponedUntil);
        if (!isNaN(date.getTime())) {
          setMilitaryPostponedUntil(date.toISOString().split("T")[0]);
        } else {
          setMilitaryPostponedUntil("");
        }
      } else {
        setMilitaryPostponedUntil("");
      }
    }
  }, [userData, locale]);

  // Mutation for updating user info
  const mutation = useMutation({
    mutationFn: (updatedData: UserUpdateDto) => updateCurrentUser(updatedData, token),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["currentUser"], updatedUser);
      setNotification({ type: "success", message: t("success") });
      
      // Auto-hide notification
      setTimeout(() => setNotification(null), 5000);

      // If interface language has changed, redirect/reload to update translation context
      if (updatedUser && updatedUser.choosedLanguage !== locale) {
        router.replace(pathname, { locale: updatedUser.choosedLanguage as any });
      }
    },
    onError: () => {
      setNotification({ type: "error", message: t("error") });
      setTimeout(() => setNotification(null), 5000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateDto: UserUpdateDto = {
      fullname: fullname.trim(),
      phone: phone.trim(),
      districtAndCityLocation: location.trim(),
      choosedLanguage: chosenLanguage,
      militaryStatus,
      militaryPostponedUntil: militaryStatus === "Postponed" && militaryPostponedUntil 
        ? new Date(militaryPostponedUntil).toISOString()
        : null
    };

    mutation.mutate(updateDto);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto py-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Separator />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center max-w-md mx-auto">
        <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h3 className="font-semibold text-lg">{t("error")}</h3>
        <p className="text-sm text-muted-foreground">Could not load settings. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("personalInfo")}</p>
      </div>
      <Separator />

      {notification && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
          notification.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
            : "bg-destructive/10 border-destructive/20 text-destructive"
        }`}>
          {notification.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-card border border-border/55 rounded-3xl p-6 md:p-8 shadow-sm">
        {/* Full Name */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            {t("fullname")} <span className="text-destructive">*</span>
          </label>
          <Input
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
            maxLength={200}
            className="rounded-xl border-muted-foreground/30 focus-visible:ring-primary/50 py-5"
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            {t("phone")}
          </label>
          <PhoneInput
            value={phone}
            onChange={setPhone}
          />
        </div>

        {/* Location */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            {t("location")}
          </label>
          <AutocompleteInput
            suggestions={LOCATIONS}
            value={location}
            onChange={setLocation}
            placeholder={t("locationPlaceholder")}
            className="rounded-xl border-muted-foreground/30 focus-visible:ring-primary/50 py-5"
          />
        </div>

        {/* Chosen Language */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            {t("language")}
          </label>
          <select
            value={chosenLanguage}
            onChange={(e) => setChosenLanguage(e.target.value)}
            className="flex h-11 w-full rounded-xl border border-muted-foreground/30 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="jp">日本語</option>
          </select>
        </div>

        {/* Military Status */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {t("military")}
          </label>
          <select
            value={militaryStatus}
            onChange={(e) => {
              const val = e.target.value as MilitaryStatus;
              setMilitaryStatus(val);
              if (val !== "Postponed") {
                setMilitaryPostponedUntil("");
              }
            }}
            className="flex h-11 w-full rounded-xl border border-muted-foreground/30 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="None">{t("militaryStatus.None")}</option>
            <option value="Completed">{t("militaryStatus.Completed")}</option>
            <option value="Postponed">{t("militaryStatus.Postponed")}</option>
            <option value="Exempt">{t("militaryStatus.Exempt")}</option>
          </select>
        </div>

        {/* Conditional Date Picker for Postponed Status */}
        {militaryStatus === "Postponed" && (
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="text-sm font-semibold">
              {t("militaryPostponed")}
            </label>
            <Input
              type="date"
              value={militaryPostponedUntil}
              onChange={(e) => setMilitaryPostponedUntil(e.target.value)}
              required={militaryStatus === "Postponed"}
              className="rounded-xl border-muted-foreground/30 focus-visible:ring-primary/50 py-5"
            />
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full md:w-auto md:self-end mt-4 rounded-full py-6 px-8 shadow-sm transition-all hover:scale-105 active:scale-95 group font-semibold text-base"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              <span>{t("save")}</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
