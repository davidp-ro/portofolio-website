<script lang="ts">
  import Navbar from "./components/Navbar.svelte";
  import Footer from "./components/Footer.svelte";
  import JobTitle from "./components/work/JobTitle.svelte";
  import { mediaQuery } from "../stores";
  import { fade } from "svelte/transition";
</script>

<section class="content" transition:fade={{ delay: 150, duration: 300 }}>
  <Navbar />

  {#if $mediaQuery === "desktop"}
    <div style="height: 3rem" />
  {/if}

  <div class="columns m-0">
    <!-- Spacer left -->
    {#if $mediaQuery === "desktop"}
      <div class="column is-3" />
    {/if}

    <!-- Content -->
    <div class="column">
      <!-- Freelancing -->
      <JobTitle
        title="Freelance Web Developer"
        duration="December 2020 - Present"
        location="Cluj-Napoca"
      />
      <p class="px-3" />
      <ul>
        <li>
          Developing a complete solution for my client’s needs, especially
          mobile-first websites.
        </li>
        <li>
          Close collaboration with the clients at every step to make sure that
          I’m on the right path with their wishes.
        </li>
        <li>
          Latest delivered project as of March 2021 – <a
            target="_blank"
            href="https://davinet.ro">davinet.ro</a
          >
          <ul>
            <li>
              <small
                >Built with Svelte as the framework and Bulma for styling (just
                like this website)</small
              >
            </li>
          </ul>
        </li>
      </ul>
      <!-- End:Freelancing -->

      <div style="height: 2rem" />

      <!-- DPIT -->
      <JobTitle
        title="Internship - Full Stack Developer"
        duration="May 2020 - November 2020"
        location="Cluj-Napoca"
        workplace="Bosch ECC / DPIT Academy"
      />
      <p class="px-3" />
      <ul>
        <li>
          Our team created a product meant to make you feel safe all the time -
          Safe Signal, now known as <a
            target="_blank"
            href="https://github.com/prisma-ai-official">prisma.ai</a
          >
        </li>
        <h6 class="mt-2 mb-1">I worked on:</h6>
        <li>
          Mobile – our app (Flutter) especially on the BLE communication
          (implemented with FlutterBlue) and on the Google Maps & Geocoding
          integration.
        </li>
        <li>
          Backend – our API (Flask / MySQL) that was storing data about reports
          in the user’s zone.
        </li>
        <li>
          Hardware / Embedded – on the CYBLE-222014 BLE Module firmware (ARM
          Cortex M0) and on the physical design of the bracelet
        </li>
      </ul>
      <!-- End:DPIT -->

      <div style="height: 2rem" />

      <!-- This Website -->
      <div class="columns m-0 is-vcentered">
        <div class="column m-0">
          <h4 class="m-0">This Website</h4>
        </div>
      </div>
      <hr class="mx-0" style="background-color: var(--warning)" />
      <p class="px-3" />
      <ul>
        <li>Designed as a Single Page Application & Made with Svelte.</li>
        <li>
          For styling I went with Bulma mostly because that's what I'm most
          familiar with, and I have better <em>flow</em> with it than with Tailwind.
        </li>
        <li>
          Want to see the source? <a
            target="_blank"
            href="https://github.com/davidp-ro/portofolio-website"
            >View the GitHub Repo</a
          >
        </li>
      </ul>

      <!-- End:This Website -->
    </div>

    <!-- Spacer right -->
    {#if $mediaQuery === "desktop"}
      <div class="column is-3" />
    {/if}
  </div>

  <Footer />
</section>
