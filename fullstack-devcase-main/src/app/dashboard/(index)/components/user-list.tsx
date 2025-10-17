"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CalendarIcon,
  EllipsisVerticalIcon,
  FunnelIcon,
  PlusCircleIcon,
  RefreshCwIcon,
  Search,
  SearchIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import CommentsDataTable from "./data-table";
import usersService, { UserWithChildren } from "@/lib/api/users.service";
import { useAuth } from "@/contexts/AuthContext";
import { toURLSearchParams } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/use-debounced";

export default function UserList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // State
  const [users, setUsers] = useState<UserWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get("page") || "1"),
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  // Debounce search input to reduce API calls
  const searchTerm = useDebouncedValue(searchInput, 400);

  // Sorting state
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>(() => {
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");
    if (sortBy) {
      return [{ id: sortBy, desc: sortOrder === "DESC" }];
    }
    return [];
  });

  // Fetch users - memoized to prevent unnecessary re-renders
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const sortBy = sorting[0]?.id || "createdAt";
      const sortOrder = sorting[0]?.desc ? "DESC" : "ASC";

      const response = await usersService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        search: searchTerm || undefined,
      });

      setUsers(response.data);
      setPagination({
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.total,
        limit: response.pagination.limit,
      });
    } catch (err: any) {
      console.error("Error fetching users:", err);
      if (err.response?.status === 401) {
        setError("Oturum süresi doldu. Lütfen tekrar giriş yapın.");
        setTimeout(() => logout(), 2000);
      } else {
        setError(err.response?.data?.message || "Kullanıcılar yüklenemedi");
      }
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sorting, searchTerm, logout]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Update URL when query params change
  useEffect(() => {
    const params = toURLSearchParams({
      page: pagination.page,
      sortBy: sorting[0]?.id,
      sortOrder: sorting[0]?.desc ? "DESC" : "ASC",
      search: searchTerm
    });

    router.replace(`/dashboard?${params.toString()}`, { scroll: false });
  }, [pagination.page, sorting, searchTerm, router]);

  // Reset to page 1 when search term changes (debounced)
  useEffect(() => {
    if (searchTerm !== searchParams.get("search")) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [searchTerm, searchParams]);

  // Handle user deletion
  const handleDelete = async (userId: string) => {
    try {
      await usersService.deleteUser(userId);
      // Refresh the user list
      fetchUsers();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setError(err.response?.data?.message || "Kullanıcı silinemedi");
      throw err; // Re-throw to let the ActionsCell know it failed
    }
  };

  // Transform users for table (map to existing structure)
  const tableData = users.map((user) => ({
    id: user.id,
    fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
    email: user.email,
    avatarUrl: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=random`,
    role: user.role || "user",
    isActive: user.status === "active",
    createdAt: user.createdAt || new Date().toISOString(),
    children: user.children?.map((child) => ({
      id: child.id,
      fullName: `${child.firstName || ""} ${child.lastName || ""}`.trim() || child.email,
      email: child.email,
      avatarUrl: child.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(child.email)}&background=random`,
      role: child.role || "user",
      isActive: child.status === "active",
      createdAt: child.createdAt || new Date().toISOString(),
    })),
  }));

  return (
    <Card className="gap-10 p-[30px]">
      <div className="flex justify-between items-center gap-2">
        <p className="flex-1 font-bold text-xl">Tüm Kullanıcılar</p>
        <div className="relative hidden md:block">
          <Input
            placeholder="Burada ara"
            className="pl-10 py-2!"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <div className="absolute left-px top-px p-[12px] pointer-events-none">
            <Search className="size-5 text-muted-foreground" />
          </div>
        </div>
        <Button size="icon" variant="ghost" className="border md:hidden">
          <SearchIcon />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="border hidden md:flex"
          onClick={fetchUsers}
          disabled={loading}
        >
          <RefreshCwIcon className={loading ? "animate-spin" : ""} />
        </Button>
        <Button size="icon" variant="ghost" className="border hidden md:flex">
          <CalendarIcon />
        </Button>
        <Button size="icon" variant="ghost" className="border hidden md:flex">
          <FunnelIcon />
        </Button>
        <Button size="icon" variant="ghost" className="border">
          <EllipsisVerticalIcon />
        </Button>
        {isAdmin && (
          <Button onClick={() => router.push("/dashboard/users/new")}>
            <PlusCircleIcon /> Yeni Kullanıcı Ekle
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 my-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {loading && !users.length ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCwIcon className="animate-spin h-8 w-8 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Kullanıcılar yükleniyor...</p>
          </div>
        </div>
      ) : users.length === 0 && !loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-gray-500 text-lg">Kullanıcı bulunamadı</p>
            {searchTerm && (
              <p className="text-gray-400 text-sm mt-2">
                Arama kriterlerinizi değiştirmeyi deneyin
              </p>
            )}
          </div>
        </div>
      ) : (
        <CommentsDataTable
          data={tableData}
          pagination={{
            page: pagination.page,
            totalPages: pagination.totalPages,
            totalItems: pagination.totalItems,
          }}
          onPaginationChange={(pageIndex) => {
            setPagination((prev) => ({ ...prev, page: pageIndex + 1 }));
          }}
          onSortingChange={(newSorting) => {
            setSorting(newSorting);
          }}
          sorting={sorting}
          isAdmin={isAdmin}
          currentUserId={user?.id || ""}
          onDelete={handleDelete}
        />
      )}
    </Card>
  );
}
