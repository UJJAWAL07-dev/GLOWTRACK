// script.js

// ---------- GLOBAL HELPERS ----------
function getUserData() {
  try {
    return JSON.parse(localStorage.getItem("glowfitUser")) || null;
  } catch {
    return null;
  }
}

function saveUserData(data) {
  localStorage.setItem("glowfitUser", JSON.stringify(data));
}

function saveChosenPlan(type) {
  localStorage.setItem("glowfitPlan", type);
}

function getChosenPlan() {
  return localStorage.getItem("glowfitPlan") || "";
}

function saveCalendarState(state) {
  localStorage.setItem("glowfitCalendar", JSON.stringify(state));
}

function getCalendarState() {
  try {
    return JSON.parse(localStorage.getItem("glowfitCalendar")) || {};
  } catch {
    return {};
  }
}

// ---------- INDEX PAGE ----------
(function initIndex() {
  const form = document.getElementById("userForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById("name").value.trim(),
      age: Number(document.getElementById("age").value),
      height: Number(document.getElementById("height").value),
      weight: Number(document.getElementById("weight").value),
      activity: document.getElementById("activity").value,
      goalPreference: document.getElementById("goalPreference").value,
      bloodGroup: document.getElementById("bloodGroup").value,
      region: document.getElementById("region").value,
    };
    saveUserData(data);
    window.location.href = "dashboard.html";
  });
})();

// ---------- DASHBOARD PAGE ----------
(function initDashboard() {
  const greetingEl = document.getElementById("greetingText");
  if (!greetingEl) return;

  const user = getUserData();
  if (!user) {
    greetingEl.textContent = "Hello, Glow!";
    return;
  }

  const now = new Date();
  const hour = now.getHours();
  let greet = "Hello";
  if (hour >= 5 && hour < 12) greet = "Good morning";
  else if (hour >= 12 && hour < 18) greet = "Good evening";
  else greet = "Good night";
  greetingEl.textContent = `${greet}, ${user.name || "Glow"} ✨`;

  const summaryEl = document.getElementById("userSummary");
  if (summaryEl) {
    summaryEl.textContent = `${user.age} yrs • ${user.height} cm • ${user.weight} kg • Activity: ${user.activity}`;
  }

  const motivationList = [
    "Small consistent steps beat random intense days.",
    "You don’t have to be extreme, just consistent.",
    "One more tiny win today is enough.",
    "Your future self will thank you for even 10 minutes.",
    "Progress over perfection, always.",
  ];
  const dailyMotivation = document.getElementById("dailyMotivation");
  if (dailyMotivation) {
    const quote = motivationList[now.getDate() % motivationList.length];
    dailyMotivation.textContent = `🌟 Today’s motivation: ${quote}`;
  }

  const bmiEl = document.getElementById("bmiValue");
  const bmiStatusEl = document.getElementById("bmiStatus");
  const bmrEl = document.getElementById("bmrValue");
  const suggestedPlanEl = document.getElementById("suggestedPlan");

  const hM = user.height / 100;
  const bmi = user.weight / (hM * hM);
  const bmiRounded = bmi ? bmi.toFixed(1) : "--";
  if (bmiEl) bmiEl.textContent = bmiRounded;

  let status = "Unknown";
  if (bmi < 18.5) status = "Underweight";
  else if (bmi < 25) status = "Normal";
  else if (bmi < 30) status = "Overweight";
  else status = "Obese";
  if (bmiStatusEl) bmiStatusEl.textContent = `You are in the ${status} range.`;

  let bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
  if (bmrEl) bmrEl.textContent = Math.round(bmr);

  let suggested = "Balanced";
  if (user.goalPreference) {
    if (user.goalPreference === "lose") suggested = "Lose Weight";
    else if (user.goalPreference === "gain") suggested = "Gain Weight";
    else if (user.goalPreference === "muscle") suggested = "Gain Muscle";
  } else {
    if (bmi < 18.5) suggested = "Gain Weight";
    else if (bmi > 25) suggested = "Lose Weight";
    else suggested = "Gain Muscle";
  }

  if (suggestedPlanEl) suggestedPlanEl.textContent = suggested;

  initCalendarAndStreak();
})();

