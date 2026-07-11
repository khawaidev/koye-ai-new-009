import { motion } from 'framer-motion';
import {
    ArrowRight,
    ArrowUp,
    Box,
    Check,
    CheckCircle,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clipboard,
    Cloud,
    Code,
    Copy,
    Download,
    Globe,
    Heart,
    Image,
    Instagram,
    MessageSquare,
    Mic,
    Music,
    Paperclip,
    Rocket,
    Search,
    Sparkles,
    Star,
    StarIcon,
    Terminal,
    Twitter,
    Upload,
    Users,
    Video,
    Zap
} from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../store/useAppStore';
import { AppIcon } from '../components/ui/AppIcon';


// ─── Smooth scroll ───────────────────────────────────────────────
const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// ─── Video Background ────────────────────────────────────────────
const VideoBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden bg-background">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                src="https://pub-475cca0b7414418d866128a4b30dfd97.r2.dev/videos/video_202607031250.mp4"
            />
        </div>
    );
};

// ─── Copy Command ────────────────────────────────────────────────
const CopyCommand = ({ command }: { command: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(command);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-foreground text-background p-4 rounded-xl font-mono text-sm shadow-lg"
        >
            <div className="flex items-center gap-2 mb-2 text-green-400">
                <span>#</span>
                <span className="text-background/70">Install KOYE CLI</span>
            </div>
            <div className="flex items-center justify-between gap-4">
                <code className="text-background flex-1 overflow-x-auto">{command}</code>
                <button
                    onClick={handleCopy}
                    className="p-2 hover:bg-background/10 rounded-lg transition-colors shrink-0"
                    title="Copy to clipboard"
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                    ) : (
                        <Copy className="w-4 h-4 text-background" />
                    )}
                </button>
            </div>
        </motion.div>
    );
};

