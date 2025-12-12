import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import SearchBar, { SearchFilters } from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import NoProperties from "@/components/NoProperties";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllProperties } from "@/lib/escrow";
import { fetchIPFSMetadata, getIPFSImageUrl } from "@/lib/ipfs";
import "@/lib/debug"; // Load blockchain debug utilities

const Properties = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Search filters state
  const [filters, setFilters] = useState<SearchFilters>({
    location: "",
    guests: 1,
    priceRange: [0, 100000000], // Very high max to show all properties (including those with data errors)
    checkIn: undefined,
    checkOut: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    amenities: [],
    searchText: "",
  });

  const { data: properties = [], isLoading, error, refetch } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      console.log('🔍 Fetching properties from blockchain...');

      // Fetch properties from blockchain - increased limit to get all properties
      const blockchainProperties = await getAllProperties(200);
      console.log(`✅ Found ${blockchainProperties.length} properties on blockchain`);

      // Enrich each property with IPFS metadata
      const enrichedProperties = await Promise.all(
        blockchainProperties.map(async (prop) => {
          const metadata = await fetchIPFSMetadata(prop.metadataUri);

          if (!metadata) {
            console.warn(`⚠️ Could not fetch metadata for property #${prop.id}`);
            return null;
          }

          // Validate and convert pricePerNight to a number
          // pricePerNight is stored in microSTX on-chain
          let pricePerNight: number;
          if (typeof prop.pricePerNight === 'number' && !isNaN(prop.pricePerNight) && prop.pricePerNight > 0) {
            pricePerNight = prop.pricePerNight;
          } else {
            console.warn(`⚠️ Invalid pricePerNight for property #${prop.id}:`, prop.pricePerNight);
            // Fallback to 0 if invalid (will show as 0.00 STX)
            pricePerNight = 0;
          }

          console.log(`💰 Property #${prop.id} - pricePerNight: ${pricePerNight} microSTX (${pricePerNight / 1_000_000} STX)`);

          // Get the first image URL - convert IPFS URI to HTTP gateway URL
          // STRICT: Properties without images are excluded entirely (no fallback)
          if (!metadata.images || metadata.images.length === 0) {
            console.warn(`⚠️ Property #${prop.id} - No images in metadata, excluding from results`);
            return null;
          }

          const coverImage = getIPFSImageUrl(metadata.images[0]);
          console.log(`🖼️ Property #${prop.id} - Cover image URL:`, coverImage);

          // Convert all image IPFS URIs to HTTP URLs
          const imageUrls = metadata.images
            ? metadata.images.map((imgUri: string) => {
              const httpUrl = getIPFSImageUrl(imgUri);
              console.log(`🖼️ Property #${prop.id} - Image URL: ${imgUri} -> ${httpUrl}`);
              return httpUrl;
            })
            : [];

          return {
            id: prop.id,
            blockchain_id: prop.id,
            title: metadata.title,
            description: metadata.description,
            location_city: metadata.location.split(',')[0]?.trim() || metadata.location,
            location_country: metadata.location.split(',')[1]?.trim() || '',
            // Pass the validated price in microSTX
            price_per_night: pricePerNight,
            max_guests: metadata.maxGuests,
            bedrooms: metadata.bedrooms,
            bathrooms: metadata.bathrooms,
            amenities: metadata.amenities,
            cover_image: coverImage,
            images: imageUrls,
            active: prop.active,
            owner: prop.owner,
          };
        })
      );

      // Filter out null values (failed metadata fetches)
      const validProperties = enrichedProperties.filter(prop => prop !== null);
      console.log(`✅ Successfully enriched ${validProperties.length} properties with IPFS data`);

      return validProperties;
    }
  });

  const handleRefresh = () => {
    console.log('🔄 Manually refreshing properties...');
    refetch();
  };

  // Filter properties based on search criteria
  const filteredProperties = useMemo(() => {
    if (!properties || properties.length === 0) return [];

    console.log(`🔍 Filtering ${properties.length} properties with filters:`, filters);

    const filtered = properties.filter((property: any) => {
      // Search text filter (title, description, location)
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchesSearch =
          property.title?.toLowerCase().includes(searchLower) ||
          property.description?.toLowerCase().includes(searchLower) ||
          property.location_city?.toLowerCase().includes(searchLower) ||
          property.location_country?.toLowerCase().includes(searchLower);
        if (!matchesSearch) {
          console.log(`❌ Property #${property.id} filtered: search text doesn't match`);
          return false;
        }
      }

      // Location filter
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        const matchesLocation =
          property.location_city?.toLowerCase().includes(locationLower) ||
          property.location_country?.toLowerCase().includes(locationLower);
        if (!matchesLocation) {
          console.log(`❌ Property #${property.id} filtered: location doesn't match`);
          return false;
        }
      }

      // Guests filter
      if (filters.guests > 1) {
        if (!property.max_guests || property.max_guests < filters.guests) {
          console.log(`❌ Property #${property.id} filtered: max_guests (${property.max_guests}) < required (${filters.guests})`);
          return false;
        }
      }

      // Price range filter (convert microSTX to STX)
      const priceInSTX = property.price_per_night / 1_000_000;
      // Handle edge cases: if price is 0 or invalid, still show it (might be free or data issue)
      if (priceInSTX > 0 && (priceInSTX < filters.priceRange[0] || priceInSTX > filters.priceRange[1])) {
        console.log(`❌ Property #${property.id} filtered: price ${priceInSTX.toFixed(2)} STX outside range [${filters.priceRange[0]}, ${filters.priceRange[1]}]`);
        return false;
      }

      // Bedrooms filter
      if (filters.bedrooms !== undefined) {
        if (!property.bedrooms || property.bedrooms < filters.bedrooms) {
          console.log(`❌ Property #${property.id} filtered: bedrooms (${property.bedrooms}) < required (${filters.bedrooms})`);
          return false;
        }
      }

      // Bathrooms filter
      if (filters.bathrooms !== undefined) {
        if (!property.bathrooms || property.bathrooms < filters.bathrooms) {
          console.log(`❌ Property #${property.id} filtered: bathrooms (${property.bathrooms}) < required (${filters.bathrooms})`);
          return false;
        }
      }

      // Amenities filter (all selected amenities must be present)
      if (filters.amenities.length > 0) {
        const propertyAmenities = (property.amenities || []).map((a: string) => a.toUpperCase());
        const hasAllAmenities = filters.amenities.every((amenity) =>
          propertyAmenities.includes(amenity.toUpperCase())
        );
        if (!hasAllAmenities) {
          console.log(`❌ Property #${property.id} filtered: missing amenities. Has: ${propertyAmenities.join(', ')}, Required: ${filters.amenities.join(', ')}`);
          return false;
        }
      }

      // Only show active properties (but log for debugging)
      if (property.active === false) {
        console.log(`❌ Property #${property.id} filtered: not active (active=${property.active})`);
        return false;
      }

      // Also handle undefined/null active status - default to showing it
      if (property.active === undefined || property.active === null) {
        console.log(`⚠️ Property #${property.id} has undefined active status, showing anyway`);
      }

      console.log(`✅ Property #${property.id} passed all filters`);
      return true;
    });

    console.log(`📊 Filtering result: ${filtered.length} of ${properties.length} properties passed filters`);
    return filtered;
  }, [properties, filters]);

  // Count active filters (don't count price range if it's the default [0, 1000])
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchText) count++;
    if (filters.location) count++;
    if (filters.guests > 1) count++;
    // Only count price range if it's been changed from default
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++;
    if (filters.bedrooms !== undefined) count++;
    if (filters.bathrooms !== undefined) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.checkIn) count++;
    if (filters.checkOut) count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      location: "",
      guests: 1,
      priceRange: [0, 100000000], // Match the new default
      checkIn: undefined,
      checkOut: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      amenities: [],
      searchText: "",
    });
  };

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t('pages.properties.errorLoading')}</h2>
          <p className="text-muted-foreground">{(error as Error).message}</p>
          <Button onClick={() => refetch()} className="mt-4">{t('common.tryAgain')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold mb-4">{t('pages.properties.title')}</h1>
                <p className="text-xl text-muted-foreground">
                  {t('pages.properties.subtitle')}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-12 animate-slide-up">
            <SearchBar
              filters={filters}
              onFiltersChange={setFilters}
              activeFiltersCount={activeFiltersCount}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Results Summary */}
          {filteredProperties.length !== properties.length && (
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">
                  {t('pages.properties.showingResults', { count: filteredProperties.length, total: properties.length })}
                </span>
              </div>
            </div>
          )}

          {filteredProperties.length > 0 ? (
            <>
              {/* View Toggle & Results Count */}
              <div className="flex items-center justify-between mb-8 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-bold">
                    {filteredProperties.length} {filteredProperties.length === 1 ? t('common.properties_one') : t('common.properties_other')} {t('pages.properties.available')}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeFiltersCount > 0
                      ? t('pages.properties.filteredFrom', { total: properties.length })
                      : t('pages.properties.verifiedListings')
                    }
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "gradient-hero text-primary-foreground" : ""}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "gradient-hero text-primary-foreground" : ""}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Property Grid */}
              <div className={`grid gap-8 ${viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
                } animate-scale-in`}>
                {filteredProperties.map((property: any, index: number) => {
                  // Debug: log price value before passing to PropertyCard
                  if (index === 0) {
                    console.log('🔍 Debug - Property price_per_night:', property.price_per_night, 'Type:', typeof property.price_per_night);
                  }

                  return (
                    <div
                      key={property.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <PropertyCard
                        id={property.blockchain_id}
                        title={property.title || "Untitled Property"}
                        location={`${property.location_city || ""}, ${property.location_country || ""}`}
                        // Pass raw microSTX value and let PropertyCard handle formatting
                        price={property.price_per_night}
                        guests={property.max_guests || 2}
                        imageUrl={property.cover_image}
                        featured={index === 0}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Load More */}
              <div className="mt-16 text-center">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-border hover:border-primary transition-smooth px-12 h-14 rounded-xl font-semibold"
                >
                  {t('pages.properties.loadMore')}
                </Button>
              </div>
            </>
          ) : (
            <NoProperties variant="general" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Properties;