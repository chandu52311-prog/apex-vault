'use client';

import { useState, useEffect } from 'react';
import { REGION_REGISTRY, RegionConfig } from './regions';

export function useGlobalLocation() {
  const [selectedRegion, setSelectedRegion] = useState<string>('US');
  const [selectedCity, setSelectedCity] = useState<string>('New York, NY');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCountry = localStorage.getItem('apex_selected_country');
      const savedCity = localStorage.getItem('apex_selected_city');
      if (savedCountry && REGION_REGISTRY[savedCountry]) {
        setSelectedRegion(savedCountry);
      }
      if (savedCity) {
        setSelectedCity(savedCity);
      }
    }
  }, []);

  const selectRegion = (code: string) => {
    const reg = REGION_REGISTRY[code];
    if (reg) {
      setSelectedRegion(code);
      const defaultCity = reg.cities[0] || '';
      setSelectedCity(defaultCity);
      if (typeof window !== 'undefined') {
        localStorage.setItem('apex_selected_country', code);
        localStorage.setItem('apex_selected_city', defaultCity);
      }
    }
  };

  const selectCity = (city: string) => {
    setSelectedCity(city);
    if (typeof window !== 'undefined') {
      localStorage.setItem('apex_selected_city', city);
    }
  };

  const region: RegionConfig = REGION_REGISTRY[selectedRegion] || REGION_REGISTRY['US'];

  return {
    selectedRegion,
    selectedCity,
    region,
    selectRegion,
    selectCity,
  };
}
