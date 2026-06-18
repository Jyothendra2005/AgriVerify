/**
 * Agriculturally verified data and multilingual translations for AgriVerify.
 */

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

export interface PoPGuide {
  id: string;
  crop: string;
  topic: string;
  guidelines: string;
  source: string;
  keywords: string[];
}

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' }
];

export const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    title: 'AgriVerify Farmer Advisor',
    subtitle: 'Ask your farming questions in your own language and get expert-verified answers instantly.',
    voicePlaceholder: 'Press the microphone to speak your question in English...',
    textPlaceholder: 'Type your question here (e.g. Whiteflies in Guntur cotton)...',
    suggestionsTitle: 'Common Questions',
    checkingGolden: 'Searching Golden Dataset (Expert Verified)....',
    checkingPoP: 'Checking Package of Practices (Govt Guidelines)....',
    askingAI: 'Consulting AI Language Model (Gemini Fallback)....',
    tier1: 'Tier 1: Expert Verified Golden Q&A',
    tier2: 'Tier 2: Standard Package of Practices (PoP)',
    tier3: 'Tier 3: AI Generated Answer',
    tier3Notice: 'Forwarded to AgriVerify Reviewer System for scientific expert validation.',
    verifyAction: 'Validate and Add to Golden Dataset',
    speakBtnPlay: 'Listen to Answer (TTS)',
    speakBtnStop: 'Stop Listening',
    recording: 'Listening... Speak now.',
    stopRecording: 'Stop and Search',
    reviewTab: 'Expert Board Review',
    reviewDesc: 'See how AI answers are reviewed, edited, or approved by agricultural experts to build the Golden Dataset.',
    queueEmpty: 'No AI answers are currently awaiting review.',
    approveAsIs: 'Approve & Save to Golden',
    modifyAndApprove: 'Refine Advice & Save',
    expertVerdicts: 'Expert Board Activity',
    datasetCount: 'Golden Q&As',
    popCount: 'PoP Guides',
    activeSubmissions: 'Farmer Queries',
    accuracyScore: 'Verification Rate',
    suggestedCrops: 'Filter by Crop',
    welcomeSearchMsg: 'Hello! I am AgriVerify, your agricultural companion. You can ask me via text or click the mic to speak in your language!'
  },
  te: {
    title: 'AgriVerify రైతు సలహాదారు',
    subtitle: 'మీ వ్యవసాయ ప్రశ్నలను మీ మాతృభాషలో అడిగి, తక్షణమే నిపుణులు ధృవీకరించిన సమాధానాలను పొందండి.',
    voicePlaceholder: 'తెలుగులో ప్రశ్నించడానికి మైక్రోఫోన్ నొక్కండి...',
    textPlaceholder: 'మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి (ఉదా: గుంటూరు పత్తిలో తెల్లదోమ)...',
    suggestionsTitle: 'సాధారణ ప్రశ్నలు',
    checkingGolden: 'గోల్డెన్ డేటాసెట్ (నిపుణులచే ధృవీకరించబడినది) వెతుకుతోంది....',
    checkingPoP: 'ప్యాకేజీ ఆఫ్ ప్రాక్టీసెస్ (ప్రభుత్వ మార్గదర్శకాలు) తనిఖీ చేస్తోంది....',
    askingAI: 'AI మోడల్ (జెమిని ఫాల్‌బ్యాక్) సహాయం అడుగుతోంది....',
    tier1: 'టయర్ 1: నిపుణులు ధృవీకరించిన గోల్డెన్ సమాధానం',
    tier2: 'టయర్ 2: స్టాండర్డ్ ప్యాకేజీ ఆఫ్ ప్రాక్టీసెస్ (PoP)',
    tier3: 'టయర్ 3: AI రూపొందించిన సమాధానం',
    tier3Notice: 'శాస్త్రీయ నిపుణుల ధృవీకరణ కోసం AgriVerify సమీక్షా వ్యవస్థకు పంపబడింది.',
    verifyAction: 'సమీక్షించి గోల్డెన్ డేటాసెట్‌కు జోడించండి',
    speakBtnPlay: 'సమాధానం వినండి (వాయిస్)',
    speakBtnStop: 'వాయిస్ నిలిపివేయి',
    recording: 'వింటున్నాము... మాట్లాడండి.',
    stopRecording: 'ఆపి వెతకండి',
    reviewTab: 'నిపుణుల సమీక్షా బోర్డు',
    reviewDesc: 'గోల్డెన్ డేటాసెట్‌ను రూపొందించడానికి AI సమాధానాలను వ్యవసాయ నిపుణులు ఎలా సమీక్షిస్తారో, సవరిస్తారో లేదా ఆమోదిస్తారో ఇక్కడ చూడండి.',
    queueEmpty: 'ఈ సమయములో సమీక్ష కోసం ఎలాంటి AI సమాధానాలు లేవు.',
    approveAsIs: 'యథాతథంగా ఆമോదించు',
    modifyAndApprove: 'సవరించి ఆమోదించు',
    expertVerdicts: 'నిపుణుల బోర్డు కార్యాచరణ',
    datasetCount: 'గోల్డెన్ సమాధానాలు',
    popCount: 'PoP గైడ్‌లు',
    activeSubmissions: 'రైతు సందేహాలు',
    accuracyScore: 'ధృవీకరణ రేటు',
    suggestedCrops: 'పంట ద్వారా వడపోత',
    welcomeSearchMsg: 'నమస్కారం! నేను మీ AgriVerify వ్యవసాయ తోడును. మీరు టెక్స్ట్ ద్వారా అడగవచ్చు లేదా తెలుగులో మాట్లాడటానికి మైక్ క్లిక్ చేయవచ్చు!'
  },
  hi: {
    title: 'AgriVerify किसान सलाहकार',
    subtitle: 'अपनी कृषि समस्याओं को अपनी भाषा में पूछें और तुरंत प्रमाणित वैज्ञानिक समाधान पाएं।',
    voicePlaceholder: 'अपनी भाषा में सवाल पूछने के लिए माइक दबाएं...',
    textPlaceholder: 'अपना प्रश्न यहाँ दर्ज करें (जैसे: गुंटूर कपास में सफेद मक्खी)...',
    suggestionsTitle: 'अक्सर पूछे जाने वाले प्रश्न',
    checkingGolden: 'गोल्डन डेटासेट (विशेषज्ञ सत्यापित) में खोज जारी है....',
    checkingPoP: 'कृषि संदर्शिका (सरकारी गाइडलाइंस) की जाँच की जा रही है....',
    askingAI: 'AI मॉडल (जेमिनी फ़ालबैक) से परामर्श किया जा रहा है....',
    tier1: 'टियर 1: विशेषज्ञ सत्यापित गोल्डन प्रश्न-उत्तर',
    tier2: 'टियर 2: मानक कृषि पैकेज ऑफ प्रैक्टिसेज (PoP)',
    tier3: 'टियर 3: AI द्वारा तैयार उत्तर',
    tier3Notice: 'वैज्ञानिक सत्यापन के लिए इसे AgriVerify समीक्षक सिस्टम को भेजा गया है।',
    verifyAction: 'सत्यापित करें और गोल्डन डेटासेट में जोड़ें',
    speakBtnPlay: 'उत्तर सुनें',
    speakBtnStop: 'आवाज बंद करें',
    recording: 'सुन रहा हूँ... अब बोलें।',
    stopRecording: 'रोकें और खोजें',
    reviewTab: 'विशेषज्ञ बोर्ड समीक्षा',
    reviewDesc: 'देखें कैसे कृषि विशेषज्ञों द्वारा AI उत्तरों की समीक्षा, समीक्षा संशोधन या अनुमोदन करके स्वर्ण डेटासेट बनाया जाता है।',
    queueEmpty: 'वर्तमान में समीक्षा के लिए कोई AI उत्तर प्रतीक्षारत नहीं है।',
    approveAsIs: 'सत्यापित कर स्वीकृत करें',
    modifyAndApprove: 'संशोधित कर स्वीकृत करें',
    expertVerdicts: 'विशेषज्ञ बोर्ड गतिविधि',
    datasetCount: 'गोल्डन उत्तर',
    popCount: 'PoP संदर्शिकाएं',
    activeSubmissions: 'किसानों के सवाल',
    accuracyScore: 'सत्यापन दर',
    suggestedCrops: 'फसल के अनुसार छानें',
    welcomeSearchMsg: 'नमस्ते! मैं AgriVerify हूँ, आपका कृषि मित्र। आप लिखकर पूछ सकते हैं या अपनी भाषा में बात करने के लिए माइक दबा सकते हैं!'
  },
  kn: {
    title: 'AgriVerify ರೈತ ಸಲಹೆಗಾರ',
    subtitle: 'ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳನ್ನು ನಿಮ್ಮದೇ ಭาಷೆಯಲ್ಲಿ ಕೇಳಿ ಮತ್ತು ತಕ್ಷಣವೇ ತಜ್ಞರಿಂದ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟ ಉತ್ತರಗಳನ್ನು ಪಡೆಯಿರಿ.',
    voicePlaceholder: 'ಕನ್ನಡದಲ್ಲಿ ಪ್ರಶ್ನೆ ಕೇಳಲು ಮೈಕ್ರೋಫೋನ್ ಒತ್ತಿರಿ...',
    textPlaceholder: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ (ಉದಾಹರಣೆಗೆ: ಹತ್ತಿ ಬೆಳೆಯಲ್ಲಿ ಬಿಳಿ ನೊಣ)...',
    suggestionsTitle: 'ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು',
    checkingGolden: 'ಗೋಲ್ಡನ್ ಡೇಟಾಸೆಟ್ (ತಜ್ಞರಿಂದ ದೃಢೀಕೃತ) ಹುಡುಕಲಾಗುತ್ತಿದೆ....',
    checkingPoP: 'ಪ್ಯಾಕೇಜ್ ಆಫ್ ಪ್ರ್ಯಾಕ್ಟೀಸಸ್ (ಸರ್ಕಾರಿ ಮಾರ್ಗಸೂಚಿಗಳು) ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ....',
    askingAI: 'AI ಭಾಷಾ ಮಾದರಿ (ಜೆಮಿನಿ ಫಾಲ್‌ಬ್ಯಾಕ್) ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ....',
    tier1: 'ಹಂತ 1: ತಜ್ಞರು ದೃಢೀಕರಿಸಿದ ಗೋಲ್ಡನ್ ಉತ್ತರ',
    tier2: 'ಹಂತ 2: ಪ್ರಮಾಣಿತ ಪ್ಯಾಕೇಜ್ ಆಫ್ ಪ್ರಾಕ್ಟೀಸಸ್ (PoP)',
    tier3: 'ಹಂತ 3: AI ಮುಖಾಂತರ ಸಿದ್ಧಪಡಿಸಿದ ಉತ್ತರ',
    tier3Notice: 'ವೈಜ್ಞಾನಿಕ ತಜ್ಞರ ಮೌಲ್ಯೀಕರಣಕ್ಕಾಗಿ AgriVerify ವಿಮರ್ಶಕರ ವ್ಯವಸ್ಥೆಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.',
    verifyAction: 'ಪರಿಶೀಲಿಸಿ ಗೋಲ್ಡನ್ ಡೇಟಾಸೆಟ್‌ಗೆ ಸೇರಿಸಿ',
    speakBtnPlay: 'ಉತ್ತರವನ್ನು ಆಲಿಸಿ',
    speakBtnStop: 'ಆಲಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ',
    recording: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ... ಈಗ ಮಾತನಾಡಿ.',
    stopRecording: 'ನಿಲ್ಲಿಸಿ ಮತ್ತು ಹುಡುಕಿ',
    reviewTab: 'ತಜ್ಞರ ಪರಿಶೀಲನಾ ಮಂಡಳಿ',
    reviewDesc: 'ಗೋಲ್ಡನ್ ಡೇಟಾಸೆಟ್ ನಿರ್ಮಿಸಲು ಕೃಷಿ ತಜ್ಞರು AI ಉತ್ತರಗಳನ್ನು ಹೇಗೆ ಪರಿಶೀಲಿಸುತ್ತಾರೆ ಮತ್ತು ಅನುಮೋದಿಸುತ್ತಾರೆ ಎಂಬುದನ್ನು ಇಲ್ಲಿ ನೋಡಿ.',
    queueEmpty: 'ಪ್ರಸ್ತುತ ಸಕ್ರಿಯ ವಿಮರ್ಶೆಗಾಗಿ ಯಾವುದೇ AI ಉತ್ತರಗಳು ಕಾಯುತ್ತಿಲ್ಲ.',
    approveAsIs: 'ಯಥಾಸ್ಥಿತಿ ಅನುಮೋದಿಸಿ',
    modifyAndApprove: 'ಪರಿಷ್ಕರಿಸಿ ಅನುಮೋದಿಸಿ',
    expertVerdicts: 'ಮಂಡಳಿ ಚಟುವಟಿಕೆ',
    datasetCount: 'ಗೋಲ್ಡನ್ ಉತ್ತರಗಳು',
    popCount: 'PoP ಮಾರ್ಗದರ್ಶಿಗಳು',
    activeSubmissions: 'ರೈತರ ಪ್ರಶ್ನೆಗಳು',
    accuracyScore: 'ದೃಢೀಕರಣ ಪ್ರಮಾಣ',
    suggestedCrops: 'ಬೆಳೆ ಫಿಲ್ಟರ್',
    welcomeSearchMsg: 'ನಮಸ್ಕಾರ! ನಾನು AgriVerify, ನಿಮ್ಮ ಕೃಷಿ ಸಂಗಾತಿ. ನೀವು ಟೈಪ್ ಮಾಡಬಹುದು ಅಥವಾ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಲು ಮೈಕ್ ಕ್ಲಿಕ್ ಮಾಡಬಹುದು!'
  }
};

