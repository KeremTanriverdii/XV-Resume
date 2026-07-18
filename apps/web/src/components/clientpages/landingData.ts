import { LandingContent } from "@/types";

const contentTR: LandingContent = {
  hero: {
    badge: "Yapay Zeka Destekli ATS Optimizasyonu",
    titleStart: "İş Başvurularında Elenmeye Son. Özgeçmişinizi ",
    titleHighlight: "İlana Özel",
    titleEnd: " Optimize Edin.",
    subtitle: "Aday Takip Sistemleri (ATS) algoritmalarını aşın. XV Resume, deneyimlerinizi yapay zeka ile analiz eder ve hedeflediğiniz iş ilanının kriterleriyle saniyeler içinde kusursuz şekilde eşleştirir.",
    ctaPrimary: "ATS Uyumlu Özgeçmiş Oluştur",
    ctaSecondary: "Şablonları İncele",
  },
  purpose: {
    sectionTitle: "İşe Alım Süreçlerindeki Acı Gerçek",
    statValue: "%75",
    statLabel: "ATS Tarafından Doğrudan Elenme Oranı",
    statDesc: "Şirketlerin kullandığı Aday Takip Sistemleri (ATS), ilan metnindeki anahtar kelimeleri içermeyen özgeçmişleri, bir insan kaynakları uzmanı görmeden eler.",
    card1Title: "Anahtar Kelime Eşleşmesi",
    card1Desc: "Geleneksel özgeçmişler her ilana aynı bilgileri sunduğu için elenir. XV Resume ise ilan detaylarını tarayarak eksik anahtar kelimelerinizi otomatik ekler.",
    card2Title: "Yapay Zeka Doğruluğu",
    card2Desc: "Supabase ve OpenAI altyapısıyla desteklenen yapay zekamız, deneyimlerinizi değiştirmeden sadece sektör terminolojisine ve ilan beklentilerine göre biçimlendirir.",
  },
  proof: {
    title: "ATS Filtreleri Nasıl Çalışır?",
    subtitle: "Klasik bir özgeçmiş ile XV Resume tarafından optimize edilmiş bir özgeçmişin iş ilanındaki anahtar kelimelere göre eşleşme analizi.",
    jobTitle: "Kıdemli React Geliştirici",
    matchScore: "Eşleşme Oranı",
    scanActive: "Optimizasyon Başlatılıyor...",
    scanComplete: "Optimizasyon Tamamlandı!",
    skills: [
      { name: "React.js & Next.js", status: "matched" },
      { name: "TypeScript", status: "matched" },
      { name: "State Management (Zustand/Redux)", status: "missing" },
      { name: "RESTful API Integration", status: "matched" },
      { name: "Tailwind CSS & Responsive Design", status: "missing" },
      { name: "Unit Testing (Jest/Cypress)", status: "missing" },
    ],
  },
  featuresList: {
    title: "Sıra Dışı Özellikler",
    subtitle: "Sıradan özgeçmiş araçlarının ötesine geçin. Sizi işe yerleştiren teknolojilerle donatıldık.",
    items: [
      {
        title: "Akıllı Anahtar Kelime Entegrasyonu",
        desc: "İlanları anlık analiz ederek eksik olan teknik beceri ve metodolojileri doğal ifadelerle profilinize ekler.",
        icon: "target"
      },
      {
        title: "%100 ATS Dostu PDF Şablonları",
        desc: "Grafiklerden arındırılmış, parser sistemlerinin (Breezy, Workable, Taleo) kolayca okuyabileceği standart yapılarda çıktılar üretir.",
        icon: "fileText"
      },
      {
        title: "Gerçek Zamanlı Eşleşme Analizi",
        desc: "Özgeçmişinizin ilanla olan teknik uyum skorunu ve eksikliklerini başvuru yapmadan önce görün.",
        icon: "shieldCheck"
      }
    ]
  },
  testimonials: {
    title: "Başarı Hikayeleri",
    subtitle: "XV Resume kullanarak hedefledikleri şirketlerde işe kabul alan profesyonellerin yorumları.",
    items: [
      {
        quote: "LinkedIn üzerinden başvurduğum 20+ ilandan dönüş alamamıştım. XV Resume ile CV'mi her ilana özel optimize etmeye başladıktan sonraki ilk haftada 3 mülakat daveti aldım.",
        author: "Mert Yılmaz",
        role: "Kıdemli Frontend Geliştirici",
        company: "Trendyol"
      },
      {
        quote: "ATS parser sistemlerinde Türkçe karakterlerden dolayı yaşanan veri kayıplarını tamamen engelledi. Şablonlar son derece sade ve profesyonel.",
        author: "Zeynep Demir",
        role: "Yazılım Mühendisi",
        company: "Siemens"
      }
    ]
  },
  howItWorks: {
    title: "Süreç Nasıl İşler?",
    subtitle: "Karmaşık süreçleri geride bırakın. Sadece 3 adımda başvurmaya hazır olun.",
    steps: [
      {
        num: "01",
        title: "Temel Profilinizi Oluşturun",
        desc: "Eğitim, deneyim ve projelerinizi bir kez sisteme girin. Bilgileriniz şifrelenmiş veri tabanımızda güvenle saklanır.",
        visualLabel: "Profil Bilgileri Kaydedildi"
      },
      {
        num: "02",
        title: "İş İlanı Bağlantısını Yapıştırın",
        desc: "Başvurmak istediğiniz LinkedIn, Kariyer.net ya da herhangi bir iş ilanı URL'ini kopyalayıp sisteme yapıştırın.",
        visualLabel: "İş Tanımı Analiz Ediliyor"
      },
      {
        num: "03",
        title: "ATS Uyumlu PDF Çıktısını Alın",
        desc: "Yapay zeka, ilan gereksinimlerini analiz edip profilinizle eşleştirerek saniyeler içinde mükemmel uyumlu özgeçmişi hazırlar.",
        visualLabel: "Özgeçmiş İndirilmeye Hazır"
      }
    ]
  },
  faq: {
    title: "Sıkça Sorulan Sorular",
    subtitle: "XV Resume ve ATS optimizasyon süreçleri hakkında merak edilenler.",
    items: [
      {
        question: "Verilerim güvende mi?",
        answer: "Evet. Tüm verileriniz Supabase altyapısıyla uçtan uca şifrelenmiş olarak saklanır. Kişisel verileriniz asla üçüncü taraflarla veya reklam ağlarıyla paylaşılmaz."
      },
      {
        question: "XV Resume deneyimlerimi uyduruyor mu?",
        answer: "Kesinlikle hayır. Yapay zekamız mevcut tecrübelerinizi uydurmaz, sadece var olan deneyimlerinizi hedef ilanın aradığı teknik kelimeler ve terminolojilerle daha uyumlu olacak şekilde yeniden cümleleştirir."
      },
      {
        question: "Oluşturulan PDF'ler ATS sistemleri tarafından okunabilir mi?",
        answer: "Evet, şablonlarımız özellikle ATS uyumlu (parsable) olarak geliştirilmiştir. Grafik ve karmaşık tablolardan kaçınarak, ATS parser'ların kolayca ayrıştırabileceği standart formatlar üretiriz."
      },
      {
        question: "Hangi platformların iş ilanlarını destekliyorsunuz?",
        answer: "LinkedIn başta olmak üzere Kariyer.net, Indeed, Glassdoor ve diğer popüler iş ilanı platformlarının bağlantılarını doğrudan yapıştırarak analiz başlatabilirsiniz."
      }
    ]
  },
  ctaBanner: {
    title: "Kariyerinizde Yeni Bir Sayfa Açın",
    desc: "Aday Takip Sistemleri tarafından elenmekten yoruldunuz mu? Saniyeler içinde özgeçmişinizi optimize edin ve işe alım uzmanlarının dikkatini çekin.",
    button: "Şimdi Ücretsiz Başla"
  },
  contact: {
    title: "Bize Ulaşın",
    subtitle: "Sorularınız, önerileriniz veya iş birliği talepleriniz için bizimle iletişime geçin.",
    infoTitle: "Doğrudan İletişim",
    infoDesc: "Herhangi bir teknik sorun veya geri bildiriminiz için bize e-posta yoluyla ulaşabilirsiniz.",
    emailLabel: "destek@xvresume.com",
    formName: "Adınız",
    formEmail: "E-posta Adresiniz",
    formMessage: "Mesajınız",
    formSubmit: "Gönder",
    formSuccess: "Mesajınız başarıyla iletildi!"
  }
};

