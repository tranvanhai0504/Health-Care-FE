"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  User,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Star,
  Clock,
  Loader2,
  Award,
  FileText,
  Users,
  Shield,
  Save,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { doctorService } from "@/services/doctor.service";
import { DoctorWithPopulatedData } from "@/types/doctor";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { roomService } from "@/services/room.service";
import { Room } from "@/types";

export default function DoctorProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [doctorData, setDoctorData] = useState<DoctorWithPopulatedData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    experience: 0,
    qualifications: [] as string[],
    bio: "",
    consultationFee: 0,
  });

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (!isAuthenticated || !user?._id) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const doctor = await doctorService.findOneByUserId(user._id);
        setDoctorData(doctor);

        // Initialize edit form with fetched data
        setEditForm({
          experience: doctor.experience,
          qualifications: [...doctor.qualifications],
          bio: doctor.bio || "",
          consultationFee: doctor.consultationFee,
        });
      } catch (err) {
        console.error("Failed to fetch doctor profile:", err);
        setError("Failed to load doctor profile");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [isAuthenticated, user?._id]);

  useEffect(() => {
    if (!doctorData?.room) return;

    const fetchRoom = async () => {
      const room = await roomService.getById(doctorData?.room);
      setRoom(room);
    };
    fetchRoom();
  }, [doctorData?.room]);

  const handleEditToggle = () => {
    if (isEditing && doctorData) {
      // Reset form to original data if canceling
      setEditForm({
        experience: doctorData.experience,
        qualifications: [...doctorData.qualifications],
        bio: doctorData.bio || "",
        consultationFee: doctorData.consultationFee,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!doctorData) return;

    try {
      setIsSaving(true);
      const updatedDoctor = await doctorService.update(doctorData._id, {
        experience: editForm.experience,
        qualifications: editForm.qualifications,
        bio: editForm.bio,
        consultationFee: editForm.consultationFee,
      });

      // Update local state with the response
      setDoctorData({
        ...doctorData,
        ...updatedDoctor,
        user: doctorData.user, // Keep the populated user data
        specialization: doctorData.specialization, // Keep the populated specialization data
      });

      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update doctor profile:", err);
      setError("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const addQualification = () => {
    setEditForm((prev) => ({
      ...prev,
      qualifications: [...prev.qualifications, ""],
    }));
  };

  const removeQualification = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));
  };

  const updateQualification = (index: number, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      qualifications: prev.qualifications.map((qual, i) =>
        i === index ? value : qual
      ),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center bg-white rounded-lg shadow-sm p-8 border">
              <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Loading Your Profile
              </h3>
              <p className="text-gray-600">
                Please wait while we fetch your information...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center bg-white rounded-lg shadow-sm p-8 border max-w-md">
              <div className="w-12 h-12 bg-red-50 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to Load Profile
              </h3>
              <p className="text-red-600 mb-6">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="destructive"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!doctorData) {
    return (
      <div className=" bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center bg-white rounded-lg shadow-sm p-8 border max-w-md">
              <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Profile Not Found
              </h3>
              <p className="text-gray-600 mb-6">
                No doctor profile found. Please contact administration.
              </p>
              <Link href="/doctor/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className=" bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white border-b p-4 rounded-lg">
        <div className="container mx-auto py-8">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-16 h-16">
                <AvatarImage
                  src={doctorData.user.avatar}
                  alt={doctorData.user.name}
                />
                <AvatarFallback className="text-lg bg-gray-100 text-gray-700">
                  {getInitials(doctorData.user.name)}
                </AvatarFallback>
              </Avatar>

              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                  Dr. {doctorData.user.name}
                </h1>
                <p className="text-gray-600 mb-2">
                  {doctorData.specialization.name}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {doctorData.experience} years experience
                  </span>
                  <span className="flex items-center gap-1">
                    {renderStars(doctorData.averageRating)}
                    <span className="ml-1">
                      ({doctorData.averageRating.toFixed(1)})
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleEditToggle}
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleEditToggle}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Professional Info
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 text-base">
                  <Award className="w-4 h-4" />
                  Professional Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editForm.experience}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              experience: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="text-center font-bold text-xl h-8 w-20 mx-auto"
                          min="0"
                        />
                      ) : (
                        doctorData.experience
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Years Experience
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">
                      {doctorData.averageRating.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editForm.consultationFee}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              consultationFee: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="text-center font-bold text-lg h-8 w-32 mx-auto"
                          min="0"
                        />
                      ) : (
                        formatCurrency(doctorData.consultationFee)
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Consultation Fee
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Qualifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900 text-base">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Qualifications
                  </div>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addQualification}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {isEditing ? (
                    editForm.qualifications.map((qualification, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={qualification}
                          onChange={(e) =>
                            updateQualification(index, e.target.value)
                          }
                          placeholder="Enter qualification"
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeQualification(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  ) : doctorData.qualifications.length > 0 ? (
                    doctorData.qualifications.map((qualification, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                      >
                        <Award className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">
                          {qualification}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      No qualifications added yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900 text-base">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Information
                  </div>
                  <Link href="/doctor/profile/edit">
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit Personal Info
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">
                        {doctorData.user.email}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">
                      Phone
                    </label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">
                        {doctorData.user.phoneNumber}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">
                      Address
                    </label>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">
                        {doctorData.user.address}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">
                      Date of Birth
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">
                        {formatDate(doctorData.user.dateOfBirth)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">
                      Gender
                    </label>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900 capitalize">
                        {doctorData.user.gender}
                      </span>
                    </div>
                  </div>

                  {doctorData.user.occupation && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-600">
                        Occupation
                      </label>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">
                          {doctorData.user.occupation}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 text-base">
                  <FileText className="w-4 h-4" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label
                    htmlFor="bio"
                    className="text-sm font-medium text-gray-600 mb-2 block"
                  >
                    Room
                  </Label>
                  <Badge variant="secondary">{room?.name} - {room?.roomNumber} - floor {room?.roomFloor}</Badge>
                </div>
                <div>
                  <Label
                    htmlFor="bio"
                    className="text-sm font-medium text-gray-600 mb-2 block"
                  >
                    Biography
                  </Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      placeholder="Tell us about yourself, your experience, and expertise..."
                      className="min-h-[100px] resize-y"
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {doctorData.bio || "No biography added yet"}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">
                    Specialization
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {doctorData.specialization.name}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        (Cannot be edited)
                      </span>
                    </div>
                    {doctorData.specialization.description && (
                      <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                        {doctorData.specialization.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
