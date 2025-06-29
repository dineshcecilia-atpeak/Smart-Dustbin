async function handler({ notificationId }) {
  try {
    const updated = await sql`
      UPDATE bin_notifications 
      SET is_read = true 
      WHERE id = ${notificationId}
      RETURNING *
    `;

    if (updated.length === 0) {
      return { error: "Notification not found" };
    }

    return { notification: updated[0] };
  } catch (error) {
    return { error: "Failed to mark notification as read" };
  }
}