<script>
  import { SliceZone } from "@prismicio/svelte";

  import { components } from "$lib/slices";

  let { data, ..._rest } = $props();
</script>

<SliceZone slices={data.page.data.slices} {components} />
