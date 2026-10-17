function readPreference(key, fallback) {
  try {
    const saved = window.localStorage.getItem(key);
    return saved === null ? fallback : JSON.parse(saved);
  } catch {
    return fallback;
  }
}

function writePreference(key, value) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* Private browsing or file URLs may disable storage. */ }
}

function localDateISO(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function initialDayIndex() {
  const today = new Date();
  const todayKey = localDateISO(today);
  const match = days.findIndex((day) => day.dateISO === todayKey);
  if (match >= 0) return match;
  const savedIndex = readPreference("uttarakhand-selected-day", null);
  if (Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < days.length) return savedIndex;
  const upcoming = days.findIndex((day) => day.dateISO > todayKey);
  return upcoming >= 0 ? upcoming : days.length - 1;
}

let selectedDayIndex = initialDayIndex();
const savedChoice = readPreference("uttarakhand-day-3-choice", "George Everest");
let selectedDayChoice = days[2].choice.options.includes(savedChoice) ? savedChoice : "George Everest";
let currentDetailsTab = "transport";
let ticketDatabasePromise;
let ticketThumbnailUrls = [];
let ticketRecords = [];
let expandedChapterKey = null;
let expandedStopIndex = days[selectedDayIndex].timeline.findIndex((item) => item.type !== "transport");
let toastTimeout;
let completedStops = readPreference("uttarakhand-completed-stops", {});
let offlineDayPhotos = readPreference("uttarakhand-offline-day-photos", {});
const disclosureTimeouts = new WeakMap();

const byId = (id) => document.getElementById(id);
const all = (selector) => [...document.querySelectorAll(selector)];

all(".home-hero-photo img, .home-next-card > img").forEach((image) => {
  image.addEventListener("load", () => image.classList.add("is-loaded"), { once: true });
  if (image.complete && image.naturalWidth) image.classList.add("is-loaded");
  image.addEventListener("error", () => {
    image.hidden = true;
    image.parentElement.classList.add("image-unavailable");
    const caption = image.parentElement.querySelector("figcaption");
    if (caption) caption.hidden = true;
  });
});

const destinations = [
  {
    name: "Rishikesh",
    days: "DAY 2 · 19 OCTOBER",
    note: "Waterfall morning & Ganga light",
    openDay: 1,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/13_Manzil_Temple_Rishikesh_2021.jpg/1920px-13_Manzil_Temple_Rishikesh_2021.jpg",
    alt: "The 13-storey Tera Manzil temple rising above the Ganga at Rishikesh"
  },
  {
    name: "Mussoorie",
    days: "DAYS 3–4 · 20–21 OCTOBER",
    note: "Waterfalls, Landour & the winterline",
    openDay: 2,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Mussoorie_Hill_Station.jpg/1920px-Mussoorie_Hill_Station.jpg",
    alt: "Deodar pines and the distant snowline above Mussoorie"
  },
  {
    name: "Dehradun",
    days: "DAY 5 · 22 OCTOBER",
    note: "Cave water & the Great Stupa",
    openDay: 4,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Mindrolling_Monastery_Stupa%2C_Dehradun_%2860657%29.jpg/1920px-Mindrolling_Monastery_Stupa%2C_Dehradun_%2860657%29.jpg",
    alt: "The Great Stupa at Mindrolling Monastery in Dehradun"
  }
];

function renderDestinationGallery() {
  byId("destinationGallery").innerHTML = destinations.map((destination) => `
    <button class="destination-card" type="button" data-destination-day="${destination.openDay}" aria-label="Explore ${destination.name}, ${destination.days.toLowerCase()}">
      <img src="${destination.image}" alt="${destination.alt}" loading="lazy" />
      <span class="destination-shade"></span>
      <span class="destination-open" aria-hidden="true"><svg><use href="#icon-arrow"/></svg></span>
      <span class="destination-copy"><small>${destination.days}</small><strong>${destination.name}</strong><span>${destination.note}</span></span>
    </button>`).join("");
  all(".destination-card img").forEach((image) => image.addEventListener("error", () => {
    image.hidden = true;
    image.closest(".destination-card").classList.add("image-unavailable");
  }, { once: true }));
  all(".destination-card img").forEach((image) => {
    image.addEventListener("load", () => image.classList.add("is-loaded"), { once: true });
    if (image.complete && image.naturalWidth) image.classList.add("is-loaded");
  });
}

function getDayPhotoUrls(day) {
  return [...new Set([day.image, ...day.timeline.map((item) => getStopPhoto(day, item)?.image).filter(Boolean)])];
}

function updateOfflineSaveButton(day) {
  const button = byId("saveDayOffline");
  const urls = getDayPhotoUrls(day);
  const savedUrls = offlineDayPhotos[day.number] || [];
  const saved = urls.filter((url) => savedUrls.includes(url)).length;
  button.textContent = saved === urls.length ? `Offline ready · ${saved} photos` : saved ? `Save photos · ${saved}/${urls.length}` : "Save photos offline";
  button.setAttribute("aria-label", saved === urls.length ? `Day ${day.number} photos saved offline` : `Save photos for Day ${day.number} for offline use`);
}

async function verifyOfflinePhotos(day) {
  const urls = getDayPhotoUrls(day);
  if (!navigator.serviceWorker?.controller) {
    offlineDayPhotos[day.number] = [];
    updateOfflineSaveButton(day);
    return;
  }
  if (!urls.length) return;
  const channel = new MessageChannel();
  try {
    const result = await new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("Offline check timed out")), 2500);
      channel.port1.onmessage = (message) => { window.clearTimeout(timeout); resolve(message.data); };
      navigator.serviceWorker.controller.postMessage({ type: "CHECK_CACHED_PHOTOS", urls }, [channel.port2]);
    });
    if (day.number !== days[selectedDayIndex].number) return;
    offlineDayPhotos[day.number] = result.cachedUrls || [];
    writePreference("uttarakhand-offline-day-photos", offlineDayPhotos);
    updateOfflineSaveButton(day);
  } catch { /* Keep the save action available if cache inspection is unavailable. */ }
}

function switchTab(tabName) {
  const focusWasInScreen = Boolean(document.activeElement?.closest("[data-screen]"));
  all("[data-screen]").forEach((screen) => {
    const isCurrent = screen.dataset.screen === tabName;
    screen.hidden = !isCurrent;
    screen.classList.toggle("active", isCurrent);
  });
  all(".nav-item[data-tab]").forEach((tab) => {
    const isCurrent = tab.dataset.tab === tabName;
    tab.classList.toggle("active", isCurrent);
    tab.setAttribute("aria-selected", String(isCurrent));
    tab.tabIndex = isCurrent ? 0 : -1;
  });
  if (focusWasInScreen) byId(`tab${tabName[0].toUpperCase()}${tabName.slice(1)}`).focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "instant" });
}

function renderDayPicker() {
  byId("dayRail").innerHTML = days.map((day, index) => `
    <button class="day-chip ${index === selectedDayIndex ? "active" : ""}"
      id="dayTab${day.number}" role="tab" aria-controls="dayFeature" aria-selected="${index === selectedDayIndex}" tabindex="${index === selectedDayIndex ? "0" : "-1"}" data-day="${index}" type="button" aria-label="Day ${day.number}, ${day.place}, ${day.date}, ${(completedStops[day.number] || []).length} of ${day.timeline.length} stops complete">
      <span class="day-chip-top"><span>DAY ${String(day.number).padStart(2, "0")}</span><span class="day-chip-count">${(completedStops[day.number] || []).length}/${day.timeline.length}</span></span>
      <span class="day-chip-place">${day.place}</span><span class="day-chip-date">${new Date(day.dateISO + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}</span>
    </button>`).join("");
  byId("dayFeature").setAttribute("aria-labelledby", `dayTab${days[selectedDayIndex].number}`);
}

function groupTimelineItems(items) {
  const chapters = [
    { key: "morning", name: "Morning", icon: "icon-sun", test: (hour) => hour < 12 },
    { key: "midday", name: "Midday", icon: "icon-cup", test: (hour) => hour >= 12 && hour < 15 },
    { key: "afternoon", name: "Afternoon", icon: "icon-sunset", test: (hour) => hour >= 15 && hour < 18 },
    { key: "evening", name: "Evening", icon: "icon-moon", test: (hour) => hour >= 18 }
  ].map((chapter) => ({ ...chapter, items: [] }));

  items.forEach((item, index) => {
    const match = item.time.match(/^(\d{1,2}):/);
    const hour = match ? Number(match[1]) : 12;
    (chapters.find((chapter) => chapter.test(hour)) || chapters[1]).items.push({ item, index });
  });
  return chapters.filter((chapter) => chapter.items.length);
}

