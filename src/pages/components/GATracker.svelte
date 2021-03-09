<script lang="ts" context="module">
  import { doNotTrack } from "../../stores";

  let dnt: string;
  doNotTrack.subscribe((val) => {
    dnt = val;
  });

  export function trackClick(id: string) {
    if (dnt !== "") {
      console.debug("[GA::trackClick::Warn] doNotTrack active!");
      return;
    }

    let name = `click_${id}`;
    gtag("event", name);
  }

  export function trackSocialClick(type: string) {
    if (dnt !== "") {
      console.debug("[GA::trackClick::Warn] doNotTrack active!");
      return;
    }
    
    let name = `click_social_${type.toLowerCase().replaceAll(" ", "_")}`;
    gtag("event", name);
  }
</script>
