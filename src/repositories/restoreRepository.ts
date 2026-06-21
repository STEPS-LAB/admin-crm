import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { featureFlagInstallations } from "@/db/schema/feature-flags";
import { redirectRules, robotsConfig, seoTemplates, sitemapConfig } from "@/db/schema/seo";
import { settings } from "@/db/schema/settings";

import type { RestoreScope } from "@/constants/backup";
import type { BackupSnapshotPayload } from "@/types/backup";

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export async function previewRestoreScopes(
  payload: BackupSnapshotPayload,
  scopes: readonly RestoreScope[],
): Promise<
  Array<{
    scope: RestoreScope;
    willCreate: number;
    willUpdate: number;
    willSkip: number;
    warnings: string[];
  }>
> {
  const db = getDb();
  const previews: Array<{
    scope: RestoreScope;
    willCreate: number;
    willUpdate: number;
    willSkip: number;
    warnings: string[];
  }> = [];

  for (const scope of scopes) {
    const warnings: string[] = [];
    let willCreate = 0;
    let willUpdate = 0;
    let willSkip = 0;

    switch (scope) {
      case "settings": {
        if (!payload.settings) {
          warnings.push("Backup does not include settings data");
          break;
        }

        const [current] = await db.select().from(settings).limit(1);

        if (!current) {
          willCreate = 1;
        } else {
          willUpdate = 1;
        }

        break;
      }

      case "redirects": {
        const existing = await db.select().from(redirectRules);
        const existingBySource = new Map(existing.map((row) => [row.source, row]));

        for (const row of payload.redirectRules) {
          const source = asString(row.source);

          if (!source) {
            willSkip += 1;
            continue;
          }

          const current = existingBySource.get(source);

          if (!current) {
            willCreate += 1;
            continue;
          }

          if (
            current.destination !== asString(row.destination) ||
            current.statusCode !== row.statusCode ||
            current.enabled !== asBoolean(row.enabled, true)
          ) {
            willUpdate += 1;
          } else {
            willSkip += 1;
          }
        }

        break;
      }

      case "seo_templates": {
        const existing = await db.select().from(seoTemplates);
        const existingByKey = new Map(
          existing.map((row) => [`${row.ownerType}:${row.language}:${row.name}`, row]),
        );

        for (const row of payload.seoTemplates) {
          const ownerType = asString(row.ownerType);
          const language = asString(row.language);
          const name = asString(row.name);

          if (!ownerType || !language || !name) {
            willSkip += 1;
            continue;
          }

          const key = `${ownerType}:${language}:${name}`;

          if (!existingByKey.has(key)) {
            willCreate += 1;
          } else {
            willUpdate += 1;
          }
        }

        break;
      }

      case "feature_flags": {
        const existing = await db.select().from(featureFlagInstallations);
        const existingBySlug = new Map(existing.map((row) => [row.slug, row]));

        for (const row of payload.featureFlagInstallations) {
          const slug = asString(row.slug);

          if (!slug) {
            willSkip += 1;
            continue;
          }

          const current = existingBySlug.get(slug);

          if (!current) {
            willCreate += 1;
            continue;
          }

          if (current.enabled !== asBoolean(row.enabled)) {
            willUpdate += 1;
          } else {
            willSkip += 1;
          }
        }

        break;
      }

      default: {
        const exhaustiveCheck: never = scope;
        warnings.push(`Unsupported scope: ${exhaustiveCheck}`);
      }
    }

    previews.push({ scope, willCreate, willUpdate, willSkip, warnings });
  }

  return previews;
}

