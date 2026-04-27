import { useEffect, useState } from 'react';
import { Phone, PhoneOff, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

interface IncomingCallDialogProps {
  isOpen: boolean;
  callerName: string;
  onAccept: () => void;
  onReject: () => void;
  autoCloseSeconds?: number;
}

export function IncomingCallDialog({
  isOpen,
  callerName,
  onAccept,
  onReject,
  autoCloseSeconds = 60,
}: IncomingCallDialogProps) {
  const [secondsLeft, setSecondsLeft] = useState(autoCloseSeconds);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(autoCloseSeconds);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          onReject();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, autoCloseSeconds, onReject]);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="text-center">
          <DialogTitle className="text-center">Incoming Call</DialogTitle>
          <DialogDescription className="text-center">
            Someone is calling you...
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-6">
          {/* Animated ringing effect */}
          <AnimatePresence>
            <motion.div
              className="relative"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              
              {/* Ringing circles */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-primary/30"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-primary/20"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: 0.3,
                }}
              />
            </motion.div>
          </AnimatePresence>

          <div className="text-center">
            <h3 className="text-xl font-semibold">{callerName}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Call ends in {secondsLeft}s
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full h-14 w-14 p-0"
              onClick={onReject}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
            <Button
              variant="default"
              size="lg"
              className="rounded-full h-14 w-14 p-0 bg-green-600 hover:bg-green-700"
              onClick={onAccept}
            >
              <Phone className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default IncomingCallDialog;
