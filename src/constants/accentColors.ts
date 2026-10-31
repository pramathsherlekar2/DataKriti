import { AccentColorDefinition, AccentColorKey } from '../types';

export const ACCENT_COLORS: Record<AccentColorKey, AccentColorDefinition> = {
  purple: {
    key: 'purple',
    name: 'Royal Amethyst',
    hex: '#7C3AED',
    hoverHex: '#6D28D9',
    subtleRgba: 'rgba(124, 58, 237, 0.12)',
    ringRgba: 'rgba(124, 58, 237, 0.35)',
  },
  blue: {
    key: 'blue',
    name: 'Mysore Cobalt',
    hex: '#2563EB',
    hoverHex: '#1D4ED8',
    subtleRgba: 'rgba(37, 99, 235, 0.12)',
    ringRgba: 'rgba(37, 99, 235, 0.35)',
  },
  green: {
    key: 'green',
    name: 'Western Ghats Emerald',
    hex: '#059669',
    hoverHex: '#047857',
    subtleRgba: 'rgba(5, 150, 105, 0.12)',
    ringRgba: 'rgba(5, 150, 105, 0.35)',
  },
  yellow: {
    key: 'yellow',
    name: 'Karnataka Haldi Gold',
    hex: '#D97706',
    hoverHex: '#B45309',
    subtleRgba: 'rgba(217, 119, 6, 0.12)',
    ringRgba: 'rgba(217, 119, 6, 0.35)',
  },
  red: {
    key: 'red',
    name: 'Hampi Vermilion',
    hex: '#DC2626',
    hoverHex: '#B91C1C',
    subtleRgba: 'rgba(220, 38, 38, 0.12)',
    ringRgba: 'rgba(220, 38, 38, 0.35)',
  },
  orange: {
    key: 'orange',
    name: 'Channapatna Ochre',
    hex: '#EA580C',
    hoverHex: '#C2410C',
    subtleRgba: 'rgba(234, 88, 12, 0.12)',
    ringRgba: 'rgba(234, 88, 12, 0.35)',
  },
  pink: {
    key: 'pink',
    name: 'Lotus Blossom',
    hex: '#DB2777',
    hoverHex: '#BE185D',
    subtleRgba: 'rgba(219, 39, 119, 0.12)',
    ringRgba: 'rgba(219, 39, 119, 0.35)',
  },
  black: {
    key: 'black',
    name: 'Obsidian Ink',
    hex: '#1E293B',
    hoverHex: '#0F172A',
    subtleRgba: 'rgba(30, 41, 59, 0.15)',
    ringRgba: 'rgba(30, 41, 59, 0.35)',
  },
  white: {
    key: 'white',
    name: 'Silver Slate',
    hex: '#64748B',
    hoverHex: '#475569',
    subtleRgba: 'rgba(100, 116, 139, 0.15)',
    ringRgba: 'rgba(100, 116, 139, 0.35)',
  },
};

export const TARGET_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
] as const;

export const DOCUMENT_CATEGORIES = [
  {
    key: 'Government Document',
    label: 'Government Document',
    kannadaLabel: 'ಸರ್ಕಾರಿ ಆದೇಶ / ಸುತ್ತೋಲೆ',
    description: 'Official gazettes, notifications, circulars, application orders, and government directives.',
  },
  {
    key: 'Educational Document',
    label: 'Educational Document',
    kannadaLabel: 'ಶೈಕ್ಷಣಿಕ ಪಠ್ಯ / ಟಿಪ್ಪಣಿಗಳು',
    description: 'Textbooks, university syllabus, exam question papers, study materials, and certificates.',
  },
  {
    key: 'Historical Document',
    label: 'Historical Document',
    kannadaLabel: 'ಐತಿಹಾಸಿಕ ದಾಖಲೆ / ಶಾಸನ',
    description: 'Ancient inscriptions, archival royal decrees, palm-leaf manuscripts, and historical registers.',
  },
  {
    key: 'Newspaper or Article',
    label: 'Newspaper or Article',
    kannadaLabel: 'ದಿನಪತ್ರಿಕೆ / ಲೇಖನ',
    description: 'Press reports, daily columns, editorials, periodical journals, and literature digests.',
  },
  {
    key: 'Personal Document',
    label: 'Personal Document',
    kannadaLabel: 'ವೈಯಕ್ತಿಕ ಪತ್ರ / ದಾಖಲಾತಿ',
    description: 'Letters, affidavits, land RTC (ಪಹಣಿ), sale deeds, agreements, and identity documents.',
  },
  {
    key: 'General Document',
    label: 'General Document',
    kannadaLabel: 'ಸಾಮಾನ್ಯ ಮುದ್ರಿತ ದಾಖಲೆ',
    description: 'Standard printed or typed Kannada letters, reports, books, and brochures.',
  },
] as const;
