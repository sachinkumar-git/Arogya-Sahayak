import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ExternalLink,
  FileText,
  Heart,
  HeartHandshake,
  Languages,
  MessageSquare,
  Phone,
  PhoneCall,
  Pill,
  Stethoscope,
  UserRound,
  Video,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo, BrandMark } from "@/components/layout/BrandLogo";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { SkipLink } from "@/components/layout/SkipLink";
import { PulseLine } from "@/components/common/PulseLine";
import { EmergencyDialog } from "@/components/consultations/EmergencyDialog";
import { toneBar, toneClasses, type Tone } from "@/lib/tones";
import { useLanguage } from "@/context/LanguageContext";
import { useSession } from "@/context/SessionContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-telemedicine.jpg";

const MODES: { icon: LucideIcon; key: string }[] = [
  { icon: Video, key: "mode.video" },
  { icon: PhoneCall, key: "mode.audio" },
  { icon: MessageSquare, key: "mode.chat" },
];

const STEPS = ["step1", "step2", "step3"] as const;

const ROLES: { role: "patient" | "sahayak" | "doctor"; icon: LucideIcon; tone: Tone }[] = [
  { role: "patient", icon: UserRound, tone: "primary" },
  { role: "sahayak", icon: HeartHandshake, tone: "wellness" },
  { role: "doctor", icon: Stethoscope, tone: "accent" },
];

const RESOURCES = [
  { key: "landing.ayushman", href: "https://nha.gov.in/img/resources/PMJAY-Hospital-List.pdf" },
  { key: "landing.chatbot", href: "https://sih2-three.vercel.app/" },
];

