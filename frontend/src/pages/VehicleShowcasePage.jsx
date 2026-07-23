import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BatteryCharging, Gauge, Zap, RotateCw, Search, X, Bike, Truck, Car, Bus, Sparkles } from 'lucide-react';
import { vehicleCategories, vehicleDatabase } from '../constants/vehicleDatabase.js';

// Colorful diverse vehicle images from Unsplash - red, blue, yellow, green, white, black
const vehicleImages = {
  two_wheeler: [
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=250',
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=250',
    'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=400&h=250',
    'https://images.unsplash.com/photo-1607427293702-036933bbf3f0?w=400&h=250',
  ],
  three_wheeler: [
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250',
    'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=400&h=250',
  ],
  four_wheeler: [
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=250',       // red sportscar
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=250',       // silver luxury
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250',       // blue sportscar
    'https://images.unsplash.com/photo-1619767886558-efdc7b9af5f5?w=400&h=250',       // white EV charging
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=250',       // blue mercedes
    'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400&h=250',       // orange/amber
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=250',       // black luxury
    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=250',       // blue/teal
  ],
  bus_heavy: [
    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=250',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=250',
  ],
};

// Colorful category themes with vibrant accents
const categoryColors = {
  two_wheeler: { bg: 'from-slate-900 to-slate-800', border: 'border-cyan-400/60', glow: 'shadow-cyan-500/20', overlay: 'from-cyan-500/30 to-transparent' },
  three_wheeler: { bg: 'from-slate-900 to-slate-800', border: 'border-emerald-400/60', glow: 'shadow-emerald-500/20', overlay: 'from-emerald-500/30 to-transparent' },
  four_wheeler: { bg: 'from-slate-900 to-slate-800', border: 'border-violet-400/60', glow: 'shadow-violet-500/20', overlay: 'from-violet-500/30 to-transparent' },
  bus_heavy: { bg: 'from-slate-900 to-slate-800', border: 'border-amber-400/60', glow: 'shadow-amber-500/20', overlay: 'from-amber-500/30 to-transparent' },
};

