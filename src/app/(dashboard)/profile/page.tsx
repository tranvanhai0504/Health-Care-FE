"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { userService } from "@/services/user.service";
import { type User, type UpdateUserData } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  User as UserIcon,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Save,
  UserCircle,
  Lock,
  Clock,
  BadgeInfo,
  ShieldCheck,
  Camera,
  Upload,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { ChangePasswordDialog } from "@/components/dialogs/change-password-dialog";

// Form validation schema
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address." })
    .optional()
    .or(z.literal("")),
  phoneNumber: z
    .string()
    .min(10, { message: "Please enter a valid phone number." }),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters." })
    .optional()
    .or(z.literal("")),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]),
  occupation: z.string().optional(),
});

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { fetchProfile } = useAuthStore();

  console.log(user);

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      address: "",
      dateOfBirth: "",
      gender: "male",
      occupation: "",
    },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await userService.getProfile();
        setUser(userData);

        // Populate form with user data
        form.reset({
          name: userData.name || "",
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || "",
          address: userData.address || "",
          dateOfBirth: userData.dateOfBirth || "",
          gender: (userData.gender as "male" | "female" | "other") || "male",
          occupation: userData.occupation || "",
        });
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        toast.error("Failed to load profile information");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [form]);

  // Cleanup avatar preview URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // Handle avatar file selection
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedAvatarFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  // Remove selected avatar
  const removeSelectedAvatar = () => {
    setSelectedAvatarFile(null);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
  };

  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      setSaving(true);

      const updateData: UpdateUserData = {
        ...values,
        ...(selectedAvatarFile && { avatar: selectedAvatarFile }),
      };

      const updatedUser = await userService.updateProfile(updateData);
      await fetchProfile();

      setUser(updatedUser);

      if (selectedAvatarFile) {
        removeSelectedAvatar();
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile information");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-4 w-2/4" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            <Skeleton className="h-12 w-32 rounded-md" />
            <Skeleton className="h-12 w-32 rounded-md" />
            <Skeleton className="h-12 w-32 rounded-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[450px] w-full rounded-xl" />
            <Skeleton className="h-[450px] w-full col-span-2 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Get first letter of first and last name for avatar
  const getInitials = () => {
    if (!user?.name) return "U";
    const parts = user.name.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Get role color based on user role
  const getRoleColor = () => {
    switch (user?.role?.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
      case "doctor":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
      case "patient":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="container max-w-7xl mx-auto">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-primary/10 to-transparent p-6 rounded-xl">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Account Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your account settings and profile information
            </p>
          </div>

          <div className="flex items-center space-x-5 bg-card p-4 rounded-lg border shadow-sm">
            <Avatar className="h-20 w-20 border-4 border-background">
              <AvatarImage
                src={
                  avatarPreview ||
                  user?.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`
                }
                alt={user?.name}
              />
              <AvatarFallback className="text-xl font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{user?.name}</h2>
                <Badge className={`${getRoleColor()} capitalize font-medium`}>
                  {user?.role}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 flex items-center">
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                {user?.email}
              </p>
              {user?.phoneNumber && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center">
                  <Phone className="h-3.5 w-3.5 mr-1.5" />
                  {user?.phoneNumber}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="h-px bg-border my-6" />

        <Tabs
          defaultValue="general"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="flex w-full md:w-auto overflow-x-auto rounded-lg p-1 h-auto mb-6 bg-card/50">
            <TabsTrigger
              value="general"
              className={cn(
                "flex items-center gap-2 px-5 py-3 transition-all",
                activeTab === "general" ? "font-medium" : ""
              )}
            >
              <UserIcon className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className={cn(
                "flex items-center gap-2 px-5 py-3 transition-all",
                activeTab === "security" ? "font-medium" : ""
              )}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left side user summary */}
              <Card className="md:row-span-2 h-fit border border-border/60 shadow-sm">
                <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
                  <CardTitle className="flex items-center text-lg">
                    <UserCircle className="mr-2 h-5 w-5 text-primary" />
                    User Profile
                  </CardTitle>
                  <CardDescription>Your account information</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 pb-7">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative group">
                      <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                        <AvatarImage
                          src={
                            avatarPreview ||
                            user?.avatar ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`
                          }
                          alt={user?.name}
                        />
                        <AvatarFallback className="text-4xl font-semibold">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Upload overlay */}
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="text-white text-center">
                          <Camera className="h-6 w-6 mx-auto mb-1" />
                          <span className="text-xs font-medium">
                            Change Photo
                          </span>
                        </div>
                      </div>

                      {/* File input */}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                        disabled={saving}
                      />

                      <div className="absolute -bottom-2 -right-2">
                        <Badge className="rounded-full px-2 py-1 font-medium capitalize">
                          {user?.role || "User"}
                        </Badge>
                      </div>


                    </div>

                    {/* Avatar actions */}
                    {selectedAvatarFile && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeSelectedAvatar}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            const fileInput = document.querySelector(
                              'input[type="file"]'
                            ) as HTMLInputElement;
                            fileInput?.click();
                          }}
                          disabled={saving}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Different
                        </Button>
                      </div>
                    )}

                    <div className="w-full pt-6 space-y-5 divide-y divide-border/60">
                      <div className="pb-2">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">
                          Account Info
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <BadgeInfo className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground block">
                                User ID
                              </span>
                              <span className="font-mono text-xs">
                                {user?._id?.substring(0, 12)}...
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Mail className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground block">
                                Email
                              </span>
                              <span>{user?.email || "Not provided"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Phone className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground block">
                                Phone
                              </span>
                              <span>{user?.phoneNumber || "Not provided"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">
                          Account History
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Clock className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground block">
                                Member since
                              </span>
                              <span>
                                {new Date(
                                  user?.createdAt || ""
                                ).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Calendar className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground block">
                                Last updated
                              </span>
                              <span>
                                {new Date(
                                  user?.updatedAt || ""
                                ).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right side edit form */}
              <Card className="md:col-span-2 border border-border/60 shadow-sm">
                <CardHeader className="pb-4 bg-muted/30 rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <UserIcon className="mr-2 h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                Full Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your full name"
                                  {...field}
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                Email Address
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your email"
                                  {...field}
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                Phone Number
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your phone number"
                                  {...field}
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                Date of Birth
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  {...field}
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                Gender
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select your gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="occupation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                                Occupation
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your occupation"
                                  {...field}
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-sm font-medium">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your address"
                                {...field}
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <CardFooter className="px-0 pt-4 pb-0 flex flex-col sm:flex-row gap-3 items-center justify-between">
                        <div className="text-sm text-muted-foreground italic">
                          Last updated:{" "}
                          {new Date(user?.updatedAt || "").toLocaleDateString()}
                        </div>
                        <Button
                          type="submit"
                          className="h-11 px-8 w-full sm:w-auto"
                          disabled={saving}
                        >
                          {saving ? (
                            <span className="flex items-center">
                              <span className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                              Saving changes...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                              {selectedAvatarFile && (
                                <span className="ml-1 text-xs bg-primary/20 px-2 py-0.5 rounded-full">
                                  +Avatar
                                </span>
                              )}
                            </span>
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card className="border border-border/60 shadow-sm">
              <CardHeader className="pb-4 bg-muted/30 rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5 text-primary" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="border rounded-lg p-5 transition-all hover:border-primary/40 hover:bg-muted/20">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <Lock className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-medium">Password</h3>
                        <p className="text-sm text-muted-foreground">
                          Update your account password
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setChangePasswordOpen(true)}
                    >
                      <Lock className="h-4 w-4" />
                      Change Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Change Password Dialog */}
        <ChangePasswordDialog
          isOpen={changePasswordOpen}
          onOpenChange={setChangePasswordOpen}
        />
      </div>
    </div>
  );
}
