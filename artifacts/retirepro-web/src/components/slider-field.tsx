import { cn } from "@/lib/utils";

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  hint?: string;
  /** Low-end label shown under left of track, e.g. "Conservative" */
  lowLabel?: string;
  /** High-end label shown under right of track, e.g. "Aggressive" */
  highLabel?: string;
  /**
   * Primary test-id.  Applied to the **number** input so that userEvent.type
   * and userEvent.clear work correctly in unit tests (range inputs don't
   * support typed text).  The range slider gets `${testId}-range`.
   */
  testId?: string;
  /**
   * Optional test-id for the label row wrapper.  Use this to add a
   * `data-testid` for 320px overflow regression tests.
   */
  rowTestId?: string;
  className?: string;
}

/**
 * Slider + synced number input, designed for planning assumptions.
 *
 * The number input is the primary interactive control for keyboard / test
 * interactions.  The slider provides a visual track.  They stay in sync.
 * The number input does NOT clamp — out-of-range values flow through to RHF
 * so the schema validator can reject them and show an error.  The slider is
 * always visually clamped to min/max so it never renders out-of-range.
 */
export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit = "",
  hint,
  lowLabel,
  highLabel,
  testId,
  rowTestId,
  className,
}: SliderFieldProps) {
  // Clamp only for the visual slider track percentage
  const clampedValue = Math.min(max, Math.max(min, value));
  const pct = ((clampedValue - min) / (max - min)) * 100;

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Slider always stays within range
    onChange(Math.min(max, Math.max(min, Number(e.target.value))));
  };

  const handleNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    // No clamping here — let the RHF schema validate and show an error
    if (!isNaN(v)) onChange(v);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label row — flex-wrap so number input wraps on very narrow screens */}
      <div
        className="flex flex-wrap items-center justify-between gap-3"
        data-testid={rowTestId}
      >
        <span className="text-sm font-medium text-slate-700 leading-tight">{label}</span>
        {/* Numeric readout + input */}
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleNumber}
            data-testid={testId}
            className="w-16 text-right text-sm font-semibold text-blue-700 border border-slate-200 rounded-md px-1.5 py-0.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {unit && (
            <span className="text-sm font-medium text-slate-500 w-5">{unit}</span>
          )}
        </div>
      </div>

      {/* Track */}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={clampedValue}
          onChange={handleSlider}
          data-testid={testId ? `${testId}-range` : undefined}
          className="w-full h-2 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600
            [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600
            [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, #2563EB ${pct}%, #E2E8F0 ${pct}%)`,
          }}
        />
      </div>

      {/* Min/max labels */}
      {(lowLabel || highLabel) ? (
        <div className="flex justify-between text-[11px] text-slate-400 font-medium">
          <span>{lowLabel ?? `${min}${unit}`}</span>
          <span>{highLabel ?? `${max}${unit}`}</span>
        </div>
      ) : (
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      )}

      {hint && (
        <p className="text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
}
