<div>
  <input type="file" name="image" id="image" on:input={updateImage}>
  <img src={tempURL} alt="" accept="image/*">
</div>

<script>
  import { onMount } from "svelte";

  let canvas;
  onMount(() => {
    canvas = document.createElement("canvas");
  })

  let inputFile = null;
  let tempURL = "";

  async function updateImage(e) {
    inputFile = e.srcElement.files[0];
    if (!(inputFile instanceof File) || !canvas) return;

    tempURL = URL.createObjectURL(inputFile);

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const image = new Image();
    image.src = tempURL;
    await new Promise((res,rej) => {
      image.onload = () => res();
      image.onerror = () => rej(); // pretend error handling
    })

    ctx.canvas.width = image.width;
    ctx.canvas.height = image.height;

    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, image.width, image.height);

    editImage(pixels.data, image.width, image.height);
    ctx.putImageData(pixels, 0, 0);
    tempURL = ctx.canvas.toDataURL();
  }

  function editImage(editedPixels, width, height) {
    const blurWidth = 100;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let colSum = [0, 0, 0];
        let i = (y * width + x) * 4;

        for (let c = Math.max(0, y-blurWidth); c <= Math.min(height-1, y+blurWidth); c++) {
          colSum[0] += editedPixels[(c * width + x) * 4 +0];
          colSum[1] += editedPixels[(c * width + x) * 4 +1];
          colSum[2] += editedPixels[(c * width + x) * 4 +2];  
        }
        colSum = colSum.map(e => e / (blurWidth*2+1));

        editedPixels[i+0] = colSum[0];
        editedPixels[i+1] = colSum[1];
        editedPixels[i+2] = colSum[2];
      }
    }
    console.log("done!");
  }
</script>

<style>
  :global(*) {
    padding: 0;
    margin: 0;
  }

  :global(html), :global(body) {
    height: 100%;
    width: 100%;
  }

  img {
    max-width: 100%;
    max-height: 100%;
  }
</style>