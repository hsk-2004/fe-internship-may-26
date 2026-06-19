import { useState, useEffect } from 'react'
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

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    const timerId = setTimeout(() => {
      searchItems(query)
        .then((items) => {
          setResults(items)
          setIsLoading(false)
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'An error occurred')
          setResults([])
          setIsLoading(false)
        })
    }, 300)

    return () => {
      clearTimeout(timerId)
    }
  }, [query])

  return { query, setQuery, results, isLoading, error }
}

