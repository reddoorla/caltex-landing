<script lang="ts">
  import type { Content } from "@prismicio/client";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import { PrismicImage } from "@prismicio/svelte";
  import { cappedWidths } from "@reddoorla/maintenance/images";

  let { slice }: { slice: Content.HomeHeroSlice } = $props();
</script>

<div class="lg:h-12 xl:h-0"></div>
<section
  id="s1"
  class="h-screen w-screen overflow-hidden"
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
>
  <ContentWidth class="flex flex-col h-full items-start justify-end relative">
    <PrismicImage
      class="w-3/5 pb-4 -translate-x-[20%] hidden xs:block md:hidden"
      field={slice.primary.aed_image}
      widths={cappedWidths(slice.primary.aed_image)}
      sizes="53vw"
      loading="eager"
      fetchpriority="high"
    />
    <PrismicImage
      class="md:w-2/3 mb-48 md:mb-64"
      field={slice.primary.title_image}
      widths={cappedWidths(slice.primary.title_image)}
      sizes="(min-width: 768px) 59vw, 88vw"
      loading="eager"
      fetchpriority="high"
    />
    <div
      class="w-screen p-8 bg-primary text-dark absolute left-0 bottom-8 rounded-lg items-center flex"
    >
      <h3 class="md:w-1/2">{slice.primary.subtitle}</h3>
    </div>
    <PrismicImage
      class="absolute bottom-8 right-0 w-1/2 translate-x-[20%] hidden md:block"
      field={slice.primary.aed_image}
      widths={cappedWidths(slice.primary.aed_image)}
      sizes="44vw"
      loading="eager"
      fetchpriority="high"
    />
  </ContentWidth>
</section>
