<script lang="ts">
  import { asImageWidthSrcSet, isFilled, type ImageField } from "@prismicio/client";
  import { cappedWidths } from "@reddoorla/maintenance/images";

  // The wordmark from 769px up, the mark below, chosen by a <picture> media
  // query. It used to be a JS ternary on a viewport width that starts at 1024
  // on the server, so the prerendered page carried the 241px wordmark on every
  // phone until hydration swapped it: the nav row was 457px wide on a 320px
  // screen meanwhile (reddoorla/caltex-landing#102). The browser now picks
  // before any JS runs, and fetches only the one file.
  //
  // A plain <img> rather than <PrismicImage>, which accepts only an empty alt
  // and renders nothing for an empty field: the alt is the wordmark's (the
  // site's name), and an empty mark falls back to the wordmark everywhere.
  interface Props {
    logo: ImageField;
    mark: ImageField;
    loading?: "eager" | "lazy";
    fetchpriority?: "high" | "auto";
  }

  let { logo, mark, loading = "lazy", fetchpriority = "auto" }: Props = $props();

  const srcset = (field: ImageField) =>
    isFilled.image(field)
      ? asImageWidthSrcSet(field, { widths: cappedWidths(field, [160, 320, 480]) })
      : null;

  let wide = $derived(srcset(logo));
  let narrow = $derived(srcset(mark) ?? wide);
  let both = $derived(isFilled.image(logo) && isFilled.image(mark));
  let base = $derived(isFilled.image(mark) ? mark : logo);
  let alt = $derived(logo.alt || mark.alt || "");
</script>

{#if narrow && isFilled.image(base)}
  <picture>
    {#if both && wide && isFilled.image(logo)}
      <source
        media="(min-width: 769px)"
        srcset={wide.srcset}
        sizes="220px"
        width={logo.dimensions.width}
        height={logo.dimensions.height}
      />
    {/if}
    <img
      src={narrow.src}
      srcset={narrow.srcset}
      sizes={both ? "80px" : "220px"}
      {alt}
      width={base.dimensions.width}
      height={base.dimensions.height}
      {loading}
      {fetchpriority}
      decoding="async"
      class="w-auto h-10"
    />
  </picture>
{/if}
