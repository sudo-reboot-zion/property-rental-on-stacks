
import { kindwordsData } from '@/lib/data'
import React from 'react'
import { useTranslation } from 'react-i18next'
import RecommendCard from './RecommendCard'

function KindWords() {
    const { t } = useTranslation()
    return (
        <section className='py-16 md:py-20 lg:py-24 bg-muted/30'>
            <div className='container mx-auto px-4 sm:px-6'>



                <div className='text-center mb-12 md:mb-16'>
                    <h2 className='text-3xl sm:text-4xl md:text-5xl uppercase  font-bold text-foreground mb-4'>
                        {t('kindWords.title')}
                    </h2>
                    <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                        {t('kindWords.subtitle')}
                    </p>
                </div>

                {/* GRID OF TESTIMONIAL CARDS */}
                <div className='max-w-7xl mx-auto px-4 sm:px-6'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 lg:gap-10'>
                        {kindwordsData.map((item, index) => (
                            <div
                                key={item.id || index}
                                className="flex justify-center transform transition-transform duration-300 hover:-translate-y-2"
                            >
                                <RecommendCard
                                    name={item.name}
                                    testimonyKey={item.testimonyKey}
                                />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    )
}

export default KindWords
