"use client";

export function ToolCardSkeleton() {
  return (
    <div className="relative flex flex-col justify-between rounded-xl border border-[#212623] bg-[#131615]/40 backdrop-blur-md p-5 h-[278px]">
      <div>
        {/* Header: Initials + Title */}
        <div className="flex items-start justify-between gap-3 mb-4 pr-8">
          <div className="flex items-center gap-3 w-full">
            {/* Initials block */}
            <div className="h-9 w-9 shrink-0 rounded border border-[#212623] bg-[#0D0F0E] shimmer-bar" />
            <div className="space-y-2 flex-1">
              {/* Title */}
              <div className="h-4.5 rounded shimmer-bar w-2/3" />
              {/* Category */}
              <div className="h-2 rounded shimmer-bar w-1/3" />
            </div>
          </div>
        </div>

        {/* Pricing Badge */}
        <div className="mb-3">
          <div className="h-4 rounded shimmer-bar w-16" />
        </div>

        {/* Short Description */}
        <div className="space-y-2 mb-4">
          <div className="h-3 rounded shimmer-bar w-full" />
          <div className="h-3 rounded shimmer-bar w-11/12" />
          <div className="h-3 rounded shimmer-bar w-4/5" />
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-5">
          <div className="h-3.5 rounded shimmer-bar w-12" />
          <div className="h-3.5 rounded shimmer-bar w-16" />
          <div className="h-3.5 rounded shimmer-bar w-10" />
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-[#212623]/60 pt-4 mt-auto">
        <div className="h-3.5 rounded shimmer-bar w-16" />
        <div className="h-3.5 rounded shimmer-bar w-16" />
      </div>
    </div>
  );
}
