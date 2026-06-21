import { relations } from "drizzle-orm";

import { apiKeys, webhookDeliveries, webhookEndpoints } from "./api";
import { auditLogs, profiles, sessions } from "./auth";
import { backupRecords } from "./backup";
import {
  brandTranslations,
  brands,
  categories,
  categoryTranslations,
  productAttributeDefinitions,
  productAttributeValues,
  productTranslations,
  products,
} from "./catalog";
import { historyEntries } from "./history";
import { notificationSettings, notifications } from "./notifications";
import { pageTranslations, pages } from "./pages";
import {
  canonical,
  customHeadTags,
  hreflang,
  internalLinks,
  metadata,
  openGraph,
  redirectRules,
  robots,
  robotsConfig,
  schemaDocuments,
  seoAnalysis,
  seoProfiles,
  seoScoreHistory,
  seoTemplates,
  sitemapConfig,
  twitterCards,
  verificationCodes,
} from "./seo";
import { settings } from "./settings";
import {
  mediaAssets,
  mediaCollectionItems,
  mediaCollections,
  mediaUsage,
} from "./storage";

export const profilesRelations = relations(profiles, ({ many, one }) => ({
  auditLogs: many(auditLogs),
  sessions: many(sessions),
  historyEntries: many(historyEntries),
  notifications: many(notifications),
  notificationSettings: one(notificationSettings),
  backupRecords: many(backupRecords),
  apiKeys: many(apiKeys),
  webhookEndpoints: many(webhookEndpoints),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  profile: one(profiles, {
    fields: [apiKeys.profileId],
    references: [profiles.id],
  }),
}));

export const webhookEndpointsRelations = relations(webhookEndpoints, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [webhookEndpoints.profileId],
    references: [profiles.id],
  }),
  deliveries: many(webhookDeliveries),
}));

