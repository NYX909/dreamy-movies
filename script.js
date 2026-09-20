/* =========================================================
   DREAMY MOVIES — movie ticket booking demo
   -----------------------------------------------------
   This one file powers all seven pages:
     index.html         -> home page (welcome + now showing)
     movies.html        -> browse/search all movies
     upcoming.html      -> movies releasing soon
     movie.html         -> one movie's details + booking form
     bookings.html      -> my bookings + search by phone/email
     contact.html       -> info + contact form
     confirmation.html  -> the finished ticket

   There is no server here. We use the browser's localStorage
   as a pretend database, so bookings only live on YOUR
   computer/browser.
   ========================================================= */

// ---------- 1. THE "DATABASE" ----------

const MOVIES = [
  {
    id: "m1",
    poster: "images/voidwalker.png",
    title: "Void Walker",
    genre: "Sci-Fi",
    duration: "2h 08m",
    language: "English",
    rating: "13+",
    screen: "Screen 1",
    synopsis: "A sci-fi voyage through a crumbling star system, chasing a signal that shouldn't exist.",
    showtimes: ["10:30 AM", "1:45 PM", "5:15 PM", "8:30 PM"],
    soldOut: ["5:15 PM"], // showtimes with no seats left
    tiers: [
      { name: "Standard", price: 900 },
      { name: "Recliner", price: 1800 }
    ]
  },
  {
    id: "m2",
    poster: "images/laughingstock.png",
    title: "Laughing Stock",
    genre: "Comedy",
    duration: "1h 52m",
    language: "English",
    rating: "PG",
    screen: "Screen 2",
    synopsis: "A washed-up sitcom star tries to relaunch his career at the worst open-mic night in the city.",
    showtimes: ["11:00 AM", "2:30 PM", "6:00 PM", "9:15 PM"],
    soldOut: ["11:00 AM", "9:15 PM"], // showtimes with no seats left
    tiers: [
      { name: "Standard", price: 850 },
      { name: "Recliner", price: 1700 }
    ]
  },
  {
    id: "m3",
    poster: "images/crimsonriderunners.png",
    title: "Crimson Tide Runners",
    genre: "Action",
    duration: "2h 20m",
    language: "English",
    rating: "16+",
    screen: "Screen 3",
    synopsis: "A crew of smugglers race a rival gang and a rising storm to make one last score.",
    showtimes: ["12:00 PM", "3:30 PM", "7:00 PM", "10:00 PM"],
    soldOut: ["7:00 PM"], // showtimes with no seats left
    tiers: [
      { name: "Standard", price: 950 },
      { name: "IMAX", price: 2200 }
    ]
  },
  {
    id: "m4",
    poster: "images/thesilentorchard.png",
    title: "The Silent Orchard",
    genre: "Drama",
    duration: "2h 02m",
    language: "Sinhala",
    rating: "PG",
    screen: "Screen 1",
    synopsis: "Three generations of a family return to their childhood home to decide its fate — and their own.",
    showtimes: ["10:00 AM", "1:15 PM", "4:45 PM"],
    soldOut: [], // showtimes with no seats left
    tiers: [
      { name: "Standard", price: 800 },
      { name: "Recliner", price: 1600 }
    ]
  },
  {
    id: "m5",
    poster: "images/paws&effects.png",
    title: "Paws & Effect",
    genre: "Animation",
    duration: "1h 38m",
    language: "English",
    rating: "General",
    screen: "Screen 4",
    synopsis: "A house cat accidentally becomes a secret agent's new partner, with chaotic (and adorable) results.",
    showtimes: ["9:30 AM", "11:45 AM", "2:15 PM", "4:30 PM"],
    soldOut: ["9:30 AM"], // showtimes with no seats left
    tiers: [
      { name: "Standard", price: 750 },
      { name: "3D", price: 1400 }
    ]
  },
  {
    id: "m6",
    poster: "images/Nightshade.png",
    title: "Nightshade",
    genre: "Thriller",
    duration: "1h 58m",
    language: "English",
    rating: "18+",
    screen: "Screen 3",
    synopsis: "A late-shift nurse keeps noticing the same face in every patient's chart — and it isn't a coincidence.",
    showtimes: ["9:00 PM", "11:30 PM"],
    soldOut: ["9:00 PM", "11:30 PM"], // showtimes with no seats left
    tiers: [
      { name: "Standard", price: 900 },
      { name: "Recliner", price: 1750 }
    ]
  }
];

