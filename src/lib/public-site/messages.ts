import { PUBLIC_SITE_SECTION_IDS } from "@/constants/public-site";

import type { PublicSiteSectionId } from "@/constants/public-site";
import type { StockStatus } from "@/constants/products";
import type { SeoOwnerType } from "@/constants/seo";
import type { PublicSiteLanguage } from "@/types/public-site";

export type PublicSiteMessageKey =
  | "nav.home"
  | "nav.products"
  | "nav.categories"
  | "nav.brands"
  | "nav.pages"
  | "section.seo"
  | "section.about"
  | "section.contact"
  | "breadcrumb.home"
  | "search.title"
  | "search.placeholder"
  | "search.submit"
  | "search.emptyQuery"
  | "search.noResults"
  | "search.resultsFor"
  | "search.section.products"
  | "search.section.categories"
  | "search.section.pages"
  | "search.section.brands"
  | "maintenance.title"
  | "maintenance.description"
  | "maintenance.returnHome"
  | "notFound.title"
  | "notFound.description"
  | "notFound.returnHome"
  | "error.title"
  | "error.description"
  | "error.retry"
  | "common.admin"
  | "common.noCoverImage"
  | "common.noLogo"
  | "common.seo"
  | "common.sku"
  | "common.uncategorized"
  | "common.backToStorefront"
  | "common.platformHome"
  | "header.sections"
  | "header.language"
  | "loading.storefront"
  | "hero.badge"
  | "hero.defaultDescription"
  | "hero.browseProducts"
  | "hero.seoPerformance"
  | "hero.publishedProducts"
  | "hero.publishedCategories"
  | "hero.managedInAdmin"
  | "hero.managedInAdminDescription"
  | "hero.openAdminPanel"
  | "products.eyebrow"
  | "products.title"
  | "products.description"
  | "products.empty"
  | "products.shown"
  | "categories.eyebrow"
  | "categories.title"
  | "categories.description"
  | "categories.empty"
  | "seo.eyebrow"
  | "seo.title"
  | "seo.description"
  | "seo.globalScore"
  | "seo.profiles"
  | "seo.redirects"
  | "seo.schemas"
  | "seo.recommendations"
  | "seo.criticalIssues"
  | "seo.warnings"
  | "seo.catalogFootprint"
  | "seo.entityScores"
  | "seo.noProfiles"
  | "seo.entityProfileCount"
  | "seo.sitemapNote"
  | "seo.badge.products"
  | "seo.badge.categories"
  | "seo.badge.pages"
  | "seo.badge.brands"
  | "about.eyebrow"
  | "about.title"
  | "about.defaultTitle"
  | "about.fallback"
  | "contact.eyebrow"
  | "contact.title"
  | "contact.description"
  | "contact.website"
  | "contact.regionalSettings"
  | "contact.timezone"
  | "contact.currency"
  | "contact.administration"
  | "contact.adminDescription"
  | "contact.openDashboard"
  | "footer.generated"
  | "category.noProducts"
  | "stock.in_stock"
  | "stock.out_of_stock"
  | "stock.preorder"
  | "stock.discontinued"
  | "seoOwner.product"
  | "seoOwner.category"
  | "seoOwner.page"
  | "seoOwner.brand"
  | "seoOwner.collection"
  | "seoOwner.tag"
  | "seoOwner.landing_page";

