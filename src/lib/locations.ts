'use client';

import { useState, useEffect } from 'react';
import { COUNTRIES, COUNTRY_INDEX, Country, Metro, CATEGORIES, TABLES, CategoryKey, Table, isCategoryKey } from './regions';

export { CATEGORIES, TABLES, isCategoryKey, COUNTRIES };
export type { CategoryKey, Table };

export function useRegion() {
  const [countryId, setCountryId] = useState<string>('US');
  const [metroId, setMetroId] = useState<string>('us-nyc');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCountry = localStorage.getItem('apex_selected_country');
      const savedMetro = localStorage.getItem('apex_selected_metro');
      if (savedCountry && COUNTRY_INDEX[savedCountry]) {
        setCountryId(savedCountry);
      }
      if (savedMetro) {
        setMetroId(savedMetro);
      }
    }
  }, []);

  const selectCountry = (cId: string) => {
    const found = COUNTRY_INDEX[cId];
    if (found) {
      setCountryId(cId);
      const defaultMetro = found.metros[0]?.id || '';
      setMetroId(defaultMetro);
      if (typeof window !== 'undefined') {
        localStorage.setItem('apex_selected_country', cId);
        localStorage.setItem('apex_selected_metro', defaultMetro);
      }
    }
  };

  const selectMetro = (mId: string) => {
    setMetroId(mId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('apex_selected_metro', mId);
    }
  };

  const country = COUNTRY_INDEX[countryId] || COUNTRIES[0];
  const metro = country.metros.find((m: Metro) => m.id === metroId) || country.metros[0] || {
    id: 'us-nyc',
    name: 'New York, NY',
    taxRate: 0.088,
  };

  return { country, metro, selectCountry, selectMetro, COUNTRIES };
}