function renderTimeline() {
  const day = days[selectedDayIndex];
  byId("dayFeature").dataset.day = String(day.number);
  const activeChapters = groupTimelineItems(day.timeline);
  byId("timeline").innerHTML = activeChapters.map((chapter, chapterIndex) => {
    const firstTime = chapter.items[0].item.time.split("–")[0];
    const lastTime = chapter.items[chapter.items.length - 1].item.time.split("–").pop();
    const range = firstTime === lastTime ? firstTime : `${firstTime} — ${lastTime}`;
    return `
      <section class="timeline-chapter" data-chapter="${chapter.key}">
        <button class="chapter-toggle" type="button" aria-expanded="false" aria-controls="chapterItems${day.number}${chapter.key}">
          <span class="chapter-sun" aria-hidden="true"><svg><use href="#${chapter.icon}"/></svg></span>
          <span class="chapter-copy"><small>CHAPTER 0${chapterIndex + 1} · ${range}</small><strong>${chapter.name}</strong></span>
          <span class="chapter-count">${chapter.items.length}<small>moments</small></span>
          <span class="chapter-chevron" aria-hidden="true">⌄</span>
        </button>
        <div class="chapter-items" id="chapterItems${day.number}${chapter.key}" role="group" aria-label="${chapter.name} itinerary" hidden>${chapter.items.map(({ item, index }) => renderStop(item, index, day)).join("")}</div>
      </section>`;
  }).join("");
  const firstChapterKey = activeChapters[0]?.key;
  const stopChapterKey = activeChapters.find((chapter) => chapter.items.some(({ index }) => index === expandedStopIndex))?.key;
  const expandedChapter = byId(`chapterItems${day.number}${expandedChapterKey || stopChapterKey || firstChapterKey}`);
  if (expandedChapter) {
    const chapter = expandedChapter.closest(".timeline-chapter");
    chapter.classList.add("expanded");
    chapter.querySelector(".chapter-toggle").setAttribute("aria-expanded", "true");
    expandedChapter.hidden = false;
    if (expandedStopIndex !== null) {
      const stop = expandedChapter.querySelector(`[data-item="${expandedStopIndex}"]`);
      if (stop) {
        stop.classList.add("expanded");
        stop.querySelector(".timeline-summary").setAttribute("aria-expanded", "true");
        stop.querySelector(".timeline-detail").hidden = false;
      } else {
        expandedStopIndex = null;
      }
    }
  } else {
    expandedChapterKey = null;
    expandedStopIndex = null;
  }
  all(".stop-photo img").forEach((image) => image.addEventListener("error", () => {
    const photo = image.closest(".stop-photo");
    if (photo) { photo.classList.add("photo-unavailable"); image.remove(); }
  }, { once: true }));
  all(".stop-photo img").forEach((image) => {
    image.addEventListener("load", () => image.classList.add("is-loaded"), { once: true });
    if (image.complete && image.naturalWidth) image.classList.add("is-loaded");
  });
  const doneCount = (completedStops[day.number] || []).length;
  byId("timelineCount").textContent = `${doneCount} / ${day.timeline.length} done`;
  byId("progressMeter").setAttribute("aria-valuenow", String(doneCount));
  byId("progressMeter").setAttribute("aria-valuemax", String(day.timeline.length));
  byId("progressFill").style.width = `${day.timeline.length ? (doneCount / day.timeline.length) * 100 : 0}%`;
  byId("resetProgress").hidden = doneCount === 0;
}

