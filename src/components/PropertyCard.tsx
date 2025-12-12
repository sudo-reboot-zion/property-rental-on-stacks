import { Link } from "react-router-dom";
import { MapPin, Star, Users, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PropertyCardProps {
  id: number;
  title: string;
  location: string;
  price: string | number; // Can be "X STX" or number in microSTX
  rating?: number;
  reviews?: number;
  guests: number;
  imageUrl: string;
  featured?: boolean;
}



const PropertyCard = ({
  id,
  title,
  location,
  price,
  rating = 0,
  reviews = 0,
  guests,
  imageUrl,
  featured = false,
}: PropertyCardProps) => {
  // Format price - handle both string and number formats

  const formatPrice = () => {
    // If price is a string like "5 STX", return as-is
    if (typeof price === "string") {
      return price;
    }

    // If price is undefined, null, or not a number, return fallback
    if (price === undefined || price === null || typeof price !== "number") {
      return "Price N/A";
    }

    // If price is NaN or not a finite number, return fallback
    if (isNaN(price) || !isFinite(price)) {
      return "Price N/A";
    }

    // Price is in microSTX, convert to STX
    // Ensure we don't divide by zero and handle very small values
    if (price === 0) {
      return "0.00 STX";
    }

    const stxAmount = (price / 1_000_000).toFixed(2);
    return `${stxAmount} STX`;
  };


  const formattedPrice = formatPrice();

  return (
    <Link to={`/property/${id}`}>
      <Card className="group overflow-hidden border-border hover:border-primary transition-smooth cursor-pointer shadow-card hover:shadow-elegant">
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-700"
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {featured && (
              <Badge className="gradient-accent text-accent-foreground font-semibold shadow-glow">
                Featured
              </Badge>
            )}
            <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-border">
              <Shield className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-elegant">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="font-semibold text-sm">
                {reviews > 0 ? rating : "New"}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Location */}
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{location}</span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-smooth">
            {title}
          </h3>

          {/* Details */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-sm">{guests} guests</span>
            </div>
            {reviews > 0 && (
              <span className="text-sm text-muted-foreground">
                {reviews} {reviews === 1 ? 'review' : 'reviews'}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{formattedPrice}</span>
            <span className="text-muted-foreground">/ night</span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default PropertyCard;