// ─── Navbar ──────────────────────────────────────────────────────
const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    // Track scroll position to add glassy background when past hero section
    useEffect(() => {
        const handleScroll = () => {
            const heroHeight = window.innerHeight * 0.8;
            setIsScrolled(window.scrollY > heroHeight);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
            e.preventDefault();
            smoothScrollTo(sectionId);
        },
        []
    );

    const dropdownTextCls = 'text-black/60 hover:text-black hover:bg-black/5';

    return (
        <nav className={`fixed top-2 left-2 right-2 sm:left-4 sm:right-4 md:left-8 md:right-8 z-50 transition-all duration-500 rounded-full ${isScrolled ? 'bg-background/70 backdrop-blur-xl shadow-lg border border-border/20' : 'bg-transparent'}`}>
            <div
                className="mx-auto flex items-center justify-between"
                style={{ padding: '4px 16px' }}
            >
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <AppIcon alt="KOYE" className="w-8 h-8 rounded-full shadow-sm" />
                    <span
                        className="font-schibsted font-bold tracking-tight text-white"
                        style={{ fontSize: 25 }}
                    >
                        Khawain.
                    </span>
                </div>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-5">
                    <a
                        href="#cli"
                        onClick={(e) => handleNavClick(e, 'cli')}
                        className="font-schibsted font-medium text-white/80 hover:text-white transition-colors duration-500"
                        style={{ fontSize: 15 }}
                    >
                        Platform
                    </a>
                    <div className="relative group">
                        <a
                            href="#features"
                            onClick={(e) => handleNavClick(e, 'features')}
                            className="font-schibsted font-medium flex items-center gap-1 py-4 text-white/80 hover:text-white transition-colors duration-500"
                            style={{ fontSize: 15 }}
                        >
                            Features
                            <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                        </a>
                        {/* Dropdown — always glassy white, independent of nav theme */}
                        <div className="absolute top-[80%] left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                            <div className="bg-white/70 backdrop-blur-2xl border border-black/10 shadow-2xl rounded-xl p-2 w-64 flex flex-col gap-1">
                                {[
                                    'Full game asset generation',
                                    'AI 3D game asset and texture',
                                    'Payment integration',
                                    'Multiplayer game servers',
                                    'Game ad revenue'
                                ].map((option) => (
                                    <a
                                        key={option}
                                        href="#features"
                                        onClick={(e) => handleNavClick(e, 'features')}
                                        className={`px-4 py-2 text-sm rounded-lg transition-colors font-schibsted text-left ${dropdownTextCls}`}
                                    >
                                        {option}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                    <a
                        href="#cli"
                        onClick={(e) => handleNavClick(e, 'cli')}
                        className="font-schibsted font-medium text-white/80 hover:text-white transition-colors duration-500"
                        style={{ fontSize: 15 }}
                    >
                        Projects
                    </a>
                    <a
                        href="#pricing"
                        onClick={(e) => handleNavClick(e, 'pricing')}
                        className="font-schibsted font-medium text-white/80 hover:text-white transition-colors duration-500"
                        style={{ fontSize: 15 }}
                    >
                        Pricing
                    </a>
                </div>

                {/* CTA Button */}
                <div className="flex items-center gap-3">
                    <Link
                        to="/signup"
                        className="font-schibsted font-semibold px-5 py-2 rounded-full bg-white text-black hover:bg-white/90 transition-colors duration-500 flex items-center gap-2"
                        style={{ fontSize: 14 }}
                    >
                        Start building for free
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </nav>
    );
};


// ─── Hero ────────────────────────────────────────────────────────
const Hero = () => {
    const [inputValue, setInputValue] = useState('');
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const attachMenuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Close attach menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
                setShowAttachMenu(false);
            }
        };
        if (showAttachMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showAttachMenu]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        setAttachedFiles(prev => [...prev, ...files]);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const clipboardData = e.clipboardData;
        const items = Array.from(clipboardData.items);
        let hasImage = false;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) {
                    setAttachedFiles(prev => [...prev, file]);
                }
                hasImage = true;
            }
        }
        if (!hasImage) {
            const text = clipboardData.getData('text/plain');
            if (text && text.length > 0) {
                setInputValue(prev => prev + text);
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAttachedFiles(prev => [...prev, ...files]);
    }

    const removeFile = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    }

    return (
        <section data-nav-theme="light" className="relative min-h-screen flex flex-col items-center overflow-hidden bg-background">

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-6" style={{ marginTop: '-50px' }}>
                {/* Top spacer for nav */}
                <div className="h-[60px]" />

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-0 rounded-full shadow-md border border-border/50 overflow-hidden mb-8 bg-background/80 backdrop-blur-md"
                >
                    <div className="flex items-center gap-1.5 bg-foreground text-background px-3 py-1.5 rounded-full">
                        <Star className="w-3.5 h-3.5 fill-background" />
                        <span className="font-inter text-xs font-semibold uppercase tracking-wider">New</span>
                    </div>
                    <div className="px-4 py-1.5">
                        <span className="font-inter text-sm text-foreground font-medium">Discover what's possible</span>
                    </div>
                </motion.div>

                {/* Headline — always black, reads against the white/bright video */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="font-fustat font-bold text-center text-white"
                    style={{ fontSize: 'clamp(40px, 5.5vw, 80px)', letterSpacing: '-4px', lineHeight: 1 }}
                >
                    AI Game Engine For
                    <br />
                    The Next Generation
                </motion.h1>

                {/* Subtitle — always white with drop shadow for legibility over video */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="font-fustat font-medium text-center mt-6 max-w-[542px] text-white drop-shadow-md"
                    style={{ fontSize: 20, letterSpacing: '-0.4px', textShadow: '0 1px 8px rgba(0,0,0,0.35)' }}
                >
                    Turn ideas into playable games — instantly. Generate assets, code, and launch live demos right from your browser.
                </motion.p>

                {/* Glassmorphism Prompt Box */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                    className="w-full max-w-[728px] mt-11 rounded-[18px] overflow-hidden border border-border/40 shadow-2xl"
                    style={{ background: 'var(--background)', backgroundColor: 'color-mix(in srgb, var(--background) 80%, transparent)', backdropFilter: 'blur(24px)' }}
                >
                    {/* Credit Row */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-border/20">
                        <div className="flex items-center gap-2">
                            <span className="font-schibsted font-medium text-[#000] dark:text-foreground" style={{ fontSize: 12 }}>
                                60/450 credits
                            </span>
                            <button
                                className="font-schibsted font-bold text-xs px-2.5 py-0.5 rounded-full shadow-sm"
                                style={{ background: 'rgba(90,225,76,0.9)', color: '#000' }}
                            >
                                Upgrade
                            </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#000] dark:text-foreground/80" />
                            <span className="font-schibsted font-medium text-[#000] dark:text-foreground/80" style={{ fontSize: 12 }}>
                                Powered by Koye.
                            </span>
                        </div>
                    </div>

                    {/* Unified input + action row — single bg-background container */}
                    <div 
                        className={`mx-2 mb-2 bg-background rounded-xl shadow-inner border shadow-2xl mt-2 transition-all ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-border/50'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            multiple 
                            accept="image/*,video/*,text/*,.md,.js,.ts,.jsx,.tsx,.html,.css,.json,.py"
                            onChange={handleFileSelect}
                        />

                        {attachedFiles.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto scrollbar-mini px-3 pt-3">
                                {attachedFiles.map((file, index) => {
                                    const isImage = file.type.startsWith('image/');
                                    const isVideo = file.type.startsWith('video/');
                                    return (
                                        <div key={index} className="relative shrink-0 group flex flex-col items-center">
                                            {isImage ? (
                                                <img 
                                                    src={URL.createObjectURL(file)} 
                                                    alt={`Preview ${index+1}`} 
                                                    className="h-12 w-16 rounded-lg border border-border object-cover" 
                                                />
                                            ) : (
                                                <div className="h-12 w-16 rounded-lg border border-border flex flex-col items-center justify-center bg-muted/80 text-muted-foreground p-1">
                                                    {isVideo ? <Video className="h-5 w-5 mb-0.5" /> : <FileText className="h-5 w-5 mb-0.5" />}
                                                    <span className="text-[8px] font-mono leading-tight truncate w-full text-center">{file.name}</span>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="absolute -right-1 -top-1 rounded-full bg-background border border-border p-0.5 shadow-lg hover:bg-muted transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="h-3 w-3 text-foreground" />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Text input row */}
                        <div className="flex items-center gap-3 px-3 pt-3 pb-2">
                            <input
                                type="text"
                                placeholder="Describe your game idea..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onPaste={handlePaste}
                                className="flex-1 text-base outline-none font-noto bg-transparent text-foreground placeholder:text-muted-foreground"
                                style={{ fontSize: 16 }}
                            />
                            <button className="w-9 h-9 bg-foreground rounded-full flex items-center justify-center shrink-0 hover:opacity-90 shadow-md transition-opacity">
                                <ArrowUp className="w-4 h-4 text-background" />
                            </button>
                        </div>
                        {/* Action buttons + counter — same container, no border/bg */}
                        <div className="flex items-center justify-between px-2 pb-2">
                            <div className="flex items-center gap-0.5">
                                {/* Attach Button with Dropdown */}
                                <div className="relative" ref={attachMenuRef}>
                                    <button
                                        onClick={() => {
                                            setShowAttachMenu(!showAttachMenu);
                                        }}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-muted rounded-lg transition-colors"
                                    >
                                        <Paperclip className="w-3.5 h-3.5 text-foreground/60" />
                                        <span className="text-foreground/60 text-xs font-schibsted font-medium">Attach</span>
                                    </button>

                                    {/* Attach Dropdown Menu */}
                                    {showAttachMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute bottom-full left-0 mb-2 w-56 bg-background border border-border/60 shadow-xl rounded-2xl overflow-hidden z-50"
                                        >
                                            <div className="p-2">
                                                <button 
                                                    onClick={() => {
                                                        fileInputRef.current?.click();
                                                        setShowAttachMenu(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/60 rounded-xl transition-colors">
                                                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-foreground/10">
                                                        <Upload className="h-4 w-4" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-medium">Upload from device</div>
                                                        <div className="text-xs text-muted-foreground">Images, videos, files</div>
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.readText().then((text) => {
                                                            if (text) {
                                                                setInputValue((prev) => prev + text);
                                                            }
                                                        });
                                                        setShowAttachMenu(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/60 rounded-xl transition-colors"
                                                >
                                                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-foreground/10">
                                                        <Clipboard className="h-4 w-4" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-medium">Paste from clipboard</div>
                                                        <div className="text-xs text-muted-foreground">Text or images</div>
                                                    </div>
                                                </button>
                                            </div>

                                            <div className="px-3 py-2 border-t border-border/40">
                                                <p className="text-[10px] text-muted-foreground text-center">
                                                    Supports: JPG, PNG, GIF, MP4, MD, JS, TS, JSON
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                                <button className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-muted rounded-lg transition-colors">
                                    <Mic className="w-3.5 h-3.5 text-foreground/60" />
                                    <span className="text-foreground/60 text-xs font-schibsted font-medium">Voice</span>
                                </button>
                                <button className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-muted rounded-lg transition-colors">
                                    <Search className="w-3.5 h-3.5 text-foreground/60" />
                                    <span className="text-foreground/60 text-xs font-schibsted font-medium">Prompts</span>
                                </button>
                            </div>
                            <span className="text-muted-foreground/60 text-xs font-schibsted pr-1">{inputValue.length}/3,000</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Soft blurred transition to next section */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-20 backdrop-blur-[4px] pointer-events-none [mask-image:radial-gradient(ellipse_120%_100%_at_50%_-20%,transparent_30%,black_100%)]" />
        </section>
    );
};

// ─── Games ───────────────────────────────────────────────────────
const Games = () => {
    const games = [
        {
            name: "Champions of Valor",
            iconImage: "https://pub-475cca0b7414418d866128a4b30dfd97.r2.dev/images/icon3.png",
            image: "https://pub-475cca0b7414418d866128a4b30dfd97.r2.dev/images/ChatGPT%20Image%20Jul%205%2C%202026%2C%2007_24_22%20PM.png",
            tags: ["Moba", "5v5", "Multiplayer", "Competitive", "Mobile", "Action"]
        },
        {
            name: "Terra Xilen",
            iconImage: "https://pub-475cca0b7414418d866128a4b30dfd97.r2.dev/images/icon1.png",
            image: "https://pub-475cca0b7414418d866128a4b30dfd97.r2.dev/images/ChatGPT%20Image%20Jul%205%2C%202026%2C%2007_54_28%20PM.png",
            tags: ["Multiplayer", "PVE", "Co-op", "Action", "Shooter", "Survival"]
        },
        {
            name: "Helum",
            iconImage: "https://pub-475cca0b7414418d866128a4b30dfd97.r2.dev/images/icon2.png",
            image: "https://pub-475cca0b7414418d866128a4b30dfd97.r2.dev/images/ChatGPT%20Image%20Jul%205%2C%202026%2C%2007_41_15%20PM.png",
            tags: ["Survival", "Online", "PVE", "Fantasy", "Mobile"]
        }
    ];

    return (
        <section id="games" data-nav-theme="light" className="relative pt-12 pb-8 bg-background overflow-hidden scroll-mt-16">
            {/* Soft blurred transition from Hero video section */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background via-background/50 to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 left-0 right-0 h-20 backdrop-blur-[4px] pointer-events-none z-10 [mask-image:radial-gradient(ellipse_120%_100%_at_50%_120%,transparent_30%,black_100%)]" />

            <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                <div className="text-center mb-8">
                    <h2
                        className="font-fustat font-bold text-foreground mb-4"
                        style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-2px' }}
                    >
                        Games built by Koye
                    </h2>
                </div>

                {/* Infinite Auto-scrolling carousel */}
                <div className="flex overflow-hidden -mx-6">
                    <motion.div
                        className="flex"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ ease: "linear", duration: 30, repeat: Infinity }}
                    >
                        {[...games, ...games].map((game, i) => (
                            <div key={`${game.name}-${i}`} className="flex-none w-[85vw] md:w-[600px]">
                                <div className="h-full p-6 border border-border/40 bg-muted/20 backdrop-blur-md flex flex-col gap-6 transition-all hover:bg-muted/30">
                                    <div className="flex items-center gap-4 px-2">
                                        <div className="w-14 h-14 rounded-2xl bg-foreground text-background shadow-md flex items-center justify-center shrink-0 overflow-hidden">
                                            <img src={game.iconImage} alt={`${game.name} icon`} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-3xl font-schibsted font-bold text-foreground tracking-tight">{game.name}</h3>
                                            <div className="flex flex-wrap gap-1.5">
                                                {game.tags.map((tag) => (
                                                    <span key={tag} className="px-2 py-0.5 text-[10px] font-schibsted font-medium text-foreground/80 bg-muted/60 border border-border/40 rounded-full">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl overflow-hidden border border-border/50 shadow-inner bg-black/5 aspect-video relative group">
                                        <img src={game.image} alt={game.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Soft blurred transition to next section */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-20 backdrop-blur-[4px] pointer-events-none z-10 [mask-image:radial-gradient(ellipse_120%_100%_at_50%_-20%,transparent_30%,black_100%)]" />
        </section>
    );
};

// ─── Features ────────────────────────────────────────────────────
const Features = () => {
    const features = [
        {
            icon: Sparkles,
            title: 'Describe it. Play it.',
            desc: 'From a single prompt, generate a complete playable game with characters, environments, gameplay, and more.',
            span: 'col-span-1 md:col-span-2 md:row-span-2',
            large: true,
        },
        {
            icon: Box,
            title: '3D Assets & Textures',
            desc: 'Generate game-ready 3D models, textures, rigs, and audio — all optimized for real-time rendering.',
            span: 'col-span-1 md:col-span-2',
        },
        {
            icon: MessageSquare,
            title: 'NPC with AI',
            desc: 'Create intelligent NPCs with natural dialogue systems that respond dynamically to player actions.',
            span: 'col-span-1',
        },
        {
            icon: Globe,
            title: 'Three Engines',
            desc: 'Export to Three.js, Unity 6, or Unreal Engine. Multiplayer support out of the box.',
            span: 'col-span-1',
        },
        {
            icon: Video,
            title: 'Marketing Suite',
            desc: 'AI generates trailers, promotional posters, social media assets, and store listings for your game.',
            span: 'col-span-1 md:col-span-2',
        },
        {
            icon: Zap,
            title: 'Game Economy',
            desc: 'Auto-balance your in-game economy with AI-driven pricing, loot tables, and progression curves.',
            span: 'col-span-1',
        },
        {
            icon: Terminal,
            title: 'Multiplayer Servers',
            desc: 'WebSocket game servers with matchmaking, state sync, and up to 100 concurrent players.',
            span: 'col-span-1',
            dark: true,
        },
        {
            icon: ArrowRight,
            title: 'Social Distribution',
            desc: 'One-click publishing to X (Twitter), TikTok, Reddit, and more. AI handles copy and scheduling.',
            span: 'col-span-1 md:col-span-2',
        },
        {
            icon: Code,
            title: 'Payment Integration',
            desc: 'Stripe, PayPal, Alipay — wired in. Monetize your game from day one.',
            span: 'col-span-1',
        },
        {
            icon: Image,
            title: 'Ad Revenue',
            desc: 'Plug in ads with automated revenue splits. Track performance with built-in analytics.',
            span: 'col-span-1',
        },
    ];

    return (
        <section id="features" data-nav-theme="dark" className="py-28 bg-background scroll-mt-16">
            <div className="max-w-6xl mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <h2
                            className="font-fustat font-bold text-foreground mb-6"
                            style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-2px', lineHeight: 1.1 }}
                        >
                            What once required{' '}
                            <span className="text-muted-foreground line-through decoration-muted-foreground/40">an entire studio</span>
                            <br />
                            now takes{' '}
                            <span className="relative inline-block mx-1">
                                <span className="relative z-10 px-3 py-0.5 leading-none font-bold text-background bg-foreground rounded-lg shadow-md border border-border/50">one intelligent agent</span>
                            </span>
                        </h2>
                        <p className="font-noto text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
                            <span className="font-semibold text-foreground">KOYE AI</span> replaces what used to take a 10-person studio: from a single prompt it generates images, 3D assets, video, gameplay code, marketing materials, and complete games.
                        </p>
                    </motion.div>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, delay: i * 0.04 }}
                            viewport={{ once: true }}
                            className={`${f.span} group relative rounded-2xl p-7 transition-all duration-300 border backdrop-blur-sm overflow-hidden ${f.dark
                                ? 'bg-foreground border-foreground text-background shadow-xl hover:shadow-2xl hover:-translate-y-1'
                                : 'bg-muted/30 border-border/60 hover:border-border hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1'
                                }`}
                        >
                            <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm ${f.dark ? 'bg-background/20' : 'bg-background border border-border/50'
                                    }`}
                            >
                                <f.icon className={`w-5 h-5 ${f.dark ? 'text-background' : 'text-foreground'}`} />
                            </div>
                            <h3
                                className={`font-schibsted font-semibold mb-2 ${f.large ? 'text-2xl' : 'text-lg'
                                    } ${f.dark ? 'text-background' : 'text-foreground'}`}
                                style={{ letterSpacing: '-0.5px' }}
                            >
                                {f.title}
                            </h3>
                            <p
                                className={`font-noto text-sm leading-relaxed ${f.dark ? 'text-background/80' : 'text-muted-foreground'
                                    }`}
                            >
                                {f.desc}
                            </p>
                            {f.large && (
                                <div className={`mt-6 flex-1 rounded-xl border min-h-[180px] flex items-center justify-center ${f.dark ? 'bg-background/10 border-background/20' : 'bg-background/80 border-border/50 shadow-inner'}`}>
                                    <Image className={`w-14 h-14 transition-transform duration-500 group-hover:scale-110 ${f.dark ? 'text-background/20' : 'text-foreground/10'}`} />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ─── Terminal Carousel ───────────────────────────────────────────
const TerminalCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((c) => (c + 1) % 3);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full flex flex-col gap-3 md:gap-4">
            <div className="relative w-full overflow-hidden rounded-xl md:rounded-2xl">
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ width: '300%', transform: `translateX(-${activeIndex * (100 / 3)}%)` }}
                >
                    {/* Slide 1: Terminal */}
                    <div className="w-1/3 shrink-0 px-1 md:px-2 flex justify-center">
                        <div className="w-full bg-[#0e1311] rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-[#2a2f2d]">
                            <div className="flex items-center gap-2 px-3 md:px-5 py-2.5 md:py-3.5 border-b border-white/10 bg-black/20">
                                <div className="flex gap-1.5 md:gap-2">
                                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/80 shadow-sm" />
                                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/80 shadow-sm" />
                                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/80 shadow-sm" />
                                </div>
                                <span className="text-white/50 text-xs md:text-sm font-schibsted ml-1 md:ml-2">koye_terminal</span>
                            </div>
                            <div className="p-3 md:p-6 font-mono text-xs md:text-sm text-white/90 space-y-1.5 md:space-y-2 h-[200px] md:h-[350px] text-left overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <span className="text-green-400">$</span>
                                    <span className="truncate">curl -fsSL https://start.koye.ai/install.sh | bash</span>
                                </div>
                                <div className="text-white/50 pl-3 md:pl-4 text-xs md:text-sm">✓ KOYE CLI installed successfully</div>
                                <div className="flex items-center gap-2 mt-2 md:mt-4">
                                    <span className="text-green-400">$</span>
                                    <span>koye init</span>
                                </div>
                                <div className="text-white/50 pl-3 md:pl-4 text-xs md:text-sm">✓ Initialized in ./my-game-project</div>
                                <div className="flex items-center gap-2 mt-2 md:mt-4">
                                    <span className="text-green-400">$</span>
                                    <span>koye chat</span>
                                </div>
                                <div className="text-white/50 pl-3 md:pl-4 text-xs md:text-sm">🎮 Starting AI game dev assistant...</div>
                                <div className="mt-2 md:mt-4 p-2 md:p-3 border border-white/10 rounded-lg md:rounded-xl bg-white/5">
                                    <div className="text-green-400 mb-1 md:mb-2 font-bold text-xs md:text-sm">[KOYE AI]</div>
                                    <div className="text-white/80 text-xs md:text-sm">
                                        What would you like to create today?<br />
                                        <span className="text-white/40">• Generate 2D sprites</span><br />
                                        <span className="text-white/40">• Create 3D models</span><br />
                                        <span className="text-white/40">• Generate audio/video</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2 md:mt-4">
                                    <span className="text-green-400">$</span>
                                    <span className="animate-pulse">_</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Slide 2: CLI Commands */}
                    <div className="w-1/3 shrink-0 px-1 md:px-2 flex justify-center items-center">
                        <div className="w-full grid grid-cols-2 gap-2 md:gap-4 h-[200px] md:h-[350px] content-center text-left">
                            {[
                                { cmd: 'koye init', desc: 'Initialize in project' },
                                { cmd: 'koye login', desc: 'Authenticate account' },
                                { cmd: 'koye chat', desc: 'Start AI assistant' },
                                { cmd: 'koye profile', desc: 'View account info' },
                            ].map((item) => (
                                <div key={item.cmd} className="p-2.5 md:p-5 bg-background rounded-lg md:rounded-xl border border-border/60 shadow-lg flex flex-col justify-center">
                                    <code className="text-xs md:text-sm font-mono text-foreground font-semibold">{item.cmd}</code>
                                    <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 font-noto">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Slide 3: File Tree */}
                    <div className="w-1/3 shrink-0 px-1 md:px-2 flex justify-center">
                        <div className="w-full p-3 md:p-6 bg-background rounded-xl md:rounded-2xl border border-border/60 shadow-lg h-[200px] md:h-[350px] text-left overflow-hidden">
                            <h4 className="font-mono font-bold text-foreground mb-2 md:mb-4 text-xs md:text-sm">$ tree koye-assets/</h4>
                            <pre className="text-[10px] md:text-sm text-muted-foreground font-mono leading-tight md:leading-normal overflow-hidden">
                                {`koye-assets/
├── images/
│   ├── character_front.png
│   └── character_sprites.png
├── 3dmodels/
│   ├── sword.glb
│   └── helmet.obj
├── videos/
│   └── trailer.mp4
└── audio/
    ├── jump_sfx.mp3
    └── bg_music.wav`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-1.5 md:gap-2 mt-1 md:mt-2">
                {[0, 1, 2].map((idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={`h-1.5 md:h-2 rounded-full transition-all ${activeIndex === idx ? 'bg-foreground w-4 md:w-6' : 'bg-muted-foreground/30 w-1.5 md:w-2 hover:bg-muted-foreground/60'
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

// ─── Credits ─────────────────────────────────────────────────────
const Credits = () => {
    return (
        <section id="credits" data-nav-theme="light" className="py-28 bg-muted/10 scroll-mt-16 border-t border-border/50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2
                        className="font-fustat font-bold text-foreground mb-5"
                        style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-2px' }}
                    >
                        Credits & Top-Ups
                    </h2>
                    <p className="text-muted-foreground font-noto max-w-2xl mx-auto text-lg">
                        Simple, transparent pricing for all generation features.
                    </p>
                </div>

                <div className="space-y-24">
                    {/* Credit Costs */}
                    <div>
                        <div className="text-center mb-10">
                            <h3 className="text-2xl md:text-3xl font-schibsted font-bold text-foreground mb-3">
                                Credit Costs
                            </h3>
                            <p className="text-muted-foreground text-sm font-noto max-w-lg mx-auto">
                                Transparent pricing for every action. Know exactly what you're paying for.
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {[
                                { icon: MessageSquare, name: 'AI Chat', cost: '100 credits / 1M tokens' },
                                { icon: Image, name: 'Image Gen', cost: '5-15 credits / image' },
                                { icon: Box, name: '3D Model', cost: '20-70 credits / model' },
                                { icon: Video, name: 'Video Gen', cost: '10-25 credits / second' },
                                { icon: Music, name: 'Audio Gen', cost: '5 credits / second' },
                                { icon: Sparkles, name: 'Game Gen', cost: '100-500 credits / game' },
                            ].map((item) => (
                                <div key={item.name} className="p-6 bg-background border border-border/60 shadow-sm rounded-xl text-center hover:shadow-lg transition-all">
                                    <item.icon className="w-8 h-8 mx-auto mb-3 text-foreground" />
                                    <p className="font-schibsted text-base text-foreground font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground font-noto mt-1">{item.cost}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Credit Top-Ups */}
                    <div>
                        <div className="text-center mb-10">
                            <h3 className="text-2xl md:text-3xl font-schibsted font-bold text-foreground mb-3 flex items-center justify-center gap-3">
                                <div className="p-2.5 bg-muted/50 rounded-xl shadow-sm border border-border/50">
                                    <Zap className="w-5 h-5 text-foreground" />
                                </div>
                                Credit Top-Ups
                            </h3>
                            <p className="text-muted-foreground text-sm font-noto max-w-lg mx-auto">
                                Need more generating power? Instantly top up your account with more credits.
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            <div className="p-7 bg-background border border-border/60 rounded-2xl text-center hover:shadow-xl transition-all flex flex-col justify-between">
                                <div>
                                    <div className="text-4xl font-schibsted font-bold text-foreground mb-1">$5<span className="text-2xl text-muted-foreground/60">.00</span></div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-schibsted mb-6">₹375</div>
                                </div>
                                <div className="p-5 rounded-xl bg-muted/30 border border-border/40 shadow-inner">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Sparkles className="w-5 h-5 text-muted-foreground" />
                                        <span className="text-3xl font-bold text-foreground font-schibsted">500</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground font-schibsted tracking-widest uppercase">credits</div>
                                </div>
                            </div>

                            <div className="p-7 bg-foreground border-2 border-foreground rounded-2xl text-center shadow-2xl shadow-foreground/20 transition-all flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute -top-4 -right-4 p-8 opacity-10">
                                    <Zap className="w-32 h-32 text-background" />
                                </div>
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-background text-foreground text-xs font-schibsted font-bold rounded-full shadow-lg border border-border/20">
                                    MOST POPULAR
                                </div>
                                <div className="relative z-10 pt-4">
                                    <div className="text-4xl font-schibsted font-bold text-background mb-1">$10<span className="text-2xl text-background/60">.00</span></div>
                                    <div className="text-xs text-background/60 uppercase tracking-wider font-schibsted mb-6">₹750</div>
                                </div>
                                <div className="p-5 rounded-xl bg-background/10 border border-background/20 relative z-10 backdrop-blur-md">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Sparkles className="w-5 h-5 text-background" />
                                        <span className="text-3xl font-bold text-background font-schibsted">1,200</span>
                                    </div>
                                    <div className="text-xs text-background/80 font-schibsted tracking-widest uppercase mb-3">credits</div>
                                    <div className="inline-flex items-center px-3 py-1 bg-background/20 text-background text-xs font-bold rounded-full border border-background/30">
                                        +20% BONUS
                                    </div>
                                </div>
                            </div>

                            <div className="p-7 bg-background border border-border/60 rounded-2xl text-center hover:shadow-xl transition-all flex flex-col justify-between">
                                <div>
                                    <div className="text-4xl font-schibsted font-bold text-foreground mb-1">$20<span className="text-2xl text-muted-foreground/60">.00</span></div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-schibsted mb-6">₹1,500</div>
                                </div>
                                <div className="p-5 rounded-xl bg-muted/30 border border-border/40 shadow-inner">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Sparkles className="w-5 h-5 text-muted-foreground" />
                                        <span className="text-3xl font-bold text-foreground font-schibsted">3,000</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground font-schibsted tracking-widest uppercase mb-3">credits</div>
                                    <div className="inline-flex items-center px-3 py-1 bg-foreground/5 text-foreground text-xs font-bold rounded-full border border-foreground/10">
                                        +50% BONUS
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// ─── Pricing ─────────────────────────────────────────────────────
type FREQUENCY = 'monthly' | 'yearly';

const Pricing = () => {
    const [frequency, setFrequency] = useState<FREQUENCY>('monthly');

    const plans = [
        {
            name: 'Indie',
            info: 'For students & hobbyists',
            price: { monthly: 5, yearly: 54 },
            features: [
                { text: '500 credits/month' },
                { text: 'No commercial license' },
                { text: 'Community support' },
                { text: 'Standard priority' },
                { text: '5GB storage' },
            ],
            btn: { text: 'Select Plan', href: '/signup' },
            highlighted: false,
        },
        {
            name: 'Pro',
            info: 'For indie developers',
            price: { monthly: 20, yearly: 216 },
            features: [
                { text: '3,000 credits/month' },
                { text: 'Commercial license' },
                { text: 'Unity/Unreal helpers' },
                { text: 'Full export options' },
                { text: '20GB storage' },
            ],
            btn: { text: 'Select Plan', href: '/signup' },
            highlighted: true,
        },
        {
            name: 'Pro Plus',
            info: 'For small teams',
            price: { monthly: 35, yearly: 378 },
            features: [
                { text: '8,000 credits/month' },
                { text: 'High priority queue' },
                { text: '100GB storage' },
                { text: 'Early access features' },
                { text: 'AI code generation' },
            ],
            btn: { text: 'Select Plan', href: '/signup' },
            highlighted: false,
        },
    ];

    return (
        <section id="pricing" data-nav-theme="dark" className="relative py-28 scroll-mt-16 overflow-hidden">
            {/* Soft blurred transition from top section */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background via-background/50 to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 left-0 right-0 h-20 backdrop-blur-[4px] pointer-events-none z-10 [mask-image:radial-gradient(ellipse_120%_100%_at_50%_120%,transparent_30%,black_100%)]" />

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                <div className="text-center mb-8">
                    <h2
                        className="font-fustat font-bold text-white mb-4"
                        style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-2px' }}
                    >
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-white/80 font-noto max-w-xl mx-auto text-base">
                        Choose the plan that fits your needs. All plans work across web app and CLI.
                    </p>
                </div>

                {/* Frequency Toggle */}
                <div className="flex justify-center mb-10">
                    <div className="bg-muted/30 inline-flex rounded-full border p-1">
                        {(['monthly', 'yearly'] as FREQUENCY[]).map((freq) => (
                            <button
                                key={freq}
                                onClick={() => setFrequency(freq)}
                                className="relative px-5 py-1.5 text-sm capitalize"
                            >
                                <span className={`relative z-10 ${frequency === freq ? 'text-black' : 'text-white/80'}`}>{freq}</span>
                                {frequency === freq && (
                                    <motion.span
                                        layoutId="frequency"
                                        transition={{ type: 'spring', duration: 0.4 }}
                                        className="bg-foreground absolute inset-0 z-0 rounded-full"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative flex flex-col rounded-lg border bg-muted/20 p-5 ${plan.highlighted ? 'bg-muted/40 border-foreground/50' : 'border-border/60'
                                }`}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                    <p className="bg-foreground text-background flex items-center gap-1 rounded-md border px-3 py-1 text-xs font-bold">
                                        <StarIcon className="h-3 w-3 fill-current" />
                                        Popular
                                    </p>
                                </div>
                            )}
                            {frequency === 'yearly' && !plan.highlighted && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                    <p className="bg-primary text-primary-foreground flex items-center gap-1 rounded-md border px-3 py-1 text-xs font-bold">
                                        {Math.round(((plan.price.monthly * 12 - plan.price.yearly) / plan.price.monthly / 12) * 100)}% off
                                    </p>
                                </div>
                            )}

                            <div className="mb-4">
                                <div className="text-lg font-medium text-foreground">{plan.name}</div>
                                <p className="text-muted-foreground text-sm">{plan.info}</p>
                                <h3 className="mt-2 flex items-end gap-1 text-foreground">
                                    <span className="text-3xl font-bold">${plan.price[frequency]}</span>
                                    <span className="text-muted-foreground text-sm">/{frequency === 'monthly' ? 'month' : 'year'}</span>
                                </h3>
                            </div>

                            <div className="flex-1 space-y-3 mb-5">
                                {plan.features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm text-foreground/80">
                                        <CheckCircle className="h-4 w-4 text-foreground shrink-0" />
                                        <span>{feature.text}</span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                to={plan.btn.href}
                                className={`w-full py-2.5 text-sm font-semibold rounded-lg text-center transition-colors ${plan.highlighted
                                    ? 'bg-foreground text-background hover:opacity-90'
                                    : 'border border-border/80 text-foreground bg-background/50 hover:bg-background/80'
                                    }`}
                            >
                                {plan.btn.text}
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Contact Team for Enterprise */}
                <div className="flex justify-center mt-8">
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors border border-white/20 hover:border-white/40 rounded-full"
                    >
                        Contact team for Enterprise
                    </Link>
                </div>
            </div>

            {/* Soft blurred transition to FAQ section */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-32 backdrop-blur-[8px] pointer-events-none z-10 [mask-image:radial-gradient(ellipse_150%_100%_at_50%_-20%,transparent_20%,black_100%)]" />
        </section>
    );
};

// ─── FAQ ────────────────────────────────────────────────────────
const FAQ = () => {
    return (
        <section id="faq" data-nav-theme="light" className="py-28 bg-background scroll-mt-16">
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl font-fustat font-bold text-foreground" style={{ letterSpacing: '-1px' }}>
                        Frequently Asked Questions
                    </h3>
                    <p className="text-muted-foreground mt-2 font-noto">Everything you need to know about plans and billing.</p>
                </div>
                <div className="space-y-3">
                    {[
                        { q: 'Does Annual billing save money?', a: 'Yes. Annual billing saves 10% compared to paying monthly.' },
                        { q: 'Can I change plans later?', a: 'Yes. You can upgrade anytime, and you can switch plans as your needs change.' },
                        { q: 'What are credits used for?', a: 'Credits power generation features like chat, images, 3D, video, and audio.' },
                    ].map((item) => (
                        <details key={item.q} className="rounded-2xl border border-border/60 bg-background p-5 hover:shadow-md transition-shadow shadow-sm">
                            <summary className="cursor-pointer list-none flex items-center justify-between gap-3 outline-none">
                                <span className="font-schibsted font-semibold text-foreground">{item.q}</span>
                                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground">+</span>
                            </summary>
                            <p className="mt-3 text-sm text-muted-foreground font-noto leading-relaxed">{item.a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ─── About ───────────────────────────────────────────────────────
const About = () => (
    <section id="about" data-nav-theme="dark" className="py-28 bg-muted/20 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
                <h2
                    className="font-fustat font-bold text-foreground mb-5"
                    style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-2px' }}
                >
                    About Koye AI
                </h2>
                <p className="text-muted-foreground text-lg font-noto leading-relaxed max-w-2xl mx-auto">
                    We're building the future of game development, one AI-generated asset at a time.
                </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 mb-16">
                {[
                    {
                        icon: Rocket,
                        title: 'Our Mission',
                        desc: 'Democratize game development by making professional-quality asset creation accessible to indie developers, hobbyists, and studios of all sizes.',
                        delay: 0.1,
                    },
                    {
                        icon: Sparkles,
                        title: 'The Technology',
                        desc: 'Powered by cutting-edge AI models including Gemini, Pixazo, Veo 3, and Hitem3D for game-specific asset generation with consistent style.',
                        delay: 0.2,
                    },
                    {
                        icon: Users,
                        title: 'Two Platforms',
                        desc: 'Use the web app for visual workflows or the CLI for terminal-based development. Same account, same credits, seamless experience.',
                        delay: 0.3,
                    },
                ].map((item) => (
                    <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: item.delay }}
                        viewport={{ once: true }}
                        className="text-center p-8 bg-background rounded-2xl border border-border/60 shadow-sm hover:shadow-xl transition-all"
                    >
                        <div className="w-16 h-16 mx-auto mb-5 bg-muted/50 rounded-2xl flex items-center justify-center border border-border/40">
                            <item.icon className="w-7 h-7 text-foreground" />
                        </div>
                        <h3 className="text-xl font-schibsted font-semibold mb-3 text-foreground">{item.title}</h3>
                        <p className="text-muted-foreground text-sm font-noto leading-relaxed">{item.desc}</p>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-background rounded-2xl border border-border/60 p-10 text-center shadow-lg"
            >
                <div className="flex items-center justify-center gap-2 mb-5">
                    <Heart className="w-6 h-6 text-red-500" />
                    <span className="text-xl font-schibsted font-bold text-foreground">Built for Creators</span>
                </div>
                <p className="text-muted-foreground font-noto max-w-2xl mx-auto leading-relaxed">
                    KOYE AI was born from the frustration of spending countless hours on asset creation
                    instead of actual game development. We believe that anyone with a vision should be able
                    to create beautiful games, regardless of their artistic or technical background.
                    Our AI handles the heavy lifting so you can focus on what matters most —
                    <span className="text-foreground font-semibold"> making games that players will love.</span>
                </p>
            </motion.div>
        </div>
    </section>
);

// ─── Footer ──────────────────────────────────────────────────────
const Footer = () => {
    const handleNavClick = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
            e.preventDefault();
            smoothScrollTo(sectionId);
        },
        []
    );

    return (
        <footer className="py-6 md:py-12 bg-background border-t border-border">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
                {/* Mobile: Compact single row */}
                <div className="flex flex-col items-center gap-3 md:hidden text-center">
                    <div className="flex items-center gap-2">
                        <AppIcon alt="Khawain" className="w-6 h-6 rounded-full shadow-sm" />
                        <span className="font-schibsted font-bold text-base text-foreground tracking-tight">
                            Khawain.
                        </span>
                    </div>
                    <p className="text-muted-foreground text-xs font-noto">
                        AI powered game generation
                    </p>
                    <p className="text-muted-foreground text-xs font-noto">
                        @2025 Khawain. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Instagram className="w-4 h-4" />
                        </a>
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Twitter className="w-4 h-4" />
                        </a>
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                            <MessageSquare className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Desktop: Full footer */}
                <div className="hidden md:block">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2.5 mb-4">
                                <AppIcon alt="Khawain" className="w-8 h-8 rounded-full shadow-sm" />
                                <span className="font-schibsted font-bold text-xl text-foreground tracking-tight">
                                    Khawain.
                                </span>
                            </div>
                            <p className="text-muted-foreground text-sm font-noto leading-relaxed">
                                AI-powered game asset creation platform. Use in the browser or directly from your terminal.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-schibsted font-semibold mb-4 text-foreground">Platforms</h4>
                            <ul className="space-y-3 text-sm text-muted-foreground font-noto">
                                <li><Link to="/signup" className="hover:text-foreground transition-colors">Web App</Link></li>
                                <li><a href="#cli" onClick={(e) => handleNavClick(e, 'cli')} className="hover:text-foreground transition-colors">CLI Tool</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">API Access</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-schibsted font-semibold mb-4 text-foreground">Resources</h4>
                            <ul className="space-y-3 text-sm text-muted-foreground font-noto">
                                <li><a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="hover:text-foreground transition-colors">Features</a></li>
                                <li><a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="hover:text-foreground transition-colors">Pricing</a></li>
                                <li><Link to="/animations" className="hover:text-foreground transition-colors">Animations Library</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-schibsted font-semibold mb-4 text-foreground">Legal</h4>
                            <ul className="space-y-3 text-sm text-muted-foreground font-noto">
                                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-muted-foreground text-sm font-noto">
                            © 2025 Khawain. All rights reserved.
                        </p>
                        <div className="flex items-center gap-5 text-sm text-muted-foreground font-noto">
                            <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                                <Instagram className="w-4 h-4" />
                                <span>Instagram</span>
                            </a>
                            <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                                <Twitter className="w-4 h-4" />
                                <span>X</span>
                            </a>
                            <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                                <MessageSquare className="w-4 h-4" />
                                <span>Discord</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// ─── Main Landing Page ───────────────────────────────────────────
export const LandingPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const isPreview = params.get('preview') === 'true';

        if (!loading && user && !isPreview) {
            navigate('/app');
        }
    }, [user, loading, navigate]);

    // Handle hash navigation on page load
    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            setTimeout(() => {
                smoothScrollTo(hash);
            }, 100);
        }
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground scroll-smooth" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            <Navbar />
            <Hero />
            <Games />
            <Features />
            <Pricing />
            <Footer />
        </div>
    );
};

export default LandingPage;
