import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

const FAQSection = () => {
    const { t } = useTranslation();
    return (
        <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4 font-heading">{t('faq.title')}</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {t('faq.subtitle')}
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {/* Fees */}
                        <AccordionItem value="item-1" className="bg-card px-6 rounded-xl border border-border">
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                {t('faq.q1.question')}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                {t('faq.q1.answer')}
                            </AccordionContent>
                        </AccordionItem>

                        {/* Transaction Pending */}
                        <AccordionItem value="item-2" className="bg-card px-6 rounded-xl border border-border">
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                {t('faq.q2.question')}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                {t('faq.q2.answer')}
                            </AccordionContent>
                        </AccordionItem>

                        {/* Not Enough STX */}
                        <AccordionItem value="item-3" className="bg-card px-6 rounded-xl border border-border">
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                {t('faq.q3.question')}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                {t('faq.q3.answer')}
                            </AccordionContent>
                        </AccordionItem>

                        {/* Host Not Responding */}
                        <AccordionItem value="item-4" className="bg-card px-6 rounded-xl border border-border">
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                {t('faq.q4.question')}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                {t('faq.q4.answer')}
                            </AccordionContent>
                        </AccordionItem>

                        {/* Property Mismatch */}
                        <AccordionItem value="item-5" className="bg-card px-6 rounded-xl border border-border">
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                {t('faq.q5.question')}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                {t('faq.q5.answer')}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
