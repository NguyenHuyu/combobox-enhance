"use client";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ApiFlexibleComboboxProps,
  areValuesEqual,
  ComboboxItem,
  normalizeValue,
  TypeValue,
} from "./types";
import { useMemo, Fragment } from "react";
import { useComboboxData } from "@/hooks/useCombobox";

export function ApiFlexibleCombobox<T extends ComboboxItem>({
  // Core props
  placeholder = "Select an item...",
  emptyMessage = "No items found.",
  value,
  onChange,
  disabled = false,
  formLabel,
  initialItems = [],

  // Value handling
  preserveValueType = true,

  // Data fetching functions
  fetchItems,
  searchItems,
  fetchItemById,

  // Customization props
  displayKey = "name" as keyof T,
  valueKey = "id" as keyof T,
  multiple = false,
  maxSelected,
  renderItem,
  renderSelectedItem,
  groupBy,
  customTrigger,

  // Behavior props
  closeOnSelect = !multiple,
  searchPlaceholder = "Search...",
  loadingMessage = "Loading...",
  pageSize = 10,
  searchDebounce = 500,
  disableSearch = false,

  // Style props
  className,
  popoverClassName,
  triggerClassName,
  commandClassName,
  searchQueryKeys = [],
}: ApiFlexibleComboboxProps<T>) {
  const {
    items,
    loading,
    searchQuery,
    setSearchQuery,
    hasMore,
    initialItemLoading,
    selectedItems,
    filter,
    setFilter,
    ref,
    open,
    setOpen,
    valueArray,
  } = useComboboxData<T>({
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
  });

  // Get the original type of the value for consistent return type
  const getOriginalValueType = (selectedItem: string): string | number => {
    // Find the item in our items array to get its original type
    const item = items.find(
      (item) => normalizeValue(item[valueKey] as TypeValue) === selectedItem
    );

    if (item) {
      // Return the value with its original type
      return item[valueKey] as TypeValue;
    }

    // If we can't find the item, try to determine type from current value
    if (!preserveValueType) {
      return selectedItem;
    }

    // For single select, check the current value's type
    if (!multiple && value !== undefined && value !== null) {
      return typeof value === "number" ? Number(selectedItem) : selectedItem;
    }

    // For multi-select, check the first item's type if available
    if (multiple && Array.isArray(value) && value.length > 0) {
      return typeof value[0] === "number" ? Number(selectedItem) : selectedItem;
    }

    // Default to string if we can't determine
    return selectedItem;
  };

  // Handle item selection
  const handleSelect = (itemValue: string) => {
    if (multiple) {
      // For multi-select
      const newValue = [...valueArray];

      // Find if the value exists in our current selection
      const index = newValue.findIndex((val) => areValuesEqual(val, itemValue));

      if (index === -1) {
        // Add the value if it doesn't exist
        if (maxSelected && newValue.length >= maxSelected) {
          // If we've reached the maximum number of selections, replace the last one
          newValue[newValue.length - 1] = getOriginalValueType(itemValue);
        } else {
          // Otherwise just add it
          newValue.push(getOriginalValueType(itemValue));
        }
      } else {
        // Remove the value if it exists
        newValue.splice(index, 1);
      }

      onChange(multiple ? newValue : newValue[0]);
    } else {
      // For single select
      const currentValue = value !== undefined ? normalizeValue(value) : "";
      const newValue = normalizeValue(itemValue);

      // Only change if different
      if (currentValue !== newValue) {
        onChange(getOriginalValueType(itemValue));
      } else {
        // If clicking the same item, clear selection if desired
        // Uncomment the next line if you want to clear selection on second click
        // onChange("");
      }
    }

    if (closeOnSelect) {
      setOpen(false);
    }
  };

  // Group items if groupBy function is provided
  const groupedItems = useMemo(() => {
    if (!groupBy) {
      return { "": items };
    }

    return items.reduce((groups, item) => {
      const groupName = groupBy(item);
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }, [items, groupBy]);

  // Render the trigger button content
  const renderTriggerContent = () => {
    if (customTrigger) {
      return customTrigger;
    }

    if (initialItemLoading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingMessage}
        </>
      );
    }

    if (multiple && selectedItems.length > 0) {
      return (
        <div className="flex items-center">
          <span className="truncate">
            {selectedItems.length === 1
              ? String(selectedItems[0][displayKey])
              : `${selectedItems.length} items selected`}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </div>
      );
    }

    return (
      <>
        {selectedItems.length > 0
          ? renderSelectedItem
            ? renderSelectedItem(selectedItems[0])
            : String(selectedItems[0][displayKey])
          : placeholder}

        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </>
    );
  };

  // Default item renderer
  const defaultRenderItem = (item: T, isSelected: boolean) => (
    <>
      <Check
        className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
      />
      {String(item[displayKey])}
    </>
  );

  return (
    <div className={cn("flex flex-col space-y-1.5", className)}>
      {formLabel && <label className="text-sm font-medium">{formLabel}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("justify-between", triggerClassName)}
            disabled={disabled || initialItemLoading}
          >
            {renderTriggerContent()}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn("p-0 w-[300px]", popoverClassName)}
          align="start"
          side="bottom"
        >
          <Command shouldFilter={false} className={commandClassName}>
            {!disableSearch && (
              <div className="flex flex-row items-center border-b">
                <div className="w-4/6">
                  <CommandInput
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    className="h-9 p-0 m-0"
                  />
                </div>
                <div className="w-2/6 px-2 border rounded-md">
                  <Select
                    value={filter}
                    defaultValue={filter}
                    onValueChange={setFilter}
                  >
                    <SelectTrigger className="rounded-none p-1 border-none shadow-none w-full">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {searchQueryKeys.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <CommandList className="max-h-[300px]">
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                {Object.entries(groupedItems).map(([group, groupItems]) => (
                  <Fragment key={group}>
                    {group !== "" && (
                      <CommandGroup heading={group}>
                        {groupItems.map((item) => {
                          const itemValue = normalizeValue(
                            item[valueKey] as TypeValue
                          );
                          const isSelected = valueArray.some((val) =>
                            areValuesEqual(val, item[valueKey] as TypeValue)
                          );

                          return (
                            <CommandItem
                              key={itemValue}
                              value={itemValue}
                              onSelect={handleSelect}
                            >
                              {renderItem
                                ? renderItem(item, isSelected)
                                : defaultRenderItem(item, isSelected)}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    )}
                    {group === "" &&
                      groupItems.map((item) => {
                        const itemValue = normalizeValue(
                          item[valueKey] as TypeValue
                        );
                        const isSelected = valueArray.some((val) =>
                          areValuesEqual(val, item[valueKey] as TypeValue)
                        );

                        return (
                          <CommandItem
                            key={itemValue}
                            value={itemValue}
                            onSelect={handleSelect}
                          >
                            {renderItem
                              ? renderItem(item, isSelected)
                              : defaultRenderItem(item, isSelected)}
                          </CommandItem>
                        );
                      })}
                  </Fragment>
                ))}
                {hasMore && (
                  <div
                    ref={ref}
                    className="py-2 flex items-center justify-center"
                  >
                    {loading && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                  </div>
                )}
              </CommandList>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
