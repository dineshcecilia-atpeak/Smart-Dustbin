async function handler({ isRead } = {}) {
  try {
    const fields = `
      id,
      fill_level,
      message,
      created_at,
      is_read,
      notification_type,
      color,
      status_type
    `;

    if (typeof isRead === "boolean") {
      return {
        notifications: await sql(
          `
          SELECT ${fields}
          FROM bin_notifications
          WHERE is_read = $1
          ORDER BY created_at DESC
          LIMIT 10
        `,
          [isRead]
        ),
      };
    }

    return {
      notifications: await sql(`
        SELECT ${fields}
        FROM bin_notifications
        ORDER BY created_at DESC
        LIMIT 10
      `),
    };
  } catch (error) {
    return { error: "Failed to fetch notifications" };
  }
}