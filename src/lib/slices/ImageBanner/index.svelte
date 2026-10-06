<script lang="ts">
  import type { Content } from "@prismicio/client";
  import { PrismicImage } from "@prismicio/svelte";
  import ScreenWidthImage from "$lib/components/ScreenWidth/ScreenWidthImage.svelte";
  import { cappedWidths } from "@reddoorla/maintenance/images";

  let { slice }: { slice: Content.ImageBannerSlice } = $props();
</script>

<section
  id="s5"
  class="mt-24"
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
>
  <ScreenWidthImage
    field={slice.primary.background_image}
    class="h-full flex flex-col items-start justify-start py-24"
    darken
    shorten
    priority
  >
    <PrismicImage
      class="w-full md:w-3/5"
      field={slice.primary.title_image}
      widths={cappedWidths(slice.primary.title_image)}
      sizes="(min-width: 768px) 53vw, 88vw"
      loading="eager"
      fetchpriority="high"
    />
  </ScreenWidthImage>
</section>
