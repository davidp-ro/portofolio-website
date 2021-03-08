<script lang="ts">
  import Navbar from "./components/Navbar.svelte";
  import Footer from "./components/Footer.svelte";
  import Source from "./components/about/Source.svelte";

  import { page, mediaQuery } from "../stores";
  import { fade } from "svelte/transition";

  function switchPage(newPage: string) {
    page.update((_) => newPage);
  }
</script>

<section class="content" transition:fade={{ delay: 150, duration: 300 }}>
  <Navbar />

  {#if $mediaQuery === "desktop"}
    <div style="height: 3rem" />
  {/if}

  <!-- Content -->
  <div class="columns m-0 has-text-centered">
    <!-- Spacer left -->
    {#if $mediaQuery === "desktop"}
      <div class="column is-3" />
    {/if}

    <!-- Content -->
    <div class="column">
      <!-- Section 1 -->
      <h3>Who am I?</h3>
      <hr style="background-color: var(--primary)" />
      <p>
        I'm a high school student in Cluj-Napoca, Romania and a freelance
        developer in my free time! I'm passionate about Computer Vision and I'm
        actually
        <!-- svelte-ignore a11y-missing-attribute -->
        <a
          on:click={() => {
            switchPage("contact");
          }}
          style="border-bottom: 0.2rem solid var(--warning); color: #4A4A4A"
          >looking for internships</a
        >
        <br />
        <br />
        <br />
        <p2>
          I'm also quite a big fan of Hackathons, especially when I'm in teams,
          my favorite one yet was <a
            target="_blank"
            href="https://polihack.osut.org/">Polihack</a
          >
          where we built an MVP for a pair of glasses meant to help the blind keep
          their social distance during the COVID pandemic. Won 1<sup>st</sup> place
          <br />
          <a target="_blank" href="https://www.youtube.com/watch?v=IlWPMHCDhBA"
            >See our presentation video (Romanian)</a
          >
        </p2>
      </p>
      <!-- END Section 1 -->

      <div style="height: 1rem" />

      <!-- Section 2 -->
      <h3>Academics / Contests</h3>
      <hr style="background-color: var(--primary)" />
      <p>
        Head of Promotion / Valedictorian - <a
          target="_blank"
          href="https://dpit.ro/">DPIT Academy</a
        >
        2020

        <span
          ><hr
            class="mx-auto my-3"
            style="width: 20rem; background-color: #A1A1A1"
          /></span
        >

        2<sup>nd</sup> Place
        <a target="_blank" href="https://www.nerd-pitch.ro/">NerdPitch</a> Hackathon -
        Entrepreneurship

        <span
          ><hr
            class="mx-auto my-3"
            style="width: 20rem; background-color: #A1A1A1"
          /></span
        >

        6<sup>th</sup> Place
        <a target="_blank" href="https://acadnet.ro/ro/">Acadnet</a> Nationals -
        Computers / Calculatoare
      </p>
      <!-- END Section 2 -->

      <div style="height: 1rem" />

      <!-- Section 3 -->
      <h3>Public apparences</h3>
      <hr style="background-color: var(--primary)" />

      <div class="columns mx-auto" style="max-width: 50rem">
        <!-- Column 1 -->
        <div class="column is-4 mx-auto">
          <Source
            imgSrc="assets/logos/ebs.jpg"
            name="EBS Radio"
            link="https://ebsradio.ro/uncategorized/video-trei-echipe-de-elevi-din-cluj-premiate-pentru-crearea-unor-aplicatii-pentru-orase-smart-si-pentru-protejarea-padurilor/"
          />
          <Source
            imgSrc="assets/logos/transilvania-press.png"
            name="Transilvania Press"
            link="https://www.transilvaniapress.ro/actualitate/elevii-au-inventat-aplicatii-inovative-pentru-biciclisti-si-persoanele-rapite/"
          />
          <Source
            imgSrc="assets/logos/info-actual.png"
            name="Info Actual"
            link="https://www.infoactual.ro/aplicatii-de-la-cluj-pentru-orase-smart-si-paduri-protejate-cine-au-fost-premiantii.html"
          />
        </div>

        <!-- Column 2 -->
        <div class="column is-4 mx-auto">
          <Source
            imgSrc="assets/logos/b24.jpeg"
            name="Business24"
            link="https://business24.ro/mobile/aplicatii-mobile/ce-aplicatii-au-inventat-liceenii-romani-in-pandemie-1614264"
          />
          <Source
            imgSrc="assets/logos/radio-cluj.png"
            name="Radio Cluj"
            link="http://www.radiocluj.ro/2020/11/05/aplicatii-de-la-cluj-pentru-orase-smart-si-paduri-protejate-video/"
          />
          <Source
            imgSrc="assets/logos/n-news.jpg"
            name="NapocaNews"
            link="http://www.napocanews.ro/2020/11/aplicatii-de-la-cluj-pentru-orase-smart-si-paduri-protejate.html"
          />          
        </div>

        <!-- Column 3 -->
        <div class="column is-4 mx-auto">
          <Source
            imgSrc="assets/logos/transilvania-rep.jpg"
            name="Transilvania Reporter"
            link="https://transilvaniareporter.ro/actualitate/copiii-clujului-realizeaza-aplicatii-pentru-orase-smart-si-paduri-protejate/"
          />
          <Source
            imgSrc="assets/logos/zcj.jpg"
            name="Ziua de Cluj"
            link="https://zcj.ro/economie/it-istii-clujeni-au-gasit-solutia-la-protejarea-trotinetistilor-si-taierea-padurilor--206267.html"
          />
          <Source
            imgSrc="assets/logos/monitorul-cj.png"
            name="Monitorul de Cluj"
            link="http://www.monitorulcj.ro/actualitate/85404-cine-sunt-tinerii-clujeni-care-ne-vor-face-viata-mai-usoara_-si-mai-smart#sthash.YzhOeF8N.tJ72YUIH.dpbs"
          />
        </div>
        <!-- END Section 3 -->
      </div>
      <!-- End of columns -->
      
      <small>
        All logos and/or trademarks are the property of their respective owners.
      </small>
    </div>
    <!-- END Content -->

    <!-- Spacer right -->
    {#if $mediaQuery === "desktop"}
      <div class="column is-3" />
    {/if}
  </div>

  <Footer />
</section>
