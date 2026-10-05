<script lang="ts">
  import type { Content } from "@prismicio/client";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import { PrismicImage, PrismicRichText } from "@prismicio/svelte";
  import { cappedWidths } from "@reddoorla/maintenance/images";

  let { slice }: { slice: Content.CommunityFeatureSlice } = $props();
</script>

<section
  id="s8"
  class="w-screen bg-primary text-white mt-24 py-16 md:py-24 -mb-48 relative"
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
>
  <ContentWidth class="flex flex-col md:flex-row">
    <div class="w-full md:w-1/2 flex flex-col items-start md:pr-5">
      <PrismicImage
        class="w-full"
        field={slice.primary.title_image}
        widths={cappedWidths(slice.primary.title_image)}
        sizes="(min-width: 768px) 44vw, 88vw"
        loading="eager"
        fetchpriority="high"
      />
      <PrismicImage
        class="w-2/3 -translate-x-[20%]"
        field={slice.primary.side_image}
        widths={cappedWidths(slice.primary.side_image)}
        sizes="(min-width: 768px) 29vw, 59vw"
        loading="eager"
        fetchpriority="high"
      />
    </div>
    <div class="w-full md:w-1/2 flex flex-col md:pl-5">
      <div class="rich-text mt-4 text-dark">
        <PrismicRichText field={slice.primary.subheader} />
      </div>
      <div class="rich-text mt-8">
        <PrismicRichText field={slice.primary.body} />
      </div>
    </div>
  </ContentWidth>
</section>
