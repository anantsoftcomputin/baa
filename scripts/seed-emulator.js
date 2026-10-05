/**
 * Seeds the local Firebase emulators with demo data so the whole portal can be
 * explored without touching production.
 *
 *   npm run emulators          # terminal 1
 *   npm run emulators:seed     # terminal 2
 *   npm run start:emulators    # terminal 3 → http://localhost:3000
 *
 * Demo logins (password for all: Password123!):
 *   admin@baa.test (Superuser) · asha@baa.test (member) · rohan@baa.test (user)
 */
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8485";
process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9411";

const admin = require("../functions/node_modules/firebase-admin");

const PROJECT_ID = process.env.GCLOUD_PROJECT || "demo-baa";
admin.initializeApp({ projectId: PROJECT_ID });
const db = admin.firestore();
const auth = admin.auth();
const { Timestamp } = admin.firestore;

const PASSWORD = "Password123!";
const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};
const ago = (hours) => Timestamp.fromDate(new Date(Date.now() - hours * 3600 * 1000));
const img = (seed, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const USERS = [
  { uid: "admin", email: "admin@baa.test", username: "Meera Shah", userRole: "Superuser", is_member: true, batchyear: 1998, job_title: "Principal Architect", company: "Studio Shah", city: "Vadodara", country: "India", bio: "Alumni committee secretary. Ask me about the 25-year reunion!", show_email: true },
  { uid: "asha", email: "asha@baa.test", username: "Asha Patel", userRole: "User", is_member: true, batchyear: 2008, job_title: "Product Manager", company: "Fintech Co.", city: "Bengaluru", country: "India", bio: "Building payments products. Happy to mentor students interested in tech.", is_mentor: true, mentorship_areas: "Product management, Careers in tech", skills: "Product, Strategy, SQL", show_email: true },
  { uid: "rohan", email: "rohan@baa.test", username: "Rohan Mehta", userRole: "User", is_member: false, batchyear: 2008, job_title: "Doctor", company: "City Hospital", city: "Ahmedabad", country: "India" },
  { uid: "kavya", email: "kavya@baa.test", username: "Kavya Desai", userRole: "User", is_member: true, batchyear: 2012, job_title: "Data Scientist", company: "Analytics Lab", city: "Pune", country: "India" },
  { uid: "neel", email: "neel@baa.test", username: "Neel Joshi", userRole: "User", is_member: false, batchyear: 2015, job_title: "Founder", company: "GreenRoots", city: "London", country: "UK" },
];

const seed = async () => {
  // ---- auth + profiles
  for (const u of USERS) {
    await auth.deleteUser(u.uid).catch(() => {});
    await auth.createUser({ uid: u.uid, email: u.email, password: PASSWORD, displayName: u.username, emailVerified: true });
    const { uid, ...profile } = u;
    await db.doc(`users/${uid}`).set({
      ...profile,
      emailVerified: true,
      terms_confirmed: true,
      following: [],
      followers: [],
      createdAt: ago(24 * 30),
      ...(profile.is_member ? { membershipDate: ago(24 * 60) } : {}),
    });
  }
  await db.doc("users/asha").update({ following: ["kavya"], followers: ["kavya"] });
  await db.doc("users/kavya").update({ following: ["asha"], followers: ["asha"] });

  // ---- website content
  await db.doc("websiteContent/aboutUs").set({
    mission: "To keep every Bhavanite connected — to each other and to the school — through mentorship, service and celebration.",
    vision: "A thriving, lifelong community of alumni who give back to the institution and to society.",
    history: "Started by a handful of alumni in the 1990s, the association now brings together thousands of Bhavanites across the world.",
  });
  await db.doc("websiteContent/heroImages").set({
    images: [
      { image: img("baa-hero-1", 1920, 1080), title: "", subtitle: "" },
      { image: img("baa-hero-2", 1920, 1080), title: "Reunions, revisited.", subtitle: "Join us for the 25-year reunion this winter." },
    ],
  });
  await db.doc("websiteContent/contact").set({ email: "alumni@bhavansvadodara.test", phone: "+91 265 000 0000", address: "Bhavan's School, Makarpura Road,\nVadodara, Gujarat 390010" });
  await db.doc("websiteContent/footer").set({ copyright_text: "Bhavan's Alumni Association, Vadodara.", facebook_link: "facebook.com", instagram_link: "instagram.com", linkedin_link: "linkedin.com" });
  await db.doc("websiteContent/membership").set({ amount: 2500 });

  // ---- events
  const events = [
    { id: "reunion-25", name: "Silver Jubilee Reunion — Batch of 1999", description: "Twenty-five years on! Join classmates and teachers for an evening of memories, music and dinner on campus.\n\nDress code: smart casual.", start_date: day(21), end_date: day(21), start_time: "18:00", end_time: "22:30", location: "School Auditorium, Vadodara", registration_deadline: day(18), amount: 1500, guest_amount: 750, image: img("baa-event-1") },
    { id: "career-day", name: "Career Day: Alumni × Students", description: "Alumni from medicine, tech, law and the arts share their journeys with Class 11 and 12 students.", start_date: day(9), end_date: day(9), start_time: "10:00", end_time: "14:00", location: "Library Hall", amount: 0, image: img("baa-event-2") },
    { id: "cricket", name: "Alumni Cricket Cup", description: "Batch vs batch T10 cricket on the school ground. Teams of 8; spectators welcome.", start_date: day(40), end_date: day(41), start_time: "07:30", end_time: "12:00", location: "School Ground", amount: 300, image: img("baa-event-3") },
    { id: "diwali", name: "Diwali Get-together 2023", description: "Our annual festive evening.", start_date: day(-200), end_date: day(-200), start_time: "19:00", end_time: "22:00", location: "Club House", amount: 0, image: img("baa-event-4") },
  ];
  for (const { id, ...e } of events) await db.doc(`events/${id}`).set({ ...e, createdAt: ago(100) });

  // ---- initiatives
  await db.doc("initiatives/library").set({ name: "Library Renewal Fund", purpose: "Modernise the school library with new books, reading nooks and a digital catalogue for students.", category: "Infrastructure", status: "Active", total_funds_required: 500000, raised_amount: 186000, contributors_count: 42, start_date: day(-30), end_date: day(120), imageUrl: img("baa-init-1"), createdAt: ago(300) });
  await db.doc("initiatives/scholarship").set({ name: "Merit-cum-Means Scholarships", purpose: "Fund full tuition for deserving students whose families need support.", category: "Education", status: "Active", total_funds_required: 1000000, raised_amount: 640000, contributors_count: 118, imageUrl: img("baa-init-2"), createdAt: ago(200) });
  await db.doc("initiatives/trees").set({ name: "Green Campus Drive", purpose: "Plant 500 native trees around the campus and maintain them for three years.", category: "Environment", status: "Completed", total_funds_required: 150000, raised_amount: 150000, contributors_count: 64, imageUrl: img("baa-init-3"), createdAt: ago(100) });

  // ---- committee, achievements, testimonials, blogs, gallery
  const committee = [
    ["Meera Shah", "President", 1], ["Vikram Rao", "Vice President", 2], ["Priya Nair", "Secretary", 3], ["Arjun Bhatt", "Treasurer", 4],
  ];
  for (const [name, position, order] of committee) {
    await db.collection("committee").add({ name, position, order, email: `${name.split(" ")[0].toLowerCase()}@baa.test`, description: `${name} has served the association since 2015.`, imageUrl: img(`baa-person-${order}`, 600, 750) });
  }
  await db.collection("achievements").add({ title: "National Science Olympiad — Gold", description: "Alumni-mentored students won gold at the national round.", date: day(-60), category: "Academics", imageUrl: img("baa-ach-1") });
  await db.collection("achievements").add({ title: "₹6 lakh raised for scholarships", description: "Thanks to 118 contributors in a single quarter.", date: day(-20), category: "Community", imageUrl: img("baa-ach-2") });
  await db.collection("achievements").add({ title: "Alumni Excellence Award", description: "Dr. Rohan Mehta recognised for rural healthcare work.", date: day(-90), category: "Recognition", imageUrl: img("baa-ach-3") });
  const quotes = [
    ["Asha Patel", "Product Manager", "2008", "The reunion brought back so many memories. It's wonderful to see the school through the alumni's eyes."],
    ["Kavya Desai", "Data Scientist", "2012", "Mentoring students through BAA has been the most rewarding thing I've done this year."],
    ["Neel Joshi", "Founder, GreenRoots", "2015", "Found my first investor at an alumni meetup. Never underestimate your batchmates!"],
    ["Meera Shah", "Architect", "1998", "Twenty-five years later, Bhavan's still feels like home."],
  ];
  for (const [name, designation, graduation_year, testimonial] of quotes) {
    await db.collection("testimonials").add({ name, designation, graduation_year, testimonial, rating: 5 });
  }
  const blogs = [
    ["What 25 years taught us", "Meera Shah", ["Reunion", "Stories"], "When we walked out of the school gates in 1999, none of us knew where life would take us. Twenty-five years later, we're planning a reunion — and looking back.\n\nThis piece collects stories from classmates across six countries."],
    ["Career Day recap", "BAA Editorial", ["Students"], "Over 200 students joined alumni from twelve professions for our Career Day. Here are the highlights and the questions students asked most."],
    ["Library Renewal: a progress update", "Priya Nair", ["Initiatives"], "Thanks to 42 contributors, we've already funded new shelving and 1,200 books. Here's what's next."],
  ];
  for (const [i, [title, author, tags, content]] of blogs.entries()) {
    await db.collection("blogs").add({ title, author, tags, content, imageUrl: img(`baa-blog-${i}`), createdAt: ago(24 * (i + 2)) });
  }
  const gallery = [["Annual Day 2019", "Events"], ["Science Fair", "Academics"], ["Cricket Cup", "Sports"], ["Diwali Evening", "Events"], ["Class of 2008", "Reunions"], ["Library", "Campus"], ["Sports Day", "Sports"], ["Graduation", "Campus"]];
  for (const [i, [title, category]] of gallery.entries()) {
    await db.collection("gallery").add({ title, category, imageUrl: img(`baa-gal-${i}`, 900, i % 3 === 0 ? 1100 : 650), createdAt: ago(i) });
  }

  // ---- posts + comments
  const posts = [
    ["asha", "Asha Patel", "Who's coming to the Career Day next week? I'll be talking about product management — come say hi! 👋", 3],
    ["kavya", "Kavya Desai", "Found this old photo from our 2012 science exhibition. Tag yourself!", 20, img("baa-post-1")],
    ["admin", "Meera Shah", "Registrations for the Silver Jubilee Reunion are now open. Early-bird pricing ends soon.", 48],
  ];
  for (const [i, [uid, username, content, hours, image_url]] of posts.entries()) {
    await db.doc(`posts/p${i}`).set({ user_id: uid, username, content, image_url: image_url || null, likesCount: i, commentsCount: i === 0 ? 1 : 0, sharesCount: 0, createdAt: ago(hours), updatedAt: ago(hours) });
  }
  await db.collection("comments").add({ postId: "p0", userId: "kavya", username: "Kavya Desai", content: "I'll be there!", parentCommentId: null, createdAt: ago(2) });
  await db.doc("likes/p1_asha").set({ postId: "p1", userId: "asha", createdAt: ago(10) });

  await db.doc("contactSubmissions/c1").set({ name: "Parent", email: "parent@example.com", phone: "99999", group: "events", message: "Can parents attend the Career Day?", status: "new", createdAt: ago(5) });
  await db.doc("feedback/f1").set({ name: "Visitor", email: "v@example.com", feedback: "Love the new website!", status: "new", createdAt: ago(1) });

  console.log(`Seeded project "${PROJECT_ID}". Log in with admin@baa.test / ${PASSWORD}`);
};

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
