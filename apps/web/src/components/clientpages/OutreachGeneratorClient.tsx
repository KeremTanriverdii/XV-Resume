'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { fetchResumes } from '@/services/resumeService';
import { fetchProfiles } from '@/services/profileService';
import { useTranslations } from 'next-intl';
import { generateOutreachText } from '@/services/outreachService';
import { formatCompanyAndRole } from '@/utils/formatTitle';
import { ResumeDto, Profile } from '@/types';
import { OutreachType, OutreachSourceType } from '@/types/outreach';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Mail,
  Send,
  Upload,
  FileText,
  User,
  Sparkles,
  Copy,
  Check,
  Download,
  Zap,
  Globe,
  Loader2,
  AlertCircle,
  Paperclip,
  Trash2,
  FileCheck,
  X
} from 'lucide-react';

interface OutreachGeneratorClientProps {
  defaultMode?: OutreachType;
}

export const OutreachGeneratorClient: React.FC<OutreachGeneratorClientProps> = ({
  defaultMode = 'CoverLetter',
}) => {
  const t = useTranslations('outreach');
  const tToast = useTranslations('toast');
  const { session } = useAuth();
  const token = session?.access_token;

  // Primary mode state
  const [outreachType, setOutreachType] = useState<OutreachType>(defaultMode);
  
  // Data Source Selection state (3 Options)
  const [sourceType, setSourceType] = useState<OutreachSourceType>('Upload');
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [uploadedCvText, setUploadedCvText] = useState<string>('');
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: number;
    type: string;
  } | null>(null);

  // Target Job State
  const [jobUrl, setJobUrl] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [languageCode, setLanguageCode] = useState<string>('tr');

  // Loaded user data
  const [resumes, setResumes] = useState<ResumeDto[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState<boolean>(true);

  // Generation state (separate result stored per outreach type)
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [results, setResults] = useState<{
    CoverLetter?: { text: string; isCached: boolean };
    ColdMessage?: { text: string; isCached: boolean };
  }>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const activeResult = results[outreachType] || null;

  useEffect(() => {
    if (!token) return;
    setIsLoadingLists(true);
    Promise.all([fetchResumes(token), fetchProfiles(token)])
      .then(([resumesData, profilesData]) => {
        setResumes(resumesData || []);
        setProfiles(profilesData || []);
        if (resumesData && resumesData.length > 0) {
          setSelectedResumeId(resumesData[0].id);
        }
        if (profilesData && profilesData.length > 0) {
          setSelectedProfileId(profilesData[0].id);
        }
      })
      .catch((err) => {
        console.error('Error fetching user data for outreach generator:', err);
      })
      .finally(() => setIsLoadingLists(false));
  }, [token]);

  // File Upload Reader with clean Attachment handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachedFile({
      name: file.name,
      size: file.size,
      type: file.type || file.name.split('.').pop() || 'file',
    });

    const reader = new FileReader();

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      reader.onload = (event) => {
        const content = (event.target?.result as string) || '';
        setUploadedCvText(content.trim());
        toast.success(`Attached file: ${file.name}`);
      };
      reader.readAsText(file);
    } else {
      // PDF / DOCX file - clean text extraction without binary noise
      reader.onload = (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const rawText = decoder.decode(buffer);

        // Filter out PDF binary headers & object streams
        const words = rawText
          .replace(/%PDF[\s\S]*?obj/g, ' ')
          .replace(/\/Filter[\s\S]*?stream/g, ' ')
          .replace(/[^\x20-\x7E\n\r\t\u00C0-\u024F\u0100-\u017F\u0180-\u024F]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length > 1 && !/^[0-9A-Fa-f]{8,}$/.test(w) && !/^\/[A-Z]/.test(w));

        const cleanText = words.join(' ');
        const finalCvText = cleanText.length > 40
          ? cleanText
          : `Attached CV Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

        setUploadedCvText(finalCvText);
        toast.success(`${tToast('attachedFileSuccess')}: ${file.name}`);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    setUploadedCvText('');
    toast.info(tToast('fileRemoved'));
  };

  const handleGenerate = async () => {
    if (!token) {
      toast.error(tToast('authMissing'));
      return;
    }

    if (sourceType === 'Upload' && !uploadedCvText.trim()) {
      toast.error(tToast('errorUploadCv'));
      return;
    }
    if (sourceType === 'Resume' && !selectedResumeId) {
      toast.error(tToast('errorSelectResume'));
      return;
    }
    if (sourceType === 'Profile' && !selectedProfileId) {
      toast.error(tToast('errorSelectProfile'));
      return;
    }

    setIsGenerating(true);

    try {
      const res = await generateOutreachText(
        {
          outreachType,
          sourceType,
          sourceId: sourceType === 'Resume' ? selectedResumeId : sourceType === 'Profile' ? selectedProfileId : undefined,
          uploadedCvText: sourceType === 'Upload' ? uploadedCvText : undefined,
          jobUrl: jobUrl.trim() || undefined,
          jobDescription: jobDescription.trim() || undefined,
          languageCode,
        },
        token
      );

      if (res && res.generatedText) {
        setResults((prev) => ({
          ...prev,
          [outreachType]: {
            text: res.generatedText,
            isCached: res.isCached,
          },
        }));

        if (res.isCached) {
          toast.success(tToast('cachedSuccess'));
        } else {
          toast.success(tToast('generateSuccess'));
        }
      }
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || tToast('generationFailed');
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    const textToCopy = activeResult?.text || '';
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success(tToast('copiedSuccess'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(tToast('copiedFailed'));
    }
  };

  const handleDownload = () => {
    const textToDownload = activeResult?.text || '';
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${outreachType}_Outreach.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(tToast('downloadSuccess'));
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-6 rounded-2xl border border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/30">
            {outreachType === 'CoverLetter' ? <Mail className="h-6 w-6" /> : <Send className="h-6 w-6" />}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {t('title') || 'Cold Message & Cover Letter AI Generator'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('subtitle') || 'Select candidate details and target job description to generate high-converting outreach content.'}
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-card border border-border p-1 rounded-xl shrink-0">
          <button
            onClick={() => setOutreachType('CoverLetter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              outreachType === 'CoverLetter'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            {t('coverLetter') || 'Cover Letter'}
          </button>
          <button
            onClick={() => setOutreachType('ColdMessage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              outreachType === 'ColdMessage'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            {t('coldMessage') || 'Cold Message'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form & 3 Data Sources */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <Card className="rounded-2xl border border-border shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                {t('step1Title') || '1. Select Candidate Data Source'}
              </CardTitle>
              <CardDescription className="text-xs">
                {t('step1Desc') || 'Choose how you want to provide your candidate background.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Tabs
                value={sourceType}
                onValueChange={(val) => setSourceType(val as OutreachSourceType)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 w-full rounded-xl bg-muted/60 p-1">
                  <TabsTrigger value="Upload" className="text-xs rounded-lg gap-1.5 cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    {t('uploadCv') || 'Upload CV'}
                  </TabsTrigger>
                  <TabsTrigger value="Resume" className="text-xs rounded-lg gap-1.5 cursor-pointer">
                    <FileText className="h-3.5 w-3.5" />
                    {t('createdCv') || 'Saved CV'}
                  </TabsTrigger>
                  <TabsTrigger value="Profile" className="text-xs rounded-lg gap-1.5 cursor-pointer">
                    <User className="h-3.5 w-3.5" />
                    {t('profile') || 'Profile'}
                  </TabsTrigger>
                </TabsList>

                {/* Option 1: Upload Custom CV */}
                <TabsContent value="Upload" className="mt-4 flex flex-col gap-3">
                  <Label className="text-xs font-semibold">Candidate CV File / Attachment</Label>

                  {attachedFile ? (
                    /* Attachment Card Component */
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                          <Paperclip className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-foreground truncate">{attachedFile.name}</span>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                            <span>{(attachedFile.size / 1024).toFixed(1)} KB</span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <FileCheck className="h-3 w-3" /> File Attached
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                        title="Remove attached file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    /* Upload Attachment Zone Component */
                    <div className="border-2 border-dashed border-border hover:border-emerald-500/50 rounded-xl p-5 text-center transition-all bg-card/50 flex flex-col items-center justify-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                        <Paperclip className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-foreground">{t('attachDoc') || 'Attach CV Document (.pdf, .txt, .docx)'}</span>
                        <span className="text-[11px] text-muted-foreground">{t('maxSize') || 'File size up to 10MB'}</span>
                      </div>
                      <input
                        type="file"
                        accept=".txt,.pdf,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="cv-file-upload"
                      />
                      <label
                        htmlFor="cv-file-upload"
                        className="mt-1 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {t('browseFile') || 'Browse & Attach File'}
                      </label>
                    </div>
                  )}

                  {/* Textarea is hidden when a file is attached */}
                  {!attachedFile && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      <Label className="text-[11px] text-muted-foreground">Or paste raw CV text directly:</Label>
                      <Textarea
                        placeholder="Paste your raw CV text here directly..."
                        rows={4}
                        value={uploadedCvText}
                        onChange={(e) => setUploadedCvText(e.target.value)}
                        className="text-xs rounded-xl"
                      />
                    </div>
                  )}
                </TabsContent>

                {/* Option 2: Select Created Resume */}
                <TabsContent value="Resume" className="mt-4 flex flex-col gap-3">
                  <Label className="text-xs font-semibold">Select Created Resume Session</Label>
                  {isLoadingLists ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> Loading your resumes...
                    </div>
                  ) : resumes.length === 0 ? (
                    <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl">
                      No created resumes found. Please generate a resume session first or choose another option.
                    </div>
                  ) : (
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      {resumes.map((r) => {
                        const trans = r.translations?.find((t) => t.languageCode === languageCode) || r.translations?.[0];
                        const titleText = trans?.title || r.title || r.profile?.title;
                        const displayTitle = formatCompanyAndRole(titleText, r.externalJobLink);
                        const langStr = (trans?.languageCode || r.languageCode || 'en').toUpperCase();
                        const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '';
                        return (
                          <option key={r.id} value={r.id}>
                            {displayTitle} ({langStr}){dateStr ? ` • ${dateStr}` : ''}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </TabsContent>

                {/* Option 3: Select Profile */}
                <TabsContent value="Profile" className="mt-4 flex flex-col gap-3">
                  <Label className="text-xs font-semibold">Select Candidate Profile</Label>
                  {isLoadingLists ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> Loading your profiles...
                    </div>
                  ) : profiles.length === 0 ? (
                    <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl">
                      No profiles found. Please create a candidate profile first or choose another option.
                    </div>
                  ) : (
                    <select
                      value={selectedProfileId}
                      onChange={(e) => setSelectedProfileId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      {profiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.fullName} - {p.title || 'Applicant'}
                        </option>
                      ))}
                    </select>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Target Job Details Card */}
          <Card className="rounded-2xl border border-border shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-500" />
                2. Target Job Posting & Language
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Job Link */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold">External Job Link (Auto-Scraped & Decrypted)</Label>
                <Input
                  type="url"
                  placeholder="https://www.linkedin.com/jobs/view/..."
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              {/* Job Description Text */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold">Or Job Description Text</Label>
                <Textarea
                  placeholder="Paste job posting details here..."
                  rows={3}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              {/* Output Language */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold">Output Language</Label>
                <select
                  value={languageCode}
                  onChange={(e) => setLanguageCode(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="tr">Turkish (Türkçe)</option>
                  <option value="en">English</option>
                  <option value="de">German (Deutsch)</option>
                  <option value="fr">French (Français)</option>
                  <option value="es">Spanish (Español)</option>
                  <option value="it">Italian (Italiano)</option>
                </select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-2 py-5 cursor-pointer mt-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('btnGenerating') || 'Generating...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>{t('btnGenerate') || 'Generate'} {outreachType === 'CoverLetter' ? t('coverLetter') : t('coldMessage')}</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Output Viewer & Actions */}
        <div className="lg:col-span-6">
          <Card className="rounded-2xl border border-border shadow-xs h-full flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  {outreachType === 'CoverLetter' ? <Mail className="h-4 w-4 text-emerald-500" /> : <Send className="h-4 w-4 text-emerald-500" />}
                  Generated {outreachType === 'CoverLetter' ? 'Cover Letter' : 'Cold Message'}
                </CardTitle>

                {activeResult?.isCached && (
                  <span className="text-[11px] uppercase font-bold tracking-wide px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <Zap className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                    Served from Cache ($0 Token Cost)
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-4 flex-1 flex flex-col gap-4">
              {!activeResult && !isGenerating ? (
                <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl my-auto text-muted-foreground gap-3">
                  <Sparkles className="h-8 w-8 text-emerald-500/40" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Ready to Generate</h4>
                    <p className="text-xs max-w-xs mt-1">
                      Choose your candidate data source and click Generate to produce a high-converting {outreachType === 'CoverLetter' ? 'Cover Letter' : 'Cold Message'}.
                    </p>
                  </div>
                </div>
              ) : isGenerating ? (
                <div className="flex flex-col items-center justify-center text-center p-12 my-auto gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                  <p className="text-xs text-muted-foreground font-medium">
                    AI is analyzing candidate experience & job details...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 flex-1">
                  {isEditing ? (
                    <Textarea
                      value={activeResult?.text || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setResults((prev) => ({
                          ...prev,
                          [outreachType]: { text: val, isCached: false },
                        }));
                      }}
                      rows={14}
                      className="text-xs leading-relaxed font-sans rounded-xl p-4 flex-1"
                    />
                  ) : (
                    <div className="bg-card/70 border border-border p-5 rounded-xl text-xs leading-relaxed whitespace-pre-line font-sans text-foreground flex-1 overflow-y-auto max-h-[500px]">
                      {activeResult?.text}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border mt-auto">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="rounded-xl gap-1.5 cursor-pointer text-xs"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? t('copied') || 'Copied!' : t('copy') || 'Copy Text'}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="rounded-xl gap-1.5 cursor-pointer text-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {t('download') || 'Download .txt'}
                      </Button>
                    </div>

                    <Button
                      variant={isEditing ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className={`rounded-xl text-xs cursor-pointer ${
                        isEditing ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''
                      }`}
                    >
                      {isEditing ? (t('doneEditing') || 'Done Editing') : (t('edit') || 'Edit')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
