import React, { useMemo } from 'react';

const CategoryFilter = ({
    categories,
    selectedCategory,
    onSelectCategory,
    products = []
}) => {

    // Calculate counts for each category
    const categoryCounts = useMemo(() => {
        const counts = products.reduce((acc, product) => {
            const cat = product.category;
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {});

        // Add total count for 'All'
        counts['All'] = products.length;

        return counts;
    }, [products]);

    return (
        <div className="mb-8">
            <h3 className="font-semibold mb-3 text-gray-700">Categories</h3>

            {/* Mobile Dropdown */}
            <div className="md:hidden">
                <select
                    value={selectedCategory}
                    onChange={(e) => onSelectCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-700"
                >
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category} ({categoryCounts[category] || 0})
                        </option>
                    ))}
                </select>
            </div>

            {/* Desktop List */}
            <div className="hidden md:flex flex-col space-y-2">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => onSelectCategory(category)}
                        className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-all duration-200 ${selectedCategory === category
                                ? 'bg-primary text-white shadow-sm font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <span>{category}</span>
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === category
                                    ? 'bg-white text-primary'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                        >
                            {categoryCounts[category] || 0}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryFilter;
