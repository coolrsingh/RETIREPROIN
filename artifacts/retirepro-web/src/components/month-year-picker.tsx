import { useEffect, useMemo, useState } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function splitDate(value?: string) {
  const match = value?.match(/^(\d{4})-(\d{2})/);
  return {
    year: match?.[1] ?? "",
    month: match?.[2] ?? "",
  };
}

interface MonthYearPickerProps {
  value?: string;
  onChange: (value: string) => void;
  monthTestId: string;
  yearTestId: string;
  className?: string;
}

export default function MonthYearPicker({
  value,
  onChange,
  monthTestId,
  yearTestId,
  className = "",
}: MonthYearPickerProps) {
  const initial = splitDate(value);
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 101 }, (_, index) => String(currentYear - index)),
    [currentYear],
  );

  useEffect(() => {
    const next = splitDate(value);
    setMonth(next.month);
    setYear(next.year);
  }, [value]);

  const update = (nextMonth: string, nextYear: string) => {
    setMonth(nextMonth);
    setYear(nextYear);
    onChange(nextMonth && nextYear ? `${nextYear}-${nextMonth}-01` : "");
  };

  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      <select
        aria-label="Birth month"
        value={month}
        onChange={(event) => update(event.target.value, year)}
        data-testid={monthTestId}
        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">Month</option>
        {MONTHS.map((month, index) => (
          <option key={month} value={String(index + 1).padStart(2, "0")}>
            {month}
          </option>
        ))}
      </select>
      <select
        aria-label="Birth year"
        value={year}
        onChange={(event) => update(month, event.target.value)}
        data-testid={yearTestId}
        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">Year</option>
        {years.map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
  );
}