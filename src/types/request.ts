export enum RequestStatus {
  PENDING = 'PENDING',      // 承認待ち
  ACCEPTED = 'ACCEPTED',    // 承認済み
  REJECTED = 'REJECTED',    // 拒否
  DELIVERED = 'DELIVERED',  // 納品済み
  COMPLETED = 'COMPLETED'   // 支払い済み
}

export const RequestStatusLabel: Record<RequestStatus, string> = {
  [RequestStatus.PENDING]: '承認待ち',
  [RequestStatus.ACCEPTED]: '承認済み',
  [RequestStatus.REJECTED]: '拒否',
  [RequestStatus.DELIVERED]: '納品済み',
  [RequestStatus.COMPLETED]: '支払い済み'
}

export const RequestStatusColor: Record<RequestStatus, string> = {
  [RequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [RequestStatus.ACCEPTED]: 'bg-blue-100 text-blue-800',
  [RequestStatus.REJECTED]: 'bg-red-100 text-red-800',
  [RequestStatus.DELIVERED]: 'bg-green-100 text-green-800',
  [RequestStatus.COMPLETED]: 'bg-purple-100 text-purple-800'
}

export interface RequestFile {
  id: string;
  requestId: string;
  fileName: string;
  fileUrl: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Request {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: RequestStatus;
  senderId: string;
  receiverId: string;
  sender: {
    id: string;
    username: string;
    name: string;
    image: string;
  };
  receiver: {
    id: string;
    username: string;
    name: string;
    image: string;
    stripeAccountId: string | null;
  };
  files: RequestFile[];
  createdAt: Date;
  updatedAt: Date;
} 