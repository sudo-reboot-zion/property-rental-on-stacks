import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, Upload, Home, X, Image as ImageIcon, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useListing, ListingFormData } from "@/hooks/use-listing";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const CreateListing = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { createListing, validateListing, isSubmitting, uploadProgress } = useListing();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<ListingFormData>({
        title: "",
        description: "",
        pricePerNight: "",
        location: "",
        location_city: "",
        location_country: "",
        locationTag: "0",
        images: [],
        amenities: [],
        maxGuests: "1",
        bedrooms: "1",
        bathrooms: "1",
    });
    const [newAmenity, setNewAmenity] = useState("");
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const handleNext = () => {
        setValidationErrors([]);

        // Validate current step
        if (step === 1) {
            const errors: string[] = [];
            if (!formData.title || formData.title.trim().length < 3) {
                errors.push("Title must be at least 3 characters");
            }
            if (!formData.description || formData.description.trim().length < 20) {
                errors.push("Description must be at least 20 characters");
            }
            if (errors.length > 0) {
                setValidationErrors(errors);
                return;
            }
        }

        if (step === 2) {
            const errors: string[] = [];
            if (!formData.location_city || formData.location_city.trim().length < 2) {
                errors.push("City is required");
            }
            if (!formData.location_country || formData.location_country.trim().length < 2) {
                errors.push("Country is required");
            }
            const price = parseFloat(formData.pricePerNight);
            if (isNaN(price) || price <= 0) {
                errors.push("Price must be greater than 0");
            }
            const maxGuests = parseInt(formData.maxGuests);
            if (isNaN(maxGuests) || maxGuests < 1) {
                errors.push("Maximum guests must be at least 1");
            }
            if (errors.length > 0) {
                setValidationErrors(errors);
                return;
            }
        }

        setStep(step + 1);
    };

    const handleBack = () => {
        setValidationErrors([]);
        setStep(step - 1);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // Limit to 10 images
        const newImages = [...formData.images, ...files].slice(0, 10);
        setFormData({ ...formData, images: newImages });

        // Create previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews].slice(0, 10));
    };

    const removeImage = (index: number) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages });
        setImagePreviews(newPreviews);
    };

    const addAmenity = () => {
        if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
            setFormData({
                ...formData,
                amenities: [...formData.amenities, newAmenity.trim()]
            });
            setNewAmenity("");
        }
    };

    const removeAmenity = (amenity: string) => {
        setFormData({
            ...formData,
            amenities: formData.amenities.filter(a => a !== amenity)
        });
    };

    const handleSubmit = async () => {
        setValidationErrors([]);

        // Final validation
        const validation = validateListing(formData);
        if (!validation.valid) {
            setValidationErrors(validation.errors);
            return;
        }

        // Submit listing
        await createListing(formData);

        // Navigate to dashboard after successful submission
        if (!isSubmitting) {
            setTimeout(() => {
                navigate("/host/dashboard");
            }, 2000);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold tracking-tight">Create a New Listing</h1>
                <p className="text-muted-foreground mt-2">
                    Step {step} of 3: {step === 1 ? "Property Details" : step === 2 ? "Location & Pricing" : "Photos & Review"}
                </p>
                <div className="h-2 w-full bg-secondary mt-4 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
                <Card className="mb-6 border-destructive/50 bg-destructive/10">
                    <CardContent className="pt-6">
                        <h3 className="font-semibold text-destructive mb-2">Please fix the following errors:</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
                            {validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                    {/* Step 1: Property Details */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="title">Property Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Modern Loft in Downtown"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">Minimum 3 characters</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Tell guests what makes your place special..."
                                    className="min-h-[150px]"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">Minimum 20 characters</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bedrooms">Bedrooms</Label>
                                    <Input
                                        id="bedrooms"
                                        type="number"
                                        min="1"
                                        value={formData.bedrooms}
                                        onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bathrooms">Bathrooms</Label>
                                    <Input
                                        id="bathrooms"
                                        type="number"
                                        min="1"
                                        value={formData.bathrooms}
                                        onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxGuests">Max Guests *</Label>
                                    <Input
                                        id="maxGuests"
                                        type="number"
                                        min="1"
                                        value={formData.maxGuests}
                                        onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Amenities</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add an amenity (e.g. WiFi, Pool)"
                                        value={newAmenity}
                                        onChange={(e) => setNewAmenity(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                                    />
                                    <Button type="button" onClick={addAmenity} variant="outline">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.amenities.map((amenity) => (
                                        <Badge key={amenity} variant="secondary" className="gap-1">
                                            {amenity}
                                            <X
                                                className="w-3 h-3 cursor-pointer hover:text-destructive"
                                                onClick={() => removeAmenity(amenity)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Location & Pricing */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="location_city">City *</Label>
                                    <Input
                                        id="location_city"
                                        placeholder="e.g. New York"
                                        value={formData.location_city}
                                        onChange={(e) => setFormData({ ...formData, location_city: e.target.value, location: `${e.target.value}, ${formData.location_country}` })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location_country">Country *</Label>
                                    <Input
                                        id="location_country"
                                        placeholder="e.g. USA"
                                        value={formData.location_country}
                                        onChange={(e) => setFormData({ ...formData, location_country: e.target.value, location: `${formData.location_city}, ${e.target.value}` })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="locationTag">Location Tag</Label>
                                <Input
                                    id="locationTag"
                                    type="number"
                                    min="0"
                                    placeholder="Numeric location identifier (default: 0)"
                                    value={formData.locationTag}
                                    onChange={(e) => setFormData({ ...formData, locationTag: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Used for categorizing locations (0 = General, 1 = City, 2 = Beach, etc.)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">Price per Night (STX) *</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground font-medium">STX</span>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="pl-14"
                                        placeholder="0.00"
                                        value={formData.pricePerNight}
                                        onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Platform fee: 2% (automatically calculated)
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Photos & Review */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label>Property Photos * (Max 10)</Label>
                                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                        disabled={formData.images.length >= 10}
                                    />
                                    <label htmlFor="image-upload" className="cursor-pointer">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-4 rounded-full bg-primary/10 text-primary">
                                                <Upload className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-medium">Upload Photos</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {formData.images.length}/10 images uploaded
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                {/* Image Previews */}
                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-3 gap-4 mt-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                                                <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Listing Summary */}
                            <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                                <h3 className="font-medium flex items-center gap-2 text-lg">
                                    <Home className="w-5 h-5" />
                                    Listing Summary
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Title</p>
                                        <p className="font-medium">{formData.title || "Not set"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Location</p>
                                        <p className="font-medium">{formData.location_city && formData.location_country ? `${formData.location_city}, ${formData.location_country}` : "Not set"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Price per Night</p>
                                        <p className="font-medium">{formData.pricePerNight ? `${formData.pricePerNight} STX` : "Not set"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Max Guests</p>
                                        <p className="font-medium">{formData.maxGuests}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Bedrooms / Bathrooms</p>
                                        <p className="font-medium">{formData.bedrooms} / {formData.bathrooms}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Photos</p>
                                        <p className="font-medium">{formData.images.length} uploaded</p>
                                    </div>
                                </div>
                                {formData.amenities.length > 0 && (
                                    <div>
                                        <p className="text-muted-foreground text-sm mb-2">Amenities</p>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.amenities.map((amenity) => (
                                                <Badge key={amenity} variant="outline">{amenity}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Upload Progress */}
                            {isSubmitting && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Upload Progress</span>
                                        <span className="font-medium">{uploadProgress}%</span>
                                    </div>
                                    <Progress value={uploadProgress} className="h-2" />
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between border-t border-border pt-6">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 1 || isSubmitting}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    {step < 3 ? (
                        <Button onClick={handleNext} className="gradient-hero">
                            Next Step
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            className="gradient-hero"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Publishing..." : "Publish Listing"}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};

export default CreateListing;