function getStopPhoto(day, item) {
  if (item.type === "transport") return null;
  const title = item.title.toLowerCase();
  const photo = (image, imagePlace, imageCredit, imageSource) => ({ image, imagePlace, imageCredit, imageSource });
  if (day.number === 1 && title.includes("mansa devi")) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Mansa_Devi_Temple%2C_Haridwar.JPG/1920px-Mansa_Devi_Temple%2C_Haridwar.JPG", "Mansa Devi Temple and its cable car on the hill above Haridwar", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Mansa_Devi_Temple,_Haridwar.JPG");
  }
  if (day.number === 1 && title.includes("chandi devi")) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/f/f9/Chandi_Devi_temple%2C_ropeway.jpg", "Chandi Devi Temple ropeway", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Chandi_Devi_temple,_ropeway.jpg");
  }
  if (day.number === 1 && (title.includes("ganga aarti") || title.includes("har ki pauri"))) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Evening_aarti_at_Har-ki-pauri%2C_Haridwar.JPG/1920px-Evening_aarti_at_Har-ki-pauri%2C_Haridwar.JPG", "Evening Ganga Aarti at Har Ki Pauri, Haridwar", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Evening_aarti_at_Har-ki-pauri,_Haridwar.JPG");
  }
  if (day.number === 1 && /moti baza{1,2}r/.test(title)) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/A_shop_catering_to_pilgrims_at_Haridwar.jpg/1920px-A_shop_catering_to_pilgrims_at_Haridwar.jpg", "A Haridwar shop stacked with puja flowers, garlands and offerings", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:A_shop_catering_to_pilgrims_at_Haridwar.jpg");
  }
  if (day.number === 2 && title.includes("neer garh")) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Neer_Garh_Waterfall.jpg/1920px-Neer_Garh_Waterfall.jpg", "Neer Garh Waterfall and its green pool near Rishikesh", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Neer_Garh_Waterfall.jpg");
  }
  if (day.number === 2 && (title.includes("trayamb") || title.includes("tera manzil"))) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Trayambakeshwar_Temple.jpg/1920px-Trayambakeshwar_Temple.jpg", "The tiered Trayambakeshwar (Tera Manzil) Temple rising above Rishikesh", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Trayambakeshwar_Temple.jpg");
  }
  if (day.number === 2 && title.includes("beatles ashram")) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Graffiti_in_the_abandoned_Mahesh_Yogi%27s_Ashram_DSCN9887Lennon.jpg/1920px-Graffiti_in_the_abandoned_Mahesh_Yogi%27s_Ashram_DSCN9887Lennon.jpg", "Beatles murals inside the abandoned ashram at Chaurasi Kutiya, Rishikesh", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Graffiti_in_the_abandoned_Mahesh_Yogi%27s_Ashram_DSCN9887Lennon.jpg");
  }
  if (day.number === 2 && (title.includes("ram jhula") || title.includes("gita bhawan"))) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Ram_Jhula_footbridge_-_Rishikesh.jpg/1920px-Ram_Jhula_footbridge_-_Rishikesh.jpg", "Ram Jhula footbridge over the Ganga at Rishikesh", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Ram_Jhula_footbridge_-_Rishikesh.jpg");
  }
  if (day.number === 2 && title.includes("parmarth niketan aarti")) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Ken_Wieland_Ganga_Aarti_in_Rishikesh.jpg/1920px-Ken_Wieland_Ganga_Aarti_in_Rishikesh.jpg", "Pilgrims gathered for the evening Ganga Aarti at Parmarth Niketan", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Ken_Wieland_Ganga_Aarti_in_Rishikesh.jpg");
  }
  if (day.number === 2 && title.includes("triveni ghat")) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Ganga_Arti_At_Triveni_Ghat_In_Rishikesh.jpg/1920px-Ganga_Arti_At_Triveni_Ghat_In_Rishikesh.jpg", "Evening Ganga Aarti at Triveni Ghat, Rishikesh", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Ganga_Arti_At_Triveni_Ghat_In_Rishikesh.jpg");
  }
  if (day.number === 3 && title.includes("kempty falls")) return photo(day.image, day.imagePlace, day.imageCredit, day.imageSource);
  if (day.number === 3 && title.includes("santura devi")) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Kempty_Falls_Mussoorie_2.jpg/1920px-Kempty_Falls_Mussoorie_2.jpg", "Forested ridge above Mussoorie, below Santura Devi Temple", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Kempty_Falls_Mussoorie_2.jpg");
  }
  if (day.number === 3 && title.includes("george everest")) {
    if (selectedDayChoice === "Buddhist Temple") {
      return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Park_Estate%2C_George_Everest%2C_Mussoorie.jpg/1920px-Park_Estate%2C_George_Everest%2C_Mussoorie.jpg", "Pines and open ground on the ridge at Happy Valley, Mussoorie", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Park_Estate,_George_Everest,_Mussoorie.jpg");
    }
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/George_everest_house.jpg/1920px-George_everest_house.jpg", "Prayer flags on the ridge at George Everest House, Mussoorie", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:George_everest_house.jpg");
  }
  if (day.number === 3 && title.includes("company garden")) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flower_nursery_at_Company_Garden_in_Mussoorie_04.jpg/1920px-Flower_nursery_at_Company_Garden_in_Mussoorie_04.jpg", "Flower nursery at Company Garden, Mussoorie", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Flower_nursery_at_Company_Garden_in_Mussoorie_04.jpg");
  }
  if (day.number === 3 && title.includes("cloud's end")) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Mussoorie_Uttarakhand_India_%28183712303%29.jpeg/1920px-Mussoorie_Uttarakhand_India_%28183712303%29.jpeg", "Layered Himalayan ridges from the quiet west end of the Mussoorie ridge", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Mussoorie_Uttarakhand_India_(183712303).jpeg");
  }
  if (day.number === 4 && title.includes("char dukan")) return photo(day.image, day.imagePlace, day.imageCredit, day.imageSource);
  if (day.number === 4 && title.includes("lal tibba")) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Lal_Tibba_-_panoramio.jpg/1920px-Lal_Tibba_-_panoramio.jpg", "Sunlight through the deodar forest at Lal Tibba, Landour", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Lal_Tibba_-_panoramio.jpg");
  }
  if (day.number === 4 && title.includes("sister's bazaar")) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Landour_Himalayan_View_%285275282675%29.jpg/1920px-Landour_Himalayan_View_%285275282675%29.jpg", "Snow peaks framed by deodars above Landour, Mussoorie", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Landour_Himalayan_View_(5275282675).jpg");
  }
  if (day.number === 4 && title.includes("gun hill")) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Ropeway_to_Gun_hill%2C_Mussoorie.JPG/1920px-Ropeway_to_Gun_hill%2C_Mussoorie.JPG", "Cable car on the Gun Hill ropeway, Mussoorie", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Ropeway_to_Gun_hill,_Mussoorie.JPG");
  }
  if (day.number === 4 && title.includes("mall road")) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Mall_Road%2C_Mussoorie_03.JPG/1920px-Mall_Road%2C_Mussoorie_03.JPG", "Shops and deodars along Mall Road, Mussoorie", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Mall_Road,_Mussoorie_03.JPG");
  }
  if (day.number === 5 && title.includes("robber")) return photo(day.image, day.imagePlace, day.imageCredit, day.imageSource);
  if (day.number === 5 && title.includes("malsi deer park")) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Bevy_of_spotted_deer.jpg/1920px-Bevy_of_spotted_deer.jpg", "A bevy of spotted deer at Malsi Deer Park, Dehradun", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Bevy_of_spotted_deer.jpg");
  }
  if (day.number === 5 && title.includes("tapkeshwar")) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Shiv_tapkeshwar_temple.jpg/1920px-Shiv_tapkeshwar_temple.jpg", "The Shivling inside its natural cave at Tapkeshwar Temple, Dehradun", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Shiv_tapkeshwar_temple.jpg");
  }
  if (day.number === 5 && title.includes("mindrolling")) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Mindrolling_Monastery_Stupa%2C_Dehradun_%2889495%29.jpg/1920px-Mindrolling_Monastery_Stupa%2C_Dehradun_%2889495%29.jpg", "The Mindrolling Monastery courtyard in Dehradun", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Mindrolling_Monastery_Stupa,_Dehradun_(89495).jpg");
  }
  if (day.number === 5 && title.includes("paltan bazaar")) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Paltan_Bazaar_-_Dehradun_%285274608071%29.jpg/1920px-Paltan_Bazaar_-_Dehradun_%285274608071%29.jpg", "Cloth, shoe and sweet shops in Paltan Bazaar, Dehradun", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Paltan_Bazaar_-_Dehradun_(5274608071).jpg");
  }
  if (day.number === 5 && title.includes("rajpur road")) {
    return photo("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/The_Dehradun_Clock_Tower.jpg/1920px-The_Dehradun_Clock_Tower.jpg", "The Clock Tower roundabout where Rajpur Road begins, Dehradun", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:The_Dehradun_Clock_Tower.jpg");
  }
  return null;
}

const genericStopPattern = /breakfast|lunch|dinner|brunch|quick meal|meal nearby|luggage|freshen|wind down|\brest\b|pack|relax|secure (?:aarti )?viewing|secure seats|hotel exit|return to hotel|departure/i;

function previousNamedPlace(day, index) {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const candidate = day.timeline[cursor];
    if (candidate.type !== "transport" && !genericStopPattern.test(candidate.title)) return candidate.title;
  }
  return day.hotel;
}

function hotelMapPlace(day) {
  return day.hotel.split(" · End:")[0].replace(/^Start:\s*/i, "").trim();
}

function nearbyMealArea(day, index) {
  const previous = day.timeline[index - 1];
  const shortHotel = hotelMapPlace(day).split(" · ")[0];
  if (!previous) return shortHotel;
  if (previous.type === "transport") {
    if (/hotel/i.test(previous.title)) return shortHotel;
    const route = previous.title.match(/^.+?\s*→\s*(.+)$/);
    if (route) {
      const endpoint = route[1].trim();
      if (/midday (?:stop|choice)/i.test(endpoint)) return selectedDayChoice === "Buddhist Temple" ? "Shedup Choephelling Temple" : "George Everest's House";
      return endpoint;
    }
    if (/^drive to /i.test(previous.title)) return previous.title.replace(/^drive to /i, "");
  }
  if (/\bOR\b/i.test(previous.title)) return selectedDayChoice === "Buddhist Temple" ? "Shedup Choephelling Temple" : "George Everest's House";
  if (!genericStopPattern.test(previous.title)) return previous.title;
  return previousNamedPlace(day, index).split(" · ")[0];
}

