



interface ContentCategoriesProps {
  distribution: Record<string, number>
}

export default function ContentCategories({ distribution }: ContentCategoriesProps) {
  const categories = Object.entries(distribution).map(([name, count]) => ({
    name,
    count,
    totalViews: 0, // These could be passed as props if needed
    averageRating: 0
  }))

  return (
    <div className="overflow-hidden rounded-lg bg-gray-800">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium text-white">Content Categories</h3>
      </div>
      <div className="border-t border-gray-700">
        <dl>
          {categories.map((category, index) => (
            <div
              key={category.name}
              className={`${
                index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'
              } px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}
            >
              <dt className="text-sm font-medium text-gray-300">
                {category.name}
              </dt>
              <dd className="mt-1 text-sm text-gray-400 sm:col-span-2 sm:mt-0">
                <div className="flex justify-between">
                  <span>{category.count} items</span>
                  <span>{category.totalViews} views</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="h-full bg-indigo-500"
                    style={{
                      width: `${(category.count / Math.max(...categories.map(c => c.count))) * 100}%`,
                    }}
                  />
                </div>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
