"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ConsultationPackage,
  consultationPackageService,
} from "@/services/consultationPackage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  MoreVertical, 
  Pencil, 
  Plus, 
  Search, 
  Trash2, 
  Package, 
  ListFilter 
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminHealthPackagesPage() {
  const [packages, setPackages] = useState<ConsultationPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<ConsultationPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPackages(packages);
    } else {
      const filtered = packages.filter(
        (pkg) =>
          pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPackages(filtered);
    }
  }, [searchQuery, packages]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await consultationPackageService.getAll();
      setPackages(data);
      setFilteredPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast({
        title: "Error",
        description: "Failed to fetch health packages",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = () => {
    router.push("/admin/health-packages/create");
  };

  const handleEditPackage = (id: string) => {
    router.push(`/admin/health-packages/edit/${id}`);
  };

  const handleViewPackage = (id: string) => {
    router.push(`/admin/health-packages/${id}`);
  };

  const confirmDelete = (id: string) => {
    setPackageToDelete(id);
    setIsDeleteAlertOpen(true);
  };

  const handleDeletePackage = async () => {
    if (!packageToDelete) return;

    try {
      await consultationPackageService.delete(packageToDelete);
      setPackages(packages.filter((pkg) => pkg._id !== packageToDelete));
      toast({
        title: "Success",
        description: "Health package deleted successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting package:", error);
      toast({
        title: "Error",
        description: "Failed to delete health package",
        type: "error",
      });
    } finally {
      setPackageToDelete(null);
      setIsDeleteAlertOpen(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Get lowest price from price options
  const getLowestPrice = (priceOptions: { price: number }[]) => {
    if (!priceOptions || priceOptions.length === 0) return 0;
    return Math.min(...priceOptions.map((option) => option.price));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-muted/50 rounded-t-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Package className="h-5 w-5" /> Health Packages Management
              </CardTitle>
              <CardDescription className="mt-1.5">
                Manage all health packages available to users
              </CardDescription>
            </div>
            <Button onClick={handleCreatePackage} className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Create New Package
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center">
                <ListFilter className="mr-1 h-3.5 w-3.5" />
                Total: {filteredPackages.length}
              </Badge>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package Name</TableHead>
                    <TableHead>Price Range</TableHead>
                    <TableHead className="hidden md:table-cell">Features</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPackages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No health packages found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPackages.map((pkg) => (
                      <TableRow key={pkg._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-md">
                              <Package className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div>{pkg.title}</div>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {pkg.description.substring(0, 60)}...
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {pkg.priceOptions && pkg.priceOptions.length > 0 ? (
                            <div>
                              <span className="font-medium">
                                {formatCurrency(getLowestPrice(pkg.priceOptions))}
                              </span>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {pkg.priceOptions.length} pricing tiers
                              </p>
                            </div>
                          ) : (
                            "No price options"
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {pkg.features?.slice(0, 2).map((feature, i) => (
                              <Badge key={i} variant="outline" className="truncate max-w-[150px]">
                                {feature}
                              </Badge>
                            ))}
                            {(pkg.features?.length || 0) > 2 && (
                              <Badge variant="outline">+{(pkg.features?.length || 0) - 2} more</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewPackage(pkg._id)}>
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditPackage(pkg._id)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => confirmDelete(pkg._id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the health package
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePackage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
