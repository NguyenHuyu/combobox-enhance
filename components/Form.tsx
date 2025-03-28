"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ApiFlexibleCombobox } from "@/components/api-flexible-combobox";
import { fetchSubjects, getSubjectById, searchSubjects } from "./actions";

export function Form({ itemId }: { itemId: number | string }) {
  const [selectedProduct, setSelectedProduct] = useState<number | string>(
    itemId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Product updated with ID: ${selectedProduct}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ApiFlexibleCombobox<{
        id: number;
        name: string;
      }>
        formLabel="Subject"
        searchQueryKeys={[
          {
            label: "Subject Name",
            value: "name",
          },
        ]}
        value={selectedProduct}
        onChange={(value) => {
          setSelectedProduct(value);
        }}
        fetchItems={(page, size) => {
          return fetchSubjects(page, size);
        }}
        searchItems={(filter, query, page, size) => {
          return searchSubjects(query, page, size, filter);
        }}
        fetchItemById={getSubjectById}
        placeholder="Select a product..."
        displayKey="name"
        valueKey="id"
        renderItem={(item, selected) => (
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col">
              {JSON.stringify(selected ? "Selected" : "Not selected")}
              <span className="font-medium">{item.name}</span>
              <span className="text-xs text-muted-foreground"></span>
            </div>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              {item.id}
            </span>
          </div>
        )}
        renderSelectedItem={(product) => (
          <span className="font-medium truncate">{product.name}</span>
        )}
      />

      <Button type="submit" className="w-full">
        Update Form
      </Button>
    </form>
  );
}