function initCalendarAndStreak() {
  const grid = document.getElementById("calendarGrid");
  const monthLabel = document.getElementById("calendarMonth");
  const streakEl = document.getElementById("streakCount");
  const progressFill = document.getElementById("progressFill");
  const insightsText = document.getElementById("insightsText");
  const poppers = document.getElementById("partyPoppers");

  if (!grid) return;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const state = getCalendarState();

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  if (monthLabel) monthLabel.textContent = `${monthNames[month]} ${year}`;

  grid.innerHTML = "";

  let completedCount = 0;
  let longestStreak = 0;
  let currentStreak = 0;

  function updateStreakNumbers() {
    if (streakEl) streakEl.textContent = currentStreak;
    const progress = daysInMonth ? (completedCount / daysInMonth) * 100 : 0;
    if (progressFill) progressFill.style.width = `${progress}%`;

    if (insightsText) {
      if (completedCount === 0) {
        insightsText.textContent = "Complete a few days to unlock insights here.";
      } else {
        insightsText.textContent =
          `You have completed ${completedCount} days this month. ` +
          `Current streak: ${currentStreak} days. Longest streak: ${longestStreak} days.`;
      }
    }
  }

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "cal-day empty";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${month + 1}-${day}`;
    const status = state[key] || "none";
    const div = document.createElement("div");
    div.className = "cal-day";

    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      div.classList.add("today");
    }

    const numberSpan = document.createElement("span");
    numberSpan.textContent = day;

    const emojiSpan = document.createElement("span");
    emojiSpan.className = "cal-emoji";

    if (status === "done") {
      div.classList.add("completed");
      emojiSpan.textContent = "🔥";
      completedCount++;
    } else if (status === "miss") {
      emojiSpan.textContent = "😴";
    } else {
      emojiSpan.textContent = "";
    }

    div.appendChild(numberSpan);
    div.appendChild(emojiSpan);

    div.addEventListener("click", () => {
      let current = state[key] || "none";
      if (current === "none") {
        state[key] = "done";
        div.classList.add("completed");
        emojiSpan.textContent = "🔥";
      } else if (current === "done") {
        state[key] = "miss";
        div.classList.remove("completed");
        emojiSpan.textContent = "😴";
      } else {
        state[key] = "none";
        div.classList.remove("completed");
        emojiSpan.textContent = "";
      }
      saveCalendarState(state);

      let done = 0;
      Object.keys(state).forEach((k) => {
        if (state[k] === "done") {
          done++;
        }
      });

      completedCount = done;

      let streak = 0;
      let longest = 0;
      const temp = new Date(year, month, daysInMonth);
      while (true) {
        const k = `${temp.getFullYear()}-${temp.getMonth() + 1}-${temp.getDate()}`;
        if (state[k] === "done") {
          streak++;
          if (streak > longest) longest = streak;
        } else if (state[k] === "miss") {
          if (streak > longest) longest = streak;
          break;
        } else {
          break;
        }
        temp.setDate(temp.getDate() - 1);
      }

      currentStreak = streak;
      longestStreak = longest;
      updateStreakNumbers();

      if (streak > 0 && streak % 3 === 0 && poppers) {
        poppers.style.display = "block";
        setTimeout(() => {
          poppers.style.display = "none";
        }, 1500);
      }
    });

    grid.appendChild(div);
  }

  Object.keys(state).forEach((k) => {
    if (state[k] === "done") completedCount++;
  });
  const temp2 = new Date(year, month, daysInMonth);
  while (true) {
    const k = `${temp2.getFullYear()}-${temp2.getMonth() + 1}-${temp2.getDate()}`;
    if (state[k] === "done") {
      currentStreak++;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
    } else if (state[k] === "miss") {
      if (currentStreak > longestStreak) longestStreak = currentStreak;
      break;
    } else {
      break;
    }
    temp2.setDate(temp2.getDate() - 1);
  }

  updateStreakNumbers();
}

// ---------- PLAN PAGE (TEXT-ONLY WORKOUTS) ----------
(function initPlanPage() {
  const titleEl = document.getElementById("planTitle");
  if (!titleEl) return;

  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") || "lose";
  const descEl = document.getElementById("planDescription");
  const tagMain = document.getElementById("planTagMain");
  const heroImg = document.getElementById("planHeroImg");

  let title = "Your Plan";
  let desc = "";
  let tag = "";
  let heroSrc = heroImg ? heroImg.src : "";

  if (type === "lose") {
    title = "Lose Weight Plan 🍃";
    desc =
      "A gentle, sustainable plan focusing on movement, light strength and a small calorie deficit. Perfect if you want to feel lighter without extreme dieting.";
    tag = "Lose Weight";
    heroSrc = "https://img.sanishtech.com/u/f1eb5ba71438fff93605b2b15a39a658.jpg";
  } else if (type === "gain") {
    title = "Gain Weight Plan 🍛";
    desc =
      "A structured surplus plan that teaches you how to eat a bit more, more often, with healthy fats and strength training to gain weight gradually.";
    tag = "Gain Weight";
    heroSrc = "https://img.sanishtech.com/u/f7493ece1dd3e754d61fd64c41c68d54.jpg";
  } else if (type === "muscle") {
    title = "Gain Muscle Plan 🏋️‍♀️";
    desc =
      "A progressive strength routine with rest days, focused on building muscle safely using bodyweight or simple home equipment if available.";
    tag = "Gain Muscle";
    heroSrc = "https://img.sanishtech.com/u/b72ca5732ce799b4acd52c535c44d073.jpg";
  }

  titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;
  if (tagMain) tagMain.textContent = tag;
  if (heroImg) heroImg.src = heroSrc;

  const chooseBtn = document.getElementById("choosePlanBtn");
  if (chooseBtn) {
    chooseBtn.addEventListener("click", () => {
      saveChosenPlan(type);
      alert("Plan selected! It will show on your dashboard and calendar streaks. ✅");
      window.location.href = "dashboard.html#plans";
    });
  }

  buildWeekTabs(type);
})();

function buildWeekTabs(type) {
  const container = document.getElementById("weekTabs");
  const user = getUserData();
  if (!container || !user) return;

  const dietTypeSelect = document.getElementById("dietType");
  const region = user.region || "other";
  const days = ["Day 1","Day 2","Day 3","Day 4","Day 5","Day 6","Day 7"];

  function workoutText(dayIndex) {
    const base = {
      lose: [
        "Warm-up: 5 min easy walking at home.\nMain: 20–25 min brisk walk + 10 bodyweight squats (2 sets), wall push-ups (2 sets of 8–10), gentle neck/shoulder rolls.\nCool-down: 5 min light stretching for legs and back.",
        "Warm-up: 5 min spot marching.\nMain: 3 sets of 12 squats (chair-supported if needed), 3 sets of 10 wall push-ups, 2 sets of 20 seconds plank on knees.\nCool-down: slow full-body stretching.",
        "Warm-up: 5 min dynamic movements.\nMain: 30 min low-impact cardio (walking, step-ups on stairs, or light cycling).\nCool-down: ankle, hamstring and calf stretches.",
        "Warm-up: 5 min walking.\nMain (Core day): 3×20-sec plank on knees, 3×12 bird-dogs, 2×15 lying leg marches, 2×15 seated twists.\nCool-down: gentle spine and hip stretches.",
        "Warm-up: 5 min walking.\nMain: 20 min steady walk + 2 sets of 15 glute bridges + 2 sets of 15 calf raises.\nCool-down: breathing exercises (3–5 min) + light stretch.",
        "Warm-up: 5 min.\nMain: Light full-body circuit (2–3 rounds): 12 squats, 10 wall push-ups, 15 glute bridges, 20 marching steps.\nCool-down: stretch legs, chest and shoulders.",
        "Recovery / flexible day: easy walk 15–20 min or yoga/stretching at home.\nFocus on relaxing and preparing for the next week.",
      ],
      gain: [
        "Warm-up: 5 min slow walk.\nMain: 2 sets of 10–12 squats, 2 sets of 10 wall push-ups, 2 sets of 10 glute bridges.\nGoal: stimulate appetite and muscles gently.\nCool-down: light stretch.",
        "Warm-up: 5 min.\nMain: 3 sets of 12 squats, 3 sets of 12 glute bridges, 2 sets of 10 bottle rows (water bottles as weights).\nCool-down: soft stretching.",
        "Warm-up: 5–10 min relaxed walk.\nMain: 20–30 min walking at comfortable pace.\nFocus: moving body to support digestion and hunger.\nCool-down: deep breathing.",
        "Warm-up: 5 min.\nMain (Posture & core): 3×15-second planks (on knees if needed), 3×10 superman holds, 2×15 shoulder blade squeezes.\nCool-down: shoulder and back stretches.",
        "Warm-up: 5 min easy movement.\nMain: 2–3 rounds: 12 squats, 12 glute bridges, 10 push-ups (wall/knee), 20 marching steps.\nCool-down: full-body stretch.",
        "Warm-up: 5 min fun movement (dance / walk).\nMain: choose a fun activity (casual sports, light cycling, dancing) for 25–30 min.\nCool-down: deep breathing and stretch.",
        "Rest / reset day: gentle stretching + walk 10–15 min.\nFocus on planning next week’s meals and sleep.",
      ],
      muscle: [
        "Warm-up: 5–8 min dynamic movements.\nMain (Full-body): 3×12 squats, 3×8–10 push-ups (knee/wall), 3×12 bent-over rows (with bottles), 2×15 glute bridges.\nRest: 60–90 sec between sets.\nCool-down: leg and chest stretches.",
        "Warm-up: 5 min.\nMain (Lower body): 3×12 squats, 3×10 lunges (each leg, supported if needed), 3×15 calf raises, 2×12 glute bridges.\nCool-down: quads and hamstrings stretches.",
        "Warm-up: 5 min arm circles and shoulder rolls.\nMain (Upper body): 3×10 push-ups (knee/wall), 3×12 bottle rows, 3×12 chair dips, 2×15 shoulder taps (slow).\nCool-down: arms and chest stretching.",
        "Warm-up: 5 min.\nMain (Core): 3×30-sec planks (or 20-sec if hard), 3×12 side planks each side (short holds), 3×15 lying leg raises/marches, 2×20 Russian twists without weight.\nCool-down: gentle back and hip stretches.",
        "Warm-up: 5–8 min.\nMain (Full-body progression): 3×12 squats (slightly deeper), 3×10 push-ups, 3×12 rows, 2×15 lunges, 2×15 glute bridges.\nCool-down: full-body stretch.",
        "Active recovery: 20–30 min easy walking, mobility drills for ankles, hips and shoulders.\nFocus on breathing and relaxation.",
        "Warm-up: 5–8 min.\nMain (Stronger full-body circuit): 3–4 rounds of 12 squats, 10 push-ups, 12 rows, 15 glute bridges, 20-sec plank.\nCool-down: long stretch and deep breathing.",
      ],
    };
    return base[type][dayIndex];
  }

  function dietText(dayIndex, dietType, region) {
    const isVeg = dietType === "veg";
    const r = region;

    const indianVeg = [
      "Breakfast: Poha / upma + curd • Lunch: Dal, sabzi, roti • Dinner: Khichdi + salad",
      "Breakfast: Vegetable oats • Lunch: Rajma rice (small portion) • Dinner: Roti, dal, salad",
      "Breakfast: Idli sambhar • Lunch: Mixed veg pulao + raita • Dinner: Roti, paneer bhurji",
      "Breakfast: Besan chilla • Lunch: Dal, bhindi, roti • Dinner: Light veg soup + roti",
      "Breakfast: Sprouts chaat • Lunch: Chole + 1–2 phulka • Dinner: Dalia + veg",
      "Breakfast: Stuffed veg paratha (less oil) • Lunch: Simple thali • Dinner: Curd rice",
      "Flexible desi veg meals with fruits & nuts.",
    ];

    const indianNonVeg = [
      "Breakfast: Eggs + toast • Lunch: Chicken curry + rice (small) • Dinner: Roti + chicken bhuna",
      "Breakfast: Paneer / egg bhurji • Lunch: Fish curry + rice • Dinner: Roti + dal + chicken",
      "Breakfast: Omelette with veggies • Lunch: Chicken pulao (small) • Dinner: Roti + grilled chicken",
      "Breakfast: Poha + eggs • Lunch: Simple thali with chicken • Dinner: Light soup + roti",
      "Breakfast: Idli + eggs • Lunch: Egg curry + roti • Dinner: Rice + dal + some chicken",
      "Breakfast: Paratha + curd • Lunch: Biryani (small portion) + salad • Dinner: Light khichdi",
      "Flexible non-veg meals keeping portion under control.",
    ];

    const pakVeg = [
      "Paratha (less oil) + chai • Daal chawal + salad • Sabzi + roti",
      "Chana chaat • Daal, bhindi, roti • Vegetable pulao + raita",
      "Aloo chana with roti • Mixed veg curry + rice • Daal + sabzi + roti",
      "Suji halwa (small) + chai • Daal + saag + roti • Light veg soup + bread",
      "Sprouts or lentils • Daal makhni (small) + roti • Rice + sabzi",
      "Roti + sabzi • Simple thali • Yoghurt + salad",
      "Simple homemade veg food, fruits as snacks.",
    ];

    const pakNonVeg = [
      "Anda paratha (less oil) • Chicken curry + rice • Roti + chicken roast",
      "Boiled eggs • Daal + chicken • Fish curry + rice",
      "Omelette + roti • Chicken pulao • Roti + chicken handi",
      "Chana + eggs • Daal + chicken • Light soup + roti",
      "Anda bhurji • Chicken karahi (small) + roti • Rice + daal + chicken piece",
      "Paratha + anda • Biryani (small) + salad • Simple roti + daal",
      "Regular non-veg with mindful portions.",
    ];

    const otherVeg = [
      "Whole-grain toast + peanut butter • Veg rice bowl • Soup + salad",
      "Oats with fruits • Lentil soup + bread • Veg curry + rice",
      "Smoothie bowl • Veg sandwich • Pasta with veggies",
      "Eggless pancake (small) • Bean salad • Roasted veggies + quinoa",
      "Yogurt + granola • Stir-fried veggies + rice • Wrap with beans & veggies",
      "Sprouts & salad • Veg burrito bowl • Noodle soup",
      "Balanced veg plates with fruits & nuts.",
    ];

    const otherNonVeg = [
      "Eggs + toast • Chicken salad • Grilled chicken + veggies",
      "Yogurt + fruits • Turkey / chicken sandwich • Fish + rice + salad",
      "Smoothie + eggs • Chicken rice bowl • Meat + veggies",
      "Omelette • Bean + chicken salad • Soup + bread + some meat",
      "Boiled eggs • Stir-fry with chicken • Wrap with meat & veg",
      "Cheese toast • Chicken pasta (small) • Soup night",
      "Balanced non-veg meals, fruits in between.",
    ];

    let list;
    if (r === "india") {
      list = isVeg ? indianVeg : indianNonVeg;
    } else if (r === "pakistan") {
      list = isVeg ? pakVeg : pakNonVeg;
    } else {
      list = isVeg ? otherVeg : otherNonVeg;
    }
    return list[dayIndex];
  }

  function renderCards() {
    container.innerHTML = "";
    const dietType = dietTypeSelect ? dietTypeSelect.value : "veg";

    days.forEach((label, idx) => {
      const card = document.createElement("div");
      card.className = "week-day";

      const title = document.createElement("h4");
      title.textContent = label;
      card.appendChild(title);

      const workoutP = document.createElement("p");
      workoutP.textContent = "Workout:";
      card.appendChild(workoutP);

      const workoutDetail = document.createElement("p");
      workoutDetail.className = "small";
      workoutDetail.textContent = workoutText(idx);
      card.appendChild(workoutDetail);

      const dietLabel = document.createElement("p");
      dietLabel.style.marginTop = "4px";
      dietLabel.textContent = "Diet idea:";
      card.appendChild(dietLabel);

      const dietDetail = document.createElement("p");
      dietDetail.className = "small";
      dietDetail.textContent = dietText(idx, dietType, region);
      card.appendChild(dietDetail);

      const tip = document.createElement("p");
      tip.className = "small";
      tip.style.marginTop = "4px";
      tip.textContent = "Tip: Move at your own pace. You can repeat a day if it feels good.";
      card.appendChild(tip);

      container.appendChild(card);
    });
  }

  renderCards();

  if (dietTypeSelect) {
    dietTypeSelect.addEventListener("change", () => {
      renderCards();
    });
  }
}
