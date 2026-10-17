const days = [
  {
    number: 1,
    place: "Haridwar",
    dateISO: "2026-10-18",
    date: "18 October 2026",
    status: "Arrival day",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Evening_aarti_at_Har-ki-pauri%2C_Haridwar.JPG/1920px-Evening_aarti_at_Har-ki-pauri%2C_Haridwar.JPG",
    imageSource: "https://commons.wikimedia.org/wiki/File:Evening_aarti_at_Har-ki-pauri,_Haridwar.JPG",
    imageCredit: "Photo · Wikimedia Commons",
    imagePlace: "Har Ki Pauri · Ganga Aarti",
    dek: "Temple ropeways, the river and an unhurried evening at Har Ki Pauri.",
    hero: "Har Ki Pauri at blue hour",
    priority: "Secure a Ganga Aarti viewing spot before the evening crowds arrive.",
    hotel: "Hotel Aryaman · Shiv Murti Gali, Jassaram Road, Opp. Bannu Biradari, Sharvan Nath Nagar, Haridwar 249401",
    route: "Haridwar Station → Hotel Aryaman → Mansa Devi → Chandi Devi → Har Ki Pauri → Moti Bazar → Hotel",
    transport: "Short e-rickshaw / auto legs · ₹20–₹150 per vehicle as listed",
    costs: "Ropeway ₹460/person · child ₹235",
    footer: "The ₹460 combined ropeway price is the current Udan Khatola planning figure. Confirm prices and operating conditions at the counter or official booking page before travel.",
    timeline: [
      { time: "08:30–08:50", title: "Arrive at Haridwar Railway Station", detail: "Arrival window." },
      { time: "08:50–09:10", title: "Station → Hotel Aryaman", type: "transport", distance: "~0.5–1 km", mode: "E-rickshaw / auto", fare: "₹20–₹50 per vehicle" },
      { time: "09:10–09:40", title: "Luggage drop + freshen up", detail: "Settle in before the first temple transfer." },
      { time: "09:40–10:00", title: "Hotel → Mansa Devi Ropeway Area", type: "transport", distance: "~1.5–2 km", mode: "E-rickshaw / auto", fare: "₹30–₹80 per vehicle" },
      { time: "10:00–12:15", title: "Mansa Devi Temple", detail: "Combined Mansa + Chandi Devi ropeway: ₹460/person, child ₹235 (current Udan Khatola listed fare; includes GST). Temple visit itself has no separate entry fee expected. Optional operator transport bus listed at ₹95/person.", note: "Keep the combined ropeway ticket; the bus is a separate listed charge." },
      { time: "12:15–12:30", title: "Mansa Devi → Chandi Devi transfer", type: "transport", mode: "Operator's linked transport / bus if available; otherwise local vehicle", fare: "₹95/person listed bus; local auto roughly ₹80–₹150 per vehicle", note: "The ₹460 ticket covers the ropeway journey, not the ₹95 bus." },
      { time: "12:30–14:15", title: "Chandi Devi Temple", detail: "Temple visit: no separate entry fee expected. Ropeway is already covered by the combined ticket." },
      { time: "14:15–14:45", title: "Chandi Devi → Har Ki Pauri", type: "transport", distance: "~3–4 km", mode: "Auto / e-rickshaw", fare: "₹80–₹150 per vehicle" },
      { time: "14:45–15:30", title: "Lunch + rest near Har Ki Pauri", detail: "Estimated food: ₹150–₹300/person depending on restaurant." },
      { time: "15:30–16:30", title: "Har Ki Pauri + Ganga Snan", detail: "Entry and bathing are free.", note: "Use a designated safe bathing area and keep belongings secure." },
      { time: "16:30–17:15", title: "Relax + secure Aarti viewing position", detail: "Free. Use this buffer to get a comfortable riverside spot." },
      { time: "17:15–18:15", title: "Ganga Aarti", detail: "Free entry.", note: "Exact start time can vary; confirm locally on the day." },
      { time: "18:15–18:30", title: "Har Ki Pauri → Moti Bazar", type: "transport", distance: "~0.5–1 km", mode: "Walk", fare: "₹0" },
      { time: "18:30–19:30", title: "Moti Bazar", detail: "Free to explore. Shopping and snacks are optional and paid separately." },
      { time: "19:30–20:00", title: "Moti Bazar → Hotel Aryaman", type: "transport", distance: "~1–1.5 km", mode: "Walk or e-rickshaw / auto", fare: "₹0 walking / ₹20–₹50 per vehicle" },
      { time: "20:00 onward", title: "Dinner + wind down", detail: "Hotel, dinner and prepare for Rishikesh." }
    ]
  },
  {
    number: 2,
    place: "Rishikesh",
    dateISO: "2026-10-19",
    date: "19 October 2026",
    status: "Waterfall to Ganga Aarti",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Neer_Garh_Waterfall.jpg/1920px-Neer_Garh_Waterfall.jpg",
    imageSource: "https://commons.wikimedia.org/wiki/File:Neer_Garh_Waterfall.jpg",
    imageCredit: "Photo · Wikimedia Commons",
    imagePlace: "Neer Garh Waterfall · Rishikesh",
    dek: "A waterfall morning, Tapovan brunch and a long afternoon that ends with lamps on the Ganga.",
    hero: "Neer Garh to the evening Aarti",
    priority: "Check the Beatles Ashram and river crossings before leaving; both affect the afternoon route.",
    hotel: "Hotel Shree Hari · 14 Biggah, Bandha Road, near Kusum Bharti School, Chauda Bigha, Rishikesh 249137",
    route: "Hotel Shree Hari → Neer Garh → Tapovan → river crossing (confirm open bridge) → Beatles Ashram / Gita Bhawan → Parmarth Niketan → hotel",
    transport: "Full-day cab ~₹2,400 sedan / ₹3,100 SUV per vehicle; local autos are cheaper but require several legs",
    costs: "Plan ~₹780–₹1,380/person for entry + meals; transport extra",
    footer: "Route alert for Mon 19 Oct: Ram Jhula is reported closed until December 2026, and Beatles Ashram is listed as closed Mondays (recent local reports also describe a temporary closure). Keep both conditional: verify access that morning, use only an officially open alternate crossing, and swap the Ashram for extra Gita Bhawan / riverside time if shut. Parmarth Aarti follows sunset, so confirm the actual start time and shift the 5–6 PM block if needed. Sources: <a href=\"https://www.hindustantimes.com/india-news/40year-old-ram-jhula-bridge-closed-for-commuting-till-december-officials-101785069624385-amp.html\" target=\"_blank\" rel=\"noopener noreferrer\">Ram Jhula closure update</a> · <a href=\"https://www.visitrishikesh.com/beatles-ashram\" target=\"_blank\" rel=\"noopener noreferrer\">Beatles Ashram visitor info</a> · <a href=\"https://parmarth.org/divine-ganga-aarti-yagna/\" target=\"_blank\" rel=\"noopener noreferrer\">Parmarth Aarti</a>.",
    timeline: [
      { time: "08:00–10:15", displayTime: "8:00–10:15", title: "Neer Garh Waterfall", fromHotel: "~8–10 km by road from Hotel Shree Hari; about 25–40 min by vehicle (route/traffic dependent)", distance: "First pool is a short uphill walk; further cascades add distance and steps", mode: "Pre-booked cab or local auto; agree pickup/return before setting off", fare: "~₹30/person entry; local vehicle quoted separately", detail: "Allow 15–20 minutes uphill to reach the first pool. Go early for fewer people. The rocks and steps can be slippery; wear grippy shoes and avoid unsafe water." },
      { time: "10:15–10:45", displayTime: "10:15–10:45", title: "Drive to Tapovan", type: "transport", distance: "~5–7 km from the waterfall trail gate to Tapovan (approx.)", mode: "Cab / auto; ask the driver to wait or return at a fixed time", fare: "Short private ride often ~₹150–₹300; agree before departure" },
      { time: "10:45–12:00", displayTime: "10:45–12:00", title: "Tapovan Cafe / Brunch", detail: "Riverside brunch; Little Buddha Cafe or The Sitting Elephant are options. Budget ~₹300–₹500/person; Little Buddha averages roughly ₹700 for two, depending on order." },
      { time: "12:00–12:45", displayTime: "12:00–12:45", title: "Trayambkeshwar Mandir (Tera Manzil)", distance: "In Tapovan, close to the café area", mode: "Walk; short local ride if needed", fare: "No standard entry ticket; donations optional", detail: "The distinctive multi-storey Shiva temple is a peaceful stop. Follow temple etiquette and any current access restrictions." },
      { time: "12:45–13:15", displayTime: "12:45–1:15", title: "Cross to East Bank", type: "transport", distance: "Bridge and approach distance depend on which crossing is open", mode: "Walk only across a bridge confirmed open that day; auto/e-rickshaw can take you to an alternate approach", fare: "Walking is free; local ride roughly ₹50–₹150 per vehicle", note: "Do not rely on Ram Jhula for this crossing: it is reported closed for repairs through December 2026. Confirm Bajrang Setu/Janki Setu access locally before routing; never cross a closed bridge." },
      { time: "13:15–14:00", displayTime: "1:15–2:00", title: "Beatles Ashram (Chaurasi Kutiya)", distance: "East-bank access; exact route depends on open bridge", mode: "Walk / auto to the open entrance approach", fare: "Listed at ~₹150 Indian / ₹600 foreign visitor; verify current counter", detail: "Explore the shaded Chaurasi Kutiya grounds and murals. This 45-minute slot is tight, so focus on the main paths.", note: "19 October 2026 is a Monday, when visitor listings show it closed; recent reports also describe a temporary closure. Treat this stop as conditional and replace it with Gita Bhawan / riverside time unless access is confirmed." },
      { time: "14:00–15:30", displayTime: "2:00–3:30", title: "Ram Jhula, Gita Bhawan & Local Markets", distance: "Local walk once on the correct bank; bridge access is currently the uncertain part", mode: "Walk; use an officially open alternate bridge only if crossing is necessary", fare: "Gita Bhawan free; snacks / kulfi typically ₹50–₹200/person", detail: "Explore Gita Bhawan, nearby lanes and local markets; pause for snacks or kulfi. Ram Jhula can be viewed from a safe public viewpoint if still closed—do not attempt to use it as a crossing.", note: "Ram Jhula is reported closed to pedestrians until an expected December 2026 repair completion; verify on the day." },
      { time: "15:30–16:30", displayTime: "3:30–4:30", title: "Ganga Riverside / Sand Beach (peaceful spot)", distance: "Choose a safe public ghat or riverbank on your current side", mode: "Walk from the nearby market/ashram area", fare: "Free", detail: "Slow down by the water, sit and enjoy a quiet hour. Rafting-point viewing is optional; do not enter the river at unapproved or fast-flowing stretches." },
      { time: "16:30–17:00", displayTime: "4:30–5:00", title: "Secure seats at Parmarth Niketan", distance: "Walk from the East Bank riverfront if the crossing route is open", mode: "Arrive early; follow staff directions", fare: "Free; donations optional", detail: "Choose a comfortable place for the evening ceremony. If coming from the other bank, confirm a usable crossing and allow extra time." },
      { time: "17:00–18:00", displayTime: "5:00–6:00", title: "Parmarth Niketan Aarti", distance: "Parmarth Niketan ghat, Swarg Ashram", mode: "On foot", fare: "Free; donations welcome", detail: "A peaceful Ganga Aarti with live bhajans. The ceremony follows sunset and the exact start shifts seasonally; confirm with Parmarth/reception and adjust this block on the day." },
      { time: "18:00–20:00", displayTime: "6:00–8:00", title: "Walk via Ram Jhula + Dinner", distance: "Return route depends on which pedestrian bridge is confirmed open", mode: "Walk only on an open bridge; otherwise use an auto/cab via the operating road crossing", fare: "Dinner ~₹250–₹500/person; alternate-side ride ~₹150–₹400 per vehicle", detail: "Enjoy the illuminated riverfront and dinner near the parking side. Keep Ram Jhula as a view/photo stop only if it remains closed; follow the open route back rather than approaching barriers." },
      { time: "20:00 onward", displayTime: "8:00+", title: "Return to Hotel Shree Hari", type: "transport", fromHotel: "Hotel Shree Hari is the start/end base in Chauda Bigha; evening road distance varies with the open bridge/road route", distance: "Roughly 3–6 km by the usable route (confirm in Maps)", mode: "Auto / cab is simplest after dinner; walk only if the route and crossing are open", fare: "~₹100–₹300 per vehicle for a short local ride (estimate)", detail: "Head back to the hotel and rest before the Mussoorie transfer." }
    ]
  },
  {
    number: 3,
    place: "Mussoorie",
    dateISO: "2026-10-20",
    date: "20 October 2026",
    status: "Western circuit",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Kempty_Falls%2C_May_2024.jpg/1920px-Kempty_Falls%2C_May_2024.jpg",
    imageSource: "https://commons.wikimedia.org/wiki/File:Kempty_Falls,_May_2024.jpg",
    imageCredit: "Photo · Wikimedia Commons",
    imagePlace: "Kempty Falls · Mussoorie",
    dek: "Waterfall mist, a quiet temple and a choose-your-own mountain afternoon before Cloud's End.",
    hero: "Kempty Falls & the western circuit",
    priority: "Choose George Everest or the Buddhist Temple—never both. Cloud's End is the first stop to cut if you are running late.",
    hotel: "Hotel Classic Crown · Kempty Fall Road, near JW Marriott, Mussoorie",
    route: "Hotel → Kempty Falls → Santura Devi → George Everest OR Buddhist Temple → Company Garden → Cloud's End → Hotel",
    transport: "One full-day private sightseeing cab is best · planning range ₹2,500–₹4,000",
    costs: "Kempty / Company Garden / optional add-ons vary",
    choice: { selected: "George Everest", options: ["George Everest", "Buddhist Temple"] },
    footer: "The hotel is already on Kempty Fall Road, so this is deliberately the western-side day. Do not add Landour or Lal Tibba today; they belong to Day 4. Confirm all variable attraction fees at the counter.",
    timeline: [
      { time: "07:00–07:30", title: "Breakfast + get ready", detail: "Leave on time. The early Kempty start is intentional: current guides recommend morning to reduce crowds and published opening times differ." },
      { time: "07:30–07:55", title: "Hotel → Kempty Falls", type: "transport", distance: "~6–7 km · ~15–25 min", mode: "Private sightseeing cab", fare: "Ideally included in the full-day cab; separately ~₹300–₹600 one way", note: "One cab is much more practical than arranging autos for several western-side stops." },
      { time: "07:55–09:45", title: "Kempty Falls", detail: "Allow ~1 hr 45 min. Walk down to the waterfall/pool area; ropeway is optional. The upper viewpoint still works for anyone avoiding stairs/ropeway. Planning reference: ~₹25 entry and ~₹50–₹80 return ropeway in some current listings; sources differ.", note: "Keep phones and valuables secure near water. Published timings conflict (6 AM–6 PM vs around 8 AM–7 PM), so the early arrival is the safe option." },
      { time: "09:45–10:00", title: "Kempty Falls → Santura Devi Temple", type: "transport", distance: "~4–5 km · ~10–15 min", mode: "Same private cab", fare: "₹0 extra with same cab" },
      { time: "10:00–10:45", title: "Santura Devi Temple", detail: "A short, peaceful stop. No standard tourist entry fee; donation optional.", note: "Expect a short uphill walk from the road and follow temple etiquette." },
      { time: "10:45–11:25", title: "Santura → midday choice", type: "transport", mode: "Same private cab", fare: "Included with same cab", note: "Choose one option only based on weather, family mood and road conditions." },
      { time: "11:25–13:15", title: "George Everest OR Buddhist Temple", detail: "George Everest: big ridge/valley views and heritage; ~25–40 min travel, ~1.5–2 hr visit, Incredible India lists 9 AM–6 PM; small paid entry may apply. Buddhist Temple, Happy Valley: Tibetan architecture, prayer wheels and a slower pace; ~30–45 min travel, ~1–1.5 hr visit; generally free with voluntary donation.", note: "Do not force the full George Everest peak hike. Do not try both stops." },
      { time: "13:15–13:45", title: "Lunch / quick meal", detail: "Near the chosen stop or on the way to Company Garden. Normal meal budget ~₹150–₹300/person; cafés can be higher." },
      { time: "13:45–14:15", title: "Midday stop → Company Garden", type: "transport", distance: "~20–35 min depending on choice and traffic", mode: "Same private cab", fare: "₹0 extra with same cab" },
      { time: "14:15–15:45", title: "Company Garden / Company Bagh", detail: "Allow ~1.5 hr for flower areas, artificial waterfall and family walking. Planning references: adult ~₹50, child ~₹20–₹30, paddle boat ~₹75/boat; wax museum/rides extra. Do not feel obliged to pay for every add-on.", note: "Finish before late afternoon: current sources disagree on closing time, with some saying ticket counter closes around 5:30 PM." },
      { time: "15:45–16:10", title: "Company Garden → Cloud's End", type: "transport", distance: "~15–30 min", mode: "Same private cab", fare: "₹0 extra with same cab" },
      { time: "16:10–17:10", title: "Cloud's End", detail: "Allow ~1 hr at this final western-side nature stop. General viewpoint/forest area is commonly described as free. Cloud End Forest Resort's managed museum/photo gallery/viewpoint package is listed at ₹200 adult / ₹100 child.", note: "Priority rule: this is the first stop to shorten or skip if behind schedule—never sacrifice Kempty, Santura, the choice stop or Company Garden." },
      { time: "17:10–17:40", title: "Cloud's End → Hotel Classic Crown", type: "transport", distance: "~20–30 min", mode: "Same private cab", fare: "₹0 if cab includes return" },
      { time: "17:40 onward", title: "Dinner + rest", detail: "Do not add Mall Road tonight. Day 4 is specifically for Landour, Gun Hill and Mall Road / Kulri." }
    ]
  },
  {
    number: 4,
    place: "Mussoorie",
    dateISO: "2026-10-21",
    date: "21 October 2026",
    status: "Landour day",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Mussoorie_Bazaar_from_Landour_%285275310799%29.jpg/1920px-Mussoorie_Bazaar_from_Landour_%285275310799%29.jpg",
    imageSource: "https://commons.wikimedia.org/wiki/File:Mussoorie_Bazaar_from_Landour_(5275310799).jpg",
    imageCredit: "Photo · Wikimedia Commons",
    imagePlace: "Landour · Mussoorie",
    dek: "A walking-heavy Landour morning unfolds into Gun Hill and an intentionally open evening on Mall Road.",
    hero: "Landour to central Mussoorie",
    priority: "Reach Gun Hill well before the ropeway's expected 6 PM window; Mall Road is for slowing down, not ticking boxes.",
    hotel: "Hotel Classic Crown · Kempty Fall Road, near JW Marriott, Mussoorie",
    route: "Hotel → Char Dukan + St. Paul's → Lal Tibba → Sister's Bazaar + Landour Bakehouse → Lunch → Gun Hill → Mall Road + Kulri → Hotel",
    transport: "Full-day private cab for major transfers · walk close Landour stops",
    costs: "Cab ₹2,500–₹4,000 planning range · food and Gun Hill extra",
    footer: "Landour has narrow roads, limited parking and pedestrian sections. Wear comfortable shoes; expect a practical drop point rather than door-to-door cab access. Keep Day 4 separate from Day 3's western-side attractions.",
    timeline: [
      { time: "07:00–07:30", title: "Breakfast + get ready", detail: "Landour is best tackled before roads and popular cafés grow busier." },
      { time: "07:30–08:20", title: "Hotel → Char Dukan / Landour", type: "transport", distance: "~15–18 km · ~45–60 min", mode: "Private sightseeing cab", fare: "Included in full-day cab ideally; separately ~₹500–₹900 one way", note: "Ask for the closest practical drop point. Walk between nearby attractions." },
      { time: "08:20–10:00", title: "Char Dukan + St. Paul's Church", detail: "Allow ~1 hr 40 min. Char Dukan is a café stop: pancakes/waffles, bun omelette and ginger-lemon tea are ideas. Breakfast budget ~₹150–₹350/person. Use St. Paul's as a short heritage/photo stop; no standard public-area entry fee.", note: "Respect any church service, prayer or restricted area. Do not overstay—the rest of Landour is the morning's focus." },
      { time: "10:00–10:20", title: "Char Dukan → Lal Tibba", type: "transport", distance: "~1–2 km · ~10–20 min", mode: "Walk if practical, otherwise short local cab", fare: "₹0 walking / roughly ₹100–₹250 ride", note: "On narrow roads, walking may be easier than moving the cab for every short distance." },
      { time: "10:20–11:30", title: "Lal Tibba", detail: "Allow ~70 min for high-altitude ridge views, telescope/café if wanted. General viewpoint is generally free; telescope/café can cost extra. Planning budget ~₹50–₹200/person.", note: "Clear weather matters. If haze or cloud limits Himalayan views, enjoy Landour and move on rather than waiting." },
      { time: "11:30–11:45", title: "Lal Tibba → Sister's Bazaar", type: "transport", distance: "~1–2 km · ~10–15 min", mode: "Walk / local cab", fare: "₹0 walking / ~₹100–₹250 ride" },
      { time: "11:45–13:15", title: "Sister's Bazaar + Landour Bakehouse", detail: "Allow ~1 hr 30 min. Coffee, scones, apple pie and light snacks at the Bakehouse; no entry fee. Optional A. Prakash & Co. shopping for jams, preserves, peanut butter and local products. Planning budget ~₹150–₹500/person depending on café/shopping.", note: "Keep this relaxed; every shop is not a mandatory stop." },
      { time: "13:15–14:30", title: "Lunch in Landour", detail: "A main sit-down/rest period at Café Ivy, Emily's / Rokeby Manor area or another convenient restaurant. Budget ~₹250–₹600/person." },
      { time: "14:30–15:15", title: "Landour → Gun Hill / central Mussoorie", type: "transport", distance: "~5–7 km · ~25–45 min", mode: "Private sightseeing cab", fare: "Included in full-day cab; separately ~₹300–₹600 one way", note: "Ask for a practical drop around Mall Road / Jhula Ghar; the cab cannot take you directly to the top." },
      { time: "15:15–16:30", title: "Gun Hill", detail: "Allow ~75 min. Take the aerial ropeway if everyone is comfortable; enjoy central-Mussoorie and valley views. It is a paid ropeway/attraction—confirm fare at the counter.", note: "Business listings commonly show operation around 10 AM–6 PM. Do not move this to 5:30–6 PM and risk missing the ropeway." },
      { time: "16:30–16:45", title: "Gun Hill → Mall Road / Kulri Bazaar", type: "transport", mode: "Short walk / central transfer", fare: "Usually ₹0 walking" },
      { time: "16:45–20:15", title: "Mall Road + Kulri Bazaar", detail: "A deliberately long flexible evening: promenade, shopping for woollens/handicrafts/souvenirs, tea/snacks and dinner. Free to enter; dinner planning budget ~₹250–₹600/person.", note: "This is the evening experience, not another rigid attraction checklist." },
      { time: "20:15–21:00", title: "Mall Road / Kulri → Hotel Classic Crown", type: "transport", distance: "~10–12 km · ~30–45 min, potentially longer", mode: "Private cab", fare: "Ideally included; separately ~₹400–₹800" },
      { time: "21:00 onward", title: "Rest + pack", detail: "Prepare for the next day's Dehradun transfer." }
    ]
  },
  {
    number: 5,
    place: "Dehradun",
    dateISO: "2026-10-22",
    date: "22 October 2026",
    status: "Transfer day",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Robber%27s_Cave_Dehradun.jpg/1920px-Robber%27s_Cave_Dehradun.jpg",
    imageSource: "https://commons.wikimedia.org/wiki/File:Robber%27s_Cave_Dehradun.jpg",
    imageCredit: "Photo · Wikimedia Commons",
    imagePlace: "Robber’s Cave · Dehradun",
    dek: "From the Mussoorie descent into caves, a monastery, the bazaar and a final flexible evening in Dehradun.",
    hero: "Mussoorie → Dehradun",
    priority: "Do not rush Mindrolling to preserve a market block. If departure is early, Rajpur Road goes first.",
    hotel: "Start: Hotel Classic Crown, Mussoorie · End: departure / Dehradun",
    route: "Hotel → Robber's Cave → Malsi Deer Park → Tapkeshwar → Mindrolling → Paltan Bazaar → Rajpur Road → departure",
    transport: "One full-day private cab · planning range ₹2,500–₹4,000+",
    costs: "Cave ₹25–₹35 · Zoo ~₹50 · temples generally free",
    footer: "Keep luggage in the cab after checkout. Exact final transfer depends on your station, bus stand or airport: allow a particularly generous buffer for the airport and October evening traffic.",
    timeline: [
      { time: "07:00–07:30", title: "Breakfast + checkout", detail: "At Hotel Classic Crown. Keep luggage in the cab and start by 7:30–7:45 AM." },
      { time: "07:30–08:30", title: "Mussoorie → Robber's Cave", type: "transport", distance: "~35–40 km · ~1–1.5 hr", mode: "Private cab", fare: "Included in full-day cab ideally; separately ~₹1,500–₹2,500", note: "Leave early—the road down from Mussoorie can become slower later in the morning." },
      { time: "08:30–10:15", title: "Robber's Cave / Gucchupani", detail: "Allow 1 hr 45 min to walk the natural limestone gorge, wade through the stream and see the narrow cave / rock formations. Planning entry ~₹25–₹35/person; rubber sandals/rentals ~₹10–₹15.", note: "The stream can be ankle-to-knee deep. Wear grippy footwear and avoid carrying anything that cannot get wet." },
      { time: "10:15–10:35", title: "Robber's Cave → Malsi Deer Park", type: "transport", distance: "~4 km · ~10–20 min", mode: "Same private cab", fare: "Ideally included", note: "This is an efficient geographic pairing." },
      { time: "10:35–12:15", title: "Malsi Deer Park / Dehradun Zoo", detail: "A relaxed, family-friendly 1 hr 40 min for deer enclosures, shaded forest areas and other open animal/bird sections. Planning entry ~₹50/person; sources vary. Commonly listed around 10 AM–5 PM.", note: "This is an easier stop to shorten if the family is tired—not a major wildlife safari." },
      { time: "12:15–12:45", title: "Malsi Deer Park → Tapkeshwar", type: "transport", distance: "~10–13 km · ~25–30 min", mode: "Same private cab", fare: "Included with cab" },
      { time: "12:45–13:25", title: "Tapkeshwar Mahadev Temple", detail: "Natural cave temple with water dripping on the Shiva lingam and cave / riverside surroundings. Free entry; donation optional." },
      { time: "13:25–14:00", title: "Lunch nearby", detail: "Keep it simple to protect the Mindrolling timing. Food budget ~₹200–₹400/person." },
      { time: "14:00–14:45", title: "Tapkeshwar → Mindrolling Monastery", type: "transport", distance: "~10–15 km · ~30–45 min", mode: "Same private cab", fare: "Included with cab" },
      { time: "14:45–16:15", title: "Mindrolling Monastery / Buddha Temple", detail: "Allow 1 hr 30 min for the Great Stupa, Buddha statue, gardens, prayer wheels, Tibetan architecture and nearby Tibetan shops/food. Generally free; donations/purchases optional. Official visitor information says the Great Stupa opens from 9 AM.", note: "Respect signs, religious areas and any restricted monastery spaces." },
      { time: "16:15–17:00", title: "Mindrolling → Paltan Bazaar / Clock Tower", type: "transport", distance: "~7–10 km · ~25–45 min", mode: "Same private cab", fare: "Included with cab" },
      { time: "17:00–18:45", title: "Paltan Bazaar + Clock Tower", detail: "Casual market time: walk around, see the Clock Tower, local shopping, snacks/sweets and perhaps basmati rice, woollens or packaged treats. Free to enter. Snacks budget ~₹100–₹300/person.", note: "Do not try to cover every shop." },
      { time: "18:45–19:00", title: "Paltan Bazaar → Rajpur Road", type: "transport", distance: "~5–7 km · ~15–30 min", mode: "Private cab", fare: "Included ideally; otherwise ~₹200–₹400" },
      { time: "19:00–21:30", title: "Rajpur Road", detail: "Final flexible block for an evening walk, coffee / café and dinner. Coffee/snacks ~₹150–₹300/person; dinner ~₹250–₹600/person.", note: "If departure is earlier, shorten or remove this before rushing daytime attractions." },
      { time: "21:30 onward", title: "Departure / final transfer", detail: "Railway station: allow ~20–40 min from Rajpur Road; bus stand similar depending on terminal. Airport needs significantly more time.", note: "Do not cut the final transfer close—October traffic is unpredictable." }
    ]
  }
];

