/**
 * @module InfiniteScroll
 */
import { fetchData } from "../utils/api.js";

export let observer = null;
export let currentPage = 2;
export let isLoading = false;
export let hasNextPage = true;

export function initInfiniteScroll(endpoint) {
  currentPage = 2;
  isLoading = false;
  hasNextPage = true;

  const content = document.getElementById("content");
  const skeletons = document.querySelectorAll("#loading");
  const template = document.getElementById("card-template");

  if (!content || !skeletons.length || !template) {
    return;
  }

  let loadingIndicator = skeletons[skeletons.length - 1];

  function cleanUpDOM() {
    const THRESHOLD_ITEMS = 100;
    while (content.children.length > THRESHOLD_ITEMS) {
      content.removeChild(content.firstChild);
    }
  }

  function createCard(item) {
    const cardFragment = template.content.cloneNode(true);
    const card = cardFragment.querySelector(".card");

    const img = card.querySelector("img");
    img.src = item.poster || item.image || "placeholder.jpg";
    img.alt = item.title || "No Title";

    const titleElem = card.querySelector("h3");
    titleElem.textContent = item.title || "No Title";

    const episode = item.episode
      ? `?episode=${item.episode.split(" ")[1]?.split("/")[0]}`
      : "";
    
    const linkTo = item.link
      ? item.link
      : `/watch/${item.id}/${item.slug}${episode}`;
      
    const link = card.querySelector("a");
    link.href = linkTo;

    const infoElem = card.querySelector("p");
    infoElem.textContent = item.episode || item.type || item.status || (item.score ? `★ ${item.score}` : "");

    return card;
  }

  async function loadMoreData(page) {
    isLoading = true;
    const data = await fetchData(endpoint, page);
    const items = data?.results || data?.animes;

    if (items && Array.isArray(items)) {
      items.forEach((item) => {
        content.insertBefore(createCard(item), loadingIndicator);
      });
      cleanUpDOM();
    }

    if (data?.pagination?.hasNext || data?.pagination?.[0]?.next) {
      hasNextPage = true;
    } else {
      hasNextPage = false;
      if (observer) {
        observer.disconnect();
      }
      
      const noMoreDataCard = createCard({
        poster: "https://via.placeholder.com/240x340?text=Habis",
        title: "Sudah Habis",
        link: "#",
        episode: "",
        type: "End",
        status: "End",
      });
      if(loadingIndicator.parentNode) {
          loadingIndicator.parentNode.replaceChild(noMoreDataCard, loadingIndicator);
      }
    }
    isLoading = false;
  }

  if (observer) {
    observer.disconnect();
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isLoading && hasNextPage) {
          currentPage++;
          loadMoreData(currentPage);
        }
      });
    },
    { rootMargin: "0px 0px 100px 0px" },
  );

  window.__infiniteScrollObserver = observer;
  observer.observe(loadingIndicator);
}
