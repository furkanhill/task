'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateUserSchema, type UpdateUserData } from '@/lib/validations/user.schema';
import usersService, { UserWithChildren } from '@/lib/api/users.service';
import { useAuth } from '@/contexts/AuthContext';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { user: currentUser } = useAuth();
  
  const isAdmin = currentUser?.role === 'admin';
  const isOwnProfile = currentUser?.id === userId;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserWithChildren | null>(null);
  const [availableParents, setAvailableParents] = useState<UserWithChildren[]>([]);
  const [loadingParents, setLoadingParents] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UpdateUserData>({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsFetching(true);
        
        // Check if user has permission to edit - only admin can edit
        if (!isAdmin) {
          setError('Kullanıcıları düzenleme yetkiniz yok. Sadece yöneticiler profilleri düzenleyebilir.');
          return;
        }

        const response = await usersService.getUserById(userId);
        const userData = response.data;
        setUser(userData);

        // Populate form with user data
        reset({
          email: userData.email,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          role: userData.role as 'admin' | 'user',
          status: userData.status as 'active' | 'inactive',
          company: userData.company || '',
          department: userData.department || '',
          location: userData.location || '',
          phone: userData.phone || '',
          avatar: userData.avatar || '',
          parentId: userData.parentId || null,
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Kullanıcı bilgileri alınamadı');
      } finally {
        setIsFetching(false);
      }
    };

    if (userId && currentUser?.id) {
      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentUser?.id]);

  // Fetch available parent users (for admins only)
  useEffect(() => {
    const fetchParents = async () => {
      try {
        setLoadingParents(true);
        const response = await usersService.getUsers({ limit: 100, sortBy: 'firstName', sortOrder: 'ASC' });
        
        // Get all child IDs recursively to prevent circular references
        const getAllChildIds = (userId: string, users: UserWithChildren[]): string[] => {
          const childIds: string[] = [];
          const user = users.find(u => u.id === userId);
          
          if (user?.children) {
            user.children.forEach(child => {
              childIds.push(child.id);
              // Recursively get children's children
              childIds.push(...getAllChildIds(child.id, users));
            });
          }
          
          return childIds;
        };
        
        const excludedIds = [
          userId, // The user itself
          ...getAllChildIds(userId, response.data) // All descendants (children, grandchildren, etc.)
        ];
        
        // Filter out current user and all its descendants
        setAvailableParents(response.data.filter(u => !excludedIds.includes(u.id)));
      } catch (err) {
        console.error('Failed to fetch parent users:', err);
      } finally {
        setLoadingParents(false);
      }
    };

    if (isAdmin) {
      fetchParents();
    }
  }, [isAdmin, userId]);

  const onSubmit = async (data: UpdateUserData) => {
    // Only admin can submit edits
    if (!isAdmin) {
      setError('Kullanıcıları düzenleme yetkiniz yok. Sadece yöneticiler profilleri düzenleyebilir.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare update data
      const updateData = { ...data };

      // Remove password if empty (keep current password)
      if (!updateData.password || updateData.password === '') {
        delete updateData.password;
      }

      await usersService.updateUser(userId, updateData);
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kullanıcı güncellenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await usersService.deleteUser(userId);
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kullanıcı silinemedi');
      setIsDeleting(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => router.back()}>Geri Dön</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            disabled={isLoading || isDeleting}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Kullanıcı Düzenle</h1>
            <p className="text-muted-foreground">
              {user?.email} için kullanıcı bilgilerini güncelle
            </p>
          </div>
        </div>
        
        {/* Delete Button - Only for admins and not for own profile */}
        {isAdmin && !isOwnProfile && (
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Siliniyor...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Kullanıcıyı Sil
              </>
            )}
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Bilgileri</CardTitle>
          <CardDescription>Aşağıdaki kullanıcı detaylarını güncelleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email & Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  E-posta
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="kullanici@example.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Yeni Şifre <span className="text-muted-foreground text-xs">(isteğe bağlı)</span>
                </label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="Mevcut şifreyi korumak için boş bırakın"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Sadece şifreyi değiştirmek istiyorsanız doldurun
                </p>
              </div>
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  Ad
                </label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  placeholder="Ahmet"
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Soyad
                </label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  placeholder="Yılmaz"
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Role & Status - Admin only fields */}
            {isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">
                    Rol
                  </label>
                  <Select
                    value={watch('role')}
                    onValueChange={(value) => setValue('role', value as 'admin' | 'user')}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Rol seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-destructive">{errors.role.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Durum
                  </label>
                  <Select
                    value={watch('status')}
                    onValueChange={(value) => setValue('status', value as 'active' | 'inactive')}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Aktif Değil</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-destructive">{errors.status.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Company & Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="company" className="text-sm font-medium">
                  Şirket
                </label>
                <Input
                  id="company"
                  {...register('company')}
                  placeholder="Teknoloji A.Ş."
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="department" className="text-sm font-medium">
                  Departman
                </label>
                <Input
                  id="department"
                  {...register('department')}
                  placeholder="Mühendislik"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Location & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">
                  Konum
                </label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="İstanbul, Türkiye"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Telefon
                </label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+90 (555) 123-4567"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Avatar */}
            <div className="space-y-2">
              <label htmlFor="avatar" className="text-sm font-medium">
                Avatar Linki
              </label>
              <Input
                id="avatar"
                {...register('avatar')}
                placeholder="https://example.com/avatar.png"
                disabled={isLoading}
              />
              {errors.avatar && (
                <p className="text-sm text-destructive">{errors.avatar.message}</p>
              )}
            </div>

            {/* Parent User (Admin Only) */}
            {isAdmin && (
              <div className="space-y-2">
                <label htmlFor="parentId" className="text-sm font-medium">
                  Üst Kullanıcı (Hiyerarşik Yapı)
                </label>
                <Select
                  value={watch('parentId') || 'none'}
                  onValueChange={(value) => setValue('parentId', value === 'none' ? null : value)}
                  disabled={isLoading || loadingParents}
                >
                  <SelectTrigger id="parentId">
                    <SelectValue placeholder={loadingParents ? "Loading users..." : "Select parent user (optional)"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Üst Kullanıcı Yok (Root Kullanıcı)</SelectItem>
                    {availableParents.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.firstName && parent.lastName 
                          ? `${parent.firstName} ${parent.lastName}` 
                          : parent.email}
                        {parent.role === 'admin' && ' (Admin)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.parentId && (
                  <p className="text-sm text-destructive">{errors.parentId.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Bu kullanıcıyı bir üst kullanıcıya atayarak hiyerarşik organizasyonu sağlayın
                </p>
                {user?.children && user.children.length > 0 && (
                  <p className="text-xs text-yellow-600">
                    Bu kullanıcının {user.children.length} tane alt kullanıcısı var. Üst kullanıcı değiştirildiğinde hiyerarşi etkilenebilir.
                  </p>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kullanıcıyı Güncelle
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

