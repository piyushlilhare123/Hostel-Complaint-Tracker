import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, User, Zap, Wifi, Droplets, UtensilsCrossed, Trash2, Users, ChevronRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Smart Response Engine ────────────────────────────────────────────────────

const GREETINGS = ['Hello! ', 'Hi there. ', 'Greetings. ', 'I understand. ', 'Got it. '];
const ACKNOWLEDGMENTS = [
    (q) => `I see you're having an issue with your **${q}**. `,
    (q) => `I can help you with that **${q}** problem. `,
    (q) => `Let's look into your **${q}** request. `,
    (q) => `I've noted your concern about the **${q}**. `,
];

const RULES = [
    // ── ELECTRICITY ──────────────────────────────────────────────────────────
    {
        match: ['fan', 'ceiling fan', 'table fan', 'cooler'],
        topic: 'electricity', category: 'Maintenance',
        reply: (q) => `Since your fan is ${q.includes('noise') ? 'making noise' : q.includes('slow') ? 'running slow' : 'not working'}, try these specific steps:\n\n1. Check if the regulator is set to a high enough speed.\n2. Ensure the main switch in your room hasn't tripped.\n3. Turn the fan off and wait for 5 minutes, then restart.\n4. If it's a capacitor issue (humming but no spin), it needs maintenance.\n5. Raise a complaint if these steps don't resolve it.`,
        tip: "A humming fan that doesn't rotate usually indicates a faulty capacitor."
    },
    {
        match: ['power', 'electricity', 'current', 'outage', 'light gone', 'blackout'],
        topic: 'electricity', category: 'Maintenance',
        reply: () => `For a power outage in your area:\n\n1. Check the MCB in your room's fuse box.\n2. Verify if neighbors also have no power to determine the scale.\n3. Building-level outages are usually fixed by the central substation within 30-45 mins.\n4. If only your room is out, report it as a local fault.\n5. Raise a maintenance complaint for local repairs.`,
        tip: "Floor-wide outages are usually central maintenance issues and don't require individual complaints."
    },
    {
        match: ['socket', 'plug', 'outlet', 'charge', 'switch'],
        topic: 'electricity', category: 'Maintenance',
        reply: () => `Regarding your electrical outlet concern:\n\n1. Test the outlet with a known working device (like a phone charger).\n2. Look for burn marks or a loose fit in the socket.\n3. Make sure the child-safety gate (if present) is fully open.\n4. If there's a burning smell, stop using it immediately.\n5. Raise a maintenance ticket for a socket replacement.`,
        tip: "Burnt or sparking sockets should be reported as High Priority immediately."
    },
    {
        match: ['bulb', 'tube', 'led', 'light'],
        topic: 'electricity', category: 'Maintenance',
        reply: () => `For lighting issues in your room:\n\n1. Ensure the wall switch is in the correct position.\n2. Check if the bulb is loose in the holder (turn off first!).\n3. If the tube light is flickering, the starter or choke may be faulty.\n4. LED bulbs often fail due to voltage fluctuations.\n5. Raise a complaint to get a replacement light/starter.`,
        tip: "Hostel staff usually replace burnt-out bulbs within 24 hours of reporting."
    },

    // ── WATER ────────────────────────────────────────────────────────────────
    {
        match: ['tap', 'faucet', 'leak', 'pipe', 'leakage', 'dripping'],
        topic: 'water', category: 'Maintenance',
        reply: (q) => `For your ${q.includes('leak') ? 'leaking' : 'broken'} tap/pipe:\n\n1. Close the isolation valve under the sink if possible.\n2. Use a bucket to collect dripping water to prevent floor damage.\n3. Check if the handle is just loose or actually broken.\n4. Document the leak with a quick photo.\n5. Raise an urgent maintenance complaint for a plumber.`,
        tip: "Small leaks can become major bursts — report them as soon as you notice them."
    },
    {
        match: ['water', 'supply', 'dry', 'no water'],
        topic: 'water', category: 'Maintenance',
        reply: () => `If you have no water supply:\n\n1. Check the official supply schedule (usually morning/evening slots).\n2. See if the overhead tank for your block is empty.\n3. Ask floor mates if they have supply.\n4. Wait for 15-20 minutes in case of temporary maintenance.\n5. Raise a complaint if supply doesn't return within an hour outside scheduled cuts.`,
        tip: "Water supply is often restricted during off-peak hours to save electricity/water."
    },
    {
        match: ['hot water', 'geyser', 'heater'],
        topic: 'water', category: 'Maintenance',
        reply: () => `Regarding geyser or hot water issues:\n\n1. Most geysers take 15 mins to heat up — please wait after switching on.\n2. Check if the red/green indicators are on.\n3. Ensure the thermostat hasn't tripped due to overheating.\n4. Do not use geysers with exposed wiring.\n5. Raise a maintenance ticket for repairs.`,
        tip: "Switch off geysers after use to prevent overheating and wastage."
    },

    // ── WIFI ─────────────────────────────────────────────────────────────────
    {
        match: ['wifi', 'internet', 'slow', 'connect', 'login', 'network'],
        topic: 'wifi', category: 'IT Support',
        reply: (q) => `For your ${q.includes('slow') ? 'slow' : 'connectivity'} internet issue:\n\n1. Disconnect and 'Forget' the network, then reconnect.\n2. Open your browser and go to 'neverssl.com' to trigger the login portal.\n3. Move closer to the corridor access point if signal is weak.\n4. Ensure your data cap hasn't been exceeded for the day.\n5. If persistent, raise an IT Support complaint.`,
        tip: "Hostel WiFi often uses captive portals — ensure your login session is active."
    },

    // ── MESS ────────────────────────────────────────────────────────────────
    {
        match: ['mess', 'food', 'meal', 'lunch', 'dinner', 'breakfast'],
        topic: 'mess', category: 'Mess/Food',
        reply: (q) => `Regarding your quality/service concern with ${q.includes('food') ? 'the food' : 'the mess'}:\n\n1. Take a clear photo of the issue (if related to quality/hygiene).\n2. Report immediately to the mess supervisor present.\n3. Note down the meal name and date.\n4. Contact the Mess Committee representative.\n5. Raise a formal complaint via this portal for the warden to see.`,
        tip: "Direct feedback to the supervisor on duty is the fastest way to resolve meal issues."
    },

    // ── CLEANLINESS ──────────────────────────────────────────────────────────
    {
        match: ['clean', 'dust', 'wash', 'toilet', 'bathroom', 'garbage'],
        topic: 'cleanliness', category: 'Maintenance',
        reply: () => `For maintenance of cleanliness:\n\n1. Check the weekly cleaning schedule for your floor/room.\n2. Inform the floor caretaker if 24 hours have passed without cleaning.\n3. Empty personal trash in the main corridor bins.\n4. If a common bathroom is unusable, report it as urgent.\n5. Raise a maintenance complaint for cleaning services.`,
        tip: "Keeping common areas tidy helps housekeeping staff work more efficiently."
    },

    // ── ROOMMATE ─────────────────────────────────────────────────────────────
    {
        match: ['roommate', 'noisy', 'roomie', 'fight', 'conflict'],
        topic: 'roommate', category: 'Other',
        reply: () => `For handling roommate or roommate-adjacent issues:\n\n1. Try a calm 1-on-1 conversation about the disturbance first.\n2. Refer to the 'Shared Living' guidelines provided by the hostel.\n3. If noise persists after midnight, inform the night warden.\n4. Use the floor RA (Resident Assistant) for mediation.\n5. If safety is at risk, raise an urgent complaint immediately.`,
        tip: "Most roommate conflicts are resolved through simple mediation by the floor RA."
    },
];

