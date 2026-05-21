<script lang='ts'>
import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";

  import { PrismicImage, PrismicRichText } from "@prismicio/svelte";
  import DefaultButton from "$lib/components/Buttons/DefaultButton.svelte";
  import { fade } from "svelte/transition";

let isRequestModalOpen = $state(false);

  $effect(() => {
    isRequestModalOpen;
    if (document.getElementsByTagName("body"))
      if (isRequestModalOpen) {
        (
          document.getElementsByTagName("body")[0] as HTMLElement
        ).style.overflow = "hidden";
      } else {
        (
          document.getElementsByTagName("body")[0] as HTMLElement
        ).style.overflow = "auto";
      }
  });


   let { data } = $props();
  let content = $derived(data.page.data);
</script>

{#if isRequestModalOpen}
  <div
    class="w-screen h-screen fixed top-0 left-0 bg-black bg-opacity-80 backdrop-blur z-30 flex items-center justify-center"
    transition:fade
  >
    <button
      onclick={() => (isRequestModalOpen = false)}
      class="w-screen h-screen absolute top-0 left-0"
      aria-label="close"
    >
    </button>

    <ContentWidth
      class="blur-none bg-primary h-4/5 md:h-3/5 relative rounded-lg flex flex-col items-center justify-center text-center gap-16 px-3 sm:px-9 md:px-16"
    >
      <button
        class="absolute top-6 right-6 pointer-events-auto"
        onclick={() => (isRequestModalOpen = false)}
        aria-label="close"
      >
        <i class="fa-sharp fa-solid fa-xl fa-close"></i>
      </button>
      <h2 class="text-white">
        <span>Choosing our&nbsp;</span><span> AED services&nbsp;</span><span>
          ensures your readiness&nbsp;</span
        ><span> for emergencies.</span>
      </h2>
      <h3 class="text-white">
        Contact Ryan Kohen at <a
          href="mailto:ryan@ryankohnen.com"
          class="text-black">ryan@ryankohnen.com</a
        > <br /> or leave a message
        <a href="tel:210.273.7767" class="text-black">210.273.7767</a>
      </h3>
    </ContentWidth>
  </div>
{/if}

<ContentWidth class='gap-20 flex flex-col items-start pt-48'>
    <h1>AED Purchases</h1>
</ContentWidth>

<section id="s3" class="w-screen mt-12 relative -mb-24">
  <PrismicImage
    class="absolute h-[100vw] w-screen top-0 right-[4vw] lg:top-[5vw] lg:left-0 lg:h-[40vw] lg:w-[40vw] rounded-r-lg"
    field={content.s3_image}
    loading="eager"
    fetchpriority="high"
  />
  <ContentWidth
    class="h-full pt-[108vw] lg:py-[5vw] flex justify-end items-end text-dark relative"
  >
    <div
      class="lg:w-1/2 h-full flex flex-col justify-between items-start lg:gap-10"
    >
      <h3>{content.s3_title}</h3>
      <div class="flex flex-wrap gap-y-5 mt-12 lg:mt-0">
        {#each content.s3_bullets as bullet}
          <div
            class="w-full h-12 flex items-center pr-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-7 w-7 mr-4"
              viewBox="0 0 22 22"
              fill="none"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M14.6667 0H7.33333V7.33333L0 7.33333V14.6667H7.33333V22H14.6667V14.6667H22V7.33333L14.6667 7.33333V0Z"
                fill="#EA7724"
              />
            </svg>
            <p class='font-medium translate-y-0.5'>{bullet.text}</p>
          </div>
        {/each}
      </div>
      <div class="mt-12 lg:mt-0">
        <DefaultButton class="mt-6" onclick={() => (isRequestModalOpen = true)}
          >Request Info</DefaultButton
        >
      </div>
    </div>
  </ContentWidth>
</section>