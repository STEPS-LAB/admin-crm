import type { PublicSiteLanguage } from "@/types/public-site";

export type PublicSiteMessageKey =
  | "nav.home"
  | "nav.products"
  | "nav.categories"
  | "nav.brands"
  | "nav.pages"
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
  | "error.retry";

const MESSAGES: Record<PublicSiteLanguage, Record<PublicSiteMessageKey, string>> = {
  uk: {
    "nav.home": "Головна",
    "nav.products": "Товари",
    "nav.categories": "Категорії",
    "nav.brands": "Бренди",
    "nav.pages": "Сторінки",
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
  },
  en: {
    "nav.home": "Home",
    "nav.products": "Products",
    "nav.categories": "Categories",
    "nav.brands": "Brands",
    "nav.pages": "Pages",
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
  },
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
