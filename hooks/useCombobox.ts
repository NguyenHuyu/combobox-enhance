import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  areValuesEqual,
  ComboboxItem,
  FetchItemByIdFunction,
  FetchItemsFunction,
  normalizeValue,
  SearchItemsFunction,
} from "@/components/types";
import { useInView } from "react-intersection-observer";

interface UseComboboxDataProps<T extends ComboboxItem> {
  value: string | number | undefined;
  valueKey: keyof T;
  multiple: boolean;
  fetchItems: FetchItemsFunction<T>;
  searchItems?: SearchItemsFunction<T>;
  fetchItemById?: FetchItemByIdFunction<T>;
  initialItems: T[];
  pageSize: number;
  searchDebounce: number;
  searchQueryKeys: { label: string; value: string }[];
}

export function useComboboxData<T extends ComboboxItem>({
  value,
  valueKey,
  multiple,
  fetchItems,
  searchItems,
  fetchItemById,
  initialItems,
  pageSize,
  searchDebounce,
  searchQueryKeys,
}: UseComboboxDataProps<T>) {
  // Convert value to array for consistent handling
  const valueArray = useMemo(() => {
    return !value
      ? []
      : multiple
      ? Array.isArray(value)
        ? value
        : [value]
      : [value];
  }, [value, multiple]);

  // State
  const [items, setItems] = useState<T[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [searchPage, setSearchPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [initialItemLoaded, setInitialItemLoaded] = useState(false);
  const [initialItemLoading, setInitialItemLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const [filter, setFilter] = useState<string>(searchQueryKeys[0]?.value || "");
  const [open, setOpen] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, searchDebounce);
  const { ref, inView } = useInView({
    threshold: 0,
  });
  // Find selected items from the items array
  const findSelectedItems = useCallback(() => {
    return valueArray.reduce<T[]>((acc, val) => {
      const item = items.find((item) =>
        areValuesEqual(item[valueKey] as string | number, val)
      );
      if (item) acc.push(item);
      return acc;
    }, []);
  }, [items, valueArray, valueKey]);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetchItems(1, pageSize);
      if (response.statusCode === 200 && response.data) {
        const newItems = response.data.content || [];
        const totalPages = response.data.totalPages || 0;

        setItems((prevItems) => {
          const existingIds = new Set(
            prevItems.map((item) =>
              normalizeValue(item[valueKey] as string | number)
            )
          );
          const uniqueNewItems = newItems.filter(
            (item) =>
              !existingIds.has(
                normalizeValue(item[valueKey] as string | number)
              )
          );
          return [...uniqueNewItems];
        });

        setHasMore(1 < totalPages);
        setPage(1);
      }
    } catch (error) {
      console.error("Failed to load initial data:", error);
    } finally {
      setLoading(false);
      setInitialItemLoaded(true);
    }
  }, [fetchItems, loading, pageSize, valueKey]);

  // Load more data (pagination)
  const loadMoreData = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const response = await fetchItems(nextPage, pageSize);
      if (response.statusCode === 200 && response.data) {
        const newItems = response.data.content || [];
        const totalPages = response.data.totalPages || 0;

        setItems((prevItems) => {
          const existingIds = new Set(
            prevItems.map((item) =>
              normalizeValue(item[valueKey] as string | number)
            )
          );
          const uniqueNewItems = newItems.filter(
            (item) =>
              !existingIds.has(
                normalizeValue(item[valueKey] as string | number)
              )
          );
          return [...prevItems, ...uniqueNewItems];
        });
        setHasMore(nextPage < totalPages);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Failed to load more data:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, page, pageSize, fetchItems, valueKey]);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (loading || !searchItems) return;

    setLoading(true);

    try {
      if (!debouncedSearchQuery) {
        // If search is cleared, reset to initial data
        const response = await fetchItems(1, pageSize);
        if (response.statusCode === 200 && response.data) {
          const newItems = response.data.content || [];
          const totalPages = response.data.totalPages || 0;

          setItems(() => {
            // Keep selected items
            const itemsToKeep =
              selectedItems.length > 0 ? [...selectedItems] : [];

            // Add new items, avoiding duplicates
            const existingIds = new Set(
              itemsToKeep.map((item) =>
                normalizeValue(item[valueKey] as string | number)
              )
            );
            const uniqueNewItems = newItems.filter(
              (item) =>
                !existingIds.has(
                  normalizeValue(item[valueKey] as string | number)
                )
            );

            return [...itemsToKeep, ...uniqueNewItems];
          });

          setHasMore(0 < totalPages - 1);
        }

        setPage(1);
        setIsSearchMode(false);
      } else {
        const response = await searchItems(
          filter,
          debouncedSearchQuery,
          1,
          pageSize
        );

        if (response.statusCode === 200 && response.data) {
          const newItems = response.data.content || [];
          const totalPages = response.data.totalPages || 0;

          setItems(() => {
            // Keep selected items
            const itemsToKeep =
              selectedItems.length > 0 ? [...selectedItems] : [];

            // Add new items, avoiding duplicates
            const existingIds = new Set(
              itemsToKeep.map((item) =>
                normalizeValue(item[valueKey] as string | number)
              )
            );
            const uniqueNewItems = newItems.filter(
              (item) =>
                !existingIds.has(
                  normalizeValue(item[valueKey] as string | number)
                )
            );

            return [...itemsToKeep, ...uniqueNewItems];
          });

          setHasMore(0 < totalPages - 1);
        }

        setSearchPage(1);
        setIsSearchMode(true);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    searchItems,
    debouncedSearchQuery,
    fetchItems,
    pageSize,
    selectedItems,
    valueKey,
    filter,
  ]);

  // Load more search results
  const loadMoreSearchResults = useCallback(async () => {
    if (loading || !debouncedSearchQuery || !searchItems) return;

    setLoading(true);

    try {
      const nextPage = searchPage + 1;
      const response = await searchItems(
        filter,
        debouncedSearchQuery,
        nextPage,
        pageSize
      );

      if (response.statusCode === 200 && response.data) {
        const newItems = response.data.content || [];
        const totalPages = response.data.totalPages || 0;

        setItems((prevItems) => {
          const existingIds = new Set(
            prevItems.map((item) =>
              normalizeValue(item[valueKey] as string | number)
            )
          );
          const uniqueNewItems = newItems.filter(
            (item) =>
              !existingIds.has(
                normalizeValue(item[valueKey] as string | number)
              )
          );
          return [...prevItems, ...uniqueNewItems];
        });

        setHasMore(nextPage < totalPages - 1);
        setSearchPage(nextPage);
      }
    } catch (error) {
      console.error("Failed to load more search results:", error);
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    debouncedSearchQuery,
    searchItems,
    filter,
    searchPage,
    pageSize,
    valueKey,
  ]);

  // Update selected items when value or items change
  useEffect(() => {
    setSelectedItems(findSelectedItems());
  }, [findSelectedItems]);

  // Load initial data if not provided
  const loadInitialDataRef = useRef<typeof loadInitialData>(null);
  loadInitialDataRef.current = loadInitialData;

  const loadMoreDataRef = useRef<typeof loadMoreData>(null);
  loadMoreDataRef.current = loadMoreData;

  const handleSearchRef = useRef<typeof handleSearch>(null);
  handleSearchRef.current = handleSearch;

  const loadMoreSearchResultsRef = useRef<typeof loadMoreSearchResults>(null);
  loadMoreSearchResultsRef.current = loadMoreSearchResults;

  useEffect(() => {
    const isCondition =
      initialItems.length === 0 && !initialItemLoaded && !initialItemLoading;
    if (isCondition && loadInitialDataRef.current) {
      loadInitialDataRef.current();
    }
  }, [initialItems.length, initialItemLoaded, initialItemLoading]);

  // Fetch selected items by ID if they're not in the initial list
  useEffect(() => {
    const fetchSelectedItemsIfNeeded = async () => {
      const isCondition =
        !fetchItemById ||
        initialItemLoaded ||
        initialItemLoading ||
        valueArray.length === 0;
      if (isCondition) {
        return;
      }

      const missingValues = valueArray.filter(
        (val) =>
          !items.some((item) =>
            areValuesEqual(item[valueKey] as string | number, val)
          )
      );

      if (missingValues.length === 0) {
        return;
      }

      setInitialItemLoading(true);

      try {
        const newItems: T[] = [];

        for (const val of missingValues) {
          const response = await fetchItemById(val);
          if (response.statusCode === 200 && response.data) {
            newItems.push(response.data as T);
          }
        }

        if (newItems.length > 0) {
          setItems((prevItems) => {
            const existingIds = new Set(
              prevItems.map((item) =>
                normalizeValue(item[valueKey] as string | number)
              )
            );
            const uniqueNewItems = newItems.filter(
              (item) =>
                !existingIds.has(
                  normalizeValue(item[valueKey] as string | number)
                )
            );

            return [...uniqueNewItems, ...prevItems];
          });
        }
      } catch (error) {
        console.error("Failed to fetch selected items:", error);
      } finally {
        setInitialItemLoaded(true);
        setInitialItemLoading(false);
      }
    };

    fetchSelectedItemsIfNeeded();
  }, [
    fetchItemById,
    items,
    valueArray,
    valueKey,
    initialItemLoaded,
    initialItemLoading,
  ]);

  // Handle infinite scroll
  useEffect(() => {
    if (inView && hasMore && !loading && open) {
      if (
        isSearchMode &&
        debouncedSearchQuery &&
        searchItems &&
        loadMoreSearchResultsRef.current
      ) {
        loadMoreSearchResultsRef.current();
      } else if (!isSearchMode && loadMoreDataRef.current) {
        loadMoreDataRef.current();
      }
    }
  }, [
    inView,
    hasMore,
    loading,
    open,
    isSearchMode,
    debouncedSearchQuery,
    searchItems,
  ]);

  // Handle search query changes
  useEffect(() => {
    if (
      open &&
      debouncedSearchQuery !== undefined &&
      searchItems &&
      handleSearchRef.current
    ) {
      handleSearchRef.current();
    }
  }, [debouncedSearchQuery, open, searchItems]);

  return {
    items,
    loading,
    searchQuery,
    setSearchQuery,
    hasMore,
    isSearchMode,
    initialItemLoading,
    selectedItems,
    filter,
    setFilter,
    ref,
    inView,
    debouncedSearchQuery,
    loadInitialData,
    loadMoreData,
    handleSearch,
    loadMoreSearchResults,
    open,
    setOpen,
    valueArray,
  };
}
