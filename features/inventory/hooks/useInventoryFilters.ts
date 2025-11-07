import { useState } from "react";
import { SortBy } from "@/features/inventory/types";

export const useInventoryFilters = () => {
  // UI filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [selectedVersion, setSelectedVersion] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");

  // Modal state
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedCollectionDetail, setSelectedCollectionDetail] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState<"blindbox" | "collection">(
    "blindbox"
  );

  const openCollectionDetail = (collection: string) => {
    setSelectedCollectionDetail(collection);
    setShowCollectionModal(true);
  };

  const closeCollectionModal = () => {
    setShowCollectionModal(false);
    setSelectedCollectionDetail(null);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCollection("all");
    setSelectedVersion("all");
    setSortBy("recent");
  };

  return {
    // Filter state
    searchTerm,
    setSearchTerm,
    selectedCollection,
    setSelectedCollection,
    selectedVersion,
    setSelectedVersion,
    sortBy,
    setSortBy,

    // Modal state
    showCollectionModal,
    selectedCollectionDetail,
    activeTab,
    setActiveTab,

    // Actions
    openCollectionDetail,
    closeCollectionModal,
    clearAllFilters,
  };
};