function HeroVisual() {
  const { t } = useLanguage();
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none" aria-hidden>
      <div className="absolute -inset-3 -z-10 rotate-2 rounded-[2.5rem] bg-primary-light sm:-inset-5" />
      <div className="absolute -right-2 -top-4 -z-10 h-24 w-24 rounded-full bg-marigold/30 blur-2xl" />
      <img
        src={heroImage}
        alt=""
        className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-lg ring-4 ring-card sm:aspect-video lg:aspect-[4/3]"
        width={1920}
        height={1080}
        decoding="async"
      />

      <div className="absolute -bottom-6 left-3 hidden w-56 rounded-2xl border bg-card/95 p-4 shadow-lg backdrop-blur animate-rise [animation-delay:250ms] min-[420px]:block sm:left-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emergency-light text-emergency">
            <Heart className="h-4 w-4" />
          </span>
          {t("vitals.bp")}
        </div>
        <p className="mt-2 font-display text-2xl font-bold tabular-nums">
          120/80 <span className="text-xs font-medium text-muted-foreground">mmHg</span>
        </p>
        <PulseLine className="mt-1 h-6 w-full text-primary" animate />
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-success-light px-2 py-0.5 text-xs font-semibold text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {t("vitals.normal")}
        </span>
      </div>

      <div className="absolute -top-4 right-3 hidden items-center gap-3 rounded-2xl border bg-card/95 py-2.5 pl-2.5 pr-4 shadow-lg backdrop-blur animate-rise [animation-delay:400ms] min-[420px]:flex sm:right-6">
        <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Video className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-card bg-success" />
        </span>
        <span className="text-sm font-semibold">{t("mode.video")}</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { t } = useLanguage();
  const { user } = useSession();
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  useDocumentTitle();

  const startTo = user ? "/dashboard" : "/signup";
  const startLabel = user ? t("nav.goToDashboard") : t("landing.getStarted");

  return (
    <div className="min-h-dvh bg-background">
      <SkipLink />
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="container flex h-16 items-center gap-2 px-4 sm:px-6">
          <BrandLogo />
          <nav className="ml-auto flex items-center gap-2" aria-label={t("nav.main")}>
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/medicines">{t("nav.medicines")}</Link>
            </Button>
            <LanguageSelector />
            <Button size="sm" asChild>
              <Link to={user ? "/dashboard" : "/login"}>
                {user ? (
                  <>
                    <span className="sm:hidden">{t("nav.dashboard")}</span>
                    <span className="hidden sm:inline">{t("nav.goToDashboard")}</span>
                  </>
                ) : (
                  t("nav.login")
                )}
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <section className="relative isolate overflow-hidden">
          <div className="bg-dots absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden />
          <div
            className="absolute -top-40 left-1/2 -z-10 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,hsl(var(--primary)/0.12),transparent)]"
            aria-hidden
          />
          <div className="container grid items-center gap-14 px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-28 lg:pt-20">
            <div className="space-y-7 text-center animate-rise lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-3 py-1.5 text-sm font-semibold text-primary shadow-xs">
                <Languages className="h-4 w-4" aria-hidden />
                {t("landing.languagesBadge")}
              </p>
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">{t("landing.subtitle")}</h1>
                <PulseLine className="mx-auto h-6 w-40 text-marigold lg:mx-0" animate />
              </div>
              <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">{t("landing.tagline")}</p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap lg:justify-start">
                <Button size="lg" className="btn-large" asChild>
                  <Link to={startTo}>
                    {startLabel}
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="btn-large" asChild>
                  <Link to="/medicines">
                    <Pill aria-hidden />
                    {t("landing.findMedicines")}
                  </Link>
                </Button>
                <Button size="lg" variant="destructive" className="btn-large" onClick={() => setEmergencyOpen(true)}>
                  <Phone aria-hidden />
                  {t("landing.emergency")}
                </Button>
              </div>
              <ul className="flex flex-wrap justify-center gap-2 lg:justify-start" aria-label={t("booking.stepMode")}>
                {MODES.map(({ icon: Icon, key }) => (
                  <li key={key} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                    <Icon className="h-4 w-4 text-primary" aria-hidden />
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>
            <HeroVisual />
          </div>
        </section>

        <section className="container px-4 py-16 sm:px-6 lg:py-20" aria-labelledby="features">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 id="features" className="text-3xl font-bold sm:text-4xl">
              {t("landing.featuresTitle")}
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
            <article className="panel-brand flex flex-col justify-between gap-10 p-7 sm:p-9 md:col-span-2 lg:col-span-2 lg:row-span-2">
              <div className="bg-dots-light absolute inset-0 -z-10" aria-hidden />
              <PulseLine className="absolute inset-x-0 top-[30%] -z-10 h-20 w-full text-primary-foreground/15" />
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/15">
                <Stethoscope className="h-7 w-7" aria-hidden />
              </span>
              <div className="max-w-lg space-y-3">
                <h3 className="text-2xl font-bold sm:text-3xl">{t("landing.featureConsult")}</h3>
                <p className="text-lg leading-relaxed text-primary-foreground/85">{t("landing.featureConsultDesc")}</p>
                <ul className="flex flex-wrap gap-2 pt-2" aria-hidden>
                  {MODES.map(({ icon: Icon, key }) => (
                    <li key={key} className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-sm font-semibold">
                      <Icon className="h-4 w-4" />
                      {t(key)}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
            {[
              { icon: Pill, tone: "wellness" as Tone, title: "landing.featureMedicines", desc: "landing.featureMedicinesDesc" },
              { icon: FileText, tone: "accent" as Tone, title: "landing.featureRecords", desc: "landing.featureRecordsDesc" },
            ].map(({ icon: Icon, tone, title, desc }) => (
              <article key={title} className="health-card flex flex-col gap-4">
                <span className={cn("icon-large", toneClasses(tone))}>
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{t(title)}</h3>
                  <p className="leading-relaxed text-muted-foreground">{t(desc)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-border/70 bg-card/60 py-16 lg:py-20" aria-labelledby="how">
          <div className="container px-4 sm:px-6">
            <h2 id="how" className="mb-12 text-center text-3xl font-bold sm:text-4xl">
              {t("landing.howTitle")}
            </h2>
            <ol className="relative grid gap-8 md:grid-cols-3 md:gap-6">
              <span className="absolute left-[16.66%] right-[16.66%] top-6 hidden border-t-2 border-dashed border-primary/30 md:block" aria-hidden />
              {STEPS.map((step, index) => (
                <li key={step} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground shadow-primary ring-8 ring-background">
                    {index + 1}
                  </span>
                  <div className="space-y-1.5 md:max-w-xs">
                    <h3 className="text-lg font-semibold">{t(`landing.${step}`)}</h3>
                    <p className="leading-relaxed text-muted-foreground">{t(`landing.${step}Desc`)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="container px-4 py-16 sm:px-6 lg:py-20" aria-labelledby="roles">
          <h2 id="roles" className="mb-10 text-center text-3xl font-bold sm:text-4xl">
            {t("landing.rolesTitle")}
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {ROLES.map(({ role, icon: Icon, tone }) => (
              <Link
                key={role}
                to={user ? "/dashboard" : `/signup?role=${role}`}
                className="health-card card-link group relative flex flex-col gap-4 overflow-hidden"
              >
                <span className={cn("absolute inset-x-0 top-0 h-1.5", toneBar(tone))} aria-hidden />
                <span className={cn("icon-large", toneClasses(tone))}>
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <span className="space-y-1.5">
                  <span className="block font-display text-xl font-semibold">{t(`roles.${role}`)}</span>
                  <span className="block leading-relaxed text-muted-foreground">{t(`roles.${role}Desc`)}</span>
                </span>
                {!user && (
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-primary">
                    {t("landing.joinAs", { role: t(`roles.${role}`) })}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden />
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>

        <section className="container px-4 pb-16 sm:px-6 lg:pb-20" aria-labelledby="cta">
          <div className="panel-brand flex flex-col items-center gap-6 px-6 py-12 text-center sm:px-12 lg:flex-row lg:justify-between lg:text-left">
            <div className="bg-dots-light absolute inset-0 -z-10" aria-hidden />
            <div className="max-w-xl space-y-2">
              <h2 id="cta" className="text-3xl font-bold">
                {t("landing.ctaTitle")}
              </h2>
              <p className="text-lg text-primary-foreground/85">{t("landing.ctaDesc")}</p>
            </div>
            <Button size="lg" variant="inverse" className="btn-large shrink-0" asChild>
              <Link to={startTo}>
                {startLabel}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-background">
        <div className="container flex flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <p className="flex items-center gap-2.5 font-display text-lg font-bold">
              <BrandMark className="[&>span]:border-foreground" />
              {t("landing.title")}
            </p>
            <p className="max-w-sm text-sm text-background/75">{t("landing.footer")}</p>
            <p className="text-sm text-background/75">© {new Date().getFullYear()}</p>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">{t("landing.resources")}</p>
            <ul className="space-y-2 text-sm">
              {RESOURCES.map(({ key, href }) => (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-6 items-center gap-1.5 rounded text-background/80 underline-offset-4 hover:text-background hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold"
                  >
                    {t(key)}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>

      <EmergencyDialog open={emergencyOpen} onOpenChange={setEmergencyOpen} />
    </div>
  );
}
