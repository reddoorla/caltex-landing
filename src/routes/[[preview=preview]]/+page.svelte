<script lang="ts">
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import { PrismicImage } from "@prismicio/svelte";

  let { data, ..._rest } = $props();
  let content = $derived(data.page.data);
</script>

<div class="lg:h-12 xl:h-0"></div>
<section id="s1" class="h-screen w-screen overflow-hidden">
  <ContentWidth class="flex flex-col h-full items-start justify-end relative">
    <PrismicImage
      class="w-3/5 pb-4 -translate-x-[20%] hidden xs:block md:hidden"
      field={content.aed}
      loading="eager"
      fetchpriority="high"
    />
    <PrismicImage
      class="md:w-2/3 mb-48 md:mb-64"
      field={content.s1_title}
      loading="eager"
      fetchpriority="high"
    />
    <div
      class="w-screen p-8 bg-primary text-dark absolute left-0 bottom-8 rounded-lg items-center flex"
    >
      <h3 class="md:w-1/2">{content.s1_subtitle}</h3>
    </div>
    <PrismicImage
      class="absolute bottom-8 right-0 w-1/2 translate-x-[20%] hidden md:block"
      field={content.aed}
      loading="eager"
      fetchpriority="high"
    />
  </ContentWidth>
</section>

<!--
Disabled marketing sections — re-enable by replacing the
`isRequestModalOpen = true` triggers with `requestModal.open()`
from `$lib/stores/requestModal.svelte`.

<section
  id="s4"
  class="w-screen bg-primary text-white mt-16 py-16 md:mt-24 md:py-24 relative overflow-hidden"
>
  <ContentWidth class="flex flex-col gap-10 lg:gap-20">
    <h2 class="lg:w-2/3">{content.s4_title}</h2>
    <div>
      <h3 class="lg:w-1/2">{content.s4_body}</h3>
      <DefaultButton class="mt-6" isWhite onclick={() => (isRequestModalOpen = true)}
        >Request Info</DefaultButton
      >
    </div>
    <div class="w-full flex justify-center flex-wrap text-white">
      {#each content.s4_image_blocks as block, i}
        <div class="w-full md:w-1/2 pb-10 {i % 2 == 0 ? 'md:pr-5' : 'md:pl-5'}">
          <div
            class="w-full aspect-[4/3] lg:aspect-video flex flex-col items-start justify-end gap-6 relative rounded-xl overflow-hidden p-6 md:p-12"
          >
            <PrismicImage
              class="w-full h-full  absolute top-0 left-0 blur-sm brightness-75"
              field={block.image}
            />
            <h4 class="z-10 lg:w-1/2">{block.title}</h4>
            <p class="z-10">{block.body}</p>
          </div>
        </div>
      {/each}
    </div>
    <div
      class="w-screen h-52 p-12 bg-black text-white rounded-lg items-start flex gap-8 lg:mb-24"
    >
      <svg
        class="w-6 sm:w-11"
        viewBox="0 0 44 39"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.125 1.74999H18.375V0.0862234L16.777 0.549411L17.125 1.74999ZM17.125 9L17.5379 10.1798L18.375 9.88685V9H17.125ZM9.5 20.125H8.25V21.375H9.5V20.125ZM17.125 20.125H18.375V18.875H17.125V20.125ZM17.125 37V38.25H18.375V37H17.125ZM1.5 37H0.25V38.25H1.5V37ZM42 1.74999H43.25V0.0862232L41.652 0.549412L42 1.74999ZM42 9L42.4129 10.1798L43.25 9.88685V9H42ZM34.375 20.125H33.125V21.375H34.375V20.125ZM42 20.125H43.25V18.875H42V20.125ZM42 37V38.25H43.25V37H42ZM26.375 37H25.125V38.25H26.375V37ZM15.875 1.74999V9H18.375V1.74999H15.875ZM16.7121 7.82017C13.9878 8.77367 11.8509 10.365 10.4027 12.5019C8.9579 14.6339 8.25 17.2326 8.25 20.125H10.75C10.75 17.6424 11.3546 15.5536 12.4723 13.9044C13.5866 12.26 15.2622 10.9763 17.5379 10.1798L16.7121 7.82017ZM9.5 21.375H17.125V18.875H9.5V21.375ZM15.875 20.125V37H18.375V20.125H15.875ZM17.125 35.75H1.5V38.25H17.125V35.75ZM2.75 37V20.125H0.25V37H2.75ZM2.75 20.125C2.75 11.3688 9.17761 5.35504 17.473 2.95058L16.777 0.549411C7.82239 3.14496 0.25 9.8812 0.25 20.125H2.75ZM40.75 1.74999V9H43.25V1.74999H40.75ZM41.5871 7.82017C38.8628 8.77367 36.7259 10.365 35.2777 12.5019C33.8329 14.6339 33.125 17.2326 33.125 20.125H35.625C35.625 17.6424 36.2296 15.5536 37.3473 13.9044C38.4616 12.26 40.1372 10.9763 42.4129 10.1798L41.5871 7.82017ZM34.375 21.375H42V18.875H34.375V21.375ZM40.75 20.125V37H43.25V20.125H40.75ZM42 35.75H26.375V38.25H42V35.75ZM27.625 37V20.125H25.125V37H27.625ZM27.625 20.125C27.625 11.3688 34.0526 5.35504 42.348 2.95058L41.652 0.549412C32.6974 3.14496 25.125 9.8812 25.125 20.125H27.625Z"
          fill="#EA7724"
        />
      </svg>
      <div
        class="w-4/5 xl:w-3/5 xxl:w-1/2 h-full items-start justify-center flex flex-col gap-3"
      >
        <h3>{content.s4_quote}</h3>
        <p>{content.s4_attribution}</p>
      </div>
    </div>
  </ContentWidth>
</section>


<section id="s6" class="w-screen mt-20 lg:mt-52 text-dark">
  <ContentWidth>
    <div class="w-full flex flex-row flex-wrap gap-y-10">
      <div class="w-full md:w-1/2 flex flex-col gap-10 md:pr-5">
        <h2>{content.s6_title}</h2>
        <div>
          <h3>{content.s6_body}</h3>
          <DefaultButton class="mt-6" onclick={() => (isRequestModalOpen = true)}
            >Request Info</DefaultButton
          >
        </div>
      </div>
      <div class="w-full md:w-1/2 flex flex-col gap-10 md:pl-5">
        {#each content.s6_steps as step}
          <div
            class="p-4 md:p-8 pl-4 md:pl-0 h-48 flex justify-start gap-4 bg-black text-white rounded-lg"
          >
            <div
              class="w-1/3 xl:w-1/4 h-full flex justify-center items-center md:items-start"
            >
              <PrismicImage
                field={step.number}
                class="h-3/5 md:h-4/5 xl:h-full"
              />
            </div>
            <div
              class="w-2/3 xl:w-3/4 h-full flex flex-col items-start justify-center md:justify-start md:-translate-x-[5%]"
            >
              <h3>{step.title}</h3>
              <p class="mt-4">{step.body}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
    <div></div>
  </ContentWidth>
</section>



 -->
