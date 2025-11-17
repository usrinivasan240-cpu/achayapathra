"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Time, getLocalTimeZone, today } from "@internationalized/date"
import { TimeField } from "react-aria-components"
import { DateField } from "react-aria-components"

interface TimePickerProps {
    date: Date;
    setDate: (date: Date) => void;
}

export function TimePicker({ date, setDate }: TimePickerProps) {

  const onTimeChange = (time: Time) => {
    const newDate = new Date(date);
    newDate.setHours(time.hour);
    newDate.setMinutes(time.minute);
    newDate.setSeconds(time.second);
    setDate(newDate);
  }

  return (
    <TimeField
      value={
        new Time(date.getHours(), date.getMinutes())
      }
      onChange={onTimeChange}
      className="flex items-center space-x-2"
    >
      <DateField className="flex">
        {(segment) => (
          <div
            className={`px-2 py-1.5 text-sm rounded-md transition-colors ${
              segment.isFocused ? "bg-accent" : ""
            }`}
          >
            {segment.text}
          </div>
        )}
      </DateField>
    </TimeField>
  )
}

    