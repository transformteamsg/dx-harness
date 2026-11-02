<script>
  let { src, caption } = $props();
</script>

<div class="card">
  <img {src} alt={caption} />
  <input type="image" src={src} alt="Search" />
</div>
