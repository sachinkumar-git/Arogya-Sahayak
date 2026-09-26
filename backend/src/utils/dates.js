const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

function startOfToday(now = new Date()) {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  return date;
}

const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * MINUTE);
const addDays = (date, days) => new Date(date.getTime() + days * DAY);

function ageFrom(dateOfBirth, now = new Date()) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  let age = now.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

module.exports = { startOfToday, addMinutes, addDays, ageFrom };
