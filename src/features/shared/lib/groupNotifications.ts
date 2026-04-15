type NotificationWithCreatedAt = {
  created_at: string;
};

export function groupNotifications<T extends NotificationWithCreatedAt>(
  notifications: T[]
) {

  const groups: Record<string, T[]> = {};

  const now = new Date();

  notifications.forEach(n => {

    const created = new Date(n.created_at);

    const diff = (now.getTime() - created.getTime()) / 1000;

    let label = "";

    if (diff < 60) label = "Now";
    else if (diff < 3600) label = "Minutes Ago";
    else if (diff < 86400) label = "Hours Ago";
    else if (diff < 172800) label = "Yesterday";
    else if (diff < 604800) label = "Days Ago";
    else if (diff < 2592000) label = "Weeks Ago";
    else if (diff < 31536000) label = "Months Ago";
    else label = "Years Ago";

    if (!groups[label]) groups[label] = [];

    groups[label].push(n);

  });

  return groups;

}