function mapActionFor(day, item, index) {
  const title = item.title;
  const selectedChoiceName = selectedDayChoice === "Buddhist Temple" ? "Shedup Choephelling Temple, Happy Valley" : "George Everest's House";
  const search = (query, label = "Find on map") => ({
    label,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
  });
  const directions = (origin, destination, mode = "driving") => ({
    label: "Get directions",
    href: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=${mode}`
  });
  const endpoint = (name) => {
    const cleaned = name.trim();
    if (/midday (?:stop|choice)/i.test(cleaned)) return `${selectedChoiceName}, ${day.place}`;
    if (/hotel/i.test(cleaned)) return hotelMapPlace(day);
    if (/^station$/i.test(cleaned)) return `${day.place} Railway Station, ${day.place}`;
    if (/^(haridwar|rishikesh|mussoorie)$/i.test(cleaned) && day.hotel.toLowerCase().includes(cleaned.toLowerCase())) return hotelMapPlace(day);
    return `${cleaned}, ${day.place}`;
  };

  if (/cross to east bank/i.test(title)) {
    return search("Bajrang Setu Rishikesh", "Check bridge map");
  }
  if (item.type === "transport") {
    const arrowRoute = title.match(/^(.+?)\s*→\s*(.+)$/);
    const walkOnly = /walk|on foot/i.test(item.mode || "") && !/auto|cab|vehicle/i.test(item.mode || "");
    if (arrowRoute) return directions(endpoint(arrowRoute[1]), endpoint(arrowRoute[2]), walkOnly ? "walking" : "driving");
    if (/^drive to /i.test(title)) return directions(`${previousNamedPlace(day, index)}, ${day.place}`, `${title.replace(/^drive to /i, "")}, ${day.place}`);
    if (/return to hotel/i.test(title)) return directions(`${previousNamedPlace(day, index)}, ${day.place}`, day.hotel);
    return search(`${title}, ${day.place}`, "Find route");
  }

  if (/^arrive at /i.test(title)) return search(title.replace(/^arrive at /i, ""), "Find station");
  if (/^breakfast/i.test(title)) return search(`breakfast near ${hotelMapPlace(day)}`, "Find breakfast");
  if (/lunch|dinner|brunch|quick meal|meal nearby/i.test(title)) {
    const area = /brunch|cafe/i.test(title) ? "Tapovan" : nearbyMealArea(day, index);
    return search(`restaurants near ${area}, ${day.place}`, "Find food nearby");
  }
  if (/luggage|freshen|wind down|\brest\b|pack|hotel exit/i.test(title)) return search(hotelMapPlace(day), "View hotel on map");
  if (/departure/i.test(title)) return search(`departure points, ${day.place}, Uttarakhand`, "Find departure points");
  if (/secure (?:aarti )?viewing|secure seats/i.test(title)) {
    const place = /parmarth/i.test(title) ? "Parmarth Niketan" : previousNamedPlace(day, index);
    return search(`${place}, ${day.place}`, "Find viewing spot");
  }
  if (/relax/i.test(title)) return search(`${previousNamedPlace(day, index)}, ${day.place}`, "Find nearby on map");
  if (/george everest or buddhist temple/i.test(title)) return search(`${selectedChoiceName}, ${day.place}`);
  return search(`${title}, ${day.place}`);
}

function renderStop(item, index, day) {
  const photo = getStopPhoto(day, item);
  const mapAction = mapActionFor(day, item, index);
  const completed = (completedStops[day.number] || []).includes(index);
  return `
    <article class="timeline-item ${item.type === "transport" ? "transport" : ""} ${completed ? "completed" : ""}" data-item="${index}">
      <button class="timeline-summary" aria-expanded="false" aria-controls="stopDetail${day.number}${index}" type="button">
        <span class="timeline-time">${item.displayTime || item.time}</span>
        <span class="timeline-track" aria-hidden="true"></span>
        <span class="timeline-title">${item.title}</span>
        <span class="timeline-chevron" aria-hidden="true">＋</span>
      </button>
      <div class="timeline-detail" id="stopDetail${day.number}${index}" role="region" aria-label="${item.title} details" hidden>
        ${item.fromHotel || item.distance || item.mode || item.fare ? `<div class="stop-facts">${item.fromHotel ? `<p><span class="detail-label">From your hotel</span>${item.fromHotel}</p>` : ""}${item.distance ? `<p><span class="detail-label">Distance</span>${item.distance}</p>` : ""}${item.mode ? `<p><span class="detail-label">Getting there</span>${item.mode}</p>` : ""}${item.fare ? `<p><span class="detail-label">Cost</span>${item.fare}</p>` : ""}</div>` : ""}
        ${item.detail ? `<p class="stop-description">${item.detail}</p>` : ""}
        ${item.note ? `<p class="timeline-note"><span aria-hidden="true"><svg><use href="#icon-spark"/></svg></span> ${item.note}</p>` : ""}
        ${photo ? `<figure class="stop-photo"><a href="${photo.imageSource}" target="_blank" rel="noopener noreferrer" aria-label="Open photo source: ${photo.imagePlace}"><img src="${photo.image}" alt="${photo.imagePlace}" loading="lazy" /></a><figcaption><span>${photo.imagePlace}</span><a href="${photo.imageSource}" target="_blank" rel="noopener noreferrer">Photo · ${photo.imageCredit} ↗</a></figcaption></figure>` : ""}
        <div class="stop-actions"><button type="button" class="stop-done ${completed ? "is-done" : ""}" data-complete-stop="${index}" aria-pressed="${completed}"><svg aria-hidden="true"><use href="#icon-check"/></svg>${completed ? "Done · undo" : "Mark done"}</button><button type="button" data-share-stop="${index}"><svg aria-hidden="true"><use href="#icon-share"/></svg>Share this stop</button><a class="map-action" href="${mapAction.href}" target="_blank" rel="noopener noreferrer" aria-label="${mapAction.label}: ${item.title}"><svg aria-hidden="true"><use href="#icon-map"/></svg>${mapAction.label}</a></div>
      </div>
    </article>`;
}

function renderDay() {
  const day = days[selectedDayIndex];
  updateOfflineSaveButton(day);
  const image = byId("dayImage");
  const cover = image.closest(".day-cover");
  image.dataset.requestedSource = day.image;
  image.onload = () => {
    if (image.dataset.requestedSource !== day.image) return;
    image.style.display = "block";
    image.classList.add("is-loaded");
    cover.classList.remove("image-unavailable");
    byId("photoCredit").style.display = "block";
  };
  image.onerror = () => {
    if (image.dataset.requestedSource !== day.image) return;
    image.style.display = "none";
    cover.classList.add("image-unavailable");
    byId("photoCredit").style.display = "none";
  };
  image.classList.remove("is-loaded");
  image.src = day.image;
  if (image.complete && image.naturalWidth && image.currentSrc === day.image) image.classList.add("is-loaded");
  image.alt = day.imagePlace;
  byId("photoCredit").href = day.imageSource;
  byId("photoCredit").textContent = day.imageCredit;
  byId("dayStatus").textContent = day.status;
  byId("dayDate").textContent = `DAY ${day.number} · ${day.date}`;
  const todayKey = localDateISO();
  byId("dayToday").textContent = day.dateISO === todayKey ? "TODAY" : "SELECTED DAY";
  byId("dayTitle").textContent = day.place;
  byId("dayDek").textContent = day.dek;
  byId("dayNumberLarge").textContent = String(day.number).padStart(2, "0");
  byId("dayRoute").textContent = day.route;
  byId("dayHotel").textContent = day.hotel;
  byId("hotelMap").href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotelMapPlace(day))}`;
  byId("hotelMap").setAttribute("aria-label", `Find ${hotelMapPlace(day).split(" · ")[0]} on map`);
  byId("sheetFooterNote").innerHTML = `<strong>Plan note · </strong>${day.footer}`;
  const planAlert = byId("dayPlanAlert");
  if (day.number === 2) {
    planAlert.hidden = false;
    planAlert.innerHTML = `<span class="alert-icon" aria-hidden="true">!</span><p><strong>Confirm the route before leaving the hotel.</strong><br />Ram Jhula is reported closed, and Beatles Ashram is listed closed on Mondays. Verify the open crossing and Ashram access locally; keep the riverfront and Gita Bhawan as your flexible alternative.</p>`;
  } else {
    planAlert.hidden = true;
    planAlert.textContent = "";
  }
  byId("atAGlance").innerHTML = [
    ["Getting around", day.transport],
    ["Entry & extras", day.costs]
  ].map(([label, value]) => `<div class="fact"><span>${label}</span><strong>${value}</strong></div>`).join("");

  const choiceBlock = byId("choiceBlock");
  if (day.choice) {
    choiceBlock.hidden = false;
    choiceBlock.innerHTML = `
      <p>YOUR MIDDAY CHOICE · PICK ONE</p>
      <div role="group" aria-label="Choose the Day 3 midday destination">${day.choice.options.map((option) => `
        <button type="button" data-choice="${option}" aria-pressed="${selectedDayChoice === option}" class="${selectedDayChoice === option ? "selected" : ""}">
          ${option === "Buddhist Temple" ? "Shedup Choephelling" : option}
        </button>`).join("")}</div>
      <small>Weather, family mood and road conditions can help you decide on the day.</small>`;
  } else {
    choiceBlock.hidden = true;
    choiceBlock.innerHTML = "";
  }

  renderDayPicker();
  renderTimeline();
  updateNowStrip();
  verifyOfflinePhotos(day);
}

function stopMinutes(item) {
  const times = [...item.time.matchAll(/(\d{1,2}):(\d{2})/g)].map((match) => Number(match[1]) * 60 + Number(match[2]));
  if (!times.length) return null;
  const start = times[0];
  const end = /onward/i.test(item.time) ? 24 * 60 : Math.max(...times, start);
  return { start, end };
}

function formatClock(totalMinutes) {
  return `${Math.floor(totalMinutes / 60)}:${String(totalMinutes % 60).padStart(2, "0")}`;
}

function updateNowStrip() {
  const strip = byId("nowStrip");
  const day = days[selectedDayIndex];
  if (!strip || !day) return;
  if (day.dateISO !== localDateISO()) { strip.hidden = true; strip.innerHTML = ""; return; }
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const entries = day.timeline.map((item, index) => ({ index, item, minutes: stopMinutes(item) }));
  const current = entries.find((entry) => entry.minutes && minutes >= entry.minutes.start && minutes < entry.minutes.end);
  const next = entries.find((entry) => entry.minutes && entry.minutes.start > minutes);
  if (current) {
    const nextButton = next ? `<button type="button" class="now-next" data-now-next="${next.index}"><span>UP NEXT ${formatClock(next.minutes.start)}</span><strong>${escapeHTML(next.item.title)}</strong></button>` : "";
    strip.hidden = false;
    strip.innerHTML = `<span class="now-live" aria-hidden="true"></span><div class="now-copy"><span class="now-label">Live now · until ${formatClock(current.minutes.end)}</span><strong>${escapeHTML(current.item.title)}</strong></div>${nextButton}`;
  } else if (next) {
    strip.hidden = false;
    strip.innerHTML = `<span class="now-live idle" aria-hidden="true"></span><div class="now-copy"><span class="now-label">Day begins ${formatClock(next.minutes.start)}</span><strong>${escapeHTML(next.item.title)}</strong></div>`;
  } else {
    strip.hidden = false;
    strip.innerHTML = `<span class="now-live done" aria-hidden="true"></span><div class="now-copy"><span class="now-label">Day wrapped</span><strong>Every planned stop is behind you — rest up.</strong></div>`;
  }
}

function setDisclosureVisible(panel, visible) {
  if (visible) {
    window.clearTimeout(disclosureTimeouts.get(panel));
    panel.hidden = false;
    panel.classList.remove("is-closing");
    return;
  }
  if (panel.hidden) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    panel.hidden = true;
    panel.classList.remove("is-closing");
    return;
  }
  window.clearTimeout(disclosureTimeouts.get(panel));
  panel.classList.add("is-closing");
  const timeout = window.setTimeout(() => {
    if (!panel.classList.contains("is-closing")) return;
    panel.hidden = true;
    panel.classList.remove("is-closing");
    disclosureTimeouts.delete(panel);
  }, 220);
  disclosureTimeouts.set(panel, timeout);
}

function selectDay(index, openDaysTab = false) {
  if (index < 0 || index >= days.length) return;
  const changed = index !== selectedDayIndex;
  const direction = index >= selectedDayIndex ? "next" : "previous";
  if (index !== selectedDayIndex) {
    expandedChapterKey = null;
    expandedStopIndex = days[index].timeline.findIndex((item) => item.type !== "transport");
  }
  selectedDayIndex = index;
  writePreference("uttarakhand-selected-day", index);
  renderDay();
  const dayTab = byId(`dayTab${days[index].number}`);
  if (changed) dayTab?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "nearest", inline: "center" });
  if (changed) {
    const feature = byId("dayFeature");
    feature.classList.remove("day-transition-next", "day-transition-previous");
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      void feature.offsetWidth;
      feature.classList.add(`day-transition-${direction}`);
      feature.addEventListener("animationend", () => feature.classList.remove(`day-transition-${direction}`), { once: true });
    }
  }
  if (openDaysTab) {
    switchTab("days");
    byId(`dayTab${days[index].number}`).focus({ preventScroll: true });
  }
}

