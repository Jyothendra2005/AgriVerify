import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client to prevent crash on startup if key is unconfigured
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY' || key === '') {
      throw new Error('GEMINI_API_KEY environment variable is missing or unconfigured. Please configure it in standard Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// In-Memory Database for AgriVerify state: Golden Dataset, PoP Guides, and a simulated Review Queue.
// Seed state initialized with verified agricultural data
interface CropMetadata {
  crop: string;
  state: string;
  district?: string;
  symptomOrType: string;
  category: 'Protection' | 'Soil' | 'Irrigation' | 'Fertilizer' | 'Harvesting';
}

interface GoldenDatasetItem {
  id: string;
  question: string;
  verifiedAnswer: string;
  cropMetadata: CropMetadata;
  verifiedBy: string;
  approvedAt: string;
  sources: string[];
}

interface ReviewTask {
  id: string;
  question: string;
  aiAnswer: string;
  cropMetadata: CropMetadata;
  language: string;
  status: 'pending' | 'approved' | 'modified';
  createdAt: string;
}

const goldenDataset: GoldenDatasetItem[] = [
  {
    id: 'gold_01',
    question: 'How do I treat whiteflies infestation on cotton in Guntur during Kharif season?',
    verifiedAnswer: 'Whitefly infestation in Guntur region of Andhra Pradesh must be addressed using Integrated Pest Management (IPM). Apply Yellow Sticky Traps @10 per acre initially. For chemical control, use Diafenthiuron 50% WP @ 240g/acre or Pyriproxyfen 10% EC @ 400ml/acre in 200 liters of water. Avoid consecutive pyrethroid applications as they trigger secondary pest resurgences.',
    cropMetadata: {
      crop: 'Cotton',
      state: 'Andhra Pradesh',
      district: 'Guntur',
      symptomOrType: 'whiteflies infestation',
      category: 'Protection'
    },
    verifiedBy: 'Dr. Shalini Deshmukh (Entomology Specialist)',
    approvedAt: '2026-06-10T12:00:00Z',
    sources: ['AP State Agricultural Advisory Board Guidelines 2025', 'ANGRAU Pest Bulletin No. 4']
  },
  {
    id: 'gold_02',
    question: 'What is the optimal NPK fertilizer ratio for Basmati rice in Punjab?',
    verifiedAnswer: 'For Punjab clay loam soils growing Basmati rice, apply 120 kg Nitrogen, 30 kg Phosphorus (P2O5), and 30 kg Potassium (K2O) per hectare. Phosphorus and potassium must be applied complete as basal doses during transplanting. Nitrogen should be split into three equal application stages: basal transplanting stage, active tillering stage (3 weeks), and panicle initiation stage (6 weeks). Preferably use Neem-Coated Urea.',
    cropMetadata: {
      crop: 'Rice',
      state: 'Punjab',
      district: 'Amritsar',
      symptomOrType: 'NPK fertilizer ratio',
      category: 'Fertilizer'
    },
    verifiedBy: 'Prof. Ramesh K. Saini (Soil Hydrologist, PAU)',
    approvedAt: '2026-06-14T15:30:00Z',
    sources: ['PAU Ludhiana Crop Package of Practices 2026', 'Punjab Soil Nutrient Mapping Archive']
  },
  {
    id: 'gold_03',
    question: 'How often should drip irrigation run for Alphonso mango in black soil of Satara?',
    verifiedAnswer: 'In Satara (Maharashtra), Alphonso mangoes planted on heavy black soil require precise drip scheduling to prevent root rot or root asphyxia. Apply 25-30 liters of water per tree daily during summer, and 12-15 liters every alternate day during winter. Establish two lateral lines per row with 4 inline pressure-compensated drippers (4 L/hr capacity) placed 1 meter away from the tree trunk. Adjust to skip irrigation during active flowering to trigger fruit buds.',
    cropMetadata: {
      crop: 'Mango',
      state: 'Maharashtra',
      district: 'Satara',
      symptomOrType: 'drip irrigation frequency',
      category: 'Irrigation'
    },
    verifiedBy: 'Dr. Venkatesh Reddy (Water Management Expert)',
    approvedAt: '2026-06-12T09:40:00Z',
    sources: ['DBSKKV Dapoli Mango Irrigation Studies', 'Central Ground Water Board Satara Profile']
  }
];

const popGuides = [
  {
    id: 'pop_01',
    crop: 'Cotton',
    topic: 'Pest Management (Whitefly)',
    guidelines: 'Standard Govt recommendations for whitefly in cotton: 1. Maintain barrier borders with sorghum or maize. 2. Clean fields of Sida acuta weed. 3. Spray Neem oil @1500 ppm or fish oil rosin soap @ 10g/L during early stages. 4. Critical Chemical control: Buprofezin 25% SC @ 400ml/acre or Spiromesifen 22.9% SC @ 240ml/acre. Spray during early morning hours to limit chemical drift.',
    source: 'ICAR - Central Institute for Cotton Research Guidelines',
    keywords: ['whitefly', 'whiteflies', 'cotton', 'pest', 'pesticide', 'leaves']
  },
  {
    id: 'pop_02',
    crop: 'Rice',
    topic: 'Stem Borer Management',
    guidelines: 'Yellow stem borer (Scirpophaga incertulas) is a primary pest. Guidelines: 1. Clip leaf tips of seedlings before transplanting to destroy egg masses. 2. Install pheromone traps @5 per acre for monitoring. 3. Chemical application: Cartap Hydrochloride 4G granulated @10 kg/acre or Chlorantraniliprole 0.4% G @4 kg/acre. Apply in thin standing water layer.',
    source: 'Directorate of Rice Research Standard PoP',
    keywords: ['stem borer', 'borer', 'rice', 'paddy', 'larva', 'dead heart']
  },
  {
    id: 'pop_03',
    crop: 'Groundnut',
    topic: 'Iron Deficiency Chlorosis',
    guidelines: 'Symptoms: Interveinal yellowing of young leaves while veins remain green. Prevention and quick cure: 1. Avoid over-irrigation or waterlogging which precipitates iron. 2. Foliar application of 0.5% Ferrous Sulfate (FeSO4) + 0.1% Citric acid at active tillering and repeat 10 days later. Avoid high soil pH lime additions without sulfur.',
    source: 'ICAR - Directorate of Groundnut Research Advisories',
    keywords: ['yellowing', 'chlorosis', 'groundnut', 'leaves', 'yellow', 'iron', 'nutrient']
  },
  {
    id: 'pop_04',
    crop: 'Tomato',
    topic: 'Organic Fertilizer Protocol',
    guidelines: 'Organic Tomato soil nutrient schedule: Apply Well-rotted Farm Yard Manure (FYM) @ 10 tons/acre or Vermicompost @ 2 tons/acre basally. Supplement with Biofertilizers: Azospirillum and Phosphobacteria seed treatment @ 200g/acre. Top dress with neem cake powder @ 100 kg/acre at flowering stage to provide nutrition and suppress root nematodes.',
    source: 'National Centre of Organic and Natural Farming Guide',
    keywords: ['organic', 'tomato', 'fertilizer', 'manure', 'vermicompost', 'growth']
  },
  {
    id: 'pop_05',
    crop: 'Potato',
    topic: 'Early Blight Management',
    guidelines: 'Early blight caused by Alternaria solani manifests as concentric target-board dark brown spots. 1. Use certified pathogen-free seeds. 2. Maintain high soil potassium levels to improve fungal resilience. 3. Spray Chlorothalonil 75% WP @ 400g/acre or Mancozeb 75% WP @ 600g/acre in 200 Liters of water at first symptom, with repeat spray at 14 day intervals.',
    source: 'CPRI (Central Potato Research Institute) Standard Booklet',
    keywords: ['potato', 'concentric', 'blight', 'spot', 'spots', 'alternaria', 'fungicide']
  }
];

const pendingReviews: ReviewTask[] = [];

// Compute word-based keyword matching algorithm to simulate database searches
function getMatchScore(query: string, text: string, keywords: string[] = []): number {
  const qStr = query.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const tStr = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const qWords = qStr.split(/\s+/).filter(w => w.length > 2);
  const tWords = tStr.split(/\s+/).filter(w => w.length > 2);

  if (qWords.length === 0) return 0;

  let score = 0;
  for (const word of qWords) {
    if (tWords.includes(word)) {
      score += 1.0;
    } else if (keywords.some(k => k.toLowerCase() === word || k.toLowerCase().includes(word) || word.includes(k.toLowerCase()))) {
      score += 0.65;
    }
  }

  return score / Math.max(qWords.length, 2.5);
}

// Helper function to call Gemini with retries and multiple fallback models to maximize reliability
async function generateAgriculturalAdvice(
  ai: GoogleGenAI,
  systemInstruction: string,
  contents: string
): Promise<string> {
  const modelsToTry = [
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
    'gemini-flash-latest'
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    let attempts = 2;
    let delay = 800;

    while (attempts > 0) {
      try {
        console.log(`[Gemini Handshake] Trying source model ${modelName}...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });

        if (response && response.text) {
          console.log(`[Gemini Handshake Success] Resolved via ${modelName}`);
          return response.text;
        }
      } catch (error: any) {
        lastError = error;
        const errMsg = error?.message || String(error);
        console.log(`[Gemini Handshake Status] Model ${modelName} detail: ${errMsg.slice(0, 100)}`);

        // If it's a 404 (model not found) or invalid input argument, skip retrying this model
        if (errMsg.includes('404') || errMsg.includes('not found') || errMsg.includes('INVALID_ARGUMENT')) {
          break;
        }

        attempts--;
        if (attempts > 0) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
    }
  }

  throw lastError || new Error('All Gemini models and retries failed.');
}

// REST API Endpoints

// 1. Diagnostics search across our 3-tier lookup paradigm
app.post('/api/search', async (req, res) => {
  try {
    const { question, language = 'en' } = req.body;
    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Question is empty.' });
    }

    const query = question.trim();
    console.log(`[Diagnostic Search] Farmer asking: "${query}" in language: ${language}`);

    // Tier 1 Check: Golden Dataset
    let bestGoldenMatch: GoldenDatasetItem | null = null;
    let highestGoldenScore = 0;

    for (const item of goldenDataset) {
      const score = getMatchScore(query, item.question + " " + item.verifiedAnswer);
      if (score > highestGoldenScore) {
        highestGoldenScore = score;
        bestGoldenMatch = item;
      }
    }

    if (highestGoldenScore >= 0.65 && bestGoldenMatch) {
      console.log(`[Tier 1 MATCH] Found Golden Dataset answer. Score: ${highestGoldenScore}`);
      return res.json({
        tier: 1,
        source: 'Golden Dataset (Expert Verified)',
        score: highestGoldenScore,
        answer: bestGoldenMatch.verifiedAnswer,
        metadata: bestGoldenMatch.cropMetadata,
        verifiedBy: bestGoldenMatch.verifiedBy,
        sources: bestGoldenMatch.sources,
        originalQuestion: bestGoldenMatch.question
      });
    }

    // Tier 2 Check: Package of Practices (PoP) Guild Guidelines
    let bestPopMatch: typeof popGuides[0] | null = null;
    let highestPopScore = 0;

    for (const guide of popGuides) {
      const content = `${guide.crop} ${guide.topic} ${guide.guidelines}`;
      const score = getMatchScore(query, content, guide.keywords);
      if (score > highestPopScore) {
        highestPopScore = score;
        bestPopMatch = guide;
      }
    }

    if (highestPopScore >= 0.35 && bestPopMatch) {
      console.log(`[Tier 2 MATCH] Found PoP guidelines match. Score: ${highestPopScore}`);
      // Classify categorization
      const categoryMap: Record<string, 'Protection'|'Soil'|'Irrigation'|'Fertilizer'> = {
        'pest': 'Protection',
        'blight': 'Protection',
        'infestation': 'Protection',
        'insect': 'Protection',
        'fertilizer': 'Fertilizer',
        'npk': 'Fertilizer',
        'nutrient': 'Soil',
        'soil': 'Soil',
        'irrigation': 'Irrigation',
        'water': 'Irrigation',
      };
      let category: 'Protection' | 'Soil' | 'Irrigation' | 'Fertilizer' | 'Harvesting' = 'Protection';
      for (const [key, value] of Object.entries(categoryMap)) {
        if (query.toLowerCase().includes(key) || bestPopMatch.topic.toLowerCase().includes(key)) {
          category = value;
          break;
        }
      }

      return res.json({
        tier: 2,
        source: 'Package of Practices (Govt Guidelines)',
        score: highestPopScore,
        answer: bestPopMatch.guidelines,
        metadata: {
          crop: bestPopMatch.crop,
          state: 'General State Standard',
          category: category,
          symptomOrType: bestPopMatch.topic
        },
        verifiedBy: 'Standard Package of Practices (PoP) Database',
        sources: [bestPopMatch.source],
        originalQuestion: `PoP Reference: ${bestPopMatch.crop} - ${bestPopMatch.topic}`
      });
    }

    // Tier 3: AI Fallback (Gemini)
    console.log(`[Tier 3 Fallback] No matching database record. Querying Gemini AI in language: ${language}`);

    // Initialize Gemini AI Client securely
    const ai = getGeminiClient();

    // Map language code to English name
    const languageNames: Record<string, string> = {
      en: 'English',
      te: 'Telugu',
      hi: 'Hindi',
      kn: 'Kannada',
      ta: 'Tamil',
      mr: 'Marathi',
      bn: 'Bengali'
    };
    const targetLanguage = languageNames[language] || 'English';

    // Construct prompt tailored to farming and explicitly enforce selected language
    const systemInstruction = 
      "You are AgriVerify, an elite senior agricultural scientist specializing in agronomy, plant pathology, soil health, and organic farming. " +
      "Provide highly professional, reliable, structured, farmer-safe guidelines " +
      "addressing the farmer's specific query. Use simple language. Give: 1. Diagnosis (Symptom summary) 2. Chemical controls (include generic active ingredients, dosages per acre in metric units, dilution ratio) 3. Organic/cultural options (compost, sticky traps, spacing, botanical formulations). " +
      `The user/farmer has explicitly selected the language: ${targetLanguage}. Therefore, you MUST write your entire response ONLY in the ${targetLanguage} language. This is extremely critical because the farmer will not understand any other language (for example, if the selected language is English, answer strictly in English; if it is Hindi, answer strictly in Hindi). ` +
      "Try to keep sentences clear, encouraging, and easy to read. Avoid any generic layout fillers or larping tech logs.";

    const contents = `Selected Language for Response: ${targetLanguage}. (You must respond strictly in ${targetLanguage}).\n\nQuestion from a smallholder farmer: "${query}". Provide the best verified advice.`;

    const aiAnswer = await generateAgriculturalAdvice(ai, systemInstruction, contents);

    // Guess crop metadata from prompt
    const crops = ['cotton', 'rice', 'paddy', 'mango', 'groundnut', 'potato', 'tomato', 'wheat', 'sugarcane'];
    let detectedCrop = 'General Crop';
    for (const crop of crops) {
      if (query.toLowerCase().includes(crop)) {
        detectedCrop = crop.charAt(0).toUpperCase() + crop.slice(1);
        break;
      }
    }

    // Save this AI fallback answer into the pending review task queue
    const reviewId = `rev_${Date.now()}`;
    const newReviewTask: ReviewTask = {
      id: reviewId,
      question: query,
      aiAnswer,
      cropMetadata: {
        crop: detectedCrop,
        state: 'Simulated State',
        symptomOrType: 'General Advisory',
        category: 'Protection'
      },
      language,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    pendingReviews.push(newReviewTask);

    return res.json({
      tier: 3,
      source: 'AI Language Model (Gemini)',
      answer: aiAnswer,
      metadata: newReviewTask.cropMetadata,
      verifiedBy: 'Reviewer System Queue (Awaiting Expert Seal)',
      sources: ['Digital Agriculture Neural Corpus (Gemini 3.5 Framework)'],
      originalQuestion: query,
      reviewTaskId: reviewId
    });

  } catch (err: any) {
    const errorString = err?.message || String(err);
    console.log('[Search Process] Notice handling sequence:', errorString.slice(0, 100));

    let offlineNotice = `🌾 **Advisory Engine Status**: Note that the Gemini AI Key is currently not configured or is inactive in your workspace secrets.\n\n**Best Offline Action Checklist:**\n1. Ensure your crop has adequate drainage to prevent root moisture stagnation.\n2. Apply fresh Neem Seed Kernel Extract (NSKE) @ 5% as a broad-spectrum natural pest repellent.\n3. Check your Soil Health Card for micro-nutrient ratios to fix unexpected discoloration.\n\n*Configure your GEMINI_API_KEY in the Settings > Secrets menu to activate instant live AI generation.*`;

    if (errorString.includes('503') || errorString.includes('UNAVAILABLE') || errorString.includes('demand')) {
      offlineNotice = `🌾 **Temporary High-Demand Advisory**: Our live regional AI engines are currently experiencing high demand. To ensure your crop schedule is not delayed, please reference these general standard guidelines below:\n\n**Best Action Checklist:**\n1. Ensure your crop has adequate drainage to prevent root moisture stagnation.\n2. Apply fresh Neem Seed Kernel Extract (NSKE) @ 5% as a broad-spectrum natural pest repellent.\n3. Check your Soil Health Card for micro-nutrient ratios to fix unexpected discoloration.\n\n*AgriVerify will continue checking the connection status and automatically attempt connection to live regional advice.*`;
    }

    return res.status(200).json({
      tier: 3,
      source: 'AI Language Model (Backup Context)',
      answer: offlineNotice,
      metadata: {
        crop: 'General Advisory',
        state: 'Local Agronomy',
        symptomOrType: 'Offline Fallback Advisories',
        category: 'Protection'
      },
      verifiedBy: 'AgriVerify Static Failover Engine',
      sources: ['Standard Offline Farm safety manuals'],
      originalQuestion: req.body.question || 'Farmer Question'
    });
  }
});

// 2. Fetch the pending review queue so experts can inspect and approve it
app.get('/api/review/queue', (req, res) => {
  res.json(pendingReviews);
});

// 3. Approve or modify a pending AI answer and save it to the Golden Dataset
app.post('/api/review/act', (req, res) => {
  const { id, action, modifiedAnswer, expertName = 'Expert Scientist' } = req.body;
  const index = pendingReviews.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Review task not found.' });
  }

  const task = pendingReviews[index];
  const finalVerifiableAnswer = action === 'modify' ? modifiedAnswer : task.aiAnswer;

  // 1. Add to Golden Dataset
  const newGolden: GoldenDatasetItem = {
    id: `gold_add_${Date.now()}`,
    question: task.question,
    verifiedAnswer: finalVerifiableAnswer,
    cropMetadata: task.cropMetadata,
    verifiedBy: `${expertName} (Agricultural Expert)`,
    approvedAt: new Date().toISOString(),
    sources: ['AgriVerify Expert Panel Board Approval']
  };

  goldenDataset.push(newGolden);

  // 2. Remove from review queue / update status
  pendingReviews.splice(index, 1);

  console.log(`[Review Panel] Expert "${expertName}" approved Task ID "${id}". Saved to Golden Dataset!`);

  res.json({
    success: true,
    goldenDatasetLength: goldenDataset.length,
    newGoldenItem: newGolden
  });
});

// 4. Fetch general stats for dashboard
app.get('/api/stats', (req, res) => {
  res.json({
    goldenDatasetCount: goldenDataset.length,
    popGuidesCount: popGuides.length,
    pendingReviewsCount: pendingReviews.length,
    languagesSupported: 7
  });
});

// 5. Fetch Golden Dataset items
app.get('/api/golden', (req, res) => {
  res.json(goldenDataset);
});

async function startServer() {
  // Vite Middleware for development asset compiler. Production servers serve pre-built assets
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to host 0.0.0.0 and Port 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AgriVerify Backend active on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error("Failed to start AgriVerify server:", err);
  });
}

export default app;
