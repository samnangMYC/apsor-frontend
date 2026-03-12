import { Children, isValidElement, useId, useMemo } from "react";
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

function flattenOptions(children) {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) {
      return [];
    }

    if (child.type === "option") {
      return [{
        value: child.props.value,
        label: child.props.children,
        disabled: child.props.disabled,
      }];
    }

    if (child.type === "optgroup") {
      return flattenOptions(child.props.children).map((option) => ({
        ...option,
        groupLabel: child.props.label,
      }));
    }

    return [];
  });
}

function renderOptionLabel(label) {
  if (typeof label === "string") {
    return <span className="truncate">{label}</span>;
  }

  return label;
}

export default function AdminSelect({
  value,
  onChange,
  children,
  className = "",
  iconClassName = "",
  disabled = false,
  placeholder = "Select option",
  "aria-label": ariaLabel,
  ...props
}) {
  const generatedId = useId();
  const options = useMemo(() => flattenOptions(children), [children]);
  const selectedOption = options.find((option) => String(option.value) === String(value));
  const viewportId = `${generatedId}-viewport`;
  const groupedOptions = useMemo(() => {
    const groups = [];

    options.forEach((option) => {
      const groupKey = option.groupLabel || "__default__";
      const currentGroup = groups.find((group) => group.key === groupKey);

      if (currentGroup) {
        currentGroup.items.push(option);
        return;
      }

      groups.push({
        key: groupKey,
        label: option.groupLabel || "",
        items: [option],
      });
    });

    return groups;
  }, [options]);

  const handleValueChange = (nextValue) => {
    onChange?.({
      target: { value: nextValue },
      currentTarget: { value: nextValue },
    });
  };

  return (
    <Select.Root
      value={value === undefined || value === null ? undefined : String(value)}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <Select.Trigger
        {...props}
        aria-label={ariaLabel}
        className={`group inline-flex h-10 w-full items-center justify-between gap-3 rounded-xl border border-border/80 bg-linear-to-b from-white via-bg-surface to-brand-soft/20 px-3 pr-2 text-left text-sm font-medium text-text-primary shadow-[0_10px_24px_rgba(15,23,42,0.06)] outline-none transition duration-200 hover:border-brand/35 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-60 dark:from-bg-surface dark:via-bg-surface dark:to-brand-soft/10 ${className}`.trim()}
      >
        <Select.Value asChild>
          <span className="min-w-0 flex-1 truncate">
            {selectedOption ? renderOptionLabel(selectedOption.label) : placeholder}
          </span>
        </Select.Value>
        <Select.Icon asChild>
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-white/80 text-text-muted shadow-sm backdrop-blur-sm transition group-hover:text-brand dark:bg-bg-surface/90">
            <ChevronDown className={`h-4 w-4 ${iconClassName}`.trim()} />
          </span>
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={8}
          className="z-[90] overflow-hidden rounded-2xl border border-border/80 bg-bg-surface shadow-[0_22px_60px_rgba(15,23,42,0.18)]"
        >
          <Select.ScrollUpButton className="flex h-8 items-center justify-center bg-bg-surface text-text-muted">
            <ChevronUp className="h-4 w-4" />
          </Select.ScrollUpButton>

          <Select.Viewport
            id={viewportId}
            className="max-h-72 min-w-[var(--radix-select-trigger-width)] p-2"
          >
            {groupedOptions.map((group, groupIndex) => (
              <div key={group.key}>
                {group.label ? (
                  <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                    {group.label}
                  </div>
                ) : null}

                {group.items.map((option) => (
                  <Select.Item
                    key={`${group.key}-${option.value}`}
                    value={String(option.value)}
                    disabled={option.disabled}
                    className="relative flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary outline-none transition data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-brand-soft/60 data-[highlighted]:text-brand data-[state=checked]:bg-brand-soft/85 data-[state=checked]:text-brand"
                  >
                    <Select.ItemIndicator className="inline-flex h-4 w-4 items-center justify-center text-brand">
                      <Check className="h-4 w-4" />
                    </Select.ItemIndicator>
                    <Select.ItemText asChild>
                      <span className="min-w-0 flex-1 truncate">
                        {renderOptionLabel(option.label)}
                      </span>
                    </Select.ItemText>
                  </Select.Item>
                ))}

                {groupIndex < groupedOptions.length - 1 ? (
                  <div className="mx-2 my-1 border-t border-border/70" />
                ) : null}
              </div>
            ))}
          </Select.Viewport>

          <Select.ScrollDownButton className="flex h-8 items-center justify-center bg-bg-surface text-text-muted">
            <ChevronDown className="h-4 w-4" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
