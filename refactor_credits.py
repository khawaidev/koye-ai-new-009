import re

with open('src/pages/LandingPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Extract and replace PricingDetailsCarousel
carousel_regex = re.compile(r'// ─── Pricing Details Carousel ────────────────────────────────────\nconst PricingDetailsCarousel = \(\) => \{.*?(?=\n// ─── Pricing ─────────────────────────────────────────────────────)', re.DOTALL)

credits_section = """// ─── Credits ─────────────────────────────────────────────────────
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
"""

content = carousel_regex.sub(credits_section, content)

# 2. Remove <PricingDetailsCarousel />
content = content.replace('                <PricingDetailsCarousel />\n', '')

# 3. Add <Credits /> to LandingPage
content = content.replace(
'''            <Pricing />
            <FAQ />''',
'''            <Pricing />
            <Credits />
            <FAQ />'''
)

with open('src/pages/LandingPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Refactor complete")
