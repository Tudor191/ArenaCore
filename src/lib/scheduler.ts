import cron from "node-cron";
import { runIncrementalSync } from "./hltv-scraper";

let schedulerStarted = false;

export function startScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;

  // Run incremental sync every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    console.log("[Scheduler] Running scheduled incremental sync...");
    try {
      const result = await runIncrementalSync();
      console.log(`[Scheduler] Sync complete: ${result.count} events updated`);
    } catch (err) {
      console.error("[Scheduler] Sync failed:", err);
    }
  });

  console.log("[Scheduler] Started — incremental sync every 6 hours");
}
