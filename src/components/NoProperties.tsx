import EmptyState from "./EmptyState";
import { Home, Search, PlusCircle, ShoppingBag, History as HistoryIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NoPropertiesProps {
    variant?: "search" | "general" | "host" | "bookings" | "history";
}

const NoProperties = ({ variant = "general" }: NoPropertiesProps) => {
    const navigate = useNavigate();

    const configs = {
        search: {
            icon: Search,
            title: "No Properties Found",
            description: "We couldn't find any properties matching your search criteria. Try adjusting your filters or search in a different location.",
            action: {
                label: "Clear Filters",
                onClick: () => window.location.reload(),
            },
        },
        general: {
            icon: Home,
            title: "No Properties Available Yet",
            description: "We're working hard to onboard amazing properties to our platform. Check back soon for exciting new listings!",
            action: undefined,
        },
        host: {
            icon: PlusCircle,
            title: "No Properties Listed",
            description: "You haven't listed any properties yet. Start earning by listing your first property on the blockchain!",
            action: {
                label: "Create Your First Listing",
                onClick: () => navigate("/host/create-listing"),
            },
        },
        bookings: {
            icon: ShoppingBag,
            title: "No Bookings Yet",
            description: "You haven't made any bookings yet. Start exploring our unique properties and book your next stay!",
            action: {
                label: "Browse Properties",
                onClick: () => navigate("/properties"),
            },
        },
        history: {
            icon: HistoryIcon,
            title: "No Activity History",
            description: "You don't have any past bookings or hosting history yet. Your activity will appear here once you start using the platform.",
            action: {
                label: "Start Exploring",
                onClick: () => navigate("/properties"),
            },
        },
    };

    const config = configs[variant];

    return <EmptyState {...config} />;
};

export default NoProperties;
