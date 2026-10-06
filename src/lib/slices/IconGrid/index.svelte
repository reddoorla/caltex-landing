<script lang="ts">
  import type { Content } from "@prismicio/client";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import { PrismicImage } from "@prismicio/svelte";
  import { cappedWidths } from "@reddoorla/maintenance/images";

  let { slice }: { slice: Content.IconGridSlice } = $props();
</script>

<section
  id="s2"
  class="w-screen mt-24 -mb-24"
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
>
  <ContentWidth class="flex flex-col items-start justify-start gap-8 lg:gap-12">
    <div class="w-full flex justify-center flex-wrap">
      {#each slice.primary.cards as card, i (i)}
        <div class="w-full md:w-1/2 pb-8 md:pb-10 {i % 2 == 0 ? 'md:pr-5' : 'md:pl-5'}">
          <div
            class="h-40 md:h-52 w-full bg-white text-primary flex flex-row justify-between items-center rounded-[7px] p-11 gap-11"
          >
            <PrismicImage
              class="w-32 h-32"
              field={card.icon}
              widths={cappedWidths(card.icon, [128, 256, 384])}
              sizes="128px"
              loading="lazy"
            />
            <h3 class="whitespace-pre-line">{card.label}</h3>
          </div>
        </div>
      {/each}
    </div>

    <h5 class="text-dark">{slice.primary.closing_text}</h5>
  </ContentWidth>
</section>