const processMessage = (messageText) => {
    const lower = messageText.toLowerCase();

    for (const rule of RULES) {
        if (rule.match.some(kw => lower.includes(kw))) {
            const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
            const matchObj = rule.match.find(kw => lower.includes(kw));
            const ack = ACKNOWLEDGMENTS[Math.floor(Math.random() * ACKNOWLEDGMENTS.length)](matchObj);

            return {
                type: 'valid',
                topic: rule.topic,
                text: greeting + ack + "\n\n" + rule.reply(lower),
                isMarkdown: true,
                category: rule.category,
                tip: rule.tip,
            };
        }
    }

    // Handle generic greetings
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
        return {
            type: 'invalid',
            text: "Hello! I'm here to help with your hostel issues. Please describe what's wrong (e.g., 'fan is slow', 'no water', 'wifi down').",
            topic: null, steps: null, tip: null, category: null
        };
    }

    return {
        type: 'invalid',
        text: `I'm sorry, I couldn't quite grasp that. I'm specifically trained only for hostel-related queries.\n\nCould you try rephrasing? For example:\n• "My fan stopped working"\n• "There's no water in the tap"\n• "Wifi is very slow"\n• "The mess food is cold"`,
        topic: null, steps: null, tip: null, category: null
    };
};

// ─── Render helpers ───────────────────────────────────────────────────────────

