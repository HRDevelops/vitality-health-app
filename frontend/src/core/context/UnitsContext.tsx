import { createContext, useContext, useState, ReactNode } from 'react';

export type UnitSystem = 'metric' | 'imperial';

const STORAGE_KEY = 'vitality_unit_system';

interface UnitParts {
  value: string;
  unit: string;
}

interface UnitsContextValue {
  unitSystem: UnitSystem;
  setUnitSystem: (value: UnitSystem) => void;
  formatWeight: (kg: number) => UnitParts;
  formatDistance: (km: number) => UnitParts;
  formatVolume: (ml: number) => UnitParts;
  formatHeight: (cm: number) => string;
}

const UnitsContext = createContext<UnitsContextValue | null>(null);

function readUnitSystem(): UnitSystem {
  return localStorage.getItem(STORAGE_KEY) === 'imperial' ? 'imperial' : 'metric';
}

export function UnitsProvider({ children }: { children: ReactNode }) {
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>(() => readUnitSystem());

  const setUnitSystem = (value: UnitSystem) => {
    setUnitSystemState(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  const formatWeight = (kg: number): UnitParts =>
    unitSystem === 'imperial' ? { value: (kg * 2.20462).toFixed(1), unit: 'lbs' } : { value: String(kg), unit: 'kg' };

  const formatDistance = (km: number): UnitParts =>
    unitSystem === 'imperial' ? { value: (km * 0.621371).toFixed(1), unit: 'mi' } : { value: String(km), unit: 'km' };

  const formatVolume = (ml: number): UnitParts =>
    unitSystem === 'imperial' ? { value: String(Math.round(ml * 0.033814)), unit: 'oz' } : { value: String(ml), unit: 'ml' };

  const formatHeight = (cm: number): string => {
    if (unitSystem === 'metric') return `${cm} cm`;
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };

  return (
    <UnitsContext.Provider value={{ unitSystem, setUnitSystem, formatWeight, formatDistance, formatVolume, formatHeight }}>
      {children}
    </UnitsContext.Provider>
  );
}

export function useUnits() {
  const ctx = useContext(UnitsContext);
  if (!ctx) throw new Error('useUnits must be used within UnitsProvider');
  return ctx;
}
