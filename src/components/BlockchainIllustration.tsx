/**
 * BlockchainIllustration - An animated SVG illustration for empty states
 * Features floating blockchain nodes with connecting lines
 */

const BlockchainIllustration = () => {
    return (
        <svg
            width="300"
            height="200"
            viewBox="0 0 300 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-20"
        >
            {/* Connecting Lines */}
            <g className="animate-pulse" style={{ animationDuration: "3s" }}>
                <line
                    x1="60"
                    y1="60"
                    x2="150"
                    y2="100"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="text-primary"
                />
                <line
                    x1="150"
                    y1="100"
                    x2="240"
                    y2="60"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="text-primary"
                />
                <line
                    x1="60"
                    y1="140"
                    x2="150"
                    y2="100"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="text-primary"
                />
                <line
                    x1="150"
                    y1="100"
                    x2="240"
                    y2="140"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="text-primary"
                />
            </g>

            {/* Blockchain Nodes */}
            <g className="animate-float" style={{ animationDelay: "0s" }}>
                <rect
                    x="40"
                    y="40"
                    width="40"
                    height="40"
                    rx="8"
                    fill="currentColor"
                    className="text-primary/20"
                />
                <rect
                    x="45"
                    y="45"
                    width="30"
                    height="30"
                    rx="6"
                    fill="currentColor"
                    className="text-primary/40"
                />
            </g>

            <g className="animate-float" style={{ animationDelay: "0.5s" }}>
                <rect
                    x="130"
                    y="80"
                    width="40"
                    height="40"
                    rx="8"
                    fill="currentColor"
                    className="text-accent/20"
                />
                <rect
                    x="135"
                    y="85"
                    width="30"
                    height="30"
                    rx="6"
                    fill="currentColor"
                    className="text-accent/40"
                />
            </g>

            <g className="animate-float" style={{ animationDelay: "1s" }}>
                <rect
                    x="220"
                    y="40"
                    width="40"
                    height="40"
                    rx="8"
                    fill="currentColor"
                    className="text-primary/20"
                />
                <rect
                    x="225"
                    y="45"
                    width="30"
                    height="30"
                    rx="6"
                    fill="currentColor"
                    className="text-primary/40"
                />
            </g>

            <g className="animate-float" style={{ animationDelay: "0.3s" }}>
                <rect
                    x="40"
                    y="120"
                    width="40"
                    height="40"
                    rx="8"
                    fill="currentColor"
                    className="text-accent/20"
                />
                <rect
                    x="45"
                    y="125"
                    width="30"
                    height="30"
                    rx="6"
                    fill="currentColor"
                    className="text-accent/40"
                />
            </g>

            <g className="animate-float" style={{ animationDelay: "0.8s" }}>
                <rect
                    x="220"
                    y="120"
                    width="40"
                    height="40"
                    rx="8"
                    fill="currentColor"
                    className="text-primary/20"
                />
                <rect
                    x="225"
                    y="125"
                    width="30"
                    height="30"
                    rx="6"
                    fill="currentColor"
                    className="text-primary/40"
                />
            </g>

            {/* Glowing Dots */}
            <circle cx="60" cy="60" r="4" fill="currentColor" className="text-primary animate-pulse" />
            <circle cx="150" cy="100" r="4" fill="currentColor" className="text-accent animate-pulse" style={{ animationDelay: "0.5s" }} />
            <circle cx="240" cy="60" r="4" fill="currentColor" className="text-primary animate-pulse" style={{ animationDelay: "1s" }} />
            <circle cx="60" cy="140" r="4" fill="currentColor" className="text-accent animate-pulse" style={{ animationDelay: "0.3s" }} />
            <circle cx="240" cy="140" r="4" fill="currentColor" className="text-primary animate-pulse" style={{ animationDelay: "0.8s" }} />
        </svg>
    );
};

export default BlockchainIllustration;
