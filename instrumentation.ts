export async function register(): Promise<void> {
  // Jobs nur im Node.js-Runtime starten — nicht im Edge-Runtime
  // und nicht während `next build`
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    process.env.NEXT_PHASE !== 'phase-production-build'
  ) {
    const { startJobs } = await import('./lib/jobs');
    startJobs();
  }
}
