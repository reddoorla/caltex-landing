<script lang='ts'>
	import { PrismicPreview } from '@prismicio/svelte/kit';
	import { page } from '$app/stores';
	import { repositoryName } from '$lib/prismicio';
	import "../app.css";
	import "../fonts.css"
	import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
	import ScreenWidthImage from "$lib/components/ScreenWidth/ScreenWidthImage.svelte";
	import { PrismicImage, PrismicRichText } from "@prismicio/svelte";
	import DefaultButton from "$lib/components/Buttons/DefaultButton.svelte";
	import { fade, fly } from "svelte/transition";

	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children, data } = $props();

  let viewpoortWidth = $state(1024);
  let isRequestModalOpen = $state(false);
  let showNav = $state(false)

  $effect(() => {
    isRequestModalOpen;
    if (document.getElementsByTagName("body"))
      if (isRequestModalOpen) {
        (
          document.getElementsByTagName("body")[0] as HTMLElement
        ).style.overflow = "hidden";
      } else {
        (
          document.getElementsByTagName("body")[0] as HTMLElement
        ).style.overflow = "auto";
      }
  });

  let content = $state(data.page.data);
  $effect(() => { data; content = data.page.data });

</script>

<svelte:head>
	<title>{$page.data.title}</title>
	{#if $page.data.meta_description}
		<meta name="description" content={$page.data.meta_description} />
	{/if}
	{#if $page.data.meta_title}
		<meta name="og:title" content={$page.data.meta_title} />
	{/if}
	{#if $page.data.meta_image}
		<meta name="og:image" content={$page.data.meta_image.url} />
		<meta name="twitter:card" content="summary_large_image" />
	{/if}
	<meta name="viewport" content="width=device-width, initial-scale=1.0 user-scalable=no">
</svelte:head>

<svelte:window bind:innerWidth={viewpoortWidth} />
<main>
	<nav class="w-screen absolute top-0 left-0 z-20">
  <ContentWidth class="flex flex-row justify-between items-center h-36">
	<a href='/' onclick={()=>showNav=false}>
		<PrismicImage
			field={viewpoortWidth > 768 ? content.logo : content.logo_mark}
			loading="eager"
			fetchpriority="high"
			class="w-auto h-10"
		/>
	</a>
	<div class='flex flex-row justify-between gap-6 items-center'>
    <DefaultButton onclick={() => (isRequestModalOpen = true)}
      >Request Info</DefaultButton
    >
		<button onclick={()=>showNav=!showNav} aria-label='toggle nav'><i class="fa-sharp fa-solid fa-xl fa-bars"></i></button>
	</div>

  </ContentWidth>
</nav>

{#if isRequestModalOpen}
  <div
    class="w-screen h-screen fixed top-0 left-0 bg-black bg-opacity-80 backdrop-blur z-30 flex items-center justify-center"
    transition:fade
  >
    <button
      onclick={() => (isRequestModalOpen = false)}
      class="w-screen h-screen absolute top-0 left-0"
      aria-label="close"
    >
    </button>

    <ContentWidth
      class="blur-none bg-primary h-4/5 md:h-3/5 relative rounded-lg flex flex-col items-center justify-center text-center gap-16 px-3 sm:px-9 md:px-16"
    >
      <button
        class="absolute top-6 right-6 pointer-events-auto"
        onclick={() => (isRequestModalOpen = false)}
        aria-label="close"
      >
        <i class="fa-sharp fa-solid fa-xl fa-close"></i>
      </button>
      <h2 class="text-white">
        <span>Choosing our&nbsp;</span><span> AED services&nbsp;</span><span>
          ensures your readiness&nbsp;</span
        ><span> for emergencies.</span>
      </h2>
      <h3 class="text-white">
        Contact Ryan Kohen at <a
          href="mailto:ryan@ryankohnen.com"
          class="text-black">ryan@ryankohnen.com</a
        > <br /> or leave a message
        <a href="tel:210.273.7767" class="text-black">210.273.7767</a>
      </h3>
    </ContentWidth>
  </div>
{/if}

<ScreenWidthImage
  field={content.background_image}
  class="flex justify-between"
  backdrop
  priority
/>
{#if showNav}
<div class="absolute w-screen h-lvh top-0 left-0 pt-48" transition:fade>
	<ContentWidth class='gap-8 md:gap-20 flex flex-col items-end'>
		<a class='text-primary hover:brightness-75 transition duration-300' onclick={()=>showNav=false} href='/leasing'><h1 class='bump'>AED Leasing</h1></a>
		<a class='text-primary hover:brightness-75 transition duration-300' onclick={()=>showNav=false} href='/purchases'><h1 class='bump'>AED Purchases</h1></a>
		<a class='text-primary hover:brightness-75 transition duration-300' onclick={()=>showNav=false} href='/community'><h1 class='bump'>Grants & Community</h1></a>
		<a class='text-primary hover:brightness-75 transition duration-300' onclick={()=>showNav=false} href='/contact'><h1 class='bump'>Contact Us</h1></a>
	</ContentWidth>
</div>
{:else}
<div in:fade={{delay:500}} out:fade>
	{@render children?.()}
</div>


<footer class='md:h-36 w-screen py-12 bg-white mt-48' in:fade={{delay:500}} out:fade>
	<ContentWidth class='flex flex-col md:flex-row justify-between items-center gap-8'>
		<a href='/' onclick={()=>showNav=false}>
			<PrismicImage
				field={viewpoortWidth > 768 ? content.logo : content.logo_mark}
				loading="lazy"
				class="w-auto h-10"
			/>
		</a>
		<div  class='flex flex-col md:flex-row gap-8'>
			<a href='mailto:ryan@ryankohnen.com'>ryan@ryankohnen.com</a>
			<a href='tel:210.273.7767'>210.273.7767</a>
		</div>
		<div class='flex flex-col md:flex-row gap-8'>
			{"©"+new Date().getFullYear()+"  |   All right reserved"}
		</div>
	</ContentWidth>
</footer>
{/if}
</main>
<PrismicPreview {repositoryName} />
