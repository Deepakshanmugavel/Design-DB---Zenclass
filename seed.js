// Run with: mongosh "<your-connection-string>" seed.js
use("zenclass");

["users","codekata","attendance","topics","tasks","company_drives","mentors"]
  .forEach(c => db.getCollection(c).drop());

// ---------- users ----------
const users = [];
for (let i = 1; i <= 20; i++) {
  users.push({ _id: i, name: "Student " + i, email: `student${i}@zen.com`, batch: "B-2020-01", joined_on: new Date("2020-06-01") });
}
db.users.insertMany(users);

// ---------- mentors (mentees = array of user ids) ----------
db.mentors.insertMany([
  { _id: 1, name: "Mentor A", email: "mentora@zen.com", mentees: users.map(u => u._id).slice(0, 18) }, // 18 mentees
  { _id: 2, name: "Mentor B", email: "mentorb@zen.com", mentees: [19, 20] }                           // 2 mentees
]);

// ---------- topics ----------
db.topics.insertMany([
  { _id: 1, topic: "HTML",       topic_date: new Date("2020-10-05") },
  { _id: 2, topic: "CSS",        topic_date: new Date("2020-10-12") },
  { _id: 3, topic: "JavaScript", topic_date: new Date("2020-10-20") },
  { _id: 4, topic: "React",      topic_date: new Date("2020-11-03") }
]);

// ---------- tasks (one document per user per task) ----------
const tasks = [];
const taskDefs = [
  { topic_id: 1, title: "Landing page",   task_date: new Date("2020-10-05"), due_date: new Date("2020-10-10") },
  { topic_id: 2, title: "Responsive nav", task_date: new Date("2020-10-12"), due_date: new Date("2020-10-18") },
  { topic_id: 3, title: "DOM to-do app",  task_date: new Date("2020-10-20"), due_date: new Date("2020-10-27") },
  { topic_id: 4, title: "React counter",  task_date: new Date("2020-11-03"), due_date: new Date("2020-11-08") }
];
taskDefs.forEach(t => users.forEach(u => tasks.push({
  ...t, user_id: u._id,
  submitted: u._id % 3 !== 0,                         // every 3rd user has not submitted
  submitted_on: u._id % 3 !== 0 ? t.due_date : null
})));
db.tasks.insertMany(tasks);

// ---------- attendance ----------
const att = [];
["2020-10-05","2020-10-12","2020-10-16","2020-10-20","2020-10-26","2020-11-03"].forEach(d =>
  users.forEach(u => att.push({
    user_id: u._id, date: new Date(d),
    status: (u._id % 4 === 0 || u._id % 3 === 0) && d >= "2020-10-15" ? "absent" : "present"
  })));
db.attendance.insertMany(att);

// ---------- codekata (problems solved per user) ----------
db.codekata.insertMany(users.map(u => ({ user_id: u._id, problems_solved: 10 + u._id * 3, updated_on: new Date("2020-10-30") })));

// ---------- company_drives ----------
db.company_drives.insertMany([
  { _id: 1, company: "TCS",     drive_date: new Date("2020-10-10"), students_appeared: [1, 2, 3] },
  { _id: 2, company: "Infosys", drive_date: new Date("2020-10-18"), students_appeared: [4, 5, 6, 7] },
  { _id: 3, company: "Zoho",    drive_date: new Date("2020-10-28"), students_appeared: [8, 9] },
  { _id: 4, company: "Wipro",   drive_date: new Date("2020-11-05"), students_appeared: [10, 11] }
]);

print("Seed complete");
