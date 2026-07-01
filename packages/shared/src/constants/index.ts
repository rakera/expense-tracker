export const DEFAULT_CURRENCY = 'USD';

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'RUB', 'GBP'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_PAGE_SIZE = 20;

export const API_PREFIX = '/api';
