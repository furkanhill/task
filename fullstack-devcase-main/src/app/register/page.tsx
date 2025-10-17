"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    company: "",
    department: "",
    location: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(formData);
    } catch (err: any) {
      setError(err.message || "Kayıt başarısız. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-2xl w-full space-y-8 p-10">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Hesabınızı oluşturun
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Veya{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              mevcut hesabınıza giriş yapın
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                Ad
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Ahmet"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Soyad
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Yılmaz"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-posta adresi *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="ahmet@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Şifre *
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Min. 6 karakter"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Şirket
              </label>
              <Input
                id="company"
                name="company"
                type="text"
                placeholder="Teknoloji A.Ş."
                value={formData.company}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Departman
              </label>
              <Input
                id="department"
                name="department"
                type="text"
                placeholder="Mühendislik"
                value={formData.department}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Konum
              </label>
              <Input
                id="location"
                name="location"
                type="text"
                placeholder="İstanbul, Türkiye"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+90-555-012-3456"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