const categoryAccents = {
  two_wheeler: { icon: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40', gradient: 'from-cyan-400 to-blue-500' },
  three_wheeler: { icon: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40', gradient: 'from-emerald-400 to-teal-500' },
  four_wheeler: { icon: 'text-violet-400', badge: 'bg-violet-500/20 text-violet-200 border-violet-400/40', gradient: 'from-violet-400 to-purple-500' },
  bus_heavy: { icon: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-200 border-amber-400/40', gradient: 'from-amber-400 to-orange-500' },
};

const categoryIcons = {
  two_wheeler: Bike,
  three_wheeler: Truck,
  four_wheeler: Car,
  bus_heavy: Bus,
};

// Use a deterministic image per vehicle based on hashing for good distribution
function getVehicleImage(categoryId, make, model) {
  const images = vehicleImages[categoryId] || vehicleImages.four_wheeler;
  // Simple hash from make+model to get a consistent index
  const hash = [...(make + model)].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return images[hash % images.length];
}

function VehicleCard3D({ vehicle, categoryId, make, model }) {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const colors = categoryColors[categoryId];
  const accent = categoryAccents[categoryId];
  const Icon = categoryIcons[categoryId];
  const vehicleImage = getVehicleImage(categoryId, make, model);

  // Auto-rotation when not hovered
  useEffect(() => {
    if (isHovered) return;
    const interval = window.setInterval(() => {
      setRotation(prev => ({ ...prev, y: prev.y + 0.6 }));
    }, 50);
    return () => window.clearInterval(interval);
  }, [isHovered]);

  function handleMouseMove(e) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    setRotation({ x: rotateX, y: rotation.y + rotateY * 0.3 });
  }

  // Build query params for prediction page
  const searchParams = new window.URLSearchParams({
    category: categoryId,
    make: make,
    model: model,
  }).toString();

  return (
    <div className="perspective-[1000px] w-full" style={{ perspective: '1200px' }}>
      <div
        ref={cardRef}
        className="relative w-full cursor-pointer transition-all duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          minHeight: '400px',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setRotation(prev => ({ ...prev, x: 0 })); }}
      >
        {/* Front Face */}
        <div
          className={`absolute inset-0 rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} overflow-hidden transition-all duration-500 ${colors.glow} shadow-xl hover:shadow-2xl`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Vehicle Image */}
          <div className="relative h-44 overflow-hidden bg-slate-800">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800 animate-pulse">
                <Icon size={40} className="text-slate-600" />
              </div>
            )}
            {(imageError) ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <div className="text-center">
                  <Icon size={48} className={`mx-auto ${accent.icon}`} />
                  <p className="mt-2 text-sm font-bold text-white">{make}</p>
                </div>
              </div>
            ) : (
              <img
                src={vehicleImage}
                alt={`${make} ${model}`}
                className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => { setImageError(true); setImageLoaded(true); }}
                loading="lazy"
              />
            )}
            {/* Colorful gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-tr ${colors.overlay}`} />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />

            {/* Category badge */}
            <div className={`absolute top-3 left-3 rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider ${accent.badge} backdrop-blur-sm`}>
              <div className="flex items-center gap-1.5">
                <Icon size={14} />
                <span>{make}</span>
              </div>
            </div>

            {/* EV badge */}
            <div className="absolute top-3 right-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg flex items-center gap-1">
              <Zap size={10} />
              EV
            </div>
          </div>

          {/* Vehicle info - solid dark bg for readability */}
          <div className="bg-slate-900 p-5 space-y-3">
            <div className="text-center">
              <h3 className="text-lg font-black text-white">{model}</h3>
              <p className="text-sm text-slate-200 mt-1">
                {vehicle?.batteryCapacity} kWh · {vehicle?.typicalRange} km · {vehicle?.batteryType}
              </p>
            </div>

            {/* Spec badges - dark backgrounds with bright text */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-slate-800 p-2.5 text-center border border-slate-700">
                <BatteryCharging size={16} className="mx-auto text-cyan-300" />
                <p className="text-xs font-bold text-white mt-1">{vehicle?.batteryCapacity}kWh</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-2.5 text-center border border-slate-700">
                <Zap size={16} className="mx-auto text-amber-300" />
                <p className="text-xs font-bold text-white mt-1">{vehicle?.maxChargingPower}kW</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-2.5 text-center border border-slate-700">
                <Gauge size={16} className="mx-auto text-emerald-300" />
                <p className="text-xs font-bold text-white mt-1">{vehicle?.typicalRange}km</p>
              </div>
            </div>

            {/* Click to explore CTA */}
            <Link
              to={`/prediction?${searchParams}`}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-accent hover:bg-accent-light px-4 py-3 text-white font-bold transition-all hover:gap-3 relative z-10 shadow-lg"
            >
              <Sparkles size={16} />
              Check Battery Health
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Back Face - Flip shows more details */}
        <div
          className={`absolute inset-0 rounded-2xl border ${colors.border} bg-slate-900 p-6 transition-all duration-500`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-bold text-white flex items-center gap-2`}>
                <Icon size={16} className={accent.icon} />
                Vehicle Specs
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                className="rounded-lg p-1.5 hover:bg-slate-800 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2 text-sm flex-1">
              {[
                ['Battery', `${vehicle?.batteryCapacity} kWh`],
                ['Voltage', `${vehicle?.voltage}V`],
                ['Range', `${vehicle?.typicalRange} km`],
                ['Chemistry', vehicle?.batteryType],
                ['Max Charge', `${vehicle?.maxChargingPower} kW`],
                ['Life Expectancy', `${vehicle?.estimatedLifeYears} years`],
                ['Cycle Life', `${vehicle?.expectedCycles?.toLocaleString()} cycles`],
                ['Warranty', `${vehicle?.warrantyYears} yrs / ${(vehicle?.warrantyKm / 1000)?.toFixed(0)}k km`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-slate-700 pb-1.5">
                  <span className="text-slate-300">{label}</span>
                  <span className="text-white font-bold">{value}</span>
                </div>
              ))}
            </div>
            <Link
              to={`/prediction?${searchParams}`}
              className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-white font-bold hover:bg-accent-light transition-all shadow-lg"
            >
              <Sparkles size={16} />
              Analyze This Vehicle
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Flip button */}
      <button
        onClick={() => setIsFlipped(!isFlipped)}
        className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mx-auto"
      >
        <RotateCw size={12} />
        {isFlipped ? 'Show Front' : 'View Specs'}
      </button>
    </div>
  );
}

export default function VehicleShowcasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('four_wheeler');

  // Flatten vehicles into a searchable list
  const allVehicles = [];
  Object.entries(vehicleDatabase).forEach(([catId, makes]) => {
    makes.forEach(makeEntry => {
      makeEntry.models.forEach(model => {
        allVehicles.push({
          categoryId: catId,
          make: makeEntry.make,
          model: model.model,
          spec: model,
        });
      });
    });
  });

  const filteredVehicles = allVehicles.filter(v => {
    const matchesSearch = searchQuery === '' ||
      v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || v.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group vehicles by make for the selected category
  const groupedVehicles = {};
  filteredVehicles.forEach(v => {
    if (!groupedVehicles[v.make]) groupedVehicles[v.make] = [];
    groupedVehicles[v.make].push(v);
  });

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.08),transparent_50%)]" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-400/30 px-4 py-1.5 text-sm text-cyan-200 mb-4">
            <Sparkles size={16} />
            Interactive 3D Showroom
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 leading-tight">
            EV Fleet Showroom
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Browse our comprehensive electric vehicle database. Click any vehicle to instantly run a battery health check.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Bike size={16} className="text-cyan-400" /> 2-Wheelers</span>
            <span className="flex items-center gap-1.5"><Truck size={16} className="text-emerald-400" /> 3-Wheelers</span>
            <span className="flex items-center gap-1.5"><Car size={16} className="text-violet-400" /> Cars & SUVs</span>
            <span className="flex items-center gap-1.5"><Bus size={16} className="text-amber-400" /> Buses</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by make or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-slate-800/80 pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:border-accent focus:outline-none transition focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${
              selectedCategory === 'all'
                ? 'bg-accent text-white shadow-lg shadow-accent/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/10'
            }`}
          >
            All Vehicles
          </button>
          {vehicleCategories.map(cat => {
            const CatIcon = categoryIcons[cat.id];
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-lg px-4 py-2.5 text-sm font-bold transition flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-accent text-white shadow-lg shadow-accent/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/10'
                }`}
              >
                <CatIcon size={16} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vehicle Grid */}
      {Object.entries(groupedVehicles).length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-white/10">
          <Search size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-xl text-slate-400">No vehicles found matching your search.</p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-4 text-accent-light hover:text-white transition font-semibold"
          >
            Clear search
          </button>
        </div>
      ) : (
        Object.entries(groupedVehicles).map(([make, vehicles]) => (
          <div key={make}>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <h2 className="text-lg font-black text-white tracking-wider uppercase flex items-center gap-2">
                <Sparkles size={16} className="text-accent-light" />
                {make}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {vehicles.map((v) => (
                <VehicleCard3D
                  key={`${v.make}-${v.model}`}
                  vehicle={v.spec}
                  categoryId={v.categoryId}
                  make={v.make}
                  model={v.model}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}