<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children?: Snippet } = $props();
</script>

<p class="font-medium text-lg! lg:text-2xl!">{@render children?.()}</p>
