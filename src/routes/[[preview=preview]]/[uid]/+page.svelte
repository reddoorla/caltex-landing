<script lang="ts">
  import type { PageProps } from "./$types";
  import { asText } from "@prismicio/client";
  import { SliceZone } from "@prismicio/svelte";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import { components } from "$lib/slices";

  let { data }: PageProps = $props();
</script>

<ContentWidth class="gap-20 flex flex-col items-start pt-48">
  <h1>{asText(data.page.data.title)}</h1>
</ContentWidth>

<SliceZone slices={data.page.data.slices} {components} />
