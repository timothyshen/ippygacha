import { useState } from "react";
import { SortBy } from "@/features/inventory/types";

export const useInventoryFilters = () => {
  // UI filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVersion, setSelectedVersion] = useState<string>("all");
  const [selectedNFTType, setSelectedNFTType] = useState<string>("all"); // NFT type filter (e.g., THIPPY, HIPPY)
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
    setSelectedVersion("all");
    setSelectedNFTType("all");
    setSortBy("recent");
  };

  return {
    // Filter state
    searchTerm,
    setSearchTerm,
    selectedVersion,
    setSelectedVersion,
    selectedNFTType,
    setSelectedNFTType,
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
