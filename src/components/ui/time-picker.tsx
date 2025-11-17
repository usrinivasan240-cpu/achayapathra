
"use client"

import * as React from "react"
import { Time } from "@internationalized/date"
import { TimeField as AriaTimeField, DateSegment as AriaDateSegment, TimeFieldProps } from "react-aria-components"
import { cn } from "@/lib/utils"

interface CustomTimeFieldProps<T extends Time> extends TimeFieldProps<T> {
  // You can add any other custom props here if needed
}

const DateSegment = ({ segment, ...props }: {segment: any, [key: string]: any}) => {
    return (
      <AriaDateSegment
        segment={segment}
        className={cn(
          "px-1.5 py-1 text-sm rounded-md transition-colors tabular-nums",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:bg-accent",
          !segment.isEditable && "text-muted-foreground",
          segment.isPlaceholder && "text-muted-foreground"
        )}
        {...props}
      />
    );
};


export function TimePicker({ date, setDate }: {date: Date, setDate: (date: Date) => void}) {

  const onTimeChange = (time: Time | null) => {
    if (!time) return;
    const newDate = new Date(date);
    newDate.setHours(time.hour);
    newDate.setMinutes(time.minute);
    newDate.setSeconds(time.second || 0);
    setDate(newDate);
  }

  const timeValue = date ? new Time(date.getHours(), date.getMinutes()) : null;

  return (
    <AriaTimeField
      value={timeValue}
      onChange={onTimeChange}
      className="flex items-center space-x-1"
    >
      {(segment) => <DateSegment segment={segment} />}
    </AriaTimeField>
  )
}
