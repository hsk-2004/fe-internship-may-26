import { useState, useEffect, useRef } from 'react'
import type { Item } from '../types'
import { searchItems } from '../services/mockApi'

export interface UseSearchReturn {
  query: string
  setQuery: (q: string) => void
  results: Item[]
  isLoading: boolean
  error: string | null
}

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track the latest request so stale responses can be ignored
  const requestIdRef = useRef(0)

  useEffect(() => {
    // Increment request ID so any in-flight request becomes stale
    const currentRequestId = ++requestIdRef.current

    setIsLoading(true)
    setError(null)

    const timerId = setTimeout(() => {
      searchItems(query)
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
    }, 300)

    // Cleanup: cancel the debounce timer and mark this request as stale
    return () => {
      clearTimeout(timerId)
      requestIdRef.current++ // invalidate this request's ID
    }
  }, [query])

  return { query, setQuery, results, isLoading, error }
}