export const webhookDeliveriesRelations = relations(webhookDeliveries, ({ one }) => ({
  endpoint: one(webhookEndpoints, {
    fields: [webhookDeliveries.endpointId],
    references: [webhookEndpoints.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  profile: one(profiles, {
    fields: [auditLogs.profileId],
    references: [profiles.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  profile: one(profiles, {
    fields: [sessions.profileId],
    references: [profiles.id],
  }),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  translations: many(brandTranslations),
  products: many(products),
}));

export const brandTranslationsRelations = relations(brandTranslations, ({ one }) => ({
  brand: one(brands, {
    fields: [brandTranslations.brandId],
    references: [brands.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "categoryParent",
  }),
  children: many(categories, { relationName: "categoryParent" }),
  translations: many(categoryTranslations),
  products: many(products),
}));

export const categoryTranslationsRelations = relations(categoryTranslations, ({ one }) => ({
  category: one(categories, {
    fields: [categoryTranslations.categoryId],
    references: [categories.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  translations: many(productTranslations),
  attributeValues: many(productAttributeValues),
}));

export const productTranslationsRelations = relations(productTranslations, ({ one }) => ({
  product: one(products, {
    fields: [productTranslations.productId],
    references: [products.id],
  }),
}));

export const productAttributeDefinitionsRelations = relations(
  productAttributeDefinitions,
  ({ many }) => ({
    values: many(productAttributeValues),
  }),
);

export const productAttributeValuesRelations = relations(productAttributeValues, ({ one }) => ({
  product: one(products, {
    fields: [productAttributeValues.productId],
    references: [products.id],
  }),
  definition: one(productAttributeDefinitions, {
    fields: [productAttributeValues.definitionId],
    references: [productAttributeDefinitions.id],
  }),
}));

export const seoProfilesRelations = relations(seoProfiles, ({ one, many }) => ({
  metadata: one(metadata),
  canonical: one(canonical),
  robots: one(robots),
  openGraph: one(openGraph),
  twitterCards: one(twitterCards),
  schemaDocuments: many(schemaDocuments),
  hreflang: many(hreflang),
  customHeadTags: many(customHeadTags),
  seoAnalysis: one(seoAnalysis),
  seoScoreHistory: many(seoScoreHistory),
  internalLinks: many(internalLinks),
}));

export const metadataRelations = relations(metadata, ({ one }) => ({
  seoProfile: one(seoProfiles, {
    fields: [metadata.seoProfileId],
    references: [seoProfiles.id],
  }),
}));

export const canonicalRelations = relations(canonical, ({ one }) => ({
  seoProfile: one(seoProfiles, {
    fields: [canonical.seoProfileId],
    references: [seoProfiles.id],
  }),
}));

export const robotsRelations = relations(robots, ({ one }) => ({
  seoProfile: one(seoProfiles, {
    fields: [robots.seoProfileId],
    references: [seoProfiles.id],
  }),
}));

export const openGraphRelations = relations(openGraph, ({ one }) => ({
  seoProfile: one(seoProfiles, {
    fields: [openGraph.seoProfileId],
    references: [seoProfiles.id],
  }),
}));

export const twitterCardsRelations = relations(twitterCards, ({ one }) => ({
  seoProfile: one(seoProfiles, {
    fields: [twitterCards.seoProfileId],
    references: [seoProfiles.id],
  }),
}));

export const schemaDocumentsRelations = relations(schemaDocuments, ({ one }) => ({
  seoProfile: one(seoProfiles, {
    fields: [schemaDocuments.seoProfileId],
    references: [seoProfiles.id],
  }),
}));

export const hreflangRelations = relations(hreflang, ({ one }) => ({
  seoProfile: one(seoProfiles, {
    fields: [hreflang.seoProfileId],
    references: [seoProfiles.id],
  }),
}));

export const customHeadTagsRelations = relations(customHeadTags, ({ one }) => ({
  seoProfile: one(seoProfiles, {
    fields: [customHeadTags.seoProfileId],
    references: [seoProfiles.id],
  }),
}));

export const seoAnalysisRelations = relations(seoAnalysis, ({ one }) => ({
  seoProfile: one(seoProfiles, {
    fields: [seoAnalysis.seoProfileId],
    references: [seoProfiles.id],
  }),
}));

export const seoScoreHistoryRelations = relations(seoScoreHistory, ({ one }) => ({
  seoProfile: one(seoProfiles, {
    fields: [seoScoreHistory.seoProfileId],
    references: [seoProfiles.id],
  }),
}));

export const internalLinksRelations = relations(internalLinks, ({ one }) => ({
  seoProfile: one(seoProfiles, {
    fields: [internalLinks.seoProfileId],
    references: [seoProfiles.id],
  }),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ many }) => ({
  usage: many(mediaUsage),
  collectionItems: many(mediaCollectionItems),
}));

export const mediaUsageRelations = relations(mediaUsage, ({ one }) => ({
  mediaAsset: one(mediaAssets, {
    fields: [mediaUsage.mediaAssetId],
    references: [mediaAssets.id],
  }),
}));

export const mediaCollectionsRelations = relations(mediaCollections, ({ many }) => ({
  items: many(mediaCollectionItems),
}));

export const mediaCollectionItemsRelations = relations(mediaCollectionItems, ({ one }) => ({
  collection: one(mediaCollections, {
    fields: [mediaCollectionItems.collectionId],
    references: [mediaCollections.id],
  }),
  mediaAsset: one(mediaAssets, {
    fields: [mediaCollectionItems.mediaAssetId],
    references: [mediaAssets.id],
  }),
}));

export const pagesRelations = relations(pages, ({ many }) => ({
  translations: many(pageTranslations),
}));

export const pageTranslationsRelations = relations(pageTranslations, ({ one }) => ({
  page: one(pages, {
    fields: [pageTranslations.pageId],
    references: [pages.id],
  }),
}));

export const historyEntriesRelations = relations(historyEntries, ({ one }) => ({
  performer: one(profiles, {
    fields: [historyEntries.performedBy],
    references: [profiles.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  profile: one(profiles, {
    fields: [notifications.profileId],
    references: [profiles.id],
  }),
}));

export const notificationSettingsRelations = relations(notificationSettings, ({ one }) => ({
  profile: one(profiles, {
    fields: [notificationSettings.profileId],
    references: [profiles.id],
  }),
}));

export const backupRecordsRelations = relations(backupRecords, ({ one }) => ({
  creator: one(profiles, {
    fields: [backupRecords.createdBy],
    references: [profiles.id],
  }),
}));

export const settingsRelations = relations(settings, () => ({}));

export const redirectRulesRelations = relations(redirectRules, () => ({}));
export const verificationCodesRelations = relations(verificationCodes, () => ({}));
export const seoTemplatesRelations = relations(seoTemplates, () => ({}));
export const sitemapConfigRelations = relations(sitemapConfig, () => ({}));
export const robotsConfigRelations = relations(robotsConfig, () => ({}));
