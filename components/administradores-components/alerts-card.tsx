'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface Alert {
  id: string;
  severity: 'high' | 'medium' | 'info';
  title: string;
  description: string;
  dotColor: string;
}

interface AlertsCardProps {
  alerts: Alert[];
}

export const AlertsCard: React.FC<AlertsCardProps> = ({ alerts }) => {
  return (
    <div className="mt-6">
      <Card className="border-warning bg-warning/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <Activity className="h-5 w-5" />
            Alertas y Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className="flex items-center gap-3 p-3 bg-background rounded border border-warning/20"
              >
                <div className={`w-2 h-2 ${alert.dotColor} rounded-full`}></div>
                <div>
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