const TOPIC_ICONS = {
    electricity: Zap, water: Droplets, wifi: Wifi,
    mess: UtensilsCrossed, cleanliness: Trash2, roommate: Users,
};

const QUICK_PROMPTS = [
    { label: 'Fan not working', icon: Zap, query: 'My fan is not working' },
    { label: 'Water leakage', icon: Droplets, query: 'There is a water leakage in my room' },
    { label: 'WiFi slow', icon: Wifi, query: 'WiFi is very slow' },
    { label: 'Bad food quality', icon: UtensilsCrossed, query: 'The food quality in mess is very bad' },
    { label: 'Dirty bathroom', icon: Trash2, query: 'The bathroom is not being cleaned' },
    { label: 'Noisy roommate', icon: Users, query: 'My roommate makes too much noise' },
];

const RenderText = ({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <span>
            {parts.map((p, i) =>
                p.startsWith('**') && p.endsWith('**')
                    ? <strong key={i}>{p.slice(2, -2)}</strong>
                    : p
            )}
        </span>
    );
};

const TypingIndicator = () => (
    <div className="flex items-end gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Bot size={14} className="text-white" />
        </div>
        <div className="bg-slate-100 dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-none">
            <div className="flex gap-1.5 items-center h-4">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    </div>
);

const BotMessage = ({ msg, onRaiseComplaint }) => {
    const TopicIcon = msg.topic ? TOPIC_ICONS[msg.topic] : null;

    if (msg.type === 'invalid') {
        return (
            <div className="flex items-end gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-white" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-none p-3 max-w-[88%]">
                    <div className="flex items-start gap-2">
                        <AlertCircle size={15} className="text-orange-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line truncate-none">{msg.text}</p>
                    </div>
                </div>
            </div>
        );
    }

    const lines = msg.text.split('\n').filter(l => l.trim());
    const headerLine = lines[0];
    const stepLines = lines.filter(l => /^\d+\./.test(l.trim()));
    const otherLines = lines.filter(l => !l.trim().startsWith('1.') && l !== lines[0] && !/^\d+\./.test(l.trim()) && l.trim() !== '');

    return (
        <div className="flex items-end gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-white" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-none p-3 max-w-[90%]">
                {msg.topic && (
                    <div className="flex items-center gap-1.5 mb-2">
                        {TopicIcon && <TopicIcon size={12} className="text-indigo-500" />}
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{msg.topic}</span>
                    </div>
                )}
                <p className="text-sm font-semibold text-slate-800 dark:text-white mb-2">
                    <RenderText text={headerLine} />
                </p>
                {stepLines.length > 0 && (
                    <ol className="space-y-1.5 mb-3">
                        {stepLines.map((line, i) => {
                            const content = line.replace(/^\d+\.\s*/, '');
                            return (
                                <li key={i} className="flex gap-2 text-xs text-slate-600 dark:text-slate-300">
                                    <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5">{i + 1}</span>
                                    <span><RenderText text={content} /></span>
                                </li>
                            );
                        })}
                    </ol>
                )}
                {otherLines.map((l, i) => (
                    <div key={i} className="text-xs text-slate-600 dark:text-slate-400 mb-1"><RenderText text={l} /></div>
                ))}
                {msg.tip && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-2.5 py-1.5 mb-2.5">
                        <p className="text-[11px] text-amber-700 dark:text-amber-300">
                            <span className="font-semibold">💡 </span>{msg.tip}
                        </p>
                    </div>
                )}
                <button
                    onClick={() => onRaiseComplaint(msg.category)}
                    className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
                >
                    Raise a Complaint <ChevronRight size={12} />
                </button>
            </div>
        </div>
    );
};