// Movies that aren't on sale yet. They have a release date instead of showtimes.
const UPCOMING = [
  {
    id: "u1",
    poster: "images/moonsoonletters.png",
    title: "Monsoon Letters",
    genre: "Drama",
    duration: "2h 06m",
    language: "Sinhala",
    rating: "PG",
    releaseDate: "3 October 2026",
    synopsis: "Two pen pals who have never met decide to spend one rainy week in the same town."
  },
  {
    id: "u2",
    poster: "images/starfallprotocol.png",
    title: "Starfall Protocol",
    genre: "Sci-Fi",
    duration: "2h 24m",
    language: "English",
    rating: "13+",
    releaseDate: "17 October 2026",
    synopsis: "When the last satellite goes dark, a rookie engineer is the only one still listening."
  },
  {
    id: "u3",
    poster: "images/doublebooked.png",
    title: "Double Booked",
    genre: "Comedy",
    duration: "1h 44m",
    language: "English",
    rating: "PG",
    releaseDate: "31 October 2026",
    synopsis: "One wedding hall, two weddings, and a planner who refuses to admit the mistake."
  },
  {
    id: "u4",
    poster: "images/ironharbour.png",
    title: "Iron Harbour",
    genre: "Action",
    duration: "2h 12m",
    language: "English",
    rating: "16+",
    releaseDate: "14 November 2026",
    synopsis: "A dock worker discovers the shipping crates coming into her port are never opened twice."
  }
];

// ---------- 2. SMALL HELPERS ----------

const LAST_BOOKING_KEY = "dreamy_last_booking";
const BOOKINGS_KEY = "dreamy_bookings";

// Formats a number as Sri Lankan Rupees, e.g. 1500 -> "Rs. 1,500"
function formatPrice(amount) {
  return "Rs. " + amount.toLocaleString("en-LK");
}

// Reads a value from the URL, e.g. movie.html?id=m2 -> getParam("id") = "m2"
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// Generates a short, ticket-style reference code like DRM-7F3K-92LX
function generateReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1, easy to read
  const block = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `DRM-${block()}-${block()}`;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  if (!/^[+]?[0-9\s\-()]+$/.test(value)) return false;
  const digitCount = value.replace(/\D/g, "").length;
  return digitCount >= 7 && digitCount <= 15;
}

function isValidEmailOrPhone(value) {
  return isValidEmail(value) || isValidPhone(value);
}

// Shows/hides the red outline + message under a field.
function validateContactField(inputEl, errorEl) {
  const ok = isValidEmailOrPhone(inputEl.value.trim());
  inputEl.classList.toggle("has-error", !ok);
  errorEl.classList.toggle("is-visible", !ok);
  return ok;
}

// Read every saved booking back out of localStorage.
function getBookings() {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || [];
  } catch (err) {
    return [];
  }
}

function saveBooking(booking) {
  const all = getBookings();
  all.unshift(booking); // newest first
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(all));
  localStorage.setItem(LAST_BOOKING_KEY, JSON.stringify(booking));
}

// Removes one booking (by its reference code) from the saved list.
function deleteBooking(reference) {
  const remaining = getBookings().filter((b) => b.reference !== reference);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(remaining));
}

