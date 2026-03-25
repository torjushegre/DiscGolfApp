import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { AnimatePresence } from 'framer-motion';
import { getDiscs, getAces, moveDisc } from '../services/discs';
import type { Disc } from '../services/discs';
import BagZone from './BagZone';
import ShelfZone from './ShelfZone';
import WallOfFameZone from './WallOfFameZone';
import StatsOverlay from './StatsOverlay';
import DiscDetailModal from './DiscDetailModal';
import DraggableDisc from './DraggableDisc';

function Room() {
  const [discs, setDiscs] = useState<Disc[]>([]);
  const [aces, setAces] = useState<Disc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDisc, setActiveDisc] = useState<Disc | null>(null);
  const [selectedDisc, setSelectedDisc] = useState<Disc | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const fetchData = useCallback(async () => {
    try {
      const [discsRes, acesRes] = await Promise.all([getDiscs(), getAces()]);
      if (discsRes.data) setDiscs(discsRes.data);
      if (acesRes.data) setAces(acesRes.data);
    } catch {
      // Silently handle fetch failures
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const bagDiscs = discs.filter((d) => d.status === 'bag');
  const shelfDiscs = discs.filter((d) => d.status === 'shelf');

  const handleDragStart = (event: DragStartEvent) => {
    const disc = discs.find((d) => d.id === event.active.id);
    setActiveDisc(disc || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDisc(null);

    if (!over) return;

    const targetZone = over.id as string;
    const disc = discs.find((d) => d.id === active.id);
    if (!disc) return;

    const newStatus = targetZone === 'bag-zone' ? 'bag' : targetZone === 'shelf-zone' ? 'shelf' : null;
    if (!newStatus || newStatus === disc.status) return;

    // Optimistic update
    setDiscs((prev) => prev.map((d) => (d.id === disc.id ? { ...d, status: newStatus as 'bag' | 'shelf' } : d)));
    const { error } = await moveDisc(disc.id, newStatus as 'bag' | 'shelf');
    if (error) fetchData(); // Revert on error
  };

  const handleDiscUpdate = (updatedDisc: Disc) => {
    setDiscs((prev) => prev.map((d) => (d.id === updatedDisc.id ? updatedDisc : d)));
    if (updatedDisc.is_ace) {
      setAces((prev) => {
        const exists = prev.find((a) => a.id === updatedDisc.id);
        if (exists) return prev.map((a) => (a.id === updatedDisc.id ? updatedDisc : a));
        return [...prev, updatedDisc];
      });
    } else {
      setAces((prev) => prev.filter((a) => a.id !== updatedDisc.id));
    }
  };

  const handleDiscDelete = (discId: number) => {
    setDiscs((prev) => prev.filter((d) => d.id !== discId));
    setAces((prev) => prev.filter((a) => a.id !== discId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
          <p className="mt-4 text-gray-400">Loading your collection...</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Overlay */}
        <StatsOverlay
          total={discs.length}
          bag={bagDiscs.length}
          shelf={shelfDiscs.length}
          aces={aces.length}
        />

        {/* Wall of Fame */}
        <WallOfFameZone aces={aces} onDiscClick={setSelectedDisc} />

        {/* Bag and Shelf */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BagZone discs={bagDiscs} onDiscClick={setSelectedDisc} />
          <ShelfZone discs={shelfDiscs} onDiscClick={setSelectedDisc} />
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-4 pt-2 pb-4">
          <Link
            to="/add-disc"
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg"
          >
            + Legg til disc
          </Link>
          <Link
            to="/all-discs"
            className="px-6 py-3 bg-slate-700 text-white rounded-lg font-bold hover:bg-slate-600 transition-colors shadow-lg"
          >
            Alle discer
          </Link>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDisc && (
          <DraggableDisc disc={activeDisc} isDragging />
        )}
      </DragOverlay>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDisc && (
          <DiscDetailModal
            disc={selectedDisc}
            isOpen={true}
            onClose={() => setSelectedDisc(null)}
            onUpdate={handleDiscUpdate}
            onDelete={handleDiscDelete}
          />
        )}
      </AnimatePresence>
    </DndContext>
  );
}

export default Room;
