<script lang="ts">
  import type { PageProps } from "./$types";
  import { SliceZone } from "@prismicio/svelte";
  import { components } from "$lib/slices";

  let { data }: PageProps = $props();
</script>

<SliceZone slices={data.page.data.slices} {components} />
