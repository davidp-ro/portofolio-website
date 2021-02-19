<script lang="ts">
  import { fade } from "svelte/transition";

  let subject: string = "";
  let message: string = "";
  let lastValidS: string;
  let lastValidM: string;

  let hasError = false;
  let errorText: string = "";

  function validate(): void {
    if (subject.length <= 100) {
      lastValidS = subject;
    } else {
      subject = lastValidS;
    }
    if (message.length <= 1000) {
      lastValidM = message;
    } else {
      message = lastValidM;
    }
  }

  function send() {
    if (subject.length === 0 && message.length === 0) {
      errorText = "Yes, the button does indeed work :)";
      hasError = true;
    } else if (subject.length === 0) {
      errorText = "I think you forgot the subject!";
      hasError = true;
    } else if (message.length === 0) {
      errorText = "Nothing to tell me?";
      hasError = true;
    } else {
      const messageToSend = message.replaceAll("\n", "%0A");
      window.open(
        `mailto:davidpescariu12@gmail.com?subject=${subject}&body=${messageToSend}`
      );
    }
  }

  setInterval(validate, 100);
</script>

<div class="control">
  <div class="field has-text-left">
    <input
      type="text"
      class="input is-rounded"
      placeholder="Subject"
      bind:value={subject}
    />
    <p class="help ml-1">{subject.length} / <strong>100</strong></p>
  </div>

  <div style="height: 1rem" />

  <div class="field has-text-left">
    <textarea
      class="textarea has-fixed-size"
      placeholder="Your message"
      bind:value={message}
    />
    <p class="help ml-1">{message.length} / <strong>1000</strong></p>
  </div>

  <div style="height: 1rem" />

  <button class="button is-primary is-fullwidth is-rounded" on:click={send}>
    <svg
      aria-hidden="true"
      class="icon"
      style="padding: 0.2rem"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      ><path
        fill="currentColor"
        d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z"
      /></svg
    >
    <span>Send</span>
  </button>

  {#if hasError}
    <p class="mt-1 has-text-danger" transition:fade={{ duration: 100 }}>
      {errorText}
    </p>
  {/if}
</div>

<style>
  textarea {
    border-radius: 1rem;
    padding-left: calc(calc(0.75em - 1px) + 0.375em);
    padding-right: calc(calc(0.75em - 1px) + 0.375em);
  }
</style>