function renderPriorityCards() {
  byId("priorityGrid").innerHTML = days.map((day, index) => `
    <button class="priority-card" type="button" data-priority-day="${index}" style="--priority-image:url('${day.image}')">
      <span class="priority-number">0${day.number}</span>
      <p class="priority-day">DAY ${day.number} · ${day.place}</p>
      <strong>${day.hero}</strong>
      <small>${day.priority}</small>
    </button>`).join("");
}

function renderDetails(key) {
  currentDetailsTab = key;
  if (key === "tickets") {
    all(".detail-tab").forEach((button) => {
      const selected = button.dataset.detail === key;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    byId("essentialsContent").setAttribute("aria-labelledby", "detailsTabTickets");
    renderTickets();
    return;
  }
  const details = essentials[key];
  byId("essentialsContent").innerHTML = details.content;
  all(".detail-tab").forEach((button) => {
    const selected = button.dataset.detail === key;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  byId("essentialsContent").setAttribute("aria-labelledby", `detailsTab${key[0].toUpperCase()}${key.slice(1)}`);
  currentDetailsTab = key;
}

function openTicketDatabase() {
  if (ticketDatabasePromise) return ticketDatabasePromise;
  ticketDatabasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open("uttarakhand-local-tickets", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("tickets", { keyPath: "id", autoIncrement: true });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open local ticket storage."));
    request.onblocked = () => reject(new Error("Ticket storage is busy in another tab. Close other trip tabs and try again."));
  }).catch((error) => { ticketDatabasePromise = null; throw error; });
  return ticketDatabasePromise;
}

function ticketTransaction(mode, action) {
  return openTicketDatabase().then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction("tickets", mode);
    const request = action(transaction.objectStore("tickets"));
    let result;
    if (request) {
      request.onsuccess = () => { result = request.result; };
      request.onerror = () => reject(request.error || new Error("Ticket storage request failed."));
    }
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error || new Error("Ticket storage request failed."));
    transaction.onabort = () => reject(transaction.error || new Error("Ticket storage is unavailable."));
  }));
}

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function renderTickets() {
  const panel = byId("essentialsContent");
  panel.innerHTML = `<section class="ticket-vault" aria-labelledby="ticketVaultTitle">
    <div class="ticket-vault-heading"><div><p class="eyebrow">Just for this device</p><h3 id="ticketVaultTitle">Tickets &amp; bookings</h3><p>Keep your travel documents close, even when you’re offline.</p></div><span class="ticket-vault-mark" aria-hidden="true"><svg><use href="#icon-ticket"/></svg></span></div>
    <label class="ticket-upload" for="ticketUpload"><svg aria-hidden="true"><use href="#icon-install"/></svg><strong>Add tickets</strong><span>Choose screenshots, photos, PDFs or other files</span><input id="ticketUpload" type="file" multiple></label>
    <div class="ticket-backup-actions"><button type="button" data-ticket-vault="export">Export backup</button><label for="ticketBackupInput">Import backup<input id="ticketBackupInput" type="file" accept="application/json,.json"></label></div>
    <p class="ticket-backup-note">Backups include the files and notes. They are not encrypted, so keep them private.</p>
    <p class="ticket-privacy"><svg aria-hidden="true"><use href="#icon-check"/></svg>Private to this device · add a name and booking note anytime.</p>
    <label class="ticket-search"><svg aria-hidden="true"><use href="#icon-search"/></svg><span class="sr-only">Search tickets</span><input id="ticketSearch" type="search" placeholder="Search tickets, names, notes…" autocomplete="off"><kbd>/</kbd></label>
    <div class="ticket-list-head"><h4>Your saved tickets</h4><span id="ticketCount">Loading…</span></div>
    <div class="ticket-list" id="ticketList" aria-live="polite"><p class="ticket-loading">Opening this device’s ticket wallet…</p></div>
    <p class="ticket-storage-note">Files stay available offline in this browser. Clearing browser data or changing devices will remove access, so keep your original booking files too.</p>
  </section>`;
  loadTicketList();
}

async function loadTicketList() {
  try {
    ticketRecords = await ticketTransaction("readonly", (store) => store.getAll());
    if (currentDetailsTab !== "tickets") return;
    renderTicketList();
  } catch (error) {
    if (currentDetailsTab !== "tickets") return;
    byId("ticketCount").textContent = "Unavailable";
    byId("ticketList").innerHTML = `<div class="ticket-error"><strong>Local storage isn’t available</strong><p>${escapeHTML(error.message || "Try opening this app in a browser with site storage enabled.")}</p></div>`;
  }
}