// Fill missing languages fallback to English to prevent runtime crashes
for (const lang of LANGUAGES) {
  if (!TRANSLATIONS[lang.code]) {
    TRANSLATIONS[lang.code] = { ...TRANSLATIONS.en };
  }
}

export const SUGGESTIONS: Record<string, Array<{ text: string; crop: string }>> = {
  en: [
    { text: 'How do I treat whiteflies infestation on cotton in Guntur during Kharif season?', crop: 'Cotton' },
    { text: 'What is the optimal NPK fertilizer ratio for Basmati rice in Punjab?', crop: 'Rice' },
    { text: 'How often should drip irrigation run for Alphonso mango in black soil of Satara?', crop: 'Mango' },
    { text: 'My groundnut leaves are turning yellow with stunted shoots in Chittoor, what to spray?', crop: 'Groundnut' },
    { text: 'Concentric dark board-like circles on my potato leaves in Hugli, is it early blight?', crop: 'Potato' },
    { text: 'How to control stem borer insect in paddy fields?', crop: 'Rice' },
    { text: 'What organic fertilizers should I use for organic tomato cultivation?', crop: 'Tomato' }
  ],
  te: [
    { text: 'గుంటూరులో ఖరీఫ్ సీజన్ పత్తి పంటలో తెల్లదోమ నివారణకు ఎలాంటి మందులు స్ప్రే చేయాలి?', crop: 'Cotton' },
    { text: 'పంజాబ్ నేలల్లో బాస్మతి వరి సాగుకు సరైన NPK ఎరువుల నిష్పత్తి ఎంత?', crop: 'Rice' },
    { text: 'సతారా నల్లరేగడి నేలలో అల్ఫోన్సో మామిడికి డ్రిప్ నీటి పారుదల ఎలా నిర్వహించాలి?', crop: 'Mango' },
    { text: 'చిత్తూరులో వేరుశనగ ఆకులు పసుపుబారి మొక్క ఎదుగుదల ఆగిపోయింది, ఏ మందు చల్లాలి?', crop: 'Groundnut' },
    { text: 'హుగ్లీలో నా బంగాళాదుంప ఆకులపై గుండ్రటి నల్లటి మచ్చలు వచ్చాయి, ఇది పంగి అగ్గి తెగులా?', crop: 'Potato' },
    { text: 'వరి పొలాల్లో కాండం తొలిచే పురుగును ఎలా నియంత్రించాలి?', crop: 'Rice' },
    { text: 'టమోటా సాగులో ఆకు ముడత తెగులు నివారణకు సేంద్రీయ పద్ధతులు ఏమిటి?', crop: 'Tomato' }
  ],
  hi: [
    { text: 'गुंटूर में खरीफ सीजन के दौरान कपास पर सफेद मक्खियों के प्रकोप का इलाज कैसे करें?', crop: 'Cotton' },
    { text: 'पंजाब की मिट्टी में बासमती चावल के लिए एनपीके उर्वरक का सही अनुपात क्या है?', crop: 'Rice' },
    { text: 'सतारा की काली मिट्टी में अलफांसो आम के लिए ड्रिप सिंचाई कितनी बार चलानी चाहिए?', crop: 'Mango' },
    { text: 'चित्तूर में मूंगफली की पत्तियां पीली पड़ रही हैं और पौधे छोटे रह गए हैं, क्या छिड़काव करें?', crop: 'Groundnut' },
    { text: 'हुगली में आलू की पत्तियों पर गोल काले घेरे दिखाई दे रहे हैं, क्या यह अगेती झुलसा रोग है?', crop: 'Potato' },
    { text: 'धान के खेतों में तना छेदक कीट को कैसे नियंत्रित करें?', crop: 'Rice' },
    { text: 'टमाटर की जैविक खेती के लिए कौन से जैविक उर्वरकों का उपयोग करना चाहिए?', crop: 'Tomato' }
  ],
  kn: [
    { text: 'ಗುಂಟೂರಿನಲ್ಲಿ ಹತ್ತಿ ಬೆಳೆಗೆ ಬರುವ ಬಿಳಿ ನೊಣ ಹಾರಾಟ ನಿಯಂತ್ರಿಸುವುದು ಹೇಗೆ?', crop: 'Cotton' },
    { text: 'ಪಂಜಾಬ್ ಮಣ್ಣಿನಲ್ಲಿ ಬಾಸುಮತಿ ಭತ್ತದ ಬೆಳೆಗೆ ಬಳಸಬೇಕಾದ ಎನ್‌ಪಿಕೆ ಅನುಪಾತ ಎಷ್ಟು?', crop: 'Rice' },
    { text: 'ಸತಾರಾದ ಕಪ್ಪು ಮಣ್ಣಿನಲ್ಲಿ ಆಲ್ಫಾನ್ಸೋ ಮಾವಿನ ಗಿಡಕ್ಕೆ ಎಷ್ಟು ದಿನಗಳಿಗೊಮ್ಮೆ ಹನಿ ನೀರಾವರಿ ನೀಡಬೇಕು?', crop: 'Mango' },
    { text: 'ಚಿತ್ತೂರಿನಲ್ಲಿ ಕಡಲೆಕಾಯಿ ಎಲೆಗಳು ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತಿವೆ, ಯಾವ ಔಷಧ ಸಿಂಪಡಿಸಬೇಕು?', crop: 'Groundnut' },
    { text: 'ಹುಗ್ಲಿಯಲ್ಲಿ ಆಲೂಗಡ್ಡೆ ಎಲೆಗಳ ಮೇಲೆ ಕಪ್ಪು ವಲಯಗಳು ಮೂಡಿವೆ, ಇದು ಅರ್ಲಿ ಬ್ಲೈಟ್ ರೋಗವೇ?', crop: 'Potato' },
    { text: 'ಭತ್ತದ ಗದ್ದೆಯಲ್ಲಿ ಕಾಂಡ ಕೊರಕ ಹುಳುಗಳನ್ನು ನಿಯಂತ್ರಿಸುವುದು ಹೇಗೆ?', crop: 'Rice' },
    { text: 'ಟೊಮೆಟೊ ಬೆಳೆಗೆ ಬಳಸಬಹುದಾದ ಪ್ರಮುಖ ಸಾವಯವ ಗೊಬ್ಬರಗಳು ಯಾವುವು?', crop: 'Tomato' }
  ]
};

