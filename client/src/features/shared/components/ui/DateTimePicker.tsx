// Based on https://github.com/rudrodip/shadcn-date-time-picker

import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";

import { Button } from "./Button";
import Calendar from "./Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { ScrollArea, ScrollBar } from "./ScrollArea";

type DateTimePickerProps = {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
};

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [localValue, setLocalValue] = useState(value);

  const date = localValue ? new Date(localValue) : new Date();

  function handleChange(newDate: Date | undefined) {
    if (!newDate || !onChange) {
      return;
    }

    setLocalValue(newDate.toISOString());
    onChange(newDate.toISOString());
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();

    setLocalValue(undefined);
    onChange(undefined);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "relative w-full bg-neutral-200 pl-3 font-normal dark:bg-neutral-950",
          )}
        >
          {localValue ? (
            <>
              {format(date, "MM/dd/yyyy hh:mm aa")}
              <X
                className="absolute right-10 h-6 w-6 rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={handleClear}
              />
            </>
          ) : (
            <span className="text-neutral-500 dark:text-neutral-400">
              Select a date and time
            </span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleChange}
            initialFocus
          />
          <div className="flex flex-col divide-y divide-neutral-200 sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0 dark:divide-neutral-800">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex p-2 sm:flex-col">
                {Array.from({ length: 12 }, (_, i) => i + 1)
                  .reverse()
                  .map((hour) => (
                    <Button
                      key={hour}
                      type="button"
                      variant={
                        date.getHours() % 12 === hour % 12 ? "default" : "ghost"
                      }
                      className="aspect-square shrink-0 font-normal sm:w-full"
                      onClick={() => {
                        const newDate = new Date(date);
                        newDate.setHours(
                          date.getHours() >= 12 ? hour + 12 : hour,
                        );
                        handleChange(newDate);
                      }}
                    >
                      {hour}
                    </Button>
                  ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex p-2 sm:flex-col">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <Button
                    key={minute}
                    type="button"
                    variant={date.getMinutes() === minute ? "default" : "ghost"}
                    className="aspect-square shrink-0 font-normal sm:w-full"
                    onClick={() => {
                      const newDate = new Date(date);
                      newDate.setMinutes(minute);
                      handleChange(newDate);
                    }}
                  >
                    {minute.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="">
              <div className="flex p-2 sm:flex-col">
                {["AM", "PM"].map((ampm) => (
                  <Button
                    key={ampm}
                    type="button"
                    variant={
                      (ampm === "AM" && date.getHours() < 12) ||
                      (ampm === "PM" && date.getHours() >= 12)
                        ? "default"
                        : "ghost"
                    }
                    className="aspect-square shrink-0 font-normal sm:w-full"
                    onClick={() => {
                      const newDate = new Date(date);
                      const currentHours = newDate.getHours();
                      const is12Hour = currentHours % 12 === 0;

                      if (ampm === "AM") {
                        newDate.setHours(is12Hour ? 0 : currentHours % 12);
                      } else {
                        newDate.setHours(
                          is12Hour ? 12 : (currentHours % 12) + 12,
                        );
                      }
                      handleChange(newDate);
                    }}
                  >
                    {ampm}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
