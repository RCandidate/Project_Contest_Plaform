export type MessageAuthorKind = "participant" | "staff" | "system";


export interface MessageView {
  id: string;
  text: string;
  kind: "message" | "status";
  createdAt: Date;
  authorKind: MessageAuthorKind;
  authorLabel: string;
  isMine: boolean;
  isInternal?: boolean;
  authorName?: string | null;
}

export interface UnreadMap {
  [applicationId: string]: number;
}
