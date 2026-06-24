import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import HeroSection from "@/components/tiligo/HeroSection";
import CategoryPills from "@/components/tiligo/CategoryPills";
import BusinessCard from "@/components/tiligo/BusinessCard";
import SkeletonCard from "@/components/tiligo/SkeletonCard";
import Navbar from "@/components/tiligo/Navbar";
import LandingFooter from "@/components/tiligo/LandingFooter";
import PermissionPrompt from "@/components/tiligo/PermissionPrompt";

export default function Home() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    base44.entities.Business.list("-created_date", 50)
      .then(data => { setBusinesses(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = businesses.filter(b => {
    const matchCat = !selectedCategory || b.category === selectedCategory;
    const matchSearch = !searchQuery || b.name?.toLowerCase().includes(searchQuery.toLowerCase()) || b.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch && b.status === "active";
  });

  const openNow = filtered.filter(b => b.is_open);
  const closedNow = filtered.filter(b => !b.is_open);

  return (
    <div className="min-h-screen bg-background pb-24 md:pt-16">
      <PermissionPrompt />
      <Navbar />
      <HeroSection onSearch={setSearchQuery} />

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-8">
        <section>
          <h2 className="font-heading font-bold text-lg mb-4 text-foreground">
            <span className="gradient-text">Kategoritë</span> Popullore
          </h2>
          <CategoryPills selected={selectedCategory} onSelect={setSelectedCategory} />
        </section>

        {loading ? (
          <SkeletonCard count={6} />
        ) : (
          <>
            {openNow.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-bold text-lg text-foreground">
                    <span className="gradient-text">Dyqane</span> të Hapura
                    <span className="ml-2 text-sm font-mono text-primary">({openNow.length})</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {openNow.map(b => <BusinessCard key={b.id} business={b} />)}
                </div>
              </section>
            )}

            {closedNow.length > 0 && (
              <section>
                <h2 className="font-heading font-bold text-lg mb-4 text-muted-foreground">
                  Mbyllur tani
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                  {closedNow.map(b => <BusinessCard key={b.id} business={b} />)}
                </div>
              </section>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <span className="text-5xl mb-4 block">🔍</span>
                <p className="text-muted-foreground text-lg">Nuk u gjetën dyqane</p>
                <p className="text-muted-foreground text-sm mt-1">Provoni të kërkoni diçka tjetër</p>
              </div>
            )}
          </>
        )}
      </div>

      <LandingFooter />
    </div>
  );
}