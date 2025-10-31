/**
 * Hook para inicialización del sistema
 * Asegura que los datos por defecto existan
 */

'use client';

import React, { useEffect } from 'react';
import { initializeProjectData } from '@/lib/projectStorage';

export function useInitializeSystem() {
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      initializeProjectData();
    }
  }, []);
}

/**
 * Provider para inicializar el sistema
 */
export function SystemInitializer({ children }: { children: React.ReactNode }) {
  useInitializeSystem();
  return React.createElement(React.Fragment, null, children);
}
