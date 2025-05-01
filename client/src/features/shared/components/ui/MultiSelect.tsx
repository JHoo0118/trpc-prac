// Inspired by https://github.com/sersavan/shadcn-multi-select-component

import { CheckIcon, ChevronDown, XCircle, XIcon } from "lucide-react";
import { ButtonHTMLAttributes, ComponentType, useState } from "react";

import { cn } from "@/lib/utils/cn";

import { Badge } from "./Badge";
import { Button } from "./Button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./Command";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { Separator } from "./Separator";

interface MultiSelectProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * An array of option objects to be displayed in the multi-select component.
   * Each option object has a label, value, and an optional icon.
   */
  options: {
    /** The text to display for the option. */
    label: string;
    /** The unique value associated with the option. */
    value: string;
    /** Optional icon component to display alongside the option. */
    icon?: ComponentType<{ className?: string }>;
  }[];

  /**
   * Callback function triggered when the selected values change.
   * Receives an array of the new selected values.
   */
  onValueChange: (value: string[]) => void;

  /** The default selected values when the component mounts. */
  defaultValue?: string[];

  /**
   * Placeholder text to be displayed when no values are selected.
   * Optional, defaults to "Select options".
   */
  placeholder?: string;

  /**
   * Maximum number of items to display. Extra selected items will be summarized.
   * Optional, defaults to 3.
   */
  maxCount?: number;

  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean;

  /**
   * Additional class names to apply custom styles to the multi-select component.
   * Optional, can be used to add custom styles.
   */
  className?: string;
}

export function MultiSelect({
  options,
  onValueChange,
  defaultValue = [],
  placeholder = "Select options",
  maxCount = 3,
  modalPopover = false,
  className,
  ...props
}: MultiSelectProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>(defaultValue);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  function toggleOption(option: string) {
    const newSelectedValues = selectedValues.includes(option)
      ? selectedValues.filter((value) => value !== option)
      : [...selectedValues, option];
    setSelectedValues(newSelectedValues);
    onValueChange(newSelectedValues);
  }

  function handleClear() {
    setSelectedValues([]);
    onValueChange([]);
  }

  function handleTogglePopover() {
    setIsPopoverOpen((prev) => !prev);
  }

  function clearExtraOptions() {
    const newSelectedValues = selectedValues.slice(0, maxCount);
    setSelectedValues(newSelectedValues);
    onValueChange(newSelectedValues);
  }

  function toggleAll() {
    if (selectedValues.length === options.length) {
      handleClear();
    } else {
      const allValues = options.map((option) => option.value);
      setSelectedValues(allValues);
      onValueChange(allValues);
    }
  }

  return (
    <Popover
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}
      modal={modalPopover}
    >
      <PopoverTrigger asChild>
        <Button
          {...props}
          onClick={handleTogglePopover}
          variant="outline"
          className={cn(
            "flex h-auto min-h-10 w-full items-center justify-between rounded-md border bg-inherit bg-neutral-200 p-1 dark:bg-neutral-950 [&_svg]:pointer-events-auto",
            className,
          )}
        >
          {selectedValues.length > 0 ? (
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {selectedValues.slice(0, maxCount).map((value) => {
                  const option = options.find((o) => o.value === value);
                  const IconComponent = option?.icon;
                  return (
                    <Badge key={value}>
                      {IconComponent && (
                        <IconComponent className="mr-2 h-4 w-4" />
                      )}
                      {option?.label}
                      <XCircle
                        className="ml-2 h-4 w-4 cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleOption(value);
                        }}
                      />
                    </Badge>
                  );
                })}
                {selectedValues.length > maxCount && (
                  <Badge>
                    {`+ ${selectedValues.length - maxCount} more`}
                    <XCircle
                      className="ml-2 h-4 w-4 cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation();
                        clearExtraOptions();
                      }}
                    />
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <XIcon
                  className="mx-2 h-4 cursor-pointer"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleClear();
                  }}
                />
                <Separator
                  orientation="vertical"
                  className="flex h-full min-h-6"
                />
                <ChevronDown className="mx-2 h-4 cursor-pointer" />
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full items-center justify-between">
              <span className="mx-2 font-normal text-neutral-500 dark:text-neutral-400">
                {placeholder}
              </span>
              <ChevronDown className="mx-2 h-4 cursor-pointer" />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        align="start"
        onEscapeKeyDown={() => setIsPopoverOpen(false)}
      >
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem
                key="all"
                onSelect={toggleAll}
                className="cursor-pointer"
              >
                <div
                  className={cn(
                    "border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                    selectedValues.length === options.length
                      ? "bg-primary text-primary-foreground"
                      : "opacity-50 [&_svg]:invisible",
                  )}
                >
                  <CheckIcon className="h-4 w-4" />
                </div>
                <span>(Select All)</span>
              </CommandItem>
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    {option.icon && <option.icon className="mr-2 h-4 w-4" />}
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <div className="flex items-center justify-between">
                {selectedValues.length > 0 && (
                  <>
                    <CommandItem
                      onSelect={handleClear}
                      className="flex-1 cursor-pointer justify-center"
                    >
                      Clear
                    </CommandItem>
                    <Separator
                      orientation="vertical"
                      className="flex h-full min-h-6"
                    />
                  </>
                )}
                <CommandItem
                  onSelect={() => setIsPopoverOpen(false)}
                  className="max-w-full flex-1 cursor-pointer justify-center"
                >
                  Close
                </CommandItem>
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
