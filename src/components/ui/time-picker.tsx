
"use client"

import * as React from "react"
import { Time } from "@internationalized/date"
import { TimeField as AriaTimeField, DateField as AriaDateField } from "react-aria-components"
import { cn } from "@/lib/utils"

interface TimePickerProps {
    date: Date;
    setDate: (date: Date) => void;
}

export function TimePicker({ date, setDate }: TimePickerProps) {

  const onTimeChange = (time: Time | null) => {
    if (!time) return;
    const newDate = new Date(date);
    newDate.setHours(time.hour);
    newDate.setMinutes(time.minute);
    newDate.setSeconds(time.second);
    setDate(newDate);
  }

  const timeValue = date ? new Time(date.getHours(), date.getMinutes()) : null;

  return (
    <AriaTimeField
      value={timeValue}
      onChange={onTimeChange}
      className="flex items-center space-x-1"
    >
        <AriaDateField>
            {(segment) => (
            <div
                className={cn(
                    "px-1.5 py-1 text-sm rounded-md transition-colors tabular-nums",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:bg-accent",
                    !segment.isEditable && "text-muted-foreground",
                    segment.isPlaceholder && "text-muted-foreground"
                )}
            >
                {segment.text}
            </div>
            )}
        </AriaDateField>
    </AriaTimeField>
  )
}
