/**
 * Global "Request Info" modal visibility. Every page used to declare
 * its own `let isRequestModalOpen = $state(false)` plus an identical
 * `$effect` to lock body scroll — this hoists both into one place so
 * the markup lives once (in <RequestInfoModal>, rendered by the root
 * layout) and any page's "Request Info" button just calls open().
 */
function createRequestModal() {
  let isOpen = $state(false);
  return {
    get isOpen() {
      return isOpen;
    },
    open() {
      isOpen = true;
    },
    close() {
      isOpen = false;
    },
  };
}

export const requestModal = createRequestModal();
