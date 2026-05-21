<script lang="ts">
      let { src = placeholder, alt = "", class: className = "" }: { src?: unknown; alt?: unknown; class?: string } = $props();
import placeholder from "$lib/assets/images/image_placeholder.svg"


    const rotationAngle = "45";
    let crossLength = "141%";
</script>

<div class="w-full my-8 {className || ''}">
    <div class="w-full aspect-square {src===placeholder ? "border-light border-2 bg-light bg-opacity-25":""}  rounded-sm  flex items-center justify-center relative">
        <img {src} alt={src===placeholder ? "" : alt} loading="lazy" decoding="async" class="z-10 {src==placeholder ? "w-16 bg-[#F2F5F7]" : "w-full"}"/>
        <div class="absolute bg-light h-[2px] {src===placeholder ? "":"hidden"}" style="transform: rotate({rotationAngle}deg); width:{crossLength}"></div>
        <div class="absolute bg-light h-[2px] {src===placeholder ? "":"hidden"}" style="transform: rotate(-{rotationAngle}deg); width:{crossLength}"></div>
    </div>
</div>