const UserMessage = ({ text }) => (
    <div className="flex items-end justify-end gap-2 mb-3">
        <div className="bg-indigo-600 text-white rounded-2xl rounded-br-none px-3 py-2 max-w-[80%]">
            <p className="text-sm">{text}</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-slate-600 dark:text-slate-300" />
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatBot() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isOpen, setIsOpen] = useState(false);
    const [showIntro, setShowIntro] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([{
        id: 1, role: 'bot', type: 'welcome',
        text: "Hi! I'm your Hostel Assistant 🏠\n\nDescribe your issue and I'll give you specific help right away.\n\nOr tap a quick option below:",
    }]);
    const [isTyping, setIsTyping] = useState(false);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        // Only trigger for logged-in students ONLY on the Dashboard page
        if (user && user.role === 'Student' && location.pathname === '/dashboard') {
            const introShown = sessionStorage.getItem('hms_chatbot_intro_shown');
            if (!introShown) {
                const timer = setTimeout(() => setShowIntro(true), 1500);
                return () => clearTimeout(timer);
            }
        }
    }, [user, location.pathname]);

    useEffect(() => {
        if (isOpen) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, messages, isTyping]);

    // Only show for students
    if (!user || user.role !== 'Student') return null;

    const handleAcceptIntro = () => {
        setShowIntro(false);
        setIsOpen(true);
        sessionStorage.setItem('hms_chatbot_intro_shown', 'true');
    };

    const handleDismissIntro = () => {
        setShowIntro(false);
        sessionStorage.setItem('hms_chatbot_intro_shown', 'true');
    };

    const sendMessage = async (text) => {
        const messageText = (text || input).trim();
        if (!messageText) return;

        setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: messageText }]);
        setInput('');
        setIsTyping(true);

        // Simulate brief delay
        await new Promise(r => setTimeout(r, 500));

        const result = processMessage(messageText);
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', ...result }]);
        setIsTyping(false);
    };

    const handleRaiseComplaint = (category) => {
        setIsOpen(false);
        navigate('/complaints/new', { state: { prefillCategory: category } });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { 
            e.preventDefault(); 
            sendMessage(); 
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(o => !o)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
                    isOpen ? 'bg-slate-700 dark:bg-slate-600 rotate-90 scale-95' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-110'
                }`}
                title="Hostel Assistant"
            >
                {isOpen ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
                {!isOpen && messages.length <= 1 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] h-[520px] max-h-[calc(100vh-120px)] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">

                    {/* Header */}
                    <div className="bg-indigo-600 px-4 py-3 flex items-center gap-3 flex-shrink-0">
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                            <Bot size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-semibold text-sm">Hostel Assistant</p>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-green-400 rounded-full" />
                                <p className="text-indigo-200 text-xs">Online · Answers your specific issue</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white transition">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 scroll-smooth scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-indigo-900">
                        {messages.map(msg => (
                            msg.role === 'user'
                                ? <UserMessage key={msg.id} text={msg.text} />
                                : msg.type === 'welcome'
                                    ? (
                                        <div key={msg.id} className="flex items-end gap-2 mb-4">
                                            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                                <Bot size={14} className="text-white" />
                                            </div>
                                            <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-none p-3 max-w-[88%]">
                                                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line mb-3">{msg.text}</p>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    {QUICK_PROMPTS.map(qp => {
                                                        const QIcon = qp.icon;
                                                        return (
                                                            <button 
                                                                key={qp.label} 
                                                                onClick={() => sendMessage(qp.query)}
                                                                className="flex items-center gap-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-2 py-1.5 rounded-lg hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition text-left shadow-sm active:scale-95"
                                                            >
                                                                <QIcon size={11} className="flex-shrink-0" />
                                                                <span className="truncate">{qp.label}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                    : <BotMessage key={msg.id} msg={msg} onRaiseComplaint={handleRaiseComplaint} />
                        ))}
                        {isTyping && <TypingIndicator />}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-slate-100 dark:border-slate-700 p-3 flex-shrink-0 bg-white dark:bg-slate-800">
                        <div className="flex gap-2 items-center">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="e.g. my fan stopped working..."
                                className="flex-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                disabled={isTyping}
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || isTyping}
                                className="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl flex items-center justify-center transition flex-shrink-0 shadow-lg active:scale-90"
                            >
                                <Send size={15} />
                            </button>
                        </div>
                        <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-2">Only hostel-related queries supported</p>
                    </div>
                </div>
            )}
            {/* Login Intro Popup */}
            {showIntro && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-indigo-600 p-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 ring-8 ring-white/10">
                                <Bot size={32} className="text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Need Quick Help?</h3>
                            <p className="text-indigo-100 text-sm">
                                Facing a minor issue like a slow fan, no water, or WiFi trouble? 
                                Our AI Assistant can help you troubleshoot instantly!
                            </p>
                        </div>
                        <div className="p-4 space-y-3">
                            <button
                                onClick={handleAcceptIntro}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg active:scale-95"
                            >
                                <MessageCircle size={18} />
                                Chat with Assistant
                            </button>
                            <button
                                onClick={handleDismissIntro}
                                className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-3 rounded-xl transition active:scale-95"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
