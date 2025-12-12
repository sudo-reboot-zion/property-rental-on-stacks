import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useDispute } from "@/hooks/use-dispute";

interface DisputeModalProps {
    bookingId: number;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export function DisputeModal({ bookingId, trigger, onSuccess }: DisputeModalProps) {
    const { raiseDispute, isSubmitting } = useDispute(bookingId);
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [evidence, setEvidence] = useState("");

    const handleSubmit = async () => {
        if (!reason.trim() || !evidence.trim()) return;

        await raiseDispute(reason, evidence);
        setIsOpen(false);
        setReason("");
        setEvidence("");
        onSuccess?.();
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="destructive" size="sm" className="gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Raise Dispute
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        Raise a Dispute
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Reason for Dispute</Label>
                        <Input
                            id="reason"
                            placeholder="e.g., Property not as described"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="evidence">Evidence / Details</Label>
                        <Textarea
                            id="evidence"
                            placeholder="Please provide detailed explanation and links to evidence..."
                            value={evidence}
                            onChange={(e) => setEvidence(e.target.value)}
                            rows={6}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !reason.trim() || !evidence.trim()}
                        className="w-full"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Dispute"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
