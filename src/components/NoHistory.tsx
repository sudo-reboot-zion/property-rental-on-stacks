import EmptyState from "./EmptyState";
import { History } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NoHistory = () => {
    const navigate = useNavigate();

    return (
        <EmptyState
            icon={History}
            title="No Booking History Yet"
            description="You haven't made any bookings yet. Start exploring amazing properties and create your first travel memory on the blockchain!"
            action={{
                label: "Explore Properties",
                onClick: () => navigate("/properties"),
            }}
        />
    );
};

export default NoHistory;
