<script>

    export let srcset = [];
    export let src = srcset[0].url;
    export let alt = '';

    function set(srcset){
        let r = '';
        for (const size of srcset) {
            r += `${size.src} ${size.width}w, `;
        }
        return r;
    }

</script>

<img {alt} data-sizes="auto" class="lazyload"
    data-src={src}
    data-srcset={set(srcset)} />
