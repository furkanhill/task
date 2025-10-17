'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createUserSchema, type CreateUserData } from '@/lib/validations/user.schema';
import usersService, { UserWithChildren } from '@/lib/api/users.service';
import { useAuth } from '@/contexts/AuthContext';

export default function NewUserPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableParents, setAvailableParents] = useState<UserWithChildren[]>([]);
  const [loadingParents, setLoadingParents] = useState(true);

  // Redirect non-admin users
  useEffect(() => {
    if (user && !isAdmin) {
      router.replace(`/dashboard/users/${user.id}/edit`);
    }
  }, [user, isAdmin, router]);

  // Fetch available parent users
  useEffect(() => {
    const fetchParents = async () => {
      try {
        setLoadingParents(true);
        const response = await usersService.getUsers({ limit: 100, sortBy: 'firstName', sortOrder: 'ASC' });
        setAvailableParents(response.data);
      } catch (err) {
        console.error('Failed to fetch parent users:', err);
      } finally {
        setLoadingParents(false);
      }
    };

    if (isAdmin) {
      fetchParents();
    }
  }, [isAdmin]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: 'user',
      status: 'active',
    },
  });

  const onSubmit = async (data: CreateUserData) => {
    setIsLoading(true);
    setError(null);

    try {
      await usersService.createUser(data);
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kullanıcı oluşturulamadı');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking permissions
  if (!user || (!isAdmin && user)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Yeni Kullanıcı Ekle</h1>
          <p className="text-muted-foreground">Yeni kullanıcı hesabı oluşturun</p>
        </div>
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
          <CardDescription>Yeni kullanıcı oluşturmak için detayları doldurun</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email & Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  E-posta <span className="text-destructive">*</span>
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
                  Şifre <span className="text-destructive">*</span>
                </label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
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

            {/* Role & Status */}
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
                    <SelectItem value="user">Kullanıcı</SelectItem>
                    <SelectItem value="admin">Yönetici</SelectItem>
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
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Pasif</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-destructive">{errors.status.message}</p>
                )}
              </div>
            </div>

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
                Avatar URL
              </label>
              <Input
                id="avatar"
                {...register('avatar')}
                placeholder="https://example.com/avatar.jpg"
                disabled={isLoading}
              />
              {errors.avatar && (
                <p className="text-sm text-destructive">{errors.avatar.message}</p>
              )}
            </div>

            {/* Parent User */}
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
                  <SelectValue placeholder={loadingParents ? "Kullanıcılar yükleniyor..." : "Üst kullanıcı seçin (isteğe bağlı)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Üst Yok (Kök Kullanıcı)</SelectItem>
                  {availableParents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.firstName && parent.lastName 
                        ? `${parent.firstName} ${parent.lastName}` 
                        : parent.email}
                        {parent.role === 'admin' && ' (Yönetici)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.parentId && (
                <p className="text-sm text-destructive">{errors.parentId.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Hiyerarşik organizasyon için bu kullanıcıyı bir üst kullanıcıya atayın
              </p>
            </div>

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
                Kullanıcı Oluştur
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