function renderTicketList() {
  ticketThumbnailUrls.forEach((url) => URL.revokeObjectURL(url));
  ticketThumbnailUrls = [];
  byId("ticketCount").textContent = `${ticketRecords.length} ${ticketRecords.length === 1 ? "ticket" : "tickets"}`;
  if (!ticketRecords.length) {
    byId("ticketList").innerHTML = `<div class="ticket-empty"><span aria-hidden="true">✳</span><strong>No tickets saved yet</strong><p>Add your train, hotel, attraction or other booking files here. They’ll stay on this device for your trip.</p></div>`;
    return;
  }
  byId("ticketList").innerHTML = ticketRecords.map((ticket) => {
    const isImage = ticket.type?.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|heic)$/i.test(ticket.name);
    const isPDF = ticket.type === "application/pdf" || /\.pdf$/i.test(ticket.name);
    const kind = isImage ? "Image" : isPDF ? "PDF" : "File";
    const displayName = ticket.customName?.trim() || ticket.name;
    const thumbUrl = URL.createObjectURL(ticket.blob);
    ticketThumbnailUrls.push(thumbUrl);
    const thumb = isImage ? `<img src="${thumbUrl}" alt="" loading="lazy">` : isPDF ? `<iframe src="${thumbUrl}#page=1&view=FitH&toolbar=0&navpanes=0" title="First page of ${escapeHTML(displayName)}" tabindex="-1" loading="lazy"></iframe><span class="ticket-pdf-badge">PDF</span>` : `<span class="ticket-file-icon" aria-hidden="true"><svg><use href="#icon-ticket"/></svg><small>${escapeHTML((ticket.name.split(".").pop() || "FILE").slice(0, 5).toUpperCase())}</small></span>`;
    return `<article class="ticket-file" data-ticket-id="${ticket.id}"><div class="ticket-open" role="button" tabindex="0" data-ticket-action="open" data-ticket-id="${ticket.id}" aria-label="Open ${escapeHTML(displayName)}"><span class="ticket-thumb ${isPDF ? "ticket-thumb-pdf" : ""}">${thumb}</span><span class="ticket-file-copy"><strong title="${escapeHTML(displayName)}">${escapeHTML(displayName)}</strong>${ticket.customName?.trim() ? `<span class="ticket-original-name" title="${escapeHTML(ticket.name)}">${escapeHTML(ticket.name)}</span>` : ""}<span>${kind} · ${formatFileSize(ticket.size)}</span>${ticket.customNote?.trim() ? `<span class="ticket-saved-note">${escapeHTML(ticket.customNote)}</span>` : ""}<span class="ticket-open-hint">Open ticket <span aria-hidden="true">↗</span></span></span></div><div class="ticket-file-actions"><button class="ticket-action" type="button" data-ticket-action="edit" data-ticket-id="${ticket.id}">${ticket.customName || ticket.customNote ? "Edit details" : "Add name / note"}</button><button class="ticket-action" type="button" data-ticket-action="download" data-ticket-id="${ticket.id}">Save file</button><button class="ticket-action ticket-delete" type="button" data-ticket-action="delete" data-ticket-id="${ticket.id}" aria-label="Remove ${escapeHTML(displayName)}">×</button></div><div class="ticket-edit" hidden><label>Ticket name<input class="ticket-name-input" type="text" maxlength="80" placeholder="e.g. Return train ticket" value="${escapeHTML(ticket.customName || "")}"></label><label>Personal note <span>(optional)</span><textarea class="ticket-note-input" rows="2" maxlength="240" placeholder="Booking code, travel date, or anything useful">${escapeHTML(ticket.customNote || "")}</textarea></label><div class="ticket-edit-actions"><button class="ticket-action" type="button" data-ticket-action="cancel-edit">Cancel</button><button class="ticket-action ticket-edit-save" type="button" data-ticket-action="save-edit">Save details</button></div></div></article>`;
  }).join("");
  const noResults = document.createElement("div");
  noResults.className = "ticket-empty ticket-no-results";
  noResults.hidden = true;
  noResults.innerHTML = "<strong>No matching tickets</strong><p>Try another name, file type or note.</p>";
  byId("ticketList").append(noResults);
  filterTicketCards();
}

function filterTicketCards() {
  if (!byId("ticketSearch")) return;
  const query = byId("ticketSearch").value.trim().toLocaleLowerCase();
  let visibleCount = 0;
  all(".ticket-file").forEach((card) => {
    const record = ticketRecords.find((ticket) => String(ticket.id) === card.dataset.ticketId);
    const haystack = record ? `${record.name} ${record.customName || ""} ${record.customNote || ""} ${record.type || ""}`.toLocaleLowerCase() : "";
    card.hidden = !haystack.includes(query);
    if (!card.hidden) visibleCount += 1;
  });
  const noResults = byId("ticketList").querySelector(".ticket-no-results");
  if (noResults) noResults.hidden = visibleCount > 0 || !query;
  if (query) byId("ticketCount").textContent = `${visibleCount} of ${ticketRecords.length}`;
  else byId("ticketCount").textContent = `${ticketRecords.length} ${ticketRecords.length === 1 ? "ticket" : "tickets"}`;
}

async function openTicket(id) {
  try {
    const ticket = await ticketTransaction("readonly", (store) => store.get(Number(id)));
    if (!ticket) throw new Error("This file is no longer in your ticket wallet.");
    const url = URL.createObjectURL(ticket.blob);
    const body = byId("ticketViewerBody");
    byId("ticketViewerTitle").textContent = ticket.customName?.trim() || ticket.name;
    body.replaceChildren();
    if (ticket.type?.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|heic)$/i.test(ticket.name)) {
      const image = document.createElement("img");
      image.src = url;
      image.alt = ticket.name;
      body.append(image);
    } else if (ticket.type === "application/pdf" || /\.pdf$/i.test(ticket.name)) {
      const frame = document.createElement("iframe");
      frame.src = url;
      frame.title = `PDF document ${ticket.name}`;
      body.append(frame);
    } else if (ticket.type?.startsWith("video/") || ticket.type?.startsWith("audio/")) {
      const media = document.createElement(ticket.type.startsWith("video/") ? "video" : "audio");
      media.src = url;
      media.controls = true;
      body.append(media);
    } else {
      URL.revokeObjectURL(url);
      const message = document.createElement("div");
      message.className = "ticket-open-fallback";
      message.innerHTML = `<strong>This file opens in its own app</strong><p>${escapeHTML(ticket.name)}</p>`;
      const download = document.createElement("button");
      download.className = "ticket-action ticket-edit-save";
      download.type = "button";
      download.textContent = "Save file to this device";
      download.addEventListener("click", () => downloadTicket(ticket));
      message.append(download);
      body.append(message);
    }
    const dialog = byId("ticketViewer");
    dialog.dataset.objectUrl = url;
    dialog.showModal();
  } catch (error) { showToast(error.message || "Could not open this file"); }
}

function downloadTicket(ticket) {
  const url = URL.createObjectURL(ticket.blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = ticket.name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("Could not read a ticket file."));
    reader.readAsDataURL(blob);
  });
}

function blobFromDataUrl(dataUrl, type) {
  const marker = ";base64,";
  const splitAt = dataUrl.indexOf(marker);
  if (splitAt < 0) throw new Error("This backup contains an unreadable ticket file.");
  const binary = atob(dataUrl.slice(splitAt + marker.length));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: type || "application/octet-stream" });
}

