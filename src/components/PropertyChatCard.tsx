/**
 * Property Chat Card
 * Simplified property card for chat interface
 */
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Bed, Bath, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getIPFSImageUrl } from '@/lib/ipfs';
import type { Property } from '@/lib/api/chat';

interface PropertyChatCardProps {
    property: Property;
    onClose?: () => void;
}

export function PropertyChatCard({ property, onClose }: PropertyChatCardProps) {
    const navigate = useNavigate();

    // STRICT: Only use IPFS images, no fallbacks
    const imageUrl = property.images?.[0]
        ? getIPFSImageUrl(property.images[0])
        : undefined;

    const matchScore = property.match_score ? Math.round(property.match_score * 100) : null;

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex flex-row h-28">
            {/* Image Section (Left) */}
            <div className="relative w-28 h-full flex-shrink-0">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={property.title || 'Property'}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        No image
                    </div>
                )}
                {matchScore && (
                    <Badge className="absolute top-1 left-1 bg-primary/90 backdrop-blur-sm text-[10px] px-1.5 py-0.5">
                        {matchScore}%
                    </Badge>
                )}
            </div>

            {/* Content Section (Right) */}
            <CardContent className="flex-1 p-3 flex flex-col justify-between min-w-0">
                <div>
                    {/* Title */}
                    <h3 className="font-semibold text-sm line-clamp-1 mb-1" title={property.title}>
                        {property.title}
                    </h3>

                    {/* Location */}
                    {property.location_city && (
                        <div className="flex items-center text-xs text-muted-foreground mb-1">
                            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">
                                {property.location_city}
                                {property.location_country && `, ${property.location_country}`}
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer: Price & Action */}
                <div className="flex items-end justify-between mt-1">
                    <div>
                        <span className="text-base font-bold text-primary">
                            {typeof property.price_per_night === 'number'
                                ? (property.price_per_night / 1_000_000).toFixed(2)
                                : property.price_per_night} STX
                        </span>
                        <span className="text-xs text-muted-foreground">/night</span>
                    </div>
                    <Button
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={() => {
                            navigate(`/property/${property.property_id}`);
                            onClose?.();
                        }}
                    >
                        View
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
