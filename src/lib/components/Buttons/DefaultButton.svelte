<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    href?: string;
    onclick?: (e: MouseEvent) => void;
    /** Legacy alias for `onclick` (pre-Svelte-5 call sites). */
    click?: (e: MouseEvent) => void;
    /** Fallback label rendered when no children snippet is supplied. */
    text?: string;
    class?: string;
    children?: Snippet;
    isWhite?: boolean;
  }

  let {
    href = "",
    onclick,
    click,
    text = "",
    class: passedClasses = "",
    children,
    isWhite = false,
  }: Props = $props();

  let baseClasses = $derived(
    isWhite
      ? "rounded text-white border-2 border-solid border-white px-10 py-3 flex items-center justify-center h-fit hover:bg-white hover:text-dark transition"
      : "rounded border-2 border-solid border-dark px-10 py-3 flex items-center justify-center h-fit hover:bg-dark hover:text-white transition",
  );
</script>

<div class="bump">
  {#if href}
    <a {href} onclick={onclick ?? click} class="{baseClasses} {passedClasses}">
      <div class="md:translate-y-[2.25px]">
        {#if children}{@render children()}{:else}{text}{/if}
      </div>
    </a>
  {:else}
    <button onclick={onclick ?? click} class="{baseClasses} {passedClasses}">
      <div class="md:translate-y-[2.25px]">
        {#if children}{@render children()}{:else}{text}{/if}
      </div>
    </button>
  {/if}
</div>

<style>
  a,
  button {
    cursor: pointer;
    font-size: 12px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
</style>
