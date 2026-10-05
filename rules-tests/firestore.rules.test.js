/**
 * Firestore security rules tests.
 * Run with:  npm run test:rules   (starts the Firestore emulator automatically)
 */
const test = require("node:test");
const fs = require("fs");
const path = require("path");
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} = require("@firebase/rules-unit-testing");
const {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  increment,
} = require("firebase/firestore");

let env;

const verified = (uid) => env.authenticatedContext(uid, { email_verified: true }).firestore();
const unverified = (uid) => env.authenticatedContext(uid, { email_verified: false }).firestore();
const anon = () => env.unauthenticatedContext().firestore();

const seed = async (fn) => env.withSecurityRulesDisabled(async (ctx) => fn(ctx.firestore()));

test.before(async () => {
  env = await initializeTestEnvironment({
    projectId: "baa-rules-test",
    firestore: {
      rules: fs.readFileSync(path.join(__dirname, "..", "firestore.rules"), "utf8"),
      host: "127.0.0.1",
      port: 8485,
    },
  });
});

test.beforeEach(async () => {
  await env.clearFirestore();
  await seed(async (db) => {
    await setDoc(doc(db, "users/alice"), { username: "alice", userRole: "User", is_member: false, followers: [] });
    await setDoc(doc(db, "users/bob"), { username: "bob", userRole: "User", is_member: false, followers: [] });
    await setDoc(doc(db, "users/admin"), { username: "admin", userRole: "Admin", is_member: true });
    await setDoc(doc(db, "users/root"), { username: "root", userRole: "Superuser", is_member: true });
    await setDoc(doc(db, "posts/p1"), { user_id: "alice", content: "hi", likesCount: 0, commentsCount: 0, sharesCount: 0 });
    await setDoc(doc(db, "events/free"), { name: "Free meetup" });
    await setDoc(doc(db, "events/paid"), { name: "Gala", amount: 500 });
  });
});

test.after(async () => {
  await env.cleanup();
});

// ---------- users ----------
test("new user can create own profile as a regular non-member", async () => {
  await assertSucceeds(setDoc(doc(verified("carol"), "users/carol"), { username: "carol", userRole: "User", is_member: false }));
});

test("new user cannot create profile as Superuser or member", async () => {
  await assertFails(setDoc(doc(verified("carol"), "users/carol"), { username: "carol", userRole: "Superuser" }));
  await assertFails(setDoc(doc(verified("dave"), "users/dave"), { username: "dave", is_member: true }));
});

test("owner can edit profile but not role or membership", async () => {
  const db = verified("alice");
  await assertSucceeds(updateDoc(doc(db, "users/alice"), { bio: "hello" }));
  await assertFails(updateDoc(doc(db, "users/alice"), { userRole: "Superuser" }));
  await assertFails(updateDoc(doc(db, "users/alice"), { is_member: true }));
});

test("admin can grant membership but only superuser can change roles", async () => {
  await assertSucceeds(updateDoc(doc(verified("admin"), "users/alice"), { is_member: true }));
  await assertFails(updateDoc(doc(verified("admin"), "users/alice"), { userRole: "Admin" }));
  await assertSucceeds(updateDoc(doc(verified("root"), "users/alice"), { userRole: "Admin" }));
});

test("users can follow others only as themselves", async () => {
  const db = verified("bob");
  await assertSucceeds(updateDoc(doc(db, "users/alice"), { followers: arrayUnion("bob") }));
  await assertFails(updateDoc(doc(db, "users/alice"), { followers: arrayUnion("mallory") }));
  await assertFails(updateDoc(doc(db, "users/alice"), { bio: "hacked" }));
});

// ---------- posts ----------
test("verified users can post; unverified cannot", async () => {
  const post = { user_id: "bob", content: "x", likesCount: 0, commentsCount: 0, sharesCount: 0 };
  await assertSucceeds(setDoc(doc(verified("bob"), "posts/p2"), post));
  await assertFails(setDoc(doc(unverified("bob"), "posts/p3"), post));
  await assertFails(setDoc(doc(verified("bob"), "posts/p4"), { ...post, user_id: "alice" }));
});

