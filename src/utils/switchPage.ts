import { page } from "../stores";

export default function switchPage(newPage: string): void {
  console.debug(`[Pages] Switching to: ${newPage}`);
  page.update((_) => newPage);
  try {
    setTimeout(() => {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 400);
  } catch (e) {
    console.warn(`Cannot scroll to top: ${e}`);
  }
  try {
    window.history.pushState({page: newPage}, `@davidp-ro - ${newPage}`, `?${newPage}`);
  } catch (e) {
    console.warn(`Cannot access window.history: ${e}`);
  }
  document.title = `David Pescariu - ${newPage.charAt(0).toUpperCase() + newPage.substr(1)}`;
};