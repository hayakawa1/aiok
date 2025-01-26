export enum RequestStatus {
  PENDING = 'PENDING',      // 受付中
  ACCEPTED = 'ACCEPTED',    // 承諾済み
  REJECTED = 'REJECTED',    // 拒否
  DELIVERED = 'DELIVERED',  // 配信済み
  COMPLETED = 'COMPLETED'   // 完了（ファイルアップロード済み）
}

export const RequestStatusLabel: Record<RequestStatus, string> = {
  [RequestStatus.PENDING]: '依頼中',
  [RequestStatus.ACCEPTED]: '承諾済み',
  [RequestStatus.REJECTED]: '拒否済み',
  [RequestStatus.DELIVERED]: '納品済み',
  [RequestStatus.COMPLETED]: '完了'
}

export const RequestStatusText: Record<RequestStatus, string> = {
  [RequestStatus.PENDING]: '受付中',
  [RequestStatus.ACCEPTED]: '承諾済み',
  [RequestStatus.REJECTED]: '拒否済み',
  [RequestStatus.DELIVERED]: '納品済み',
  [RequestStatus.COMPLETED]: '完了'
}

export const RequestStatusColor: Record<RequestStatus, string> = {
  [RequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [RequestStatus.ACCEPTED]: 'bg-blue-100 text-blue-800',
  [RequestStatus.REJECTED]: 'bg-red-100 text-red-800',
  [RequestStatus.DELIVERED]: 'bg-green-100 text-green-800',
  [RequestStatus.COMPLETED]: 'bg-purple-100 text-purple-800'
}

export interface RequestFile {
  id: number;
  requestId: number;
  fileName: string;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Request {
  id: number;
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
  };
  files: RequestFile[];
  createdAt: Date;
  updatedAt: Date;
} 