const essentials = {
  transport: {
    eyebrow: "Getting around",
    title: "Move with less friction.",
    content: `
      <section class="essentials-section"><h3>Best transport choices</h3><p><strong>Day 1, Haridwar:</strong> e-rickshaws / autos suit the short station and temple legs; per-ride fares are shown in the schedule.</p><p><strong>Day 2, Rishikesh:</strong> the new Neer Garh–Tapovan–East Bank–Parmarth loop is easier by one pre-booked full-day car if your party wants to avoid repeat waits. Current planning quotes: ~₹2,400 sedan, ₹3,100 SUV, ₹4,700 tempo traveller per vehicle for a full-day sightseeing cab; confirm waterfall access/waiting, bridge route, parking, tolls and return are included. A lower-cost option is a local auto/cab for the waterfall and short rides between clusters, roughly ₹150–₹300 for the Tapovan–waterfall leg and ₹50–₹150 for local approaches; fares are negotiable estimates.</p><p><strong>Important route check:</strong> Ram Jhula is reported closed for repairs through December 2026. Walk only over a bridge confirmed open locally; an auto can take you to an alternate approach, but it cannot cross a pedestrian-only bridge.</p><p><strong>Mussoorie, Days 3 & 4:</strong> use one private sightseeing cab each day (~₹2,500–₹4,000 planning range). Confirm full-day availability, waiting time, every listed stop, hotel return and whether parking/tolls are extra.</p><p><strong>Day 5:</strong> tell the driver the full Mussoorie → Dehradun circuit before agreeing a price. Plan ₹2,500–₹4,000+ for a full-day cab, including waiting and final drop where possible.</p></section>
      <section class="essentials-section"><h3>Driver check-in list</h3><p>Ask whether Landour parking/waiting is included, whether the driver can hold luggage on Day 5, and if the Mussoorie → Dehradun descent creates an extra charge. Put the route and final departure point in the agreement.</p></section>`
  },
  costs: {
    eyebrow: "Planning figures",
    title: "Costs worth knowing.",
    content: `
      <section class="essentials-section"><h3>Entry & activity planning figures</h3><div class="cost-list">
        <div class="cost-row"><span>Mansa + Chandi combined ropeway</span><span>₹460/person</span></div><div class="cost-row"><span>Child combined ropeway</span><span>₹235</span></div><div class="cost-row"><span>Optional Udan Khatola transport bus</span><span>₹95/person</span></div><div class="cost-row"><span>Neer Garh Waterfall entry</span><span>~₹30/person*</span></div><div class="cost-row"><span>Beatles Ashram (if open)</span><span>~₹150 Indian / ₹600 foreign*</span></div><div class="cost-row"><span>Kempty Falls entry / ropeway</span><span>~₹25 / ~₹50–₹80 return*</span></div><div class="cost-row"><span>Company Garden adult / child</span><span>~₹50 / ~₹20–₹30*</span></div><div class="cost-row"><span>Cloud End Resort managed package</span><span>₹200 adult / ₹100 child</span></div><div class="cost-row"><span>Robber's Cave / rubber sandals</span><span>~₹25–₹35 / ~₹10–₹15*</span></div><div class="cost-row"><span>Malsi Deer Park</span><span>~₹50/person*</span></div>
      </div><p>*Planning references only; published prices differ in places. Confirm current counter prices on the day.</p></section>
      <section class="essentials-section"><h3>Food budgeting</h3><p>Day 2 Rishikesh: brunch ~₹300–₹500/person, snacks/kulfi ~₹50–₹200 and dinner ~₹250–₹500. With ~₹30 Neer Garh entry and Beatles Ashram only if open (~₹150 Indian / ₹600 foreign), plan roughly ₹780–₹1,380/person before transport (Indian visitor; actual orders and entry rates vary). Haridwar / other Rishikesh meals: ~₹150–₹300/person; tea: ₹50–₹120/person. Mussoorie Day 3 normal meal: ~₹150–₹300/person; Day 4 café breakfast: ₹150–₹350, Landour lunch and dinner: ~₹250–₹600/person. Day 5 lunch: ₹200–₹400; snacks ₹100–₹300; Rajpur Road coffee + dinner ₹400–₹900/person.</p></section>`
  },
  notes: {
    eyebrow: "Useful notes",
    title: "Plan gently; adjust early.",
    content: `
      <section class="essentials-section"><h3>Time-sensitive moments</h3><p>Day 2 is Monday: Beatles Ashram is listed as closed Mondays, and recent reports describe a temporary closure; confirm before travelling and keep Gita Bhawan / riverside time as backup. Ram Jhula is reported shut for repairs through December 2026, so confirm an alternate crossing locally. Parmarth Aarti follows sunset and shifts by season—confirm the start time. Also confirm Har Ki Pauri Aarti locally. Finish Company Garden before late afternoon; arrive at Gun Hill around 3:15 PM rather than gambling on a late ropeway. Mindrolling's 2:45 PM slot is comfortably after its official 9 AM Great Stupa opening.</p></section>
      <section class="essentials-section"><h3>Weather & comfort</h3><p>Early Kempty helps with crowds. At Lal Tibba, haze can erase the Himalayan view—do not spend an extra hour waiting for it. Landour is walking-heavy with narrow roads. At Robber's Cave, expect ankle-to-knee-deep water: wear grippy footwear and bring a spare if useful.</p></section>
      <section class="essentials-section"><h3>When the day slips</h3><p>On Day 3, shorten then skip Cloud's End. On Day 4, shorten Gun Hill if the family is tired; Mall Road can also be shorter. On Day 5, shorten Malsi Deer Park, then Paltan Bazaar, then remove Rajpur Road—never rush Mindrolling or the final transfer.</p></section>
      <section class="essentials-section"><h3>Respectful travel</h3><p>Follow temple and monastery etiquette, respect restricted prayer/service areas, use designated Ganga bathing zones and keep valuables secure near water or crowds.</p></section>`
  }
};

