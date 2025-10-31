'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { HelpCircle } from 'lucide-react';

interface PieChartData {
  name: string;
  value: number;
  fill: string;
  [key: string]: any; 
}

interface PieChartCardProps {
  title: string;
  data: PieChartData[];
  totalAmount?: number;
}

export const PieChartCard: React.FC<PieChartCardProps> = ({
  title,
  data,
  totalAmount
}) => {
  return (
    <Card className="border-primary/10">
      <CardHeader className="bg-primary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary text-sm font-semibold">
            {title}
          </CardTitle>
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {totalAmount && (
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-warning">S/.{totalAmount.toLocaleString()}</div>
          </div>
        )}
        <div className="mx-auto aspect-square max-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={40}
                outerRadius={80}
                strokeWidth={5}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className={`${data.length > 4 ? 'grid grid-cols-2' : 'flex justify-center'} gap-2 mt-4`}>
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-xs font-medium">{item.name} {item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

