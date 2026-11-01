<script lang="ts">
  import type { PageProps } from "./$types";
  import { asText } from "@prismicio/client";
  import { SliceZone } from "@prismicio/svelte";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import { components } from "$lib/slices";

  let { data }: PageProps = $props();
</script>

<ContentWidth class="gap-20 flex flex-col items-start pt-48">
  <div class="page-title w-full">
    <h1>{asText(data.page.data.title)}</h1>
  </div>
</ContentWidth>

<SliceZone slices={data.page.data.slices} {components} />

<style>
  /* The title sizes against its column below the size the design sets, so a
     long word ("COMMUNITY" is about 6.6em in Impact) fits a phone: the 64px
     title reached 442px on a 320px screen. 14cqi keeps the design's 64px and
     115px wherever the column is wide enough, which is every tablet and
     desktop; a word too long even for that breaks instead of running off. */
  .page-title {
    container-type: inline-size;
  }

  .page-title h1 {
    font-size: min(115px, 14cqi);
    overflow-wrap: break-word;
  }

  @media only screen and (max-width: 1024px) {
    .page-title h1 {
      font-size: min(64px, 14cqi);
    }
  }
</style>
