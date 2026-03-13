import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./chat.css";

// ═════════════════════════════════════════════════════════════════════════════
// LANGUAGES
// ═════════════════════════════════════════════════════════════════════════════

type Lang = "en" | "hi" | "mr" | "pa" | "kn" | "gu";
type VoiceLang = "en-IN" | "hi-IN" | "mr-IN" | "pa-IN" | "kn-IN" | "gu-IN";

function voiceLang(l: Lang): VoiceLang {
    switch (l) {
        case "hi": return "hi-IN";
        case "mr": return "mr-IN";
        case "pa": return "pa-IN";
        case "kn": return "kn-IN";
        case "gu": return "gu-IN";
        default: return "en-IN";
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// MULTILINGUAL COMMAND DICTIONARY
// ═════════════════════════════════════════════════════════════════════════════

const CMD = {
    bookSlot: [
        // English
        "book slot", "book arrival slot", "booking", "book a slot",
        "i want to book", "arrival slot", "sell crops", "sell crop",
        "i want to sell", "sell my crop",
        // Hindi
        "स्लॉट बुक करो", "स्लॉट बुक करना है", "मुझे स्लॉट बुक करना है",
        "मुझे बुक करना है", "बुकिंग करो", "फसल बेचनी है", "फसल बेचना है",
        "मुझे फसल बेचनी है", "बुकिंग", "स्लॉट",
        // Marathi
        "स्लॉट बुक करा", "मला स्लॉट बुक करायचा आहे", "बुकिंग करा",
        "मला बुकिंग करायची आहे", "पीक विकायचे आहे", "मला विकायचे आहे",
        "मला पीक विकायचे आहे",
        // Punjabi
        "ਸਲਾਟ ਬੁੱਕ ਕਰੋ", "ਬੁੱਕਿੰਗ ਕਰੋ", "ਮੈਂ ਵੇਚਣਾ ਚਾਹੁੰਦਾ ਹਾਂ",
        // Kannada
        "ಸ್ಲಾಟ್ ಬುಕ್ ಮಾಡಿ", "ಬುಕಿಂಗ್ ಮಾಡಿ", "ನಾನು ಮಾರಾಟ ಮಾಡಲು ಬಯಸುತ್ತೇನೆ",
        // Gujarati
        "સ્લોટ બુક કરો", "બુકિંગ કરો", "હું વેચવા માંગુ છું",
    ],

    hubs: [
        // English
        "hubs", "hub", "nearby hubs", "show hubs", "explore hubs",
        "view hubs", "nearby hub", "all hubs", "open hubs", "factory",
        "factories", "nearby",
        // Hindi
        "हब दिखाओ", "नज़दीकी हब", "नजदीकी हब", "हब", "कारखाना दिखाओ",
        "कारखाने दिखाओ", "फैक्ट्री", "पास के हब",
        // Marathi
        "हब दाखवा", "जवळचे हब", "हब", "कारखाना दाखवा",
        "कारखाने दाखवा", "जवळचा कारखाना",
        // Punjabi
        "ਹੱਬ ਦਿਖਾਓ", "ਨੇੜਲੇ ਹੱਬ",
        // Kannada
        "ಹಬ್‌ಗಳನ್ನು ತೋರಿಸಿ", "ಹತ್ತಿರದ ಹಬ್‌ಗಳು",
        // Gujarati
        "હબ બતાવો", "નજીકના હબ",
    ],

    dashboard: [
        "dashboard", "home", "go home", "open dashboard",
        "डैशबोर्ड", "डैशबोर्ड खोलो", "होम",
        "डॅशबोर्ड", "डॅशबोर्ड उघडा", "मुखपृष्ठ",
        "ਡੈਸ਼ਬੋਰਡ", "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "ડેશબોર્ડ",
    ],

    queue: [
        // English
        "queue", "queue status", "waiting", "wait time", "waiting line",
        "check queue", "token", "status", "my booking",
        // Hindi
        "रांग", "कतार", "प्रतीक्षा", "लाइन", "कतार स्थिति",
        "मेरी बुकिंग", "टोकन", "स्थिति",
        // Marathi
        "रांग", "प्रतीक्षा", "रांग स्थिती", "माझी बुकिंग",
        "टोकन", "स्थिती",
        // Punjabi
        "ਕਤਾਰ", "ਸਥਿਤੀ",
        // Kannada
        "ಕ್ಯೂ", "ಸ್ಥಿತಿ",
        // Gujarati
        "કતાર", "સ્થિતિ",
    ],

    cancel: [
        "cancel", "reset", "start over", "stop",
        "रद्द करो", "रद्द", "बंद करो",
        "रद्द करा", "थांबा", "पुन्हा सुरू करा",
        "ਰੱਦ ਕਰੋ", "ರದ್ದುಮಾಡಿ", "રદ કરો",
    ],
};

// ═════════════════════════════════════════════════════════════════════════════
// CROP DICTIONARY — maps keywords to category info (all 3 languages)
// ═════════════════════════════════════════════════════════════════════════════

interface CropInfo { slug: string; cat: string; label: string }

const CROP_ENTRIES: Array<{ keywords: string[]; info: CropInfo }> = [
    {
        keywords: [
            "sugarcane", "sugar", "cane", "sugar mill", "sugar factory",
            "गन्ना", "गन्ना मिल", "शक्कर", "चीनी मिल",
            "ऊस", "साखर", "साखर कारखाना", "ऊस कारखाना",
            "ਗੰਨਾ", "ಕಬ್ಬು", "શેરડી",
        ],
        info: { slug: "sugar", cat: "Sugar Mill", label: "Sugarcane" },
    },
    {
        keywords: [
            "milk", "dairy", "dairy plant", "milk plant", "paneer", "cheese",
            "दूध", "डेअरी", "दुग्ध", "दुग्ध डेअरी", "दूध डेअरी", "पनीर",
            "दूध डेअरी", "दुग्ध प्रकल्प",
            "ਦੁੱਧ", "ಹಾಲು", "દૂધ",
        ],
        info: { slug: "dairy", cat: "Dairy Plant", label: "Milk" },
    },
    {
        keywords: [
            "wheat", "rice", "maize", "grain", "corn", "paddy", "food", "food processing",
            "गेहूं", "चावल", "मक्का", "अनाज", "खाद्य",
            "गहू", "तांदूळ", "मका", "धान्य", "अन्न प्रक्रिया",
            "ਕਣਕ", "ಚಕ್ಕಿ", "ઘઉં",
        ],
        info: { slug: "food", cat: "Food Processing", label: "Grain" },
    },
    {
        keywords: [
            "vegetable", "vegetables", "fruit", "fruits", "onion", "tomato", "potato",
            "banana", "mango",
            "सब्जी", "सब्जियां", "फल", "प्याज", "टमाटर", "आलू", "केला", "आम",
            "भाजीपाला", "भाजी", "कांदा", "टोमॅटो", "बटाटा", "केळी", "आंबा", "फळ",
            "ਸਬਜ਼ੀਆਂ", "ತರಕಾರಿ", "શાકભાજી",
        ],
        info: { slug: "fruits", cat: "Fruits & Vegetables", label: "Vegetables" },
    },
    {
        keywords: [
            "apmc", "market", "mandi",
            "मंडी", "बाजार", "एपीएमसी",
            "मंडी", "बाजार",
            "ਮੰਡੀ", "ಮಾರುಕಟ್ಟೆ", "માર્કેટ",
        ],
        info: { slug: "apmc", cat: "APMC Market", label: "Produce" },
    },
];

function detectCrop(msg: string): CropInfo | null {
    for (const entry of CROP_ENTRIES) {
        for (const kw of entry.keywords) {
            if (msg.includes(kw)) return entry.info;
        }
    }
    return null;
}

// ═════════════════════════════════════════════════════════════════════════════
// DETECTION HELPERS
// ═════════════════════════════════════════════════════════════════════════════

function matchesCmd(msg: string, list: string[]): boolean {
    return list.some(cmd => msg.includes(cmd));
}

function detectQty(msg: string): string | null {
    const m = msg.match(/(\d+(\.\d+)?)\s*(ton|tons|tonne|tonnes|टन|kg|quintal|क्विंटल)?/i);
    return m ? m[1] : null;
}

function detectTime(msg: string): string | null {
    const m = msg.match(/(\d{1,2})\s*(am|pm)/i);
    if (m) return `${m[1]} ${m[2].toUpperCase()}`;
    if (/morning|सुबह|सकाळ/.test(msg)) return "9 AM";
    if (/afternoon|दोपहर|दुपार/.test(msg)) return "2 PM";
    if (/evening|शाम|संध्याकाळ/.test(msg)) return "5 PM";
    return null;
}

// ═════════════════════════════════════════════════════════════════════════════
// MULTILINGUAL RESPONSES
// ═════════════════════════════════════════════════════════════════════════════

const R: Record<string, Record<Lang, string>> = {
    welcome: {
        en: "Hello Farmer 🌾\n\nHow can I help you?\n\nTry:\n• \"Book a slot\"\n• \"I want to sell sugarcane\"\n• \"Sell sugarcane 10 tons\"",
        hi: "नमस्ते किसान 🌾\n\nमैं आपकी कैसे मदद करूँ?\n\nबोलिए:\n• \"स्लॉट बुक करो\"\n• \"मुझे गन्ना बेचना है\"\n• \"10 टन गन्ना बेचना है\"",
        mr: "नमस्कार शेतकरी 🌾\n\nमी तुमची कशी मदत करू?\n\nबोला:\n• \"स्लॉट बुक करा\"\n• \"मला ऊस विकायचा आहे\"\n• \"10 टन ऊस विकायचा आहे\"",
        pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ 🌾\n\nਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?\n\nਕੋਸ਼ਿਸ਼ ਕਰੋ:\n• \"ਸਲਾਟ ਬੁੱਕ ਕਰੋ\"",
        kn: "ನಮಸ್ಕಾರ ರೈತರೆ 🌾\n\nನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?\n\nಪ್ರಯತ್ನಿಸಿ:\n• \"ಸ್ಲಾಟ್ ಬುಕ್ ಮಾಡಿ\"",
        gu: "નમસ્તે ખેડૂત 🌾\n\nહું તમારી કેવી રીતે મદદ કરી શકું?\n\nપ્રયત્ન કરો:\n• \"સ્લોટ બુક કરો\"",
    },
    chooseCat: {
        en: "Sure farmer 🌾\nPlease choose the category where you want to sell your crop.",
        hi: "ज़रूर किसान 🌾\nकृपया वह हब श्रेणी चुनें जहाँ आप फसल बेचना चाहते हैं।",
        mr: "नक्की शेतकरी 🌾\nकृपया तुम्हाला ज्या हबमध्ये पीक विकायचे आहे ती श्रेणी निवडा.",
        pa: "ਜ਼ਰੂਰ ਕਿਸਾਨ 🌾\nਕਿਰਪਾ ਕਰਕੇ ਉਹ ਸ਼੍ਰੇਣੀ ਚੁਣੋ ਜਿੱਥੇ ਤੁਸੀਂ ਆਪਣੀ ਫਸਲ ਵੇਚਣਾ ਚਾਹੁੰਦੇ ਹੋ।",
        kn: "ಖಂಡಿತ ರೈತರೇ 🌾\nನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಮಾರಾಟ ಮಾಡಲು ಬಯಸುವ ವರ್ಗವನ್ನು ದಯವಿಟ್ಟು ಆಯ್ಕೆಮಾಡಿ.",
        gu: "ચોક્કસ ખેડૂત 🌾\nકૃપા કરીને તે શ્રેણી પસંદ કરો જ્યાં તમે તમારો પાક વેચવા માંગો છો.",
    },
    openDash: {
        en: "Opening Farmer Dashboard...",
        hi: "किसान डैशबोर्ड खोल रहे हैं...",
        mr: "शेतकरी डॅशबोर्ड उघडत आहे...",
        pa: "ਕਿਸਾਨ ਡੈਸ਼ਬੋਰਡ ਖੋਲ੍ਹ ਰਿਹਾ ਹੈ...",
        kn: "ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ...",
        gu: "ખેડૂત ડેશબોર્ડ ખોલી રહ્યું છે...",
    },
    openHubs: {
        en: "Showing available hub categories...",
        hi: "उपलब्ध हब श्रेणियाँ दिखा रहे हैं...",
        mr: "उपलब्ध हब श्रेण्या दाखवत आहे...",
        pa: "ਉਪਲਬਧ ਹੱਬ ਸ਼੍ਰੇਣੀਆਂ ਦਿਖਾ ਰਿਹਾ ਹੈ...",
        kn: "ಲಭ್ಯವಿರುವ ಹಬ್ ವರ್ಗಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ...",
        gu: "ઉપલબ્ધ હબ શ્રેણીઓ બતાવી રહ્યું છે...",
    },
    queueStatus: {
        en: "Checking your booking status. Opening dashboard.",
        hi: "आपकी बुकिंग स्थिति देख रहे हैं। डैशबोर्ड खोल रहे हैं।",
        mr: "तुमची बुकिंग स्थिती तपासत आहे. डॅशबोर्ड उघडत आहे.",
        pa: "ਤੁਹਾਡੀ ਬੁਕਿੰਗ ਸਥਿਤੀ ਦੀ ਜਾਂਚ ਕਰ ਰਿਹਾ ਹੈ। ਡੈਸ਼ਬੋਰਡ ਖੋਲ੍ਹ ਰਿਹਾ ਹੈ।",
        kn: "ನಿಮ್ಮ ಬುಕಿಂಗ್ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ. ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ.",
        gu: "તમારી બુકિંગ સ્થિતિ તપાસી રહ્યું છે. ડેશબોર્ડ ખોલી રહ્યું છે.",
    },
    lookingUp: {
        en: "Looking up {cat} factories for you 🔍",
        hi: "{cat} कारखाने खोज रहे हैं 🔍",
        mr: "{cat} कारखाने शोधत आहे 🔍",
        pa: "ਤੁਹਾਡੇ ਲਈ {cat} ਫੈਕਟਰੀਆਂ ਦੀ ਭਾਲ ਕਰ ਰਿਹਾ ਹੈ 🔍",
        kn: "ನಿಮಗಾಗಿ {cat} ಕಾರ್ಖಾನೆಗಳನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ 🔍",
        gu: "તમારા માટે {cat} ફેક્ટરીઓ શોધી રહ્યાં છીએ 🔍",
    },
    foundFactories: {
        en: "Found {n} {cat}(s):\n{list}{qty}\n\nWhich factory do you want to book?",
        hi: "{n} {cat} मिले:\n{list}{qty}\n\nआप किस कारखाने में बुक करना चाहते हैं?",
        mr: "{n} {cat} सापडले:\n{list}{qty}\n\nतुम्हाला कोणत्या कारखान्यात बुक करायचे आहे?",
        pa: "{n} {cat} ਮਿਲੀਆਂ:\n{list}{qty}\n\nਤੁਸੀਂ ਕਿਸ ਫੈਕਟਰੀ ਵਿੱਚ ਬੁੱਕ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?",
        kn: "{n} {cat} ಕಂಡುಬಂದಿದೆ:\n{list}{qty}\n\nನೀವು ಯಾವ ಕಾರ್ಖಾನೆಯನ್ನು ಬುಕ್ ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?",
        gu: "{n} {cat} મળી:\n{list}{qty}\n\nતમે કઈ ફેક્ટરી બુક કરવા માંગો છો?",
    },
    noFactories: {
        en: "No factories found for {cat}. Opening hub categories.",
        hi: "{cat} के लिए कोई कारखाना नहीं मिला।",
        mr: "{cat} साठी कोणताही कारखाना सापडला नाही.",
        pa: "{cat} ਲਈ ਕੋਈ ਫੈਕਟਰੀ ਨਹੀਂ ਮਿਲੀ।",
        kn: "{cat} ಗಾಗಿ ಯಾವುದೇ ಕಾರ್ಖಾನೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
        gu: "{cat} માટે કોઈ ફેક્ટરી મળી નથી.",
    },
    greatChoice: {
        en: "Great choice 🌾 — {f}\n\nHow many tons of crop are you bringing?",
        hi: "बढ़िया चुनाव 🌾 — {f}\n\nआप कितने टन फसल ला रहे हैं?",
        mr: "छान निवड 🌾 — {f}\n\nतुम्ही किती टन पीक आणत आहात?",
        pa: "ਵਧੀਆ ਚੋਣ 🌾 — {f}\n\nਤੁਸੀਂ ਕਿੰਨੇ ਟਨ ਫਸਲ ਲਿਆ ਰਹੇ ਹੋ?",
        kn: "ಉತ್ತಮ ಆಯ್ಕೆ 🌾 — {f}\n\nನೀವು ಎಷ್ಟು ಟನ್ ಬೆಳೆಯನ್ನು ತರುತ್ತಿದ್ದೀರಿ?",
        gu: "ઉત્તમ પસંદગી 🌾 — {f}\n\nતમે કેટલા ટન પાક લાવી રહ્યા છો?",
    },
    greatChoiceQty: {
        en: "Great choice 🌾 — {f}\nQuantity: {q} tons\n\nWhat arrival time do you prefer?\n(e.g. \"2 PM\", \"Morning\")",
        hi: "बढ़िया 🌾 — {f}\nमात्रा: {q} टन\n\nआप किस समय पहुँचना चाहते हैं?\n(जैसे: \"2 PM\", \"सुबह\")",
        mr: "छान 🌾 — {f}\nप्रमाण: {q} टन\n\nतुम्हाला कोणती वेळ आवडेल?\n(उदा: \"2 PM\", \"सकाळ\")",
        pa: "ਵਧੀਆ 🌾 — {f}\nਮਾਤਰਾ: {q} ਟਨ\n\nਤੁਸੀਂ ਕਿਸ ਸਮੇਂ ਪਹੁੰਚਣਾ ਚਾਹੁੰਦੇ ਹੋ?",
        kn: "ಉತ್ತಮ ಆಯ್ಕೆ 🌾 — {f}\nಪ್ರಮಾಣ: {q} ಟನ್\n\nನೀವು ಯಾವ ಸಮಯಕ್ಕೆ ಬರಲು ಬಯಸುತ್ತೀರಿ?",
        gu: "ઉત્તમ પસંદગી 🌾 — {f}\nજથ્થો: {q} ટન\n\nતમે કયા સમયે પહોંચવા માંગો છો?",
    },
    notFoundFactory: {
        en: "I didn't find that factory.\n\nAvailable:\n{list}\n\nPlease say the factory name.",
        hi: "वह कारखाना नहीं मिला।\n\nउपलब्ध:\n{list}\n\nकृपया कारखाने का नाम बोलें।",
        mr: "तो कारखाना सापडला नाही.\n\nउपलब्ध:\n{list}\n\nकृपया कारखान्याचे नाव सांगा.",
        pa: "ਮੈਨੂੰ ਉਹ ਫੈਕਟਰੀ ਨਹੀਂ ਮਿਲੀ।",
        kn: "ಆ ಕಾರ್ಖಾನೆ ಕಂಡುಬಂದಿಲ್ಲ.",
        gu: "મને તે ફેક્ટરી મળી નથી.",
    },
    gotQty: {
        en: "Got it — {q} tons.\n\nWhat arrival time do you prefer?\n(e.g. \"10 AM\", \"2 PM\", \"Morning\")",
        hi: "समझ गया — {q} टन।\n\nआप किस समय आना चाहेंगे?\n(जैसे: \"10 AM\", \"2 PM\", \"सुबह\")",
        mr: "समजले — {q} टन.\n\nतुम्हाला कोणती वेळ आवडेल?\n(उदा: \"10 AM\", \"2 PM\", \"सकाळ\")",
        pa: "ਸਮਝ ਗਿਆ — {q} ਟਨ।",
        kn: "ಸರಿ — {q} ಟನ್.",
        gu: "સમજાઈ ગયું — {q} ટન.",
    },
    askQty: {
        en: "Please enter quantity.\nExamples: \"5 tons\", \"10\", \"20 tons\"",
        hi: "कृपया मात्रा बताएं।\nउदाहरण: \"5 टन\", \"10\", \"20 टन\"",
        mr: "कृपया प्रमाण सांगा.\nउदा: \"5 टन\", \"10\", \"20 टन\"",
        pa: "ਕਿਰਪਾ ਕਰਕੇ ਮਾਤਰਾ ਦੱਸੋ।",
        kn: "ದಯವಿಟ್ಟು ಪ್ರಮಾಣವನ್ನು ನಮೂದಿಸಿ.",
        gu: "કૃપા કરીને જથ્થો દાખલ કરો.",
    },
    askTime: {
        en: "Please tell me arrival time.\n\"10 AM\", \"2 PM\", \"Morning\", \"Afternoon\"",
        hi: "कृपया समय बताएं।\n\"10 AM\", \"2 PM\", \"सुबह\", \"दोपहर\"",
        mr: "कृपया वेळ सांगा.\n\"10 AM\", \"2 PM\", \"सकाळ\", \"दुपार\"",
        pa: "ਕਿਰਪਾ ਕਰਕੇ ਸਮਾਂ ਦੱਸੋ।",
        kn: "ದಯವಿಟ್ಟು ಸಮಯವನ್ನು ತಿಳಿಸಿ.",
        gu: "કૃપા કરીને સમય જણાવો.",
    },
    bookingWait: {
        en: "Booking your slot... ⏳",
        hi: "आपका स्लॉट बुक हो रहा है... ⏳",
        mr: "तुमचा स्लॉट बुक होत आहे... ⏳",
        pa: "ਤੁਹਾਡਾ ਸਲਾਟ ਬੁੱਕ ਹੋ ਰਿਹਾ ਹੈ... ⏳",
        kn: "ನಿಮ್ಮ ಸ್ಲಾಟ್ ಬುಕ್ ಆಗುತ್ತಿದೆ... ⏳",
        gu: "તમારો સ્લોટ બુક થઈ રહ્યો છે... ⏳",
    },
    bookingOk: {
        en: "✅ Booking confirmed at {f}! 🌾\n\nCrop: {crop}\nQuantity: {q} tons\nArrival: {time}\nSlots:\n{slots}\nToken: #{token}\nEst. Wait: {wait}",
        hi: "✅ {f} पर बुकिंग पक्की! 🌾\n\nफसल: {crop}\nमात्रा: {q} टन\nसमय: {time}\nस्लॉट:\n{slots}\nटोकन: #{token}\nअनुमानित प्रतीक्षा: {wait}",
        mr: "✅ {f} येथे बुकिंग पक्की! 🌾\n\nपीक: {crop}\nप्रमाण: {q} टन\nवेळ: {time}\nस्लॉट:\n{slots}\nटोकन: #{token}\nअंदाजित प्रतीक्षा: {wait}",
        pa: "✅ {f} 'ਤੇ ਬੁਕਿੰਗ ਪੱਕੀ! 🌾",
        kn: "✅ {f} ನಲ್ಲಿ ಬುಕಿಂಗ್ ಖಚಿತವಾಗಿದೆ! 🌾",
        gu: "✅ {f} પર બુકિંગ કન્ફર્મ! 🌾",
    },
    noSlots: {
        en: "No slots at {f}. Opening booking page.",
        hi: "{f} पर स्लॉट उपलब्ध नहीं। बुकिंग पेज खोल रहे हैं।",
        mr: "{f} येथे स्लॉट उपलब्ध नाही. बुकिंग पेज उघडत आहे.",
        pa: "{f} 'ਤੇ ਸਲਾਟ ਉਪਲਬਧ ਨਹੀਂ ਹਨ।",
        kn: "{f} ನಲ್ಲಿ ಯಾವುದೇ ಸ್ಲಾಟ್‌ಗಳಿಲ್ಲ.",
        gu: "{f} પર કોઈ સ્લોટ નથી.",
    },
    noCapacity: {
        en: "Not enough capacity at {f}. Opening booking page.",
        hi: "{f} पर पर्याप्त क्षमता नहीं।",
        mr: "{f} येथे पुरेशी क्षमता नाही.",
        pa: "{f} 'ਤੇ ਲੋੜੀਂਦੀ ਸਮਰੱਥਾ ਨਹੀਂ ਹੈ।",
        kn: "{f} ನಲ್ಲಿ ಸಾಕಷ್ಟು ಸಾಮರ್ಥ್ಯವಿಲ್ಲ.",
        gu: "{f} પર પૂરતી ક્ષમતા નથી.",
    },
    loginFirst: {
        en: "Please login first to book.",
        hi: "बुक करने के लिए पहले लॉगिन करें।",
        mr: "बुक करण्यासाठी कृपया प्रथम लॉगिन करा.",
        pa: "ਬੁੱਕ ਕਰਨ ਲਈ ਪਹਿਲਾਂ ਲੌਗਇਨ ਕਰੋ।",
        kn: "ಬುಕ್ ಮಾಡಲು ದಯವಿಟ್ಟು ಮೊದಲು ಲಾಗಿನ್ ಮಾಡಿ.",
        gu: "બુક કરવા માટે કૃપા કરીને પહેલા લોગિન કરો.",
    },
    cancelled: {
        en: "Booking cancelled. How can I help?",
        hi: "बुकिंग रद्द। मैं कैसे मदद करूँ?",
        mr: "बुकिंग रद्द. मी कशी मदत करू?",
        pa: "ਬੁਕਿੰਗ ਰੱਦ।",
        kn: "ಬುಕಿಂಗ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ.",
        gu: "બુકિંગ રદ.",
    },
    fallback: {
        en: "Try:\n• \"Book a slot\"\n• \"Sell sugarcane 10 tons\"",
        hi: "बोलिए:\n• \"स्लॉट बुक करो\"\n• \"गन्ना 10 टन बेचना है\"",
        mr: "बोला:\n• \"स्लॉट बुक करा\"\n• \"ऊस 10 टन विकायचा आहे\"",
        pa: "ਕੋਸ਼ਿਸ਼ ਕਰੋ: \"ਸਲਾਟ ਬੁੱਕ ਕਰੋ\"",
        kn: "ಪ್ರಯತ್ನಿಸಿ: \"ಸ್ಲಾಟ್ ಬುಕ್ ಮಾಡಿ\"",
        gu: "પ્રયત્ન કરો: \"સ્લોટ બુક કરો\"",
    },
    bookingErr: {
        en: "Error booking. Opening booking page.",
        hi: "बुकिंग में त्रुटि।",
        mr: "बुकिंग त्रुटी.",
        pa: "ਬੁਕਿੰਗ ਵਿੱਚ ਗਲਤੀ।",
        kn: "ಬುಕಿಂಗ್ ದೋಷ.",
        gu: "બુકિંગ ભૂલ.",
    },
};

function say(key: string, lang: Lang, vars?: Record<string, string | number>): string {
    let s = R[key]?.[lang] || R[key]?.["en"] || key;
    if (vars) {
        for (const [k, v] of Object.entries(vars)) {
            s = s.split(`{${k}}`).join(String(v));
        }
    }
    return s;
}

// ═════════════════════════════════════════════════════════════════════════════
// BOOKING FLOW STATE — persisted in sessionStorage
// ═════════════════════════════════════════════════════════════════════════════

type Step = "idle" | "awaiting_factory" | "awaiting_quantity" | "awaiting_time";

interface Flow {
    step: Step;
    label: string;
    cat: string;
    slug: string;
    qty: string;
    fName: string;
    fId: number | null;
    time: string;
    factories: Array<{ id: number; name: string }>;
}

const SK_FLOW = "kb_flow";
const SK_MSGS = "kb_msgs";

const emptyFlow = (): Flow => ({
    step: "idle", label: "", cat: "", slug: "",
    qty: "", fName: "", fId: null, time: "", factories: [],
});

function loadSS<T>(key: string, fb: T): T {
    try { const s = sessionStorage.getItem(key); return s ? JSON.parse(s) : fb; }
    catch { return fb; }
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export default function FarmerChatbot() {
    const { i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Use i18n.language to drive the chatbot language
    const currentLang = i18n.language as Lang;
    const uiLang = voiceLang(currentLang);
    const uiLangRef = useRef(uiLang);

    const [flow, _setFlow] = useState<Flow>(() => loadSS(SK_FLOW, emptyFlow()));
    const [messages, setMessages] = useState<Array<{ text: string; sender: string }>>(
        () => loadSS(SK_MSGS, [{ text: say("welcome", currentLang), sender: "bot" }])
    );

    const flowRef = useRef(flow);
    const navigate = useNavigate();
    const bottomRef = useRef<HTMLDivElement | null>(null);

    // Sync messages if language changes while idle
    useEffect(() => {
        if (flow.step === "idle" && messages.length === 1 && messages[0].sender === "bot") {
            setMessages([{ text: say("welcome", currentLang), sender: "bot" }]);
        }
    }, [currentLang, flow.step]);

    useEffect(() => { flowRef.current = flow; }, [flow]);
    useEffect(() => { uiLangRef.current = uiLang; }, [uiLang]);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
    useEffect(() => { sessionStorage.setItem(SK_MSGS, JSON.stringify(messages)); }, [messages]);

    // ── Flow helpers ──────────────────────────────────────────────────

    const setFlow = useCallback((next: Flow) => {
        flowRef.current = next;
        _setFlow(next);
        sessionStorage.setItem(SK_FLOW, JSON.stringify(next));
    }, []);

    const resetFlow = useCallback(() => {
        const e = emptyFlow();
        flowRef.current = e;
        _setFlow(e);
        sessionStorage.removeItem(SK_FLOW);
    }, []);

    // ── Output ────────────────────────────────────────────────────────

    const speak = useCallback((text: string) => {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = uiLangRef.current;
        window.speechSynthesis.speak(u);
    }, []);

    const bot = useCallback((text: string) => {
        setMessages(prev => [...prev, { text, sender: "bot" }]);
        speak(text);
    }, [speak]);

    // ── API ─────────────────────────────────────────────────────────

    const fetchFactories = async (catName: string) => {
        try {
            const r = await fetch(`/api/hubs?category=${encodeURIComponent(catName)}`);
            const d: any[] = await r.json();
            return d.map(h => ({ id: Number(h.id), name: String(h.name) }));
        } catch { return []; }
    };

    // ── Factory alias dictionary (Hindi / Marathi names) ────────────
    // Static aliases for known factories
    const FACTORY_ALIASES: Record<string, string[]> = {
        "apaa mill":              ["आप्पा मिल", "आप्पा साखर कारखाना", "appa mill", "appa sugar"],
        "baburao sugar mill":     ["बाबुराव साखर कारखाना", "बाबुराव मिल", "बाबुराव शुगर मिल", "baburao mill"],
        "subhash sugar mill":     ["सुभाष साखर कारखाना", "सुभाष मिल", "сुभाष शुगर मिल", "subhash mill"],
        "shree sugar mill":       ["श्री साखर कारखाना", "श्री मिल", "श्री शुगर मिल", "shree mill", "shri mill"],
        "sahyadri sugar mill":    ["सह्याद्री साखर कारखाना", "सह्याद्री मिल", "sahyadri mill"],
        "global dairy plant":     ["ग्लोबल डेअरी प्लांट", "ग्लोबल डेअरी", "ग्लोबल दुग्ध", "global dairy"],
        "national cold storage":  ["नॅशनल कोल्ड स्टोरेज", "नॅशनल शीतगृह", "राष्ट्रीय शीतगृह", "national cold"],
    };

    // Common Hindi/Marathi word → English word map for dynamic matching
    const WORD_TRANSLATE: Record<string, string> = {
        "मिल": "mill", "कारखाना": "mill", "कारखान्यात": "mill",
        "साखर": "sugar", "शुगर": "sugar", "गन्ना": "sugar",
        "ऊस": "sugar", "डेअरी": "dairy", "दुग्ध": "dairy",
        "दूध": "dairy", "प्लांट": "plant", "शीतगृह": "cold storage",
    };

    const matchFactory = (msg: string, list: Array<{ id: number; name: string }>) => {
        const lower = msg.toLowerCase();

        // 1. Check static alias dictionary
        for (const f of list) {
            const key = f.name.toLowerCase();
            const aliases = FACTORY_ALIASES[key];
            if (aliases && aliases.some(a => lower.includes(a))) return f;
        }

        // 2. Exact English name match
        for (const f of list) {
            if (lower.includes(f.name.toLowerCase())) return f;
        }

        // 3. Translate Hindi/Marathi words in msg to English, then match
        let translated = lower;
        for (const [hindiWord, engWord] of Object.entries(WORD_TRANSLATE)) {
            translated = translated.split(hindiWord).join(engWord);
        }
        for (const f of list) {
            const fWords = f.name.toLowerCase().split(/\s+/);
            // Check if the translated message contains key words from the factory name
            if (fWords.filter(w => w.length > 2).every(w => translated.includes(w))) return f;
        }

        // 4. English word-level fuzzy match (any word > 3 chars)
        for (const f of list) {
            const words = f.name.toLowerCase().split(/\s+/);
            if (words.some(w => w.length > 3 && lower.includes(w))) return f;
        }

        // 5. Transliterated name match — check if Devanagari tokens from msg
        //    phonetically match any English factory name words
        const devanagariWords = lower.match(/[\u0900-\u097F]+/g) || [];
        if (devanagariWords.length > 0) {
            for (const f of list) {
                const fNameLower = f.name.toLowerCase();
                // Check each Devanagari word against alias keys
                for (const [aliasKey, aliasList] of Object.entries(FACTORY_ALIASES)) {
                    if (fNameLower.includes(aliasKey) || aliasKey.includes(fNameLower)) {
                        if (aliasList.some(a => devanagariWords.some(dw => a.includes(dw)))) return f;
                    }
                }
            }
        }

        return null;
    };

    // ── Booking ────────────────────────────────────────────────────

    const doBooking = async (f: Flow, L: Lang) => {
        const userStr = localStorage.getItem("user");
        if (!userStr) { bot(say("loginFirst", L)); resetFlow(); return; }
        const user = JSON.parse(userStr);

        bot(say("bookingWait", L));

        try {
            const qty = parseFloat(f.qty) || 10;
            const slotsRes = await fetch(`/api/slots/${f.fId}`);
            const slots: any[] = await slotsRes.json().catch(() => []);

            if (!slots.length) {
                bot(say("noSlots", L, { f: f.fName }));
                navigate(`/farmer/hub-booking/${f.fId}`);
                resetFlow(); return;
            }

            const preferred = slots.find(s =>
                s.slot_time?.toLowerCase().includes(f.time.toLowerCase()) &&
                (s.capacity - s.total_booked_load) > 0
            ) || slots.find(s => (s.capacity - s.total_booked_load) > 0);

            if (!preferred) {
                bot(say("noCapacity", L, { f: f.fName }));
                navigate(`/farmer/hub-booking/${f.fId}?quantity=${qty}`);
                resetFlow(); return;
            }

            const startIdx = slots.findIndex(s => s.id === preferred.id);
            let remaining = qty;
            const allocs: Array<{ slot_id: number; slot_time: string; allocated_load: number }> = [];

            for (let i = startIdx; i < slots.length && remaining > 0; i++) {
                const s = slots[i];
                const avail = Math.max(0, s.capacity - s.total_booked_load);
                if (avail > 0) {
                    const load = Math.min(remaining, avail);
                    allocs.push({ slot_id: s.id, slot_time: s.slot_time, allocated_load: load });
                    remaining -= load;
                }
            }

            if (remaining > 0) {
                bot(say("noCapacity", L, { f: f.fName }));
                navigate(`/farmer/hub-booking/${f.fId}?quantity=${qty}`);
                resetFlow(); return;
            }

            const res = await fetch("/api/book-slot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    farmer_id: user.id, hub_id: f.fId,
                    vehicle_number: user.vehicle_no || "XX-00-XX-0000",
                    total_load: qty, slots: allocs,
                }),
            });

            if (!res.ok) {
                const e = await res.json().catch(() => ({}));
                bot(`❌ ${(e as any).error || "Booking failed."}`);
            } else {
                const r = await res.json();
                const sl = (r.allocated_slots || allocs)
                    .map((s: any) => `  • ${s.slot_time}: ${s.load ?? s.allocated_load} tons`)
                    .join("\n");
                bot(say("bookingOk", L, {
                    f: f.fName, crop: f.label, q: String(qty), time: f.time,
                    slots: sl, token: String(r.token_number), wait: String(r.estimated_wait_time),
                }));
            }
        } catch {
            bot(say("bookingErr", L));
            navigate(`/farmer/hub-booking/${f.fId}`);
        }
        resetFlow();
    };

    // ═════════════════════════════════════════════════════════════════
    // MAIN MESSAGE HANDLER
    // ═════════════════════════════════════════════════════════════════

    const handleMessage = async (rawText: string): Promise<boolean> => {
        const msg = rawText.toLowerCase().trim();
        const cur = flowRef.current;
        const L = currentLang;

        // ── AWAITING FACTORY ──────────────────────────────────────
        if (cur.step === "awaiting_factory") {
            const match = matchFactory(msg, cur.factories);
            if (match) {
                if (cur.qty) {
                    setFlow({ ...cur, step: "awaiting_time", fName: match.name, fId: match.id });
                    bot(say("greatChoiceQty", L, { f: match.name, q: cur.qty }));
                } else {
                    setFlow({ ...cur, step: "awaiting_quantity", fName: match.name, fId: match.id });
                    bot(say("greatChoice", L, { f: match.name }));
                }
                return true;
            }
            const names = cur.factories.map(f => `  • ${f.name}`).join("\n");
            bot(say("notFoundFactory", L, { list: names }));
            return true;
        }

        // ── AWAITING QUANTITY ─────────────────────────────────────
        if (cur.step === "awaiting_quantity") {
            const q = detectQty(msg);
            if (q) {
                setFlow({ ...cur, step: "awaiting_time", qty: q });
                bot(say("gotQty", L, { q }));
                return true;
            }
            bot(say("askQty", L));
            return true;
        }

        // ── AWAITING TIME ─────────────────────────────────────────
        if (cur.step === "awaiting_time") {
            const tm = detectTime(msg);
            if (tm) {
                const final = { ...cur, time: tm };
                setFlow({ ...final, step: "idle" });
                await doBooking(final, L);
                return true;
            }
            bot(say("askTime", L));
            return true;
        }

        // ── IDLE ──────────────────────────────────────────────────

        // Cancel
        if (matchesCmd(msg, CMD.cancel)) {
            resetFlow();
            bot(say("cancelled", L));
            return true;
        }

        // Dashboard
        if (matchesCmd(msg, CMD.dashboard)) {
            bot(say("openDash", L));
            setTimeout(() => navigate("/farmer/dashboard"), 700);
            return true;
        }

        // Crop detection (+ optional qty)
        const crop = detectCrop(msg);
        const qty = detectQty(msg);

        if (crop) {
            bot(say("lookingUp", L, { cat: crop.cat }));
            const factories = await fetchFactories(crop.cat);
            const newFlow: Flow = {
                step: "awaiting_factory",
                label: crop.label, cat: crop.cat, slug: crop.slug,
                qty: qty || "", fName: "", fId: null, time: "", factories,
            };
            setFlow(newFlow);

            if (factories.length > 0) {
                const names = factories.map(f => `  • ${f.name}`).join("\n");
                const qtyText = qty ? `\n${L === "hi" ? "मात्रा" : L === "mr" ? "प्रमाण" : "Quantity"}: ${qty} ${L === "en" ? "tons" : "टन"}` : "";
                bot(say("foundFactories", L, { n: String(factories.length), cat: crop.cat, list: names, qty: qtyText }));
            } else {
                bot(say("noFactories", L, { cat: crop.cat }));
                setTimeout(() => navigate("/hub-categories"), 700);
                resetFlow();
            }

            const url = qty
                ? `/hub-categories?category=${crop.slug}&quantity=${qty}`
                : `/hub-categories?category=${crop.slug}`;
            navigate(url);
            return true;
        }

        // Queue / status
        if (matchesCmd(msg, CMD.queue)) {
            bot(say("queueStatus", L));
            setTimeout(() => navigate("/farmer/dashboard"), 700);
            return true;
        }

        // Book slot / sell crops (generic intent)
        if (matchesCmd(msg, CMD.bookSlot)) {
            bot(say("chooseCat", L));
            setTimeout(() => navigate("/hub-categories"), 700);
            return true;
        }

        // Hubs / nearby
        if (matchesCmd(msg, CMD.hubs)) {
            bot(say("openHubs", L));
            setTimeout(() => navigate("/hub-categories"), 700);
            return true;
        }

        return false;
    };

    // ── Send / Voice ──────────────────────────────────────────────

    const sendMessage = async () => {
        if (!input.trim()) return;
        const text = input.trim();
        setMessages(prev => [...prev, { text, sender: "user" }]);
        setInput("");

        const handled = await handleMessage(text);
        if (!handled) {
            setLoading(true);
            const L = currentLang;
            try {
                const r = await fetch("http://localhost:5000/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: text.toLowerCase() }),
                });
                const d = await r.json();
                bot(d.reply);
            } catch {
                bot(say("fallback", L));
            }
            setLoading(false);
        }
    };

    const startVoice = () => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) { alert("Speech recognition not supported"); return; }
        const r = new SR();
        r.lang = uiLang;
        r.interimResults = false;
        r.continuous = false;
        r.start();
        r.onresult = async (e: any) => {
            const speech = e.results[0][0].transcript.trim();
            setMessages(prev => [...prev, { text: speech, sender: "user" }]);
            await handleMessage(speech);
        };
        r.onerror = (e: any) => console.error("Voice error:", e.error);
    };

    // ── Render ────────────────────────────────────────────────────
    
    const curLang = currentLang;

    const stepHint =
        flow.step === "awaiting_factory"
            ? (curLang === "hi" ? `📍 कारखाना चुनें (${flow.cat})` :
               curLang === "mr" ? `📍 कारखाना निवडा (${flow.cat})` :
               `📍 Select factory (${flow.cat})`)
        : flow.step === "awaiting_quantity"
            ? (curLang === "hi" ? `📍 मात्रा बताएं — ${flow.fName}` :
               curLang === "mr" ? `📍 प्रमाण सांगा — ${flow.fName}` :
               `📍 Enter quantity — ${flow.fName}`)
        : flow.step === "awaiting_time"
            ? (curLang === "hi" ? `📍 समय चुनें — ${flow.fName}` :
               curLang === "mr" ? `📍 वेळ निवडा — ${flow.fName}` :
               `📍 Choose time — ${flow.fName}`)
        : null;

    const ph =
        flow.step === "awaiting_factory"
            ? (curLang === "hi" ? "कारखाने का नाम बोलें..." : curLang === "mr" ? "कारखान्याचे नाव सांगा..." : "Say factory name...")
        : flow.step === "awaiting_quantity"
            ? (curLang === "hi" ? "जैसे: 10 टन" : curLang === "mr" ? "उदा: 10 टन" : "e.g. 10 tons")
        : flow.step === "awaiting_time"
            ? (curLang === "hi" ? "जैसे: 2 PM, सुबह" : curLang === "mr" ? "उदा: 2 PM, सकाळ" : "e.g. 2 PM, Morning")
        : (curLang === "hi" ? "जैसे: गन्ना 10 टन बेचना है" :
           curLang === "mr" ? "उदा: ऊस 10 टन विकायचा" :
           "e.g. sell sugarcane 10 tons");

    return (
        <>
            <div className="chatbot-icon" onClick={() => setOpen(o => !o)}>🌾</div>

            {open && (
                <div className="chatbot-window">
                    <div className="chat-header">
                        Kisan Saarthi AI
                        {flow.step !== "idle" && (
                            <span
                                style={{ float: "right", fontSize: "11px", cursor: "pointer", opacity: 0.8 }}
                                onClick={() => { resetFlow(); bot(say("cancelled", curLang)); }}
                                title="Cancel"
                            >✕</span>
                        )}
                    </div>

                    {stepHint && (
                        <div style={{ background: "#e8f5e9", padding: "6px 12px", fontSize: "11px", color: "#2e7d32", fontWeight: "bold" }}>
                            {stepHint}
                        </div>
                    )}

                    <div className="language-container">
                        <span className="language-select-info">
                            {curLang === "hi" ? "भाषा:" : curLang === "mr" ? "भाषा:" : "Language:"} {i18n.language.toUpperCase()}
                        </span>
                    </div>

                    <div className="chat-body">
                        {messages.map((m, i) => (
                            <div key={i} className={`message ${m.sender}`}>{m.text}</div>
                        ))}
                        {loading && <div className="typing">
                            {curLang === "hi" ? "AI टाइप कर रहा है..." :
                             curLang === "mr" ? "AI टाइप करत आहे..." :
                             "AI is typing..."}
                        </div>}
                        <div ref={bottomRef} />
                    </div>

                    <div className="chat-input">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={ph}
                            onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
                        />
                        <button onClick={startVoice}>🎤</button>
                        <button onClick={sendMessage}>
                            {curLang === "hi" ? "भेजें" : curLang === "mr" ? "पाठवा" : "Send"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}