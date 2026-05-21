<script lang="ts">
    let { href = "", onclick, class:passedClasses = '', children, isWhite=false, ...others  } = $props();

    let baseClasses = $derived(isWhite
        ? "rounded text-white border-2 border-solid border-white px-10 py-3 flex items-center justify-center h-fit hover:bg-white hover:text-dark transition"
        : "rounded border-2 border-solid border-dark px-10 py-3 flex items-center justify-center h-fit hover:bg-dark hover:text-white transition")

</script>

<style>
    a, button{
    cursor: pointer;
    font-size: 12px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    letter-spacing: 1px;
    text-transform: uppercase;
}
</style>


<div class="bump">
    {#if href}
        <a 
            {href} 
            {onclick} 
            class="{baseClasses} {passedClasses}">
               <div class='md:translate-y-[2.25px]'> {@render children?.()}</div>
        </a>
    {:else}
    <button {onclick}
            class="{baseClasses} {passedClasses}">
               <div class='md:translate-y-[2.25px]'> {@render children?.()}</div>
    </button>
    {/if}
</div>