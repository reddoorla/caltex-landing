<script lang="ts">
  import { fade } from "svelte/transition";
  import { X } from "@lucide/svelte";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import { requestModal } from "$lib/stores/requestModal.svelte";
  import { CONTACT } from "$lib/constants/contact";

  // Lock body scroll while the modal is open.
  $effect(() => {
    const body = document.body;
    if (!body) return;
    body.style.overflow = requestModal.isOpen ? "hidden" : "auto";
    return () => {
      body.style.overflow = "auto";
    };
  });
</script>

{#if requestModal.isOpen}
  <div
    class="w-screen h-screen fixed top-0 left-0 bg-black bg-opacity-80 backdrop-blur z-30 flex items-center justify-center"
    transition:fade
  >
    <button
      onclick={() => requestModal.close()}
      class="w-screen h-screen absolute top-0 left-0"
      aria-label="close"
    >
    </button>

    <ContentWidth
      class="blur-none bg-primary h-4/5 md:h-3/5 relative rounded-lg flex flex-col items-center justify-center text-center gap-16 px-3 sm:px-9 md:px-16"
    >
      <button
        class="absolute top-6 right-6 pointer-events-auto"
        onclick={() => requestModal.close()}
        aria-label="close"
      >
        <X size={24} />
      </button>
      <h2 class="text-white">
        <span>Choosing our&nbsp;</span><span> AED services&nbsp;</span><span>
          ensures your readiness&nbsp;</span
        ><span> for emergencies.</span>
      </h2>
      <h3 class="text-white">
        Contact {CONTACT.name} at
        <a href="mailto:{CONTACT.email}" class="text-black">{CONTACT.email}</a> <br /> or leave a
        message
        <a href="tel:{CONTACT.phoneTel}" class="text-black">{CONTACT.phoneDisplay}</a>
      </h3>
    </ContentWidth>
  </div>
{/if}