const contentEN: LandingContent = {
  hero: {
    badge: "AI-Powered ATS Optimization",
    titleStart: "Stop Getting Screened Out. Optimize Your Resume ",
    titleHighlight: "Per Job Post",
    titleEnd: " in Seconds.",
    subtitle: "Beat the Applicant Tracking Systems (ATS). XV Resume uses advanced AI to analyze job descriptions and align your experience keywords to match the exact recruiter requirements.",
    ctaPrimary: "Create ATS-Optimized Resume",
    ctaSecondary: "Browse Templates",
  },
  purpose: {
    sectionTitle: "The Harsh Reality of Modern Job Hunting",
    statValue: "75%",
    statLabel: "Average ATS Rejection Rate",
    statDesc: "Most companies use Applicant Tracking Systems (ATS) to filter out resumes that don't match specific keywords in the job description before any human sees them.",
    card1Title: "Smart Keyword Alignment",
    card1Desc: "Generic resumes fail because they try to fit all. XV Resume scans the exact job posting and adds missing relevant industry keywords.",
    card2Title: "AI-Powered Precision",
    card2Desc: "Built on Supabase & OpenAI, our algorithms adapt your experience descriptions to match industry phrasing without altering your actual history.",
  },
  proof: {
    title: "How ATS Filtering Works",
    subtitle: "A side-by-side comparison of a standard resume versus a XV Resume optimized resume matching specific job posting keys.",
    jobTitle: "Senior React Developer",
    matchScore: "Match Score",
    scanActive: "Starting Optimization...",
    scanComplete: "Optimization Complete!",
    skills: [
      { name: "React.js & Next.js", status: "matched" },
      { name: "TypeScript", status: "matched" },
      { name: "State Management (Zustand/Redux)", status: "missing" },
      { name: "RESTful API Integration", status: "matched" },
      { name: "Tailwind CSS & Responsive Design", status: "missing" },
      { name: "Unit Testing (Jest/Cypress)", status: "missing" },
    ],
  },
  featuresList: {
    title: "Outstanding Features",
    subtitle: "Go beyond standard resume builders. We equip you with technologies that actually get you hired.",
    items: [
      {
        title: "Smart Keyword Integration",
        desc: "Instantly analyzes jobs and naturally inserts missing technical skills and frameworks into your experience text.",
        icon: "target"
      },
      {
        title: "100% ATS Friendly PDF Templates",
        desc: "Generates visual-minimal, clean layout PDFs designed strictly for candidate parsing systems (Taleo, Workable, etc.).",
        icon: "fileText"
      },
      {
        title: "Real-time Job Matching",
        desc: "View the exact match percentage and gaps in your resume before submitting it to recruiters.",
        icon: "shieldCheck"
      }
    ]
  },
  testimonials: {
    title: "Success Stories",
    subtitle: "Hear from candidates who successfully optimized their resumes to land roles at top tech companies.",
    items: [
      {
        quote: "I applied to over 20 roles on LinkedIn with zero replies. The first week I started using XV Resume to tailor my CV for each specific posting, I received 3 interview invites.",
        author: "Mert Yılmaz",
        role: "Senior Frontend Developer",
        company: "Trendyol"
      },
      {
        quote: "Perfect parsing. It solved character conversion issues in Applicant Tracking Systems. Highly professional and minimal templates.",
        author: "Zeynep Demir",
        role: "Software Engineer",
        company: "Siemens"
      }
    ]
  },
  howItWorks: {
    title: "How It Works",
    subtitle: "Skip the guesswork. Get ready to apply in 3 simple steps.",
    steps: [
      {
        num: "01",
        title: "Create Your Core Profile",
        desc: "Enter your education, experiences, and projects once. Your data is securely saved in our encrypted database.",
        visualLabel: "Core Profile Saved"
      },
      {
        num: "02",
        title: "Paste the Job Posting Link",
        desc: "Copy the URL of the job posting from LinkedIn, Indeed, or any other platform and paste it into the dashboard.",
        visualLabel: "Analyzing Job Posting..."
      },
      {
        num: "03",
        title: "Download ATS-Friendly PDF",
        desc: "Our AI tailors your details to align with the job requirements and instantly generates a clean, parsable PDF.",
        visualLabel: "Resume Ready for Download"
      }
    ]
  },
  faq: {
    title: "Frequently Asked Questions",
    subtitle: "Common questions about XV Resume and ATS optimization.",
    items: [
      {
        question: "Is my personal data secure?",
        answer: "Absolutely. All user profile data is securely stored and encrypted via Supabase. We never sell your personal information to third parties."
      },
      {
        question: "Does the AI falsify my work experiences?",
        answer: "No. The AI does not invent experiences. It rewrites and rephrases your existing responsibilities using industry terminology matching the job specifications."
      },
      {
        question: "Are the generated PDFs compatible with all ATS platforms?",
        answer: "Yes. Our templates are designed strictly to be parse-friendly. We avoid heavy layouts, charts, or images that typically confuse ATS parsing algorithms."
      },
      {
        question: "Which job boards do you support?",
        answer: "You can copy job links from LinkedIn, CareerBuilder, Glassdoor, Indeed, and many other corporate career pages directly."
      }
    ]
  },
  ctaBanner: {
    title: "Start Landing More Interviews",
    desc: "Tired of submitting resumes that disappear into the void? Optimize your CV in seconds and get noticed by recruiters.",
    button: "Start Free Now"
  },
  contact: {
    title: "Contact Us",
    subtitle: "Get in touch with us for any inquiries, suggestions, or support issues.",
    infoTitle: "Direct Contact",
    infoDesc: "Feel free to drop us an email if you have any questions or feedback.",
    emailLabel: "support@xvresume.com",
    formName: "Your Name",
    formEmail: "Your Email Address",
    formMessage: "Your Message",
    formSubmit: "Send Message",
    formSuccess: "Your message has been sent successfully!"
  }
};

