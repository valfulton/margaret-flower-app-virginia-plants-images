'use client';

import { useState, Suspense } from 'react';
import { AdvancedSearchPanel } from './advanced-search-panel';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Props {
  children: React.ReactNode;
  searchQuery?: string;
}

export function MainPageWithSearch({ children, searchQuery = '' }: Props) {
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);

  return (
    <>
      <main className="mx-auto max-w-6xl p-6">
        <Header onOpenSearch={() => setIsSearchPanelOpen(true)} />
        <SearchBar defaultValue={searchQuery} />
        <Suspense fallback={null}>
          <ActiveFilters />
        </Suspense>
        {children}
      </main>

      <Suspense fallback={null}>
        <AdvancedSearchPanel
          isOpen={isSearchPanelOpen}
          onClose={() => setIsSearchPanelOpen(false)}
        />
      </Suspense>
    </>
  );
}

function Header({ onOpenSearch }: { onOpenSearch: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-bold">NOVA Native Plants</h1>
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Search By Category"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="hidden sm:inline">Advanced Search</span>
        </button>
        <Link
          href="/admin"
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          title="Admin Panel"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="hidden sm:inline">Admin</span>
        </Link>
      </div>
    </div>
  );
}

function SearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  return (
    <form action="/" className="w-full">
      <div className="relative max-w-xl">
        <input
          name="q"
          defaultValue={defaultValue}
          placeholder="Search plants by name, region, function, growing tips, wildlife info, pH…"
          aria-label="Search flowers"
          className="w-full rounded-xl border px-4 py-2 pr-10 outline-none focus:ring"
        />
        {defaultValue && (
          <Link
            href="/"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        )}
      </div>
    </form>
  );
}

function ActiveFilters() {
  const searchParams = useSearchParams();
  
  // Check if any filter parameters are present
  const hasFilters = ['cat_code', 'height_code', 'bloom_code', 'moist_code', 'sun_code', 'wild_code', 'soil_code', 'deer_code'].some(
    param => searchParams.get(param)
  );

  const hasTextSearch = searchParams.get('q');
  
  if (!hasFilters && !hasTextSearch) return null;

  return (
    <div className="mb-4 flex items-center gap-4">
      {(hasFilters || hasTextSearch) && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {hasFilters && hasTextSearch ? 'Filtered search results' : 
             hasFilters ? 'Filtered results' : 
             'Search results'}
          </span>
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Show All Plants
          </Link>
        </div>
      )}
    </div>
  );
}