const MESSAGES: Record<PublicSiteLanguage, Record<PublicSiteMessageKey, string>> = {
  uk: {
    "nav.home": "Головна",
    "nav.products": "Товари",
    "nav.categories": "Категорії",
    "nav.brands": "Бренди",
    "nav.pages": "Сторінки",
    "section.seo": "SEO",
    "section.about": "Про нас",
    "section.contact": "Контакти",
    "breadcrumb.home": "Головна",
    "search.title": "Пошук",
    "search.placeholder": "Шукати товари, категорії, сторінки…",
    "search.submit": "Шукати",
    "search.emptyQuery": "Введіть запит, щоб знайти опублікований контент.",
    "search.noResults": "За вашим запитом нічого не знайдено.",
    "search.resultsFor": "Результати для «{query}»",
    "search.section.products": "Товари",
    "search.section.categories": "Категорії",
    "search.section.pages": "Сторінки",
    "search.section.brands": "Бренди",
    "maintenance.title": "Технічне обслуговування",
    "maintenance.description":
      "Публічний сайт тимчасово недоступний. Ми працюємо над оновленням і незабаром повернемося.",
    "maintenance.returnHome": "На головну",
    "notFound.title": "Сторінку не знайдено",
    "notFound.description": "Запитана сторінка не існує або була видалена.",
    "notFound.returnHome": "На головну",
    "error.title": "Щось пішло не так",
    "error.description": "Сталася непередбачена помилка. Спробуйте ще раз.",
    "error.retry": "Спробувати знову",
    "common.admin": "Адмін",
    "common.noCoverImage": "Немає зображення",
    "common.noLogo": "Немає логотипу",
    "common.seo": "SEO",
    "common.sku": "Артикул",
    "common.uncategorized": "Без категорії",
    "common.backToStorefront": "Назад до магазину",
    "common.platformHome": "Головна платформи",
    "header.sections": "Розділи сторінки",
    "header.language": "Мова",
    "loading.storefront": "Завантаження магазину…",
    "hero.badge": "Дані CMS у реальному часі",
    "hero.defaultDescription": "Публічний магазин на основі панелі адміністрування.",
    "hero.browseProducts": "Переглянути товари",
    "hero.seoPerformance": "SEO-показники",
    "hero.publishedProducts": "Опубліковані товари",
    "hero.publishedCategories": "Опубліковані категорії",
    "hero.managedInAdmin": "Керується в адмінці",
    "hero.managedInAdminDescription":
      "Кожен розділ нижче формується з опублікованих даних каталогу, сторінок і SEO, налаштованих у панелі.",
    "hero.openAdminPanel": "Відкрити панель адміністрування",
    "products.eyebrow": "Каталог",
    "products.title": "Рекомендовані товари",
    "products.description":
      "Опубліковані товари з панелі адміністрування, включно з цінами, медіа та SEO-оцінками.",
    "products.empty":
      "Ще немає опублікованих товарів. Опублікуйте товари в адмінці, щоб заповнити цей розділ.",
    "products.shown": "Показано {count}",
    "categories.eyebrow": "Навігація",
    "categories.title": "Купуйте за категоріями",
    "categories.description":
      "Опубліковані категорії з актуальною кількістю товарів та показниками SEO.",
    "categories.empty":
      "Ще немає опублікованих категорій. Опублікуйте категорії в адмінці, щоб заповнити цей розділ.",
    "seo.eyebrow": "SEO Center",
    "seo.title": "SEO-демонстрація",
    "seo.description":
      "Актуальний стан SEO з профілів, редиректів, структурованих даних і опублікованих сутностей каталогу.",
    "seo.globalScore": "Загальна оцінка сайту",
    "seo.profiles": "Профілі",
    "seo.redirects": "Редиректи",
    "seo.schemas": "Схеми",
    "seo.recommendations": "Рекомендації",
    "seo.criticalIssues": "Критичні проблеми",
    "seo.warnings": "Попередження",
    "seo.catalogFootprint": "Опублікований каталог",
    "seo.entityScores": "SEO-оцінки сутностей",
    "seo.noProfiles": "Ще немає проаналізованих SEO-профілів.",
    "seo.entityProfileCount": "{count} профілів",
    "seo.sitemapNote":
      "Sitemap і robots генеруються з тих самих опублікованих сутностей, що показані на цій сторінці.",
    "seo.badge.products": "{count} товарів",
    "seo.badge.categories": "{count} категорій",
    "seo.badge.pages": "{count} сторінок",
    "seo.badge.brands": "{count} брендів",
    "about.eyebrow": "Історія",
    "about.title": "Про нас",
    "about.defaultTitle": "Про {siteName}",
    "about.fallback": "Контент керується через модуль «Сторінки» в панелі адміністрування.",
    "contact.eyebrow": "Зв'язок",
    "contact.title": "Контакти",
    "contact.description":
      "Налаштування магазину керуються централізовано. Оновлюйте параметри сайту та сторінки в адмінці.",
    "contact.website": "Вебсайт",
    "contact.regionalSettings": "Регіональні налаштування",
    "contact.timezone": "Часовий пояс",
    "contact.currency": "Валюта",
    "contact.administration": "Адміністрування",
    "contact.adminDescription":
      "Керуйте контентом, SEO, медіа та публікаціями {siteName} з панелі керування.",
    "contact.openDashboard": "Відкрити панель адміністрування",
    "footer.generated": "Згенеровано {date} з актуальних даних CMS.",
    "category.noProducts": "У цій категорії ще немає опублікованих товарів.",
    "stock.in_stock": "В наявності",
    "stock.out_of_stock": "Немає в наявності",
    "stock.preorder": "Передзамовлення",
    "stock.discontinued": "Знято з продажу",
    "seoOwner.product": "Товар",
    "seoOwner.category": "Категорія",
    "seoOwner.page": "Сторінка",
    "seoOwner.brand": "Бренд",
    "seoOwner.collection": "Колекція",
    "seoOwner.tag": "Тег",
    "seoOwner.landing_page": "Лендінг",
  },
  en: {
    "nav.home": "Home",
    "nav.products": "Products",
    "nav.categories": "Categories",
    "nav.brands": "Brands",
    "nav.pages": "Pages",
    "section.seo": "SEO",
    "section.about": "About",
    "section.contact": "Contact",
    "breadcrumb.home": "Home",
    "search.title": "Search",
    "search.placeholder": "Search products, categories, pages…",
    "search.submit": "Search",
    "search.emptyQuery": "Enter a query to search published content.",
    "search.noResults": "No results matched your query.",
    "search.resultsFor": "Results for “{query}”",
    "search.section.products": "Products",
    "search.section.categories": "Categories",
    "search.section.pages": "Pages",
    "search.section.brands": "Brands",
    "maintenance.title": "Maintenance",
    "maintenance.description":
      "The public site is temporarily unavailable while we perform scheduled maintenance.",
    "maintenance.returnHome": "Go home",
    "notFound.title": "Page not found",
    "notFound.description": "The requested page does not exist or may have been removed.",
    "notFound.returnHome": "Go home",
    "error.title": "Something went wrong",
    "error.description": "An unexpected error occurred. Please try again.",
    "error.retry": "Try again",
    "common.admin": "Admin",
    "common.noCoverImage": "No cover image",
    "common.noLogo": "No logo",
    "common.seo": "SEO",
    "common.sku": "SKU",
    "common.uncategorized": "Uncategorized",
    "common.backToStorefront": "Back to storefront",
    "common.platformHome": "Platform home",
    "header.sections": "Page sections",
    "header.language": "Language",
    "loading.storefront": "Loading storefront…",
    "hero.badge": "Live CMS data",
    "hero.defaultDescription": "Live storefront powered by the administration panel.",
    "hero.browseProducts": "Browse products",
    "hero.seoPerformance": "SEO performance",
    "hero.publishedProducts": "Published products",
    "hero.publishedCategories": "Published categories",
    "hero.managedInAdmin": "Managed in admin",
    "hero.managedInAdminDescription":
      "Every section below is rendered from published catalog, page, and SEO data configured in the dashboard.",
    "hero.openAdminPanel": "Open administration panel",
    "products.eyebrow": "Catalog",
    "products.title": "Featured products",
    "products.description":
      "Published products from the administration panel, including pricing, media, and SEO scores.",
    "products.empty":
      "No published products yet. Publish products in the admin to populate this section.",
    "products.shown": "{count} shown",
    "categories.eyebrow": "Navigation",
    "categories.title": "Shop by category",
    "categories.description":
      "Published categories with live product counts and SEO health indicators.",
    "categories.empty":
      "No published categories yet. Publish categories in the admin to populate this section.",
    "seo.eyebrow": "SEO Center",
    "seo.title": "SEO demonstration",
    "seo.description":
      "Real-time SEO health from profiles, redirects, structured data, and published catalog entities.",
    "seo.globalScore": "Global website score",
    "seo.profiles": "Profiles",
    "seo.redirects": "Redirects",
    "seo.schemas": "Schemas",
    "seo.recommendations": "Recommendations",
    "seo.criticalIssues": "Critical issues",
    "seo.warnings": "Warnings",
    "seo.catalogFootprint": "Published catalog footprint",
    "seo.entityScores": "Entity SEO scores",
    "seo.noProfiles": "No analyzed SEO profiles yet.",
    "seo.entityProfileCount": "{count} profiles",
    "seo.sitemapNote":
      "Sitemap and robots endpoints are generated from the same published entities shown on this page.",
    "seo.badge.products": "{count} products",
    "seo.badge.categories": "{count} categories",
    "seo.badge.pages": "{count} pages",
    "seo.badge.brands": "{count} brands",
    "about.eyebrow": "Story",
    "about.title": "About",
    "about.defaultTitle": "About {siteName}",
    "about.fallback": "Content managed through the Pages module in the administration panel.",
    "contact.eyebrow": "Reach us",
    "contact.title": "Contact",
    "contact.description":
      "Storefront configuration is managed centrally. Update site settings and pages in the admin panel.",
    "contact.website": "Website",
    "contact.regionalSettings": "Regional settings",
    "contact.timezone": "Timezone",
    "contact.currency": "Currency",
    "contact.administration": "Administration",
    "contact.adminDescription":
      "Manage {siteName} content, SEO, media, and publishing workflow from the dashboard.",
    "contact.openDashboard": "Open admin dashboard",
    "footer.generated": "Generated {date} from live CMS data.",
    "category.noProducts": "No published products in this category yet.",
    "stock.in_stock": "In stock",
    "stock.out_of_stock": "Out of stock",
    "stock.preorder": "Preorder",
    "stock.discontinued": "Discontinued",
    "seoOwner.product": "Product",
    "seoOwner.category": "Category",
    "seoOwner.page": "Page",
    "seoOwner.brand": "Brand",
    "seoOwner.collection": "Collection",
    "seoOwner.tag": "Tag",
    "seoOwner.landing_page": "Landing page",
  },
};

