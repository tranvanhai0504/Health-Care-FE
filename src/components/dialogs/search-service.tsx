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
import { specialtyService } from "@/services/specialties.service";
import { ConsultationService, PaginationInfo, Specialty } from "@/types";
import { Search, Filter, Check, ChevronsUpDown } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  
  // Specialties state
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
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



  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Fetch specialties
  const fetchSpecialties = useCallback(async () => {
    if (specialties.length > 0) return; // Don't fetch if already loaded
    
    setLoadingSpecialties(true);
    try {
      const data = await specialtyService.getAll();
      setSpecialties(data);
    } catch (err) {
      console.error("Error fetching specialties:", err);
    } finally {
      setLoadingSpecialties(false);
    }
  }, [specialties.length]);

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

  // Fetch initial selected services when dialog opens
  useEffect(() => {
    const fetchInitialSelectedServices = async () => {
      if (isOpen && initialSelectedIds.length > 0) {
        try {
          const initialServices = await consultationServiceApi.getByIds(initialSelectedIds);
          setSelectedServices(initialServices);
          // Ensure selectedIds is in sync with the actually loaded services
          const loadedIds = initialServices.map(service => service._id);
          setSelectedIds(new Set(loadedIds));
        } catch (error) {
          console.error("Error fetching initial selected services:", error);
          // If fetching fails, reset to empty but keep the initial IDs for retry
          setSelectedServices([]);
          setSelectedIds(new Set(initialSelectedIds));
        }
      } else if (isOpen) {
        // If no initial selected IDs, make sure both states are empty
        setSelectedServices([]);
        setSelectedIds(new Set());
      }
    };

    fetchInitialSelectedServices();
  }, [isOpen, initialSelectedIds]);

  // Fetch services and specialties when dependencies change
  useEffect(() => {
    if (isOpen) {
      fetchServices();
      fetchSpecialties();
    }
  }, [isOpen, fetchServices, fetchSpecialties]);

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
    // Don't reset selectedServices to empty - it will be refetched when dialog reopens
    onOpenChange(false);
  };

  // Specialization Combobox Component
  const SpecializationCombobox = ({ 
    value, 
    onValueChange, 
    disabled = false,
    className = "w-full"
  }: {
    value: string,
    onValueChange: (value: string) => void,
    disabled?: boolean,
    className?: string
  }) => {
    const [open, setOpen] = useState(false);
    
    const selectedSpecialty = specialties.find(specialty => specialty._id === value);
    
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("justify-between text-sm", className)}
            disabled={disabled}
          >
            {selectedSpecialty ? selectedSpecialty.name : "All Specializations"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 z-50">
          <Command>
            <CommandInput placeholder="Search specializations..." className="h-9" />
            <CommandList>
              <CommandEmpty>
                {loadingSpecialties ? "Loading..." : "No specialization found."}
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value=""
                  onSelect={() => {
                    onValueChange("");
                    setOpen(false);
                  }}
                >
                  All Specializations
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === "" ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
                {specialties.map((specialty) => (
                  <CommandItem
                    key={specialty._id}
                    value={specialty.name}
                    onSelect={() => {
                      const newValue = value === specialty._id ? "" : specialty._id;
                      onValueChange(newValue);
                      setOpen(false);
                    }}
                  >
                    {specialty.name}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === specialty._id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const renderServiceCard = (service: ConsultationService) => {
    const isSelected = selectedIds.has(service._id);

    return (
      <div
        key={service._id}
        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
          isSelected
            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
            : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={() => handleServiceSelect(service)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900 text-sm truncate">{service.name}</h4>
              {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
            </div>
            <p className="text-xs text-gray-600 mt-1 line-clamp-1">{service.description}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span className="flex-shrink-0">{service.duration}min</span>
              <span className="font-medium text-green-600 flex-shrink-0">
                {formatCurrency(service.price)}
              </span>
              {service.specialization &&
                typeof service.specialization === "string" && (
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs truncate">
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

      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Consultation Services</DialogTitle>
          <DialogDescription>
            Find and select consultation services.{" "}
            {multiple
              ? "You can select multiple services."
              : "Select one service."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex min-h-0 gap-4">
          {/* Sidebar Filters */}
          <div className="w-72 flex-shrink-0 border-r border-gray-200 pr-4 hidden md:block">
            <div className="space-y-4">
              {/* Search Bar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Services
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </h3>
                  {(filters.specialization ||
                    filters.minPrice ||
                    filters.maxPrice) && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Specialization
                    </label>
                    <SpecializationCombobox
                      value={filters.specialization}
                      onValueChange={(value) => handleFilterChange("specialization", value)}
                      disabled={loadingSpecialties}
                    />
                    {loadingSpecialties && (
                      <div className="text-xs text-gray-500 mt-1">Loading...</div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Min Price
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        min="0"
                        value={filters.minPrice}
                        onChange={(e) =>
                          handleFilterChange("minPrice", e.target.value)
                        }
                        className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Max Price
                      </label>
                      <input
                        type="number"
                        placeholder="1000"
                        min="0"
                        value={filters.maxPrice}
                        onChange={(e) =>
                          handleFilterChange("maxPrice", e.target.value)
                        }
                        className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterChange("sortBy", e.target.value)
                      }
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="name">Name A-Z</option>
                      <option value="price">Price Low-High</option>
                      <option value="duration">Duration</option>
                      <option value="createdAt">Newest First</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Mobile Filters */}
            <div className="md:hidden mb-4 space-y-3">
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
              
              {/* Filter Row */}
              <div className="grid grid-cols-2 gap-2">
                <SpecializationCombobox
                  value={filters.specialization}
                  onValueChange={(value) => handleFilterChange("specialization", value)}
                  disabled={loadingSpecialties}
                  className="h-10"
                />
                
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="name">Name A-Z</option>
                  <option value="price">Price Low-High</option>
                  <option value="duration">Duration</option>
                  <option value="createdAt">Newest First</option>
                </select>
              </div>
              
              {/* Price Filters */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min Price"
                  min="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                  className="px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                  className="px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              {/* Clear Filters */}
              {(filters.specialization || filters.minPrice || filters.maxPrice) && (
                <div className="text-center">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
            
            {/* Results */}
            <div className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-96 text-gray-600">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm">Loading services...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-96 text-red-600">
                  <div className="text-center">
                    <div className="text-sm font-medium">{error}</div>
                    <div className="text-xs mt-1">Please try again</div>
                  </div>
                </div>
              ) : services.length === 0 ? (
                <div className="flex items-center justify-center h-96 text-gray-500">
                  <div className="text-center">
                    <div className="text-sm">No services found</div>
                    <div className="text-xs mt-1">Try adjusting your search or filters</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto max-h-96 pr-2">
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
              itemsPerPageOptions={[10, 20, 30, 40]}
              className="border-none mt-4 pt-4"
            />
          </div>
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