if (!document.getElementById("screen-home")) {
let currentIndex = 0;
let choice = "George Everest";
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function renderRail() {
  const rail = $("#dayRail");
  rail.innerHTML = days.map((day, index) => `
    <button class="day-chip ${index === currentIndex ? "active" : ""}" role="tab" aria-selected="${index === currentIndex}" data-day="${index}">
      <span class="chip-day">Day ${day.number}</span><span class="chip-place">${day.place}</span>
    </button>`).join("");
}

function renderDay(animate = false) {
  const day = days[currentIndex];
  const feature = $("#dayFeature");
  if (animate) { feature.style.opacity = "0"; feature.style.transform = "translateX(12px)"; }
  $("#dayImage").src = day.image;
  $("#dayImage").alt = `${day.place} landscape`;
  $("#imagePlace").textContent = day.imagePlace;
  $("#dayNumberLarge").textContent = String(day.number).padStart(2, "0");
  $("#dayDate").textContent = `Day ${day.number} · ${day.date}`;
  $("#dayStatus").textContent = day.status;
  $("#dayTitle").textContent = day.place;
  $("#dayDek").textContent = day.dek;
  $("#atAGlance").innerHTML = [
    ["Start / stay", day.hotel.replace(/ ·.*/, "")],
    ["Move", day.transport],
    ["Costs", day.costs]
  ].map(([label, value]) => `<div class="glance"><span class="glance-label">${label}</span><span class="glance-value">${value}</span></div>`).join("");
  const focus = $("#focusCard");
  if (day.choice) {
    focus.className = "focus-card has-content";
    focus.innerHTML = `<p>Midday choice — choose one</p><div class="choice-buttons">${day.choice.options.map(option => `<button data-choice="${option}" class="${choice === option ? "selected" : ""}">${option === "Buddhist Temple" ? "Shedup Choephelling" : option}</button>`).join("")}</div>`;
  } else { focus.className = "focus-card"; focus.innerHTML = ""; }
  $("#dayProgress").style.width = `${((currentIndex + 1) / days.length) * 100}%`;
  renderRail();
  if (animate) requestAnimationFrame(() => { feature.style.transition = "opacity .28s ease, transform .32s ease"; feature.style.opacity = "1"; feature.style.transform = "translateX(0)"; });
}

function openSheet(type, sheet = $("#itinerarySheet")) {
  const backdrop = $("#sheetBackdrop");
  sheet.classList.add("open");
  sheet.setAttribute("aria-hidden", "false");
  backdrop.classList.add("visible");
  document.body.style.overflow = "hidden";
  const close = sheet.querySelector("[data-close-sheet]");
  setTimeout(() => close.focus(), 280);
}

function closeSheets() {
  $$(".bottom-sheet.open").forEach(sheet => { sheet.classList.remove("open"); sheet.setAttribute("aria-hidden", "true"); });
  $("#sheetBackdrop").classList.remove("visible");
  document.body.style.overflow = "";
}

function renderTimeline() {
  const day = days[currentIndex];
  $("#sheetEyebrow").textContent = `Day ${day.number} · ${day.date}`;
  $("#sheetTitle").textContent = day.hero;
  $("#sheetMeta").innerHTML = `<span class="meta-pill">${day.status}</span><span class="meta-pill">${day.place}</span><span class="meta-pill">Tap a stop for details</span>`;
  $("#timeline").innerHTML = day.timeline.map((item, i) => `
    <article class="timeline-item ${item.type === "transport" ? "transport" : ""}" data-item="${i}">
      <button class="timeline-summary" aria-expanded="false">
        <span class="timeline-time">${item.time}</span><span class="timeline-title">${item.title}</span><span class="timeline-chevron">+</span>
      </button>
      <div class="timeline-detail">
        ${item.distance ? `<p><span class="detail-label">Distance</span>${item.distance}</p>` : ""}
        ${item.mode ? `<p><span class="detail-label">Mode</span>${item.mode}</p>` : ""}
        ${item.fare ? `<p><span class="detail-label">Cost</span>${item.fare}</p>` : ""}
        ${item.detail ? `<p>${item.detail}</p>` : ""}
        ${item.note ? `<p class="timeline-note">✦ ${item.note}</p>` : ""}
      </div>
    </article>`).join("");
  $("#sheetFooterNote").innerHTML = `<strong>Plan note.</strong> ${day.footer}`;
}

function showItinerary() { renderTimeline(); openSheet("itinerary"); }

function showEssentials(key) {
  const item = essentials[key];
  $("#essentialsTitle").textContent = item.title;
  $("#essentialsSheet .eyebrow").textContent = item.eyebrow;
  $("#essentialsContent").innerHTML = item.content;
  openSheet("essentials", $("#essentialsSheet"));
}

let toastTimer;
function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2500);
}

