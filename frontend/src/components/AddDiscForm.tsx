import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDisc, uploadDiscPhoto } from '../services/discs';

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
  const [discType, setDiscType] = useState('driver');
  const [flightNumbers, setFlightNumbers] = useState<FlightNumbers>({
    speed: 1,
    glide: 1,
    turn: 0,
    fade: 0,
  });
  const [status, setStatus] = useState('shelf');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ace fields for Wall of Fame
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
      // First, create the disc
      const { data, error: createError } = await createDisc({
        brand,
        model,
        disc_type: discType,
        speed: flightNumbers.speed,
        glide: flightNumbers.glide,
        turn: flightNumbers.turn,
        fade: flightNumbers.fade,
        status,
        ace_course: status === 'wall_of_fame' ? aceCourse : undefined,
        ace_hole: status === 'wall_of_fame' ? aceHole : undefined,
        comment: comment || undefined,
      });

      if (createError) throw createError;
      if (!data) throw new Error('Failed to create disc');

      // Then, upload photo if provided
      if (photoFile) {
        const { error: uploadError } = await uploadDiscPhoto(data.id, photoFile);
        if (uploadError) {
          console.error('Photo upload failed:', uploadError);
          // Don't fail the whole submission if photo upload fails
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/shelf');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to add disc:', err);
      setError(err?.message || 'Failed to add disc');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          <h3 className="text-2xl font-bold">Disc added successfully!</h3>
          <p className="mt-2">Redirecting to shelf...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Add New Disc</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Brand
            </label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            >
              <option value="">Select brand...</option>
              <option value="Discraft">Discraft</option>
              <option value="Innova">Innova</option>
              <option value="Discmania">Discmania</option>
              <option value="MVP">MVP</option>
              <option value="Latitude 64">Latitude 64</option>
              <option value="Dynamic">Dynamic</option>
              <option value="Prodigy">Prodigy</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Model
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="e.g. Buzzz, Aviar, Destroyer"
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Type
          </label>
          <div className="flex gap-4 flex-wrap">
            {['driver', 'midrange', 'approach', 'putter'].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="radio"
                  name="discType"
                  value={type}
                  checked={discType === type}
                  onChange={() => setDiscType(type)}
                  className="mr-2"
                />
                <span className="text-gray-700 capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Flight Numbers
          </label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white"
                >
                  {Array.from({ length: field.max - field.min + 1 }, (_, i) => field.min + i).map((val) => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
                <span className="text-xs text-gray-500 text-center block mt-1">
                  {field.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Location
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <option value="shelf">Shelf</option>
            <option value="bag">Bag</option>
            <option value="wall_of_fame">Wall of Fame (Ace)</option>
          </select>
        </div>

        {status === 'wall_of_fame' && (
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Course
              </label>
              <input
                type="text"
                value={aceCourse}
                onChange={(e) => setAceCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="Course name"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Hole
              </label>
              <input
                type="number"
                value={aceHole}
                onChange={(e) => setAceHole(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                min={1}
                required
              />
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Kommentar (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            placeholder="F.eks. spesielle minner, betydning, eller historie bak disken..."
            rows={3}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Bilde (valgfritt)
          </label>
          {!imagePreview ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-500">Klikk for å velge bilde</p>
              </div>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          ) : (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Disc preview"
                className="w-48 h-48 object-cover rounded-full border-4 border-gray-200 mx-auto"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-md"
              >
                ×
              </button>
              <p className="text-sm text-gray-600 text-center mt-2">{photoFile?.name}</p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-800 text-white py-3 px-4 rounded-md font-bold hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding disc...' : 'Add Disc'}
        </button>
      </form>
    </div>
  );
}

export default AddDiscForm;
