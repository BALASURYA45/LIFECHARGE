import { useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, BatteryCharging, Gauge, Zap, RotateCw, Search, X, Bike, Truck, Car, Bus, Sparkles } from 'lucide-react';
import { vehicleCategories, vehicleDatabase } from '../constants/vehicleDatabase.js';
import { getVehicleImageUrl } from '../constants/vehicleImageMap.js';


// Colorful category themes with vibrant accents
const categoryColors = {
  two_wheeler: { bg: 'from-slate-900 to-slate-800', border: 'border-accent/40', glow: 'shadow-accent/15', overlay: 'from-accent/30 to-transparent' },
  three_wheeler: { bg: 'from-slate-900 to-slate-800', border: 'border-accent/40', glow: 'shadow-accent/15', overlay: 'from-accent/30 to-transparent' },
  four_wheeler: { bg: 'from-slate-900 to-slate-800', border: 'border-accent/40', glow: 'shadow-accent/15', overlay: 'from-accent/30 to-transparent' },
  bus_heavy: { bg: 'from-slate-900 to-slate-800', border: 'border-accent/40', glow: 'shadow-accent/15', overlay: 'from-accent/30 to-transparent' },
};

const categoryAccents = {
  two_wheeler: { icon: 'text-accent-light', badge: 'bg-accent/20 text-accent-light border-accent/30', glow: 'shadow-accent/15', gradient: 'from-accent to-accent-light' },
  three_wheeler: { icon: 'text-accent-light', badge: 'bg-accent/20 text-accent-light border-accent/30', glow: 'shadow-accent/15', gradient: 'from-accent to-accent-light' },
  four_wheeler: { icon: 'text-accent-light', badge: 'bg-accent/20 text-accent-light border-accent/30', glow: 'shadow-accent/15', gradient: 'from-accent to-accent-light' },
  bus_heavy: { icon: 'text-accent-light', badge: 'bg-accent/20 text-accent-light border-accent/30', glow: 'shadow-accent/15', gradient: 'from-accent to-accent-light' },
};

const categoryIcons = {
  two_wheeler: Bike,
  three_wheeler: Truck,
  four_wheeler: Car,
  bus_heavy: Bus,
};

const categoryHeroImages = {
  two_wheeler:
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&h=800&fit=crop&auto=format&q=80',
  three_wheeler:
    'https://images.unsplash.com/photo-1626149637281-4e227308da18?fm=jpg&q=80&w=1200&h=800&fit=crop&auto=format',
  four_wheeler:
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&h=800&fit=crop&auto=format&q=80',
  bus_heavy:
    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200&h=800&fit=crop&auto=format&q=80',
};

function VehicleCard3D({ vehicle, categoryId, make, model }) {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipDirection, setFlipDirection] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const colors = categoryColors[categoryId];
  const accent = categoryAccents[categoryId];
  const Icon = categoryIcons[categoryId];
  const vehicleImage = getVehicleImageUrl(categoryId, make, model);

  function handleMouseMove(e) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    setRotation({ x: rotateX, y: rotateY * 0.35 });
  }

  function handleMouseEnter() {
    setFlipDirection(Math.random() > 0.5 ? 1 : -1);
    setIsFlipped(true);
  }

  function handleMouseLeave() {
    setIsFlipped(false);
    setRotation({ x: 0, y: 0 });
  }

  // Build query params for prediction page
  const searchParams = new window.URLSearchParams({
    category: categoryId,
    make: make,
    model: model,
  }).toString();

  return (
    <div className="perspective-[1000px] w-full" style={{ perspective: '1200px' }}>
      <div className="animate-rotate-slow">
        <div
          ref={cardRef}
          className="relative w-full cursor-pointer transition-all duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y + (isFlipped ? 180 * flipDirection : 0)}deg)`,
            minHeight: '400px',
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
        {/* Front Face */}
        <div
          className={`absolute inset-0 rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} overflow-hidden transition-all duration-500 ${colors.glow} shadow-xl hover:shadow-2xl`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Vehicle Image */}
          <div className="relative h-44 overflow-hidden bg-slate-800">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-40 rounded-full border border-accent/20 bg-accent/10 opacity-60 animate-spin-slow" />
            </div>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800 animate-pulse">
                <Icon size={40} className="text-slate-600" />
              </div>
            )}
            {(imageError && retryCount >= 2) ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <div className="text-center">
                  <Icon size={48} className={`mx-auto ${accent.icon}`} />
                  <p className="mt-2 text-sm font-bold text-white">{make}</p>
                  <p className="text-xs text-slate-400">{model}</p>
                </div>
              </div>
            ) : (
              <img
                src={vehicleImage}
                alt={`${make} ${model}`}
                className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  if (retryCount < 2) {
                    setRetryCount(c => c + 1);
                    setImageLoaded(false);
                    setImageError(false);
                  } else {
                    setImageError(true);
                    setImageLoaded(true);
                  }
                }}
                loading="lazy"
              />
            )}
            {/* Category badge */}
            <div className={`absolute top-3 left-3 rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider ${accent.badge} backdrop-blur-sm`}>
              <div className="flex items-center gap-1.5">
                <Icon size={14} />
                <span>{make}</span>
              </div>
            </div>

            {/* EV badge */}
            <div className="absolute top-3 right-3 rounded-full bg-gradient-to-r from-accent to-accent-light px-2.5 py-0.5 text-[10px] font-bold text-slate-950 shadow-lg flex items-center gap-1">
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
                <BatteryCharging size={16} className="mx-auto text-accent-light" />
                <p className="text-xs font-bold text-white mt-1">{vehicle?.batteryCapacity}kWh</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-2.5 text-center border border-slate-700">
                <Zap size={16} className="mx-auto text-accent-light" />
                <p className="text-xs font-bold text-white mt-1">{vehicle?.maxChargingPower}kW</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-2.5 text-center border border-slate-700">
                <Gauge size={16} className="mx-auto text-accent-light" />
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
    </div>

      {/* Flip button */}
      <button
        onClick={() => {
          setFlipDirection(Math.random() > 0.5 ? 1 : -1);
          setIsFlipped(!isFlipped);
        }}
        className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mx-auto"
      >
        <RotateCw size={12} />
        {isFlipped ? 'Show Front' : 'View Specs'}
      </button>
    </div>
  );
}

