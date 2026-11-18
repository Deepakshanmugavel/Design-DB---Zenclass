# Design-DB---Zenclass

MongoDB database design for the **Zen class programme**.

## Collections

| Collection | Key fields |
|---|---|
| `users` | `_id, name, email, batch, joined_on` |
| `codekata` | `user_id, problems_solved, updated_on` |
| `attendance` | `user_id, date, status ("present" / "absent")` |
| `topics` | `_id, topic, topic_date` |
| `tasks` | `user_id, topic_id, title, task_date, due_date, submitted, submitted_on` |
| `company_drives` | `_id, company, drive_date, students_appeared [user_ids]` |
| `mentors` | `_id, name, email, mentees [user_ids]` |

## Relationships
- `tasks.topic_id` → `topics._id`, `tasks.user_id` → `users._id`
- `attendance.user_id`, `codekata.user_id` → `users._id`
- `company_drives.students_appeared[]` and `mentors.mentees[]` → `users._id`

## Run
```bash
mongosh "<connection-string>" seed.js      # creates the zenclass DB with sample data
mongosh "<connection-string>" queries.js   # runs the 6 queries
```

## Queries (`queries.js`)
1. Topics and tasks taught in October
2. Company drives between 15-Oct-2020 and 31-Oct-2020
3. Company drives with the students who appeared
4. Problems solved per user in codekata
5. Mentors with more than 15 mentees
6. Count of users absent and with tasks not submitted between 15-Oct-2020 and 31-Oct-2020
