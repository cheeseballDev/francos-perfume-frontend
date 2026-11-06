import FilterDropdown from "./FilterDropdown";
import SearchBar from "./SearchBar";

/**
 * Search bar + filter dropdowns (+ optional action buttons).
 *
 * - Without `actions`: search and filters share one row; filters wrap when the screen is too narrow.
 * - With `actions` (e.g. "Create New Account"): search on the left and the actions on the right in the
 *   first row, the filters in a row underneath.
 * - The search bar grows to fill the space it is given (at least 16rem); on phones the filters go two per row.
 */
const SearchFilterBar = ({
    searchValue,
    onSearchChange,
    searchPlaceholder,
    filter,
    updateFilter,
    filterOptions,
    actions = null,
    className = "mb-6",
}) => {
    const search = (
        <div className="min-w-[16rem] flex-[1_1_24rem]">
            <SearchBar value={searchValue} onChange={onSearchChange} placeholder={searchPlaceholder} />
        </div>
    );

    if (!actions) {
        return (
            <div className={`flex flex-wrap items-center gap-3 ${className}`}>
                {search}
                <FilterDropdown filter={filter} updateFilter={updateFilter} filterOptions={filterOptions} />
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            <div className="flex flex-wrap items-center gap-3">
                {search}
                <div className="flex w-full flex-wrap items-center gap-3 sm:ml-auto sm:w-auto [&>*]:w-full sm:[&>*]:w-auto">
                    {actions}
                </div>
            </div>
            <FilterDropdown
                filter={filter}
                updateFilter={updateFilter}
                filterOptions={filterOptions}
                className="flex flex-wrap items-center gap-3"
            />
        </div>
    );
};

export default SearchFilterBar;
