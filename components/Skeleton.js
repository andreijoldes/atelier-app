// Componenta Skeleton — afișează un placeholder animat în timpul încărcării
// Folosește animația shimmer din globals.css

export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-2xl p-5 shadow-sm">
      <div className="skeleton w-12 h-12 rounded-xl mb-3"></div>
      <div className="skeleton h-8 w-20 mb-2"></div>
      <div className="skeleton h-4 w-28"></div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="bg-surface rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div className="skeleton w-12 h-12 rounded-xl shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="skeleton h-5 w-40"></div>
        <div className="skeleton h-3 w-56"></div>
      </div>
      <div className="skeleton w-20 h-8 rounded-lg shrink-0"></div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-surface rounded-2xl p-6 shadow-sm space-y-4">
      <div className="skeleton h-6 w-48 mb-4"></div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="skeleton h-4 w-32"></div>
          <div className="skeleton h-4 w-24 hidden sm:block"></div>
          <div className="skeleton h-4 w-20"></div>
          <div className="skeleton h-4 w-16"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonCalendar() {
  return (
    <div className="grid md:grid-cols-7 gap-3">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="bg-surface rounded-2xl p-4 shadow-sm min-h-[140px]">
          <div className="skeleton h-4 w-12 mb-1"></div>
          <div className="skeleton h-6 w-8 mb-3"></div>
          <div className="skeleton h-16 w-full"></div>
        </div>
      ))}
    </div>
  );
}

// Skeleton complet pentru Dashboard
export function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="skeleton h-8 w-48 mb-2"></div>
        <div className="skeleton h-4 w-80"></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <SkeletonTable />
    </div>
  );
}

// Skeleton complet pentru liste (Clienți, Mașini)
export function ListSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="skeleton h-8 w-32 mb-2"></div>
          <div className="skeleton h-4 w-44"></div>
        </div>
        <div className="skeleton h-10 w-36 rounded-xl"></div>
      </div>
      <div className="skeleton h-12 w-full rounded-xl mb-6"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
      </div>
    </div>
  );
}

// Skeleton complet pentru Programări
export function ProgramariSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="skeleton h-8 w-40 mb-2"></div>
          <div className="skeleton h-4 w-48"></div>
        </div>
        <div className="skeleton h-10 w-44 rounded-xl"></div>
      </div>
      <div className="skeleton h-14 w-full rounded-2xl mb-6"></div>
      <SkeletonCalendar />
    </div>
  );
}

// Skeleton complet pentru Deviz
export function DevizSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="skeleton h-8 w-28 mb-2"></div>
          <div className="skeleton h-4 w-52"></div>
        </div>
        <div className="skeleton h-10 w-36 rounded-xl"></div>
      </div>
      <div className="skeleton h-20 w-full rounded-2xl mb-6"></div>
      <div className="bg-surface rounded-2xl p-6 shadow-sm space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="skeleton h-6 w-20 rounded-full"></div>
            <div className="flex-1 space-y-1">
              <div className="skeleton h-4 w-40"></div>
              <div className="skeleton h-3 w-24"></div>
            </div>
            <div className="skeleton h-6 w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