function selectDay(index, animate = true) {
  if (index < 0 || index >= days.length) return;
  currentIndex = index;
  renderDay(animate);
  const chip = $(`.day-chip[data-day="${index}"]`);
  chip?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
}

function updatePriority() {
  $("#priorityGrid").innerHTML = days.map(day => `
    <button class="priority-card" data-priority-day="${day.number - 1}" style="--priority-image:url('${day.image}')">
      <span class="priority-number">0${day.number}</span><p class="priority-day">Day ${day.number} · ${day.place}</p><strong>${day.hero}</strong><small>${day.priority}</small>
    </button>`).join("");
}

$("#dayRail").addEventListener("click", event => {
  const button = event.target.closest("[data-day]");
  if (button) selectDay(Number(button.dataset.day));
});
$("#priorityGrid").addEventListener("click", event => {
  const card = event.target.closest("[data-priority-day]");
  if (card) { selectDay(Number(card.dataset.priorityDay)); $("#journey").scrollIntoView({ behavior: "smooth" }); }
});
$("#openItinerary").addEventListener("click", showItinerary);
$("#dayFeature").addEventListener("click", event => {
  const button = event.target.closest("[data-choice]");
  if (!button) return;
  choice = button.dataset.choice;
  renderDay();
  toast(`Day 3 choice saved: ${choice === "Buddhist Temple" ? "Shedup Choephelling" : choice}`);
});
$("#timeline").addEventListener("click", event => {
  const item = event.target.closest(".timeline-item");
  if (!item) return;
  const expanded = item.classList.toggle("expanded");
  item.querySelector(".timeline-summary").setAttribute("aria-expanded", String(expanded));
});

