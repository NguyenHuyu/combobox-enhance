export type TypeValue = string | number;

// API Response interfaces
export interface IContentData<T> {
  content: T[];
  totalPages?: number;
  totalElements?: number;
  size?: number;
  page?: number;
  sort?: number[];
  numberOfElements?: number;
}

export interface IResponse<T> {
  data: IContentData<T> | null;
  statusCode: number;
  message: string;
}

export interface IResponseFetch {
  statusCode: number;
  message?: string;
  fields?: Record<string, string>;
  issues?: string[];
}

export interface ResponseBodyData<T> extends IResponseFetch {
  data?: T | null;
}

export interface ResponseData {
  statusCode: number;
  message: string;
}

// Generic type for items
export type ComboboxItem = Record<string, unknown>;

// Data fetching function types
export type FetchItemsFunction<T> = (
  page: number,
  size?: number
) => Promise<IResponse<T>>;
export type SearchItemsFunction<T> = (
  filter: string,
  query: string,
  page: number,
  size?: number
) => Promise<IResponse<T>>;

export type FetchItemByIdFunction<T> = (
  id: string | number
) => Promise<ResponseBodyData<T>>;

// Helper function to normalize values for comparison
export function normalizeValue(value: TypeValue): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

// Helper function to determine if two values are equal, regardless of type
export function areValuesEqual(value1: TypeValue, value2: TypeValue): boolean {
  return normalizeValue(value1) === normalizeValue(value2);
}

export interface ApiFlexibleComboboxProps<T extends ComboboxItem> {
  // Core props
  placeholder?: string;
  emptyMessage?: string;
  value?: TypeValue;
  onChange: (value: TypeValue) => void;
  disabled?: boolean;
  formLabel?: string;
  initialItems?: T[];

  // Value handling
  preserveValueType?: boolean; // If true, will preserve the original type of the value

  // Data fetching functions
  fetchItems: FetchItemsFunction<T>;
  searchItems?: SearchItemsFunction<T>;
  fetchItemById?: FetchItemByIdFunction<T>;

  // Customization props
  displayKey?: keyof T;
  valueKey?: keyof T;
  multiple?: boolean;
  maxSelected?: number;
  renderItem?: (item: T, isSelected: boolean) => React.ReactNode;
  renderSelectedItem?: (item: T) => React.ReactNode;
  filterFunction?: (item: T, searchValue: string) => boolean;
  groupBy?: (item: T) => string;
  customTrigger?: React.ReactNode;

  // Behavior props
  closeOnSelect?: boolean;
  searchPlaceholder?: string;
  loadingMessage?: string;
  pageSize?: number;
  searchDebounce?: number;
  disableSearch?: boolean;

  // Style props
  className?: string;
  popoverClassName?: string;
  triggerClassName?: string;
  commandClassName?: string;

  // Custom props
  searchQueryKeys: {
    label: string;
    value: string;
  }[];
}