// Fallback suggestions for other languages to English
for (const lang of LANGUAGES) {
  if (!SUGGESTIONS[lang.code]) {
    SUGGESTIONS[lang.code] = [ ...SUGGESTIONS.en ];
  }
}

export const GOLDEN_DATASET_MOCK: GoldenDatasetItem[] = [
  {
    id: 'gold_01',
    question: 'How do I treat whiteflies infestation on cotton in Guntur during Kharif season?',
    verifiedAnswer: 'Whitefly infestation in Guntur region of Andhra Pradesh must be addressed using Integrated Pest Management (IPM). Apply Yellow Sticky Traps @10 per acre initially to monitor. For chemical control, use Diafenthiuron 50% WP @ 240g/acre or Pyriproxyfen 10% EC @ 400ml/acre in 200 liters of water. Avoid consecutive pyrethroid applications as they trigger secondary pest resurgences.',
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
    verifiedAnswer: 'In Satara (Maharashtra), Alphonso mangoes planted on heavy black soil require precise drip scheduling to prevent root rot/asphyxia. Apply 25-30 liters of water per tree daily during summer, and 12-15 liters every alternate day during winter. Establish two lateral lines per row with 4 inline pressure-compensated drippers (4 L/hr capacity) placed 1 meter away from the tree trunk. Adjust to skip irrigation during active flowering to trigger fruit buds.',
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

export const POP_GUIDES_DATABASE: PoPGuide[] = [
  {
    id: 'pop_01',
    crop: 'Cotton',
    topic: 'Pest Management (Whitefly)',
    guidelines: 'Standard Govt recommendations for whitefly in cotton: 1. Maintain barrier borders with sorghum or maize. 2. Clean fields of Sida acuta weed. 3. Spray Neem oil @1500 ppm or fish oil rosin soap @ 10g/L during early stages. 4. Critical Chemical control: Buprofezin 25% SC @ 400ml/acre or Spiromesifen 22.9% SC @ 240ml/acre. Spray during early morning parameters.',
    source: 'ICAR - Central Institute for Cotton Research Guidelines',
    keywords: ['whitefly', 'whiteflies', 'cotton', 'insect', 'pesticide', 'leaf curl']
  },
  {
    id: 'pop_02',
    crop: 'Rice',
    topic: 'Stem Borer Management',
    guidelines: 'Yellow stem borer (Scirpophaga incertulas) is a primary pest. Sowing guidelines: 1. Clip leaf tips of seedlings before transplanting to destroy egg masses. 2. Install pheromone traps @5 per acre for monitoring. 3. Chemical application: Cartap Hydrochloride 4G granulated @10 kg/acre or Chlorantraniliprole 0.4% G @4 kg/acre. Apply in thin standing water layer.',
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
    guidelines: 'Organic Tomato soil nutrient schedule: Apply Well-rotted Farm Yard Manure (FYM) @ 10 tons/acre or Vermicompost @ 2 tons/acre basally. Supplement with Biofertilizers: Azospirillum and Phosphobacteria seed treatment @ 200g/acre. Top dress with neem cake powder @ 100 kg/acre at flowering stage to provide active nitrogen and control nematodes.',
    source: 'National Centre of Organic and Natural Farming Guide',
    keywords: ['organic', 'tomato', 'fertilizer', 'manure', 'vermicompost', 'growth']
  },
  {
    id: 'pop_05',
    crop: 'Potato',
    topic: 'Early Blight Management',
    guidelines: 'Early blight caused by Alternaria solani manifests as concentric target-board dark brown spots. 1. Use certified pathogen-free seeds. 2. Maintain high soil potassium levels to improve fungal resilience. 3. Spray Chlorothalonil 75% WP @ 400g/acre or Mancozeb 75% WP @ 600g/acre in 200 Liters of water at first symptom, with repeat spray at 14 day intervals.',
    source: 'CPRI (Central Potato Research Institute) Standard Booklet',
    keywords: [' potato', 'concentric', 'blight', 'spot', 'spots', 'alternaria', 'fungicide']
  }
];
