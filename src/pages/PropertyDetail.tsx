import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { openContractCall } from "@stacks/connect";
import { getProperty, bookProperty, PLATFORM_FEE_BPS, BPS_DENOMINATOR } from "@/lib/escrow";
import { fetchIPFSMetadata, getIPFSImageUrl } from "@/lib/ipfs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { usePendingBookings } from "@/hooks/use-pending-tx";
import { PostConditionMode } from "@stacks/transactions";
import {
  MapPin,
  Star,
  Users,
  Wifi,
  ArrowLeft,
  Calendar as CalendarIcon,
  Shield,
  ChevronDown,
  Bath,
  Bed,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReviewsList } from "@/components/ReviewsList";

/**
 * Convert a date to approximate Stacks block height
 * Stacks blocks are ~10 minutes apart, so ~144 blocks per day
 * This is an approximation - in production you'd fetch current block height from API
 */
function dateToBlockHeight(date: Date, currentBlockHeight: number = 100000): number {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const blocksPerDay = 144; // ~10 min per block = 144 blocks/day
  return currentBlockHeight + Math.floor(diffDays * blocksPerDay);
}

/**
 * Calculate number of nights between two dates
 */
function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffMs = checkOut.getTime() - checkIn.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.floor(diffDays));
}

const PropertyDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const propertyId = Number(id);
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addPendingBooking } = usePendingBookings();

  // Booking state
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState<number>(1);
  const [isBooking, setIsBooking] = useState(false);

  const {
    data: property,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["property-detail", propertyId],
    enabled: !Number.isNaN(propertyId),
    queryFn: async () => {
      // Fetch on-chain property
      const onChain = await getProperty(propertyId);
      if (!onChain) {
        throw new Error("Property not found on-chain");
      }

      // Fetch IPFS metadata
      const metadata = await fetchIPFSMetadata(onChain.metadataUri);
      if (!metadata) {
        throw new Error("Failed to load property metadata from IPFS");
      }

      // STRICT: Reject properties without IPFS images entirely
      if (!metadata.images || metadata.images.length === 0) {
        throw new Error("Property has no images in IPFS metadata");
      }

      const images = metadata.images.map(getIPFSImageUrl);

      // Map simple amenities (string[]) to objects with an icon + label
      const amenities =
        (metadata.amenities || []).map((label: string) => ({
          icon: Wifi,
          label,
        })) ?? [];

      const stxPrice = Number(onChain.pricePerNight) / 1_000_000;

      return {
        id: propertyId,
        title: metadata.title,
        location: metadata.location,
        priceStx: Number.isFinite(stxPrice) ? stxPrice.toFixed(2) : "0.00",
        pricePerNightMicroSTX: Number(onChain.pricePerNight),
        rating: 0, // From on-chain reputation system (0 = no reviews yet)
        reviews: 0,
        maxGuests: metadata.maxGuests,
        bedrooms: metadata.bedrooms,
        bathrooms: metadata.bathrooms,
        images,
        description: metadata.description,
        amenities,
        owner: onChain.owner,
        active: onChain.active,
      };
    },
  });

  const handleBooking = async () => {
    if (!userData) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to book this property",
        variant: "destructive",
      });
      return;
    }

    // Check if user is trying to book their own property
    const userAddress = userData.profile.stxAddress.testnet;
    if (userAddress === property.owner) {
      toast({
        title: "Cannot Book Own Property",
        description: "You cannot book a property that you own",
        variant: "destructive",
      });
      return;
    }

    if (!checkIn || !checkOut) {
      toast({
        title: "Dates Required",
        description: "Please select check-in and check-out dates",
        variant: "destructive",
      });
      return;
    }

    if (checkOut <= checkIn) {
      toast({
        title: "Invalid Dates",
        description: "Check-out date must be after check-in date",
        variant: "destructive",
      });
      return;
    }

    if (guests > property.maxGuests) {
      toast({
        title: "Too Many Guests",
        description: `Maximum ${property.maxGuests} guests allowed`,
        variant: "destructive",
      });
      return;
    }

    if (guests < 1) {
      toast({
        title: "Invalid Guest Count",
        description: "At least 1 guest is required",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    try {
      const numNights = calculateNights(checkIn, checkOut);

      // Convert dates to block heights (approximate)
      // In production, you'd fetch current block height from API
      const currentBlockHeight = 100000; // Placeholder - should fetch from API
      const checkInBlock = dateToBlockHeight(checkIn, currentBlockHeight);
      const checkOutBlock = dateToBlockHeight(checkOut, currentBlockHeight);

      // Calculate total amount (base cost + platform fee)
      const baseCost = property.pricePerNightMicroSTX * numNights;
      const platformFee = Math.floor((baseCost * PLATFORM_FEE_BPS) / BPS_DENOMINATOR);
      const totalAmount = baseCost + platformFee;

      console.log('📅 Booking details:', {
        propertyId,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        checkInBlock,
        checkOutBlock,
        numNights,
        guests,
      });

      console.log('💰 Payment breakdown:', {
        baseCost: `${baseCost} microSTX (${baseCost / 1_000_000} STX)`,
        platformFee: `${platformFee} microSTX (${platformFee / 1_000_000} STX)`,
        totalAmount: `${totalAmount} microSTX (${totalAmount / 1_000_000} STX)`,
      });

      toast({
        title: "Preparing Booking",
        description: "Please confirm the transaction in your wallet",
      });

      const contractCallOptions = await bookProperty({
        propertyId,
        checkIn: checkInBlock,
        checkOut: checkOutBlock,
        numNights,
      });

      await openContractCall({
        ...contractCallOptions,
        postConditionMode: PostConditionMode.Allow,
        onFinish: async (data) => {
          console.log('✅ Booking transaction submitted:', data);

          // Add to pending bookings immediately
          if (userData && checkIn && checkOut) {
            const numNights = calculateNights(checkIn, checkOut);
            const baseCost = property.pricePerNightMicroSTX * numNights;
            const platformFee = Math.floor((baseCost * PLATFORM_FEE_BPS) / BPS_DENOMINATOR);
            const totalAmount = baseCost + platformFee;

            addPendingBooking({
              txId: data.txId,
              propertyId: propertyId,
              checkIn: dateToBlockHeight(checkIn, 100000), // Approximate
              checkOut: dateToBlockHeight(checkOut, 100000), // Approximate
              guestAddress: userData.profile.stxAddress.testnet,
              totalAmount: totalAmount,
              createdAt: Date.now(),
              status: 'pending'
            });
          }

          try {
            toast({
              title: "Transaction Submitted",
              description: "Waiting for blockchain confirmation...",
            });

            // Poll for transaction confirmation
            const maxAttempts = 30;
            let attempts = 0;
            let bookingId: number | null = null;

            while (attempts < maxAttempts && bookingId === null) {
              attempts++;
              await new Promise(resolve => setTimeout(resolve, 2000));

              try {
                const txStatusResponse = await fetch(
                  `https://api.testnet.hiro.so/extended/v1/tx/${data.txId}`
                );

                if (txStatusResponse.ok) {
                  const txStatus = await txStatusResponse.json();
                  console.log(`Attempt ${attempts}: Transaction status:`, txStatus.tx_status);

                  if (txStatus.tx_status === 'success') {
                    const txResult = txStatus.tx_result;

                    if (txResult && txResult.repr) {
                      const match = txResult.repr.match(/\(ok u(\d+)\)/);
                      if (match && match[1]) {
                        bookingId = parseInt(match[1]);
                        console.log('✅ Booking ID extracted:', bookingId);
                        break;
                      }
                    }
                  } else if (txStatus.tx_status === 'abort_by_response' ||
                    txStatus.tx_status === 'abort_by_post_condition') {
                    // Provide more helpful error messages
                    let errorMessage = 'Transaction failed';
                    if (txStatus.tx_result && txStatus.tx_result.repr) {
                      if (txStatus.tx_result.repr.includes('u100')) {
                        errorMessage = 'Not authorized - you may be trying to book your own property';
                      } else if (txStatus.tx_result.repr.includes('u101')) {
                        errorMessage = 'Property not found';
                      } else if (txStatus.tx_result.repr.includes('u103')) {
                        errorMessage = 'Invalid amount or dates';
                      } else if (txStatus.tx_result.repr.includes('u104')) {
                        errorMessage = 'Property not available';
                      }
                    }
                    throw new Error(errorMessage);
                  }
                }
              } catch (pollError) {
                console.warn(`Attempt ${attempts} failed:`, pollError);
              }
            }

            if (bookingId === null) {
              throw new Error('Transaction confirmation timeout. Please check blockchain explorer.');
            }

            toast({
              title: "Booking Confirmed!",
              description: `Your booking #${bookingId} has been confirmed. Payment is held in escrow.`,
            });

            // Invalidate bookings cache to ensure fresh data on MyBookings and History pages
            await queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
            await queryClient.invalidateQueries({ queryKey: ["user-history"] });
            await queryClient.invalidateQueries({ queryKey: ["my-bookings"] });

            // Navigate to booking confirmation or history page
            setTimeout(() => {
              navigate(`/my-bookings`);
            }, 4000);

          } catch (confirmError) {
            console.error('Error during confirmation:', confirmError);
            toast({
              title: "Booking Submitted",
              description: confirmError instanceof Error ? confirmError.message : "Booking submitted. Confirmation may take time.",
            });
          } finally {
            setIsBooking(false);
          }
        },
        onCancel: () => {
          toast({
            title: "Booking Cancelled",
            description: "You cancelled the booking transaction",
            variant: "destructive",
          });
          setIsBooking(false);
        },
      });

    } catch (error) {
      console.error('Error booking property:', error);
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to book property",
        variant: "destructive",
      });
      setIsBooking(false);
    }
  };

  if (isLoading) return <Loader />;
  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-smooth" />
              <span>Back to Properties</span>
            </Link>
            <h1 className="text-3xl font-bold mb-4">Property not available</h1>
            <p className="text-muted-foreground">
              {(error as Error)?.message ?? "We couldn&apos;t load this property. Please try again."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link to="/properties" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-smooth" />
            <span>Back to Properties</span>
          </Link>

          {/* Title & Location */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">{property.title}</h1>
                <div className="flex items-center gap-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg">{property.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-accent fill-accent" />
                    <span className="text-lg font-semibold">{property.rating}</span>
                    <span className="text-lg">({property.reviews} reviews)</span>
                  </div>
                </div>
              </div>
              <Badge className="gradient-accent text-accent-foreground font-semibold shadow-glow px-4 py-2 text-sm">
                Verified
              </Badge>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-4 gap-4 rounded-3xl overflow-hidden mb-12 animate-scale-in">
            <div className="col-span-4 md:col-span-2 md:row-span-2 h-96 md:h-full">
              <img
                src={property.images[0]}
                alt="Main property view"
                className="w-full h-full object-cover hover:scale-105 transition-smooth duration-700"
              />
            </div>
            {property.images.slice(1).map((image, index) => (
              <div key={index} className="col-span-2 md:col-span-1 h-48">
                <img
                  src={image}
                  alt={`Property view ${index + 2}`}
                  className="w-full h-full object-cover hover:scale-105 transition-smooth duration-700"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Property Stats */}
              <div className="flex items-center gap-8 pb-8 border-b border-border animate-fade-in">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-semibold text-lg">{property.maxGuests} Guests</div>
                    <div className="text-sm text-muted-foreground">Maximum capacity</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Bed className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{property.bedrooms} Bedrooms</div>
                    <div className="text-sm text-muted-foreground">Comfortable beds</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Bath className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{property.bathrooms} Bathrooms</div>
                    <div className="text-sm text-muted-foreground">Modern facilities</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-4">About This Property</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {property.description}
                </p>
              </div>

              {/* Amenities */}
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-6">Amenities</h2>
                <div className="grid grid-cols-2 gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-smooth"
                    >
                      <amenity.icon className="w-6 h-6 text-primary" />
                      <span className="font-medium">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="animate-fade-in">
                <ReviewsList
                  userAddress={property.owner}
                  title="Host Reviews"
                />
              </div>

              {/* Highlights */}
              {/* You can later add on-chain highlights or reviews here */}
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-28 p-8 shadow-elegant border-border animate-fade-in">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold">{property.priceStx} STX</span>
                    <span className="text-muted-foreground">/ night</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Blockchain verified</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Check-in Date Picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal p-4 h-auto",
                          !checkIn && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">Check-in</span>
                          {checkIn ? (
                            <span className="text-sm">{format(checkIn, "PPP")}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Select date</span>
                          )}
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkIn}
                        onSelect={setCheckIn}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Check-out Date Picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal p-4 h-auto",
                          !checkOut && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">Check-out</span>
                          {checkOut ? (
                            <span className="text-sm">{format(checkOut, "PPP")}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Select date</span>
                          )}
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkOut}
                        onSelect={setCheckOut}
                        disabled={(date) => {
                          if (!checkIn) return date < new Date();
                          return date <= checkIn;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Guests Selector */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between p-4 h-auto font-normal"
                      >
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-primary" />
                          <div className="flex flex-col items-start">
                            <span className="font-semibold">Guests</span>
                            <span className="text-sm text-muted-foreground">{guests} {guests === 1 ? 'guest' : 'guests'}</span>
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="start">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Number of guests</label>
                        <div className="flex items-center gap-4">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setGuests(Math.max(1, guests - 1))}
                            disabled={guests <= 1}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-semibold">{guests}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setGuests(Math.min(property.maxGuests, guests + 1))}
                            disabled={guests >= property.maxGuests}
                          >
                            +
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Max {property.maxGuests} guests</p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Price Breakdown */}
                {checkIn && checkOut && (
                  <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border space-y-2">
                    {(() => {
                      const numNights = calculateNights(checkIn, checkOut);
                      const baseCost = (property.pricePerNightMicroSTX / 1_000_000) * numNights;
                      const platformFee = (baseCost * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
                      const total = baseCost + platformFee;

                      return (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{property.priceStx} STX × {numNights} {numNights === 1 ? 'night' : 'nights'}</span>
                            <span className="font-medium">{baseCost.toFixed(2)} STX</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Service fee ({PLATFORM_FEE_BPS / 100}%)</span>
                            <span className="font-medium">{platformFee.toFixed(2)} STX</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                            <span>Total</span>
                            <span>{total.toFixed(2)} STX</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                <Button
                  className="w-full gradient-hero text-primary-foreground font-semibold shadow-elegant hover:shadow-glow transition-smooth h-14 text-lg rounded-xl mb-4"
                  disabled={!checkIn || !checkOut || !property.active || isBooking || !userData || (userData && userData.profile.stxAddress.testnet === property.owner)}
                  onClick={handleBooking}
                >
                  {!userData
                    ? "Connect Wallet to Book"
                    : userData.profile.stxAddress.testnet === property.owner
                      ? "Cannot Book Own Property"
                      : !property.active
                        ? "Property Not Available"
                        : isBooking
                          ? "Processing..."
                          : "Book Now with Wallet"}
                </Button>

                {!userData && (
                  <p className="text-xs text-center text-muted-foreground mb-4">
                    Connect your Stacks wallet to book
                  </p>
                )}

                {checkIn && checkOut && (
                  <p className="text-xs text-center text-muted-foreground">
                    Payment will be held in escrow until check-in
                  </p>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;