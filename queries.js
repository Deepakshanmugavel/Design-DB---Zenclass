// Run with: mongosh "<your-connection-string>" queries.js
use("zenclass");

// 1. Topics and tasks taught in October 2020
printjson(db.topics.aggregate([
  { $match: { topic_date: { $gte: ISODate("2020-10-01"), $lt: ISODate("2020-11-01") } } },
  { $lookup: {
      from: "tasks",
      let: { tid: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$topic_id", "$$tid"] },
                    task_date: { $gte: ISODate("2020-10-01"), $lt: ISODate("2020-11-01") } } },
        { $group: { _id: "$title", task_date: { $first: "$task_date" }, due_date: { $first: "$due_date" } } }
      ],
      as: "tasks" } }
]).toArray());

// 2. Company drives between 15-Oct-2020 and 31-Oct-2020 (inclusive)
printjson(db.company_drives.find({
  drive_date: { $gte: ISODate("2020-10-15"), $lt: ISODate("2020-11-01") }
}).toArray());

// 3. All company drives and the students who appeared
printjson(db.company_drives.aggregate([
  { $lookup: { from: "users", localField: "students_appeared", foreignField: "_id", as: "students" } },
  { $project: { company: 1, drive_date: 1, "students._id": 1, "students.name": 1, "students.email": 1 } }
]).toArray());

// 4. Number of problems solved by each user in codekata
printjson(db.codekata.aggregate([
  { $group: { _id: "$user_id", problems_solved: { $sum: "$problems_solved" } } },
  { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
  { $unwind: "$user" },
  { $project: { _id: 0, user_id: "$_id", name: "$user.name", problems_solved: 1 } },
  { $sort: { problems_solved: -1 } }
]).toArray());

// 5. Mentors with more than 15 mentees
printjson(db.mentors.aggregate([
  { $addFields: { mentee_count: { $size: "$mentees" } } },
  { $match: { mentee_count: { $gt: 15 } } },
  { $project: { name: 1, email: 1, mentee_count: 1 } }
]).toArray());

// 6. Number of users who were absent AND did not submit a task between 15-Oct-2020 and 31-Oct-2020
printjson(db.attendance.aggregate([
  { $match: { status: "absent", date: { $gte: ISODate("2020-10-15"), $lt: ISODate("2020-11-01") } } },
  { $group: { _id: "$user_id" } },
  { $lookup: {
      from: "tasks",
      let: { uid: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$user_id", "$$uid"] },
                    submitted: false,
                    due_date: { $gte: ISODate("2020-10-15"), $lt: ISODate("2020-11-01") } } }
      ],
      as: "pending_tasks" } },
  { $match: { "pending_tasks.0": { $exists: true } } },
  { $count: "users_absent_and_task_not_submitted" }
]).toArray());
