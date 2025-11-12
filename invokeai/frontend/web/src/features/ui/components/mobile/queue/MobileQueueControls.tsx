import { Button, ButtonGroup, Flex, useDisclosure } from '@invoke-ai/ui-library';
import { useCancelCurrentQueueItem } from 'features/queue/hooks/useCancelCurrentQueueItem';
import { useClearQueue } from 'features/queue/hooks/useClearQueue';
import { usePauseProcessor } from 'features/queue/hooks/usePauseProcessor';
import { useResumeProcessor } from 'features/queue/hooks/useResumeProcessor';
import { MobileConfirmDialog } from 'features/ui/components/mobile/MobileConfirmDialog';
import { memo, useCallback } from 'react';
import { PiPauseFill, PiPlayFill, PiTrashSimpleFill, PiXBold } from 'react-icons/pi';
import { useGetQueueStatusQuery } from 'services/api/endpoints/queue';

/**
 * Mobile queue control buttons
 * Pause/resume, clear queue, cancel current
 */
export const MobileQueueControls = memo(() => {
  const { data: queueStatus } = useGetQueueStatusQuery();
  const { trigger: pauseProcessor, isLoading: isPausing } = usePauseProcessor();
  const { trigger: resumeProcessor, isLoading: isResuming } = useResumeProcessor();
  const { trigger: clearQueue, isLoading: isClearing } = useClearQueue();
  const { trigger: cancelCurrent, isLoading: isCanceling } = useCancelCurrentQueueItem();

  const clearDialog = useDisclosure();

  const handlePauseProcessor = useCallback(() => {
    pauseProcessor();
  }, [pauseProcessor]);

  const handleResumeProcessor = useCallback(() => {
    resumeProcessor();
  }, [resumeProcessor]);

  const handleCancelCurrent = useCallback(() => {
    cancelCurrent();
  }, [cancelCurrent]);

  const handleClearQueue = useCallback(() => {
    clearQueue();
    clearDialog.onClose();
  }, [clearQueue, clearDialog]);

  const isProcessorPaused = queueStatus?.processor.is_started === false;
  const hasCurrentItem = (queueStatus?.queue.in_progress ?? 0) > 0;

  return (
    <>
      <Flex gap={2} p={4}>
        <ButtonGroup isAttached width="full" size="lg">
          {/* Pause/Resume */}
          {isProcessorPaused ? (
            <Button
              leftIcon={<PiPlayFill />}
              onClick={handleResumeProcessor}
              isLoading={isResuming}
              colorScheme="green"
              flex={1}
              aria-label="Resume queue processor"
            >
              Resume
            </Button>
          ) : (
            <Button
              leftIcon={<PiPauseFill />}
              onClick={handlePauseProcessor}
              isLoading={isPausing}
              colorScheme="orange"
              flex={1}
              aria-label="Pause queue processor"
            >
              Pause
            </Button>
          )}

          {/* Cancel Current */}
          <Button
            leftIcon={<PiXBold />}
            onClick={handleCancelCurrent}
            isLoading={isCanceling}
            isDisabled={!hasCurrentItem}
            colorScheme="red"
            flex={1}
            aria-label="Cancel current item"
          >
            Cancel
          </Button>

          {/* Clear Queue */}
          <Button
            leftIcon={<PiTrashSimpleFill />}
            onClick={clearDialog.onOpen}
            isLoading={isClearing}
            colorScheme="red"
            variant="outline"
            flex={1}
            aria-label="Clear queue"
          >
            Clear
          </Button>
        </ButtonGroup>
      </Flex>

      {/* Clear confirmation dialog */}
      <MobileConfirmDialog
        isOpen={clearDialog.isOpen}
        onClose={clearDialog.onClose}
        onConfirm={handleClearQueue}
        title="Clear Queue"
        message="Are you sure you want to clear the entire queue? This cannot be undone."
        confirmLabel="Clear Queue"
        confirmColorScheme="red"
      />
    </>
  );
});

MobileQueueControls.displayName = 'MobileQueueControls';