const contentDE: LandingContent = {
  hero: {
    badge: "KI-gestützte ATS-Optimierung",
    titleStart: "Keine Absagen mehr bei Bewerbungen. Optimieren Sie Ihren Lebenslauf ",
    titleHighlight: "jobbezogen",
    titleEnd: " in Sekundenschnelle.",
    subtitle: "Überwinden Sie Bewerber-Tracking-Systeme (ATS). XV Resume analysiert Stellenbeschreibungen mit fortschrittlicher KI und passt Ihre Erfahrungen präzise an die Kriterien der Personalverantwortlichen an.",
    ctaPrimary: "ATS-optimierten Lebenslauf erstellen",
    ctaSecondary: "Vorlagen durchsuchen",
  },
  purpose: {
    sectionTitle: "Die harte Realität der modernen Jobsuche",
    statValue: "75%",
    statLabel: "Durchschnittliche ATS-Ablehnungsquote",
    statDesc: "Die meisten Unternehmen nutzen Bewerber-Tracking-Systeme (ATS), um Lebensläufe auszusortieren, die nicht mit bestimmten Schlüsselwörtern der Stellenbeschreibung übereinstimmen, noch bevor ein Mensch sie zu Gesicht bekommt.",
    card1Title: "Intelligente Schlüsselwort-Ausrichtung",
    card1Desc: "Generische Lebensläufe scheitern, weil sie versuchen, für alles zu passen. XV Resume scannt die genaue Stellenausschreibung und fügt fehlende relevante Branchen-Schlüsselwörter hinzu.",
    card2Title: "KI-gestützte Präzision",
    card2Desc: "Basierend auf Supabase & OpenAI passen unsere Algorithmen Ihre Erfahrungsbeschreibungen an die Branchenformulierungen an, ohne Ihre tatsächliche Historie zu verändern.",
  },
  proof: {
    title: "Wie ATS-Filterung funktioniert",
    subtitle: "Ein direkter Vergleich zwischen einem Standard-Lebenslauf und einem durch XV Resume optimierten Lebenslauf im Abgleich mit einer Stellenausschreibung.",
    jobTitle: "Senior React Entwickler",
    matchScore: "Übereinstimmungsquote",
    scanActive: "Optimierung wird gestartet...",
    scanComplete: "Optimierung abgeschlossen!",
    skills: [
      { name: "React.js & Next.js", status: "matched" },
      { name: "TypeScript", status: "matched" },
      { name: "State Management (Zustand/Redux)", status: "missing" },
      { name: "RESTful API Integration", status: "matched" },
      { name: "Tailwind CSS & Responsive Design", status: "missing" },
      { name: "Unit Testing (Jest/Cypress)", status: "missing" },
    ],
  },
  featuresList: {
    title: "Herausragende Funktionen",
    subtitle: "Gehen Sie über Standard-Lebenslauf-Generatoren hinaus. Wir statten Sie mit Technologien aus, die Sie tatsächlich in Arbeit bringen.",
    items: [
      {
        title: "Intelligente Schlüsselwort-Integration",
        desc: "Analysiert Stellenanzeigen sofort und fügt fehlende technische Fähigkeiten und Frameworks natürlich in Ihre Erfahrungstexte ein.",
        icon: "target"
      },
      {
        title: "100% ATS-freundliche PDF-Vorlagen",
        desc: "Generiert visuell minimalistische PDF-Layouts, die streng für Kandidaten-Parsing-Systeme (Taleo, Workable usw.) entwickelt wurden.",
        icon: "fileText"
      },
      {
        title: "Echtzeit-Stellenabgleich",
        desc: "Sehen Sie die genaue Übereinstimmungsquote und Lücken in Ihrem Lebenslauf, bevor Sie ihn an Personalverantwortliche senden.",
        icon: "shieldCheck"
      }
    ]
  },
  testimonials: {
    title: "Erfolgsgeschichten",
    subtitle: "Erfahren Sie von Kandidaten, die ihre Lebensläufe erfolgreich optimiert haben, um Stellen bei Top-Tech-Unternehmen zu bekommen.",
    items: [
      {
        quote: "Ich habe mich auf über 20 Stellen bei LinkedIn beworben und keine Antwort erhalten. In der ersten Woche, in der ich XV Resume nutzte, um meinen Lebenslauf anzupassen, erhielt ich 3 Einladungen zu Vorstellungsgesprächen.",
        author: "Mert Yılmaz",
        role: "Senior Frontend Entwickler",
        company: "Trendyol"
      },
      {
        quote: "Perfektes Parsing. Es hat Konvertierungsprobleme bei der Zeichencodierung in Bewerber-Tracking-Systemen behoben. Sehr professionelle und minimalistische Vorlagen.",
        author: "Zeynep Demir",
        role: "Softwareentwicklerin",
        company: "Siemens"
      }
    ]
  },
  howItWorks: {
    title: "Wie es funktioniert",
    subtitle: "Sparen Sie sich das Rätselraten. In 3 einfachen Schritten bereit zur Bewerbung.",
    steps: [
      {
        num: "01",
        title: "Basisprofil erstellen",
        desc: "Geben Sie Ihre Ausbildung, Erfahrungen und Projekte einmalig ein. Ihre Daten werden sicher in unserer verschlüsselten Datenbank gespeichert.",
        visualLabel: "Basisprofil gespeichert"
      },
      {
        num: "02",
        title: "Stellenausschreibungs-Link einfügen",
        desc: "Kopieren Sie die URL der Stellenausschreibung von LinkedIn, Indeed oder einer anderen Plattform und fügen Sie sie in das Dashboard ein.",
        visualLabel: "Stellenausschreibung wird analysiert..."
      },
      {
        num: "03",
        title: "ATS-freundliches PDF herunterladen",
        desc: "Unsere KI passt Ihre Details an die Jobanforderungen an und generiert sofort ein sauberes, parsebares PDF.",
        visualLabel: "Lebenslauf bereit zum Download"
      }
    ]
  },
  faq: {
    title: "Häufig gestellte Fragen",
    subtitle: "Häufige Fragen zu XV Resume und ATS-Optimierung.",
    items: [
      {
        question: "Sind meine persönlichen Daten sicher?",
        answer: "Absolut. Alle Benutzerprofildaten werden sicher über Supabase gespeichert und verschlüsselt. Wir verkaufen Ihre persönlichen Daten niemals an Dritte."
      },
      {
        question: "Erfindet die KI Arbeitserfahrungen?",
        answer: "Nein. Die KI erfindet keine Erfahrungen. Sie schreibt Ihre bestehenden Verantwortlichkeiten um und formuliert sie neu, sodass sie der Branchenterminologie der Stellenspezifikationen entsprechen."
      },
      {
        question: "Sind die generierten PDFs mit allen ATS-Plattformen kompatibel?",
        answer: "Ja. Unsere Vorlagen sind streng darauf ausgelegt, parse-freundlich zu sein. Wir vermeiden komplexe Layouts, Diagramme oder Bilder, die typischerweise ATS-Parsing-Algorithmen verwirren."
      },
      {
        question: "Welche Jobbörsen unterstützen Sie?",
        answer: "Sie können Job-Links von LinkedIn, CareerBuilder, Glassdoor, Indeed und vielen anderen Karriereportalen direkt kopieren."
      }
    ]
  },
  ctaBanner: {
    title: "Erhalten Sie mehr Einladungen zu Interviews",
    desc: "Haben Sie es satt, Lebensläufe einzureichen, die im Nichts verschwinden? Optimieren Sie Ihren Lebenslauf in Sekundenschnelle und fallen Sie Personalverantwortlichen auf.",
    button: "Jetzt kostenlos starten"
  },
  contact: {
    title: "Kontaktieren Sie uns",
    subtitle: "Kontaktieren Sie uns für alle Fragen, Vorschläge oder Support-Anfragen.",
    infoTitle: "Direkter Kontakt",
    infoDesc: "Schreiben Sie uns gerne eine E-Mail, wenn Sie Fragen oder Feedback haben.",
    emailLabel: "support@xvresume.com",
    formName: "Ihr Name",
    formEmail: "Ihre E-Mail-Adresse",
    formMessage: "Ihre Nachricht",
    formSubmit: "Nachricht senden",
    formSuccess: "Ihre Nachricht wurde erfolgreich gesendet!"
  }
};

