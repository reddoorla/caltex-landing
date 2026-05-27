<script lang="ts">
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import { PrismicImage, PrismicRichText } from "@prismicio/svelte";
  let { data } = $props();
  let content = $derived(data.page.data);
</script>

<ContentWidth class="gap-20 flex flex-col items-start pt-48">
  <h1>Contact Us</h1>
</ContentWidth>

<section id="s7" class="w-screen mt-12 relative lg:mb-64 lg:pb-24">
  <PrismicImage
    class="absolute h-[100vw] w-screen top-0 right-[4vw] lg:top-[5vw] lg:left-0 lg:h-[40vw] lg:w-[40vw] rounded-r-lg"
    field={content.s7_image}
    loading="eager"
    fetchpriority="high"
  />
  <ContentWidth class="h-full pt-[108vw] lg:py-[5vw] flex justify-end items-end text-dark relative">
    <div class="lg:w-1/2 h-full flex flex-col justify-between items-start lg:gap-10">
      <h3>{content.s7_title}</h3>
      <div class="flex flex-col gap-y-5 mt-12 lg:mt-0">
        <div class="rich-text">
          <PrismicRichText field={content.s7_body} />
        </div>
      </div>
      <div class="flex flex-wrap gap-y-5 mt-24 lg:mt-0">
        <div class="w-full h-12 flex items-center pr-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7 mr-4"
            viewBox="0 0 22 22"
            fill="none"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M14.6667 0H7.33333V7.33333L0 7.33333V14.6667H7.33333V22H14.6667V14.6667H22V7.33333L14.6667 7.33333V0Z"
              fill="#EA7724"
            />
          </svg>
          <p class="font-medium translate-y-0.5">ryan@ryankohnen.com</p>
        </div>
        <div class="w-full h-12 flex items-center pr-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7 mr-4"
            viewBox="0 0 22 22"
            fill="none"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M14.6667 0H7.33333V7.33333L0 7.33333V14.6667H7.33333V22H14.6667V14.6667H22V7.33333L14.6667 7.33333V0Z"
              fill="#EA7724"
            />
          </svg>
          <p class="font-medium translate-y-0.5">210.273.7767</p>
        </div>
      </div>
    </div>
  </ContentWidth>
</section>
