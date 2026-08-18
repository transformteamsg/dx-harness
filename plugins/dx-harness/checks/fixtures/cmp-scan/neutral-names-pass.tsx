/* The false-positive classes word-splitting closes. `backdrop` holds the letters
   of `drop` and `handleDropdownToggle` holds them too, but neither has `drop` as
   one of its camelCase words, so neither is a destructive action. A string
   constant named like a handler is not one either, because a candidate has to be
   function-shaped. */
"use client";

const handleDeleteLabel = "Delete note";

export function Toolbar() {
  function handleDropdownToggle() {
    setOpen((open) => !open);
  }

  return (
    <div className="backdrop-blur supports-backdrop-filter:backdrop-blur-xs">
      <button onClick={handleDropdownToggle}>{handleDeleteLabel}</button>
    </div>
  );
}
