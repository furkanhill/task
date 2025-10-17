'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import usersService, { UserWithChildren } from '@/lib/api/users.service';
import { useAuth } from '@/contexts/AuthContext';

export default function ViewUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { user: currentUser } = useAuth();
  
  const isAdmin = currentUser?.role === 'admin';
  const isOwnProfile = currentUser?.id === userId;

  const [isFetching, setIsFetching] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserWithChildren | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsFetching(true);
        
        // Check if user has permission to view this profile
        if (!isAdmin && !isOwnProfile) {
          setError('Bu kullanıcıyı görüntüleme yetkiniz yok');
          return;
        }

        const response = await usersService.getUserById(userId);
        setUser(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Kullanıcı bilgileri alınamadı');
      } finally {
        setIsFetching(false);
      }
    };

    if (userId && currentUser?.id) {
      fetchUser();
    }
  }, [userId, currentUser?.id, isAdmin, isOwnProfile]);

  // Handle delete
  const handleDelete = async () => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await usersService.deleteUser(userId);
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Kullanıcı silinemedi');
      setIsDeleting(false);
    }
  };

  // Show loading
  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show error
  if (error || !user) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Kullanıcı Bulunamadı</h1>
        </div>
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          {error || 'Kullanıcı bulunamadı'}
        </div>
      </div>
    );
  }

  const userInitials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.email[0].toUpperCase();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Kullanıcı Detayları</h1>
            <p className="text-muted-foreground">Kullanıcı bilgilerini görüntüle</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isAdmin && (
            <Button
              onClick={() => router.push(`/dashboard/users/${userId}/edit`)}
              variant="default"
            >
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          )}
          {isAdmin && !isOwnProfile && (
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} alt={user.email} />
              <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.email}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                {user.email}
                <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                  {user.status}
                </Badge>
                <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                  {user.role}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Kişisel Bilgiler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="Ad" value={user.firstName} />
              <InfoField label="Soyad" value={user.lastName} />
              <InfoField label="E-posta" value={user.email} />
              <InfoField label="Telefon" value={user.phone} />
            </div>
          </div>

          {/* Professional Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">Mesleki Bilgiler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="Şirket" value={user.company} />
              <InfoField label="Departman" value={user.department} />
              <InfoField label="Konum" value={user.location} />
              <InfoField label="Rol" value={user.role} />
              <InfoField label="Durum" value={user.status} />
            </div>
          </div>

          {/* Hierarchy Information */}
          {(user.parent || (user.children && user.children.length > 0)) && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Hiyerarşi</h3>
              <div className="space-y-4">
                {/* Parent */}
                {user.parent && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Üst Kullanıcı</label>
                    <div className="mt-1">
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => isAdmin && router.push(`/dashboard/users/${user.parent!.id}`)}
                        disabled={!isAdmin}
                      >
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={user.parent.avatar} />
                          <AvatarFallback className="text-xs">
                            {user.parent.firstName?.[0]}{user.parent.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        {user.parent.firstName && user.parent.lastName 
                          ? `${user.parent.firstName} ${user.parent.lastName}` 
                          : user.parent.email}
                        {user.parent.role === 'admin' && (
                          <Badge variant="destructive" className="ml-2">Yönetici</Badge>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Children */}
                {user.children && user.children.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Alt Kullanıcılar ({user.children.length})
                    </label>
                    <div className="mt-2 space-y-2">
                      {user.children.map((child) => (
                        <Button
                          key={child.id}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => isAdmin && router.push(`/dashboard/users/${child.id}`)}
                          disabled={!isAdmin}
                        >
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={child.avatar} />
                            <AvatarFallback className="text-xs">
                              {child.firstName?.[0]}{child.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          {child.firstName && child.lastName 
                            ? `${child.firstName} ${child.lastName}` 
                            : child.email}
                          <Badge 
                            variant={child.status === 'active' ? 'default' : 'secondary'} 
                            className="ml-auto"
                          >
                            {child.status}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">Meta Veriler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField 
                label="Kullanıcı ID" 
                value={user.id}
                className="font-mono text-xs"
              />
              <InfoField 
                label="Oluşturulma Tarihi" 
                value={user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for displaying info fields
function InfoField({ 
  label, 
  value, 
  className = '' 
}: { 
  label: string; 
  value?: string | null; 
  className?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <p className={`mt-1 text-sm ${className || ''}`}>
        {value || <span className="text-muted-foreground italic">Belirtilmemiş</span>}
      </p>
    </div>
  );
}

