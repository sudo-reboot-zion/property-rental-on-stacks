import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  SlidersHorizontal, 
  X,
  Home,
  BedDouble,
  Bath,
  Sparkles,
  Filter
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface SearchFilters {
  location: string;
  guests: number;
  priceRange: [number, number];
  checkIn?: Date;
  checkOut?: Date;
  bedrooms?: number;
  bathrooms?: number;
  amenities: string[];
  searchText: string;
}

interface SearchBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
}

const SearchBar = ({ filters, onFiltersChange, activeFiltersCount, onClearFilters }: SearchBarProps) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Common amenities for quick selection
  const commonAmenities = [
    "WIFI",
    "Kitchen",
    "Parking",
    "Pool",
    "Heater",
    "Air Conditioning",
    "Washer",
    "TV",
    "Pet Friendly",
    "Gym",
  ];

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="w-full space-y-4">
      {/* Main Search Bar */}
      <div className="bg-card rounded-3xl shadow-elegant border border-border p-4 md:p-6 backdrop-blur-sm">
        <div className={cn(
          "grid grid-cols-1 gap-4 items-end",
          hasActiveFilters ? "md:grid-cols-12" : "md:grid-cols-10"
        )}>
          {/* Search Text Input */}
          <div className="md:col-span-4">
            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
              Search Properties
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by title, description, or location..."
                value={filters.searchText}
                onChange={(e) => updateFilter("searchText", e.target.value)}
                className="pl-11 bg-muted/50 border-0 h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-primary transition-all"
              />
            </div>
          </div>

        {/* Location */}
          <div className="md:col-span-2">
          <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
            Location
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
                placeholder="City or Country"
                value={filters.location}
                onChange={(e) => updateFilter("location", e.target.value)}
                className="pl-11 bg-muted/50 border-0 h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="md:col-span-2">
          <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
            Guests
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12 bg-muted/50 border-0 rounded-xl hover:bg-muted transition-all",
                    filters.guests > 1 && "bg-primary/10 border-primary/20"
                  )}
              >
                <Users className="mr-2 h-4 w-4" />
                  {filters.guests} {filters.guests === 1 ? "guest" : "guests"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Number of Guests</Label>
                  <Slider
                      value={[filters.guests]}
                      onValueChange={(value) => updateFilter("guests", value[0])}
                    min={1}
                    max={16}
                    step={1}
                    className="mb-2"
                  />
                  <div className="text-sm text-muted-foreground text-center">
                      {filters.guests} {filters.guests === 1 ? "guest" : "guests"}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

          {/* Advanced Filters */}
          <div className="md:col-span-2">
            <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                  className={cn(
                    "w-full h-12 bg-muted/50 border-0 rounded-xl hover:bg-muted transition-all relative",
                    hasActiveFilters && "bg-primary/10 border-primary/20"
                  )}
              >
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground">
                      {activeFiltersCount}
                    </Badge>
                  )}
              </Button>
            </PopoverTrigger>
              <PopoverContent className="w-96 max-h-[80vh] overflow-y-auto" align="end">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Advanced Filters</h3>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onClearFilters();
                          setIsAdvancedOpen(false);
                        }}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>

                  {/* Price Range */}
                <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Price Range (STX per night)
                    </Label>
                  <Slider
                      value={filters.priceRange}
                      onValueChange={(value) => updateFilter("priceRange", value as [number, number])}
                    min={0}
                      max={10000}
                      step={50}
                    className="mb-2"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{filters.priceRange[0]} STX</span>
                      <span>{filters.priceRange[1]} STX</span>
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
                      <BedDouble className="w-4 h-4" />
                      Bedrooms
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((beds) => (
                        <Button
                          key={beds}
                          variant={filters.bedrooms === beds ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateFilter("bedrooms", filters.bedrooms === beds ? undefined : beds)}
                          className={cn(
                            filters.bedrooms === beds && "gradient-hero text-primary-foreground"
                          )}
                        >
                          {beds}+
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
                      <Bath className="w-4 h-4" />
                      Bathrooms
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((baths) => (
                        <Button
                          key={baths}
                          variant={filters.bathrooms === baths ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateFilter("bathrooms", filters.bathrooms === baths ? undefined : baths)}
                          className={cn(
                            filters.bathrooms === baths && "gradient-hero text-primary-foreground"
                          )}
                        >
                          {baths}+
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Amenities
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {commonAmenities.map((amenity) => {
                        const isSelected = filters.amenities.includes(amenity);
                        return (
                          <div
                            key={amenity}
                            className="flex items-center space-x-2 cursor-pointer"
                            onClick={() => {
                              const newAmenities = isSelected
                                ? filters.amenities.filter((a) => a !== amenity)
                                : [...filters.amenities, amenity];
                              updateFilter("amenities", newAmenities);
                            }}
                          >
                            <Checkbox
                              id={amenity}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                const newAmenities = checked
                                  ? [...filters.amenities, amenity]
                                  : filters.amenities.filter((a) => a !== amenity);
                                updateFilter("amenities", newAmenities);
                              }}
                            />
                            <label
                              htmlFor={amenity}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {amenity}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Check-in Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {filters.checkIn ? format(filters.checkIn, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={filters.checkIn}
                            onSelect={(date) => updateFilter("checkIn", date)}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Check-out Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {filters.checkOut ? format(filters.checkOut, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={filters.checkOut}
                            onSelect={(date) => updateFilter("checkOut", date)}
                            disabled={(date) => {
                              if (!filters.checkIn) return date < new Date();
                              return date <= filters.checkIn;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

          {/* Clear Button (only show if filters active) */}
          {hasActiveFilters && (
        <div className="md:col-span-2">
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="w-full h-12 border-destructive/50 text-destructive hover:bg-destructive/10 rounded-xl"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
          </Button>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 px-2">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Filter className="w-4 h-4" />
            Active filters:
          </span>
          {filters.location && (
            <Badge variant="secondary" className="gap-1">
              <MapPin className="w-3 h-3" />
              {filters.location}
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => updateFilter("location", "")}
              />
            </Badge>
          )}
          {filters.guests > 1 && (
            <Badge variant="secondary" className="gap-1">
              <Users className="w-3 h-3" />
              {filters.guests} guests
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => updateFilter("guests", 1)}
              />
            </Badge>
          )}
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) && (
            <Badge variant="secondary" className="gap-1">
              {filters.priceRange[0]}-{filters.priceRange[1]} STX
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => updateFilter("priceRange", [0, 10000])}
              />
            </Badge>
          )}
          {filters.bedrooms && (
            <Badge variant="secondary" className="gap-1">
              <BedDouble className="w-3 h-3" />
              {filters.bedrooms}+ beds
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => updateFilter("bedrooms", undefined)}
              />
            </Badge>
          )}
          {filters.bathrooms && (
            <Badge variant="secondary" className="gap-1">
              <Bath className="w-3 h-3" />
              {filters.bathrooms}+ baths
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => updateFilter("bathrooms", undefined)}
              />
            </Badge>
          )}
          {filters.amenities.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              {filters.amenities.length} amenities
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => updateFilter("amenities", [])}
              />
            </Badge>
          )}
          {filters.checkIn && (
            <Badge variant="secondary" className="gap-1">
              <Calendar className="w-3 h-3" />
              Check-in: {format(filters.checkIn, "MMM d")}
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => updateFilter("checkIn", undefined)}
              />
            </Badge>
          )}
          {filters.checkOut && (
            <Badge variant="secondary" className="gap-1">
              <Calendar className="w-3 h-3" />
              Check-out: {format(filters.checkOut, "MMM d")}
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => updateFilter("checkOut", undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
