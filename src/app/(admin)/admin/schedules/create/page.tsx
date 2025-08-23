"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { User, UserPlus, Search, CheckCircle, ArrowRight, ArrowLeft, X, Plus, ClipboardList } from "lucide-react";
import SearchService from "@/components/dialogs/search-service";
import { scheduleService, userService } from "@/services";
import { ConsultationService, ScheduleStatus, User as UserType } from "@/types";
import { PaginationInfo } from "@/types/api";
import { useToast } from "@/hooks/useToast";
import { formatCurrency } from "@/utils";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";

type Step = 1 | 2;

export default function CreateAdminSchedulePage() {
  const router = useRouter();
  const { toast } = useToast();

  // Steps
  const [step, setStep] = useState<Step>(1);

  // Step 1: user selection/creation
  const [useExistingUser, setUseExistingUser] = useState<boolean>(true);
  const [userSearch, setUserSearch] = useState<string>("");
  const [userResults, setUserResults] = useState<UserType[]>([]);
  const [userLoading, setUserLoading] = useState<boolean>(false);
  const [userPagination, setUserPagination] = useState<PaginationInfo | null>(null);
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userItemsPerPage, setUserItemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  // New user form
  const [newUser, setNewUser] = useState<{ phoneNumber: string; name: string; gender: string }>(
    { phoneNumber: "", name: "", gender: "male" }
  );
  const [creatingUser, setCreatingUser] = useState<boolean>(false);

  // Step 2: services and date
  const [isSearchServiceOpen, setIsSearchServiceOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<ConsultationService[]>([]);
  // Date/time are derived from current moment per requirements
  const [submitting, setSubmitting] = useState<boolean>(false);

  const canProceedToStep2 = useMemo(() => !!selectedUser, [selectedUser]);
  const selectedServiceIds = useMemo(() => selectedServices.map(s => s._id), [selectedServices]);
  const totalPrice = useMemo(() => selectedServices.reduce((sum, s) => sum + (s.price || 0), 0), [selectedServices]);

  const handleSearchUsers = useCallback(async (page: number = 1) => {
    setUserLoading(true);
    try {
      const res = await userService.getAll({
        options: {
          filter: {
            $or: [
              { phoneNumber: { $regex: userSearch, $options: "i" } },
              { email: { $regex: userSearch, $options: "i" } },
              { name: { $regex: userSearch, $options: "i" } },
            ],
          },
          pagination: { page, limit: userItemsPerPage },
          sort: { createdAt: -1 },
        },
      });
      setUserResults(res.data);
      setUserPagination(res.pagination);
      setUserCurrentPage(page);
    } catch (e: unknown) {
      console.error(e);
      setUserResults([]);
      setUserPagination(null);
    } finally {
      setUserLoading(false);
    }
  }, [userSearch, userItemsPerPage]);

  const handleUserPageChange = (page: number) => {
    handleSearchUsers(page);
  };

  const handleUserItemsPerPageChange = (newItemsPerPage: number) => {
    setUserItemsPerPage(newItemsPerPage);
    setUserCurrentPage(1);
    handleSearchUsers(1);
  };

  const handleCreateUser = useCallback(async () => {
    if (!newUser.phoneNumber || !newUser.name) return;
    setCreatingUser(true);
    try {
      const created = await userService.unsignup({
        phoneNumber: newUser.phoneNumber,
        name: newUser.name,
        gender: newUser.gender,
      });
      setSelectedUser(created);
      setUseExistingUser(true);
      setStep(2);
    } catch (e) {
      let message = "Failed to create user";
      if (axios.isAxiosError(e)) {
        const data = e.response?.data as { data?: { message?: string }; msg?: string } | undefined;
        message = data?.data?.message || data?.msg || message;
      }
      toast({ title: "Error", description: message, type: "error" });
    } finally {
      setCreatingUser(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newUser]);

  const handleApplyServices = (services: ConsultationService[]) => {
    setSelectedServices(services);
  };

  const handleRemoveService = (id: string) => {
    setSelectedServices((prev) => prev.filter((s) => s._id !== id));
  };

  const handleSubmitSchedule = useCallback(async () => {
    if (!selectedUser) return;
    if (selectedServices.length === 0) {
      toast({ title: "Error", description: "Please select at least one service", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const now = new Date();
      const weekPeriod = scheduleService.getWeekPeriod(now);
      const dayOffset = scheduleService.getDayOffset(now);
      const timeOffset: 0 | 1 = now.getHours() < 12 ? 0 : 1;
      await scheduleService.create({
        userId: selectedUser._id,
        weekPeriod,
        dayOffset,
        timeOffset,
        status: ScheduleStatus.CONFIRMED,
        type: "services",
        services: selectedServiceIds,
      });
      router.push("/admin");
    } catch (e) {
      let message = "Failed to create schedule";
      if (axios.isAxiosError(e)) {
        const data = e.response?.data as { data?: { message?: string }; msg?: string } | undefined;
        message = data?.data?.message || data?.msg || message;
      }
      toast({ title: "Error", description: message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser, selectedServices.length, selectedServiceIds, router]);

  // Auto-search users when component mounts or search query changes
  useEffect(() => {
    if (useExistingUser) {
      const timeoutId = setTimeout(() => {
        handleSearchUsers(1);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [useExistingUser, userSearch, handleSearchUsers]);

  return (
    <div className="h-[calc(100vh-64px)] overflow-auto p-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">New Schedule</h1>
          <Badge variant="outline" className="text-xs">Step {step} / 2</Badge>
        </div>

        <Card className="shadow-md border-border/60">
          <CardHeader className="bg-muted/40 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                {step === 1 ? <User className="h-4 w-4 text-primary" /> : <ClipboardList className="h-4 w-4 text-primary" />} 
                {step === 1 ? "User Information" : "Schedule Details"}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xxs">Fast create</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={useExistingUser ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseExistingUser(true)}
                    className="flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" /> Existing User
                  </Button>
                  <Button
                    variant={!useExistingUser ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseExistingUser(false)}
                    className="flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" /> New User
                  </Button>
                </div>

                {useExistingUser ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by phone, email, or name..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSearchUsers(1)} disabled={userLoading}>
                        {userLoading ? "Searching..." : "Search"}
                      </Button>
                    </div>
                    <div className="border rounded-md divide-y bg-white">
                      {userResults.length === 0 ? (
                        <div className="text-sm text-gray-500 p-3">No results</div>
                      ) : (
                        userResults.map((u) => (
                          <button
                            key={u._id}
                            className={`w-full text-left p-3 hover:bg-gray-50 ${selectedUser?._id === u._id ? "bg-blue-50/60" : ""}`}
                            onClick={() => setSelectedUser(u)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium">{u.name || u.email || u.phoneNumber}</div>
                                <div className="text-xs text-gray-500">{u.email} • {u.phoneNumber}</div>
                              </div>
                              {selectedUser?._id === u._id && (
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                    {userPagination && (
                      <PaginationWrapper
                        paginationInfo={userPagination}
                        currentPage={userCurrentPage}
                        totalPages={userPagination.totalPages}
                        itemsPerPage={userItemsPerPage}
                        onPageChange={handleUserPageChange}
                        onItemsPerPageChange={handleUserItemsPerPageChange}
                        itemName="user"
                        showItemsPerPage={true}
                        showJumpToPage={false}
                        itemsPerPageOptions={[5, 10, 20]}
                      />
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-600">Phone Number</label>
                        <Input
                          value={newUser.phoneNumber}
                          onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                          placeholder="e.g. 0773xxxxxx"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Name</label>
                        <Input
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Gender</label>
                        <select
                          className="w-full border rounded h-9 text-sm px-2"
                          value={newUser.gender}
                          onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Button size="sm" onClick={handleCreateUser} disabled={creatingUser || !newUser.phoneNumber || !newUser.name}>
                        {creatingUser ? "Creating..." : "Create & Continue"}
                      </Button>
                    </div>
                  </div>
                )}

                <Separator />
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Cancel
                  </Button>
                  <Button size="sm" onClick={() => setStep(2)} disabled={!canProceedToStep2} className="flex items-center gap-2">
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm">Scheduling for: <span className="font-medium">{selectedUser?.name || selectedUser?.email || selectedUser?.phoneNumber}</span></div>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" onClick={() => setIsSearchServiceOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Add/Manage Services
                  </Button>
                  <div className="border rounded-md min-h-24 p-0">
                    <div className="bg-muted/40 px-3 py-2 text-xs text-muted-foreground border-b">Selected services</div>
                    {selectedServices.length === 0 ? (
                      <div className="text-sm text-gray-500 p-3">No services selected</div>
                    ) : (
                      <div className="divide-y">
                        {selectedServices.map(s => (
                          <div key={s._id} className="flex items-center justify-between text-sm px-3 py-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="truncate mr-2 font-medium">{s.name}</div>
                              <div className="text-gray-500 text-xxs whitespace-nowrap">{s.duration}m</div>
                              <div className="text-green-600 text-xxs whitespace-nowrap">{formatCurrency(s.price)}</div>
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-red-600" onClick={() => handleRemoveService(s._id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex items-center justify-between px-3 py-2 text-sm bg-muted/30">
                          <div className="text-muted-foreground">Total</div>
                          <div className="font-semibold">{formatCurrency(totalPrice)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => setStep(1)} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button size="sm" onClick={handleSubmitSchedule} disabled={submitting || selectedServices.length === 0} className="flex items-center gap-2">
                    {submitting ? "Creating..." : "Create Schedule (Now)"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <SearchService
        isOpen={isSearchServiceOpen}
        onOpenChange={setIsSearchServiceOpen}
        onApply={handleApplyServices}
        multiple={true}
        initialSelectedIds={selectedServiceIds}
      />
    </div>
  );
}


