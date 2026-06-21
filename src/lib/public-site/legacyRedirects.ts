import { redirect } from "next/navigation";

import { headers } from "next/headers";

import { resolvePublicSiteLanguageFromSettings } from "@/lib/public-site/language";
import { resolveDetectedPublicLanguage } from "@/lib/public-site/localeDetection";
import { resolveLegacySiteLanguage } from "@/lib/public-site/pathLanguage";
import { buildPublicSiteEntityHref, buildPublicSiteHomeHref } from "@/lib/public-site/paths";
import { getSettings } from "@/services/settingsService";

import type { PublicSiteEntitySegment } from "@/lib/public-site/paths";
import type { PublicSiteLanguage } from "@/types/public-site";

function readLangParam(
  searchParams: Record<string, string | string[] | undefined>,
): string | undefined {
  return typeof searchParams.lang === "string" ? searchParams.lang : undefined;
}

async function resolveRedirectLanguage(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<PublicSiteLanguage> {
  const [settings, headerStore] = await Promise.all([getSettings(), headers()]);
  const langParam = readLangParam(searchParams);

  if (langParam) {
    return resolvePublicSiteLanguageFromSettings(langParam, settings);
  }

  return resolveDetectedPublicLanguage(settings, headerStore.get("accept-language"));
}

export async function redirectLegacySiteHome(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<never> {
  const language = await resolveRedirectLanguage(searchParams);
  redirect(buildPublicSiteHomeHref(language));
}

export async function redirectLegacySiteEntity(
  segment: PublicSiteEntitySegment,
  slug: string,
  searchParams: Record<string, string | string[] | undefined>,
): Promise<never> {
  const settings = await getSettings();
  const langParam = readLangParam(searchParams);
  const defaultLanguage: PublicSiteLanguage = settings.defaultLanguage === "en" ? "en" : "uk";
  const language = resolveLegacySiteLanguage(langParam, defaultLanguage);

  redirect(buildPublicSiteEntityHref(segment, slug, language));
}
