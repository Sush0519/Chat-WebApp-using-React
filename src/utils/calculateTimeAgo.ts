export function getLatestMessageTimestamp(messages: { timestamp: string }[]) {
  if (messages.length === 0) {
    return "No messages";
  }

  const latestMessage = messages.reduce((latest, current) => {
    const latestDate = new Date(latest.timestamp);
    const currentDate = new Date(current.timestamp);
    return currentDate > latestDate ? current : latest;
  });

  const timePart = latestMessage.timestamp.split("T")[1].substring(0, 5);

  console.log("Latest Timestamp (Time Part):", timePart);
  // return timePart;
  const now = new Date();
  const [hours, minutes] = timePart.split(":").map(Number);
  const messageTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  );

  // Calculate the difference in minutes
  let diff = 0;
  if (now.getTime() > messageTime.getTime()) {
    diff = now.getTime() - messageTime.getTime(); // Now is greater
  } else {
    diff = messageTime.getTime() - now.getTime(); // Message time is greater
  }
  const minutesAgo = Math.floor(diff / (1000 * 60)); // Convert to minutes

  // Format the output
  if (minutesAgo < 60) {
    return `${minutesAgo}m Ago`;
  } else {
    const hoursAgo = Math.floor(minutesAgo / 60);
    return `${hoursAgo}h Ago`;
  }
}
