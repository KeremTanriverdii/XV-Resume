export interface FeatureItem {
  title: string;
  desc: string;
}

export interface MetricItem {
  value: string;
  label: string;
  desc: string;
}

export interface StepItem {
  num: string;
  title: string;
  desc: string;
  visualLabel: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  company: string;
}

export interface LandingContent {
  hero: {
    badge: string;
    titleStart: string;
    titleHighlight: string;
    titleEnd: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  purpose: {
    sectionTitle: string;
    statValue: string;
    statLabel: string;
    statDesc: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
  };
  proof: {
    title: string;
    subtitle: string;
    jobTitle: string;
    matchScore: string;
    scanActive: string;
    scanComplete: string;
    skills: { name: string; status: 'missing' | 'matched' }[];
  };
  featuresList: {
    title: string;
    subtitle: string;
    items: {
      title: string;
      desc: string;
      icon: string;
    }[];
  };
  testimonials: {
    title: string;
    subtitle: string;
    items: TestimonialItem[];
  };
  howItWorks: {
    title: string;
    subtitle: string;
    steps: StepItem[];
  };
  faq: {
    title: string;
    subtitle: string;
    items: FaqItem[];
  };
  ctaBanner: {
    title: string;
    desc: string;
    button: string;
  };
  contact: {
    title: string;
    subtitle: string;
    infoTitle: string;
    infoDesc: string;
    emailLabel: string;
    formName: string;
    formEmail: string;
    formMessage: string;
    formSubmit: string;
    formSuccess: string;
  };
}
