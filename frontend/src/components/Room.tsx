import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { AnimatePresence } from 'framer-motion';
import { getDiscs, getAces, reorderDiscs } from '../services/discs';
import type { Disc, DiscStatus } from '../services/discs';
import BagZone from './BagZone';
import ShelfZone from './ShelfZone';
import WallOfFameZone from './WallOfFameZone';
import StatsOverlay from './StatsOverlay';
import DiscDetailModal from './DiscDetailModal';
import DraggableDisc from './DraggableDisc';

function Room() {
  const [bagDiscs, setBagDiscs] = useState<Disc[]>([]);
  const [shelfDiscs, setShelfDiscs] = useState<Disc[]>([]);
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
      const allDiscs = discsRes.data || [];
      setBagDiscs(allDiscs.filter((d) => d.status === 'bag'));
      setShelfDiscs(allDiscs.filter((d) => d.status === 'shelf'));
      if (acesRes.data) setAces(acesRes.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const allDiscs = [...bagDiscs, ...shelfDiscs];

  // Find which container a disc belongs to
  const findContainer = (discId: number | string): 'bag' | 'shelf' | null => {
    if (bagDiscs.some((d) => d.id === discId)) return 'bag';
    if (shelfDiscs.some((d) => d.id === discId)) return 'shelf';
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const disc = allDiscs.find((d) => d.id === event.active.id);
    setActiveDisc(disc || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;

    const activeContainer = findContainer(activeId);
    // over could be a zone or another disc
    let overContainer: 'bag' | 'shelf' | null =
      overId === 'bag-zone' ? 'bag' :
      overId === 'shelf-zone' ? 'shelf' :
      findContainer(overId as number);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    // Move disc between containers in real-time
    const disc = allDiscs.find((d) => d.id === activeId);
    if (!disc) return;

    if (activeContainer === 'bag') {
      setBagDiscs((prev) => prev.filter((d) => d.id !== activeId));
      setShelfDiscs((prev) => {
        const overIndex = prev.findIndex((d) => d.id === overId);
        const insertAt = overIndex >= 0 ? overIndex : prev.length;
        const newList = [...prev];
        newList.splice(insertAt, 0, { ...disc, status: 'shelf' });
        return newList;
      });
    } else {
      setShelfDiscs((prev) => prev.filter((d) => d.id !== activeId));
      setBagDiscs((prev) => {
        const overIndex = prev.findIndex((d) => d.id === overId);
        const insertAt = overIndex >= 0 ? overIndex : prev.length;
        const newList = [...prev];
        newList.splice(insertAt, 0, { ...disc, status: 'bag' });
        return newList;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDisc(null);
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;

    const activeContainer = findContainer(activeId);
    if (!activeContainer) return;

    // Check if dropped on a zone or on another disc in the same zone
    const isZoneDrop = overId === 'bag-zone' || overId === 'shelf-zone';
    const overContainer = isZoneDrop
      ? (overId === 'bag-zone' ? 'bag' : 'shelf')
      : findContainer(overId as number);

    if (!overContainer) return;

    // Reorder within same container
    if (activeContainer === overContainer && !isZoneDrop) {
      const setDiscs = activeContainer === 'bag' ? setBagDiscs : setShelfDiscs;
      const currentList = activeContainer === 'bag' ? bagDiscs : shelfDiscs;

      const oldIndex = currentList.findIndex((d) => d.id === activeId);
      const newIndex = currentList.findIndex((d) => d.id === overId);

      if (oldIndex !== newIndex) {
        const newList = arrayMove(currentList, oldIndex, newIndex);
        setDiscs(newList);
        persistOrder(newList, activeContainer);
      }
      return;
    }

    // Cross-container move already happened in handleDragOver
    // Just persist the current state
    persistOrder(bagDiscs, 'bag');
    persistOrder(shelfDiscs, 'shelf');
  };

  const persistOrder = async (discs: Disc[], status: DiscStatus) => {
    const updates = discs.map((d, i) => ({
      id: d.id,
      sort_order: i,
      status,
    }));
    await reorderDiscs(updates);
  };

  const handleDiscUpdate = (updatedDisc: Disc) => {
    setBagDiscs((prev) => prev.map((d) => (d.id === updatedDisc.id ? updatedDisc : d)));
    setShelfDiscs((prev) => prev.map((d) => (d.id === updatedDisc.id ? updatedDisc : d)));

    // Handle status change within modal
    if (updatedDisc.status === 'bag') {
      setShelfDiscs((prev) => prev.filter((d) => d.id !== updatedDisc.id));
      setBagDiscs((prev) => {
        if (!prev.find((d) => d.id === updatedDisc.id)) return [...prev, updatedDisc];
        return prev;
      });
    } else {
      setBagDiscs((prev) => prev.filter((d) => d.id !== updatedDisc.id));
      setShelfDiscs((prev) => {
        if (!prev.find((d) => d.id === updatedDisc.id)) return [...prev, updatedDisc];
        return prev;
      });
    }

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
    setBagDiscs((prev) => prev.filter((d) => d.id !== discId));
    setShelfDiscs((prev) => prev.filter((d) => d.id !== discId));
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
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <StatsOverlay
          total={allDiscs.length}
          bag={bagDiscs.length}
          shelf={shelfDiscs.length}
          aces={aces.length}
        />

        <WallOfFameZone aces={aces} onDiscClick={setSelectedDisc} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BagZone discs={bagDiscs} onDiscClick={setSelectedDisc} />
          <ShelfZone discs={shelfDiscs} onDiscClick={setSelectedDisc} />
        </div>

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

      <DragOverlay>
        {activeDisc && (
          <DraggableDisc disc={activeDisc} isDragging />
        )}
      </DragOverlay>

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
