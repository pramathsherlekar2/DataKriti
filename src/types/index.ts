export type DocumentCategory =
  | 'Government Document'
  | 'Educational Document'
  | 'Historical Document'
  | 'Newspaper or Article'
  | 'Personal Document'
  | 'General Document';

export type AccentColorKey =
  | 'red'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'black'
  | 'pink'
  | 'purple'
  | 'white'
  | 'orange';

export interface AccentColorDefinition {
  key: AccentColorKey;
  name: string;
  hex: string;
  hoverHex: string;
  subtleRgba: string;
  ringRgba: string;
}

export interface DocumentPage {
  pageNumber: number;
  originalImage: string; // base64 or object url
  enhancedImage?: string;
  ocrResult?: OCRResult;
}

export interface UncertainWord {
  id?: string;
  word: string;
  suggestedAlternatives?: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
  contextSnippet?: string;
  reason?: string;
  userCorrection?: string;
  isCorrected?: boolean;
}

export interface OCRParagraph {
  id: string;
  text: string;
  type: 'heading' | 'body' | 'list_item' | 'signature' | 'footer';
  boundingBox?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
}

export interface OCRResult {
  extractedText: string;
  correctedText?: string;
  detectedLanguage: string;
  wordCount: number;
  estimatedConfidence: number; // 0-100
  paragraphs: OCRParagraph[];
  uncertainWords: UncertainWord[];
  layoutNotes?: string;
}

export interface DetectedIssue {
  issue: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface RecommendedEnhancement {
  operation: 'contrast' | 'brightness' | 'sharpen' | 'binarize' | 'deskew' | 'shadow_removal';
  suggestedValue: number;
  reason: string;
}

export interface RecoveryAssessment {
  qualityScore: number;
  overallCondition: string;
  blurLevel: string;
  contrastQuality: string;
  skewAngleEstimateDegrees: number;
  lightingUniformity: string;
  detectedIssues: DetectedIssue[];
  recommendedEnhancements: RecommendedEnhancement[];
  scriptComplexityNote?: string;
}

export interface Translation {
  id: string;
  documentId: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
  keyVocabulary?: Array<{
    kannada: string;
    translation: string;
    meaningInEnglish: string;
  }>;
  translationNotes?: string;
  creationDate: string;
}

export interface AISummary {
  id: string;
  documentId: string;
  summaryType: 'short' | 'standard' | 'detailed';
  mainSubject: string;
  mainSubjectKannada?: string;
  shortSummary: string;
  detailedSummary: string;
  importantPoints: string[];
  keyInstructions: string[];
  importantDates: Array<{
    date: string;
    significance: string;
  }>;
  mainConclusions: string;
  simpleLanguageExplanation: string;
  creationDate: string;
}

export interface SourceReference {
  sourceSnippet: string;
  relevance: string;
  pageEstimate?: number;
}

export interface ExtractedEntityItem {
  [key: string]: any;
  sourceSnippet?: string;
}

export interface ExtractedInformation {
  documentId: string;
  personNames: Array<{ name: string; role?: string; sourceSnippet?: string }>;
  organizationNames: Array<{ name: string; sourceSnippet?: string }>;
  addresses: Array<{ address: string; sourceSnippet?: string }>;
  locations: Array<{ location: string; sourceSnippet?: string }>;
  dates: Array<{ date: string; context?: string; sourceSnippet?: string }>;
  deadlines: Array<{ deadline: string; description?: string; sourceSnippet?: string }>;
  phoneNumbers: Array<{ number: string; sourceSnippet?: string }>;
  emailAddresses: Array<{ email: string; sourceSnippet?: string }>;
  monetaryAmounts: Array<{ amount: string; purpose?: string; sourceSnippet?: string }>;
  importantInstructions: Array<{ instruction: string; sourceSnippet?: string }>;
  documentReferences: Array<{ reference: string; sourceSnippet?: string }>;
  creationDate: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  textKannada?: string;
  isFoundInDocument?: boolean;
  confidence?: 'high' | 'moderate' | 'unsupported';
  sourceReferences?: SourceReference[];
  suggestedFollowUps?: string[];
  timestamp: string;
  durationMs?: number;
  cached?: boolean;
}

export interface SimplificationResult {
  documentId: string;
  simplifiedKannada: string;
  easyEnglish: string;
  hindiExplanation: string;
  difficultWordsGlossary: Array<{
    word: string;
    simpleMeaningKannada: string;
    englishMeaning: string;
    usageContext?: string;
  }>;
  paragraphComparison: Array<{
    originalSnippet: string;
    simplifiedSnippet: string;
  }>;
  creationDate: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  fileType: string;
  uploadDate: string;
  fileSizeFormatted: string;
  pageCount: number;
  documentCategory: DocumentCategory;
  processingStatus: 'uploaded' | 'assessing' | 'assessed' | 'processing_ocr' | 'ready' | 'error';
  isFavourite?: boolean;
  
  // Multi-page document storage
  pages: DocumentPage[];
  currentPageIndex: number;
  
  // Assessment and Intelligence
  recoveryAssessment?: RecoveryAssessment;
  
  // Downstream intelligence
  translations: Record<string, Translation>; // key: targetLanguage
  summaries: Record<string, AISummary>; // key: summaryType
  extractedInfo?: ExtractedInformation;
  simplification?: SimplificationResult;
  chatHistory: ChatMessage[];
  
  // Enhancements applied to active page
  enhancementFilters?: {
    brightness: number; // -100 to 100
    contrast: number; // -100 to 100
    grayscale: boolean;
    sharpen: number; // 0 to 100
    noiseReduction: number; // 0 to 100
    rotation: number; // -180 to 180 degrees
    deskew: number; // -15 to 15 degrees
    fadedTextEnhance: boolean;
    shadowReduction: boolean;
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  accentColor: AccentColorKey;
  kannadaVoiceSpeed: number; // 0.5 to 1.5
  autoAssessOnUpload: boolean;
  offlineSyncEnabled: boolean;
}