$("#tripMenuButton").addEventListener("click", () => showEssentials("notes"));
$$("[data-sheet]").forEach(button => button.addEventListener("click", () => showEssentials(button.dataset.sheet)));
$$("[data-close-sheet]").forEach(button => button.addEventListener("click", closeSheets));
$("#sheetBackdrop").addEventListener("click", closeSheets);
document.addEventListener("keydown", event => { if (event.key === "Escape") closeSheets(); });

$("#mapToggle").addEventListener("click", () => {
  const map = $("#routeMap"); const button = $("#mapToggle");
  const hidden = map.hasAttribute("hidden");
  if (hidden) { map.removeAttribute("hidden"); button.textContent = "Hide route"; button.setAttribute("aria-pressed", "true"); }
  else { map.setAttribute("hidden", ""); button.textContent = "Route map"; button.setAttribute("aria-pressed", "false"); }
});

let pointerX = 0;
$("#dayFeature").addEventListener("pointerdown", event => { pointerX = event.clientX; });
$("#dayFeature").addEventListener("pointerup", event => {
  const delta = event.clientX - pointerX;
  if (Math.abs(delta) > 65 && !event.target.closest("button")) selectDay(currentIndex + (delta < 0 ? 1 : -1));
});

$$('[data-scroll-to]').forEach(button => button.addEventListener("click", () => {
  const target = document.getElementById(button.dataset.scrollTo);
  target?.scrollIntoView({ behavior: "smooth" });
}));

const sectionTargets = ["home", "journey", "moments", "practical"];
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  $$(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.scrollTo === entry.target.id));
}), { threshold: .42 });
sectionTargets.forEach(id => observer.observe(document.getElementById(id)));

renderDay();
updatePriority();
}
