export const challengesData = [
	// TRACK 1: EdTech and Campus Life
	{
		trackId: "track-1-edtech-campus-life",
		trackName: "Track 1: EdTech and Campus Life",
		challengeNumber: 1,
		slug: "smart-note-buddy",
		name: "Smart Note Buddy",
		problemStatement:
			"Students gather notes from different places: board snaps, WhatsApp forwards, voice notes, and messy handwritten pages. The goal is to build a tool that takes multiple raw inputs (simulated text blocks or image descriptions) and automatically turns them into clean, consolidated study notes.",
		keyDeliverable:
			"A web application that accepts 3–5 distinct text inputs and outputs a single, formatted study guide based on user-selected templates (e.g., “Bullet Points”, “Q&A”, “Summary”).",
		constraint:
			"The tool must automatically identify and tag 3 core topics (e.g., “Formula”, “Concept”, “Date”) within the raw text and display a clickable navigation panel linking to those sections in the final output.",
	},
	{
		trackId: "track-1-edtech-campus-life",
		trackName: "Track 1: EdTech and Campus Life",
		challengeNumber: 2,
		slug: "student-stress-tracker",
		name: "Student Stress Tracker",
		problemStatement:
			"College stress is real. This tool lets students log how they feel each day (using 5 emoji ratings) with small check-ins. The system must spot patterns, show simple insights, and give small tips to relax.",
		keyDeliverable:
			"A mobile or web application that allows daily check-ins and stores the history locally. It must display a simple line graph visualizing the user’s stress level over the last 7 days.",
		constraint:
			"The system must be able to flag a “Red Alert” day (for example, if the user logged a high-stress score 3 times in a row) and randomly suggest one of five unique relaxation tips (e.g., “Deep breathing video link”, “Go for a walk”) only on these flagged days.",
	},
	{
		trackId: "track-1-edtech-campus-life",
		trackName: "Track 1: EdTech and Campus Life",
		challengeNumber: 3,
		slug: "lab-manual-helper",
		name: "Lab Manual Helper",
		problemStatement:
			"Most students spend hours rewriting lab reports. Teams can make a tool that takes input like readings, observations, and basic graph data, then generates a final, formatted lab record style write-up.",
		keyDeliverable:
			"A web application with form fields for lab data. Submitting the form generates a neatly formatted, print-ready output (simulating a PDF/Word document structure).",
		constraint:
			"The tool must include an automatic calculation feature. Based on two number inputs (for example, Initial Reading Ri and Final Reading Rf), it must calculate and display a final value (e.g., “Result: Rf – Ri”) directly within the generated report structure.",
	},
	{
		trackId: "track-1-edtech-campus-life",
		trackName: "Track 1: EdTech and Campus Life",
		challengeNumber: 4,
		slug: "class-group-chaos-control",
		name: "Class Group Chaos Control",
		problemStatement:
			"Every class group is full of spam and jokes. The idea is for a system that filters simulated messages, highlights key updates (room changes, deadlines, events), and shows them in a clean panel.",
		keyDeliverable:
			"A web interface that processes a simulated feed of messages (stored in a local array/list) and displays only the “Important” ones in a separate, dedicated area.",
		constraint:
			"The filtering system must be driven by a custom keyword list (defined by the user) and must assign a priority visual (e.g., a flashing red banner for “Exam Deadline”, a yellow dot for “Room Change”) based on the content.",
	},

	// TRACK 2: Entertainment and Media
	{
		trackId: "track-2-entertainment-media",
		trackName: "Track 2: Entertainment and Media",
		challengeNumber: 1,
		slug: "contextual-meme-engine",
		name: "Contextual Meme Engine",
		problemStatement:
			"This tool should take a line or a situation (for example, “My face after submitting the wrong file”) and suggest meme formats that fit the emotional tone (embarrassment, panic). The tool uses a dictionary/array of keywords mapped to 5–7 popular template images.",
		keyDeliverable:
			"A web application that takes text input, performs basic sentiment/keyword matching against a local data structure, and displays the best-fitting template image.",
		constraint:
			"The final meme must be instantly shareable by generating a single URL or a base64 string that can be easily copied (simulating image export). The suggested template must have dynamic text placement that adjusts based on the template’s format.",
	},
	{
		trackId: "track-2-entertainment-media",
		trackName: "Track 2: Entertainment and Media",
		challengeNumber: 2,
		slug: "dynamic-playlist-maker",
		name: "Dynamic Playlist Maker",
		problemStatement:
			"Students spend more time choosing music than listening to it. This tool creates playlist suggestions based on three dynamic inputs simultaneously: Energy (slider 1–10), Time of Day (dropdown), and User History (simulated array of liked/skipped songs).",
		keyDeliverable:
			"A music suggestion interface that processes three custom inputs and outputs a list of 5–8 curated song titles/links based on weighted logic defined by the team.",
		constraint:
			"The system must include a simple learning feature: if the user repeatedly clicks a “Skip” button on a suggestion, the weight or score of that song’s genre/artist must be temporarily lowered for the next suggestion cycle.",
	},
	{
		trackId: "track-2-entertainment-media",
		trackName: "Track 2: Entertainment and Media",
		challengeNumber: 3,
		slug: "low-budget-scene-planner",
		name: "Low-Budget Scene Planner",
		problemStatement:
			"College film clubs struggle with cost and logistics. This tool should help teams list scenes, track required props, assign roles, and set a small cost cap. It must suggest ways to stay within budget.",
		keyDeliverable:
			"A structured planning interface that tracks three lists (Scenes, Props, Roles). Users input an estimated cost for each prop. The app displays a real-time visual progress bar showing how close the team is to the total budget cap.",
		constraint:
			"The tool must implement a “Prop Swap” logic. If the estimated cost exceeds the cap, the app must highlight the most expensive prop and suggest a predefined, cheaper alternative from a lookup list (for example, replacing “Expensive Drone” with “Handheld Camera”).",
	},
	{
		trackId: "track-2-entertainment-media",
		trackName: "Track 2: Entertainment and Media",
		challengeNumber: 4,
		slug: "two-minute-reset-generator",
		name: "“Two-Minute Reset” Generator",
		problemStatement:
			"Long study sessions drain energy. This tool generates quick games or puzzles that take under two minutes. The challenge is to make the experience fast, light, and repeatable.",
		keyDeliverable:
			"A web or mobile page that, upon clicking “Start Break”, instantly loads one of three different, simple, randomized challenges (for example, a color-matching test, a 60-second typing challenge, a mini-riddle).",
		constraint:
			"The app must track the user’s high score or fastest completion time for each of the three mini-games and display a simple, competitive leaderboard (stored locally/simulated) to encourage re-engagement.",
	},

	// TRACK 3: Health and Wellness
	{
		trackId: "track-3-health-wellness",
		trackName: "Track 3: Health and Wellness",
		challengeNumber: 1,
		slug: "adaptive-medication-log",
		name: "Adaptive Medication Log",
		problemStatement:
			"Build a simple visual tracker for 3 different medications. The goal is to prevent accidental double-dosing and simplify logging.",
		keyDeliverable:
			"A web or mobile app that allows users to set a schedule and log doses. It must visually display a clear checkmark for a dose taken and a cross/X for a dose missed today.",
		constraint:
			"The system must lock or disable the “Dose Taken” button for the same medication for a mandatory 4-hour period after it is first logged, with a small visual timer showing when the button will reactivate.",
	},
	{
		trackId: "track-3-health-wellness",
		trackName: "Track 3: Health and Wellness",
		challengeNumber: 2,
		slug: "symptom-to-resource-guide",
		name: "“Symptom-to-Resource” Guide",
		problemStatement:
			"Students need fast, easy-to-digest health info. Create a tool where a user inputs one of three common symptoms (for example, headache, sore throat, cough). The app must then instantly display the three most relevant self-care tips and the simulated campus resource to contact (e.g., Nurse, Counselor).",
		keyDeliverable:
			"A web page that uses basic conditional logic (if/else statements) to display different static text based on which of the three symptom buttons the user clicks.",
		constraint:
			"The output must include a priority filter. If the user clicks “Headache” and also checks a box labeled “Severe”, the displayed tips must change to include a new, unique “When to Worry” warning message.",
	},
	{
		trackId: "track-3-health-wellness",
		trackName: "Track 3: Health and Wellness",
		challengeNumber: 3,
		slug: "goal-based-wellness-tracker",
		name: "Goal-Based Wellness Tracker",
		problemStatement:
			"Help students build small, positive habits (for example, 30 minutes reading, 5 minutes stretching). The user should set a goal, and the tool should track their progress towards it daily.",
		keyDeliverable:
			"A mobile or web app where a user can log completion of 3 custom daily goals. The app must display a visually satisfying progress circle that fills up as the user logs the goals.",
		constraint:
			"Implement a “Win Streak” counter. If the user completes all three goals for two consecutive days, the app must unlock and display a random celebratory animation or message on the third day.",
	},
	{
		trackId: "track-3-health-wellness",
		trackName: "Track 3: Health and Wellness",
		challengeNumber: 4,
		slug: "localized-support-finder",
		name: "Localized Support Finder",
		problemStatement:
			"Campus support can be hard to find. Create a simple directory for three simulated campus health services (e.g., Counseling, Pharmacy, Gym).",
		keyDeliverable:
			"A clean, searchable directory page. Users should be able to type a keyword (for example, “stress”) and have the relevant service card (e.g., “Counseling”) be highlighted or filtered to the top.",
		constraint:
			"Each service card must include a dynamic “Current Availability” status (e.g., Green: Available Now, Red: Booked Up) which changes randomly every 15 seconds (simulating real-time updates).",
	},

	// TRACK 4: Green and Sustainable Living
	{
		trackId: "track-4-green-sustainable-living",
		trackName: "Track 4: Green and Sustainable Living",
		challengeNumber: 1,
		slug: "personal-waste-visualizer",
		name: "Personal Waste Visualizer",
		problemStatement:
			"Build a manual logging app where users track their daily waste quantity (simulated units of Plastic, Paper, or General Waste). The goal is to make people conscious of their waste trends.",
		keyDeliverable:
			"A mobile or web app that logs daily waste units (user input). It must display a cumulative total and a simple visual comparison of the current week’s average against the previous week’s average.',",
		constraint:
			"The tool must implement a “Waste Reduction Badge” system. If the user’s current day’s logged waste is lower than their personal weekly average, a small, animated Gold Star or Leaf icon is awarded for that day.",
	},
	{
		trackId: "track-4-green-sustainable-living",
		trackName: "Track 4: Green and Sustainable Living",
		challengeNumber: 2,
		slug: "adopt-a-sapling-care-log",
		name: "“Adopt-A-Sapling” Care Log",
		problemStatement:
			"Help students manage their planted saplings by sending care reminders, logging growth with pictures, and guiding on water needs. Students should be able to manage multiple simulated saplings.",
		keyDeliverable:
			"A mobile or web app that tracks 3–5 individual saplings. Each profile must have an editable log for “Last Watered” and “Last Photo Taken”.",
		constraint:
			"Implement a rule-based urgency system: The app must calculate the time since the “Last Watered” log. If that time exceeds a predefined maximum (for example, 5 days), the sapling’s profile icon must visually change to a dry, wilting icon and its background must flash a low-priority amber color.",
	},
	{
		trackId: "track-4-green-sustainable-living",
		trackName: "Track 4: Green and Sustainable Living",
		challengeNumber: 3,
		slug: "estimated-energy-waste-dashboard",
		name: "Estimated Energy Waste Dashboard",
		problemStatement:
			"This tool shows students how much energy is wasted by leaving appliances on and how simple actions cut the loss. The idea is to estimate energy use based on simple user inputs.",
		keyDeliverable:
			"A web dashboard for a simulated hostel room or classroom. It takes 3 simple inputs (for example, Time Fan Left On, Time Light Left On, Charger Left Plugged In). It then calculates and displays a fictional wasted monetary cost (e.g., ₹5.00/hour for the fan).",
		constraint:
			"The dashboard must include a “Reduction Scenario” toggle. Flipping the toggle instantly reduces all input times by 50% and displays the new, lower wasted cost in a different color, showing the benefit of small actions.",
	},
	{
		trackId: "track-4-green-sustainable-living",
		trackName: "Track 4: Green and Sustainable Living",
		challengeNumber: 4,
		slug: "campus-swap-corner",
		name: "Campus Swap Corner",
		problemStatement:
			"Build a simple platform where students can trade, lend, or borrow items (lab coats, books, etc.) to reduce waste. It needs a clean system to post, track, and mark items as picked.",
		keyDeliverable:
			"A simulated platform where users can post items (with a description and category) to a master list. The list must allow sorting by Item Category and Date Posted (simulated).",
		constraint:
			"When a user “Claims” an item, the item must move from the “Available” list to a separate “In Circulation” list. The “In Circulation” list must automatically display a simulated return due date (for example, 7 days from the claim date).",
	},

	// TRACK 5: Social Impact and Community
	{
		trackId: "track-5-social-impact-community",
		trackName: "Track 5: Social Impact and Community",
		challengeNumber: 1,
		slug: "smart-lost-and-found-hub",
		name: "Smart Lost & Found Hub",
		problemStatement:
			"Students lose items, and tracking is scattered. This hub provides a clean, central place to upload found items and for owners to search easily. The goal is to quickly match items.",
		keyDeliverable:
			"A simulated multi-user web platform where users can post items (with Category, Location Found, Date) and view a list of all current lost items.",
		constraint:
			"The system must implement a smart matching feature: When a user inputs a search query (for example, “blue bag”), the hub must assign a confidence score (such as 75% match) to all relevant posts and sort them by this score.",
	},
	{
		trackId: "track-5-social-impact-community",
		trackName: "Track 5: Social Impact and Community",
		challengeNumber: 2,
		slug: "crowd-helper-status-board",
		name: "“Crowd Helper” Status Board",
		problemStatement:
			"Canteens, corridors, and labs get crowded. This tool shows a simple, real-time view of how busy different campus areas are to help students pick smoother routes or timings.",
		keyDeliverable:
			"A dashboard showing 5 predefined campus locations (for example, Library, Canteen, Main Corridor). Each location must have a visual status (color-coded circle: Green/Low, Yellow/Medium, Red/High).",
		constraint:
			"The status must cycle randomly between the three states every 15–20 seconds (simulating real-time updates). Additionally, the system must log the previous state, and if a location is High/Red for 3 consecutive cycles, it triggers a “Bottleneck Alert” icon next to the location.",
	},
	{
		trackId: "track-5-social-impact-community",
		trackName: "Track 5: Social Impact and Community",
		challengeNumber: 3,
		slug: "quick-help-micro-board",
		name: "Quick-Help Micro-Board",
		problemStatement:
			"Students need tiny, non-monetary help (notes, guidance, classroom location). This is a simple place where students post small tasks and others respond, fostering a safe and light community support system.",
		keyDeliverable:
			"A simulated forum or message board where users can post “Help Requests” (Title, Category, Location). The board must allow other simulated users to click an “I Can Help” button.",
		constraint:
			"Once a post reaches 3 “I Can Help” clicks, the system must automatically hide the post from the main feed and move it to a separate “Request Fulfilled” list, keeping the main board clean and active.",
	},
	{
		trackId: "track-5-social-impact-community",
		trackName: "Track 5: Social Impact and Community",
		challengeNumber: 4,
		slug: "local-language-bridge",
		name: "Local Language Bridge",
		problemStatement:
			"Many on campus struggle with local phrases. This tool helps break that gap by teaching short lines used in daily life (canteen, hostel talk) with quick audio and translations.",
		keyDeliverable:
			"A mobile or web application displaying 10 essential phrases in 3 categories (for example, Greetings, Food, Directions). Each phrase must have the original language text and a translation.",
		constraint:
			"Each phrase must include a simulated audio button that, when clicked, dynamically changes the font or background color of the text for 2 seconds to signal that the audio (simulated) is playing, helping users focus on the pronunciation.",
	},

	// TRACK 6: Open Innovation
	{
		trackId: "track-6-open-innovation",
		trackName: "Track 6: Open Innovation",
		challengeNumber: 1,
		slug: "conflict-free-schedule-tuner",
		name: "Conflict-Free Schedule Tuner",
		problemStatement:
			"Students juggle many commitments, often leading to stressful overlaps. This tool should take all events, tasks, and deadlines from a student (input list) and rearrange them into a routine with no conflicts.",
		keyDeliverable:
			"A web application that accepts a list of events with defined start/end times. The core function is to analyze the list and output a new, sorted list that clearly highlights the first three conflicts detected and suggests a non-clashing time slot for the latest conflicting event.",
		constraint:
			"Implement a visual urgency display. Events with a simulated “Academic Deadline” must appear in a specific, high-contrast color, and the event card must flash when a conflict is detected.",
	},
	{
		trackId: "track-6-open-innovation",
		trackName: "Track 6: Open Innovation",
		challengeNumber: 2,
		slug: "chat-with-your-files-query-tool",
		name: "“Chat with Your Files” Query Tool",
		problemStatement:
			"Students need to interact with large notes/PDFs without reading everything. This tool allows users to upload a file (simulated text content) and ask simple questions, with the system providing clear answers.",
		keyDeliverable:
			"A web interface with a text input area (simulating the file content) and a separate “Question” input field. The tool must use basic string-matching logic (keyword search) to find the relevant sentence/paragraph containing the answer within the file content.",
		constraint:
			"The system must include a Confidence Score for the answer. If the search term appears only once in the document, display a 100% score. If the term appears 5 or more times, display a lower score (for example, 60%) to indicate ambiguity, requiring custom logic.",
	},
	{
		trackId: "track-6-open-innovation",
		trackName: "Track 6: Open Innovation",
		challengeNumber: 3,
		slug: "voice-based-task-helper",
		name: "Voice-Based Task Helper",
		problemStatement:
			"Create a small, simple voice assistant focusing on just a few tasks (for example, set reminders, check schedule, answer small queries) to be practical during college rush hours. Teams should simulate the voice command recognition.",
		keyDeliverable:
			"A web page with a large, central “Speak Now” button. Clicking the button processes a simulated command (from a predefined list of 5 commands) and outputs the corresponding action (for example, “Set Reminder”, “Check Time”).",
		constraint:
			"The core constraint is the two-step action. If the user’s command is “Set Reminder”, the assistant must first prompt the user with a follow-up question (for example, “For what time?”) and only then display the final result.",
	},
	{
		trackId: "track-6-open-innovation",
		trackName: "Track 6: Open Innovation",
		challengeNumber: 4,
		slug: "centralized-campus-event-radar",
		name: "Centralized Campus Event Radar",
		problemStatement:
			"Clubs post events everywhere. This tool collects all events (simulated data) in one place and sorts them by date, club, or interest, acting as a clean dashboard for all campus happenings.",
		keyDeliverable:
			"A dashboard displaying a list of simulated events (Club Name, Date, Type). The dashboard must include a multi-select filter allowing users to select events by both Club Name AND Event Type simultaneously.",
		constraint:
			"The dashboard must automatically apply a “Popularity” filter: Any event that has a simulated registration count over 50 must have a persistent “Trending 🔥” badge applied to its card, overriding the default sorting order.",
	},
];