const SECTION_MESSAGE_KEYS: Record<PublicSiteSectionId, PublicSiteMessageKey> = {
  hero: "nav.home",
  products: "nav.products",
  categories: "nav.categories",
  seo: "section.seo",
  about: "section.about",
  contact: "section.contact",
};

export function getPublicSiteMessage(
  language: PublicSiteLanguage,
  key: PublicSiteMessageKey,
  variables?: Readonly<Record<string, string>>,
): string {
  let message = MESSAGES[language][key];

  if (variables) {
    for (const [name, value] of Object.entries(variables)) {
      message = message.replaceAll(`{${name}}`, value);
    }
  }

  return message;
}

export function getPublicSiteSections(
  language: PublicSiteLanguage,
): ReadonlyArray<{ readonly id: PublicSiteSectionId; readonly label: string }> {
  return PUBLIC_SITE_SECTION_IDS.map((id) => ({
    id,
    label: getPublicSiteMessage(language, SECTION_MESSAGE_KEYS[id]),
  }));
}

export function getPublicSiteLocale(language: PublicSiteLanguage): string {
  return language === "uk" ? "uk-UA" : "en-US";
}

export function getPublicStockStatusLabel(
  language: PublicSiteLanguage,
  status: StockStatus,
): string {
  return getPublicSiteMessage(language, `stock.${status}`);
}

export function getPublicSeoOwnerTypeLabel(
  language: PublicSiteLanguage,
  ownerType: SeoOwnerType,
): string {
  return getPublicSiteMessage(language, `seoOwner.${ownerType}`);
}

export function formatProductCount(language: PublicSiteLanguage, count: number): string {
  if (language === "en") {
    return count === 1 ? "1 product" : `${count} products`;
  }

  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} товар`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} товари`;
  }

  return `${count} товарів`;
}
