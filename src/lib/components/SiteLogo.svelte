<script lang="ts">
  import { asImageWidthSrcSet, isFilled, type ImageField } from "@prismicio/client";
  import { PrismicImage } from "@prismicio/svelte";
  import { cappedWidths } from "@reddoorla/maintenance/images";

  // The wordmark from 769px up, the mark below, chosen by a <picture> media
  // query. It used to be a JS ternary on a viewport width that starts at 1024
  // on the server, so the prerendered page carried the 241px wordmark on every
  // phone until hydration swapped it: the nav row was 457px wide on a 320px
  // screen meanwhile (reddoorla/caltex-landing#102). The browser now picks
  // before any JS runs, and fetches only the one file.
  interface Props {
    logo: ImageField;
    mark: ImageField;
    loading?: "eager" | "lazy";
    fetchpriority?: "high" | "auto";
  }

  let { logo, mark, loading = "lazy", fetchpriority = "auto" }: Props = $props();

  const widths = (field: ImageField) => cappedWidths(field, [160, 320, 480]);
</script>

<picture>
  {#if isFilled.image(logo)}
    <source
      media="(min-width: 769px)"
      srcset={asImageWidthSrcSet(logo, { widths: widths(logo) }).srcset}
      sizes="220px"
      width={logo.dimensions.width}
      height={logo.dimensions.height}
    />
  {/if}
  <PrismicImage
    field={mark}
    widths={widths(mark)}
    sizes="80px"
    {loading}
    {fetchpriority}
    class="w-auto h-10"
  />
</picture>
