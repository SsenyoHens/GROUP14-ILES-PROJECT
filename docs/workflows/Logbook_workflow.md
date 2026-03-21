\# Logbook Workflow



\## 1. Description

This workflow defines how a student's daily logbook progresses from creation to approval.



\## 2. States

\- Draft

\- Submitted

\- Reviewed

\- Approved

\- Rejected



\## 3. State Transitions

\- Draft → Submitted (Student submits log)

\- Submitted → Reviewed (Supervisor reviews log)

\- Reviewed → Approved (Supervisor approves)

\- Reviewed → Rejected (Supervisor rejects)



\## 4. Rules

\- A student can only edit a log in Draft or Rejected state

\- A submitted log cannot be edited unless rejected

\- Approved logs are final and cannot be modified



\## 5. Actors Involved

\- Student

\- Supervisor



\## 6. Notes

\- Each logbook entry corresponds to a specific date

\- A student can only submit one log per day

