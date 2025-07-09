import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PaginationInfo } from "@/types";

interface PaginationWrapperProps {
  paginationInfo: PaginationInfo | null;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  itemName?: string; // e.g., "services", "packages", "schedules"
  showItemsPerPage?: boolean;
  showJumpToPage?: boolean;
  itemsPerPageOptions?: number[];
  className?: string;
}

export function PaginationWrapper({
  paginationInfo,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemName = "items",
  showItemsPerPage = true,
  showJumpToPage = true,
  itemsPerPageOptions = [6, 9, 12, 24, 48],
  className,
}: PaginationWrapperProps) {
  // Calculate visible pages (max 5 pages shown at once)
  const getVisiblePages = () => {
    const maxVisible = 5;
    const pages: number[] = [];
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than or equal to maxVisible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination logic
      const half = Math.floor(maxVisible / 2);
      let start = Math.max(1, currentPage - half);
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      // Adjust start if we're near the end
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Temporarily show even for single pages to debug
  // if (totalPages <= 1) return null;

  return (
    <div className={`space-y-4 mt-8 pt-6 border-t ${className || ''}`}>
      {/* Top row: Items per page and results summary */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {showItemsPerPage && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Items per page:</span>
            <Select 
              value={itemsPerPage.toString()} 
              onValueChange={(value) => {
                onItemsPerPageChange(parseInt(value));
              }}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Results summary */}
        <div className="text-sm text-muted-foreground">
          {paginationInfo ? (
            <>
              Showing {((paginationInfo.page - 1) * paginationInfo.limit) + 1}-
              {Math.min(paginationInfo.page * paginationInfo.limit, paginationInfo.total)} of{' '}
              {paginationInfo.total} {itemName}
              {paginationInfo.total !== 1 ? (itemName.endsWith('s') ? '' : 's') : ''}
            </>
          ) : (
            <>Loading {itemName}...</>
          )}
        </div>
      </div>

      {/* Pagination component */}
      <Pagination className="justify-center">
        <PaginationContent>
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (canGoPrevious) onPageChange(currentPage - 1);
              }}
              className={!canGoPrevious ? "opacity-50 cursor-not-allowed" : ""}
            />
          </PaginationItem>

          {/* Page Numbers with Smart Ellipsis */}
          {getVisiblePages().map((page, index, array) => {
            const isFirst = index === 0;
            const isLast = index === array.length - 1;
            const needsStartEllipsis = isFirst && page > 2;
            const needsEndEllipsis = isLast && page < totalPages - 1;

            return (
              <React.Fragment key={page}>
                {/* Show first page + ellipsis if needed */}
                {needsStartEllipsis && (
                  <>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(1);
                        }}
                        isActive={currentPage === 1}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  </>
                )}

                {/* Current page */}
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(page);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>

                {/* Show ellipsis + last page if needed */}
                {needsEndEllipsis && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(totalPages);
                        }}
                        isActive={currentPage === totalPages}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
              </React.Fragment>
            );
          })}

          {/* Next Button */}
          <PaginationItem>
            <PaginationNext 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (canGoNext) onPageChange(currentPage + 1);
              }}
              className={!canGoNext ? "opacity-50 cursor-not-allowed" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Jump to page */}
      {showJumpToPage && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-muted-foreground">Go to page:</span>
          <Input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= totalPages) {
                onPageChange(page);
              }
            }}
            className="w-16 h-8 text-center"
          />
          <span className="text-muted-foreground">of {totalPages}</span>
        </div>
      )}
    </div>
  );
} 