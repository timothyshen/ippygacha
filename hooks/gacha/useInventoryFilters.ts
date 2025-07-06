import { useState } from "react";
import { ViewMode, SortBy } from "@/components/inventory/inventory";

export const useInventoryFilters = () => {
  // UI filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [selectedVersion, setSelectedVersion] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
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

  return {
    // Filter state
    searchTerm,
    setSearchTerm,
    selectedCollection,
    setSelectedCollection,
    selectedVersion,
    setSelectedVersion,
    viewMode,
    setViewMode,
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
  };
};
