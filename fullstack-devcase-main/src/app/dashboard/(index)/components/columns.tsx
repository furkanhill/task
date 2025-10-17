"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XCircleIcon,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

type RowUser = User & { children?: User[] };

export default function usersColumns(
  isAdmin: boolean,
  currentUserId: string,
  onDelete?: (id: string) => void
): ColumnDef<RowUser>[] {
  return [
    {
      id: "select",
      size: 10,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          onCheckedChange={(checked) => table.toggleAllRowsSelected(!!checked)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(!!checked)}
          aria-label="Select row"
        />
      ),
    },
    {
      id: "expander",
      header: "",
      size: 24,
      cell: ({ row }) => {
        const canExpand =
          row.getCanExpand?.() ??
          Boolean((row.original as RowUser).children?.length);
        if (!canExpand) return null;
        return (
          <Button
            size="icon"
            variant="ghost"
            onClick={row.getToggleExpandedHandler?.()}
            className="p-0 h-6 w-6"
            aria-label={row.getIsExpanded?.() ? "Collapse" : "Expand"}
          >
            {row.getIsExpanded?.() ? (
              <ChevronDownIcon className="size-4" />
            ) : (
              <ChevronRightIcon className="size-4" />
            )}
          </Button>
        );
      },
    },
    {
      accessorKey: "user",
      header: "User",
      minSize: 300,
      cell: ({ row }) => {
        const UserCell = () => {
          const router = useRouter();
          const canView = isAdmin || row.original.id === currentUserId;
          
          return (
            <div
              className={`flex items-center gap-2 ${canView ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'}`}
              style={{ paddingLeft: (row.depth ?? 0) * 16 }}
              onClick={() => {
                if (canView) {
                  router.push(`/dashboard/users/${row.original.id}`);
                }
              }}
            >
              <Image
                src={row.original.avatarUrl}
                alt={row.original.fullName}
                width={48}
                height={48}
                className="rounded-full size-12 object-cover"
              />
              <div>
                <p className="font-bold">{row.original.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {row.original.email}
                </p>
              </div>
            </div>
          );
        };
        return <UserCell />;
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => row.original.role,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        return row.original.isActive ? (
          <Badge
            className="w-30 py-2 font-semibold text-sm bg-[#89D2331A] text-[#89D233]"
            variant="default"
          >
            <CheckCircleIcon className="size-4!" />
            Active
          </Badge>
        ) : (
          <Badge
            className="w-30 py-2 font-semibold text-sm bg-[#F272771A] text-[#F27277]"
            variant="destructive"
          >
            <XCircleIcon className="size-4!" />
            Inactive
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      size: 80,
      cell: ({ row }: { row: any }) => {
        const user = row.original;
        const showActions = isAdmin || user.id === currentUserId;
        const canView = isAdmin || user.id === currentUserId;
        const canEdit = isAdmin;
        
        if (!showActions) return null;

        return (
          <ActionsCell 
            userId={user.id} 
            onDelete={isAdmin ? onDelete : undefined} 
            canDelete={isAdmin}
            canView={canView}
            canEdit={canEdit}
          />
        );
      },
    } as ColumnDef<RowUser>,
  ];
}

function ActionsCell({ 
  userId, 
  onDelete, 
  canDelete = false,
  canView = true,
  canEdit = true
}: { 
  userId: string; 
  onDelete?: (id: string) => void;
  canDelete?: boolean;
  canView?: boolean;
  canEdit?: boolean;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(userId);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {canView && (
          <DropdownMenuItem onClick={() => router.push(`/dashboard/users/${userId}`)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        )}
        {canEdit && (
          <DropdownMenuItem onClick={() => router.push(`/dashboard/users/${userId}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </DropdownMenuItem>
        )}
        {canDelete && (
          <DropdownMenuItem
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
