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
            class="h-40 md:h-52 w-full bg-white text-primary flex flex-row justify-between items-center rounded-[7px] p-6 gap-6 min-[430px]:p-11 min-[430px]:gap-11 md:p-6 md:gap-6 lg:p-11 lg:gap-11"
          >
            <!-- The compact card (24px padding and gap, 80px icon) wherever the
                 full one leaves the label too narrow for its longest word: below
                 430px (at 320px the label was about 22px and ran off the screen)
                 and in the two-column band from 768px to 1023px (a 58px label at
                 768px, whose words ran out of the card). -->
            <PrismicImage
              class="w-20 h-20 min-[430px]:w-32 min-[430px]:h-32 md:w-20 md:h-20 lg:w-32 lg:h-32 shrink-0"
              field={card.icon}
              widths={cappedWidths(card.icon, [128, 256, 384])}
              sizes="(min-width: 1024px) 128px, (min-width: 768px) 80px, (min-width: 430px) 128px, 80px"
              loading="lazy"
            />
            <h3 class="whitespace-pre-line min-w-0">{card.label}</h3>
          </div>
        </div>
      {/each}
    </div>

    <h5 class="text-dark">{slice.primary.closing_text}</h5>
  </ContentWidth>
</section>
