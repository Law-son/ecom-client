function PlaceholderPage({ title, description }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Smart E-Commerce
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">{description}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {['Insights', 'Tasks', 'Activity'].map((section) => (
          <div
            key={section}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">{section}</h2>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                Coming soon
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              We will personalize this area with live data from the API once the integration
              layer is in place.
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PlaceholderPage

