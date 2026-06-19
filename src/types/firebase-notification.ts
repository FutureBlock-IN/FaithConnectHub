export type NotificationContentType = "song" | "article" | "sermon";

export type FirebaseNotification = {
  id: string;
  type: NotificationContentType;
  /** Heading, e.g. "New Song Added". */
  title: string;
  /** Body message, e.g. "A new worship song has been added." */
  message: string;
  /** Title of the related content item, e.g. "Jesus Christ". */
  contentTitle: string;
  /** Optional thumbnail image URL for the related content. */
  image?: string;
  /** ID of the related song/article/sermon. */
  contentId: string;
  createdAt: number;
};
