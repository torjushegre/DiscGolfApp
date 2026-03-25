import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDisc, uploadDiscPhoto, DISC_TYPE_LABELS, DISC_COLORS } from '../services/discs';
import type { DiscType, DiscStatus } from '../services/discs';
import DiscSvg from './DiscSvg';

const TYPE_ORDER: DiscType[] = ['distance_driver', 'fairway_driver', 'midrange', 'approach', 'putter'];

interface FlightNumbers {
  speed: number;
  glide: number;
  turn: number;
  fade: number;
}

function AddDiscForm() {
  const navigate = useNavigate();
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [discType, setDiscType] = useState<DiscType>('distance_driver');
  const [flightNumbers, setFlightNumbers] = useState<FlightNumbers>({
    speed: 1,
    glide: 1,
    turn: 0,
    fade: 0,
  });
  const [status, setStatus] = useState<DiscStatus>('shelf');
  const [color, setColor] = useState('#e74c3c');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ace fields
  const [isAce, setIsAce] = useState(false);
  const [aceCourse, setAceCourse] = useState('');
  const [aceHole, setAceHole] = useState(1);
  const [comment, setComment] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPhotoFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: createError } = await createDisc({
        brand,
        model,
        disc_type: discType,
        speed: flightNumbers.speed,
        glide: flightNumbers.glide,
        turn: flightNumbers.turn,
        fade: flightNumbers.fade,
        status,
        color,
        is_ace: isAce,
        ace_course: isAce ? aceCourse : undefined,
        ace_hole: isAce ? aceHole : undefined,
        comment: comment || undefined,
      });

      if (createError) throw createError;
      if (!data) throw new Error('Failed to create disc');

      if (photoFile) {
        const { error: uploadError } = await uploadDiscPhoto(data.id, photoFile);
        if (uploadError) {
          console.error('Photo upload failed:', uploadError);
        }
      }

      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      console.error('Failed to add disc:', err);
      setError(err?.message || 'Klarte ikke å legge til disc');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 px-6 py-4 rounded-xl">
          <h3 className="text-2xl font-bold">Disc lagt til!</h3>
          <p className="mt-2 text-emerald-400/70">Sender deg tilbake...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6">Legg til disc</h2>
      <form onSubmit={handleSubmit} className="bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-700/50">
        {error && (
          <div className="bg-red-900/50 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Merke</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Velg merke...</option>
              <option value="Discraft">Discraft</option>
              <option value="Innova">Innova</option>
              <option value="Discmania">Discmania</option>
              <option value="MVP">MVP</option>
              <option value="Latitude 64">Latitude 64</option>
              <option value="Dynamic Discs">Dynamic Discs</option>
              <option value="Prodigy">Prodigy</option>
              <option value="Kastaplast">Kastaplast</option>
              <option value="Westside Discs">Westside Discs</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Modell</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="f.eks. Buzzz, Aviar, Destroyer"
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2">Type</label>
          <div className="flex gap-2 flex-wrap">
            {TYPE_ORDER.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setDiscType(type)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  discType === type
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {DISC_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2">Flight Numbers</label>
          <div className="grid grid-cols-4 gap-4">
            {[
              { name: 'Speed', key: 'speed', min: 0, max: 15 },
              { name: 'Glide', key: 'glide', min: 0, max: 7 },
              { name: 'Turn', key: 'turn', min: -5, max: 5 },
              { name: 'Fade', key: 'fade', min: 0, max: 5 },
            ].map((field) => (
              <div key={field.key}>
                <select
                  value={flightNumbers[field.key as keyof FlightNumbers]}
                  onChange={(e) =>
                    setFlightNumbers({
                      ...flightNumbers,
                      [field.key]: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-center text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Array.from({ length: field.max - field.min + 1 }, (_, i) => field.min + i).map((val) => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
                <span className="text-xs text-gray-500 text-center block mt-1">{field.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2">Plassering</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStatus('bag')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === 'bag'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Bag
            </button>
            <button
              type="button"
              onClick={() => setStatus('shelf')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === 'shelf'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Hylle
            </button>
          </div>
        </div>

        {/* Color picker */}
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2">Farge på disc</label>
          <div className="flex items-center gap-4">
            <div className="flex gap-2 flex-wrap">
              {DISC_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    color === c.hex ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
            <DiscSvg color={color} size={48} />
          </div>
        </div>

        {/* Ace toggle */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setIsAce(!isAce)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isAce ? 'bg-yellow-500' : 'bg-slate-600'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  isAce ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-gray-300 text-sm font-bold">Ace! 🏆</span>
          </label>
        </div>

        {isAce && (
          <div className="mb-6 grid grid-cols-2 gap-4 p-4 bg-yellow-900/20 rounded-xl border border-yellow-500/20">
            <div>
              <label className="block text-yellow-200 text-sm font-bold mb-2">Bane</label>
              <input
                type="text"
                value={aceCourse}
                onChange={(e) => setAceCourse(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Banenavn"
                required
              />
            </div>
            <div>
              <label className="block text-yellow-200 text-sm font-bold mb-2">Hull</label>
              <input
                type="number"
                value={aceHole}
                onChange={(e) => setAceHole(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                min={1}
                required
              />
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2">Kommentar (valgfritt)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="F.eks. spesielle minner, historie bak disken..."
            rows={3}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2">Bilde (valgfritt)</label>
          {!imagePreview ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-600 border-dashed rounded-xl cursor-pointer bg-slate-700/50 hover:bg-slate-700 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-400">Klikk for å velge bilde</p>
              </div>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          ) : (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Disc preview"
                className="w-48 h-48 object-cover rounded-full border-4 border-slate-600 mx-auto"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-md"
              >
                ×
              </button>
              <p className="text-sm text-gray-400 text-center mt-2">{photoFile?.name}</p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Legger til...' : 'Legg til disc'}
        </button>
      </form>
    </div>
  );
}

export default AddDiscForm;
