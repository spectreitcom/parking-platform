import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useRouter } from '@tanstack/react-router';
import { CheckCircleIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '#/components/ui/button';
import { ConfirmDialog } from '#/components/confirm-dialog';
import { completeReservation } from '#/features/reservations/api';

interface CompleteReservationButtonProps {
  reservationId: string;
  version: number;
}

export function CompleteReservationButton({
  reservationId,
  version,
}: CompleteReservationButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const completeReservationFn = useServerFn(completeReservation);
  const router = useRouter();

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await completeReservationFn({
        data: {
          reservationId,
          version,
        },
      });
      toast.success('Reservation completed successfully');
      setIsConfirmOpen(false);
      await router.invalidate();
    } catch (error) {
      toast.error('Failed to complete reservation');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-green-600 hover:bg-green-50 hover:text-green-700"
        onClick={() => setIsConfirmOpen(true)}
      >
        <CheckCircleIcon className="mr-2 size-4" />
        Complete
      </Button>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Complete Reservation"
        description="Are you sure you want to complete this reservation? This action cannot be undone."
        onConfirm={handleComplete}
        isLoading={isLoading}
        confirmText="Complete"
      />
    </>
  );
}
