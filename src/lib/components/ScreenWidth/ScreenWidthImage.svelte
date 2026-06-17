<script lang="ts">
  import type { ImageField } from "@prismicio/client";
  import type { Snippet } from "svelte";
  import placeholder from "../../assets/images/background_placeholder.svg";
  import ContentWidth from "../ContentWidth/ContentWidth.svelte";
  import { PrismicImage } from "@prismicio/svelte";

  interface Props {
    src?: string;
    field: ImageField | null;
    altText?: string;
    placeholderSide?: string;
    vimeoId?: string;
    darken?: boolean;
    backdrop?: boolean;
    shorten?: boolean;
    priority?: boolean;
    class?: string;
    children?: Snippet;
  }

  let {
    src = placeholder,
    field,
    altText = "",
    placeholderSide = "right",
    vimeoId = "",
    darken = false,
    backdrop = false,
    shorten = false,
    priority = false,
    class: className = "",
    children,
  }: Props = $props();

  let viewportHeight = $state(0);
  let viewportWidth = $state(0);
</script>

<svelte:window bind:innerHeight={viewportHeight} bind:innerWidth={viewportWidth} />

<section
  class="{shorten ? 'h-[80vh]' : 'h-screen'} w-screen overflow-clip
	  {backdrop ? 'fixed -z-10 top-0 left-0' : 'relative'}"
>
  <div
    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 aspect-video
		{viewportHeight * 16 > viewportWidth * 9 ? 'h-screen min-w-full' : 'w-screen min-h-full'}"
  >
    {#if !field}
      <img
        {src}
        alt={altText}
        loading={priority ? "eager" : "lazy"}
        fetchpriority={priority ? "high" : "auto"}
        decoding="async"
        class="absolute bottom-0 {placeholderSide}-0 h-full w-full object-cover -z-10 {src ===
        placeholder
          ? 'lg:w-[45%] md:h-auto'
          : ''}"
      />
    {:else}
      <PrismicImage
        {field}
        loading={priority ? "eager" : "lazy"}
        fetchpriority={priority ? "high" : "auto"}
        decoding="async"
        class="absolute  h-full w-full object-cover -z-10"
      />
    {/if}

    {#if vimeoId}
      <iframe
        title="background video"
        src={`https://player.vimeo.com/video/${vimeoId}?background=1&muted=1&loop=1&autoplay=1&dnt=1`}
        class="aspect-video absolute {viewportHeight * 16 > viewportWidth * 9
          ? 'h-screen min-w-full'
          : 'w-screen min-h-full'} contrast-[1.15] -z-10"
        frameborder="0"
        allowfullscreen
      ></iframe>
    {/if}

    {#if darken}
      <div
        class="bg-darken-gradient pointer-events-none absolute w-full h-full top-0 left-0 -z-10"
      ></div>
    {/if}
  </div>
  <div class="w-screen h-screen absolute top-0 left-0">
    <ContentWidth class="{className || 'flex items-center justify-center'} h-full">
      {@render children?.()}
    </ContentWidth>
  </div>
</section>

<style>
  .bg-darken-gradient {
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.45) 100%);
  }
</style>