// Genre icons, used as a poster placeholder.
const GENRE_ART = {
  "Sci-Fi": `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="20" fill="none" stroke="var(--gold)" stroke-width="3"/><circle cx="32" cy="32" r="6" fill="var(--rose)"/><ellipse cx="32" cy="32" rx="26" ry="9" fill="none" stroke="var(--rose)" stroke-width="2" transform="rotate(25 32 32)"/></svg>`,
  Comedy: `<svg viewBox="0 0 64 64"><rect x="26" y="10" width="12" height="26" rx="6" fill="var(--rose)"/><path d="M20 30a12 12 0 0 0 24 0" stroke="var(--gold)" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M32 42v10M24 52h16" stroke="var(--gold)" stroke-width="3" stroke-linecap="round"/></svg>`,
  Action: `<svg viewBox="0 0 64 64"><path d="M12 52 40 12l4 6-10 18 16-4-22 30-2-8z" fill="var(--gold)"/></svg>`,
  Drama: `<svg viewBox="0 0 64 64"><circle cx="24" cy="26" r="10" fill="none" stroke="var(--gold)" stroke-width="3"/><path d="M14 44c2-8 8-12 10-12s8 4 10 12" stroke="var(--gold)" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="44" cy="34" r="8" fill="none" stroke="var(--rose)" stroke-width="3"/><path d="M36 50c2-6 6-9 8-9s6 3 8 9" stroke="var(--rose)" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  Animation: `<svg viewBox="0 0 64 64"><circle cx="32" cy="34" r="16" fill="var(--gold)"/><circle cx="20" cy="18" r="8" fill="var(--gold)"/><circle cx="44" cy="18" r="8" fill="var(--gold)"/><circle cx="26" cy="32" r="3" fill="var(--night)"/><circle cx="38" cy="32" r="3" fill="var(--night)"/><path d="M26 40q6 5 12 0" stroke="var(--night)" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  Thriller: `<svg viewBox="0 0 64 64"><path d="M32 8 8 20v14c0 14 10 20 24 22 14-2 24-8 24-22V20z" fill="none" stroke="var(--rose)" stroke-width="3"/><path d="M32 24v14" stroke="var(--gold)" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="44" r="2.2" fill="var(--gold)"/></svg>`
};

// If a movie has a `poster` image we show it; if that image fails to load
// (no internet, wrong path) we quietly fall back to the genre drawing.
function posterArt(movie) {
  if (!movie.poster) return GENRE_ART[movie.genre] || "";
  return `<img src="${movie.poster}" alt="${movie.title} poster"
    onerror="showFallbackArt(this, '${movie.genre}')" />`;
}

function showFallbackArt(img, genre) {
  img.parentElement.innerHTML = GENRE_ART[genre] || "";
}

// ---------- 3. HEADER: search box + current page link ----------

function initHeader() {
  // Underline the nav link for whichever page we're on.
  const page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-header nav a").forEach((link) => {
    if (link.getAttribute("href") === page) link.classList.add("is-current");
  });

  const form = document.getElementById("header-search-form");
  if (!form) return;

  const input = document.getElementById("header-search");
  const grid = document.getElementById("movie-grid");

  // On the movies page the box filters the list as you type.
  // Anywhere else it takes you to the movies page with your search.
  if (grid) {
    const term = getParam("q");
    if (term) input.value = term;
    input.addEventListener("input", () => document.dispatchEvent(new Event("dreamy:search")));
    form.addEventListener("submit", (e) => e.preventDefault());
  } else {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const term = input.value.trim();
      window.location.href = term ? `movies.html?q=${encodeURIComponent(term)}` : "movies.html";
    });
  }
}

// ---------- 4. PAGE: movies.html (browse + search) ----------