const contentES: LandingContent = {
  hero: {
    badge: "Optimización de ATS Impulsada por IA",
    titleStart: "Se acabaron los descartes en solicitudes de empleo. Optimiza tu currículum ",
    titleHighlight: "por puesto",
    titleEnd: " en segundos.",
    subtitle: "Supera los Sistemas de Seguimiento de Candidatos (ATS). XV Resume utiliza IA avanzada para analizar descripciones de puestos y alinear tus palabras clave con los requisitos exactos de los reclutadores.",
    ctaPrimary: "Crear Currículum Optimizado para ATS",
    ctaSecondary: "Ver Plantillas",
  },
  purpose: {
    sectionTitle: "La cruda realidad de la búsqueda de empleo moderna",
    statValue: "75%",
    statLabel: "Tasa Promedio de Rechazo de ATS",
    statDesc: "La mayoría de las empresas utilizan Sistemas de Seguimiento de Candidatos (ATS) para filtrar currículums que no coinciden con palabras clave específicas en la descripción del puesto, antes de que cualquier humano los vea.",
    card1Title: "Alineación de Palabras Clave Inteligente",
    card1Desc: "Los currículums genéricos fallan porque intentan adaptarse a todo. XV Resume analiza la oferta exacta y añade las palabras clave relevantes que faltan.",
    card2Title: "Precisión Impulsada por IA",
    card2Desc: "Basado en Supabase y OpenAI, nuestros algoritmos adaptan la redacción de tus experiencias para que coincida con la jerga de la industria sin alterar tu historial real.",
  },
  proof: {
    title: "Cómo funciona el filtrado de ATS",
    subtitle: "Comparación directa entre un currículum estándar y uno optimizado por XV Resume en base a las palabras clave de una oferta de empleo.",
    jobTitle: "Desarrollador React Senior",
    matchScore: "Porcentaje de coincidencia",
    scanActive: "Iniciando optimización...",
    scanComplete: "¡Optimización completada!",
    skills: [
      { name: "React.js & Next.js", status: "matched" },
      { name: "TypeScript", status: "matched" },
      { name: "State Management (Zustand/Redux)", status: "missing" },
      { name: "RESTful API Integration", status: "matched" },
      { name: "Tailwind CSS & Responsive Design", status: "missing" },
      { name: "Unit Testing (Jest/Cypress)", status: "missing" },
    ],
  },
  featuresList: {
    title: "Características Sobresalientes",
    subtitle: "Ve más allá de los generadores de currículums estándar. Te equipamos con tecnologías que realmente te ayudan a conseguir empleo.",
    items: [
      {
        title: "Integración Inteligente de Palabras Clave",
        desc: "Analiza las ofertas al instante e inserta de forma natural habilidades técnicas y metodologías en el texto de tu experiencia.",
        icon: "target"
      },
      {
        title: "Plantillas PDF 100% compatibles con ATS",
        desc: "Genera PDFs con diseño limpio y minimalista, optimizados estrictamente para sistemas de análisis de candidatos (Taleo, Workable, etc.).",
        icon: "fileText"
      },
      {
        title: "Coincidencia de Empleo en Tiempo Real",
        desc: "Visualiza el porcentaje de compatibilidad exacto y las brechas en tu currículum antes de enviarlo a los reclutadores.",
        icon: "shieldCheck"
      }
    ]
  },
  testimonials: {
    title: "Historias de Éxito",
    subtitle: "Descubre los testimonios de candidatos que optimizaron sus currículums para conseguir puestos en empresas tecnológicas líderes.",
    items: [
      {
        quote: "Me postulé a más de 20 ofertas en LinkedIn sin recibir respuesta. La primera semana que empecé a usar XV Resume para adaptar mi currículum, obtuve 3 invitaciones a entrevistas.",
        author: "Mert Yılmaz",
        role: "Desarrollador Frontend Senior",
        company: "Trendyol"
      },
      {
        quote: "Análisis de datos perfecto. Resolvió los problemas de conversión de caracteres en los sistemas ATS. Plantillas muy profesionales y minimalistas.",
        author: "Zeynep Demir",
        role: "Ingeniera de Software",
        company: "Siemens"
      }
    ]
  },
  howItWorks: {
    title: "Cómo funciona",
    subtitle: "Olvídate de las conjeturas. Prepárate para postularte en 3 sencillos pasos.",
    steps: [
      {
        num: "01",
        title: "Crea tu Perfil Base",
        desc: "Introduce tus estudios, experiencia y proyectos una vez. Tus datos se guardarán de forma segura en nuestra base de datos encriptada.",
        visualLabel: "Perfil Base Guardado"
      },
      {
        num: "02",
        title: "Pega el enlace de la oferta",
        desc: "Copia la URL de la oferta de empleo de LinkedIn, Indeed o cualquier otra plataforma y pégala en el panel de control.",
        visualLabel: "Analizando oferta de empleo..."
      },
      {
        num: "03",
        title: "Descarga tu PDF compatible con ATS",
        desc: "Nuestra IA adapta tus detalles para alinearse con los requisitos y genera instantáneamente un PDF limpio y parseable.",
        visualLabel: "Currículum listo para descargar"
      }
    ]
  },
  faq: {
    title: "Preguntas Frecuentes",
    subtitle: "Preguntas comunes sobre XV Resume y optimización para ATS.",
    items: [
      {
        question: "¿Están seguros mis datos personales?",
        answer: "Absolutamente. Todos los datos de perfil de usuario se almacenan y encriptan de forma segura a través de Supabase. Nunca vendemos tu información personal a terceros."
      },
      {
        question: "¿La IA inventa experiencias laborales?",
        answer: "No. La IA no inventa experiencias. Reescribe y reformula tus responsabilidades actuales utilizando terminología del sector que coincida con las especificaciones de la oferta."
      },
      {
        question: "¿Los PDFs generados son compatibles con todas las plataformas ATS?",
        answer: "Sí. Nuestras plantillas están diseñadas estrictamente para ser legibles por parser de ATS. Evitamos diseños pesados, gráficos o imágenes que suelen confundir a los algoritmos."
      },
      {
        question: "¿Qué portales de empleo son compatibles?",
        answer: "Puedes copiar directamente los enlaces de LinkedIn, CareerBuilder, Glassdoor, Indeed y muchas otras páginas de empleo corporativas."
      }
    ]
  },
  ctaBanner: {
    title: "Comienza a conseguir más entrevistas",
    desc: "¿Cansado de enviar currículums que desaparecen en el vacío? Optimiza tu CV en segundos y capta la atención de los reclutadores.",
    button: "Comenzar Gratis Ahora"
  },
  contact: {
    title: "Contáctanos",
    subtitle: "Ponte en contacto con nosotros para cualquier consulta, sugerencia o problema de soporte.",
    infoTitle: "Contacto Directo",
    infoDesc: "No dudes en enviarnos un correo electrónico si tienes alguna pregunta o sugerencia.",
    emailLabel: "support@xvresume.com",
    formName: "Tu Nombre",
    formEmail: "Tu Dirección de Correo",
    formMessage: "Tu Mensaje",
    formSubmit: "Enviar Mensaje",
    formSuccess: "¡Tu mensaje ha sido enviado con éxito!"
  }
};

