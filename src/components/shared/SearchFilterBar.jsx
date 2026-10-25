import FilterDropdown from "./FilterDropdown";
import SearchBar from "./SearchBar";

/**
 * Search bar + filter dropdowns (+ optional action buttons) in one row.
 *
 * - The search bar grows to fill whatever space the filters leave (at least 16rem).
 * - Filters sit next to it and wrap onto the next line when the screen is too narrow;
 *   on phones they go two per row under the search bar.
 * - `actions` (e.g. "Create New Account") stay on the right.
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
}) => (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        <div className="min-w-[16rem] flex-[1_1_24rem]">
            <SearchBar value={searchValue} onChange={onSearchChange} placeholder={searchPlaceholder} />
        </div>

        <FilterDropdown filter={filter} updateFilter={updateFilter} filterOptions={filterOptions} />

        {actions && (
            <div className="flex w-full flex-wrap items-center gap-3 sm:ml-auto sm:w-auto [&>*]:w-full sm:[&>*]:w-auto">
                {actions}
            </div>
        )}
    </div>
);

export default SearchFilterBar;
