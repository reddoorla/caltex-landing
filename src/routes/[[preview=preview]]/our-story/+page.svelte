<script lang="ts">
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import { PrismicImage } from "@prismicio/svelte";
  import DefaultButton from "$lib/components/Buttons/DefaultButton.svelte";
  import { requestModal } from "$lib/stores/requestModal.svelte";
  import { cappedWidths } from "@reddoorla/maintenance/images";

  let { data, ..._rest } = $props();
  let content = $derived(data.page.data);
  let story = $derived([content.s3_title, content.s3_closing_text].filter(Boolean));
</script>

<ContentWidth class="gap-20 flex flex-col items-start pt-48">
  <h1>Our Story</h1>
</ContentWidth>

<section id="s3" class="w-screen mt-12 relative -mb-24">
  <PrismicImage
    class="absolute h-[100vw] w-screen top-0 right-[4vw] lg:top-[5vw] lg:left-0 lg:h-[40vw] lg:w-[40vw] rounded-r-lg object-cover object-right"
    field={content.s3_image}
    widths={cappedWidths(content.s3_image)}
    sizes="(min-width: 1024px) 40vw, 100vw"
    loading="eager"
    fetchpriority="high"
  />
  <ContentWidth class="h-full pt-[108vw] lg:py-[5vw] flex justify-end items-end text-dark relative">
    <div class="lg:w-1/2 h-full flex flex-col justify-between items-start lg:gap-10">
      <div class="flex flex-col gap-6">
        {#each story as paragraph, i (i)}
          <p class="font-medium text-lg! lg:text-2xl!">{paragraph}</p>
        {/each}
      </div>
      <div class="mt-12 lg:mt-0">
        <DefaultButton class="mt-6" onclick={() => requestModal.open()}>Request Info</DefaultButton>
      </div>
    </div>
  </ContentWidth>
</section>
