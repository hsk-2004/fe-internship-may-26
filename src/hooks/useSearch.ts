import { useState, useEffect, useRef } from 'react'
import type { Item } from '../types'
import { searchItems } from '../services/mockApi'
import { useDebounce } from './useDebounce'

export interface UseSearchReturn {
  query: string
  setQuery: (q: string) => void
  results: Item[]
  isLoading: boolean
  error: string | null
}

export function useSearch(): UseSearchReturn {
  // Read initial query from URL if present (?q=react)
  const initialQuery = new URLSearchParams(window.location.search).get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce the query using the reusable hook
  const debouncedQuery = useDebounce(query, 300)

  // Track the latest request so stale responses can be ignored
  const requestIdRef = useRef(0)

  useEffect(() => {
    // Increment request ID so any in-flight request becomes stale
    const currentRequestId = ++requestIdRef.current

    setIsLoading(true)
    setError(null)

    searchItems(debouncedQuery)
      .then((items) => {
        // Stale-response guard: only update if this is still the latest request
        if (currentRequestId !== requestIdRef.current) return

        setResults(items)
        setIsLoading(false)
      })
      .catch((err) => {
        if (currentRequestId !== requestIdRef.current) return

        setError(err instanceof Error ? err.message : 'An error occurred')
        setResults([])
        setIsLoading(false)
      })

    // Cleanup: mark this request as stale on unmount or re-run
    return () => {
      requestIdRef.current++
    }
  }, [debouncedQuery])

  // Sync the debounced query to the URL
  useEffect(() => {
    const url = new URL(window.location.href)
    if (debouncedQuery) {
      url.searchParams.set('q', debouncedQuery)
    } else {
      url.searchParams.delete('q')
    }
    window.history.replaceState({}, '', url.toString())
  }, [debouncedQuery])

  return { query, setQuery, results, isLoading, error }
}


