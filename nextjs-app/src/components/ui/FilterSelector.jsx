/**
 * FilterSelector Component - Skeumorphic Design (Tailwind v3)
 *
 * Displays the current filter selection with left/right navigation arrows
 * Features:
 * - Current filter name in center
 * - Navigation arrows on sides
 * - Skeumorphic button styling with double border
 */

import IconButton from './IconButton';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import ArrowRightIcon from '../icons/ArrowRightIcon';
import FilterDisplay from './FilterDisplay';

export default function FilterSelector({
  currentFilter,
  onPrevious,
  onNext,
  className = '',
}) {
  return (
    <div className={`flex gap-filter-gap md:gap-[24px] items-center ${className}`}>
      {/* Left Arrow */}
      <IconButton
        variant="nav"
        onClick={onPrevious}
        ariaLabel="Previous filter"
      >
        <ArrowLeftIcon className="w-full h-full" />
      </IconButton>

      {/* Filter Display */}
      <FilterDisplay filterName={currentFilter} className="w-filter h-[52px]" />

      {/* Right Arrow */}
      <IconButton
        variant="nav"
        onClick={onNext}
        ariaLabel="Next filter"
      >
        <ArrowRightIcon className="w-full h-full" />
      </IconButton>
    </div>
  );
}
