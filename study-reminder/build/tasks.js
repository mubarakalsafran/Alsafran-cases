/* =====================================================================
   MY TASKS AND TESTS
   ---------------------------------------------------------------------
   This is the only list you need to edit.
   Add a line for every new quiz, test or homework.

   due  -> must be written as YYYY-MM-DD  (year-month-day)
   type -> Quiz / Test / Homework / Project  (used for the email icon)
   ===================================================================== */

const TASKS = [
  {
    title: 'Physics Quiz 1',
    subject: 'Physics',
    type: 'Quiz',
    details: 'Week 1 & 2. PowerPoints: Methods of Science, Mathematics and Physics, Measurement, Graphing Data. Bring all the worksheets done (WhatsApp).',
    due: '2026-09-17',
  },
  {
    title: 'Write Chemistry class notes',
    subject: 'Chemistry',
    type: 'Homework',
    details: 'Copy the Chemistry class notes from a friend (yesterday and today).',
    due: '2026-09-13',
  },
  {
    title: 'امتحان إسلامية',
    subject: 'Islamic Studies',
    type: 'Test',
    details: 'ورقة العمل نصف الامتحان موجودة في نيو',
    due: '2026-09-23',
  },
  {
    title: 'Chemistry project — gym plan',
    subject: 'Chemistry',
    type: 'Project',
    details: 'Create a gym plan for a beginner.',
    due: '2026-09-20',
  },
  {
    title: 'IB Biology Quiz',
    subject: 'Biology',
    type: 'Quiz',
    details: 'Mutation and gene editing (slides are in the PowerPoint).',
    due: '2026-09-17',
  },
  {
    title: 'IB Chemistry Quiz',
    subject: 'Chemistry',
    type: 'Quiz',
    details: 'Details not given yet — ask the teacher.',
    due: '2026-09-20',
  },
  {
    title: 'Arabic homework',
    subject: 'Arabic',
    type: 'Homework',
    details: 'Print it, then send it on Education.',
    due: '2026-09-17',
  },
];

return TASKS.map((task) => ({ json: task }));
