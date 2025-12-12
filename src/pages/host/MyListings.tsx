import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Home, MapPin, DollarSign, Users, MoreVertical, Edit, Eye, Trash2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useHostProperties } from "@/hooks/use-host-properties";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MyListings = () => {
    const { data: properties = [], isLoading } = useHostProperties();

    const activeListings = properties.filter(p => p.active).length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight">My Listings</h1>
                    <p className="text-muted-foreground mt-1">Manage your properties and availability.</p>
                </div>
                <Link to="/host/create-listing">
                    <Button className="gradient-hero shadow-elegant hover:shadow-glow transition-smooth">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Property
                    </Button>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Properties</CardTitle>
                        <Home className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{properties.length}</div>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle>
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeListings}</div>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Capacity</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {properties.reduce((sum, p) => sum + (p.max_guests || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Listings List */}
            {properties.length === 0 ? (
                <Card className="border-dashed border-2 border-border/50 bg-muted/20">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Home className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No properties listed yet</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            Start earning by listing your first property on StackNStay. It only takes a few minutes.
                        </p>
                        <Link to="/host/create-listing">
                            <Button>Create Your First Listing</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {properties.map((property) => (
                        <Card key={property.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-smooth overflow-hidden group">
                            <div className="flex flex-col sm:flex-row">
                                {/* Image */}
                                <div className="sm:w-48 h-48 sm:h-auto relative">
                                    <img
                                        src={property.cover_image || "/placeholder-house.jpg"}
                                        alt={property.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-2 left-2">
                                        <Badge variant={property.active ? "default" : "secondary"} className={property.active ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                                            {property.active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                                                    {property.title}
                                                </h3>
                                                <div className="flex items-center text-muted-foreground text-sm mt-1">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {property.location_city}, {property.location_country}
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/property/${property.blockchain_id}`} className="flex items-center cursor-pointer">
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View Listing
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer" disabled>
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit Details (Coming Soon)
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                                            {property.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm">
                                        <div className="flex items-center font-medium">
                                            <DollarSign className="w-4 h-4 mr-1 text-primary" />
                                            {property.price_per_night} STX <span className="text-muted-foreground font-normal ml-1">/ night</span>
                                        </div>
                                        <div className="flex items-center text-muted-foreground">
                                            <Users className="w-4 h-4 mr-1" />
                                            Up to {property.max_guests} guests
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyListings;
