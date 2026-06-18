export interface CropMetadata {
  crop: string;
  state: string;
  district?: string;
  symptomOrType: string;
  category: 'Protection' | 'Soil' | 'Irrigation' | 'Fertilizer' | 'Harvesting';
}

export interface GoldenDatasetItem {
  id: string;
  question: string;
  verifiedAnswer: string;
  cropMetadata: CropMetadata;
  verifiedBy: string;
  approvedAt: string;
  sources: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'farmer' | 'agriverify';
  text: string;
  timestamp: string;
  tier?: 1 | 2 | 3;
  sourceType?: string;
  reviewTaskId?: string;
  metadata?: CropMetadata;
  verifiedBy?: string;
  sourcesList?: string[];
}

export interface PendingReviewTask {
  id: string;
  question: string;
  aiAnswer: string;
  cropMetadata: CropMetadata;
  language: string;
  status: 'pending' | 'approved' | 'modified';
  createdAt: string;
}
