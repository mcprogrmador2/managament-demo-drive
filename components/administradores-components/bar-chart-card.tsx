'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { HelpCircle } from 'lucide-react';

interface BarChartData {
  name: string;
  [key: string]: string | number;
}

interface BarChartCardProps {
  title: string;
  data: BarChartData[];
  dataKey: string;
  barColor?: string;
}

export const BarChartCard: React.FC<BarChartCardProps> = ({
  title,
  data,
  dataKey,
  barColor = 'var(--chart-1)'
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
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 bg-chart-1 rounded"></div>
          <span className="text-xs font-medium">
            {dataKey.charAt(0).toUpperCase() + dataKey.slice(1)}
          </span>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ right: 16 }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.split(' ')[0]}
                fontSize={10}
              />
              <XAxis dataKey={dataKey} type="number" hide />
              <Tooltip />
              <Bar
                dataKey={dataKey}
                fill={barColor}
                radius={4}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

