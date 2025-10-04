/**
 * Navigation Context for managing breadcrumbs and navigation state
 */

import { BreadcrumbItem } from '@/components/navigation/BrutalistBreadcrumbs';
import React, { createContext, useContext, useState, useCallback } from 'react';

interface NavigationContextType {
   breadcrumbs: BreadcrumbItem[];
   stackDepth: number;
   setBreadcrumbs: (items: BreadcrumbItem[]) => void;
   addBreadcrumb: (item: BreadcrumbItem) => void;
   removeBreadcrumb: (id: string) => void;
   clearBreadcrumbs: () => void;
   setStackDepth: (depth: number) => void;
   pushStack: () => void;
   popStack: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
   children: React.ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
   const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
   const [stackDepth, setStackDepth] = useState(0);

   const addBreadcrumb = useCallback((item: BreadcrumbItem) => {
      setBreadcrumbs(prev => {
         const existingIndex = prev.findIndex(b => b.id === item.id);
         if (existingIndex >= 0) {
            // Update existing breadcrumb
            const updated = [...prev];
            updated[existingIndex] = item;
            return updated;
         }
         // Add new breadcrumb
         return [...prev, item];
      });
   }, []);

   const removeBreadcrumb = useCallback((id: string) => {
      setBreadcrumbs(prev => prev.filter(b => b.id !== id));
   }, []);

   const clearBreadcrumbs = useCallback(() => {
      setBreadcrumbs([]);
      setStackDepth(0);
   }, []);

   const pushStack = useCallback(() => {
      setStackDepth(prev => prev + 1);
   }, []);

   const popStack = useCallback(() => {
      setStackDepth(prev => Math.max(0, prev - 1));
   }, []);

   const value = {
      breadcrumbs,
      stackDepth,
      setBreadcrumbs,
      addBreadcrumb,
      removeBreadcrumb,
      clearBreadcrumbs,
      setStackDepth,
      pushStack,
      popStack,
   };

   return (
      <NavigationContext.Provider value={value}>
         {children}
      </NavigationContext.Provider>
   );
}

export function useNavigation() {
   const context = useContext(NavigationContext);
   if (context === undefined) {
      throw new Error('useNavigation must be used within a NavigationProvider');
   }
   return context;
}

// Hook for managing page-level breadcrumbs
export function useBreadcrumbs(items: BreadcrumbItem[]) {
   const { setBreadcrumbs } = useNavigation();

   React.useEffect(() => {
      setBreadcrumbs(items);
   }, [items, setBreadcrumbs]);
}