export default function VehicleShowcasePage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCategory = category || '';
  const categoryObject = selectedCategory
    ? vehicleCategories.find((cat) => cat.id === selectedCategory)
    : null;

  const categoryVehicles = categoryObject
    ? vehicleDatabase[selectedCategory].flatMap((makeEntry) =>
        makeEntry.models.map((modelSpec) => ({
          categoryId: selectedCategory,
          make: makeEntry.make,
          model: modelSpec.model,
          spec: modelSpec,
        }))
      )
    : [];

  const filteredVehicles = categoryObject
    ? categoryVehicles.filter((v) => {
        const query = searchQuery.toLowerCase();
        return (
          query === '' ||
          v.make.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query)
        );
      })
    : [];

  return (
    <section className="space-y-8">
      <div className="lc-card-static rounded-2xl overflow-hidden bg-slate-900 p-8 md:p-12 text-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.1),transparent_50%)]" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm font-semibold text-white mb-4">
            <Sparkles size={16} />
            Interactive 3D Showroom
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 leading-tight tracking-tight">
            {categoryObject ? `${categoryObject.label} Showroom` : 'Explore by Vehicle Type'}
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {categoryObject
              ? `Browse all ${categoryObject.label.toLowerCase()} models and select one to check battery health.`
              : 'Choose a vehicle type below to enter the category showroom and see all available models.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-slate-400">
            <span className="inline-flex items-center gap-1.5"><Bike size={16} className="text-accent-light" /> 2-Wheelers</span>
            <span className="inline-flex items-center gap-1.5"><Truck size={16} className="text-accent-light" /> 3-Wheelers</span>
            <span className="inline-flex items-center gap-1.5"><Car size={16} className="text-accent-light" /> Cars & SUVs</span>
            <span className="inline-flex items-center gap-1.5"><Bus size={16} className="text-accent-light" /> Buses</span>
          </div>
        </div>
      </div>

      {categoryObject ? (
        <>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-accent-light">Category showroom</p>
              <h2 className="text-3xl font-black text-white">{categoryObject.label}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/showroom')}
                className="lc-focus inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                ← Back to categories
              </button>
              <div className="rounded-2xl bg-slate-950/90 px-4 py-3 text-sm font-semibold text-slate-200 border border-white/10">
                {categoryObject.description}
              </div>
            </div>
          </div>

          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search models in this category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:border-accent focus:outline-none transition focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {filteredVehicles.length === 0 ? (
            <div className="text-center py-16 bg-slate-950/80 rounded-3xl border border-slate-800">
              <Search size={48} className="mx-auto mb-4 text-slate-500" />
              <p className="text-xl text-slate-300">No matching models found.</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 rounded-2xl bg-accent px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-accent-light"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredVehicles.map((v) => (
                <VehicleCard3D
                  key={`${v.make}-${v.model}`}
                  vehicle={v.spec}
                  categoryId={v.categoryId}
                  make={v.make}
                  model={v.model}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {vehicleCategories.map((cat) => {
            const Icon = categoryIcons[cat.id];
            const accent = categoryAccents[cat.id];
            return (
              <Link
                key={cat.id}
                to={`/showroom/${cat.id}`}
                className="group relative overflow-hidden rounded-[32px] border border-white/10 p-0 text-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{
                  minHeight: '340px',
                  backgroundImage: `url(${categoryHeroImages[cat.id]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="relative z-10 flex h-full flex-col items-center justify-center gap-6 text-center px-8 py-10">
                  <span className="grid h-24 w-24 place-items-center">
                    <span className="relative flex h-18 w-18 items-center justify-center rounded-full bg-slate-950 border border-slate-700 shadow-glow shadow-slate-900/30">
                      <span className="absolute inset-1 rounded-full bg-slate-950" />
                      <span className="absolute inset-0 rounded-full border-t-2 border-slate-400 animate-spin-slow" />
                      <span className="absolute left-1/2 top-1/2 h-10 w-[2px] -translate-x-1/2 -translate-y-1/2 bg-slate-400" />
                      <span className="absolute left-1/2 top-1/2 h-[2px] w-10 -translate-x-1/2 -translate-y-1/2 bg-slate-400" />
                      <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-400" />
                    </span>
                  </span>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">{cat.label}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-200">{cat.description}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition">
                    Explore
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