export async function applyRestoreScopes(
  payload: BackupSnapshotPayload,
  scopes: readonly RestoreScope[],
): Promise<void> {
  const db = getDb();

  await db.transaction(async (tx) => {
    if (scopes.includes("settings") && payload.settings) {
      const [current] = await tx.select().from(settings).limit(1);

      if (!current) {
        throw new Error("Settings record not found");
      }

      const restorable: Record<string, unknown> = { ...payload.settings };
      delete restorable.id;
      delete restorable.createdAt;
      delete restorable.updatedAt;

      await tx
        .update(settings)
        .set({
          ...(restorable as Partial<typeof settings.$inferInsert>),
          updatedAt: new Date(),
        })
        .where(eq(settings.id, current.id));
    }

    if (scopes.includes("redirects")) {
      for (const row of payload.redirectRules) {
        const source = asString(row.source);
        const destination = asString(row.destination);

        if (!source || !destination) {
          continue;
        }

        await tx
          .insert(redirectRules)
          .values({
            id: asString(row.id) ?? undefined,
            source,
            destination,
            statusCode:
              row.statusCode === "302" || row.statusCode === "307" || row.statusCode === "308"
                ? row.statusCode
                : "301",
            enabled: asBoolean(row.enabled, true),
            hits: typeof row.hits === "number" ? row.hits : 0,
          })
          .onConflictDoUpdate({
            target: redirectRules.source,
            set: {
              destination,
              statusCode:
                row.statusCode === "302" || row.statusCode === "307" || row.statusCode === "308"
                  ? row.statusCode
                  : "301",
              enabled: asBoolean(row.enabled, true),
              updatedAt: new Date(),
            },
          });
      }
    }

    if (scopes.includes("seo_templates") && payload.seoTemplates.length > 0) {
      await tx.delete(seoTemplates);
      await tx.insert(seoTemplates).values(
        payload.seoTemplates.map((row) => {
          const ownerType = asString(row.ownerType);
          const language = asString(row.language);
          const name = asString(row.name);
          const ownerTypeValue =
            ownerType === "product" ||
            ownerType === "category" ||
            ownerType === "page" ||
            ownerType === "brand" ||
            ownerType === "global"
              ? ownerType
              : "global";
          const languageValue = language === "en" || language === "uk" ? language : "uk";

          return {
            id: asString(row.id) ?? undefined,
            ownerType: ownerTypeValue,
            language: languageValue,
            name: name ?? "Restored template",
            metaTitleTemplate: asString(row.metaTitleTemplate),
            metaDescriptionTemplate: asString(row.metaDescriptionTemplate),
            ogTitleTemplate: asString(row.ogTitleTemplate),
            ogDescriptionTemplate: asString(row.ogDescriptionTemplate),
            isDefault: asBoolean(row.isDefault),
          };
        }) as (typeof seoTemplates.$inferInsert)[],
      );
    }

    if (scopes.includes("feature_flags")) {
      for (const row of payload.featureFlagInstallations) {
        const slug = asString(row.slug);

        if (!slug) {
          continue;
        }

        await tx
          .insert(featureFlagInstallations)
          .values({
            slug,
            enabled: asBoolean(row.enabled),
          })
          .onConflictDoUpdate({
            target: featureFlagInstallations.slug,
            set: {
              enabled: asBoolean(row.enabled),
              updatedAt: new Date(),
            },
          });
      }
    }

    if (scopes.includes("settings")) {
      if (payload.sitemapConfig.length > 0) {
        await tx.delete(sitemapConfig);
        await tx.insert(sitemapConfig).values(
          payload.sitemapConfig.map((row) => {
            const ownerType =
              row.ownerType === "product" ||
              row.ownerType === "category" ||
              row.ownerType === "page" ||
              row.ownerType === "brand" ||
              row.ownerType === "collection" ||
              row.ownerType === "tag" ||
              row.ownerType === "landing_page"
                ? row.ownerType
                : "page";

            const changeFrequency =
              row.changeFrequency === "hourly" ||
              row.changeFrequency === "daily" ||
              row.changeFrequency === "weekly" ||
              row.changeFrequency === "monthly"
                ? row.changeFrequency
                : null;

            return {
              id: asString(row.id) ?? undefined,
              ownerType,
              ownerId: asString(row.ownerId),
              priority: asString(row.priority),
              changeFrequency,
              includeImages: asBoolean(row.includeImages, true),
              includeVideos: asBoolean(row.includeVideos),
              includeNews: asBoolean(row.includeNews),
              isExcluded: asBoolean(row.isExcluded),
              autoGenerate: asBoolean(row.autoGenerate, true),
            };
          }) as (typeof sitemapConfig.$inferInsert)[],
        );
      }

      if (payload.robotsConfig.length > 0) {
        await tx.delete(robotsConfig);
        await tx.insert(robotsConfig).values(
          payload.robotsConfig.map((row) => ({
            id: asString(row.id) ?? undefined,
            userAgent: asString(row.userAgent) ?? "*",
            allowRules: asString(row.allowRules),
            disallowRules: asString(row.disallowRules),
            host: asString(row.host),
            sitemapUrls: Array.isArray(row.sitemapUrls) ? row.sitemapUrls : [],
            customDirectives: asString(row.customDirectives),
            isActive: asBoolean(row.isActive, true),
          })),
        );
      }
    }
  });
}