test("other users can move a counter by one, nothing else", async () => {
  const db = verified("bob");
  await assertSucceeds(updateDoc(doc(db, "posts/p1"), { likesCount: increment(1) }));
  await assertFails(updateDoc(doc(db, "posts/p1"), { likesCount: increment(5) }));
  await assertFails(updateDoc(doc(db, "posts/p1"), { content: "edited by bob" }));
});

test("post author can edit content but not forge counters", async () => {
  const db = verified("alice");
  await assertSucceeds(updateDoc(doc(db, "posts/p1"), { content: "edited" }));
  await assertFails(updateDoc(doc(db, "posts/p1"), { content: "x", likesCount: 99 }));
});

test("likes must use the postId_userId document id", async () => {
  const db = verified("bob");
  await assertSucceeds(setDoc(doc(db, "likes/p1_bob"), { postId: "p1", userId: "bob" }));
  await assertFails(setDoc(doc(db, "likes/p1_alice"), { postId: "p1", userId: "bob" }));
});

// ---------- events ----------
test("free events can be confirmed directly", async () => {
  await assertSucceeds(
    setDoc(doc(verified("bob"), "eventRegistrations/free_bob"), {
      eventId: "free", userId: "bob", status: "confirmed", payment_status: "free",
    })
  );
});

test("paid events cannot be self-confirmed, only left pending", async () => {
  const db = verified("bob");
  await assertFails(
    setDoc(doc(db, "eventRegistrations/paid_bob"), {
      eventId: "paid", userId: "bob", status: "confirmed", payment_status: "free",
    })
  );
  await assertFails(
    setDoc(doc(db, "eventRegistrations/paid_bob"), {
      eventId: "paid", userId: "bob", status: "confirmed", payment_status: "paid",
    })
  );
  await assertSucceeds(
    setDoc(doc(db, "eventRegistrations/paid_bob"), {
      eventId: "paid", userId: "bob", status: "pending_payment", payment_status: "pending",
    })
  );
  await assertSucceeds(deleteDoc(doc(db, "eventRegistrations/paid_bob")));
});

test("members can check for their own registration before it exists", async () => {
  await assertSucceeds(getDoc(doc(verified("bob"), "eventRegistrations/free_bob")));
});

test("users cannot read other people's registrations", async () => {
  await seed((db) => setDoc(doc(db, "eventRegistrations/free_alice"), { eventId: "free", userId: "alice" }));
  await assertFails(getDoc(doc(verified("bob"), "eventRegistrations/free_alice")));
  await assertSucceeds(getDoc(doc(verified("admin"), "eventRegistrations/free_alice")));
});

// ---------- payments & content ----------
test("clients cannot write payment records", async () => {
  await assertFails(setDoc(doc(verified("admin"), "payments/x"), { userId: "admin", amount: 1 }));
  await assertFails(setDoc(doc(verified("bob"), "contributions/x"), { userId: "bob", amount: 1 }));
});

test("committee and website content are admin-managed and publicly readable", async () => {
  await assertSucceeds(setDoc(doc(verified("admin"), "committee/m1"), { name: "M" }));
  await assertFails(setDoc(doc(verified("bob"), "committee/m2"), { name: "M" }));
  await assertSucceeds(getDoc(doc(anon(), "committee/m1")));
  await assertSucceeds(getDoc(doc(anon(), "websiteContent/aboutUs")));
});

test("anyone can submit the contact form; only admins can read it", async () => {
  await assertSucceeds(setDoc(doc(anon(), "contactSubmissions/c1"), { name: "A", email: "a@b.c" }));
  await assertFails(getDoc(doc(anon(), "contactSubmissions/c1")));
  await assertSucceeds(getDoc(doc(verified("admin"), "contactSubmissions/c1")));
});
