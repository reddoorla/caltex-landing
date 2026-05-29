<script lang="ts">
  import { PrismicPreview } from "@prismicio/svelte/kit";
  import { page } from "$app/stores";
  import { repositoryName } from "$lib/prismicio";
  import "../app.css";
  import "../fonts.css";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import ScreenWidthImage from "$lib/components/ScreenWidth/ScreenWidthImage.svelte";
  import RequestInfoModal from "$lib/components/RequestInfoModal.svelte";
  import { PrismicImage } from "@prismicio/svelte";
  import DefaultButton from "$lib/components/Buttons/DefaultButton.svelte";
  import { fade } from "svelte/transition";
  import { Menu } from "@lucide/svelte";
  import { requestModal } from "$lib/stores/requestModal.svelte";
  import { CONTACT } from "$lib/constants/contact";

  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children, data, ..._rest } = $props();

  let viewportWidth = $state(1024);
  let showNav = $state(false);

  let content = $derived(data.page.data);
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0 user-scalable=no" />
</svelte:head>

<svelte:window bind:innerWidth={viewportWidth} />
<main>
  <nav class="w-screen absolute top-0 left-0 z-20">
    <ContentWidth class="flex flex-row justify-between items-center h-36">
      <a href="/" onclick={() => (showNav = false)}>
        <PrismicImage
          field={viewportWidth > 768 ? content.logo : content.logo_mark}
          loading="eager"
          fetchpriority="high"
          class="w-auto h-10"
        />
      </a>
      <div class="flex flex-row justify-between gap-6 items-center">
        <DefaultButton onclick={() => requestModal.open()}>Request Info</DefaultButton>
        <button onclick={() => (showNav = !showNav)} aria-label="toggle nav"
          ><Menu size={24} /></button
        >
      </div>
    </ContentWidth>
  </nav>

  <RequestInfoModal />

  <ScreenWidthImage
    field={content.background_image}
    class="flex justify-between"
    backdrop
    priority
  />
  {#if showNav}
    <div class="absolute w-screen h-lvh top-0 left-0 pt-48" transition:fade>
      <ContentWidth class="gap-8 md:gap-20 flex flex-col items-end">
        <a
          class="text-primary hover:brightness-75 transition duration-300"
          onclick={() => (showNav = false)}
          href="/leasing"><h1 class="bump">AED Leasing</h1></a
        >
        <a
          class="text-primary hover:brightness-75 transition duration-300"
          onclick={() => (showNav = false)}
          href="/purchases"><h1 class="bump">AED Purchases</h1></a
        >
        <a
          class="text-primary hover:brightness-75 transition duration-300"
          onclick={() => (showNav = false)}
          href="/community"><h1 class="bump">Grants & Community</h1></a
        >
        <a
          class="text-primary hover:brightness-75 transition duration-300"
          onclick={() => (showNav = false)}
          href="/contact"><h1 class="bump">Contact Us</h1></a
        >
      </ContentWidth>
    </div>
  {:else}
    <div in:fade={{ delay: 500 }} out:fade>
      {@render children?.()}
    </div>

    <footer class="md:h-36 w-screen py-12 bg-white mt-48" in:fade={{ delay: 500 }} out:fade>
      <ContentWidth class="flex flex-col md:flex-row justify-between items-center gap-8">
        <a href="/" onclick={() => (showNav = false)}>
          <PrismicImage
            field={viewportWidth > 768 ? content.logo : content.logo_mark}
            loading="lazy"
            class="w-auto h-10"
          />
        </a>
        <div class="flex flex-col md:flex-row gap-8">
          <a href="mailto:{CONTACT.email}">{CONTACT.email}</a>
          <a href="tel:{CONTACT.phoneTel}">{CONTACT.phoneDisplay}</a>
        </div>
        <div class="flex flex-col md:flex-row gap-8">
          {"©" + new Date().getFullYear() + "  |   All right reserved"}
        </div>
      </ContentWidth>
    </footer>
  {/if}
</main>
{#if !$page.url.pathname.startsWith("/dev/")}
  <PrismicPreview {repositoryName} />
{/if}
