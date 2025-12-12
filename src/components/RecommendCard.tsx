import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Quote } from 'lucide-react';

function RecommendCard({ name, testimonyKey }: { name: string; testimonyKey: string }) {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-[350px] h-auto relative flex flex-col group">

      {/* Card Bubble */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative">
        {/* Quote Icon */}
        <div className="absolute -top-4 -left-2 bg-primary text-primary-foreground p-2 rounded-full shadow-sm">
          <Quote className="w-4 h-4" />
        </div>

        <p className="text-base text-card-foreground leading-relaxed italic">
          "{t(testimonyKey)}"
        </p>

        {/* Speech Bubble Tail */}
        <div className="absolute -bottom-3 right-8 w-6 h-6 bg-card border-b border-r border-border transform rotate-45"></div>
      </div>

      {/* Author Name */}
      <div className="flex items-center justify-end px-4 mt-4">
        <div className="text-right">
          <p className="font-semibold text-foreground text-sm">
            {name}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('common.verifiedUser')}
          </p>
        </div>
        <div className="ml-3 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold text-sm">
          {name.charAt(0)}
        </div>
      </div>
    </div>
  );
}

export default RecommendCard;