'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  borderColor: string;
  textColor?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  borderColor,
  textColor = 'text-foreground'
}) => {
  return (
    <Card className={`${borderColor} hover:shadow-lg transition-all duration-300 group overflow-hidden relative`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-2 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className={`text-3xl font-bold tracking-tight ${textColor}`}>{value}</p>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icon className={`h-7 w-7 ${textColor}`} />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent"></div>
      </CardContent>
    </Card>
  );
};

