import cron from "node-cron";
import { processRecurringTransactions } from "./jobs/transaction.job";
import { processReportJob } from "./jobs/report.job";

const scheduleJob = (name: string, time: string, job: Function) => {
  console.log(`Scheduling ${name} at ${time}`);

  return cron.schedule(
    time,
    async () => {
      try {
        await job();
        console.log(`${name} completed`);
      } catch (error) {
        console.log(`${name} failed`, error);
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    },
  );
};

export const startJobs = () => {
  return [
    //runs at 12:05am every day
    scheduleJob("Transactions", "5 0 * * *", processRecurringTransactions),

    // run 2:30am every day so missed month-end runs can backfill safely
    // nextReportDate still ensures each report is generated once per month
    scheduleJob("Reports", "30 2 * * *", processReportJob),
    //scheduleJob("Reports", "* * * * *", processReportJob),
  ];
};
