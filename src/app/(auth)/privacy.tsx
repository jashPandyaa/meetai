"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Shield, Eye, Database, Users } from "lucide-react";
import Link from "next/link";

export const PrivacyView = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Card className="w-full">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
                            <Shield className="w-8 h-8" />
                            Privacy Policy
                        </CardTitle>
                        <p className="text-muted-foreground">Last updated: August 11, 2025</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-muted/50 p-4 rounded-lg border">
                            <p className="text-sm text-muted-foreground">
                                At Meet.AI, we take your privacy seriously. This Privacy Policy explains how we collect, 
                                use, and protect your information when you use our AI-powered video calling service.
                            </p>
                        </div>

                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Database className="w-5 h-5" />
                                    <h2 className="text-xl font-semibold">1. Information We Collect</h2>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="font-medium text-base">Personal Information</h3>
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            When you create an account, we collect your email address, name, and profile information.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-base">Meeting Data</h3>
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            We process video calls, audio recordings, transcripts, and AI-generated summaries to provide our services.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-base">Usage Information</h3>
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            We collect information about how you use our service, including meeting frequency, duration, and feature usage.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <Separator />

                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-5 h-5" />
                                    <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
                                </div>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-4">
                                    <li>To provide and maintain our AI-powered video calling service</li>
                                    <li>To generate meeting transcripts, summaries, and AI insights</li>
                                    <li>To improve our AI models and service quality</li>
                                    <li>To communicate with you about your account and our services</li>
                                    <li>To ensure the security and integrity of our platform</li>
                                </ul>
                            </section>

                            <Separator />

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold">3. AI Processing and Data</h2>
                                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">
                                        <strong>Important:</strong> Your meeting recordings and transcripts are processed by AI services 
                                        to generate summaries, insights, and enable AI chat functionality. This processing happens 
                                        securely and your data is not used to train third-party AI models.
                                    </p>
                                </div>
                            </section>

                            <Separator />

                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    <h2 className="text-xl font-semibold">4. Information Sharing</h2>
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    We do not sell your personal information. We may share your information only in these limited circumstances:
                                </p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                                    <li>With other meeting participants (as part of the service functionality)</li>
                                    <li>With AI service providers for processing (under strict privacy agreements)</li>
                                    <li>When required by law or to protect our rights</li>
                                    <li>In connection with a business transfer or acquisition</li>
                                </ul>
                            </section>

                            <Separator />

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold">5. Data Security</h2>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    We implement appropriate technical and organizational measures to protect your personal information, 
                                    including encryption in transit and at rest, regular security audits, and access controls.
                                </p>
                            </section>

                            <Separator />

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold">6. Data Retention</h2>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    We retain your personal information and meeting data for as long as necessary to provide our services 
                                    and comply with legal obligations. You can delete your account and associated data at any time.
                                </p>
                            </section>

                            <Separator />

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold">7. Your Rights</h2>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Depending on your location, you may have rights to:
                                </p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                                    <li>Access and download your personal information</li>
                                    <li>Correct inaccurate information</li>
                                    <li>Delete your account and associated data</li>
                                    <li>Object to certain processing activities</li>
                                    <li>Data portability</li>
                                </ul>
                            </section>

                            <Separator />

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold">8. Changes to This Policy</h2>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                                    the new Privacy Policy on this page and updating the Last updated date.
                                </p>
                            </section>

                            <Separator />

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold">9. Contact Us</h2>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
                                </p>
                                <div className="bg-muted/50 p-3 rounded border text-sm">
                                    <strong>Email:</strong> jashpandyaa@gmail.com<br />
                                    <strong>Address:</strong> Meet.AI Privacy Team
                                </div>
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