async function exportTicketBackup() {
  const tickets = await ticketTransaction("readonly", (store) => store.getAll());
  const backupTickets = [];
  for (const ticket of tickets) {
    backupTickets.push({
      name: ticket.name, type: ticket.type, size: ticket.size, addedAt: ticket.addedAt,
      customName: ticket.customName || "", customNote: ticket.customNote || "",
      data: await readBlobAsDataUrl(ticket.blob)
    });
  }
  const backup = new Blob([JSON.stringify({ format: "uttarakhand-ticket-backup", version: 1, exportedAt: new Date().toISOString(), tickets: backupTickets })], { type: "application/json" });
  const url = URL.createObjectURL(backup);
  const link = document.createElement("a");
  link.href = url;
  link.download = `uttarakhand-tickets-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast(`${tickets.length} ${tickets.length === 1 ? "ticket" : "tickets"} exported`);
}

async function importTicketBackup(file) {
  if (!file) return;
  if (file.size > 100 * 1024 * 1024) throw new Error("This backup is over 100 MB. Import a smaller backup file.");
  const backup = JSON.parse(await file.text());
  if (backup.format !== "uttarakhand-ticket-backup" || backup.version !== 1 || !Array.isArray(backup.tickets)) {
    throw new Error("This file isn’t a supported ticket backup.");
  }
  const existing = await ticketTransaction("readonly", (store) => store.getAll());
  const fingerprints = new Set(existing.map((ticket) => `${ticket.name}|${ticket.size}|${ticket.customName || ""}`));
  const additions = [];
  for (const entry of backup.tickets) {
    if (typeof entry.name !== "string" || typeof entry.data !== "string" || entry.name.length > 255) continue;
    const fingerprint = `${entry.name}|${Number(entry.size) || 0}|${entry.customName || ""}`;
    if (fingerprints.has(fingerprint)) continue;
    const blob = blobFromDataUrl(entry.data, entry.type);
    additions.push({ name: entry.name, type: entry.type || blob.type, size: blob.size, addedAt: Number(entry.addedAt) || Date.now(), customName: String(entry.customName || "").slice(0, 80), customNote: String(entry.customNote || "").slice(0, 240), blob });
    fingerprints.add(fingerprint);
  }
  await ticketTransaction("readwrite", (store) => {
    for (const ticket of additions) store.add(ticket);
  });
  showToast(additions.length ? `${additions.length} ${additions.length === 1 ? "ticket" : "tickets"} imported` : "No new tickets in that backup");
  loadTicketList();
}

const ticketPanel = byId("essentialsContent");
ticketPanel.addEventListener("change", async (event) => {
  if (event.target.id === "ticketBackupInput" && event.target.files?.length) {
    const [file] = event.target.files;
    event.target.value = "";
    try { await importTicketBackup(file); }
    catch (error) { showToast(error.message || "Could not import this backup"); }
    return;
  }
  if (event.target.id !== "ticketUpload" || !event.target.files?.length) return;
  const files = [...event.target.files];
  event.target.value = "";
  let savedCount = 0;
  try {
    for (const file of files) {
      await ticketTransaction("readwrite", (store) => store.add({ name: file.name, type: file.type || "application/octet-stream", size: file.size, addedAt: Date.now(), blob: file }));
      savedCount += 1;
    }
    showToast(`${savedCount} ${savedCount === 1 ? "file" : "files"} saved on this device`);
    loadTicketList();
  } catch (error) {
    const reason = error.name === "QuotaExceededError" ? "This device is out of storage space" : error.message || "Could not save these files";
    showToast(savedCount ? `Saved ${savedCount} of ${files.length}; ${reason.toLowerCase()}` : reason);
    loadTicketList();
  }
});

ticketPanel.addEventListener("click", async (event) => {
  const vaultAction = event.target.closest("[data-ticket-vault]");
  if (vaultAction?.dataset.ticketVault === "export") {
    try { await exportTicketBackup(); }
    catch (error) { showToast(error.message || "Could not export tickets"); }
    return;
  }
  const button = event.target.closest("[data-ticket-action]");
  if (!button) return;
  const card = button.closest(".ticket-file");
  const action = button.dataset.ticketAction;
  const id = button.dataset.ticketId || card?.dataset.ticketId;
  if (action === "edit") {
    card.querySelector(".ticket-edit").hidden = false;
    card.querySelector(".ticket-name-input").focus();
    return;
  }
  if (action === "cancel-edit") { card.querySelector(".ticket-edit").hidden = true; return; }
  if (!/^\d+$/.test(String(id))) { showToast("Could not identify this ticket. Refresh the Details tab and try again."); return; }
  if (action === "open") return openTicket(id);
  try {
    const ticket = await ticketTransaction("readonly", (store) => store.get(Number(id)));
    if (!ticket) throw new Error("This file is no longer in your ticket wallet.");
    if (action === "save-edit") {
      ticket.customName = card.querySelector(".ticket-name-input").value.trim();
      ticket.customNote = card.querySelector(".ticket-note-input").value.trim();
      await ticketTransaction("readwrite", (store) => store.put(ticket));
      showToast("Ticket details saved on this device");
      loadTicketList();
      return;
    }
    if (action === "download") {
      downloadTicket(ticket);
    }
    if (action === "delete") {
      if (!window.confirm(`Remove “${ticket.name}” from this device?`)) return;
      await ticketTransaction("readwrite", (store) => store.delete(Number(id)));
      showToast("Ticket removed from this device");
      loadTicketList();
    }
  } catch (error) { showToast(error.message || "Could not complete that action"); }
});

byId("closeTicketViewer").addEventListener("click", () => byId("ticketViewer").close());
byId("ticketViewer").addEventListener("close", (event) => {
  const dialog = event.currentTarget;
  if (dialog.dataset.objectUrl) URL.revokeObjectURL(dialog.dataset.objectUrl);
  delete dialog.dataset.objectUrl;
  byId("ticketViewerBody").replaceChildren();
});

ticketPanel.addEventListener("input", (event) => {
  if (event.target.id === "ticketSearch") filterTicketCards();
});

ticketPanel.addEventListener("keydown", (event) => {
  const openTarget = event.target.closest(".ticket-open");
  if (openTarget && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openTicket(openTarget.dataset.ticketId);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "/" || currentDetailsTab !== "tickets" || event.target.matches("input,textarea,[contenteditable='true']")) return;
  event.preventDefault();
  byId("ticketSearch")?.focus();
});

function showToast(message) {
  const toast = byId("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2300);
}

document.querySelector(".bottom-nav").addEventListener("click", (event) => {
  const button = event.target.closest("[data-tab]");
  if (button) switchTab(button.dataset.tab);
});

document.querySelector(".bottom-nav").addEventListener("keydown", (event) => {
  const current = event.target.closest(".nav-item[data-tab]");
  if (!current) return;
  const tabs = all(".nav-item[data-tab]");
  const currentIndex = tabs.indexOf(current);
  let nextIndex = currentIndex;
  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
  else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  else if (event.key === "Home") nextIndex = 0;
  else if (event.key === "End") nextIndex = tabs.length - 1;
  else return;
  event.preventDefault();
  tabs[nextIndex].focus();
  switchTab(tabs[nextIndex].dataset.tab);
});

byId("destinationGallery").addEventListener("click", (event) => {
  const card = event.target.closest("[data-destination-day]");
  if (card) selectDay(Number(card.dataset.destinationDay), true);
});

all(".trip-mark[data-tab], .joy-button[data-tab]").forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});

byId("dayRail").addEventListener("click", (event) => {
  const button = event.target.closest("[data-day]");
  if (button) {
    selectDay(Number(button.dataset.day));
    byId(`dayTab${days[selectedDayIndex].number}`).focus({ preventScroll: true });
  }
});

byId("dayRail").addEventListener("keydown", (event) => {
  const current = event.target.closest(".day-chip[data-day]");
  if (!current) return;
  const currentIndex = Number(current.dataset.day);
  let nextIndex = currentIndex;
  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % days.length;
  else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + days.length) % days.length;
  else if (event.key === "Home") nextIndex = 0;
  else if (event.key === "End") nextIndex = days.length - 1;
  else return;
  event.preventDefault();
  selectDay(nextIndex);
  byId(`dayTab${days[nextIndex].number}`).focus();
});

document.querySelector(".day-card-info").addEventListener("click", (event) => {
  const choiceButton = event.target.closest("[data-choice]");
  if (!choiceButton) return;
  selectedDayChoice = choiceButton.dataset.choice;
  writePreference("uttarakhand-day-3-choice", selectedDayChoice);
  renderDay();
  all("[data-choice]").find((button) => button.dataset.choice === selectedDayChoice)?.focus({ preventScroll: true });
  showToast(`Day 3 choice saved: ${selectedDayChoice === "Buddhist Temple" ? "Shedup Choephelling" : selectedDayChoice}`);
});

byId("timeline").addEventListener("click", async (event) => {
  const completeButton = event.target.closest("[data-complete-stop]");
  if (completeButton) {
    const dayNumber = days[selectedDayIndex].number;
    const stopIndex = Number(completeButton.dataset.completeStop);
    const completed = new Set(completedStops[dayNumber] || []);
    const isNowDone = !completed.has(stopIndex);
    if (isNowDone) completed.add(stopIndex); else completed.delete(stopIndex);
    completedStops[dayNumber] = [...completed].sort((a, b) => a - b);
    writePreference("uttarakhand-completed-stops", completedStops);
    expandedChapterKey = completeButton.closest(".timeline-chapter").dataset.chapter;
    expandedStopIndex = stopIndex;
    renderTimeline();
    showToast(isNowDone ? "Stop marked done" : "Stop marked not done");
    return;
  }

  const shareButton = event.target.closest("[data-share-stop]");
  if (shareButton) {
    const stop = days[selectedDayIndex].timeline[Number(shareButton.dataset.shareStop)];
    const day = days[selectedDayIndex];
    const mapUrl = mapActionFor(day, stop, Number(shareButton.dataset.shareStop)).href;
    const shareText = [`${stop.title} · ${stop.displayTime || stop.time}`, `Day ${day.number} · ${day.date} · ${day.place}`, stop.fromHotel && `From hotel: ${stop.fromHotel}`, stop.detail, stop.note, stop.distance && `Distance: ${stop.distance}`, stop.mode && `Getting there: ${stop.mode}`, stop.fare && `Cost: ${stop.fare}`].filter(Boolean).join("\n");
    const copyText = [shareText, mapUrl && `Map: ${mapUrl}`].filter(Boolean).join("\n");
    try {
      if (navigator.share) await navigator.share({ title: stop.title, text: shareText, ...(mapUrl ? { url: mapUrl } : {}) });
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(copyText); showToast("Stop details copied to clipboard"); }
      else throw new Error("Clipboard unavailable");
    } catch (error) {
      if (error.name !== "AbortError") {
        const field = document.createElement("textarea");
        field.value = copyText;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.append(field);
        field.select();
        field.setSelectionRange(0, field.value.length);
        const copied = document.execCommand("copy");
        field.remove();
        showToast(copied ? "Stop details copied to clipboard" : "Sharing is unavailable on this device");
      }
    }
    return;
  }

  const chapterButton = event.target.closest(".chapter-toggle");
  if (chapterButton) {
    const chapter = chapterButton.closest(".timeline-chapter");
    const items = chapter.querySelector(".chapter-items");
    const expanded = chapterButton.getAttribute("aria-expanded") !== "true";
    if (expanded) {
      all(".timeline-chapter.expanded").forEach((other) => {
        if (other === chapter) return;
        other.classList.remove("expanded");
        other.querySelector(".chapter-toggle").setAttribute("aria-expanded", "false");
        other.querySelectorAll(".timeline-item.expanded").forEach((stop) => {
          stop.classList.remove("expanded");
          stop.querySelector(".timeline-summary").setAttribute("aria-expanded", "false");
          setDisclosureVisible(stop.querySelector(".timeline-detail"), false);
        });
        setDisclosureVisible(other.querySelector(".chapter-items"), false);
      });
      expandedChapterKey = chapter.dataset.chapter;
      expandedStopIndex = null;
    } else {
      expandedChapterKey = null;
      expandedStopIndex = null;
    }
    chapterButton.setAttribute("aria-expanded", String(expanded));
    chapter.classList.toggle("expanded", expanded);
    if (!expanded) {
      chapter.querySelectorAll(".timeline-item.expanded").forEach((stop) => {
        stop.classList.remove("expanded");
        stop.querySelector(".timeline-summary").setAttribute("aria-expanded", "false");
        setDisclosureVisible(stop.querySelector(".timeline-detail"), false);
      });
    }
    setDisclosureVisible(items, expanded);
    return;
  }

  const summary = event.target.closest(".timeline-summary");
  if (!summary) return;
  const item = summary.closest(".timeline-item");
  const detail = item.querySelector(".timeline-detail");
  const expanded = summary.getAttribute("aria-expanded") !== "true";
  if (expanded) {
    item.parentElement.querySelectorAll(".timeline-item.expanded").forEach((other) => {
      if (other === item) return;
      other.classList.remove("expanded");
      other.querySelector(".timeline-summary").setAttribute("aria-expanded", "false");
      setDisclosureVisible(other.querySelector(".timeline-detail"), false);
    });
    expandedChapterKey = item.closest(".timeline-chapter").dataset.chapter;
    expandedStopIndex = Number(item.dataset.item);
  } else {
    expandedStopIndex = null;
  }
  summary.setAttribute("aria-expanded", String(expanded));
  item.classList.toggle("expanded", expanded);
  setDisclosureVisible(detail, expanded);
});

byId("resetProgress").addEventListener("click", () => {
  const dayNumber = days[selectedDayIndex].number;
  delete completedStops[dayNumber];
  writePreference("uttarakhand-completed-stops", completedStops);
  renderTimeline();
  showToast(`Day ${dayNumber} progress reset`);
});

byId("nowStrip").addEventListener("click", (event) => {
  const button = event.target.closest("[data-now-next]");
  if (!button) return;
  const target = byId("timeline")?.querySelector(`.timeline-item[data-item="${button.dataset.nowNext}"]`);
  if (!target) return;
  const chapter = target.closest(".timeline-chapter");
  if (chapter?.querySelector(".chapter-items")?.hidden) chapter.querySelector(".chapter-toggle")?.click();
  target.querySelector(".timeline-summary")?.click();
  target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" });
});

window.setInterval(updateNowStrip, 30000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) updateNowStrip(); });

byId("saveDayOffline").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  if (!navigator.onLine) { showToast("Connect to the internet first to save this day’s photos"); return; }
  if (!("serviceWorker" in navigator)) { showToast("Offline photo saving is unavailable in this browser"); return; }
  const day = days[selectedDayIndex];
  const urls = getDayPhotoUrls(day);
  button.disabled = true;
  button.textContent = "Saving photos…";
  try {
    const registration = await navigator.serviceWorker.ready;
    const worker = registration.active || navigator.serviceWorker.controller;
    if (!worker) throw new Error("Offline storage is not ready yet");
    const channel = new MessageChannel();
    const result = await new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("Photo saving took too long")), 30000);
      channel.port1.onmessage = (message) => { window.clearTimeout(timeout); resolve(message.data); };
      worker.postMessage({ type: "SAVE_DAY_PHOTOS", urls }, [channel.port2]);
    });
    offlineDayPhotos[day.number] = result.savedUrls || [];
    writePreference("uttarakhand-offline-day-photos", offlineDayPhotos);
    updateOfflineSaveButton(day);
    showToast(result.saved === result.total
      ? `Day ${day.number} photos saved for offline`
      : `${result.saved} of ${result.total} photos saved; the rest may need signal`);
  } catch {
    showToast("Couldn’t save photos yet. Try again after the app is installed or reloaded online.");
  } finally {
    button.disabled = false;
    updateOfflineSaveButton(days[selectedDayIndex]);
    verifyOfflinePhotos(days[selectedDayIndex]);
  }
});

byId("priorityGrid").addEventListener("click", (event) => {
  const card = event.target.closest("[data-priority-day]");
  if (card) selectDay(Number(card.dataset.priorityDay), true);
});

all("[data-open-day]").forEach((button) => {
  button.addEventListener("click", () => selectDay(Number(button.dataset.openDay), true));
});

document.querySelector(".detail-tabs").addEventListener("click", (event) => {
  const button = event.target.closest("[data-detail]");
  if (button) renderDetails(button.dataset.detail);
});

document.querySelector(".detail-tabs").addEventListener("keydown", (event) => {
  const current = event.target.closest(".detail-tab[data-detail]");
  if (!current) return;
  const tabs = all(".detail-tab[data-detail]");
  const currentIndex = tabs.indexOf(current);
  let nextIndex = currentIndex;
  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
  else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  else if (event.key === "Home") nextIndex = 0;
  else if (event.key === "End") nextIndex = tabs.length - 1;
  else return;
  event.preventDefault();
  tabs[nextIndex].focus();
  renderDetails(tabs[nextIndex].dataset.detail);
});

let touchStartX = 0;
let touchStartY = 0;
const dayCover = document.querySelector(".day-cover");
dayCover.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
  touchStartY = event.changedTouches[0].clientY;
}, { passive: true });
dayCover.addEventListener("touchend", (event) => {
  if (event.target.closest("button, a")) return;
  const deltaX = event.changedTouches[0].clientX - touchStartX;
  const deltaY = event.changedTouches[0].clientY - touchStartY;
  if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
    selectDay(selectedDayIndex + (deltaX < 0 ? 1 : -1));
  }
}, { passive: true });

renderDestinationGallery();
renderDay();
renderPriorityCards();
renderDetails(currentDetailsTab);
