import { addDays, isSameDay, differenceInDays } from 'date-fns'

export function getUpcomingBirthdays(
  birthday: Date,
  currentDate: Date,
  reminderDays: number
): Date[] {
  const currentYear = currentDate.getFullYear()
  const nextBirthday = new Date(currentYear, birthday.getMonth(), birthday.getDate())

  // If birthday has passed this year, get next year's birthday
  if (nextBirthday < currentDate) {
    nextBirthday.setFullYear(currentYear + 1)
  }

  const reminderDate = addDays(nextBirthday, -reminderDays)

  // If reminder date is in the past or today, don't send
  if (reminderDate < currentDate && !isSameDay(reminderDate, currentDate)) {
    return []
  }

  return [reminderDate]
}

export function getDaysUntilBirthday(birthday: Date, currentDate: Date): number {
  const currentYear = currentDate.getFullYear()
  let nextBirthday = new Date(currentYear, birthday.getMonth(), birthday.getDate())

  // If birthday has passed this year, get next year's birthday
  if (nextBirthday < currentDate) {
    nextBirthday.setFullYear(currentYear + 1)
  }

  return differenceInDays(nextBirthday, currentDate)
}

export function adjustForTimezone(date: Date, timezone: string): Date {
  // For now, we'll use UTC as the base and adjust accordingly
  // In a production app, you'd want to use a proper timezone library like date-fns-tz
  const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000))

  // Simple timezone handling - in production, use a proper library
  if (timezone !== 'UTC') {
    // This is a simplified implementation
    // You might want to use a library like 'date-fns-tz' for proper timezone support
    console.warn(`Timezone ${timezone} adjustment not fully implemented`)
  }

  return utcDate
}
