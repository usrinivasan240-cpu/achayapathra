
"use client"

import * as React from "react"
import { Time } from "@internationalized/date"
import { TimeField as AriaTimeField, DateSegment as AriaDateSegment, TimeFieldProps } from "react-aria-components"
import { cn } from "@/lib/utils"

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


export function TimePicker({ date, setDate }: {date: Date | undefined, setDate: (date: Date) => void}) {

  // A robust way to handle the time value, ensuring it's never null for the component
  const timeValue = React.useMemo(() => {
    if (date instanceof Date && !isNaN(date.getTime())) {
      return new Time(date.getHours(), date.getMinutes());
    }
    // Return a default time (e.g., now) if the date is invalid or undefined
    const now = new Date();
    return new Time(now.getHours(), now.getMinutes());
  }, [date]);


  const onTimeChange = (newTime: Time | null) => {
    if (!newTime) return;

    // Use the existing date's date part, or default to today
    const newDate = date ? new Date(date) : new Date();
    newDate.setHours(newTime.hour);
    newDate.setMinutes(newTime.minute);
    newDate.setSeconds(newTime.second || 0);

    // Only call setDate if the new date is valid
    if (!isNaN(newDate.getTime())) {
        setDate(newDate);
    }
  }


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
