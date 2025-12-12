import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getAllDisputes, resolveDispute, getContractOwner, type Dispute } from "@/lib/dispute";
import { openContractCall } from "@stacks/connect";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface EnrichedDispute extends Dispute {
    id: number;
}

export default function AdminDisputes() {
    const { userData } = useAuth();
    const { toast } = useToast();
    const [disputes, setDisputes] = useState<EnrichedDispute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDispute, setSelectedDispute] = useState<EnrichedDispute | null>(null);
    const [resolution, setResolution] = useState("");
    const [refundPercentage, setRefundPercentage] = useState("0");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [checkingOwner, setCheckingOwner] = useState(true);

    useEffect(() => {
        loadDisputes();
    }, []);

    useEffect(() => {
        checkAccess();
    }, [userData]);

    const checkAccess = async () => {
        if (!userData) {
            setCheckingOwner(false);
            return;
        }

        try {
            const owner = await getContractOwner();
            // In testnet, we compare with testnet address
            const userAddress = userData.profile.stxAddress.testnet;

            if (owner === userAddress) {
                setIsOwner(true);
                loadDisputes();
            } else {
                setIsOwner(false);
            }
        } catch (error) {
            console.error("Error checking owner:", error);
        } finally {
            setCheckingOwner(false);
        }
    };

    const loadDisputes = async () => {
        setIsLoading(true);
        try {
            const data = await getAllDisputes();
            setDisputes(data);
        } catch (error) {
            console.error("Failed to load disputes:", error);
            toast({
                title: "Error",
                description: "Failed to load disputes",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!selectedDispute || !resolution.trim()) return;

        const percentage = parseInt(refundPercentage);
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            toast({
                title: "Invalid Refund Percentage",
                description: "Please enter a value between 0 and 100",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const txOptions = await resolveDispute({
                disputeId: selectedDispute.id,
                resolution,
                refundPercentage: percentage,
            });

            await openContractCall({
                ...txOptions,
                onFinish: (data) => {
                    console.log("Dispute resolved:", data);
                    toast({
                        title: "Resolution Submitted",
                        description: "The dispute resolution has been submitted to the blockchain.",
                    });
                    setIsSubmitting(false);
                    setSelectedDispute(null);
                    setResolution("");
                    setRefundPercentage("0");
                    // Optionally reload disputes or optimistically update
                },
                onCancel: () => {
                    setIsSubmitting(false);
                },
            });
        } catch (error) {
            console.error("Error resolving dispute:", error);
            toast({
                title: "Error",
                description: "Failed to resolve dispute",
                variant: "destructive",
            });
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"><AlertTriangle className="w-3 h-3 mr-1" /> Pending</Badge>;
            case "resolved":
                return <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Resolved</Badge>;
            case "rejected":
                return <Badge variant="secondary" className="bg-red-500/10 text-red-500 hover:bg-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (isLoading || checkingOwner) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isOwner) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="bg-destructive/10 p-4 rounded-full mb-4">
                    <XCircle className="w-12 h-12 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-muted-foreground max-w-md">
                    This page is restricted to the contract owner only.
                    Please connect with the deployer wallet to access dispute resolution tools.
                </p>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container flex items-center justify-center h-16">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-primary-glow rounded-lg rotate-3 group-hover:rotate-6 transition-transform duration-300 opacity-20"></div>
                            <div className="absolute inset-0 bg-gradient-to-bl from-primary to-primary-glow rounded-lg -rotate-3 group-hover:-rotate-6 transition-transform duration-300 opacity-20"></div>
                            <div className="relative w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-primary/30 transition-all duration-300">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white">
                                    <path d="M3 9.5L12 4L21 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M19 13V19.4C19 19.7314 18.7314 20 18.4 20H5.6C5.26863 20 5 19.7314 5 19.4V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9 20V14H15V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" />
                                </svg>
                            </div>
                        </div>
                        <span className="font-heading text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                            StackNstay
                        </span>
                    </Link>
                </div>
            </div>

            <div className="container py-10">
                <h1 className="text-3xl font-bold mb-6">Dispute Resolution</h1>

                <div className="bg-card rounded-lg border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Booking ID</TableHead>
                                <TableHead>Raised By</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {disputes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No disputes found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                disputes.map((dispute) => (
                                    <TableRow key={dispute.id}>
                                        <TableCell>#{dispute.id}</TableCell>
                                        <TableCell>#{dispute.bookingId}</TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {dispute.raisedBy.slice(0, 6)}...{dispute.raisedBy.slice(-4)}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={dispute.reason}>
                                            {dispute.reason}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                                        <TableCell>{new Date(dispute.createdAt * 1000).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            {dispute.status === "pending" && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => setSelectedDispute(dispute)}
                                                >
                                                    Resolve
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Dialog open={!!selectedDispute} onOpenChange={(open) => !open && setSelectedDispute(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Resolve Dispute #{selectedDispute?.id}</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Reason</Label>
                                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                    {selectedDispute?.reason}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Evidence</Label>
                                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md max-h-[100px] overflow-y-auto">
                                    {selectedDispute?.evidence}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="resolution">Resolution Details</Label>
                                <Textarea
                                    id="resolution"
                                    placeholder="Explain the resolution..."
                                    value={resolution}
                                    onChange={(e) => setResolution(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="refund">Guest Refund Percentage (0-100%)</Label>
                                <Input
                                    id="refund"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={refundPercentage}
                                    onChange={(e) => setRefundPercentage(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Remaining {100 - parseInt(refundPercentage || "0")}% will go to the host.
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedDispute(null)}>Cancel</Button>
                            <Button onClick={handleResolve} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Resolution
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