const contentFR: LandingContent = {
  hero: {
    badge: "Optimisation ATS propulsée par IA",
    titleStart: "Ne soyez plus éliminé d'office. Optimisez votre CV ",
    titleHighlight: "par offre",
    titleEnd: " en quelques secondes.",
    subtitle: "Passez les filtres des logiciels de recrutement (ATS). XV Resume utilise une IA avancée pour analyser les descriptions de poste et aligner vos compétences avec les attentes des recruteurs.",
    ctaPrimary: "Créer un CV optimisé ATS",
    ctaSecondary: "Parcourir les modèles",
  },
  purpose: {
    sectionTitle: "La dure réalité de la recherche d'emploi moderne",
    statValue: "75%",
    statLabel: "Taux moyen de rejet par les ATS",
    statDesc: "La plupart des entreprises utilisent des systèmes de suivi des candidatures (ATS) pour rejeter les CV qui ne contiennent pas les mots-clés de l'offre, avant même qu'un recruteur humain ne les lise.",
    card1Title: "Alignement intelligent des mots-clés",
    card1Desc: "Les CV génériques échouent car ils essaient de convenir à tous. XV Resume analyse l'offre d'emploi exacte et insère les mots-clés manquants de votre secteur.",
    card2Title: "Précision assistée par IA",
    card2Desc: "S'appuyant sur Supabase & OpenAI, nos algorithmes adaptent la formulation de vos expériences pour correspondre au jargon recherché, sans modifier vos réelles compétences.",
  },
  proof: {
    title: "Comment fonctionnent les filtres ATS",
    subtitle: "Comparaison directe entre un CV classique et un CV optimisé par XV Resume selon les mots-clés de l'annonce.",
    jobTitle: "Développeur React Senior",
    matchScore: "Score de correspondance",
    scanActive: "Démarrage de l'optimisation...",
    scanComplete: "Optimisation terminée !",
    skills: [
      { name: "React.js & Next.js", status: "matched" },
      { name: "TypeScript", status: "matched" },
      { name: "State Management (Zustand/Redux)", status: "missing" },
      { name: "RESTful API Integration", status: "matched" },
      { name: "Tailwind CSS & Responsive Design", status: "missing" },
      { name: "Unit Testing (Jest/Cypress)", status: "missing" },
    ],
  },
  featuresList: {
    title: "Fonctionnalités Clés",
    subtitle: "Allez au-delà des créateurs de CV traditionnels. Bénéficiez de technologies qui vous mènent réellement à l'entretien.",
    items: [
      {
        title: "Intégration Intelligente des Mots-Clés",
        desc: "Analyse instantanément l'offre d'emploi et insère naturellement les compétences techniques et méthodologies dans vos descriptions.",
        icon: "target"
      },
      {
        title: "Modèles PDF 100% compatibles ATS",
        desc: "Génère des PDF épurés et optimisés pour le parsing des principaux systèmes de recrutement (Taleo, Workable, etc.).",
        icon: "fileText"
      },
      {
        title: "Correspondance de l'offre en temps réel",
        desc: "Visualisez votre score de correspondance exact et comblez les lacunes avant d'envoyer votre CV.",
        icon: "shieldCheck"
      }
    ]
  },
  testimonials: {
    title: "Témoignages de Réussite",
    subtitle: "Découvrez comment nos utilisateurs ont décroché des entretiens dans les plus grandes entreprises de tech.",
    items: [
      {
        quote: "J'avais postulé à plus de 20 offres sur LinkedIn sans aucun retour. Dès la première semaine d'utilisation de XV Resume pour personnaliser mon CV, j'ai reçu 3 invitations à des entretiens.",
        author: "Mert Yılmaz",
        role: "Développeur Frontend Senior",
        company: "Trendyol"
      },
      {
        quote: "Parsing parfait. A résolu les problèmes de conversion de caractères spécifiques aux ATS. Modèles sobres et très professionnels.",
        author: "Zeynep Demir",
        role: "Ingénieure Logiciel",
        company: "Siemens"
      }
    ]
  },
  howItWorks: {
    title: "Comment ça marche",
    subtitle: "Ne devinez plus. Soyez prêt à postuler en 3 étapes simples.",
    steps: [
      {
        num: "01",
        title: "Créez votre profil de base",
        desc: "Saisissez vos études, expériences et projets une fois pour toutes. Vos données sont sécurisées et chiffrées dans notre base de données.",
        visualLabel: "Profil de base enregistré"
      },
      {
        num: "02",
        title: "Collez le lien de l'offre",
        desc: "Copiez l'URL de l'offre d'emploi sur LinkedIn, Indeed ou toute autre plateforme et collez-la dans votre tableau de bord.",
        visualLabel: "Analyse de l'annonce..."
      },
      {
        num: "03",
        title: "Téléchargez le PDF compatible ATS",
        desc: "Notre IA ajuste vos détails pour correspondre aux attentes et génère instantanément un PDF propre et lisible par les ATS.",
        visualLabel: "CV prêt à être téléchargé"
      }
    ]
  },
  faq: {
    title: "Foire Aux Questions",
    subtitle: "Questions les plus courantes sur XV Resume et l'optimisation ATS.",
    items: [
      {
        question: "Mes données personnelles sont-elles sécurisées ?",
        answer: "Absolument. Toutes vos données sont chiffrées et stockées via l'infrastructure sécurisée de Supabase. Nous ne vendons jamais vos informations à des tiers."
      },
      {
        question: "L'IA invente-t-elle des expériences professionnelles ?",
        answer: "Non. L'IA n'invente rien. Elle reformule vos expériences réelles à l'aide de la terminologie recherchée par le recruteur."
      },
      {
        question: "Les PDF générés sont-ils lisibles par tous les ATS ?",
        answer: "Oui, nos modèles sont spécifiquement conçus pour être légers et sans éléments graphiques complexes qui perturbent les algorithmes de parsing."
      },
      {
        question: "Quels sites d'emploi sont pris en charge ?",
        answer: "Vous pouvez copier les liens de LinkedIn, Indeed, Glassdoor, CareerBuilder et de la plupart des sites de recrutement d'entreprises."
      }
    ]
  },
  ctaBanner: {
    title: "Décrochez plus d'entretiens d'embauche",
    desc: "Fatigué d'envoyer des CV qui disparaissent dans le vide ? Ajustez votre profil en quelques secondes et sortez du lot.",
    button: "Commencer gratuitement"
  },
  contact: {
    title: "Contactez-nous",
    subtitle: "Une question, une suggestion ou besoin d'aide ? N'hésitez pas à nous écrire.",
    infoTitle: "Contact Direct",
    infoDesc: "Nous répondons à vos e-mails de support et recueillons volontiers vos avis.",
    emailLabel: "support@xvresume.com",
    formName: "Votre Nom",
    formEmail: "Votre Adresse E-mail",
    formMessage: "Votre Message",
    formSubmit: "Envoyer le Message",
    formSuccess: "Votre message a été envoyé avec succès !"
  }
};

