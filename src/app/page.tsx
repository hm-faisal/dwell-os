import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-2xl w-full text-center space-y-8 bg-white dark:bg-zinc-900 p-10 sm:p-14 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-3xl shadow-md">
          D
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome to DwellOS
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
            Comprehensive Property & Room Management platform for owners,
            landlords, and property managers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Property Portfolio
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Create, configure, and manage apartments, houses, PGs, and hostels
              with rich amenities and geolocation.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Room Inventory
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Granular room tracking, real-time availability states,
              double-booking prevention, and lease term management.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/properties"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm text-center"
          >
            Launch Properties Dashboard →
          </Link>
          <Link
            href="/properties/new"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-center"
          >
            + Create New Property
          </Link>
        </div>
      </div>
    </div>
  );
}
