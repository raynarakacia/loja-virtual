import { useState, useCallback, ChangeEvent } from 'react';

export function useSearch<T>(
  items: T[],
  searchableFields: (keyof T)[],
) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter items based on search term
  const searchResults = items.filter(item => {
    if (!searchTerm.trim()) return true;
    
    const lowercasedTerm = searchTerm.toLowerCase();
    
    return searchableFields.some(field => {
      const value = item[field];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(lowercasedTerm);
    });
  });

  // Handle search input change
  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  return {
    searchTerm,
    searchResults,
    setSearchTerm,
    handleSearch,
  };
}
