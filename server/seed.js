/** Demo data: `npm run seed` */
import "dotenv/config";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Group from "./models/Group.js";
import Quiz from "./models/Quiz.js";
import Tutor from "./models/Tutor.js";

await connectDB();
await Promise.all([User.deleteMany({}), Group.deleteMany({}), Quiz.deleteMany({}), Tutor.deleteMany({})]);

const [alice, bob, carol] = await User.create([
  { name: "Alice Rao", email: "alice@studysync.dev", password: "password123" },
  { name: "Bob Menon", email: "bob@studysync.dev", password: "password123" },
  { name: "Carol Iyer", email: "carol@studysync.dev", password: "password123", isTutor: true },
]);

const group = await Group.create({
  name: "Calculus 101",
  subject: "Mathematics",
  description: "Limits, derivatives and integrals — weeknights 8pm.",
  inviteCode: "CALC1010",
  members: [
    { user: alice._id, role: "owner" },
    { user: bob._id, role: "member" },
  ],
});

await Quiz.create({
  group: group._id,
  createdBy: alice._id,
  title: "Derivatives warm-up",
  mode: "mcq",
  questions: [
    { prompt: "d/dx of x^3", options: ["3x^2", "x^2", "3x", "x^4/4"], correctIndex: 0 },
    { prompt: "d/dx of sin(x)", options: ["-sin x", "cos x", "-cos x", "tan x"], correctIndex: 1 },
    { prompt: "Derivative of a constant", options: ["1", "x", "0", "undefined"], correctIndex: 2 },
  ],
});

await Tutor.create({
  user: carol._id,
  headline: "Calculus & Linear Algebra tutor, 6 years experience",
  bio: "Ex-TA. I teach through worked problems and weekly checkpoints.",
  subjects: ["Calculus", "Linear Algebra"],
  hourlyRate: 25,
  verified: true,
  availability: [
    { day: 1, start: "16:00", end: "20:00" },
    { day: 3, start: "16:00", end: "20:00" },
    { day: 6, start: "10:00", end: "14:00" },
  ],
});

console.log("Seeded. Login with alice@studysync.dev / password123 — invite code CALC1010");
process.exit(0);
