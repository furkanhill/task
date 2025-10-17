"use client";

import { DataTable } from "@/components/ui/data-table";
import { SortingState } from "@tanstack/react-table";
import usersColumns from "./columns";

type User = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export default function CommentsDataTable({
  data,
  pagination,
  onPaginationChange,
  onSortingChange,
  sorting,
  isAdmin = false,
  currentUserId,
  onDelete,
}: {
  data: (User & { children?: User[] })[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
  onPaginationChange: (pageIndex: number, pageSize: number) => void;
  onSortingChange: (sorting: SortingState) => void;
  sorting: SortingState;
  isAdmin?: boolean;
  currentUserId: string;
  onDelete?: (id: string) => void;
}) {
  return (
    <DataTable
      columns={usersColumns(isAdmin, currentUserId, onDelete)}
      data={data}
      getSubRows={(row) => (row as User & { children?: User[] }).children}
      manualPagination
      pageCount={pagination.totalPages}
      pageIndex={pagination.page - 1}
      onPaginationChange={onPaginationChange}
      manualSorting
      onSortingChange={onSortingChange}
      sorting={sorting}
      total={pagination.totalItems}
    />
  );
}
