"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const TermsView = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Card className="w-full">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
                        <p className="text-muted-foreground">Last updated: August 11, 2025</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    By accessing and using Meet.AI, you accept and agree to be bound by the terms and provision of this agreement.
                                </p>
                            </section>

                            <Separator />

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold">2. Use License</h2>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Permission is granted to temporarily use Meet.AI for personal, non-commercial transitory viewing only. 
                                    This is the grant of a license, not a transfer of title, and under this license you may not:
                                </p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                                    <li>Modify or copy the materials</li>
                                    <li>Use the materials for any commercial purpose or for any public display</li>
                                    <li>Attempt to reverse engineer any software contained on the website</li>
                                    <li>Remove any copyright or other proprietary notations from the materials</li>
                                </ul>
                            </section>

                            <Separator />

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold">3. AI Services</h2>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Meet.AI provides AI-powered video calling and meeting analysis services. By using our AI features, you acknowledge that:
                                </p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                                    <li>AI-generated content may not always be accurate</li>
                                    <li>Meeting recordings and transcripts are processed for AI analysis</li>
                                    <li>You are responsible for the content shared during meetings</li>
                                </ul>
                            </section>

                            <Separator />

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold">4. User Accounts</h2>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
                                    You are responsible for safeguarding the password and for all activities under your account.
                                </p>
                            </section>

                            <Separator />

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold">5. Privacy and Data</h2>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, 
                                    to understand our practices regarding the collection and use of your information.
                                </p>
                            </section>

                            <Separator />

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold">6. Limitation of Liability</h2>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    In no event shall Meet.AI or its suppliers be liable for any damages (including, without limitation, 
                                    damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
                                    to use the materials on Meet.AI website.
                                </p>
                            </section>

                            <Separator />

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold">7. Modifications</h2>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Meet.AI may revise these terms of service at any time without notice. By using this website, 
                                    you are agreeing to be bound by the then current version of these terms of service.
                                </p>
                            </section>

                            <Separator />

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold">8. Contact Information</h2>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    If you have any questions about these Terms of Service, please contact us at legal@meet-ai.com.
                                </p>
                            </section>
                        </div>

                        <div className="pt-6 border-t">
                            <Link href="/sign-in">
                                <Button className="w-full sm:w-auto" variant="default">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Go back to Sign-in
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};