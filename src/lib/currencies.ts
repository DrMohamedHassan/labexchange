export const PRICE_CURRENCY_OPTIONS = [
  { code: "EGP", label: "EGP — Egyptian Pound" },
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "SAR", label: "SAR — Saudi Riyal" },
  { code: "AED", label: "AED — UAE Dirham" },
  { code: "QAR", label: "QAR — Qatari Riyal" },
  { code: "KWD", label: "KWD — Kuwaiti Dinar" },
  { code: "BHD", label: "BHD — Bahraini Dinar" },
  { code: "OMR", label: "OMR — Omani Rial" },
  { code: "JOD", label: "JOD — Jordanian Dinar" },
  { code: "LBP", label: "LBP — Lebanese Pound" },
  { code: "IQD", label: "IQD — Iraqi Dinar" },
  { code: "MAD", label: "MAD — Moroccan Dirham" },
  { code: "TND", label: "TND — Tunisian Dinar" },
  { code: "DZD", label: "DZD — Algerian Dinar" },
  { code: "TRY", label: "TRY — Turkish Lira" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
  { code: "AUD", label: "AUD — Australian Dollar" },
  { code: "CNY", label: "CNY — Chinese Yuan" },
  { code: "INR", label: "INR — Indian Rupee" },
  { code: "JPY", label: "JPY — Japanese Yen" },
  { code: "KRW", label: "KRW — South Korean Won" },
  { code: "SGD", label: "SGD — Singapore Dollar" },
  { code: "MYR", label: "MYR — Malaysian Ringgit" },
  { code: "ZAR", label: "ZAR — South African Rand" },
  { code: "BRL", label: "BRL — Brazilian Real" },
] as const;

export const DEFAULT_PRICE_CURRENCY = "EGP";

export function getDefaultCurrencyForCountry(country?: string | null) {
  switch (country) {
    case "Egypt":
      return "EGP";
    case "Saudi Arabia":
      return "SAR";
    case "United Arab Emirates":
      return "AED";
    case "Qatar":
      return "QAR";
    case "Kuwait":
      return "KWD";
    case "Bahrain":
      return "BHD";
    case "Oman":
      return "OMR";
    case "Jordan":
      return "JOD";
    case "Lebanon":
      return "LBP";
    case "Iraq":
      return "IQD";
    case "Morocco":
      return "MAD";
    case "Tunisia":
      return "TND";
    case "Algeria":
      return "DZD";
    case "Turkey":
      return "TRY";
    case "United States":
      return "USD";
    case "United Kingdom":
      return "GBP";
    case "Germany":
    case "France":
    case "Italy":
    case "Spain":
    case "Netherlands":
    case "Belgium":
    case "Finland":
      return "EUR";
    case "Switzerland":
      return "EUR";
    case "Sweden":
    case "Denmark":
    case "Norway":
      return "EUR";
    case "Canada":
      return "CAD";
    case "Australia":
      return "AUD";
    case "China":
      return "CNY";
    case "India":
      return "INR";
    case "Japan":
      return "JPY";
    case "South Korea":
      return "KRW";
    case "Singapore":
      return "SGD";
    case "Malaysia":
      return "MYR";
    case "South Africa":
      return "ZAR";
    case "Brazil":
      return "BRL";
    default:
      return DEFAULT_PRICE_CURRENCY;
  }
}

export function formatPriceWithCurrency(
  price: unknown,
  currency?: string | null
) {
  if (price === null || price === undefined || price === "") {
    return "Price not provided";
  }

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return "Price not provided";
  }

  return `${numericPrice.toLocaleString()} ${
    currency || DEFAULT_PRICE_CURRENCY
  }`;
}

export const FORBIDDEN_LINK_PATTERN =
  /(https?:\/\/|www\.|[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}|[\w-]+\.(com|net|org|io|co|info|biz|edu|gov|me|ai|app|dev|shop|store|xyz)(\/|\s|$))/i;

export function containsForbiddenLink(value?: string | null) {
  if (!value) return false;

  return FORBIDDEN_LINK_PATTERN.test(value);
}