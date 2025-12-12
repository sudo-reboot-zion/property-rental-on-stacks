import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Shield, Globe, Key, Home, Wallet, Zap, Users } from "lucide-react";

const LearnMore = () => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-grow pt-20">
                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--muted))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted))_1px,transparent_1px)] bg-[size:24px_24px] opacity-30"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>

                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 bg-muted/50 border border-border px-4 py-2 rounded-full backdrop-blur-sm mb-8 animate-fade-in">
                            <Zap className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium text-foreground">The Future of Hospitality</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
                            Decentralized Stays <br />
                            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                                Reimagined
                            </span>
                        </h1>

                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                            StackNStay connects hosts and guests directly using blockchain technology, ensuring lower fees, transparent transactions, and true ownership.
                        </p>

                        <div className="flex justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                            <Link to="/properties">
                                <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20 border-0 h-14 px-8 rounded-xl text-lg font-semibold transition-all hover:scale-105">
                                    Start Exploring
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Why StackNStay Section */}
                <section className="py-20 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why StackNStay?</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                We're building a fairer ecosystem for travel, powered by the Stacks blockchain.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
                                    <Wallet className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Lower Fees</h3>
                                <p className="text-muted-foreground">
                                    By removing intermediaries, we significantly reduce booking fees for guests and commission fees for hosts.
                                </p>
                            </div>

                            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                                    <Shield className="w-6 h-6 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Trust & Security</h3>
                                <p className="text-muted-foreground">
                                    Smart contracts handle payments and escrow, ensuring funds are safe and released only when conditions are met.
                                </p>
                            </div>

                            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all">
                                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                                    <Globe className="w-6 h-6 text-purple-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Global Access</h3>
                                <p className="text-muted-foreground">
                                    Anyone with a crypto wallet can book or host, breaking down borders and banking restrictions.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* For Guests & Hosts Split */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                            <div className="order-2 lg:order-1">
                                <div className="inline-flex items-center gap-2 text-amber-500 font-semibold mb-4">
                                    <Users className="w-5 h-5" />
                                    For Guests
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">Travel Without Boundaries</h2>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        </div>
                                        <p className="text-muted-foreground">Pay with cryptocurrency seamlessly.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        </div>
                                        <p className="text-muted-foreground">Transparent reviews and reputation system.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        </div>
                                        <p className="text-muted-foreground">Direct communication with hosts.</p>
                                    </li>
                                </ul>
                                <Link to="/properties">
                                    <Button variant="outline" size="lg" className="rounded-xl">Find a Place</Button>
                                </Link>
                            </div>
                            <div className="order-1 lg:order-2 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-3xl p-8 h-[400px] flex items-center justify-center">
                                <Home className="w-32 h-32 text-amber-500/50" />
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8 h-[400px] flex items-center justify-center">
                                <Key className="w-32 h-32 text-blue-500/50" />
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-2 text-blue-500 font-semibold mb-4">
                                    <Home className="w-5 h-5" />
                                    For Hosts
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">Earn More, Worry Less</h2>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-1">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        </div>
                                        <p className="text-muted-foreground">Keep more of your earnings with minimal fees.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-1">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        </div>
                                        <p className="text-muted-foreground">Instant payouts via smart contracts.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-1">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        </div>
                                        <p className="text-muted-foreground">Full control over your listings and rules.</p>
                                    </li>
                                </ul>
                                <Link to="/host/create-listing">
                                    <Button variant="outline" size="lg" className="rounded-xl">Become a Host</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="bg-gradient-to-r from-primary to-primary-light rounded-3xl p-12 text-center text-primary-foreground relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Join the Revolution?</h2>
                                <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                                    Experience the future of property rental today. Secure, transparent, and decentralized.
                                </p>
                                <Link to="/properties">
                                    <Button size="lg" variant="secondary" className="h-14 px-8 rounded-xl text-lg font-semibold shadow-lg hover:scale-105 transition-transform">
                                        Get Started Now
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default LearnMore;
