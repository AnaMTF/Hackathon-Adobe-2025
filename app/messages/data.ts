export type Chat = {
  id: string;
  name: string;
  email: string;
  status: "online" | "away" | "busy" | "offline";
  lastMessage: string;
  unread?: boolean;
};

export type Msg = {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
};

export const CHATS: Chat[] = [
  {
    id: "1",
    name: "Aisha Khan",
    email: "aisha@xiat.com",
    status: "online",
    lastMessage: "I'll send the report by EOD.",
    unread: true,
  },
  {
    id: "2",
    name: "Ben Torres",
    email: "ben.torres@xiat.com",
    status: "away",
    lastMessage: "On a call right now — can we talk later?",
    unread: false,
  },
  {
    id: "3",
    name: "Carla Reyes",
    email: "carla@xiat.com",
    status: "busy",
    lastMessage: "Locked the design for sprint 6.",
    unread: true,
  },
  {
    id: "4",
    name: "Daniel Wu",
    email: "daniel.wu@xiat.com",
    status: "offline",
    lastMessage: "Thanks — reviewed and approved.",
    unread: false,
  },
];

export const CONVERSATIONS: Record<string, Msg[]> = {
  "1": [
    {
      id: "m1",
      from: "them",
      text: "Hey — did you get a chance to look at the Q3 numbers?",
      time: "09:02",
    },
    {
      id: "m2",
      from: "me",
      text: "Not yet, I'll review them this afternoon.",
      time: "09:05",
    },
    {
      id: "m3",
      from: "them",
      text: "Great — I added comments to the shared doc.",
      time: "09:07",
    },
  ],
  "2": [
    {
      id: "m1",
      from: "them",
      text: "Can we push the meeting by 30 minutes?",
      time: "11:10",
    },
    { id: "m2", from: "me", text: "Sure, works for me.", time: "11:11" },
  ],
  "3": [
    {
      id: "m1",
      from: "them",
      text: "I've locked the design. Please don't edit anymore.",
      time: "14:22",
    },
    {
      id: "m2",
      from: "me",
      text: "Acknowledged — thanks for the heads up.",
      time: "14:25",
    },
    {
      id: "m3",
      from: "them",
      text: "Also update the figma notes.",
      time: "14:26",
    },
  ],
  "4": [
    {
      id: "m1",
      from: "them",
      text: "Thanks for the review — approved on my side.",
      time: "16:00",
    },
    { id: "m2", from: "me", text: "Awesome, merging now.", time: "16:05" },
  ],
};
