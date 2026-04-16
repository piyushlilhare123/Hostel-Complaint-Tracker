import express from 'express';
const router = express.Router();

// Keyword-to-category map
const HOSTEL_TOPICS = {
    electricity: ['electricity', 'power', 'light', 'fan', 'switch', 'socket', 'bulb', 'current', 'electric', 'outlet', 'trip', 'tripped'],
    water: ['water', 'tap', 'pipe', 'leakage', 'plumber', 'supply', 'tank', 'drainage', 'drain', 'leak', 'flood'],
    wifi: ['wifi', 'wi-fi', 'internet', 'network', 'connection', 'router', 'bandwidth', 'slow', 'online', 'signal'],
    mess: ['mess', 'food', 'meal', 'breakfast', 'lunch', 'dinner', 'canteen', 'cook', 'menu', 'eating', 'quality', 'kitchen'],
    cleanliness: ['clean', 'cleaning', 'dirty', 'hygiene', 'dust', 'sweep', 'mop', 'garbage', 'trash', 'waste', 'sanitation', 'toilet', 'bathroom'],
    roommate: ['roommate', 'room mate', 'roomies', 'noise', 'conflict', 'dispute', 'disturbance', 'bully', 'harassment'],
};

const RESPONSES = {
    electricity: {
        steps: [
            "Check if the main switch/MCB in your room has tripped and reset it.",
            "Test other sockets in the room to isolate the faulty one.",
            "Ensure the appliance itself is not faulty by testing it elsewhere.",
            "Check if neighbouring rooms have power — if not, it may be a floor-level issue.",
            "If the issue persists, raise a complaint through the portal immediately."
        ],
        category: 'Maintenance',
        tip: "Do not attempt to fix wiring yourself — always report to hostel electrician."
    },
    water: {
        steps: [
            "Check the scheduled water supply timings posted on the hostel notice board.",
            "Check if the overhead tank in your wing is full.",
            "Verify if other rooms on your floor are also affected.",
            "For a leakage, turn off the nearest valve and place a bucket.",
            "Report the issue to the hostel warden or raise a complaint."
        ],
        category: 'Maintenance',
        tip: "Water supply issues are often temporary — check the schedule before raising a complaint."
    },
    wifi: {
        steps: [
            "Disconnect and reconnect to the hostel WiFi network.",
            "Restart your device's WiFi adapter (turn off, wait 10 sec, turn on).",
            "Check if your hostel login/credentials portal session has expired.",
            "Move closer to the nearest access point if signal is weak.",
            "If the issue persists for more than an hour, raise a complaint under IT Support."
        ],
        category: 'IT Support',
        tip: "Try forgetting the network and reconnecting — this fixes most auth issues."
    },
    mess: {
        steps: [
            "Document the issue (take a photo if possible).",
            "Report it verbally to the mess supervisor first.",
            "If no action is taken, raise a formal complaint through the portal.",
            "You can also contact the student welfare committee for food quality grievances.",
            "Mention specific meal time and date in your complaint for faster resolution."
        ],
        category: 'Mess/Food',
        tip: "Group complaints from multiple students tend to get faster resolution."
    },
    cleanliness: {
        steps: [
            "Identify the specific area (bathroom, corridor, common room, etc.).",
            "Check if it falls under the daily cleaning schedule.",
            "Inform the hostel caretaker or housekeeping staff directly.",
            "If no action within 24 hours, raise a formal complaint.",
            "Attach a photo of the issue in your complaint for evidence."
        ],
        category: 'Maintenance',
        tip: "Cleanliness issues are usually resolved the same day when reported promptly."
    },
    roommate: {
        steps: [
            "Try to resolve minor conflicts through calm, direct communication.",
            "If there is persistent disturbance, document the dates and times.",
            "Contact your floor warden or resident advisor for mediation.",
            "If the issue involves harassment or bullying, report to the hostel management immediately.",
            "Raise a formal complaint if the issue is not resolved within 48 hours."
        ],
        category: 'Other',
        tip: "Most roommate issues can be resolved with warden mediation — don't hesitate to ask."
    }
};

const detectTopic = (message) => {
    const lower = message.toLowerCase();
    for (const [topic, keywords] of Object.entries(HOSTEL_TOPICS)) {
        if (keywords.some(kw => lower.includes(kw))) {
            return topic;
        }
    }
    return null;
};

// POST /api/hostel-chatbot
router.post('/', (req, res) => {
    const { message } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    const topic = detectTopic(message);

    if (!topic) {
        return res.json({
            type: 'invalid',
            message: "I can only help with hostel-related issues. Please ask about electricity, water, WiFi, mess/food, cleanliness, or roommate problems.",
            category: null
        });
    }

    const response = RESPONSES[topic];
    return res.json({
        type: 'valid',
        topic,
        steps: response.steps,
        tip: response.tip,
        category: response.category,
        message: `Here's how to handle your ${topic} issue:`
    });
});

export default router;
