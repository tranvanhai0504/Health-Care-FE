"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { consultationServiceApi } from "@/services/consultationService.service";
import { ConsultationService, PaginationInfo } from "@/types";
import { Search, Filter, Check } from "lucide-react";

interface SearchServiceProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (selectedServices: ConsultationService[]) => void;
  multiple?: boolean;
  trigger?: React.ReactNode;
  initialSelectedIds?: string[];
}

interface FilterState {
  search: string;
  specialization: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
}

const SearchService: React.FC<SearchServiceProps> = ({
  isOpen,
  onOpenChange,
  onApply,
  multiple = true,
  trigger,
  initialSelectedIds = [],
}) => {
  const [services, setServices] = useState<ConsultationService[]>([]);
  const [selectedServices, setSelectedServices] = useState<
    ConsultationService[]
  >([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialSelectedIds)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(
    null
  );

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    specialization: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "name",
  });

  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Fetch services
  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch || undefined,
        sortBy: filters.sortBy || undefined,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      };

      let response;
      if (filters.specialization) {
        response = await consultationServiceApi.getBySpecialization(
          filters.specialization,
          params
        );
      } else {
        response = await consultationServiceApi.getPaginated(params);
      }

      setServices(response.data || []);
      setTotalPages(response.pagination.totalPages || 1);
      setPaginationInfo(response.pagination);
    } catch (err) {
      setError("Failed to fetch consultation services");
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch, filters]);

  // Fetch services when dependencies change
  useEffect(() => {
    if (isOpen) {
      fetchServices();
    }
  }, [isOpen, fetchServices]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearch,
    filters.specialization,
    filters.minPrice,
    filters.maxPrice,
    filters.sortBy,
  ]);

  // Handle pagination changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Handle service selection
  const handleServiceSelect = (service: ConsultationService) => {
    if (multiple) {
      const newSelectedIds = new Set(selectedIds);
      const newSelectedServices = [...selectedServices];

      if (selectedIds.has(service._id)) {
        newSelectedIds.delete(service._id);
        const index = newSelectedServices.findIndex(
          (s) => s._id === service._id
        );
        if (index > -1) newSelectedServices.splice(index, 1);
      } else {
        newSelectedIds.add(service._id);
        newSelectedServices.push(service);
      }

      setSelectedIds(newSelectedIds);
      setSelectedServices(newSelectedServices);
    } else {
      setSelectedIds(new Set([service._id]));
      setSelectedServices([service]);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: "",
      specialization: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "name",
    });
  };

  // Handle apply
  const handleApply = () => {
    onApply(selectedServices);
    onOpenChange(false);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    // Reset selections when closing without applying
    setSelectedIds(new Set(initialSelectedIds));
    setSelectedServices([]);
    onOpenChange(false);
  };

  const renderServiceCard = (service: ConsultationService) => {
    const isSelected = selectedIds.has(service._id);

    return (
      <div
        key={service._id}
        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
          isSelected
            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
            : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={() => handleServiceSelect(service)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{service.name}</h3>
              {isSelected && <Check className="w-4 h-4 text-blue-600" />}
            </div>
            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>Duration: {service.duration} min</span>
              <span className="font-medium text-green-600">
                ${service.price}
              </span>
              {service.specialization &&
                typeof service.specialization === "string" && (
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {service.specialization}
                  </span>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Consultation Services</DialogTitle>
          <DialogDescription>
            Find and select consultation services.{" "}
            {multiple
              ? "You can select multiple services."
              : "Select one service."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Search and Filters */}
          <div className="space-y-4 mb-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search services..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              {(filters.specialization ||
                filters.minPrice ||
                filters.maxPrice) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Cardiology"
                    value={filters.specialization}
                    onChange={(e) =>
                      handleFilterChange("specialization", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="duration">Duration</option>
                    <option value="createdAt">Created Date</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="flex-1 min-h-0">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading services...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-32 text-red-600">
                {error}
              </div>
            ) : services.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No services found
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-96">
                {services.map(renderServiceCard)}
              </div>
            )}
          </div>

          {/* Pagination */}
          <PaginationWrapper
            paginationInfo={paginationInfo}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemName="service"
            showItemsPerPage={true}
            showJumpToPage={false}
            itemsPerPageOptions={[5, 10, 15, 20]}
            className="border-none mt-4 pt-4"
          />
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">
              {selectedServices.length} service
              {selectedServices.length !== 1 ? "s" : ""} selected
            </div>

            <div className="flex gap-2">
              <DialogClose asChild>
                <button
                  onClick={handleDialogClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </DialogClose>

              <button
                onClick={handleApply}
                disabled={selectedServices.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply ({selectedServices.length})
              </button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SearchService;