function initMoviesPage() {
  const grid = document.getElementById("movie-grid");
  if (!grid) return;

  const filterBar = document.getElementById("filter-bar");
  const searchInput = document.getElementById("header-search");
  const genres = ["All", ...new Set(MOVIES.map((m) => m.genre))];
  let activeGenre = "All";

  function render() {
    const term = searchInput.value.trim().toLowerCase();

    const list = MOVIES.filter((m) => {
      const matchesGenre = activeGenre === "All" || m.genre === activeGenre;
      const matchesSearch =
        term === "" ||
        m.title.toLowerCase().includes(term) ||
        m.genre.toLowerCase().includes(term);
      return matchesGenre && matchesSearch;
    });

    grid.innerHTML = "";

    if (list.length === 0) {
      grid.innerHTML = `<p class="empty-state">Nothing matches "${searchInput.value}". Try another title or genre.</p>`;
      return;
    }

    list.forEach((movie) => {
      const cheapest = Math.min(...movie.tiers.map((t) => t.price));
      const card = document.createElement("a");
      card.className = "movie-card";
      card.href = `movie.html?id=${movie.id}`;
      card.innerHTML = `
        <div class="movie-card__poster">${posterArt(movie)}</div>
        <div class="movie-card__body">
          <span class="movie-card__genre">${movie.genre}</span>
          <h3 class="movie-card__title">${movie.title}</h3>
          <p class="movie-card__meta">${movie.duration} · ${movie.language} · ${movie.rating}</p>
          <div class="movie-card__price-row">
            <span class="movie-card__price">from ${formatPrice(cheapest)}</span>
            <span class="movie-card__cta">Book</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  genres.forEach((genre) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filter-btn";
    btn.textContent = genre;
    if (genre === "All") btn.classList.add("is-active");
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeGenre = genre;
      render();
    });
    filterBar.appendChild(btn);
  });

  // The header search box fires this event while you type.
  document.addEventListener("dreamy:search", render);
  render();
}

// ---------- 5. PAGE: upcoming.html (coming soon) ----------

function initUpcomingPage() {
  const grid = document.getElementById("upcoming-grid");
  if (!grid) return;

  UPCOMING.forEach((movie) => {
    const card = document.createElement("article");
    card.className = "movie-card";
    card.innerHTML = `
      <div class="movie-card__poster">${posterArt(movie)}</div>
      <div class="movie-card__body">
        <span class="movie-card__genre">${movie.genre}</span>
        <h3 class="movie-card__title">${movie.title}</h3>
        <p class="movie-card__meta">${movie.duration} · ${movie.language} · ${movie.rating}</p>
        <p class="movie-card__meta">${movie.synopsis}</p>
        <div class="release-badge">In cinemas ${movie.releaseDate}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ---------- 6. PAGE: movie.html (movie detail + booking form) ----------

function initMoviePage() {
  const container = document.getElementById("movie-detail");
  if (!container) return;

  const movie = MOVIES.find((m) => m.id === getParam("id"));

  if (!movie) {
    container.innerHTML = `<p class="empty-state">We couldn't find that movie. <a href="movies.html">Back to all movies</a>.</p>`;
    return;
  }

  document.title = `${movie.title} — Dreamy Movies`;

  document.getElementById("movie-poster").innerHTML = posterArt(movie);
  document.getElementById("movie-genre").textContent = movie.genre;
  document.getElementById("movie-title").textContent = movie.title;
  document.getElementById("movie-meta").textContent =
    `${movie.duration} · ${movie.language} · ${movie.rating} · ${movie.screen}`;
  document.getElementById("movie-synopsis").textContent = movie.synopsis;

  // Date field — the visitor can type a date or use the browser's picker.
  // We default it to today and don't allow picking a day in the past.
  const dateInput = document.getElementById("date-input");
  const dateError = document.getElementById("date-input-error");
  const todayValue = new Date().toISOString().slice(0, 10);
  dateInput.min = todayValue;
  dateInput.value = todayValue;

  function validateDateField() {
    const ok = !!dateInput.value && dateInput.value >= todayValue;
    dateInput.classList.toggle("has-error", !ok);
    dateError.classList.toggle("is-visible", !ok);
    return ok;
  }
  dateInput.addEventListener("blur", validateDateField);
  dateInput.addEventListener("input", () => {
    if (dateInput.classList.contains("has-error")) validateDateField();
  });

  // Turns "2026-09-25" into "Fri, 25 Sep 2026" for tickets and confirmations.
  function formatDate(value) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  // Showtime pills. A time listed in the movie's `soldOut` array is shown
  // greyed out with a note, and can't be picked.
  const showtimeList = document.getElementById("showtime-list");
  const soldOut = movie.soldOut || [];
  const available = movie.showtimes.filter((time) => !soldOut.includes(time));

  movie.showtimes.forEach((time) => {
    const isSoldOut = soldOut.includes(time);
    const label = document.createElement("label");
    label.className = isSoldOut ? "showtime-option is-soldout" : "showtime-option";
    label.innerHTML = `
      <input type="radio" name="showtime" value="${time}"
        ${isSoldOut ? "disabled" : ""}
        ${time === available[0] ? "checked" : ""} />
      ${time}
      ${isSoldOut ? '<small class="showtime-option__note">No seats available right now</small>' : ""}
    `;
    showtimeList.appendChild(label);
  });

  // Nothing left to book? Say so and hide the rest of the form.
  const form = document.getElementById("booking-form");
  if (available.length === 0) {
    form.innerHTML = `
      <h2>Fully booked</h2>
      <p class="empty-state">Every show of ${movie.title} is sold out today.
      <a href="movies.html">Pick another movie</a> or check back tomorrow.</p>
    `;
    return;
  }

  // Ticket tiers
  const tierList = document.getElementById("tier-list");
  movie.tiers.forEach((tier, index) => {
    const label = document.createElement("label");
    label.className = "tier-option";
    label.innerHTML = `
      <input type="radio" name="tier" value="${index}" ${index === 0 ? "checked" : ""} />
      <span class="tier-option__name">${tier.name}</span>
      <span class="tier-option__price">${formatPrice(tier.price)}</span>
    `;
    tierList.appendChild(label);
  });

  const qtyInput = document.getElementById("qty");
  const totalEl = document.getElementById("total-price");

  function recalcTotal() {
    const selectedIndex = Number(document.querySelector('input[name="tier"]:checked').value);
    const qty = Math.max(1, Number(qtyInput.value) || 1);
    totalEl.textContent = formatPrice(movie.tiers[selectedIndex].price * qty);
  }

  tierList.addEventListener("change", recalcTotal);
  qtyInput.addEventListener("input", recalcTotal);
  recalcTotal();

  const contactInput = document.getElementById("buyer-contact");
  const contactError = document.getElementById("buyer-contact-error");
  contactInput.addEventListener("blur", () => validateContactField(contactInput, contactError));
  contactInput.addEventListener("input", () => {
    if (contactInput.classList.contains("has-error")) {
      validateContactField(contactInput, contactError);
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("buyer-name").value.trim();
    const emailOrPhone = contactInput.value.trim();
    const showtime = document.querySelector('input[name="showtime"]:checked').value;
    const selectedIndex = Number(document.querySelector('input[name="tier"]:checked').value);
    const qty = Math.max(1, Number(qtyInput.value) || 1);
    const tier = movie.tiers[selectedIndex];

    if (!name || !emailOrPhone) return;

    if (!validateDateField()) {
      dateInput.focus();
      return;
    }

    if (!validateContactField(contactInput, contactError)) {
      contactInput.focus();
      return;
    }

    const dateLabel = formatDate(dateInput.value);

    const confirmed = window.confirm(
      `Confirm your booking?\n\n` +
      `${movie.title} — ${dateLabel}, ${showtime}\n` +
      `${tier.name} × ${qty}\n` +
      `Total: ${formatPrice(tier.price * qty)}\n` +
      `Name: ${name}`
    );
    if (!confirmed) return;

    saveBooking({
      reference: generateReference(),
      movieId: movie.id,
      movieTitle: movie.title,
      screen: movie.screen,
      date: dateLabel,
      showtime: showtime,
      tierName: tier.name,
      quantity: qty,
      total: tier.price * qty,
      buyerName: name,
      buyerContact: emailOrPhone,
      bookedOn: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    });

    window.location.href = "confirmation.html";
  });
}

// ---------- 7. PAGE: confirmation.html (the finished ticket) ----------

function initConfirmationPage() {
  const container = document.getElementById("ticket-result");
  if (!container) return;

  const raw = localStorage.getItem(LAST_BOOKING_KEY);
  if (!raw) {
    container.innerHTML = `<p class="empty-state">No booking yet. <a href="movies.html">Browse movies</a> to book one.</p>`;
    return;
  }

  const b = JSON.parse(raw);

  document.getElementById("ticket-movie").textContent = b.movieTitle;
  document.getElementById("ticket-screen").textContent = b.screen;
  document.getElementById("ticket-date").textContent = b.date || "—";
  document.getElementById("ticket-showtime").textContent = b.showtime;
  document.getElementById("ticket-tier").textContent = `${b.tierName} × ${b.quantity}`;
  document.getElementById("ticket-buyer").textContent = b.buyerName;
  document.getElementById("ticket-total").textContent = formatPrice(b.total);
  document.getElementById("ticket-reference").textContent = b.reference;
}

// ---------- 8. PAGE: bookings.html (my bookings + lookup) ----------

function initBookingsPage() {
  const list = document.getElementById("booking-list");
  if (!list) return;

  const form = document.getElementById("lookup-form");
  const input = document.getElementById("lookup-input");
  const hint = document.getElementById("lookup-hint");

  // Phone numbers get typed in lots of ways (+94 77 123 4567 / 0771234567),
  // so compare only the characters that matter.
  function simplify(value) {
    return value.trim().toLowerCase().replace(/[\s\-()+]/g, "");
  }

  function matches(booking, term) {
    const saved = simplify(booking.buyerContact);
    const typed = simplify(term);
    return (
      saved.includes(typed) ||
      (typed.length >= 7 && saved.endsWith(typed)) || // 0771234567 finds +94771234567
      booking.reference.toLowerCase().includes(term.trim().toLowerCase())
    );
  }

  let currentTerm = "";

  function render(term) {
    currentTerm = term;
    const all = getBookings();
    const shown = term ? all.filter((b) => matches(b, term)) : all;

    list.innerHTML = "";

    if (all.length === 0) {
      list.innerHTML = `<p class="empty-state">No tickets on this device yet. <a href="movies.html">Book a movie</a> and it'll show up here.</p>`;
      return;
    }

    if (shown.length === 0) {
      list.innerHTML = `<p class="empty-state">No tickets booked with "${term}". Check the email or phone number you used.</p>`;
      return;
    }

    shown.forEach((b) => {
      const row = document.createElement("article");
      row.className = "booking-row";
      row.innerHTML = `
        <div class="booking-row__head">
          <h3 class="booking-row__title">${b.movieTitle}</h3>
          <span class="booking-row__ref">${b.reference}</span>
        </div>
        <p class="booking-row__meta">${b.date ? b.date + " · " : ""}${b.showtime} · ${b.screen} · ${b.tierName} × ${b.quantity}</p>
        <p class="booking-row__meta">Booked by ${b.buyerName} (${b.buyerContact})${b.bookedOn ? " on " + b.bookedOn : ""}</p>
        <p class="booking-row__meta booking-row__total">${formatPrice(b.total)}</p>
        <button type="button" class="cancel-btn" data-ref="${b.reference}">Cancel booking</button>
      `;
      list.appendChild(row);
    });
  }

  // One listener on the whole list handles every "Cancel booking" button,
  // including ones added after a later render.
  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".cancel-btn");
    if (!btn) return;

    const reference = btn.dataset.ref;
    const confirmed = window.confirm(`Cancel booking ${reference}? This can't be undone.`);
    if (!confirmed) return;

    deleteBooking(reference);
    render(currentTerm);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const term = input.value.trim();
    hint.textContent = term
      ? `Showing tickets for "${term}".`
      : "Showing every ticket booked on this device.";
    render(term);
  });

  input.addEventListener("input", () => {
    if (input.value.trim() === "") {
      hint.textContent = "Showing every ticket booked on this device.";
      render("");
    }
  });

  render("");
}

// ---------- 9. PAGE: index.html (home page) ----------

function initHomePage() {
  const wrap = document.getElementById("home-highlights");
  if (!wrap) return;

  MOVIES.slice(0, 3).forEach((movie) => {
    const card = document.createElement("a");
    card.className = "highlight-card";
    card.href = `movie.html?id=${movie.id}`;
    card.innerHTML = `
      <div class="highlight-card__art">${posterArt(movie)}</div>
      <div class="highlight-card__body">
        <span class="movie-card__genre">${movie.genre}</span>
        <h3 class="highlight-card__title">${movie.title}</h3>
        <p class="highlight-card__desc">${movie.synopsis}</p>
        <span class="highlight-card__link">Book now</span>
      </div>
    `;
    wrap.appendChild(card);
  });
}

// ---------- 10. PAGE: contact.html ----------

function initContactPage() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("contact-status");
  const contactInput = document.getElementById("contact-email");
  const contactError = document.getElementById("contact-email-error");

  contactInput.addEventListener("blur", () => validateContactField(contactInput, contactError));
  contactInput.addEventListener("input", () => {
    if (contactInput.classList.contains("has-error")) {
      validateContactField(contactInput, contactError);
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("contact-name").value.trim();
    if (!name) return;

    if (!validateContactField(contactInput, contactError)) {
      contactInput.focus();
      return;
    }

    status.textContent = `Thanks, ${name}. We'll reply soon.`;
    status.style.display = "block";
    form.reset();
  });
}

// ---------- 11. Run the right setup for whichever page loaded ----------
document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMoviesPage();
  initUpcomingPage();
  initMoviePage();
  initConfirmationPage();
  initBookingsPage();
  initHomePage();
  initContactPage();
});
