import { page } from "../stores";

export default function switchPage(newPage: string) {
  console.debug(`[Pages] Switching to: ${newPage}`);
  page.update((_) => newPage);
  window.history.pushState({page: newPage}, `@davidp-ro - ${newPage}`, `?${newPage}`);
  document.title = `David Pescariu - ${newPage.charAt(0).toUpperCase() + newPage.substr(1)}`;
};