const contentJP: LandingContent = {
  hero: {
    badge: "AI搭載型ATS最適化ツール",
    titleStart: "もう書類選考で落とされない。あなたの履歴書を",
    titleHighlight: "求人に合わせて",
    titleEnd: "数秒で最適化。",
    subtitle: "採用管理システム（ATS）のフィルターを突破しましょう。XV Resumeは高度なAIを用いて求人票を分析し、あなたの職務経歴書を企業が求めるキーワードに正確にマッチさせます。",
    ctaPrimary: "ATS対応の履歴書を作成する",
    ctaSecondary: "テンプレートを見る",
  },
  purpose: {
    sectionTitle: "現代の就職活動における厳しい現実",
    statValue: "75%",
    statLabel: "平均的なATSによる書類選考不合格率",
    statDesc: "ほとんどの企業は採用管理システム（ATS）を導入しており、採用担当者が目にする前に、求人要件のキーワードを含まない履歴書を自動的に振り落としています。",
    card1Title: "スマートなキーワード選定",
    card1Desc: "ありきたりな履歴書が選考に落ちるのは、すべての求人に同じ内容を使い回すからです。XV Resumeは求人内容を解析し、不足している業界キーワードを補完します。",
    card2Title: "AIによる高い精度",
    card2Desc: "SupabaseとOpenAIの基盤に基づき、あなたの経歴事実を偽ることなく、求人が求めている業界用語や表現にAIが自然にリライトします。",
  },
  proof: {
    title: "ATSフィルタリングの仕組み",
    subtitle: "一般の履歴書と、求人の重要ワードに基づいてXV Resumeで最適化した履歴書のキーワード合致度の比較。",
    jobTitle: "シニア React デベロッパー",
    matchScore: "マッチングスコア",
    scanActive: "最適化プロセスを開始中...",
    scanComplete: "最適化が完了しました！",
    skills: [
      { name: "React.js & Next.js", status: "matched" },
      { name: "TypeScript", status: "matched" },
      { name: "State Management (Zustand/Redux)", status: "missing" },
      { name: "RESTful API Integration", status: "matched" },
      { name: "Tailwind CSS & Responsive Design", status: "missing" },
      { name: "Unit Testing (Jest/Cypress)", status: "missing" },
    ],
  },
  featuresList: {
    title: "優れた機能",
    subtitle: "一般的な履歴書作成ツールを超えたテクノロジーで、あなたの採用確率を劇的に向上させます。",
    items: [
      {
        title: "スマートキーワード最適化",
        desc: "求人をリアルタイム分析し、あなたの経歴の中に不足しているスキルや関連ワードを自然な表現で追加します。",
        icon: "target"
      },
      {
        title: "100% ATSフレンドリーなPDF出力",
        desc: "主要な採用解析システム（Taleo、Workableなど）が容易にテキスト情報を抽出できる、余計な装飾を省いたレイアウトを生成します。",
        icon: "fileText"
      },
      {
        title: "リアルタイムでのマッチング診断",
        desc: "求人を送信する前に、現在のあなたの履歴書との適合率や、不足している要件をスコアで可視化します。",
        icon: "shieldCheck"
      }
    ]
  },
  testimonials: {
    title: "成功体験談",
    subtitle: "XV Resumeを使用して、人気企業からの内定や面接オファーを獲得したユーザーの声をご紹介します。",
    items: [
      {
        quote: "LinkedInで20社以上応募しても反応がありませんでした。XV Resumeを導入して求人ごとにCVをカスタマイズし始めた最初の週に、3社から面接の招待が届きました。",
        author: "Mert Yılmaz",
        role: "シニアフロントエンドエンジニア",
        company: "Trendyol"
      },
      {
        quote: "完璧な構文解析です。ATSで日本語や特殊文字が文字化けするエラーを完全に防ぎました。デザインも非常に洗練されていてプロフェッショナルです。",
        author: "Zeynep Demir",
        role: "ソフトウェアエンジニア",
        company: "Siemens"
      }
    ]
  },
  howItWorks: {
    title: "ご利用の流れ",
    subtitle: "複雑な手順は一切不要です。3つのステップで応募の準備が整います。",
    steps: [
      {
        num: "01",
        title: "基本プロフィールの作成",
        desc: "あなたの学歴、職歴、プロジェクトを一度入力します。データは暗号化データベースに安全に保存されます。",
        visualLabel: "プロフィール情報の保存完了"
      },
      {
        num: "02",
        title: "求人URLを貼り付け",
        desc: "LinkedInやIndeedなど、応募したい求人のリンクをコピーして、ダッシュボードに貼り付けます。",
        visualLabel: "求人要件を分析中..."
      },
      {
        num: "03",
        title: "ATS対応のPDFをダウンロード",
        desc: "AIが要件とあなたの経歴を照らし合わせ、即座に最適な経歴書PDFを生成します。",
        visualLabel: "履歴書のダウンロード準備完了"
      }
    ]
  },
  faq: {
    title: "よくある質問",
    subtitle: "XV ResumeやATS最適化についてよく寄せられる質問にお答えします。",
    items: [
      {
        question: "個人データは安全に保護されますか？",
        answer: "はい。すべてのプロフィール情報はSupabaseを通じて安全に保存・暗号化されます。ご本人の同意なしに第三者に売却されることは決してありません。"
      },
      {
        question: "AIが経歴をでっち上げることはありますか？",
        answer: "いいえ。私たちのAIは経歴を虚偽に作り直すことはせず、現在お持ちの経験と成果を、求人に沿った専門用語やアピールしやすい表現に書き換えるだけです。"
      },
      {
        question: "作成されたPDFはあらゆるATSに対応していますか？",
        answer: "はい。私たちのテンプレートは、解析ロボットがデータを正しく読み取れるよう極限まで配慮して設計されています。読み込みエラーを起こしやすいグラフィックや複雑な表は避けています。"
      },
      {
        question: "どのような求人サイトに対応していますか？",
        answer: "LinkedInをはじめ、GlassdoorやIndeed、その他多くの企業採用ページの直リンクをそのままコピーして解析を行うことができます。"
      }
    ]
  },
  ctaBanner: {
    title: "書類選考通過率を飛躍的に高めましょう",
    desc: "応募しても連絡が来ない状態から脱却しませんか？数秒で職務経歴書を最適化し、採用担当者の目を引きましょう。",
    button: "今すぐ無料で始める"
  },
  contact: {
    title: "お問い合わせ",
    subtitle: "ご質問、ご提案、システムサポートに関するお問い合わせはこちらからどうぞ。",
    infoTitle: "直接連絡",
    infoDesc: "機能のご要望や不具合 of 報告など、いつでもお気軽にメールでお問い合わせください。",
    emailLabel: "support@xvresume.com",
    formName: "お名前",
    formEmail: "メールアドレス",
    formMessage: "お問い合わせ内容",
    formSubmit: "送信する",
    formSuccess: "メッセージが正常に送信されました！"
  }
};

export const getLandingData = (locale: string): LandingContent => {
  switch (locale) {
    case 'tr':
      return contentTR;
    case 'de':
      return contentDE;
    case 'es':
      return contentES;
    case 'fr':
      return contentFR;
    case 'jp':
      return contentJP;
    default:
      return contentEN; // default fallback
  }
};

